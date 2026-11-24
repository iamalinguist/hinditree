/*
 * Hindi Lab, Whatzit? tab: a sequence of research questions on Hindi
 * syntax. Each station gives competing hypotheses, the Hindi evidence that
 * decides between them, how the argument goes, readings, and what HindiTree
 * can do for it. The reader's status and positions are kept with the Lab
 * data (in this browser, and in Export Lab).
 *
 * References are given as author, year and title so they can be found. Check
 * each one before citing it.
 */
(function (HT) {
  'use strict';
  const { esc } = HT.util;

  const PHASES = [
    { id: 'units', name: 'Foundations', hi: 'आधार', blurb: 'What are the units?' },
    { id: 'marking', name: 'Case and agreement', hi: 'कारक-चिह्न और अन्विति', blurb: 'How are arguments marked?' },
    { id: 'clause', name: 'Predicate and clause', hi: 'विधेय और उपवाक्य', blurb: 'How is the clause built?' },
    { id: 'method', name: 'Method and synthesis', hi: 'पद्धति और संश्लेषण', blurb: 'How sure are we, and what does it add up to?' },
  ];

  const STATUSES = [['', 'Not started'], ['reading', 'Reading'], ['data', 'Collecting data'], ['arguing', 'Arguing'], ['written', 'Written up']];

  const STATIONS = [
    {
      id: 'categories', phase: 'units', title: 'Word categories', hi: 'शब्द-भेद',
      question: 'Are यह, वह, ये, वे one category or two? More generally: are Hindi word classes fixed by form, by position or by meaning?',
      hypotheses: [
        ['Two categories', 'Before a noun they are determiners (सार्वनामिक विशेषण); alone they are pronouns (सर्वनाम). This is the traditional grammar and Method 1.'],
        ['One category', 'A pronoun is a determiner without a noun after it (an "intransitive D"). वह and वह कुत्ता share one head; only the second has a complement.'],
      ],
      evidence: `# Same distance contrast in both uses
यह कुत्ता भौंका
वह कुत्ता भौंका
वह भौंका
# Same oblique form before case in both uses
उस कुत्ते ने खाना खाया
उसने खाना खाया
# A determiner with an adjective and no noun
% वह मोटा भौंका
वह मोटा वाला भौंका`,
      argument: [
        'List every property the two uses share (distance, number, oblique form, honorific plural) and every property they do not.',
        'If the pronoun is a D whose noun is missing, it should behave like noun ellipsis (वह लाल वाला). Test whether it does.',
        'A shared paradigm (the same oblique उस, इस, उन, इन) is evidence for one item; a difference you cannot derive from "noun present or not" is evidence for two.',
      ],
      tool: 'The tree now glosses वह as "that" (DET) or "he/she/it (far)" (PRO). Compare both in Method 1 and Method 4, and use the Word categories tab for test frames.',
      readings: ['Kamta Prasad Guru (1920), हिंदी व्याकरण', 'Paul Postal (1966), On so-called pronouns in English', 'Steven Abney (1987), The English noun phrase in its sentential aspect (MIT dissertation)', 'Yamuna Kachru (2006), Hindi (John Benjamins)'],
      output: 'A short squib: "Hindi third-person pronouns are determiners".',
      next: 'If pronouns are determiners, is there a D in every Hindi noun phrase?',
    },
    {
      id: 'dp', phase: 'units', title: 'Is there a DP?', hi: 'निर्धारक पदबंध',
      question: 'Hindi has no articles. Does the noun phrase still project a determiner phrase (DP), or is it a bare NP?',
      hypotheses: [
        ['NP only', 'Languages without articles lack DP, and this shows in freer extraction and scrambling out of the noun phrase (Bošković).'],
        ['DP everywhere', 'D is present but often silent; bare nouns get definite, indefinite or kind readings from it (Longobardi; Dayal on Hindi bare nouns).'],
      ],
      evidence: `# Fixed order: demonstrative, numeral, adjective, noun
वे तीन मोटे कुत्ते
* तीन वे मोटे कुत्ते
* मोटे वे तीन कुत्ते
# A bare noun can be definite or indefinite
कुत्ता भौंक रहा है
मैंने कल कुत्ता देखा
# एक as an indefinite article?
एक लड़का आया`,
      argument: [
        'Collect the readings of bare singular and plural nouns in subject and object position.',
        'Test the NP/DP diagnostics (left-branch extraction, adjunct extraction, scrambling out of NP) on Hindi.',
        'Decide whether एक is a numeral or is becoming an indefinite article; that bears on whether D can be overt.',
      ],
      tool: 'Method 4 (X-bar) draws D; Method 1 draws DET inside NP. Run the same phrases in both and note what each predicts.',
      readings: ['Veneeta Dayal (2004), Number marking and (in)definiteness in kind terms, Linguistics and Philosophy', 'Željko Bošković (2008), What will you have, DP or NP?', 'Giuseppe Longobardi (1994), Reference and proper names, Linguistic Inquiry', 'Guglielmo Cinque (2005), Deriving Greenberg\'s Universal 20 and its exceptions, Linguistic Inquiry'],
      output: 'A paper on the Hindi noun phrase as evidence in the NP/DP debate.',
      next: 'Once the noun phrase is settled, look at what marks it: ने and को.',
    },
    {
      id: 'ne', phase: 'marking', title: 'What licenses ने?', hi: 'ने का नियम',
      question: 'ने appears on subjects of perfective transitive verbs. Why do some transitives refuse it and some intransitives allow it?',
      hypotheses: [
        ['Structural', 'ने is an ergative case assigned in perfective clauses with a transitive (v) head; exceptions are lexical.'],
        ['Semantic', 'ने marks a conscious, volitional agent; it follows from meaning, which is why unergatives like छींकना can take it.'],
      ],
      evidence: `# The basic split
राम ने रोटी खाई
* राम ने रोटी खाता है
* राम ने सोया
# Transitives without ने
* राम ने किताब लाया
राम किताब लाया
# Intransitives with ने
% मैंने छींका
% मैं छींका`,
      argument: [
        'Make a list of exceptions in both directions (लाना, बोलना, समझना; छींकना, खाँसना, नहाना).',
        'For each, ask speakers and a corpus: is ने optional, and does it change the meaning (deliberate vs involuntary)?',
        'A structural account predicts no meaning difference; a semantic one predicts one. Also check regional varieties where ने is lost.',
      ],
      tool: 'The starter data set "ने, aspect and agreement" in the Workbench already has these sentences. Run it against each method.',
      readings: ['Tara Mohanan (1994), Argument Structure in Hindi (CSLI)', 'Miriam Butt (2006), Theories of Case (Cambridge)', 'Miriam Butt and Tracy Holloway King (2004), The status of case', 'Anoop Mahajan (1990), The A/A-bar distinction and movement theory (MIT dissertation)'],
      output: 'A data paper on ने with intransitive and "exceptional" transitive verbs, with corpus counts.',
      next: 'ने marks subjects; को marks some objects. Look at the object next.',
    },
    {
      id: 'dom', phase: 'marking', title: 'When does को mark an object?', hi: 'कर्म पर को',
      question: 'Some direct objects take को and some do not. Is it animacy, specificity, definiteness, or all of them?',
      hypotheses: [
        ['Scales', 'Objects high on animacy and definiteness scales are marked (differential object marking).'],
        ['Specificity', 'को marks specific objects whatever their animacy; animacy only makes specificity more likely.'],
      ],
      evidence: `# Animate objects
राम ने लड़की को देखा
राम ने एक लड़की देखी
# Inanimate objects
मैंने किताब पढ़ी
मैंने वह किताब पढ़ी
मैंने उस किताब को पढ़ा
# Agreement stops at को
मैंने लड़कियों को देखा`,
      argument: [
        'Cross animacy (human, animal, thing) with definiteness (bare, एक, यह/वह, proper name) and collect judgements for every cell.',
        'Note the agreement in each sentence: with को the verb stops agreeing with the object.',
        'Decide which factor predicts को best, and whether any cell is truly optional.',
      ],
      tool: 'Use the Judgements tab marks (?, %, #) for gradient answers. The kāraka view shows को objects as k2.',
      readings: ['Judith Aissen (2003), Differential object marking: iconicity vs. economy, NLLT', 'Tara Mohanan (1994), Argument Structure in Hindi', 'Helen de Hoop and Bhuvana Narasimhan (2005), Differential case-marking in Hindi'],
      output: 'A judgement study of को across animacy and definiteness.',
      next: 'ने and को both block agreement. So what does the verb agree with?',
    },
    {
      id: 'agreement', phase: 'marking', title: 'Agreement', hi: 'अन्विति',
      question: 'The verb agrees with the highest NP that has no case marker. How far can agreement reach, and into which clauses?',
      hypotheses: [
        ['Closest goal', 'The verb agrees with the closest unmarked NP, even inside an infinitive clause (long-distance agreement through Agree).'],
        ['Restructuring', 'Long-distance agreement happens only when the two verbs form one complex predicate.'],
      ],
      evidence: `# Agreement with the unmarked NP
लड़कियाँ आईं
लड़कियों ने खाना खाया
# Default agreement when every NP is marked
लड़कियों ने किताबों को पढ़ा
# Long-distance agreement
राम ने रोटी खानी चाही
राम ने रोटी खाना चाहा`,
      argument: [
        'State the local rule precisely and test it on every case combination.',
        'Collect long-distance agreement with different matrix verbs (चाहना, सीखना, भूलना). Which ones allow it?',
        'If it depends on the verb, that supports restructuring; if it depends only on case, that supports Agree.',
      ],
      tool: 'Functions in the tree show which NP is the subject; compare it with the verb\'s gender and number.',
      readings: ['Rajesh Bhatt (2005), Long distance agreement in Hindi-Urdu, NLLT', 'Stefan Keine (2020), Probes and Their Horizons (MIT Press)', 'Miriam Butt (1995), The Structure of Complex Predicates in Urdu (CSLI)'],
      output: 'A survey of which matrix verbs allow long-distance agreement.',
      next: 'Restructuring is a kind of complex predicate. Look at complex predicates head-on.',
    },
    {
      id: 'complex', phase: 'clause', title: 'Complex predicates', hi: 'संयुक्त और मिश्र क्रिया',
      question: 'Are compound verbs (खा लेना) and conjunct verbs (मदद करना) one word, one predicate built in syntax, or two separate verbs?',
      hypotheses: [
        ['One word', 'They are formed in the lexicon and behave as a single verb.'],
        ['One predicate, two words', 'They are separate words in the syntax that combine their argument structures (complex predicate formation).'],
      ],
      evidence: `# Compound verbs and negation
उसने खाना खा लिया
? उसने खाना नहीं खा लिया
# Conjunct verbs: the noun can be marked and agreed with
मैंने उसकी मदद की
मैंने उसकी बहुत मदद की
# Words can come between the parts
उसने काम तो किया`,
      argument: [
        'Apply word tests (negation, particles तो/भी, scrambling of the parts, coordination) to both kinds.',
        'For conjunct verbs, check what the light verb agrees with: if it agrees with the noun (मदद ... की), the noun is still an object.',
        'Different results for compound and conjunct verbs would mean they need different analyses.',
      ],
      tool: 'The "Light verbs as one verb" switch in Make Structure draws them as one V; the notes it gives (for example नहीं between the parts) are evidence.',
      readings: ['Peter Hook (1974), The Compound Verb in Hindi', 'Miriam Butt (1995), The Structure of Complex Predicates in Urdu', 'Tara Mohanan (1994), Argument Structure in Hindi', 'Miriam Butt and Gillian Ramchand (2005), Complex aspectual structure in Hindi/Urdu'],
      output: 'A paper comparing compound and conjunct verbs on the same tests.',
      next: 'Complex predicates show that case, agreement and roles do not line up. That is the subject question.',
    },
    {
      id: 'subject', phase: 'clause', title: 'Subjecthood and kāraka', hi: 'कर्ता और उद्देश्य',
      question: 'With nominative, ने and को subjects, is "subject" one notion in Hindi? And does the Pāṇinian kāraka (kartā, karma) describe Hindi better than subject and object?',
      hypotheses: [
        ['Unified subject', 'Behaviour (अपना binding, control of -कर clauses) picks out one subject, whatever its case.'],
        ['Kāraka first', 'The relevant notions are syntactico-semantic kārakas; "subject" is a by-product of kartā plus voice.'],
      ],
      evidence: `# अपना refers to the subject
राम ने श्याम को अपनी किताब दी
# A dative subject binds अपना
मुझे अपना घर याद आया
# -कर is controlled by the subject
घर जाकर राम सो गया
% घर जाकर मुझे भूख लगी
# Kartā without subject marking in the passive
किताब राम द्वारा लिखी गई`,
      argument: [
        'Apply each subject test to each kind of subject (nominative, ने, को, passive द्वारा).',
        'Make a table of which tests each passes; mismatches are the interesting cells.',
        'Ask which description, subject or kartā, predicts the table with fewer exceptions.',
      ],
      tool: 'The kāraka view (k1, k2, k4, k4a) and the Functions labels (S, dO, iO) can be shown for the same sentence. Note where they disagree.',
      readings: ['Yamuna Kachru, Tej Bhatia and K.V. Subbarao (1976), The notion "subject": a note on Hindi-Urdu, Kashmiri and Panjabi', 'Akshar Bharati, Vineet Chaitanya and Rajeev Sangal (1995), Natural Language Processing: A Paninian Perspective', 'Rafiya Begum and others (2008), Dependency annotation scheme for Indian languages', 'Tara Mohanan (1994), Argument Structure in Hindi'],
      output: 'A paper on where kāraka and grammatical relations come apart, using treebank data.',
      next: 'If subjects are defined by behaviour, word order cannot be what defines them. Look at word order.',
    },
    {
      id: 'order', phase: 'clause', title: 'Word order and scrambling', hi: 'पद-क्रम',
      question: 'Hindi allows many orders. Is there one basic order with movement, and what kind of movement is scrambling?',
      hypotheses: [
        ['Movement', 'SOV is basic; other orders come from scrambling, which can behave like A- or A-bar movement.'],
        ['Free base', 'There is no single basic order; the orders are generated directly and differ only in information structure.'],
      ],
      evidence: `# All orders of a ditransitive
राम ने सीता को किताब दी
किताब राम ने सीता को दी
सीता को राम ने किताब दी
# Rightward placement
राम ने किताब दी सीता को
# Binding after scrambling
हर लड़के को उसकी माँ ने बुलाया`,
      argument: [
        'Use the constituency tests to find which strings move as units.',
        'Check binding and quantifier scope after each kind of scrambling: A-movement changes binding, A-bar movement does not.',
        'Record the context each order needs (topic, focus, afterthought).',
      ],
      tool: 'The Constituency tests tab, and the Corpus for real examples of each order.',
      readings: ['Anoop Mahajan (1990), The A/A-bar distinction and movement theory', 'Ayesha Kidwai (2000), XP-Adjunction in Universal Grammar: Scrambling and Binding in Hindi-Urdu (Oxford)', 'Rajesh Bhatt and Veneeta Dayal (2007), Rightward scrambling as rightward remnant movement, Linguistic Inquiry'],
      output: 'A corpus-and-judgement study of one order, for example rightward scrambling.',
      next: 'Movement is also at the heart of relative clauses. Look at correlatives.',
    },
    {
      id: 'clauses', phase: 'clause', title: 'Correlatives and कि-clauses', hi: 'संबंधवाचक और कि-उपवाक्य',
      question: 'How are जो ... वह correlatives built, and why do कि-clauses follow the verb?',
      hypotheses: [
        ['Adjunction', 'The जो-clause is adjoined to the main clause and linked to वह by a quantifier-like relation.'],
        ['Noun modifier', 'The relative clause starts next to its noun and is moved or extraposed.'],
      ],
      evidence: `# Three positions for the relative clause
जो लड़की खड़ी है वह लंबी है
वह लड़की जो खड़ी है लंबी है
वह लड़की लंबी है जो खड़ी है
# Multiple correlatives
जिसने जो देखा उसने वह बताया
# कि-clause after the verb
राम ने कहा कि वह आएगा
* राम ने कि वह आएगा कहा`,
      argument: [
        'Compare the three positions on meaning (definiteness, uniqueness) and on locality (can the जो-phrase be inside an island?).',
        'Multiple correlatives have no English counterpart: work out what any analysis must say about them.',
        'For कि-clauses, test whether the clause can ever stay before the verb, and what a pronoun (यह) before the verb adds.',
      ],
      tool: 'Method 4 parses relative clauses on objects; note which correlatives it cannot parse yet.',
      readings: ['Veneeta Srivastav (1991), The syntax and semantics of correlatives, NLLT', 'Veneeta Dayal (1996), Locality in WH Quantification (Kluwer)', 'Rajesh Bhatt (2003), Locality in correlatives, NLLT'],
      output: 'A paper on one correlative puzzle, with new judgement data.',
      next: 'By now you rely on many judgements. How reliable are they?',
    },
    {
      id: 'judgements', phase: 'method', title: 'Judgements as data', hi: 'स्वीकार्यता के आँकड़े',
      question: 'How stable are the judgements in the Hindi literature across speakers and regions, and where is acceptability gradient?',
      hypotheses: [
        ['Reliable', 'Textbook judgements replicate in formal experiments, as they largely do for English.'],
        ['Variable', 'Many Hindi judgements vary by region and by contact with other languages (for example ने in eastern varieties).'],
      ],
      evidence: `# Sentences worth testing with many speakers
% मैंने छींका
% घर जाकर मुझे भूख लगी
? उसने खाना नहीं खा लिया
राम ने रोटी खानी चाही`,
      argument: [
        'Choose 20 to 40 judgements from the papers you have read.',
        'Run a small rating study (for example a 1 to 7 scale) with speakers from several regions.',
        'Report which judgements replicate, which are gradient, and which vary by region.',
      ],
      tool: 'The % mark in the Workbench records disagreement; keep one data set per speaker group to compare them.',
      readings: ['Jon Sprouse and Diogo Almeida (2012), Assessing the reliability of textbook data in syntax, Journal of Linguistics', 'Shravan Vasishth and Richard Lewis (2006), Argument-head distance and processing complexity, Language', 'Colin Masica (1991), The Indo-Aryan Languages (Cambridge)'],
      output: 'A replication study of Hindi textbook judgements.',
      next: 'Judgement data also tests machines. Turn the replicated judgements into a benchmark.',
    },
    {
      id: 'machines', phase: 'method', title: 'Hindi minimal pairs for machines', hi: 'मशीन और हिंदी व्याकरण',
      question: 'Do parsers and large language models know Hindi syntax: ने, को, agreement, long-distance agreement, correlatives?',
      hypotheses: [
        ['They know it', 'Models trained on large Hindi text prefer the grammatical member of a minimal pair.'],
        ['They do not', 'They do well on local agreement but fail where Hindi differs from English (ne, default agreement, correlatives).'],
      ],
      evidence: `# Minimal pairs: the first should be preferred
राम ने रोटी खाई
* राम ने रोटी खाया
लड़कियों ने किताबों को पढ़ा
* लड़कियों ने किताबों को पढ़ीं`,
      argument: [
        'Write minimal pairs for each phenomenon from the earlier stations, using the replicated judgements.',
        'Check what multilingual benchmarks already cover for Hindi (for example agreement) and what they leave out.',
        'Score several models; report by phenomenon, not just the average.',
      ],
      tool: 'The parser and the Workbench already sort sentences into accepted and rejected: use them to check each pair before release.',
      readings: ['Alex Warstadt and others (2020), BLiMP: The Benchmark of Linguistic Minimal Pairs, TACL', 'Riyaz Ahmad Bhat and others (2017), The Hindi/Urdu Treebank Project (Handbook of Linguistic Annotation)', 'Universal Dependencies, Hindi HDTB treebank'],
      output: 'An open Hindi minimal-pair dataset and paper.',
      next: 'Bring all of it together.',
    },
    {
      id: 'synthesis', phase: 'method', title: 'Synthesis', hi: 'संश्लेषण',
      question: 'What is the grammar of Hindi that all these results add up to, and can it be stated precisely enough to run?',
      hypotheses: [
        ['A formal fragment', 'The results can be stated as one explicit grammar that a parser runs and anyone can test.'],
        ['Descriptive grammar', 'The results are better presented as a reference grammar of Hindi syntax for teaching.'],
      ],
      evidence: '',
      argument: [
        'Collect the positions from each station on this page.',
        'Check that they are consistent with each other (for example your DP answer and your agreement rule).',
        'Write them as one grammar, and keep the data sets as its test suite.',
      ],
      tool: 'My Grammar (Method 3) lets you write the grammar; the Lab data sets are its tests.',
      readings: ['Tara Mohanan (1994), Argument Structure in Hindi', 'Yamuna Kachru (2006), Hindi', 'Annie Montaut (2004), A Grammar of Hindi (Lincom)', 'Vivek Tripathi and Dinesh Rathod, the earlier HindiTree paper'],
      output: 'A monograph or open grammar of Hindi syntax, with its data.',
      next: '',
    },
  ];

  /** Draws the tab. lab gives { data, save, addToSet }. */
  function render(el, lab) {
    const { data, save, addToSet } = lab;
    const state = data.whatzit || (data.whatzit = { open: STATIONS[0].id, notes: {} });
    if (!state.notes) state.notes = {};
    if (!STATIONS.some((x) => x.id === state.open)) state.open = STATIONS[0].id;
    const index = STATIONS.findIndex((x) => x.id === state.open);
    const st = STATIONS[index];
    const note = state.notes[st.id] || {};
    const status = (id) => (state.notes[id] && state.notes[id].status) || '';
    const done = STATIONS.filter((x) => status(x.id) === 'written').length;

    const node = (x) => {
      const n = STATIONS.indexOf(x) + 1;
      return `<button class="wz-node ${x.id === st.id ? 'on' : ''} ${status(x.id) ? `s-${status(x.id)}` : ''}" data-station="${x.id}"
        aria-pressed="${x.id === st.id}" title="${esc(STATUSES.find(([v]) => v === status(x.id))[1])}">
        <span class="wz-num">${n}</span><span class="wz-name">${esc(x.title)}<span lang="hi">${esc(x.hi)}</span></span></button>`;
    };
    const mark = (line) => {
      const m = line.match(/^(\*|\?\?|\?|%|#(?=\S))\s*/);
      return m ? [m[1], line.slice(m[0].length)] : ['', line];
    };
    const evidence = st.evidence ? st.evidence.split('\n').map((line) => (line.startsWith('# ')
      ? `<li class="wz-ev-head">${esc(line.slice(2))}</li>`
      : (([m, s]) => `<li><span class="wz-mark">${esc(m)}</span><span lang="hi">${esc(s)}</span></li>`)(mark(line)))).join('') : '';

    el.innerHTML = `
      <header class="page-head"><p>Research questions on Hindi syntax, in order. For each: competing hypotheses, the Hindi evidence that decides between them,
        and how the argument goes. Each question builds on the one before. Check every reference before citing it.</p></header>
      <section class="card wz-map" aria-label="Research path">
        <div class="wz-phases">${PHASES.map((p, i) => `<div class="wz-phase">
          <p class="wz-phase-name"><b>${['I', 'II', 'III', 'IV'][i]}. ${esc(p.name)}</b><span lang="hi">${esc(p.hi)}</span><span class="hint">${esc(p.blurb)}</span></p>
          <div class="wz-line">${STATIONS.filter((x) => x.phase === p.id).map(node).join('')}</div></div>`).join('')}</div>
        <p class="hint wz-progress">${done} of ${STATIONS.length} written up.
          <span class="wz-key"><i class="s-reading"></i>reading <i class="s-data"></i>data <i class="s-arguing"></i>arguing <i class="s-written"></i>written</span></p>
      </section>

      <section class="card wz-detail">
        <p class="wz-kicker">${index + 1} of ${STATIONS.length} · ${esc(PHASES.find((p) => p.id === st.phase).name)}</p>
        <h2>${esc(st.title)} <span lang="hi">${esc(st.hi)}</span></h2>
        <p class="wz-question">${esc(st.question)}</p>
        <div class="wz-hyp">${st.hypotheses.map(([name, claim], i) => `${i ? '<span class="wz-vs">or</span>' : ''}
          <div class="wz-h"><b>H${i + 1}. ${esc(name)}</b><p>${esc(claim)}</p></div>`).join('')}</div>
      </section>

      <div class="lesson-cards">
        ${evidence ? `<section class="card lesson-card"><h2>Evidence</h2><ul class="wz-evidence">${evidence}</ul>
          <p class="hint">Starting judgements: check them with speakers.</p>
          <button class="btn small" id="wz-add">Add these to my data set</button></section>` : ''}
        <section class="card lesson-card"><h2>How the argument goes</h2><ol>${st.argument.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
          <p><b>With HindiTree:</b> ${esc(st.tool)}</p></section>
        <section class="card lesson-card"><h2>Readings</h2><ul>${st.readings.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          <p><b>Result:</b> ${esc(st.output)}</p>${st.next ? `<p class="hint"><b>Next:</b> ${esc(st.next)}</p>` : ''}</section>
        <section class="card lesson-card wz-notes"><h2>Notes</h2>
          <label class="inline">Status <select id="wz-status">${STATUSES.map(([v, name]) =>
            `<option value="${v}" ${v === (note.status || '') ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
          <label class="wz-field">Position<textarea id="wz-view" rows="5" placeholder="Which hypothesis, and why?">${esc(note.view || '')}</textarea></label>
          <label class="wz-field">Evidence and sources found<textarea id="wz-found" rows="5" placeholder="Sentences, counts, papers">${esc(note.found || '')}</textarea></label>
          <p class="hint">Kept in this browser with the Lab. Use Export Lab on the Workbench to keep a copy.</p></section>
      </div>

      <div class="row between wz-nav">
        <button class="btn small" id="wz-prev" ${index ? '' : 'disabled'}>← ${index ? esc(STATIONS[index - 1].title) : 'Previous'}</button>
        <button class="btn small" id="wz-next" ${index < STATIONS.length - 1 ? '' : 'disabled'}>${index < STATIONS.length - 1 ? esc(STATIONS[index + 1].title) : 'Next'} →</button>
      </div>`;

    const go = (id) => {
      state.open = id;
      save(data);
      render(el, lab);
      el.querySelector('.wz-detail').scrollIntoView({ block: 'nearest' });
    };
    el.querySelectorAll('[data-station]').forEach((b) => { b.onclick = () => go(b.dataset.station); });
    el.querySelector('#wz-prev').onclick = () => index && go(STATIONS[index - 1].id);
    el.querySelector('#wz-next').onclick = () => index < STATIONS.length - 1 && go(STATIONS[index + 1].id);
    const add = el.querySelector('#wz-add');
    if (add) {
      // "# Heading" lines are headings in the Workbench too; "#word" is an odd-meaning mark.
      add.onclick = () => addToSet(data, st.title, st.evidence);
    }
    const keep = () => {
      state.notes[st.id] = { status: el.querySelector('#wz-status').value, view: el.querySelector('#wz-view').value.slice(0, 20000),
        found: el.querySelector('#wz-found').value.slice(0, 20000) };
      save(data);
    };
    let timer = 0;
    el.querySelector('#wz-status').onchange = () => { keep(); render(el, lab); };
    ['#wz-view', '#wz-found'].forEach((sel) => {
      el.querySelector(sel).oninput = () => {
        clearTimeout(timer);
        timer = setTimeout(keep, 400);
      };
      el.querySelector(sel).onblur = keep;
    });
  }

  HT.whatzit = { render, STATIONS, PHASES };
})(globalThis.HT = globalThis.HT || {});
