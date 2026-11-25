/*
 * Hindi Lab, Concepts tab: linguistic terms explained with Hindi data.
 * Each entry links to the Whatzit? questions where it matters. The reader can
 * add their own entries, which are kept with the Lab data (in this browser,
 * and in Export Lab).
 */
(function (HT) {
  'use strict';
  const { esc } = HT.util;

  const AREAS = [
    ['word', 'Word structure', 'शब्द-रचना'],
    ['sentence', 'Sentence structure', 'वाक्य-रचना'],
    ['meaning', 'Meaning', 'अर्थ'],
    ['change', 'Language change', 'भाषा-परिवर्तन'],
    ['method', 'Method', 'पद्धति'],
  ];

  // [id, area, term, Hindi term or '', explanation, examples, Whatzit? ids, reading]
  const CONCEPTS = [
    // Word structure
    ['morpheme', 'word', 'Morpheme', 'रूपिम',
      'The smallest piece of a word that has a meaning or a grammatical job. A word can be one morpheme (घर) or several (लड़क-ों, खा-त-ा).',
      'लड़क-ा, लड़क-े, लड़क-ों\nखा-त-ा = eat + habitual + masculine singular', ['morphemes'], 'Haspelmath and Sims (2010), Understanding Morphology'],
    ['allomorph', 'word', 'Allomorph', 'संरूप',
      'Two or more forms of one morpheme, chosen by context. The Hindi perfective is -या after a stem ending in a vowel and -आ after one ending in a consonant: one morpheme, two allomorphs.',
      'आ-या, सो-या, खा-या\nदेख-ा, मार-ा, लिख-ा', ['morphemes'], ''],
    ['suppletion', 'word', 'Suppletion', '',
      'When a form of a word is built on a completely different stem that no rule predicts. English go and went; Hindi जाना and गया. Suppletive forms have to be listed.',
      'जाना → गया (not *जाया)\ngo → went', ['morphemes'], ''],
    ['fusion', 'word', 'Fusion (portmanteau)', '',
      'One form that carries several meanings at once, so it cannot be cut into one piece per meaning. English -s in eats is present tense and third person singular together. Hindi pronouns fuse with ने and को.',
      'eat-s = PRESENT + 3rd SINGULAR\nमैं + ने → मैंने\nवह + को → उसे', ['morphemes', 'tense'], ''],
    ['paradigm', 'word', 'Paradigm', 'रूपावली',
      'The full set of forms of one word, arranged by their grammatical values: all the forms of करना by aspect, tense, gender and number.',
      'करता, करती, करते\nकिया, की, किए\nकरूँगा, करेगा, करेंगे', ['morphemes'], ''],
    ['productivity', 'word', 'Productivity', 'उत्पादकता',
      'A pattern is productive if speakers use it for new words. The perfective -आ is productive: it applies to new and borrowed verbs. Productivity is evidence that a piece is real for speakers.',
      'फ़ोन किया and फ़ोन करा, देखा, लिखा\nचाय वाला, दिल्ली वाला', ['morphemes'], ''],
    ['lexical-integrity', 'word', 'Lexical integrity', '',
      'The principle that syntax treats words as wholes: it cannot move or separate the pieces inside a word. LFG assumes it; Distributed Morphology does not. In Hindi, नहीं cannot come between खा and -ता.',
      'वह नहीं खाता\n* वह खा नहीं ता', ['morphemes', 'complex'], 'Bresnan and Mchombo (1995), The Lexical Integrity Principle'],
    // Sentence structure
    ['ergativity', 'sentence', 'Ergativity and split ergativity', '',
      'In an ergative pattern the subject of a transitive verb is marked differently from the subject of an intransitive one. Hindi is ergative only in the perfective (a split by aspect): there the transitive subject takes ने.',
      'राम ने रोटी खाई (perfective, transitive: ने)\nराम सोया (intransitive: no ने)\nराम रोटी खाता है (habitual: no ने)', ['ne', 'transitivity'], 'Dixon (1994), Ergativity'],
    ['dom', 'sentence', 'Differential object marking', '',
      'Marking only some direct objects, usually those that are animate, specific or definite. Hindi marks such objects with को and leaves others bare.',
      'राम ने लड़की को देखा\nमैंने किताब पढ़ी\nमैंने उस किताब को पढ़ा', ['dom'], 'Aissen (2003), Differential object marking'],
    ['agreement', 'sentence', 'Agreement and default agreement', 'अन्विति',
      'A word changing form to match another. The Hindi verb agrees in gender and number with the highest noun phrase that has no case marker. If every noun phrase is marked, the verb takes a default form: masculine singular.',
      'लड़कियाँ आईं (agrees with लड़कियाँ)\nलड़कियों ने खाना खाया (agrees with खाना)\nलड़कियों ने किताबों को पढ़ा (default)', ['agreement', 'genitive'], 'Bhatt (2005), Long distance agreement in Hindi-Urdu'],
    ['lda', 'sentence', 'Long-distance agreement', '',
      'Agreement of a verb with a noun phrase inside a lower, non-finite clause. In राम ने रोटी खानी चाही, both खानी and चाही agree with रोटी.',
      'राम ने रोटी खानी चाही\nराम ने रोटी खाना चाहा', ['agreement'], 'Bhatt (2005), Long distance agreement in Hindi-Urdu'],
    ['light-verb', 'sentence', 'Light verb and vector verb', '',
      'A verb that has lost most of its own meaning and adds a nuance to another verb. In a compound verb the second verb (the vector: लेना, देना, जाना, डालना) adds completion, direction or attitude.',
      'खा लिया, लिख दिया, सो गया, तोड़ डाला', ['complex'], 'Hook (1974), The Compound Verb in Hindi'],
    ['conjunct-verb', 'sentence', 'Conjunct verb', '',
      'A noun or adjective plus a light verb (करना, होना, देना) that together work like one verb. Whether the noun is still an object is debated: in उसकी मदद की, की agrees with मदद.',
      'मदद करना, काम करना, शुरू होना, साफ़ करना', ['complex'], 'Mohanan (1994), Argument Structure in Hindi'],
    ['pro-drop', 'sentence', 'Pro-drop and pro', '',
      'Leaving out a subject or object that is clear from context. Some analyses keep it in the tree as an understood pronoun, written pro; others say there is nothing there. HindiTree\'s Method 1 draws pro.',
      'खा लिया? [NP=S pro] [NP=dO pro]\nमैंने खा लिया [NP=dO pro]\nदरवाज़ा खोलो [NP=S pro]', ['transitivity'], ''],
    ['empty-slot', 'sentence', 'Empty slot, zero morpheme and pro', '',
      'Three different silences. pro is an understood argument: it refers to someone or something (the eater in खा लिया). ∅ marks a position or exponent with no content: an empty slot. A zero morpheme, strictly, is a piece with a meaning but no sound (English sheep, plural). A paper must say which one it means: an empty aspect slot in the simple future (खाऊँगा) is ∅ with no meaning, not a zero morpheme. The neutral term for any silent position is an empty category, often written e.',
      'खा लिया: [NP=S pro], an understood "I" or "you"\nखाऊँगा: [ASP ∅], an aspect position with nothing in it\nsheep (plural): a zero morpheme, plural meaning without sound', ['tense', 'transitivity', 'morphemes'], ''],
    ['finiteness', 'sentence', 'Finiteness', '',
      'A finite verb form carries tense or mood and person (है, था, खाऊँगा, खाता हूँ); a non-finite form does not (participles खाता, खा रहा, खाया; the infinitive खाना). A main clause needs a finite form.',
      'वह खाता है (finite: है)\nवह खाता (non-finite alone: only after नहीं or in अगर … तो)', ['tense', 'morphemes'], ''],
    ['copula-support', 'sentence', 'Copula support (होना-support)', '',
      'When the last verb of a clause is a participle, which cannot carry tense, होना is added to carry it: है, था, होगा. English does the same with do (do-support: He did not eat). The simple future needs no support, because the future ending goes straight onto the verb.',
      'खा रहा + है / था / होगा\nखा चुका + है / था / होगा\nखाऊँगा (no support needed)', ['tense', 'morphemes'], 'Chomsky (1957), Syntactic Structures (do-support)'],
    ['subjunctive', 'meaning', 'Subjunctive', '',
      'A mood for possibility, wishes and suggestions. Hindi marks it with person endings on the stem (-ऊँ, -ए, -एँ, -ओ). The future is the subjunctive plus -गा: खा-ऊँ-गा. होना\'s third-person subjunctive is हो, so होगा = हो + गा and होंगे = हों + गे.',
      'मैं खाऊँ? (shall I eat?)\nशायद वह घर पर हो (he may be at home)\nखाऊँ + गा → खाऊँगा; हो + गा → होगा', ['tense', 'morphemes'], 'Kachru (2006), Hindi'],
    ['dative-subject', 'sentence', 'Dative (experiencer) subject', '',
      'A subject marked with को, typical of verbs of feeling, perceiving and needing. It behaves like a subject in some tests (it can bind अपना) though it is not in the nominative.',
      'मुझे भूख लगी\nमुझे अपना घर याद आया', ['subject'], 'Kachru, Bhatia and Subbarao (1976), The notion "subject"'],
    ['scrambling', 'sentence', 'Scrambling', '',
      'Changing the order of the phrases of a clause without changing its basic meaning, usually for topic or focus. Hindi allows much scrambling around a basic SOV order.',
      'राम ने सीता को किताब दी\nकिताब राम ने सीता को दी\nराम ने किताब दी सीता को', ['order'], 'Mahajan (1990); Kidwai (2000)'],
    ['correlative', 'sentence', 'Correlative', '',
      'A relative clause that stands at the start of the sentence and is picked up by a demonstrative in the main clause: जो … वह.',
      'जो लड़की खड़ी है वह लंबी है\nजिसने जो देखा उसने वह बताया', ['clauses'], 'Srivastav (1991), The syntax and semantics of correlatives'],
    ['silent-element', 'sentence', 'Abstract (silent) element', '',
      'A node in the tree with no pronounced word, used to show something the analysis claims is there. Thomas writes (pres) and (past) under TENSE; HindiTree adds (hab), (perf), pro and ∅.',
      'खाता है: [V खाता] [AUX [HAB (hab)] [TENSE है]]\nदी: [V दी] [AUX [TENSE (past)]]', ['tense', 'morphemes', 'transitivity'], 'Thomas (1993), Beginning Syntax'],
    // Meaning
    ['aspect', 'meaning', 'Aspect and tense', 'पक्ष और काल',
      'Tense places an event in time (past, present, future). Aspect says how the event is viewed: as a whole, in progress, as a habit. Hindi marks aspect on the verb (-ता, रहा, -या) and tense on the auxiliary (है, था).',
      'आता है (habitual, present)\nआ रहा था (progressive, past)\nआया है (perfective, present)', ['tense', 'ta'], 'Comrie (1976), Aspect; Comrie (1985), Tense'],
    ['perfective', 'meaning', 'Perfective and perfect', '',
      'Perfective is an aspect: the event is seen as a complete whole (आया). Perfect is a relation to a later time: a past event relevant to now (आया है) or to a past moment (आया था). The two are easily confused because English uses "perfect" for both.',
      'वह आया (perfective)\nवह आया है (perfect, present)\nवह आया था (perfect, past)', ['tense'], 'Comrie (1976), Aspect'],
    ['habitual', 'meaning', 'Habitual', '',
      'An aspect describing a regular or characteristic event, not a single one. Hindi marks it with -ता.',
      'वह रोज़ आता है\nवह पहले यहाँ रहता था', ['ta', 'tense'], ''],
    ['resultative', 'meaning', 'Resultative state', '',
      'A state that results from an earlier event, expressed with a perfective form. दरवाज़ा खुला है describes the door\'s state now, not a past event of opening.',
      'दरवाज़ा खुला है\nवह बैठा है', ['tense'], ''],
    ['presumptive', 'meaning', 'Presumptive mood', 'वृत्ति',
      'A mood for a guess or an inference: "must be, must have". In Hindi it uses होगा and is often mistaken for a future tense.',
      'वह आया होगा (he must have come)\nवह घर पर होगा (he must be at home)', ['tense'], ''],
    ['counterfactual', 'meaning', 'Counterfactual and "fake imperfective"', '',
      'A sentence about what did not happen. Many languages use an imperfective form for it without any habitual meaning; Hindi uses -ता in अगर … तो.',
      'अगर वह आता तो मैं जाता\nअगर मैं राजा होता', ['ta'], 'Iatridou (2000), The grammatical ingredients of counterfactuality'],
    ['reichenbach', 'meaning', 'Event, reference and speech time', '',
      'Reichenbach\'s three points for describing tenses: E (when the event happens), R (the time it is viewed from) and S (when we speak). आया है: E before R, R = S. आया था: E before R, R before S.',
      'आया: E before S\nआया है: E before R, R = S\nआया था: E before R, R before S', ['tense'], 'Reichenbach (1947), Elements of Symbolic Logic'],
    ['polysemy', 'meaning', 'Polysemy and multifunctionality', '',
      'One form with several related meanings or functions. The opposite assumption, "one form, one meaning", is called isomorphism. A multifunctional account must say which context selects which function.',
      '-ता: habit (आता है), counterfactual (अगर आता), adjective (बहता पानी)', ['ta'], 'Haspelmath (2003), The geometry of grammatical meaning'],
    // Language change
    ['analogy', 'change', 'Analogy', 'सादृश्य',
      'Building a new form on the model of existing ones, often written as a four-part proportion. Speakers form करा on the model of देखा.',
      'देखना : देखा :: करना : करा\nwalk : walked :: go : goed (child English)', ['morphemes'], 'Hock (1991), Principles of Historical Linguistics'],
    ['regularisation', 'change', 'Regularisation', '',
      'An irregular form is replaced by one built by the regular rule. करा for किया regularises the perfective of करना.',
      'किया → करा\nholp → helped (English)', ['morphemes'], ''],
    ['levelling', 'change', 'Paradigm levelling', '',
      'Reducing the variety of stems within a paradigm. करना had two stems, कर- and कि- (किया); with करा, कर- is used throughout.',
      'कर-ता, कर-ेगा, कर-ना, कि-या → कर-ा', ['morphemes'], ''],
    ['grammaticalisation', 'change', 'Grammaticalisation', 'व्याकरणीकरण',
      'A word with its own meaning gradually becomes a grammatical marker. Hindi रहना became the progressive रहा; nouns like ओर became parts of postpositions (की ओर).',
      'रहना → आ रहा है\nओर (side) → की ओर (towards)\nलेना → खा लिया', ['genitive', 'complex'], 'Hopper and Traugott (2003), Grammaticalization'],
    // Method
    ['judgement', 'method', 'Acceptability judgement and gradience', '',
      'A speaker\'s sense of whether a sentence is possible. Judgements are often gradient rather than yes or no; HindiTree marks them *, ?, ??, # and %.',
      '* राम ने सोया\n? उसने खाना नहीं खा लिया\n% मैंने छींका', ['judgements'], 'Sprouse and Almeida (2012)'],
    ['minimal-pair', 'method', 'Minimal pair', '',
      'Two sentences that differ in exactly one point, so any difference in acceptability can be put down to that point.',
      'राम ने रोटी खाई\n* राम ने रोटी खाया', ['machines', 'judgements'], 'Warstadt and others (2020), BLiMP'],
    ['overgeneration', 'method', 'Over- and undergeneration', '',
      'A grammar overgenerates if it accepts sentences speakers reject, and undergenerates if it rejects sentences they accept. The Workbench reports both.',
      'Overgeneration: accepts * राम आती है\nUndergeneration: rejects वह गाता हुआ चला गया', ['judgements', 'synthesis'], ''],
    ['economy', 'method', 'Economy as an explanation', '',
      'Explaining a missing word as left out "to save effort". To be testable, economy must predict where the word can be left out and where not, and that putting it back changes nothing.',
      'वह नहीं आता (है absent) but ? वह रोज़ आता\nबहता पानी and बहता हुआ पानी, but बहती गंगा', ['ta'], ''],
  ].map(([id, area, term, hi, text, examples, see, read]) => ({ id, area, term, hi, text, examples, see, read }));

  const byId = (id) => CONCEPTS.find((c) => c.id === id);

  /** Concepts linked to a Whatzit? question, for the links shown there. */
  const forStation = (stationId) => CONCEPTS.filter((c) => c.see.includes(stationId));

  /** Draws the tab. lab gives { data, save, open }. */
  function render(el, lab) {
    const { data, save, open } = lab;
    const state = data.concepts || (data.concepts = { mine: [], area: '', query: '' });
    if (!Array.isArray(state.mine)) state.mine = [];
    const stations = (HT.whatzit && HT.whatzit.STATIONS) || [];
    const stationTitle = (id) => (stations.find((x) => x.id === id) || { title: id }).title;
    const focus = state.focus;
    state.focus = '';

    const entries = [
      ...CONCEPTS,
      ...state.mine.map((m) => ({ ...m, mine: true, see: [], read: '' })),
    ];
    const q = (state.query || '').trim().toLowerCase();
    const shown = entries.filter((c) => (!state.area || c.area === state.area)
      && (!q || `${c.term} ${c.hi} ${c.text} ${c.examples}`.toLowerCase().includes(q)));

    const card = (c) => `<details class="card concept" id="concept-${esc(c.id)}" ${c.id === focus ? 'open' : ''}>
      <summary><b>${esc(c.term)}</b>${c.hi ? ` <span lang="hi">${esc(c.hi)}</span>` : ''}
        <span class="concept-area">${esc((AREAS.find(([a]) => a === c.area) || ['', ''])[1])}${c.mine ? ' · mine' : ''}</span></summary>
      <p>${esc(c.text)}</p>
      ${c.examples ? `<pre class="concept-ex" lang="hi">${esc(c.examples)}</pre>` : ''}
      ${c.see.length ? `<p class="concept-see">In Whatzit?: ${c.see.map((id) => `<button class="link" data-station="${esc(id)}">${esc(stationTitle(id))}</button>`).join(', ')}</p>` : ''}
      ${c.read ? `<p class="hint">Reading: ${esc(c.read)}</p>` : ''}
      ${c.mine ? `<div class="row"><button class="btn small" data-edit="${esc(c.id)}">Edit</button><button class="btn small danger" data-del="${esc(c.id)}">Delete</button></div>` : ''}
    </details>`;

    const editing = state.mine.find((m) => m.id === state.editing);
    el.innerHTML = `
      <header class="page-head"><p>Linguistic terms explained with Hindi data. Each term links to the Whatzit? questions where it matters.
        Add your own terms as you learn them; they are kept in this browser with the Lab.</p></header>
      <section class="card">
        <div class="row concept-tools">
          <input id="concept-q" type="search" placeholder="Search terms, Hindi words…" value="${esc(state.query || '')}" aria-label="Search concepts">
          <div class="row">${[['', 'All'], ...AREAS].map(([a, name]) =>
            `<button class="chip ${state.area === a ? 'first' : ''}" data-area="${a}">${esc(name)}</button>`).join('')}</div>
          <button class="btn small" id="concept-new">New term</button>
        </div>
        <p class="hint">${shown.length} of ${entries.length} terms.</p>
      </section>
      ${state.editing !== undefined && state.editing !== null ? `<section class="card concept-form">
        <h2>${editing ? 'Edit term' : 'New term'}</h2>
        <label class="wz-field">Term<input id="cf-term" value="${esc(editing ? editing.term : '')}" maxlength="120"></label>
        <label class="wz-field">Hindi term (optional)<input id="cf-hi" value="${esc(editing ? editing.hi : '')}" maxlength="120"></label>
        <label class="wz-field">Area<select id="cf-area">${AREAS.map(([a, name]) => `<option value="${a}" ${(editing ? editing.area : 'word') === a ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
        <label class="wz-field">Explanation<textarea id="cf-text" rows="4">${esc(editing ? editing.text : '')}</textarea></label>
        <label class="wz-field">Hindi examples, one per line<textarea id="cf-ex" rows="4">${esc(editing ? editing.examples : '')}</textarea></label>
        <div class="row"><button class="btn primary small" id="cf-save">Save</button><button class="btn small" id="cf-cancel">Cancel</button></div>
      </section>` : ''}
      <div class="concept-list">${shown.map(card).join('') || '<p class="hint">No term matches.</p>'}</div>`;

    const rerender = () => render(el, lab);
    const search = el.querySelector('#concept-q');
    search.oninput = () => {
      state.query = search.value;
      save(data);
      const pos = search.selectionStart;
      rerender();
      const again = el.querySelector('#concept-q');
      again.focus();
      again.setSelectionRange(pos, pos);
    };
    el.querySelectorAll('[data-area]').forEach((b) => { b.onclick = () => { state.area = b.dataset.area; save(data); rerender(); }; });
    el.querySelectorAll('[data-station]').forEach((b) => { b.onclick = () => open('whatzit', b.dataset.station); });
    el.querySelector('#concept-new').onclick = () => { state.editing = ''; rerender(); };
    el.querySelectorAll('[data-edit]').forEach((b) => { b.onclick = () => { state.editing = b.dataset.edit; rerender(); }; });
    el.querySelectorAll('[data-del]').forEach((b) => {
      b.onclick = () => {
        const m = state.mine.find((x) => x.id === b.dataset.del);
        if (m && window.confirm(`Delete your term “${m.term}”?`)) {
          state.mine = state.mine.filter((x) => x !== m);
          save(data);
          rerender();
        }
      };
    });
    const form = el.querySelector('.concept-form');
    if (form) {
      form.querySelector('#cf-cancel').onclick = () => { state.editing = null; rerender(); };
      form.querySelector('#cf-save').onclick = () => {
        const term = form.querySelector('#cf-term').value.trim();
        if (!term) return HT.util.toast('Write the term first.');
        const entry = {
          id: editing ? editing.id : `mine-${Date.now().toString(36)}`,
          term: term.slice(0, 120), hi: form.querySelector('#cf-hi').value.trim().slice(0, 120),
          area: form.querySelector('#cf-area').value, text: form.querySelector('#cf-text').value.trim().slice(0, 5000),
          examples: form.querySelector('#cf-ex').value.trim().slice(0, 5000),
        };
        state.mine = editing ? state.mine.map((x) => (x === editing ? entry : x)) : [...state.mine, entry];
        state.editing = null;
        state.focus = entry.id;
        save(data);
        rerender();
        return undefined;
      };
    }
    if (focus) {
      const target = el.querySelector(`#concept-${CSS.escape(focus)}`);
      if (target) target.scrollIntoView({ block: 'center' });
    }
  }

  HT.concepts = { render, CONCEPTS, AREAS, byId, forStation };
})(globalThis.HT = globalThis.HT || {});
