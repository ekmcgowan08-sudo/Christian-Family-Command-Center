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

## 2026-09-02 (cont'd) — Fixed the last Pack 2 gap: items 02, 04, 11

The one remaining defect from the original Pack 2 finding: items 02, 04,
and 11 had real week-by-week/day-by-day structure but each page repeated
a bare "Session N" / "Day N" label with nothing else. Filled all three in,
keeping exact page counts (so nothing about the product's page range or
"14 sessions" / "24 days" framing changed, only what's on each page):

- **02 Small Group Guide Pack** (7p, unchanged): the intro promised
  "opening prayer, icebreaker, Scripture reading, discussion, and closing
  prayer" per guide — each of the 5 weeks now has all five, built around a
  belonging → honesty → serving → forgiveness → sent-out arc.
- **04 Marriage Prayer Journal** (16p, unchanged): 14 sessions, each with
  a distinct verse cycling through the intro's four themes (unity,
  communication, forgiveness, shared purpose), a discussion question, and
  separate his-answer / her-answer / our-prayer writing space.
- **11 Advent Scripture Countdown** (25p, unchanged): all 24 "Day N: 
  Scripture ____" blanks filled with 24 distinct, real references telling
  the Christmas story in order (Genesis 3:15's first promise through
  John 1:14's "the Word became flesh"), plus a daily reflection line.

Verified: all pages in all three files are textually unique (was: every
page in a file identical apart from the number), no page count changed
from the original, no content runs past the page bottom.

**Caught during the build:** one call reused the `label_line` helper (a
short-label-plus-blank-line pattern meant for things like "Date: ___") for
a full discussion question in the marriage journal. Since `label_line`
always draws the blank starting right after the text, a long question
pushed against the margin left a stray, nearly invisible line fragment at
the end of the sentence — again something the earlier "does content run
off the page" scan wouldn't catch, only visible on a rendered page.
Swapped that call for a wrapped paragraph instead and rebuilt.

With this, every defect logged for Christian Ministry Assets Pack 1 and
Pack 2 in this session is resolved.

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
- ~~Christian Ministry Assets Pack 2, items 02/04/11: bare session/day
  labels with no content~~ — fixed, see above. All logged Pack 1 and
  Pack 2 defects are now resolved.
- ~~Christian Ministry Assets Pack 1, item 2 (Scripture Coloring Pages):
  needs actual coloring-page illustrations~~ — fixed, see above.
- The branded planner's companion-access page still assumes live
  account/API wiring that doesn't exist for the *planner PDF itself* —
  it's just a link to the static link hub. The Social Command Center
  concept shell now has a real counterpart, though: see the 2026-09-04
  entry below.

## 2026-09-04 — Built the actual Christian Family Command Center web app

Everything above this point was recovery, auditing, and content fixes on
static files. This entry is different: a real, working application, built
fresh (not recovered from any ZIP) in `webapp/`, at the user's request for
"a full app with... a normal password-protected admin dashboard each
family logs into," connected to Google Calendar/Gmail and to iOS/Android
calendar apps, with family members able to connect their own accounts to
each other if they choose.

**Stack** (chosen with the user via `AskUserQuestion` before writing any
code, since tech stack and hosting are expensive decisions to reverse
later): Next.js 16 + React 19 + TypeScript, PostgreSQL via Prisma 6,
Auth.js (NextAuth v5) credentials login, `googleapis` for a separate
per-user Google OAuth connection, and the `ics` package for phone calendar
sync via a private webcal feed rather than a native iOS/Android app.

**Data model**: Family is the tenant. Each family member gets their own
User (own email/password, `OWNER` or `MEMBER` role) — not one shared
family login. A member's GoogleAccount (OAuth tokens) is entirely separate
from login and defaults to private; a `shareCalendar` toggle each member
controls themselves is what "connect their accounts to each other if they
so choose" turns into concretely — sharing is opt-in per person, not
automatic for the family. CalendarEvent rows are the shared family
calendar, either typed in directly or mirrored from any member's shared
Google Calendar.

**What's actually built and verified working** (via Playwright driving a
real Chromium browser against the running app, plus direct Postgres
checks — not just "the code compiles"):
- Family signup (creates a Family + first OWNER) and invite-based signup
  (joins an existing Family with a member's own login) — both auto-sign-in
  on success.
- Login/logout, and the route guard (`src/proxy.ts`) actually blocking
  `/dashboard/*` for signed-out visitors and after logout, confirmed by
  checking the session cookie was really cleared, not just that the UI
  looked right.
- The shared family calendar: adding manual events (timed and all-day),
  every family member seeing the same events with per-event attribution,
  and deleting manual events.
- The `.ics`/webcal feed endpoint producing real, valid calendar data for
  a family's events.
- Family management: owner-only invite generation and revocation,
  owner-only member removal, and confirming a plain MEMBER can't see or
  use any of those owner-only controls.
- Settings: password change (confirmed the old password stops working and
  the new one logs in), and the ICS feed link display with a
  regenerate-token control.
- The Google "Connect account" UI correctly disables itself with an
  explanation when `GOOGLE_CLIENT_ID`/`SECRET` aren't configured, since
  those must come from a Google Cloud project the user creates themselves
  — documented step-by-step in `webapp/docs/GOOGLE_SETUP.md`. The OAuth
  connect/callback routes, token-refresh handling, Calendar sync, and
  Gmail-preview code are written and typecheck, but couldn't be exercised
  end-to-end in this session without real Google credentials.

**Bugs caught during this same verification pass, fixed before shipping**
(not found by a separate review step — found because each flow was
actually driven end-to-end and checked against the database, not assumed
correct from reading the code):
- The unchecked "all-day event" checkbox is omitted from form submission
  entirely (browsers don't send unchecked checkboxes), so
  `formData.get("allDay")` is `null`, not `undefined` — which the Zod
  schema's `.optional()` rejected. Event creation failed with a raw
  validation error until this was changed to `.nullish()`.
- The `.ics` feed route never stripped the `.ics` suffix from the URL
  before looking up the family by token, so the exact webcal URL shown on
  the Settings page 404'd. Fixed by trimming a trailing `.ics` before the
  database lookup.

**Also caught, and correctly identified as test-harness noise rather than
app bugs** — worth recording so a future pass doesn't re-chase these:
Next.js's dev-mode indicator badge visually overlaps the sidebar's logout
button at the same screen position, which made an automated click miss
the real button (submitting the form via JS directly confirmed logout
itself works fine); and a same-page text check right after a server
action's `revalidatePath` occasionally read stale content before the
re-render finished, which a direct database check resolved.

**Environment-specific things worth knowing, documented in
`webapp/README.md`**: this Next.js version (16.3) and Prisma's `7.x`/`8.x`
lines were prereleases with real breaking changes at the time this was
built (Prisma moved `datasource.url` out of `schema.prisma` entirely, and
Next renamed the `middleware.ts` convention to `proxy.ts`) — Prisma is
pinned to the last stable `6.19.3` line deliberately, and `npm install`
needs `--legacy-peer-deps` to route around an unrelated npm/arborist crash
on this dependency graph. None of this is a defect in the app itself, but
it will confuse anyone who tries to "fix" it back to older conventions
without reading that note first.

**Not done in this session, and why:**
- Real end-to-end Google OAuth/Calendar/Gmail testing — needs a Google
  Cloud project and test-user credentials only the user can create (guide
  provided).
- Deployment to any specific host — the user hadn't decided on one yet;
  the app is built deployable (Docker, or any Node host) rather than
  wired to a particular platform.
- A native iOS/Android app — deliberately out of scope per the user's own
  choice of the webcal/ICS approach over native apps.

## 2026-09-05 — Closed three of the gaps flagged after the first build

After walking the user through what was and wasn't built yet, they asked
to keep going on the buildable gaps (the two that needed their own
action — Google credentials and picking a host — are still open, since
those genuinely aren't mine to do).

**Event editing.** Calendar events could only be added or deleted, not
edited. Added an `updateEvent` action and an inline edit form
(`event-item.tsx`) — click Edit on any manually-added event to change it
in place. Google-synced events still aren't editable here by design
(they're edited at the source and picked up on next sync).

**Real outbound email**, via a new `lib/email.ts` using generic SMTP
(nodemailer) rather than one vendor's API — matches this project's
existing "bring your own credentials" pattern for Google OAuth, and works
with Gmail, Resend, Postmark, SES, or a self-hosted mail server. Documented
in `docs/EMAIL_SETUP.md`. Both features built on top of it degrade
gracefully when email isn't configured, the same way Google features do
when Google isn't configured:
- **Invite emails**: entering an email when creating a family invite now
  sends a real email with the invite link, if email is configured;
  otherwise it's the same copy-paste link as before.
- **Password reset**: a "Forgot password?" link on the login page, a
  `PasswordResetToken` model (single-use, 1-hour expiry), and a
  `/reset-password` page. Requesting a reset always shows the same
  generic message whether or not the email has an account, so the
  endpoint can't be used to enumerate who's registered.

**Verified this time with a real local SMTP server** (MailDev), not just
"the code compiles" — actually sent an invite email, pulled the real
invite link back out of the delivered email via MailDev's API, and
completed signup with it; and separately requested a real password reset,
pulled the real token out of the delivered email, reset the password,
confirmed the old password stopped working and the new one logged in, and
confirmed the same reset token can't be reused a second time.

**A real bug caught by ESLint, not by hand**: the edit-form's "close on
successful save" logic used `setState` inside a `useEffect`, which the
`react-hooks/set-state-in-effect` rule flagged as unnecessary and
render-cascade-prone. Fixed using React's documented "adjust state during
render" pattern (comparing against a stored previous `state` value)
instead of an effect.

**A test-script mistake caught before it was believed**: the first version
of the edit-event browser test filled in the *add-event* form instead of
the *edit* form, because both forms use identically-named fields
(`name="title"`, etc.) and the test's selector wasn't scoped to the
specific event being edited. The edit action itself was never broken —
its own default values just got resubmitted unchanged. Caught by checking
the database directly rather than trusting the on-page text check, same
lesson as the `.ics` feed and remove-member checks in the previous
session. Re-ran with a properly scoped selector and confirmed via the
database that the edit genuinely persisted.

**Still open, unchanged from before:** Google OAuth needs the user's own
Cloud project; deployment needs the user's choice of host; no email
verification on signup; only Google syncs a calendar in (Outlook/iCloud
can't connect the same way); no automated test suite committed to the
repo (verification here was manual, scripted Playwright runs against a
live dev server, the same as last time).

## 2026-09-08 — Email verification on signup

Continuing the same "keep going" pass, with the two remaining buildable
gaps named as email verification and a committed automated test suite
(Google OAuth credentials and choosing a host remain the user's own
action, not something buildable here). This entry covers email
verification; the test suite follows in a later entry.

**Email verification**, built on the existing generic-SMTP email
infrastructure and following the same graceful-degradation pattern as
invites and password reset:
- Added `emailVerifiedAt` to `User` and a new single-use, 24-hour-expiry
  `EmailVerificationToken` model.
- Both signup flows (new family, join by invite) now send a verification
  email right after account creation, if email is configured — silently
  skipped otherwise, exactly like invite emails already do.
- A `/verify-email?token=...` page auto-submits the token on load and
  reports success, an invalid/expired-token error, or a missing-token
  message.
- A dismissed-on-verify reminder banner appears at the top of every
  dashboard page for an unverified user, with a "resend" button — but
  only when email is configured, so families that never set up SMTP never
  see it. The banner's verified/unverified state is read fresh from the
  database on every page load rather than stored in the session/JWT,
  specifically to avoid showing a stale "still unverified" banner after a
  user clicks the link in a different tab or browser than the one they're
  logged in on.
- Settings gained a matching "Email verification" section: a confirmation
  message once verified, or the same resend button beforehand. Also only
  shown when email is configured.
- This is deliberately non-blocking — an unverified family member can
  still use the app. Gating login on it risked locking a family out over
  a missed email, which is a worse failure mode than an unverified email
  address.

**Verified with a live dev server, MailDev, and direct database checks:**
signed up a new family, confirmed the reminder banner appeared, pulled
the real verification email out of MailDev's API, extracted the token,
visited the verify link, confirmed the banner disappeared and Settings
showed "verified" — then confirmed `emailVerifiedAt` and the token's
`usedAt` were actually set in Postgres, not just that the page said so.
Also verified the edge cases: reusing an already-used token, a bogus
token, and a missing token all show the correct message instead of
silently succeeding or crashing; and re-ran the whole signup flow with
SMTP intentionally unconfigured to confirm signup still completes cleanly
and neither the banner nor the Settings section appear at all.

**A real bug caught by a console-error check, not by eye**: the
verify-email page's initial version called the `useActionState` action
function directly from a `useEffect` to auto-submit the token on load.
That worked, but React logged "called outside of a transition" because
the call wasn't wrapped in `startTransition`, meaning `pending` wouldn't
reliably reflect the in-flight request. Fixed by wrapping the effect's
`formAction` call in `startTransition`, confirmed the warning is gone by
checking for zero console errors, not just that the page rendered.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host; only Google syncs a calendar
in; no automated test suite committed to the repo yet (this remains
manual, scripted Playwright runs against a live dev server — the next
entry addresses this).

## 2026-09-08 — Committed automated Playwright test suite

The last of the two remaining buildable gaps named in the previous
entry. Until now every feature in this app had been verified with
one-off, uncommitted Playwright scripts run by hand during development —
useful in the moment, but nothing a future change could be checked
against. This adds a real, permanent, `npm run test:e2e`-able suite.

**What was built**, all under `webapp/e2e/`:
- `playwright.config.ts` (`@playwright/test`, pinned as a real
  devDependency, launched against the pre-installed Chromium rather than
  downloading its own) starts two throwaway servers for the run: MailDev
  on its usual ports, and a Next.js dev server on port 3100 (distinct
  from a developer's own `npm run dev` on 3000) with `DATABASE_URL`
  pointed at a dedicated `<dbname>_test` database and SMTP pointed at
  that MailDev instance.
- `e2e/global-setup.ts` creates that test database if it doesn't exist,
  runs `prisma migrate deploy` against it, and truncates every table
  before the run starts — so the suite never touches the real dev
  database and every run starts from a clean slate.
- `e2e/helpers.ts` — shared signup/login/logout helpers, a
  unique-email generator (so parallel or repeated runs never collide),
  and a `waitForEmail`/`extractToken` pair that polls MailDev's real API
  and pulls a real token out of a real delivered email, the same
  technique used by hand in the last two entries.
- Five spec files covering the app's actual feature set: auth
  (signup/login/logout/route-guard/duplicate-email), calendar
  (add/edit/remove), family (invite/join/remove-member/revoke-invite),
  password reset (request/reset/reuse-rejected/generic-unknown-email),
  and email verification (verify/reuse-rejected/resend). Every test
  asserts against the real Postgres test database, not just what the
  page displays.

**Three real bugs the suite caught immediately, none of them in the
application's actual auth/data logic:**
1. The Next.js dev-mode route indicator (a fixed overlay in the corner
   of every page) was intercepting Playwright's clicks on the "Log out"
   button, timing out the affected tests. Fixed by setting
   `devIndicators: false` in `next.config.ts` — it's a dev-only
   convenience overlay, not a real feature, and it isn't worth keeping
   at the cost of an overlay that can eat real clicks underneath it.
2. `getByRole("alert")` matched two elements on every page, not one:
   Next.js's own route announcer (`#__next-route-announcer__`) also
   carries `role="alert"`, invisible and always empty. Any assertion
   using it threw a strict-mode violation the moment a real alert was
   also on the page. Fixed by asserting on the visible error text
   directly instead of the ARIA role.
3. The suite's own `logout()` test helper clicked the "Log out" button
   and immediately checked `page.url()` without waiting for the
   resulting redirect to complete — a race that made logout look broken
   (still on `/dashboard`, session cookie still present) when it wasn't.
   Confirmed with a throwaway debug spec that captured the real
   network responses and cookie state: logout's redirect to `/` and its
   cookie clearing both complete correctly, just not synchronously with
   the click. Fixed by having the helper `waitForURL` the landing page
   before returning.

**Verified by actually running it**, repeatedly, watching real failures
turn into real passes as each cause above was found and fixed, not just
by writing tests and assuming they'd work: 16/16 specs pass on a clean
run. Also re-ran `npx tsc --noEmit`, `npm run lint`, and `npm run build`
after adding the suite (and after the `devIndicators` change) to confirm
nothing else regressed.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host; only Google syncs a calendar
in. With this entry, both of the previously-named buildable gaps (email
verification, an automated test suite) are done — everything remaining
is the user's own action, not something further to build here.

## 2026-09-08 — CI: the test suite now runs itself

The Playwright suite added earlier today was only as good as someone
remembering to run it. Added `.github/workflows/ci.yml` so it runs on
every push and every pull request without anyone asking: type check,
lint, build, then the full e2e run, against a real Postgres service
container and Playwright's own downloaded Chromium (GitHub's runners
don't have this sandbox's pre-installed one).

**Made `playwright.config.ts` portable** in the process: it previously
hardcoded this sandbox's Chromium path
(`/opt/pw-browsers/chromium`), which doesn't exist on a normal machine
or a GitHub Actions runner. It now checks whether that path exists and
only uses it if so, otherwise leaving Playwright to launch its own
managed browser -- the same config now works unmodified in this
sandbox, on a contributor's laptop, and in CI.

**Verified locally rather than trusting the YAML to be right on faith**:
ran `npm ci --legacy-peer-deps` (what CI actually runs, not `npm install`)
to confirm the lockfile is genuinely in sync, then re-ran `tsc --noEmit`,
lint, build, and the full 16-test e2e suite against the reinstalled
`node_modules` -- all still green. Local Postgres had stopped between
sessions (a sandbox restart, not an app issue); restarted it
(`pg_ctlcluster 16 main start`) before re-running rather than assuming
the failure meant something was broken.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host; only Google syncs a
calendar in. Everything else buildable without those two things is now
done, including making sure the test suite actually runs on its own.

## 2026-09-09 — Rate limiting on auth-related actions

A real gap noticed while looking for what else was buildable without the
user's own action: login, signup, password-reset requests, and resending
a verification email had no rate limiting at all. Anyone could brute-force
a password, spam a victim's inbox with reset or verification emails, or
mass-create junk families, all without any friction.

**Added `lib/rate-limit.ts`**, backed by a new `RateLimitHit` Postgres
table rather than an in-memory counter -- this app already requires
Postgres everywhere it can run, so it's shared state that holds up across
serverless invocations and multiple app instances, unlike a plain
in-memory Map. Wired into:
- **login**: 8 attempts per 15 minutes per account (keyed by email, so
  spreading guesses across many IPs doesn't help), plus 30 per 15 minutes
  per IP where one is visible (stops credential stuffing across many
  different accounts from one source).
- **signup** (both new-family and join-by-invite): 30 per hour per IP.
- **password-reset requests**: 5 per hour per email (stops repeatedly
  emailing one inbox, real account or not) plus 20 per hour per IP.
- **resend verification email**: 5 per hour per user (already
  authenticated, so keyed by user id, no IP needed).

**A real bug caught by running the full test suite, not just the new
test**: IP-based limits use `X-Forwarded-For`/`X-Real-IP`, which only a
reverse proxy sets. The first version fell back to a literal `"unknown"`
key when neither header was present, which seemed harmless until the
full e2e suite (this sandbox's dev server sees a real, consistent IP,
not "unknown") tripped the 10-per-hour signup limit partway through --
19 signup-flow calls across the whole suite, all counted against one
shared bucket. Diagnosed by bisecting which combination of spec files
reproduced it, then reading Playwright's saved page snapshot for a
failure, which showed the actual rendered alert: "Too many attempts."
That confirmed the real cause (limit too tight for legitimate burst
traffic, not a logic bug) rather than the IP-fallback theory tried first.
Fixed by raising the signup limit to 30/hour and, separately but still
worthwhile, changing the "no IP visible" case to skip IP-based checks
entirely instead of collapsing every unproxied visitor into one bucket
-- the right behavior for a self-hosted deployment with no reverse proxy
in front, where every real user would otherwise be limited against each
other instead of against nobody.

**Added `e2e/rate-limit.spec.ts`** so the feature itself has coverage,
not just proof that it doesn't false-positive: repeatedly logs in with a
wrong password against one account until the response changes from
"incorrect password" to "too many attempts," then confirms the *correct*
password is also rejected while the limit holds (otherwise this would
only be throttling wrong guesses, not actually protecting the account).

**Verified**: full clean-room rehearsal (lint, typegen, tsc, build) plus
all 17 e2e tests, including the new one, passing together in one run.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host (and, per the new rate-limit
docs in the README, a reverse proxy in front if self-hosting directly,
for the IP-based limits to distinguish real clients); only Google syncs
a calendar in.

## 2026-09-09 — Baseline security response headers

A quick, low-risk hardening pass alongside rate limiting. Added
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`
denying camera/microphone/geolocation (nothing in this app uses any of
them), and `Strict-Transport-Security` to every response via
`next.config.ts`'s `headers()`. Confirmed there's no `iframe` or
`dangerouslySetInnerHTML` anywhere in the app before adding
`X-Frame-Options: DENY`, so it can't be breaking a legitimate embed.

Deliberately did **not** add a Content-Security-Policy. Next.js's own
hydration relies on inline scripts, and getting a nonce-based CSP right
without silently breaking dev-mode HMR or something subtle in production
needs more than a page-load smoke test to be confident in -- these five
headers are the well-understood, low-risk wins that don't carry that
failure mode. Worth doing properly later if this is ever exposed more
broadly than a family's own dashboard.

**Verified**: curled a running dev server directly and confirmed all five
headers on both a page route and an API route, then ran the full 17-test
e2e suite (which exercises real browser page loads across the whole app)
to confirm nothing broke -- all passing.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host (and, as before, a reverse
proxy in front if self-hosting directly, both for HTTPS and so the
IP-based rate limits can see real client IPs); only Google syncs a
calendar in.

## 2026-09-11 — Google Calendar sync failures no longer crash the dashboard

Reviewed the Google Calendar/Gmail integration code, which hadn't been
touched since the original build, looking for real robustness gaps. Found
one: `syncGoogleCalendarForUser` (called from both the "Sync now" button
and turning on calendar sharing) had no error handling at all. A revoked
or expired Google token -- which can happen any time, entirely outside
this app's control, e.g. the member removes the app's access from their
Google Account settings, or a token simply expires -- would throw an
uncaught exception straight through the server action. With no
`error.tsx` anywhere in the app, that meant Next's generic, unstyled
fallback error page for what is a completely foreseeable, recoverable
condition.

**Fixed both problems:**
- `lib/actions/google.ts`'s `syncNow` and `setShareCalendar` now catch a
  sync failure and redirect to `/dashboard/integrations?error=google_sync_failed`,
  reusing the exact `ERROR_MESSAGES` convention the integrations page
  already used for OAuth connect/callback errors -- not a new pattern,
  the same one already there.
- Added `src/app/dashboard/error.tsx` as a general safety net for any
  other unforeseen action failure in the dashboard, styled to match the
  rest of the app rather than Next's default, with "Try again" and "Back
  to dashboard" options. (Noted in passing: Next 16 renamed this
  boundary's recovery callback from `reset` to `retry` -- confirmed
  against the actual doc for this version rather than assuming.)

**Verified the failure mode is real, not hypothetical, without needing
real Google credentials**: `getGoogleOAuthClient()` throws synchronously
whenever `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` aren't set, which is
exactly this sandbox's (and this repo's default `.env.example`'s) state
before someone does their own Google Cloud setup -- the same code path a
revoked-token failure would hit in production, just a different specific
cause. Added `e2e/google-sync-error.spec.ts`: signs up a user, inserts a
`GoogleAccount` row directly (simulating a previously-connected member),
clicks "Sync now," and confirms the app lands back on Integrations with
the friendly message -- and that the rest of the dashboard (calendar
page) still loads fine afterward -- instead of crashing.

**Verified overall**: full clean-room rehearsal (lint, typegen, tsc,
build) and all 18 e2e tests, including the two new ones, passing
together in one run.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host; only Google syncs a calendar
in.

## 2026-09-11 — Root-level error and 404 pages

Following on from the dashboard error boundary: everything *outside*
`/dashboard` -- the public landing page, login, signup, forgot/reset
password, verify-email -- still had no error boundary and no custom 404,
so an unexpected failure there, or just a mistyped URL, fell through to
Next's default unstyled pages instead of anything matching the app.

Added `src/app/error.tsx` (root-level error boundary) and
`src/app/not-found.tsx` (branded 404), both styled to match the rest of
the app. Extracted the boundary UI both error pages share into
`components/error-panel.tsx` rather than duplicating the same markup in
`app/error.tsx` and `app/dashboard/error.tsx` -- each still passes its
own "go back to ___" destination (home vs. dashboard).

**Verified**: added `e2e/not-found.spec.ts` -- visits a nonexistent
route, confirms a real 404 status code and the branded heading (not
Next's default page), then confirms the "Go to dashboard" link correctly
lands an unauthenticated visitor on `/login` via the existing auth guard
rather than anywhere it shouldn't. Ran the full clean-room rehearsal
(lint, typegen, tsc, build) and all 19 e2e tests together, passing.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host; only Google syncs a calendar
in.

## 2026-09-11 — Leave a family, or delete one entirely

A real account-lifecycle gap: there was no self-service way for a member
to leave a family (they'd have to ask the owner to remove them), and no
way for an owner to delete a family at all if they stopped using the
app. Both are now on Settings, in a new "Danger zone" section.

**Leave family** (non-owner members only): removes the member's own
login and signs them out. Their manually-added calendar events stay on
the family calendar -- `CalendarEvent.createdByUserId` uses
`onDelete: SetNull` in the schema, so the event survives, just
unattributed (shown as "Added manually" instead of "Added by X," the
same as it already displays for any event without a creator). Any
events synced in from their own Google Calendar *are* removed, since
those aren't meaningful to keep once the member (and their Google
connection) is gone -- explicitly cleaned up the same way
`disconnectGoogleAccount` already does, since `CalendarEvent.sourceUserId`
is a plain field, not a relation Prisma can cascade on.

Owners can't leave this way -- there's no "transfer ownership" feature,
so an owner leaving would orphan the family with no one able to manage
it. The button simply isn't shown for owners; the action itself still
guards this server-side too, matching the existing defensive-throw
pattern the rest of `family.ts` (`removeMember`, etc.) already uses.

**Delete family** (owners only): permanently deletes the family and
everything in it -- members, events, invites, connected accounts --
via `prisma.family.delete()`, which the schema's cascading relations
already handle correctly in one call. Requires typing the family's
exact name to confirm before the button is even enabled, the same
friction pattern real apps use before an irreversible action that
affects more than just the person clicking it (and the Settings copy
tells them up front how many members will be affected).

**Verified** with `e2e/family-lifecycle.spec.ts`: a member leaves,
confirmed via direct database check that their login is gone, the rest
of the family is untouched, and a manually-added event survives with
its `createdByUserId` cleared to null (checked in the database, not
just on the page). Separately, confirmed an owner has no "leave"
button at all, that a wrong confirmation name is rejected, and that the
correct name deletes the family, its owner, and everything else --
again checked directly against Postgres, not just the redirect.

**A real bug in the test, not the app**, caught by running the full
suite rather than trusting the isolated run: the first version queried
the database for the just-created invite immediately after clicking
"Create invite link," without waiting for the server action to actually
finish -- the same race `family.spec.ts` already knew to guard against
with `await expect(page.getByText(/share this link/i)).toBeVisible()`
before querying, which this new test had simply omitted. Fixed by
adding the same wait.

**Verified overall**: full clean-room rehearsal (lint, typegen, tsc,
build) and all 21 e2e tests passing together.

**Still open:** Google OAuth needs the user's own Cloud project;
deployment needs the user's choice of host; only Google syncs a
calendar in; no way yet to transfer ownership to another member (would
be needed before an owner could "leave" rather than delete outright).
