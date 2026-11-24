/*
 * Kāraka view: Pāṇinian dependency relations between the verb and its
 * participants, derived from a Method 1 tree and drawn as arcs.
 *
 * Words are grouped into chunks (a noun with its case marker or
 * postposition, a verb with its auxiliaries), as in the Hindi Dependency
 * Treebank. Labels follow that treebank's kāraka tags. Kāraka roles depend
 * on meaning, so the labels here are proposals; a guessed label is marked
 * with an alternative so the user can change it.
 */
(function (HT) {
  'use strict';
  const T = HT.tree;
  const { esc } = HT.util;

  const LABELS = {
    k1: ['kartā', 'कर्ता', 'doer of the action'],
    k2: ['karma', 'कर्म', 'what the action affects'],
    k3: ['karaṇa', 'करण', 'instrument'],
    k4: ['sampradāna', 'संप्रदान', 'recipient'],
    k4a: ['anubhava-kartā', 'अनुभव कर्ता', 'experiencer (dative subject)'],
    k5: ['apādāna', 'अपादान', 'source, or cause of fear'],
    k7p: ['adhikaraṇa (deśa)', 'अधिकरण (स्थान)', 'place'],
    k7t: ['adhikaraṇa (kāla)', 'अधिकरण (काल)', 'time'],
    k2p: ['goal', 'गंतव्य', 'place moved to'],
    k1s: ['kartā-samānādhikaraṇa', 'कर्ता समानाधिकरण', 'complement of the subject'],
    k2s: ['karma-samānādhikaraṇa', 'कर्म समानाधिकरण', 'complement of the object'],
    r6: ['ṣaṣṭhī (sambandha)', 'संबंध', 'possessor (genitive)'],
    rt: ['tādarthya', 'तादर्थ्य', 'purpose, beneficiary'],
    adv: ['kriyāviśeṣaṇa', 'क्रियाविशेषण', 'manner adverb'],
    vmod: ['other verb modifier', 'अन्य', 'modifier of the verb not covered above'],
    ccof: ['conjunct of', 'समुच्चय', 'joined by a coordinator'],
  };
  const COLOURS = {
    k1: '#4c1d95', k4a: '#4c1d95', k2: '#1553a1', k3: '#0f6560', k5: '#0f6560', k4: '#2c6b2f',
    k7p: '#9a4a0b', k7t: '#9a4a0b', k2p: '#9a4a0b', k1s: '#86358a', k2s: '#86358a', r6: '#6b687c', rt: '#2c6b2f',
  };
  const TIME = new Set('आज कल परसों अब अभी तब फिर सुबह शाम रात दिन दोपहर समय साल सोमवार रविवार हमेशा रोज़ अक्सर देर'.split(' '));
  const MOTION = new Set('आ जा निकल भाग लौट गिर उतर पहुँच दौड़'.split(' '));
  const DATIVE = /^(मुझे|हमें|तुम्हें|तुझे|उसे|इसे|उन्हें|इन्हें|किसे)$/;

  const words = (n) => T.leaves(n).filter((l) => !l.abs);
  const find = (n, test) => {
    if (T.isLeaf(n)) return null;
    if (test(n)) return n;
    for (const c of n.c) {
      if (c.l === 'S2') continue;
      const hit = find(c, test);
      if (hit) return hit;
    }
    return null;
  };

  /** The kāraka label proposed for one constituent, with an alternative where it is a guess. */
  function label(unit, ctx) {
    const { node, fn } = unit;
    const text = T.text(node);
    const last = words(node).slice(-1)[0];
    const marker = last ? last.w : '';
    const head = (find(node, (n) => n.l === 'N' || n.l === 'PRO') || { c: [{ w: '' }] }).c[0].w;
    if (fn === 'S') {
      if (ctx.passive) return { label: 'k2', why: 'subject of a passive verb' };
      if (marker === 'को' || DATIVE.test(text)) return { label: 'k4a', alt: 'k1', why: 'को-marked subject' };
      return { label: 'k1' };
    }
    if (fn === 'dO') return { label: 'k2' };
    if (fn === 'iO') return { label: 'k4' };
    // A place phrase after a copula or रखना is a location, not a complement.
    const place = node.l === 'PP' && /^(में|पर|के अंदर|के भीतर|के ऊपर|के नीचे|के पास|के पीछे|के सामने|के बाहर)$/.test((find(node, (n) => n.l === 'P') || { c: [{ w: '' }] }).c[0].w);
    if (place && (fn === 'sC' || fn === 'oC')) return TIME.has(head) ? { label: 'k7t' } : { label: 'k7p' };
    if (fn === 'sC') return { label: 'k1s' };
    if (fn === 'oC') return { label: 'k2s' };
    if (node.l === 'S2' || node.l === 'S') return { label: 'vmod' };
    if (node.l === 'AdvP') return TIME.has(T.text(node).split(' ').slice(-1)[0]) ? { label: 'k7t' } : { label: 'adv' };
    if (node.l === 'NP') {
      if (TIME.has(head)) return { label: 'k7t' };
      if (MOTION.has(ctx.stem)) return { label: 'k2p' };
      return { label: 'vmod' };
    }
    // Postpositional phrases: the postposition decides.
    const p = (find(node, (n) => n.l === 'P') || { c: [{ w: marker }] }).c[0].w;
    if (/द्वारा/.test(p) || (p === 'से' && ctx.passive)) return { label: 'k1', why: 'agent of a passive verb' };
    if (p === 'से') {
      if (fn === 'pO' || MOTION.has(ctx.stem)) return { label: 'k5', alt: 'k3' };
      return { label: 'k3', alt: 'k5' };
    }
    if (/लिए/.test(p)) return { label: 'rt' };
    if (/^(में|पर|तक|के अंदर|के भीतर|के ऊपर|के नीचे|के पास|के पीछे|के सामने|के बाहर|के किनारे|के बीच|की ओर|की तरफ़)$/.test(p)) {
      return TIME.has(head) ? { label: 'k7t' } : { label: 'k7p' };
    }
    if (fn === 'pO') return { label: 'k2', alt: 'k5' };
    return { label: 'vmod' };
  }

  /*
   * From a Method 1 tree to chunks and arcs.
   * Returns {words, chunks: [{start, end, text}], arcs: [{head, dep, label, alt}], verbs: [chunk index]}
   * or null when the tree has no verb.
   */
  function analyse(tree, fixes = {}) {
    if (!tree) return null;
    const all = words(tree);
    const index = new Map(all.map((w, i) => [w, i]));
    const span = (n) => {
      const ws = words(n).map((w) => index.get(w)).filter((i) => i !== undefined);
      return ws.length ? [Math.min(...ws), Math.max(...ws)] : null;
    };
    const chunks = [];
    const arcs = [];
    const verbs = [];
    const chunkAt = (start, end) => {
      let i = chunks.findIndex((c) => c.start === start && c.end === end);
      if (i < 0) {
        chunks.push({ start, end });
        i = chunks.length - 1;
      }
      return i;
    };

    // Coordinated clauses are analysed one by one and joined by the coordinator.
    const clauses = [];
    const coords = [];
    (function split(n) {
      const inner = n.c.filter((c) => !T.isLeaf(c));
      if (inner.length > 1 && inner.some((c) => c.l === 'coord') && inner.every((c) => /^(S1?|coord)$/.test(c.l))) {
        inner.forEach((c) => (c.l === 'coord' ? coords.push(c) : split(c)));
      } else clauses.push(n);
    })(tree);

    for (const clause of clauses) {
      const units = T.functions(clause);
      const verbUnit = units.find((u) => u.fn === 'P');
      if (!verbUnit) continue;
      const vs = span(verbUnit.node);
      if (!vs) continue;
      const verb = chunkAt(vs[0], vs[1]);
      verbs.push(verb);
      const vgp = verbUnit.node;
      const ctx = {
        passive: !!find(vgp, (n) => n.l === 'PASS'),
        stem: (HT.lexicon.verb((find(vgp, (n) => n.l === 'V') || { c: [{ w: '' }] }).c[0].w)[0] || {}).stem || '',
      };
      for (const unit of units) {
        if (unit === verbUnit) continue;
        const s = span(unit.node);
        if (!s) continue;
        // A genitive inside the phrase is its own chunk, linked by r6.
        const poss = unit.node.l !== 'S2' ? find(unit.node, (n) => n.l === 'POSS') : null;
        const ps = poss && span(poss);
        let dep;
        if (ps && ps[0] === s[0] && ps[1] < s[1]) {
          dep = chunkAt(ps[1] + 1, s[1]);
          arcs.push({ head: dep, dep: chunkAt(ps[0], ps[1]), label: 'r6' });
        } else dep = chunkAt(s[0], s[1]);
        arcs.push({ head: verb, dep, ...label(unit, ctx) });
      }
    }
    for (const c of coords) {
      const s = span(c);
      if (!s) continue;
      const co = chunkAt(s[0], s[1]);
      verbs.forEach((v) => arcs.push({ head: co, dep: v, label: 'ccof' }));
    }
    if (!verbs.length) return null;

    // Remaining words (subordinators, particles) become chunks without relations.
    const covered = new Set(chunks.flatMap((c) => Array.from({ length: c.end - c.start + 1 }, (_, k) => c.start + k)));
    for (let i = 0; i < all.length; i++) {
      if (covered.has(i)) continue;
      let j = i;
      while (j + 1 < all.length && !covered.has(j + 1)) j++;
      chunkAt(i, j);
      i = j;
    }
    // Number chunks in word order.
    const order = chunks.map((c, i) => i).sort((a, b) => chunks[a].start - chunks[b].start);
    const renumber = new Map(order.map((old, i) => [old, i]));
    const sorted = order.map((i) => ({ ...chunks[i], text: all.slice(chunks[i].start, chunks[i].end + 1).map((w) => w.w).join(' ') }));
    const out = {
      words: all,
      chunks: sorted,
      verbs: verbs.map((v) => renumber.get(v)),
      arcs: arcs.map((a) => ({ ...a, head: renumber.get(a.head), dep: renumber.get(a.dep) })),
    };
    for (const a of out.arcs) {
      const fix = fixes[out.chunks[a.dep].text];
      if (fix && LABELS[fix]) {
        a.alt = a.label === fix ? a.alt : a.label;
        a.label = fix;
        a.fixed = true;
      }
    }
    return out;
  }

  /** Order of the verb's dependents, for example "k1 · k4 · k2 · V". */
  function pattern(a) {
    if (!a) return '';
    const verb = a.verbs[0];
    return a.chunks.map((c, i) => {
      if (i === verb) return 'V';
      const arc = a.arcs.find((x) => x.dep === i && x.head === verb);
      return arc ? arc.label : null;
    }).filter(Boolean).join(' · ');
  }

  // Drawing
  let ruler = null;
  const measure = (text, size, family) => {
    ruler = ruler || document.createElement('canvas').getContext('2d');
    ruler.font = `${size}px ${family}`;
    return ruler.measureText(text).width;
  };
  const SANS = "'Noto Sans Devanagari', 'Nirmala UI', 'Kohinoor Devanagari', sans-serif";
  const SERIF = "Georgia, 'Noto Serif Devanagari', serif";

  function draw(a, opts = {}) {
    const PAD = 24;
    const GAP = 16;
    const LEVEL = 30;
    const gloss = !!opts.gloss;
    // Chunk widths
    let x = PAD;
    const boxes = a.chunks.map((c, i) => {
      const ws = a.words.slice(c.start, c.end + 1);
      const text = ws.map((w) => w.w).join(' ');
      const g = ws.map((w) => w.g).filter(Boolean).join(' ');
      const w = Math.max(measure(text, 20, SANS), gloss ? measure(g, 12, SANS) : 0) + 20;
      const box = { i, x, w, text, g, cx: x + w / 2, changed: opts.changed && opts.changed.has(text) };
      x += w + GAP;
      return box;
    });
    // Arc heights: an arc sits above every arc inside its span.
    const arcs = a.arcs.map((arc) => ({ ...arc, lo: Math.min(arc.head, arc.dep), hi: Math.max(arc.head, arc.dep) }))
      .sort((p, q) => (p.hi - p.lo) - (q.hi - q.lo));
    for (const arc of arcs) {
      arc.level = 1 + Math.max(0, ...arcs.filter((o) => o !== arc && o.level && o.lo >= arc.lo && o.hi <= arc.hi).map((o) => o.level));
    }
    const top = 16 + LEVEL * Math.max(1, ...arcs.map((r) => r.level || 1));
    const boxTop = top + 24;
    const width = Math.ceil(x - GAP + PAD);
    const height = boxTop + 44 + (gloss ? 18 : 0) + (opts.caption ? 26 : 0);
    const parts = [];
    for (const b of boxes) {
      const verb = a.verbs.includes(b.i);
      parts.push(`<rect x="${b.x}" y="${boxTop}" width="${b.w}" height="36" rx="8" fill="${verb ? '#fde8ec' : '#f4f2fa'}" stroke="${b.changed ? '#d99a16' : verb ? '#a3243b' : '#d8d4e6'}" stroke-width="${b.changed ? 2.5 : 1}"/>`);
      parts.push(`<text x="${b.cx}" y="${boxTop + 24}" text-anchor="middle" font-family="${SANS}" font-size="20" fill="#111">${esc(b.text)}</text>`);
      if (gloss && b.g) parts.push(`<text x="${b.cx}" y="${boxTop + 54}" text-anchor="middle" font-family="${SANS}" font-size="12" fill="#6b687c">${esc(b.g)}</text>`);
    }
    for (const arc of arcs) {
      const from = boxes[arc.head];
      const to = boxes[arc.dep];
      const y = boxTop - 2;
      const peak = boxTop - 8 - LEVEL * arc.level;
      const fx = from.cx + (to.cx > from.cx ? 6 : -6);
      const colour = COLOURS[arc.label] || '#55516b';
      parts.push(`<path d="M${fx} ${y} C ${fx} ${peak}, ${to.cx} ${peak}, ${to.cx} ${y - 6}" fill="none" stroke="${colour}" stroke-width="1.6"${arc.alt && !arc.fixed ? ' stroke-dasharray="5 3"' : ''}/>`);
      parts.push(`<path d="M${to.cx - 4} ${y - 9} L${to.cx} ${y - 1} L${to.cx + 4} ${y - 9}" fill="none" stroke="${colour}" stroke-width="1.6"/>`);
      const lx = (fx + to.cx) / 2;
      const ly = peak + LEVEL * 0.25;
      const text = arc.label + (arc.alt && !arc.fixed ? '?' : '');
      const lw = measure(text, 13, SERIF) + 10;
      parts.push(`<rect x="${lx - lw / 2}" y="${ly - 12}" width="${lw}" height="17" rx="4" fill="#fff"/>`);
      parts.push(`<text x="${lx}" y="${ly + 1}" text-anchor="middle" font-family="${SERIF}" font-size="13" font-weight="700" fill="${colour}"><title>${esc(`${arc.label}: ${(LABELS[arc.label] || [arc.label])[0]}${arc.alt && !arc.fixed ? `, or ${arc.alt}` : ''}`)}</title>${esc(text)}</text>`);
    }
    if (opts.caption) parts.push(`<text x="${PAD}" y="${height - 8}" font-family="${SERIF}" font-size="14" fill="#6b687c">${esc(opts.caption)}</text>`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(`Kāraka relations: ${a.chunks.map((c) => c.text).join(' ')}`)}">${parts.join('')}</svg>`;
    return { svg, width, height };
  }

  HT.karaka = { LABELS, analyse, pattern, draw };
})(globalThis.HT = globalThis.HT || {});
