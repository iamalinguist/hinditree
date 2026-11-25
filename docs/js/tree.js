/*
 * Operations on trees.
 * Node: {l: label, c: children, f?: verb class, fn?: function, tri?: triangle}
 * Leaf: {w: word, g?: gloss, abs?: unpronounced, empty?: silent: pro (understood argument) or ∅ (empty slot)}
 */
(function (HT) {
  'use strict';

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const isLeaf = (n) => n.w !== undefined;
  const leaves = (n) => (isLeaf(n) ? [n] : n.c.flatMap(leaves));
  const text = (n) => leaves(n).filter((l) => !l.abs && !l.empty).map((l) => l.w).join(' ');
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
    // Other frameworks (X-bar: TP, CP) mark functions in their rules.
    // Collect the outermost marked constituents of the main clause.
    function marked(n) {
      for (const c of n.c) {
        if (isLeaf(c)) continue;
        if (c.fn) units.push({ node: c, fn: c.fn });
        else if (c.l !== 'CP') marked(c);
      }
    }
    // An extraposed clause (CL) is the object, or with an intensive verb the complement.
    function verbClass(n) {
      if (isLeaf(n) || n.l === 'CP') return '';
      if (n.l === 'VP' && n.f) return n.f;
      for (const c of n.c) {
        const f = verbClass(c);
        if (f) return f;
      }
      return '';
    }
    if (!isLeaf(root)) {
      if (clause.test(root.l)) scan(root);
      else if (root.l === 'VP') scanVP(root);
      else marked(root);
    }
    for (const u of units) if (u.fn === 'CL') u.fn = verbClass(root) === 'intens' ? 'sC' : 'dO';
    return units.map((u) => ({ ...u, text: text(u.node) || (leaves(u.node).find((l) => l.empty) || { w: '' }).w }));
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
          // pro: an understood argument (older trees wrote ϕ); ∅: an empty slot.
          if (t.w === 'pro' || t.w === 'ϕ') Object.assign(leaf, { w: 'pro', empty: true });
          if (t.w === '∅') Object.assign(leaf, { empty: true });
          n.c.push(leaf);
          run = t.quoted || leaf.abs || leaf.empty ? null : leaf;
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

  /*
   * Light verbs as one verb: an optional analysis of a Method 1 tree.
   *   compound verb  खा लिया   [V [V खा] [V लिया]]   (the vector leaves AUX)
   *   conjunct verb  मदद की    [V [N मदद] [V की]]    (the noun leaves VP)
   * A conjunct verb is only formed from a listed noun or adjective and a
   * verbaliser (करना, होना, देना, लेना), and not when नहीं separates them.
   * Returns {tree, notes}.
   */
  const CONJUNCT = new Set(('मदद काम बात इंतज़ार प्यार पसंद याद कोशिश शादी बहस मेहनत स्वागत इस्तेमाल शिकायत मज़ाक आराम ' +
    'ध्यान जवाब चोरी पूजा भरोसा फ़ोन शुरू ख़त्म बंद साफ़ तैयार नाराज़ खुश परेशान गुस्सा').split(' ').map((w) => HT.lexicon.key(w)));
  const VERBALISERS = new Set(['कर', 'हो', 'दे', 'ले']);

  function oneVerb(root) {
    const tree = clone(root);
    const notes = [];
    const firstVerbWord = (n) => (leaves(n).find((l) => !l.abs) || { w: '' }).w;
    (function visit(n) {
      if (isLeaf(n)) return;
      n.c.forEach(visit);
      if (n.l === 'Vgp') {
        // Compound verb: the vector joins the lexical verb.
        const vi = n.c.findIndex((c) => c.l === 'V');
        const aux = n.c.find((c) => c.l === 'AUX');
        const vec = aux ? aux.c.findIndex((c) => c.l === 'VEC') : -1;
        if (vi >= 0 && vec >= 0) {
          const verb = n.c[vi];
          n.c[vi] = { l: 'V', ...(verb.f ? { f: verb.f } : {}), c: [{ l: 'V', c: verb.c }, { l: 'V', c: aux.c[vec].c }] };
          aux.c.splice(vec, 1);
          if (!aux.c.length) n.c.splice(n.c.indexOf(aux), 1);
        }
      }
      if (n.l !== 'VP') return;
      // Conjunct verb: a listed noun or adjective right before the verb group.
      const gi = n.c.findIndex((c) => c.l === 'Vgp');
      if (gi < 1) return;
      const vgp = n.c[gi];
      const prev = n.c[gi - 1];
      const vi = vgp.c.findIndex((c) => c.l === 'V');
      if (vi < 0 || isLeaf(prev)) return;
      const forms = HT.lexicon.verb(firstVerbWord(vgp.c[vi]));
      if (!forms.some((f) => VERBALISERS.has(f.stem))) return;
      let part = null;
      let keep = null;
      let kind = '';
      const word = (x) => (x && x.c && x.c.length === 1 && isLeaf(x.c[0]) ? x.c[0].w : '');
      if (prev.l === 'NP' && prev.c.length === 1 && prev.c[0].l === 'N') {
        part = prev.c[0];
        kind = 'noun';
      } else if (prev.l === 'NP' && prev.c.length === 2 && prev.c[0].l === 'DET' && prev.c[0].c[0] && prev.c[0].c[0].l === 'POSS' && prev.c[1].l === 'N') {
        part = prev.c[1];
        keep = { ...prev.c[0].c[0], fn: 'dO' };
        kind = 'noun';
      } else if (prev.l === 'AP' && prev.c.length === 1 && prev.c[0].l === 'A') {
        part = prev.c[0];
        kind = 'adjective';
      }
      if (!part || !CONJUNCT.has(HT.lexicon.key(word(part)))) return;
      if (vgp.c[0].l === 'NEG') {
        notes.push(`नहीं stands between ${word(part)} and the verb, so they are drawn as two words: this is evidence that a conjunct verb is not a single word.`);
        return;
      }
      const inner = { ...vgp.c[vi] };
      delete inner.f;
      // The verb class loses the object or complement that joined the verb.
      if (kind === 'adjective' || keep) vgp.f = 'trans';
      else if (vgp.f === 'trans') vgp.f = 'intrans';
      else if (vgp.f === 'ditrans') vgp.f = 'trans';
      vgp.c[vi] = { l: 'V', ...(vgp.f ? { f: vgp.f } : {}), c: [part, inner] };
      if (keep) n.c.splice(gi - 1, 1, keep);
      else n.c.splice(gi - 1, 1);
    })(tree);
    return { tree, notes };
  }

  /*
   * Show suffixes: a view of a tree with the aspect suffix drawn under its own
   * node instead of a silent element (Whatzit?, "Words or morphemes in the tree?").
   *   [V खाता] [AUX [HAB (hab)] ...]   becomes   [V खा] [AUX [HAB -ता] ...]
   *   [V आया] [AUX [PERF (perf)] ...]  becomes   [V आ] [AUX [PERF -या] ...]
   *   [V आया] [AUX [TENSE (past)]]     becomes   [V आ] [AUX [PERF -या] [TENSE (past)]]
   *   [V खाऊँगा] [AUX [TENSE (fut)]]  becomes   [V खा] [AUX [ASP ∅] [SBJV -ऊँ] [TENSE -गा]]
   * Forms that cannot be cut (गया, किया, दी, पिया) stay whole.
   */
  const VOWEL_SIGNS = { 'ा': 'आ', 'ि': 'इ', 'ी': 'ई', 'ु': 'उ', 'ू': 'ऊ', 'े': 'ए', 'ै': 'ऐ', 'ो': 'ओ', 'ौ': 'औ' };
  function suffixes(root) {
    const tree = clone(root);
    const order = [];
    (function visit(n, parent) {
      if (isLeaf(n)) order.push({ leaf: n, parent });
      else n.c.forEach((c) => visit(c, n));
    })(tree, null);
    const parentOf = (target) => {
      let found = null;
      walk(tree, (n) => { if (n.c && n.c.includes(target)) found = n; });
      return found;
    };
    order.forEach(({ leaf, parent }, i) => {
      if (!parent || parent.l !== 'V' || leaf.abs || leaf.empty) return;
      const word = leaf.w.normalize('NFC');
      // Simple future: an aspect position with nothing in it, [ASP ∅] (Whatzit?,
      // "Tense or perspective?": every clause has an aspect slot).
      const future = HT.lexicon.verb(word).find((f) => f.kind === 'fut');
      if (future) {
        const vgp = parentOf(parent);
        const aux = vgp && vgp.c.find((c) => c.l === 'AUX');
        if (!aux) return;
        if (!aux.c.some((c) => /^(HAB|PERF|PROG|ASP)$/.test(c.l))) aux.c.unshift({ l: 'ASP', c: [{ w: '∅', empty: true }] });
        // The future is the subjunctive plus -गा: खा-ऊँ-गा, खा-ए-गा, देख-ें-गे.
        const end = word.match(/(गा|गी|गे|गीं)$/);
        const stem = future.stem && future.stem.normalize('NFC');
        const tense = aux.c.find((c) => c.l === 'TENSE' && c.c[0] && c.c[0].w === '(fut)');
        if (!end || !stem || !tense || !word.startsWith(stem)) return;
        let mood = word.slice(stem.length, word.length - end[1].length);
        if (VOWEL_SIGNS[mood[0]]) mood = VOWEL_SIGNS[mood[0]] + mood.slice(1);
        tense.c = [{ w: `-${end[1]}`, g: 'FUT' }];
        // होगा, देगा: the third-person subjunctive (हो, दे) has no ending to show.
        if (mood) aux.c.splice(aux.c.indexOf(tense), 0, { l: 'SBJV', c: [{ w: `-${mood}`, g: 'SBJV' }] });
        leaf.w = stem;
        if (leaf.g) leaf.g = leaf.g.split('.')[0];
        return;
      }
      const form = HT.lexicon.verb(word).find((f) => (f.kind === 'hab' || f.kind === 'perf')
        && f.stem && word.startsWith(f.stem.normalize('NFC')) && word.length > f.stem.length);
      if (!form) return;
      let suffix = word.slice(form.stem.length);
      if (VOWEL_SIGNS[suffix[0]]) suffix = VOWEL_SIGNS[suffix[0]] + suffix.slice(1);
      const want = form.kind === 'hab' ? '(hab)' : '(perf)';
      // The silent element of this verb: the next one before another verb.
      let target = null;
      for (let j = i + 1; j < order.length; j++) {
        const o = order[j];
        if (o.parent && o.parent.l === 'V' && !o.leaf.abs) break;
        if (o.leaf.abs && o.leaf.w === want) { target = o.leaf; break; }
      }
      const gloss = leaf.g ? leaf.g.split('.')[0] : '';
      const label = form.kind === 'hab' ? 'HAB' : 'PFV';
      if (target) {
        delete target.abs;
        Object.assign(target, { w: `-${suffix}`, g: label });
      } else if (form.kind === 'perf') {
        // A bare perfective (आया): add PERF before the silent past tense.
        const vgp = parentOf(parent);
        const aux = vgp && vgp.c.find((c) => c.l === 'AUX');
        if (!aux) return;
        const at = aux.c.findIndex((c) => c.l === 'TENSE');
        aux.c.splice(at < 0 ? aux.c.length : at, 0, { l: 'PERF', c: [{ w: `-${suffix}`, g: label }] });
      } else return;
      leaf.w = form.stem;
      if (gloss) leaf.g = gloss;
    });
    return tree;
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
          if (!n.abs && !n.empty) pos += n.w.split(' ').length;
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

  HT.tree = { clone, isLeaf, leaves, text, walk, at, present, functions, toBracket, fromBracket, toForest, rules, compare, sanitize, oneVerb, suffixes };
})(globalThis.HT = globalThis.HT || {});
