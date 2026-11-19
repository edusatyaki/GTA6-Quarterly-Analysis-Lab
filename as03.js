/* ============================================================
   Assignment 03 · Quarterly Analysis — Grand Theft Auto VI
   Chapter 03's concepts used together: embedding (1 → 1,
   1 → Few, small 1 → Many), referencing by _id (large 1 → Many),
   two-way Many ↔ Many links, and $lookup joins.
   Story: the launch quarter of GTA VI (19 Nov 2026). Sales and
   bookings figures are invented for practice — they are not
   Take-Two or Rockstar results. Fiscal year FY27 = Apr 2026 – Mar 2027.
   ============================================================ */
const GTA = {
  games: [
    { _id:'GTA6', title:'Grand Theft Auto VI', studio:'Rockstar Games', release_date:'2026-11-19',
      setting:{ state:'Leonida', city:'Vice City' },
      protagonists:[ { name:'Lucia', role:'Lead' }, { name:'Jason', role:'Lead' } ],
      platforms:['PS5','Xbox Series X|S'] },
    { _id:'GTA5', title:'Grand Theft Auto V', studio:'Rockstar North', release_date:'2013-09-17',
      setting:{ state:'San Andreas', city:'Los Santos' },
      protagonists:[ { name:'Michael', role:'Lead' }, { name:'Franklin', role:'Lead' }, { name:'Trevor', role:'Lead' } ],
      platforms:['PS4','PS5','Xbox One','Xbox Series X|S','PC'] },
    { _id:'RDR2', title:'Red Dead Redemption 2', studio:'Rockstar Studios', release_date:'2018-10-26',
      setting:{ state:'New Hanover', city:'Saint Denis' },
      protagonists:[ { name:'Arthur Morgan', role:'Lead' } ],
      platforms:['PS4','Xbox One','PC'] }
  ],
  quarters: [
    { _id:'FY27-Q1', quarter:'Q1', fiscal_year:'FY27', period:'Apr–Jun 2026',
      summary:{ net_bookings_musd:1420, units_m:9.1 },
      regions:[ { region:'Americas', share_pct:52 }, { region:'EMEA', share_pct:33 }, { region:'APAC', share_pct:15 } ],
      highlights:['GTA V keeps selling'], sale_ids:['S101','S102'] },
    { _id:'FY27-Q2', quarter:'Q2', fiscal_year:'FY27', period:'Jul–Sep 2026',
      summary:{ net_bookings_musd:1760, units_m:11.4 },
      regions:[ { region:'Americas', share_pct:55 }, { region:'EMEA', share_pct:45 } ],
      highlights:['GTA VI pre-orders open'], sale_ids:['S201','S202'] },
    { _id:'FY27-Q3', quarter:'Q3', fiscal_year:'FY27', period:'Oct–Dec 2026',
      summary:{ net_bookings_musd:3120, units_m:27.6 },
      regions:[ { region:'Americas', share_pct:58 }, { region:'EMEA', share_pct:30 } ],
      highlights:['GTA VI launches on 19 Nov 2026'], sale_ids:['S301','S302','S303','S304'] },
    { _id:'FY27-Q4', quarter:'Q4', fiscal_year:'FY27', period:'Jan–Mar 2027',
      highlights:[], sale_ids:[] }
  ],
  sales: [
    { _id:'S101', quarter_id:'FY27-Q1', game_id:'GTA5', platform:'PS5', region:'Americas', units_k:1800, revenue_musd:54 },
    { _id:'S102', quarter_id:'FY27-Q1', game_id:'RDR2', platform:'PC', region:'EMEA', units_k:900, revenue_musd:27 },
    { _id:'S201', quarter_id:'FY27-Q2', game_id:'GTA5', platform:'Xbox Series X|S', region:'EMEA', units_k:1500, revenue_musd:45 },
    { _id:'S202', quarter_id:'FY27-Q2', game_id:'GTA6', edition_id:'E1', platform:'PS5', region:'Americas', units_k:6200, revenue_musd:434 },
    { _id:'S301', quarter_id:'FY27-Q3', game_id:'GTA6', edition_id:'E1', platform:'PS5', region:'Americas', units_k:9800, revenue_musd:686 },
    { _id:'S302', quarter_id:'FY27-Q3', game_id:'GTA6', edition_id:'E2', platform:'Xbox Series X|S', region:'Americas', units_k:4100, revenue_musd:410 },
    { _id:'S303', quarter_id:'FY27-Q3', game_id:'GTA6', edition_id:'E1', platform:'PS5', region:'EMEA', units_k:7600, revenue_musd:532 },
    { _id:'S304', quarter_id:'FY27-Q3', game_id:'GTA6', edition_id:'E2', platform:'PS5', region:'APAC', units_k:2300, revenue_musd:230 }
  ],
  editions: [
    { _id:'E1', name:'Standard Edition', game_id:'GTA6', price_usd:69.99, retailer_ids:['R1','R2','R3','R4'] },
    { _id:'E2', name:'Ultimate Edition', game_id:'GTA6', price_usd:99.99, retailer_ids:['R1','R2'] }
  ],
  retailers: [
    { _id:'R1', name:'PlayStation Store', type:'Digital', edition_ids:['E1','E2'] },
    { _id:'R2', name:'Xbox Store', type:'Digital', edition_ids:['E1','E2'] },
    { _id:'R3', name:'Amazon', type:'Physical', edition_ids:['E1'] },
    { _id:'R4', name:'GameStop', type:'Physical', edition_ids:['E1'] }
  ]
};

