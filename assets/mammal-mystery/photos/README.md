# Mammal Mystery photos

The case file in Mammal Mystery shows a real photo of each animal when one is listed in
`PHOTOS` at the top of `mammal-mystery-data.js`. Until then it shows the cartoon.

1. Save a photo here, about 960 pixels wide, as a JPEG named after the animal
   (for example `lion.jpg`). The ids are: otter, raccoon, fox, lion, polarbear, panda,
   meerkat, rabbit, kangaroo, elephant, giraffe, camel, and for Level 2 redpanda, sloth,
   armadillo, platypus, hedgehog, bat, koala, okapi, pangolin, walrus, wolf, snowleopard.
2. Add the photo to `CORE` in `sw.js` and bump `VERSION` so tablets save it for offline play.
3. Use only your own photos or ones with an open license: public domain, CC0, CC BY,
   or CC BY-SA. Not NC or ND.
4. In `mammal-mystery-data.js`, fill in that animal's line, for example:
   `lion: { src: "assets/mammal-mystery/photos/lion.jpg", credit: "Photo: Jane Doe, CC BY-SA 4.0, via Wikimedia Commons" },`
5. Bump `?v=` on `mammal-mystery-data.js` in `mammal-mystery.html`,
   `mammal-mystery-classroom.html`, `mammal-mystery-coloring.html` and `sw.js` so browsers fetch the new list.
