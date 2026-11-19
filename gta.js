/* ============================================================
   GTA VI theme: loading screen + per-question artwork backdrop
   ============================================================ */
(function(){
  const IMG = 'img/gta6/';

  /* ---------- backdrop: crossfade to the current question's artwork ---------- */
  const bd = document.createElement('div');
  bd.className = 'backdrop'; bd.setAttribute('aria-hidden', 'true');
  bd.innerHTML = '<i></i><i></i>';
  document.body.prepend(bd);
  const layers = bd.querySelectorAll('i');
  let front = 0, cur = '';
  function setBg(src){
    if (!src || src === cur) return;
    cur = src;
    const img = new Image();
    img.onload = img.onerror = () => {
      if (cur !== src) return;
      const next = layers[1 - front];   // pick the hidden layer at swap time, not call time
      next.style.backgroundImage = `url("${src}")`;
      next.classList.add('on'); layers[front].classList.remove('on');
      front = 1 - front;
    };
    img.src = src;
  }
  document.addEventListener('lab:render', e => {
    const d = e.detail, ch = (window.CHAPTERS || []).find(c => c.id === document.body.dataset.chapter);
    setBg(d.finished ? (ch && ch.finishBg) : d.task && d.task.bg);
  });

  /* ---------- loading screen ---------- */
  const SLIDES = ['squalo-skyline.jpg', 'jason-lucia-car.jpg', 'grotti-cheetah.jpg', 'vice-city-mural.jpg', 'vice-city-style.jpg', 'kayak.jpg', 'ganado-beach.jpg', 'stilt-safehouse.jpg'];
  const TIPS = [
    'Dot notation reaches inside embedded documents: <code>"setting.city"</code>.',
    'Embed what is always read together: 1 → 1 and 1 → Few.',
    'Reference what grows without limit: store the <code>_id</code>s, not the documents.',
    '<code>$addToSet</code> adds a value only when it is missing.',
    'Many ↔ Many links need two writes, one on each side.',
    '<code>$lookup</code> joins referenced documents without changing stored data.',
    'Every command starts with <code>db.</code> and names are case-sensitive.'
  ];
  const L = document.createElement('div');
  L.className = 'loader'; L.id = 'loader';
  L.setAttribute('role', 'dialog'); L.setAttribute('aria-modal', 'true'); L.setAttribute('aria-label', 'GTA VI Quarterly Analysis — loading');
  L.innerHTML = `
    <div class="slides">${SLIDES.map((s, i) => `<img src="${IMG}${s}" alt=""${i ? ' loading="lazy"' : ''}>`).join('')}</div>
    <div class="rs">Innovation in Education · MongoDB Lab</div>
    <div class="logo" aria-hidden="true"><span class="gta">grand theft auto</span><span class="six">VI</span></div>
    <div class="sub">Assignment 03 · Quarterly Analysis</div>
    <p class="tip" id="ldTip"></p>
    <div class="busy"><div class="ring"></div><span>Loading</span><button class="start" id="ldGo" type="button"><kbd>Enter</kbd> Start the analysis</button></div>
    <div class="meter"><i id="ldBar"></i></div>`;
  document.body.appendChild(L);

  const imgs = L.querySelectorAll('.slides img');
  let si = 0;
  imgs[0].classList.add('on');
  const slideTimer = setInterval(() => {
    imgs[si].classList.remove('on');
    si = (si + 1) % imgs.length;
    imgs[si].classList.add('on');
  }, 4200);

  const tipEl = L.querySelector('#ldTip');
  let ti = Math.floor(Math.random() * TIPS.length);
  const showTip = () => { tipEl.style.opacity = 0; setTimeout(() => { tipEl.innerHTML = '<b>Tip</b>' + TIPS[ti]; tipEl.style.opacity = 1; ti = (ti + 1) % TIPS.length; }, 300); };
  showTip();
  const tipTimer = setInterval(showTip, 4200);

  /* progress: real image loads, with a short minimum so the screen is seen */
  const bar = L.querySelector('#ldBar');
  const want = ['squalo-skyline.jpg', 'jason-lucia-car.jpg', 'cover.jpg', 'standard-edition.jpg', 'ultimate-edition.jpg'];
  let got = 0, timeUp = false, ready = false;
  const t0 = Date.now(), MIN = 2600;
  const tick = () => {
    const p = Math.min(1, (got / want.length) * .6 + Math.min(1, (Date.now() - t0) / MIN) * .4);
    bar.style.width = (p * 100).toFixed(1) + '%';
    if (p >= 1 && !ready){ ready = true; L.classList.add('ready'); L.querySelector('#ldGo').focus(); }
    else if (!ready) requestAnimationFrame(tick);
  };
  want.forEach(s => { const im = new Image(); im.onload = im.onerror = () => { got++; }; im.src = IMG + s; });
  requestAnimationFrame(tick);

  function start(){
    if (!ready || L.classList.contains('gone')) return;
    L.classList.add('gone');
    clearInterval(slideTimer); clearInterval(tipTimer);
    setTimeout(() => {
      L.remove();
      const c = document.getElementById('cmd');
      if (window.GATE && GATE.afterLoader()) return;
      if (innerWidth > 900){ if (c) c.focus(); }
      else { if (c) c.blur(); window.scrollTo(0, 0); }   // phones: start at the question, not the shell
    }, 750);
  }
  L.querySelector('#ldGo').addEventListener('click', start);
  L.addEventListener('click', e => { if (ready && e.target !== L.querySelector('#ldGo')) start(); });
  /* while the loader is up, keys belong to it, not to the shell */
  window.addEventListener('keydown', e => {
    if (!document.body.contains(L) || L.classList.contains('gone')) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape'){ e.preventDefault(); start(); }
    if (e.key !== 'Tab'){ e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
