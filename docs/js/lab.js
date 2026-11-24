/*
 * Hindi Lab: a space for building arguments about Hindi.
 *
 * Tabs:
 *   Workbench     data sets of sentences with judgements, tested against a
 *                 method (over- and undergeneration), and a notebook
 *   Corpus        a collection of sentences to draw data sets from
 *   Judgements, Constituency tests, Building an argument
 *                 short lessons on linguistic method, with Hindi examples
 *                 that can be added to the current data set
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

  const TABS = [['workbench', 'Workbench'], ['flow', 'Flow'], ['words', 'Word categories'], ['corpus', 'Corpus'], ['judgements', 'Judgements'],
    ['tests', 'Constituency tests'], ['argument', 'Building an argument']];

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const password = () => `hinditree${String(new Date().getDate()).padStart(2, '0')}`;
  const unlocked = () => store.get('labUnlocked', '') === today();

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function load() {
    let data = store.get('lab', null);
    if (!data || !Array.isArray(data.sets) || !data.sets.length) {
      const set = { id: newId(), ...STARTER };
      data = { sets: [set], current: set.id, method: 'thomas', ...(data && Array.isArray(data.corpus) ? { corpus: data.corpus } : {}) };
    }
    if (!Array.isArray(data.corpus)) data.corpus = [];
    if (!TABS.some(([id]) => id === data.tab)) data.tab = 'workbench';
    return data;
  }
  const save = (data) => store.set('lab', data) || toast('The browser could not save. Export the Lab to keep your work.');
  const currentSet = (data) => data.sets.find((x) => x.id === data.current) || data.sets[0];

  /*
   * One sentence per line, with an optional judgement mark:
   *   *  unacceptable      ?  odd      ??  very odd
   *   #  odd meaning (written straight before the sentence: #पत्थर ने …)
   *   %  speakers differ   // starts a comment
   * A line starting with "# " (hash and space) is a heading.
   */
  function lines(text) {
    return text.split('\n').map((raw) => {
      const line = raw.trim();
      if (!line) return null;
      if (/^#(\s|#)/.test(line) || line === '#') return { heading: line.replace(/^#+\s*/, '') };
      const [body, comment = ''] = line.split('//');
      let judgement = '✓';
      let sentence = body.trim();
      const m = sentence.match(/^(\*|\?\?|\?|#|%|✓|✔|OK)\s*/i);
      if (m) {
        judgement = /^(✓|✔|ok)$/i.test(m[1]) ? '✓' : m[1];
        sentence = sentence.slice(m[0].length);
      }
      return sentence ? { judgement, sentence, comment: comment.trim() } : null;
    }).filter(Boolean);
  }

  /** Adds lines to the current data set. */
  function addToSet(data, heading, text) {
    const set = currentSet(data);
    set.text = `${set.text.trimEnd()}${set.text.trim() ? '\n' : ''}${heading ? `# ${heading}\n` : ''}${text.trim()}`;
    save(data);
    toast(`Added to the data set “${set.name}”. Open Workbench to run it.`);
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
    const refresh = () => lab(el);
    el.innerHTML = `<div class="lab">
      <nav class="lab-tabs" role="tablist" aria-label="Hindi Lab">${TABS.map(([id, name]) =>
        `<button role="tab" data-tab="${id}" aria-selected="${id === data.tab}" class="${id === data.tab ? 'on' : ''}">${esc(name)}</button>`).join('')}</nav>
      <div id="lab-panel" role="tabpanel"></div></div>`;
    el.querySelectorAll('[data-tab]').forEach((b) => {
      b.onclick = () => {
        data.tab = b.dataset.tab;
        save(data);
        refresh();
      };
    });
    const panel = el.querySelector('#lab-panel');
    if (data.tab === 'workbench') workbench(panel, data, refresh);
    else if (data.tab === 'corpus') corpus(panel, data, refresh);
    else if (data.tab === 'flow') flow(panel, data, refresh);
    else if (data.tab === 'words') HT.wordclass.render(panel);
    else lesson(panel, data, LESSONS[data.tab]);
    return undefined;
  }

  // Workbench
  function workbench(el, data, refresh) {
    const set = currentSet(data);
    data.current = set.id;
    if (!METHODS.some(([id]) => id === data.method)) data.method = 'thomas';

    el.innerHTML = `
        <header class="page-head"><p>Collect judgements, test an analysis against them, and keep notes. Everything stays in this browser; export it to keep a copy.</p></header>
        <section class="card">
          <div class="lab-toolbar">
            <div class="row"><label class="inline">Data set <select id="lab-set">${data.sets.map((x) =>
              `<option value="${esc(x.id)}" ${x.id === set.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
              <button class="btn small" id="lab-new">New</button></div>
            <div class="row"><input id="lab-name" value="${esc(set.name)}" aria-label="Name of this data set" maxlength="80">
              <button class="btn small" id="lab-rename">Rename</button><button class="btn small danger" id="lab-delete">Delete</button></div>
            <div class="row"><button class="btn small" id="lab-export">Export Lab</button>
              <label class="btn small file">Import<input id="lab-import" type="file" accept=".json,application/json"></label></div>
          </div>
        </section>
        <div class="lab-grid">
          <section class="card">
            <h2>Sentences and judgements</h2>
            <p class="hint">One sentence per line. Marks: <b>*</b> unacceptable, <b>?</b> odd, <b>??</b> very odd, <b>#</b> odd meaning (no space: #पत्थर…), <b>%</b> speakers differ.
              A line starting with <b>#&nbsp;</b> (hash and space) is a heading, and <b>//</b> starts a comment. See the Judgements tab.</p>
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
        <section class="card" id="lab-results" hidden></section>`;

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
      refresh();
    };
    $('#lab-new').onclick = () => {
      keep();
      const fresh = { id: newId(), name: `Data set ${data.sets.length + 1}`, text: '', notes: NOTES_TEMPLATE };
      data.sets.push(fresh);
      data.current = fresh.id;
      save(data);
      refresh();
    };
    $('#lab-rename').onclick = () => {
      set.name = $('#lab-name').value.trim().slice(0, 80) || set.name;
      keep();
      refresh();
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
      else store.set('lab', { corpus: data.corpus });
      refresh();
    };
    $('#lab-export').onclick = () => {
      keep();
      download('hindi-lab.json', new Blob([JSON.stringify({ app: 'hinditree-lab', version: 2, sets: data.sets, corpus: data.corpus }, null, 2)], { type: 'application/json' }));
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
        const items = Array.isArray(incoming.corpus) ? incoming.corpus.slice(0, 5000).map((x) => ({
          id: newId(), text: String(x.text || '').slice(0, 600), source: String(x.source || '').slice(0, 120),
        })).filter((x) => x.text) : [];
        data.sets.push(...sets);
        data.corpus.push(...items);
        data.current = sets[0] ? sets[0].id : data.current;
        save(data);
        refresh();
        toast(`Imported ${sets.length} data sets and ${items.length} corpus sentences.`);
      } catch (error) {
        toast(`Import failed: ${error.message}`);
      }
    };
    $('#lab-run').onclick = () => {
      keep();
      run(el, set.text, data.method);
    };
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
      if (['?', '??', '%'].includes(r.judgement)) verdict = ['note', r.judgement === '%' ? 'speakers differ: not scored' : 'doubtful: not scored'];
      else if (r.judgement === '*') verdict = accepted ? ['over', 'accepts a bad sentence'] : ['ok', 'matches'];
      // ✓ and # (odd meaning but well formed) should both be accepted by a grammar.
      else verdict = accepted ? ['ok', 'matches'] : ['under', 'rejects a good sentence'];
      if (verdict[0] !== 'note') {
        count.scored++;
        count[verdict[0]]++;
      }
      const prediction = p.trees ? `${p.trees} tree${p.trees > 1 ? 's' : ''}${p.flags.length ? ', flagged' : ''}` : 'no tree';
      return `<tr><td class="mark">${esc(r.judgement)}</td><td class="hi">${esc(r.sentence)}${r.comment ? `<br><span class="hint">${esc(r.comment)}</span>` : ''}</td>
        <td data-label="Analysis">${esc(prediction)}${p.flags.length ? `<details class="flag"><summary>Why flagged</summary>${esc(p.flags[0])}</details>` : ''}</td>
        <td data-label="Result"><span class="verdict ${verdict[0]}">${esc(verdict[1])}</span></td>
        <td class="open"><button class="btn small" data-open="${i}">Open</button></td></tr>`;
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

  // Flow: every sentence of the data set as kāraka arcs, stacked for comparison
  function flow(el, data, refresh) {
    const set = currentSet(data);
    const rows = lines(set.text);
    let previous = null;
    const patterns = new Map();
    const markers = new Map();
    const items = rows.map((r, i) => {
      if (r.heading) {
        previous = null;
        return `<h3 class="flow-heading">${esc(r.heading)}</h3>`;
      }
      const a = HT.karaka.analyse(HT.studio.treeFor(r.sentence));
      if (!a) {
        previous = null;
        return `<div class="flow-row"><span class="flow-mark">${esc(r.judgement)}</span><div><p lang="hi" class="flow-missing">${esc(r.sentence)}</p>
          <p class="hint">No Method 1 analysis. Open it in Make Structure to draw it by hand.</p></div>
          <button class="btn small" data-open="${i}">Open</button></div>`;
      }
      const texts = new Set(a.chunks.map((c) => c.text));
      const changed = previous ? new Set([...texts].filter((t) => !previous.has(t))) : null;
      previous = texts;
      const p = HT.karaka.pattern(a);
      if (r.judgement !== '*') patterns.set(p, (patterns.get(p) || 0) + 1);
      a.words.forEach((w) => { if (/^(ने|को|से|में|पर|का|के|की)$/.test(w.w)) markers.set(w.w, (markers.get(w.w) || 0) + 1); });
      const { svg } = HT.karaka.draw(a, { gloss: !!data.flowGloss, changed });
      return `<div class="flow-row ${r.judgement === '*' ? 'starred' : ''}"><span class="flow-mark">${esc(r.judgement)}</span>
        <div class="flow-body"><div class="flow-svg">${svg}</div><p class="flow-pattern">${esc(p)}${r.comment ? ` <span class="hint">// ${esc(r.comment)}</span>` : ''}</p></div>
        <button class="btn small" data-open="${i}">Open</button></div>`;
    });
    const count = (map) => [...map.entries()].sort((x, y) => y[1] - x[1]);
    el.innerHTML = `
      <header class="page-head"><p>Each sentence of the data set <b>${esc(set.name)}</b> drawn as kāraka relations, in order, so you can compare them.
        Gold outlines show chunks that changed from the sentence above. A dashed arc with “?” is a guess you may want to change.</p></header>
      <section class="card">
        <div class="row between"><h2>Patterns</h2><label class="inline"><input type="checkbox" id="flow-gloss" ${data.flowGloss ? 'checked' : ''}> Glosses</label></div>
        ${patterns.size ? `<div class="lab-grid"><table class="ff"><tr><th>Order of relations (acceptable sentences)</th><th>Sentences</th></tr>${count(patterns).map(([p, n]) =>
          `<tr><td>${esc(p)}</td><td>${n}</td></tr>`).join('')}</table>
          <table class="ff"><tr><th>Marker</th><th>Times used</th></tr>${count(markers).map(([m, n]) => `<tr><td lang="hi">${esc(m)}</td><td>${n}</td></tr>`).join('')}</table></div>`
          : '<p class="hint">Add sentences on the Workbench to see their patterns.</p>'}
        <p class="hint">Labels: k1 kartā, k2 karma, k3 karaṇa, k4 sampradāna, k4a experiencer, k5 apādāna, k7p place, k7t time, k1s/k2s complements, r6 genitive, rt purpose. See Abbreviations for all of them.</p>
      </section>
      <section class="card flow-list">${items.join('') || '<p class="hint">This data set is empty.</p>'}</section>`;
    el.querySelector('#flow-gloss').onchange = (e) => {
      data.flowGloss = e.target.checked;
      save(data);
      refresh();
    };
    el.querySelectorAll('[data-open]').forEach((b) => {
      b.onclick = () => {
        HT.studio.loadSentence(rows[Number(b.dataset.open)].sentence, 'thomas');
        HT.studio.state.view = 'karaka';
        location.hash = '#studio';
      };
    });
  }

  // Corpus
  function corpus(el, data, refresh) {
    const set = currentSet(data);
    const filter = (data.corpusFilter || '').trim();
    const shown = data.corpus.filter((x) => !filter || x.text.includes(filter) || x.source.toLowerCase().includes(filter.toLowerCase()));
    el.innerHTML = `
      <header class="page-head"><p>Collect sentences here first: from conversations, books, newspapers, the course or your own intuitions. Then choose some, give them a judgement and add them to a data set to test.</p></header>
      <div class="lab-grid">
        <section class="card">
          <h2>Add sentences</h2>
          <textarea id="corpus-text" rows="8" lang="hi" placeholder="One sentence per line, or separated by ।"></textarea>
          <div class="row"><input id="corpus-source" placeholder="Source (e.g. a newspaper, a speaker, a book)" aria-label="Source" maxlength="120">
            <button class="btn primary" id="corpus-add">Add to corpus</button></div>
          <p class="hint">Or start from the <button class="btn small" id="corpus-course">83 course sentences</button></p>
        </section>
        <section class="card">
          <h2>Use selected sentences</h2>
          <p>Add the ticked sentences to the data set <b>${esc(set.name)}</b> with the judgement:</p>
          <div class="row"><select id="corpus-mark" aria-label="Judgement">
              <option value="">✓ acceptable</option><option value="* ">* unacceptable</option><option value="? ">? odd</option>
              <option value="?? ">?? very odd</option><option value="#"># odd meaning</option><option value="% ">% speakers differ</option></select>
            <button class="btn primary" id="corpus-use">Add to data set</button></div>
          <p class="hint">Change the data set on the Workbench tab. Judgements can be edited there line by line.</p>
          <div class="row"><button class="btn small danger" id="corpus-delete">Delete ticked</button></div>
        </section>
      </div>
      <section class="card">
        <div class="row between"><h2>${data.corpus.length} sentences</h2>
          <div class="row"><input id="corpus-filter" value="${esc(filter)}" placeholder="Search words or sources" aria-label="Search">
            <label class="inline"><input type="checkbox" id="corpus-all"> Tick all shown</label></div></div>
        ${shown.length ? `<table class="results corpus-list">${shown.map((x) => `<tr>
            <td><input type="checkbox" data-id="${esc(x.id)}" aria-label="Select sentence"></td>
            <td class="hi">${esc(x.text)}</td><td class="hint">${esc(x.source)}</td>
            <td><button class="btn small" data-open="${esc(x.id)}">Open</button></td></tr>`).join('')}</table>`
          : `<p class="hint">${data.corpus.length ? 'No sentence matches the search.' : 'The corpus is empty.'}</p>`}
      </section>`;

    const $ = (q) => el.querySelector(q);
    const ticked = () => [...el.querySelectorAll('[data-id]:checked')].map((b) => b.dataset.id);
    const add = (texts, source) => {
      const known = new Set(data.corpus.map((x) => x.text));
      const fresh = texts.map((t) => t.trim()).filter((t) => t && !known.has(t)).map((text) => ({ id: newId(), text: text.slice(0, 600), source }));
      data.corpus.push(...fresh);
      save(data);
      refresh();
      toast(fresh.length ? `Added ${fresh.length} sentences to the corpus.` : 'These sentences are already in the corpus.');
    };
    $('#corpus-add').onclick = () => add($('#corpus-text').value.split(/\n|।|॥/), $('#corpus-source').value.trim().slice(0, 120));
    $('#corpus-course').onclick = () => add(HT.lessons.all.map((e) => e.sentence), 'Course');
    $('#corpus-filter').onchange = (e) => {
      data.corpusFilter = e.target.value;
      save(data);
      refresh();
    };
    $('#corpus-all').onchange = (e) => el.querySelectorAll('[data-id]').forEach((b) => { b.checked = e.target.checked; });
    $('#corpus-use').onclick = () => {
      const ids = new Set(ticked());
      if (!ids.size) return toast('Tick some sentences first.');
      const mark = $('#corpus-mark').value;
      addToSet(data, '', data.corpus.filter((x) => ids.has(x.id)).map((x) => mark + x.text).join('\n'));
      return undefined;
    };
    $('#corpus-delete').onclick = (e) => {
      const ids = new Set(ticked());
      if (!ids.size) return toast('Tick some sentences first.');
      if (!e.target.dataset.sure) {
        e.target.dataset.sure = '1';
        e.target.textContent = `Click again to delete ${ids.size}`;
        return undefined;
      }
      data.corpus = data.corpus.filter((x) => !ids.has(x.id));
      save(data);
      refresh();
      return undefined;
    };
    el.querySelectorAll('[data-open]').forEach((b) => {
      b.onclick = () => {
        HT.studio.loadSentence(data.corpus.find((x) => x.id === b.dataset.open).text, data.method || 'thomas');
        location.hash = '#studio';
      };
    });
  }

  // Lessons on method. Judgements given here are starting points: check them with speakers.
  const LESSONS = {
    judgements: {
      intro: 'A judgement is the evidence behind every claim about a language. This page explains what judgements are, how linguists mark them, and how to collect them so that an argument rests on solid data.',
      sections: [
        { title: 'Acceptability and grammaticality', paras: [
          'A judgement is a speaker’s report that a sentence sounds natural or not. What speakers report is acceptability. Grammaticality is what an analysis predicts: whether the grammar generates the sentence.',
          'An argument succeeds when the two line up. If your grammar generates a sentence that speakers reject, it overgenerates. If it fails to generate one they accept, it undergenerates. The Workbench reports exactly these two outcomes.',
        ] },
        { title: 'Marks linguists use', table: [
          ['no mark or ✓', 'acceptable', 'राम ने रोटी खाई'],
          ['*', 'unacceptable', '*राम ने रोटी खाता है'],
          ['?', 'somewhat odd', '?रोटी राम ने खाई'],
          ['??', 'very odd, close to unacceptable', ''],
          ['#', 'well formed, but odd in meaning or context', '#पत्थर ने रोटी खाई'],
          ['%', 'speakers differ (region, register, age)', '%मैंने बोला कि मैं आऊँगा'],
        ], paras: [
          'In the Workbench, * means the grammar must reject the sentence. ✓ and # mean it must accept it, because a sentence with an odd meaning is still well formed. ?, ?? and % are shown but not scored.',
        ], add: { heading: 'Judgement marks', text: 'राम ने रोटी खाई\n* राम ने रोटी खाता है\n#पत्थर ने रोटी खाई\n? रोटी राम ने खाई\n% मैंने बोला कि मैं आऊँगा' } },
        { title: 'Minimal pairs', paras: [
          'Compare two sentences that differ in one thing only. Then the difference in judgement can only come from that one thing.',
          'राम ने रोटी खाई and *राम ने रोटी खाता है differ only in aspect (perfective against habitual). The pair is evidence that ने depends on aspect, not on tense or on the verb.',
        ], add: { heading: 'Minimal pair: ने and aspect', text: 'राम ने रोटी खाई\n* राम ने रोटी खाता है\nराम रोटी खाता है\n* राम रोटी खाई' } },
        { title: 'Collecting judgements well', list: [
          'Ask several speakers, not only yourself.',
          'Give a short context, so a sentence is not rejected only because it is hard to imagine.',
          'Mix the sentences you care about with fillers, and vary their order.',
          'Use a scale (for example 1 to 7) or a forced choice between two sentences, rather than only yes or no.',
          'Note who each speaker is: region, other languages, age. Hindi and Urdu vary by region and register, so variation is data, not noise.',
          'Do not tell speakers what you expect.',
        ] },
        { title: 'Traps', list: [
          'Processing: long or deeply nested sentences can sound bad without being ungrammatical.',
          'Meaning: a sentence about an impossible event is odd (#), not ungrammatical (*).',
          'School grammar: what is taught as correct is not always what speakers say.',
          'Theory: once you have a hypothesis, your own intuitions start to follow it. Check them with others.',
        ] },
      ],
    },
    tests: {
      intro: 'A constituent is a group of words that behaves as a unit. Trees claim which groups are constituents, and these tests are the evidence. Every test has exceptions, so an argument uses several.',
      sections: [
        { title: 'Substitution', paras: [
          'If a pronoun or a pro-form (वह, यह, उसे, वहाँ, ऐसा) can replace a string, the string is a constituent.',
          '[वह छोटा लड़का] सो गया can become वह सो गया, so वह छोटा लड़का is an NP. A pronoun cannot replace छोटा लड़का without वह, so in Method 1 that part is only an N′.',
        ], add: { heading: 'Substitution', text: 'वह छोटा लड़का सो गया\nवह सो गया' } },
        { title: 'Fronting (scrambling)', paras: [
          'Hindi word order is free, but words move in groups. A string that can move to the front as a whole is a constituent. A string that has to be broken up to move is not.',
          'बगीचे में moves as a unit; में alone cannot.',
        ], add: { heading: 'Fronting', text: 'बच्चे बगीचे में खेलते हैं\nबगीचे में बच्चे खेलते हैं\n* में बच्चे बगीचे खेलते हैं' } },
        { title: 'Coordination', paras: [
          'Two strings joined by और are usually constituents of the same kind: NP और NP, VP और VP.',
          'राम [चाय] और [कॉफ़ी] पीता है coordinates two NPs. राम [गाता है] और [नाचता है] coordinates two verb groups, with the subject shared. Run it to see whether a method can handle that.',
        ], add: { heading: 'Coordination', text: 'राम चाय और कॉफ़ी पीता है\nराम गाता है और नाचता है' } },
        { title: 'Answers to questions', paras: [
          'A short answer to a question is normally a constituent. सीता ने क्या पढ़ा? — एक नई किताब. The answer एक नई किताब is the object NP. An answer like *नई किताब पढ़ा is not possible, because it is not a constituent.',
        ] },
        { title: 'Ellipsis with भी', paras: [
          'In राम फल खाता है, सीता भी, the word भी stands for a missing फल खाती है. What can be left out is a constituent: here the VP, which is the predicate.',
        ], add: { heading: 'Ellipsis', text: 'राम फल खाता है और सीता भी' } },
      ],
    },
    argument: {
      intro: 'Syntax is argued, not just drawn. An argument moves from data to a generalisation, then to an analysis that makes predictions, and then to the cases that test it. The Lab supports each step.',
      sections: [
        { title: 'The steps', list: [
          'Observe a pattern in the data: in the Corpus, in texts, or in conversation.',
          'State a generalisation precisely enough to be wrong. For example: “ने appears on the subject if and only if the verb is perfective and transitive.”',
          'Test it with minimal pairs, and look for counterexamples: लाना, बोलना, समझना.',
          'Propose an analysis: a rule, a structure, or a grammar in Method 3.',
          'Check its predictions: run a data set in the Workbench. Overgeneration means the analysis is too permissive, and undergeneration means it is too strict.',
          'Compare rivals: run the same data set with two methods or two versions of your grammar. Prefer the one that covers more data with fewer special cases, and that is supported by independent evidence.',
          'Write it up in the Notebook: claim, data, analysis, problems.',
        ] },
        { title: 'Worked example: को on objects', paras: [
          'Some direct objects take को and others do not. Two rival generalisations are “को marks animate objects” and “को marks specific objects”.',
          'राम ने किताब को पढ़ा has को on an inanimate object, possible when a particular book is meant. That is evidence against the animacy account. सीता ने बच्चे को देखा and राम ने किताब पढ़ी fit both. Collect more pairs before deciding. Animacy and specificity may both play a part.',
        ], add: { heading: 'को on direct objects', text: 'सीता ने बच्चे को देखा\n? सीता ने बच्चा देखा\nराम ने किताब पढ़ी\nराम ने किताब को पढ़ा   // a particular book' } },
        { title: 'What makes an argument strong', list: [
          'The data are reliable: several speakers, clear judgements, minimal pairs.',
          'The claim is precise enough that a single sentence could refute it.',
          'Counterexamples are discussed openly, not hidden.',
          'The analysis is compared with at least one alternative.',
        ] },
      ],
    },
  };

  function lesson(el, data, content) {
    el.innerHTML = `<header class="page-head"><p>${esc(content.intro)}</p></header>
      ${content.sections.map((sec, i) => `<section class="card lesson-card">
        <h2>${esc(sec.title)}</h2>
        ${(sec.table ? `<table class="ff marks"><tr><th>Mark</th><th>Meaning</th><th>Example</th></tr>${sec.table.map(([m, meaning, ex]) =>
          `<tr><td>${esc(m)}</td><td>${esc(meaning)}</td><td lang="hi">${esc(ex)}</td></tr>`).join('')}</table>` : '')}
        ${(sec.paras || []).map((p) => `<p>${esc(p)}</p>`).join('')}
        ${sec.list ? `<ul>${sec.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}
        ${sec.add ? `<pre class="mono example-lines" lang="hi">${esc(sec.add.text)}</pre>
          <button class="btn small" data-add="${i}">Add these to my data set</button>` : ''}
      </section>`).join('')}
      <p class="hint">The judgements here are starting points. Check them with speakers before relying on them.</p>`;
    el.querySelectorAll('[data-add]').forEach((b) => {
      b.onclick = () => {
        const { add } = content.sections[Number(b.dataset.add)];
        addToSet(data, add.heading, add.text);
      };
    });
  }

  HT.lab = lab;
  HT.labLines = lines;
})(globalThis.HT = globalThis.HT || {});
