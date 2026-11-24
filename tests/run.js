/* Run with: node tests/run.js (no dependencies). */
'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

for (const file of ['util', 'lexicon', 'tagger', 'grammar', 'parser', 'tree', 'legacy', 'lessons', 'render', 'karaka']) {
  require(path.join(__dirname, '..', 'docs', 'js', `${file}.js`));
}
const { lexicon, tagger, grammar, parser, tree, legacy, lessons, render } = globalThis.HT;
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

test('ने follows the light verb in compound verbs', () => {
  const flagged = (t) => tagger.check(tagger.tag(t)).length > 0;
  assert.ok(flagged('राम ने आम खा गया'), 'जाना is intransitive');
  assert.ok(flagged('उसने गलती कर बैठा'), 'बैठना is intransitive');
  assert.ok(!flagged('राम ने आम खा लिया'), 'लेना is transitive');
  assert.ok(!flagged('राम ने चिट्ठी लिख डाली'), 'डालना is transitive');
  assert.ok(!flagged('राम आम खा गया'));
});
test('पड़ना: light verb after a stem, obligation after an infinitive', () => {
  const fns = (t) => tree.functions(parser.parse(tagger.tag(t), compiled).trees[0]).map((u) => `${u.fn}:${u.text}`).join(' / ');
  assert.equal(fns('पेड़ गिर पड़ा'), 'S:पेड़ / P:गिर पड़ा');
  assert.deepEqual(tagger.tag('पेड़ गिर पड़ा').map((t) => t.tags[0]), ['N', 'V.intrans', 'VEC', 'TENSE']);
  assert.equal(fns('मुझे जाना पड़ा'), 'S:मुझे / P:जाना पड़ा');
  assert.deepEqual(tagger.tag('मुझे जाना पड़ा').map((t) => t.tags[0]), ['PRO.dat', 'V.intrans', 'MOD', 'TENSE']);
});

test('light verbs as one verb: compound and conjunct verbs', () => {
  const one = (text) => {
    const out = tree.oneVerb(parser.parse(tagger.tag(text), compiled).trees[0]);
    return { br: tree.toBracket(out.tree).replace(/\{[^}]*\}/g, ''), fns: tree.functions(out.tree).map((u) => `${u.fn}:${u.text}`).join(' / '), notes: out.notes };
  };
  assert.match(one('राम ने आम खा लिया').br, /\[Vgp\.trans \[V\.trans \[V खा\] \[V लिया\]\] \[AUX \[TENSE \(past\)\]\]\]/);
  assert.equal(one('राम ने काम किया').fns, 'S:राम ने / P:काम किया');
  assert.equal(one('राम ने सीता की मदद की').fns, 'S:राम ने / dO:सीता की / P:मदद की');
  assert.equal(one('माँ ने कमरा साफ़ किया').fns, 'S:माँ ने / dO:कमरा / P:साफ़ किया');
  assert.equal(one('राम ने रोटी बनाई').fns, 'S:राम ने / dO:रोटी / P:बनाई');
  const split = one('राम ने मदद नहीं की');
  assert.equal(split.fns, 'S:राम ने / dO:मदद / P:नहीं की');
  assert.equal(split.notes.length, 1);
  // Every course sentence still works at every chapter level.
  for (const e of lessons.all) {
    const solved = lessons.solve(e);
    const t = tree.oneVerb(solved.trees[solved.index]).tree;
    assert.ok(globalThis.HT.karaka.analyse(t), `kāraka with one verb: ${e.sentence}`);
    assert.equal(tree.text(t), e.sentence);
    for (let level = 1; level <= 6; level++) assert.equal(tree.text(tree.present(t, level)), e.sentence);
  }
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

// Method 4: X-bar theory
const xbar = parser.compile(grammar.xbar);
const plain = (t) => tree.toBracket(t).replace(/\{[^}]*\}/g, '');
test('the X-bar grammar compiles', () => assert.deepEqual(xbar.errors, []));
test('X-bar: every course sentence parses, with the same functions as Method 1', () => {
  let matched = 0;
  for (const e of lessons.all) {
    const { trees } = parser.parse(tagger.tag(e.sentence), xbar);
    assert.ok(trees.length, e.sentence);
    const want = e.key.filter((k) => k.fn !== 'P').map((k) => `${k.fn}:${k.text}`).join('/');
    const got = tree.functions(trees[0]).filter((u) => u.fn !== 'P').map((u) => `${u.fn}:${u.text}`).join('/');
    if (got === want) matched++;
  }
  assert.ok(matched >= 82, `${matched} of ${lessons.all.length}`);
});
for (const [text, expected] of [
  ['राम ने सीता को किताब दी', "[TP [KP=S [K' [NP [N' [N राम]]] [K ने]]] [T' [VP.ditrans [KP=iO [K' [NP [N' [N सीता]]] [K को]]] [V' [NP=dO [N' [N किताब]]] [V=P दी]]] [T (past)]]]"],
  ['खाना पकाया जा रहा है', "[TP [NP=S [N' [N खाना]]] [T' [AspP [Asp' [VoiceP [Voice' [VP.trans [V' [V=P पकाया]]] [Voice जा]]] [Asp रहा]]] [T है]]]"],
  ['राम जानता है कि सीता आएगी', "[TP [TP [NP=S [N' [N राम]]] [T' [AspP [Asp' [VP.trans [V' [V=P जानता]]] [Asp (hab)]]] [T है]]] [CP=CL [C' [C कि] [TP [NP=S [N' [N सीता]]] [T' [VP.intrans [V' [V=P आएगी]]] [T (fut)]]]]]]"],
]) {
  test(`X-bar: ${text}`, () => assert.equal(plain(parser.parse(tagger.tag(text), xbar).trees[0]), expected));
}
test('X-bar: an extraposed कि clause is dO, or sC with an intensive verb', () => {
  const fns = (text) => tree.functions(parser.parse(tagger.tag(text), xbar).trees[0]).map((u) => u.fn).join(' ');
  assert.equal(fns('राम जानता है कि सीता आएगी'), 'S P dO');
  assert.equal(fns('सच यह है कि राम बीमार है'), 'S sC P sC');
});

