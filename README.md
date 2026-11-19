# GTA VI Quarterly Analysis · MongoDB Lab

An assignment on MongoDB **embedding and referencing**. It runs in a browser simulator of the MongoDB Atlas shell (mongosh). Read each question, type the command at the prompt, and the lab checks what your command actually did. Stuck? **Show answer** reveals the command and its explanation.

**Live:** https://edusatyaki.github.io/GTA6-Quarterly-Analysis-Lab/

The site is themed after GTA VI. It opens on a loading screen with a slideshow of GTA VI artwork, a "grand theft auto VI" title, rotating MongoDB tips and an **Enter · Start the analysis** button. Every one of the 22 questions has its own GTA VI artwork, and the page background crossfades to that question's art.

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

## 10 levels, 22 tasks, 50 checkpoint questions

The tasks are split into 10 levels. Finish a level's tasks in the shell, then pass its **5-question checkpoint** (multiple choice) with **4/5 or better** to unlock the next level. Locked levels can't be opened from the outline or by link. A failed checkpoint shows **Mission Failed** with the correct answer and an explanation for each miss, then lets you retry with the options shuffled. A pass shows **Mission Passed** with stars and Respect, then the next level unlocks.

| Level | Title | Tasks | Concepts |
|---|---|---|---|
| 1 | Welcome to Leonida | 1–3 | embedding, dot notation on embedded documents and arrays |
| 2 | Bottom Line | 4–6 | 1 → 1: embed with `$set`, filter with `$gt`, update one embedded field |
| 3 | Regional Split | 7–8 | 1 → Few: `$push` a sub-document, query `"regions.region"` |
| 4 | Highlight Reel | 9–10 | small 1 → Many: `$addToSet`, array-contains queries |
| 5 | Follow the Money | 11–12 | referencing by `_id`, `$in` |
| 6 | Paper Trail | 13–14 | reverse lookups, inserting a referenced sale |
| 7 | Closing the Books | 15–16 | linking the reference, child → parent `game_id` |
| 8 | Shelf Space | 17–19 | Many ↔ Many editions ↔ retailers, both sides in sync |
| 9 | The Big Report | 20–21 | `$match` + `$lookup` joins |
| 10 | Final Score | 22 | capstone: everything together |

Between levels: a sunset wipe transition, a cinematic level intro (letterbox bars, the level number, the mission list), and a **Levels** map in the top bar showing every level's status. Progress is saved in the browser.

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
- `gta.css`, `gta.js` — the GTA VI theme: Vice City neon colours, the loading screen and the per-question backdrop
- `levels.js`, `levels.css` — the 10 levels, 50 checkpoint questions, level locks, intros, Mission Passed / Failed screens and the level map
- `img/gta6/` — posters and artwork (29 images)

## Artwork

GTA VI artwork © Rockstar Games (rockstargames.com/VI). Fan wallpapers via Pinterest. Used for classroom teaching only.

---

Innovation in Education — Satyaki Das
