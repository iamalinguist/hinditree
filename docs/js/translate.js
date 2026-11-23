/*
 * English to Hindi for the simple clauses taught in the course.
 *
 * This is a rule-based converter, not general machine translation. It runs
 * offline and uses the app's own lexicon. It handles SOV order, ने/को marking,
 * postpositions, tense, aspect, modals, passives, negation, agreement and a few
 * clause types. Words it does not know are kept in English and reported.
 */
(function (HT) {
  'use strict';
  const L = HT.lexicon;

  // Lexicon: English gloss to Hindi citation form
  const byGloss = (tag) => {
    const map = new Map();
    for (const e of L.citations) {
      if (e.tag !== tag || !e.gloss) continue;
      for (const g of e.gloss.toLowerCase().split('/')) if (!map.has(g)) map.set(g, e.w);
    }
    return map;
  };
  const NOUNS = byGloss('N');
  const ADJECTIVES = byGloss('A');
  const ADVERBS = new Map([...byGloss('Adv'), ...byGloss('Adv.s')]);
  const SENTENCE_ADVERBS = new Set([...byGloss('Adv.s').keys()]);
  const DEGREE = new Map([['very', 'बहुत'], ['too', 'बहुत ज़्यादा'], ['quite', 'काफ़ी'], ['rather', 'काफ़ी'], ['extremely', 'बेहद'], ['so', 'इतना'], ['really', 'सचमुच'], ['a little', 'थोड़ा']]);
  [['loudly', 'ज़ोर से'], ['soundly', 'गहरी नींद में'], ['happily', 'खुशी से'], ['carefully', 'ध्यान से'], ['well', 'अच्छा'],
    ['early', 'जल्दी'], ['late', 'देर से'], ['tomorrow', 'कल'], ['yesterday', 'कल'], ['never', 'कभी नहीं'], ['home', 'घर'],
    ['together', 'साथ'], ['again', 'फिर'], ['away', 'दूर'], ['clearly', 'स्पष्टतः'], ['actually', 'वास्तव में'], ['obviously', 'ज़ाहिर है']]
    .forEach(([e, h]) => ADVERBS.set(e, h));
  [['kid', 'बच्चा'], ['baby', 'बच्चा'], ['home', 'घर'], ['lady', 'महिला'], ['mum', 'माँ'], ['mom', 'माँ'],
    ['dad', 'पिता'], ['car', 'गाड़ी'], ['letter', 'पत्र'], ['bread', 'रोटी'], ['food', 'खाना'], ['cup', 'प्याला'],
    ['spoon', 'चम्मच'], ['song', 'गाना'], ['minister', 'मंत्री'], ['sky', 'आसमान'], ['leaf', 'पत्ता'], ['grass', 'घास'],
    ['seed', 'बीज'], ['tea', 'चाय'], ['teacher', 'शिक्षक'], ['student', 'छात्र'], ['party', 'पार्टी'],
    ['truth', 'सच'], ['work', 'काम'], ['cricket', 'क्रिकेट'], ['plate', 'थाली'], ['kitchen', 'रसोई'], ['office', 'दफ़्तर']]
    .forEach(([e, h]) => NOUNS.set(e, h));

  // Gender. Nouns in -ā are masculine and in -ī feminine, with these exceptions.
  const FEMININE = new Set(('किताब कलम गाय बात दुकान मेज़ रात शाम सड़क चाय दाल साइकिल बस ट्रेन चटाई छत दीवार चिट्ठी आँख ' +
    'आग हवा दवा भाषा कविता परीक्षा कक्षा समस्या माँ बहन औरत महिला छात्रा गायिका सीता गीता रीता मीरा नेहा अनु अंजलि सुनीता कमला ' +
    'जनता पुलिस सरकार बारिश नींद भूख खुशी मदद आदत गेंद तस्वीर कहानी खबर फ़िल्म ज़मीन बैठक चोरी छुट्टी चीज़ पार्टी थाली रसोई ' +
    'घास दोपहर सुबह कॉफ़ी मिठाई चाबी अलमारी खिड़की कुर्सी हड्डी टोपी साड़ी गाड़ी बिल्ली मछली चिड़िया लड़की बेटी दादी नानी रानी बच्ची').split(' '));
  const MASCULINE_I = new Set('आदमी हाथी पानी भाई विद्यार्थी पक्षी मंत्री दही मोती रवि'.split(' '));
  const HONORIFIC = new Set('पिता माता दादा दादी नानी चाचा शिक्षक अध्यापक राजा'.split(' '));
  const UNCHANGING = new Set('पिता राजा चाचा दादा नेता'.split(' '));
  const HUMAN = new Set(('लड़का लड़की बच्चा बच्ची आदमी औरत महिला माँ पिता भाई बहन दादी नानी दादा चाचा बेटा बेटी दोस्त लोग राजा ' +
    'रानी शिक्षक अध्यापक छात्र छात्रा विद्यार्थी डॉक्टर किसान चोर पुलिस अध्यक्ष नेता गायिका मज़दूर दुकानदार मेहमान दुश्मन मंत्री').split(' '));
  const ANIMAL = new Set('कुत्ता बिल्ली चूहा गाय घोड़ा शेर पक्षी चिड़िया मछली हाथी बंदर साँप'.split(' '));
  const NOT_PERSON = new Set('दिल्ली मुंबई भारत हिंदी अंग्रेज़ी संस्कृत सोमवार रविवार'.split(' '));
  const isProper = (w) => L.citations.some((e) => e.tag === 'N' && e.w === w && /^[A-Z]/.test(e.gloss));
  const gender = (w) => {
    if (FEMININE.has(w)) return 'f';
    if (MASCULINE_I.has(w)) return 'm';
    return /ी$|ि$/.test(w) ? 'f' : 'm';
  };

  function nounForm(w, n, oblique) {
    const g = gender(w);
    const stem = w.slice(0, -1);
    if (g === 'm') {
      if (/ा$/.test(w) && !UNCHANGING.has(w) && !isProper(w)) return n === 'sg' ? (oblique ? `${stem}े` : w) : oblique ? `${stem}ों` : `${stem}े`;
      if (n === 'sg' || !oblique) return w;
      if (/ी$/.test(w)) return `${stem}ियों`;
      if (/ा$/.test(w)) return `${w.slice(0, -1)}ाओं`;
      return `${w}ों`;
    }
    if (n === 'sg') return w;
    if (/ी$/.test(w)) return oblique ? `${stem}ियों` : `${stem}ियाँ`;
    if (/ि$/.test(w)) return oblique ? `${w}यों` : `${w}याँ`;
    if (/ा$|ाँ$/.test(w)) return oblique ? `${w}ओं` : `${w}एँ`;
    return oblique ? `${w}ों` : `${w}ें`;
  }
  // Adjectives and possessives in -ā agree: -ā, -e, -ī.
  const agreeA = (w, g, n, oblique) => (/ा$/.test(w) ? w.slice(0, -1) + (g === 'f' ? 'ी' : n === 'pl' || oblique ? 'े' : 'ा') : w);

  // Pronouns: direct, oblique, ergative, dative, genitive stem, person, number, gender
  const PRONOUNS = {
    i: ['मैं', 'मुझ', 'मैंने', 'मुझे', 'मेरा', 1, 'sg', 'm'], me: ['मैं', 'मुझ', 'मैंने', 'मुझे', 'मेरा', 1, 'sg', 'm'],
    you: ['तुम', 'तुम', 'तुमने', 'तुम्हें', 'तुम्हारा', 2, 'pl', 'm'],
    he: ['वह', 'उस', 'उसने', 'उसे', 'उसका', 3, 'sg', 'm'], him: ['वह', 'उस', 'उसने', 'उसे', 'उसका', 3, 'sg', 'm'],
    she: ['वह', 'उस', 'उसने', 'उसे', 'उसका', 3, 'sg', 'f'], her: ['वह', 'उस', 'उसने', 'उसे', 'उसका', 3, 'sg', 'f'],
    it: ['यह', 'इस', 'इसने', 'इसे', 'इसका', 3, 'sg', 'm'],
    we: ['हम', 'हम', 'हमने', 'हमें', 'हमारा', 1, 'pl', 'm'], us: ['हम', 'हम', 'हमने', 'हमें', 'हमारा', 1, 'pl', 'm'],
    they: ['वे', 'उन', 'उन्होंने', 'उन्हें', 'उनका', 3, 'pl', 'm'], them: ['वे', 'उन', 'उन्होंने', 'उन्हें', 'उनका', 3, 'pl', 'm'],
    who: ['कौन', 'किस', 'किसने', 'किसे', 'किसका', 3, 'sg', 'm'], someone: ['कोई', 'किसी', 'किसी ने', 'किसी को', 'किसी का', 3, 'sg', 'm'],
    something: ['कुछ', 'किसी', 'किसी ने', 'किसी को', 'किसी का', 3, 'sg', 'm'], what: ['क्या', 'किस', 'किसने', 'किसे', 'किसका', 3, 'sg', 'm'],
  };
  const POSSESSIVE = { my: 'मेरा', your: 'तुम्हारा', his: 'उसका', her: 'उसका', its: 'इसका', our: 'हमारा', their: 'उनका' };
  const DETERMINERS = {
    a: 'एक', an: 'एक', the: '', this: 'यह', that: 'वह', these: 'ये', those: 'वे', every: 'हर', each: 'हर', some: 'कुछ',
    all: 'सब', many: 'कई', several: 'कई', one: 'एक', two: 'दो', three: 'तीन', four: 'चार', five: 'पाँच', six: 'छह', seven: 'सात',
    eight: 'आठ', ten: 'दस', any: 'कोई', which: 'कौन सा',
  };
  const OBLIQUE_DET = { यह: 'इस', वह: 'उस', ये: 'इन', वे: 'उन' };
  const PLURAL_DET = new Set(['these', 'those', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'ten', 'many', 'several', 'all']);

  // Prepositions. "के …" postpositions take the genitive form of a pronoun.
  const PREPOSITIONS = {
    in: 'में', inside: 'के अंदर', into: 'में', on: 'पर', onto: 'पर', at: 'पर', from: 'से', with: 'के साथ', for: 'के लिए',
    under: 'के नीचे', below: 'के नीचे', near: 'के पास', behind: 'के पीछे', 'in front of': 'के सामने', above: 'के ऊपर', over: 'के ऊपर',
    by: 'के द्वारा', about: 'के बारे में', after: 'के बाद', before: 'से पहले', towards: 'की ओर', toward: 'की ओर', without: 'के बिना',
    during: 'के दौरान', between: 'के बीच', outside: 'के बाहर', beside: 'के किनारे', across: 'के पार', along: 'के साथ-साथ',
    through: 'से होकर', since: 'से', till: 'तक', until: 'तक', to: 'को', of: 'का', like: 'की तरह', against: 'के ख़िलाफ़',
  };
  const PREP_WORDS = Object.keys(PREPOSITIONS).sort((a, b) => b.split(' ').length - a.split(' ').length);

  // Verbs: English lemma to Hindi
  const VERBS = new Map();
  const addVerb = (english, v) => {
    if (!VERBS.has(english)) VERBS.set(english, []);
    VERBS.get(english).push(v);
  };
  for (const v of L.verbData) {
    for (const g of v.gloss.toLowerCase().split('/')) addVerb(g, { stem: v.stem, classes: v.classes, perfBase: v.perfBase });
  }
  const KAR = { stem: 'कर', perfBase: 'कि' };
  [
    ['like', { ...KAR, prefix: 'पसंद', classes: ['trans'] }], ['love', { ...KAR, prefix: 'प्यार', classes: ['trans'], object: 'से' }],
    ['work', { ...KAR, prefix: 'काम', classes: ['intrans'] }], ['help', { ...KAR, prefix: 'मदद', classes: ['trans'], object: 'की', agree: 'f' }],
    ['talk', { ...KAR, prefix: 'बात', classes: ['intrans'], object: 'से', agree: 'f' }],
    ['wait', { ...KAR, prefix: 'इंतज़ार', classes: ['intrans'], object: 'का' }],
    ['clean', { ...KAR, prefix: 'साफ़', classes: ['trans'] }], ['close', { ...KAR, prefix: 'बंद', classes: ['trans'] }],
    ['shut', { ...KAR, prefix: 'बंद', classes: ['trans'] }], ['start', { ...KAR, prefix: 'शुरू', classes: ['trans'] }],
    ['begin', { ...KAR, prefix: 'शुरू', classes: ['trans'] }], ['finish', { ...KAR, prefix: 'ख़त्म', classes: ['trans'] }],
    ['study', { stem: 'पढ़', classes: ['intrans', 'trans'] }], ['listen', { stem: 'सुन', classes: ['trans'], object: 'को' }],
    ['kill', { stem: 'मार', classes: ['trans'] }], ['stay', { stem: 'रह', classes: ['intrans'] }], ['reach', { stem: 'पहुँच', classes: ['intrans'] }],
    ['cook', { stem: 'पका', classes: ['trans'] }], ['want', { stem: 'चाह', classes: ['trans'] }], ['have', { stem: 'रख', classes: ['trans'] }],
    ['visit', { stem: 'जा', perfBase: 'ग', classes: ['intrans'] }], ['travel', { stem: 'घूम', classes: ['intrans'] }],
    ['wave', { stem: 'हाथ हिला', classes: ['intrans'] }], ['laugh', { stem: 'हँस', classes: ['intrans'] }],
    ['find', { stem: 'ढूँढ', classes: ['trans'] }], ['keep', { stem: 'रख', classes: ['complex', 'trans'] }],
    ['look', { stem: 'देख', classes: ['trans'], object: 'को' }], ['watch', { stem: 'देख', classes: ['trans'] }],
    ['stroll', { stem: 'घूम', classes: ['intrans'] }], ['chase', { ...KAR, prefix: 'पीछा', classes: ['trans'], object: 'का' }],
    ['run away', { stem: 'भाग', classes: ['intrans'], vector: 'जा' }], ['eat up', { stem: 'खा', classes: ['trans'], vector: 'ले' }],
    ['drink up', { stem: 'पी', classes: ['trans'], vector: 'ले' }], ['fall asleep', { stem: 'सो', classes: ['intrans'], vector: 'जा' }],
    ['rain', { stem: 'हो', perfBase: 'हु', classes: ['intrans'], weather: 'बारिश' }], ['fear', { stem: 'डर', classes: ['prep'] }],
    ['drive', { stem: 'चला', classes: ['trans'] }], ['ride', { stem: 'चला', classes: ['trans'] }], ['pay', { stem: 'दे', perfBase: 'दि', classes: ['ditrans'] }],
  ].forEach(([e, v]) => VERBS.set(e, [v, ...(VERBS.get(e) || [])]));
  // tell: बताना by default, सुनाना for stories and songs (chosen below)
  VERBS.set('tell', [...VERBS.get('tell')].sort((a) => (a.stem === 'बता' ? -1 : 1)));
  // Fixed objects take a postposition in Hindi.
  const OBJECT_POSTPOSITION = { मिल: 'से', डर: 'से', लड़: 'से', पूछ: 'से', टकरा: 'से', निर्भर: 'पर', झाँक: 'में' };
  const NO_ERGATIVE = new Set(['ला', 'भूल', 'बोल', 'डर', 'मिल', 'लड़', 'सो', 'समझ']);
  // Posture verbs describe a state: was sitting = बैठा था
  const POSTURE = new Set(['बैठ', 'लेट']);
  const MOTION = new Set(['जा', 'आ', 'लौट', 'पहुँच', 'भाग', 'दौड़', 'चल', 'निकल']);

  const IRREGULAR = `be was been|have had had|do did done|go went gone|come came come|eat ate eaten|give gave given|see saw seen|take took taken|
    write wrote written|read read read|sing sang sung|drink drank drunk|run ran run|sit sat sat|sleep slept slept|buy bought bought|
    bring brought brought|catch caught caught|teach taught taught|think thought thought|tell told told|say said said|make made made|
    put put put|break broke broken|choose chose chosen|fall fell fallen|fly flew flown|know knew known|become became become|
    begin began begun|get got got|leave left left|meet met met|sell sold sold|send sent sent|understand understood understood|
    lose lost lost|win won won|wear wore worn|forget forgot forgotten|stand stood stood|lie lay lain|hide hid hidden|throw threw thrown|
    hit hit hit|cut cut cut|speak spoke spoken|wake woke woken|steal stole stolen|swim swam swum|shine shone shone|feed fed fed|
    hang hung hung|hear heard heard|find found found|feel felt felt|keep kept kept|learn learnt learnt|burn burnt burnt|ride rode ridden|
    rise rose risen|show showed shown|sow sowed sown|grow grew grown|draw drew drawn|fight fought fought|beat beat beaten|pay paid paid|
    shut shut shut|cost cost cost|let let let|set set set|drive drove driven|seek sought sought`;
  const FORMS = new Map();
  IRREGULAR.split('|').forEach((row) => {
    const [base, past, pp] = row.trim().split(' ');
    FORMS.set(past, [...(FORMS.get(past) || []), { lemma: base, form: 'past' }]);
    FORMS.set(pp, [...(FORMS.get(pp) || []), { lemma: base, form: 'pp' }]);
  });

  /** Possible lemma and form of an English verb word, known verbs only. */
  function verbForms(word) {
    const out = [...(FORMS.get(word) || [])];
    const tryLemma = (lemma, form) => { if (VERBS.has(lemma)) out.push({ lemma, form }); };
    tryLemma(word, 'base');
    if (/ies$/.test(word)) tryLemma(word.replace(/ies$/, 'y'), 's');
    if (/es$/.test(word)) tryLemma(word.slice(0, -2), 's');
    if (/s$/.test(word)) tryLemma(word.slice(0, -1), 's');
    if (/ied$/.test(word)) ['past', 'pp'].forEach((f) => tryLemma(word.replace(/ied$/, 'y'), f));
    if (/ed$/.test(word)) {
      for (const lemma of [word.slice(0, -2), word.slice(0, -1), word.slice(0, -3)]) ['past', 'pp'].forEach((f) => tryLemma(lemma, f));
    }
    if (/ing$/.test(word)) {
      const s = word.slice(0, -3);
      for (const lemma of [s, `${s}e`, s.slice(0, -1), s.replace(/y$/, 'ie')]) tryLemma(lemma, 'ing');
    }
    return out.filter((x, i) => out.findIndex((y) => y.lemma === x.lemma && y.form === x.form) === i);
  }

  // Hindi verb morphology
  const VOWEL_END = /[ािीुूेैोौ]$|^[आइईउऊएओ]$/;
  const ending = (g, n) => (g === 'f' ? 'ी' : n === 'pl' ? 'े' : 'ा');
  function perfective(v, g, n, final) {
    const s = v.stem;
    let forms;
    if (v.perfBase === 'हु') forms = ['हुआ', 'हुई', 'हुए', 'हुईं'];
    else if (v.perfBase === 'ग') forms = ['गया', 'गई', 'गए', 'गईं'];
    else if (v.perfBase) forms = ['िया', 'ी', 'िए', 'ीं'].map((e) => v.perfBase.slice(0, -1) + e);
    else if (/ी$/.test(s)) forms = ['िया', 'ी', 'िए', 'ीं'].map((e) => s.slice(0, -1) + e);
    else if (/[ाो]$/.test(s) || s === 'आ') forms = ['या', 'ई', 'ए', 'ईं'].map((e) => s + e);
    else if (/ू$/.test(s)) forms = ['आ', 'ई', 'ए', 'ईं'].map((e) => s.slice(0, -1) + 'ु' + e);
    else forms = ['ा', 'ी', 'े', 'ीं'].map((e) => s + e);
    const i = g === 'f' ? (n === 'pl' && final ? 3 : 1) : n === 'pl' ? 2 : 0;
    return forms[i];
  }
  const habitual = (s, g, n, final) => `${s}त${g === 'f' && n === 'pl' && final ? 'ीं' : ending(g, n)}`;
  function future(s, a) {
    if (s === 'हो') return (a.p === 2 ? 'होग' : a.n === 'pl' ? 'होंग' : a.p === 1 ? 'होऊँग' : 'होग') + ending(a.g, a.p === 2 ? 'pl' : a.n);
    const vowel = VOWEL_END.test(s);
    let b = s.replace(/ी$/, 'ि').replace(/ू$/, 'ु');
    let m;
    if (s === 'दे' || s === 'ले') {
      b = s[0];
      m = { 1: 'ूँग', 2: 'ोग', 3: a.n === 'pl' ? 'ेंग' : 'ेग' };
    } else if (vowel) m = { 1: a.n === 'pl' ? 'एँग' : 'ऊँग', 2: 'ओग', 3: a.n === 'pl' ? 'एँग' : 'एग' };
    else m = { 1: a.n === 'pl' ? 'ेंग' : 'ूँग', 2: 'ोग', 3: a.n === 'pl' ? 'ेंग' : 'ेग' };
    return b + m[a.p] + ending(a.g, a.p === 2 ? 'pl' : a.n);
  }
  function imperative(s) {
    if (s === 'दे' || s === 'ले') return `${s[0]}ो`;
    if (s === 'पी') return 'पियो';
    return VOWEL_END.test(s) ? `${s}ओ` : `${s}ो`;
  }
  function be(tense, a) {
    const n = a.p === 2 ? 'pl' : a.n;
    if (tense === 'past') return `थ${a.g === 'f' && n === 'pl' ? 'ीं' : ending(a.g, n)}`;
    if (tense === 'fut') return future('हो', a);
    if (a.p === 1 && a.n === 'sg') return 'हूँ';
    if (a.p === 2) return 'हो';
    return n === 'pl' ? 'हैं' : 'है';
  }

  /** The Hindi verb group for English tense, aspect, voice and modality. */
  function verbGroup(v, f, a) {
    const n = a.p === 2 ? 'pl' : a.n;
    const g = a.g;
    const neg = f.neg ? (f.imp ? 'मत' : 'नहीं') : '';
    const pre = (words) => [v.prefix, neg, ...words].filter(Boolean).join(' ');
    if (f.imp) return pre([imperative(v.stem)]);
    if (v.copula && !f.prog && !f.modal && !f.perf && !f.pass) return pre([be(f.tense, a)]);
    if (f.already) return pre([v.stem, perfective({ stem: 'चुक' }, g, n, f.tense === 'past' && !f.perf), ...(f.perf || f.tense !== 'past' ? [be(f.tense, a)] : [])]);
    if (v.vector && f.tense === 'past' && !f.prog && !f.modal && !f.pass) {
      const vec = { stem: v.vector, perfBase: { ले: 'लि', दे: 'दि', जा: 'ग' }[v.vector] || '' };
      return pre([v.stem, perfective(vec, g, n, !f.perf), ...(f.perf ? [be('pres', a)] : [])]);
    }
    if (f.pass) {
      const participle = perfective(v, g, n, false);
      const go = verbGroup({ stem: 'जा', perfBase: 'ग' }, { ...f, pass: false, neg: false }, a);
      return pre([participle, go]);
    }
    if (f.modal === 'must') return pre([`${v.stem}${g === 'f' ? 'नी' : n === 'pl' ? 'ने' : 'ना'}`, 'चाहिए', ...(f.tense === 'past' ? ['था'] : [])]);
    if (f.modal === 'can') {
      if (f.tense === 'fut') return pre([v.stem, future('सक', a)]);
      return pre([v.stem, `सकत${ending(g, n)}`, ...(f.neg && f.tense === 'pres' ? [] : [be(f.tense, a)])]);
    }
    if (f.prog && POSTURE.has(v.stem) && !f.modal) return pre([perfective(v, g, n, false), be(f.tense, a)]);
    if (f.prog) return pre([v.stem, `रह${ending(g, n)}`, be(f.tense, a)]);
    if (f.perf) return pre([perfective(v, g, n, false), be(f.tense, a)]);
    if (f.tense === 'fut') return pre([future(v.stem, a)]);
    if (f.tense === 'past') return pre([perfective(v, g, n, true)]);
    if (f.neg) return pre([habitual(v.stem, g, n, true)]);
    return pre([habitual(v.stem, g, n, false), be('pres', a)]);
  }

  // Noun phrases
  class Phrase {
    constructor(props) { Object.assign(this, props); }

    /** case: dir, obl, erg, dat; or a postposition. */
    form(kase = 'dir') {
      if (this.raw) return kase === 'dir' || kase === 'obl' ? this.raw : `${this.raw} ${{ erg: 'ने', dat: 'को' }[kase] || kase}`;
      if (this.coord) {
        const [a, b] = this.coord;
        const head = `${a.form('dir')} और ${b.form(kase === 'dir' ? 'dir' : 'obl')}`;
        if (kase === 'erg') return `${head} ने`;
        if (kase === 'dat') return `${head} को`;
        return kase === 'dir' || kase === 'obl' ? head : `${head} ${kase}`;
      }
      if (this.pron) {
        const [dir, obl, erg, dat, gen] = this.pron;
        if (kase === 'dir') return dir;
        if (kase === 'obl') return obl;
        if (kase === 'erg') return erg;
        if (kase === 'dat') return dat;
        if (/^(के|की) /.test(kase)) return `${gen.slice(0, -1)}${kase[1] === 'ी' ? 'ी' : 'े'} ${kase.slice(3)}`;
        if (kase === 'का' || kase === 'की' || kase === 'के') return gen.slice(0, -1) + kase.slice(1);
        if (kase === 'से' || kase === 'में') return obl + kase;
        return `${obl} ${kase}`;
      }
      const oblique = kase !== 'dir';
      const words = [];
      if (this.det && !(this.indefinite && this.dropArticle && !this.adjectives.length)) words.push(oblique ? OBLIQUE_DET[this.det] || this.det : this.det);
      if (this.possessor) words.push(this.reflexive ? agreeA('अपना', this.g, this.agreement.n, oblique) : this.possessor.genitive(this.g, this.agreement.n, oblique));
      if (this.wala) words.push(`${this.wala.form('obl')} ${agreeA('वाला', this.g, this.n, oblique)}`);
      for (const stem of this.participles || []) {
        const e = this.g === 'f' ? 'ी' : oblique || this.n === 'pl' ? 'े' : 'ा';
        words.push(`${stem}त${e} ${{ 'ा': 'हुआ', 'े': 'हुए', 'ी': 'हुई' }[e]}`);
      }
      for (const adj of this.adjectives) words.push(...adj.split(' ').map((w, i, all) => (i === all.length - 1 ? agreeA(w, this.g, this.agreement.n, oblique) : w)));
      words.push(...this.modifiers, nounForm(this.noun, this.n, oblique));
      const head = words.join(' ');
      if (kase === 'dir' || kase === 'obl') return this.relative ? `${head} ${this.relative}` : head;
      return `${head} ${{ erg: 'ने', dat: 'को' }[kase] || kase}${this.relative ? ` ${this.relative}` : ''}`;
    }

    genitive(g, n, oblique) {
      const marker = g === 'f' ? 'की' : n === 'pl' || oblique ? 'के' : 'का';
      return this.form(marker);
    }

    get honorific() { return !this.pron && !this.coord && !this.raw && HONORIFIC.has(this.noun); }

    get agreement() { return { p: this.p || 3, n: this.honorific ? 'pl' : this.n, g: this.g }; }
  }

  function translateText(english) {
    const unknown = new Set();
    const notes = [];
    const sentences = english.replace(/[“”"]/g, '').split(/(?<=[.?!])\s+/).filter((s) => s.trim());
    const out = sentences.map((s) => {
      const question = /\?\s*$/.test(s);
      const tokens = tokenize(s);
      const result = sentence(tokens, question, unknown, notes);
      return result + (question ? '?' : '');
    }).filter(Boolean);
    return { hindi: out.join(' । ').replace(/\s+/g, ' ').trim(), unknown: [...unknown], notes };
  }

  function tokenize(s) {
    return s.replace(/[’‘]/g, "'").replace(/\b(\w+)\/\w+\b/g, '$1').replace(/[.,!?;:\[\]()]/g, ' ')
      .replace(/\b(he|she|it|that|there|what|who|here)'s\b/gi, '$1 is')
      .replace(/n't\b/gi, ' not').replace(/\bcan not\b/gi, 'cannot').replace(/\bca not\b/gi, 'can not').replace(/\bwo not\b/gi, 'will not')
      .replace(/'m\b/gi, ' am').replace(/'re\b/gi, ' are').replace(/'ll\b/gi, ' will').replace(/'ve\b/gi, ' have').replace(/'d\b/gi, ' would')
      .replace(/'s\b/g, " 's").replace(/s'(\s|$)/g, "s 's$1")
      .replace(/\bcannot\b/gi, 'can not')
      .trim().split(/\s+/).filter(Boolean)
      .map((w) => ({ w: w.toLowerCase(), cap: /^[A-Z]/.test(w) }));
  }

  // Sentence-level: subordination and coordination
  function sentence(tokens, question, unknown, notes) {
    const words = tokens.map((t) => t.w);
    const at = (w) => words.indexOf(w);
    const clause = (ts) => translateClause(ts, question, unknown, notes);
    for (const [conj, hindi, after] of [['because', 'क्योंकि', true], ['although', 'हालाँकि', true], ['so that', 'ताकि', true]]) {
      const i = at(conj);
      if (i > 0) return `${sentence(tokens.slice(0, i), question, unknown, notes)}${after ? ',' : ''} ${hindi} ${sentence(tokens.slice(i + 1), false, unknown, notes)}`;
    }
    // Having eaten, Ram slept. / While running, I saw the boy.
    if (words[0] === 'having' || (words[0] === 'while' && /ing$/.test(words[1] || ''))) {
      const start = words[0] === 'having' ? 1 : 1;
      for (let i = start + 1; i < tokens.length; i++) {
        const inner = [...tokens.slice(start, i)];
        const head = verbForms(inner[0].w).find((x) => x.form === (words[0] === 'having' ? 'pp' : 'ing'));
        if (!head) break;
        const vp = translateClause([{ w: 'you' }, { w: head.lemma }, ...inner.slice(1)], false, new Set(), []);
        const main = translateClause(tokens.slice(i), question, new Set(), []);
        if (vp.ok && vp.parts && main.ok && main.subject) {
          const { verb, args } = vp.parts;
          const stem = `${verb.prefix ? `${verb.prefix} ` : ''}${verb.stem}`;
          const phrase = words[0] === 'having' ? `${stem}कर` : `${stem}ते हुए`;
          return translateClause(tokens.slice(i), question, unknown, notes, { mid: [[...args, phrase].join(' ')] }).text;
        }
      }
    }
    if (['if', 'when'].includes(words[0])) {
      // The main clause starts where a second subject and verb begin.
      for (let i = 2; i < tokens.length; i++) {
        const first = translateClause(tokens.slice(1, i), false, new Set(), [], { conditional: words[0] === 'if' });
        const second = translateClause(tokens.slice(i), question, new Set(), []);
        if (first.ok && second.ok) {
          const s1 = translateClause(tokens.slice(1, i), false, unknown, notes, { conditional: words[0] === 'if' });
          const s2 = clause(tokens.slice(i));
          return words[0] === 'if' ? `अगर ${s1.text} तो ${s2.text}` : `जब ${s1.text}, ${s2.text}`;
        }
      }
    }
    for (const [conj, hindi] of [['and', 'और'], ['but', 'लेकिन'], ['or', 'या']]) {
      for (let i = at(conj); i > 0; i = words.indexOf(conj, i + 1)) {
        const left = translateClause(tokens.slice(0, i), question, new Set(), []);
        const right = translateClause(tokens.slice(i + 1), question, new Set(), []);
        if (left.ok && right.ok && right.subject) {
          return `${clause(tokens.slice(0, i)).text} ${hindi} ${clause(tokens.slice(i + 1)).text}`;
        }
      }
    }
    return clause(tokens).text;
  }

  // Clause
  function translateClause(tokens, question, unknown, notes, opts = {}) {
    const relSubject = opts.rel || null;
    let i = 0;
    const peek = (k = 0) => (tokens[i + k] || {}).w;
    const fail = { ok: false, text: tokens.map((t) => t.w).join(' ') };
    const front = [];
    let isQuestion = false;

    // Clause-initial adverbials
    for (;;) {
      if (SENTENCE_ADVERBS.has(peek()) || ['actually', 'obviously', 'clearly', 'frankly'].includes(peek())) front.push(ADVERBS.get(peek()) || 'सच कहूँ तो'), i++;
      else if (['today', 'yesterday', 'tomorrow', 'now'].includes(peek())) front.push(ADVERBS.get(peek())), i++;
      else if (peek() === 'please') i++;
      else break;
    }

    // Questions about objects and circumstances (What did you eat?) are not converted.
    if (['what', 'where', 'why', 'how', 'whom', 'which', 'whose'].includes(peek())) return fail;

    // Yes/no question: Do you…? Is she…? Can he…?
    const AUXILIARIES = ['do', 'does', 'did', 'is', 'are', 'am', 'was', 'were', 'can', 'could', 'will', 'would', 'should', 'must', 'has', 'have', 'had'];
    if (AUXILIARIES.includes(peek())) {
      const np = nounPhrase(tokens, i + 1, unknown);
      if (np) {
        const rest = tokens.slice(np.end);
        const aux = tokens[i];
        tokens = [...tokens.slice(0, i), ...tokens.slice(i + 1, np.end), ...(['do', 'does', 'did'].includes(aux.w) && rest[0] && rest[0].w !== 'not' ? [{ w: aux.w === 'did' ? 'did' : aux.w }] : [aux]), ...rest];
        isQuestion = true;
      }
    }

    // Subject, or none in an imperative
    let subject = null;
    let imperative = false;
    const first = peek();
    const asVerb = first && verbForms(first).some((f) => f.form === 'base');
    const copulaAt = tokens.findIndex((t, k) => k > 1 && ['is', 'was'].includes(t.w));
    if (first === 'to' && copulaAt > 1 && verbForms(peek(1) || '').some((x) => x.form === 'base')) {
      const vp = translateClause([{ w: 'you' }, ...tokens.slice(1, copulaAt)], false, unknown, notes);
      if (vp.ok && vp.parts) {
        const text = [...vp.parts.args, `${vp.parts.verb.prefix ? `${vp.parts.verb.prefix} ` : ''}${vp.parts.verb.stem}ना`].join(' ');
        subject = new Phrase({ raw: text, n: 'sg', g: 'm', p: 3 });
        i = copulaAt;
      }
    }
    if (first === 'there' && ['is', 'are', 'was', 'were'].includes(peek(1))) {
      return existential(tokens, i + 1, front, unknown);
    }
    if (subject) {
      // already found
    } else if (first === 'do' && peek(1) === 'not') {
      imperative = true;
    } else if (first === 'let') {
      return fail;
    } else if (relSubject && first === '\u0000rel') {
      subject = relSubject;
      i++;
    } else {
      const np = nounPhrase(tokens, i, unknown);
      if (np && !(asVerb && !np.phrase.pron && !np.phrase.proper && !np.phrase.det && !np.phrase.possessor && tokens.length > 1 && np.end === i + 1 && verbAhead(tokens, i + 1) === false)) {
        subject = np.phrase;
        i = np.end;
      } else if (asVerb) imperative = true;
      else return fail;
    }
    if (first === 'there' && ['is', 'are', 'was', 'were'].includes(peek())) {
      return existential(tokens, i, front, unknown);
    }

    // Adverbs between subject and verb: always, often, perhaps
    const midAdverbs = [];
    while (['always', 'often', 'never', 'sometimes', 'usually', 'also', 'perhaps', 'still', 'just', 'already', 'unfortunately'].includes(peek())) {
      const w = tokens[i++].w;
      if (w === 'never') midAdverbs.push('कभी'), midAdverbs.neg = true;
      else if (w === 'also') midAdverbs.push('भी');
      else if (w === 'just' || w === 'still') continue;
      else if (w === 'already') midAdverbs.push('पहले ही');
      else midAdverbs.push(ADVERBS.get(w) || { usually: 'आम तौर पर' }[w] || w);
    }

    // Verb group
    const f = { tense: 'pres', neg: !!midAdverbs.neg, imp: imperative };
    let copula = false;
    let lemma = null;
    let form = null;
    const auxiliaries = [];
    while (i < tokens.length) {
      const w = peek();
      if (w === 'not') { f.neg = true; i++; continue; }
      if (w === 'already') { f.already = true; i++; continue; }
      if (['always', 'often', 'also', 'never', 'perhaps', 'usually', 'still', 'just'].includes(w) && i > 0) {
        if (w === 'never') { midAdverbs.push('कभी'); f.neg = true; } else if (w === 'also') midAdverbs.push('भी');
        else if (ADVERBS.has(w)) midAdverbs.push(ADVERBS.get(w));
        i++;
        continue;
      }
      if (['will', 'shall', 'would'].includes(w)) { f.tense = 'fut'; i++; continue; }
      if (['can', 'could', 'may', 'might'].includes(w)) { f.modal = 'can'; if (w === 'could') f.tense = 'past'; i++; continue; }
      if (['must', 'should'].includes(w)) { f.modal = 'must'; i++; continue; }
      if (w === 'ought' && peek(1) === 'to') { f.modal = 'must'; i += 2; continue; }
      if (['do', 'does', 'did'].includes(w) && (verbForms(peek(1) || '').length || peek(1) === 'not')) { if (w === 'did') f.tense = 'past'; i++; continue; }
      if (['have', 'has', 'had'].includes(w) && peek(1) && (['been', 'not', 'already', 'just', 'never', 'always', 'also'].includes(peek(1)) || verbForms(peek(1)).some((x) => x.form === 'pp'))) {
        f.perf = true; if (w === 'had') f.tense = 'past'; i++; continue;
      }
      if (['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].includes(w)) {
        if (w === 'was' || w === 'were') f.tense = 'past';
        auxiliaries.push(w);
        i++;
        continue;
      }
      break;
    }
    if (f.imp && peek() === 'be') { i++; auxiliaries.push('be'); }
    const next = peek();
    const nextForms = next ? verbForms(next) : [];
    const lastBe = auxiliaries.length > 0;
    if (lastBe && nextForms.some((x) => x.form === 'ing')) {
      f.prog = true;
      ({ lemma } = nextForms.find((x) => x.form === 'ing'));
      form = 'ing';
      i++;
    } else if (lastBe && nextForms.some((x) => x.form === 'pp') && (!ADJECTIVES.has(next) || tokens.slice(i).some((t) => t.w === 'by'))) {
      f.pass = true;
      if (auxiliaries.includes('being')) f.prog = true;
      ({ lemma } = nextForms.find((x) => x.form === 'pp'));
      i++;
    } else if (lastBe && next === 'afraid') {
      lemma = 'fear';
      i++;
    } else if (lastBe) {
      copula = true;
      if (auxiliaries.includes('being')) f.prog = false;
    } else if (nextForms.length) {
      const pick = f.perf ? nextForms.find((x) => x.form === 'pp') : nextForms.find((x) => x.form !== 'ing' && x.form !== 'pp') || nextForms[0];
      ({ lemma, form } = pick);
      if (!f.modal && f.tense === 'pres' && form === 'past') f.tense = 'past';
      i++;
    } else {
      if (next && !nounPhrase(tokens, i, new Set())) unknown.add(next);
      return { ...fail, subject };
    }
    if (form === 'pp' && !f.perf && !f.pass) f.tense = 'past';

    // Phrasal verbs
    const phrasal = lemma && ['away', 'out', 'down', 'up', 'at', 'for', 'to', 'after', 'off', 'on', 'asleep'].includes(peek()) && VERBS.has(`${lemma} ${peek()}`);
    if (phrasal) lemma = `${lemma} ${tokens[i++].w}`;

    // Complements and adjuncts
    const items = [];
    while (i < tokens.length) {
      const w = peek();
      if (w === 'as' && nounPhrase(tokens, i + 1, new Set())) { i++; continue; }
      if (w === 'that' && i > 0) {
        const rest = tokens.slice(i + 1);
        const sub = translateClause(rest, false, new Set(), []);
        if (sub.ok && sub.subject) { items.push({ kind: 'clause', text: translateClause(rest, false, unknown, notes).text }); i = tokens.length; break; }
      }
      if (w === 'to' && peek(1) && verbForms(peek(1)).some((x) => x.form === 'base') && !nounPhrase(tokens, i + 1, new Set())) {
        const sub = translateClause([{ w: 'you' }, ...tokens.slice(i + 1)], false, unknown, notes);
        if (sub.ok) { items.push({ kind: 'infinitive', vp: sub }); i = tokens.length; break; }
      }
      const prep = PREP_WORDS.find((p) => p.split(' ').every((part, k) => peek(k) === part));
      if (prep && !(prep === 'to' && verbForms(peek(1) || '').some((x) => x.form === 'base'))) {
        const np = nounPhrase(tokens, i + prep.split(' ').length, unknown);
        if (np) { items.push({ kind: 'pp', prep, np: np.phrase }); i = np.end; continue; }
        if (ADVERBS.has(prep)) { items.push({ kind: 'adv', text: ADVERBS.get(prep) }); i++; continue; }
      }
      if (DEGREE.has(w) && ADVERBS.has(peek(1))) { items.push({ kind: 'adv', text: `${DEGREE.get(w)} ${ADVERBS.get(peek(1))}` }); i += 2; continue; }
      const ap = adjectivePhrase(tokens, i);
      if (ap && !nounAfter(tokens, ap.end)) { items.push({ kind: 'ap', text: ap.text }); i = ap.end; continue; }
      const np = nounPhrase(tokens, i, unknown);
      if (np) {
        // Two coordinated objects, unless "and" begins a new clause.
        items.push({ kind: 'np', np: np.phrase });
        i = np.end;
        continue;
      }
      if (ADVERBS.has(w)) { items.push({ kind: 'adv', text: ADVERBS.get(w), time: ['today', 'yesterday', 'tomorrow', 'now', 'every day', 'here', 'there', 'home'].includes(w) }); i++; continue; }
      if (DEGREE.has(w)) { items.push({ kind: 'adv', text: DEGREE.get(w) }); i++; continue; }
      unknown.add(w);
      i++;
    }

    if (opts.conditional && f.tense === 'pres' && !f.prog && !f.perf && !f.modal) f.tense = 'fut';
    if (opts.mid) midAdverbs.unshift(...opts.mid);
    return assemble({ subject, f, copula, lemma, items, front, midAdverbs, question: isQuestion, unknown, notes, tokens });
  }

  function verbAhead(tokens, i) {
    return tokens.slice(i).some((t) => verbForms(t.w).length || ['is', 'are', 'was', 'were', 'am'].includes(t.w)) ? undefined : false;
  }
  function nounAfter(tokens, i) {
    const t = tokens[i];
    return !!t && (NOUNS.has(t.w) || NOUNS.has(singular(t.w)));
  }
  function singular(w) {
    const irregular = { clothes: 'cloth', men: 'man', women: 'woman', children: 'child', people: 'people', mice: 'mouse', feet: 'leg', teeth: 'tooth', leaves: 'leaf', knives: 'knife', wives: 'wife' };
    if (irregular[w]) return irregular[w];
    if (/ies$/.test(w)) return w.replace(/ies$/, 'y');
    if (/(ches|shes|xes|sses)$/.test(w)) return w.slice(0, -2);
    if (/s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }

  function adjectivePhrase(tokens, i) {
    let j = i;
    const words = [];
    if (DEGREE.has((tokens[j] || {}).w) && ADJECTIVES.has((tokens[j + 1] || {}).w)) words.push(DEGREE.get(tokens[j++].w));
    if (!tokens[j] || !ADJECTIVES.has(tokens[j].w)) return null;
    words.push(ADJECTIVES.get(tokens[j++].w));
    if ((tokens[j] || {}).w === 'and' && tokens[j + 1] && ADJECTIVES.has(tokens[j + 1].w)) {
      words.push('और', ADJECTIVES.get(tokens[j + 1].w));
      j += 2;
    }
    return { text: words.join(' '), end: j };
  }

  function nounPhrase(tokens, i, unknown) {
    const t = tokens[i];
    if (!t) return null;
    const w = t.w;
    let j = i;
    let phrase;
    if (PRONOUNS[w] && !(w === 'her' && tokens[i + 1] && (NOUNS.has(tokens[i + 1].w) || ADJECTIVES.has(tokens[i + 1].w) || NOUNS.has(singular(tokens[i + 1].w))))) {
      const p = PRONOUNS[w];
      phrase = new Phrase({ pron: p, p: p[5], n: p[6], g: p[7], human: true, definite: true });
      j++;
    } else {
      const props = { adjectives: [], modifiers: [], det: '', n: 'sg' };
      let detWord = null;
      if (DETERMINERS[w] !== undefined) { props.det = DETERMINERS[w]; detWord = w; j++; }
      else if (POSSESSIVE[w]) { props.possessor = new Phrase({ pron: PRONOUNS[{ my: 'i', your: 'you', his: 'he', her: 'she', its: 'it', our: 'we', their: 'they' }[w]] }); j++; }
      if (detWord && PLURAL_DET.has(detWord)) props.n = 'pl';
      if (detWord === 'one' && tokens[j] && tokens[j].w === 'of') return null;
      for (;;) {
        const ing = tokens[j] && verbForms(tokens[j].w).find((x) => x.form === 'ing');
        if (ing && nounAfter(tokens, j + 1) && !NOUNS.has(tokens[j].w)) {
          props.participles = [...(props.participles || []), VERBS.get(ing.lemma)[0].stem];
          j++;
          continue;
        }
        const ap = adjectivePhrase(tokens, j);
        if (ap && (nounAfter(tokens, ap.end) || ADJECTIVES.has((tokens[ap.end] || {}).w))) { props.adjectives.push(ap.text); j = ap.end; continue; }
        break;
      }
      const nouns = [];
      while (tokens[j]) {
        const word = tokens[j].w;
        const hindi = NOUNS.get(word) || NOUNS.get(singular(word));
        if (!hindi && !(tokens[j].cap && !nouns.length && j > i - 1 && !DETERMINERS[word] && !verbForms(word).length && !ADVERBS.has(word) && !PREPOSITIONS[word] && j !== 0)) break;
        if (!hindi && tokens[j].cap) {
          // An unknown name: keep it, and ask the user to write it in Devanagari.
          unknown.add(tokens[j].w.replace(/^./, (c) => c.toUpperCase()));
          nouns.push({ hindi: tokens[j].w, plural: false });
        } else {
          if (verbForms(word).some((x) => x.form === 'base' || x.form === 's' || x.form === 'past') && nouns.length && !NOUNS.has(word)) break;
          nouns.push({ hindi, plural: !NOUNS.has(word) && singular(word) !== word || word === 'people' || word === 'children' });
        }
        j++;
        if (!tokens[j] || !(NOUNS.has(tokens[j].w) || NOUNS.has(singular(tokens[j].w)))) break;
      }
      // After a determiner or adjective an unknown word is a noun: keep it and report it.
      const known = (x) => NOUNS.has(x) || ADJECTIVES.has(x) || ADVERBS.has(x) || PREPOSITIONS[x] || DETERMINERS[x] !== undefined || PRONOUNS[x] || verbForms(x).length || ['and', 'or', 'but', 'not', 'is', 'are', 'was', 'were', 'that', 'who', 'which'].includes(x);
      if (!nouns.length && j > i && tokens[j] && !known(tokens[j].w)) {
        unknown.add(tokens[j].w);
        nouns.push({ hindi: tokens[j].w, plural: false });
        j++;
      }
      if (!nouns.length) return null;
      const head = nouns[nouns.length - 1];
      props.noun = head.hindi;
      props.modifiers = nouns.slice(0, -1).map((x) => x.hindi);
      if (head.plural) props.n = 'pl';
      props.g = gender(head.hindi);
      props.human = HUMAN.has(head.hindi) || (isProper(head.hindi) && !NOT_PERSON.has(head.hindi)) || (tokens[j - 1].cap && !NOUNS.has(tokens[j - 1].w));
      // old: पुराना for things, बूढ़ा for people and animals
      if (props.human || ANIMAL.has(head.hindi)) props.adjectives = props.adjectives.map((a) => a.replace(/पुराना$/, 'बूढ़ा'));
      props.animal = ANIMAL.has(head.hindi);
      props.proper = isProper(head.hindi) || (tokens[j - 1].cap && !NOUNS.has(tokens[j - 1].w));
      props.definite = detWord === 'the' || ['this', 'that', 'these', 'those'].includes(detWord) || !!props.possessor || props.proper;
      if (detWord === 'a' || detWord === 'an') props.indefinite = true;
      phrase = new Phrase(props);
    }
    // Genitive: Sita 's book
    if (tokens[j] && tokens[j].w === "'s") {
      const rest = nounPhrase(tokens, j + 1, unknown);
      if (rest && !rest.phrase.pron) {
        rest.phrase.possessor = phrase;
        rest.phrase.definite = true;
        return rest;
      }
    }
    // Post-modifiers: of + NP is a genitive; with + NP on a person or animal is वाला.
    if (tokens[j] && tokens[j].w === 'of' && !phrase.pron) {
      const owner = nounPhrase(tokens, j + 1, unknown);
      if (owner) { phrase.possessor = owner.phrase; j = owner.end; }
    } else if (tokens[j] && tokens[j].w === 'with' && (phrase.human || phrase.animal) && !phrase.pron) {
      const thing = nounPhrase(tokens, j + 1, unknown);
      if (thing) { phrase.wala = thing.phrase; j = thing.end; }
    }
    // Relative clause: the boy who is playing
    if (tokens[j] && ['who', 'which', 'that'].includes(tokens[j].w) && !phrase.pron) {
      const rel = new Phrase({ pron: ['जो', 'जिस', 'जिसने', 'जिसे', 'जिसका', 3, phrase.n, phrase.g], p: 3, n: phrase.n, g: phrase.g });
      for (let k = j + 2; k <= tokens.length; k++) {
        const body = tokens.slice(j + 1, k);
        const result = translateClause([{ w: '\u0000rel' }, ...body], false, new Set(), [], { rel });
        const after = tokens[k];
        if (result.ok && (k === tokens.length || ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'will', 'can', 'must', 'might'].includes(after.w) || verbForms(after.w).some((x) => x.form !== 'ing'))) {
          phrase.relative = result.text;
          if (!phrase.det && !phrase.possessor && !phrase.coord) phrase.det = phrase.n === 'pl' ? 'वे' : 'वह';
          j = k;
          break;
        }
      }
    }
    // Coordination: Ram and Sita
    if (tokens[j] && tokens[j].w === 'and') {
      const second = nounPhrase(tokens, j + 1, unknown);
      const after = second && tokens[second.end];
      const startsClause = after && (verbForms(after.w).length || ['is', 'are', 'was', 'were', 'will', 'can', 'has', 'have', 'had', 'did', 'does', 'do'].includes(after.w));
      if (second && !(startsClause && !isSubjectPosition(tokens, i))) {
        const both = [phrase, second.phrase];
        return {
          phrase: new Phrase({ coord: both, n: 'pl', g: both.every((x) => x.g === 'f') ? 'f' : 'm', human: both.some((x) => x.human), p: 3 }),
          end: second.end,
        };
      }
    }
    return { phrase, end: j };
  }
  const isSubjectPosition = (tokens, i) => i === 0;

  function existential(tokens, i, front, unknown) {
    const tense = ['was', 'were'].includes(tokens[i].w) ? 'past' : 'pres';
    const np = nounPhrase(tokens, i + 1, unknown);
    if (!np) return { ok: false, text: '' };
    const rest = [];
    let j = np.end;
    while (j < tokens.length) {
      const prep = PREP_WORDS.find((p) => p.split(' ').every((part, k) => (tokens[j + k] || {}).w === part));
      const place = prep && nounPhrase(tokens, j + prep.split(' ').length, unknown);
      if (!place) break;
      rest.push(place.phrase.form(PREPOSITIONS[prep]));
      j = place.end;
    }
    return { ok: true, subject: np.phrase, text: [...front, ...rest, np.phrase.form('dir'), be(tense, np.phrase.agreement)].join(' ') };
  }

  // Building the Hindi clause
  function assemble({ subject: subjectIn, f, copula, lemma, items, front, midAdverbs, question, unknown }) {
    let subject = subjectIn;
    const order = { time: [], place: [], iO: [], dO: [], oC: [], sC: [], manner: [], after: [] };
    const nps = items.filter((x) => x.kind === 'np');
    const pps = items.filter((x) => x.kind === 'pp');
    const aps = items.filter((x) => x.kind === 'ap');
    const advs = items.filter((x) => x.kind === 'adv');
    const clauseItem = items.find((x) => x.kind === 'clause');
    const infinitive = items.find((x) => x.kind === 'infinitive');
    const subj = subject || new Phrase({ pron: PRONOUNS.you, p: 2, n: 'pl', g: 'm' });
    let agree = subj.agreement;
    let subjectCase = 'dir';

    advs.forEach((a) => (a.time ? order.time : order.manner).push(a.text));

    // Possession: X has Y = X के पास Y है
    if (lemma === 'have' && nps.length && !f.perf) {
      const owned = nps[0].np;
      const ownedWord = owned.form('dir').replace(/^$/, '');
      const extra = pps.map((p) => p.np.form(PREPOSITIONS[p.prep]));
      const vg = f.tense === 'fut' ? future('हो', owned.agreement) : (f.neg ? 'नहीं ' : '') + be(f.tense, owned.agreement);
      return done([...front, subj.form('के पास'), ...order.time, ...extra, ownedWord, vg]);
    }

    let candidates = copula ? [{ stem: 'हो', perfBase: 'हु', classes: ['intens'], copula: true }] : VERBS.get(lemma) || [];
    if (!candidates.length) {
      unknown.add(lemma);
      return { ok: false, text: '' };
    }
    if (candidates[0] && candidates[0].weather && subject && subject.pron && subject.pron[0] === 'यह') {
      subject = new Phrase({ adjectives: [], modifiers: [], det: '', noun: candidates[0].weather, n: 'sg', g: gender(candidates[0].weather) });
      agree = subject.agreement;
    }
    // Choose the sense whose class fits what follows the verb.
    const want = f.pass ? (nps.length ? 'ditrans' : 'trans') : nps.length >= 2 || (nps.length === 1 && pps.some((p) => p.prep === 'to') && !candidates.some((c) => MOTION.has(c.stem))) ? 'ditrans'
      : nps.length === 1 && (aps.length || pps.some((p) => ['in', 'on', 'into', 'onto'].includes(p.prep))) ? 'complex'
        : nps.length === 1 || clauseItem || infinitive ? 'trans' : 'intrans';
    const fit = (c) => c.classes.includes(want) || (want === 'complex' && c.classes.includes('trans')) || (want === 'trans' && c.classes.includes('ditrans'));
    let verb = candidates.find((c) => c.classes.includes(want)) || candidates.find(fit) || candidates[0];
    if (lemma === 'make') verb = aps.length || (nps.length === 2 && want === 'complex') ? { stem: 'कर', perfBase: 'कि', classes: ['complex'] } : { stem: 'बना', classes: ['trans'] };
    if (lemma === 'tell' && nps.some((n) => ['कहानी', 'गाना', 'कविता'].includes(n.np.noun))) verb = { stem: 'सुना', classes: ['ditrans'] };
    if (lemma === 'play' && nps.some((n) => ['गिटार', 'तबला'].includes(n.np.noun))) verb = { stem: 'बजा', classes: ['trans'] };
    const cls = copula ? 'intens' : want === 'complex' && verb.classes.includes('complex') ? 'complex' : verb.classes.includes(want) ? want : verb.classes[0];

    // A possessive pronoun that refers to the subject becomes अपना.
    const same = (owner) => subject && owner.pron && (subject.pron ? owner.pron[4] === subject.pron[4] : owner.pron[5] === 3);
    for (const x of [...nps.map((n) => n.np), ...pps.map((it) => it.np)]) {
      if (x.possessor && same(x.possessor)) x.reflexive = true;
    }

    // Complements
    let object = null;
    let objectCase = 'dir';
    if (copula || cls === 'intens') {
      const c = nps[0] || null;
      if (c) { c.np.dropArticle = true; order.sC.push(c.np.form('dir')); }
      aps.forEach((a) => order.sC.push(agreeAdjectives(a.text, subj)));
    } else if (cls === 'ditrans' && nps.length >= 2) {
      nps[0].np.dropArticle = true;
      order.iO.push(nps[0].np.form('dat'));
      object = nps[1].np;
    } else if (cls === 'ditrans' && nps.length === 1) {
      object = nps[0].np;
      const to = pps.find((p) => p.prep === 'to');
      if (to) { order.after.push(to.np.form('dat')); pps.splice(pps.indexOf(to), 1); }
    } else if (cls === 'complex' && nps.length) {
      object = nps[0].np;
      if (nps[1]) order.oC.push(nps[1].np.form('dir').replace(/^एक /, ''));
      aps.forEach((a) => order.oC.push(agreeAdjectives(a.text, object)));
      const loc = pps.find((p) => ['in', 'on', 'into', 'onto', 'under', 'near', 'behind'].includes(p.prep));
      if (loc && !aps.length && !nps[1]) { order.oC.push(loc.np.form(PREPOSITIONS[loc.prep])); pps.splice(pps.indexOf(loc), 1); }
    } else if (nps.length) {
      object = nps[0].np;
      nps.slice(1).forEach((x) => order.place.push(x.np.form('obl')));
    }
    if (!['intens', 'complex'].includes(cls)) aps.forEach((a) => order.manner.push(a.text));

    // A fixed postposition on the object: डरना से, मिलना से
    const fixed = verb.object || OBJECT_POSTPOSITION[verb.stem];
    if (!object && fixed) {
      const pp = pps.find((p) => ['to', 'with', 'of', 'at', 'for', 'on', 'in', 'from'].includes(p.prep));
      if (pp) { object = pp.np; pps.splice(pps.indexOf(pp), 1); }
    }

    if (!object && verb.stem === 'खा' && !f.pass && cls !== 'intrans') {
      object = new Phrase({ adjectives: [], modifiers: [], det: '', noun: 'खाना', n: 'sg', g: 'm' });
    }
    if (object) {
      object.dropArticle = true;
      if (fixed) objectCase = fixed;
      else if (cls === 'ditrans' && order.iO.length === 0 && nps.length === 1 && !pps.length) objectCase = 'dir';
      else if (object.pron || (object.human && (object.definite || object.proper)) || (object.animal && object.definite && object.human)) objectCase = 'dat';
      if (f.pass) objectCase = 'dir';
    }

    // Passive: by + agent = के द्वारा
    if (f.pass) {
      const by = pps.find((p) => p.prep === 'by');
      if (by) { order.place.push(by.np.form('के द्वारा')); pps.splice(pps.indexOf(by), 1); }
    }

    // Remaining PPs: to + place after a verb of motion has no postposition.
    for (const p of pps) {
      if (['in', 'at', 'on'].includes(p.prep) && ['सुबह', 'शाम', 'दोपहर', 'रात'].includes(p.np.noun) && !p.np.possessor) {
        order.time.push(p.np.form('dir'));
        continue;
      }
      if (p.prep === 'to' && MOTION.has(verb.stem)) order.place.push(p.np.form('obl'));
      else if (p.prep === 'at' && p.np.noun === 'घर') order.place.push('घर पर');
      else order.place.push(p.np.form(PREPOSITIONS[p.prep]));
    }

    // Ergative: perfective transitive verbs
    const perfective = !f.already && ((f.tense === 'past' && !f.prog && !f.modal && !f.pass) || (f.perf && !f.prog && !f.pass));
    const transitive = ['trans', 'ditrans', 'complex'].includes(cls) && !copula;
    if (perfective && transitive && !NO_ERGATIVE.has(verb.stem) && subject !== null && !(verb.object === 'से' && verb.prefix === 'बात')) {
      subjectCase = 'erg';
      if (verb.agree) agree = { p: 3, n: 'sg', g: verb.agree };
      else if (object && objectCase === 'dir') agree = object.agreement;
      else agree = { p: 3, n: 'sg', g: 'm' };
    }
    if (perfective && verb.prefix === 'बात' && subject !== null) { subjectCase = 'erg'; agree = { p: 3, n: 'sg', g: 'f' }; }
    if (f.modal === 'must') {
      subjectCase = 'dat';
      agree = object && objectCase === 'dir' ? object.agreement : { p: 3, n: 'sg', g: 'm' };
    }

    if (object) order.dO.push(object.form(objectCase));

    // Infinitive complement: want to V = V-ना चाहना; purpose after motion = V-ने के लिए
    if (infinitive) {
      const inner = infinitive.vp.parts;
      if (inner) {
        const inf = `${inner.verb.prefix ? `${inner.verb.prefix} ` : ''}${inner.verb.stem}`;
        const args = [...inner.args].filter(Boolean).join(' ');
        if (MOTION.has(verb.stem)) order.place.push(`${args} ${inf}ने के लिए`.trim());
        else order.dO.push(`${args} ${inf}ना`.trim());
      }
    }

    const vg = verbGroup(verb, f, agree);
    const parts = [...front];
    if (question && !(subject && subject.pron && ['कौन', 'क्या'].includes(subject.pron[0]))) parts.push('क्या');
    if (subject) parts.push(subject.form(subjectCase));
    parts.push(...midAdverbs, ...order.time, ...order.place, ...order.iO, ...order.dO, ...order.after, ...order.oC, ...order.sC, ...order.manner, vg);
    if (clauseItem) parts.push('कि', clauseItem.text);
    const result = done(parts);
    result.parts = { verb, args: [...order.time, ...order.place, ...order.iO, ...order.dO, ...order.after, ...order.oC, ...order.sC, ...order.manner] };
    return result;

    function done(list) {
      return { ok: true, subject, text: list.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() };
    }
  }
  function agreeAdjectives(text, phrase) {
    const { g, n } = phrase.agreement || { g: 'm', n: 'sg' };
    return text.split(' ').map((w) => (ADJECTIVES_SET.has(w) ? agreeA(w, g, n, false) : w)).join(' ');
  }
  const ADJECTIVES_SET = new Set([...ADJECTIVES.values()]);

  HT.translate = translateText;
})(globalThis.HT = globalThis.HT || {});
