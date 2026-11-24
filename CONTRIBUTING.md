# Contributing to HindiTree

Thank you for helping. HindiTree is a tool for analysing Hindi syntax, and
contributions from linguists, teachers, students and programmers are all
welcome: a wrong tree reported with a sentence is as useful as a pull
request.

## Reporting a problem

- **A wrong or missing tree.** In Make Structure, choose **Report this
  sentence**. It prepares an email with the sentence, the method and the
  tree. Or open an issue on GitHub with the same information.
- **A bug or a feature request.** Open an issue at
  <https://github.com/iamalinguist/hinditree/issues>. Say what you did,
  what you expected and what happened, and include the browser you used.
  A screenshot helps.

Please search the existing issues first.

## Getting help

For questions about using HindiTree in class or in research, write to
vivek.tripathi@ashoka.edu.in or open an issue with the label `question`.
Replies are usually within a week; this is a one-person project, so please
be patient.

## Contributing data and analyses

Linguistic contributions do not need any programming:

- **Words.** Missing words or verb forms, with their category and gloss.
- **Judgements.** Sentences with acceptability marks (`*`, `?`, `??`, `#`,
  `%`), ideally with the speaker's region, for the Hindi Lab.
- **Analyses.** Sentences where a method gives an analysis you think is
  wrong, with the analysis you would give and why.

Open an issue with the data, or send it by email.

## Contributing code

HindiTree is plain HTML, CSS and JavaScript with no build step and no
dependencies.

1. Fork the repository and create a branch.
2. Run the app: open `docs/index.html` in a browser, or serve the folder
   (for example `python -m http.server` inside `docs/`) and open
   <http://localhost:8000/>.
3. Make your change. See "Extending it" in the README for where things
   live.
4. Run the tests with Node.js 22 or later (no installation needed):

   ```
   node tests/run.js
   ```

   Add a test for any change in tagging, parsing or analysis.
5. Open a pull request that explains the change and, for linguistic
   changes, gives the Hindi sentences it affects. The tests run
   automatically on every pull request.

Conventions:

- Scripts are classic scripts, not ES modules, so the app also works from
  `file://`. Each file adds to the global `HT` namespace.
- A new script must be added to `docs/index.html`.
- When releasing, change the `?v=` date on the script and stylesheet links
  in `docs/index.html` so that browsers load the new files.
- Keep Methods 1 and 2 and their credits as they are unless the change is
  agreed first: they are tied to published work.
- Never commit copyrighted material such as textbook PDFs.

## Licence of contributions

By contributing, you agree that your code is released under the MIT
License and your content (lessons, examples, judgements, glosses and
documentation) under CC BY 4.0, as described in `LICENSE`.

## Conduct

Be respectful and constructive. Disagreement about analyses is welcome and
is part of linguistics; personal attacks are not. Speakers' judgements vary
by region and background, and no variety of Hindi is wrong.
