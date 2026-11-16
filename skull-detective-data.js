/* ============================================================
   SKULL DETECTIVE data: five North American members of the weasel
   family (Mustelidae) whose skulls the SQuEACs Lab has micro-CT
   scanned, the anatomy words the game teaches, and each grade.

   Measurements (mm) are typical adult values from the literature,
   used until the lab's own scan measurements replace them:
     len    = condylobasal length (front of the snout to the back of the skull)
     wid    = zygomatic width (widest point across the zygomatic arches)
     orbit  = orbit width (front to back across the eye socket)
     canine = upper canine crown height (gum line to tip)
   The shape numbers drive the drawings (fractions of skull length).

   Text in {braces} becomes a tappable glossary word: {orbit} shows
   the term, {orbit|eye sockets} shows other words for the same term.

   CT renders: put images in assets/skull-detective/ and list them
   under ct (e.g. ct: { side: "assets/skull-detective/otter-side.png" }).
   ============================================================ */
window.SD_DATA = (function () {
  const SKULLS = {
    otter: {
      name: "river otter", sci: "Lontra canadensis", job: "swimmer", hab: "river",
      len: 108, wid: 70, orbit: 14, canine: 12, teethN: 36,
      shape: { r: .17, h: .30, oy: .62, crest: .01, zw: .65, rw: .30, pc: .17, bw: .46, mw: .55, iof: .035, bulb: .45, molar: "crush" },
      look: { L: 185, H: 34, leg: 22, arch: 4, head: 48, ear: 4, fur: "#5e3f28", belly: "#a7845f", tail: [95, 15, 0], whisk: 1, flat: 1 },
      lives: "Rivers, lakes, marshes, and coasts across most of North America, including a few rivers in Arizona.",
      size: "About 1 meter (3 feet) long with the tail, 5 to 14 kilograms (11 to 30 pounds).",
      eats: "Fish, crayfish, frogs, and other water animals.",
      intro: "River otters are playful swimmers with webbed feet, a thick tail, and very sensitive whiskers.",
      clues: ["My skull is flat and low, like the front of a boat.", "My {orbit|orbits} sit up high, so I can peek out of the water.", "A big {iof} by my nose carries the nerve from my whiskers. I feel for fish in muddy water."],
      fact: "River otters can close their ears and nostrils under water and find fish by feeling with their whiskers.",
      foods: ["fish", "crayfish", "frog"], chain: ["sun", "algae", "tadpole", "fish", "otter"],
      teeth: "mixed", teethSay: "The otter has sharp {carnassial|carnassials} for slicing fish, plus wide, bumpy {molar|molars} for crushing crayfish shells.",
      ct: {}
    },
    mink: {
      name: "American mink", sci: "Neogale vison", job: "swimmer", hab: "river",
      len: 64, wid: 38, orbit: 10, canine: 7, teethN: 34,
      shape: { r: .20, h: .33, oy: .6, crest: .015, zw: .58, rw: .23, pc: .16, bw: .44, mw: .49, iof: .02, bulb: .7, molar: "slice" },
      look: { L: 150, H: 26, leg: 20, arch: 8, head: 40, ear: 4, fur: "#3a2418", belly: "#4a2e20", tail: [70, 11, 1], chin: "#efe7da" },
      lives: "Streams, rivers, and marshes across most of North America.",
      size: "About 50 to 70 centimeters (20 to 28 inches) long with the tail, 0.5 to 1.6 kilograms (1 to 3.5 pounds).",
      eats: "Fish, frogs, crayfish, mice, and muskrats.",
      intro: "Mink are small, dark brown hunters that hunt both on land and in the water.",
      clues: ["I am the smallest skull of the five.", "My long, narrow skull fits into holes along the river bank.", "Sharp {carnassial|carnassials} slice up fish, frogs, and mice."],
      fact: "Mink hunt on land and in water. They can swim under water for about 30 meters.",
      foods: ["fish", "frog", "mouse"], chain: ["sun", "algae", "tadpole", "frog", "mink"],
      teeth: "slicer", teethSay: "The mink's {carnassial|carnassials} are blades that slice meat like scissors.",
      ct: {}
    },
    marten: {
      name: "American marten", sci: "Martes americana", job: "climber", hab: "trees",
      len: 80, wid: 45, orbit: 13, canine: 9, teethN: 38,
      shape: { r: .24, h: .36, oy: .58, crest: .02, zw: .56, rw: .22, pc: .15, bw: .43, mw: .47, iof: .018, bulb: .7, molar: "slice" },
      look: { L: 140, H: 28, leg: 30, arch: 12, head: 42, ear: 9, fur: "#8a5a2b", belly: "#8a5a2b", tail: [80, 14, 2], bib: "#f0a64a", legs: "#3f2a18" },
      lives: "Old evergreen forests of Canada, Alaska, and the mountains of the northern United States.",
      size: "About 50 to 70 centimeters (20 to 28 inches) long with the tail, 0.5 to 1.3 kilograms (1 to 3 pounds), about the size of a small house cat.",
      eats: "Red squirrels, voles, mice, birds, and berries.",
      intro: "Martens are tree climbers with bushy tails and an orange patch on the throat. Most people have never seen one, because they live deep in forests.",
      clues: ["My skull is light and slender, like a climber's helmet.", "My large {orbit|orbits} face forward, which helps me judge jumps from branch to branch.", "I chase red squirrels through the tree tops."],
      fact: "Martens can turn their back feet around to climb down trees head first.",
      foods: ["squirrel", "mouse", "berries"], chain: ["sun", "seeds", "squirrel", "marten"],
      teeth: "slicer", teethSay: "Sharp {carnassial|carnassials} slice meat, and its {molar|molars} can mash berries.",
      ct: {}
    },
    fisher: {
      name: "fisher", sci: "Pekania pennanti", job: "climber", hab: "forest",
      len: 112, wid: 66, orbit: 15, canine: 15, teethN: 38,
      shape: { r: .25, h: .36, oy: .57, crest: .06, zw: .59, rw: .24, pc: .14, bw: .42, mw: .5, iof: .02, bulb: .75, molar: "slice" },
      look: { L: 190, H: 36, leg: 30, arch: 10, head: 50, ear: 8, fur: "#2b211c", belly: "#2b211c", tail: [110, 16, 2], frost: "#7d6f63" },
      lives: "Forests of Canada and the northern United States.",
      size: "About 75 to 120 centimeters (30 to 47 inches) long with the tail, 2 to 6 kilograms (4 to 13 pounds).",
      eats: "Snowshoe hares, squirrels, mice, birds, and even porcupines.",
      intro: "Fishers are larger, darker relatives of martens. Despite the name, they almost never eat fish.",
      clues: ["I have a tall {sagcrest} on top of my skull, where strong jaw muscles attach.", "I can climb, but I hunt mostly on the forest floor.", "I am one of the few animals that can hunt porcupines."],
      fact: "Fishers almost never eat fish. They hunt hares, squirrels, and even porcupines.",
      foods: ["porcupine", "rabbit", "squirrel"], chain: ["sun", "bark", "porcupine", "fisher"],
      teeth: "slicer", teethSay: "Long {canine|canines} and strong {carnassial|carnassials} give the fisher a powerful bite.",
      ct: {}
    },
    badger: {
      name: "American badger", sci: "Taxidea taxus", job: "digger", hab: "grassland",
      len: 125, wid: 78, orbit: 14, canine: 13, teethN: 34,
      shape: { r: .22, h: .36, oy: .55, crest: .04, zw: .62, rw: .28, pc: .2, bw: .5, mw: .6, iof: .02, bulb: 1, molar: "mixed" },
      look: { L: 150, H: 44, leg: 18, arch: 0, head: 50, ear: 5, fur: "#8d877c", belly: "#cfc7b6", tail: [30, 12, 1], stripe: 1, claws: 1, legs: "#2e2a26" },
      lives: "Grasslands, prairies, and deserts of central and western North America, including Arizona.",
      size: "About 60 to 75 centimeters (24 to 30 inches) long, 6 to 11 kilograms (13 to 24 pounds).",
      eats: "Ground squirrels, pocket gophers, prairie dogs, mice, and insects.",
      intro: "American badgers are wide, flat diggers with long front claws and a white stripe down the face. They live in Arizona!",
      clues: ["I have the biggest, widest skull of the five, shaped like a triangle.", "My strong skull and jaws help me dig after ground squirrels.", "Big {olfbulb|olfactory bulbs} in my brain help me smell animals under the ground."],
      fact: "An American badger can dig itself out of sight in less than a minute.",
      foods: ["squirrel", "mouse", "insect"], chain: ["sun", "seeds", "squirrel", "badger"],
      teeth: "mixed", teethSay: "Badgers have {carnassial|carnassials} for slicing and big, square {molar|molars} for crushing, so they can eat many kinds of food.",
      ct: {}
    }
  };
  const IDS = ["otter", "mink", "marten", "fisher", "badger"];
  // Drawing sizes that follow the measurements: orbit radius and canine height as fractions of skull length.
  for (const id of IDS) { const s = SKULLS[id]; s.shape.or = s.orbit / (2 * 1.15 * s.len); s.shape.ca = s.canine / s.len; }

  // Glossary. t = term, say = how to say it (optional), def = kid-friendly definition.
  const TERMS = {
    skull: { t: "skull", def: "All the bones of the head, including the lower jaw." },
    cranium: { t: "cranium", say: "KRAY-nee-um", def: "The part of the skull around the brain. It is also called the braincase." },
    braincase: { t: "braincase", def: "The rounded back part of the skull that holds and protects the brain." },
    orbit: { t: "orbit", say: "OR-bit", def: "The bony socket in the skull that holds the eye. Scientists call the eye socket the orbit." },
    nasal: { t: "nasal opening", say: "NAY-zul", def: "The hole at the front of the skull where air goes into the nose. Nasal means 'about the nose.'" },
    meatus: { t: "external auditory meatus", say: "aw-dih-TOR-ee mee-AY-tus", def: "The ear opening: the tube that carries sound from the outside into the ear." },
    zygo: { t: "zygomatic arch", say: "zy-go-MAT-ik", def: "The cheekbone. It is a bony bridge on the side of the skull. Strong chewing muscles pass under it." },
    sagcrest: { t: "sagittal crest", say: "SAJ-ih-tul", def: "A tall ridge of bone along the top of the skull. Big jaw muscles attach to it, so it is a sign of a strong bite." },
    rostrum: { t: "rostrum", say: "ROSS-trum", def: "The snout part of the skull, in front of the orbits." },
    mandible: { t: "mandible", say: "MAN-dih-bul", def: "The lower jaw bone." },
    iof: { t: "infraorbital foramen", say: "in-fruh-OR-bih-tul for-AY-men", def: "A hole in the skull just in front of and below the orbit. The nerve from the whiskers runs through it, so a big one means sensitive whiskers. Foramen means hole." },
    vibrissae: { t: "vibrissae", say: "vy-BRISS-ee", def: "Whiskers: stiff, sensitive hairs that animals use to feel things around them." },
    incisor: { t: "incisors", say: "in-SY-zers", def: "The small front teeth, used for nibbling, grooming, and picking things up." },
    canine: { t: "canines", say: "KAY-nines", def: "The long, pointed teeth near the front, used to grab and hold prey." },
    premolar: { t: "premolars", say: "pree-MOE-lers", def: "The cheek teeth between the canines and the molars, used to grip and cut food." },
    molar: { t: "molars", say: "MOE-lers", def: "The back teeth, used to crush and grind food." },
    carnassial: { t: "carnassials", say: "car-NASS-ee-uls", def: "A special pair of blade-like cheek teeth, the upper fourth premolar and the lower first molar. They slide past each other like scissors to slice meat. Only carnivorans have them." },
    carnivoran: { t: "carnivoran", say: "car-NIV-or-an", def: "A member of the mammal group (order) Carnivora: cats, dogs, bears, seals, raccoons, weasels, otters, and their relatives. They share carnassial teeth, even the ones that eat mostly plants." },
    crown: { t: "crown", def: "The part of a tooth you can see above the gum." },
    cusp: { t: "cusp", def: "A point or bump on the chewing surface of a tooth." },
    mustelid: { t: "mustelid", say: "MUSS-teh-lid", def: "A member of the weasel family, Mustelidae: weasels, mink, martens, fishers, otters, badgers, wolverines, and their relatives." },
    species: { t: "species", def: "One kind of living thing. Members of a species can have babies together." },
    habitat: { t: "habitat", def: "The place where an animal lives and finds its food, water, and shelter." },
    classify: { t: "classify", def: "To sort things into groups by what they have in common." },
    biomimicry: { t: "biomimicry", say: "by-oh-MIM-ih-kree", def: "Copying ideas from living things to design and build new things." },
    adaptation: { t: "adaptation", def: "A body part or behavior that helps a living thing survive in its environment. Adaptations are passed down from parents to young over many generations. Animals with fewer adaptations that fit a new environment have a harder time when their environment changes." },
    environment: { t: "environment", def: "Everything around a living thing: the land, water, weather, plants, and other animals." },
    xray: { t: "X-rays", def: "A kind of invisible light with lots of energy. It passes through soft things like skin, but is blocked more by dense things like bone." },
    ct: { t: "CT scan", def: "Computed tomography. A scanner takes hundreds of X-ray pictures from all around an object, and a computer turns them into slices and a 3D model." },
    slice: { t: "slice", def: "One thin layer of a CT scan, like one slice of a loaf of bread. Stacking the slices makes a 3D model." },
    caliper: { t: "caliper", say: "KAL-ih-per", def: "A measuring tool with two jaws that close on an object to measure its length or width." },
    mm: { t: "millimeter", def: "A small unit of length. There are 10 millimeters in 1 centimeter, about the thickness of a dime." },
    variation: { t: "variation", def: "Differences in a trait between individuals or between species." },
    trait: { t: "trait", def: "A feature of a living thing, like skull length or tooth shape." },
    evidence: { t: "evidence", def: "Facts or measurements that support an idea." },
    endocast: { t: "endocast", def: "A model of the space inside the braincase. It shows the shape of the brain. Scientists make digital endocasts from CT scans." },
    olfbulb: { t: "olfactory bulb", say: "ol-FAK-tor-ee", def: "The front part of the brain that first receives smell messages from the nose. Olfactory means 'about smell.' Bigger bulbs usually mean a better sense of smell." },
    cerebrum: { t: "cerebrum", say: "seh-REE-brum", def: "The biggest part of the brain. It makes sense of what the animal sees, hears, smells, and feels, and plans movements." },
    cerebellum: { t: "cerebellum", say: "sair-eh-BELL-um", def: "The part at the back of the brain that controls balance and smooth movement." },
    brainstem: { t: "brainstem", def: "The part of the brain that connects to the spinal cord. It controls breathing and heart rate, and passes messages between the body and the brain." },
    nerve: { t: "nerve", def: "A bundle of fibers that carries messages between the brain and the body." },
    opticn: { t: "optic nerve", say: "OP-tik", def: "The nerve that carries messages from the eye to the brain." },
    olfn: { t: "olfactory nerves", def: "Nerves that carry smell messages from the nose through tiny holes in the skull to the olfactory bulb." },
    turbinals: { t: "turbinals", say: "TUR-bih-nuls", def: "Thin, scrolled bones inside the nose. They are covered with smell sensors and warm the air." },
    trigeminal: { t: "trigeminal nerve", say: "try-JEM-ih-nul", def: "The big nerve that carries touch messages from the face and whiskers to the brainstem." },
    cochlea: { t: "cochlea", say: "KOKE-lee-uh", def: "The snail-shaped part of the inner ear that turns sound into nerve messages." },
    bulla: { t: "auditory bulla", say: "BULL-uh", def: "A rounded, bony bubble on the bottom of the skull that holds the middle ear." },
    auditoryn: { t: "auditory nerve", def: "The nerve that carries sound messages from the cochlea to the brainstem." },
    cortex: { t: "cortex", def: "The outer layer of the cerebrum. Different areas of the cortex handle sight, hearing, touch, and smell." },
    temporalis: { t: "temporalis muscle", say: "tem-por-AL-is", def: "A big chewing muscle on the side of the head. It runs from the sagittal crest and braincase, under the zygomatic arch, to the lower jaw." },
    producer: { t: "producer", def: "A living thing, like a plant or algae, that makes its own food using energy from the Sun." },
    consumer: { t: "consumer", def: "An animal that gets energy by eating other living things." },
    foodchain: { t: "food chain", def: "The path energy takes as one living thing eats another, starting with the Sun." },
    phylogeny: { t: "phylogeny", say: "fy-LAH-jeh-nee", def: "The evolutionary history of a group of living things: who is related to whom. A phylogenetic tree is a diagram of it." },
    phylotree: { t: "phylogenetic tree", say: "fy-low-jeh-NET-ik", def: "A branching diagram that shows how species are related through common ancestors." },
    ancestor: { t: "common ancestor", def: "An ancestral species that two or more living species descended from." },
    node: { t: "node", def: "A branching point on a phylogenetic tree. It stands for a common ancestor." },
    sister: { t: "sister taxa", say: "TAX-uh", def: "The two groups or species that are each other's closest relatives on a tree. They share a common ancestor that no other group shares." },
    clade: { t: "clade", def: "A common ancestor and all of its descendants: one whole branch of the tree." },
    outgroup: { t: "outgroup", def: "A species that branched off before the others in the group. It helps show which traits are old and which are new." },
    homologous: { t: "homologous traits", say: "huh-MOL-uh-gus", def: "Traits that are similar because the species inherited them from a common ancestor." },
    derived: { t: "shared derived trait", def: "A new trait that appeared in a common ancestor and is shared by its descendants. Shared derived traits (synapomorphies) are the evidence for grouping species together." },
    convergent: { t: "convergent evolution", def: "When unrelated or distant species evolve similar traits on their own, often because they live similar lives. It can make species look more closely related than they are." },
    dental: { t: "dental formula", def: "A short code for how many incisors, canines, premolars, and molars an animal has on one side of the upper and lower jaws." }
  };

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
    eye: { term: "orbit", name: "orbit", plain: "eye socket", ask: "Tap the {orbit}, the eye socket.", does: "This is the {orbit}. Orbit is the scientist word for the eye socket. It holds the eye, for seeing." },
    nose: { term: "nasal", name: "nasal opening", plain: "nose hole", ask: "Tap the {nasal}, the nose hole at the very front.", does: "This is the {nasal}. Air goes in here, and the animal smells it." },
    teeth: { term: "canine", name: "teeth", plain: "teeth", ask: "Tap the teeth.", does: "Teeth catch and chew food. The long pointy ones are called {canine|canines}." },
    brain: { term: "braincase", name: "braincase", plain: "brain box", ask: "Tap the {braincase}, the big round part at the back.", does: "This is the {braincase}. It keeps the brain safe." },
    ear: { term: "meatus", name: "ear opening", plain: "ear hole", ask: "Tap the ear opening, near the back.", does: "This is the ear opening. Scientists call it the {meatus}. Sound goes in here." }
  };

  // Foods and food-chain pictures (5th grade).
  const FOODS = {
    fish: "fish", crayfish: "crayfish", frog: "frog", mouse: "mouse", squirrel: "squirrel", rabbit: "snowshoe hare",
    porcupine: "porcupine", berries: "berries", insect: "insects",
    sun: "Sun", algae: "algae", seeds: "seeds", bark: "tree bark", tadpole: "tadpole"
  };
  const PRODUCERS = ["algae", "seeds", "bark"];

  // Phylogeny (6th grade): the badger lineage branched off first; martens and fishers are sister taxa,
  // and otters and minks are in sister groups (Koepfli et al. 2008, BMC Biology; Law et al. 2018, Biol. Rev.).
  const TREE = { first: "badger", pairs: [["marten", "fisher"], ["otter", "mink"]] };

  const GRADES = {
    k: { label: "K", title: "Face Finder", std: "K-LS1-1 · K.L1U1.6, K.L1U1.7", say: "Kindergarten. Find the parts of a skull, and learn their science names." },
    g1: { label: "1", title: "Sort the Skulls", std: "1-LS1-1 · 1.L4.U1.10", say: "First grade. Classify the skulls by the job they do, and copy nature to build things." },
    g2: { label: "2", title: "Who Lives Where?", std: "2-LS4-1 · 2.L2U1.9", say: "Second grade. Use clues from the skull to find each animal's habitat." },
    g3: { label: "3", title: "Measure the Skulls", std: "3-LS4-2, 3-LS4-3 · 3.L1U1.5, 3.P2U1.1", say: "Third grade. Learn how a CT scanner works, measure skulls, teeth, and orbits, and make a graph." },
    g4: { label: "4", title: "Brain Detective", std: "4-LS1-1, 4-LS1-2 · 4.L4U1.11", say: "Fourth grade. Look inside the skull at the brain, follow the paths from the senses to the brain, and solve adaptation cases." },
    g5: { label: "5", title: "Tooth Tales", std: "5-LS2-1, 5-PS3-1", say: "Fifth grade. Learn the four kinds of mammal teeth, read each animal's teeth to find its diet, and follow the energy from the Sun." },
    g6: { label: "6", title: "Family Tree Lab", std: "MS-LS4-2", say: "Sixth grade. Learn how scientists build phylogenetic trees from anatomy, then build one for these five mustelids." }
  };
  const GRADE_IDS = ["k", "g1", "g2", "g3", "g4", "g5", "g6"];

  return { SKULLS, IDS, HABITATS, JOBS, TERMS, PARTS, FOODS, PRODUCERS, TREE, GRADES, GRADE_IDS };
})();
