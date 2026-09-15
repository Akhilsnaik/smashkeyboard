(() => {
  const stage = document.getElementById('stage');
  const hint = document.querySelector('.hint');
  const keyBadge = document.getElementById('keyBadge');

  const ANIMALS = [
    '🐶', '🐱', '🐰', '🦁', '🐸', '🐵', '🐨', '🐼', '🦄', '🐷',
    '🦋', '🐢', '🐬', '🐥', '🐘', '🦒', '🐮', '🐔', '🐙', '🐳',
    '🐺', '🦊', '🐻', '🐹', '🐭', '🦉', '🐝', '🦓', '🐍'
  ];

  const EMOJIS = [
    ...ANIMALS,
    '⭐', '🌈', '🎈', '🎉', '🍎', '🍌', '🍓', '🍕', '🎵', '☀️',
    '🌙', '⚡', '❤️', '💜', '💛', '💚', '🚗', '🚀', '⚽', '🎨',
    '🍭', '🍦', '🧸', '🎁', '🔥', '✨'
  ];

  const MAX_EMOJIS = 60;
  let activeCount = 0;
  let audioCtx = null;
  let fullscreenRequested = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function playPop() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 420 + Math.random() * 260;

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

  function pickAnimal() {
    return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
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

  function spawnEmoji(x, y) {
    if (activeCount >= MAX_EMOJIS) return;
    activeCount++;

    const el = document.createElement('div');
    el.className = 'emoji-pop';
    el.textContent = pickEmoji();

    const size = randomBetween(3.2, 5.8);
    el.style.fontSize = size + 'rem';
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    const rotStart = randomBetween(-25, 25);
    const rotMid = rotStart + randomBetween(-15, 15);
    const rotEnd = rotMid + randomBetween(-30, 30);
    const driftX = randomBetween(-90, 90);
    const driftY = randomBetween(-220, -120);
    const duration = randomBetween(0.9, 1.4);

    el.style.setProperty('--rot-start', rotStart + 'deg');
    el.style.setProperty('--rot-mid', rotMid + 'deg');
    el.style.setProperty('--rot-end', rotEnd + 'deg');
    el.style.setProperty('--drift-x', driftX + 'px');
    el.style.setProperty('--drift-y', driftY + 'px');
    el.style.animationDuration = duration + 's';

    el.addEventListener('animationend', () => {
      el.remove();
      activeCount--;
    });

    stage.appendChild(el);
  }

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const jitterX = x + randomBetween(-30, 30);
      const jitterY = y + randomBetween(-30, 30);
      setTimeout(() => spawnEmoji(jitterX, jitterY), i * 30);
    }
  }

  function hideHint() {
    if (!hint.classList.contains('hidden')) {
      hint.classList.add('hidden');
    }
  }

  function showKeyBadge(label) {
    keyBadge.textContent = label;
    keyBadge.classList.add('show');
    clearTimeout(showKeyBadge._t);
    showKeyBadge._t = setTimeout(() => {
      keyBadge.classList.remove('show');
    }, 500);
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    requestFullscreenOnce();
    hideHint();
    playPop();
    showKeyBadge(pickAnimal());
    const x = randomBetween(window.innerWidth * 0.2, window.innerWidth * 0.8);
    const y = randomBetween(window.innerHeight * 0.25, window.innerHeight * 0.75);
    spawnBurst(x, y, 3);
  });

  function handlePointer(x, y) {
    requestFullscreenOnce();
    hideHint();
    playPop();
    spawnBurst(x, y, 5);
  }

  stage.addEventListener('pointerdown', (e) => {
    handlePointer(e.clientX, e.clientY);
  });
})();