/* poster banners: each topic opens with GTA VI artwork */
const GTA_IMG = 'img/gta6/';
const posterBanner = (src, alt, pos, label) =>
  `<figure class="banner"><img src="${GTA_IMG}${src}" alt="${alt}" style="object-position:${pos || 'center'}" loading="lazy"><figcaption>${label}</figcaption></figure>`;
const GTA_COVER = `<figure class="cover">
  <img class="c-main" src="${GTA_IMG}cover.jpg" alt="Grand Theft Auto VI launch poster: Jason and Lucia over Vice City, November 19, 2026">
  <div class="c-side"><img src="${GTA_IMG}standard-edition.jpg" alt="GTA VI Standard Edition cover art"><img src="${GTA_IMG}ultimate-edition.jpg" alt="GTA VI Ultimate Edition cover art"></div>
  <figcaption><span>Assignment 03 · Quarterly Analysis</span><b>Grand Theft Auto VI — the launch quarter</b><small>Vice City, Leonida · FY27 Q3 (Oct–Dec 2026) · 5 collections · 22 questions</small></figcaption>
</figure>`;

const GTA_CREDIT = '<p class="poster-credit">Artwork © Rockstar Games (rockstargames.com/VI) and fan wallpapers via Pinterest — used for classroom teaching.</p>';

