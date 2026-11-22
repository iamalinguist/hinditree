/* Course, practice, rules and reference pages. */
(function (HT) {
  'use strict';
  const { esc, store, toast, download } = HT.util;
  const T = HT.tree;

  const STARTER_GRAMMAR = `# One rule per line. Use ? for optional, * for any number, | for "or",
# and =S, =dO and so on to give a function.
roots: S
S -> NP=S VP
NP -> DET? A* N | PRO | NP CASE
PP -> NP P
VP -> PP* NP? NP? V TENSE?`;

  function print(items) {
    const root = document.getElementById('print-root');
    root.innerHTML = items.map((item, i) => {
      const out = HT.render.draw(item.tree, { ...item.opts, english: '', blank: !!(item.opts && item.opts.blank) });
      return `<figure><figcaption><b>(${i + 1})</b> <span lang="hi">${esc(item.text)}</span>${
        item.english ? ` <i>‘${esc(item.english)}’</i>` : ''}</figcaption>${out.svg}</figure>`;
    }).join('');
    window.print();
  }

  const modelTree = (example) => {
    const solved = HT.lessons.solve(example);
    return T.present(solved.trees[solved.index], example.chapter, { triangles: example.chapter === 6 });
  };

  // Course
  function course(el, param) {
    const ch = HT.lessons.chapters.find((c) => String(c.n) === param) || HT.lessons.chapters[0];
    el.innerHTML = `
      <header class="page-head"><h1>Course <span lang="hi">वाक्यविज्ञान परिचय</span></h1>
        <p>Follows the six chapters of Linda Thomas, <cite>Beginning Syntax</cite> (1993), with original Hindi examples.</p></header>
      <nav class="chapters" aria-label="Chapters">${HT.lessons.chapters.map((c) => `<a href="#course/${c.n}" class="${c === ch ? 'on' : ''}" ${c === ch ? 'aria-current="page"' : ''}>
        <b>${c.n}</b><span>${esc(c.title)}</span></a>`).join('')}</nav>
      <section class="card lesson">
        <div class="row between"><h2>${ch.n}. ${esc(ch.title)} <span lang="hi">${esc(ch.hindi)}</span></h2><span class="pill">Thomas, pp. ${ch.pages}</span></div>
        <p class="lead">${esc(ch.ideas)}</p>
        <div class="lesson-grid">
          <div><h3>Rules for Hindi</h3><ul class="mono rules">${ch.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
          <div><h3>Tests to use in class</h3><ul>${ch.tests.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
        </div>
        <table class="contrast"><tr><th>English, as in the book</th><th>Hindi, as in this course</th></tr>
          <tr><td>${esc(ch.english)}</td><td>${esc(ch.hindiRule)}</td></tr></table>
      </section>
      <div class="row between examples-head"><h2>${ch.examples.length} examples</h2>
        <div class="row"><button class="btn" data-print="answers">Print trees</button><button class="btn" data-print="worksheet">Print worksheet (blank labels)</button></div></div>
      ${ch.groups.map((g) => `<h3 class="group-title">${esc(g.title)}</h3><div class="examples">${g.items.map((ex) => `
        <article class="example"><a class="example-main" href="#example/${ex.id}">
          <span class="hindi" lang="hi">${esc(ex.sentence)}</span><span class="english">${esc(ex.english)}</span>
          <span class="pattern">${esc(ex.key.map((k) => k.fn).join(' + '))}</span>
          ${ex.note ? `<span class="note">${esc(ex.note)}</span>` : ''}</a>
          <a class="draw" href="#exercise/${ex.id}">Draw it yourself</a></article>`).join('')}</div>`).join('')}`;
    el.querySelectorAll('[data-print]').forEach((button) => {
      button.onclick = () => {
        const worksheet = button.dataset.print === 'worksheet';
        print(ch.examples.map((ex) => ({
          tree: modelTree(ex), text: ex.sentence, english: ex.english, opts: { functions: !worksheet, blank: worksheet },
        })));
      };
    });
  }

  // Practice
  const quiz = { chapter: 0, type: 'function', example: null, checked: false, answers: [], right: 0, asked: 0 };
  const CLASS_NAMES = {
    intrans: 'intransitive', trans: 'transitive', ditrans: 'ditransitive',
    intens: 'intensive', complex: 'complex-transitive', prep: 'prepositional',
  };

  function verbClass(example) {
    const { trees, index } = HT.lessons.solve(example);
    let found = '';
    // The main verb group is outside every embedded clause.
    (function visit(n) {
      if (found || T.isLeaf(n) || /^S[2-9]$/.test(n.l)) return;
      if (n.l === 'Vgp') found = n.f;
      else n.c.forEach(visit);
    })(trees[index]);
    return found;
  }

  function nextQuestion() {
    let pool = HT.lessons.all.filter((e) => !quiz.chapter || e.chapter === quiz.chapter);
    if (quiz.type === 'class') pool = pool.filter((e) => e.key.filter((k) => k.fn === 'P').length === 1);
    const others = pool.filter((e) => e !== quiz.example);
    quiz.example = others[Math.floor(Math.random() * others.length)];
    Object.assign(quiz, { checked: false, answers: [] });
  }

  function practice(el) {
    if (!quiz.example) nextQuestion();
    const ex = quiz.example;
    const questions = quiz.type === 'function'
      ? ex.key.map((k) => ({ text: k.text, answer: k.fn, choices: HT.studio.FUNCTIONS }))
      : [{ text: ex.key.find((k) => k.fn === 'P').text, answer: verbClass(ex), choices: Object.entries(CLASS_NAMES) }];

    el.innerHTML = `
      <header class="page-head"><h1>Practice <span lang="hi">अभ्यास</span></h1></header>
      <section class="card">
        <div class="row">
          <label class="inline">Chapter <select id="quiz-chapter"><option value="0">All</option>${HT.lessons.chapters.map((c) =>
            `<option value="${c.n}" ${c.n === quiz.chapter ? 'selected' : ''}>${c.n}. ${esc(c.title)}</option>`).join('')}</select></label>
          <label class="inline">Question <select id="quiz-type"><option value="function">Name the functions</option>
            <option value="class" ${quiz.type === 'class' ? 'selected' : ''}>Name the verb class</option></select></label>
          <a class="btn" href="#exercise/${ex.id}">Draw this tree</a>
          <span class="spacer"></span><span class="pill">${quiz.right} of ${quiz.asked} correct</span>
        </div>
        <p class="quiz-sentence" lang="hi">${esc(ex.sentence)}</p><p class="english">${esc(ex.english)}</p>
        <div class="quiz-grid">${questions.map((q, i) => `<label class="${quiz.checked ? (quiz.answers[i] === q.answer ? 'right' : 'wrong') : ''}">
          <span lang="hi">${esc(q.text)}</span>
          <select data-q="${i}" ${quiz.checked ? 'disabled' : ''}><option value="">choose…</option>${q.choices.map(([value, name]) =>
            `<option value="${value}" ${quiz.answers[i] === value ? 'selected' : ''}>${esc(value)} · ${esc(name)}</option>`).join('')}</select>
          ${quiz.checked && quiz.answers[i] !== q.answer ? `<b>Answer: ${esc(q.answer)}</b>` : ''}</label>`).join('')}</div>
        <div class="row">${quiz.checked ? '<button class="btn primary" id="quiz-next">Next sentence</button>'
          : '<button class="btn primary" id="quiz-check">Check</button><button class="btn" id="quiz-next">Skip</button>'}</div>
        ${quiz.checked ? `<div class="quiz-tree">${HT.render.draw(modelTree(ex), {}).svg}</div>` : ''}
      </section>`;

    el.querySelector('#quiz-chapter').onchange = (e) => {
      quiz.chapter = Number(e.target.value);
      nextQuestion();
      practice(el);
    };
    el.querySelector('#quiz-type').onchange = (e) => {
      quiz.type = e.target.value;
      nextQuestion();
      practice(el);
    };
    el.querySelector('#quiz-next').onclick = () => {
      nextQuestion();
      practice(el);
    };
    el.querySelectorAll('[data-q]').forEach((select) => {
      select.onchange = () => { quiz.answers[select.dataset.q] = select.value; };
    });
    const check = el.querySelector('#quiz-check');
    if (check) {
      check.onclick = () => {
        if (questions.some((_, i) => !quiz.answers[i])) return toast('Answer every part first.');
        quiz.checked = true;
        quiz.asked += questions.length;
        quiz.right += questions.filter((q, i) => quiz.answers[i] === q.answer).length;
        return practice(el);
      };
    }
  }

  // Syntax rules
  function rules(el) {
    const { method1, method2 } = HT.legacy.methods;
    const listing = (m) => `${Object.entries(m.grammar).map(([lhs, list]) => `${lhs} → ${list.map((r) => r.join(' ')).join(' | ')}`).join('\n')}\nroots: ${m.roots.join(' ')}`;
    el.innerHTML = `
      <header class="page-head"><h1>Syntax rules <span lang="hi">वाक्य-नियम</span></h1>
        <p>Choose a method here or in the Tree Studio.</p></header>
      <section class="card"><div class="row between"><h2>Thomas, adapted to Hindi</h2><button class="btn primary" data-use="thomas">Use</button></div>
        <p>The rules of the six chapters in one grammar. Every function (S, P, dO, iO, sC, oC, pO, A) is part of a rule or follows from position in the tree.</p>
        <div class="lesson-grid">${HT.lessons.chapters.map((c) => `<div><h3>${c.n}. ${esc(c.title)}</h3>
          <ul class="mono rules">${c.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>`).join('')}</div>
        <details><summary>Complete parser grammar</summary>
          <p class="hint"><code>?</code> optional, <code>*</code> repeatable, <code>=dO</code> function, <code>@1.5</code> a cost that ranks less likely readings lower. A suffix such as <code>NP.erg</code> is internal.</p>
          <pre class="mono grammar" tabindex="0">${esc(HT.grammar.thomas)}</pre>
          <button class="btn" id="copy-grammar">Copy into My grammar</button></details></section>
      ${[['method1', method1], ['method2', method2]].map(([id, m]) => `<section class="card">
        <div class="row between"><h2>${esc(m.name)}</h2><button class="btn primary" data-use="${id}">Use</button></div>
        <p>By ${esc(m.authors)}${m.paper ? `. <a href="${m.paper}" target="_blank" rel="noopener noreferrer">Read the paper</a>` : ''}</p>
        <pre class="mono" tabindex="0">${esc(listing(m))}</pre>
        ${id === 'method2' ? '<p class="hint">-ता है and -ती है are split off as Aux. Neg scopes over the whole sentence and is drawn as ऐसा नहीं है कि.</p>' : ''}</section>`).join('')}
      <section class="card"><div class="row between"><h2>My grammar</h2><button class="btn primary" data-use="custom">Save and use</button></div>
        <p>Write rules for any textbook or analysis. Word categories are the symbols that never appear left of an arrow.</p>
        <textarea id="grammar-text" class="mono" rows="14" spellcheck="false" aria-label="My grammar">${esc(store.get('grammar', STARTER_GRAMMAR))}</textarea>
        <p id="grammar-status" class="hint" role="status"></p>
        <div class="row"><button class="btn" id="grammar-save">Save</button><button class="btn" id="grammar-reset">Reset to starter grammar</button></div></section>`;

    const area = el.querySelector('#grammar-text');
    const status = el.querySelector('#grammar-status');
    const validate = () => {
      const { errors } = HT.parser.compile(area.value);
      status.textContent = errors.length ? `Line ${errors[0].line}: ${errors[0].message}` : 'The rules are well-formed.';
      status.classList.toggle('bad', errors.length > 0);
      return !errors.length;
    };
    const save = () => {
      if (!validate()) return false;
      store.set('grammar', area.value);
      toast('Grammar saved in this browser.');
      return true;
    };
    area.oninput = validate;
    validate();
    el.querySelector('#grammar-save').onclick = save;
    el.querySelector('#grammar-reset').onclick = () => {
      area.value = STARTER_GRAMMAR;
      validate();
    };
    el.querySelector('#copy-grammar').onclick = () => {
      area.value = HT.grammar.thomas;
      validate();
      area.scrollIntoView({ block: 'center' });
      toast('Copied below. Save to keep it.');
    };
    el.querySelectorAll('[data-use]').forEach((button) => {
      button.onclick = () => {
        if (button.dataset.use === 'custom' && !save()) return;
        HT.studio.setMethod(button.dataset.use);
        location.hash = '#studio';
      };
    });
  }

  // Abbreviations
  const ABBREVIATIONS = [
    ['Clauses and phrases', [
      ['S', 'sentence or clause', 'वाक्य, उपवाक्य'], ['S₁, S₂', 'main and subordinate clause', 'मुख्य, आश्रित उपवाक्य'],
      ['NP', 'noun phrase', 'संज्ञा पदबंध'], ['N′', 'N-bar, between N and NP', 'मध्यवर्ती संज्ञा इकाई'],
      ['VP', 'verb phrase', 'क्रिया पदबंध'], ['Vgp', 'verb group', 'क्रिया समूह'],
      ['AP', 'adjective phrase', 'विशेषण पदबंध'], ['AdvP', 'adverb phrase', 'क्रियाविशेषण पदबंध'],
      ['PP', 'postpositional phrase', 'परसर्गीय पदबंध'], ['POSS', 'possessive (genitive) phrase', 'संबंध पदबंध'],
    ]],
    ['Word categories', [
      ['N', 'noun', 'संज्ञा'], ['PRO', 'pronoun', 'सर्वनाम'], ['DET', 'determiner', 'निर्धारक'],
      ['V', 'lexical verb', 'मुख्य क्रिया'], ['A', 'adjective', 'विशेषण'], ['Adv', 'adverb', 'क्रियाविशेषण'],
      ['deg', 'degree adverb', 'प्रविशेषण'], ['P', 'postposition', 'परसर्ग'], ['CASE', 'case marker: ने, को', 'कारक चिह्न'],
      ['sub', 'subordinator', 'अधीनस्थ समुच्चयबोधक'], ['coord', 'coordinator', 'समानाधिकरण समुच्चयबोधक'],
      ['part', 'particle', 'निपात'], ['NEG', 'negation', 'निषेध'],
    ]],
    ['Functions', [
      ['S', 'subject', 'उद्देश्य, कर्ता'], ['P', 'predicator', 'विधेयक क्रिया'], ['dO', 'direct object', 'मुख्य कर्म'],
      ['iO', 'indirect object', 'गौण कर्म'], ['sC', 'subject complement', 'उद्देश्य पूरक'], ['oC', 'object complement', 'कर्म पूरक'],
      ['pO', 'prepositional object', 'परसर्गीय कर्म'], ['A', 'adverbial', 'क्रियाविशेषक'],
    ]],
    ['Verb classes', [
      ['[intrans]', 'intransitive: needs nothing', 'अकर्मक'], ['[trans]', 'transitive: dO', 'सकर्मक'],
      ['[ditrans]', 'ditransitive: iO + dO', 'द्विकर्मक'], ['[intens]', 'intensive: sC', 'योजक, अपूर्ण अकर्मक'],
      ['[complex]', 'complex-transitive: dO + oC', 'अपूर्ण सकर्मक'], ['[prep]', 'prepositional: pO', 'परसर्गापेक्षी'],
    ]],
    ['Verb group', [
      ['AUX', 'auxiliary', 'सहायक क्रिया'], ['TENSE', 'tense', 'काल'], ['MOD', 'modal: सक, चाहिए', 'वृत्ति'],
      ['PERF', 'perfect: चुका, (perf)', 'पूर्ण पक्ष'], ['PROG', 'progressive: रहा', 'सातत्य पक्ष'], ['HAB', 'habitual: -ता', 'नित्य पक्ष'],
      ['PASS', 'passive: जाना', 'कर्मवाच्य'], ['VEC', 'vector verb: लिया, गया', 'रंजक क्रिया'],
    ]],
    ['Notation', [
      ['→', 'consists of', 'से बना है'], ['( )', 'optional', 'वैकल्पिक'], ['*', 'ungrammatical', 'अव्याकरणिक'],
      ['?', 'doubtful', 'संदिग्ध'], ['(pres)', 'unpronounced element', 'अनुच्चारित तत्त्व'], ['△', 'constituent left unanalysed', 'अविश्लेषित घटक'],
    ]],
  ];

  function abbreviations(el) {
    el.innerHTML = `<header class="page-head"><h1>Abbreviations <span lang="hi">संकेत-सूची</span></h1></header>
      <div class="glossary">${ABBREVIATIONS.map(([title, list]) => `<section class="card"><h2>${esc(title)}</h2><table>${list.map(([short, en, hi]) =>
        `<tr><th scope="row">${esc(short)}</th><td>${esc(en)}<br><span lang="hi">${esc(hi)}</span></td></tr>`).join('')}</table></section>`).join('')}</div>`;
  }

  // Hindi adaptation
  const ADAPTATION = [
    ['Head position', 'V + NP, P + NP, AUX + V', 'NP + V, NP + P, V + AUX. The phrases are the same and their order is reversed.', 'राम [रोटी खाता है]'],
    ['Articles', 'An article often introduces NP', 'There are no articles. A bare noun is a complete NP, and एक, यह, वह are optional DET.', '[लड़का] आया'],
    ['Case', 'Case shows only on pronouns', 'ने and को form [NP NP CASE]. The result is still an NP, so “subject is the NP immediately dominated by S” continues to hold.', '[[राम] ने] खाया'],
    ['Postpositions', 'Prepositions, some used alone', 'से, में, पर, के लिए and others head a PP. Several words can make one P.', '[पेड़ के नीचे]'],
    ['Subject', 'Position identifies it, and the verb agrees with it', 'Position still identifies it. Agreement does not: with ने the verb agrees with the object.', 'राम ने रोटी खाई'],
    ['Dative subjects', 'None', 'Experiencers and subjects of obligation take को. Some linguists analyse them as adverbials, so both analyses can be drawn.', 'राम को बुखार है'],
    ['Indirect object', 'NP, alternating with a to-PP', 'An NP marked by को, in either order. It keeps को in the passive.', 'सीता को किताब दी गई'],
    ['Tense', 'Present and past; a modal excludes tense', 'Past, present and an inflectional future. A modal combines with tense.', 'पढ़ सकता था'],
    ['Aspect', 'have + -en, be + -ing', 'A participle with होना (habitual, perfect), or a stem with रहा or चुका.', 'खा रहा है'],
    ['Passive', 'be + -en, by-phrase', 'A perfective participle with जाना. The agent is an optional PP with से or के द्वारा.', 'पकड़ा गया'],
    ['Do-support', 'In negatives and questions', 'None. नहीं is inside Vgp and questions use क्या or intonation.', 'क्या राम आया'],
    ['Compound verbs', 'None in the book', 'A stem with a vector verb, shown as VEC inside AUX.', 'खा लिया'],
    ['Genitive', 'NP + ’s under POSS', 'NP + का/के/की under POSS, agreeing with the head noun.', 'सीता की किताब'],
    ['Noun modifiers', 'PP and clauses follow the noun', 'They precede it (वाला, participles). Only जो clauses may follow.', 'चश्मे वाला लड़का'],
    ['Relative clauses', 'Inside NP', 'Inside NP, or a correlative adjoined to S₁ and picked up by वह.', 'जो आया, वह मेरा भाई है'],
    ['Noun clauses', 'After the verb, with that', 'After the verb, with कि. This is the main exception to verb-final order.', 'जानता है कि…'],
    ['Non-finite clauses', 'to, bare infinitive, -ing, -en', '-ना, conjunctive -कर, and participles in -ता हुआ and -या हुआ.', 'खाना खाकर सोया'],
    ['Word order', 'Fixed', 'Scrambling is common. A fronted object is drawn under S and keeps the function dO.', 'आम को राम ने खाया'],
  ];

  function adaptation(el) {
    el.innerHTML = `
      <header class="page-head"><h1>From English to Hindi <span lang="hi">अंग्रेज़ी से हिंदी</span></h1>
        <p>Where Thomas’s English rules do not fit Hindi, and the decision this app makes. These are teaching decisions, and several have respectable alternatives.</p></header>
      <section class="card table-scroll"><table class="adaptation">
        <tr><th>Topic</th><th>Thomas, English</th><th>This app, Hindi</th><th>Example</th></tr>
        ${ADAPTATION.map(([topic, en, hi, ex]) => `<tr><th scope="row">${esc(topic)}</th><td>${esc(en)}</td><td>${esc(hi)}</td><td lang="hi">${esc(ex)}</td></tr>`).join('')}
      </table></section>
      <section class="card"><h2>Further reading</h2><ul>
        <li>Thomas, L. (1993). <cite>Beginning Syntax</cite>. Oxford: Blackwell.</li>
        <li>Kachru, Y. (2006). <cite>Hindi</cite>. Amsterdam: John Benjamins.</li>
        <li>Koul, O. N. (2008). <cite>Modern Hindi Grammar</cite>. Springfield: Dunwoody Press.</li>
        <li>Mahajan, A. (1990). <cite>The A/A-bar Distinction and Movement Theory</cite>. PhD thesis, MIT. On scrambling.</li>
        <li>Mohanan, T. (1994). <cite>Argument Structure in Hindi</cite>. Stanford: CSLI.</li>
        <li>Srivastav, V. (1991). The syntax and semantics of correlatives. <cite>Natural Language and Linguistic Theory</cite> 9, 637–686.</li>
      </ul></section>`;
  }

  // My examples
  function mine(el) {
    const list = store.get('examples', []);
    el.innerHTML = `
      <header class="page-head"><h1>My examples <span lang="hi">मेरे उदाहरण</span></h1>
        <p>Saved only in this browser. Export the collection to back it up or share it with students.</p></header>
      <div class="row">
        <button class="btn" id="mine-export" ${list.length ? '' : 'disabled'}>Export collection</button>
        <label class="btn file">Import collection<input id="mine-import" type="file" accept=".json,application/json"></label>
        <button class="btn" id="mine-print" ${list.length ? '' : 'disabled'}>Print handout</button></div>
      <div class="examples mine">${list.length ? list.map((item) => `<article class="example">
        <a class="example-main" href="#saved/${esc(item.id)}"><span class="hindi" lang="hi">${esc(item.text)}</span><span class="english">${esc(item.english)}</span></a>
        <button class="draw danger" data-delete="${esc(item.id)}">Delete</button></article>`).join('')
        : '<p class="hint">Nothing saved yet. Draw a tree in the Studio and choose Save to My examples.</p>'}</div>`;

    el.querySelectorAll('[data-delete]').forEach((button) => {
      button.onclick = () => {
        // A second click confirms.
        if (!button.dataset.sure) {
          button.dataset.sure = '1';
          button.textContent = 'Click again to delete';
          return;
        }
        store.set('examples', list.filter((item) => item.id !== button.dataset.delete));
        mine(el);
      };
    });
    el.querySelector('#mine-export').onclick = () => download('hinditree-examples.json',
      new Blob([JSON.stringify({ app: 'hinditree', version: 1, examples: list }, null, 2)], { type: 'application/json' }));
    el.querySelector('#mine-print').onclick = () => print(list.map((item) => ({
      text: item.text, english: item.english, opts: {},
      tree: !item.method || item.method === 'thomas' ? T.present(item.tree, item.level, { triangles: item.triangles }) : item.tree,
    })));
    el.querySelector('#mine-import').onchange = async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.examples)) throw new Error('This file is not a HindiTree collection.');
        const added = data.examples.map((x, i) => ({
          id: Date.now().toString(36) + i.toString(36),
          text: String(x.text || ''), english: String(x.english || ''), note: String(x.note || ''),
          method: String(x.method || 'thomas'), triangles: !!x.triangles,
          level: Math.min(6, Math.max(1, Number(x.level) || 4)), tree: T.sanitize(x.tree),
        }));
        if (!store.set('examples', [...added, ...list])) throw new Error('The browser could not store the collection.');
        mine(el);
        toast(`Imported ${added.length} examples.`);
      } catch (error) {
        toast(`Import failed: ${error.message}`);
      }
    };
  }

  // Help and about
  function about(el) {
    const faq = [
      ['How do I make a tree?', 'Type a sentence and choose Analyse. If a category is wrong, click the word and select another one. If the sentence has several structures, step through the readings.'],
      ['How do I draw a structure the parser does not give?', 'Choose Draw by hand. Shift-click neighbouring labels (or switch on Select several on a tablet), type a label and choose Group. Any node can be renamed, moved, deleted or turned into a triangle. You can also type bracket notation.'],
      ['Why does the tree change with the chapter?', 'Thomas adds detail gradually. The chapter selector shows one analysis with the notation that students have reached.'],
      ['How do I present in class?', 'Choose Present. Use Start build and then the arrow keys, Space or a slide clicker. Blank labels turns the tree into a question.'],
      ['Why is a correct sentence rejected?', 'The word may be missing from the lexicon, or the verb may need another class. Correct it under Word categories. The parser is a teaching grammar and does not cover all of Hindi.'],
      ['Does an accepted sentence mean a grammatical one?', 'No. The rules check constituent structure. Agreement in gender, number and person is not checked, and case is checked only for common errors with ने.'],
      ['Where is my work kept?', 'In your browser. Nothing is sent to a server. A share link contains the tree in the link itself.'],
      ['Does it work without the internet?', 'Yes. Download the site folder and open index.html.'],
    ];
    el.innerHTML = `
      <header class="page-head"><h1>Help and about <span lang="hi">सहायता</span></h1></header>
      <section class="card"><h2>Questions</h2>${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
      <section class="card"><h2>About</h2>
        <p>HindiTree is an open-access tool for creating and teaching constituency trees for Hindi.</p>
        <ul>
          <li>Methods 1 and 2 and the earlier HindiTree app: Tripathi Vivek and Rathod Dinesh.
            <a href="https://rupkatha.com/v16n103g/" target="_blank" rel="noopener noreferrer">Paper</a>.</li>
          <li>The idea of annotating words and solving for all trees comes from
            <a href="https://github.com/adambcomer/lin-tree-solver" target="_blank" rel="noopener noreferrer">Linguistics Tree Solver</a> by Adam Comer. The code here is written independently.</li>
          <li>The course sequence and notation follow Linda Thomas (1993), <cite>Beginning Syntax</cite>, Blackwell. The app does not contain the book and is not affiliated with its author or publisher.</li>
        </ul>
        <p>Support: <a href="mailto:sopan.tripathi@gmail.com">sopan.tripathi@gmail.com</a></p></section>`;
  }

  HT.pages = { STARTER_GRAMMAR, print, course, practice, rules, abbreviations, adaptation, mine, about };
})(globalThis.HT = globalThis.HT || {});
