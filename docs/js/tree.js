/*
 * Operations on trees.
 * Node: {l: label, c: children, f?: verb class, fn?: function, tri?: triangle}
 * Leaf: {w: word, g?: gloss, abs?: unpronounced}
 */
(function (HT) {
  'use strict';

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const isLeaf = (n) => n.w !== undefined;
  const leaves = (n) => (isLeaf(n) ? [n] : n.c.flatMap(leaves));
  const text = (n) => leaves(n).filter((l) => !l.abs).map((l) => l.w).join(' ');
  const some = (n, test) => test(n) || (!isLeaf(n) && n.c.some((c) => some(c, test)));

  function walk(n, visit, path = []) {
    visit(n, path);
    if (!isLeaf(n)) n.c.forEach((c, i) => walk(c, visit, [...path, i]));
  }
  const at = (root, path) => path.reduce((n, i) => n && n.c && n.c[i], root);

  /*
   * Thomas adds detail chapter by chapter, so one analysis has several drawings:
   *   1  NOUN, VERB          2  N, V                3  verb class on V
   *   4  Vgp, AUX, TENSE     5  N'                  6  S1/S2 and triangles
   */
  function present(root, level, opts = {}) {
    function map(n) {
      if (isLeaf(n)) return level < 4 && n.abs ? [] : [{ ...n }];
      if (level < 4 && n.l === 'Vgp') {
        const words = leaves(n).filter((l) => !l.abs);
        if (!words.length) return [];
        const leaf = { w: words.map((l) => l.w).join(' ') };
        const gloss = words.map((l) => l.g).filter(Boolean).join(' ');
        if (gloss) leaf.g = gloss;
        const v = { l: level === 1 ? 'VERB' : 'V', c: [leaf] };
        if (level === 3 && n.f) v.f = n.f;
        if (n.fn) v.fn = n.fn;
        return [v];
      }
      const c = n.c.flatMap(map);
      if (!c.length) return n.c.length ? [] : [{ ...n, c }];
      if (level < 5 && n.l === "N'") return c;
      const out = { ...n, c };
      if (level < 3 || (n.l === 'V' && level >= 4)) delete out.f;
      if (level === 1) out.l = { N: 'NOUN', V: 'VERB' }[n.l] || n.l;
      if (opts.triangles && n.l === 'S2') out.tri = true;
      return [out];
    }
    const out = map(root)[0] || { l: root.l, c: [] };
    if (out.l === 'S' && out.c.some((c) => some(c, (x) => x.l === 'S2' || x.l === 'coord' && out.c.includes(x)))) {
      out.l = 'S1';
    }
    return out;
  }

  /** Functions of the sentence-level constituents: S P dO iO sC oC pO A. */
  function functions(root) {
    const units = [];
    const clause = /^S[0-9]?$/;
    function scan(n) {
      let subject = n.c.some((c) => c.fn === 'S');
      const inner = n.c.filter((c) => !isLeaf(c));
      if (inner.length > 1 && inner.every((c) => /^(S1?|coord)$/.test(c.l)) && inner.some((c) => c.l === 'coord')) {
        n.c.forEach((c) => c.l !== 'coord' && scan(c));
        return;
      }
      for (const c of n.c) {
        if (isLeaf(c)) continue;
        if (c.l === 'VP') scanVP(c);
        else if (c.fn) units.push({ node: c, fn: c.fn });
        else if (c.l === 'NP' && !subject) {
          units.push({ node: c, fn: 'S' });
          subject = true;
        } else if (/^(AdvP|PP|S[2-9])$/.test(c.l)) units.push({ node: c, fn: 'A' });
      }
    }
    function scanVP(vp) {
      const verb = vp.c.find((c) => /^(Vgp|V|VERB)$/.test(c.l));
      const cls = verb && (verb.f || (verb.c.find((c) => c.f) || {}).f);
      const nominals = vp.c.filter((c) => c.l === 'NP' && !c.fn);
      for (const c of vp.c) {
        if (isLeaf(c)) continue;
        let fn = c.fn;
        if (!fn && c === verb) fn = 'P';
        else if (!fn && c.l === 'NP') {
          const i = nominals.indexOf(c);
          if (cls === 'intens') fn = 'sC';
          else if (cls === 'ditrans') fn = i === 0 && nominals.length > 1 ? 'iO' : 'dO';
          else if (cls === 'complex') fn = i === 0 ? 'dO' : 'oC';
          else fn = 'dO';
        } else if (!fn && c.l === 'AP') fn = cls === 'complex' ? 'oC' : 'sC';
        else if (!fn && /^(AdvP|PP|S[2-9])$/.test(c.l)) {
          fn = c.l === 'PP' && cls === 'prep' ? 'pO' : 'A';
        }
        if (fn) units.push({ node: c, fn });
      }
    }
    if (!isLeaf(root)) {
      if (clause.test(root.l)) scan(root);
      else if (root.l === 'VP') scanVP(root);
    }
    return units.map((u) => ({ ...u, text: text(u.node) }));
  }

  /* Bracket notation: [NP=S [DET यह] [N लड़का]]   [Vgp.trans ...]   [S2^ triangle]   {gloss} after a word */
  function toBracket(n, indent = null) {
    if (isLeaf(n)) {
      const w = /[\s\[\]"{}]/.test(n.w) ? `"${n.w.replace(/"/g, '')}"` : n.w;
      return n.g ? `${w}{${n.g}}` : w;
    }
    const head = `[${n.l.replace(/\s/g, '_')}${n.f ? `.${n.f}` : ''}${n.fn ? `=${n.fn}` : ''}${n.tri ? '^' : ''}`;
    if (!n.c.length) return `${head}]`;
    if (indent === null || n.c.every(isLeaf)) return `${head} ${n.c.map((c) => toBracket(c)).join(' ')}]`;
    const pad = '  '.repeat(indent + 1);
    return `${head}\n${n.c.map((c) => pad + toBracket(c, indent + 1)).join('\n')}]`;
  }

  function fromBracket(source) {
    const re = /\s*(\[|\]|"([^"]*)"(?:\{([^}]*)\})?|([^\s\[\]{}"]+)(?:\{([^}]*)\})?)/y;
    const tokens = [];
    const s = source.trim();
    while (re.lastIndex < s.length) {
      const start = re.lastIndex;
      const m = re.exec(s);
      if (!m) throw new Error(`Cannot read the notation near “${s.slice(start, start + 15)}”.`);
      if (m[1] === '[' || m[1] === ']') tokens.push({ b: m[1] });
      else tokens.push({ w: m[2] !== undefined ? m[2] : m[4], g: m[3] || m[5], quoted: m[2] !== undefined });
    }
    let i = 0;
    function read(depth) {
      if (depth > 60) throw new Error('The tree is nested too deeply.');
      i++; // [
      const head = tokens[i++];
      if (!head || head.b) throw new Error('Every [ must be followed by a label, as in [NP …].');
      const m = head.w.match(/^(.*?)(?:\.([A-Za-z]+))?(?:=([A-Za-z]+))?(\^)?$/);
      if (!m || !m[1]) throw new Error(`“${head.w}” is not a valid label.`);
      const n = { l: m[1], c: [] };
      if (m[2]) n.f = m[2];
      if (m[3]) n.fn = m[3];
      if (m[4]) n.tri = true;
      let run = null;
      while (i < tokens.length && tokens[i].b !== ']') {
        if (tokens[i].b) {
          n.c.push(read(depth + 1));
          run = null;
          continue;
        }
        const t = tokens[i++];
        // Unquoted neighbours are one leaf: [P के लिए]
        if (run && !t.quoted) {
          run.w += ` ${t.w}`;
          if (t.g) run.g = t.g;
        } else {
          const leaf = { w: t.w };
          if (t.g) leaf.g = t.g;
          if (/^\([a-z]+\)$/.test(t.w)) leaf.abs = true;
          n.c.push(leaf);
          run = t.quoted || leaf.abs ? null : leaf;
        }
      }
      if (i >= tokens.length) throw new Error('A closing ] is missing.');
      i++;
      return n;
    }
    if (!tokens.length || tokens[0].b !== '[') throw new Error('Start the tree with [, as in [S [NP …] [VP …]].');
    const tree = read(0);
    if (i < tokens.length) throw new Error('There is text after the final ].');
    return tree;
  }

  function toForest(root) {
    const esc = (s) => s.replace(/\\/g, '').replace(/([#$%&_{}])/g, '\\$1');
    function out(n, depth) {
      const pad = '  '.repeat(depth);
      if (isLeaf(n)) return `${pad}[{${esc(n.w)}}, tier=word]`;
      let label = esc(n.l).replace(/^S([0-9])$/, 'S$_$1$').replace(/'/g, '$^\\prime$');
      if (n.f) label += `\\\\{[${esc(n.f)}]}`;
      const head = `${pad}[{${label}}${n.f ? ', align=center' : ''}`;
      if (n.tri) return `${head}\n${pad}  [{${esc(text(n))}}, roof, tier=word]]`;
      if (!n.c.length) return `${head}]`;
      return `${head}\n${n.c.map((c) => out(c, depth + 1)).join('\n')}]`;
    }
    return '% Compile with XeLaTeX or LuaLaTeX.\n% Preamble: \\usepackage{fontspec}\\usepackage{forest}\n' +
      '%           \\setmainfont[Script=Devanagari]{Noto Serif Devanagari}\n' +
      `\\begin{forest}\n${out(root, 0)}\n\\end{forest}`;
  }

  /** The rewrite rules that this particular tree uses. */
  function rules(root) {
    const seen = new Set();
    walk(root, (n) => {
      if (isLeaf(n) || n.tri || !n.c.length || n.c.every(isLeaf)) return;
      seen.add(`${n.l} → ${n.c.map((c) => (isLeaf(c) ? c.w : c.l)).join(' + ')}`);
    });
    return [...seen];
  }

  /** Compares a drawn tree with a model by labelled constituents over word spans. */
  function compare(attempt, model) {
    function spans(root) {
      const out = new Map();
      let pos = 0;
      (function visit(n) {
        if (isLeaf(n)) {
          if (!n.abs) pos += n.w.split(' ').length;
          return;
        }
        const from = pos;
        n.c.forEach(visit);
        // The genitive marker has no category of its own in the model trees.
        if (pos > from && root !== n && n.l === 'GEN') return;
        if (pos > from) {
          const label = n.l.replace(/^S1$/, 'S').replace(/^NOUN$/, 'N').replace(/^VERB$/, 'V');
          out.set(`${from}-${pos}-${label}`, { label, text: text(n) });
        }
      })(root);
      return out;
    }
    const a = spans(attempt);
    const b = spans(model);
    const missing = [...b].filter(([k]) => !a.has(k)).map(([, v]) => v);
    const extra = [...a].filter(([k]) => !b.has(k)).map(([, v]) => v);
    return { missing, extra, correct: b.size - missing.length, total: b.size };
  }

  /** Accepts only well-formed trees from share links and imported files. */
  function sanitize(x, state = { count: 0 }, depth = 0) {
    if (!x || typeof x !== 'object' || depth > 60 || ++state.count > 1500) throw new Error('This is not a valid tree.');
    if (typeof x.w === 'string') {
      const leaf = { w: x.w.slice(0, 200) };
      if (typeof x.g === 'string') leaf.g = x.g.slice(0, 80);
      if (x.abs) leaf.abs = true;
      return leaf;
    }
    if (typeof x.l !== 'string' || !Array.isArray(x.c)) throw new Error('This is not a valid tree.');
    const n = { l: x.l.slice(0, 30), c: x.c.map((c) => sanitize(c, state, depth + 1)) };
    if (typeof x.f === 'string') n.f = x.f.slice(0, 20);
    if (typeof x.fn === 'string') n.fn = x.fn.slice(0, 10);
    if (x.tri) n.tri = true;
    return n;
  }

  HT.tree = { clone, isLeaf, leaves, text, walk, at, present, functions, toBracket, fromBracket, toForest, rules, compare, sanitize };
})(globalThis.HT = globalThis.HT || {});
