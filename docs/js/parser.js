/*
 * Ranked chart parser for user-editable rewrite rules.
 *
 * Like lin-tree-solver it returns every tree compatible with the annotation.
 * Each chart cell keeps only the K cheapest trees, so highly ambiguous
 * sentences cannot freeze the browser.
 */
(function (HT) {
  'use strict';

  const K = 16;
  const MAX_TOKENS = 40;
  const MAX_FLEXIBLE = 10;
  const LABEL = /^[^\s\[\]()|?*+=@"<>]+$/;

  function compile(text) {
    const rules = [];
    const errors = [];
    const helpers = new Map();
    let roots = [];
    // Display options: "rename: TENSE=T" draws a category under another name;
    // "show-class: VP" prints the verb class only under those labels.
    const rename = {};
    let showClass = null;
    let elide = [];
    // Silent elements take no word, so each is attached to the item after it
    // (or before it). "proNP=dO" (or the older "ϕNP=dO") draws an understood
    // argument, pro; "∅ASP" draws an empty slot, ∅.
    const empties = new Map();
    const silent = (item, before, after) => {
      const list = (xs) => xs.map((e) => `${e.mark}${e.sym}=${e.fn}`).join(',');
      const id = `\u0003${list(before)}|${item.sym}=${item.fn}|${list(after)}`;
      if (!empties.has(id)) {
        empties.set(id, { before, after });
        addRule(id, [item], 0);
      }
      return { sym: id, fn: '' };
    };

    const addRule = (lhs, rhs, cost) => rules.push({ lhs, rhs, cost });
    const join = (rhs) => {
      const id = `\u0001${rhs.map((x) => `${x.sym}=${x.fn}`).join(' ')}`;
      if (!helpers.has(id)) {
        helpers.set(id, id);
        if (rhs.length === 2) addRule(id, rhs, 0);
        else addRule(id, [rhs[0], { sym: join(rhs.slice(1)), fn: '' }], 0);
      }
      return id;
    };
    const plus = (item) => {
      const id = `\u0002${item.sym}=${item.fn}`;
      if (!helpers.has(id)) {
        helpers.set(id, id);
        addRule(id, [item], 0);
        // A small cost per repetition prefers one large modifier to two small ones.
        addRule(id, [item, { sym: id, fn: '' }], 0.05);
      }
      return id;
    };

    text.split('\n').forEach((source, n) => {
      let line = source.replace(/^\s*#.*$|\s+#.*$/, '').trim();
      if (!line) return;
      const fail = (message) => errors.push({ line: n + 1, message });
      if (line.startsWith('roots:')) {
        roots = line.slice(6).trim().split(/[\s,]+/).filter(Boolean);
        return;
      }
      if (line.startsWith('rename:')) {
        for (const pair of line.slice(7).trim().split(/\s+/)) {
          const [from, to] = pair.split('=');
          if (!from || !to || !LABEL.test(from) || !LABEL.test(to)) return fail(`cannot read "${pair}"; write rename: OLD=NEW`);
          rename[from] = to;
        }
        return;
      }
      if (line.startsWith('elide-unary:')) {
        elide = line.slice(12).trim().split(/[\s,]+/).filter(Boolean);
        return;
      }
      if (line.startsWith('show-class:')) {
        showClass = line.slice(11).trim().split(/[\s,]+/).filter(Boolean);
        return;
      }
      let cost = 0;
      const costMatch = line.match(/\s@(\d+(?:\.\d+)?)$/);
      if (costMatch) {
        cost = Number(costMatch[1]);
        line = line.slice(0, costMatch.index);
      }
      const parts = line.split(/->|→/);
      const lhs = parts[0].trim();
      if (parts.length !== 2) return fail('write a rule as "A -> B C"');
      if (!LABEL.test(lhs)) return fail(`"${lhs}" is not a valid label`);

      for (const alternative of parts[1].split('|')) {
        const names = alternative.trim().split(/\s+/).filter(Boolean);
        if (!names.length) return fail('the right-hand side is empty');
        if (names.length > 9) return fail('use at most nine symbols in one rule');
        // Fold silent elements into the item after them (or the last item).
        const items = [];
        let pending = [];
        for (const name of names) {
          const e = name.match(/^(ϕ|∅|pro(?=[A-Z]))([^=?*+ϕ∅]+)(?:=([A-Za-z]+))?$/);
          if (e) {
            if (!LABEL.test(e[2])) return fail(`cannot read "${name}"`);
            pending.push({ sym: e[2], fn: e[3] || '', mark: e[1] === '∅' ? '∅' : 'pro' });
          } else {
            items.push({ name, before: pending, after: [] });
            pending = [];
          }
        }
        if (!items.length) return fail('a rule needs at least one item besides silent elements');
        if (pending.length) items[items.length - 1].after = pending;
        let variants = [[]];
        for (const { name, before, after } of items) {
          const m = name.match(/^([^=?*+]+)(?:=([A-Za-z]+))?([?*+]?)$/);
          if (!m || !LABEL.test(m[1])) return fail(`cannot read "${name}"`);
          const hasSilent = before.length || after.length;
          if (hasSilent && m[3]) return fail(`a silent element must stand next to a plain item, not "${name}"`);
          const plain = { sym: m[1], fn: m[2] || '' };
          const item = hasSilent ? silent(plain, before, after) : plain;
          const present = m[3] === '*' || m[3] === '+' ? { sym: plus(item), fn: '' } : item;
          const taken = variants.map((v) => [...v, present]);
          variants = m[3] === '?' || m[3] === '*' ? [...variants, ...taken] : taken;
        }
        for (const v of variants) {
          if (!v.length) continue;
          addRule(lhs, v.length <= 2 ? v : [v[0], { sym: join(v.slice(1)), fn: '' }], cost);
        }
      }
      return undefined;
    });

    if (!roots.length && rules.length) {
      const first = rules.find((r) => !/^[\u0001\u0002\u0003]/.test(r.lhs));
      if (first) roots = [first.lhs];
    }
    if (!rules.length && !errors.length) errors.push({ line: 1, message: 'the grammar has no rules' });

    const unary = new Map();
    const binary = new Map();
    for (const r of rules) {
      const index = r.rhs.length === 1 ? unary : binary;
      const first = r.rhs[0].sym;
      if (!index.has(first)) index.set(first, []);
      index.get(first).push(r);
    }
    return { unary, binary, roots, errors, rename, showClass, elide, empties };
  }

  function insert(cell, entry) {
    let list = cell.get(entry.sym);
    if (!list) cell.set(entry.sym, list = []);
    if (list.length >= K && entry.cost >= list[list.length - 1].cost) return false;
    let at = list.length;
    while (at > 0 && list[at - 1].cost > entry.cost) at--;
    list.splice(at, 0, entry);
    if (list.length > K) list.pop();
    return true;
  }

  function closeUnary(cell, grammar) {
    const queue = [...cell.values()].flat();
    for (let i = 0; i < queue.length; i++) {
      const child = queue[i];
      for (const rule of grammar.unary.get(child.sym) || []) {
        let repeats = false;
        for (let e = child; e; e = e.rule && !e.right ? e.left : null) {
          if (e.sym === rule.lhs) repeats = true;
        }
        if (repeats) continue;
        const entry = { sym: rule.lhs, cost: child.cost + rule.cost, rule, left: child };
        if (insert(cell, entry)) queue.push(entry);
      }
    }
  }

  function build(entry, tokens, fn, grammar) {
    if (!entry.rule) {
      const t = tokens[entry.at];
      const leaf = { w: t.w };
      const g = (t.gt && t.gt[entry.sym]) || t.g;
      if (g) leaf.g = g;
      if (t.abs) leaf.abs = true;
      // As in Thomas (27a), the genitive marker hangs directly from POSS.
      if (entry.sym === 'gen' && !grammar.rename.gen) return [leaf];
      return [node(entry.sym, [leaf], fn, grammar)];
    }
    const { rhs } = entry.rule;
    const children = build(entry.left, tokens, rhs[0].fn, grammar);
    if (entry.right) children.push(...build(entry.right, tokens, rhs[1].fn, grammar));
    const empty = grammar.empties && grammar.empties.get(entry.sym);
    if (empty) {
      const make = (e) => node(e.sym, [{ w: e.mark, empty: true }], e.fn, grammar);
      return [...empty.before.map(make), ...children, ...empty.after.map(make)];
    }
    if (/^[\u0001\u0002_]/.test(entry.sym)) {
      if (fn && children.length === 1 && children[0].c) children[0].fn = fn;
      return children;
    }
    // "elide-unary: N'" draws N' only where it branches (Thomas's convention).
    if (children.length === 1 && grammar.elide.includes(entry.sym)) return children;
    return [node(entry.sym, children, fn, grammar)];
  }

  function node(sym, children, fn, grammar) {
    const dot = sym.indexOf('.');
    const base = dot > 0 ? sym.slice(0, dot) : sym;
    const out = { l: grammar.rename[base] || base, c: children };
    const feature = dot > 0 ? sym.slice(dot + 1).split('_')[0] : '';
    if (HT.lexicon.CLASSES.includes(feature) && (!grammar.showClass || grammar.showClass.includes(out.l))) out.f = feature;
    if (fn) out.fn = fn;
    return out;
  }

  function parse(tokens, grammar) {
    const n = tokens.length;
    if (grammar.errors.length) {
      return { trees: [], error: `Grammar, line ${grammar.errors[0].line}: ${grammar.errors[0].message}.` };
    }
    if (!n) return { trees: [], error: 'Type a sentence first.' };
    if (n > MAX_TOKENS) return { trees: [], error: `The parser handles up to ${MAX_TOKENS} words. Draw longer sentences by hand.` };
    const untagged = tokens.find((t) => !t.tags.length);
    if (untagged) return { trees: [], error: `“${untagged.w}” has no category. Select one under the word.` };

    const chart = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) {
      const cell = chart[i][i] = new Map();
      tokens[i].tags.slice(0, MAX_FLEXIBLE).forEach((sym, rank) => insert(cell, { sym, cost: rank * 0.35, at: i }));
      closeUnary(cell, grammar);
    }
    for (let size = 2; size <= n; size++) {
      for (let i = 0; i + size <= n; i++) {
        const j = i + size - 1;
        const cell = chart[i][j] = new Map();
        for (let k = i; k < j; k++) {
          const rightCell = chart[k + 1][j];
          for (const [sym, lefts] of chart[i][k]) {
            for (const rule of grammar.binary.get(sym) || []) {
              const rights = rightCell.get(rule.rhs[1].sym);
              if (!rights) continue;
              for (const left of lefts) {
                for (const right of rights) {
                  const entry = { sym: rule.lhs, cost: left.cost + right.cost + rule.cost, rule, left, right };
                  // `rights` is sorted, so nothing cheaper follows.
                  if (!insert(cell, entry)) break;
                }
              }
            }
          }
        }
        closeUnary(cell, grammar);
      }
    }

    const whole = chart[0][n - 1];
    const found = grammar.roots.flatMap((r) => whole.get(r) || []).sort((a, b) => a.cost - b.cost);
    const seen = new Set();
    const trees = [];
    for (const entry of found) {
      const tree = build(entry, tokens, '', grammar)[0];
      const id = JSON.stringify(tree);
      if (!seen.has(id)) {
        seen.add(id);
        trees.push(tree);
      }
    }
    if (trees.length) return { trees };

    // No complete tree: return the largest phrases found, as material for hand drawing.
    const chunks = [];
    for (let i = 0; i < n;) {
      let j = n - 1;
      let best = null;
      for (; j >= i; j--) {
        const options = [...chart[i][j].entries()]
          .filter(([s]) => !/^[\u0001\u0002\u0003_]/.test(s)).map(([, list]) => list[0])
          .sort((a, b) => a.cost - b.cost);
        if (options.length) {
          // For one word keep the category itself rather than a phrase built over it.
          best = i === j ? options.find((e) => !e.rule) || options[0] : options[0];
          break;
        }
      }
      chunks.push(...build(best, tokens, '', grammar));
      i = j + 1;
    }
    return { trees: [], chunks, error: 'No complete tree fits these categories and rules.' };
  }

  HT.parser = { compile, parse };
})(globalThis.HT = globalThis.HT || {});
