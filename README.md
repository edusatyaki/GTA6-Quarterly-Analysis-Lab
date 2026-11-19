# GTA VI Quarterly Analysis · MongoDB Lab

An assignment on MongoDB **embedding and referencing**. It runs in a browser simulator of the MongoDB Atlas shell (mongosh). Read each question, type the command at the prompt, and the lab checks what your command actually did. Stuck? **Show answer** reveals the command and its explanation.

**Live:** https://edusatyaki.github.io/GTA6-Quarterly-Analysis-Lab/

It is the practice assignment for Chapter 03 (Embedding & Referencing) of the [MongoDB Atlas Shell Lab](https://edusatyaki.github.io/MongoDB-Atlas-Shell-Lab/chapter03.html).

## The brief

You are the data analyst for the Grand Theft Auto VI launch (19 Nov 2026). The `ViceCityQuarterly` database has five collections:

| Collection | Holds | Shows |
|---|---|---|
| `games` | GTA VI, GTA V, RDR2 with embedded `setting`, `protagonists`, `platforms` | embedding: 1 → 1, 1 → Few, small 1 → Many |
| `quarters` | FY27 Q1–Q4 with embedded `summary`, `regions`, `highlights` and a `sale_ids` reference list | embedding and parent → child references |
| `sales` | one document per sales record, with `quarter_id`, `game_id`, `edition_id` | large 1 → Many, child → parent references |
| `editions` | Standard and Ultimate Edition, with `retailer_ids` | Many ↔ Many |
| `retailers` | PlayStation Store, Xbox Store, Amazon, GameStop, with `edition_ids` | Many ↔ Many |

Sales and bookings figures are invented for practice. They are not Take-Two or Rockstar results.

## 22 questions

- **Embedding:** dot notation on embedded documents and arrays (`"setting.city"`, `"protagonists.name"`)
- **1 → 1 · Quarter summary:** embed with `$set`, filter with `$gt`, update one embedded field
- **1 → Few · Regions:** `$push` a sub-document, query `"regions.region"`
- **1 → Many (small) · Lists:** `$addToSet`, array-contains queries
- **Referencing · Sales:** `sale_ids`, `$in`, reverse lookups, insert and link a new sale, child → parent `game_id`
- **Many ↔ Many · Editions:** query either side, keep both sides in sync
- **Joining ($lookup) · Report:** the launch-quarter report, editions with their stores, and a `$match` + `$lookup` capstone

The **{ } Dataset code** button gives a ready-to-paste mongosh script that loads the same data into MongoDB Atlas, a local `mongosh` or Compass.

## Run locally

No build step. Serve the folder and open it:

```bash
python3 -m http.server 8136
```

## Files

- `index.html` — the assignment page
- `as03.js` — dataset and questions
- `engine.js` — the mini mongosh engine
- `lab.js`, `lab.css` — the question / shell / data interface
- `img/gta6/` — posters and artwork

## Artwork

GTA VI artwork © Rockstar Games (rockstargames.com/VI). Fan wallpapers via Pinterest. Used for classroom teaching only.

---

Innovation in Education — Satyaki Das
