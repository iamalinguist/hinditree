/*
 * Linda Thomas, Beginning Syntax (1993), adapted to Hindi.
 *
 * Notation
 *   A -> B C | D      alternatives
 *   X?  X*  X+        optional, any number, one or more
 *   X=dO              X has the function dO
 *   @1.5              cost of the rule on this line; cheaper trees are listed first
 *   Label.feature     the feature is internal, except verb classes, which are displayed
 *   _name             helper symbol, never drawn
 */
(function (HT) {
  'use strict';

  const thomas = `# CLAUSES (ch. 1; sentence adverbs ch. 2)
roots: S S.co
S -> _subj=S VP
S -> NP.dat=S VP @1.5
S -> AdvP.s=A _subj=S VP | _subj=S AdvP.s=A VP | _subj=S VP AdvP.s=A
S -> _adjunct=A _subj=S VP @0.3
S -> AdvP.s=A _adjunct=A _subj=S VP @0.5
S -> part.q _subj=S VP
# Subject omitted: imperative (ch. 3) or Hindi pro-drop
S -> VP @3
S -> AdvP.s=A VP @3.2
# Dative experiencer: मुझे नींद आ रही है
S -> NP.dat=A NP=S VP @2.2
# Hindi word order: object before subject
S -> NP.dat=iO NP=S VP.dpass
S -> _obj=dO NP.erg=S VP.gap @2.2
_subj -> NP | NP.erg
_obj -> NP | NP.dat
_adjunct -> AdvP | PP | S2.cp | S2.pt

# NOUN PHRASE (ch. 5)
NP -> PRO | N | DET N'
NP -> AP N' | PP.adn N'
NP -> S2.pt N' @0.6
NP -> PP N' @3
NP -> N.c @2.5
NP -> N S2.rel @0.3
NP -> PRO S2.rel @0.4
NP -> NP part @0.2
NP -> NP coord NP @0.4
NP -> NP NP coord NP @1
N' -> N | PP.adn N'
N' -> AP N' @0.05
N' -> N S2.rel @0.2
N' -> S2.pt N' @0.6
N' -> DET N' @2
N' -> N.c @2.5
N.c -> N N
N -> N coord N @0.6
DET -> POSS
POSS -> NP gen | S2.inf gen
# Case marks the whole NP, which remains an NP
NP.erg -> PRO.erg | NP CASE.erg | NP.erg part
NP.dat -> PRO.dat | NP CASE.dat | NP.dat part

# ADJECTIVE, ADVERB AND POSTPOSITIONAL PHRASES (ch. 2)
AP -> A | deg A
AP -> AdvP A @1.5
AP -> AP coord AP @0.5
AdvP -> Adv | deg Adv | AdvP part
AdvP -> deg @1.5
AdvP.s -> Adv.s
PP -> NP P | S2.inf P | PP part
PP -> P @1.2
# Pronoun fused with a postposition: उससे, मुझमें
PP -> PRO.pp
PP.adn -> NP P.adn

# VERB PHRASE: the six verb classes (ch. 3). Complements come before Vgp.
_x -> AdvP | PP | S2.cp | S2.pt
VP -> _x=A* Vgp.intrans
VP -> _x=A* NP=A _x=A* Vgp.intrans @2
VP -> _x=A* _obj=dO _x=A* Vgp.trans
VP -> _x=A* S2.inf=dO _x=A* Vgp.trans
VP -> _x=A* Vgp.trans S2.comp=dO
VP -> _x=A* NP.dat=iO _x=A* NP=dO _x=A* Vgp.ditrans
VP -> _x=A* NP=dO _x=A* NP.dat=iO _x=A* Vgp.ditrans @0.2
VP -> _x=A* NP.dat=iO _x=A* Vgp.ditrans S2.comp=dO
VP -> _x=A* _sc=sC _x=A* Vgp.intens
VP -> _x=A* Vgp.intens S2.comp=sC
VP -> _x=A* NP=sC Vgp.intens S2.comp=sC @0.5
VP -> _x=A* AP=sC Vgp.intens S2.comp=sC @0.2
_sc -> NP | AP | PP
_sc -> AdvP @0.4
_sc -> S2.inf @0.4
VP -> _x=A* _obj=dO _x=A* _oc=oC _x=A* Vgp.complex
_oc -> NP | AP | PP
VP -> _x=A* PP=pO _x=A* Vgp.prep
# Passive: the direct object has become the subject
VP -> _x=A* Vgp.trans_pass
VP -> _x=A* NP.dat=iO _x=A* Vgp.ditrans_pass
VP -> _x=A* _oc=oC _x=A* Vgp.complex_pass
VP.dpass -> _x=A* Vgp.ditrans_pass
VP.gap -> _x=A* Vgp.trans

# VERB GROUP (ch. 4): the mirror image of English
{class}Vgp.CLASS -> NEG? V.CLASS AUX?
{class}Vgp.CLASS -> V.CLASS AUX NEG @1
{class}Vgp.CLASS_pass -> NEG? V.CLASS AUX.pass
{class}Vgp.CLASS_pass -> V.CLASS NEG AUX.pass
AUX -> VEC? MOD? _aspect? TENSE?
AUX.pass -> PASS MOD? _aspect? TENSE?
_aspect -> PROG | PERF | HAB

# SUBORDINATION (ch. 6)
S2.comp -> sub.comp S
S2.adv -> sub.adv S
S -> S2.adv=A part.corr? _subj=S VP
S -> S2.adv=A part.corr? VP @3
S -> _subj=S VP S2.adv=A
S -> _subj=S S2.adv=A VP @0.5
S -> S2.inf=S VP @0.3
S -> S2.rel=A _subj=S VP @0.4
S -> S2.rel=A NP.dat=S VP @0.8
S -> S2.rel=A _obj=dO NP.erg=S VP.gap @0.6
S2.rel -> NP.rel=S VP
S2.rel -> NP.rel=dO _subj=S VP.gap
NP.rel -> PRO.rel | PRO.relerg | PRO.reldat | DET.rel N'
NP.rel -> NP.rel CASE.erg | NP.rel CASE.dat

# Non-finite clauses: infinitive, conjunctive participle, participle
{form}Vgp.CLASS_FORM -> NEG? V.CLASS_FORM
{form}S2.FORM -> VP.FORM
{form}VP.FORM -> _x=A* Vgp.intrans_FORM
{form}VP.FORM -> _x=A* _obj=dO _x=A* Vgp.trans_FORM
{form}VP.FORM -> _x=A* Vgp.trans_FORM @1.2
{form}VP.FORM -> _x=A* NP.dat=iO NP=dO Vgp.ditrans_FORM
{form}VP.FORM -> _x=A* _sc=sC Vgp.intens_FORM
{form}VP.FORM -> _x=A* _obj=dO _oc=oC Vgp.complex_FORM
{form}VP.FORM -> PP=pO Vgp.prep_FORM

# COORDINATION (ch. 6)
S.co -> S coord S @0.3
S.co -> S coord S coord S @0.3`;

  /** Expands the {class} and {form} templates into the plain grammar shown in the editor. */
  function expand(text) {
    const forms = ['inf', 'cp', 'pt'];
    const out = [];
    const seen = new Set();
    for (const line of text.split('\n')) {
      const perClass = line.includes('CLASS') ? HT.lexicon.CLASSES : [null];
      const perForm = line.includes('FORM') ? forms : [null];
      for (const c of perClass) {
        for (const f of perForm) {
          const result = line.replace(/^\{(class|form)\}/, '').replace(/CLASS/g, c).replace(/FORM/g, f);
          // Comments and blank lines may repeat; rules may not.
          if (result && seen.has(result)) continue;
          seen.add(result);
          out.push(result);
        }
      }
    }
    return out.join('\n');
  }

  // Categories offered in the word-by-word annotation panel.
  const tags = [
    ['Nominal', [['N', 'noun'], ['PRO', 'pronoun'], ['PRO.erg', 'pronoun + ने'], ['PRO.dat', 'pronoun + को'], ['PRO.pp', 'pronoun + postposition'],
      ['PRO.rel', 'relative pronoun'], ['PRO.relerg', 'relative pronoun + ने'], ['PRO.reldat', 'relative pronoun + को']]],
    ['Modifier', [['DET', 'determiner'], ['DET.rel', 'relative determiner'], ['A', 'adjective'], ['Adv', 'adverb'],
      ['Adv.s', 'sentence adverb'], ['deg', 'degree adverb']]],
    ['Marker', [['P', 'postposition'], ['P.adn', 'adnominal वाला'], ['CASE.erg', 'ergative ने'],
      ['CASE.dat', 'accusative/dative को'], ['gen', 'genitive का/के/की']]],
    ['Lexical verb', [['V.intrans', 'intransitive'], ['V.trans', 'transitive'], ['V.ditrans', 'ditransitive'],
      ['V.intens', 'intensive'], ['V.complex', 'complex-transitive'], ['V.prep', 'prepositional']]],
    ['Auxiliary', [['TENSE', 'tense'], ['MOD', 'modal'], ['PERF', 'perfect'], ['PROG', 'progressive'],
      ['HAB', 'habitual'], ['PASS', 'passive'], ['VEC', 'vector verb'], ['NEG', 'negation']]],
    ['Linker', [['sub.comp', 'subordinator कि'], ['sub.adv', 'adverbial subordinator'], ['coord', 'coordinator'],
      ['part', 'particle'], ['part.q', 'question क्या'], ['part.corr', 'correlative तो']]],
    ['Infinitive', HT.lexicon.CLASSES.map((c) => [`V.${c}_inf`, c])],
    ['Conjunctive -कर', HT.lexicon.CLASSES.map((c) => [`V.${c}_cp`, c])],
    ['Participle', HT.lexicon.CLASSES.map((c) => [`V.${c}_pt`, c])],
  ];

  HT.grammar = { thomas: expand(thomas), tags };
})(globalThis.HT = globalThis.HT || {});
