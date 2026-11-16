# Notes for working on this site

## Live games and their teacher versions

Whenever a live game is changed, make the same change to its teacher/classroom version in the same pull request.

- **Tadpole Trek**: the live game is `tadpole-game.html`; the unlisted classroom edition is `tadpole-classroom.html` (with `tadpole-teachers.html` and `tadpole-worksheets.html`). Both pages load the same `tadpole-game.js` (the classroom page sets `window.TG_CLASSROOM`), so a script change reaches both, but page markup, help text, and the `?v=` cache-busting numbers on `tadpole-game.js` and `styles.css` must be updated on both pages. Check whether the teacher guide or worksheets describe the thing you changed.
- **Mammal Mystery**: the live game is `mammal-mystery.html`; the unlisted classroom edition is `mammal-mystery-classroom.html` (with `mammal-mystery-teachers.html`, `mammal-mystery-coloring.html`, and the PDF built by `tools/build_mammal_mystery_pdf.js`). Both pages load the same `mammal-mystery-art.js`, `-data.js`, `.js`, and `.css` (the classroom page sets `window.MM_CLASSROOM`); bump `?v=` on both pages and in `sw.js`.
- **Skull Detective**: the live game is `skull-detective.html`; the unlisted classroom edition is `skull-detective-classroom.html` (with `skull-detective-teachers.html`). Both load the same `skull-detective-data.js`, `-art.js`, `.js`, and `.css` (the classroom page sets `window.SD_CLASSROOM`); bump `?v=` on both pages and in `sw.js`. Lab CT renders go in `assets/skull-detective/` and are listed under each skull's `ct` in the data file.
- **Inside the Tadpole**: the live game is `inside-the-tadpole.html`; the unlisted classroom edition is `inside-the-tadpole-classroom.html` (with `inside-the-tadpole-teachers.html`). Both load the same `inside-the-tadpole-data.js`, `-art.js`, `.js`, and `.css` (the classroom page sets `window.TP_CLASSROOM`); bump `?v=` on both pages and in `sw.js`. Real CT slice images go in `assets/inside-the-tadpole/` and are listed in `CT` in the data file.
- **Otter Evolution**: `otter-game.html` and `otter-game.js`. It has no teacher version yet; if one is added, the same rule applies.

GitHub Pages serves `main` directly, so changes go live when merged.

## Offline play

`sw.js` saves the game files on tablets. When you add a file a game needs or bump its `?v=`, update `CORE` in `sw.js` and bump `VERSION`. QR codes for `tablet-install.html` live in `assets/qr/` (made with the Python `segno` package).
