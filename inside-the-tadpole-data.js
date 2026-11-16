/* ============================================================
   INSIDE THE TADPOLE data. Body parts, the systems they belong to,
   life-cycle stages, and what each grade does.

   The lab's iodine-stained (diceCT) micro-CT scans show these soft
   tissues. To show real scan slices beside the drawings, export a
   few slices from front to back as PNG or JPG into
   assets/inside-the-tadpole/ and list them in CT below, e.g.
     CT.tadpole = ["assets/inside-the-tadpole/tadpole-001.jpg", ...]
   The slice slider then steps through the real images too.
   For the CT view beside the drawings, add one side-view (sagittal)
   image per life stage to CT.side.
   ============================================================ */
window.TP_DATA = (function () {
  // Body parts. name = the anatomical term; k = kindergarten line; says = older grades; job = what it does (3rd grade).
  // Text in {braces} becomes a tappable science word (see TERMS).
  const PARTS = {
    eye: { name: "eye", sys: "nervous", k: "The {eye|eyes} see food and danger.", says: "The eye senses light and sends a message along the {opticn} to the brain.", job: "Sensing light, to see" },
    brain: { name: "brain", sys: "nervous", k: "The {brain} is the boss. It tells the body what to do.", says: "The brain takes in messages from the senses and decides what to do.", job: "Deciding what the body does" },
    cord: { name: "spinal cord", sys: "nervous", says: "The {cord} carries messages from the brain down the body to the tail muscles.", job: "Carrying messages down the body" },
    mouth: { name: "mouth", sys: "digestive", k: "The {mouth} has tiny rows of teeth that scrape up algae.", says: "Rows of tiny teeth (keratodonts) around the mouth scrape algae off rocks.", job: "Taking in food" },
    gut: { name: "intestine", sys: "digestive", k: "The belly is full of a long, coiled {intestine} that digests food.", says: "The long, coiled {intestine} digests tough plant food like algae.", job: "Digesting food" },
    gills: { name: "gills", sys: "respiratory", k: "{gills|Gills} take oxygen out of the water so the tadpole can breathe.", says: "{gills|Gills} take {oxygen} out of the water.", job: "Taking oxygen out of the water" },
    heart: { name: "heart", sys: "circulatory", k: "The {heart} pumps blood.", says: "The {heart} pumps blood that carries oxygen and food around the body.", job: "Pumping blood around the body" },
    muscle: { name: "tail muscles", sys: "muscular", k: "Strong {muscle|tail muscles} help it swim.", says: "Blocks of tail {muscle|muscle} pull the tail side to side to swim.", job: "Moving the tail to swim" },
    noto: { name: "notochord", sys: "skeletal", says: "The {notochord} is a stiff rod that holds the body straight. In the frog it is replaced by a backbone.", job: "Holding the body straight" },
    tail: { name: "tail", sys: "muscular", k: "The tail swishes to swim." },
    legs: { name: "hind limbs", sys: "muscular", k: "{hindlimb|Hind limbs}, the back legs, grow before they show." },
    arms: { name: "forelimbs", sys: "muscular", k: "{forelimb|Forelimbs}, the front legs, grow last." },
    bladder: { name: "swim bladder", sys: null, says: "The {bladder} is a bag of gas that helps a fish float." },
    backbone: { name: "backbone", sys: "skeletal", says: "The backbone is a chain of {vertebra|vertebrae}. It holds the fish's body up and protects the spinal cord." }
  };
  // The two animals the lab scanned, met at the start of every mission.
  const ANIMALS = {
    tadpole: { name: "River frog tadpole", sci: "Lithobates heckscheri", intro: "A tadpole is the {larva} of a frog: the young form that hatches from an egg and lives in water. The river frog is an {amphibian}, an animal that starts life in water and later lives on land too. Its tadpoles are big and dark, and they swim together in schools.", lives: "Swamps, ponds, and slow rivers of the southeastern United States.", eats: "Mostly algae and bits of plants that it scrapes off rocks and logs.", fact: "River frog tadpoles can grow longer than your hand before they change into frogs. This big change is called {metamorphosis}." },
    fish: { name: "Eastern mosquitofish", sci: "Gambusia holbrooki", intro: "Mosquitofish are small {vertebrate|vertebrates} that live their whole lives in water. They breathe with gills and swim with fins and strong muscles, like a tadpole does.", lives: "Ponds, swamps, ditches, and slow streams of the eastern and southeastern United States, the same waters where river frogs live.", eats: "Mosquito larvae, other insects, and sometimes tadpoles and fish eggs.", fact: "Mosquitofish give birth to live babies instead of laying eggs. They are named for eating mosquito larvae." }
  };
  // Glossary. t = term, say = how to say it (optional), def = kid-friendly definition.
  const TERMS = {
    eye: { t: "eye", def: "The sense organ that detects light, so the animal can see." },
    brain: { t: "brain", def: "The organ that takes in messages from the senses, decides what to do, and sends messages to the muscles." },
    cord: { t: "spinal cord", def: "A thick bundle of nerves that runs from the brain down the back. It carries messages between the brain and the body." },
    mouth: { t: "mouth", def: "The opening where food goes into the digestive system." },
    intestine: { t: "intestine", say: "in-TES-tin", def: "The long tube where food is digested and taken into the body. People often call it the gut." },
    gills: { t: "gills", def: "Feathery organs that take oxygen out of water. Blood flows through them to pick up the oxygen." },
    heart: { t: "heart", def: "The muscle that pumps blood through the body." },
    muscle: { t: "muscle", def: "Body tissue that squeezes (contracts) to make the body move." },
    notochord: { t: "notochord", say: "NOTE-oh-cord", def: "A stiff, bendy rod along the back of a tadpole that holds the body straight. In adult frogs, a backbone takes its place." },
    hindlimb: { t: "hind limbs", def: "The back legs." },
    forelimb: { t: "forelimbs", def: "The front legs." },
    bladder: { t: "swim bladder", def: "A bag of gas inside a fish that helps it float without sinking or rising." },
    vertebra: { t: "vertebrae", say: "VER-teh-bray", def: "The small bones that link together to make the backbone. One is a vertebra." },
    oxygen: { t: "oxygen", def: "A gas in air and water that animals need to get energy from their food." },
    organ: { t: "organ", def: "A body part made of different tissues that work together to do a job, like the heart or the brain." },
    larva: { t: "larva", say: "LAR-vuh", def: "The young form of an animal that looks very different from its parents and will change as it grows. A tadpole is a frog larva." },
    amphibian: { t: "amphibian", say: "am-FIB-ee-un", def: "A vertebrate, like a frog or salamander, that usually starts life in water with gills and later lives on land with lungs." },
    metamorphosis: { t: "metamorphosis", say: "met-uh-MOR-fuh-sis", def: "A big change in body shape as an animal grows up, like a tadpole turning into a frog." },
    vertebrate: { t: "vertebrate", say: "VER-teh-brit", def: "An animal with a backbone (or a notochord when it is young): fish, amphibians, reptiles, birds, and mammals." },
    lifecycle: { t: "life cycle", def: "The stages a living thing goes through as it is born, grows, has young, and dies." },
    froglet: { t: "froglet", def: "A young frog that has four legs and is still losing its tail." },
    external: { t: "external", def: "On the outside of the body." },
    internal: { t: "internal", def: "Inside the body." },
    structure: { t: "structure", def: "A body part, and its shape." },
    function: { t: "function", def: "The job a body part does." },
    habitat: { t: "habitat", def: "The place where an animal lives and finds food, water, and shelter." },
    xray: { t: "X-rays", def: "Invisible light with lots of energy. It passes through soft things, but is blocked more by dense or stained things." },
    ct: { t: "CT scan", def: "Computed tomography. A scanner takes hundreds of X-ray pictures from all around an object, and a computer turns them into slices and a 3D model." },
    slice: { t: "slice", def: "One thin layer of a CT scan, like one slice of a loaf of bread." },
    iodine: { t: "iodine stain", say: "EYE-oh-dine", def: "A brown liquid that soaks into soft tissues. Stained tissue blocks more X-rays, so muscles, nerves, and organs show up in a CT scan. Scientists call this diceCT." },
    grayscale: { t: "grayscale", def: "Made only of shades of gray, from black to white. A CT slice is grayscale: brighter parts blocked more X-rays." },
    segment: { t: "segmentation", def: "When scientists trace each organ in the gray CT slices and give it its own color, to build a labeled 3D model." },
    stimulus: { t: "stimulus", say: "STIM-yuh-lus", def: "Something in the environment that an animal senses, like light, a shadow, a sound, or a smell." },
    response: { t: "response", def: "What the body does because of a stimulus, like swimming away." },
    sensory: { t: "sense organ", def: "A body part, like an eye or ear, with cells that detect a stimulus." },
    neuron: { t: "neuron", say: "NUR-on", def: "A nerve cell. Neurons carry messages as tiny electrical signals." },
    sensoryn: { t: "sensory neurons", def: "Nerve cells that carry messages from a sense organ to the brain or spinal cord." },
    motorn: { t: "motor neurons", def: "Nerve cells that carry messages from the brain and spinal cord out to the muscles." },
    nerve: { t: "nerve", def: "A bundle of neurons that carries messages between the brain and the body." },
    opticn: { t: "optic nerve", def: "The nerve that carries messages from the eye to the brain." },
    producer: { t: "producer", def: "A living thing, like a plant or algae, that makes its own food using energy from the Sun." },
    consumer: { t: "consumer", def: "An animal that gets energy by eating other living things." },
    herbivore: { t: "herbivore", say: "HER-bih-vor", def: "An animal that eats plants or algae." },
    carnivore: { t: "carnivore", def: "An animal that eats other animals." },
    energy: { t: "energy", def: "What living things need to move, grow, and stay warm. It flows from the Sun to producers to consumers." },
    trophic: { t: "trophic level", say: "TRO-fik", def: "A step in a food chain: producers are the first level, the animals that eat them are the second, and so on." },
    pyramid: { t: "energy pyramid", def: "A diagram of how much energy is at each step of a food chain. Only about one tenth of the energy passes up to the next step, so each level is smaller." },
    heat: { t: "heat", def: "Energy that leaves a living thing as warmth while it moves, grows, and keeps its body working. It does not pass up the food chain." },
    digest: { t: "digestion", def: "Breaking food down into tiny pieces the body can take in and use." },
    cell: { t: "cell", def: "The smallest living unit. All living things are made of cells." },
    tissue: { t: "tissue", def: "A group of similar cells that work together, like muscle tissue." },
    system: { t: "organ system", def: "A group of organs that work together to do a big job for the body, like digestion." },
    organism: { t: "organism", def: "A whole living thing." },
    nervous: { t: "nervous system", def: "The brain, spinal cord, nerves, and sense organs. It senses the world, decides, and sends messages." },
    digestive: { t: "digestive system", def: "The mouth, intestine, and other organs that break down food and take it into the body." },
    respiratory: { t: "respiratory system", say: "RES-pur-uh-tor-ee", def: "The organs that take in oxygen and get rid of carbon dioxide: gills in tadpoles and fish, lungs in frogs." },
    circulatory: { t: "circulatory system", say: "SUR-kyuh-luh-tor-ee", def: "The heart, blood, and blood vessels. It carries oxygen and food to every part of the body." },
    muscular: { t: "muscular system", def: "The muscles that move the body." },
    skeletal: { t: "skeletal system", def: "The notochord, bones, and cartilage that support the body and give it shape." }
  };
  const SYSTEMS = {
    nervous: { name: "Nervous", color: "#ffd23f", job: "senses and control", parts: ["eye", "brain", "cord"] },
    digestive: { name: "Digestive", color: "#ff9a52", job: "breaks down food", parts: ["mouth", "gut"] },
    respiratory: { name: "Respiratory", color: "#7fd1ff", job: "takes in oxygen", parts: ["gills"] },
    circulatory: { name: "Circulatory", color: "#ff5c7a", job: "moves blood", parts: ["heart"] },
    muscular: { name: "Muscular", color: "#c99aff", job: "moves the body", parts: ["muscle"] },
    skeletal: { name: "Skeletal", color: "#f3e7cf", job: "support and shape", parts: ["noto"] }
  };
  const STAGES = [
    { id: 0, name: "Tadpole", say: "A young tadpole. No legs yet. It breathes with gills and eats algae." },
    { id: 1, name: "Tadpole with leg buds", say: "Tiny back legs are starting to grow inside." },
    { id: 2, name: "Tadpole with back legs", say: "The back legs are big now. The front legs are growing, hidden under the skin." },
    { id: 3, name: "Froglet", say: "Four legs! The tail is shrinking, lungs take over from gills, and the gut gets shorter for eating bugs." }
  ];
  const GRADES = {
    k: { label: "K", title: "Who's Inside?", std: "K-LS1-1 · K.L1U1.6", say: "Kindergarten. Find the parts of a tadpole and what they do." },
    g1: { label: "1", title: "Growing Up Frog", std: "1-LS3-1 · 1.L1U1.6, 1.L3U1.9", say: "First grade. Watch a tadpole change into a frog, inside and out." },
    g2: { label: "2", title: "Pond Survival Kit", std: "2-LS4-1 · 2.L2U1.9", say: "Second grade. Find the parts a tadpole needs to breathe, eat, and swim in its pond." },
    g3: { label: "3", title: "Slice Explorer", std: "3-LS1-1 · 3.L1U1.5", say: "Third grade. Learn how a CT scanner works, slice through a tadpole to find its organs, match each part to its job, and follow the life cycle." },
    g4: { label: "4", title: "Message Path", std: "4-LS1-1, 4-LS1-2", say: "Fourth grade. Learn how messages travel from a sense organ to the brain and back to a muscle, then follow a tadpole's escape." },
    g5: { label: "5", title: "Gut Check", std: "5-PS3-1, 5-LS2-1", say: "Fifth grade. Find out why a tadpole needs such a long intestine, and follow the energy up a food chain, level by level." },
    g6: { label: "6", title: "Body Systems Lab", std: "MS-LS1-3", say: "Sixth grade. Learn the body systems, name the system for each organ, compare real CT scans with drawings, and see how systems work together." }
  };
  const GRADE_IDS = ["k", "g1", "g2", "g3", "g4", "g5", "g6"];
  // side: one side-view CT image per life stage (0 tadpole, 1 back-leg buds, 2 front legs inside, 3 froglet),
  // shown next to the drawings, e.g. side: ["assets/inside-the-tadpole/side-stage0.png", ...]. Empty = simulated view.
  const CT = { tadpole: [], fish: [], side: [] };
  return { PARTS, ANIMALS, TERMS, SYSTEMS, STAGES, GRADES, GRADE_IDS, CT };
})();
