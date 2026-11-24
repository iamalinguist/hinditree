/*
 * Hindi Lab, Word categories tab (शब्द-भेद): how to tell the category of a
 * Hindi word, how word formation can change it, and words whose category
 * depends on context. With a sentence checker and a quiz built from the
 * course's model analyses.
 */
(function (HT) {
  'use strict';
  const { esc } = HT.util;
  const T = HT.tree;

  // Coarse categories used in the lessons and the quiz
  const CATEGORIES = [
    ['Noun', 'संज्ञा', 'Takes ने, को, से, में… after it. Changes for number and case: लड़का, लड़के, लड़कों.',
      'यह ___ अच्छा है · ___ ने / ___ को', 'लड़का, किताब, राम, पानी, सच'],
    ['Pronoun', 'सर्वनाम', 'Stands for a whole noun phrase, so it takes no adjective. Often fused with case: मैंने, मुझे, उसे.',
      '___ आया (with no noun after it)', 'मैं, तुम, वह, कौन, उसने'],
    ['Determiner', 'निर्धारक', 'Comes before a noun and limits which one is meant. यह/वह are determiners only when a noun follows.',
      '___ लड़का आया', 'यह, वह, एक, हर, मेरा, उसका'],
    ['Adjective', 'विशेषण', 'Sits between a determiner and a noun. Words in -ा agree with the noun (-ा/-े/-ी). Can follow है.',
      'यह ___ लड़का · लड़का ___ है', 'अच्छा, बड़ी, लाल, सुंदर, तीन'],
    ['Adverb', 'क्रियाविशेषण', 'Describes how, when or where. Does not agree with anything, and can often move.',
      'राम ___ चलता है', 'धीरे, आज, यहाँ, ध्यान से, शायद'],
    ['Verb', 'क्रिया', 'Carries tense or aspect endings (-ता, -या, -एगा, -ना). Usually last in its clause.',
      'राम ___ (+ है / था / रहा / सकता)', 'खाता, गया, पढ़ेगी, सोना'],
    ['Auxiliary', 'सहायक क्रिया', 'Follows a verb and adds tense, aspect, modality or voice.',
      'खा ___ · खाता ___', 'है, था, रहा, सकता, चुका, गया (passive)'],
    ['Postposition', 'परसर्ग', 'Follows a noun in its oblique form and relates it to the verb.',
      'कमरे ___ · मेज़ ___', 'में, पर, से, तक, के लिए, के पास'],
    ['Case marker', 'कारक चिह्न', 'ने, को and the genitive का/के/की mark the role or owner of a noun phrase.',
      'राम ___ खाया · राम ___ किताब', 'ने, को, का, के, की'],
    ['Conjunction', 'समुच्चयबोधक', 'Joins words or clauses (और, या, लेकिन), or introduces a clause (कि, क्योंकि, अगर, जब).',
      'राम ___ सीता · मुझे पता है ___ …', 'और, लेकिन, कि, क्योंकि'],
    ['Particle', 'निपात', 'Adds focus or turns a sentence into a question. Attaches to a phrase.',
      'राम ___ आया', 'ही, भी, तो, क्या (question)'],
    ['Negation', 'निषेध', 'Comes right before the verb.', 'राम ___ आया', 'नहीं, न, मत'],
  ];
  const coarse = (tag) => {
    const base = tag.split('.')[0];
    if (/^(N|NOUN)$/.test(base)) return 'Noun';
    if (base === 'PRO') return 'Pronoun';
    if (base === 'DET') return 'Determiner';
    if (base === 'A') return 'Adjective';
    if (/^(Adv|deg)$/.test(base)) return 'Adverb';
    if (/^(V|VERB)$/.test(base)) return 'Verb';
    if (/^(TENSE|MOD|PERF|PROG|HAB|PASS|VEC)$/.test(base)) return 'Auxiliary';
    if (base === 'P') return 'Postposition';
    if (/^(CASE|gen|GEN|POSS)$/.test(base)) return 'Case marker';
    if (/^(sub|coord)$/.test(base)) return 'Conjunction';
    if (base === 'part') return 'Particle';
    if (base === 'NEG') return 'Negation';
    return base;
  };

  const DERIVATION = [
    ['-ता, -पन, -आई, -आहट', 'Adjective or noun → abstract noun', 'सुंदर → सुंदरता · बच्चा → बचपन · अच्छा → अच्छाई · चिकना → चिकनाहट'],
    ['-आई, -आव, -आवट, -आन', 'Verb → noun', 'पढ़ → पढ़ाई · बच → बचाव · सज → सजावट · थक → थकान'],
    ['-ना (infinitive)', 'Verb → noun-like form', 'पढ़ना अच्छा है (subject) · खाना (food) has become an ordinary noun'],
    ['-ई, -ईय, -इक', 'Noun → adjective', 'ऊन → ऊनी · पंजाब → पंजाबी · भारत → भारतीय · इतिहास → ऐतिहासिक'],
    ['-ता / -या + हुआ', 'Verb → adjective (participle)', 'बहता (हुआ) पानी · टूटा (हुआ) खिलौना · पका आम'],
    ['-ने वाला', 'Verb → adjective or noun', 'पढ़ने वाला छात्र (A) · आने वाला (N: the one who comes)'],
    ['-वाला after a noun', 'Noun → noun or adjective', 'दूधवाला (milkman) · चश्मे वाला आदमी'],
    ['noun or adjective + से', 'Noun → adverbial phrase', 'ध्यान से · प्यार से · तेज़ी से · ज़ोर से'],
    ['repetition', 'Adjective or noun → adverb', 'धीरे-धीरे · घर-घर · साथ-साथ'],
    ['-कर', 'Verb → adverbial (conjunctive participle)', 'खाकर सोया · दौड़कर आया'],
    ['noun or adjective + करना / होना', 'Noun or adjective becomes part of a verb (conjunct verb)', 'काम करना · साफ़ करना · शुरू होना'],
  ];
  const INFLECTION = [
    'Inflection does not change the category. लड़का, लड़के, लड़कों, लड़कियाँ are all nouns; खाता, खाया, खाएगा, खाना (infinitive) are all verbs; अच्छा, अच्छे, अच्छी are all adjectives.',
    'Causatives change the number of participants, not the category: उठना → उठाना → उठवाना are all verbs.',
    'So ask first: is this ending inflection (same word, new form) or derivation (a new word)? Only derivation can change the category.',
  ];
  const LIGHT = [
    ['Shape', 'verb stem + verb', 'noun or adjective + verb'],
    ['Examples', 'खा लेना, सो जाना, लिख डालना, गिर पड़ना', 'मदद करना, काम करना, साफ़ करना, शुरू होना'],
    ['Meaning comes from', 'the first verb', 'the noun or adjective'],
    ['The second verb is called', 'a vector (or explicator)', 'a verbaliser'],
    ['The second verb adds', 'aspect and nuance: completion, suddenness, benefit', 'makes the noun or adjective into a predicate'],
    ['Category of the first part', 'Verb (bare stem)', 'Noun or Adjective'],
    ['In this app', 'VEC inside AUX (v in Method 4); ने depends on the vector', 'object or complement + करना / होना'],
  ];
  const LIGHT_NOTES = [
    'Light verb is the wider term for both second verbs: लेना in खा लेना no longer means “take”, and करना in मदद करना adds little beyond “doing”. Vector is used only for the compound-verb kind.',
    'The vector decides ने: राम ने आम खा लिया (लेना is transitive), but राम आम खा गया and not *राम ने आम खा गया (जाना is intransitive).',
    'In a conjunct verb the noun keeps some independence: नहीं can come between them (राम ने मदद नहीं की), and the verb agrees with the noun (मदद की). This is why linguists disagree about whether it is one predicate.',
    'Hindi grammars differ in their terms; some call both संयुक्त क्रिया. Check which term your textbook uses.',
  ];

  const HOMONYMS = [
    ['खाना', 'Noun: खाना ठंडा है (food)', 'Verb: मुझे खाना खाना है (to eat)'],
    ['सोना', 'Noun: सोना महँगा है (gold)', 'Verb: बच्चे को सोना है (to sleep)'],
    ['आम', 'Noun: आम मीठा है (mango)', 'Adjective: आम आदमी (common)'],
    ['वह / यह', 'Pronoun: वह आया', 'Determiner: वह लड़का आया'],
    ['अच्छा', 'Adjective: अच्छा लड़का', 'Adverb: वह अच्छा गाती है'],
    ['और', 'Conjunction: राम और सीता', 'Adverb or adjective (more): और दो'],
    ['बहुत', 'Adverb of degree: बहुत अच्छा', 'Quantity before a noun: बहुत लोग'],
    ['ऊपर / पास / सामने', 'Adverb alone: वह ऊपर गया', 'Postposition with के: छत के ऊपर'],
    ['की', 'Case marker (genitive): राम की किताब', 'Verb (perfective of करना): राम ने मदद की'],
    ['तो', 'Particle (focus): मैं तो जाऊँगा', 'Correlative (then): अगर… तो…'],
    ['क्या', 'Question particle: क्या तुम आओगे?', 'Pronoun (what): तुमने क्या खाया?'],
    ['कल', 'Adverb: कल आना (tomorrow) / कल आया (yesterday)', 'Tense decides which day is meant'],
  ];
  const STEPS = [
    'Look at the form: what is the ending, and is it inflection or derivation?',
    'Look at the position: what comes just before and after the word?',
    'Try a test frame from the table: which slot does the word fit?',
    'Only then check the meaning. Meaning alone misleads: सच (truth) is a noun even though it feels like an adjective.',
  ];

  const VERB_FORMS = {
    stem: 'the bare stem', hab: 'habitual participle (-ता/-ती/-ते)', perf: 'perfective participle (-आ/-ई/-ए)',
    fut: 'future (-एगा/-एगी)', inf: 'infinitive (-ना/-ने/-नी)', cp: 'conjunctive participle (-कर)',
    imp: 'imperative', subj: 'subjunctive',
  };

  /** Why a word was given a category: the form or position clue. */
  function clue(token) {
    const tag = token.tags[0] || '';
    const cat = coarse(tag);
    const w = token.w;
    if (token.abs) return 'unpronounced: tense or aspect carried by the verb form';
    const forms = HT.lexicon.verb(w.split(' ')[0]);
    if (cat === 'Verb' && forms.length) {
      const f = forms.find((x) => tag.includes(x.kind)) || forms[0];
      return `${VERB_FORMS[f.kind] || f.kind} of ${f.stem}ना (${f.gloss.replace(/_/g, ' ')})`;
    }
    if (cat === 'Verb' && / (हुआ|हुई|हुए)$/.test(w)) return 'participle: verb + हुआ, used like an adjective or adverb';
    if (cat === 'Noun' && /\.INFL$/.test(token.g || '')) return 'inflected noun: oblique or plural form (-े, -ों, -ें, -ियाँ)';
    if (cat === 'Auxiliary') return 'follows a verb and adds tense, aspect, modality or voice';
    const row = CATEGORIES.find((c) => c[0] === cat);
    return row ? row[2] : '';
  }

  /** The category over each pronounced word, in sentence order. */
  function categoriesIn(tree) {
    const out = [];
    (function visit(n) {
      for (const c of n.c) {
        if (T.isLeaf(c)) {
          if (!c.abs) out.push(n.l === 'POSS' ? 'gen' : n.l + (n.f ? `.${n.f}` : ''));
        } else visit(c);
      }
    })(tree);
    return out;
  }

  function checker(el) {
    const input = el.querySelector('#wc-text');
    const out = el.querySelector('#wc-out');
    const run = () => {
      const tokens = HT.tagger.tag(input.value).filter((t) => !t.abs);
      if (!tokens.length) {
        out.innerHTML = '';
        return;
      }
      // Context decides homonyms (खाना noun or verb), so prefer the category in the
      // Method 1 analysis of the whole sentence. Fall back to the word-by-word guess.
      const readings = HT.studio.treesFor(input.value).map(categoriesIn).filter((r) => r.length === tokens.length);
      const fromTree = readings[0] || [];
      const useTree = readings.length > 0;
      const rows = tokens.map((t, i) => {
        const tag = useTree ? fromTree[i] : t.tags[0] || '';
        return { t, tag, main: coarse(tag) };
      });
      out.innerHTML = `<table class="ff wc-table"><tr><th>Word</th><th>Category</th><th>Why</th><th>Could also be</th></tr>${rows.map(({ t, tag, main }, i) => {
        // Other readings of the sentence first, then other categories the word has in the lexicon.
        const others = [...new Set([...readings.slice(1).map((r) => coarse(r[i])), ...t.tags.map(coarse)])].filter((c) => c !== main);
        let why = clue({ ...t, tags: [tag, ...t.tags] });
        // A participle before a noun works like an adjective: बहता पानी, टूटा खिलौना
        const next = rows[i + 1];
        const kinds = HT.lexicon.verb(t.w).map((f) => f.kind);
        if (main === 'Verb' && next && next.main === 'Noun' && (kinds.includes('hab') || kinds.includes('perf'))) {
          why += '. Before a noun it works like an adjective (participle): compare बहता पानी, टूटा खिलौना.';
        }
        return `<tr><td lang="hi">${esc(t.w)}${t.g ? `<br><span class="hint">${esc(t.g.replace(/_/g, ' '))}</span>` : ''}</td>
          <td><b>${esc(main)}</b><br><span class="hint">${esc(tag)}</span></td>
          <td>${esc(why)}</td><td>${esc(others.join(', ') || '—')}</td></tr>`;
      }).join('')}</table>
      <p class="hint">${useTree ? `Categories come from the Method 1 analysis of the whole sentence, so context decides cases like खाना (noun or verb).${readings.length > 1 ? ` The sentence has ${readings.length} readings; categories from the others appear under “Could also be”, and meaning decides between them.` : ''}`
        : 'Method 1 found no analysis, so these are word-by-word guesses from the lexicon and the neighbouring words.'}
        Unknown words are guessed from their form. Check doubtful cases with the test frames below.</p>`;
    };
    el.querySelector('#wc-check').onclick = run;
    input.onkeydown = (e) => { if (e.key === 'Enter') run(); };
    run();
  }

  // Quiz: words from the course sentences, answers from the model analyses.
  let pool = null;
  function buildPool() {
    pool = [];
    for (const ex of HT.lessons.all) {
      const solved = HT.lessons.solve(ex);
      const tree = solved.trees[solved.index];
      if (!tree) continue;
      const leaves = [];
      T.walk(tree, (n) => {
        if (T.isLeaf(n) || n.tri) return;
        n.c.forEach((c) => { if (T.isLeaf(c) && !c.abs) leaves.push({ leaf: c, tag: n.l === 'POSS' ? 'gen' : n.l }); });
      });
      const words = T.leaves(tree).filter((l) => !l.abs);
      for (const { leaf, tag } of leaves) {
        const cat = coarse(tag);
        if (!CATEGORIES.some((c) => c[0] === cat)) continue;
        pool.push({ sentence: words.map((l) => l.w), at: words.indexOf(leaf), word: leaf.w, gloss: leaf.g || '', cat, tag, english: ex.english });
      }
    }
  }

  function quiz(el, state) {
    pool = pool || (buildPool(), pool);
    if (!state.item) state.item = pool[Math.floor(Math.random() * pool.length)];
    const q = state.item;
    const box = el.querySelector('#wc-quiz');
    const sentence = q.sentence.map((w, i) => (i === q.at ? `<mark>${esc(w)}</mark>` : esc(w))).join(' ');
    const answered = state.choice;
    const right = answered === q.cat;
    const row = CATEGORIES.find((c) => c[0] === q.cat);
    box.innerHTML = `<div class="row between"><p class="hint">${state.right} of ${state.asked} correct</p></div>
      <p class="wc-sentence" lang="hi">${sentence}</p><p class="english">${esc(q.english)}</p>
      <p>What is the category of <b lang="hi">${esc(q.word)}</b>?</p>
      <div class="wc-choices">${CATEGORIES.map(([name, hindi]) => `<button class="btn small ${answered ? (name === q.cat ? 'right' : name === answered ? 'wrong' : '') : ''}"
        data-choice="${esc(name)}" ${answered ? 'disabled' : ''}>${esc(name)} <span lang="hi">${esc(hindi)}</span></button>`).join('')}</div>
      ${answered ? `<div class="notice ${right ? 'info' : 'warn'}"><strong>${right ? 'Correct.' : `It is a ${q.cat.toLowerCase()}.`}</strong>
        ${esc(clue({ w: q.word, g: q.gloss, tags: [q.tag] }))}${row ? `<br>Test frame: <span lang="hi">${esc(row[3])}</span>` : ''}</div>
        <button class="btn primary" id="wc-next">Next word</button>` : ''}`;
    box.querySelectorAll('[data-choice]').forEach((b) => {
      b.onclick = () => {
        state.choice = b.dataset.choice;
        state.asked++;
        if (state.choice === q.cat) state.right++;
        quiz(el, state);
      };
    });
    const next = box.querySelector('#wc-next');
    if (next) next.onclick = () => {
      Object.assign(state, { item: null, choice: null });
      quiz(el, state);
    };
  }

  const quizState = { item: null, choice: null, right: 0, asked: 0 };

  function render(el) {
    el.innerHTML = `
      <header class="page-head"><p>How to recognise a Hindi word's category (शब्द-भेद), and how endings can change it. Practise with your own sentences or with the quiz, and use the tables as a reference.</p></header>
      <div class="lab-grid">
        <section class="card"><h2>Check a sentence</h2>
          <div class="row"><input id="wc-text" lang="hi" value="मुझे खाना खाना है" aria-label="Sentence to check">
            <button class="btn primary" id="wc-check">Check</button></div>
          <div id="wc-out" class="table-scroll"></div></section>
        <section class="card"><h2>Quiz</h2><div id="wc-quiz"></div></section>
      </div>
      <section class="card lesson-card"><h2>Four steps to identify a category</h2><ol>${STEPS.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>
      <section class="card"><h2>Categories, clues and test frames</h2><div class="table-scroll"><table class="ff wc-ref">
        <tr><th>Category</th><th>Clue</th><th>Test frame</th><th>Examples</th></tr>
        ${CATEGORIES.map(([name, hindi, clueText, frame, examples]) => `<tr><td><b>${esc(name)}</b><br><span lang="hi">${esc(hindi)}</span></td>
          <td>${esc(clueText)}</td><td lang="hi">${esc(frame)}</td><td lang="hi">${esc(examples)}</td></tr>`).join('')}</table></div></section>
      <section class="card"><h2>Endings that change the category (derivation)</h2><div class="table-scroll"><table class="ff wc-ref">
        <tr><th>Ending or process</th><th>Change</th><th>Examples</th></tr>
        ${DERIVATION.map(([ending, change, examples]) => `<tr><td lang="hi">${esc(ending)}</td><td>${esc(change)}</td><td lang="hi">${esc(examples)}</td></tr>`).join('')}</table></div>
        ${INFLECTION.map((p) => `<p>${esc(p)}</p>`).join('')}</section>
      <section class="card"><h2>Compound verbs and conjunct verbs</h2><div class="table-scroll"><table class="ff wc-ref">
        <tr><th></th><th>Compound verb</th><th>Conjunct verb</th></tr>
        ${LIGHT.map(([row, a, b]) => `<tr><td><b>${esc(row)}</b></td><td lang="hi">${esc(a)}</td><td lang="hi">${esc(b)}</td></tr>`).join('')}</table></div>
        ${LIGHT_NOTES.map((p) => `<p>${esc(p)}</p>`).join('')}</section>
      <section class="card"><h2>Same form, different category</h2><div class="table-scroll"><table class="ff wc-ref">
        <tr><th>Word</th><th>One use</th><th>Another use</th></tr>
        ${HOMONYMS.map(([w, a, b]) => `<tr><td lang="hi"><b>${esc(w)}</b></td><td lang="hi">${esc(a)}</td><td lang="hi">${esc(b)}</td></tr>`).join('')}</table></div>
        <p>In each pair, the position and the words around it decide the category, not the word itself.</p></section>`;
    checker(el);
    quiz(el, quizState);
  }

  HT.wordclass = { render, coarse, clue, CATEGORIES };
})(globalThis.HT = globalThis.HT || {});