// Kāraka view
const karaka = (text) => {
  const example = lessons.all.find((e) => e.sentence === text);
  const solved = example ? lessons.solve(example) : null;
  const t = solved ? solved.trees[solved.index] : parser.parse(tagger.tag(text), compiled).trees[0];
  const a = globalThis.HT.karaka.analyse(t);
  return a.arcs.map((arc) => `${a.chunks[arc.dep].text}:${arc.label}`).join(' / ');
};
for (const [text, expected] of [
  ['राम ने सीता को किताब दी', 'राम ने:k1 / सीता को:k4 / किताब:k2'],
  ['चोर पुलिस के द्वारा पकड़ा गया', 'चोर:k2 / पुलिस के द्वारा:k1'],
  ['बच्चा शेर से डरता है', 'बच्चा:k1 / शेर से:k5'],
  ['मेरी किताब मेज़ पर है', 'मेरी किताब:k1 / मेज़ पर:k7p'],
  ['सीता का बच्चा रो रहा है', 'सीता का:r6 / बच्चा:k1'],
  ['सीता सुबह बगीचे में घूमती है', 'सीता:k1 / सुबह:k7t / बगीचे में:k7p'],
  ['वह पढ़ने के लिए आया', 'वह:k1 / पढ़ने के लिए:rt'],
]) {
  test(`kāraka: ${text}`, () => {
    const got = karaka(text).split(' / ').sort().join(' / ');
    assert.equal(got, expected.split(' / ').sort().join(' / '));
  });
}
test('kāraka: every course sentence gets relations', () => {
  for (const e of lessons.all) {
    const solved = lessons.solve(e);
    assert.ok(globalThis.HT.karaka.analyse(solved.trees[solved.index]), e.sentence);
  }
});

