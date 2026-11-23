# Research and design notes

## 1. Sources and how far each was examined

| Source | Examined |
|---|---|
| Linda Thomas, *Beginning Syntax* (1993) | The text of chapters 1–6 and the rule summary (pp. 1–128), plus a visual check of 20 pages of tree diagrams. The answer key was not studied. |
| [lin-tree-solver](https://github.com/iamalinguist/lin-tree-solver) | Parser, data model and main screens. |
| HindiTree, live site and branches `main`, `feature-initial-app`, `feature_trials`, `gh-pages` | The live site in a browser, and the application logic of the newest branch (`feature_trials`, da20901). |
| Hindi grammar | General linguistic knowledge. The references in section 8 are suggested for checking and were **not consulted** while building. |

## 2. What the book requires of a teaching tool

| Chapter | Introduces | Requirement | In the app |
|---|---|---|---|
| 1 Tools for Analysis | Categories, NP, VP, form and function, dominance, rewrite rules | Trees with functions, and visible node relations | Function row, inspector showing dominance and sisters, rules read off each tree |
| 2 More on Categories | AdvP, PP, AP; attachment to VP or S | The same phrase attachable at two heights | Both attachments, plus "Attach higher" and "Join phrase" |
| 3 The Verb Phrase | Six verb classes, imperative | Class drives the required complements, and is printed on the node | One frame per class, with `[trans]` under V |
| 4 The Verb Group | Vgp, AUX, TENSE, MOD, PERF, PROG, PASS | Abstract elements such as (pres); class moves to Vgp | Inserted automatically and editable |
| 5 The Noun Phrase | Pronouns, genitive POSS, N′, modifiers | An intermediate level and nested NPs | N′ drawn where it branches |
| 6 Subordination and Coordination | S₁/S₂, clause types, triangles, ambiguity | Embedding, triangles, several trees per sentence | All three, with a reading selector |

Two properties of the book shaped the design most:

- **The notation grows.** The same sentence is drawn differently in chapters 1, 3, 4 and 5, so the app stores one full analysis and draws it at the chosen chapter's level.
- **Every exercise asks for form and function.** A tree alone is half an answer, so functions appear on the tree, in a table and in the practice questions.

## 3. Adapting English rules to Hindi

### Rules

```
S     → NP VP
NP    → PRO | N | DET N′ | AP N′ | NP CASE | NP coord NP
N′    → AP N′ | PP N′ | S₂ N′ | N S₂ | N
DET   → POSS
POSS  → NP का/के/की
AP    → (deg) A
AdvP  → (deg) Adv
PP    → (NP) P

VP    → (A) Vgp[intrans]
VP    → (A) dO Vgp[trans]
VP    → (A) iO dO Vgp[ditrans]
VP    → (A) sC Vgp[intens]
VP    → (A) dO oC Vgp[complex]
VP    → (A) pO Vgp[prep]
VP    → … Vgp S₂                  (postposed कि clause)

Vgp   → (NEG) V (AUX)
AUX   → (VEC) (MOD) (PROG | PERF | HAB) (TENSE)
AUX   → PASS (MOD) (PROG | PERF | HAB) (TENSE)
```

The full grammar is in `docs/js/grammar.js` and on the Syntax rules page.

### Decisions you may wish to change

Each of these is open to argument, so check that it matches what you want to teach.

1. **ने and को are CASE inside NP, while से, में and पर are P.** This keeps Thomas's definition "the subject is the NP immediately dominated by S" true for राम ने. The alternative is to treat every marker as P, which makes ergative subjects PPs.
2. **An indirect object is always NP + को.** The book's NP/PP alternation has no Hindi counterpart. Passivisation replaces it as the test.
3. **An experiencer with को is the subject in राम को बुखार है, but an adverbial in मुझे नींद आ रही है**, where नींद controls agreement and is taken as subject. A uniform dative-subject analysis is equally defensible.
4. **Aspect carried by inflection is an abstract leaf**, (hab) or (perf), just as Thomas treats (past). चुका and रहा are overt PERF and PROG.
5. **होना after a participle is TENSE. होना alone is an intensive V** followed by (pres) or (past).
6. **Future is a tense**, because -गा is inflectional. The book's two-tense claim is specific to English.
7. **Vector verbs are VEC inside AUX.** Many analyses make V + vector a complex V.
8. **वाला is an adnominal P.** It is also analysed as a suffix or a nominaliser.
9. **A degree word modifies A directly** (AP → deg A). The book's rule is AP → (AdvP) A, with deg inside AdvP.
10. **Correlative जो clauses adjoin to S₁. Postnominal ones are inside N′.**
11. **A scrambled object is drawn in place under S**, labelled dO. There is no movement or trace.
12. **An extraposed complement of an adjective** (खुश है कि…) is a second sC after the verb, because a tree without crossing branches cannot keep it inside AP.

## 4. What was taken from lin-tree-solver

| Idea | Here |
|---|---|
| The user annotates words and the solver finds all trees | Kept, with suggested annotations |
| Several categories per word express uncertainty | Kept (Ctrl-click) |
| Editable rule sets, because every textbook differs | Kept (My grammar) |
| Optional and repeated symbols in rules | Kept, with functions and costs added |
| Share by URL | Kept, carrying the edited tree as well |
| Nearley parser in a worker, unbounded number of trees | Replaced by a ranked chart parser that keeps the best 16 trees per cell |
| React, MUI, build step | Replaced by plain JavaScript, so the site is uploaded as it is and works offline |

No code was copied.

## 5. What changed from the earlier HindiTree

- The earlier app's Method 2 is kept as **Method 2: Toy Fragment by Tripathi et al.**, with its algorithm, rules, sentence splitting and credits. In a comparison with the old code on 80,000 random category sequences and 80,000 random sentences there were no differences.
- The earlier app's Method 1 was removed at the owner's request, together with its client-side editing password. Method 2 is read-only, and changes go in Method 3: My Grammar.
- The old parser returned one tree. The Thomas grammar returns ranked alternatives.

## 6. Verification

- `node tests/run.js` checks all 83 examples at all six levels, unseen sentences, notation round-trips, input validation, Method 2 and the English converter.
- On 30 fresh sentences that played no part in writing the grammar, 28 received an acceptable first analysis. The two failures were missing verbs, added afterwards. This is a small sample chosen by the developer, not a formal evaluation.
- The trees and Hindi examples have **not been reviewed by a second linguist or native-speaker teacher**. Read each chapter's examples before teaching it.

## 7. English to Hindi conversion

The Convert button in the Tree Studio is a rule-based converter (`docs/js/translate.js`), not machine translation. Using an online service would have needed an API key, would not work offline, and would send students' sentences to a third party.

It covers simple clauses: subject–object–verb order, ने and को, postpositions, tense, aspect, modals, passive, negation, agreement (including honorific plurals and अपना), possession with के पास, existential *there is*, यह/कि clauses, जो relative clauses, -कर and -ते हुए clauses, and *if/when/because*.

- Converting the English translations of the 83 course examples reproduced the course's Hindi word for word in 78 cases. All 83 outputs could be parsed.
- On 30 unseen English sentences written by the developer, all 30 outputs were parseable. On review, a few needed small changes: the verb's tense or aspect, a missing honorific, or a stylistic word order.
- Not handled: object and adverb questions (*what, where, why*), object relative clauses (*the dress that she wore*), and most idioms. These are declined, not guessed.

## 8. Known limits

- This is a teaching grammar and not a broad-coverage parser of Hindi.
- Gender, number and person agreement are not checked. Case checking covers common ने errors only.
- Unknown words are guessed from their shape and position, so their categories may need correcting.
- Not covered by rules: causative argument structure, ellipsis and gapping, long-distance dependencies, free order of more than two arguments. These can be drawn by hand.
- Transliteration uses a schwa-deletion heuristic and will miss some compounds and loanwords.
- Devanagari in exported SVG files uses the fonts of the computer that opens them. Use PNG for slides.

## 9. References for checking the Hindi analysis

- Butt, M. (1995). *The Structure of Complex Predicates in Urdu*. CSLI.
- Kachru, Y. (2006). *Hindi*. John Benjamins.
- Koul, O. N. (2008). *Modern Hindi Grammar*. Dunwoody Press.
- Mahajan, A. (1990). *The A/A-bar Distinction and Movement Theory*. PhD thesis, MIT.
- Mohanan, T. (1994). *Argument Structure in Hindi*. CSLI.
- Srivastav, V. (1991). The syntax and semantics of correlatives. *Natural Language and Linguistic Theory* 9, 637–686.
