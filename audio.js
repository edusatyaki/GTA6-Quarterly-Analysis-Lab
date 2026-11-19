/* ============================================================
   Vice City Nights — an original 80s synthwave loop, synthesized live
   with the Web Audio API (no audio files), plus game sound effects.
   window.GTA_AUDIO: init() after a user gesture, toggle(), on(), sfx(name)
   ============================================================ */
(function(){
  const PREF = 'gta6-sound';
  let pref = 'on';
  try { pref = localStorage.getItem(PREF) || 'on'; } catch(_){}
  let ctx = null, master, music, fxBus, comp, verb, delay, noiseBuf, timer = null;
  let playing = false, step = 0, nextT = 0, bar = 0;
  const listeners = new Set();
  const BPM = 100, S16 = 60 / BPM / 4;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  /* Am – F – C – G, then Am – F – G – Em */
  const PROG = [
    { pad:[57,60,64], root:45 }, { pad:[53,57,60], root:41 }, { pad:[55,60,64], root:48 }, { pad:[55,59,62], root:43 },
    { pad:[57,60,64], root:45 }, { pad:[53,57,60], root:41 }, { pad:[55,59,62], root:43 }, { pad:[52,55,59], root:40 }
  ];
  const ARP = [0,1,2,3,2,1,0,1, 2,3,4,3,2,1,2,3];
  /* a hook that answers itself every 8 bars (16th-note steps → midi, 0 = rest) */
  const HOOK = [
    [76,0,0,74,0,0,72,0, 0,0,69,0,72,0,0,0], [72,0,0,0,69,0,0,0, 65,0,0,0,0,0,0,0],
    [67,0,0,72,0,0,76,0, 0,0,79,0,76,0,0,0], [74,0,0,0,0,0,71,0, 0,0,0,0,0,0,0,0]
  ];

  function build(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0.0001;
    music = ctx.createGain(); music.gain.value = 0.55;
    fxBus = ctx.createGain(); fxBus.gain.value = 0.9;
    music.connect(master); fxBus.connect(master); master.connect(comp); comp.connect(ctx.destination);
    /* noise */
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    /* reverb: generated decaying impulse */
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++){ const x = ir.getChannelData(c); for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = ir;
    const vg = ctx.createGain(); vg.gain.value = 0.35; verb.connect(vg); vg.connect(music);
    /* dotted-eighth echo for the arp and hook */
    delay = ctx.createDelay(1); delay.delayTime.value = S16 * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.38; const dw = ctx.createGain(); dw.gain.value = 0.3;
    delay.connect(fb); fb.connect(delay); delay.connect(dw); dw.connect(music);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (pref === 'on') ctx.resume(); });
    return true;
  }

  const env = (g, t, a, peak, dec, end = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + dec); };
  function osc(type, f, t, dur, out, peak, a = 0.005, cut){
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    let node = o;
    if (cut){ const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; o.connect(lp); node = lp; }
    node.connect(g); g.connect(out); env(g, t, a, peak, dur); o.start(t); o.stop(t + a + dur + 0.05);
    return o;
  }
  function noise(t, dur, type, freq, peak, out, q = 0.8){
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    s.connect(f); f.connect(g); g.connect(out); env(g, t, 0.002, peak, dur); s.start(t); s.stop(t + dur + 0.05);
    return { f, g };
  }

  /* ---------- instruments ---------- */
  function kick(t){ const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13); o.connect(g); g.connect(music); env(g, t, 0.002, 0.95, 0.34); o.start(t); o.stop(t + 0.4); }
  function snare(t, v = 1){ const n = noise(t, 0.2, 'bandpass', 1900, 0.5 * v, music); n.g.connect(verb); osc('triangle', 185, t, 0.08, music, 0.25 * v); }
  function hat(t, open){ noise(t, open ? 0.22 : 0.045, 'highpass', 7500, open ? 0.09 : 0.07, music, 0.7); }
  function bass(t, m){
    const o = ctx.createOscillator(), s = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; s.type = 'square'; o.frequency.value = hz(m); s.frequency.value = hz(m - 12);
    lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(1300, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.14);
    const sg = ctx.createGain(); sg.gain.value = 0.5;
    o.connect(lp); s.connect(sg); sg.connect(lp); lp.connect(g); g.connect(music); env(g, t, 0.004, 0.2, 0.14);
    o.start(t); s.start(t); o.stop(t + 0.2); s.stop(t + 0.2);
  }
  function pad(t, notes, dur){
    const lp = ctx.createBiquadFilter(), g = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 1500;
    lp.connect(g); g.connect(music); g.connect(verb);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.45); g.gain.setValueAtTime(0.05, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    notes.forEach(m => [-8, 8].forEach(dt => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur + 0.7); }));
  }
  function arp(t, m){ const o = osc('square', hz(m), t, 0.11, music, 0.028, 0.004, 2400); const g2 = ctx.createGain(); g2.gain.value = 0.6; o.connect(g2); g2.connect(delay); }
  function lead(t, m){
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = hz(m); o2.frequency.value = hz(m); o2.detune.value = 7;
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.5; vg.gain.value = 4; vib.connect(vg); vg.connect(o.detune); vg.connect(o2.detune);
    lp.type = 'lowpass'; lp.frequency.value = 2800; o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(music); g.connect(delay); g.connect(verb);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    [o, o2, vib].forEach(x => { x.start(t); x.stop(t + 0.6); });
  }

  /* ---------- sequencer ---------- */
  function schedule(t, s, b){
    const ch = PROG[b % 8], intro = b < 4, beat = s % 4 === 0;
    if (s === 0) pad(t, ch.pad, S16 * 16);
    const notes = ch.pad.map(n => n + 12).concat([ch.pad[0] + 24, ch.pad[1] + 24]);
    arp(t, notes[ARP[s] % notes.length]);
    if (intro) return;
    if (beat) kick(t);
    if (s === 4 || s === 12) snare(t);
    if (b % 8 === 7 && s >= 12) snare(t, 0.55);          // fill into the next phrase
    if (s % 2 === 0) hat(t, s === 6 || s === 14);
    if (s % 2 === 0) bass(t, ch.root + (s % 4 === 2 ? 12 : 0));
    if (b >= 8){ const h = HOOK[(b - 8) % 8 >> 1] || HOOK[0]; const m = (b % 2 === 0) ? h[s] : 0; if (m) lead(t, m); }
  }
  function tick(){
    while (nextT < ctx.currentTime + 0.12){
      schedule(nextT, step, bar);
      nextT += S16; step++;
      if (step === 16){ step = 0; bar++; if (bar >= 24) bar = 8; }
    }
  }
  function startMusic(){
    if (!ctx || playing) return;
    playing = true; step = 0; bar = 0; nextT = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 1.5);
    timer = setInterval(tick, 25);
  }
  function stopMusic(){
    if (!ctx || !playing) return;
    playing = false; clearInterval(timer); timer = null;
  }

  /* ---------- sound effects ---------- */
  const FX = {
    blip(t){ const o = osc('square', 880, t, 0.06, fxBus, 0.05); o.frequency.exponentialRampToValueAtTime(1320, t + 0.05); },
    ok(t){ [76, 83].forEach((m, i) => osc('triangle', hz(m), t + i * 0.07, 0.18, fxBus, 0.12)); },
    whoosh(t){ const n = noise(t, 0.55, 'bandpass', 400, 0.18, fxBus, 1.2); n.f.frequency.exponentialRampToValueAtTime(3600, t + 0.45); },
    deny(t){ [0, 0.11].forEach(d => osc('square', 140, t + d, 0.08, fxBus, 0.07, 0.004, 900)); },
    pass(t){ [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => { const o = osc('sawtooth', hz(m), t + i * 0.085, i === 6 ? 1.2 : 0.25, fxBus, 0.07, 0.01, 3200); }); [48, 55, 60].forEach(m => osc('sawtooth', hz(m), t + 0.6, 1.3, fxBus, 0.05, 0.02, 1500)); },
    fail(t){ [69, 65, 62, 57].forEach((m, i) => { const o = osc('sawtooth', hz(m), t + i * 0.22, 0.32, fxBus, 0.07, 0.01, 1400); o.frequency.exponentialRampToValueAtTime(hz(m - 1), t + i * 0.22 + 0.3); }); },
    coin(t){ const o = osc('square', 1975, t, 0.05, fxBus, 0.035, 0.002, 6000); o.frequency.setValueAtTime(2637, t + 0.04); },
    cashout(t){ noise(t, 0.35, 'bandpass', 2600, 0.06, fxBus, 2); },
    cash(t){ noise(t, 0.05, 'highpass', 3000, 0.22, fxBus); noise(t + 0.06, 0.12, 'bandpass', 1800, 0.12, fxBus, 3); [2637, 3520].forEach((f, i) => osc('triangle', f, t + 0.1 + i * 0.09, 0.55, fxBus, 0.09)); osc('sine', 5274, t + 0.19, 0.7, fxBus, 0.03); },
    unlock(t){ noise(t, 0.03, 'highpass', 5000, 0.2, fxBus); osc('triangle', 1568, t + 0.05, 0.25, fxBus, 0.1); osc('triangle', 2093, t + 0.13, 0.5, fxBus, 0.1); osc('sine', 3136, t + 0.13, 0.6, fxBus, 0.04); }
  };

  const notify = () => listeners.forEach(f => f(pref === 'on'));
  window.GTA_AUDIO = {
    /* call from a click / key handler (browsers only allow audio after a gesture) */
    init(){
      if (!ctx && !build()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (pref === 'on') startMusic();
    },
    on: () => pref === 'on',
    toggle(){
      pref = pref === 'on' ? 'off' : 'on';
      try { localStorage.setItem(PREF, pref); } catch(_){}
      if (!ctx) build();
      if (!ctx) return;
      if (pref === 'on'){ ctx.resume(); startMusic(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 0.6); }
      else { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4); setTimeout(() => { if (pref === 'off'){ stopMusic(); ctx.suspend(); } }, 450); }
      notify();
    },
    duck(on){ if (ctx) music.gain.setTargetAtTime(on ? 0.22 : 0.55, ctx.currentTime, 0.25); },
    sfx(name){ if (!ctx || pref !== 'on' || !FX[name]) return; if (ctx.state === 'suspended') ctx.resume(); FX[name](ctx.currentTime + 0.01); },
    onChange(f){ listeners.add(f); },
    state: () => ({ ctx: ctx ? ctx.state : 'none', playing, bar, pref })
  };
})();
