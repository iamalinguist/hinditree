/*
 * Hindi Lab, Concepts tab: linguistic terms explained with Hindi data.
 * Each entry links to the Whatzit? questions where it matters. The reader can
 * add their own entries, which are kept with the Lab data (in this browser,
 * and in Export Lab).
 *
 * In the explanation and "How we know", **word** is shown in bold and a blank
 * line starts a new paragraph.
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

  // [id, area, term, Hindi term or '', explanation, examples, how we know (the test), Whatzit? ids, reading]
  const CONCEPTS = [
    // Word structure
    ['morpheme', 'word', 'Morpheme', 'रूपिम',
      'A **morpheme** is the **smallest piece of a word** that has a meaning or a grammatical job.\n\nA word can be **one morpheme** (घर) or **several** (लड़क-ों, खा-त-ा).',
      'लड़क-ा, लड़क-े, लड़क-ों\nखा-त-ा = eat + habitual + masculine singular',
      'Cut a word only where each piece **recurs with the same job** in other words. -ा means masculine singular in लड़का, खाता and अच्छा; -त- means imperfective in खाता, खाती and खाते. A piece that recurs with one job across many words is a morpheme.',
      ['morphemes'], 'Haspelmath and Sims (2010), Understanding Morphology'],
    ['allomorph', 'word', 'Allomorph', 'संरूप',
      'An **allomorph** is one of two or more forms of a single morpheme, **chosen by context**.\n\nThe Hindi perfective is **-या** after a stem ending in a vowel and **-आ** after one ending in a consonant: one morpheme, two allomorphs.',
      'आ-या, सो-या, खा-या\nदेख-ा, मार-ा, लिख-ा',
      'Two tests. **Same job**: both make the perfective and agree in the same way (आया/आई, देखा/देखी). **Complementary distribution**: -या never follows a consonant stem and -आ never a vowel stem, so the sound of the stem predicts which one appears.',
      ['morphemes'], ''],
    ['suppletion', 'word', 'Suppletion', '',
      '**Suppletion** is when a form of a word is built on a **completely different stem** that no rule predicts.\n\nEnglish go and went; Hindi जाना and गया. Suppletive forms **have to be listed**.',
      'जाना → गया (not *जाया)\ngo → went',
      '**Apply the regular rule and watch it fail.** The perfective rule predicts *जाया from जा-, as आया from आ-; speakers say गया. No sound rule turns जा- into ग-, so the form must be learnt as a whole.',
      ['morphemes'], ''],
    ['fusion', 'word', 'Fusion (portmanteau)', '',
      '**Fusion** (a **portmanteau** form) is one form that carries **several meanings at once**, so it cannot be cut into one piece per meaning.\n\nEnglish -s in eats is present tense and third person singular together. Hindi pronouns fuse with ने and को.',
      'eat-s = PRESENT + 3rd SINGULAR\nमैं + ने → मैंने\nवह + को → उसे',
      '**Try to cut the form into one piece per meaning.** No part of -s means "present" and another "third person": change either value (ate, they eat) and the whole -s goes. उसे cannot be cut into वह + को at all.',
      ['morphemes', 'tense'], ''],
    ['paradigm', 'word', 'Paradigm', 'रूपावली',
      'A **paradigm** is the **full set of forms of one word**, arranged by their grammatical values: all the forms of करना by **aspect, tense, gender and number**.',
      'करता, करती, करते\nकिया, की, किए\nकरूँगा, करेगा, करेंगे',
      '**Hold the word constant and change one value at a time.** करता/करती/करते differ only in gender and number; करता/किया/करूँगा differ in aspect or tense. The grid shows the irregular cells, such as किया where the rule predicts करा.',
      ['morphemes'], ''],
    ['productivity', 'word', 'Productivity', 'उत्पादकता',
      'A pattern is **productive** if speakers use it for **new words**.\n\nThe perfective -आ is productive: it applies to new and borrowed verbs. Productivity is **evidence that a piece is real** for speakers.',
      'फ़ोन किया and फ़ोन करा, देखा, लिखा\nचाय वाला, दिल्ली वाला',
      '**Look at words speakers cannot have memorised.** फ़ोन is a borrowing, yet फ़ोन करा shows the regular -आ; वाला attaches to any noun or place name. A rule that applies to new words is active in speakers\' grammar.',
      ['morphemes'], ''],
    ['lexical-integrity', 'word', 'Lexical integrity', '',
      '**Lexical integrity** is the principle that **syntax treats words as wholes**: it cannot move or separate the pieces inside a word.\n\n**LFG** assumes it; **Distributed Morphology** does not. In Hindi, नहीं cannot come between खा and -ता.',
      'वह नहीं खाता\n* वह खा नहीं ता\nCompare: मैंने खा भी लिया',
      '**Try to put a separate word inside the form.** नहीं can stand before खाता but not between खा and -ता. In a compound verb a particle can come between the parts (खा भी लिया): that gap is why खा लिया counts as two words and खाता as one.',
      ['morphemes', 'complex'], 'Bresnan and Mchombo (1995), The Lexical Integrity Principle'],
    // Sentence structure
    ['ergativity', 'sentence', 'Ergativity and split ergativity', '',
      'In an **ergative** pattern the subject of a **transitive** verb is marked differently from the subject of an **intransitive** one.\n\nHindi is ergative **only in the perfective** (a **split by aspect**): there the transitive subject takes ने.',
      'राम ने रोटी खाई (perfective, transitive: ने)\nराम सोया (intransitive: no ने)\nराम रोटी खाता है (habitual: no ने)',
      '**Change one factor at a time.** Same verb, different aspect: राम ने रोटी खाई but राम रोटी खाता है, so aspect matters. Same aspect, different verb: राम ने रोटी खाई but राम सोया, so transitivity matters. ने appears only where both conditions hold.',
      ['ne', 'transitivity'], 'Dixon (1994), Ergativity'],
    ['dom', 'sentence', 'Differential object marking', '',
      '**Differential object marking** is marking **only some direct objects**, usually those that are **animate, specific or definite**.\n\nHindi marks such objects with को and leaves others bare.',
      'राम ने लड़की को देखा\nमैंने किताब पढ़ी\nमैंने उस किताब को पढ़ा',
      '**Keep the verb and change only the object.** लड़की (animate) takes को; किताब (inanimate, any book) is bare; उस किताब (that particular book) can take को. If को depended on the verb, it would not change with the object.',
      ['dom'], 'Aissen (2003), Differential object marking'],
    ['agreement', 'sentence', 'Agreement and default agreement', 'अन्विति',
      '**Agreement** is a word changing form to match another.\n\nThe Hindi verb agrees in **gender and number** with the **highest noun phrase that has no case marker**. If every noun phrase is marked, the verb takes a **default** form: masculine singular.',
      'लड़कियाँ आईं (agrees with लड़कियाँ)\nलड़कियों ने खाना खाया (agrees with खाना)\nलड़कियों ने किताबों को पढ़ा (default)',
      '**Change the gender or number of one noun and watch the verb.** With लड़कियाँ unmarked, the verb is feminine plural (आईं). Once ने is added, the verb follows खाना instead (खाया). When किताबों also has को, the verb follows neither: it is masculine singular (पढ़ा), although both nouns are feminine plural.',
      ['agreement', 'genitive'], 'Bhatt (2005), Long distance agreement in Hindi-Urdu'],
    ['lda', 'sentence', 'Long-distance agreement', '',
      '**Long-distance agreement** is agreement of a verb with a noun phrase **inside a lower, non-finite clause**.\n\nIn राम ने रोटी खानी चाही, both खानी and चाही agree with रोटी.',
      'राम ने रोटी खानी चाही\nराम ने रोटी खाना चाहा',
      '**Find where the feminine comes from.** रोटी is the object of खाना, not of चाहना, and राम ने is marked, so nothing in the main clause is feminine. Yet चाही is feminine: the agreement reaches into the lower clause. The second sentence shows it is optional.',
      ['agreement'], 'Bhatt (2005), Long distance agreement in Hindi-Urdu'],
    ['light-verb', 'sentence', 'Light verbs in Hindi', '',
      '**"Light"** means **semantically light**: a verb that has lost most of its own meaning and cannot make a full predicate on its own. In both compound and conjunct verbs the light part is the verb; the meaning comes from the other part.\n\nLight verbs do **two different jobs**. An **aspectual light verb** (the **vector**) modifies a verb that is already complete, adding completion, direction or attitude: खा लिया (a **V–V complex predicate**, a compound verb). A **verbalising light verb** (the **verbaliser**) turns a noun or adjective into a predicate: मदद की, साफ़ करना (an **N–V complex predicate**, a conjunct verb).\n\nThe same verb can also be used with its full (**"heavy"**) meaning: उसने किताब ली.',
      'खा लिया: heavy खा (eat), light लेना (only completion, no longer "take")\nमदद की: heavy मदद (help), light करना (only "do")\nAspectual: खा लिया, लिख दिया, सो गया\nVerbalising: मदद की, साफ़ करना, शुरू होना\nHeavy use of लेना: उसने किताब ली',
      '**Ask what each part contributes.** In खा लिया nothing is taken: लेना adds only completion, so it is light. In उसने किताब ली something is taken, so लेना is heavy. **Then ask what the light verb attaches to**: a verb that could stand alone (खाया) makes it aspectual; a noun or adjective (मदद, साफ़) makes it verbalising.',
      ['complex'], 'Butt (2010), The light verb jungle: still hacking away'],
    ['compound-verb', 'sentence', 'Compound verb', 'संयुक्त क्रिया',
      'A **compound verb** is a verb stem followed by a second verb, the **vector** (लेना, देना, जाना, डालना, बैठना, पड़ना, उठना).\n\nThe **first verb gives the meaning**. The vector has lost most of its own meaning (it is a **"light"** verb), adds **completion, direction or attitude**, and **carries all the endings**.\n\nCompare a **conjunct verb**, where the first part is a noun or adjective, not a verb.',
      'खा लिया (ate up), लिख दिया (wrote for someone)\nसो गया (fell asleep), तोड़ डाला (smashed)\nकह बैठा (blurted out)',
      '**The deletion test**: leave the vector out and the sentence keeps its basic meaning (खा लिया → खाया, still "ate"; सो गया → सोया). Only the nuance is lost. **The ending test**: the endings sit on the vector, not on the first verb (खा लिया, not * खाया ले).',
      ['complex'], 'Hook (1974), The Compound Verb in Hindi'],
    ['conjunct-verb', 'sentence', 'Conjunct verb', 'मिश्र क्रिया',
      'A **conjunct verb** is a **noun or adjective** followed by a **verbaliser** (करना, होना, देना, लेना); together they work like one verb.\n\nThe **noun or adjective gives the meaning**; the verb is "light" (करना adds little more than "do") and carries the endings.\n\nWhether the noun is **still an object** is debated: in उसकी मदद की, की agrees with मदद, and मदद can take a genitive and adjectives.',
      'मदद करना (help), काम करना (work)\nशुरू होना (begin), साफ़ करना (clean)\nStill a noun? उसकी बहुत मदद की',
      '**The deletion test, the other way round**: leave the noun out and the meaning is lost (उसने मदद की → उसने की, "he did"). So the noun, not the verb, carries the meaning. **The noun tests**: मदद takes a genitive (उसकी), an adjective (बहुत) and controls agreement (की), which is why some analyses still call it an object.',
      ['complex'], 'Mohanan (1994), Argument Structure in Hindi'],
    ['pro-drop', 'sentence', 'Pro-drop and pro', '',
      '**Pro-drop** is leaving out a subject or object that is clear from context.\n\nSome analyses keep it in the tree as an **understood pronoun**, written **pro**; others say there is nothing there. HindiTree\'s Method 1 draws pro.',
      'खा लिया? [NP=S pro] [NP=dO pro]\nमैंने खा लिया [NP=dO pro]\nदरवाज़ा खोलो [NP=S pro]',
      '**Three signs that something is understood.** The meaning has a participant: someone ate something. The verb agrees with it: खोलो is the तुम form, so the understood subject is तुम. And it can be filled back in without changing the meaning (तुम दरवाज़ा खोलो, मैंने खाना खा लिया).',
      ['transitivity'], ''],
    ['empty-slot', 'sentence', 'Empty slot, zero morpheme and pro', '',
      'Three different silences.\n\n**pro** is an understood argument: it refers to someone or something (the eater in खा लिया). **∅** marks a position with no content: an **empty slot**. A **zero morpheme**, strictly, is a piece with a meaning but no sound (English sheep, plural).\n\nA paper must say which one it means: the empty aspect slot in the simple future (खाऊँगा) is ∅ with no meaning, not a zero morpheme. The neutral term for any silent position is an **empty category**, often written e.',
      'खा लिया: [NP=S pro], an understood "I" or "you"\nखाऊँगा: [ASP ∅], an aspect position with nothing in it\nsheep (plural): a zero morpheme, plural meaning without sound',
      '**Ask two questions of each silence.** Does it refer to someone? pro does: you can ask "who ate?". Does it carry a meaning by contrast? Plural sheep does (the sheep are, against the sheep is), so it is a zero morpheme. ∅ in खाऊँगा does neither: it only marks the aspect position that खा रहा होऊँगा fills.',
      ['tense', 'transitivity', 'morphemes'], ''],
    ['finiteness', 'sentence', 'Finiteness', '',
      'A **finite** verb form carries **tense or mood and person** (है, था, खाऊँगा, खाता हूँ); a **non-finite** form does not (the participles खाता, खा रहा, खाया; the infinitive खाना).\n\nA **main clause needs a finite form**.',
      'वह खाता है (finite: है)\nवह खाता (non-finite alone: only after नहीं or in अगर … तो)',
      '**Look for person marking and independence.** है changes with the person of the subject (हूँ, हो, हैं) and can end a sentence. खाता changes only for gender and number, and alone it cannot end a plain statement (? वह रोज़ खाता).',
      ['tense', 'morphemes'], ''],
    ['copula-support', 'sentence', 'Copula support (होना-support)', '',
      'When the last verb of a clause is a **participle**, which cannot carry tense, **होना is added to carry it**: है, था, होगा.\n\nEnglish does the same with do (**do-support**: He did not eat). The **simple future needs no support**, because the future ending goes straight onto the verb.',
      'खा रहा + है / था / होगा\nखा चुका + है / था / होगा\nखाऊँगा (no support needed)',
      '**Remove होना and see what is lost.** Without था, खा रहा has no tense and cannot stand as a statement. खाऊँगा already has person (-ऊँ) and future (-गा) on the verb, so होना cannot be added (* खाऊँगा है).',
      ['tense', 'morphemes'], 'Chomsky (1957), Syntactic Structures (do-support)'],
    ['subjunctive', 'meaning', 'Subjunctive', '',
      'The **subjunctive** is a **mood for possibility, wishes and suggestions**.\n\nHindi marks it with **person endings on the stem** (-ऊँ, -ए, -एँ, -ओ). The **future is the subjunctive plus -गा**: खा-ऊँ-गा. होना\'s third-person subjunctive is हो, so होगा = हो + गा and होंगे = हों + गे.',
      'मैं खाऊँ? (shall I eat?)\nशायद वह घर पर हो (he may be at home)\nखाऊँ + गा → खाऊँगा; हो + गा → होगा',
      '**Compare the forms side by side**: खाऊँ and खाऊँगा share the person ending, and the future adds only -गा. **Then look at where the bare form is used**: choices (मैं खाऊँ?), possibilities after शायद, wishes. In none of them is anything asserted as fact; that use, not time, makes it a mood.',
      ['tense', 'morphemes'], 'Kachru (2006), Hindi'],
    ['dative-subject', 'sentence', 'Dative (experiencer) subject', '',
      'A **dative subject** is a subject **marked with को**, typical of verbs of **feeling, perceiving and needing**.\n\nIt behaves like a subject in some tests (it can **bind अपना**) though it is not in the nominative.',
      'मुझे भूख लगी\nमुझे अपना घर याद आया',
      '**Apply a subject test, not case.** अपना refers back to the subject of its clause; in मुझे अपना घर याद आया, अपना means "my", so मुझे counts as the subject. **Then check agreement**: the verb agrees with भूख and घर, not with मुझे. A subject by behaviour, but not by agreement.',
      ['subject'], 'Kachru, Bhatia and Subbarao (1976), The notion "subject"'],
    ['scrambling', 'sentence', 'Scrambling', '',
      '**Scrambling** is changing the **order of the phrases** of a clause **without changing its basic meaning**, usually for **topic or focus**.\n\nHindi allows much scrambling around a basic **SOV** order.',
      'राम ने सीता को किताब दी\nकिताब राम ने सीता को दी\nराम ने किताब दी सीता को',
      '**Move one phrase at a time and check who did what to whom.** In all three orders राम gives, सीता receives and किताब is given. The postpositions ने and को carry the roles, so order is free to mark topic and focus instead.',
      ['order'], 'Mahajan (1990); Kidwai (2000)'],
    ['correlative', 'sentence', 'Correlative', '',
      'A **correlative** is a **relative clause that stands at the start** of the sentence and is **picked up by a demonstrative** in the main clause: जो … वह.',
      'जो लड़की खड़ी है वह लंबी है\nजिसने जो देखा उसने वह बताया',
      '**Look for the pairs.** Each जो-word in the first clause has a matching वह-word in the second (जो … वह, जिसने … उसने, जो … वह). Leave out the वह-word and the sentence becomes odd (? जो लड़की खड़ी है लंबी है), so the two clauses are linked, not independent.',
      ['clauses'], 'Srivastav (1991), The syntax and semantics of correlatives'],
    ['silent-element', 'sentence', 'Abstract (silent) element', '',
      'An **abstract (silent) element** is a **node in the tree with no pronounced word**, used to show something the analysis claims is there.\n\nThomas writes **(pres)** and **(past)** under TENSE; HindiTree adds **(hab)**, **(perf)**, **pro** and **∅**.',
      'खाता है: [V खाता] [AUX [HAB (hab)] [TENSE है]]\nदी: [V दी] [AUX [TENSE (past)]]',
      '**A silent element is justified only by a contrast.** दी has no tense word, yet it is past in contrast with देती है, so the analysis puts (past) where है would be. Where no contrast shows the meaning, the silent node is an assumption of the analysis, not a finding.',
      ['tense', 'morphemes', 'transitivity'], 'Thomas (1993), Beginning Syntax'],
    ['converb', 'sentence', 'Converb', 'पूर्वकालिक कृदंत',
      'A **converb** is a **non-finite verb form that makes an adverbial clause**.\n\nIt carries **no tense of its own**: it places its event **relative to the main verb**, before it (-कर, -करके) or during it (-ते हुए). करके is the converb of करना itself, which is why there is no *करकर.\n\nWhether the converb and the main verb form one verb is the question in Whatzit?.',
      'खाना खाकर वह गया (before)\nवह गाते हुए गई (during)\nखाना खाकर वह गया, but * किताब ले वह आया',
      '**No tense**: खाकर stays the same whether the main verb is गया, जाएगा or जाता है, so its time comes from the main verb. **A clause of its own**: the subject can come between it and the main verb (खाना खाकर वह गया), which is impossible inside a compound verb (* किताब ले वह आया).',
      ['converbs'], 'Haspelmath (1995), The converb as a cross-linguistically valid category'],
    // Meaning
    ['aspect', 'meaning', 'Aspect and tense', 'पक्ष और काल',
      '**Tense** places an event **in time** (past, present, future). **Aspect** says **how the event is viewed**: as a whole, in progress, as a habit.\n\nHindi marks **aspect on the verb** (-ता, रहा, -या) and **tense on the auxiliary** (है, था).',
      'आता है (habitual, present)\nआ रहा था (progressive, past)\nआया है (perfective, present)',
      '**Change one part at a time.** Keep आता and change है to था: the time changes, the habit stays. Keep है and change आता to आ रहा: the time stays, the view changes. Two parts that vary independently mark two different categories.',
      ['tense', 'ta'], 'Comrie (1976), Aspect; Comrie (1985), Tense'],
    ['perfective', 'meaning', 'Perfective and perfect', '',
      '**Perfective** is an **aspect**: the event is seen as a **complete whole** (आया). **Perfect** is a **relation to a later time**: a past event relevant to now (आया है) or to a past moment (आया था).\n\nThe two are easily confused because English uses "perfect" for both.',
      'वह आया (perfective)\nवह आया है (perfect, present)\nवह आया था (perfect, past)',
      '**Find what the three share and what the auxiliary adds.** All three contain the perfective participle आया, so all present a completed event. है ties that event to now and था to a past moment: that added reference point is what "perfect" names.',
      ['tense'], 'Comrie (1976), Aspect'],
    ['habitual', 'meaning', 'Habitual', '',
      'The **habitual** is an aspect describing a **regular or characteristic event**, not a single one.\n\nHindi marks it with **-ता**.',
      'वह रोज़ आता है\nवह पहले यहाँ रहता था',
      '**Add a time adverb.** रोज़ ("every day") and पहले ("formerly, used to") fit -ता naturally; for a single event now, अभी needs रहा instead (वह अभी आ रहा है). But -ता is not always habitual: see the counterfactual and वह रात भर रोता रहा.',
      ['ta', 'tense'], ''],
    ['resultative', 'meaning', 'Resultative state', '',
      'A **resultative state** is a **state that results from an earlier event**, expressed with a perfective form.\n\nदरवाज़ा खुला है describes the **door\'s state now**, not a past event of opening.',
      'दरवाज़ा खुला है\nवह बैठा है',
      '**Ask what the sentence asserts.** दरवाज़ा खुला है is true as long as the door is open, however long ago it was opened, and it fits अब भी ("still"). It does not fit a time of the opening event: ? दरवाज़ा कल खुला है.',
      ['tense'], ''],
    ['presumptive', 'meaning', 'Presumptive mood', 'वृत्ति',
      'The **presumptive** is a **mood for a guess or an inference**: "must be, must have".\n\nIn Hindi it uses **होगा** and is often mistaken for a **future tense**.',
      'वह आया होगा (he must have come)\nवह घर पर होगा (he must be at home)',
      '**Test whether the time is future.** In वह आया होगा the coming is already past; in वह घर पर होगा the being at home is now. Only the speaker\'s guess is involved, which is why ज़रूर ("surely") or शायद fit so naturally.',
      ['tense'], ''],
    ['counterfactual', 'meaning', 'Counterfactual and "fake imperfective"', '',
      'A **counterfactual** is a sentence about **what did not happen**.\n\nMany languages use an **imperfective form** for it without any habitual meaning (a **"fake imperfective"**); Hindi uses **-ता** in अगर … तो.',
      'अगर वह आता तो मैं जाता\nअगर मैं राजा होता',
      '**Check the meaning, not the form.** अगर वह आता तो मैं जाता implies that he did not come: there is no habit and no routine. अगर तुम कल आते is about one occasion. So -ता here cannot be the habitual; it marks unreality.',
      ['ta'], 'Iatridou (2000), The grammatical ingredients of counterfactuality'],
    ['reichenbach', 'meaning', 'Event, reference and speech time', '',
      '**Reichenbach\'s** three points for describing tenses: **E** (when the event happens), **R** (the time it is viewed from) and **S** (when we speak).\n\nआया है: E before R, R = S. आया था: E before R, R before S.',
      'आया: E before S\nआया है: E before R, R = S\nआया था: E before R, R before S',
      '**Locate R with time adverbs.** वह अभी आया है fits "now", so R is S. वह उस समय तक आ गया था ("by then") names a past R before which the event happened. The adverbs each form accepts show where its R is.',
      ['tense'], 'Reichenbach (1947), Elements of Symbolic Logic'],
    ['polysemy', 'meaning', 'Polysemy and multifunctionality', '',
      '**Polysemy** (or **multifunctionality**) is **one form with several related meanings or functions**.\n\nThe opposite assumption, **"one form, one meaning"**, is called **isomorphism**. A multifunctional account must say **which context selects which function**.',
      '-ता: habit (आता है), counterfactual (अगर आता), adjective (बहता पानी)',
      '**First show it is one form**: -ता has the same endings (-ता, -ती, -ते) in all three uses. **Then find each context**: है after it (habit), अगर … तो around it (counterfactual), a noun after it (adjective).',
      ['ta'], 'Haspelmath (2003), The geometry of grammatical meaning'],
    // Language change
    ['analogy', 'change', 'Analogy', 'सादृश्य',
      '**Analogy** is **building a new form on the model of existing ones**, often written as a **four-part proportion**.\n\nSpeakers form करा on the model of देखा.',
      'देखना : देखा :: करना : करा\nwalk : walked :: go : goed (child English)',
      '**Find the model the new form copies.** करा follows stem + -आ, as in देखा, लिखा, मारा; nothing in करना\'s own history gives करा. A form that matches a regular pattern but not its own word\'s history is a product of analogy.',
      ['morphemes'], 'Hock (1991), Principles of Historical Linguistics'],
    ['regularisation', 'change', 'Regularisation', '',
      '**Regularisation** is replacing an **irregular form** with one **built by the regular rule**.\n\nकरा for किया regularises the perfective of करना.',
      'किया → करा\nholp → helped (English)',
      '**Compare both forms with the rule.** किया is irregular (the stem changes to कि-); करा is exactly what the perfective rule predicts from कर-. When the new form is the rule\'s output, the change is a regularisation.',
      ['morphemes'], ''],
    ['levelling', 'change', 'Paradigm levelling', '',
      '**Paradigm levelling** is **reducing the variety of stems** within a paradigm.\n\nकरना had two stems, कर- and कि- (किया); with करा, कर- is used throughout.',
      'कर-ता, कर-ेगा, कर-ना, कि-या → कर-ा',
      '**Count the stems before and after.** Before: कर- in most forms, कि- in the perfective. After: कर- everywhere. Fewer stems in one paradigm is what levelling means.',
      ['morphemes'], ''],
    ['grammaticalisation', 'change', 'Grammaticalisation', 'व्याकरणीकरण',
      '**Grammaticalisation** is the process by which **a word with its own meaning gradually becomes a grammatical marker**.\n\nOn the standard account, Hindi रहना became the progressive रहा; nouns like ओर became parts of postpositions (की ओर).',
      'रहना → आ रहा है\nओर (side) → की ओर (towards)\nलेना → खा लिया',
      '**Four signs, each checkable.** The source word still exists with its old meaning (ओर "side"). The new use has lost that meaning (की ओर is just "towards"). The new use has fewer forms (progressive रहा has no imperative). And the change is **attested over time in texts**: only this last sign settles an origin.',
      ['genitive', 'complex'], 'Hopper and Traugott (2003), Grammaticalization'],
    ['gram-aspect', 'change', 'Grammaticalisation of aspect', '',
      '**Verbs of staying, finishing, taking and giving** have become **aspect markers**.\n\nOn the standard account, रहना ("stay") became the **progressive** (some native speakers reject any link: see the Whatzit? question "One रहा or two?"); the in-between use वह लिखता रहा ("he kept writing") still shows the meaning "remain". चुकना ("be used up") became the **completive** चुका ("already"). लेना, देना, जाना, डालना and बैठना became **vector verbs**.\n\n**Why**: verbs of staying in a place are a common source of progressives, by metaphor from space to time (staying somewhere → continuing an activity).',
      'वह लिखता रहा (kept writing: रहना still "remain")\nवह लिख रहा है (is writing: रहना only aspect)\nवह खा चुका है (has already eaten)\nखा लिया, लिख दिया, सो गया, मार डाला, कह बैठा',
      '**Compare the marker with the verb it resembles.** चुकना still exists as a verb (पैसा चुक गया, कर्ज़ चुकाना), and चुका keeps verb forms (खा चुकेगा). लिखता रहा has every form of रहना (लिखते रहो), but the progressive has not (* लिख रहो). A full verb beside a marker with fewer forms is the typical picture; dated texts are needed to confirm the history.',
      ['tense', 'complex', 'raha'], 'Bybee, Perkins and Pagliuca (1994), The Evolution of Grammar'],
    ['gram-postposition', 'change', 'Grammaticalisation of postpositions', '',
      '**Nouns of place, side and direction** have become **parts of complex postpositions** after the genitive. The evidence is still visible, because the nouns are still used as nouns.\n\n**Why**: sound changes from Sanskrit through Prakrit wore away the old case endings, and speakers built new ways of marking relations from words for places and sides (**renewal**).',
      'ओर "side": उस ओर → राम की ओर\nतरफ़ "side": इस तरफ़ → घर की तरफ़\nबीच "middle": बीच में → दोनों के बीच\nपीछे, सामने, ऊपर, नीचे → घर के पीछे, घर के सामने',
      '**Check that the noun is still a noun**: उस ओर, इस तरफ़ take a demonstrative, like any noun. **Then look at the genitive before it**: की ओर, की तरफ़ (feminine nouns take की) but के बीच (masculine बीच, oblique के). The genitive still agrees with the old noun.',
      ['genitive'], 'Masica (1991), The Indo-Aryan Languages'],
    ['gram-tense', 'change', 'Grammaticalisation of tense and mood', '',
      'The **future -गा** is standardly traced to the **Sanskrit participle gata, "gone"**: that is why it **agrees in gender** like a participle (खाऊँगा, खाऊँगी).\n\nThe same -गा gives the **presumptive** (वह आया होगा, "he must have come").\n\n**Why**: verbs of motion ("go") are a common source of futures, as in English going to.',
      'खाऊँगा, खाऊँगी, खाएँगे (-गा agrees in gender and number)\nवह आया होगा (presumptive)\nEnglish: I am going to eat',
      '**Compare -गा with the rest of the verb.** Person comes before it (खा-ऊँ-), and gender and number after it (-गा, -गी, -गे), exactly as on a participle (गया, गई, गए). A tense ending that agrees like a participle points to a participle origin.',
      ['tense', 'morphemes'], 'Masica (1991), The Indo-Aryan Languages'],
    ['gram-modality', 'change', 'Grammaticalisation of modality', '',
      'Ordinary verbs have become **modal verbs**. **सकना** is ability or permission; **चाहिए**, related to चाहना ("want"), is "should"; **पड़ना** ("fall") is "have to", for an obligation that falls on someone.\n\n**Why**: a verb of wanting or of something befalling someone is a common source of obligation.',
      'मैं तैर सकता हूँ (I can swim)\nतुम्हें जाना चाहिए (you should go)\nमुझे जाना पड़ा (I had to go)',
      '**Compare the modal use with the full verb.** As a full verb पड़ना means "fall" (बारिश पड़ी); in मुझे जाना पड़ा nothing falls, and the person is dative, as with things that happen to someone. चाहिए has almost no other forms left. Loss of meaning and of forms marks the change.',
      ['tense'], 'Bybee, Perkins and Pagliuca (1994), The Evolution of Grammar'],
    ['homonymy', 'change', 'Homonymy and polysemy', '',
      '**Polysemy** is one word with related meanings that share a history. **Homonymy** is two words that only look alike (English desert and dessert).\n\nTo decide, test **shared inflection**, a **meaning bridge**, **in-between uses** that are still alive, and the **same path in other languages**.\n\n**Related in origin does not mean the same today**: progressive रहा has no imperative (* खा रहो), lexical रहना does (यहीं रहो).',
      'Related: रहना "stay" → लिखता रहा → लिख रहा है\nLook-alikes: आम (mango) and आम (common)\nToday different: यहीं रहो but * खा रहो',
      '**Run the four tests.** आम "mango" and आम "common" have no meaning bridge, no in-between uses and different sources (Sanskrit āmra, Arabic ʿāmm): homonyms. रहना and progressive रहा share the forms रहा, रही, रहे and have an in-between use (लिखता रहा), which is why the standard account calls them related. Whether they are one word today is a separate question, which the imperative test answers.',
      ['ta', 'tense', 'raha'], ''],
    // Method
    ['contrastive', 'method', 'Contrastive analysis', 'व्यतिरेकी विश्लेषण',
      '**Contrastive analysis** is comparing two languages **feature by feature** to find where they differ.\n\nA difference can be one of **kind** (one language has no counterpart) or of **degree** (it has one, but as a separate word, a marginal pattern or a rarer choice).\n\nA property is **unique to a language only after a third language has been checked**.',
      'Kind: राम ने रोटी खाई (no English ergative)\nDegree: वह खाता रहा, he kept eating',
      '**Look for a counterpart before calling a difference one of kind.** English has no subject marking that depends on aspect, so ने is a difference of kind. English does have kept eating, a verb of continuing with a participle, so वह खाता रहा differs only in degree.',
      ['english'], 'James (1980), Contrastive Analysis'],
    ['judgement', 'method', 'Acceptability judgement and gradience', '',
      'An **acceptability judgement** is a speaker\'s sense of whether a sentence is possible.\n\nJudgements are often **gradient** rather than yes or no; HindiTree marks them *, ?, ??, # and %.',
      '* राम ने सोया\n? उसने खाना नहीं खा लिया\n% मैंने छींका',
      '**Ask several speakers and compare.** * राम ने सोया is rejected by nearly everyone; ? उसने खाना नहीं खा लिया is accepted with hesitation; % मैंने छींका divides speakers. The spread of answers, not one speaker\'s intuition, decides the mark.',
      ['judgements'], 'Sprouse and Almeida (2012)'],
    ['minimal-pair', 'method', 'Minimal pair', '',
      'A **minimal pair** is two sentences that **differ in exactly one point**, so any difference in acceptability can be **put down to that point**.',
      'राम ने रोटी खाई\n* राम ने रोटी खाया',
      '**Check that only one thing changes.** The only difference is खाई against खाया. Speakers accept one and reject the other, so the verb must agree with रोटी (feminine), not with राम.',
      ['machines', 'judgements'], 'Warstadt and others (2020), BLiMP'],
    ['overgeneration', 'method', 'Over- and undergeneration', '',
      'A grammar **overgenerates** if it **accepts sentences speakers reject**, and **undergenerates** if it **rejects sentences they accept**.\n\nThe Workbench reports both.',
      'Overgeneration: accepts * राम आती है\nUndergeneration: rejects वह गाता हुआ चला गया',
      '**Compare the grammar\'s verdict with speakers\' judgements.** राम आती है gets a tree from Method 1, which checks no agreement, but speakers reject it: overgeneration. वह गाता हुआ चला गया is fine for speakers but gets no tree: undergeneration.',
      ['judgements', 'synthesis'], ''],
    ['economy', 'method', 'Economy as an explanation', '',
      '**Economy** as an explanation means explaining a missing word as **left out "to save effort"**.\n\nTo be **testable**, economy must predict **where the word can be left out and where not**, and that **putting it back changes nothing**.',
      'वह नहीं आता (है absent) but ? वह रोज़ आता\nबहता पानी and बहता हुआ पानी, but बहती गंगा',
      '**Apply both predictions.** है can be left out after नहीं but not in a plain statement, which saving effort alone does not predict. हुआ can be added to बहता पानी, but बहती हुई गंगा loses the idiom, so putting the word back does change something.',
      ['ta'], ''],
  ].map(([id, area, term, hi, text, examples, why, see, read]) => ({ id, area, term, hi, text, examples, why, see, read }));

  const byId = (id) => CONCEPTS.find((c) => c.id === id);

  /** Concepts linked to a Whatzit? question, for the links shown there. */
  const forStation = (stationId) => CONCEPTS.filter((c) => c.see.includes(stationId));

  /** Text with **bold** and blank-line paragraphs, as HTML paragraphs. */
  const paragraphs = (text) => String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p>`).join('');

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
      ...state.mine.map((m) => ({ why: '', ...m, mine: true, see: [], read: '' })),
    ];
    const q = (state.query || '').trim().toLowerCase();
    const shown = entries.filter((c) => (!state.area || c.area === state.area)
      && (!q || `${c.term} ${c.hi} ${c.text} ${c.examples} ${c.why}`.replace(/\*\*/g, '').toLowerCase().includes(q)));

    const card = (c) => `<details class="card concept" id="concept-${esc(c.id)}" ${c.id === focus ? 'open' : ''}>
      <summary><b>${esc(c.term)}</b>${c.hi ? ` <span lang="hi">${esc(c.hi)}</span>` : ''}
        <span class="concept-area">${esc((AREAS.find(([a]) => a === c.area) || ['', ''])[1])}${c.mine ? ' · mine' : ''}</span></summary>
      <div class="concept-text">${paragraphs(c.text)}</div>
      ${c.examples ? `<h4 class="concept-label">Examples</h4><pre class="concept-ex" lang="hi">${esc(c.examples)}</pre>` : ''}
      ${c.why ? `<div class="concept-why"><h4 class="concept-label">How we know: the test</h4>${paragraphs(c.why)}</div>` : ''}
      ${c.see.length ? `<p class="concept-see">In Whatzit?: ${c.see.map((id) => `<button class="link" data-station="${esc(id)}">${esc(stationTitle(id))}</button>`).join(', ')}</p>` : ''}
      ${c.read ? `<p class="hint">Reading: ${esc(c.read)}</p>` : ''}
      ${c.mine ? `<div class="row"><button class="btn small" data-edit="${esc(c.id)}">Edit</button><button class="btn small danger" data-del="${esc(c.id)}">Delete</button></div>` : ''}
    </details>`;

    const editing = state.mine.find((m) => m.id === state.editing);
    el.innerHTML = `
      <header class="page-head"><p>Linguistic terms explained with Hindi data. Each term says <b>how we know</b>: the test that puts the examples under it.
        Each term also links to the Whatzit? questions where it matters. Add your own terms as you learn them; they are kept in this browser with the Lab.</p></header>
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
        <label class="wz-field">Explanation (**word** for bold, a blank line for a new paragraph)<textarea id="cf-text" rows="4">${esc(editing ? editing.text : '')}</textarea></label>
        <label class="wz-field">Hindi examples, one per line<textarea id="cf-ex" rows="4">${esc(editing ? editing.examples : '')}</textarea></label>
        <label class="wz-field">How we know: the test that puts the examples under this term<textarea id="cf-why" rows="3">${esc(editing ? editing.why || '' : '')}</textarea></label>
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
          why: form.querySelector('#cf-why').value.trim().slice(0, 5000),
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

  HT.concepts = { render, CONCEPTS, AREAS, byId, forStation, paragraphs };
})(globalThis.HT = globalThis.HT || {});
