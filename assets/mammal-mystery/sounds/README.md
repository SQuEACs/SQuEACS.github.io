# Mammal Mystery animal sounds

When a child finds an animal, and when the lion roars or the fox pounces in its superpower,
the game plays a real recording of that animal if one is listed in `SOUNDS` in
`mammal-mystery-data.js`. If no recording is listed, nothing plays.

1. Save a short recording here, 2 to 5 seconds long, as an MP3 named after the animal
   (for example `lion.mp3`). The ids are: otter, raccoon, fox, lion, polarbear, panda,
   meerkat, rabbit, kangaroo, elephant, giraffe, camel.
2. Use real recordings of the animal, not imitations. Use only your own recordings or ones
   with an open license: public domain, CC0, CC BY, or CC BY-SA. Do not use NC or ND.
   Good places to look are Wikimedia Commons (search "Category:Audio files of mammals")
   and the US National Park Service sound galleries, which are public domain.
3. In `mammal-mystery-data.js`, fill in that animal's line. For example:
   `lion: { src: "assets/mammal-mystery/sounds/lion.mp3", credit: "Recording: Jane Doe, CC BY 4.0, via Wikimedia Commons" },`
   The credit shows under the game automatically.
4. Bump `?v=` on `mammal-mystery-data.js` in `mammal-mystery.html` and
   `mammal-mystery-classroom.html`. Then add the file to `CORE` in `sw.js` and bump
   `VERSION`, so it also plays offline.
