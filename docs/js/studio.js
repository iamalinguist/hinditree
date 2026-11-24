/* Make Structure: analyse, edit, present and export one sentence. */
(function (HT) {
  'use strict';
  const { esc, store, toast, download, showText } = HT.util;
  const T = HT.tree;

  const FUNCTIONS = [
    ['S', 'subject'], ['P', 'predicator'], ['dO', 'direct object'], ['iO', 'indirect object'],
    ['sC', 'subject complement'], ['oC', 'object complement'], ['pO', 'prepositional object'], ['A', 'adverbial'],
  ];
  const LABELS = ['S', 'S1', 'S2', 'CP', "C'", 'C', 'TP', "T'", 'T', 'AspP', "Asp'", 'Asp', 'ModP', "Mod'", 'Mod', 'VoiceP', "Voice'", 'Voice',
    'vP', "v'", 'v', "V'", 'KP', "K'", 'K', 'D', 'Deg', "A'", "P'", "Adv'", 'Conj', 'Prt', 'Neg',
    'NP', "N'", 'VP', 'Vgp', 'AP', 'AdvP', 'PP', 'POSS', 'DET', 'N', 'PRO', 'V', 'AUX', 'TENSE',
    'MOD', 'PERF', 'PROG', 'HAB', 'PASS', 'VEC', 'NEG', 'A', 'Adv', 'deg', 'P', 'CASE', 'sub', 'coord', 'part'];
  const LEVELS = ['1 · Categories and phrases', '2 · AdvP, PP, AP', '3 · Verb classes', '4 · Verb group', '5 · N′ in the noun phrase', '6 · Clauses and triangles'];
  const OPTIONS = [['oneVerb', 'Light verbs as one verb'], ['functions', 'Functions'], ['gloss', 'Glosses'], ['translit', 'Transliteration'], ['english', 'Translation'],
    ['triangles', 'Triangles for S₂'], ['align', 'Align words'], ['color', 'Colour'], ['blank', 'Blank labels (quiz)']];

  const s = {
    text: '', english: '', note: '', tokens: [], trees: [], index: 0, tree: null, chunks: null,
    error: '', warnings: [], exercise: null, feedback: null,
    method: ['thomas', 'method2', 'custom', 'xbar'].includes(store.get('method')) ? store.get('method') : 'thomas',
    level: 4,
    opts: { functions: true, gloss: false, translit: false, triangles: false, align: true, color: true, blank: false, ...store.get('options', {}), english: false },
    // The analysed Hindi sentence that the English translation belongs to,
    // and whether the English was typed since the last analysis.
    englishFor: '', englishFresh: false,
    selected: [], word: null, several: false, undo: [], redo: [],
    step: Infinity, direction: 'down', zoom: 0, presenting: false,
    view: store.get('view', 'tree') === 'karaka' ? 'karaka' : 'tree', karakaFix: {},
  };
  let host = null;
  const compiled = new Map();

  const isLegacyId = (id) => Object.prototype.hasOwnProperty.call(HT.legacy.methods, id);
  const isLegacy = () => isLegacyId(s.method);
  const customText = () => store.get('grammar', HT.pages.STARTER_GRAMMAR);

  function grammarFor(method) {
    const text = method === 'custom' ? customText() : method === 'xbar' ? HT.grammar.xbar : HT.grammar.thomas;
    if (!compiled.has(text)) compiled.set(text, HT.parser.compile(text));
    return compiled.get(text);
  }
  const grammar = () => grammarFor(s.method);

  function tagGroups() {
    if (isLegacy()) return [['Categories', HT.legacy.methods[s.method].tags]];
    if (s.method !== 'custom') return HT.grammar.tags;
    return [['Your categories', categoriesOf(grammar())]];
  }

  /** Word categories of a grammar: symbols never on the left of a rule. */
  function categoriesOf(g) {
    const used = new Set();
    const defined = new Set();
    for (const list of [...g.unary.values(), ...g.binary.values()]) {
      for (const r of list) {
        defined.add(r.lhs);
        r.rhs.forEach((x) => used.add(x.sym));
      }
    }
    return [...used].filter((x) => !defined.has(x) && !/^[\u0001\u0002_]/.test(x)).map((x) => [x, '']);
  }

  function shown() {
    if (!s.tree) return null;
    if (s.method !== 'thomas') return s.tree;
    return T.present(baseTree(s.tree), s.level, { triangles: s.level === 6 && s.opts.triangles });
  }

  // History
  const snapshot = () => JSON.stringify([s.text, s.english, s.note, s.tokens, s.trees, s.index, s.tree, s.error, s.method, s.level]);
  function remember() {
    s.undo.push(snapshot());
    if (s.undo.length > 60) s.undo.shift();
    s.redo = [];
  }
  function restore(from, to) {
    if (!from.length) return;
    to.push(snapshot());
    [s.text, s.english, s.note, s.tokens, s.trees, s.index, s.tree, s.error, s.method, s.level] = JSON.parse(from.pop());
    Object.assign(s, { selected: [], word: null, step: Infinity, feedback: null });
    render();
  }

  function tokensFor(text, method) {
    if (isLegacyId(method)) {
      const tokens = HT.legacy.tokenize(text);
      const { example } = HT.legacy.methods[method];
      if (text.trim() === example.text) tokens.forEach((t, i) => { t.tags = [example.tags[i]]; });
      return tokens;
    }
    let tokens = HT.tagger.tag(text);
    if (method === 'custom') {
      const known = new Set(categoriesOf(grammarFor('custom')).map(([tag]) => tag));
      tokens = tokens.filter((t) => !t.abs || t.tags.some((x) => known.has(x)));
      for (const t of tokens) t.tags = [...new Set(t.tags.flatMap((x) => [x, x.split('.')[0]]).filter((x) => known.has(x)))];
    }
    return tokens;
  }

  function tokenize() {
    s.warnings = [];
    s.tokens = tokensFor(s.text, s.method);
  }

  /** For the Lab: does a method give this sentence a tree, and does it flag it? */
  function predict(text, method) {
    const tokens = tokensFor(text, method);
    const result = HT.parser.parse(tokens, grammarFor(method));
    const flags = method === 'thomas' || method === 'xbar' ? HT.tagger.check(tokens) : [];
    return { trees: result.trees.length, flags, error: result.error || '' };
  }

  /** The first Method 1 tree for a sentence, for the kāraka view. */
  function treeFor(text) {
    return treesFor(text)[0] || null;
  }
  /** All Method 1 readings of a sentence, best first. */
  function treesFor(text) {
    return HT.parser.parse(tokensFor(text, 'thomas'), grammarFor('thomas')).trees;
  }

  /** Opens a sentence in Make Structure with a given method. */
  function loadSentence(text, method) {
    remember();
    s.method = method;
    store.set('method', method);
    Object.assign(s, { text, english: '', englishFor: '', note: '', exercise: null, word: null, zoom: 0 });
    tokenize();
    parse();
  }

  function parse() {
    s.karakaFix = {};
    const result = isLegacy() ? HT.legacy.parse(s.tokens, s.method) : HT.parser.parse(s.tokens, grammar());
    Object.assign(s, {
      trees: result.trees, index: 0, tree: result.trees[0] || null, error: result.error || '',
      chunks: result.chunks || null, selected: [], step: Infinity, feedback: null,
    });
    s.warnings = s.method === 'thomas' || s.method === 'xbar' ? HT.tagger.check(s.tokens) : [];
  }

  function analyse() {
    // A translation of an earlier sentence is dropped, unless the English was just typed.
    if (s.englishFor !== s.text.trim() && !s.englishFresh) s.english = '';
    Object.assign(s, { englishFor: s.text.trim(), englishFresh: false });
    remember();
    Object.assign(s, { word: null, exercise: null, note: '' });
    tokenize();
    parse();
  }

  function drawByHand() {
    if (!s.tokens.length) tokenize();
    if (!s.tokens.length) return toast('Type a sentence first.');
    remember();
    const c = s.tokens
      .filter((t) => !t.abs || s.level >= 4)
      .map((t) => {
        const tag = t.tags[0] || 'X';
        const leaf = { w: t.w };
        if (t.g) leaf.g = t.g;
        if (t.abs) leaf.abs = true;
        return { l: tag === 'gen' ? 'GEN' : tag.split('.')[0], c: [leaf] };
      });
    Object.assign(s, { tree: { l: 'S', c }, trees: [], error: '', selected: [], step: Infinity, feedback: null });
    return toast('Shift-click neighbouring labels, then choose Group to build phrases.');
  }

  function loadExample(example) {
    remember();
    const solved = HT.lessons.solve(example);
    Object.assign(s, {
      method: 'thomas', text: example.sentence, english: example.english, englishFor: example.sentence, note: example.note || '',
      level: example.chapter, tokens: T.clone(solved.tokens), trees: solved.trees, index: solved.index,
      tree: solved.trees[solved.index] || null, error: solved.error || '', warnings: [], chunks: null,
      selected: [], word: null, step: Infinity, exercise: null, feedback: null, zoom: 0,
    });
    s.opts.triangles = example.chapter === 6;
  }

  function loadExercise(example) {
    loadExample(example);
    // Start from the word categories of the model; the student builds the phrases.
    const c = [];
    (function collect(n) {
      for (const child of n.c) {
        if (T.isLeaf(child)) c.push({ l: 'GEN', c: [child] });
        else if (child.c.every(T.isLeaf)) c.push({ l: child.l, ...(child.f ? { f: child.f } : {}), c: child.c });
        else collect(child);
      }
    })(T.present(s.tree, s.level));
    Object.assign(s, { exercise: example, note: '', tree: { l: 'S', c }, trees: [], tokens: [], undo: [], redo: [] });
    s.opts.triangles = false;
  }

  function loadSaved(data) {
    const tree = T.sanitize(data.tree);
    if (T.isLeaf(tree)) throw new Error('This is not a valid tree.');
    remember();
    Object.assign(s, {
      tree, trees: [], tokens: [], chunks: null, error: '', warnings: [], word: null, selected: [], exercise: null, feedback: null,
      text: String(data.text || T.text(tree)).slice(0, 1000), english: String(data.english || '').slice(0, 1000), englishFor: String(data.text || T.text(tree)).slice(0, 1000),
      note: String(data.note || '').slice(0, 2000), step: Infinity, zoom: 0,
      method: ['custom', 'xbar'].includes(data.method) || isLegacyId(data.method) ? data.method : 'thomas',
      level: Math.min(6, Math.max(1, Math.floor(Number(data.level)) || 4)),
    });
    s.opts.triangles = !!data.triangles;
  }


  function setMethod(id) {
    remember();
    s.method = id;
    store.set('method', id);
    if (isLegacyId(id)) s.text = HT.legacy.methods[id].example.text;
    Object.assign(s, { word: null, exercise: null, note: '', english: '' });
    tokenize();
    parse();
  }

  // Editing works on the tree as drawn, then makes that drawing the current tree.
  function edit(change) {
    const tree = T.clone(shown());
    const message = change(tree, s.selected.map((p) => [...p]));
    if (typeof message === 'string') return toast(message);
    remember();
    s.tree = tree;
    s.feedback = null;
    return render();
  }

  const parentOf = (tree, path) => T.at(tree, path.slice(0, -1));
  const last = (path) => path[path.length - 1];
  const readLabel = () => (host.querySelector('#node-label') || { value: '' }).value.trim().replace(/[′’]/g, "'").replace(/[\s\[\]=^".]/g, '') || 'XP';

  const edits = {
    apply(tree, [p]) {
      const n = T.at(tree, p);
      n.l = readLabel();
      for (const [key, id] of [['f', '#node-class'], ['fn', '#node-fn']]) {
        const value = host.querySelector(id).value;
        if (value) n[key] = value;
        else delete n[key];
      }
    },
    triangle(tree, [p]) {
      const n = T.at(tree, p);
      if (n.tri) delete n.tri;
      else n.tri = true;
      s.opts.triangles = false;
    },
    group(tree, paths) {
      if (paths.some((p) => !p.length || p.slice(0, -1).join() !== paths[0].slice(0, -1).join())) {
        return 'Select neighbours that have the same mother node.';
      }
      const at = paths.map(last).sort((a, b) => a - b);
      if (at[at.length - 1] - at[0] !== at.length - 1) return 'Select neighbours with no gap between them.';
      const parent = parentOf(tree, paths[0]);
      const node = { l: readLabel(), c: parent.c.slice(at[0], at[0] + at.length) };
      parent.c.splice(at[0], at.length, node);
      s.selected = [[...paths[0].slice(0, -1), at[0]]];
      return undefined;
    },
    parent(tree, [p]) {
      const copy = T.clone(T.at(tree, p));
      const n = T.at(tree, p);
      for (const key of Object.keys(n)) delete n[key];
      Object.assign(n, { l: 'XP', c: [copy] });
    },
    remove(tree, [p]) {
      const n = T.at(tree, p);
      if (!p.length) {
        if (n.c.length !== 1 || T.isLeaf(n.c[0])) return 'The root can be removed only when it has a single daughter node.';
        const child = n.c[0];
        for (const key of Object.keys(n)) delete n[key];
        Object.assign(n, child);
      } else {
        if (n.c.some(T.isLeaf) && parentOf(tree, p).c.length > 1) return 'This node holds a word. Use Delete branch to remove both.';
        parentOf(tree, p).c.splice(last(p), 1, ...n.c);
      }
      s.selected = [];
      return undefined;
    },
    prune(tree, [p]) {
      if (!p.length) return 'The root cannot be deleted.';
      parentOf(tree, p).c.splice(last(p), 1);
      s.selected = [];
      return undefined;
    },
    child(tree, [p]) {
      const value = host.querySelector('#new-word').value.trim();
      const n = T.at(tree, p);
      const leaf = { w: value };
      if (/^\([a-z]+\)$/.test(value)) leaf.abs = true;
      n.c.push({ l: HT.tagger.ABSTRACT[value.slice(1, -1)] || 'X', c: value ? [leaf] : [] });
      s.selected = [[...p, n.c.length - 1]];
    },
    words(tree, [p]) {
      const n = T.at(tree, p);
      const word = host.querySelector('#leaf-word').value.trim();
      if (!word) return 'A word cannot be empty.';
      const gloss = host.querySelector('#leaf-gloss').value.trim();
      const leaf = n.c.find(T.isLeaf);
      leaf.w = word;
      if (gloss) leaf.g = gloss;
      else delete leaf.g;
      return undefined;
    },
    left: (tree, [p]) => shift(tree, p, -1),
    right: (tree, [p]) => shift(tree, p, 1),
    joinLeft: (tree, [p]) => join(tree, p, -1),
    joinRight: (tree, [p]) => join(tree, p, 1),
    raise(tree, [p]) {
      if (p.length < 2) return 'This node is already at the top.';
      const parent = parentOf(tree, p);
      const i = last(p);
      if (parent.c.length < 2 || (i > 0 && i < parent.c.length - 1)) {
        return 'Only a first or last daughter can move up without changing the word order.';
      }
      const [node] = parent.c.splice(i, 1);
      const place = p[p.length - 2] + (i === 0 ? 0 : 1);
      T.at(tree, p.slice(0, -2)).c.splice(place, 0, node);
      s.selected = [[...p.slice(0, -2), place]];
      return undefined;
    },
  };

  function shift(tree, p, d) {
    if (!p.length) return 'The root cannot move.';
    const { c } = parentOf(tree, p);
    const i = last(p);
    if (!c[i + d]) return 'There is no neighbour on that side.';
    [c[i], c[i + d]] = [c[i + d], c[i]];
    s.selected = [[...p.slice(0, -1), i + d]];
    return undefined;
  }

  function join(tree, p, d) {
    if (!p.length) return 'The root cannot move.';
    const { c } = parentOf(tree, p);
    const i = last(p);
    const target = c[i + d];
    if (!target || T.isLeaf(target) || target.c.every(T.isLeaf)) return 'There is no phrase to join on that side.';
    const [node] = c.splice(i, 1);
    if (d < 0) target.c.push(node);
    else target.c.unshift(node);
    s.selected = [[...p.slice(0, -1), d < 0 ? i - 1 : i, d < 0 ? target.c.length - 1 : 0]];
    return undefined;
  }

  // HTML
  function wordsPanel() {
    if (!s.tokens.length) return '';
    const cards = s.tokens.map((t, i) => `<button class="word ${s.word === i ? 'on' : ''} ${t.abs ? 'abstract' : ''} ${t.tags.length ? '' : 'missing'}" data-act="word" data-i="${i}">
        <b lang="hi">${esc(t.w)}</b><span class="tag">${esc((t.tags[0] || 'choose').replace('_', ' '))}</span>
        ${t.tags.length > 1 ? `<small>+${t.tags.length - 1} possible</small>` : ''}</button>`).join('');
    const token = s.tokens[s.word];
    let palette = '';
    if (token) {
      const groups = tagGroups().map(([name, list]) => `<div class="tag-group"><h4>${esc(name)}</h4>${list.map(([tag, meaning]) => {
        const rank = token.tags.indexOf(tag);
        return `<button class="chip ${rank === 0 ? 'first' : rank > 0 ? 'also' : ''}" data-act="tag" data-tag="${esc(tag)}" title="${esc(tag)}">
          <b>${esc(tag.replace(/^V\.(\w+?)(_\w+)?$/, 'V [$1]'))}</b> ${esc(/^V\.\w+_/.test(tag) ? '' : meaning)}</button>`;
      }).join('')}</div>`).join('');
      palette = `<div class="palette">
        <div class="row between"><strong>Category of <span lang="hi">${esc(token.w)}</span></strong>
          <label class="inline">Gloss <input id="token-gloss" value="${esc(token.g)}"></label></div>
        <p class="hint">Click to choose. Ctrl- or ⌘-click to allow several and let the parser decide.</p>${groups}
        <div class="row tools">
          <button class="btn small" data-act="merge">Merge with next word</button>
          ${token.w.includes(' ') ? '<button class="btn small" data-act="split">Split</button>' : ''}
          <button class="btn small" data-act="drop">Remove</button>
          <label class="inline">Insert after <select id="abstract"><option value="">choose…</option>${
            Object.keys(HT.tagger.ABSTRACT).map((k) => `<option value="${k}">(${k})</option>`).join('')}</select></label>
          <button class="btn small primary" data-act="parse">Parse again</button>
        </div></div>`;
    }
    return `<section class="card words-card"><div class="row between"><h3>Word categories</h3>
      <span class="hint">Click a word to correct it</span></div><div class="words">${cards}</div>${palette}</section>`;
  }

  function messages() {
    let html = '';
    if (s.error) {
      html += `<div class="notice error" role="alert"><button class="notice-close" data-act="dismiss" data-kind="error" aria-label="Close this message" title="Close">×</button><strong>${esc(s.error)}</strong>
        <span>Check the categories, especially the verb class: a verb needs all its obligatory objects and complements.</span>
        <div class="row">${s.chunks ? '<button class="btn small" data-act="chunks">Edit the phrases that were found</button>' : ''}
        <button class="btn small" data-act="report">Report this sentence</button>
        <button class="btn small" data-act="hand">Draw by hand</button></div></div>`;
    }
    html += s.warnings.map((w, i) => `<div class="notice warn"><button class="notice-close" data-act="dismiss" data-kind="warn" data-i="${i}" aria-label="Close this message" title="Close">×</button>${esc(w)}</div>`).join('');
    if (s.note) html += `<div class="notice info"><button class="notice-close" data-act="dismiss" data-kind="note" aria-label="Close this message" title="Close">×</button>${esc(s.note)}</div>`;
    if (s.exercise) {
      html += `<div class="notice info"><strong>Exercise: draw the tree for this sentence (chapter ${s.exercise.chapter} conventions).</strong>
        <div class="row"><button class="btn small primary" data-act="check">Check my tree</button>
        <button class="btn small" data-act="answer">Show the answer</button></div>`;
      const f = s.feedback;
      if (f) {
        const list = (items) => items.map((m) => `<li><b>${esc(m.label)}</b> over <span lang="hi">${esc(m.text)}</span></li>`).join('');
        html += f.missing.length || f.extra.length
          ? `<p>${f.correct} of ${f.total} constituents are correct.</p>
             ${f.missing.length ? `<p>Still to add:</p><ul>${list(f.missing)}</ul>` : ''}
             ${f.extra.length ? `<p>Not in the model tree:</p><ul>${list(f.extra)}</ul>` : ''}`
          : '<p><strong>Correct: every constituent matches the model tree.</strong></p>';
      }
      html += '</div>';
    }
    return html;
  }

  /** An abbreviation that shows its full form on hover. */
  const abbr = (short, full) => (full ? `<abbr title="${esc(full)}">${esc(short)}</abbr>` : esc(short));

  function inspector(view) {
    if (!view) return '';
    if (s.view === 'karaka') return karakaPanel();
    s.selected = s.selected.filter((p) => T.at(view, p));
    if (!s.selected.length) {
      const units = T.functions(view);
      const form = (n) => esc(n.l);
      return `<aside class="card inspector"><h3>Form and function</h3>
        ${units.length ? `<table class="ff"><tr><th>Constituent</th><th>Form</th><th>Function</th></tr>${units.map((u) =>
          `<tr><td lang="hi">${esc(u.text)}</td><td>${abbr(u.node.l, HT.render.fullForm(u.node.l))}</td><td><i>${abbr(u.fn, HT.render.fullFunction(u.fn))}</i></td></tr>`).join('')}</table>`
          : '<p class="hint">Functions appear when S has an NP and a VP.</p>'}
        <details><summary>Rewrite rules in this tree</summary><ul class="mono rules">${T.rules(view).map((r) => `<li>${esc(r)}</li>`).join('')}</ul></details>
        <details id="bracket-box"><summary>Bracket notation</summary><textarea id="brackets" class="mono" rows="8" spellcheck="false">${esc(T.toBracket(view, 0))}</textarea>
          <button class="btn small" data-act="brackets">Draw from notation</button></details>
        <p class="hint">Click any label in the tree to inspect or edit it. Shift-click to select several.</p></aside>`;
    }
    if (s.selected.length > 1) {
      return `<aside class="card inspector"><h3>${s.selected.length} nodes selected</h3>
        <label>Label of the new mother node<input id="node-label" list="labels" value="NP"></label>
        <button class="btn primary" data-edit="group">Group</button>
        <button class="btn" data-act="clear">Clear selection</button></aside>`;
    }
    const path = s.selected[0];
    const n = T.at(view, path);
    const mother = path.length ? T.at(view, path.slice(0, -1)) : null;
    const daughters = n.c.filter((c) => !T.isLeaf(c)).map((c) => c.l);
    const sisters = mother ? mother.c.filter((c, i) => i !== last(path) && !T.isLeaf(c)).map((c) => c.l) : [];
    const unit = T.functions(view).find((u) => u.node === n);
    const leaf = n.c.find(T.isLeaf);
    const option = (value, current, text = value) => `<option value="${esc(value)}" ${value === (current || '') ? 'selected' : ''}>${esc(text)}</option>`;
    const classes = [...new Set([...HT.lexicon.CLASSES, ...(n.f ? [n.f] : [])])];
    return `<aside class="card inspector">
      <div class="row between"><h3>${esc(n.l)}</h3><button class="btn small" data-act="clear">Done</button></div>
      <p class="constituent" lang="hi">${esc(T.text(n)) || '—'}</p>
      <dl class="relations">
        ${unit ? `<dt>Function</dt><dd><i>${esc(unit.fn)}</i></dd>` : ''}
        ${mother ? `<dt>Immediately dominated by</dt><dd>${esc(mother.l)}</dd>` : ''}
        ${daughters.length ? `<dt>Immediately dominates</dt><dd>${esc(daughters.join(', '))}</dd>` : ''}
        ${sisters.length ? `<dt>Sisters</dt><dd>${esc(sisters.join(', '))}</dd>` : ''}
      </dl>
      <label>Label<input id="node-label" list="labels" value="${esc(n.l)}"></label>
      <div class="two">
        <label>Verb class<select id="node-class">${option('', n.f, 'none')}${classes.map((c) => option(c, n.f)).join('')}</select></label>
        <label>Function<select id="node-fn">${option('', n.fn, 'automatic')}${FUNCTIONS.map(([f, name]) => option(f, n.fn, `${f} · ${name}`)).join('')}</select></label>
      </div>
      <button class="btn primary" data-edit="apply">Apply</button>
      ${leaf ? `<div class="two"><label>Word<input id="leaf-word" lang="hi" value="${esc(leaf.w)}"></label>
        <label>Gloss<input id="leaf-gloss" value="${esc(leaf.g)}"></label></div>
        <button class="btn small" data-edit="words">Update word</button>` : ''}
      <h4>Structure</h4>
      <div class="edit-grid">
        <button class="btn small" data-edit="parent">Add mother</button>
        <button class="btn small" data-edit="triangle">${n.tri ? 'Open triangle' : 'Make triangle'}</button>
        <button class="btn small" data-edit="remove">Remove node only</button>
        <button class="btn small danger" data-edit="prune">Delete branch</button>
        <button class="btn small" data-edit="joinLeft">Join phrase on left</button>
        <button class="btn small" data-edit="joinRight">Join phrase on right</button>
        <button class="btn small" data-edit="left">Move left</button>
        <button class="btn small" data-edit="right">Move right</button>
        <button class="btn small" data-edit="raise">Attach higher</button>
      </div>
      <div class="row"><input id="new-word" lang="hi" placeholder="word or (pres)" aria-label="New word">
        <button class="btn small" data-edit="child">Add daughter</button></div>
    </aside>`;
  }

  /** Kāraka relations of the current sentence, from its Method 1 analysis. */
  function karakaAnalysis() {
    const tree = s.method === 'thomas' && s.tree ? s.tree : s.text ? treeFor(s.text) : null;
    return HT.karaka.analyse(tree && baseTree(tree), s.karakaFix);
  }

  /** The Method 1 tree, with compound and conjunct verbs as one verb if that option is on. */
  function baseTree(tree) {
    return s.opts.oneVerb ? T.oneVerb(tree).tree : tree;
  }

  function karakaPanel() {
    const a = karakaAnalysis();
    if (!a) return '<aside class="card inspector"><h3>Kāraka relations</h3><p class="hint">Method 1 found no analysis for this sentence, so there are no relations to show.</p></aside>';
    const L = HT.karaka.LABELS;
    const rows = a.arcs.filter((arc) => arc.label !== 'ccof').map((arc) => {
      const text = a.chunks[arc.dep].text;
      const meaning = L[arc.label] || [arc.label, '', ''];
      return `<tr><td lang="hi">${esc(text)}</td><td><select data-karaka="${esc(text)}" aria-label="Kāraka of ${esc(text)}">${Object.keys(L).filter((k) => k !== 'ccof').map((k) =>
        `<option value="${k}" ${k === arc.label ? 'selected' : ''}>${k}</option>`).join('')}</select></td>
        <td>${esc(meaning[0])}<br><span class="hint">${esc(meaning[2])}</span>${arc.alt && !arc.fixed ? `<br><span class="hint">or ${esc(arc.alt)}: ${esc((L[arc.alt] || ['', '', ''])[2])}?</span>` : ''}</td></tr>`;
    }).join('');
    return `<aside class="card inspector"><h3>Kāraka relations</h3>
      <table class="ff karaka-table"><tr><th>Chunk</th><th>Label</th><th>Relation</th></tr>${rows}</table>
      <p class="hint">Proposed from the Method 1 analysis${s.method === 'thomas' ? '' : ' of this sentence'}. Kāraka roles depend on meaning, so change any label you disagree with. A “?” marks a guess.</p>
      ${Object.keys(s.karakaFix).length ? '<button class="btn small" data-act="karakaReset">Undo my changes</button>' : ''}</aside>`;
  }

  function stage(view) {
    if (!view) {
      return `<section class="card stage empty"><p class="big">No tree yet</p><p>Type a Hindi sentence and choose Analyse, write English and choose Convert, or open an example from the course.</p>
        ${s.text.trim() ? '<p><button class="btn small" data-act="hand">or draw it by hand</button></p>' : ''}</section>`;
    }
    return `<section class="card stage" id="stage">
      <div class="toolbar">
        <div class="cluster switch" role="group" aria-label="View"><button class="btn small ${s.view === 'tree' ? 'on' : ''}" data-act="viewTree" aria-pressed="${s.view === 'tree'}">Tree</button>
          <button class="btn small ${s.view === 'karaka' ? 'on' : ''}" data-act="viewKaraka" aria-pressed="${s.view === 'karaka'}">Kāraka</button></div>
        <div class="cluster"><button class="btn small" data-act="undo" title="Undo (Ctrl+Z)" ${s.undo.length ? '' : 'disabled'}>Undo</button>
          <button class="btn small" data-act="redo" title="Redo (Ctrl+Y)" ${s.redo.length ? '' : 'disabled'}>Redo</button></div>
        ${s.trees.length > 1 ? `<div class="cluster readings"><button class="btn small" data-act="prev" aria-label="Previous reading">‹</button>
          <span>Reading ${s.index + 1} of ${s.trees.length}</span><button class="btn small" data-act="next" aria-label="Next reading">›</button></div>` : ''}
        ${s.view === 'tree' ? `<div class="cluster"><button class="btn small" data-act="back" title="One step back">◀</button>
          <button class="btn small" data-act="build">Build step by step</button>
          <button class="btn small" data-act="forward" title="One step forward">▶</button>
          <select id="direction" aria-label="Build direction"><option value="down" ${s.direction === 'down' ? 'selected' : ''}>top-down</option>
          <option value="up" ${s.direction === 'up' ? 'selected' : ''}>bottom-up</option></select></div>` : ''}
        <div class="cluster"><button class="btn small" data-act="out" aria-label="Zoom out">−</button>
          <button class="btn small" data-act="fit">Fit</button><button class="btn small" data-act="in" aria-label="Zoom in">+</button></div>
        ${s.view === 'tree' ? `<button class="btn small ${s.several ? 'on' : ''}" data-act="several" aria-pressed="${s.several}">Select several</button>` : ''}
        <button class="btn small primary" data-act="present">Present</button>
      </div>
      <div class="options">${OPTIONS.filter(([key]) => (key === 'oneVerb' ? s.method === 'thomas'
        : s.view === 'tree' ? key !== 'triangles' || s.level === 6 : ['gloss', 'english'].includes(key))).map(([key, name]) =>
        `<label${key === 'oneVerb' ? ' title="Draw compound verbs (खा लिया) and conjunct verbs (मदद की) as one complex V"' : ''}><input type="checkbox" data-opt="${key}" ${s.opts[key] ? 'checked' : ''}> ${name}</label>`).join('')}</div>
      ${s.opts.oneVerb && s.method === 'thomas' && s.tree ? T.oneVerb(s.tree).notes.map((n) => `<p class="hint oneverb-note" lang="hi">${esc(n)}</p>`).join('') : ''}
      <p class="present-caption" lang="hi">${esc(s.text)}</p>
      <div class="canvas" id="canvas"></div>
      <div class="present-bar"><button class="btn" data-act="back">◀ Back</button><button class="btn" data-act="build">Start build</button>
        <button class="btn" data-act="forward">Next ▶</button><button class="btn" data-act="exit">Exit</button></div>
      <div class="toolbar export">
        <span class="hint">Export</span>
        <button class="btn small" data-act="png">PNG</button>${s.view === 'tree' ? `<button class="btn small" data-act="latex">LaTeX</button>
        <button class="btn small" data-act="print">Print</button>` : ''}
        <span class="spacer"></span>
        <button class="btn small" data-act="report" title="Email this sentence and its tree to the course team">Report this sentence</button>
      </div></section>`;
  }

  function render() {
    if (!host || !host.isConnected) return;
    const view = shown();
    const canvas = host.querySelector('#canvas');
    const scroll = canvas ? [canvas.scrollLeft, canvas.scrollTop] : [0, 0];
    const bracketsOpen = !!host.querySelector('#bracket-box[open]');
    host.classList.toggle('presenting', s.presenting);
    host.innerHTML = `
      <section class="card compose">
        <label class="grow">Hindi sentence
          <input id="sentence" class="sentence" lang="hi" maxlength="600" value="${esc(s.text)}" placeholder="राम ने सीता को किताब दी" autocomplete="off" spellcheck="false"></label>
        <div class="grow translation"><label for="english">English translation (optional)</label>
          <div class="with-button"><input id="english" maxlength="600" value="${esc(s.english)}" placeholder="Ram gave Sita a book" autocomplete="off">
          <button class="btn" data-act="convert" ${navigator.onLine && !s.converting ? '' : 'disabled'}
            title="${navigator.onLine ? 'Translate with the MyMemory online service' : 'Needs an internet connection'}">${s.converting ? 'Converting…' : 'Convert'}</button></div>
          ${navigator.onLine ? '' : '<span class="hint">Convert needs an internet connection.</span>'}</div>
        <div class="row">
          <button class="btn primary" data-act="analyse">Analyse</button>
          <label class="inline">Method <select id="method">${[
            ['thomas', 'Method 1: Thomas, adapted to Hindi'], ['method2', 'Method 2: Toy Fragment by Tripathi et al.'],
            ['custom', 'Method 3: My Grammar'], ['xbar', 'Method 4: X-Bar Theory'],
          ].map(([id, name]) => `<option value="${id}" ${id === s.method ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
          ${s.method === 'thomas' ? `<label class="inline">Detail as in chapter <select id="level">${LEVELS.map((name, i) =>
            `<option value="${i + 1}" ${i + 1 === s.level ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>` : ''}
        </div>
      </section>
      ${messages()}
      <div class="workbench ${view ? '' : 'single'}">${stage(view)}${inspector(view)}</div>
      ${wordsPanel()}
      <datalist id="labels">${LABELS.map((l) => `<option value="${esc(l)}"></option>`).join('')}</datalist>`;
    if (bracketsOpen && host.querySelector('#bracket-box')) host.querySelector('#bracket-box').open = true;
    paint(view);
    const fresh = host.querySelector('#canvas');
    if (fresh) [fresh.scrollLeft, fresh.scrollTop] = scroll;
  }

  function picture(view, interactive) {
    if (s.view === 'karaka') {
      const a = karakaAnalysis();
      if (a) return HT.karaka.draw(a, { gloss: s.opts.gloss, caption: s.opts.english && s.english ? `‘${s.english}’` : '' });
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="60"><text x="20" y="36" font-family="sans-serif" font-size="15" fill="#6b687c">Method 1 found no analysis, so there are no kāraka relations.</text></svg>';
      return { svg, width: 520, height: 60 };
    }
    return HT.render.draw(view, {
      ...s.opts,
      english: s.opts.english ? s.english : '',
      step: interactive ? s.step : Infinity,
      direction: s.direction,
      selected: interactive && !s.presenting ? s.selected : [],
      interactive,
    });
  }

  function paint(view = shown()) {
    const canvas = host && host.querySelector('#canvas');
    if (!canvas || !view) return;
    const out = picture(view, true);
    canvas.innerHTML = out.svg;
    const svg = canvas.firstElementChild;
    let k = s.zoom;
    if (!k) {
      k = (canvas.clientWidth - 4) / out.width;
      if (s.presenting) k = Math.min(k, (canvas.clientHeight - 4) / out.height, 2.2);
      else k = Math.min(1, Math.max(0.35, k));
    }
    svg.setAttribute('width', Math.round(out.width * k));
    svg.setAttribute('height', Math.round(out.height * k));
    canvas.dataset.scale = k;
  }

  // Actions
  function reveal(d) {
    const view = shown();
    if (!view || s.view === 'karaka') return;
    const max = HT.render.steps(view);
    if (d === 0) s.step = 1;
    else s.step = Math.max(0, Math.min(max, (Number.isFinite(s.step) ? s.step : max) + d));
    if (s.step >= max) s.step = Infinity;
    paint(view);
  }

  function setPresenting(on) {
    s.presenting = on;
    s.zoom = 0;
    host.classList.toggle('presenting', on);
    if (on && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { /* the overlay still works without it */ });
    } else if (!on && document.fullscreenElement) document.exitFullscreen();
    requestAnimationFrame(() => paint());
  }

  async function exportImage(type) {
    const out = picture(shown(), false);
    if (type === 'svg') return download('hindi-tree.svg', new Blob([out.svg], { type: 'image/svg+xml' }));
    try {
      return download(`hindi-tree.${type === 'png' ? 'png' : 'jpg'}`, await HT.render.raster(out, `image/${type}`));
    } catch (error) {
      return toast(error.message);
    }
  }

  /*
   * Online translation with MyMemory (no key needed). There is deliberately
   * no offline fallback. pair is 'en|hi' or 'hi|en'.
   */
  async function translateOnline(text, pair) {
    if (!navigator.onLine) throw new Error('Translation needs an internet connection.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const url = `https://api.mymemory.translated.net/get?langpair=${encodeURIComponent(pair)}&q=${encodeURIComponent(text.slice(0, 450))}`;
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      const data = await response.json();
      if (data.quotaFinished || Number(data.responseStatus) === 429) throw new Error('The free translation limit for today has been reached.');
      // MyMemory mixes machine translation with crowd-sourced memory, whose best
      // match may be a different sentence (for example with "not" added). Use
      // the machine translation, or a memory entry for exactly this sentence.
      const plain = (x) => String(x || '').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
      const matches = Array.isArray(data.matches) ? data.matches : [];
      const chosen = matches.find((m) => m['created-by'] === 'MT!') || matches.find((m) => plain(m.segment) === plain(text))
        || (matches.length ? null : data.responseData);
      // The service returns HTML entities in some answers.
      const area = document.createElement('textarea');
      area.innerHTML = String((chosen && (chosen.translation || chosen.translatedText)) || '');
      const out = area.value.replace(/\s+/g, ' ').trim();
      const script = pair.endsWith('hi') ? /[\u0900-\u097f]/ : /[A-Za-z]/;
      if (Number(data.responseStatus) !== 200 || !script.test(out)) throw new Error('No translation came back.');
      return out;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The translation service did not answer. Try again.');
      if (error instanceof TypeError) throw new Error('Could not reach the translation service. Check the internet connection.');
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /** English to Hindi, then analyse the Hindi. */
  async function convert() {
    const english = s.english.trim();
    if (!english) return toast('Write an English sentence first.');
    if (s.converting) return undefined;
    s.converting = true;
    render();
    try {
      const hindi = await translateOnline(english, 'en|hi');
      if (s.method !== 'thomas') setMethod('thomas');
      Object.assign(s, { text: hindi, englishFresh: true });
      analyse();
      s.note = 'Translated online by the MyMemory service. Machine translation can be wrong: check the Hindi before you use it.';
    } catch (error) {
      toast(`${error.message} Please type the Hindi yourself.`);
    } finally {
      s.converting = false;
      render();
    }
    return undefined;
  }

  /** The Translation option: fetch an English translation of the current sentence when there is none. */
  async function fetchEnglish() {
    const hindi = s.text.trim();
    if (!hindi) {
      s.opts.english = false;
      render();
      return;
    }
    s.converting = true;
    render();
    try {
      const english = await translateOnline(hindi, 'hi|en');
      Object.assign(s, { english, englishFor: hindi });
      s.note = 'English translation by the MyMemory service. Machine translation can be wrong: correct it in the English box if needed.';
    } catch (error) {
      s.opts.english = false;
      toast(`${error.message} You can type the English yourself.`);
    } finally {
      s.converting = false;
      render();
    }
  }

  const actions = {
    convert() { convert(); return false; },
    analyse,
    hand: drawByHand,
    parse() { remember(); s.word = null; parse(); },
    chunks() {
      remember();
      Object.assign(s, { tree: { l: 'S', c: s.chunks }, trees: [], error: '', selected: [] });
    },
    word(el) { s.word = s.word === Number(el.dataset.i) ? null : Number(el.dataset.i); },
    tag(el, event) {
      const token = s.tokens[s.word];
      const { tag } = el.dataset;
      if (event.ctrlKey || event.metaKey) {
        token.tags = token.tags.includes(tag) ? token.tags.filter((t) => t !== tag) : [...token.tags, tag];
      } else {
        token.tags = [tag];
        // With every word annotated there is nothing to wait for.
        if (s.tokens.every((t) => t.tags.length)) {
          remember();
          parse();
        }
      }
    },
    merge() {
      const next = s.tokens[s.word + 1];
      if (!next) return toast('There is no next word.');
      s.tokens[s.word].w += ` ${next.w}`;
      s.tokens.splice(s.word + 1, 1);
      return undefined;
    },
    split() {
      const token = s.tokens[s.word];
      s.tokens.splice(s.word, 1, ...token.w.split(' ').map((w) => ({ w, g: '', tags: HT.lexicon.word(w).map((e) => e.tag) })));
    },
    drop() {
      s.tokens.splice(s.word, 1);
      s.word = null;
    },
    undo: () => restore(s.undo, s.redo),
    redo: () => restore(s.redo, s.undo),
    prev: () => reading(-1),
    next: () => reading(1),
    back() { reveal(-1); return false; },
    forward() { reveal(1); return false; },
    build() { reveal(0); return false; },
    in: () => zoom(1.2),
    out: () => zoom(1 / 1.2),
    fit() { s.zoom = 0; paint(); return false; },
    several() { s.several = !s.several; },
    clear() { s.selected = []; },
    present() { s.selected = []; setPresenting(true); return false; },
    exit() { setPresenting(false); return false; },
    png() { exportImage('png'); return false; },
    latex() { showText('LaTeX (forest package)', T.toForest(shown())); return false; },
    viewTree() { s.view = 'tree'; store.set('view', 'tree'); s.zoom = 0; },
    viewKaraka() { s.view = 'karaka'; store.set('view', 'karaka'); Object.assign(s, { zoom: 0, selected: [], step: Infinity }); },
    karakaReset() { s.karakaFix = {}; },
    dismiss(el) {
      if (el.dataset.kind === 'note') s.note = '';
      else if (el.dataset.kind === 'error') s.error = '';
      else s.warnings = s.warnings.filter((_, i) => i !== Number(el.dataset.i));
    },
    print() { HT.pages.print([{ tree: shown(), text: s.text, english: s.english, opts: s.opts }]); return false; },
    report() {
      // Opens the user's own email program; nothing is sent automatically.
      const view = shown();
      const method = { thomas: 'Method 1', method2: 'Method 2', custom: 'Method 3', xbar: 'Method 4' }[s.method] || s.method;
      const body = [`Sentence: ${s.text}`, s.english ? `English: ${s.english}` : '', `Method: ${method}`,
        view ? `Tree: ${T.toBracket(view)}` : `Problem: ${s.error || 'no tree'}`, '', 'What looks wrong:', ''].filter((x, i) => x || i > 3).join('\n');
      const address = 'vivek.tripathi@ashoka.edu.in';
      const subject = `HindiTree: ${s.text.slice(0, 60)}`;
      const href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
      // A visible link and copyable text, so it also works without an email program (e.g. with webmail).
      const dialog = document.getElementById('dialog');
      dialog.innerHTML = `<h2>Report this sentence</h2>
        <p>Send it to <a href="mailto:${address}">${address}</a>. Write what looks wrong at the end.</p>
        <textarea readonly rows="9" aria-label="Message">${esc(body)}</textarea>
        <div class="row end"><button class="btn" data-close>Close</button><button class="btn" data-copy>Copy message</button>
          <a class="btn primary" href="${esc(href)}">Open in my email program</a></div>`;
      dialog.querySelector('[data-close]').onclick = () => dialog.close();
      dialog.querySelector('[data-copy]').onclick = async () => {
        const text = `To: ${address}
Subject: ${subject}

${body}`;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          dialog.querySelector('textarea').select();
          document.execCommand('copy');
        }
        toast(`Copied. Paste it into an email to ${address}.`);
      };
      dialog.showModal();
      return false;
    },
    brackets() {
      try {
        const tree = T.fromBracket(host.querySelector('#brackets').value);
        remember();
        Object.assign(s, { tree, selected: [], step: Infinity });
        s.opts.triangles = false;
      } catch (error) {
        toast(error.message);
        return false;
      }
      return undefined;
    },
    check() {
      const { trees, index } = HT.lessons.solve(s.exercise);
      s.feedback = T.compare(shown(), T.present(trees[index], s.exercise.chapter));
    },
    answer() { loadExample(s.exercise); },
  };

  function reading(d) {
    remember();
    s.index = (s.index + d + s.trees.length) % s.trees.length;
    Object.assign(s, { tree: s.trees[s.index], selected: [], step: Infinity });
  }

  function zoom(factor) {
    const canvas = host.querySelector('#canvas');
    s.zoom = Math.min(3, Math.max(0.25, Number(canvas.dataset.scale) * factor));
    paint();
    return false;
  }

  function select(el, event) {
    const path = el.dataset.path ? el.dataset.path.split('-').map(Number) : [];
    if (s.presenting) return;
    const same = (p) => p.join('-') === path.join('-');
    if (event.shiftKey || event.ctrlKey || event.metaKey || s.several) {
      s.selected = s.selected.some(same) ? s.selected.filter((p) => !same(p)) : [...s.selected, path];
    } else s.selected = s.selected.length === 1 && same(s.selected[0]) ? [] : [path];
    render();
  }

  function onClick(event) {
    const node = event.target.closest('[data-path]');
    if (node) return select(node, event);
    if (event.target.closest('#canvas') && s.selected.length && !s.several) {
      s.selected = [];
      return render();
    }
    const el = event.target.closest('[data-act], [data-edit]');
    if (!el) return undefined;
    if (el.dataset.edit) return edit(edits[el.dataset.edit]);
    if (actions[el.dataset.act](el, event) !== false) render();
    return undefined;
  }

  function onInput(event) {
    const { id, value } = event.target;
    if (id === 'sentence') s.text = value;
    else if (id === 'english') {
      s.english = value;
      s.englishFresh = true;
      if (s.opts.english) paint();
    } else if (id === 'token-gloss' && s.tokens[s.word]) s.tokens[s.word].g = value;
  }

  function onChange(event) {
    const el = event.target;
    if (el.dataset.opt === 'english' && el.checked && !s.english.trim()) {
      s.opts.english = true;
      fetchEnglish();
    } else if (el.dataset.opt) {
      s.opts[el.dataset.opt] = el.checked;
      store.set('options', { ...s.opts, triangles: false, blank: false, english: false });
      render();
    } else if (el.id === 'method') {
      setMethod(el.value);
      render();
    } else if (el.id === 'level') {
      remember();
      Object.assign(s, { level: Number(el.value), selected: [], step: Infinity });
      s.opts.triangles = false;
      render();
    } else if (el.dataset.karaka !== undefined) {
      s.karakaFix[el.dataset.karaka] = el.value;
      render();
    } else if (el.id === 'direction') {
      s.direction = el.value;
      reveal(0);
    } else if (el.id === 'abstract' && el.value) {
      s.tokens.splice(s.word + 1, 0, HT.tagger.abstract(el.value));
      render();
    }
  }

  function onKey(event) {
    if (!host || !host.isConnected) return;
    const el = event.target;
    if (el.id === 'english' && event.key === 'Enter' && !event.isComposing) {
      convert();
      return;
    }
    if (el.id === 'sentence' && event.key === 'Enter' && !event.isComposing) {
      analyse();
      render();
      return;
    }
    if (el.matches('input, textarea, select')) return;
    if (el.dataset && el.dataset.path !== undefined && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      select(el, event);
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (mod && key === 'z' && !event.shiftKey) {
      event.preventDefault();
      restore(s.undo, s.redo);
    } else if (mod && (key === 'y' || (key === 'z' && event.shiftKey))) {
      event.preventDefault();
      restore(s.redo, s.undo);
    } else if (s.presenting) {
      if (event.key === 'Escape') setPresenting(false);
      else if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault();
        reveal(1);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        reveal(-1);
      } else if (event.key === 'Home') reveal(0);
    } else if (event.key === 'Escape' && s.selected.length) {
      s.selected = [];
      render();
    }
  }

  function mount(el) {
    host = el;
    el.addEventListener('click', onClick);
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);
    if (!s.text && !s.tree) {
      s.text = isLegacy() ? HT.legacy.methods[s.method].example.text : 'राम ने सीता को किताब दी';
      if (s.method === 'thomas') Object.assign(s, { english: 'Ram gave Sita a book', englishFor: s.text });
      tokenize();
      parse();
    }
    render();
  }

  function init() {
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && s.presenting) setPresenting(false);
      else requestAnimationFrame(() => paint());
    });
    window.addEventListener('resize', () => { if (host && host.isConnected) paint(); });
    // Convert is only available online.
    for (const type of ['online', 'offline']) window.addEventListener(type, () => { if (host && host.isConnected) render(); });
  }

  HT.studio = { FUNCTIONS, init, mount, loadExample, loadExercise, loadSaved, loadSentence, predict, treeFor, treesFor, setMethod, state: s };
})(globalThis.HT = globalThis.HT || {});
