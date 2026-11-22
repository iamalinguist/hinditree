/* Small helpers shared by the interface. */
(function (HT) {
  'use strict';

  const ENTITY = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (c) => ENTITY[c]);

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(`hinditree:${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`hinditree:${key}`, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
  };

  let toastTimer;
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  function download(name, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function showText(title, text) {
    const dialog = document.getElementById('dialog');
    dialog.innerHTML = `<h2>${esc(title)}</h2><textarea readonly rows="12" aria-label="${esc(title)}">${esc(text)}</textarea>
      <div class="row end"><button class="btn" data-close>Close</button><button class="btn primary" data-copy>Copy</button></div>`;
    const area = dialog.querySelector('textarea');
    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelector('[data-copy]').onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        area.select();
        document.execCommand('copy');
      }
      toast('Copied.');
      dialog.close();
    };
    dialog.showModal();
    area.select();
  }

  const encode = (data) => {
    let binary = '';
    new TextEncoder().encode(JSON.stringify(data)).forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const decode = (text) => {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))));
  };

  /* Devanagari to a Latin transcription, with Hindi schwa deletion. */
  const table = (text) => new Map(text.split(' ').map((pair) => pair.split(':')).map(([a, b]) => [a.normalize('NFD'), b]));
  const VOWEL = table('अ:a आ:ā इ:i ई:ī उ:u ऊ:ū ऋ:ṛ ए:e ऐ:ai ओ:o औ:au ऑ:ô');
  const SIGN = table('ा:ā ि:i ी:ī ु:u ू:ū ृ:ṛ े:e ै:ai ो:o ौ:au ॉ:ô');
  const CONSONANT = table('क:k ख:kh ग:g घ:gh ङ:ṅ च:c छ:ch ज:j झ:jh ञ:ñ ट:ṭ ठ:ṭh ड:ḍ ढ:ḍh ण:ṇ त:t थ:th द:d ध:dh न:n प:p फ:ph ब:b भ:bh म:m य:y र:r ल:l व:v श:ś ष:ṣ स:s ह:h');
  const NUKTA = { क: 'q', ख: 'kh', ग: 'ġ', ज: 'z', फ: 'f', ड: 'ṛ', ढ: 'ṛh' };

  function word(source) {
    const chars = [...source.normalize('NFD')];
    const syl = []; // {onset, vowel, inherent, nasal}
    let cluster = '';
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (CONSONANT.has(c)) {
        let sound = CONSONANT.get(c);
        if (chars[i + 1] === '़') {
          sound = NUKTA[c] || sound;
          i++;
        }
        const next = chars[i + 1];
        if (next === '्') {
          cluster += sound;
          i++;
        } else if (SIGN.has(next)) {
          syl.push({ onset: cluster + sound, vowel: SIGN.get(next), single: !cluster });
          cluster = '';
          i++;
        } else {
          syl.push({ onset: cluster + sound, vowel: 'a', inherent: true, single: !cluster });
          cluster = '';
        }
      } else if (VOWEL.has(c)) syl.push({ onset: '', vowel: VOWEL.get(c) });
      else if ((c === 'ं' || c === 'ँ') && syl.length) syl[syl.length - 1].nasal = c === 'ँ' ? '̃' : 'ṁ';
      else if (c === 'ः' && syl.length) syl[syl.length - 1].nasal = 'ḥ';
      else syl.push({ onset: c, vowel: '' });
    }
    const last = syl[syl.length - 1];
    if (syl.length > 1 && last.inherent && last.single && !last.nasal) last.vowel = '';
    for (let i = syl.length - 2; i > 0; i--) {
      const s = syl[i];
      if (s.inherent && s.single && !s.nasal && syl[i - 1].vowel && !syl[i - 1].nasal && syl[i + 1].single && syl[i + 1].vowel) {
        s.vowel = '';
      }
    }
    return (syl.map((s) => s.onset + s.vowel + (s.nasal || '')).join('') + cluster).normalize('NFC');
  }
  const translit = (text) => text.split(' ').map((w) => (/[ऀ-ॿ]/.test(w) ? word(w) : w)).join(' ');

  HT.util = { esc, store, toast, download, showText, encode, decode, translit };
})(globalThis.HT = globalThis.HT || {});
