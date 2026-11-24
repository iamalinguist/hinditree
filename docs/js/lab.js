/*
 * Hindi Lab: a space for building arguments about Hindi.
 *
 * Each data set holds sentences with judgements (✓, *, ?) and a notebook.
 * Running a set against a method shows where the analysis accepts what it
 * should reject (overgeneration) or rejects what it should accept
 * (undergeneration), which is the core test of a grammatical argument.
 *
 * The password only marks the Lab as a space for invited students. It is
 * checked in the browser, so it does not protect anything.
 */
(function (HT) {
  'use strict';
  const { esc, store, toast, download } = HT.util;

  const METHODS = [['thomas', 'Method 1: Thomas, adapted to Hindi'], ['xbar', 'Method 4: X-Bar Theory'], ['custom', 'Method 3: My Grammar']];
  const NOTES_TEMPLATE = 'Claim:\n\nData:\n\nTests:\n\nAnalysis:\n\nProblems and counterexamples:\n';
  const STARTER = {
    name: 'ने, aspect and agreement',
    text: `# ने needs a perfective transitive verb
राम ने रोटी खाई
राम रोटी खाता है
* राम ने रोटी खाता है
* राम ने सोया
राम सोया
# With ने the verb agrees with an unmarked object
राम ने किताब पढ़ी
* राम ने किताब पढ़ा   // agreement is not checked yet: expect overgeneration
राम ने लड़की को देखा
# Fronted objects
आम को राम ने खाया
? रोटी राम ने खाई`,
    notes: `Claim: ने appears only with perfective transitive verbs, and then the verb agrees with an unmarked object.

Data: see the data set.

Tests:

Analysis:

Problems and counterexamples:
- बोलना and समझना sometimes allow ने and sometimes not.
`,
  };

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const password = () => `hinditree${String(new Date().getDate()).padStart(2, '0')}`;
  const unlocked = () => store.get('labUnlocked', '') === today();

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function load() {
    const data = store.get('lab', null);
    if (data && Array.isArray(data.sets) && data.sets.length) return data;
    const set = { id: newId(), ...STARTER };
    return { sets: [set], current: set.id, method: 'thomas' };
  }
  const save = (data) => store.set('lab', data) || toast('The browser could not save. Export the Lab to keep your work.');

  /** One sentence per line: "* …" ungrammatical, "? …" doubtful, "# …" heading, "// …" comment. */
  function lines(text) {
    return text.split('\n').map((raw) => {
      const line = raw.trim();
      if (!line) return null;
      if (line.startsWith('#')) return { heading: line.replace(/^#+\s*/, '') };
      const [body, comment = ''] = line.split('//');
      let judgement = '✓';
      let sentence = body.trim();
      const m = sentence.match(/^(\*|\?\?|\?|✓|✔|OK)\s*/i);
      if (m) {
        judgement = m[1] === '*' ? '*' : m[1].startsWith('?') ? '?' : '✓';
        sentence = sentence.slice(m[0].length);
      }
      return sentence ? { judgement, sentence, comment: comment.trim() } : null;
    }).filter(Boolean);
  }

  function gate(el, refresh) {
    el.innerHTML = `<section class="card lab-gate">
      <h2>Hindi Lab</h2>
      <p>A space for building arguments about Hindi with invited students. Please enter today's password.</p>
      <form id="lab-form"><input id="lab-password" type="password" autocomplete="off" aria-label="Password">
        <button class="btn primary">Enter</button></form>
      <p id="lab-message" class="hint" role="status"></p></section>`;
    el.querySelector('#lab-form').onsubmit = (event) => {
      event.preventDefault();
      if (el.querySelector('#lab-password').value.trim() === password()) {
        store.set('labUnlocked', today());
        refresh();
      } else {
        el.querySelector('#lab-message').textContent = 'That password is not right for today.';
      }
    };
    el.querySelector('#lab-password').focus();
  }

  function lab(el) {
    if (!unlocked()) return gate(el, () => lab(el));
    const data = load();
    const set = data.sets.find((x) => x.id === data.current) || data.sets[0];
    data.current = set.id;
    if (!METHODS.some(([id]) => id === data.method)) data.method = 'thomas';

    el.innerHTML = `
      <div class="lab">
        <header class="page-head"><p>Your space for building arguments about Hindi: collect judgements, test an analysis against them, and keep notes. Everything stays in this browser; export it to keep a copy.</p></header>
        <section class="card">
          <div class="row">
            <label class="inline">Data set <select id="lab-set">${data.sets.map((x) =>
              `<option value="${esc(x.id)}" ${x.id === set.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
            <button class="btn small" id="lab-new">New</button>
            <input id="lab-name" value="${esc(set.name)}" aria-label="Name of this data set" maxlength="80">
            <button class="btn small" id="lab-rename">Rename</button>
            <button class="btn small danger" id="lab-delete">Delete</button>
            <span class="spacer"></span>
            <button class="btn small" id="lab-export">Export Lab</button>
            <label class="btn small file">Import<input id="lab-import" type="file" accept=".json,application/json"></label>
          </div>
        </section>
        <div class="lab-grid">
          <section class="card">
            <h2>Sentences and judgements</h2>
            <p class="hint">One sentence per line. Start with <b>*</b> if it is ungrammatical and <b>?</b> if doubtful. Lines starting with <b>#</b> are headings, and <b>//</b> starts a comment.</p>
            <textarea id="lab-text" rows="16" spellcheck="false" lang="hi">${esc(set.text)}</textarea>
            <div class="row method-actions">
              <label class="inline">Test with <select id="lab-method">${METHODS.map(([id, name]) =>
                `<option value="${id}" ${id === data.method ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
              <button class="btn primary" id="lab-run">Run</button>
            </div>
          </section>
          <section class="card">
            <h2>Notebook</h2>
            <p class="hint">State the claim, the data that supports it, the tests you used, and the problems you still see.</p>
            <textarea id="lab-notes" rows="18">${esc(set.notes || NOTES_TEMPLATE)}</textarea>
          </section>
        </div>
        <section class="card" id="lab-results" hidden></section>
      </div>`;

    const $ = (q) => el.querySelector(q);
    const keep = () => {
      set.text = $('#lab-text').value;
      set.notes = $('#lab-notes').value;
      data.method = $('#lab-method').value;
      save(data);
    };
    $('#lab-text').oninput = keep;
    $('#lab-notes').oninput = keep;
    $('#lab-method').onchange = keep;
    $('#lab-set').onchange = (e) => {
      keep();
      data.current = e.target.value;
      save(data);
      lab(el);
    };
    $('#lab-new').onclick = () => {
      keep();
      const fresh = { id: newId(), name: `Data set ${data.sets.length + 1}`, text: '', notes: NOTES_TEMPLATE };
      data.sets.push(fresh);
      data.current = fresh.id;
      save(data);
      lab(el);
    };
    $('#lab-rename').onclick = () => {
      set.name = $('#lab-name').value.trim().slice(0, 80) || set.name;
      keep();
      lab(el);
    };
    $('#lab-delete').onclick = (e) => {
      // A second click confirms.
      if (!e.target.dataset.sure) {
        e.target.dataset.sure = '1';
        e.target.textContent = 'Click again to delete';
        return;
      }
      data.sets = data.sets.filter((x) => x.id !== set.id);
      data.current = (data.sets[0] || {}).id;
      if (data.sets.length) save(data);
      else store.set('lab', null);
      lab(el);
    };
    $('#lab-export').onclick = () => {
      keep();
      download('hindi-lab.json', new Blob([JSON.stringify({ app: 'hinditree-lab', version: 1, sets: data.sets }, null, 2)], { type: 'application/json' }));
    };
    $('#lab-import').onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        const incoming = JSON.parse(await file.text());
        if (!Array.isArray(incoming.sets)) throw new Error('This file is not a Hindi Lab export.');
        const sets = incoming.sets.slice(0, 200).map((x) => ({
          id: newId(), name: String(x.name || 'Imported').slice(0, 80),
          text: String(x.text || '').slice(0, 50000), notes: String(x.notes || '').slice(0, 50000),
        }));
        data.sets.push(...sets);
        data.current = sets[0] ? sets[0].id : data.current;
        save(data);
        lab(el);
        toast(`Imported ${sets.length} data sets.`);
      } catch (error) {
        toast(`Import failed: ${error.message}`);
      }
    };
    $('#lab-run').onclick = () => {
      keep();
      run(el, set.text, data.method);
    };
    return undefined;
  }

  function run(el, text, method) {
    const results = el.querySelector('#lab-results');
    const rows = lines(text);
    const count = { ok: 0, over: 0, under: 0, scored: 0 };
    const html = rows.map((r, i) => {
      if (r.heading) return `<tr class="group"><td colspan="5">${esc(r.heading)}</td></tr>`;
      const p = HT.studio.predict(r.sentence, method);
      const accepted = p.trees > 0 && !p.flags.length;
      let verdict;
      if (r.judgement === '?') verdict = ['note', 'doubtful: not scored'];
      else if (r.judgement === '✓') verdict = accepted ? ['ok', 'matches'] : ['under', 'rejects a good sentence'];
      else verdict = accepted ? ['over', 'accepts a bad sentence'] : ['ok', 'matches'];
      if (r.judgement !== '?') {
        count.scored++;
        count[verdict[0]]++;
      }
      const prediction = p.trees ? `${p.trees} tree${p.trees > 1 ? 's' : ''}${p.flags.length ? ', flagged' : ''}` : 'no tree';
      return `<tr><td>${esc(r.judgement)}</td><td class="hi">${esc(r.sentence)}${r.comment ? `<br><span class="hint">${esc(r.comment)}</span>` : ''}</td>
        <td>${esc(prediction)}${p.flags.length ? `<br><span class="hint">${esc(p.flags[0])}</span>` : ''}</td>
        <td><span class="verdict ${verdict[0]}">${esc(verdict[1])}</span></td>
        <td><button class="btn small" data-open="${i}">Open</button></td></tr>`;
    }).join('');
    const name = (METHODS.find(([id]) => id === method) || ['', method])[1];
    results.hidden = false;
    results.innerHTML = rows.length ? `<h2>Results with ${esc(name)}</h2>
      <div class="summary"><span class="pill">${count.ok} of ${count.scored} judgements match</span>
        <span class="pill">${count.over} overgenerated</span><span class="pill">${count.under} undergenerated</span></div>
      <div class="table-scroll"><table class="results"><tr><th>Judgement</th><th>Sentence</th><th>Analysis</th><th>Result</th><th></th></tr>${html}</table></div>
      <p class="hint">“Accepts” means the method gives a tree and raises no warning. Agreement in gender, number and person is not checked yet.</p>`
      : '<p class="hint">Add some sentences first.</p>';
    results.querySelectorAll('[data-open]').forEach((b) => {
      b.onclick = () => {
        HT.studio.loadSentence(rows[Number(b.dataset.open)].sentence, method);
        location.hash = '#studio';
      };
    });
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  HT.lab = lab;
  HT.labLines = lines;
})(globalThis.HT = globalThis.HT || {});
