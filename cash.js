/* ============================================================
   GTA VI cash: every solved task pays out. Bills fly from the
   bottom of the screen into the cash counter in the top bar.
   ============================================================ */
(function(){
  const KEY = 'gta6-cash-v1';
  const tasks = () => (typeof TASKS !== 'undefined' ? TASKS : []);
  const levels = () => (typeof LEVELS !== 'undefined' ? LEVELS : []);

  /* payout grows with the level: Level 1 tasks pay $5,000, Level 10 pays $250,000 */
  const PAY = [5000, 7500, 10000, 15000, 20000, 25000, 35000, 50000, 75000, 250000];
  function reward(i){
    const L = levels(); let li = L.findIndex(l => i >= l.from && i <= l.to);
    if (li < 0) li = Math.min(PAY.length - 1, Math.floor(i / 2.3));
    return PAY[li] || PAY[PAY.length - 1];
  }

  let earned = new Set();
  try { earned = new Set((JSON.parse(localStorage.getItem(KEY) || 'null') || {}).earned || []); } catch(_){}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ earned: [...earned] })); } catch(_){} };
  const total = () => [...earned].reduce((s, i) => s + reward(i), 0);
  const fmt = n => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------- HUD in the top bar ---------- */
  const hud = document.createElement('div');
  hud.className = 'cash'; hud.id = 'cash';
  hud.setAttribute('role', 'status'); hud.setAttribute('aria-live', 'polite');
  hud.title = 'Cash earned from solved tasks';
  hud.innerHTML = '<span class="cash-amt" id="cashAmt">$0</span><span class="cash-pop" id="cashPop"></span>';
  const anchor = document.getElementById('sndBtn') || document.getElementById('fs');
  if (anchor) anchor.before(hud); else document.querySelector('.top').appendChild(hud);
  const amt = hud.querySelector('#cashAmt'), pop = hud.querySelector('#cashPop');

  /* a pinned copy for phones, where the top bar can be scrolled out of view */
  const pin = document.createElement('div');
  pin.className = 'cash cash-pin'; pin.setAttribute('aria-hidden', 'true');
  pin.innerHTML = '<span class="cash-amt">$0</span>';
  document.body.appendChild(pin);
  const pinAmt = pin.firstChild;

  let shown = total();
  const paint = v => { amt.textContent = pinAmt.textContent = fmt(v); };
  paint(shown);

  /* count up smoothly toward a target */
  let target = shown, raf = 0;
  function countTo(v){
    target = v;
    if (document.hidden){ cancelAnimationFrame(raf); raf = 0; shown = v; paint(v); return; }
    if (raf) return;
    const step = () => {
      const d = target - shown;
      if (Math.abs(d) < 1){ shown = target; paint(shown); raf = 0; return; }
      shown += d * 0.18 + Math.sign(d) * 1;
      if ((d > 0 && shown > target) || (d < 0 && shown < target)) shown = target;
      paint(shown); raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
  const sfx = n => { if (window.GTA_AUDIO) GTA_AUDIO.sfx(n); };
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the money flight ---------- */
  const BILL = '<i class="bill-in"><b>$</b><em>100</em><b>$</b></i>';
  function payout(amount){
    const start = shown, end = start + amount;
    pop.textContent = '+' + fmt(amount); bump(pop);

    let tgt = hud;
    const r0 = hud.getBoundingClientRect();
    if (r0.bottom < 4 || r0.width === 0 || getComputedStyle(hud).display === 'none'){ pin.classList.add('on'); tgt = pin; }
    const r = tgt.getBoundingClientRect();
    const tx = r.left + r.width / 2, ty = r.top + r.height / 2;

    if (still() || document.hidden){ countTo(end); bump(tgt); sfx('cash'); setTimeout(() => pin.classList.remove('on'), 2200); return; }

    const n = Math.min(18, 8 + Math.round(Math.log10(amount) * 2));
    const W = innerWidth, H = innerHeight;
    const layer = document.createElement('div');
    layer.className = 'cash-fly'; layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    let landed = 0, closed = false;
    sfx('cashout');
    const finish = () => { if (closed) return; closed = true; countTo(end); bump(tgt); sfx('cash'); layer.remove(); setTimeout(() => pin.classList.remove('on'), 1600); };
    setTimeout(finish, n * 75 + 2200);   // safety net if animations are paused (background tab)

    for (let k = 0; k < n; k++){
      const b = document.createElement('div');
      b.className = 'bill' + (k % 4 === 3 ? ' coin' : '');
      b.innerHTML = k % 4 === 3 ? '<i class="coin-in">$</i>' : BILL;
      layer.appendChild(b);
      const x0 = W * (0.2 + Math.random() * 0.6), y0 = H + 40;
      const mx = x0 + (tx - x0) * 0.35 + (Math.random() - 0.5) * W * 0.35;
      const my = H * (0.35 + Math.random() * 0.25);
      const rot0 = (Math.random() - 0.5) * 80, rot1 = rot0 + (Math.random() < .5 ? -1 : 1) * (180 + Math.random() * 360);
      const dur = 950 + Math.random() * 450, delay = k * 75;
      const a = b.animate([
        { transform: `translate(${x0}px,${y0}px) translate(-50%,-50%) rotate(${rot0}deg) scale(1.1)`, opacity: 0 },
        { transform: `translate(${x0}px,${y0 - 60}px) translate(-50%,-50%) rotate(${rot0 + 20}deg) scale(1.15)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${mx}px,${my}px) translate(-50%,-50%) rotate(${(rot0 + rot1) / 2}deg) scale(.95)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${tx}px,${ty}px) translate(-50%,-50%) rotate(${rot1}deg) scale(.3)`, opacity: 0.2 }
      ], { duration: dur, delay, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'both' });
      a.onfinish = () => {
        b.remove(); landed++;
        if (closed) return;
        countTo(start + amount * landed / n);
        bump(tgt);
        if (landed % 3 === 1) sfx('coin');
        if (landed === n) finish();
      };
    }
  }

  /* ---------- watch for newly solved tasks ---------- */
  let first = true;
  function sync(){
    if (typeof done === 'undefined') return;
    // a lab reset clears done: drop the money for tasks that are no longer solved
    let changed = false;
    [...earned].forEach(i => { if (!done.has(i)){ earned.delete(i); changed = true; } });
    let gain = 0;
    done.forEach(i => { if (!earned.has(i)){ earned.add(i); gain += reward(i); changed = true; } });
    if (changed) save();
    if (first){ first = false; shown = target = total(); paint(shown); return; }   // progress loaded from before: no flight
    if (gain > 0) payout(gain);
    else if (changed){ shown = target = total(); paint(shown); }
  }
  document.addEventListener('lab:render', sync);

  window.GTA_CASH = { total, reward, fmt };
})();