const AS03_TASKS = [
  /* ---------- Embedding ---------- */
  { group:'Embedding', kind:'find', coll:'games', media: GTA_COVER + GTA_CREDIT, title:'Open the game document',
    story:'<b>Your brief:</b> you are the data analyst for the GTA VI launch. The <code>ViceCityQuarterly</code> database holds <code>games</code>, <code>quarters</code>, <code>sales</code>, <code>editions</code> and <code>retailers</code>. Build the quarterly analysis using everything from Chapter 03: embedding, referencing, two-way links and <code>$lookup</code>. <em>Sales figures are invented for practice.</em>',
    ask:'Find <code>"Grand Theft Auto VI"</code> in <code>games</code> by its <code>title</code>, and look at how <code>setting</code>, <code>protagonists</code> and <code>platforms</code> are stored.',
    answer:'db.games.find({ title: "Grand Theft Auto VI" })',
    explain:'Three kinds of embedding in one document: <code>setting</code> is one sub-document (1 → 1), <code>protagonists</code> is a short array of sub-documents (1 → Few), and <code>platforms</code> is an array of plain values (small 1 → Many).',
    note:'Lucia and Jason, Vice City in Leonida, on PS5 and Xbox Series X|S.' },
  { group:'Embedding', kind:'find', coll:'games', ops:['setting.city'], title:'Query an embedded document',
    ask:'Find the game set in <code>"Vice City"</code>. The city lives inside the embedded <code>setting</code>, so use dot notation: <code>"setting.city"</code>.',
    answer:'db.games.find({ "setting.city": "Vice City" })',
    explain:'Dot notation reaches into the embedded document. A path with a dot must be in quotes.',
    note:'Grand Theft Auto VI.' },
  { group:'Embedding', kind:'find', coll:'games', ops:['protagonists.name'], title:'Query an embedded array',
    ask:'Which game has a protagonist named <code>"Franklin"</code>? Search the embedded <code>protagonists</code> array with <code>"protagonists.name"</code>.',
    answer:'db.games.find({ "protagonists.name": "Franklin" })',
    explain:'On an array of sub-documents, <code>"protagonists.name"</code> matches if <em>any</em> element has that name.',
    note:'Grand Theft Auto V — Michael, Franklin and Trevor.' },

  /* ---------- 1 → 1 ---------- */
  { group:'1 → 1 · Quarter summary', kind:'update', coll:'quarters', method:'updateOne', ops:['$set'], title:'Embed the Q4 forecast',
    media: posterBanner('vi-sunset.jpg', 'GTA VI wallpaper: a sports car in front of the giant VI letters at sunset', 'center 40%', '1 → 1 · one summary per quarter'),
    story:'Every quarter has exactly one <code>summary</code> (net bookings and units). It is always read with its quarter, so it is <b>embedded</b>.',
    ask:'<code>"FY27-Q4"</code> has no summary yet. Embed the forecast: <code>summary: { net_bookings_musd: 2400, units_m: 18.5 }</code>.',
    answer:'db.quarters.updateOne(\n  { _id: "FY27-Q4" },\n  { $set: { summary: { net_bookings_musd: 2400, units_m: 18.5 } } }\n)',
    diffHint:'Numbers stay numbers: <code>2400</code> and <code>18.5</code>, no quotes.',
    explain:'<strong>1 → 1 (embed).</strong> <code>$set</code> with an object value embeds the whole sub-document in one write.',
    note:'All four quarters now carry a <code>summary</code>.' },
  { group:'1 → 1 · Quarter summary', kind:'find', coll:'quarters', ops:['summary.net_bookings_musd','$gt'], title:'Filter on an embedded number',
    ask:'Find the quarters whose <code>summary.net_bookings_musd</code> is greater than <code>2000</code> (use <code>$gt</code>).',
    answer:'db.quarters.find({ "summary.net_bookings_musd": { $gt: 2000 } })',
    explain:'Dot notation combines with any query operator: here <code>$gt</code> on an embedded field.',
    note:'FY27-Q3 (the launch, 3120) and the Q4 forecast (2400).' },
  { group:'1 → 1 · Quarter summary', kind:'update', coll:'quarters', method:'updateOne', ops:['summary.net_bookings_musd'], title:'Restate one embedded field',
    ask:'Finance restates Q3. Change only <code>summary.net_bookings_musd</code> of <code>"FY27-Q3"</code> to <code>3150</code>, leaving <code>units_m</code> as it is.',
    answer:'db.quarters.updateOne(\n  { _id: "FY27-Q3" },\n  { $set: { "summary.net_bookings_musd": 3150 } }\n)',
    diffHint:'<code>$set: { summary: { … } }</code> replaces the whole sub-document and loses <code>units_m</code>. Use the dotted path <code>"summary.net_bookings_musd"</code>.',
    explain:'<code>$set</code> with a dotted path changes one field inside the embedded document. <code>$set: { summary: {…} }</code> would overwrite the whole thing.',
    note:'Q3: <code>summary: { net_bookings_musd: 3150, units_m: 27.6 }</code>.' },

  /* ---------- 1 → Few ---------- */
  { group:'1 → Few · Regions', kind:'update', coll:'quarters', method:'updateOne', ops:['$push'], title:'Add the missing region',
    media: posterBanner('jason-lucia-car.jpg', 'GTA VI artwork: Jason and Lucia in a convertible at night', 'center 35%', '1 → Few · a handful of regions per quarter'),
    story:'A quarter splits its sales across only a few regions, so <code>regions</code> is an embedded array of sub-documents.',
    ask:'Q3 is missing Asia-Pacific. <code>$push</code> <code>{ region: "APAC", share_pct: 12 }</code> into the <code>regions</code> of <code>"FY27-Q3"</code>.',
    answer:'db.quarters.updateOne(\n  { _id: "FY27-Q3" },\n  { $push: { regions: { region: "APAC", share_pct: 12 } } }\n)',
    explain:'<strong>1 → Few (embed).</strong> <code>$push</code> appends a whole sub-document to the embedded array.',
    note:'Q3 regions: Americas 58, EMEA 30, APAC 12 — 100%.' },
  { group:'1 → Few · Regions', kind:'find', coll:'quarters', ops:['regions.region'], title:'Which quarters sold in APAC?',
    ask:'Find every quarter whose embedded <code>regions</code> include the region <code>"APAC"</code>.',
    answer:'db.quarters.find({ "regions.region": "APAC" })',
    explain:'<code>"regions.region"</code> looks inside every element of the array.',
    note:'FY27-Q1 and FY27-Q3.' },

  /* ---------- 1 → Many (small) ---------- */
  { group:'1 → Many (small) · Lists', kind:'update', coll:'quarters', method:'updateOne', ops:['$addToSet'], title:'Log a launch highlight',
    media: posterBanner('squalo-skyline.jpg', 'GTA VI artwork: a speedboat racing past the Vice City skyline', 'center 60%', '1 → Many (small) · lists that may grow'),
    story:'Short lists of plain values — highlights, platforms — stay embedded while they are small. If a list could grow without limit, reference it instead.',
    ask:'Add the highlight <code>"Biggest launch in Rockstar history"</code> to <code>"FY27-Q3"</code> — only if it is not already there.',
    answer:'db.quarters.updateOne(\n  { _id: "FY27-Q3" },\n  { $addToSet: { highlights: "Biggest launch in Rockstar history" } }\n)',
    explain:'<code>$addToSet</code> adds a value only when it is missing, so running it twice does not duplicate the highlight.',
    note:'Q3 now has two highlights.' },
  { group:'1 → Many (small) · Lists', kind:'find', coll:'games', title:'Games on PC',
    ask:'Find the games whose <code>platforms</code> include <code>"PC"</code>.',
    answer:'db.games.find({ platforms: "PC" })',
    explain:'For an array of plain values, <code>{ platforms: "PC" }</code> matches when any element equals <code>"PC"</code>.',
    note:'GTA V and Red Dead Redemption 2. GTA VI launched on consoles only.' },

  /* ---------- Referencing (1 → Many large) ---------- */
  { group:'Referencing · Sales', kind:'find', coll:'quarters', title:'See the sales references',
    media: posterBanner('grotti-cheetah.jpg', 'GTA VI artwork: a white Grotti Cheetah outside a Vice City hotel', 'center 65%', '1 → Many (large) · reference by _id'),
    story:'A quarter can have thousands of sales records, so they live in their own <code>sales</code> collection. Each quarter stores only their ids in <code>sale_ids</code>: <b>referencing</b>.',
    ask:'Find <code>"FY27-Q3"</code> in <code>quarters</code> and look at <code>sale_ids</code>.',
    answer:'db.quarters.find({ _id: "FY27-Q3" })',
    explain:'The quarter holds only the <code>_id</code>s. The sales details live in <code>sales</code>, so the quarter document stays small however many sales it has.',
    note:'<code>sale_ids: [ \'S301\', \'S302\', \'S303\', \'S304\' ]</code>.' },
  { group:'Referencing · Sales', kind:'find', coll:'sales', ops:['$in'], title:'Follow the references',
    ask:'Fetch the launch-quarter sales from <code>sales</code>: the documents whose <code>_id</code> is <code>$in</code> Q3’s <code>sale_ids</code>.',
    answer:'db.sales.find({ _id: { $in: ["S301", "S302", "S303", "S304"] } })',
    explain:'Resolving references is a second query. In one line: <code>db.sales.find({ _id: { $in: db.quarters.findOne({ _id: "FY27-Q3" }).sale_ids } })</code>.',
    note:'Four GTA VI sales records: Americas, EMEA and APAC.' },
  { group:'Referencing · Sales', kind:'find', coll:'quarters', title:'Which quarter owns this sale?',
    ask:'Go the other way: find the quarter whose <code>sale_ids</code> contain <code>"S202"</code> (the GTA VI pre-orders).',
    answer:'db.quarters.find({ sale_ids: "S202" })',
    explain:'An array of ids is queried like any array: it matches if the array contains the value.',
    note:'FY27-Q2 — pre-orders opened before launch.' },
  { group:'Referencing · Sales', kind:'update', coll:'sales', method:'insertOne', title:'Record a new sale',
    ask:'A late Xbox report arrives for Q3. Insert it into <code>sales</code>:',
    table:[['field','value'],['_id','S305'],['quarter_id','FY27-Q3'],['game_id','GTA6'],['edition_id','E1'],['platform','Xbox Series X|S'],['region','EMEA'],['units_k',3200],['revenue_musd',224]],
    answer:'db.sales.insertOne({\n  _id: "S305",\n  quarter_id: "FY27-Q3",\n  game_id: "GTA6",\n  edition_id: "E1",\n  platform: "Xbox Series X|S",\n  region: "EMEA",\n  units_k: 3200,\n  revenue_musd: 224\n})',
    diffHint:'Bold values are numbers (no quotes); the rest are strings.',
    explain:'Each sale is an independent document, so <code>sales</code> can grow without making any quarter document bigger. This sale also references its parent with <code>quarter_id</code>.',
    note:'Nine sales. But Q3’s <code>sale_ids</code> doesn’t list <code>S305</code> yet…' },
  { group:'Referencing · Sales', kind:'update', coll:'quarters', method:'updateOne', ops:[['$push','$addToSet']], title:'Link the new sale',
    ask:'Connect it: add <code>"S305"</code> to the <code>sale_ids</code> of <code>"FY27-Q3"</code>.',
    answer:'db.quarters.updateOne(\n  { _id: "FY27-Q3" },\n  { $push: { sale_ids: "S305" } }\n)',
    explain:'With referencing, saving related data takes two writes: the child document, then its id in the parent. <code>$addToSet</code> works too and avoids duplicates.',
    note:'Q3 references five sales.' },
  { group:'Referencing · Sales', kind:'find', coll:'sales', title:'Child → parent reference',
    ask:'Every sale also stores <code>game_id</code>, a reference to <code>games</code>. Find all sales of <code>"GTA6"</code>.',
    answer:'db.sales.find({ game_id: "GTA6" })',
    explain:'Here the reference points the other way: each child stores its parent’s id. For truly large 1 → Many data this is often the better choice, because no parent array keeps growing.',
    note:'Six GTA VI sales: one pre-order in Q2 and five in the launch quarter.' },

  /* ---------- Many ↔ Many ---------- */
  { group:'Many ↔ Many · Editions', kind:'find', coll:'retailers', title:'Who sells the Ultimate Edition?',
    media: `<figure class="banner duo"><img src="${GTA_IMG}standard-edition.jpg" alt="GTA VI Standard Edition cover art" loading="lazy"><img src="${GTA_IMG}ultimate-edition.jpg" alt="GTA VI Ultimate Edition cover art" loading="lazy"><figcaption>Many ↔ Many · editions and retailers</figcaption></figure>`,
    story:'Each edition is sold by many retailers, and each retailer sells many editions. <code>editions</code> lists <code>retailer_ids</code> and <code>retailers</code> lists <code>edition_ids</code>: <b>reference on both sides</b>.',
    ask:'Find the retailers that stock the Ultimate Edition (<code>_id: "E2"</code>), using the <code>edition_ids</code> array in <code>retailers</code>.',
    answer:'db.retailers.find({ edition_ids: "E2" })',
    explain:'Because both sides hold references, you can ask either way: retailers for an edition, or editions for a retailer.',
    note:'PlayStation Store and Xbox Store.' },
  { group:'Many ↔ Many · Editions', kind:'update', coll:'retailers', method:'updateOne', ops:['$addToSet'], title:'Link both ways (1/2)',
    ask:'GameStop (<code>"R4"</code>) now stocks the Ultimate Edition. First add <code>"E2"</code> to GameStop’s <code>edition_ids</code> — without duplicates.',
    answer:'db.retailers.updateOne(\n  { _id: "R4" },\n  { $addToSet: { edition_ids: "E2" } }\n)',
    explain:'Two-way references are kept in sync by you: one side now, the other next.',
    note:'GameStop: <code>edition_ids: [ \'E1\', \'E2\' ]</code>. Now the other side.' },
  { group:'Many ↔ Many · Editions', kind:'update', coll:'editions', method:'updateOne', ops:['$addToSet'], title:'Link both ways (2/2)',
    ask:'Now add <code>"R4"</code> to the Ultimate Edition’s (<code>"E2"</code>) <code>retailer_ids</code>.',
    answer:'db.editions.updateOne(\n  { _id: "E2" },\n  { $addToSet: { retailer_ids: "R4" } }\n)',
    explain:'Update only one side and the two collections disagree. Many ↔ Many references always need both writes.',
    note:'Ultimate Edition: <code>retailer_ids: [ \'R1\', \'R2\', \'R4\' ]</code> — both sides agree.' },

  /* ---------- Joining ($lookup) ---------- */
  { group:'Joining ($lookup) · Report', kind:'agg', coll:'quarters', ops:['$lookup'], title:'The launch-quarter report',
    media: posterBanner('vice-city-style.jpg', 'GTA VI artwork: Jason and Lucia relaxing by a Vice City pool', 'center 40%', 'Joining · build the quarterly report'),
    story:'Time to assemble the report. <code>$lookup</code> pulls referenced documents into one <code>aggregate</code> result — MongoDB’s LEFT OUTER JOIN.',
    ask:'For <code>"FY27-Q3"</code> only: <code>$match</code> the quarter, then <code>$lookup</code> from <code>sales</code> with <code>localField: "sale_ids"</code>, <code>foreignField: "_id"</code>, <code>as: "sales"</code>.',
    answer:'db.quarters.aggregate([\n  { $match: { _id: "FY27-Q3" } },\n  { $lookup: {\n      from: "sales",\n      localField: "sale_ids",\n      foreignField: "_id",\n      as: "sales"\n  } }\n])',
    explain:'One document comes back: the quarter with its embedded summary, regions and highlights, plus the five referenced sales joined in as <code>sales</code>. The stored data does not change.',
    note:'Q3 with S301–S305 attached: embedded and referenced data in one result.' },
  { group:'Joining ($lookup) · Report', kind:'agg', coll:'editions', ops:['$lookup'], title:'Where each edition is sold',
    ask:'For <strong>every</strong> edition, join its retailers: <code>$lookup</code> from <code>retailers</code>, <code>localField: "retailer_ids"</code>, <code>foreignField: "_id"</code>, <code>as: "stores"</code>.',
    answer:'db.editions.aggregate([\n  { $lookup: {\n      from: "retailers",\n      localField: "retailer_ids",\n      foreignField: "_id",\n      as: "stores"\n  } }\n])',
    explain:'With no <code>$match</code> the join runs for every edition. Thanks to the two-way link you added, the Ultimate Edition now shows GameStop too.',
    note:'Standard: 4 stores. Ultimate: PlayStation Store, Xbox Store and GameStop.' },
  { group:'Joining ($lookup) · Report', kind:'agg', coll:'sales', ops:['$match','$lookup'], title:'Capstone: sales with their edition',
    ask:'Last one, everything together: from <code>sales</code>, <code>$match</code> the <code>"FY27-Q3"</code> sales by <code>quarter_id</code>, then <code>$lookup</code> from <code>editions</code> with <code>localField: "edition_id"</code>, <code>foreignField: "_id"</code>, <code>as: "edition"</code>.',
    answer:'db.sales.aggregate([\n  { $match: { quarter_id: "FY27-Q3" } },\n  { $lookup: {\n      from: "editions",\n      localField: "edition_id",\n      foreignField: "_id",\n      as: "edition"\n  } }\n])',
    explain:'This time the reference is a single id, not an array. <code>$lookup</code> still returns an array, here with one edition document in it. The child → parent reference (<code>quarter_id</code>) does the filtering and the edition reference does the join.',
    note:'Five launch-quarter sales, each with its Standard or Ultimate Edition attached. Report complete!' }
];

