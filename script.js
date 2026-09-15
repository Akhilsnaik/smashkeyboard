(() => {
  const stage = document.getElementById('stage');
  const hint = document.querySelector('.hint');
  const typedLine = document.getElementById('typedLine');
  const cursor = document.getElementById('cursor');

  const ANIMALS = [
    '🐶', '🐱', '🐰', '🦁', '🐸', '🐵', '🐨', '🐼', '🦄', '🐷',
    '🦋', '🐢', '🐬', '🐥', '🐘', '🦒', '🐮', '🦊', '🐻'
  ];

  const STARS = ['⭐', '🌟', '✨'];

  const KID_FAVORITES = [
    '🌈', '🎈', '🎉', '❤️', '💛', '💚', '💜', '🧸', '🎁',
    '☀️', '🌙', '🍎', '🍓', '🍌', '🍕', '🍦', '🍭'
  ];

  const EMOJIS = [...ANIMALS, ...STARS, ...KID_FAVORITES];

  const MAX_VISIBLE = 22;
  const MODIFIER_KEYS = new Set([
    'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'ContextMenu', 'OS'
  ]);

  let audioCtx = null;
  let fullscreenRequested = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function playPop(freqBase) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = (freqBase || 420) + Math.random() * 260;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickEmoji() {
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  }

  function requestFullscreenOnce() {
    if (fullscreenRequested) return;
    fullscreenRequested = true;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!req) return;
    try {
      const result = req.call(el);
      if (result && result.catch) result.catch(() => {});
    } catch (err) {
      /* ignore: fullscreen isn't available on some mobile browsers */
    }
  }

  function hideHint() {
    if (!hint.classList.contains('hidden')) {
      hint.classList.add('hidden');
    }
  }

  function appendTyped() {
    const el = document.createElement('span');
    el.className = 'typed-emoji';
    el.textContent = pickEmoji();
    typedLine.insertBefore(el, cursor);

    while (typedLine.children.length - 1 > MAX_VISIBLE) {
      const oldest = typedLine.firstElementChild;
      if (!oldest || oldest === cursor) break;
      oldest.remove();
    }
  }

  function removeLastTyped() {
    const last = cursor.previousElementSibling;
    if (!last) return;
    last.classList.add('removing');
    last.addEventListener('transitionend', () => last.remove(), { once: true });
  }

  function clearTyped() {
    while (typedLine.firstElementChild && typedLine.firstElementChild !== cursor) {
      typedLine.firstElementChild.remove();
    }
  }

  function celebrate() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const count = 10;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randomBetween(-0.2, 0.2);
      const distance = randomBetween(140, 240);
      const el = document.createElement('div');
      el.className = 'emoji-pop';
      el.textContent = pickEmoji();
      el.style.fontSize = randomBetween(2.4, 4) + 'rem';
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.setProperty('--rot-start', '0deg');
      el.style.setProperty('--rot-mid', randomBetween(-20, 20) + 'deg');
      el.style.setProperty('--rot-end', randomBetween(-40, 40) + 'deg');
      el.style.setProperty('--drift-x', Math.cos(angle) * distance + 'px');
      el.style.setProperty('--drift-y', Math.sin(angle) * distance + 'px');
      el.style.animationDuration = randomBetween(0.7, 1.1) + 's';
      el.addEventListener('animationend', () => el.remove());
      stage.appendChild(el);
    }

    playPop(700);
    setTimeout(() => playPop(900), 90);
  }

  window.addEventListener('keydown', (e) => {
    requestFullscreenOnce();

    if (MODIFIER_KEYS.has(e.key) || /^F\d{1,2}$/.test(e.key)) return;

    hideHint();

    if (e.key === 'Backspace') {
      playPop(300);
      removeLastTyped();
      return;
    }

    if (e.key === 'Enter') {
      if (e.repeat) return;
      clearTyped();
      celebrate();
      return;
    }

    if (e.repeat) return;
    playPop();
    appendTyped();
  });

  stage.addEventListener('pointerdown', () => {
    requestFullscreenOnce();
    hideHint();
    playPop();
    appendTyped();
  });
})();
