/* ============================================================
   INSIDE THE TADPOLE data. Body parts, the systems they belong to,
   life-cycle stages, and what each grade does.

   The lab's iodine-stained (diceCT) micro-CT scans show these soft
   tissues. To show real scan slices beside the drawings, export a
   few slices from front to back as PNG or JPG into
   assets/inside-the-tadpole/ and list them in CT below, e.g.
     CT.tadpole = ["assets/inside-the-tadpole/tadpole-001.jpg", ...]
   The slice slider then steps through the real images too.
   ============================================================ */
window.TP_DATA = (function () {
  const PARTS = {
    eye: { name: "eye", sys: "nervous", k: "Eyes see food and danger.", says: "The eye sees light and sends a message to the brain." },
    brain: { name: "brain", sys: "nervous", k: "The brain is the boss. It tells the body what to do.", says: "The brain takes in messages from the senses and decides what to do." },
    cord: { name: "spinal cord", sys: "nervous", says: "The spinal cord carries messages from the brain to the tail muscles." },
    mouth: { name: "mouth", sys: "digestive", k: "The mouth scrapes up algae to eat.", says: "Tiny rows of teeth in the mouth scrape algae off rocks." },
    gut: { name: "gut", sys: "digestive", k: "The belly is full of a long, curly gut that digests food.", says: "The long, coiled gut digests tough plant food like algae." },
    gills: { name: "gills", sys: "respiratory", k: "Gills take air out of the water so the tadpole can breathe.", says: "Gills take oxygen out of the water." },
    heart: { name: "heart", sys: "circulatory", k: "The heart pumps blood.", says: "The heart pumps blood that carries oxygen and food around the body." },
    muscle: { name: "tail muscle", sys: "muscular", k: "Strong tail muscles help it swim.", says: "Blocks of tail muscle pull the tail side to side to swim." },
    noto: { name: "notochord", sys: "skeletal", says: "The notochord is a stiff rod that holds the body straight. In the frog it is replaced by a backbone." },
    tail: { name: "tail", sys: "muscular", k: "The tail swishes to swim." },
    legs: { name: "back legs", sys: "muscular", k: "Back legs grow inside the tadpole before they pop out." },
    arms: { name: "front legs", sys: "muscular", k: "Front legs grow last." },
    bladder: { name: "swim bladder", sys: null, says: "The swim bladder is a bag of gas that helps a fish float." },
    backbone: { name: "backbone", sys: "skeletal", says: "The backbone holds the fish's body up and protects the spinal cord." }
  };
  const SYSTEMS = {
    nervous: { name: "Nervous", color: "#ffd23f", job: "senses and control" },
    digestive: { name: "Digestive", color: "#ff9a52", job: "breaks down food" },
    respiratory: { name: "Respiratory", color: "#7fd1ff", job: "takes in oxygen" },
    circulatory: { name: "Circulatory", color: "#ff5c7a", job: "moves blood" },
    muscular: { name: "Muscular", color: "#c99aff", job: "moves the body" },
    skeletal: { name: "Skeletal", color: "#f3e7cf", job: "support and shape" }
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
    g3: { label: "3", title: "Slice Explorer", std: "3-LS1-1 · 3.L1U1.5", say: "Third grade. Slice through a CT scan to find the parts inside, and follow the life cycle." },
    g4: { label: "4", title: "Message Path", std: "4-LS1-1, 4-LS1-2", say: "Fourth grade. Follow a message from the eye to the brain to the tail." },
    g5: { label: "5", title: "Gut Check", std: "5-PS3-1, 5-LS2-1", say: "Fifth grade. Find out why a tadpole needs such a long gut, and follow the energy." },
    g6: { label: "6", title: "Body Systems Lab", std: "MS-LS1-3", say: "Sixth grade. Sort the parts of a tadpole and a fish into body systems, and see how systems work together." }
  };
  const GRADE_IDS = ["k", "g1", "g2", "g3", "g4", "g5", "g6"];
  const CT = { tadpole: [], fish: [] };
  return { PARTS, SYSTEMS, STAGES, GRADES, GRADE_IDS, CT };
})();
