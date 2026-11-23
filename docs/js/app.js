/* Hash router: works on GitHub Pages and when index.html is opened from disk. */
(function (HT) {
  'use strict';
  const { toast, store, decode } = HT.util;

  const pages = ['course', 'practice', 'rules', 'abbreviations', 'adaptation', 'mine', 'about'];
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
      } else if (name === 'saved') {
        const item = store.get('examples', []).find((e) => e.id === param);
        if (item) HT.studio.loadSaved(item);
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
    else HT.pages[page](view, param);

    document.querySelectorAll('.nav a').forEach((a) => {
      if (a.dataset.page === page) {
        a.setAttribute('aria-current', 'page');
        document.getElementById('page-label').textContent = a.textContent;
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

  HT.studio.init();
  window.addEventListener('hashchange', route);
  route();
})(globalThis.HT = globalThis.HT || {});
