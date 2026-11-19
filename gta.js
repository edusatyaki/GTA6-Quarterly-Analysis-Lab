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
  L.className = 'loader gate'; L.id = 'loader';
  L.setAttribute('role', 'dialog'); L.setAttribute('aria-modal', 'true'); L.setAttribute('aria-label', 'GTA VI Quarterly Analysis');
  L.innerHTML = `
    <div class="slides">${SLIDES.map((s, i) => `<img src="${IMG}${s}" alt=""${i ? ' loading="lazy"' : ''}>`).join('')}</div>
    <div class="rs">Innovation in Education · MongoDB Lab</div>
    <div class="logo" aria-hidden="true"><span class="gta">grand theft auto</span><span class="six">VI</span></div>
    <div class="sub">Assignment 03 · Quarterly Analysis</div>
    <p class="tip" id="ldTip"></p>
    <button class="anykey" id="ldAny" type="button"><span class="ak-main">Press any key</span><span class="ak-sub">Full screen · Sound on</span></button>
    <div class="busy"><div class="ring"></div><span>Loading</span>
      <div class="menu-btns">
        <button class="start" id="ldGo" type="button"><kbd>Enter</kbd> Start the analysis</button>
        <button class="mbtn" id="ldLv" type="button">Levels</button>
        <button class="mbtn" id="ldSnd" type="button" aria-pressed="true"></button>
      </div>
    </div>
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
  let got = 0, ready = false, entered = false;
  const t0 = Date.now(), MIN = 2600;
  const tick = () => {
    const p = Math.min(1, (got / want.length) * .6 + Math.min(1, (Date.now() - t0) / MIN) * .4);
    bar.style.width = (p * 100).toFixed(1) + '%';
    if (p >= 1 && !ready){ ready = true; L.classList.add('ready'); if (entered) L.querySelector('#ldGo').focus(); }
    else if (!ready) requestAnimationFrame(tick);
  };
  want.forEach(s => { const im = new Image(); im.onload = im.onerror = () => { got++; }; im.src = IMG + s; });
  requestAnimationFrame(tick);

  /* ---------- full screen ---------- */
  const root = document.documentElement;
  function goFull(){
    const fn = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!fn || document.fullscreenElement || document.webkitFullscreenElement) return;
    try { const r = fn.call(root, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => {}); } catch(_){}
  }

  /* ---------- sound buttons (loader menu + top bar) ---------- */
  const A = window.GTA_AUDIO;
  const sndLabel = on => `<span class="eq${on ? ' on' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i></span>${on ? 'Sound on' : 'Sound off'}`;
  const tb = document.createElement('button');
  tb.type = 'button'; tb.className = 'sndbtn'; tb.id = 'sndBtn';
  const fsb = document.getElementById('fs'); if (fsb) fsb.before(tb);
  const paintSnd = () => { const on = !A || A.on(); [tb, L.querySelector('#ldSnd')].forEach(b => { if (!b) return; b.innerHTML = sndLabel(on); b.setAttribute('aria-pressed', on); b.title = on ? 'Turn music and sound effects off' : 'Turn music and sound effects on'; }); };
  paintSnd();
  if (A){ A.onChange(paintSnd); tb.onclick = () => { A.init(); A.toggle(); }; L.querySelector('#ldSnd').onclick = e => { e.stopPropagation(); A.init(); A.toggle(); }; }

  /* phase 1: "press any key" → full screen + music; phase 2: menu */
  function enter(){
    if (entered) return;
    entered = true;
    goFull();
    if (A) A.init();
    if (A) A.sfx('blip');
    L.classList.remove('gate'); L.classList.add('menu');
    if (ready) L.querySelector('#ldGo').focus();
  }

  function start(then){
    if (!ready || L.classList.contains('gone')) return;
    if (A) A.sfx('whoosh');
    L.classList.add('gone');
    clearInterval(slideTimer); clearInterval(tipTimer);
    setTimeout(() => {
      L.remove();
      const c = document.getElementById('cmd');
      if (then === 'levels' && window.GATE){ GATE.map(); return; }
      if (window.GATE && GATE.afterLoader()) return;
      if (innerWidth > 900){ if (c) c.focus(); }
      else { if (c) c.blur(); window.scrollTo(0, 0); }   // phones: start at the question, not the shell
    }, 750);
  }
  L.querySelector('#ldGo').addEventListener('click', e => { e.stopPropagation(); goFull(); start(); });
  L.querySelector('#ldLv').addEventListener('click', e => { e.stopPropagation(); goFull(); start('levels'); });
  L.addEventListener('click', () => { if (!entered) enter(); });
  /* while the loader is up, keys belong to it, not to the shell */
  const MODS = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn', 'Tab', 'Escape'];
  window.addEventListener('keydown', e => {
    if (!document.body.contains(L) || L.classList.contains('gone')) return;
    if (!entered){
      if (!MODS.includes(e.key) && !e.metaKey && !e.ctrlKey){ e.preventDefault(); e.stopPropagation(); enter(); }
      return;
    }
    if (e.target.closest && e.target.closest('.menu-btns') && e.target.id !== 'ldGo' && (e.key === 'Enter' || e.key === ' ')) return;  // let Levels / Sound buttons click
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); start(); }
    if (e.key !== 'Tab'){ e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
