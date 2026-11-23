/* Run with: node tests/run.js (no dependencies). */
'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

for (const file of ['util', 'lexicon', 'tagger', 'grammar', 'parser', 'tree', 'legacy', 'lessons', 'render', 'translate']) {
  require(path.join(__dirname, '..', 'docs', 'js', `${file}.js`));
}
const { lexicon, tagger, grammar, parser, tree, legacy, lessons, render, translate } = globalThis.HT;
const compiled = parser.compile(grammar.thomas);
const analysis = (text) => {
  const { trees, error } = parser.parse(tagger.tag(text), compiled);
  assert.ok(trees.length, `${text}: ${error}`);
  return tree.functions(trees[0]).map((u) => `${u.fn}:${u.text}`).join(' / ');
};

let passed = 0;
let failed = 0;
function test(name, body) {
  try {
    body();
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}\n  ${error.message}`);
  }
}

test('the grammar compiles', () => assert.deepEqual(compiled.errors, []));

for (const example of lessons.all) {
  test(`chapter ${example.chapter}: ${example.sentence}`, () => {
    const solved = lessons.solve(example);
    assert.ok(solved.matched, 'no tree has the expected functions');
    const model = solved.trees[solved.index];
    assert.equal(tree.text(model), example.sentence);
    for (let level = 1; level <= 6; level++) {
      const view = tree.present(model, level);
      assert.equal(tree.text(view), example.sentence, `words lost at chapter ${level}`);
      assert.ok(render.draw(view, {}).svg.startsWith('<svg'));
      assert.equal(tree.compare(view, view).missing.length, 0);
    }
  });
}

// Sentences that are not among the course examples.
const unseen = {
  'राम चल रहा है': 'S:राम / P:चल रहा है',
  'लड़के ने सेब खाया': 'S:लड़के ने / dO:सेब / P:खाया',
  'मैं स्कूल जा रहा हूँ': 'S:मैं / A:स्कूल / P:जा रहा हूँ',
  'क्या तुम कल आओगे': 'S:तुम / A:कल / P:आओगे',
  'राम खाना खा रहा है': 'S:राम / dO:खाना / P:खा रहा है',
  'राम को बुखार है': 'S:राम को / sC:बुखार / P:है',
  'मुझे नींद आ रही है': 'A:मुझे / S:नींद / P:आ रही है',
  'मुझे घर जाना है': 'S:मुझे / A:घर / P:जाना है',
  'पिता ने बेटे को पैसे दिए': 'S:पिता ने / iO:बेटे को / dO:पैसे / P:दिए',
  'आम को राम ने खाया': 'dO:आम को / S:राम ने / P:खाया',
  'चोर पकड़ा जा सकता है': 'S:चोर / P:पकड़ा जा सकता है',
  'गीता खुश हो गई': 'S:गीता / sC:खुश / P:हो गई',
  'राम मोहन और सोहन आए': 'S:राम मोहन और सोहन / P:आए',
  'राजा ने मंत्री को बुलाया': 'S:राजा ने / dO:मंत्री को / P:बुलाया',
  'मैंने उससे बात की': 'S:मैंने / A:उससे / dO:बात / P:की',
};
for (const [text, expected] of Object.entries(unseen)) test(text, () => assert.equal(analysis(text), expected));

test('spelling without nukta is understood', () => {
  assert.equal(analysis('लडके ने दरवाजा खोला'), 'S:लडके ने / dO:दरवाजा / P:खोला');
  assert.equal(lexicon.key('हँसी'), lexicon.key('हंसी'));
});

test('ने errors are flagged', () => {
  assert.equal(tagger.check(tagger.tag('राम ने रोटी खाता है')).length, 1);
  assert.equal(tagger.check(tagger.tag('राम ने सोया')).length, 1);
  assert.equal(tagger.check(tagger.tag('राम ने रोटी खाई')).length, 0);
  assert.equal(tagger.check(tagger.tag('राम ने आम खा लिया')).length, 0);
});

test('bracket notation round-trips', () => {
  for (const example of lessons.all) {
    const { trees, index } = lessons.solve(example);
    assert.deepEqual(tree.fromBracket(tree.toBracket(trees[index], 0)), trees[index], example.sentence);
  }
});

test('broken notation is rejected', () => {
  for (const bad of ['[S [NP राम]', 'S', '[]', '[S] x']) assert.throws(() => tree.fromBracket(bad));
});

test('shared trees are validated', () => {
  assert.throws(() => tree.sanitize({ l: 'S' }));
  assert.throws(() => tree.sanitize({ l: 'S', c: [{ x: 1 }] }));
});

test('labels are escaped in SVG', () => {
  assert.ok(!render.draw({ l: '<script>', c: [{ w: '<img>' }] }, {}).svg.match(/<script>|<img>/));
});

test('cyclic user rules terminate', () => {
  const cyclic = parser.compile('roots: A\nA -> B | A A | x\nB -> A');
  const tokens = Array.from({ length: 12 }, () => ({ w: 'x', tags: ['x'] }));
  assert.ok(parser.parse(tokens, cyclic).trees.length);
});

for (const [id, expected] of [
  ['method2', '[S [NP [N_m राम]] [VP [NP_cm [NP [N_m आम]] [CM को]] [Verb_t [V_t खा] [Aux "-ता है"]]]]'],
]) {
  test(id, () => {
    const { text, tags } = legacy.methods[id].example;
    const tokens = legacy.tokenize(text).map((t, i) => ({ ...t, tags: [tags[i]] }));
    assert.equal(tree.toBracket(legacy.parse(tokens, id).trees[0]), expected);
  });
}

// English to Hindi converter
const converted = {
  'Ram gave Sita a book': 'राम ने सीता को किताब दी',
  'The children will be sleeping': 'बच्चे सो रहे होंगे',
  'The thief was caught by the police': 'चोर पुलिस के द्वारा पकड़ा गया',
  'Sita’s child is crying': 'सीता का बच्चा रो रहा है',
  'The students should read the book': 'छात्रों को किताब पढ़नी चाहिए',
  'Mohan made Gita angry': 'मोहन ने गीता को नाराज़ किया',
  'The child is afraid of the lion': 'बच्चा शेर से डरता है',
  'I saw the running boy': 'मैंने दौड़ते हुए लड़के को देखा',
  'My father reads the newspaper every day': 'मेरे पिता हर दिन अख़बार पढ़ते हैं',
  'Mohan wrote a letter to his friend': 'मोहन ने पत्र अपने दोस्त को लिखा',
  'Mohan wrote his friend a letter': 'मोहन ने अपने दोस्त को पत्र लिखा',
  'There is a book on the table': 'मेज़ पर एक किताब है',
  'Did you see the film?': 'क्या तुमने फ़िल्म देखी?',
  "Don't open the window": 'खिड़की मत खोलो',
  'The window was broken by the boys': 'खिड़की लड़कों के द्वारा तोड़ी गई',
};
for (const [english, hindi] of Object.entries(converted)) {
  test(`convert: ${english}`, () => assert.equal(translate(english).hindi, hindi));
}
test('the converter reports unknown words', () => {
  assert.deepEqual(translate('The dog chased a zebra').unknown, ['zebra']);
});
test('most course translations convert back to the course sentence', () => {
  const same = lessons.all.filter((e) => translate(e.english).hindi.replace(/[,?]/g, '') === e.sentence).length;
  assert.ok(same >= 75, `${same} of ${lessons.all.length}`);
});

console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
