/* ============================================================
   SKULL DETECTIVE data: five weasel-family cousins whose skulls
   the SQuEACs Lab has micro-CT scanned, and what each grade does.

   Skull sizes are typical adult values (mm) from the literature,
   used until the lab's own scan measurements replace them:
     len  = condylobasal length (tip of snout to back of skull)
     wid  = zygomatic width (widest point across the cheekbones)
     hgt  = skull height (tooth row to top of braincase)
   The shape numbers (r, h, zw, ...) drive the drawings in
   skull-detective-art.js and are fractions of skull length.

   CT renders: put images in assets/skull-detective/ and list them
   under ct (e.g. ct: { side: "assets/skull-detective/otter-side.png" }).
   A listed render replaces the drawing for that view.
   ============================================================ */
window.SD_DATA = (function () {
  const SKULLS = {
    otter: {
      name: "river otter", sci: "Lontra canadensis", job: "swimmer", hab: "river",
      len: 108, wid: 70, hgt: 33,
      shape: { r: .17, h: .30, oy: .62, or: .075, crest: .01, zw: .65, rw: .30, pc: .17, bw: .46, mw: .55, iof: .035, bulb: .45, molar: "crush", fur: "#7a5233", belly: "#c9a27a", body: 1.25, leg: .55, tail: "otter", ear: .5 },
      looks: "a flat, wide head with a short snout",
      clues: ["My head is flat and smooth, like a boat.", "My eyes sit up high, so I can peek out of the water.", "Big holes by my nose hold the nerves for my whiskers. I feel for fish in muddy water."],
      fact: "River otters can close their ears and nose under water and find fish by feeling with their whiskers.",
      foods: ["fish", "crayfish", "frog"], chain: ["sun", "algae", "tadpole", "fish", "otter"],
      teeth: "crusher", teethSay: "Wide, bumpy back teeth crush crunchy crayfish shells.",
      smell: "small", ct: {}
    },
    mink: {
      name: "American mink", sci: "Neogale vison", job: "swimmer", hab: "river",
      len: 64, wid: 38, hgt: 21,
      shape: { r: .20, h: .33, oy: .6, or: .08, crest: .015, zw: .58, rw: .23, pc: .16, bw: .44, mw: .49, iof: .02, bulb: .7, molar: "slice", fur: "#3b2418", belly: "#4a2e20", body: 1.15, leg: .5, tail: "bushy", ear: .55, chin: "#f4efe6" },
      looks: "the smallest skull, long and narrow",
      clues: ["I am the smallest skull of the five cousins.", "My long, narrow head fits into holes along the river bank.", "Sharp, slicing teeth catch fish, frogs, and mice."],
      fact: "Mink hunt on land and in water, and they can swim under water for about 30 meters.",
      foods: ["fish", "frog", "mouse"], chain: ["sun", "algae", "tadpole", "frog", "mink"],
      teeth: "slicer", teethSay: "Blade-like teeth slice meat like scissors.",
      smell: "medium", ct: {}
    },
    marten: {
      name: "American marten", sci: "Martes americana", job: "climber", hab: "trees",
      len: 80, wid: 45, hgt: 29,
      shape: { r: .24, h: .36, oy: .58, or: .09, crest: .02, zw: .56, rw: .22, pc: .15, bw: .43, mw: .47, iof: .018, bulb: .7, molar: "slice", fur: "#9a6a35", belly: "#9a6a35", body: 1.05, leg: .7, tail: "bushy", ear: .8, chin: "#f2b350" },
      looks: "a light skull with big eyes facing forward",
      clues: ["My skull is light, like a climber's helmet.", "My big eyes face forward, so I can judge the jump from branch to branch.", "I chase red squirrels through the tree tops."],
      fact: "Martens can turn their back feet around to climb down trees head first.",
      foods: ["squirrel", "mouse", "berries"], chain: ["sun", "seeds", "squirrel", "marten"],
      teeth: "slicer", teethSay: "Sharp, slicing teeth, with a few flatter ones for berries.",
      smell: "medium", ct: {}
    },
    fisher: {
      name: "fisher", sci: "Pekania pennanti", job: "climber", hab: "forest",
      len: 112, wid: 66, hgt: 40,
      shape: { r: .25, h: .36, oy: .57, or: .08, crest: .06, zw: .59, rw: .24, pc: .14, bw: .42, mw: .5, iof: .02, bulb: .75, molar: "slice", fur: "#2e2420", belly: "#2e2420", body: 1.2, leg: .7, tail: "long", ear: .6, frost: true },
      looks: "a long skull with a tall ridge on top",
      clues: ["I have a tall ridge on top of my skull, where strong jaw muscles attach.", "I climb, but I hunt mostly on the forest floor.", "I am one of the few animals brave enough to eat porcupines."],
      fact: "Despite the name, fishers almost never eat fish. They hunt hares, squirrels, and even porcupines.",
      foods: ["porcupine", "rabbit", "squirrel"], chain: ["sun", "bark", "porcupine", "fisher"],
      teeth: "slicer", teethSay: "Strong slicing teeth and a powerful bite.",
      smell: "medium", ct: {}
    },
    badger: {
      name: "American badger", sci: "Taxidea taxus", job: "digger", hab: "grassland",
      len: 125, wid: 78, hgt: 46,
      shape: { r: .22, h: .36, oy: .55, or: .065, crest: .04, zw: .62, rw: .28, pc: .2, bw: .5, mw: .6, iof: .02, bulb: 1, molar: "mixed", fur: "#8f8a80", belly: "#d8d2c4", body: 1.1, leg: .45, tail: "short", ear: .45, stripe: true },
      looks: "the biggest skull, wide and shaped like a triangle",
      clues: ["I have the biggest, widest skull, shaped like a triangle.", "My strong skull pushes through dirt as I dig after ground squirrels.", "Big smell parts in my brain help me sniff out animals under the ground."],
      fact: "An American badger can dig itself out of sight in less than a minute.",
      foods: ["squirrel", "mouse", "insect"], chain: ["sun", "seeds", "squirrel", "badger"],
      teeth: "mixed", teethSay: "Big, square back teeth crush and grind as well as slice, so badgers can eat many foods.",
      smell: "big", ct: {}
    }
  };
  const IDS = ["otter", "mink", "marten", "fisher", "badger"];

  const HABITATS = {
    river: { name: "river", say: "the river" },
    trees: { name: "tree tops", say: "the tree tops" },
    forest: { name: "forest floor", say: "the forest floor" },
    grassland: { name: "grassland", say: "the grassland" }
  };
  const JOBS = {
    swimmer: { name: "Swimmers", say: "swimmers" },
    climber: { name: "Climbers", say: "climbers" },
    digger: { name: "Diggers", say: "diggers" }
  };

  // Body parts to find on a skull (K). Each matches a tappable part in the drawing.
  const PARTS = {
    eye: { name: "eye hole", ask: "Tap the eye hole. That is where the eye sits.", does: "The eye hole holds the eye, for seeing." },
    nose: { name: "nose hole", ask: "Tap the nose hole, at the very front.", does: "Air goes in the nose hole. It helps the animal smell." },
    teeth: { name: "teeth", ask: "Tap the teeth.", does: "Teeth catch and chew food." },
    brain: { name: "brain box", ask: "Tap the brain box, the big round part at the back.", does: "The brain box keeps the brain safe." },
    ear: { name: "ear hole", ask: "Tap the ear hole, near the back.", does: "Sound goes in the ear hole so the animal can hear." }
  };

  // Foods and food-chain pictures (5th grade).
  const FOODS = {
    fish: "fish", crayfish: "crayfish", frog: "frog", mouse: "mouse", squirrel: "squirrel", rabbit: "snowshoe hare",
    porcupine: "porcupine", berries: "berries", insect: "insects",
    sun: "Sun", algae: "algae", seeds: "seeds", bark: "tree bark", tadpole: "tadpole"
  };

  // Family tree (6th grade): badger branched off first; martens and fishers are close cousins,
  // and otters and minks are close cousins (Law et al. 2018, Biol. Rev.; Koepfli et al. 2008).
  const TREE = { first: "badger", pairs: [["marten", "fisher"], ["otter", "mink"]] };
  // Skull features students score (6th grade).
  const FEATURES = [
    { id: "flat", name: "Flat, low skull", has: ["otter", "mink"] },
    { id: "ridge", name: "Tall ridge on top", has: ["fisher", "badger"] },
    { id: "square", name: "Big square back tooth", has: ["badger", "otter"] },
    { id: "long", name: "Long slicing tooth row", has: ["marten", "fisher", "mink"] },
    { id: "wide", name: "Wide triangle shape", has: ["badger"] }
  ];

  const GRADES = {
    k: { label: "K", title: "Face Finder", std: "K-LS1-1 · K.L1U1.6, K.L1U1.7", say: "Kindergarten. Find the parts of a skull." },
    g1: { label: "1", title: "Sort the Skulls", std: "1-LS1-1 · 1.L4.U1.10", say: "First grade. Sort the skulls by the job they do, and copy nature to build things." },
    g2: { label: "2", title: "Who Lives Where?", std: "2-LS4-1 · 2.L2U1.9", say: "Second grade. Use clues from the skull to find each animal's home." },
    g3: { label: "3", title: "Measure the Cousins", std: "3-LS4-2, 3-LS4-3 · 3.L1U1.5", say: "Third grade. Measure the skulls and use the numbers as evidence." },
    g4: { label: "4", title: "Brain Detective", std: "4-LS1-1, 4-LS1-2 · 4.L4U1.11", say: "Fourth grade. Look inside the skull at the brain, and see which senses each animal uses most." },
    g5: { label: "5", title: "Tooth Tales", std: "5-LS2-1, 5-PS3-1", say: "Fifth grade. Read the teeth to find out what each animal eats, then follow the energy from the Sun." },
    g6: { label: "6", title: "Family Tree Lab", std: "MS-LS4-2", say: "Sixth grade. Compare skull features to build the family tree of the five cousins." }
  };
  const GRADE_IDS = ["k", "g1", "g2", "g3", "g4", "g5", "g6"];

  return { SKULLS, IDS, HABITATS, JOBS, PARTS, FOODS, TREE, FEATURES, GRADES, GRADE_IDS };
})();
