/* Hash router: works on GitHub Pages and when index.html is opened from disk. */
(function (HT) {
  'use strict';
  const { toast, store, decode } = HT.util;

  const pages = ['course', 'practice', 'rules', 'abbreviations', 'adaptation', 'about', 'lab'];
  const main = document.getElementById('main');

  function route() {
    const [, name = '', param = ''] = location.hash.match(/^#([^/]*)\/?(.*)$/) || [];
    try {
      if (name === 'example' || name === 'exercise') {
        const example = HT.lessons.all.find((e) => e.id === param);
        if (example && name === 'example') HT.studio.loadExample(example);
        else if (example) HT.studio.loadExercise(example);
      } else if (name === 't') {
        HT.studio.loadSaved(decode(param));
      }
    } catch (error) {
      console.error(error);
      toast('This link does not contain a readable tree.');
    }

    const page = pages.includes(name) ? name : 'studio';
    const view = document.createElement('div');
    view.className = `page page-${page}`;
    main.replaceChildren(view);
    if (page === 'studio') HT.studio.mount(view);
    else if (page === 'lab') HT.lab(view);
    else HT.pages[page](view, param);

    document.querySelectorAll('.nav a').forEach((a) => {
      if (a.dataset.page === page) {
        a.setAttribute('aria-current', 'page');
        document.getElementById('page-label').textContent = a.textContent.replace(/\s*🔒$/, '');
      } else a.removeAttribute('aria-current');
    });
    if (small.matches) setMenu(false);
    window.scrollTo(0, 0);
  }

  // The logo reloads the app from the start.
  document.querySelectorAll('[data-reload]').forEach((a) => a.addEventListener('click', (event) => {
    event.preventDefault();
    history.replaceState(null, '', location.pathname + location.search);
    location.reload();
  }));

  /*
   * The menu: on wide screens it can be hidden (remembered); on small
   * screens it slides in over the page and closes after a choice.
   */
  const small = window.matchMedia('(max-width: 820px)');
  const button = document.getElementById('menu');
  const scrim = document.getElementById('scrim');
  function setMenu(open) {
    const cls = small.matches ? 'menu-open' : 'menu-closed';
    document.body.classList.toggle(cls, small.matches ? open : !open);
    if (!small.matches) store.set('menuClosed', !open);
    scrim.hidden = !(small.matches && open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Hide menu' : 'Show menu');
    button.title = open ? 'Hide menu' : 'Show menu';
  }
  const isOpen = () => (small.matches ? document.body.classList.contains('menu-open') : !document.body.classList.contains('menu-closed'));
  button.addEventListener('click', () => setMenu(!isOpen()));
  scrim.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && small.matches && isOpen()) setMenu(false); });
  small.addEventListener('change', () => {
    document.body.classList.remove('menu-open');
    document.body.classList.toggle('menu-closed', !small.matches && store.get('menuClosed', false));
    setMenu(!small.matches && !store.get('menuClosed', false));
  });
  if (small.matches) setMenu(false);
  else setMenu(!store.get('menuClosed', false));

  /*
   * How to cite?: citations in the common styles, each with a copy button.
   * DOI is Zenodo's concept DOI, which always resolves to the latest release.
   */
  const CITE = { DOI: '10.5281/zenodo.24513674', year: '2026', url: 'https://iamalinguist.github.io/hinditree/',
    title: 'HindiTree: An open-access tool for Hindi syntax trees', titleCase: 'HindiTree: An Open-Access Tool for Hindi Syntax Trees' };
  function citations() {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const mla = `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}${d.getMonth() === 4 ? '' : '.'} ${d.getFullYear()}`;
    const doi = CITE.DOI ? `https://doi.org/${CITE.DOI}` : '';
    return [
      ['APA', `Tripathi, V. (${CITE.year}). ${CITE.title} [Web application]. ${doi || CITE.url}`],
      ['MLA', `Tripathi, Vivek. ${CITE.titleCase}. ${CITE.year}, ${(doi || CITE.url).replace(/^https:\/\//, '')}. Accessed ${mla}.`],
      ['Chicago', `Tripathi, Vivek. ${CITE.year}. ${CITE.titleCase}. Web application. ${doi || CITE.url}.`],
      ['BibTeX', `@software{tripathi${CITE.year}hinditree,
  author  = {Tripathi, Vivek},
  title   = {{HindiTree}: An open-access tool for {Hindi} syntax trees},
  year    = {${CITE.year}},
  url     = {${CITE.url}},${CITE.DOI ? `
  doi     = {${CITE.DOI}},` : ''}
  note    = {Web application. Accessed ${iso}}
}`],
    ];
  }
  document.getElementById('cite-open').addEventListener('click', (event) => {
    event.preventDefault();
    const { esc } = HT.util;
    const list = citations();
    const dialog = document.getElementById('dialog');
    dialog.innerHTML = `<h2>How to cite HindiTree</h2>
      <div class="cite-list">${list.map(([style, text], i) => `<section class="cite-item"><div class="row between"><b>${style}</b>
        <button class="btn small" data-cite="${i}">Copy</button></div><pre class="cite-text">${esc(text)}</pre></section>`).join('')}</div>
      <p class="hint">If you use Method 2 (Toy Fragment), please also cite the paper by Tripathi and Rathod.</p>
      <div class="row end"><button class="btn" data-close>Close</button></div>`;
    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-cite]').forEach((b) => {
      b.onclick = async () => {
        const [style, text] = list[Number(b.dataset.cite)];
        try {
          await navigator.clipboard.writeText(text);
          toast(`${style} citation copied.`);
        } catch {
          const range = document.createRange();
          range.selectNodeContents(b.closest('.cite-item').querySelector('pre'));
          getSelection().removeAllRanges();
          getSelection().addRange(range);
          toast('Select the text and copy it.');
        }
      };
    });
    if (small.matches) setMenu(false);
    dialog.showModal();
  });

  HT.studio.init();
  window.addEventListener('hashchange', route);
  route();
})(globalThis.HT = globalThis.HT || {});
