/* ============================================================
   Levels: the 22 tasks split into 10 levels. Each level ends with a
   5-question checkpoint; score 4/5 or better to unlock the next one.
   Exposes window.GATE, which lab.js asks before moving between tasks.
   ============================================================ */
const LEVELS = [
  { title:'Welcome to Leonida', topic:'Embedding', from:0, to:2, art:'vice-city-mural.jpg', quiz:[
    { q:'What does <b>embedding</b> mean in MongoDB?', a:['Storing related data inside the same document','Storing related data in separate collections linked by _id','Copying a collection into another database','Creating an index on a field'],
      why:'Embedded data lives inside its parent document, so one read returns everything.' },
    { q:'Which filter finds the game set in Vice City?', a:['{ "setting.city": "Vice City" }','{ setting.city: "Vice City" }','{ city: "Vice City" }','{ setting: "Vice City" }'],
      why:'A dotted path must be quoted. Without quotes it is a syntax error, and <code>{ city: … }</code> looks for a top-level field that does not exist.' },
    { q:'<code>{ "protagonists.name": "Franklin" }</code> matches a game when…', a:['any element of protagonists has name "Franklin"','only the first protagonist is "Franklin"','every protagonist is named "Franklin"','protagonists is the string "Franklin"'],
      why:'Dot notation on an array of sub-documents checks every element; one match is enough.' },
    { q:'What is the maximum size of one MongoDB document?', a:['16 MB','4 MB','100 MB','There is no limit'],
      why:'A document must stay under 16 MB, which is why unbounded data should not be embedded.' },
    { q:'In the GTA VI document, <code>platforms: ["PS5", "Xbox Series X|S"]</code> is…', a:['an embedded array of plain values','an embedded sub-document','a list of references to another collection','a separate collection'],
      why:'It is a small list stored inside the game document: embedding.' }
  ]},
  { title:'Bottom Line', topic:'1 → 1 · Quarter summary', from:3, to:5, art:'vi-sunset.jpg', quiz:[
    { q:'Why is <code>summary</code> embedded in each quarter?', a:['There is exactly one per quarter and it is always read with it','It is large and keeps growing','Many quarters share the same summary','MongoDB requires every object to be embedded'],
      why:'1 → 1 data that is read together belongs inside the parent document.' },
    { q:'Q3 has <code>summary: { net_bookings_musd: 3120, units_m: 27.6 }</code>. What does <code>$set: { summary: { net_bookings_musd: 3150 } }</code> do?', a:['Replaces the whole summary, so units_m is lost','Changes only net_bookings_musd','Adds a second summary field','Throws an error'],
      why:'Setting the parent field replaces the entire sub-document.' },
    { q:'Which update changes only the bookings figure?', a:['{ $set: { "summary.net_bookings_musd": 3150 } }','{ $set: { net_bookings_musd: 3150 } }','{ $push: { summary: 3150 } }','{ $inc: { summary: 3150 } }'],
      why:'A dotted path in <code>$set</code> targets one field inside the embedded document. Without the prefix you create a new top-level field.' },
    { q:'Bookings: Q1 1420, Q2 1760, Q3 3120, Q4 2400. Which quarters match <code>{ "summary.net_bookings_musd": { $gt: 2000 } }</code>?', a:['Q3 and Q4','Only Q3','Q2, Q3 and Q4','None'],
      why:'Only 3120 and 2400 are greater than 2000.' },
    { q:'A quarter has no <code>summary</code> field at all. Is it returned by that <code>$gt</code> query?', a:['No','Yes, with summary: null','Yes, treated as 0','The query fails'],
      why:'A missing field cannot be greater than 2000, so the document is simply not matched.' }
  ]},
  { title:'Regional Split', topic:'1 → Few · Regions', from:6, to:7, art:'jason-lucia-car.jpg', quiz:[
    { q:'What is the best design for a quarter’s 3–4 regional sales splits?', a:['An embedded array of sub-documents','A separate regions collection referenced by _id','One database per region','A single comma-separated string'],
      why:'A few items, read with the quarter and rarely changing: classic 1 → Few embedding.' },
    { q:'Which operator appends <code>{ region: "APAC", share_pct: 12 }</code> to <code>regions</code>?', a:['$push','$set','$inc','$rename'],
      why:'<code>$push</code> appends one element (here a whole sub-document) to an array.' },
    { q:'<code>{ "regions.region": "APAC" }</code> returned Q1 and Q3 because…', a:['at least one element of their regions has region "APAC"','APAC is their first region','APAC is their only region','their regions array has exactly 3 items'],
      why:'Dot notation matches if any embedded element has that value.' },
    { q:'If you <code>$push</code> the same APAC sub-document twice, the array…', a:['contains it twice','contains it once','is replaced by it','is left unchanged and an error is shown'],
      why:'<code>$push</code> always appends; only <code>$addToSet</code> skips duplicates.' },
    { q:'A 1 → Few list should stay embedded as long as it…', a:['stays small and bounded','contains only numbers','is read separately from its parent','is bigger than 16 MB'],
      why:'Embedding is safe while the list cannot grow without limit.' }
  ]},
  { title:'Highlight Reel', topic:'1 → Many (small) · Lists', from:8, to:9, art:'squalo-skyline.jpg', quiz:[
    { q:'How is <code>$addToSet</code> different from <code>$push</code>?', a:['It does not add a value that is already in the array','It replaces the whole array','It only works on numbers','It adds the value at the start'],
      why:'<code>$addToSet</code> treats the array like a set.' },
    { q:'You run the same <code>$addToSet</code> highlight update twice. How many copies are stored?', a:['One','Two','Zero','It depends on the order'],
      why:'The second run finds the value already present and changes nothing (<code>modifiedCount: 0</code>).' },
    { q:'<code>{ platforms: "PC" }</code> matches a game when…', a:['any element of platforms equals "PC"','platforms is exactly ["PC"]','"PC" is the last platform','platforms has one element'],
      why:'An equality filter on an array field matches if any element is equal.' },
    { q:'Which games did <code>db.games.find({ platforms: "PC" })</code> return?', a:['GTA V and Red Dead Redemption 2','All three games','Only GTA VI','None'],
      why:'GTA VI launched on PS5 and Xbox Series X|S only.' },
    { q:'When should a small embedded list move to referencing?', a:['When it could grow without limit','When it has more than two items','When it holds strings','Never: lists are always embedded'],
      why:'Unbounded growth risks the 16 MB limit and slow writes, so reference instead.' }
  ]},
  { title:'Follow the Money', topic:'Referencing · Sales', from:10, to:11, art:'grotti-cheetah.jpg', quiz:[
    { q:'Why do sales live in their own collection?', a:['A quarter can have thousands of sales, so they would grow without limit','Sales are never read','MongoDB cannot embed numbers','Each collection may hold only 5 documents'],
      why:'Large 1 → Many relationships are referenced, not embedded.' },
    { q:'What does a quarter’s <code>sale_ids</code> array store?', a:['Only the _id values of its sales','Full copies of every sale document','The total revenue','The names of the sales staff'],
      why:'A reference is just the other document’s <code>_id</code>.' },
    { q:'Which filter fetches documents whose _id is any value in a list?', a:['{ _id: { $in: [ … ] } }','{ _id: { $all: [ … ] } }','{ _id: [ … ] }','{ _id: { $nin: [ … ] } }'],
      why:'<code>$in</code> matches any one of the listed values. <code>{ _id: [ … ] }</code> would look for an _id equal to the whole array.' },
    { q:'Without <code>$lookup</code>, how many queries do you need to show a quarter with its sales?', a:['Two: the quarter, then the sales','One','Three','It cannot be done'],
      why:'Read the ids from the parent, then fetch the children with <code>$in</code>.' },
    { q:'In <code>db.quarters.findOne({ _id: "FY27-Q3" }).sale_ids</code>, what does <code>findOne</code> return?', a:['A single document (or null)','A cursor of documents','An array of ids','A count'],
      why:'<code>findOne</code> returns one document, so you can read <code>.sale_ids</code> from it directly.' }
  ]},
  { title:'Paper Trail', topic:'Referencing · Sales', from:12, to:13, art:'rideout-garage.jpg', quiz:[
    { q:'What does <code>db.quarters.find({ sale_ids: "S202" })</code> find?', a:['The quarter whose sale_ids array contains "S202"','The sale with _id "S202"','Every quarter except the one with S202','Nothing: you must use $in'],
      why:'A plain value against an array field matches if the array contains it.' },
    { q:'You inserted sale S305, but the Q3 report still lists four sales. Why?', a:['Q3’s sale_ids has not been updated yet','insertOne failed silently','Reports are cached for an hour','S305 has the wrong _id type'],
      why:'With referencing, the link in the parent is a second write.' },
    { q:'Why write <code>units_k: 3200</code> rather than <code>units_k: "3200"</code>?', a:['Numbers must stay numbers so comparisons and sums work','Strings are not allowed in MongoDB','Quotes make the field read-only','There is no difference'],
      why:'<code>"3200"</code> is text: <code>$gt</code> and <code>$sum</code> would not treat it as a number.' },
    { q:'What happens if you insert <code>{ _id: "S305", … }</code> a second time?', a:['It fails with a duplicate key error','A second S305 is added','The first one is replaced','The _id is renamed automatically'],
      why:'<code>_id</code> is unique in every collection.' },
    { q:'What is the main benefit of storing each sale as its own document?', a:['Quarter documents do not grow as sales are added','Sales load faster when embedded','It removes the need for _id','It saves one write per sale'],
      why:'The parent stays small no matter how many children there are.' }
  ]},
  { title:'Closing the Books', topic:'Referencing · Sales', from:14, to:15, art:'race-car.jpg', quiz:[
    { q:'Which update adds "S305" to Q3’s sale_ids and is safe to run twice?', a:['{ $addToSet: { sale_ids: "S305" } }','{ $push: { sale_ids: "S305" } }','{ $set: { sale_ids: "S305" } }','{ $inc: { sale_ids: 1 } }'],
      why:'<code>$push</code> would add a duplicate on the second run; <code>$set</code> would replace the array with a string.' },
    { q:'A <b>child → parent</b> reference means…', a:['each sale stores the _id of its quarter or game','each quarter stores full sale documents','sales and quarters share one collection','the parent stores nothing about its children'],
      why:'<code>quarter_id</code> and <code>game_id</code> on a sale point up to its parents.' },
    { q:'For truly large 1 → Many data, why is child → parent often better?', a:['No parent array keeps growing','It avoids having _id fields','It needs no queries','It embeds the parent in every child'],
      why:'A parent with millions of ids in one array would hit size and performance limits.' },
    { q:'<code>db.sales.find({ game_id: "GTA6" })</code> returned 6 sales. Which sale is <b>not</b> one of them?', a:['S101','S202','S304','S305'],
      why:'S101 is a GTA V sale.' },
    { q:'With parent → child referencing, saving one new related item takes…', a:['two writes: the child, then its id in the parent','one write','three writes','no writes'],
      why:'Insert the child document, then add its id to the parent.' }
  ]},
  { title:'Shelf Space', topic:'Many ↔ Many · Editions', from:16, to:18, art:'salon-duo.jpg', quiz:[
    { q:'Why are editions ↔ retailers referenced on both sides?', a:['Each edition has many retailers and each retailer has many editions','There are only two editions','Retailers never change','MongoDB cannot embed strings'],
      why:'Both sides are “many”, so neither can embed the other.' },
    { q:'GameStop (R4) starts selling the Ultimate Edition (E2). What must change?', a:['Add E2 to R4’s edition_ids and R4 to E2’s retailer_ids','Only add E2 to R4’s edition_ids','Only add R4 to E2’s retailer_ids','Create a new retailer document'],
      why:'Two-way references need two writes, one on each side.' },
    { q:'If you update only one side of a Many ↔ Many link…', a:['the two collections disagree','MongoDB fixes the other side automatically','the update is rejected','nothing changes'],
      why:'MongoDB does not keep references in sync for you.' },
    { q:'Before linking GameStop, which retailers match <code>{ edition_ids: "E2" }</code>?', a:['PlayStation Store and Xbox Store','All four retailers','Only GameStop','Amazon and GameStop'],
      why:'Only R1 and R2 listed E2 at the start.' },
    { q:'Why use <code>$addToSet</code> for these links?', a:['Running it twice will not create a duplicate id','It is faster than every other operator','It updates both collections at once','$push cannot add strings'],
      why:'Links should never be duplicated.' }
  ]},
  { title:'The Big Report', topic:'Joining ($lookup) · Report', from:19, to:20, art:'vice-city-style.jpg', quiz:[
    { q:'<code>$lookup</code> is closest to which SQL operation?', a:['LEFT OUTER JOIN','INNER JOIN','UNION','GROUP BY'],
      why:'Every input document is kept, even if nothing matches (it gets an empty array).' },
    { q:'With <code>localField: "sale_ids"</code> and <code>foreignField: "_id"</code>, which sales are joined?', a:['Those whose _id is in the quarter’s sale_ids','Every sale in the collection','Sales whose sale_ids contain the quarter','Only the first sale'],
      why:'An array localField matches any foreign document whose foreignField equals one of its values.' },
    { q:'Does <code>$lookup</code> change the stored documents?', a:['No, it only shapes the result','Yes, it saves the joined array','Yes, it deletes the ids','Only if you add $out'],
      why:'Aggregation reads data; the join exists only in the output. (A <code>$out</code> or <code>$merge</code> stage would be needed to save it.)' },
    { q:'Why put <code>$match</code> before <code>$lookup</code> in the launch-quarter report?', a:['To join only Q3 instead of every quarter','$lookup must always be second','To sort the results','To delete the other quarters'],
      why:'Filtering first means the join runs on fewer documents.' },
    { q:'Which <code>$lookup</code> option names the new array field?', a:['as','from','localField','foreignField'],
      why:'<code>as: "sales"</code> creates a field called <code>sales</code>.' }
  ]},
  { title:'Final Score', topic:'Capstone', from:21, to:21, art:'classic-coupe.jpg', quiz:[
    { q:'<code>edition_id</code> holds a single id, not an array. After <code>$lookup … as: "edition"</code>, the <code>edition</code> field is…', a:['an array with one document','a single embedded document','the id string','null'],
      why:'<code>$lookup</code> always produces an array, even for one match.' },
    { q:'Which of these is <b>embedded</b> in this database?', a:['A quarter’s summary and regions','The sales of a quarter','The retailers of an edition','The editions of a sale'],
      why:'Sales, retailers and editions are all separate collections linked by _id.' },
    { q:'Which rule of thumb did this assignment follow?', a:['Embed what is bounded and read together; reference what is unbounded or shared','Always embed everything','Always reference everything','Embed only numbers, reference only strings'],
      why:'That is the core design rule of Chapter 03.' },
    { q:'Which stage order does the capstone use, and why?', a:['$match then $lookup, so only Q3 sales are joined','$lookup then $match, to join everything first','$lookup alone','$match alone'],
      why:'Filter first, then join.' },
    { q:'Which collection does the capstone pipeline start from?', a:['sales','quarters','editions','games'],
      why:'<code>db.sales.aggregate([…])</code>: each sale is matched by <code>quarter_id</code> and joined to its edition.' }
  ]}
];

