/*
 * Course content. The explanations and the Hindi examples are original;
 * page numbers point to the sections of Thomas (1993) that they follow.
 *
 * Example: [analysis, English, note?, required constituent?]
 * The analysis is written function:words / function:words. It is both the
 * sentence and its answer key, and the test suite checks every one of them.
 * A required constituent (LABEL:words) selects one reading of an ambiguous sentence.
 */
(function (HT) {
  'use strict';

  const chapters = [
    {
      n: 1, title: 'Tools for Analysis', hindi: 'विश्लेषण के साधन', pages: '1–22',
      ideas: 'Words fall into categories and group into phrases. A sentence divides into a subject NP and a predicate VP. Form is what a constituent is; function is what it does.',
      rules: ['S → NP + VP', 'VP → (NP) + V', 'NP → (DET) + N', 'NP → PRO'],
      english: 'VP → V + NP, and nouns often need an article.',
      hindiRule: 'VP → NP + V: the verb is final. There are no articles, so a bare noun can be a complete NP. DET covers यह, वह, एक, हर and possessives.',
      tests: ['Pronoun substitution finds an NP: [वह लड़का] सोया → [वह] सोया।', 'The भी test finds a VP: राम फल खाता है, सीता भी। Here भी stands for “फल खाती है”.'],
      groups: [
        ['Subject and predicate', [
          ['S:राम / P:सोया', 'Ram slept'],
          ['S:लड़की / P:हँसी', 'The girl laughed'],
          ['S:वह / P:दौड़ा', 'He ran'],
          ['S:कुत्ता / P:भौंका', 'The dog barked'],
        ]],
        ['The object inside VP', [
          ['S:राम / dO:फल / P:खाता है', 'Ram eats fruit'],
          ['S:यह लड़की / dO:वह किताब / P:पढ़ेगी', 'This girl will read that book', 'The object is the NP immediately dominated by VP.'],
          ['S:बिल्ली ने / dO:चूहा / P:पकड़ा', 'The cat caught a mouse', 'ने marks the whole subject NP.'],
          ['S:वह / dO:चाय / P:पीती है', 'She drinks tea'],
        ]],
      ],
    },
    {
      n: 2, title: 'More on Categories', hindi: 'अन्य शब्द-वर्ग', pages: '23–36',
      ideas: 'Adverbs, adpositions and adjectives head phrases of their own. An adverbial inside VP modifies the verb. A sentence adverb is immediately dominated by S.',
      rules: ['AdvP → (deg) + Adv', 'PP → (NP) + P', 'AP → (deg) + A'],
      english: 'PP → P + NP: the preposition comes first.',
      hindiRule: 'PP → NP + P: Hindi has postpositions, some of several words (के लिए, के पास). The noun before one is oblique: कमरा → कमरे में.',
      tests: ['If an adverb moves freely around the sentence (शायद), attach it to S; if it describes how the action is done (धीरे), attach it to VP.'],
      groups: [
        ['Adverb phrases in VP', [
          ['S:राम / A:धीरे / P:चलता है', 'Ram walks slowly'],
          ['S:बच्चा / A:बहुत ज़ोर से / P:रोया', 'The child cried very loudly'],
        ]],
        ['Sentence adverbs: three positions, all under S', [
          ['A:दुर्भाग्य से / S:बिल्ली ने / dO:चूहा / P:पकड़ा', 'Unfortunately the cat caught the mouse'],
          ['S:राम / A:शायद / P:सोया', 'Ram perhaps slept'],
          ['S:राम / P:आएगा / A:शायद', 'Ram will come, perhaps'],
        ]],
        ['Postpositional phrases', [
          ['S:बच्चे / A:मैदान में / P:खेलते हैं', 'Children play in the field'],
          ['S:लड़की / A:पेड़ के नीचे / P:बैठी', 'The girl sat under the tree'],
          ['S:सीता / A:सुबह / A:बगीचे में / P:घूमती है', 'Sita strolls in the garden in the morning'],
        ]],
        ['Adjective phrases', [
          ['S:कुत्ता / sC:बहुत मोटा / P:है', 'The dog is very fat'],
          ['S:मोटा कुत्ता / P:भौंका', 'The fat dog barked'],
        ]],
      ],
    },
    {
      n: 3, title: 'The Verb Phrase', hindi: 'क्रिया पदबंध', pages: '37–60',
      ideas: 'The class of the verb decides which constituents VP must contain. Adverbials are optional; objects and complements are not.',
      rules: ['VP → V [intrans]', 'VP → dO + V [trans]', 'VP → iO + dO + V [ditrans]', 'VP → sC + V [intens]', 'VP → dO + oC + V [complex]', 'VP → pO + V [prep]'],
      english: 'Complements follow the verb. An indirect object alternates between NP and to-PP.',
      hindiRule: 'Complements precede the verb. The indirect object always has को, so the English alternation test does not apply. Use passivisation: dO becomes subject (किताब दी गई) while iO keeps को. को also marks specific or animate direct objects.',
      tests: ['Omission: *राम ने रखा is incomplete without a context, so रखना needs dO and oC.', 'oC describes dO (राम = अध्यक्ष); iO receives dO (राम को किताब).'],
      groups: [
        ['Intransitive', [
          ['S:बच्चा / P:सोया', 'The child slept'],
          ['S:बच्चा / A:बिस्तर पर / P:सोया', 'The child slept on the bed', 'An adverbial does not change the verb class.'],
        ]],
        ['Transitive', [
          ['S:माँ ने / dO:रोटी / P:बनाई', 'Mother made bread'],
          ['S:सीता ने / dO:बच्चे को / P:देखा', 'Sita saw the child', 'को marks an animate, specific direct object.'],
        ]],
        ['Ditransitive', [
          ['S:दादी ने / iO:बच्चों को / dO:कहानी / P:सुनाई', 'Grandmother told the children a story'],
          ['S:राम ने / iO:सीता को / dO:किताब / P:दी', 'Ram gave Sita a book'],
          ['S:राम ने / dO:किताब / iO:सीता को / P:दी', 'Ram gave a book to Sita', 'Either order is possible; the functions stay the same.'],
        ]],
        ['Intensive', [
          ['S:सीता / sC:डॉक्टर / P:बनी', 'Sita became a doctor'],
          ['S:राम / sC:बगीचे में / P:है', 'Ram is in the garden'],
          ['S:गीता / sC:उदास / P:लगती है', 'Gita seems sad'],
        ]],
        ['Complex-transitive', [
          ['S:लोगों ने / dO:राम को / oC:अध्यक्ष / P:चुना', 'The people chose Ram as president'],
          ['S:सीता ने / dO:गाड़ी / oC:सड़क पर / P:रखी', 'Sita put the car on the road'],
          ['S:मोहन ने / dO:गीता को / oC:नाराज़ / P:किया', 'Mohan made Gita angry'],
        ]],
        ['Prepositional', [
          ['S:बच्चा / pO:शेर से / P:डरता है', 'The child is afraid of the lion', 'The verb fixes the postposition: X से डरना.'],
          ['S:राम / pO:शिक्षक से / P:मिला', 'Ram met the teacher'],
        ]],
        ['Imperative', [
          ['dO:दरवाज़ा / P:खोलो', 'Open the door'],
          ['A:धीरे / P:चलो', 'Walk slowly'],
        ]],
      ],
    },
    {
      n: 4, title: 'The Verb Group', hindi: 'क्रिया समूह', pages: '61–79',
      ideas: 'VP contains a verb group with a lexical head and auxiliaries for tense, modality, aspect and voice. Each element fixes the form of its neighbour. The class label moves up to Vgp.',
      rules: ['VP → (complements) + Vgp', 'Vgp → (NEG) + V + (AUX)', 'AUX → (VEC) / (PASS) + (MOD) + (PROG / PERF / HAB) + (TENSE)'],
      english: 'AUX + V, ordered tense/modal, perfect, progressive, passive. There are two tenses, and a modal excludes tense. Do supports negation and questions.',
      hindiRule: 'The mirror image: V + passive, modal, aspect, tense. A modal and tense combine (पढ़ सकता था), future is an inflection (जाएगा), and there is no do-support. (hab), (perf) and (past) are abstract elements, like Thomas’s (pres).',
      tests: ['Selection: stem + रहा / सकता / चुका; perfective participle + जाना (passive); infinitive + चाहिए.',
        'Compound or conjunct? A compound verb is a verb stem + a vector (खा लेना, सो जाना). A conjunct verb is a noun or adjective + a verbaliser (मदद करना, साफ़ करना). Both second verbs are light verbs, but only the first kind is called a vector.', 'ने appears only with perfective transitive verbs. Then the verb agrees with an unmarked object: राम ने रोटी खाई।'],
      groups: [
        ['Tense', [
          ['S:राम / dO:रोटी / P:खाता है', 'Ram eats bread'],
          ['S:राम ने / dO:रोटी / P:खाई', 'Ram ate bread', 'खाई agrees with रोटी, not with राम.'],
          ['S:राम / dO:रोटी / P:खाएगा', 'Ram will eat bread'],
        ]],
        ['Modality', [
          ['S:सीता / dO:गाना / P:गा सकती है', 'Sita can sing a song'],
          ['S:वह / dO:हिंदी / P:पढ़ सकता था', 'He could read Hindi', 'Modal and tense together, which English does not allow.'],
          ['S:छात्रों को / dO:किताब / P:पढ़नी चाहिए', 'The students should read the book', 'चाहिए takes a को subject.'],
        ]],
        ['Aspect', [
          ['S:राम ने / dO:काम / P:किया है', 'Ram has done the work'],
          ['S:राम / dO:खाना / P:खा चुका है', 'Ram has already eaten'],
          ['S:सीता / A:बाज़ार में / P:घूम रही थी', 'Sita was strolling in the market'],
          ['S:बच्चे / P:सो रहे होंगे', 'The children will be sleeping'],
        ]],
        ['Passive', [
          ['S:चोर / P:पकड़ा गया', 'The thief was caught'],
          ['S:चोर / A:पुलिस के द्वारा / P:पकड़ा गया', 'The thief was caught by the police', 'The agent is an optional adverbial PP.'],
          ['S:किताब / iO:बच्चे को / P:दी गई', 'The book was given to the child'],
          ['S:खाना / P:पकाया जा रहा है', 'The food is being cooked'],
        ]],
        ['Negation', [
          ['S:राम / dO:चाय / P:नहीं पीता', 'Ram does not drink tea'],
        ]],
        ['Compound verbs and conjunct verbs', [
          ['S:राम ने / dO:आम / P:खा लिया', 'Ram ate up the mango', 'Compound verb: the stem खा and the vector लिया (VEC). लेना is transitive, so the subject can take ने.'],
          ['S:बच्चा / P:सो गया', 'The child fell asleep', 'Compound verb with the vector जाना. जाना is intransitive, so the subject takes no ने.'],
          ['S:बच्चा / P:गिर पड़ा', 'The child fell down', 'The vector पड़ना adds suddenness.'],
          ['S:राम ने / dO:सीता की मदद / P:की', 'Ram helped Sita', 'Conjunct verb मदद करना: a noun and the verbaliser करना. The verb agrees with मदद (की, feminine). This course analyses मदद as the object.'],
          ['S:राम ने / dO:काम / P:किया', 'Ram did the work', 'Conjunct verb काम करना, analysed here as object + verb.'],
          ['S:राम ने / dO:मदद / P:नहीं की', 'Ram did not help', 'नहीं can stand between मदद and की, so a conjunct verb is not a single word.'],
        ]],
      ],
    },
    {
      n: 5, title: 'The Noun Phrase', hindi: 'संज्ञा पदबंध', pages: '80–100',
      ideas: 'The noun is the head. Determiners, genitives, adjectives and nouns premodify it; phrases and clauses can modify it too. N′ is the unit larger than N and smaller than NP.',
      rules: ['NP → DET + N′', "N′ → AP + N′", "N′ → N + (S₂)", 'DET → POSS', 'POSS → NP + का / के / की', 'PP → NP + वाला'],
      english: '’s forms the genitive, and modifying PPs follow the noun (the cat with three legs).',
      hindiRule: 'का/के/की forms POSS and agrees with the possessed noun. Phrasal modifiers precede the noun (तीन पैरों वाली बिल्ली). Only जो clauses may follow it.',
      tests: ['N′ test: यह [भूरा कुत्ता] या वह वाला? Here वाला replaces “भूरा कुत्ता”, like English one.', 'Pronoun substitution takes in the whole NP, including all its modifiers.'],
      groups: [
        ['Pronouns', [
          ['S:उसने / dO:मुझे / P:देखा', 'He/she saw me', 'Pronouns fuse with case.'],
          ['S:कौन / P:आया', 'Who came?'],
        ]],
        ['Determiners and genitives', [
          ['S:मेरी किताब / sC:मेज़ पर / P:है', 'My book is on the table'],
          ['S:सीता का बच्चा / P:रो रहा है', 'Sita’s child is crying'],
          ['S:इस लड़के के कपड़े / sC:बहुत गंदे / P:हैं', 'This boy’s clothes are very dirty'],
        ]],
        ['Adjectives and N′', [
          ['S:वह मोटा कुत्ता / P:भौंका', 'That fat dog barked'],
          ['S:वह मोटा भूरा कुत्ता / P:भौंका', 'That fat brown dog barked'],
          ['S:मैंने / dO:एक नया कंप्यूटर खेल / P:खरीदा', 'I bought a new computer game', 'The modifying noun sits under the N node.', 'N:कंप्यूटर खेल'],
        ]],
        ['Phrasal modifiers', [
          ['S:कुत्ते ने / dO:वह तीन पैरों वाली बिल्ली / P:देखी', 'The dog saw that cat with three legs', '', 'PP:तीन पैरों वाली'],
          ['S:चश्मे वाला आदमी / P:हँसा', 'The man with glasses laughed'],
          ['S:आदमी / A:सड़क पर / P:चला', 'The man walked on the road', 'Compare: this PP is an adverbial in VP, not a modifier in NP.'],
        ]],
        ['Relative clause', [
          ['S:वह लड़का जो खेल रहा है / sC:मेरा भाई / P:है', 'That boy who is playing is my brother'],
        ]],
      ],
    },
    {
      n: 6, title: 'Subordination and Coordination', hindi: 'अधीनस्थता और समन्वय', pages: '101–123',
      ideas: 'S means clause. A subordinate S₂ is embedded with a function in S₁ or in a phrase. Coordinated constituents have equal rank. A triangle stands for a constituent left unanalysed.',
      rules: ['S₂ → subordinator + S', 'S₂ → VP (non-finite)', 'VP → Vgp + S₂ (कि clause)', 'S₁ → S + coord + S', 'NP → NP + coord + NP'],
      english: 'Relative clauses follow the noun, and that, -ing, -en and to-infinitives introduce embedding.',
      hindiRule: 'कि clauses follow the verb. जो…वह correlatives adjoin to S. Non-finite clauses use -ना (infinitive), -कर (conjunctive participle) and ता/या हुआ (participles).',
      tests: ['A noun clause can be replaced by यह: राम यह जानता है।', 'An adverbial clause can be left out, and the main clause is still complete.'],
      groups: [
        ['Relative and correlative clauses', [
          ['S:वह बिल्ली जो सो रही है / sC:सुंदर / P:है', 'That cat which is sleeping is beautiful'],
          ['A:जो लड़का आया / S:वह / sC:मेरा दोस्त / P:है', 'The boy who came is my friend', 'A correlative: S₂ hangs from S₁, and वह picks it up.'],
        ]],
        ['Adverbial clauses', [
          ['A:अगर बारिश होगी / S:हम / A:घर में / P:रहेंगे', 'If it rains we will stay at home'],
          ['A:जब शिक्षक आए / S:छात्र / P:उठे', 'When the teacher came the students rose'],
          ['S:राम / P:सोया / A:क्योंकि वह बीमार था', 'Ram slept because he was ill'],
        ]],
        ['Noun and complement clauses', [
          ['S:राम / P:जानता है / dO:कि सीता आएगी', 'Ram knows that Sita will come'],
          ['S:माँ ने / iO:बच्चे को / P:बताया / dO:कि बस आई है', 'Mother told the child that the bus has come'],
          ['S:सच / sC:यह / P:है / sC:कि राम बीमार है', 'The truth is that Ram is ill', 'यह anticipates the postposed complement clause.'],
          ['S:माँ / sC:खुश / P:है / sC:कि बेटा आया', 'Mother is happy that her son came', 'The clause complements खुश but is extraposed after the verb, so sC is discontinuous.'],
        ]],
        ['Non-finite clauses', [
          ['S:बच्चा / dO:दूध पीना / P:चाहता है', 'The child wants to drink milk'],
          ['S:हिंदी सीखना / sC:आसान / P:है', 'To learn Hindi is easy'],
          ['S:राम / A:खाना खाकर / P:सोया', 'Having eaten, Ram slept'],
          ['S:वह / A:पढ़ने के लिए / P:आया', 'He came to study'],
          ['S:मैंने / dO:दौड़ते हुए लड़के को / P:देखा', 'I saw the running boy', 'Reading 1: the boy was running.'],
          ['S:मैंने / A:दौड़ते हुए / dO:लड़के को / P:देखा', 'While running, I saw the boy', 'Reading 2: I was running.'],
        ]],
        ['Coordination and ambiguity', [
          ['S:राम / dO:चाय / P:पीता है और / S:सीता / dO:दूध / P:पीती है', 'Ram drinks tea and Sita drinks milk'],
          ['S:राम और सीता / sC:अच्छे दोस्त / P:हैं', 'Ram and Sita are good friends'],
          ['S:बूढ़ी औरतें और आदमी / P:आए', 'Old women and men came', 'Reading 1: only the women are old.', 'NP:बूढ़ी औरतें'],
          ['S:बूढ़ी औरतें और आदमी / P:आए', 'Old [women and men] came', 'Reading 2: both are old.', 'N:औरतें और आदमी'],
        ]],
      ],
    },
  ];

  let count = 0;
  for (const ch of chapters) {
    ch.examples = [];
    ch.groups = ch.groups.map(([title, list]) => ({
      title,
      items: list.map(([analysis, english, note, need]) => {
        const key = analysis.split(' / ').map((part) => {
          const i = part.indexOf(':');
          return { fn: part.slice(0, i), text: part.slice(i + 1) };
        });
        // A coordinator is written with the clause before it but has no function.
        const sentence = key.map((k) => k.text).join(' ');
        key.forEach((k) => { k.text = k.text.replace(/ (और|लेकिन|या)$/, (m) => (k.fn === 'P' ? '' : m)); });
        const item = { id: `ex${++count}`, chapter: ch.n, sentence, key, english, note, need };
        ch.examples.push(item);
        return item;
      }),
    }));
  }

  let grammar = null;
  const cache = new Map();

  /** The model analysis of an example. */
  function solve(example) {
    if (cache.has(example.id)) return cache.get(example.id);
    grammar = grammar || HT.parser.compile(HT.grammar.thomas);
    const tokens = HT.tagger.tag(example.sentence);
    const { trees, error } = HT.parser.parse(tokens, grammar);
    const want = example.key.map((k) => `${k.fn}:${k.text}`).join('/');
    const index = trees.findIndex((tree) => {
      if (HT.tree.functions(tree).map((u) => `${u.fn}:${u.text}`).join('/') !== want) return false;
      if (!example.need) return true;
      let found = false;
      HT.tree.walk(tree, (n) => { if (n.c && `${n.l}:${HT.tree.text(n)}` === example.need) found = true; });
      return found;
    });
    const result = { tokens, trees, error, index: Math.max(index, 0), matched: index >= 0 };
    cache.set(example.id, result);
    return result;
  }

  HT.lessons = { chapters, solve, all: chapters.flatMap((c) => c.examples) };
})(globalThis.HT = globalThis.HT || {});