// Word categories tab
require(path.join(__dirname, '..', 'docs', 'js', 'wordclass.js'));
test('word categories: coarse classes and clues', () => {
  const W = globalThis.HT.wordclass;
  assert.equal(W.coarse('V.trans_inf'), 'Verb');
  assert.equal(W.coarse('PRO.erg'), 'Pronoun');
  assert.equal(W.coarse('gen'), 'Case marker');
  assert.equal(W.coarse('TENSE'), 'Auxiliary');
  assert.match(W.clue({ w: 'खाता', g: '', tags: ['V.trans'] }), /habitual/);
  assert.match(W.clue({ w: 'लड़कों', g: 'boy.INFL', tags: ['N'] }), /inflected/);
});
test('obligation: मुझे खाना खाना है has a noun object and an infinitive verb', () => {
  const t = parser.parse(tagger.tag('मुझे खाना खाना है'), compiled).trees[0];
  assert.equal(tree.functions(t).map((u) => `${u.fn}:${u.text}`).join(' / '), 'S:मुझे / dO:खाना / P:खाना है');
});
test('Method 1 accepts a dropped object, but prefers an overt one', () => {
  const fn = (x) => tree.functions(parser.parse(tagger.tag(x), compiled).trees[0]).map((u) => `${u.fn}:${u.text}`).join(' / ');
  assert.equal(fn('मैंने खा लिया'), 'S:मैंने / P:खा लिया');
  assert.equal(fn('राम ने रोटी खाई'), 'S:राम ने / dO:रोटी / P:खाई');
});
test('participles modify a noun with or without हुआ, but not a pronoun', () => {
  const xbar = parser.compile(grammar.xbar);
  const b = (s, g = compiled) => tree.toBracket(parser.parse(tagger.tag(s), g).trees[0]);
  assert.match(b('बहता पानी ठंडा है'), /^\[S \[NP=S \[S2 \[VP \[Vgp.intrans \[V.intrans बहता\{flow.PTCP\}\]\]\]\] \[N पानी/);
  assert.match(b('बहता हुआ पानी ठंडा है'), /^\[S \[NP=S \[S2 \[VP \[Vgp.intrans \[V.intrans "बहता हुआ"/);
  assert.match(b('बहता पानी ठंडा है', xbar), /^\[TP \[NP=S \[N' \[VP.intrans/);
  assert.match(b('दौड़ते हुए वह गिरा'), /\[S2=A .*\[NP=S \[PRO वह/);
  assert.match(b('दौड़ते हुए वह गिरा', xbar), /^\[TP \[VP.intrans=A/);
  assert.match(b('जब शिक्षक आए छात्र उठे'), /आए\{come.PFV\}/);
});
test('complex postpositions take their complement: राम की ओर is one PP', () => {
  const t = parser.parse(tagger.tag('वह राम की ओर देख रहा है'), compiled).trees[0];
  assert.match(tree.toBracket(t), /\[PP=A \[NP \[N राम\{Ram\}\]\] \[P "की ओर"/);
  assert.equal(tree.functions(t).filter((u) => u.fn === 'dO').length, 0);
});
test('X-bar: a genitive can come before a demonstrative (राम की वह किताब)', () => {
  const xbar = parser.compile(grammar.xbar);
  const b = tree.toBracket(parser.parse(tagger.tag('राम की वह किताब मेज़ पर है'), xbar).trees[0]);
  assert.match(b, /\[NP=S \[KP .*राम.*की.*\] \[NP \[D वह\{that\}\] \[N' \[N किताब/);
});
test('demonstratives: DET before a noun, a third-person pronoun alone', () => {
  const b = (s) => tree.toBracket(parser.parse(tagger.tag(s), compiled).trees[0]);
  assert.match(b('वह मोटा भूरा कुत्ता भौंका'), /\[DET वह\{that\}\]/);
  assert.match(b('वह भौंका'), /\[PRO वह\{he\/she\/it \(far\)\}\]/);
  assert.match(b('वे भौंके'), /\[PRO वे\{they \(far\)\}\]/);
  assert.match(b('ये लड़के खेल रहे हैं'), /\[DET ये\{these\}\]/);
});

// Hindi Lab: judgement marks
global.localStorage = { getItem: () => null, setItem: () => {} };
for (const file of ['studio', 'pages', 'whatzit', 'lab']) require(path.join(__dirname, '..', 'docs', 'js', `${file}.js`));
test('Lab: judgement marks and headings are read', () => {
  const rows = globalThis.HT.labLines('# Heading\n#पत्थर ने रोटी खाई\n% मैंने बोला\n?? क\n* ख // note\nOK ग');
  assert.deepEqual(rows.map((r) => r.heading || `${r.judgement}${r.sentence}`), ['Heading', '#पत्थर ने रोटी खाई', '%मैंने बोला', '??क', '*ख', '✓ग']);
  assert.equal(rows[4].comment, 'note');
});
test('Whatzit?: stations are complete and their evidence reads as Lab lines', () => {
  const { STATIONS, PHASES } = globalThis.HT.whatzit;
  assert.equal(new Set(STATIONS.map((x) => x.id)).size, STATIONS.length);
  for (const x of STATIONS) {
    assert.ok(PHASES.some((p) => p.id === x.phase), x.id);
    assert.equal(x.hypotheses.length, 2, x.id);
    assert.ok(x.question && x.argument.length && x.readings.length && x.output, x.id);
    const rows = globalThis.HT.labLines(x.evidence);
    assert.ok(!x.evidence || rows.some((r) => r.sentence), x.id);
    rows.filter((r) => r.sentence).forEach((r) => assert.match(r.sentence, /^[ऀ-ॿ]/, `${x.id}: ${r.sentence}`));
  }
});

console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