(function(){
  const IMG = 'img/gta6/';
  const PASS = 4, NL = LEVELS.length;
  const LK = 'gta6-levels-v1';
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const tasks = () => AS03_TASKS;
  const sfx = n => { if (window.GTA_AUDIO) GTA_AUDIO.sfx(n); };

  /* padlock artwork: one SVG sprite, reused everywhere with <use> */
  const sprite = document.createElement('div');
  sprite.setAttribute('aria-hidden', 'true');
  sprite.innerHTML = `<svg width="0" height="0" style="position:absolute;overflow:hidden"><defs>
    <linearGradient id="lkBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4FA8"/><stop offset=".55" stop-color="#FF7A59"/><stop offset="1" stop-color="#FFB547"/></linearGradient>
    <linearGradient id="lkGrey" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E7BA0"/><stop offset="1" stop-color="#5A4A6B"/></linearGradient>
    <linearGradient id="lkMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4F0F8"/><stop offset=".5" stop-color="#C9BBD6"/><stop offset="1" stop-color="#8F7FA0"/></linearGradient>
    <symbol id="i-lock" viewBox="0 0 24 24">
      <path d="M7.4 11V7.8a4.6 4.6 0 0 1 9.2 0V11" fill="none" stroke="url(#lkMetal)" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="3.6" y="10.2" width="16.8" height="12.2" rx="3.2" fill="url(#lkBody)"/>
      <rect x="4.9" y="11.4" width="14.2" height="1.5" rx=".75" fill="#fff" opacity=".35"/>
      <circle cx="12" cy="15.6" r="1.9" fill="#1A0630"/><path d="M11.1 16.4h1.8l.5 3.3h-2.8z" fill="#1A0630"/>
    </symbol>
    <symbol id="i-lock-dim" viewBox="0 0 24 24">
      <path d="M7.4 11V7.8a4.6 4.6 0 0 1 9.2 0V11" fill="none" stroke="#B7A6C6" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="3.6" y="10.2" width="16.8" height="12.2" rx="3.2" fill="url(#lkGrey)"/>
      <circle cx="12" cy="15.6" r="1.9" fill="#1A0630"/><path d="M11.1 16.4h1.8l.5 3.3h-2.8z" fill="#1A0630"/>
    </symbol>
    <symbol id="i-unlocked" viewBox="0 0 24 24">
      <path d="M16.6 11V5.6a4.6 4.6 0 0 0-9.2 0V7" fill="none" stroke="url(#lkMetal)" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="3.6" y="10.2" width="16.8" height="12.2" rx="3.2" fill="#3EF0DF"/>
      <path d="M8.3 16.2l2.4 2.4 5-5" fill="none" stroke="#1A0630" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol></defs></svg>`;
  document.body.appendChild(sprite);
  const ICON = (id, cls) => `<svg class="ic ${cls || ''}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const LOCK_ANIM = `<svg class="lk-anim" viewBox="-6 -8 36 36" aria-hidden="true">
      <circle class="lk-burst" cx="12" cy="15" r="10" fill="none" stroke="#3EF0DF" stroke-width="1.5"/>
      <g class="lk-rays" stroke="#FFC046" stroke-width="1.6" stroke-linecap="round"><path d="M12 -5v3M24.5 2l-2 2M-.5 2l2 2M28 15h-3M-4 15h3"/></g>
      <g class="lk-shk"><path d="M7.4 11V7.8a4.6 4.6 0 0 1 9.2 0V11" fill="none" stroke="url(#lkMetal)" stroke-width="2.6" stroke-linecap="round"/></g>
      <rect class="lk-body" x="3.6" y="10.2" width="16.8" height="12.2" rx="3.2" fill="url(#lkBody)"/>
      <rect x="4.9" y="11.4" width="14.2" height="1.5" rx=".75" fill="#fff" opacity=".35"/>
      <circle cx="12" cy="15.6" r="1.9" fill="#1A0630"/><path d="M11.1 16.4h1.8l.5 3.3h-2.8z" fill="#1A0630"/>
    </svg>`;

  /* level names become the outline topics and question tags */
  LEVELS.forEach((L, li) => { for (let i = L.from; i <= L.to; i++) AS03_TASKS[i].group = `Level ${li+1} · ${L.title}`; });

  let st = { passed:{} };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(LK) || 'null') || {}); } catch(_){}
  const saveSt = () => { try { localStorage.setItem(LK, JSON.stringify(st)); } catch(_){} };

  const levelOf = i => LEVELS.findIndex(L => i >= L.from && i <= L.to);
  const unlocked = li => li === 0 || st.passed[li - 1] !== undefined;
  const passed = li => st.passed[li] !== undefined;
  const levelDone = li => { const L = LEVELS[li]; for (let i = L.from; i <= L.to; i++) if (!done.has(i)) return false; return true; };
  const topUnlocked = () => { let li = 0; while (li + 1 < NL && unlocked(li + 1)) li++; return li; };
  const firstOpen = li => { const L = LEVELS[li]; for (let i = L.from; i <= L.to; i++) if (!done.has(i)) return i; return L.from; };
  const stars = s => '★★★★★'.slice(0, s) + '☆☆☆☆☆'.slice(0, 5 - s);

  /* ---------- overlay shell ---------- */
  const ov = document.createElement('div');
  ov.className = 'lv'; ov.hidden = true;
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = '<div class="lv-bg"><img alt=""></div><div class="lv-bar top"></div><div class="lv-bar bot"></div><div class="lv-body" id="lvBody"></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#lvBody'), bgImg = ov.querySelector('.lv-bg img');
  let keyHandler = null;

  function open(mode, art, html, onKey){
    ov.hidden = false; ov.dataset.mode = mode;
    if (window.GTA_AUDIO) GTA_AUDIO.duck(mode === 'quiz');
    const tst = document.getElementById('lvToast'); if (tst) tst.classList.remove('on');
    if (art && !bgImg.src.endsWith(art)){ bgImg.classList.remove('kb'); bgImg.src = IMG + art; void bgImg.offsetWidth; bgImg.classList.add('kb'); }
    body.innerHTML = html; body.classList.remove('in'); void body.offsetWidth; body.classList.add('in');
    keyHandler = onKey || null;
    const f = body.querySelector('[data-focus]') || body.querySelector('button'); if (f) f.focus();
  }
  function close(){ ov.hidden = true; keyHandler = null; body.innerHTML = ''; if (window.GTA_AUDIO) GTA_AUDIO.duck(false); }
  window.addEventListener('keydown', e => {
    if (ov.hidden) return;
    if (document.getElementById('loader')) return;
    if (keyHandler && keyHandler(e) === true){ e.preventDefault(); e.stopPropagation(); return; }
    if (e.key === 'Escape' && (ov.dataset.mode === 'map' || ov.dataset.mode === 'intro')){ e.preventDefault(); close(); return; }
    if (e.key !== 'Tab' && !e.target.closest('.lv')){ e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* sunset wipe between screens */
  function wipe(mid){
    const w = document.createElement('div'); w.className = 'wipe'; w.innerHTML = '<i></i><i></i><i></i>';
    document.body.appendChild(w); sfx('whoosh');
    setTimeout(mid, 430);
    setTimeout(() => w.remove(), 1000);
  }

  /* ---------- level intro ---------- */
  function intro(li, resume){
    const L = LEVELS[li], n = L.to - L.from + 1;
    const items = []; for (let i = L.from; i <= L.to; i++) items.push(`<li class="${done.has(i)?'ok':''}"><span>${done.has(i)?'✓':i+1}</span>${tasks()[i].title}</li>`);
    open('intro', L.art, `
      <div class="lv-num" aria-hidden="true">${pad(li+1)}</div>
      <div class="lv-card">
        <div class="lv-kicker">Level ${pad(li+1)} <i>/ ${NL}</i> · ${esc(L.topic)}</div>
        <h2 class="lv-title">${esc(L.title)}</h2>
        <ol class="lv-obj">${items.join('')}</ol>
        <p class="lv-meta">${n} task${n>1?'s':''} in the shell · then a 5-question checkpoint · score ${PASS}/5 to unlock ${li+1 < NL ? 'Level ' + (li+2) : 'the finale'}</p>
        <div class="lv-btns">
          <button class="lv-btn" data-focus type="button" id="lvGo"><kbd>Enter</kbd> ${resume ? 'Continue' : 'Start'} level</button>
          <button class="lv-btn ghost" type="button" id="lvMap">All levels</button>
        </div>
      </div>`, e => { if (e.key === 'Enter' && e.target.id !== 'lvMap'){ go(); return true; } });
    const go = () => wipe(() => { close(); const t = firstOpen(li); if (t !== idx) goTo(t, true); else renderAll(); focusCmd(); });
    body.querySelector('#lvGo').onclick = go;
    body.querySelector('#lvMap').onclick = () => map();
  }
  function focusCmd(){ const c = document.getElementById('cmd'); if (c && innerWidth > 900) c.focus(); else window.scrollTo(0, 0); }

  /* ---------- checkpoint quiz ---------- */
  function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function quiz(li){
    const L = LEVELS[li];
    const qs = L.quiz.map(q => ({ q:q.q, why:q.why, right:q.a[0], opts:shuffle(q.a) }));
    const picks = Array(qs.length).fill(null);
    let k = 0;
    const draw = () => {
      const Q = qs[k];
      open('quiz', L.art, `
        <div class="qz">
          <div class="qz-head"><span class="lv-kicker">Level ${pad(li+1)} checkpoint</span>
            <span class="pips">${qs.map((_, i) => `<i class="${i < k ? 'did' : i === k ? 'now' : ''}"></i>`).join('')}</span></div>
          <p class="qz-n">Question ${k+1} of ${qs.length}</p>
          <h3 class="qz-q">${Q.q}</h3>
          <div class="qz-opts" role="radiogroup">${Q.opts.map((o, i) => `<button type="button" role="radio" aria-checked="${picks[k]===o}" class="qz-opt${picks[k]===o?' on':''}" data-o="${i}"><b>${'ABCD'[i]}</b><span>${o.startsWith('{') || o.startsWith('$') ? `<code>${esc(o)}</code>` : o}</span></button>`).join('')}</div>
          <div class="qz-foot">
            <button type="button" class="lv-btn ghost" id="qzBack"${k ? '' : ' disabled'}>Back</button>
            <span class="qz-keys">Keys 1–4 choose · Enter next</span>
            <button type="button" class="lv-btn" id="qzNext"${picks[k] === null ? ' disabled' : ''}>${k === qs.length - 1 ? 'Submit' : 'Next'}</button>
          </div>
        </div>`, e => {
          if (/^[1-4]$/.test(e.key) && Q.opts[+e.key - 1] !== undefined){ pick(+e.key - 1); return true; }
          if (e.key === 'Enter' && picks[k] !== null && !e.target.classList.contains('qz-opt')){ next(); return true; }
        });
      body.querySelectorAll('.qz-opt').forEach(b => b.onclick = () => pick(+b.dataset.o));
      body.querySelector('#qzNext').onclick = next;
      body.querySelector('#qzBack').onclick = () => { if (k){ k--; draw(); } };
    };
    const pick = i => { sfx('blip'); picks[k] = qs[k].opts[i]; body.querySelectorAll('.qz-opt').forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-checked', j === i); }); const n = body.querySelector('#qzNext'); n.disabled = false; n.focus(); };
    const next = () => { if (k < qs.length - 1){ k++; draw(); } else result(li, qs, picks); };
    draw();
  }

  /* ---------- results ---------- */
  function result(li, qs, picks){
    const score = qs.filter((Q, i) => picks[i] === Q.right).length;
    const L = LEVELS[li], win = score >= PASS, last = li === NL - 1;
    if (win){ st.passed[li] = Math.max(score, st.passed[li] || 0); saveSt(); }
    sfx(win ? 'pass' : 'fail');
    if (win && li + 1 < NL) setTimeout(() => sfx('unlock'), 1250);
    const review = qs.map((Q, i) => picks[i] === Q.right ? '' : `<li><p>${Q.q}</p><p class="bad">Your answer: ${esc(picks[i])}</p><p class="good">Correct: ${esc(Q.right)}</p><p class="why">${Q.why}</p></li>`).join('');
    if (win){
      const nxt = LEVELS[li + 1];
      open('pass', L.art, `
        <div class="res win">
          <h2 class="big">${last ? 'Assignment complete' : 'Mission passed'}</h2>
          <p class="respect">Respect + <b>${score * 20}</b></p>
          <p class="stars" aria-label="${score} out of 5">${stars(score)}</p>
          <p class="sc">Level ${li+1} checkpoint · ${score}/5 correct</p>
          ${nxt ? `<div class="unlock">${LOCK_ANIM}
            <div><span class="lv-kicker">Unlocked</span><b>Level ${pad(li+2)} · ${esc(nxt.title)}</b><small>${esc(nxt.topic)}</small></div>
            <img src="${IMG}${nxt.art}" alt=""></div>` : `<p class="sc">All ${NL} levels passed. Every Chapter 03 pattern, used together.</p>`}
          ${review ? `<details class="rv"><summary>Review the one you missed</summary><ul>${review}</ul></details>` : ''}
          <div class="lv-btns"><button type="button" class="lv-btn" data-focus id="resGo"><kbd>Enter</kbd> ${nxt ? 'Level ' + (li+2) : 'See your report'}</button></div>
        </div>`, e => { if (e.key === 'Enter' && e.target.tagName !== 'SUMMARY'){ cont(); return true; } });
      const cont = () => wipe(() => {
        if (nxt) intro(li + 1);
        else { close(); finished = true; save(); renderAll(); }
      });
      body.querySelector('#resGo').onclick = cont;
      renderOutline();
      if (window.renderNav) renderNav();
      decorate();
    } else {
      open('fail', L.art, `
        <div class="res lose">
          <h2 class="big">Mission failed</h2>
          <p class="sc">${score}/5 correct · you need ${PASS}/5 to unlock ${last ? 'the finale' : 'Level ' + (li+2)}</p>
          <ul class="rvlist">${review}</ul>
          <div class="lv-btns">
            <button type="button" class="lv-btn" data-focus id="resRetry"><kbd>Enter</kbd> Retry checkpoint</button>
            <button type="button" class="lv-btn ghost" id="resBack">Back to the tasks</button>
          </div>
        </div>`, e => { if (e.key === 'Enter' && e.target.id !== 'resBack'){ wipe(() => quiz(li)); return true; } });
      body.querySelector('#resRetry').onclick = () => wipe(() => quiz(li));
      body.querySelector('#resBack').onclick = () => { close(); goTo(LEVELS[li].from, true); };
    }
  }

  /* ---------- level map ---------- */
  function map(){
    const cards = LEVELS.map((L, li) => {
      const lock = !unlocked(li), p = passed(li);
      const n = []; for (let i = L.from; i <= L.to; i++) n.push(done.has(i));
      return `<button type="button" class="mc${lock ? ' locked' : ''}${p ? ' passed' : ''}" data-l="${li}"${lock ? ' aria-disabled="true"' : ''}>
        <img src="${IMG}${L.art}" alt="" loading="lazy">
        <span class="mc-n">${pad(li+1)}</span>
        <span class="mc-t"><b>${esc(L.title)}</b><small>${esc(L.topic)}</small></span>
        ${lock ? `<span class="mc-lock">${ICON('i-lock')}</span>` : ''}<span class="mc-s">${lock ? ICON('i-lock-dim', 'sm') + ' Locked · pass Level ' + li : p ? ICON('i-unlocked', 'sm') + ' ' + stars(st.passed[li]) : p ? stars(st.passed[li]) : `${n.filter(Boolean).length}/${n.length} tasks`}</span>
      </button>`;
    }).join('');
    const np = Object.keys(st.passed).length;
    open('map', 'cover.jpg', `
      <div class="map">
        <div class="map-head"><div><span class="lv-kicker">GTA VI Quarterly Analysis</span><h2 class="lv-title">Levels</h2></div>
          <p class="map-sum">${np}/${NL} checkpoints passed</p><button type="button" class="lv-btn ghost" id="mapX" data-focus>Close</button></div>
        <div class="map-grid">${cards}</div>
      </div>`);
    body.querySelector('#mapX').onclick = close;
    body.querySelectorAll('.mc').forEach(b => b.onclick = () => {
      const li = +b.dataset.l;
      if (!unlocked(li)){ b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); sfx('deny'); return; }
      wipe(() => intro(li, LEVELS[li].from <= idx && idx <= LEVELS[li].to));
    });
  }

  /* ---------- toast ---------- */
  let tt;
  function toast(html){
    let t = document.getElementById('lvToast');
    if (!t){ t = document.createElement('div'); t.id = 'lvToast'; t.className = 'lv-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = ICON('i-lock', 'tl') + '<span>' + html + '</span>'; t.classList.add('on'); sfx('deny'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3600);
  }

  /* ---------- outline + nav decoration ---------- */
  let lastDone = -1;
  function decorate(){
    if (typeof done !== 'undefined'){ if (lastDone >= 0 && done.size > lastDone) sfx('ok'); lastDone = done.size; }
    document.querySelectorAll('#outline button.qi[data-i]').forEach(b => {
      const li = levelOf(+b.dataset.i);
      if (!unlocked(li)){ b.classList.add('locked'); b.querySelector('.st').innerHTML = ICON('i-lock-dim'); b.title = `Pass the Level ${li} checkpoint to unlock`; }
    });
    document.querySelectorAll('#outline .topic').forEach(t => {
      const m = t.querySelector('.tn').textContent.match(/^Level (\d+)/); if (!m) return;
      const li = +m[1] - 1;
      t.classList.toggle('locked', !unlocked(li)); t.classList.toggle('passed', passed(li));
      let s = t.querySelector('.lvs'); if (!s){ s = document.createElement('span'); s.className = 'lvs'; t.querySelector('.tn').after(s); }
      s.innerHTML = passed(li) ? '★' + st.passed[li] : unlocked(li) ? '' : ICON('i-lock-dim');
    });
    const li = levelOf(idx), nx = document.getElementById('next');
    if (li >= 0 && idx === LEVELS[li].to && !finished){
      nx.textContent = passed(li) ? (li === NL - 1 ? 'Finish ✓' : `Level ${li+2} →`) : '★ Checkpoint';
      nx.classList.toggle('go', levelDone(li));
      nx.classList.toggle('cp', !passed(li));
    } else nx.classList.remove('cp');
    const pt = document.getElementById('progText');
    if (pt && li >= 0) pt.textContent = finished ? `All ${NL} levels · ${done.size} of ${tasks().length} tasks` : `Level ${li+1} of ${NL} · ${done.size} of ${tasks().length} tasks`;
  }
  document.addEventListener('lab:outline', decorate);
  document.addEventListener('lab:render', decorate);

  /* "Levels" button in the top bar */
  const lb = document.createElement('button');
  lb.type = 'button'; lb.className = 'lvbtn'; lb.innerHTML = '<span aria-hidden="true">▦</span> Levels';
  lb.onclick = () => map();
  const fs = document.getElementById('fs'); if (fs) fs.before(lb);

  /* ---------- the gate lab.js consults ---------- */
  window.GATE = {
    allow: i => unlocked(levelOf(i)),
    clamp: i => unlocked(levelOf(i)) ? i : firstOpen(topUnlocked()),
    denied: i => { const li = levelOf(i); toast(`<b>Level ${li+1} is locked.</b> Pass the Level ${li} checkpoint to unlock it.`); },
    next: i => {
      const li = levelOf(i);
      if (li < 0 || i !== LEVELS[li].to) return false;
      if (!levelDone(li)){
        const left = []; for (let j = LEVELS[li].from; j <= LEVELS[li].to; j++) if (!done.has(j)) left.push(j + 1);
        toast(`<b>Checkpoint locked.</b> Finish task${left.length>1?'s':''} ${left.join(', ')} of Level ${li+1} first.`);
        return true;
      }
      if (passed(li)){
        if (li === NL - 1){ finished = true; save(); renderAll(); return true; }
        wipe(() => intro(li + 1));
        return true;
      }
      wipe(() => quiz(li));
      return true;
    },
    afterLoader: () => {
      if (finished) return false;
      let li = levelOf(idx); if (li < 0) return false;
      if (passed(li) && levelDone(li)) li = topUnlocked();   // resume at the newest open level
      intro(li, LEVELS[li].from <= idx && idx <= LEVELS[li].to && done.size > 0);
      return true;
    },
    map, levels: LEVELS
  };
})();
