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

## 2026-09-02 (cont'd) — Both Prayer Planner PDFs repaired in place

Both defects flagged as outstanding above were root-caused and fixed
directly in the PDFs now held in `products/prayer-weekly-planner/`, using
PyMuPDF to patch the page content streams. Verified by re-rendering every
affected page to PNG before and after and comparing visually (not just by
re-running the same text/color scan that found the bug).

**Raw `<link href=...>` markup (branded PDF, pages 1 and 7)** — the PDF
generator had printed the literal HTML anchor tag as visible text instead of
rendering it. Fixed by covering the old text with the same white card
background and inserting a clean instruction in its place:
- Page 1: `Open the Link Hub: prayer-planner-link-hub.html`
- Page 7: `Open the Companion Link Hub: prayer-planner-link-hub.html`

Both replacements are also now real clickable link annotations pointing at
the relative file `prayer-planner-link-hub.html`, so "clickable instruction"
is literal, not just visual, in viewers that support relative-file link
annotations.

**"Near-white section headings" — root cause found: not a font-color
choice, a draw-order bug.** Every affected heading is white bold text on a
colored banner rectangle exactly as designed — but a later drawing command
in the same page (a plain background-color rectangle for the content panel
below it) was painted on top of three of those banners, erasing the colored
banner background and leaving genuinely white text on a white/cream panel —
invisible, not just low-contrast. This is present in **both** files, not
just the branded one:

- `Prayer_Weekly_Planner_Branded.pdf`, pages 2 and 3 (full weekly + ink-saver
  layouts): "Prayer Requests", "Gratitude", "Meal Snapshot" headers.
- `Prayer_Weekly_Planner.pdf` (unbranded), pages 2 and 3: "Top 3 Priorities",
  "Gratitude Log", "Meal Plan Snapshot" headers. ("Prayer Requests This
  Week" and the two left-column headers on these pages were never affected —
  they sit above where the erasing rectangle starts.)

Fixed by redrawing each banner rectangle in its original color *after* the
erasing rectangle (so it now paints on top, as originally intended) and
reinserting the white header label at its original position, font, and
size. Nothing else on any page was touched — same layout, same content,
same everywhere-else colors.

A file-level scan for "white text sitting on a light-colored rectangle
that was drawn after it" across every page of both PDFs found no further
instances after these fixes.

**Not reproduced this session:** the "very wide letter-spacing on headings"
defect noted in the 2026-08-29 baseline. The copies in hand from Part 3 use
no character-spacing (`Tc`) operator anywhere and render with normal
spacing in every page rendered above — either that was already corrected
upstream before this copy was produced, or it was specific to a different
draft not in this batch. Flag it again if it turns up in a future copy.

**Follow-up correction to the fix itself:** the first pass covered the old
text with an opaque rectangle rather than removing it, which left the
original raw markup and (for the banner fix) a second copy of each label
sitting underneath, invisible on screen but still present in the file's
text layer — extractable by copy-paste or a screen reader, and a red flag
in any future audit that re-scans "does this file still contain markup."
Rebuilt both files using true redaction (`add_redact_annot` +
`apply_redactions`, which deletes the underlying content instead of
painting over it) before re-inserting the replacement text. Re-verified:
`<link` no longer appears anywhere in either file's extracted text, and
each of the six repaired headers (`Prayer Requests`, `Gratitude`, `Meal
Snapshot`, `Top 3 Priorities`, `Gratitude Log`, `Meal Plan Snapshot`) now
appears exactly once per page, not twice. Visual output is pixel-identical
to the already-verified renders above.

## 2026-09-02 (cont'd) — Fixed the Identity Affirmation Deck's duplicate-text bug

The 20 "cards" in `14_Identity_Affirmation_Deck.pdf` (Pack 2, item 14) all
repeated the same single line — flagged above as a content bug, not just
thinness. Wrote 20 distinct identity-in-Christ affirmations (same length
and tone as the original: "I am ___, because ___" statements grounded in
common discipleship themes — chosen, forgiven, secure, gifted, at peace,
kept, growing, called, etc.) and replaced each card's body text using the
same redaction approach as above, so no duplicate/stale text remains
underneath. Verified: 20 unique bodies across 20 cards (was 1), title page
and instructions untouched, same fonts/colors/layout as the original.

