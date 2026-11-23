/*
 * Toy fragment by Tripathi Vivek and Rathod Dinesh (the earlier app's "Method 2"),
 * carried over from the earlier HindiTree app (branch feature_trials, da20901).
 *
 * This deliberately keeps that app's algorithm, rule order and sentence
 * splitting, so trees already used in teaching or publication do not change.
 */
(function (HT) {
  'use strict';

  const methods = {
    method2: {
      name: 'Method 2: Toy Fragment by Tripathi et al.',
      authors: 'Tripathi Vivek, Rathod Dinesh',
      paper: 'https://rupkatha.com/v16n103g/',
      roots: ['S'],
      grammar: {
        S: [['NP', 'VP'], ['S', 'S_CONJ'], ['Neg', 'S']],
        S_CONJ: [['Conj', 'S']],
        NP: [['N_m'], ['N_f']],
        VP: [['NP_cm', 'Verb_t'], ['Verb_i']],
        Verb_t: [['V_t', 'Aux']],
        Verb_i: [['V_i', 'Aux']],
        NP_cm: [['NP', 'CM']],
      },
      tags: [['S', 'sentence'], ['NP', 'noun phrase'], ['VP', 'verb phrase'], ['N_m', 'masculine noun'], ['N_f', 'feminine noun'],
        ['NP_cm', 'case-marked NP'], ['Verb_t', 'transitive verb phrase'], ['Verb_i', 'intransitive verb phrase'],
        ['V_t', 'transitive verb'], ['Aux', 'auxiliary'], ['V_i', 'intransitive verb'], ['Conj', 'conjunction'],
        ['Neg', 'negation'], ['CM', 'case marker']],
      example: { text: 'राम आम को खाता है', tags: ['N_m', 'N_m', 'CM', 'V_t', 'Aux'] },
    },
  };

  function tokenize(sentence) {
    const raw = sentence.trim().split(/\s+/).filter(Boolean);
    const out = [];
    const push = (w, t) => out.push({ w, g: '', tags: t ? [t] : [] });
    const suffix = (feminine) => (feminine ? '-ती है' : '-ता है');

    for (let i = 0; i < raw.length; i++) {
      const token = raw[i];
      const plain = token.replace(/^‑|^–|^—/, '-');
      const alone = plain.match(/^-?(ता|ती)(है)?$/);
      if (alone) {
        push(suffix(alone[1] === 'ती'), 'Aux');
        if (!alone[2] && raw[i + 1] === 'है') i++;
        continue;
      }
      const m = token.match(/^(.*?)(ता|ती)(है)?$/);
      if (m && (m[3] === 'है' || raw[i + 1] === 'है')) {
        const before = m[1] ? m[1].trim() : '';
        const stem = before && !/^-+$/.test(before) ? before : token.replace(/^-?(ता|ती)(है)?$/, '').trim();
        if (stem) push(stem);
        push(suffix(m[2] === 'ती'), 'Aux');
        if (m[3] !== 'है' && raw[i + 1] === 'है') i++;
        continue;
      }
      if (token === 'है' && out.length && /ता|ती/.test(raw[i - 1] || '')) {
        push('-ता है', 'Aux');
        continue;
      }
      push(token);
    }
    return out;
  }

  function cky(words, tags, grammar, roots) {
    const n = words.length;
    if (!n) return null;
    const chart = Array.from({ length: n }, () => Array.from({ length: n }, () => new Map()));
    const unary = (cell) => {
      let changed = true;
      while (changed) {
        changed = false;
        for (const [lhs, rules] of Object.entries(grammar)) {
          for (const rule of rules) {
            if (rule.length === 1 && cell.has(rule[0]) && !cell.has(lhs)) {
              cell.set(lhs, { child: rule[0] });
              changed = true;
            }
          }
        }
      }
    };
    for (let i = 0; i < n; i++) {
      chart[i][i].set(tags[i], { word: words[i] });
      unary(chart[i][i]);
    }
    for (let size = 2; size <= n; size++) {
      for (let i = 0; i + size <= n; i++) {
        const j = i + size - 1;
        for (let k = i; k < j; k++) {
          for (const [lhs, rules] of Object.entries(grammar)) {
            for (const [b, c] of rules) {
              if (c && chart[i][k].has(b) && chart[k + 1][j].has(c) && !chart[i][j].has(lhs)) {
                chart[i][j].set(lhs, { k, b, c });
              }
            }
          }
        }
        unary(chart[i][j]);
      }
    }
    const build = (i, j, label) => {
      const p = chart[i][j].get(label);
      let c;
      if (p.word !== undefined) c = [{ w: p.word }];
      else if (p.child !== undefined) c = [build(i, j, p.child)];
      else c = [build(i, p.k, p.b), build(p.k + 1, j, p.c)];
      return { l: label, c };
    };
    const root = [...chart[0][n - 1].keys()].find((s) => roots.includes(s));
    return root ? build(0, n - 1, root) : null;
  }

  function parse(tokens, id) {
    const method = methods[id];
    const blank = tokens.find((t) => !t.tags.length);
    if (blank) return { trees: [], error: `Assign a category to “${blank.w}”.` };
    let words = tokens.map((t) => t.w);
    let tags = tokens.map((t) => t.tags[0]);
    const neg = tags.indexOf('Neg');
    if (neg >= 0) {
      words = words.filter((_, i) => i !== neg);
      tags = tags.filter((_, i) => i !== neg);
    }
    let tree = cky(words, tags, method.grammar, method.roots);
    if (!tree) return { trees: [], error: `No complete tree under ${method.name}. Check the categories or try another method.` };
    // Method 2 shows negation as an operator on the whole sentence.
    if (neg >= 0) tree = { l: 'S', c: [{ l: 'Neg', c: [{ w: 'ऐसा नहीं है कि' }] }, tree] };
    return { trees: [tree] };
  }

  HT.legacy = { methods, tokenize, parse };
})(globalThis.HT = globalThis.HT || {});
