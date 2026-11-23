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
      if (a.dataset.page === page) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.body.classList.remove('menu-open');
    document.getElementById('menu').setAttribute('aria-expanded', 'false');
    window.scrollTo(0, 0);
  }

  // The logo reloads the app from the start.
  document.querySelectorAll('[data-reload]').forEach((a) => a.addEventListener('click', (event) => {
    event.preventDefault();
    history.replaceState(null, '', location.pathname + location.search);
    location.reload();
  }));

  document.getElementById('menu').addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', String(document.body.classList.toggle('menu-open')));
  });

  HT.studio.init();
  window.addEventListener('hashchange', route);
  route();
})(globalThis.HT = globalThis.HT || {});