## 2026-09-02 (cont'd) — Generated real mazes for the Bible Verse Maze Book

`03_Bible_Verse_Maze_Book.pdf` (Pack 2, item 3) had 10 "puzzle" pages that
were each just an empty bordered box and a blank "Verse: ____" line — no
maze, flagged above. Fixed both problems:

- **Filled in the verse reference** on each of the 10 pages (John 3:16,
  Psalm 23:1, Philippians 4:13, Joshua 1:9, Proverbs 3:5, Psalm 118:24,
  1 John 4:19, Matthew 5:16, Psalm 46:1, Galatians 5:22 — short, commonly
  memorized verses fitting a kids' activity book) using the same redaction
  approach as the other fixes.
- **Generated an actual maze on each page**: an 11x9 grid, one distinct
  maze per puzzle via randomized depth-first spanning-tree generation (a
  different seed per page), rendered as vector line art in the existing
  box, with a marked START and FINISH. A spanning-tree maze has exactly one
  path between any two cells by construction, so solvability isn't just
  visual — verified programmatically with a BFS solve from start to finish
  for all 10 generated mazes before shipping (all 10 pass).

Same font/heading/layout as the original page — only the previously-empty
content area changed.

## 2026-09-02 (cont'd) — Wrote real content for Pack 2's 13 stub products

The remaining defect from the Pack 2 audit: 13 of 20 items were a 2-page
title/blurb stub with nothing underneath (listed by name in the finding
above). Wrote genuine, complete content for all 13, keeping each product's
original title, tagline, and one-line brief exactly as recovered — the
brief already named the sections each product needed, so nothing here
invents a new product, it fills in the one that was already outlined:

| # | Product | Was | Now |
|---|---|---|---|
| 05 | Mother-Daughter Devotional | 2p stub | 7p — 5 devotions (verse, reflection, talk-it-through questions for mom + daughter separately, prayer) |
| 06 | Father-Son Faith Journal | 2p stub | 6p — 4 themed journaling sessions (identity, courage, obedience, integrity) with verse + guided writing space |
| 07 | Christian Self-Care Planner | 2p stub | 4p — intro, a real weekly tracker table (7 categories x 7 days of checkboxes), reflection prompts |
| 09 | Wedding Planning Devotional | 2p stub | 7p — 5 premarital devotions (prayer, unity, service, money, covenant) |
| 10 | Volunteer Coordinator Toolkit | 2p stub | 6p — team roster, attendance tracker, rotation planner, and communication log, each a real fillable table |
| 12 | Lent Prayer and Reflection Guide | 2p stub | 8p — one theme per week for 5 weeks plus Holy Week, each with a passage, reflection, and prayer space |
| 13 | Recipe Blessing Book | 2p stub | 5p — 5 table blessings for different occasions, plus 2 fillable recipe template pages with a gratitude line |
| 15 | Bible Character Study Workbook | 2p stub | 8p — a study page each for Esther, Ruth, David, Paul, Mary, Joseph (context + two guided questions with writing space) |
| 16 | Homeschool Morning Time Pack | 2p stub | 4p — the 6-part daily routine as a real checklist, plus a fillable weekly plan table |
| 17 | Anxiety Relief Journal | 2p stub | 5p — 5 anxiety-specific promise verses, plus 2 repeatable thought-record worksheets (thought → promise → prayer → next step) |
| 18 | Christian Social Caption Pack | 2p stub | 6p — a formula plus 2 real example captions for each of 4 post types (devotional, encouragement, reels, quote graphics) |
| 19 | Prayer Board Printables | 2p stub | 8p — one card per category (family, healing, church, nations, goals, answered prayer) with checkbox+writable-line requests and an answered-prayer log |
| 20 | Bible Study Highlighter Key Guide | 2p stub | 3p — an actual color legend with colored swatches (not just text naming colors) and a real example verse per category |

Built with the same visual language the originals already used (cream
title page, white content pages, the same dark-brown/gold color pair,
Helvetica) via a small reusable page-template module, so the new pages
don't look bolted on. Every generated file was rendered and checked
page-by-page for content running past the page bottom before being
installed — none did.

**Caught and fixed during the build, not after:** the first version of the
checklist helper collapsed the row spacing to nothing for a blank (fill-in)
line, because wrapping an empty string produces zero lines of text and the
row-height math depended on line count. It only showed up on the one
product (Prayer Board Printables) that uses blank checklist rows — everything
else happened to always pass non-empty text into that helper, so the bug
was invisible until that specific page was rendered and inspected, not
caught by the earlier "does anything run off the page" scan. Fixed the
helper to always advance a full row even for blank text, and added an
actual writable line next to blank checkbox items (there wasn't one before
the fix either) — then rebuilt and re-verified all 13 files.

Items 02, 04, and 11 (Small Group Guide, Marriage Prayer Journal, Advent
Countdown) still repeat a bare "Session N" / "Day N" label with nothing
else per page — noted in the original finding as a lesser defect than the
13 above (they at least have real week-by-week/day-by-day structure). Not
addressed in this pass; still open below.

## 2026-09-02 (cont'd) — Illustrated Pack 1's Scripture Coloring Pages

`02_Scripture_Coloring_Pages/Color_and_Reflect_Scripture_Coloring_Pages.pdf`
(Pack 1, item 2) had the same problem as the maze book: 12 pages that were
each only a decorative gold frame and a Scripture reference, with nothing
to actually color, flagged above. Added two rose-curve flower mandalas per
page (a large one above the verse, a smaller one below), one page-to-page
distinct petal count each (varying the classic `r = R·cos(kθ)` rose-curve
parameter, k from 3 to 9, a different pair per page so no two pages match),
in a soft charcoal line-art color that reads clearly as "meant to be
colored in" against the existing gold frame. Verified by rendering every
page: no overlap with the title/reference text, consistent margins inside
the existing frame, all 12 pages distinct. The gold frame, verse, and
reference text are untouched.

## 2026-09-02 (cont'd) — Christian Ministry Assets: page counts checked, and Pack 2 is not what it claims to be

Tooling gap closed (PyMuPDF installs and works fine in this environment,
unlike pypdf/pdfplumber which hit a broken system `cryptography` binding).
Every PDF in both packs was opened, page-counted, and its extracted text
length measured; anything short or repetitive was opened and read/rendered
directly rather than trusted to the character count alone.

**Pack 1 (`pack-1-gumroad-20`) is genuinely complete, with one exception.**
Spot-checked the devotional journal, prayer journal, budget planner, and
vision board kit in full: real, substantive, page-by-page unique content
matching their descriptions (e.g. the devotional has 30 distinct daily
Scripture + reflection + journal-prompt entries, not a repeated template).
**Exception: `02_Scripture_Coloring_Pages`** — every page is a decorative
gold border and a Scripture reference in pale gray text, with **no coloring
illustration at all** (verified both by `page.get_images()`/`get_drawings()`
returning nothing but the border, and by rendering the page). It's sold as
a coloring book with nothing to color. Everything else in Pack 1 checks out.

**Pack 2 (`pack-2-more-assets-20`) is placeholder content, not 20 finished
products**, despite its own `README_Product_Catalog_2.md` and the
`Christian_Gumroad_Assets_Manifest.txt` delivery notice both describing it
as ready Gumroad products. Of the 20 items:

- **13 of 20** are just a 2-page title/blurb stub — a cover page plus one
  sentence naming the topic, with no actual worksheet, checklist, or
  template underneath (`Christian_Self_Care_Planner`,
  `Wedding_Planning_Devotional`, `Volunteer_Coordinator_Toolkit`,
  `Mother_Daughter_Devotional`, `Father_Son_Faith_Journal`,
  `Lent_Prayer_Guide`, `Recipe_Blessing_Book`,
  `Bible_Character_Study_Workbook`, `Homeschool_Morning_Time_Pack`,
  `Anxiety_Relief_Journal`, `Christian_Social_Caption_Pack`,
  `Prayer_Board_Printables`, `Bible_Study_Color_Coding_Guide`). Rendered
  `07_Christian_Self_Care_Planner.pdf` page 2 directly to confirm: a
  "Checklist" heading and one sentence listing seven words, no boxes, no
  fillable structure.
- **Several multi-page items repeat a bare label with no content per
  instance**, rather than 14/20/24 unique entries: `04_Marriage_Prayer_
  Journal` (16 pages, just "Session 1" … "Session 14" headers), `11_Advent_
  Scripture_Countdown` (25 pages, just "Day N / Scripture: ____" blanks),
  `02_Small_Group_Guide_Pack` (7 pages, just "Week 1" … "Week 5" headers).
- **`14_Identity_Affirmation_Deck` has an outright content bug**, not just
  thinness: all 20 "cards" contain the exact same line — *"I am chosen,
  secure, and called with purpose."* — verified by diffing extracted text
  across all 20 card pages (1 unique string, not 20).
- **`03_Bible_Verse_Maze_Book` has the same missing-illustration problem as
  Pack 1's coloring pages**: every "puzzle" page is an empty bordered
  rectangle with no maze inside it (confirmed by rendering — zero vector
  paths or images on the page beyond the border itself).
- The only Pack 2 items that hold up as genuinely usable, if brief: `01_
  Church_Welcome_Packet` (a real welcome letter + visitor card, 2 unique
  content pages) and `08_Bible_Verse_Handwriting_Practice` (3 distinct real
  verses for tracing).

**Bottom line:** don't list Pack 2 for sale as-is. It needs the same kind of
content pass Pack 1 already got — the packaging (covers, filenames, README)
is there, the actual product content mostly isn't yet.

## 2026-09-02 (cont'd) — Recreated the missing "Weekly Family Reset Checklist" lead magnet

This is the one gap in the funnel that couldn't be closed by recovery —
no recovered package, in this session or the prior one, contains a file by
this name. Rather than leave email 1 of the welcome sequence promising a
download that doesn't exist, built a one-page replacement from the brief
already implicit in the recovered copy:

- The lead magnet's own description (email 1): *"a simple tool to help you
  reset your home, your schedule, and your heart at the start of each
  week."*
- The specific 3-step ritual email 2 walks through (glance at the week
  ahead, pick a Scripture/prayer focus, write top 3 priorities) as the
  free, lighter version of what the $9 Prayer & Weekly Planner does in full
  (email 3's soft pitch) — so the free checklist naturally leads into the
  paid product instead of duplicating it.

Result: `products/weekly-family-reset-checklist/Weekly_Family_Reset_
Checklist.pdf` — one page, three sections (Home Reset / Schedule Reset /
Faith Reset, 4 checkbox items each) plus a short "want to go deeper" note
pointing at the Prayer & Weekly Planner, built to match the existing brand
palette exactly (`#224B3F` dark green, `#B58A3A` gold, `#FBF7EF` cream —
the same colors already used in the link hub and both planner PDFs).

Two things worth knowing about how this was built, in case it needs edits
later: it was hand-drawn with PyMuPDF rather than a template, so (a) an
em dash (`—`) rendered as a stray middle dot with the base Helvetica font
in this environment — caught before shipping by re-rendering and reading
the output, and replaced with a plain hyphen throughout — and (b) it was
run through the same "white text painted over" scan used to catch the bug
in the two existing planner PDFs, clean. No fabricated purchase links were
added — the "go deeper" note names the Prayer & Weekly Planner without
linking to a storefront URL that isn't known to exist yet.

This is new content, not recovered content — flagged here explicitly so
it's never mistaken for a file that was actually found in one of the ZIPs.

## Open items / still outstanding

- Parts 8, 9, 10 of the numbered ZIP set have never been supplied.
- Pinterest launch inventory: 5 of 10 target designs.
- Welcome email sequence: freebie/product links (`[Download it here →]`,
  `[Get the Prayer & Weekly Planner →]`, etc.) are still placeholders —
  the lead magnet itself now exists (see above) but still needs a real
  hosting/delivery link once a storefront/ConvertKit form is set up.
- **Christian Ministry Assets Pack 2**: items 02 (Small Group Guide Pack),
  04 (Marriage Prayer Journal), and 11 (Advent Scripture Countdown) still
  repeat a bare session/day label with no content per page — the one
  remaining defect from the original Pack 2 finding. Everything else in
  Pack 2 (the 13 stubs, the affirmation deck bug, the maze book) is fixed
  — see entries above.
- ~~Christian Ministry Assets Pack 1, item 2 (Scripture Coloring Pages):
  needs actual coloring-page illustrations~~ — fixed, see above.
- Social Command Center HTML and the branded planner's companion-access page
  both assume live account/API wiring that does not exist yet — still a
  concept shell, not a working integration.
