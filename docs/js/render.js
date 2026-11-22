/*
 * Draws trees as SVG in the style of Thomas: words on one baseline, the verb
 * class under its node, triangles for unanalysed constituents, functions below.
 * Colours are attributes rather than CSS, so exported files look identical.
 */
(function (HT) {
  'use strict';
  const { esc, translit } = HT.util;
  const { isLeaf, leaves, text: textOf, functions } = HT.tree;

  const SERIF = "Georgia, 'Noto Serif Devanagari', 'Nirmala UI', 'Kohinoor Devanagari', serif";
  const SANS = "'Noto Sans Devanagari', 'Nirmala UI', 'Kohinoor Devanagari', 'Segoe UI', sans-serif";
  const INK = '#24213a';
  const MUTED = '#6b687c';
  const ROW = 66;
  const GAP = 22;
  const PAD = 28;

  let ruler = null;
  function measure(text, size, family, weight = 400) {
    if (typeof document === 'undefined') return [...text].length * size * 0.6;
    ruler = ruler || document.createElement('canvas').getContext('2d');
    ruler.font = `${weight} ${size}px ${family}`;
    return ruler.measureText(text).width;
  }

  function colour(label) {
    if (/^(S\d?|sub|coord)$/.test(label)) return '#4c1d95';
    if (/^(N|NP|N'|NOUN|PRO|Nm|Nf|N_m|N_f|NP_cm)$/.test(label)) return '#1553a1';
    if (/^(V|VP|Vgp|VERB|Vi|Vt|V_i|V_t|Verbi|Verb_i|Verbt|Verb_t)$/.test(label)) return '#a3243b';
    if (/^(AUX|Aux|TENSE|MOD|PERF|PROG|HAB|PASS|VEC|NEG|Neg|Am|Tm)$/.test(label)) return '#9a4a0b';
    if (/^(DET|POSS|CASE|CM)$/.test(label)) return '#0f6560';
    if (/^(AP|A|AdvP|Adv|deg|Adj)$/.test(label)) return '#2c6b2f';
    if (/^(PP|P|Prep)$/.test(label)) return '#86358a';
    return INK;
  }

  const DEFAULTS = {
    functions: true, gloss: false, translit: false, align: true, color: true, blank: false,
    step: Infinity, direction: 'down', selected: [], interactive: false, english: '',
  };

  function draw(root, options) {
    const o = { ...DEFAULTS, ...options };
    const lineWidth = (l) => Math.max(
      measure(l.w, 22, SANS) + 4,
      o.gloss && l.g ? measure(l.g, 13, SANS) : 0,
      o.translit && !l.abs ? measure(translit(l.w), 14, SERIF) : 0,
    );

    let deepest = 0;
    function box(node, depth, path) {
      const b = { node, depth, path, kids: [], height: 0 };
      if (isLeaf(node)) {
        b.terminal = node;
        b.labelWidth = lineWidth(node);
      } else {
        const label = o.blank ? '____' : node.l;
        b.labelWidth = Math.max(measure(label, 19, SERIF, 700) + 8, node.f ? measure(`[${node.f}]`, 13, SERIF) : 0);
        if (node.tri && node.c.length) {
          const all = leaves(node).filter((l) => !l.abs);
          const merged = { w: textOf(node), g: all.map((l) => l.g).filter(Boolean).join(' '), roof: true };
          b.kids = [{ node: merged, terminal: merged, depth: depth + 1, path: null, kids: [], height: 0, labelWidth: lineWidth(merged) + 30 }];
          deepest = Math.max(deepest, depth + 1);
        } else {
          b.kids = node.c.map((child, i) => box(child, depth + 1, [...path, i]));
        }
        b.height = b.kids.length ? 1 + Math.max(...b.kids.map((k) => k.height)) : 1;
      }
      deepest = Math.max(deepest, depth);
      return b;
    }
    const top = box(root, 0, []);

    function size(b) {
      b.kids.forEach(size);
      b.inner = b.kids.reduce((sum, k) => sum + k.width, 0) + GAP * Math.max(0, b.kids.length - 1);
      b.width = Math.max(b.labelWidth, b.inner);
    }
    size(top);

    const all = [];
    function place(b, left) {
      b.left = left;
      let x = left + (b.width - b.inner) / 2;
      for (const k of b.kids) {
        place(k, x);
        x += k.width + GAP;
      }
      const middle = b.kids.length ? (b.kids[0].x + b.kids[b.kids.length - 1].x) / 2 : left + b.width / 2;
      const half = b.labelWidth / 2;
      b.x = Math.min(left + b.width - half, Math.max(left + half, middle));
      b.y = PAD + 14 + (b.terminal && o.align ? deepest : b.depth) * ROW;
      all.push(b);
    }
    place(top, PAD);

    const visible = (b) => !!b.terminal || (o.direction === 'down' ? b.depth < o.step : b.height <= o.step);
    const extraLines = (o.translit ? 20 : 0) + (o.gloss ? 18 : 0);
    const wordBottom = Math.max(...all.map((b) => b.y)) + 18 + extraLines;
    let width = top.width + PAD * 2;
    let height = wordBottom + 18;
    const parts = [];

    for (const path of o.selected) {
      const b = all.find((x) => x.path && x.path.join('-') === path.join('-'));
      if (!b) continue;
      let bottom = b.y + 20;
      (function down(k) {
        bottom = Math.max(bottom, k.y + (k.terminal ? 18 + extraLines : 20));
        k.kids.forEach(down);
      })(b);
      parts.push(`<rect data-selection x="${b.left - 6}" y="${b.y - 20}" width="${b.width + 12}" height="${bottom - b.y + 24}" rx="10" fill="#f4b942" fill-opacity=".18" stroke="#d99a16" stroke-dasharray="5 4"/>`);
    }

    const line = (x1, y1, x2, y2) => parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#55516b" stroke-width="1.4"/>`);
    for (const b of all) {
      if (!visible(b)) continue;
      const from = b.y + (b.node.f ? 28 : 13);
      for (const k of b.kids) {
        if (!visible(k)) continue;
        if (k.terminal) {
          // When building downwards, a word is joined up once its category is shown.
          const to = k.y - 18;
          if (k.terminal.roof) {
            parts.push(`<path d="M${b.x} ${from} L${k.left + 4} ${to} L${k.left + k.width - 4} ${to} Z" fill="none" stroke="#55516b" stroke-width="1.4"/>`);
          } else line(b.x, from, k.x, to);
        } else line(b.x, from, k.x, k.y - 14);
      }
    }

    const label = (x, y, value, attrs) => `<text x="${x}" y="${y}" text-anchor="middle" ${attrs}>${esc(value)}</text>`;
    for (const b of all) {
      if (b.terminal) {
        const t = b.terminal;
        parts.push(t.abs
          ? label(b.x, b.y + 6, t.w, `font-family="${SERIF}" font-size="17" font-style="italic" fill="${MUTED}"`)
          : label(b.x, b.y + 7, t.w, `font-family="${SANS}" font-size="22" fill="#111"`));
        let y = b.y + 28;
        if (o.translit) {
          if (!t.abs) parts.push(label(b.x, y, translit(t.w), `font-family="${SERIF}" font-size="14" font-style="italic" fill="${MUTED}"`));
          y += 19;
        }
        if (o.gloss && t.g) parts.push(label(b.x, y, t.g, `font-family="${SANS}" font-size="13" fill="${MUTED}"`));
        continue;
      }
      if (!visible(b)) continue;
      const n = b.node;
      const hit = o.interactive
        ? ` data-path="${b.path.join('-')}" tabindex="0" role="button" aria-label="${esc(`${n.l}: ${textOf(n)}`)}"` : '';
      let shown = o.blank ? '____' : esc(n.l);
      if (!o.blank && /^S\d$/.test(n.l)) shown = `S<tspan dy="5" font-size="13">${esc(n.l.slice(1))}</tspan>`;
      if (!o.blank && n.l === "N'") shown = 'N′';
      parts.push(`<g${hit}><rect x="${b.x - b.labelWidth / 2 - 3}" y="${b.y - 15}" width="${b.labelWidth + 6}" height="${n.f ? 44 : 29}" rx="6" fill="transparent"/>` +
        `<text x="${b.x}" y="${b.y + 6}" text-anchor="middle" font-family="${SERIF}" font-size="19" font-weight="700" fill="${o.color ? colour(n.l) : INK}">${shown}</text>` +
        (n.f && !o.blank ? label(b.x, b.y + 23, `[${n.f}]`, `font-family="${SERIF}" font-size="13" fill="${MUTED}"`) : '') + '</g>');
    }

    // Function row: shown once the tree is completely built.
    const complete = o.step >= (o.direction === 'down' ? steps(root) : top.height);
    if (o.functions && !o.blank && complete) {
      const units = functions(root);
      for (const u of units) {
        const b = all.find((x) => x.node === u.node);
        if (!b) continue;
        const y = wordBottom + 6;
        parts.push(`<path d="M${b.left + 2} ${y} v7 H${b.left + b.width - 2} v-7" fill="none" stroke="#99701a" stroke-width="1.3"/>`);
        parts.push(label(b.left + b.width / 2, y + 28, u.fn, `font-family="${SERIF}" font-size="19" font-style="italic" fill="#7a5408"`));
      }
      if (units.length) height = wordBottom + 52;
    }

    if (o.english) {
      const quote = `‘${o.english}’`;
      width = Math.max(width, measure(quote, 15, SERIF) + PAD * 2);
      parts.push(`<text x="${PAD}" y="${height + 12}" font-family="${SERIF}" font-size="15" fill="${MUTED}">${esc(quote)}</text>`);
      height += 30;
    }

    width = Math.ceil(width);
    height = Math.ceil(height);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="${o.interactive ? 'group' : 'img'}" aria-label="${esc(`Syntax tree: ${textOf(root)}`)}">${parts.join('')}</svg>`;
    return { svg, width, height };
  }

  /** Number of steps needed to reveal the tree completely. */
  function steps(root) {
    if (isLeaf(root)) return 0;
    return 1 + (root.tri || !root.c.length ? 0 : Math.max(...root.c.map(steps)));
  }

  function raster({ svg, width, height }, type) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        // Four times screen size, within the canvas limits of common browsers.
        const scale = Math.min(4, 12000 / Math.max(width, height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The image could not be created.'))), type, 0.95);
      };
      image.onerror = () => reject(new Error('The tree could not be converted to an image.'));
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
  }

  HT.render = { draw, steps, raster };
})(globalThis.HT = globalThis.HT || {});
