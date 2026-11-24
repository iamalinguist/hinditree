/*
 * Hindi lexicon.
 *
 * Open classes are listed by citation form and inflected here, so adding a word
 * is a one-line edit. Format: "word:gloss". An underscore stands for a space.
 */
(function (HT) {
  'use strict';

  const CLASSES = ['intrans', 'trans', 'ditrans', 'intens', 'complex', 'prep'];

  /** Spelling-insensitive lookup key: nukta and chandrabindu are often omitted when typing. */
  const key = (w) => w.normalize('NFD').replace(/़/g, '').replace(/ँ/g, 'ं').normalize('NFC');

  const entries = (text) => text.trim().split(/\s+/).map((e) => e.replace(/_/g, ' ').split(':'));

  const words = new Map(); // key -> [{tag, gloss}]
  const verbs = new Map(); // key -> [{classes, kind, gloss}]

  function add(word, tag, gloss) {
    const k = key(word);
    const list = words.get(k) || [];
    if (!list.some((e) => e.tag === tag)) list.push({ tag, gloss: gloss || '' });
    words.set(k, list);
  }
  const addAll = (tag, text) => entries(text).forEach(([w, g]) => add(w, tag, g));

  // Closed classes come first: their reading is preferred for homonyms.
  addAll('CASE.erg', 'ने:ERG');
  addAll('CASE.dat', 'को:ACC/DAT');
  addAll('gen', 'का:GEN के:GEN की:GEN');
  addAll('P', `में:in पर:on से:from/by/with तक:up_to के_लिए:for के_साथ:with के_पास:near के_नीचे:under
    के_ऊपर:above के_पीछे:behind के_सामने:in_front_of के_अंदर:inside के_भीतर:inside के_बाहर:outside के_बाद:after
    के_पहले:before से_पहले:before के_द्वारा:by द्वारा:by के_बारे_में:about की_ओर:towards की_तरफ़:towards
    के_कारण:because_of के_बिना:without के_बीच:between के_किनारे:beside के_दौरान:during साथ:with लिए:for
    पास:near नीचे:down ऊपर:up अंदर:inside बाहर:outside पीछे:behind सामने:in_front`);
  addAll('P.adn', 'वाला:with वाली:with वाले:with');

  addAll('PRO.erg', `मैंने:I.ERG हमने:we.ERG तुमने:you.ERG तूने:you.ERG आपने:you.ERG उसने:3SG.ERG इसने:3SG.ERG
    उन्होंने:3PL.ERG इन्होंने:3PL.ERG किसने:who.ERG`);
  addAll('PRO.dat', `मुझे:me हमें:us तुम्हें:you तुझे:you उसे:him/her इसे:him/her/it उन्हें:them इन्हें:them किसे:whom`);
  addAll('PRO.pp', `उससे:from/with.3SG इससे:from/with.3SG मुझसे:from/with.me तुमसे:from/with.you हमसे:from/with.us
    उनसे:from/with.3PL किससे:from/with.whom मुझमें:in.me उसमें:in.3SG इसमें:in.this उसपर:on.3SG`);
  addAll('PRO', `मैं:I हम:we तू:you तुम:you आप:you कौन:who क्या:what खुद:self स्वयं:self अपने_आप:self मुझ:me तुझ:you
    किस:whom किसी:someone उसके:3SG.GEN इसके:3SG.GEN उनके:3PL.GEN मेरे:1SG.GEN तुम्हारे:2.GEN हमारे:1PL.GEN`);
  // Demonstratives and quantifiers are both DET and PRO (Thomas, ch. 5); the parser chooses.
  // Hindi has no separate third-person pronoun: alone, the demonstratives are
  // he/she/it and they, marked for distance (near/far) rather than gender.
  addAll('DET', `यह:this वह:that ये:these वे:those इस:this उस:that इन:these उन:those कोई:some कुछ:some सब:all सभी:all`);
  addAll('PRO', `यह:he/she/it_(near) वह:he/she/it_(far) ये:they_(near) वे:they_(far) इस:him/her/it_(near)
    उस:him/her/it_(far) इन:them_(near) उन:them_(far) कोई:someone कुछ:something सब:everyone सभी:everyone`);
  addAll('DET', `एक:a/one हर:every प्रत्येक:each कई:several सारे:all सारी:all सारा:all कौन_सा:which कौन_सी:which कौन_से:which
    किस:which किसी:some कितने:how_many कितनी:how_many कितना:how_much मेरा:my मेरी:my मेरे:my हमारा:our हमारी:our
    हमारे:our तेरा:your तेरी:your तेरे:your तुम्हारा:your तुम्हारी:your तुम्हारे:your आपका:your आपकी:your आपके:your
    उसका:his/her उसकी:his/her उसके:his/her इसका:its इसकी:its इसके:its उनका:their उनकी:their उनके:their
    अपना:own अपनी:own अपने:own किसका:whose किसकी:whose किसके:whose`);
  addAll('PRO', 'मेरा:mine मेरी:mine तुम्हारा:yours तुम्हारी:yours उसका:his/hers उसकी:his/hers');
  addAll('PRO.rel', 'जो:who/which जिस:which जिन:which');
  addAll('PRO.relerg', 'जिसने:who.ERG जिन्होंने:who.PL.ERG');
  addAll('PRO.reldat', 'जिसे:whom जिन्हें:whom');
  addAll('DET.rel', 'जो:which जिस:which जिन:which');

  addAll('sub.comp', 'कि:that');
  addAll('sub.adv', `क्योंकि:because अगर:if यदि:if जब:when जैसे_ही:as_soon_as हालाँकि:although यद्यपि:although
    ताकि:so_that जहाँ:where चूँकि:since`);
  addAll('coord', 'और:and या:or लेकिन:but परंतु:but किंतु:but मगर:but तथा:and एवं:and पर:but');
  addAll('NEG', 'नहीं:not न:not मत:don’t ना:not');
  addAll('part', 'ही:only भी:also तो:TOP');
  addAll('part.q', 'क्या:Q');
  addAll('part.corr', 'तो:then तब:then फिर:then');

  addAll('Adv.s', `शायद:perhaps दुर्भाग्य_से:unfortunately सौभाग्य_से:fortunately ज़रूर:certainly सचमुच:really
    वास्तव_में:actually बेशक:certainly अवश्य:certainly स्पष्टतः:clearly संभवतः:possibly`);
  addAll('Adv', `धीरे:slowly धीरे-धीरे:slowly जल्दी:quickly तेज़ी_से:quickly ज़ोर_से:loudly ध्यान_से:carefully
    आराम_से:comfortably प्यार_से:lovingly खुशी_से:happily चुपचाप:quietly लगातार:continually अचानक:suddenly
    आज:today कल:yesterday/tomorrow परसों:day_after अब:now अभी:right_now तब:then फिर:again यहाँ:here वहाँ:there
    हमेशा:always रोज़:daily हर_रोज़:every_day हर_दिन:every_day अक्सर:often कभी-कभी:sometimes कब:when कहाँ:where
    कैसे:how क्यों:why तेज़:fast अच्छा:well सुबह:in_the_morning शाम:in_the_evening देर:late`);
  addAll('deg', 'बहुत:very ज़्यादा:too काफ़ी:quite थोड़ा:a_little बेहद:extremely अत्यंत:extremely इतना:so इतनी:so इतने:so कम:less बिल्कुल:absolutely');

  // Adjectives; those in -ā inflect (-e, -ī).
  entries(`अच्छा:good बुरा:bad बड़ा:big छोटा:small लंबा:tall ठिगना:short मोटा:fat पतला:thin पुराना:old नया:new बूढ़ा:old
    काला:black पीला:yellow नीला:blue हरा:green भूरा:brown गंदा:dirty मीठा:sweet ठंडा:cold ऊँचा:high प्यारा:lovely
    भूखा:hungry प्यासा:thirsty सस्ता:cheap महँगा:expensive गहरा:deep टूटा:broken खड़ा:standing सच्चा:true झूठा:false
    अकेला:alone गोरा:fair लाल:red सफ़ेद:white सुंदर:beautiful खुश:happy उदास:sad नाराज़:angry दुखी:unhappy बीमार:ill
    स्वस्थ:healthy गरम:hot साफ़:clean कठिन:difficult मुश्किल:difficult आसान:easy सरल:simple बुद्धिमान:intelligent
    होशियार:clever मूर्ख:foolish चालाक:cunning आलसी:lazy मेहनती:hardworking ईमानदार:honest शरारती:naughty
    महत्वपूर्ण:important ज़रूरी:necessary संभव:possible असंभव:impossible बंद:closed तैयार:ready तेज़:sharp
    गरीब:poor अमीर:rich निर्दोष:innocent सही:correct गलत:wrong परेशान:worried डरावना:frightening स्वादिष्ट:tasty
    रोचक:interesting शुरू:begun ख़त्म:finished दो:two तीन:three चार:four पाँच:five छह:six सात:seven आठ:eight दस:ten पहला:first दूसरा:second`)
    .forEach(([w, g]) => {
      add(w, 'A', g);
      if (/ा$/.test(w)) ['े', 'ी'].forEach((end) => add(w.slice(0, -1) + end, 'A', g));
    });

  // Proper nouns do not inflect.
  addAll('N', `राम:Ram सीता:Sita मोहन:Mohan सोहन:Sohan गीता:Gita रीता:Rita मीरा:Meera रवि:Ravi अमित:Amit नेहा:Neha
    अनु:Anu अंजलि:Anjali राहुल:Rahul सुनीता:Sunita कमला:Kamala श्याम:Shyam विजय:Vijay दिल्ली:Delhi मुंबई:Mumbai
    भारत:India हिंदी:Hindi अंग्रेज़ी:English संस्कृत:Sanskrit सोमवार:Monday रविवार:Sunday`);

  // Common nouns: direct, oblique and plural forms are generated.
  entries(`लड़का:boy लड़की:girl बच्चा:child बच्ची:child आदमी:man औरत:woman महिला:woman माँ:mother पिता:father भाई:brother
    बहन:sister दादी:grandmother नानी:grandmother दादा:grandfather चाचा:uncle बेटा:son बेटी:daughter दोस्त:friend
    लोग:people लोगो:people राजा:king रानी:queen शिक्षक:teacher अध्यापक:teacher छात्र:student छात्रा:student
    विद्यार्थी:student डॉक्टर:doctor किसान:farmer चोर:thief पुलिस:police अध्यक्ष:president नेता:leader
    गायिका:singer भाषाविद्:linguist मज़दूर:worker दुकानदार:shopkeeper जनता:public मेहमान:guest दुश्मन:enemy
    कुत्ता:dog बिल्ली:cat चूहा:mouse गाय:cow घोड़ा:horse शेर:lion पक्षी:bird चिड़िया:bird मछली:fish हाथी:elephant
    बंदर:monkey साँप:snake घर:house कमरा:room दरवाज़ा:door खिड़की:window छत:roof बगीचा:garden बाग:garden मैदान:field
    पेड़:tree फूल:flower नदी:river पहाड़:mountain सड़क:road गाँव:village शहर:city देश:country बाज़ार:market
    दुकान:shop स्कूल:school विद्यालय:school विश्वविद्यालय:university कक्षा:class पुस्तकालय:library अस्पताल:hospital
    मंदिर:temple मेज़:table कुर्सी:chair बिस्तर:bed चटाई:mat दीवार:wall अलमारी:cupboard थैला:bag गिलास:glass
    किताब:book पुस्तक:book कलम:pen पत्र:letter चिट्ठी:letter कहानी:story कविता:poem गीत:song गाना:song फ़िल्म:film
    सवाल:question जवाब:answer वाक्य:sentence शब्द:word भाषा:language भाषाविज्ञान:linguistics व्याकरण:grammar
    परीक्षा:exam पाठ:lesson तस्वीर:picture अख़बार:newspaper खबर:news खेल:game गेंद:ball कंप्यूटर:computer
    खिलौना:toy गाड़ी:car बस:bus ट्रेन:train साइकिल:bicycle चाबी:key पैसा:money रुपया:rupee कपड़ा:cloth कुरता:kurta
    साड़ी:sari टोपी:hat चश्मा:glasses दूरबीन:telescope हड्डी:bone पैर:leg हाथ:hand आँख:eye दिल:heart सिर:head
    खाना:food रोटी:bread चावल:rice दाल:lentils पानी:water दूध:milk चाय:tea कॉफ़ी:coffee आम:mango सेब:apple फल:fruit
    केक:cake मिठाई:sweet दिन:day रात:night सुबह:morning शाम:evening दोपहर:afternoon समय:time साल:year छुट्टी:holiday
    बारिश:rain हवा:wind सूरज:sun चाँद:moon आग:fire काम:work सच:truth झूठ:lie बात:matter मदद:help प्यार:love
    गुस्सा:anger डर:fear भूख:hunger नींद:sleep बुखार:fever खुशी:happiness भरोसा:trust सपना:dream उपहार:gift
    तोहफ़ा:gift चोरी:theft इनाम:prize नाम:name आदत:habit लक्ष्य:aim ज़मीन:ground बैठक:meeting चुनाव:election
    सरकार:government समस्या:problem उत्तर:answer गिटार:guitar तबला:tabla मेहनत:hard_work कोशिश:effort
    याद:memory इंतज़ार:waiting पसंद:liking शादी:marriage स्वागत:welcome इस्तेमाल:use शिकायत:complaint बहस:argument
    ध्यान:attention पूजा:worship मज़ाक:joke आराम:rest`)
    .forEach(([w, g]) => {
      add(w, 'N', g);
      if (w === 'घर') add(w, 'Adv', 'home'); // bare goal: घर जाना
      const base = w.slice(0, -1);
      let forms;
      if (/ियाँ?$|िया$/.test(w)) forms = [base + 'ाँ', base + 'ों'];
      else if (/(ता|मा|दा|चा|जा|ना|ला|षा|था|का|शा|सा)$/.test(w) && /^(पिता|दादा|चाचा|राजा|नेता|माता|जनता|भाषा|कविता|छात्रा|गायिका|कक्षा|परीक्षा|महिला|समस्या)$/.test(w)) {
        forms = [w + 'एँ', w + 'ओं'];
      } else if (/ा$/.test(w)) forms = [base + 'े', base + 'ों'];
      else if (/ी$/.test(w)) forms = [base + 'ियाँ', base + 'ियों'];
      else if (/ि$/.test(w)) forms = [w + 'याँ', w + 'यों'];
      else if (/[क-ह़]$/.test(w)) forms = [w + 'ें', w + 'ों'];
      else forms = [];
      forms.forEach((f) => add(f, 'N', g + '.INFL'));
    });

  /*
   * Verbs: stem:gloss:classes[:perfective base].
   * The first class is the preferred one. A verb may belong to several (Thomas, p. 50).
   */
  const verbList = `सो:sleep:intrans हँस:laugh:intrans रो:cry:intrans दौड़:run:intrans चल:walk:intrans आ:come:intrans
    जा:go:intrans:ग पहुँच:arrive:intrans बैठ:sit:intrans उठ:rise:intrans गिर:fall:intrans तैर:swim:intrans उड़:fly:intrans
    भौंक:bark:intrans मुस्कुरा:smile:intrans नाच:dance:intrans चिल्ला:shout:intrans मर:die:intrans रुक:stop:intrans
    कूद:jump:intrans चमक:shine:intrans भाग:run_away:intrans निकल:go_out:intrans घूम:wander:intrans लेट:lie_down:intrans
    टूट:break:intrans खुल:open:intrans जाग:wake:intrans रह:live:intrans बरस:rain:intrans लौट:return:intrans जीत:win:trans,intrans
    खेल:play:intrans,trans पढ़:read:trans,intrans लिख:write:trans,intrans,ditrans गा:sing:trans,intrans पी:drink:trans
    खा:eat:trans सोच:think:trans,intrans देख:see:trans सुन:hear:trans जान:know:trans पहचान:recognise:trans
    चाह:want:trans पा:get:trans खरीद:buy:trans,ditrans बेच:sell:trans,ditrans तोड़:break:trans मार:hit:trans
    पकड़:catch:trans खोल:open:trans धो:wash:trans काट:cut:trans ढूँढ:search:trans छू:touch:trans ला:bring:trans,ditrans
    चुरा:steal:trans पका:cook:trans बजा:play:trans उठा:lift:trans पहन:wear:trans भूल:forget:trans सीख:learn:trans
    भगा:chase:trans जला:burn:trans खो:lose:trans चाट:lick:trans मान:consider:complex,trans समझ:understand:trans,complex
    दे:give:ditrans,trans:दि भेज:send:ditrans,trans दिखा:show:ditrans सुना:tell:ditrans,trans सिखा:teach:ditrans
    बता:tell:ditrans,trans पढ़ा:teach:ditrans,trans खिला:feed:ditrans पिला:make_drink:ditrans सौंप:hand_over:ditrans
    ले:take:trans:लि कर:do:trans,complex:कि कह:say:trans,complex,ditrans पूछ:ask:trans,prep
    चुन:choose:complex,trans बना:make:complex,trans,ditrans रख:put:complex,trans पुकार:call:complex,trans
    डाल:pour:complex,trans छोड़:leave:trans,complex लटका:hang:complex,trans
    हो:be:intens,intrans:हु लग:seem:intens बन:become:intens दिख:look:intens,intrans
    डर:fear:prep,intrans मिल:meet:prep,intrans लड़:fight:prep,intrans जुड़:join:prep निर्भर:depend:prep
    झाँक:peep:prep,intrans टकरा:collide:prep बोल:speak:trans,intrans थक:tire:intrans बह:flow:intrans उग:grow:intrans
    पड़:fall:intrans बच:survive:intrans हार:lose:intrans,trans बुला:call:trans,complex निकाल:take_out:trans बो:sow:trans ढक:cover:trans
    बाँट:distribute:trans,ditrans जोड़:join:trans खींच:pull:trans फेंक:throw:trans पीट:beat:trans रोक:stop:trans
    गिरा:drop:trans सुला:put_to_sleep:trans जगा:wake:trans चढ़:climb:intrans उतर:descend:intrans छिप:hide:intrans`;

  function addVerb(word, v, kind) {
    const k = key(word);
    const list = verbs.get(k) || [];
    list.push({ classes: v.classes, stem: v.stem, gloss: v.gloss, kind });
    verbs.set(k, list);
  }

  entries(verbList).forEach(([stem, gloss, classes, perfBase]) => {
    const v = { stem, gloss, classes: classes.split(',') };
    const each = (kind, forms) => forms.forEach((f) => addVerb(f, v, kind));
    each('stem', [stem]);
    each('hab', ['ता', 'ती', 'ते', 'तीं'].map((e) => stem + e));
    each('inf', ['ना', 'ने', 'नी'].map((e) => stem + e));
    each('cp', [stem + 'कर', stem === 'कर' ? 'करके' : stem + 'के']);

    if (perfBase === 'हु') each('perf', ['हुआ', 'हुई', 'हुए', 'हुईं']);
    else if (perfBase === 'ग') each('perf', ['गया', 'गई', 'गयी', 'गए', 'गये', 'गईं']);
    else if (perfBase) {
      const b = perfBase.slice(0, -1);
      each('perf', [b + 'िया', b + 'ी', b + 'िए', b + 'िये', b + 'ीं']);
    } else if (/ी$/.test(stem)) {
      const b = stem.slice(0, -1);
      each('perf', [b + 'िया', b + 'ी', b + 'िए', b + 'ीं']);
    } else if (/[ाो]$/.test(stem) || stem === 'आ') {
      each('perf', ['या', 'ई', 'यी', 'ए', 'ये', 'ईं'].map((e) => stem + e));
    } else if (/ू$/.test(stem)) {
      each('perf', ['आ', 'ई', 'ए'].map((e) => stem.slice(0, -1) + 'ु' + e));
    } else each('perf', ['ा', 'ी', 'े', 'ीं'].map((e) => stem + e));

    if (stem === 'दे' || stem === 'ले') {
      const b = stem[0];
      each('fut', ['ूँगा', 'ूँगी', 'ेगा', 'ेगी', 'ेंगे', 'ेंगी', 'ोगे', 'ोगी'].map((e) => b + e));
      each('imp', [b + 'ो', b + 'ीजिए']);
      each('subj', [b + 'ूँ', b + 'ें']);
    } else if (stem === 'हो') {
      each('fut', ['होगा', 'होगी', 'होंगे', 'होंगी', 'होऊँगा', 'होऊँगी']);
      each('subj', ['हों']);
    } else if (/([ािीुूेो]|^आ)$/.test(stem)) {
      const b = stem.replace(/ी$/, 'ि').replace(/ू$/, 'ु');
      each('fut', ['ऊँगा', 'ऊँगी', 'एगा', 'एगी', 'एँगे', 'एंगे', 'एँगी', 'ओगे', 'ओगी'].map((e) => b + e));
      each('imp', [b + 'ओ', b + 'इए']);
      each('subj', ['ऊँ', 'ए', 'एँ'].map((e) => b + e));
    } else {
      each('fut', ['ूँगा', 'ूँगी', 'ेगा', 'ेगी', 'ेंगे', 'ेंगी', 'ोगे', 'ोगी'].map((e) => stem + e));
      each('imp', [stem + 'ो', stem === 'कर' ? 'कीजिए' : stem + 'िए']);
      each('subj', ['ूँ', 'ें'].map((e) => stem + e));
    }
  });

  // होना: finite copula / tense auxiliary.
  const copula = new Map();
  for (const [tense, list] of [['pres', 'है हैं हूँ हो'], ['past', 'था थी थे थीं'], ['fut', 'होगा होगी होंगे होंगी']]) {
    list.split(' ').forEach((w) => copula.set(key(w), tense));
  }

  const longest = Math.max(...[...words.keys()].map((k) => k.split(' ').length));

  HT.lexicon = {
    CLASSES, key, longest,
    word: (w) => words.get(key(w)) || [],
    verb: (w) => verbs.get(key(w)) || [],
    copula: (w) => copula.get(key(w)),
  };
})(globalThis.HT = globalThis.HT || {});