(window.CHAPTERS = window.CHAPTERS || []).push({
  id: 'as03', num: '03', badge: 'A3', kind: 'Assignment',
  title: 'Assignment · Quarterly Analysis', href: 'index.html', story: 'GTA VI — Vice City launch quarter',
  key: 'gta6-quarterly-as03-v1',
  host: 'Atlas atlas-vc6q3r-shard-0 [primary]',
  cluster: 'vicecity.vc6q3r.mongodb.net',
  db: 'ViceCityQuarterly',
  coll: 'games',
  startNote: 'ViceCityQuarterly loaded — 5 collections',
  dataset: {
    db: 'ViceCityQuarterly', collections: GTA,
    note: 'Five collections: games and quarters show embedding; quarters → sales and sales → games show referencing by _id; editions ↔ retailers is a two-way Many ↔ Many link. Sales figures are invented for practice. The questions change the data as they go, so reload it to start again.'
  },
  init(){
    const colls = {};
    Object.keys(GTA).forEach(c=>{ colls[c] = { capped:false, docs: GTA[c].map(d=>prepDoc(d)) }; });
    return { cur:'ViceCityQuarterly', dbs:{ ViceCityQuarterly:{ colls } } };
  },
  tasks: AS03_TASKS,
  finish: {
    media: `<figure class="cover fin-cover"><img class="c-main" src="${GTA_IMG}vi-sunset.jpg" alt="GTA VI wallpaper: sports car before the VI letters at sunset"><div class="c-side one"><img src="${GTA_IMG}vice-city.jpg" alt="Neon Vice City street at sunset"></div></figure>`,
    tag: 'Assignment 03 complete', title: 'Quarterly report delivered',
    text: `You worked through all ${AS03_TASKS.length} tasks of the GTA VI quarterly analysis.`,
    note: 'Embedded: setting, summary, regions, highlights, platforms. Referenced: quarters → sales, sales → games and editions, editions ↔ retailers — joined with $lookup.'
  }
});
