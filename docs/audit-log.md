# Recovery Audit Log

Running record of what has been recovered from the supplied ZIP/file drops, what
was verified, and what is still outstanding. Entries are append-only by date —
do not rewrite prior entries, only correct them forward with a new dated note.

## How to read this log

- **DONE** — verified complete and usable as-is.
- **PARTIAL** — some of it is usable, some is missing or placeholder.
- **NEEDS FIX** — present but has a defect that should be fixed before sale/use.
- **DRAFT** — present but not launch-ready (placeholders, unfinished copy).
- Hashes below are `sha256sum`, first 16 hex chars, for quick dedup checks —
  full hashes are reproducible from the files themselves.

---

## 2026-08-29 — Baseline (prior session)

This section summarizes the state as of the last audit, carried forward as
context. It was not re-verified from source files in that session (the ZIPs
weren't attached there) — see 2026-09-02 below for direct verification.

- Shared Drive root confirmed accessible: `McGowan HQ Master Dashboard`,
  Digital Product Flywheel Blueprint, Master Project Bible, Amazon KDP Guide,
  Micro Vlogging App, Personal Business, Social Media Items, Exported Assets,
  and the numbered `00 — McGowan Digital Business Command Center` hierarchy.
- `McGowan HQ Master Dashboard` (Drive copy): 6 tabs — HQ Dashboard, Portfolio
  Priorities, 90-Day Roadmap, Launch Checklist, KPI Dashboard, Tool Stack
  Links. Digital Product Studio is priority 4; its launch checklist is the
  active execution surface.
- `90 Day Launch Tracker.xlsx`: valid workbook, 2 sheets (Launch Checklist:
  23 blank task rows; KPI Dashboard: 11 blank weekly metrics). Formatting
  only — no completed statuses, formulas, checkboxes, tables, charts, or
  validation. A blank starter template, not evidence of progress.
- Ten supplied ZIPs passed integrity checks at that time: main cover package,
  Part 2, general artifacts, numbered parts 1 and 3–7, and the consolidated
  `(1)` wrapper. Parts 2 and 8–10 had not been supplied under those names yet.
- `christian_family_command_center.xlsx`: 6 sheets (Dashboard, Meal Planning,
  Budget & Giving, Family Schedule, Prayer & Scripture, Habit Tracker), with
  working formulas on the Budget & Giving sheet.
- Storefront cover 1122×1402; five Pinterest pins, 1024×1536 vertical PNGs
  — 5 of a 10-pin launch target.
- Unbranded `Prayer_Weekly_Planner.pdf`: unencrypted 6-page US Letter PDF.
  Branded version: unencrypted 7-page US Letter PDF (weekly, ink-saver,
  prayer-journal, Scripture-memory, gratitude/reflection, companion-access
  pages). Several right-column headings use near-white text on cream
  background — flagged for accessibility fix before sale.
- Branded planner pages 1 and 7 printed raw `<link href=...>` markup instead
  of a clean instruction; headings also had very wide letter-spacing.
- Five-email welcome sequence present as a usable draft, but freebie/product
  links were placeholders and the referenced "Weekly Family Reset Checklist"
  lead magnet was not found in the package.
- Social Command Center HTML: front-end shell only — live account data would
  require real APIs/OAuth, not inferable from static files (confirmed again
  below).
- Drive Launch Checklist updated with evidence-based states only: Product #1
  `DONE`; Pinterest `PARTIAL` (5/10 assets, account unverified); Product #2
  `NEEDS FIX` (raw-link issue); welcome sequence `DRAFT` (placeholder links).

---

## 2026-09-02 — New batch: direct verification + two new product lines

All files below were attached directly to this session and verified here
(integrity check, extraction, hashing, structural diff) — not inferred from
prior notes. Where this contradicts or refines an earlier claim, that is
called out explicitly.

### Files processed this session

| Upload | Contents | Integrity |
|---|---|---|
| `Christian_Family_Command_Center_1_of_10.zip` | `prayer-planner-link-hub.html` | OK |
| `Christian_Family_Command_Center_Part_2.zip` | `social-command-center.html` | OK |
| `Christian_Family_Command_Center_3_of_10.zip` | workbook, HQ dashboard, both planner PDFs, readme, posting checklist, 4 extensionless planning docs | OK |
| `Christian_Family_Command_Center_4_of_10.zip` | Pinterest pin (cozy/warm tones) | OK |
| `Christian_Family_Command_Center_5_of_10.zip` | Pinterest pin (sage/rose flat lay) | OK |
| `Christian_Family_Command_Center_6_of_10.zip` | Pinterest pin (minimalist gold-framed) | OK |
| `Christian_Family_Command_Center_7_of_10.zip` | Pinterest pin (mom writing, warm kitchen) | OK |
| `Christian_Family_Command_Center_artifacts.zip` | Pinterest pin (botanical flat lay) | OK |
| `Christian_Family_Command_Center_1.zip` (consolidated wrapper) | 3 nested packages (business / prayer / video) | OK |
| `Christian_Gumroad_Assets_Manifest.txt` | delivery notice (see below — superseded) | n/a |
| `Christian_Gumroad_Digital_Assets_Pack.txt` | delivery notice (see below — superseded) | n/a |
| `Christian_Ministry_Assets.zip` | 40-product Gumroad catalog + graphics | OK |

Parts 2 and 8–10 were previously unsupplied by name — **Part 2 and Part 1
(the consolidated wrapper) are now both supplied and verified.** Parts 8–10
remain outstanding.

### Confirmed / re-confirmed

- **`social-command-center.html`** (Part 2): read in full. Confirms the prior
  finding exactly — it is a static concept demo (the footer text says so
  literally: *"Concept demo: a unified dashboard for creators..."*). No
  `fetch`/API calls, no OAuth, no secrets. The only external reference is a
  Fontshare Google-Fonts-style CSS preconnect. The only script is a client-side
  nav-highlight and light/dark theme toggle. Live account data genuinely
  cannot be inferred from this file.
- **`prayer-planner-link-hub.html`** (Part 1): read in full. It is exactly
  what it claims to be — a static page with one relative link
  (`christian_family_command_center.xlsx`) that only resolves if the HTML and
  workbook are kept in the same folder. No scripts, no secrets, nothing to fix.
- **All 5 Pinterest pins** (from parts 4, 5, 6, 7, and `artifacts`, plus the
  copies bundled inside the consolidated wrapper's business package as
  `pin-1`…`pin-5`) are confirmed **byte-identical** across every location they
  appear — same 5 designs, 1024×1536 RGB PNG, no alpha channel. This is still
  5 of the 10-pin launch target, not more.
- Storefront cover (`cover-main-product.png`, inside the consolidated
  wrapper's business package) confirmed 1122×1402, matching the prior note.
- Branded `Prayer_Weekly_Planner_Branded.pdf` is byte-identical between the
  standalone Part 3 copy and the consolidated wrapper's prayer package — same
  version everywhere, so the raw-`<link>`-markup defect on pages 1 and 7
  (noted previously) is present in **every** copy currently in hand, not just
  one draft. Still needs regeneration before sale.
- `POSTING_CHECKLIST.md` is byte-identical between Part 3 and the consolidated
  wrapper's video package — same file, not a newer draft.

### New product content recovered

- **Spare Chair video/social kit** — previously only the checklist was in
  hand ("does not recover the MP4, thumbnail, captions... still must be
  downloaded from the original chat"). This batch adds three more files from
  the same kit, now in `products/spare-chair-video-kit/`:
  - `The-Spare-Chair-60-90-Second-Script.txt` — the actual video script.
  - `The-Spare-Chair-Final-Video-Publishing-Kit.pdf`
  - `The-Spare-Chair-Production-and-Review-Tracker.pdf`
  The MP4, thumbnail, and captions are still not present — only the planning
  and script documents were recoverable.
- **Full-length planning docs recovered** (see "Correction" below for why
  these are now split from the consolidated wrapper's `.md` versions):
  `docs/planning/handover-package.md`, `welcome-email-sequence.md`,
  `mcgowan-execution-plan.md`, `prayer-planner-product.md`.

### New product line: Christian Ministry Assets (40 products, Gumroad)

`Christian_Ministry_Assets.zip` is a **separate catalog from the Command
Center / Prayer Planner line**, not more of the same product. It contains
two independently-zipped packs:

- **Pack 1 — `gumroad_christian_assets/` (20 products)**: 14 PDFs (devotional
  journal, coloring pages, affirmation cards, prayer journal, goal-setting
  workbook, habit tracker, Bible study notes, gratitude journal, sermon notes,
  prayer tracker, 21-day prayer challenge, memory cards, meal blessing cards,
  budget planner, vision board kit, journaling-prompts ebook, kids'
  coloring/activity book) plus 3 PNG bundles (6 wallpapers, 8 wall-art
  designs, 10 quote-graphic squares — 24 images total). Includes a
  `README_Product_Catalog.md` with suggested pricing per item ($3–$14) and
  bundle suggestions.
- **Pack 2 — `Christian_More_Assets_Pack/` (20 products)**: 20 more PDFs
  (church welcome packet, small-group guide, Bible verse maze book, marriage
  prayer journal, mother-daughter devotional, father-son faith journal,
  self-care planner, handwriting practice, wedding devotional, volunteer
  toolkit, Advent countdown, Lent guide, recipe blessing book, identity
  affirmation deck, Bible character study, homeschool morning-time pack,
  anxiety relief journal, social caption pack, prayer board printables,
  color-coding guide), plus 2 cover PNGs.

All 37 PDFs pass a file-type validity check (recognized as well-formed PDF,
not corrupted/truncated). Page-count/content extraction could not be run in
this session (no working PDF text library available in the environment) —
that is a gap to close in a future pass, not a finding that content is bad.

**This directly supersedes the two delivery-notice `.txt` files** submitted
alongside it (`Christian_Gumroad_Assets_Manifest.txt` and
`Christian_Gumroad_Digital_Assets_Pack.txt`), which both claimed the
Gumroad-pack ZIPs were *"not available as a recoverable binary attachment in
this session."* That claim is now out of date: both archives were present
inside `Christian_Ministry_Assets.zip` and were extracted and verified
successfully. Treat those two `.txt` files as stale status notes, not current
fact.

The loose top-level `Wallpaper N.png` / `Wall Art N.png` / `Quote N.png`
files included alongside the two pack ZIPs are byte-identical to the copies
already inside Pack 1 — not additional designs, just duplicates at the top
of the archive. Not re-copied into the repo separately.

### Correction: planning docs are not exact duplicates

Earlier notes treated the standalone "Perplexity Artifacts" planning docs as
exact duplicates of files already preserved. With both sources in hand this
session, that needs a correction for **one specific pairing**: the
extensionless files in Part 3 (`handover-package`, `welcome-email-sequence`,
`prayer-planner-product`) are **not byte-identical** to the similarly-named
`.md` files bundled inside the consolidated wrapper's business package
(`planning_docs/handover-package.md`, etc.) — they differ in length and are
not simply a reformat:

| Doc | Part 3 (extensionless) | Consolidated wrapper `.md` |
|---|---|---|
| handover-package | 68 lines — full detail incl. numbered "100% done" list, per-item breakdown | 27 lines — condensed summary |
| welcome-email-sequence | 145 lines — full 5-email sequence with subject lines and body copy | 23 lines — setup instructions only, email bodies not included |
| prayer-planner-product | 91 lines — full storefront description, short + long copy, feature list | 26 lines — short product description only |

The Part 3 versions are the complete documents; the consolidated wrapper's
`.md` versions are trimmed excerpts. **The repo now keeps the full-length
Part 3 versions** (`docs/planning/*.md`) as canonical — use those, not a copy
from the consolidated wrapper, if you need the full email copy or full
product description.

(`POSTING_CHECKLIST.md` and `Prayer_Weekly_Planner_ReadMe.md`, checked the
same way, *are* byte-identical between the two locations — the correction
above is specific to the three docs listed.)

### Correction: the two workbook copies inside the consolidated wrapper are not current

Direct structural diff (via the underlying OOXML, not just a hash compare)
between Part 3's copies and the consolidated wrapper's
`business/spreadsheets/` copies found real content differences, not just
metadata:

- **`christian_family_command_center.xlsx`**: only a cosmetic difference —
  the consolidated wrapper's Meal Planning and Budget & Giving tabs use
  shortened header labels ("Auto Grocery List" vs. "Auto Grocery List (type
  items below, check off as bought)"; "Type" vs. "Type (Tithe/Offering/
  Other)") and a slightly shorter header row. Formulas, tab structure, and
  all other content are identical. Either copy is fine to sell; **the repo
  keeps the Part 3 copy** (fuller label text) as canonical.
- **`McGowan_HQ_Master_Dashboard.xlsx`**: a real, non-cosmetic difference.
  Part 3's copy has substantially more content than the consolidated
  wrapper's copy on every tab that differs — Portfolio Priorities (13 rows
  vs. 8), 90-Day Roadmap (7 vs. 5), Launch Checklist (26 vs. 22), and Tool
  Stack Links (17 hyperlinks vs. 7). **The consolidated wrapper's copy is an
  older, thinner draft.** The repo keeps the Part 3 copy as canonical —
  do not use the consolidated wrapper's copy of this file going forward.

### Not yet re-verified against source this session

- The 2026-08-29 findings on the Drive-hosted files (Master Dashboard tabs,
  `90 Day Launch Tracker.xlsx`, KDP Guide, Micro Vlogging App, etc.) were not
  re-checked here — no Drive access or those specific files in this session.
  Carried forward as prior-session context only.
- Marketing-image duplicate checks noted previously (`Mom Writing in
  Planner(1).png` etc. being pixel-identical to catalogued Pinterest pins)
  were not re-run in this session — those specific `(1)`-suffixed files were
  not part of this batch.

---

## Open items / still outstanding

- Parts 8, 9, 10 of the numbered ZIP set have never been supplied.
- Pinterest launch inventory: 5 of 10 target designs.
- Branded Prayer Planner PDF: raw `<link>` markup on pages 1 and 7 still
  needs to be fixed in every copy currently held.
- Prayer Planner (unbranded + branded): near-white section headings on cream
  background still need darkening for accessibility.
- Welcome email sequence: freebie/product links are still placeholders; the
  "Weekly Family Reset Checklist" lead magnet referenced by email 1 has never
  turned up in any recovered package.
- Christian Ministry Assets (40 products): PDF page counts/content not yet
  spot-checked (tooling gap in this session, not a content problem).
- Social Command Center HTML and the branded planner's companion-access page
  both assume live account/API wiring that does not exist yet — still a
  concept shell, not a working integration.
