# Notes for working on this site

## Live games and their teacher versions

Whenever a live game is changed, make the same change to its teacher/classroom version in the same pull request.

- **Tadpole Trek**: the live game is `tadpole-game.html`; the unlisted classroom edition is `tadpole-classroom.html` (with `tadpole-teachers.html` and `tadpole-worksheets.html`). Both pages load the same `tadpole-game.js` (the classroom page sets `window.TG_CLASSROOM`), so a script change reaches both, but page markup, help text, and the `?v=` cache-busting numbers on `tadpole-game.js` and `styles.css` must be updated on both pages. Check whether the teacher guide or worksheets describe the thing you changed.
- **Otter Evolution**: `otter-game.html` and `otter-game.js`. It has no teacher version yet; if one is added, the same rule applies.

GitHub Pages serves `main` directly, so changes go live when merged.
