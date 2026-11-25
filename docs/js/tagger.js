/*
 * Splits a sentence and proposes categories for each word.
 *
 * A token is {w, g, tags, abs}. `tags` is ordered by preference and can always
 * be overridden in the interface. `abs` marks an unpronounced element such as
 * Thomas's (pres) and (past).
 */
(function (HT) {
  'use strict';
  const L = HT.lexicon;

  const ABSTRACT = { pres: 'TENSE', past: 'TENSE', fut: 'TENSE', perf: 'PERF', hab: 'HAB' };
  const AUX = ['TENSE', 'MOD', 'PERF', 'PROG', 'HAB', 'PASS', 'VEC'];
  const VECTORS = ['जा', 'ले', 'दे', 'डाल', 'पड़', 'बैठ', 'उठ'].map(L.key);
  // Light verbs that are intransitive: with them the subject takes no ने.
  const INTRANSITIVE_VECTORS = ['जा', 'पड़', 'बैठ', 'उठ'].map(L.key);
  const isAux = (tag) => AUX.includes(tag);
  const isVerbal = (tag) => !!tag && (tag.startsWith('V.') || isAux(tag));

  const abstract = (name) => ({ w: `(${name})`, g: '', tags: [ABSTRACT[name] || 'TENSE'], abs: true });

  function split(text) {
    const raw = text.normalize('NFC').replace(/[।॥,!?;:"“”‘’'.​]/g, ' ').trim().split(/\s+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < raw.length;) {
      let n = Math.min(L.longest, raw.length - i);
      while (n > 1 && !L.word(raw.slice(i, i + n).join(' ')).length) n--;
      if (n === 1 && i + 1 < raw.length) {
        const kinds = L.verb(raw[i]).map((v) => v.kind);
        const next = raw[i + 1];
        // "दौड़ते हुए" and "खा कर" are single non-finite verb forms.
        if (/^हु(आ|ई|ए)$/.test(next) && (kinds.includes('hab') || kinds.includes('perf'))) n = 2;
        if ((next === 'कर' || next === 'के') && kinds.includes('stem') && !L.word(raw[i]).length) {
          const after = raw[i + 2];
          if (after && !/^(रह|सक|चुक)/.test(after)) n = 2;
        }
      }
      out.push(raw.slice(i, i + n).join(' '));
      i += n;
    }
    return out;
  }

  // Does this word continue a verb group after a verb stem?
  function continuesVerb(word) {
    if (!word) return false;
    return /^(रहा|रही|रहे|सक|चुक)/.test(word) ||
      L.verb(word).some((v) => VECTORS.includes(L.key(v.stem)) && v.kind !== 'stem' && v.kind !== 'inf');
  }

  function guessVerb(word, next, last) {
    const all = ['trans', 'intrans', 'ditrans', 'intens', 'complex', 'prep'];
    let kind = null;
    if (next && L.copula(next) && /(ता|ती|ते|तीं)$/.test(word)) kind = 'hab';
    else if (next && L.copula(next) && /(या|यी|ई|ए)$/.test(word)) kind = 'perf';
    else if (next && /^(रहा|रही|रहे|सक|चुक)/.test(next)) kind = 'stem';
    else if (last && /(ेगा|ेगी|ेंगे|ेंगी|एगा|एगी)$/.test(word)) kind = 'fut';
    else if (last && /(ा|ी|े|ई|ए|ीं)$/.test(word)) kind = 'perf';
    return kind ? [{ kind, classes: all, gloss: '', stem: '' }] : [];
  }

  function tag(text) {
    const words = split(text);
    const info = [];

    words.forEach((w, i) => {
      const prev = info[i - 1];
      const beforeNeg = prev && prev.tags[0] === 'NEG' ? info[i - 2] : prev;
      const head = beforeNeg && isVerbal(beforeNeg.tags[0]) ? beforeNeg : null;
      const next = words[i + 1];
      const nextReal = next && L.word(next).some((e) => e.tag === 'NEG') ? words[i + 2] : next;
      const last = i === words.length - 1 || /^(coord|sub)/.test((L.word(next)[0] || { tag: '' }).tag);

      const lex = L.word(w);
      let vs = L.verb(w);
      const token = { w, g: lex[0] ? lex[0].gloss : '', tags: [], kind: null };
      // A word listed under two categories with different glosses (वह: that / he)
      // keeps a gloss for each, so the tree shows the one for the chosen category.
      if (lex.length > 1 && lex.some((e) => e.gloss !== lex[0].gloss)) token.gt = Object.fromEntries(lex.map((e) => [e.tag, e.gloss]));
      info.push(token);
      const set = (tags, gloss, kind) => Object.assign(token, { tags, g: gloss, kind: kind || null });

      if (w.includes(' ') && !lex.length) {
        const [first, second] = w.split(' ');
        const f = L.verb(first)[0];
        const suffix = second === 'कर' || second === 'के' ? 'cp' : 'pt';
        return set(f.classes.map((c) => `V.${c}_${suffix}`), `${f.gloss}.${suffix === 'cp' ? 'CP' : 'PTCP'}`);
      }

      const cop = L.copula(w);
      const headKind = head && head.kind;
      if (cop) {
        const afterVerb = head && headKind !== 'cop' && (headKind || isAux(head.tags[0]));
        if (afterVerb) return set(['TENSE'], cop.toUpperCase(), 'tense');
        if (!(L.key(w) === 'हो' && continuesVerb(next))) {
          set(['V.intens', 'V.intrans'], `be.${cop.toUpperCase()}`, 'cop');
          token.tense = cop;
          return undefined;
        }
      }

      if (head) {
        const v = vs[0];
        if (headKind === 'stem' && /^रह(ा|ी|े|ीं)$/.test(w)) return set(['PROG'], 'PROG', 'prog');
        if (headKind === 'stem' && /^(सक|पा(य|ई|ए|त|ऊ|ओ|ना))/.test(w)) {
          return set(['MOD'], 'can', /(ता|ती|ते|तीं)$/.test(w) ? 'hab' : /ग(ा|ी|े)$/.test(w) ? 'fut' : 'perf');
        }
        if (headKind === 'stem' && /^चुक/.test(w)) return set(['PERF'], 'already', /ग(ा|ी|े)$/.test(w) ? 'fut' : 'perf');
        if (headKind === 'inf' && /^(चाहिए|पड़)/.test(w.normalize('NFC'))) {
          return set(['MOD'], 'must', v ? v.kind : 'modal');
        }
        if (headKind === 'perf' && head.tags[0].startsWith('V.') && head.tags[0] !== 'V.intens') {
          const go = vs.find((x) => x.stem === 'जा');
          if (go) return set(['PASS'], 'PASS', go.kind);
        }
        if (headKind === 'stem') {
          const vec = vs.find((x) => VECTORS.includes(L.key(x.stem)));
          if (vec) return set(['VEC'], `${vec.gloss}(vector)`, vec.kind);
        }
      }

      if (w === 'चाहिए') return set(['V.intens', 'MOD'], 'needed', 'modal');

      if (!lex.length && !vs.length) vs = guessVerb(w, next, last);

      const asLexical = lex.map((e) => e.tag);
      let asVerb = [];
      let kind = null;
      let gloss = '';
      const forms = vs.filter((v) => v.kind !== 'stem' || last || continuesVerb(next));
      if (forms.length) {
        // A word can be an inflected form of two verbs, or two forms of one verb.
        // Before पड़ना or चाहिए an infinitive means obligation: मुझे जाना पड़ा.
        const modalNext = nextReal && /^(चाहिए|पड़)/.test(nextReal) && forms.some((f) => f.kind === 'inf');
        const order = modalNext ? ['inf', 'stem', 'perf', 'hab', 'fut', 'imp', 'subj', 'cp']
          : continuesVerb(next) ? ['stem', 'perf', 'hab', 'inf', 'fut', 'imp', 'subj', 'cp']
            : ['inf', 'perf', 'hab', 'fut', 'imp', 'cp', 'subj', 'stem'];
        forms.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
        const v = forms[0];
        ({ kind, gloss } = v);
        const finiteInf = kind === 'inf' && nextReal && /^(चाहिए|पड़|है|हैं|था|थी|होगा)/.test(nextReal);
        const suffix = kind === 'cp' ? '_cp' : kind === 'inf' && !finiteInf ? '_inf' : '';
        asVerb = [...new Set(forms.filter((f) => f.kind === kind).flatMap((f) => f.classes))]
          .map((c) => `V.${c}${suffix}`);
        const label = { hab: 'HAB', perf: 'PFV', fut: 'FUT', inf: 'INF', cp: 'CP', imp: 'IMP', subj: 'SBJV' }[kind];
        if (label) gloss += `.${label}`;
        // A participle before a noun modifies it, with or without हुआ:
        // बहता पानी is read like बहता हुआ पानी, बैठा आदमी like बैठा हुआ आदमी.
        const nounNext = next && !last && L.word(next).some((e) => e.tag === 'N') && !L.copula(next) && !continuesVerb(next);
        // Not the verb that ends a subordinate clause: जब शिक्षक आए छात्र उठे.
        const opener = info.map((x) => x.tags[0] || '').findLastIndex((t) => /^(sub|PRO\.rel|DET\.rel)/.test(t));
        const openClause = opener >= 0 && !info.slice(opener + 1).some((x) => isVerbal(x.tags[0]));
        if ((kind === 'hab' || kind === 'perf') && !suffix && nounNext && !openClause && !lex.length) {
          return set(asVerb.map((c) => `${c}_pt`), `${v.gloss}.PTCP`);
        }
      }

      // For homonyms (खाना, खेल, की), position decides which reading comes first.
      let verbFirst = asVerb.length > 0;
      if (verbFirst && asLexical.length) {
        const auxNext = continuesVerb(next) || (nextReal && /^(चाहिए|पड़)/.test(nextReal));
        const copNext = nextReal && L.copula(nextReal) && (kind === 'hab' || kind === 'perf');
        const nominalOnly = asLexical.every((t) => /^(N|A|Adv)$/.test(t));
        // Obligation: मुझे खाना खाना है (dative subject + infinitive + है)
        const dative = info.slice(0, i).some((x) => x.tags[0] === 'PRO.dat' || x.tags[0] === 'CASE.dat');
        const obligation = kind === 'inf' && dative && nextReal && L.copula(nextReal);
        verbFirst = last || auxNext || obligation || (copNext && !(nominalOnly && kind === 'perf'));
      }

      if (verbFirst) return set([...asVerb, ...asLexical], gloss, kind);
      if (asLexical.length) return set([...asLexical, ...asVerb], token.g);
      return set(asVerb.length ? [...asVerb, 'N'] : ['N', 'A', 'Adv'], gloss);
    });

    // A transitive verb whose verb group is not imperative can leave its object
    // unsaid (मैंने खा लिया, राम खाता है, मैं खाऊँ?); the extra tag V.trans_od lets
    // Method 1 draw that object as pro. With an imperative the subject is
    // the silent one instead: दरवाज़ा खोलो.
    info.forEach((t, i) => {
      if (t.tags[0] !== 'V.trans') return;
      const kinds = [t.kind];
      for (let j = i + 1; j < info.length && isAux(info[j].tags[0] || ''); j++) kinds.push(info[j].kind);
      if (!kinds.some((k) => k === 'imp')) t.tags.push('V.trans_od');
    });

    // Insert the abstract TENSE and aspect elements that the verb forms realise.
    const out = [];
    info.forEach((t, i) => {
      out.push({ w: t.w, g: t.g, ...(t.gt ? { gt: t.gt } : {}), tags: [...new Set(t.tags)] });
      const main = t.tags[0];
      if (!isVerbal(main) || /_/.test(main)) return;
      const following = info[i + 1];
      const nextTag = following && following.tags[0];
      if (nextTag === 'TENSE') {
        if (/^(V\.|PASS|VEC)/.test(main) && t.kind === 'hab') out.push(abstract('hab'));
        if (/^(V\.|PASS|VEC)/.test(main) && t.kind === 'perf') out.push(abstract('perf'));
      } else if (!nextTag || !isAux(nextTag)) {
        if (t.kind === 'cop') out.push(abstract(t.tense));
        else if (t.kind === 'fut') out.push(abstract('fut'));
        else if (t.kind === 'perf') out.push(abstract('past'));
        else if (t.kind === 'hab' && main !== 'MOD') out.push(abstract('hab'));
      }
    });
    return out;
  }

  /** Hindi-specific well-formedness checks that a context-free grammar does not capture. */
  function check(tokens) {
    const notes = [];
    const has = (t, re) => re.test(t.tags[0] || '');
    const at = tokens.findIndex((t) => has(t, /^(CASE\.erg|PRO\.erg)$/));
    if (at < 0) return notes;
    let end = tokens.findIndex((t, i) => i > at && has(t, /^(coord|sub)/));
    if (end < 0) end = tokens.length;
    const clause = tokens.slice(at + 1, end);
    const v = clause.find((t) => has(t, /^V\.[a-z]+$/));
    if (!v) return notes;
    const nonPerfective = L.verb(v.w).length > 0 && L.verb(v.w).every((f) => ['hab', 'fut', 'stem', 'imp', 'subj'].includes(f.kind));
    const hasVector = clause.some((t) => has(t, /^(VEC|PERF)$/) && !t.abs);
    // In a compound verb the light verb decides: ने only with a transitive one.
    // राम ने आम खा लिया, but राम आम खा गया (not *राम ने आम खा गया).
    const vector = clause.find((t) => has(t, /^VEC$/) && !t.abs);
    const vectorStem = vector && (L.verb(vector.w).find((f) => VECTORS.includes(L.key(f.stem))) || {}).stem;
    if (vectorStem && INTRANSITIVE_VECTORS.includes(L.key(vectorStem))) {
      notes.push(`* ने is not used when the light verb is intransitive (जाना, पड़ना, बैठना, उठना). Write राम आम खा गया, not *राम ने आम खा गया. Here the light verb is ${vectorStem}ना.`);
    } else if ((nonPerfective && !hasVector) || clause.some((t) => has(t, /^PROG$/))) {
      notes.push('* ने requires a perfective verb. With habitual, progressive and future forms the subject is unmarked: राम रोटी खाता है, not *राम ने रोटी खाता है।');
    } else if (v.tags.every((t) => t === 'V.intrans')) {
      notes.push('* ने normally needs a transitive verb. Intransitive verbs take an unmarked subject: राम सोया, not *राम ने सोया।');
    }
    return notes;
  }

  HT.tagger = { tag, split, check, abstract, ABSTRACT };
})(globalThis.HT = globalThis.HT || {});
