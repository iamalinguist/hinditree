# HindiTree

Analyse Hindi sentence structure using formal grammar. HindiTree draws, parses and teaches constituency trees for Hindi, following the course sequence of Linda Thomas, *Beginning Syntax* (1993).

## What it does

| Page | Purpose |
|---|---|
| **Tree Studio** | Type a Hindi sentence, or write English and choose **Convert**, and get every tree the grammar allows. Correct categories, edit any node, draw by hand, build step by step, present full screen, and export to PNG, JPEG, SVG or LaTeX. |
| **Course** | Six chapters matching the book, with rules, tests, 83 Hindi examples, printable handouts and worksheets. |
| **Practice** | Students name functions or verb classes, or draw a tree and have it checked. |
| **My examples** | Save trees in the browser, export or import a collection, print a handout. |
| **Syntax rules** | Method 1: Thomas, adapted to Hindi. Method 2: the toy fragment by Tripathi et al. Method 3: your own editable grammar. |
| **English to Hindi** | Where the book's English rules change for Hindi, and why. |

The research behind the design is in [RESEARCH.md](RESEARCH.md).

## Using it in class

1. Open **Course**, choose the chapter and click an example. It opens with that chapter's notation.
2. Choose **Present**, then **Start build**. The arrow keys, Space or a slide clicker reveal the tree level by level.
3. To ask rather than tell, switch on **Blank labels** before presenting, or print a worksheet.
4. For your own sentence, type it and choose **Analyse**. If the tree is wrong, click the word and correct its category, or edit the tree directly.
5. **Share link** gives students the exact tree you drew.

## Publishing on https://iamalinguist.github.io/hinditree/

The whole site is the `docs` folder. There is nothing to install or build.

The live site is served from the `gh-pages` branch, which holds the earlier app. Publishing from `main` leaves that branch untouched, so you can switch back at any time.

1. Commit and push `docs`, `tests`, `.gitignore`, `README.md` and `RESEARCH.md` to `main`.
2. On GitHub open **hinditree → Settings → Pages**.
3. Under **Build and deployment** choose **Deploy from a branch**, then branch `main` and folder `/docs`, and save.
4. Reload the site after a minute or two.

To roll back, select branch `gh-pages` and folder `/ (root)` on the same settings page.

Do not run the old `npm run deploy` afterwards. It writes the earlier app to `gh-pages`.

> **Never upload the book PDF.** This repository is public and the book is under copyright. `.gitignore` excludes `*.pdf`, but GitHub's drag-and-drop upload does not read `.gitignore`, so do not drag the PDF there.

## Running it on your computer

Open `docs/index.html` in a browser. Everything except Convert works without an internet connection.

## Extending it

| To change | Edit |
|---|---|
| Words and verb classes | `docs/js/lexicon.js`: one `word:gloss` or `stem:gloss:classes` entry |
| Examples and lesson text | `docs/js/lessons.js`: one line per example, for example `['S:राम / P:सोया', 'Ram slept']` |
| Grammar rules | `docs/js/grammar.js` |
| How words get categories | `docs/js/tagger.js` |
| Tree appearance | `docs/js/render.js` |

After a change, run the tests (Node.js 18 or later):

```
node tests/run.js
```

Every course example is tested, so a rule change that breaks an example is reported by name.

The **Convert** button sends the English sentence to the free [MyMemory](https://mymemory.translated.net/) translation service and is disabled when there is no internet connection. Anonymous use is limited to roughly 5,000 characters a day per connection. Machine translation can be wrong, so check the Hindi before teaching with it.

The interface font, DM Mono, is loaded from Google Fonts. Without the internet the app falls back to a system font, and everything except Convert still works.

When adding a script file, also add it to `docs/index.html`. The scripts are deliberately not ES modules, because modules do not load when the page is opened from disk.

## Credits

- Earlier HindiTree app and Method 2 (toy fragment): Tripathi Vivek and Rathod Dinesh ([paper](https://rupkatha.com/v16n103g/)).
- The annotate-then-solve idea: [Linguistics Tree Solver](https://github.com/adambcomer/lin-tree-solver) by Adam Comer (Apache-2.0). No code from it is used.
- Course sequence and notation: Linda Thomas (1993), *Beginning Syntax*, Blackwell. This project does not reproduce the book and is not affiliated with its author or publisher.
