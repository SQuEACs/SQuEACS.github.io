/* ============================================================
   TADPOLE TREK  ·  SQuEACs Lab
   Guide one tadpole from hatchling to froglet through a polluted
   pond. Heavy metals and PFAS shrink developing brain regions the
   longer your tadpole swims in them; plastic and paper crowd out
   food and slow growth. Every effect size below is illustrative,
   not data. Hypotheses are presented as ideas being tested.
   ============================================================ */
(function () {
  const $ = id => document.getElementById(id);
  const canvas = $("og-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;

  /* ---------- Constants and helpers ---------- */
  const VIEW_H = 360, ARENA = 80, RATE = 4.6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const lerpAngle = (a, b, t) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
  const pct = v => Math.round(v);

  /* ---------- Stages: one tadpole, hatchling to froglet ---------- */
  // sens = made-up sensitivity of the developing brain at that stage (illustrative critical window)
  const STAGES = [
    { id: "hatch", name: "Hatchling",        gosner: "about Gosner 20 to 25", scale: 0.55, eat: 5, sens: 1.0, preds: ["nymph"],                   fact: "why" },
    { id: "feed",  name: "Feeding tadpole",  gosner: "about Gosner 26 to 30", scale: 0.8,  eat: 7, sens: 0.9, preds: ["nymph", "fish"],          fact: "regions" },
    { id: "hind",  name: "Hind-limb tadpole",gosner: "about Gosner 31 to 40", scale: 1.0,  eat: 8, sens: 0.7, preds: ["fish", "heron"],          fact: "windows" },
    { id: "fore",  name: "Forelimb tadpole", gosner: "about Gosner 41 to 45", scale: 1.15, eat: 6, sens: 0.5, preds: ["nymph", "heron", "fish"], fact: "mixture" },
    { id: "meta",  name: "Metamorph",        gosner: "about Gosner 46",       scale: 1.25, eat: 4, sens: 0.3, preds: ["heron", "fish"],          fact: "metamorph" },
  ];
  const NSTAGE = STAGES.length;

  // Brain regions, with the colors of the numbered structures on the lab's 3D model.
  // wM / wP = made-up weights: how strongly metal and PFAS exposure shrink each region.
  const REGIONS = [
    { k: "olf",   name: "Olfactory bulb",  color: "#ff00e4", wM: 0.9, wP: 0.6, job: "smell, so the minimap's food radar" },
    { k: "tel",   name: "Telencephalon",   color: "#ff5900", wM: 1.2, wP: 0.8, job: "memory, so how clearly the minimap shows plumes and rings" },
    { k: "tect",  name: "Optic tectum",    color: "#36ff00", wM: 1.1, wP: 0.6, job: "vision, so how far you can see underwater" },
    { k: "cereb", name: "Cerebellum",      color: "#00b1ff", wM: 0.7, wP: 1.2, job: "coordination, so steering and swimming speed" },
    { k: "med",   name: "Medulla",         color: "#8300ff", wM: 0.5, wP: 1.0, job: "basic body functions, so how fast energy drains" },
  ];
  const RK = REGIONS.map(r => r.k);
  const LOSS_K = 0.2;   // brain points lost = sens x (metal exposure x wM + PFAS exposure x wP) x LOSS_K

  // Pollutant kinds. "grp" is the exposure meter each one fills.
  const ZK = {
    metal:   { name: "Heavy metals", grp: "metal",  color: 0xd9822b, css: "#d9822b", fact: "metal" },
    pfas:    { name: "PFAS",         grp: "pfas",   color: 0xb06cff, css: "#b06cff", fact: "pfas" },
    plastic: { name: "Plastic",      grp: "litter", color: 0x6fd1ff, css: "#6fd1ff", fact: "litter" },
    paper:   { name: "Paper litter", grp: "litter", color: 0xf2efe6, css: "#cfc8b6", fact: "litter" },
  };
  const GRP = { metal: { name: "Metals", css: "#d9822b" }, pfas: { name: "PFAS", css: "#b06cff" }, litter: { name: "Litter", css: "#6fd1ff" } };

  /* ---------- Journal: science cards ---------- */
  const SC = "tadpole-trek-science.html";
  const FACTS = {
    why:       { t: "Tadpoles as sentinels", k: "Bioindicators", x: "Tadpoles absorb water through thin skin and live where pollutants collect, so they work as early-warning animals for pond and river health. Our lab studies the central nervous system of Lithobates heckscheri tadpoles to ask how pollutants might change brain development.", h: "research.html", l: "See the lab's tadpole project" },
    regions:   { t: "Meet the tadpole brain", k: "Brain regions", x: "A tadpole brain has an olfactory bulb for smell, a telencephalon (forebrain), a diencephalon, an optic tectum for vision, a cerebellum for coordination, and a medulla oblongata for basic body functions. You can spin all of them on our 3D model.", h: "models.html", l: "Explore the 3D tadpole brain" },
    cumulative:{ t: "Longer exposure, bigger effect", k: "Dose and duration", x: "How much a pollutant matters depends on how much a tadpole meets and for how long. In the game each meter fills the longer you stay in a plume. Researchers have compared continuous cadmium exposure with short pulses in tadpoles and reported stronger effects from continuous exposure.", h: SC + "#refs", l: "See the sources to verify" },
    windows:   { t: "Hypothesis: critical windows", k: "Sensitive periods", x: "One idea being tested is that a brain is most vulnerable while its regions are forming fastest, so the same exposure could matter more early than late. The game uses a made-up sensitivity that falls from hatchling to metamorph.", h: SC + "#sens", l: "See the sensitivity numbers" },
    metal:     { t: "Hypothesis: heavy metals disturb brain patterning", k: "Developmental neurotoxicity; teratogens", x: "Heavy metals such as cadmium, copper, and lead can act as teratogens, substances that disturb embryonic development. Our lab tests whether metals in river systems change tadpole brain shape and the developmental genes PAX6 and BMP4. In the game, metal plumes shrink the forebrain and optic tectum most. The sizes are illustrative.", h: "research.html", l: "See the lab's tadpole project" },
    pfas:      { t: "Hypothesis: PFAS interfere with brain development", k: "Developmental neurotoxicity; thyroid disruption", x: "PFAS are long-lived chemicals from firefighting foams, coatings, and many products. Researchers are testing whether they disturb the thyroid hormone signals that guide tadpole growth and brain development, and whether they reach the brain directly. Results differ by species, chemical, and dose. The game lets PFAS hit the cerebellum and medulla hardest, which is an illustrative choice.", h: SC + "#refs", l: "See the sources to verify" },
    litter:    { t: "Litter and the food web", k: "Indirect effects; habitat degradation", x: "In this game plastic and paper don't touch the brain. They crowd out the algae tadpoles graze, so your tadpole eats less and grows slower. Real litter can do more, such as breaking into microplastics, and researchers are still working out how much that matters for tadpoles.", h: SC + "#litter", l: "How litter works in the game" },
    mixture:   { t: "Pollutants rarely come alone", k: "Mixture toxicity", x: "Ponds and rivers usually hold several pollutants at once, and combinations can act differently than single chemicals. Some studies find combined effects stronger than either alone and others weaker, depending on the chemicals and the effect measured. The game simply adds exposures together for each region.", h: SC + "#refs", l: "See the sources to verify" },
    metamorph: { t: "Metamorphosis is a hormone story", k: "Thyroid-hormone-driven metamorphosis", x: "A tadpole becomes a froglet when thyroid hormones trigger limb growth, tail loss, and a major rewiring of the brain and gut. That is why scientists pay close attention to chemicals that might disturb the thyroid axis.", h: SC + "#refs", l: "See the sources to verify" },
    species:   { t: "Why Lithobates heckscheri?", k: "River frog", x: "Lithobates heckscheri, the river frog, lives in swamps and river floodplains of the southeastern United States. Our 3D model comes from a microCT scan of a tadpole stained with buffered Lugol's iodine, which makes soft tissue like the brain show up in CT.", h: "models.html", l: "Open the 3D model" },
  };

  /* ---------- Collections ---------- */
  const OUTFITS = {
    lily:   { name: "Lily-pad hat",  slot: "head", req: "Finish stage 1" },
    shades: { name: "Pond shades",   slot: "eyes", req: "Finish a stage without losing a heart" },
    scarf:  { name: "Algae scarf",   slot: "neck", req: "Eat 40 algae in total" },
    crown:  { name: "Tiny crown",    slot: "head", req: "Become a froglet" },
    bow:    { name: "Tail bow",      slot: "tail", req: "Find 6 nature finds" },
    flower: { name: "Flower crown",  slot: "head", req: "Collect 3 bubble treasures" },
    badge:  { name: "Clean badge",   slot: "neck", req: "Finish with every brain region at 80 or more" },
  };
  const DEX = [
    { id: "clean",  name: "Clean Hopper",    tint: "#5fae4e", sub: "Big and sharp. You kept out of the worst water." },
    { id: "slow",   name: "Slow Grower",     tint: "#8aa04a", sub: "Brain mostly fine, but litter kept food scarce." },
    { id: "metal",  name: "Metal-marked",    tint: "#c98a4a", sub: "Heavy metals took the biggest bite." },
    { id: "pfas",   name: "PFAS-marked",     tint: "#9a7fd0", sub: "PFAS exposure hit hardest." },
    { id: "double", name: "Double Trouble",  tint: "#a8725f", sub: "Both metals and PFAS cost you a lot." },
    { id: "lean",   name: "Hungry Hopper",   tint: "#9aa05a", sub: "Litter-poor water left you small." },
    { id: "grit",   name: "Survivor",        tint: "#6f9f6a", sub: "A mixed journey, and you made it." },
  ];
  const TREASURE = [
    { id: "silver", name: "Silver bubble",  c: "#dfe6f2", w: 30, text: "A bright bubble that fills your energy." },
    { id: "pearl",  name: "Pond pearl",     c: "#f6e9f2", w: 22, text: "Smooth and pale, a favorite of snails." },
    { id: "amber",  name: "Amber drop",     c: "#ffb347", w: 18, text: "Sap that sank from a fallen branch." },
    { id: "glass",  name: "Sea-glass chip", c: "#7fe0c8", w: 14, rare: true, text: "Rare. Restores a heart." },
    { id: "seed",   name: "Cattail fluff",  c: "#d8c8a4", w: 10, rare: true, text: "Rare. Restores a heart." },
    { id: "gold",   name: "Golden bubble",  c: "#ffd23f", w: 6,  rare: true, text: "Very rare. Restores a heart." },
  ];
  const NATURE = [
    { id: "duckweed", name: "Duckweed",       shape: "duck",   text: "Tiny floating plants that shade the water and shelter tadpoles." },
    { id: "cattail",  name: "Cattail",        shape: "cattail",text: "Tall pond-edge plants. Their stems host the algae tadpoles graze." },
    { id: "lily",     name: "Water lily",     shape: "lily",   text: "Round pads give shade and hiding places below." },
    { id: "snail",    name: "Ramshorn snail", shape: "snail",  text: "A fellow algae grazer, flat-coiled like a tiny ram's horn." },
    { id: "caddis",   name: "Caddisfly case", shape: "case",   text: "A larva's home, built from sand and twigs." },
    { id: "diatom",   name: "Diatom film",    shape: "diatom", text: "The golden-brown slime on stones. Pure tadpole food." },
    { id: "exuvia",   name: "Dragonfly shed", shape: "shed",   text: "The empty skin of a dragonfly nymph, a clue about who lurks here." },
    { id: "pondweed", name: "Pondweed",       shape: "weed",   text: "Underwater stems where algae and tiny animals collect." },
  ];
  function pickTreasure() { let r = Math.random() * TREASURE.reduce((a, b) => a + b.w, 0); for (const tr of TREASURE) { r -= tr.w; if (r <= 0) return tr; } return TREASURE[0]; }

  /* ---------- Game state ---------- */
  const SAVE_KEY = "squeacs-tadpole-trek";
  const newBrain = () => ({ olf: 100, tel: 100, tect: 100, cereb: 100, med: 100 });
  let G = { screen: "title", stage: 0, brain: newBrain(), size: 0, history: [], life: [], seen: {}, unlocked: {}, worn: {}, dex: {}, treasure: {}, nature: {}, gallery: [], opts: { preds: true }, inRun: false, totals: { eaten: 0, finds: 0, gems: 0 }, retry: 0 };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    if (s.v === 1) {
      ["unlocked", "worn", "dex", "treasure", "nature", "seen"].forEach(k => { if (s[k]) G[k] = s[k]; });
      if (s.opts) G.opts = s.opts; if (s.gallery) G.gallery = s.gallery; if (s.totals) G.totals = s.totals; if (s.life) G.life = s.life;
      if (s.run && s.run.history) { Object.assign(G, s.run); G.inRun = true; }
    }
  } catch (e) {}
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, unlocked: G.unlocked, worn: G.worn, dex: G.dex, treasure: G.treasure, nature: G.nature, seen: G.seen, opts: G.opts, gallery: G.gallery.slice(-30), totals: G.totals, life: G.life.slice(-60),
    run: G.inRun ? { stage: G.stage, brain: G.brain, size: G.size, history: G.history } : null })); } catch (e) {} };
  const hasCollections = () => Object.keys(G.unlocked).length || Object.keys(G.dex).length || Object.keys(G.treasure).length || G.gallery.length || Object.keys(G.seen).length || Object.keys(G.nature).length;

  /* ---------- Sizing ---------- */
  let scale = 1, viewW = 640, dpr = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    scale = r.height / VIEW_H; viewW = r.width / scale;
  }

  /* ---------- Sound: low pitches only (every tone is 330 Hz or lower) ---------- */
  let ac = null, muted = false;
  function audio() { if (muted) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; } catch (e) { return null; } }
  function beep(f, d = 0.09, type = "triangle", vol = 0.05) {
    const a = audio(); if (!a) return;
    try { f = Math.min(f, 330); const o = a.createOscillator(), g = a.createGain(); o.type = type === "square" ? "triangle" : type; o.frequency.value = f; g.gain.value = vol;
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + d); } catch (e) {}
  }
  let noiseBuf = null;
  function noise(a) { if (noiseBuf) return noiseBuf; const b = a.createBuffer(1, Math.floor(a.sampleRate * 0.8), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noiseBuf = b); }
  function env(a, g, vol, att, dur) { const t = a.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function sfx(kind, vol = 0.1) {
    const a = audio(); if (!a) return;
    vol = clamp(vol, 0.005, 0.25); const t = a.currentTime, g = a.createGain(); g.connect(a.destination);
    const osc = (type, f) => { const o = a.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; };
    const lp = f => { const n = a.createBiquadFilter(); n.type = "lowpass"; n.frequency.value = f; return n; };
    if (kind === "heron") {          // low croak
      const o = osc("sawtooth", 150); o.frequency.exponentialRampToValueAtTime(95, t + 0.7); const f = lp(420); o.connect(f); f.connect(g); env(a, g, vol, 0.06, 0.75); o.start(t); o.stop(t + 0.8);
    } else if (kind === "thump") {   // nymph lunge
      const o = osc("sine", 110); o.frequency.exponentialRampToValueAtTime(60, t + 0.25); o.connect(g); env(a, g, vol * 1.2, 0.02, 0.3); o.start(t); o.stop(t + 0.35);
    } else if (kind === "swish") {   // fish
      const n = a.createBufferSource(); n.buffer = noise(a); const f = lp(500); n.connect(f); f.connect(g); env(a, g, vol * 0.8, 0.12, 0.5); n.start(t); n.stop(t + 0.55);
    } else if (kind === "pop") {     // eating algae
      const o = osc("sine", 230); o.frequency.exponentialRampToValueAtTime(150, t + 0.09); o.connect(g); env(a, g, vol, 0.01, 0.12); o.start(t); o.stop(t + 0.14);
    } else if (kind === "hurt") {
      const o = osc("sawtooth", 120); o.frequency.exponentialRampToValueAtTime(70, t + 0.4); const f = lp(300); o.connect(f); f.connect(g); env(a, g, vol, 0.03, 0.45); o.start(t); o.stop(t + 0.5);
    } else if (kind === "splash") {
      const n = a.createBufferSource(); n.buffer = noise(a); const f = lp(700); n.connect(f); f.connect(g); env(a, g, vol, 0.02, 0.35); n.start(t); n.stop(t + 0.4);
    } else if (kind === "gem") {     // soft low chime
      [196, 247, 294].forEach((fr, i) => { const o = a.createOscillator(), gg = a.createGain(); o.type = "sine"; o.frequency.value = fr; o.connect(gg); gg.connect(a.destination); const st = t + i * 0.08; gg.gain.setValueAtTime(0.0001, st); gg.gain.exponentialRampToValueAtTime(vol, st + 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, st + 0.3); o.start(st); o.stop(st + 0.35); });
    }
  }
  const jingle = () => [165, 196, 247, 294].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.06), i * 100));

  /* ---------- Science card panel and toasts ---------- */
  function renderFact(key) {
    const f = FACTS[key], found = Object.keys(FACTS).filter(k => G.seen[k]);
    const box = $("og-fact");
    box.innerHTML = `<p class="og-kicker">Science card</p><h3>${f.t}</h3>
      <p class="og-known"><span>Known as</span> ${f.k}</p><p>${f.x}</p><a href="${f.h}">${f.l} →</a>
      <div class="fact-log"><p class="label">Cards found: ${found.length} of ${Object.keys(FACTS).length}</p>
      <div class="fact-chips">${found.map(k => `<button type="button" class="fact-chip" data-fact="${k}" aria-pressed="${k === key}">${FACTS[k].t.replace(/^Hypothesis: /, "").replace(/^./, c => c.toUpperCase())}</button>`).join("")}</div></div>`;
    box.querySelectorAll(".fact-chip").forEach(b => b.addEventListener("click", () => renderFact(b.dataset.fact)));
  }
  function showFact(key) {
    if (G.seen[key]) return;
    G.seen[key] = true; renderFact(key); flag("journal"); save();
    const box = $("og-fact"); box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
    toast("New science card in your Journal (J): " + FACTS[key].t.replace(/^Hypothesis: /, ""));
  }
  let toastT = 0;
  function toast(msg, secs = 3) { const el = $("og-toast"); el.textContent = msg; el.hidden = false; toastT = secs; }
  const JOURNAL_START = $("og-fact").innerHTML;
  function resetJournal() { $("og-fact").innerHTML = JOURNAL_START; }

  /* ---------- Picture icons ---------- */
  const SV = (body, vb = "0 0 32 32") => `<svg class="og-ic" viewBox="${vb}" aria-hidden="true" stroke="#0b0a10" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
  const ICON = {
    algae:   SV('<circle cx="11" cy="20" r="6" fill="#7bd96b"/><circle cx="20" cy="17" r="7" fill="#4fc15b"/><circle cx="16" cy="25" r="3.5" fill="#9be564"/>'),
    heart:   SV('<path d="M16 27 C5 19 4 10 10 8 C13 7 15 9 16 11 C17 9 19 7 22 8 C28 10 27 19 16 27Z" fill="#ff3b5c"/>'),
    bolt:    SV('<path d="M18 3 L8 18 H15 L13 29 L24 13 H17 Z" fill="#ffe066"/>'),
    flag:    SV('<path d="M9 28 V5" fill="none"/><path d="M9 6 L26 10 L9 16Z" fill="#3ddc6f"/><path d="M14 28 Q14 22 12 19 M19 28 Q19 22 22 19" fill="none" stroke="#2f7a45" stroke-width="2.4"/>'),
    ring:    SV('<circle cx="16" cy="16" r="10" fill="none" stroke="#0b0a10" stroke-width="7"/><circle cx="16" cy="16" r="10" fill="none" stroke="#3ddc6f" stroke-width="3.2"/>'),
    metal:   SV('<path d="M16 4 C22 12 25 16 25 20 A9 9 0 0 1 7 20 C7 16 10 12 16 4Z" fill="#d9822b"/><path d="M12 21 Q12 25 16 25" fill="none" stroke="#fff" stroke-width="1.8"/>'),
    pfas:    SV('<circle cx="12" cy="19" r="7" fill="#b08cff"/><circle cx="21" cy="12" r="5" fill="#e0d0ff"/><circle cx="22" cy="22" r="3.5" fill="#fff"/>'),
    plastic: SV('<rect x="12" y="4" width="8" height="5" rx="1" fill="#fff"/><path d="M11 9 H21 L23 14 V26 A2 2 0 0 1 21 28 H11 A2 2 0 0 1 9 26 V14Z" fill="#7fd1ff"/><path d="M9 18 H23" fill="none" stroke-width="1.6"/>'),
    paper:   SV('<path d="M8 4 H20 L25 9 V28 H8Z" fill="#fff"/><path d="M20 4 V9 H25" fill="none"/><path d="M12 15 H21 M12 20 H21" fill="none" stroke-width="1.6"/>'),
    litter:  SV('<path d="M5 20 L13 6 L20 12 L11 26Z" fill="#fff"/><rect x="17" y="14" width="9" height="13" rx="2" fill="#7fd1ff"/>'),
    heron:   SV('<path d="M5 25 Q12 15 20 21 Q21 13 23 7 L27 10 L24 13 Q25 23 14 29 Z" fill="#cfd9e6"/><path d="M23 7 L31 8 L24 11Z" fill="#ffb347"/><circle cx="23.5" cy="9" r="1" fill="#0b0a10" stroke="none"/>'),
    nymph:   SV('<ellipse cx="16" cy="18" rx="10" ry="6" fill="#8a6440"/><circle cx="8" cy="16" r="3" fill="#a9825a"/><path d="M10 23 L6 28 M16 24 L16 29 M22 23 L26 28 M10 13 L6 8 M22 13 L26 8" fill="none" stroke-width="1.8"/>'),
    fish:    SV('<path d="M4 16 Q12 6 22 14 L28 8 V24 L22 18 Q12 26 4 16Z" fill="#6fa3d8"/><circle cx="10" cy="14" r="1.5" fill="#0b0a10" stroke="none"/>'),
    dive:    SV('<circle cx="16" cy="16" r="12" fill="#2ed3c6"/><path d="M16 8 V22 M10 16 L16 23 L22 16" fill="none" stroke-width="3"/>'),
    hide:    SV('<path d="M7 28 Q8 16 5 6 M14 28 Q14 14 14 4 M21 28 Q20 16 25 7" fill="none" stroke="#2f7a45" stroke-width="3.4"/><path d="M7 28 Q8 16 5 6 M14 28 Q14 14 14 4 M21 28 Q20 16 25 7" fill="none" stroke="#6fd36f" stroke-width="1.6"/>'),
    away:    SV('<circle cx="16" cy="16" r="12" fill="#ffe066"/><path d="M8 16 H23 M17 9 L24 16 L17 23" fill="none" stroke-width="3"/>'),
    gem:     SV('<path d="M16 4 L26 12 L16 28 L6 12Z" fill="#a47bff"/><path d="M6 12 H26" fill="none"/>'),
    brain:   SV('<path d="M16 5 C10 3 5 7 6 13 C3 16 5 23 10 23 C12 27 16 26 16 24 C16 26 20 27 22 23 C27 23 29 16 26 13 C27 7 22 3 16 5Z" fill="#ff9fc8"/><path d="M16 5 V24" fill="none" stroke-width="1.6"/>'),
    eye:     SV('<path d="M3 16 Q16 4 29 16 Q16 28 3 16Z" fill="#fff"/><circle cx="16" cy="16" r="5" fill="#36ff00"/><circle cx="16" cy="16" r="2.2" fill="#0b0a10" stroke="none"/>'),
    nose:    SV('<path d="M16 5 C9 12 8 20 12 25 C14 27 18 27 20 25 C24 20 23 12 16 5Z" fill="#ffb3e6"/><path d="M13 19 Q16 22 19 19" fill="none" stroke-width="1.6"/>'),
    legs:    SV('<ellipse cx="16" cy="14" rx="8" ry="6" fill="#5fae4e"/><path d="M9 17 L4 26 M23 17 L28 26" fill="none" stroke-width="3.4"/>'),
  };
  const KEY = k => `<kbd class="og-key">${k}</kbd>`;

  /* ---------- 2D drawing: tadpole, froglet, brain, collection art ---------- */
  function drawTad2D(c, x, y, o = {}) {
    const k = (o.k || 1) * 1.0, st = o.stage == null ? 1 : o.stage, t = o.time || 0, wag = Math.sin(t * 7) * 6 * k, worn = o.worn || {};
    c.save(); c.translate(x, y); c.scale(k, k);
    const sc = [0.7, 0.85, 1, 1.1, 1.18][st], tailL = [60, 78, 88, 76, 38][st];
    c.scale(sc, sc);
    c.lineWidth = 2.2; c.strokeStyle = "#0b0a10"; c.lineJoin = "round";
    // tail with fin
    c.fillStyle = "#8aa860"; c.beginPath(); c.moveTo(-14, -3); c.bezierCurveTo(-tailL * 0.4, -20 + wag, -tailL * 0.8, -14 + wag, -tailL - 10, 2 + wag); c.bezierCurveTo(-tailL * 0.8, 16 + wag, -tailL * 0.4, 18 + wag * 0.5, -14, 7); c.closePath(); c.fill(); c.stroke();
    if (worn.bow) { c.fillStyle = "#ff5fa2"; c.beginPath(); c.moveTo(-22, 2); c.lineTo(-34, -7); c.lineTo(-34, 11); c.closePath(); c.moveTo(-22, 2); c.lineTo(-10, -7); c.lineTo(-10, 11); c.closePath(); c.fill(); c.stroke(); }
    // hind limbs from stage 2, forelimbs from stage 3
    c.fillStyle = "#6f9448";
    if (st >= 2) { c.beginPath(); c.ellipse(-12, 13, 7, 4, 0.6, 0, 7); c.fill(); c.stroke(); }
    if (st >= 3) { c.beginPath(); c.ellipse(8, 14, 5, 3, -0.4, 0, 7); c.fill(); c.stroke(); }
    // body
    c.fillStyle = o.tint || "#5a6b3a"; c.beginPath(); c.ellipse(0, 2, 22, 15, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.18)"; c.beginPath(); c.ellipse(-2, 8, 14, 6, 0, 0, 7); c.fill();
    // eyes
    c.fillStyle = "#fff"; c.beginPath(); c.arc(11, -9, 5.5, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#0b0a10"; c.beginPath(); c.arc(12.5, -9, 2.6, 0, 7); c.fill();
    if (worn.shades) { c.fillStyle = "#0b0a10"; c.fillRect(4, -14, 16, 7); }
    if (worn.scarf) { c.fillStyle = "#7bd96b"; c.beginPath(); c.ellipse(-4, 4, 5, 14, 0.15, 0, 7); c.fill(); c.stroke(); }
    if (worn.badge) { c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(4, 8, 4, 0, 7); c.fill(); c.stroke(); }
    if (worn.lily) { c.fillStyle = "#4fa84f"; c.beginPath(); c.ellipse(2, -14, 12, 4, 0, 0, 7); c.fill(); c.stroke(); }
    if (worn.crown) { c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-6, -13); c.lineTo(-6, -22); c.lineTo(-1, -16); c.lineTo(3, -23); c.lineTo(7, -16); c.lineTo(12, -22); c.lineTo(12, -13); c.closePath(); c.fill(); c.stroke(); }
    if (worn.flower) { [[-4, -15, "#ff8fc8"], [2, -18, "#ffe066"], [8, -15, "#c9a8ff"]].forEach(([fx, fy, col]) => { c.fillStyle = col; c.beginPath(); c.arc(fx, fy, 3.6, 0, 7); c.fill(); c.stroke(); }); }
    c.restore();
  }
  function drawFrog2D(c, x, y, o = {}) {
    const k = o.k || 1, worn = o.worn || {}, sm = o.small ? 0.78 : 1;
    c.save(); c.translate(x, y); c.scale(k * sm, k * sm); c.lineWidth = 2.2; c.strokeStyle = "#0b0a10"; c.lineJoin = "round";
    c.fillStyle = o.tint || "#5fae4e";
    c.beginPath(); c.ellipse(-20, 14, 14, 7, 0.2, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(20, 14, 14, 7, -0.2, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, 4, 26, 19, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.22)"; c.beginPath(); c.ellipse(0, 12, 17, 8, 0, 0, 7); c.fill();
    if (o.spots) { c.fillStyle = "rgba(11,10,16,0.28)"; [[-10, -2], [8, -4], [14, 6], [-4, 6]].forEach(([sx, sy]) => { c.beginPath(); c.arc(sx, sy, 3, 0, 7); c.fill(); }); }
    [-1, 1].forEach(s => { c.fillStyle = o.tint || "#5fae4e"; c.beginPath(); c.arc(s * 11, -14, 8, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(s * 11, -14, 5, 0, 7); c.fill(); c.fillStyle = "#0b0a10"; c.beginPath(); c.arc(s * 11 + 1, -14, 2.6, 0, 7); c.fill(); });
    c.strokeStyle = "#0b0a10"; c.beginPath(); c.moveTo(-9, 6); c.quadraticCurveTo(0, 12, 9, 6); c.stroke();
    if (worn.shades) { c.fillStyle = "#0b0a10"; c.fillRect(-22, -20, 44, 8); }
    if (worn.crown) { c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-10, -22); c.lineTo(-10, -32); c.lineTo(-4, -26); c.lineTo(0, -34); c.lineTo(4, -26); c.lineTo(10, -32); c.lineTo(10, -22); c.closePath(); c.fill(); c.stroke(); }
    if (worn.lily) { c.fillStyle = "#4fa84f"; c.beginPath(); c.ellipse(0, -24, 14, 4, 0, 0, 7); c.fill(); c.stroke(); }
    if (worn.flower) { [[-7, -26, "#ff8fc8"], [0, -29, "#ffe066"], [7, -26, "#c9a8ff"]].forEach(([fx, fy, col]) => { c.fillStyle = col; c.beginPath(); c.arc(fx, fy, 4, 0, 7); c.fill(); c.stroke(); }); }
    if (worn.scarf) { c.fillStyle = "#7bd96b"; c.beginPath(); c.ellipse(0, 4, 22, 5, 0, 0, 7); c.fill(); c.stroke(); }
    if (worn.badge) { c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 14, 4.5, 0, 7); c.fill(); c.stroke(); }
    c.restore();
  }

  // Top view of the tadpole brain. scores = {olf, tel, tect, cereb, med} out of 100; ghost draws the clean-water outline.
  function sizeCanvas(cv) { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d) || cv.width; cv.height = Math.round(r.height * d) || cv.height; const c = cv.getContext("2d"); c.setTransform(1, 0, 0, 1, 0, 0); return { c, w: cv.width, h: cv.height, d }; }
  function drawBrain(sc, cv = $("og-brain"), opts = {}) {
    if (!cv) return;
    const o = sizeCanvas(cv), c = o.c; c.clearRect(0, 0, o.w, o.h);
    const k = Math.min(o.w / 150, o.h / 110) || 1; c.save(); c.translate(o.w / 2, o.h / 2 + 4 * k); c.scale(k, k);
    // regions: [key, [cx, cy, rx, ry] left side (mirrored), color]; spinal cord is a fixed tail
    const R = {
      olf:   [[-8, -44, 6, 8], "#ff00e4"], tel: [[-14, -26, 12, 15], "#ff5900"], die: [[-6, -8, 7, 6], "#ffbf00"],
      tect:  [[-14, 6, 11, 11], "#36ff00"], cereb: [[0, 22, 17, 5], "#00b1ff"], med: [[0, 38, 8, 14], "#8300ff"],
    };
    const f = key => key === "die" ? 1 : 0.35 + 0.65 * clamp(sc[key], 0, 100) / 100;
    const shape = (key, mirror, fill, ghost) => {
      const [cx, cy, rx, ry] = R[key][0], s = ghost ? 1 : f(key);
      c.beginPath(); c.ellipse((mirror ? -cx : cx) * (ghost ? 1 : 1), cy, Math.max(2, rx * s), Math.max(2, ry * s), 0, 0, 7);
      if (ghost) { c.setLineDash([3, 3]); c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 1; c.stroke(); c.setLineDash([]); }
      else { c.fillStyle = fill; c.fill(); c.strokeStyle = "#0b0a10"; c.lineWidth = 1.3; c.stroke(); }
    };
    c.strokeStyle = "#cfa8f6"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 48); c.lineTo(0, 58); c.stroke();
    if (!opts.noGhost) Object.keys(R).forEach(key => { if (key === "cereb" || key === "med") shape(key, false, null, true); else { shape(key, false, null, true); shape(key, true, null, true); } });
    Object.keys(R).forEach(key => {
      const dim = key !== "die" && sc[key] < 70 ? 0.78 : 1; c.globalAlpha = dim;
      if (key === "cereb" || key === "med") shape(key, false, R[key][1]); else { shape(key, false, R[key][1]); shape(key, true, R[key][1]); }
      c.globalAlpha = 1;
    });
    c.restore();
  }
  function paintTile(cv, worn, locked, stage = 3) {
    const c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height); c.save();
    drawTad2D(c, 96, 56, { k: 0.8, stage, worn: worn || {} });
    if (locked) { c.globalCompositeOperation = "source-atop"; c.fillStyle = "rgba(11,10,16,0.92)"; c.fillRect(0, 0, cv.width, cv.height); }
    c.restore();
  }
  function drawGem(c, tr, locked, w = 140, h = 100) {
    c.clearRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2);
    const col = locked ? "#2b2540" : tr.c; c.lineWidth = 3; c.strokeStyle = "#0b0a10";
    c.fillStyle = col; c.beginPath(); c.arc(0, 4, 26, 0, 7); c.fill(); c.stroke();
    if (!locked) { c.fillStyle = "rgba(255,255,255,0.65)"; c.beginPath(); c.ellipse(-9, -6, 8, 5, -0.6, 0, 7); c.fill(); }
    c.restore();
  }
  function drawNature(c, n, locked, w = 140, h = 100) {
    c.clearRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2 + 6); c.lineWidth = 2.6; c.strokeStyle = "#0b0a10"; c.lineJoin = "round"; c.lineCap = "round";
    const F = (a, b) => locked ? "#2b2540" : a;
    switch (n.shape) {
      case "duck": [[-18, 6], [0, -2], [16, 8], [4, 14]].forEach(([x, y]) => { c.fillStyle = F("#6fd36f"); c.beginPath(); c.ellipse(x, y, 11, 6, 0, 0, 7); c.fill(); c.stroke(); }); break;
      case "cattail": c.strokeStyle = locked ? "#4a4160" : "#2f7a45"; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, 32); c.lineTo(-6, -22); c.stroke(); c.strokeStyle = "#0b0a10"; c.lineWidth = 2.6; c.fillStyle = F("#8a5a2b"); c.beginPath(); c.roundRect ? c.roundRect(-11, -34, 10, 22, 5) : c.rect(-11, -34, 10, 22); c.fill(); c.stroke(); c.fillStyle = F("#4fc15b"); c.beginPath(); c.moveTo(4, 32); c.quadraticCurveTo(16, 6, 28, -4); c.quadraticCurveTo(14, 18, 12, 32); c.fill(); c.stroke(); break;
      case "lily": c.fillStyle = F("#4fa84f"); c.beginPath(); c.moveTo(0, 6); c.arc(0, 6, 30, 0.35, Math.PI * 2 - 0.1); c.closePath(); c.fill(); c.stroke(); c.fillStyle = F("#ffb3e6"); c.beginPath(); c.arc(8, 0, 8, 0, 7); c.fill(); c.stroke(); break;
      case "snail": c.fillStyle = F("#c9a574"); c.beginPath(); c.arc(0, 4, 20, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(0, 4, 11, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 4, 4, 0, 7); c.stroke(); c.fillStyle = F("#a8a090"); c.beginPath(); c.ellipse(16, 22, 18, 6, 0, 0, 7); c.fill(); c.stroke(); break;
      case "case": c.fillStyle = F("#a07a4a"); c.beginPath(); c.moveTo(-26, 14); c.lineTo(18, 0); c.lineTo(24, 14); c.lineTo(-20, 28); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = locked ? "#4a4160" : "#6b4a2b"; c.lineWidth = 2; for (let i = -14; i < 18; i += 8) { c.beginPath(); c.moveTo(i, 8); c.lineTo(i + 4, 24); c.stroke(); } break;
      case "diatom": c.fillStyle = F("#b88a3a"); c.beginPath(); c.ellipse(0, 8, 32, 17, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = F("#e0b45a"); [[-12, 4], [6, 0], [14, 12], [-4, 14], [-20, 14]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); }); break;
      case "shed": c.fillStyle = F("#d9c9a0"); c.beginPath(); c.ellipse(0, 6, 24, 12, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-14, 14); c.lineTo(-22, 28); c.moveTo(0, 17); c.lineTo(0, 31); c.moveTo(14, 14); c.lineTo(22, 28); c.moveTo(-14, -2); c.lineTo(-22, -16); c.moveTo(14, -2); c.lineTo(22, -16); c.stroke(); break;
      default: c.strokeStyle = locked ? "#4a4160" : "#3a8a4a"; c.lineWidth = 4; [-14, 0, 14].forEach(x => { c.beginPath(); c.moveTo(x, 32); c.quadraticCurveTo(x + 10, 6, x - 4, -26); c.stroke(); }); c.fillStyle = F("#6fd36f"); [[-8, -6], [8, -14], [-2, 8]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 8, 4, 0.5, 0, 7); c.fill(); }); break;
    }
    c.restore();
  }
  function tile(id, name, sub, unlocked, extra = "") {
    return `<div class="og-tile ${unlocked ? "" : "locked"}" data-id="${id}"><canvas width="156" height="104" data-id="${id}" aria-hidden="true"></canvas><b>${unlocked ? name : "???"}</b><span>${sub}</span>${extra}</div>`;
  }
  function renderCloset() {
    const ids = Object.keys(OUTFITS), box = $("og-closet");
    box.innerHTML = ids.map(id => { const o = OUTFITS[id], u = G.unlocked[id]; return `<button type="button" class="og-tile ${u ? "" : "locked"}" data-id="${id}" ${u ? "" : "disabled"} aria-pressed="${!!G.worn[id]}" style="cursor:${u ? "pointer" : "default"}"><canvas width="156" height="104" aria-hidden="true"></canvas><b>${u ? o.name : "???"}</b><span>${u ? (G.worn[id] ? "Wearing" : "Tap to wear") : o.req}</span></button>`; }).join("");
    box.querySelectorAll(".og-tile").forEach((b, i) => { const id = ids[i]; paintTile(b.querySelector("canvas"), { [id]: true }, !G.unlocked[id], 3);
      b.addEventListener("click", () => { if (!G.unlocked[id]) return; const slot = OUTFITS[id].slot, was = G.worn[id]; Object.keys(G.worn).forEach(k => { if (OUTFITS[k].slot === slot) G.worn[k] = false; }); G.worn[id] = !was; save(); beep(220, 0.06, "triangle", 0.04); renderCloset(); }); });
    $("og-outfit-count").textContent = `${ids.filter(i => G.unlocked[i]).length} of ${ids.length}`;
  }
  function renderDex() {
    const box = $("og-dex");
    box.innerHTML = DEX.map(d => tile(d.id, d.name, G.dex[d.id] ? d.sub : "Finish a trek to find out.", G.dex[d.id])).join("");
    DEX.forEach(d => { const cv = box.querySelector(`canvas[data-id="${d.id}"]`), c = cv.getContext("2d"); c.clearRect(0, 0, 156, 104); drawFrog2D(c, 78, 62, { k: 1.05, tint: d.tint, spots: d.id === "grit" || d.id === "double", small: d.id === "slow" || d.id === "lean" });
      if (!G.dex[d.id]) { c.globalCompositeOperation = "source-atop"; c.fillStyle = "rgba(11,10,16,0.92)"; c.fillRect(0, 0, 156, 104); c.globalCompositeOperation = "source-over"; } });
    $("og-dex-count").textContent = `${DEX.filter(d => G.dex[d.id]).length} of ${DEX.length}`;
  }
  function renderTreasure() {
    const box = $("og-treasure");
    box.innerHTML = TREASURE.map(t => tile(t.id, t.name, G.treasure[t.id] ? t.text : "Not found yet.", G.treasure[t.id])).join("");
    TREASURE.forEach(t => drawGem(box.querySelector(`canvas[data-id="${t.id}"]`).getContext("2d"), t, !G.treasure[t.id], 156, 104));
    $("og-treasure-count").textContent = `${TREASURE.filter(t => G.treasure[t.id]).length} of ${TREASURE.length}`;
  }
  function renderNature() {
    const box = $("og-nature");
    box.innerHTML = `<div class="og-tiles">${NATURE.map(n => tile(n.id, n.name, G.nature[n.id] ? n.text : "Not found yet.", G.nature[n.id])).join("")}</div>`;
    NATURE.forEach(n => drawNature(box.querySelector(`canvas[data-id="${n.id}"]`).getContext("2d"), n, !G.nature[n.id], 156, 104));
    $("og-nature-count").textContent = `${NATURE.filter(n => G.nature[n.id]).length} of ${NATURE.length}`;
  }
  function unlock(id) {
    if (G.unlocked[id]) return;
    G.unlocked[id] = true; const slot = OUTFITS[id].slot;
    Object.keys(G.worn).forEach(k => { if (OUTFITS[k].slot === slot) G.worn[k] = false; });
    G.worn[id] = true; save(); renderCloset(); jingle(); flag("wardrobe");
    setTimeout(() => toast("Outfit unlocked: " + OUTFITS[id].name + "! See your Wardrobe (O)."), 400);
  }

  /* ============================================================
     3D POND
     ============================================================ */
  const T3 = window.THREE;
  const glc = $("og-3d");
  const stageEl = document.querySelector(".og-stage");
  let S = null, keys = {}, running = false, lastT = 0, R3 = null;
  const stick = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
  let look = null, touchMode = coarse;

  // Pond outline and depth. pd < 0 is water; the clean habitat sits at the east end, the outfall pipe at the west.
  const POND = { rx: 70, rz: 38 }, CLEAN = { x: 52, z: 0, r: 11 };
  function pd(x, z) { const a = Math.atan2(z, x), wob = 1 + 0.06 * Math.sin(a * 3 + 1.2) + 0.045 * Math.sin(a * 5 + 0.4); return (Math.hypot(x / POND.rx, z / POND.rz) - wob) * 36; }
  const isWater = (x, z) => pd(x, z) < 0;
  const depthAt = (x, z) => 0.8 + 3.8 * smooth(0, 14, -pd(x, z));
  function groundY(x, z) { const d = pd(x, z); return d < 0 ? -depthAt(x, z) : 0.12 + smooth(0, 8, d) * 1.7; }
  function randWater(minD = 3) { for (let i = 0; i < 300; i++) { const x = rand(-68, 68), z = rand(-36, 36); if (pd(x, z) < -minD) return [x, z]; } return [0, 0]; }
  const M = (c, o = {}) => new T3.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, ...o });
  const MB = (c, op) => new T3.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, side: T3.DoubleSide });

  /* ----- Pollutant plumes for one stage ----- */
  function makeZones(si) {
    const zs = [], add = (kind, x, z, r) => zs.push({ kind, x, z, r });
    add("metal", -50, -5, 13); add("pfas", -54, 8, 12);                    // the outfall plume you start in
    const kinds = ["metal", "pfas", "plastic", "plastic", "paper", "paper"]; for (let i = 0; i < si; i++) kinds.push(pick(["metal", "pfas", "plastic", "paper"]));
    kinds.sort(() => Math.random() - 0.5);
    kinds.forEach(kind => {
      const r = rand(8, 11);
      for (let i = 0; i < 80; i++) {
        const x = rand(-34, 38), z = rand(-27, 27);
        if (pd(x, z) > -r * 0.5 || Math.hypot(x - CLEAN.x, z - CLEAN.z) < CLEAN.r + r + 4) continue;
        if (zs.some(o => Math.hypot(o.x - x, o.z - z) < (o.r + r) * 0.75)) continue;
        add(kind, x, z, r); break;
      }
    });
    if (!zs.some(o => (o.kind === "plastic" || o.kind === "paper") && Math.abs(o.z) < 14 && o.x > -30 && o.x < 30)) add(pick(["plastic", "paper"]), rand(-8, 10), rand(-6, 6), 8);   // always some litter on the straight route
    return zs;
  }
  const strength = (z, x, zz) => Math.pow(clamp(1 - Math.hypot(x - z.x, zz - z.z) / z.r, 0, 1), 0.7);

  /* ----- Meshes ----- */
  function buildTad(si, worn = {}) {
    const g = new T3.Group(), sc = STAGES[si].scale * 1.5;
    const body = new T3.Mesh(new T3.SphereGeometry(0.5, 18, 14), M(0x5b6b3a)); body.scale.set(1, 0.8, 1.35); g.add(body);
    const belly = new T3.Mesh(new T3.SphereGeometry(0.46, 14, 10), M(0xb9c78a)); belly.scale.set(0.9, 0.55, 1.2); belly.position.set(0, -0.14, 0.04); g.add(belly);
    [-1, 1].forEach(s => { const e = new T3.Mesh(new T3.SphereGeometry(0.13, 10, 8), M(0xffffff)); e.position.set(s * 0.27, 0.3, 0.5); g.add(e); const p = new T3.Mesh(new T3.SphereGeometry(0.075, 8, 6), M(0x0b0a10)); p.position.set(s * 0.3, 0.31, 0.6); g.add(p); });
    const tail = new T3.Group(); tail.position.set(0, 0, -0.6); g.add(tail);
    const tl = si === 4 ? 0.55 : 1;
    const tm = new T3.Mesh(new T3.SphereGeometry(0.5, 14, 8), M(0x8aa860)); tm.scale.set(0.1, 0.4, 1.5 * tl); tm.position.z = -0.75 * tl; tail.add(tm);
    if (si >= 2) [-1, 1].forEach(s => { const l = new T3.Mesh(new T3.SphereGeometry(0.2, 8, 6), M(0x6f9448)); l.scale.set(0.5, 0.4, 1.1); l.position.set(s * 0.42, -0.12, -0.55); l.rotation.y = s * 0.5; g.add(l); });
    if (si >= 3) [-1, 1].forEach(s => { const l = new T3.Mesh(new T3.SphereGeometry(0.15, 8, 6), M(0x6f9448)); l.scale.set(0.45, 0.4, 0.9); l.position.set(s * 0.46, -0.1, 0.3); l.rotation.y = -s * 0.4; g.add(l); });
    if (worn.lily) { const d = new T3.Mesh(new T3.CylinderGeometry(0.3, 0.3, 0.05, 14), M(0x4fa84f)); d.position.set(0, 0.46, 0.1); g.add(d); }
    if (worn.crown) { const cr = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.2, 0.18, 8, 1, true), M(0xffd23f, { side: T3.DoubleSide })); cr.position.set(0, 0.52, 0.1); g.add(cr); for (let i = 0; i < 5; i++) { const sp = new T3.Mesh(new T3.ConeGeometry(0.05, 0.12, 4), M(0xffd23f)); const a = i * 1.2566; sp.position.set(Math.cos(a) * 0.2, 0.67, 0.1 + Math.sin(a) * 0.2); g.add(sp); } }
    if (worn.flower) [[-0.15, 0.1, 0xff8fc8], [0, 0.2, 0xffe066], [0.15, 0.1, 0xc9a8ff]].forEach(([x, z, col]) => { const f = new T3.Mesh(new T3.SphereGeometry(0.1, 8, 6), M(col)); f.position.set(x, 0.5, z + 0.1); g.add(f); });
    if (worn.shades) { const sh = new T3.Mesh(new T3.BoxGeometry(0.72, 0.1, 0.14), M(0x0b0a10)); sh.position.set(0, 0.31, 0.58); g.add(sh); }
    if (worn.scarf) { const sc2 = new T3.Mesh(new T3.TorusGeometry(0.4, 0.08, 8, 16), M(0x7bd96b)); sc2.position.set(0, 0, 0.3); g.add(sc2); }
    if (worn.badge) { const b = new T3.Mesh(new T3.SphereGeometry(0.09, 8, 6), M(0xffd23f)); b.position.set(0, -0.1, 0.62); g.add(b); }
    if (worn.bow) [-1, 1].forEach(s => { const b = new T3.Mesh(new T3.ConeGeometry(0.1, 0.25, 4), M(0xff5fa2)); b.rotation.z = s * Math.PI / 2; b.position.set(s * 0.14, 0.05, -0.6); tail.add(b); });
    g.scale.setScalar(sc); g.userData = { tail, scale: sc };
    return g;
  }
  function algaeMesh() {
    const g = new T3.Group(), mat = M(0x9be564, { emissive: 0x2f7a2f, emissiveIntensity: 0.9 });
    [[0, 0, 0, 0.2], [0.18, 0.04, 0.05, 0.14], [-0.14, 0.02, -0.08, 0.13]].forEach(([x, y, z, r]) => { const s = new T3.Mesh(new T3.SphereGeometry(r, 8, 6), mat); s.position.set(x, y, z); g.add(s); });
    return g;
  }
  function heronMesh() {
    const g = new T3.Group(), W = M(0xdfe7f0), B = M(0xffb347);
    const b = new T3.Mesh(new T3.SphereGeometry(1, 12, 8), W); b.scale.set(0.9, 0.7, 1.7); g.add(b);
    const n = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.16, 2.4, 6), W); n.position.set(0, 1.1, 1.3); n.rotation.x = 0.5; g.add(n);
    const h = new T3.Mesh(new T3.SphereGeometry(0.3, 8, 6), W); h.position.set(0, 2.2, 1.9); g.add(h);
    const bk = new T3.Mesh(new T3.ConeGeometry(0.1, 1.2, 6), B); bk.position.set(0, 2.1, 2.6); bk.rotation.x = Math.PI / 2; g.add(bk);
    [-1, 1].forEach(s => { const w = new T3.Mesh(new T3.BoxGeometry(2.8, 0.08, 1.4), M(0xb9c8d8)); w.position.set(s * 1.9, 0.3, 0); w.rotation.z = s * 0.15; g.add(w); const l = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.05, 2.6, 4), B); l.position.set(s * 0.3, -1.5, -0.4); g.add(l); });
    g.scale.setScalar(1.3); return g;
  }
  function nymphMesh() {
    const g = new T3.Group(), Bm = M(0x7a5a38);
    const b = new T3.Mesh(new T3.SphereGeometry(0.5, 10, 8), Bm); b.scale.set(0.8, 0.6, 2); g.add(b);
    const h = new T3.Mesh(new T3.SphereGeometry(0.34, 10, 8), M(0x8d6a42)); h.position.z = 1.1; g.add(h);
    [-1, 1].forEach(s => { const e = new T3.Mesh(new T3.SphereGeometry(0.12, 8, 6), M(0xe8e0c0)); e.position.set(s * 0.26, 0.2, 1.25); g.add(e); });
    for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, l = new T3.Mesh(new T3.CylinderGeometry(0.04, 0.04, 1, 4), Bm); l.position.set(s * 0.55, -0.25, 0.7 - Math.floor(i / 2) * 0.7); l.rotation.z = s * 1.0; g.add(l); }
    g.scale.setScalar(1.25); return g;
  }
  function fishMesh() {
    const g = new T3.Group();
    const b = new T3.Mesh(new T3.SphereGeometry(0.6, 12, 8), M(0x6f8f5a)); b.scale.set(0.6, 0.75, 2.2); g.add(b);
    const bl = new T3.Mesh(new T3.SphereGeometry(0.5, 10, 6), M(0xcfd8b0)); bl.scale.set(0.5, 0.45, 2); bl.position.y = -0.2; g.add(bl);
    const t = new T3.Mesh(new T3.ConeGeometry(0.5, 0.9, 4), M(0x5f7f4a)); t.rotation.x = -Math.PI / 2; t.position.z = -1.6; g.add(t);
    [-1, 1].forEach(s => { const e = new T3.Mesh(new T3.SphereGeometry(0.1, 8, 6), M(0x0b0a10)); e.position.set(s * 0.3, 0.15, 1.1); g.add(e); });
    g.scale.setScalar(1.5); g.userData.tail = t; return g;
  }
  function gemMesh(tr) {
    const m = new T3.Mesh(new T3.SphereGeometry(0.4, 12, 10), M(new T3.Color(tr.c).getHex(), { emissive: new T3.Color(tr.c).getHex(), emissiveIntensity: 0.7, roughness: 0.3 }));
    const halo = new T3.Mesh(new T3.SphereGeometry(0.7, 12, 10), MB(0xffffff, 0.18)); m.add(halo); return m;
  }
  function ringMesh() {
    const g = new T3.Group();
    const r = new T3.Mesh(new T3.TorusGeometry(1.15, 0.13, 8, 24), new T3.MeshBasicMaterial({ color: 0x3ddc6f })); g.add(r);
    const gl = new T3.Mesh(new T3.SphereGeometry(0.45, 10, 8), MB(0xbfffd0, 0.4)); g.add(gl);
    g.userData.ring = r; return g;
  }

  function zoneMesh(z, scene, floor) {
    const g = new T3.Group(), items = [], K = ZK[z.kind];
    const gy = groundY(z.x, z.z);
    // tinted surface disc
    const disc = new T3.Mesh(new T3.CircleGeometry(z.r, 28), MB(K.color, z.kind === "paper" ? 0.2 : 0.3)); disc.rotation.x = -Math.PI / 2; disc.position.set(z.x, 0.04, z.z); g.add(disc);
    if (z.kind === "metal") {
      const cyl = new T3.Mesh(new T3.CylinderGeometry(z.r, z.r, 3.2, 24, 1, true), MB(K.color, 0.2)); cyl.position.set(z.x, gy + 1.6, z.z); g.add(cyl);
      const barrel = new T3.Mesh(new T3.CylinderGeometry(0.7, 0.7, 1.3, 10), M(0x8a4a22)); barrel.position.set(z.x, gy + 0.65, z.z); barrel.rotation.z = 0.5; g.add(barrel);
      for (let i = 0; i < 16; i++) { const a = rand(0, 6.28), d = rand(0, z.r * 0.9), p = new T3.Mesh(new T3.IcosahedronGeometry(rand(0.1, 0.22), 0), M(0xe0923a, { emissive: 0x6a3a10, emissiveIntensity: 0.6 })); p.position.set(z.x + Math.cos(a) * d, gy + rand(0.3, 2.8), z.z + Math.sin(a) * d); g.add(p); items.push({ m: p, by: p.position.y, ph: rand(0, 6), amp: 0.2, spin: 0.6 }); }
    } else if (z.kind === "pfas") {
      const cyl = new T3.Mesh(new T3.CylinderGeometry(z.r, z.r, 2.8, 24, 1, true), MB(K.color, 0.18)); cyl.position.set(z.x, -1.4, z.z); g.add(cyl);
      for (let i = 0; i < 18; i++) { const a = rand(0, 6.28), d = rand(0, z.r * 0.9), f = new T3.Mesh(new T3.SphereGeometry(rand(0.5, 1.2), 8, 6), new T3.MeshStandardMaterial({ color: 0xf5eeff, transparent: true, opacity: 0.8, roughness: 1 })); f.scale.y = 0.3; f.position.set(z.x + Math.cos(a) * d, 0.1, z.z + Math.sin(a) * d); g.add(f); items.push({ m: f, by: 0.1, ph: rand(0, 6), amp: 0.04, spin: 0.1 }); }
      for (let i = 0; i < 14; i++) { const a = rand(0, 6.28), d = rand(0, z.r * 0.8), p = new T3.Mesh(new T3.SphereGeometry(rand(0.08, 0.18), 6, 5), MB(0xe8dcff, 0.7)); p.position.set(z.x + Math.cos(a) * d, rand(-2.5, -0.2), z.z + Math.sin(a) * d); g.add(p); items.push({ m: p, by: p.position.y, ph: rand(0, 6), amp: 0.3, spin: 0 }); }
    } else {
      const n = z.kind === "plastic" ? 13 : 16;
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.28), d = rand(0, z.r * 0.92); let m;
        if (z.kind === "plastic") {
          const t = Math.random();
          if (t < 0.4) { m = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.22, 1, 8), M(0x7fd1ff, { transparent: true, opacity: 0.85 })); m.rotation.z = Math.PI / 2; }
          else if (t < 0.75) { m = new T3.Mesh(new T3.PlaneGeometry(1.5, 1.1), new T3.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: T3.DoubleSide })); m.rotation.x = -Math.PI / 2; }
          else { m = new T3.Mesh(new T3.CylinderGeometry(0.28, 0.2, 0.5, 8), M(0xff7a7a)); }
        } else {
          const t = Math.random();
          if (t < 0.65) { m = new T3.Mesh(new T3.BoxGeometry(rand(1, 1.5), 0.04, rand(0.8, 1.1)), M(0xfaf6ea)); m.rotation.y = rand(0, 6); }
          else { m = new T3.Mesh(new T3.ConeGeometry(0.3, 0.5, 8, 1, true), M(0xf0e0b8, { side: T3.DoubleSide })); m.rotation.x = rand(1, 2.5); }
        }
        m.position.set(z.x + Math.cos(a) * d, 0.04, z.z + Math.sin(a) * d); g.add(m); items.push({ m, by: 0.04, ph: rand(0, 6), amp: 0.05, spin: rand(-0.2, 0.2) });
      }
    }
    scene.add(g); return { g, items, disc };
  }

  function init3D() {
    if (R3) return R3;
    if (!T3) return null;
    try {
      const renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      R3 = { renderer, cam: new T3.PerspectiveCamera(60, 1, 0.1, 400) };
    } catch (e) { R3 = null; }
    return R3;
  }
  function size3D() {
    if (!R3) return;
    const r = glc.getBoundingClientRect();
    R3.renderer.setSize(r.width, r.height, false);
    R3.cam.aspect = r.width / Math.max(1, r.height); R3.cam.updateProjectionMatrix();
  }

  const AIR = 0xbfe3ee, DEEP = 0x16525c;
  function buildWorld(zones) {
    const scene = new T3.Scene(); scene.background = new T3.Color(AIR); scene.fog = new T3.Fog(AIR, 45, 160);
    // Sky
    const skyG = new T3.SphereGeometry(260, 32, 16), sp = skyG.attributes.position, sc = [], top = new T3.Color(0x4fa8e0), hor = new T3.Color(AIR), sk = new T3.Color();
    for (let i = 0; i < sp.count; i++) { sk.copy(hor).lerp(top, smooth(0, 160, sp.getY(i))); sc.push(sk.r, sk.g, sk.b); }
    skyG.setAttribute("color", new T3.Float32BufferAttribute(sc, 3));
    const sky = new T3.Mesh(skyG, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false, depthWrite: false })); scene.add(sky);
    scene.add(new T3.HemisphereLight(0xffffff, 0x6b7a58, 0.85));
    const sun = new T3.DirectionalLight(0xfff4e0, 0.9); sun.position.set(30, 60, 20); scene.add(sun);
    // Terrain: pond floor stained by metals and PFAS, grassy banks
    const geo = new T3.PlaneGeometry(220, 220, 140, 140); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, cols = [], mud = new T3.Color(0x6b5a40), sand = new T3.Color(0xcdb98a), grassA = new T3.Color(0x4a8a46), grassB = new T3.Color(0x3a7a3e), tmp = new T3.Color(), stain = new T3.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), d = pd(x, z); pos.setY(i, groundY(x, z));
      if (d < 0) { tmp.copy(sand).lerp(mud, smooth(0, 7, -d));
        zones.forEach(zn => { if (zn.kind === "metal" || zn.kind === "pfas") { const s = strength(zn, x, z); if (s > 0) { stain.setHex(ZK[zn.kind].color); tmp.lerp(stain, s * 0.55); } } });
        if (Math.hypot(x - CLEAN.x, z - CLEAN.z) < CLEAN.r) tmp.lerp(new T3.Color(0x9bc97a), 0.5);
      } else tmp.copy(grassA).lerp(grassB, 0.5 + 0.5 * Math.sin(x * 0.11) * Math.cos(z * 0.08)).lerp(sand, 1 - smooth(0.4, 3, d));
      cols.push(tmp.r, tmp.g, tmp.b);
    }
    geo.setAttribute("color", new T3.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
    scene.add(new T3.Mesh(geo, new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
    // Water surface
    const wgeo = new T3.PlaneGeometry(220, 220, 60, 60); wgeo.rotateX(-Math.PI / 2);
    const water = new T3.Mesh(wgeo, new T3.MeshPhongMaterial({ color: 0x4aa8b8, transparent: true, opacity: 0.62, shininess: 100, specular: 0xbfeaff, side: T3.DoubleSide })); water.position.y = -0.05; scene.add(water);
    // Plant clusters you can hide in, algae food grows on them
    const cover = [], plants = new T3.Group(); scene.add(plants);
    const reedMat = M(0x3f8a45), reedLight = M(0x6fc36a);
    for (let c = 0; c < 18; c++) {
      let [x, z] = randWater(5); if (zones.some(zn => (zn.kind === "plastic" || zn.kind === "paper") && Math.hypot(zn.x - x, zn.z - z) < zn.r * 0.8)) { [x, z] = randWater(5); }
      cover.push([x, z]); const gy = groundY(x, z), n = Math.floor(rand(6, 11));
      for (let i = 0; i < n; i++) { const h = rand(1.8, Math.min(4.2, -gy + 0.2)), r = new T3.Mesh(new T3.CylinderGeometry(0.04, 0.07, Math.max(1.4, h), 5), i % 2 ? reedMat : reedLight); r.position.set(x + rand(-1, 1), gy + h / 2, z + rand(-1, 1)); r.rotation.set(rand(-0.12, 0.12), 0, rand(-0.12, 0.12)); plants.add(r); }
    }
    // Shoreline cattails and trees for scenery
    for (let i = 0; i < 46; i++) { const a = rand(0, 6.28), x = Math.cos(a) * POND.rx * 1.02, z = Math.sin(a) * POND.rz * 1.02; const d = pd(x, z); if (d < -1 || d > 6) continue;
      const h = rand(2.2, 3.6), st = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.06, h, 5), reedMat); st.position.set(x, groundY(x, z) + h / 2, z); plants.add(st); const hd = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.12, 0.6, 6), M(0x6b4a2b)); hd.position.set(x, groundY(x, z) + h, z); plants.add(hd); }
    for (let i = 0; i < 30; i++) { const a = rand(0, 6.28), k = rand(1.25, 1.9), x = Math.cos(a) * POND.rx * k, z = Math.sin(a) * POND.rz * k * 1.2; const h = rand(5, 9);
      const tr = new T3.Mesh(new T3.CylinderGeometry(0.4, 0.55, h * 0.45, 6), M(0x6b4a2b)); tr.position.set(x, 1 + h * 0.22, z); plants.add(tr);
      const lf = new T3.Mesh(new T3.SphereGeometry(h * 0.38, 8, 6), M(pick([0x2f7a45, 0x3a8a4a, 0x2a6b3f]))); lf.position.set(x, 1 + h * 0.62, z); plants.add(lf); }
    // Lily pads
    for (let i = 0; i < 16; i++) { const [x, z] = randWater(3); const p = new T3.Mesh(new T3.CircleGeometry(rand(0.7, 1.2), 10), M(0x4fa84f)); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.03, z); plants.add(p); }
    // Clean habitat: dense plants, clear water, a beacon
    const ch = new T3.Group(); scene.add(ch);
    const cd = new T3.Mesh(new T3.CircleGeometry(CLEAN.r, 28), MB(0xbfffe8, 0.28)); cd.rotation.x = -Math.PI / 2; cd.position.set(CLEAN.x, 0.05, CLEAN.z); ch.add(cd);
    for (let i = 0; i < 46; i++) { const a = rand(0, 6.28), d = rand(1, CLEAN.r - 1), x = CLEAN.x + Math.cos(a) * d, z = CLEAN.z + Math.sin(a) * d, gy = groundY(x, z), h = rand(1.6, 3.6); const r = new T3.Mesh(new T3.CylinderGeometry(0.04, 0.07, h, 5), i % 2 ? M(0x4fb85a) : M(0x7fd37a)); r.position.set(x, gy + h / 2, z); ch.add(r); }
    for (let i = 0; i < 7; i++) { const a = rand(0, 6.28), d = rand(2, CLEAN.r - 2); const p = new T3.Mesh(new T3.CircleGeometry(rand(0.8, 1.3), 10), M(0x5fc45f)); p.rotation.x = -Math.PI / 2; p.position.set(CLEAN.x + Math.cos(a) * d, 0.04, CLEAN.z + Math.sin(a) * d); ch.add(p); }
    const beacon = new T3.Mesh(new T3.CylinderGeometry(0.5, 0.5, 34, 8, 1, true), MB(0xffe066, 0.35)); beacon.position.set(CLEAN.x, 17, CLEAN.z); ch.add(beacon);
    cover.push([CLEAN.x, CLEAN.z]);
    // Outfall pipe on the west bank
    let px = -50; while (px > -90 && pd(px, 0) < 0.5) px -= 0.5;
    const pipe = new T3.Mesh(new T3.CylinderGeometry(1.2, 1.2, 8, 12), M(0x7a7488)); pipe.rotation.z = Math.PI / 2; pipe.position.set(px - 1.5, groundY(px, 0) + 1.6, 0); scene.add(pipe);
    const stainP = new T3.Mesh(new T3.CylinderGeometry(1.0, 1.0, 0.3, 12), M(0xd9822b)); stainP.rotation.z = Math.PI / 2; stainP.position.set(px + 2.6, groundY(px, 0) + 1.6, 0); scene.add(stainP);
    // Pollutant plumes
    const zm = zones.map(z => zoneMesh(z, scene));
    return { scene, water, cover, sky, sun, zm, wbase: wgeo.attributes.position.array.slice(), beacon };
  }

  /* ============================================================
     A STAGE OF PLAY
     ============================================================ */
  const st0 = () => STAGES[G.stage];
  const BR = () => G.brain;
  const layerF = (kind, y, floor) => kind === "metal" ? (y < floor + 3 ? 1 : 0.25) : kind === "pfas" ? (y > -2.6 ? 1 : 0.25) : 1;
  const inLitter = (x, z, pad = 1.1) => S && S.zones.some(zn => (zn.kind === "plastic" || zn.kind === "paper") && Math.hypot(zn.x - x, zn.z - z) < zn.r * pad);
  const isHidden = () => S.world.cover.some(([x, z]) => Math.hypot(x - S.x, z - S.z) < 2.6) && S.y < -0.5;

  function spawnAlgae(inToxic) {
    let x, z, y;
    for (let i = 0; i < 200; i++) {
      if (inToxic) { const zn = pick(S.zones.filter(q => q.kind === "metal" || q.kind === "pfas")); if (!zn) return; const a = rand(0, 6.28), d = rand(0, zn.r * 0.8); x = zn.x + Math.cos(a) * d; z = zn.z + Math.sin(a) * d; }
      else { [x, z] = randWater(3); if (inLitter(x, z) && Math.random() < 0.85) continue; }
      if (pd(x, z) > -3) continue;
      const fl = groundY(x, z); y = Math.random() < 0.6 ? fl + 0.25 : rand(fl + 0.8, Math.min(-0.8, fl + 3.4)); if (y < fl + 0.2) y = fl + 0.25; break;
    }
    const m = algaeMesh(); m.position.set(x, y, z); S.scene.add(m);
    S.items.push({ m, x, y, z, alive: true, respawn: 0, ph: rand(0, 6) });
  }
  function spawnRing(n, nearToxic) {
    let x, z;
    for (let i = 0; i < 300; i++) {
      if (nearToxic) { const zn = pick(S.zones.filter(q => q.kind === "metal" || q.kind === "pfas")); const a = rand(0, 6.28), d = zn.r * rand(0.6, 0.95); x = zn.x + Math.cos(a) * d; z = zn.z + Math.sin(a) * d; }
      else { [x, z] = randWater(5); }
      if (pd(x, z) < -5 && Math.hypot(x + 54, z) > 18 && Math.hypot(x - CLEAN.x, z - CLEAN.z) > 14) break;
    }
    const m = ringMesh(), y = Math.max(groundY(x, z) + 1.2, -2.2); m.position.set(x, y, z); S.scene.add(m);
    S.rings.push({ n, m, x, y, z, found: false });
  }
  function makeGoals(st) { return [{ kind: "eat", n: st.eat, have: 0 }, { kind: "ring", n: 1, have: 0 }, { kind: "reach", n: 1, have: 0 }]; }

  function startStage() {
    const si = G.stage, st = STAGES[si];
    if (!init3D()) { toast("Your browser can't show the 3D pond, so this stage was skipped."); S = { zones: [], E: { metal: 0, pfas: 0, litter: 0 }, eaten: st.eat, finds: [], ev: {}, hurts: 0, reached: true, dead: false, quick: true }; endStage(); return; }
    const zones = makeZones(si), world = buildWorld(zones), scene = world.scene;
    const tad = buildTad(si, G.worn); scene.add(tad);
    S = { scene, world, zones, tad, t: 0, x: -54, y: -1.6, z: 0, vy: 0, heading: Math.PI / 2, speed: 0, hearts: 3, energy: 100, inv: 0, E: { metal: 0, pfas: 0, litter: 0 }, zt: { metal: 0, pfas: 0, plastic: 0, paper: 0 },
      eaten: 0, finds: [], gems: [], ev: {}, dead: false, cause: "", hurts: 0, reached: false, ending: 0, items: [], rings: [], bonus: [], bonusT: rand(7, 10), preds: [], goals: makeGoals(st), starve: 0, tipT: 0, flash: 0, seenKinds: {}, camInit: false, paused: false, frame: 0 };
    S.camYaw = S.heading;
    for (let i = 0; i < 24; i++) spawnAlgae(false);
    for (let i = 0; i < 8; i++) spawnAlgae(true);
    const pool = NATURE.slice().sort((a, b) => (G.nature[a.id] ? 1 : 0) - (G.nature[b.id] ? 1 : 0) || Math.random() - 0.5).slice(0, 3);
    pool.forEach((n, i) => spawnRing(n, i === 0));
    if (G.opts.preds) st.preds.forEach(p => {
      if (p === "heron") { const m = heronMesh(); m.visible = false; scene.add(m); const sh = new T3.Mesh(new T3.CircleGeometry(2.2, 20), MB(0x000000, 0)); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.06; scene.add(sh); S.preds.push({ kind: "heron", m, sh, state: "away", cd: rand(9, 13), t: 0, tx: 0, tz: 0, near: false }); }
      if (p === "nymph") { for (let i = 0; i < (si === 0 ? 2 : 1); i++) { const far = S.world.cover.filter(q => Math.hypot(q[0] + 54, q[1]) > 24), c = pick(far.length ? far : S.world.cover), x = c[0] + rand(-2, 2), z = c[1] + rand(-2, 2); const m = nymphMesh(); m.position.set(x, groundY(x, z) + 0.4, z); scene.add(m); S.preds.push({ kind: "nymph", m, state: "idle", x, z, y: groundY(x, z) + 0.4, t: 0, dx: 0, dz: 0, hit: false }); } }
      if (p === "fish") { let x, z; for (let i = 0; i < 40; i++) { [x, z] = randWater(8); if (Math.hypot(x + 54, z) > 28) break; } const m = fishMesh(); scene.add(m); S.preds.push({ kind: "fish", m, state: "patrol", x, z, y: -2, h: rand(0, 6), tx: x, tz: z, cd: 0, lost: 0 }); }
    });
    G.screen = "season"; screen("");
    canvas.hidden = true; glc.hidden = false; size3D();
    $("og-hud").hidden = false; document.querySelector(".og-hud-top").appendChild($("og-corner"));
    $("og-gen").textContent = "STAGE " + (si + 1); $("og-hab").textContent = st.name;
    if (touchMode && smallLandscape() && !stageEl.classList.contains("og-fs-on")) setFull(true); showTouch();
    renderTasks(); renderHearts(); renderExposure(); paintMapBase();
    setTimeout(() => S && S.t < 12 && showFact(st.fact), 1500);
    if (si === 0) setTimeout(() => S && showFact("cumulative"), 11000);
    if (si === 1) setTimeout(() => S && showFact("species"), 9000);
    keys = {}; running = true; lastT = performance.now(); glc.focus({ preventScroll: true }); requestAnimationFrame(loop);
  }

  /* ----- HUD ----- */
  function goalLabel(g) { return g.kind === "eat" ? `Eat ${g.n} algae` : g.kind === "ring" ? "Swim through a nature ring" : "Reach the clean habitat"; }
  function goalIcon(g) { return g.kind === "eat" ? ICON.algae : g.kind === "ring" ? ICON.ring : ICON.flag; }
  function renderTasks() {
    $("og-tasks").innerHTML = `<b>Goals</b>` + S.goals.map(g => `<span class="${g.have >= g.n ? "done" : ""}">${goalIcon(g)}${goalLabel(g)} ${g.kind === "eat" ? `<em>${Math.min(g.have, g.n)}/${g.n}</em>` : ""}</span>`).join("");
  }
  function renderHearts() { $("og-hearts").innerHTML = [0, 1, 2].map(i => `<i class="${i < S.hearts ? "" : "lost"}">♥</i>`).join(""); }
  function renderExposure() {
    $("tg-exp").innerHTML = ["metal", "pfas", "litter"].map(k => `<span data-k="${k}" style="--c:${GRP[k].css}" title="${GRP[k].name} exposure">${ICON[k === "litter" ? "litter" : k]}<span><i></i></span></span>`).join("");
  }
  function updateExposure() {
    document.querySelectorAll("#tg-exp > span").forEach(el => { const k = el.dataset.k, v = S.E[k]; el.querySelector("i").style.width = clamp(v, 0, 100) + "%"; el.classList.toggle("hot", v > 70); });
    const en = $("og-energy"); en.style.width = S.energy + "%"; en.parentElement.parentElement.classList.toggle("low", S.energy < 25);
  }
  function checkGoals() {
    const done = S.goals.every(g => g.have >= g.n);
    if (done && S.ending <= 0 && !S.dead) { S.ending = 1.4; toast("Stage complete!", 2); jingle(); }
  }

  let mapBase = null;
  function paintMapBase() {
    mapBase = document.createElement("canvas"); mapBase.width = mapBase.height = 120; const c = mapBase.getContext("2d");
    c.fillStyle = "#103a33"; c.fillRect(0, 0, 120, 120);
    const k = 120 / (ARENA * 2);
    for (let py = 0; py < 120; py += 2) for (let px = 0; px < 120; px += 2) { const x = (px - 60) / k, z = (py - 60) / k, d = pd(x, z); if (d < 0) { c.fillStyle = d < -8 ? "#1a7f8e" : "#2fa3ae"; c.fillRect(px, py, 2, 2); } }
  }
  function drawMap() {
    const cv = $("og-map"), c = cv.getContext("2d"), k = 120 / (ARENA * 2), mx = x => 60 + x * k, mz = z => 60 + z * k, b = BR();
    c.clearRect(0, 0, 120, 120); if (mapBase) c.drawImage(mapBase, 0, 0);
    // plumes: how clearly you remember them depends on the telencephalon
    const al = 0.3 + 0.7 * b.tel / 100;
    S.zones.forEach(z => { c.globalAlpha = 0.55 * al; c.fillStyle = ZK[z.kind].css; c.beginPath(); c.arc(mx(z.x), mz(z.z), z.r * k, 0, 7); c.fill(); });
    c.globalAlpha = 1;
    c.strokeStyle = "#3ddc6f"; c.lineWidth = 2; c.beginPath(); c.arc(mx(CLEAN.x), mz(CLEAN.z), CLEAN.r * k, 0, 7); c.stroke();
    c.fillStyle = "#ffe066"; c.beginPath(); c.arc(mx(CLEAN.x), mz(CLEAN.z), 2.6, 0, 7); c.fill();
    if (b.tel >= 50) S.rings.forEach(r => { if (!r.found) { c.strokeStyle = "#3ddc6f"; c.lineWidth = 1.6; c.beginPath(); c.arc(mx(r.x), mz(r.z), 3, 0, 7); c.stroke(); } });
    // smell: the olfactory bulb sets the food radar radius
    const rad = 14 + 0.55 * b.olf; c.fillStyle = "#b6ff7a";
    S.items.forEach(it => { if (it.alive && Math.hypot(it.x - S.x, it.z - S.z) < rad) c.fillRect(mx(it.x) - 1, mz(it.z) - 1, 2.4, 2.4); });
    S.bonus.forEach(g => { c.fillStyle = "#fff"; c.beginPath(); c.arc(mx(g.x), mz(g.z), 2.2, 0, 7); c.fill(); });
    c.save(); c.translate(mx(S.x), mz(S.z)); c.rotate(-S.heading + Math.PI); c.fillStyle = "#ff5fa2"; c.strokeStyle = "#0b0a10"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 5); c.lineTo(4, -4); c.lineTo(-4, -4); c.closePath(); c.fill(); c.stroke(); c.restore();
  }

  function hurt(cause) {
    if (S.inv > 0 || S.dead) return;
    S.hearts--; S.hurts++; S.inv = 1.6; sfx("hurt", 0.12); renderHearts(); toast(cause, 2.2);
    const fl = $("og-stage-flash"); fl.classList.remove("on"); void fl.offsetWidth; fl.classList.add("on");
    if (S.hearts <= 0) { S.dead = true; S.cause = cause; S.ending = 1.6; }
  }
  const bump = k => { S.ev[k] = (S.ev[k] || 0) + 1; };

  function update(dt) {
    const b = BR(), st = st0();
    S.t += dt; S.inv = Math.max(0, S.inv - dt); S.tipT -= dt;
    if (S.ending > 0) { S.ending -= dt; if (S.ending <= 0) { endStage(); return; } }
    const k = keys, alive = !S.dead;
    const L = alive && (k.ArrowLeft || k.a || k.A), Rr = alive && (k.ArrowRight || k.d || k.D), U = alive && (k.ArrowUp || k.w || k.W), D = alive && (k.ArrowDown || k.s || k.S);
    const UP = alive && k[" "], DV = alive && (k.Shift || k.e || k.E || k.q || k.Q || k.c || k.C || k.dive);
    // Cerebellum: coordination sets steering and top speed
    const agi = 0.7 + 0.3 * b.cereb / 100, turn = 2.7 * agi, top = (S.energy <= 0 ? 3.2 : 6.2) * (0.8 + 0.2 * b.cereb / 100);
    let target = 0;
    if (stick.active && alive) {
      const m = Math.min(1, Math.hypot(stick.x, stick.y));
      if (m > 0.15) { const y = S.camYaw, dx = Math.sin(y) * -stick.y - Math.cos(y) * stick.x, dz = Math.cos(y) * -stick.y + Math.sin(y) * stick.x; S.heading = lerpAngle(S.heading, Math.atan2(dx, dz), Math.min(1, turn * 2.6 * dt)); target = top * m; }
    } else { if (L) S.heading += turn * dt; if (Rr) S.heading -= turn * dt; target = U ? top : D ? -top * 0.4 : 0; }
    if (!touchMode) S.camYaw = S.heading; else if (!look && Math.abs(S.speed) > 1) S.camYaw = lerpAngle(S.camYaw, S.heading, Math.min(1, 0.7 * dt));
    S.speed = lerp(S.speed, target, 0.12);
    let nx = S.x + Math.sin(S.heading) * S.speed * dt, nz = S.z + Math.cos(S.heading) * S.speed * dt;
    if (!isWater(nx, nz) || pd(nx, nz) > -1) { if (isWater(nx, S.z) && pd(nx, S.z) < -1) nz = S.z; else if (isWater(S.x, nz) && pd(S.x, nz) < -1) nx = S.x; else { nx = S.x; nz = S.z; S.speed *= 0.5; } }
    S.x = nx; S.z = nz;
    const fl = groundY(S.x, S.z) + 0.3, vt = UP ? 3 : DV ? -3 : 0; S.vy = lerp(S.vy, vt, 0.15);
    S.y = clamp(S.y + S.vy * dt, fl, -0.3);
    // Exposure: the longer you stay in a plume, the more it fills. Metals hug the bottom; PFAS foam floats near the top.
    let sm = { metal: 0, pfas: 0, litter: 0 };
    S.zones.forEach(z => {
      const s = strength(z, S.x, S.z); if (s <= 0) return;
      const K = ZK[z.kind], f = layerF(z.kind, S.y, groundY(S.x, S.z)) * s; sm[K.grp] = Math.max(sm[K.grp], f); S.zt[z.kind] += dt * s;
      if (!S.seenKinds[z.kind] && s > 0.12) { S.seenKinds[z.kind] = true; setTimeout(() => S && showFact(K.fact), 700);
        if (z.kind === "metal") setTimeout(() => S && toast("Tip: metals settle near the bottom. Swim higher to cut your exposure.", 3.5), 3800);
        if (z.kind === "pfas") setTimeout(() => S && toast("Tip: PFAS foam floats near the top. Dive to cut your exposure.", 3.5), 3800); }
    });
    if (alive) Object.keys(sm).forEach(g => { S.E[g] = Math.min(100, S.E[g] + dt * RATE * sm[g]); });
    // Energy: the medulla sets how fast it drains
    if (alive) S.energy = clamp(S.energy - 1.3 * (1 + (100 - b.med) * 0.007) * dt, 0, 100);
    if (S.energy <= 0 && alive) { if (G.opts.preds) { S.starve += dt; if (S.starve > 3.5) { S.starve = 0; S.inv = 0; hurt("Too hungry!"); } } else if (S.tipT <= 0) { S.tipT = 6; toast("So hungry! Eat some algae."); } }
    // Food
    const hx = S.x + Math.sin(S.heading) * 0.7, hz = S.z + Math.cos(S.heading) * 0.7, er = 0.9 + 0.5 * st.scale;
    S.items.forEach(it => {
      if (!it.alive) { if (S.t > it.respawn) { it.alive = true; it.m.visible = true; } return; }
      it.m.position.y = it.y + Math.sin(S.t * 1.3 + it.ph) * 0.05;
      if (alive && Math.hypot(it.x - hx, it.z - hz) < er && Math.abs(it.m.position.y - S.y) < er + 0.4) {
        it.alive = false; it.m.visible = false; it.respawn = S.t + 14; S.eaten++; G.totals.eaten++; S.energy = Math.min(100, S.energy + 14); sfx("pop", 0.07);
        const g = S.goals[0]; g.have++; renderTasks(); checkGoals();
      }
    });
    // Nature rings
    S.rings.forEach(r => {
      if (r.found) return; r.m.rotation.y += dt * 1.2; r.m.position.y = r.y + Math.sin(S.t * 1.5 + r.x) * 0.12;
      if (alive && Math.hypot(r.x - S.x, r.z - S.z) < 1.9 && Math.abs(r.m.position.y - S.y) < 1.9) {
        r.found = true; r.m.visible = false; S.finds.push(r.n.name); const first = !G.nature[r.n.id]; G.nature[r.n.id] = true; G.totals.finds = Object.keys(G.nature).length; save();
        sfx("gem", 0.08); toast(`Nature find: ${r.n.name}!${first ? " Added to your Treasure chest (T)." : ""}`, 3); if (first) flag("treasure"); renderNature();
        S.goals[1].have = 1; renderTasks(); checkGoals();
      }
    });
    // Bubble treasures
    S.bonusT -= dt;
    if (S.bonusT <= 0 && S.bonus.length < 1 && alive) { S.bonusT = rand(9, 14); const tr = pickTreasure(), [x, z] = randWater(4), y = rand(Math.max(groundY(x, z) + 1, -3), -0.8), m = gemMesh(tr); m.position.set(x, y, z); S.scene.add(m); S.bonus.push({ tr, m, x, y, z, life: 16 }); toast("A shiny bubble drifts up! Check the map.", 2.4); }
    S.bonus = S.bonus.filter(g => {
      g.life -= dt; g.m.position.y = g.y + Math.sin(S.t * 2 + g.x) * 0.2;
      if (alive && Math.hypot(g.x - S.x, g.z - S.z) < 1.5 && Math.abs(g.m.position.y - S.y) < 1.6) {
        const first = !G.treasure[g.tr.id]; G.treasure[g.tr.id] = true; G.totals.gems++; S.gems.push(g.tr.name); sfx("gem", 0.09);
        if (g.tr.rare && S.hearts < 3) { S.hearts++; renderHearts(); } else S.energy = Math.min(100, S.energy + 35);
        toast(`${g.tr.name}!${g.tr.rare ? " A heart restored." : " Energy up."}${first ? " New in your Treasure chest (T)." : ""}`, 2.6); if (first) flag("treasure"); renderTreasure(); save(); S.scene.remove(g.m); return false;
      }
      if (g.life <= 0) { S.scene.remove(g.m); return false; } return true;
    });
    // Reaching clean habitat
    if (!S.reached && alive && Math.hypot(S.x - CLEAN.x, S.z - CLEAN.z) < CLEAN.r - 2) { S.reached = true; S.goals[2].have = 1; toast("Clean habitat! The water is clear here.", 2.6); sfx("gem", 0.08); renderTasks(); checkGoals(); }
    updatePreds(dt, alive);
    updateExposure();
  }

  function updatePreds(dt, alive) {
    const hidden = isHidden();
    S.preds.forEach(p => {
      if (p.kind === "nymph") {
        const d = Math.hypot(p.x - S.x, p.z - S.z), dy = Math.abs(p.y - S.y);
        p.t += dt;
        if (p.state === "idle") { p.m.rotation.y = Math.atan2(S.x - p.x, S.z - p.z) * 0.4 + p.m.rotation.y * 0.6; if (alive && !hidden && d < 4.6 && dy < 3) { p.state = "lunge"; p.t = 0; p.dx = (S.x - p.x) / d; p.dz = (S.z - p.z) / d; p.hit = false; p.m.rotation.y = Math.atan2(p.dx, p.dz); sfx("thump", 0.14); } }
        else if (p.state === "lunge") { p.x += p.dx * 9.5 * dt; p.z += p.dz * 9.5 * dt; if (!isWater(p.x, p.z)) { p.x -= p.dx * 9.5 * dt; p.z -= p.dz * 9.5 * dt; } p.y = lerp(p.y, Math.max(S.y, groundY(p.x, p.z) + 0.4), 0.1);
          if (alive && !p.hit && d < 1.15 && dy < 1.4) { p.hit = true; hurt("A dragonfly nymph grabbed you!"); }
          if (p.t > 0.65) { p.state = "rest"; p.t = 0; if (!p.hit) bump("escape:nymph"); } }
        else { p.y = lerp(p.y, groundY(p.x, p.z) + 0.4, 0.05); if (p.t > 2.8) { p.state = "idle"; p.t = 0; } }
        p.m.position.set(p.x, p.y, p.z);
      } else if (p.kind === "fish") {
        const d = Math.hypot(p.x - S.x, p.z - S.z); p.cd -= dt;
        if (p.state === "patrol") { if (Math.hypot(p.tx - p.x, p.tz - p.z) < 2) { const [x, z] = randWater(6); p.tx = x; p.tz = z; } if (alive && !hidden && d < 11 && Math.abs(p.y - S.y) < 4) { p.state = "chase"; p.lost = 0; sfx("swish", 0.1); } }
        else { if (hidden || d > 17) { p.lost += dt; if (p.lost > 2.2) { p.state = "patrol"; bump(hidden ? "hide:fish" : "escape:fish"); const [x, z] = randWater(6); p.tx = x; p.tz = z; } } else p.lost = 0; p.tx = S.x; p.tz = S.z; }
        const sp = p.state === "chase" ? 5 : 3, ta = Math.atan2(p.tx - p.x, p.tz - p.z); p.h = lerpAngle(p.h, ta, Math.min(1, 3 * dt));
        const nx = p.x + Math.sin(p.h) * sp * dt, nz = p.z + Math.cos(p.h) * sp * dt; if (isWater(nx, nz) && pd(nx, nz) < -2) { p.x = nx; p.z = nz; } else { p.h += 1.5 * dt; }
        p.y = lerp(p.y, p.state === "chase" ? S.y : clamp(-2, groundY(p.x, p.z) + 0.8, -0.8), 0.04);
        p.m.position.set(p.x, p.y, p.z); p.m.rotation.y = p.h; p.m.userData.tail.rotation.z = Math.sin(S.t * 10) * 0.4;
        if (alive && p.cd <= 0 && d < 1.5 && Math.abs(p.y - S.y) < 1.5) { hurt("A fish caught you!"); p.cd = 2.5; p.state = "patrol"; const [x, z] = randWater(6); p.tx = x; p.tz = z; }
      } else if (p.kind === "heron") {
        p.t += dt;
        if (p.state === "away") { p.cd -= dt; if (p.cd <= 0 && alive) { p.state = "warn"; p.t = 0; p.near = false;
            if (S.y > -1.6) { p.tx = S.x + rand(-1, 1); p.tz = S.z + rand(-1, 1); } else { const [x, z] = randWater(3); p.tx = (x + S.x) / 2; p.tz = (z + S.z) / 2; }
            if (!isWater(p.tx, p.tz)) { p.tx = S.x; p.tz = S.z; } p.m.visible = true; sfx("heron", 0.1); toast(S.y > -1.6 ? "Heron shadow! Dive deep!" : "A heron is hunting overhead.", 2.2); } }
        else if (p.state === "warn") { p.sh.material.opacity = Math.min(0.5, p.t * 0.28); p.sh.position.set(p.tx, 0.06, p.tz); p.m.position.set(p.tx, lerp(26, 6, p.t / 2.1), p.tz); p.m.rotation.y = 0;
          if (Math.hypot(p.tx - S.x, p.tz - S.z) < 3.6) p.near = true;
          if (p.t > 2.1) { p.state = "strike"; p.t = 0; if (alive && Math.hypot(p.tx - S.x, p.tz - S.z) < 2.6 && S.y > -1.5) hurt("A heron struck!"); else if (p.near) bump("dodge:heron"); } }
        else { p.m.position.set(p.tx, lerp(0.6, 22, p.t / 1.4), p.tz); p.sh.material.opacity = Math.max(0, 0.5 - p.t * 0.6); if (p.t > 1.4) { p.state = "away"; p.cd = rand(9, 14); p.m.visible = false; p.sh.material.opacity = 0; } }
      }
    });
  }

  function draw3D() {
    const t = S.t, o = S.tad, sc = STAGES[G.stage].scale;
    o.position.set(S.x, S.y, S.z); o.rotation.y = S.heading;
    o.userData.tail.rotation.y = Math.sin(t * (4 + Math.abs(S.speed) * 1.6)) * (0.25 + Math.min(0.45, Math.abs(S.speed) * 0.08));
    o.visible = !(S.inv > 0 && Math.floor(t * 12) % 2) || S.dead;
    if (S.dead) o.rotation.z = Math.min(Math.PI / 2, o.rotation.z + 0.08);
    // water waves
    const wp = S.world.water.geometry.attributes.position, base = S.world.wbase;
    for (let i = 0; i < wp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; wp.array[i * 3 + 1] = Math.sin(x * 0.3 - t * 1.4) * 0.05 + Math.cos(z * 0.27 + t * 1.1) * 0.035; }
    wp.needsUpdate = true; if ((S.frame = S.frame + 1) % 3 === 0) S.world.water.geometry.computeVertexNormals();
    S.world.zm.forEach(zm => zm.items.forEach(it => { it.m.position.y = it.by + Math.sin(t * 1.2 + it.ph) * it.amp; it.m.rotation.y += it.spin * 0.016; }));
    S.world.beacon.rotation.y = t * 0.4;
    // camera
    const cam = R3.cam, back = 3.2 + 2.2 * sc, up = 1.0 + 0.7 * sc, cy = S.camYaw;
    const want = new T3.Vector3(S.x - Math.sin(cy) * back, S.y + up, S.z - Math.cos(cy) * back); want.y = Math.min(want.y, -0.25);
    if (!S.camInit) { cam.position.copy(want); S.camInit = true; } else cam.position.lerp(want, look ? 0.3 : 0.1);
    cam.lookAt(S.x + Math.sin(cy) * 2.4, S.y + 0.1, S.z + Math.cos(cy) * 2.4);
    // Underwater look: the optic tectum sets how far you can see. Plumes tint the water.
    const under = cam.position.y < 0 || S.y < -0.6, vis = 11 + 0.3 * BR().tect;
    let tint = new T3.Color(DEEP);
    S.zones.forEach(z => { const s = strength(z, S.x, S.z); if (s > 0) tint.lerp(new T3.Color(ZK[z.kind].color), Math.min(0.32, s * 0.4)); });
    if (under) { S.scene.fog.color.copy(tint); S.scene.background.copy(tint); S.scene.fog.near = 1; S.scene.fog.far = vis; }
    else { S.scene.fog.color.setHex(AIR); S.scene.background.setHex(AIR); S.scene.fog.near = 45; S.scene.fog.far = 160; }
    S.world.sky.visible = !under; S.world.sky.position.copy(cam.position);
    S.world.water.material.opacity = under ? 0.3 : 0.62;
    R3.renderer.render(S.scene, cam);
    drawMap();
  }
  function loop(now) {
    if (!running) return;
    if (S.paused) { lastT = now; requestAnimationFrame(loop); return; }
    const dt = Math.min(0.1, (now - lastT) / 1000 || 0.016); lastT = now;
    update(dt); if (running) draw3D();
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $("og-toast").hidden = true; }
    requestAnimationFrame(loop);
  }

  /* ============================================================
     ENDING A STAGE: exposure becomes brain change and growth
     ============================================================ */
  function lossFor(E, sens) {
    const out = {}; REGIONS.forEach(r => { out[r.k] = sens * (E.metal * r.wM + E.pfas * r.wP) * LOSS_K; }); return out;
  }
  function leaveSeason() {
    running = false; keys = {}; $("og-hud").hidden = true; glc.hidden = true; canvas.hidden = false; $("og-touch").hidden = true; endTouch();
    stageEl.appendChild($("og-corner"));
  }
  function logLife(e) { G.life.push(e); }
  function endStage() {
    const st = st0(), wasQuick = S && S.quick; leaveSeason();
    if (S.dead) {
      logLife({ stage: G.stage, name: st.name, dead: true, cause: S.cause, E: S.E, eaten: S.eaten, finds: S.finds, ev: S.ev, gems: S.gems });
      G.retry++; save(); screenCaught(S.cause); S = null; idleLoop(); return;
    }
    const E = { ...S.E }; let penalty = false;
    if (!S.reached && !wasQuick) { ["metal", "pfas", "litter"].forEach(k => E[k] = Math.min(100, E[k] + 20)); penalty = true; }
    const before = { ...G.brain }, loss = lossFor(E, st.sens), after = {};
    RK.forEach(k => { after[k] = clamp(before[k] - loss[k], 25, 100); });
    const gain = 20 * clamp(S.eaten / st.eat, 0.25, 1) * (1 - 0.25 * E.litter / 100), size = Math.min(100, G.size + gain);
    const entry = { stage: G.stage, name: st.name, E, eaten: S.eaten, target: st.eat, gain, size, before, after, loss, hurts: S.hurts, finds: S.finds.slice(), ev: { ...S.ev }, gems: S.gems.slice(), reached: S.reached, penalty, retries: G.retry, zt: { ...S.zt } };
    G.brain = after; G.size = size; G.history.push(entry); G.gallery.push({ label: `Stage ${G.stage + 1}: ${st.name}`, scores: { ...after } });
    G.inRun = true; logLife({ stage: G.stage, name: st.name, dead: false, E, eaten: S.eaten, finds: entry.finds, ev: entry.ev, gems: entry.gems, gain, reached: S.reached, after: { ...after } });
    G.retry = 0; G.stage++;
    // outfit rules
    if (G.stage >= 1) unlock("lily");
    if (entry.hurts === 0) unlock("shades");
    if (G.totals.eaten >= 40) unlock("scarf");
    if (Object.keys(G.nature).length >= 6) unlock("bow");
    if (G.totals.gems >= 3) unlock("flower");
    const done = G.stage >= NSTAGE; save(); S = null;
    flag("anatomy"); flag("growth"); updatePanels();
    if (done) screenFinal(); else screenSummary(entry); idleLoop();
  }
  function outcomeKind() {
    const h = G.history, n = h.length, avg = k => h.reduce((s, e) => s + e.E[k], 0) / n, m = avg("metal"), p = avg("pfas"), l = avg("litter");
    const mean = RK.reduce((s, k) => s + G.brain[k], 0) / RK.length, size = G.size;
    if (mean >= 85 && size >= 85) return "clean";
    if (m >= 35 && p >= 35 && mean < 70) return "double";
    if (m >= p + 10 && m >= 30) return "metal";
    if (p >= m + 10 && p >= 30) return "pfas";
    if (size < 60 && l >= 30) return "lean";
    if (size < 65) return "slow";
    return "grit";
  }

  /* ============================================================
     SCREENS
     ============================================================ */
  function screen(html) { const el = $("og-screen"); el.innerHTML = html; el.hidden = !html; if (html) { const b = el.querySelector(".og-btn:not([disabled]), .og-opt, button:not(.og-back)"); if (b) b.focus({ preventScroll: true }); } }
  const BACK = '<button type="button" class="og-back" id="og-back">◀ Back</button>';
  const onBack = fn => { const b = $("og-back"); if (b) b.addEventListener("click", () => { beep(220, 0.06, "triangle", 0.04); fn(); }); };
  const bar = (label, v, css, icon) => `<div class="tg-bar" style="--c:${css}">${icon || "<span></span>"}<span>${label}</span><span><i style="width:${clamp(v, 0, 100)}%"></i></span><b>${pct(v)}</b></div>`;
  const expBars = E => ["metal", "pfas", "litter"].map(k => bar(GRP[k].name, E[k], GRP[k].css, ICON[k === "litter" ? "litter" : k])).join("");

  function screenSettings(next, back = screenTitle) {
    G.screen = "settings";
    const opt = (v, ic, title, sub) => `<button type="button" class="og-opt" data-v="${v}" aria-pressed="${G.opts.preds === v}">${ic}<b>${title}</b><span>${sub}</span></button>`;
    screen(`<div class="og-card og-wide">${BACK}
      <h2 class="og-h">How do you want to play?</h2>
      <h3 class="og-mini">Predators</h3>
      <div class="og-opts">${opt(true, ICON.heron, "Predators on", "Herons, dragonfly nymphs, and fish. More challenge!")}${opt(false, ICON.algae, "No predators", "Relaxed swimming, great for little kids.")}</div>
      <button type="button" class="og-btn" id="og-set-go">Let's go ▶</button></div>`);
    document.querySelectorAll(".og-opt").forEach(b => b.addEventListener("click", () => { G.opts.preds = b.dataset.v === "true"; save(); beep(220, 0.06, "triangle", 0.04); document.querySelectorAll(".og-opt").forEach(x => x.setAttribute("aria-pressed", String(x === b))); }));
    $("og-set-go").addEventListener("click", () => { beep(260, 0.1, "triangle"); next(); });
    onBack(back);
  }
  function newGame() {
    G.inRun = false; G.stage = 0; G.brain = newBrain(); G.size = 0; G.history = []; G.retry = 0; save(); updatePanels();
    if (window.SQ_track) window.SQ_track("play", "tadpole-game");
    screenSettings(() => screenBriefing());
  }
  function screenTitle() {
    G.screen = "title";
    const saved = G.inRun && G.stage < NSTAGE && G.history.length;
    screen(`<div class="og-card og-title">
      <p class="og-badge">SQuEACs Lab presents</p>
      <h2 class="og-logo">Tadpole<br><span>Trek</span></h2>
      ${saved ? `<div class="og-welcome"><b>Welcome back!</b><span>Your tadpole is ready for stage ${G.stage + 1} of ${NSTAGE}: ${STAGES[G.stage].name}. Keep going, or start a new tadpole?</span></div>` : `<p class="og-sub">Guide one tadpole from hatchling to froglet through a polluted pond.</p>
      <ol class="og-steps">
        <li><span><b>Swim out of the plumes.</b> Heavy metals, PFAS, and litter fill exposure meters the longer you stay.</span></li>
        <li><span><b>Eat algae and reach clean habitat.</b> Litter means less food. Metals and PFAS change the developing brain.</span></li>
        <li><span><b>Become a froglet</b> and see how your path shaped your brain.</span></li>
      </ol>`}
      <div class="og-actions">${saved ? `<button type="button" class="og-btn" id="og-continue">▶ Continue · Stage ${G.stage + 1}</button><button type="button" class="og-btn ghost" id="og-play">New tadpole</button>` : '<button type="button" class="og-btn" id="og-play">Play</button>'}</div>
      ${saved ? '<p class="og-sub og-small">A new tadpole erases your current trek. Your outfits, Pond-dex, treasures, and journal stay.</p>' : ""}
      ${hasCollections() || saved ? '<button type="button" class="og-link" id="og-erase">Erase everything and start fresh</button>' : ""}</div>`);
    const cont = $("og-continue"); if (cont) cont.addEventListener("click", () => { beep(260, 0.1, "triangle"); screenBriefing(); });
    $("og-play").addEventListener("click", () => { beep(260, 0.1, "triangle"); newGame(); });
    const er = $("og-erase"); if (er) er.addEventListener("click", screenErase);
  }
  function screenErase() {
    G.screen = "erase";
    screen(`<div class="og-card">${BACK}
      <h2 class="og-h">Erase everything?</h2>
      <p class="og-sub">This deletes your tadpole and trek, plus every outfit, Pond-dex froglet, treasure, nature find, journal card, and brain drawing you've collected. Your settings stay. This can't be undone.</p>
      <div class="og-actions"><button type="button" class="og-btn og-danger" id="og-erase-yes">Yes, erase everything</button><button type="button" class="og-btn ghost" id="og-erase-no">Keep my stuff</button></div></div>`);
    onBack(screenTitle); $("og-erase-no").addEventListener("click", screenTitle); $("og-erase-no").focus({ preventScroll: true });
    $("og-erase-yes").addEventListener("click", () => {
      Object.assign(G, { stage: 0, brain: newBrain(), size: 0, history: [], life: [], seen: {}, unlocked: {}, worn: {}, dex: {}, treasure: {}, nature: {}, gallery: [], inRun: false, totals: { eaten: 0, finds: 0, gems: 0 }, retry: 0 });
      save(); renderCloset(); renderDex(); renderTreasure(); renderNature(); updatePanels(); resetJournal();
      document.querySelectorAll(".og-slot .og-badge-new").forEach(x => { x.hidden = true; x.parentElement.classList.remove("has-new"); }); $("og-bag").classList.remove("has-new");
      beep(165, 0.15, "triangle", 0.05); screenTitle(); toast("Everything erased. Fresh start!");
    });
  }

  function brainTips() {
    const b = BR(), lvl = v => v >= 85 ? "sharp" : v >= 60 ? "a bit dulled" : "weak";
    return [["nose", `Smell is ${lvl(b.olf)}: food radar reaches ${Math.round(14 + 0.55 * b.olf)} m.`], ["eye", `Vision is ${lvl(b.tect)}: you see about ${Math.round(11 + 0.3 * b.tect)} m underwater.`], ["brain", `Coordination is ${lvl(b.cereb)}: top speed ${Math.round(80 + 20 * b.cereb / 100)}%, steering ${Math.round(70 + 30 * b.cereb / 100)}%.`]];
  }
  function screenBriefing() {
    G.screen = "brief"; const st = st0(), goals = makeGoals(st);
    const ESC = { heron: [ICON.heron, [ICON.dive], "Dive deep when its shadow shows"], nymph: [ICON.nymph, [ICON.away], "Swim away fast"], fish: [ICON.fish, [ICON.hide], "Hide in the plants"] };
    const controls = (coarse || touchMode)
      ? `<div class="og-ctl"><span class="og-keys-row"><span class="og-mini-stick"><i></i></span></span><small>Left thumb: swim</small></div><div class="og-ctl"><span class="og-keys-row">${KEY("↔")}</span><small>Right thumb: swipe to look</small></div><div class="og-ctl"><span class="og-keys-row">${KEY("Up")}</span><small>Swim up</small></div><div class="og-ctl"><span class="og-keys-row">${KEY("Dive")}</span><small>Dive</small></div>`
      : `<div class="og-ctl"><span class="og-arrows">${KEY("▲")}<span>${KEY("◀")}${KEY("▼")}${KEY("▶")}</span></span><small>Swim</small></div><div class="og-ctl"><span class="og-keys-row">${KEY("Space")}</span><small>Swim up</small></div><div class="og-ctl"><span class="og-keys-row">${KEY("Shift")}</span><small>Dive</small></div>`;
    screen(`<div class="og-card og-wide og-brief">${G.history.length ? BACK : ""}
      <p class="og-badge">Stage ${G.stage + 1} of ${NSTAGE} · ${st.name}</p>
      <p class="og-sub og-small">${st.gosner} (stage names follow the standard Gosner scheme, simplified)</p>
      <h2 class="og-h">Your mission</h2>
      <div class="og-modes"><span>${G.opts.preds ? "Predators on" : "No predators"}</span><button type="button" class="og-link" id="og-change">Change settings</button></div>
      <ul class="og-goals">${goals.map(g => `<li>${goalIcon(g)}<span>${goalLabel(g)}</span></li>`).join("")}</ul>
      <div class="og-brief-grid">
        <section><h3 class="og-mini">Pollution!</h3>
          <div class="og-row">${ICON.metal}<b class="og-arrow">➜</b>${ICON.brain}<small>Metals shrink brain regions. They hug the bottom.</small></div>
          <div class="og-row">${ICON.pfas}<b class="og-arrow">➜</b>${ICON.brain}<small>PFAS shrink brain regions. Foam floats on top.</small></div>
          <div class="og-row">${ICON.plastic}${ICON.paper}<b class="og-arrow">➜</b>${ICON.algae}<small>Litter means less food, slower growth.</small></div>
        </section>
        <section><h3 class="og-mini">Danger!</h3>
          ${G.opts.preds ? st.preds.map(p => { const [who, how, txt] = ESC[p]; return `<div class="og-row">${who}<b class="og-arrow">➜</b>${how.join("")}<small>${txt}</small></div>`; }).join("") : `<div class="og-row">${ICON.algae}<small>Relaxed mode: no predators. Swim freely!</small></div>`}
          <div class="og-row">${ICON.heart}${ICON.heart}${ICON.heart}<small>3 hearts</small></div>
          <div class="og-row">${ICON.algae}<b class="og-arrow">➜</b>${ICON.bolt}<small>Eat for energy</small></div>
        </section>
        <section><h3 class="og-mini">Your tadpole now</h3>
          ${brainTips().map(([ic, txt]) => `<div class="og-row">${ICON[ic]}<small>${txt}</small></div>`).join("")}
        </section>
      </div>
      <div class="og-controls">${controls}</div>
      <p class="og-sub og-small">Take your time! The stage ends when you finish all 3 goals. If you leave before reaching clean habitat, you spend the rest of the stage in the polluted pond and your meters rise. Plume sizes and brain effects are illustrative.</p>${(coarse || touchMode) && matchMedia("(orientation: portrait)").matches ? '<p class="og-sub og-small">📱 Tip: turn your phone sideways for a bigger view.</p>' : ""}
      <button type="button" class="og-btn" id="og-go">Start stage ▶</button></div>`);
    $("og-go").addEventListener("click", () => { beep(260, 0.1, "triangle"); startStage(); });
    if (G.history.length) onBack(screenSummaryLast);
    $("og-change").addEventListener("click", () => screenSettings(screenBriefing, screenBriefing));
  }
  function screenCaught(cause) {
    G.screen = "caught";
    screen(`<div class="og-card"><h2 class="og-h">Oh no! ${cause}</h2>
      <div class="og-row" style="justify-content:center">${ICON.heart}</div>
      <p class="og-sub">Your tadpole didn't make it through stage ${G.stage + 1}. Nothing is lost: your brain and growth stay as they were. Try the stage again with a fresh tadpole.</p>
      <div class="og-actions"><button type="button" class="og-btn" id="og-retry">Try again ▶</button><button type="button" class="og-btn ghost" id="og-menu">Main menu</button></div></div>`);
    $("og-retry").addEventListener("click", () => { beep(260, 0.1, "triangle"); screenBriefing(); }); $("og-menu").addEventListener("click", screenTitle);
  }
  function screenSummaryLast() { const e = G.history[G.history.length - 1]; if (e) screenSummary(e, true); else screenTitle(); }
  function screenSummary(e, revisit) {
    G.screen = "summary";
    const lossRows = REGIONS.map(r => `<tr><td><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:50%;background:${r.color};border:2px solid #0b0a10;margin-right:.35rem"></i>${r.name}</td><td>${pct(e.before[r.k])} → ${pct(e.after[r.k])}</td><td class="${e.loss[r.k] > 0.5 ? "dn" : ""}">${e.loss[r.k] > 0.5 ? "−" + pct(e.loss[r.k]) : "0"}</td></tr>`).join("");
    const dom = RK.map(k => [k, e.loss[k]]).sort((a, b) => b[1] - a[1])[0];
    const line = e.E.metal + e.E.pfas < 10 ? "You kept your tadpole almost entirely out of metals and PFAS. Its brain barely changed." : `Metals and PFAS cost the most in the ${REGIONS.find(r => r.k === dom[0]).name.toLowerCase()} this stage (−${pct(dom[1])}).`;
    screen(`<div class="og-card og-wide">
      <p class="og-badge">Stage ${e.stage + 1} complete · ${e.name}</p>
      <h2 class="og-h">${e.reached ? "You reached clean habitat!" : "You stayed in the polluted pond."}</h2>
      ${e.penalty ? '<p class="og-sub og-small">Leaving without reaching clean habitat added 20 points to each exposure meter.</p>' : ""}
      <h3 class="og-mini">Exposure this stage</h3><div class="tg-bars">${expBars(e.E)}</div>
      <h3 class="og-mini">Growth</h3><div class="tg-bars">${bar("Algae eaten", e.eaten / e.target * 100, "#7bd96b", ICON.algae)}${bar("Body size", e.size, "#ff5fa2")}</div>
      <p class="og-sub og-small">Ate ${e.eaten} of ${e.target}${e.E.litter > 20 ? `, and litter exposure slowed growth by ${pct(25 * e.E.litter / 100)}%` : ""}. Size gained: ${e.gain.toFixed(1)} points.</p>
      <h3 class="og-mini">Brain</h3>
      <div class="tg-pair"><figure><canvas id="tg-b0"></canvas>Before</figure><figure><canvas id="tg-b1"></canvas>After</figure></div>
      <table class="tg-loss"><thead><tr><th>Region</th><th>Score</th><th>Change</th></tr></thead><tbody>${lossRows}</tbody></table>
      <p class="og-sub">${line}</p>
      <p class="tg-flag">Scores are illustrative game values, with 100 meaning the clean-water value. The sizes of the effects are made up. The hypotheses behind them are being tested.</p>
      <div class="og-actions"><button type="button" class="og-btn" id="og-next">Next stage ▶</button></div></div>`);
    requestAnimationFrame(() => { drawBrain(e.before, $("tg-b0"), { noGhost: true }); drawBrain(e.after, $("tg-b1")); });
    $("og-next").addEventListener("click", () => { beep(260, 0.1, "triangle"); screenBriefing(); });
  }
  function screenFinal() {
    G.screen = "final"; const kind = outcomeKind(), d = DEX.find(x => x.id === kind), first = !G.dex[kind]; G.dex[kind] = true; G.inRun = false; G.totals.finals = (G.totals.finals || 0) + 1;
    unlock("crown"); if (RK.every(k => G.brain[k] >= 80)) unlock("badge"); save(); renderDex(); flag("dex");
    const avg = k => G.history.reduce((s, e) => s + e.E[k], 0) / G.history.length;
    const rows = REGIONS.map(r => bar(r.name, G.brain[r.k], r.color)).join("");
    screen(`<div class="og-card og-wide">
      <p class="og-badge">Trek complete</p>
      <h2 class="og-h">You're a froglet! <span style="color:#7a3fd0">${d.name}</span></h2>
      <canvas id="tg-frog" width="260" height="130" style="justify-self:center;max-width:100%"></canvas>
      <p class="og-sub">${d.sub}${first ? " <b>New in your Pond-dex!</b>" : ""}</p>
      <h3 class="og-mini">Your froglet compared with a clean-water froglet (100)</h3>
      <div class="tg-bars">${bar("Body size", G.size, "#ff5fa2")}${rows}</div>
      <h3 class="og-mini">Average exposure across five stages</h3><div class="tg-bars">${expBars({ metal: avg("metal"), pfas: avg("pfas"), litter: avg("litter") })}</div>
      <p class="og-sub">In real ponds, the longer tadpoles live in contaminated water, the more chances a pollutant has to act. Our lab asks that question with CT scans of tadpole brains. Your Journal holds the hypotheses behind each effect.</p>
      <p class="tg-flag">Every number here is an illustrative game value, not a measurement.</p>
      <div class="og-actions"><button type="button" class="og-btn" id="og-again">Play again</button><button type="button" class="og-btn ghost" id="og-journal">Open Journal</button></div></div>`);
    const c = $("tg-frog").getContext("2d"); drawFrog2D(c, 130, 76, { k: 1.5, tint: d.tint, spots: kind === "grit" || kind === "double", small: kind === "slow" || kind === "lean", worn: G.worn });
    $("og-again").addEventListener("click", newGame); $("og-journal").addEventListener("click", () => openWin("journal"));
    jingle();
  }

  /* ============================================================
     MENU WINDOWS
     ============================================================ */
  function renderLife() {
    const box = $("og-life"); if (!box) return;
    if (!G.life.length) { box.innerHTML = '<p class="og-panel-sub">Your tadpole\'s story starts after your first stage. Every stage adds a page.</p>'; return; }
    const tot = { eaten: 0, finds: 0, stages: 0, caught: 0, dodges: 0, gems: 0 };
    G.life.forEach(e => { tot.eaten += e.eaten || 0; tot.finds += (e.finds || []).length; tot.gems += (e.gems || []).length; if (e.dead) tot.caught++; else tot.stages++; Object.entries(e.ev || {}).forEach(([k, n]) => { if (/^(dodge|escape|hide)/.test(k)) tot.dodges += n; }); });
    const chip = (ic, n, label) => `<span class="og-lchip">${ic}<b>${n}</b><small>${label}</small></span>`;
    const entries = G.life.slice().reverse().map(e => {
      const esc = Object.entries(e.ev || {}).filter(([k]) => /^(dodge|escape|hide)/.test(k)).map(([k, n]) => { const [kind, who] = k.split(":"); return kind === "dodge" ? `dodged a heron${n > 1 ? " ×" + n : ""}` : kind === "hide" ? `hid from a fish${n > 1 ? " ×" + n : ""}` : `slipped away from a ${who}${n > 1 ? " ×" + n : ""}`; });
      if (e.dead) return `<article class="og-lentry"><header><b>Stage ${e.stage + 1} · ${e.name}</b><span>Try again</span></header><p>${e.cause}</p><p class="og-lout lost">Caught before the stage ended.</p></article>`;
      const ex = e.E; const worst = ["metal", "pfas", "litter"].sort((a, b) => ex[b] - ex[a])[0];
      return `<article class="og-lentry"><header><b>Stage ${e.stage + 1} · ${e.name}</b><span>${e.reached ? "Reached clean habitat" : "Stayed in the pond"}</span></header>
        <p>Ate ${e.eaten} algae. Most exposure: ${ex[worst] < 5 ? "almost none" : GRP[worst].name.toLowerCase() + " (" + pct(ex[worst]) + ")"}.${esc.length ? " " + esc.join(", ").replace(/^./, c => c.toUpperCase()) + "." : ""}${e.finds && e.finds.length ? " Found " + e.finds.join(", ") + "." : ""}${e.gems && e.gems.length ? " Popped " + e.gems.join(", ") + "." : ""}</p></article>`;
    }).join("");
    box.innerHTML = `<div class="og-lsum"><div><h4>Trek record</h4><div class="og-lchips">${chip(ICON.flag, tot.stages, tot.stages === 1 ? "stage" : "stages")}${chip(ICON.algae, tot.eaten, "algae eaten")}${chip(ICON.ring, tot.finds, tot.finds === 1 ? "find" : "finds")}${chip(ICON.gem, tot.gems, tot.gems === 1 ? "treasure" : "treasures")}${chip(ICON.hide, tot.dodges, "close calls")}${chip(ICON.heart, tot.caught, tot.caught === 1 ? "catch" : "catches")}</div></div></div><h4 class="og-mini">Stage by stage</h4><div class="og-lentries">${entries}</div>`;
  }
  function renderGallery() {
    const box = $("og-gallery"); if (!box) return;
    if (!G.gallery.length) { box.innerHTML = '<p class="og-panel-sub">Finish a stage to add your first brain.</p>'; return; }
    box.innerHTML = G.gallery.slice().reverse().map((g, i) => `<figure class="og-gtile" style="--gc:#ff5900"><div><canvas data-g="${i}" aria-hidden="true"></canvas></div><figcaption><b>${g.label}</b></figcaption></figure>`).join("");
    const arr = G.gallery.slice().reverse(); box.querySelectorAll("canvas[data-g]").forEach(cv => drawBrain(arr[+cv.dataset.g].scores, cv));
  }
  function drawChart() {
    const cv = $("og-chart"); if (!cv || !cv.getBoundingClientRect().width) return;
    const o = sizeCanvas(cv), c = o.c, W = o.w, H = o.h, pad = 28 * o.d, n = NSTAGE;
    c.clearRect(0, 0, W, H); c.font = `${11 * o.d}px Fredoka, sans-serif`; c.fillStyle = "#9d93b8"; c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = 1;
    const X = i => pad + (W - pad * 1.6) * (i / (n - 1)), Y = v => H - pad - (H - pad * 1.6) * (v / 100);
    [0, 50, 100].forEach(v => { c.beginPath(); c.moveTo(pad, Y(v)); c.lineTo(W - pad * 0.6, Y(v)); c.stroke(); c.fillText(v, 4, Y(v) + 4 * o.d); });
    for (let i = 0; i < n; i++) c.fillText("S" + (i + 1), X(i) - 7 * o.d, H - 8 * o.d);
    c.setLineDash([4, 4]); c.strokeStyle = "rgba(255,255,255,0.5)"; c.beginPath(); c.moveTo(pad, Y(100)); c.lineTo(W - pad * 0.6, Y(100)); c.stroke(); c.setLineDash([]);
    const line = (vals, col, w = 2.2) => { if (!vals.length) return; c.strokeStyle = col; c.lineWidth = w * o.d; c.beginPath(); vals.forEach((v, i) => { i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)); }); c.stroke(); c.fillStyle = col; vals.forEach((v, i) => { c.beginPath(); c.arc(X(i), Y(v), 3 * o.d, 0, 7); c.fill(); }); };
    line(G.history.map(e => e.size), "#ff5fa2", 3);
    REGIONS.forEach(r => line(G.history.map(e => e.after[r.k]), r.color));
  }
  function updatePanels() {
    drawBrain(G.brain); drawChart();
    const b = G.brain, mean = Math.round(RK.reduce((s, k) => s + b[k], 0) / RK.length);
    if ($("og-brain-cap")) $("og-brain-cap").textContent = `Average region score ${mean} of 100. Dashed outline = clean-water brain.`;
    if ($("og-anat-sub")) $("og-anat-sub").textContent = G.history.length ? `After stage ${G.history.length}` : "Clean-water brain";
  }
  let mvLoaded = false;
  function loadModel() {
    if (mvLoaded) return; mvLoaded = true; const host = $("tg-mv");
    host.innerHTML = '<model-viewer src="models/tadpole-cns.glb" alt="3D model of a Lithobates heckscheri tadpole central nervous system" camera-controls touch-action="pan-y" auto-rotate rotation-per-second="10deg" camera-orbit="62deg 58deg 26m" camera-target="0m 1.6m 19.5m" field-of-view="30deg" min-camera-orbit="auto auto 3m" shadow-intensity="0" exposure="1.1"></model-viewer>';
    if (window.SQ_track) window.SQ_track("view", "tadpole-cns", "tadpole-trek");
  }
  $("tg-mv-load").addEventListener("click", loadModel);

  /* ---------- Idle canvas (behind menus) ---------- */
  function drawIdle() {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H); g.addColorStop(0, "#1c3b5c"); g.addColorStop(0.55, "#2a7f8e"); g.addColorStop(1, "#16525c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, VIEW_H);
    const t = performance.now() / 1000;
    ctx.fillStyle = "rgba(217,130,43,0.16)"; ctx.beginPath(); ctx.ellipse(viewW * 0.18, 300, 120, 60, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(176,108,255,0.14)"; ctx.beginPath(); ctx.ellipse(viewW * 0.42, 110, 110, 50, 0, 0, 7); ctx.fill();
    for (let i = 0; i < 4; i++) drawTad2D(ctx, ((t * 36 + i * viewW / 4) % (viewW + 140)) - 70, 130 + i * 52 + Math.sin(t + i) * 8, { k: 1.1, stage: i, time: t + i, worn: i === 1 ? G.worn : {} });
  }
  function idleLoop() { if (!running && G.screen !== "season") { drawIdle(); if (!reduce) requestAnimationFrame(idleLoop); } }

  /* ---------- Hotbar windows ---------- */
  const modal = $("og-modal"); let openK = null, lastFocus = null;
  stageEl.appendChild(modal);
  const WIN_KEYS = { j: "journal", l: "life", k: "anatomy", v: "growth", o: "wardrobe", x: "dex", t: "treasure" };
  // build the window tabs from the hotbar slots
  $("og-tabs").innerHTML = [...document.querySelectorAll(".og-slot")].map(b => `<button type="button" role="tab" data-win="${b.dataset.win}">${b.querySelector("svg").outerHTML}<span>${b.querySelector("span").textContent}</span></button>`).join("");
  function flag(k) { if (openK === k) return; const b = document.querySelector(`.og-slot[data-win="${k}"] .og-badge-new`); if (b) { b.hidden = false; b.parentElement.classList.add("has-new"); } $("og-bag").classList.add("has-new"); }
  let winHist = [];
  function openWin(k, fromBack) {
    if (!openK) { lastFocus = document.activeElement; winHist = []; } else if (!fromBack && openK !== k) winHist.push(openK);
    openK = k; modal.hidden = false; keys = {};
    if (S && G.screen === "season") S.paused = true;
    document.querySelectorAll(".og-window").forEach(w => w.hidden = w.dataset.win !== k);
    document.querySelectorAll(".og-modal-tabs [data-win]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.win === k)));
    const w = document.querySelector(`.og-window[data-win="${k}"]`);
    $("og-modal-title").textContent = w.querySelector("h2").textContent;
    $("og-modal-icon").innerHTML = document.querySelector(`.og-slot[data-win="${k}"] svg`).outerHTML;
    const b = document.querySelector(`.og-slot[data-win="${k}"]`); b.querySelector(".og-badge-new").hidden = true; b.classList.remove("has-new"); $("og-bag").classList.toggle("has-new", !!document.querySelector(".og-slot.has-new"));
    if (k === "anatomy" || k === "growth") requestAnimationFrame(() => { updatePanels(); if (k === "anatomy") renderGallery(); });
    if (k === "life") renderLife();
    if (k === "treasure") requestAnimationFrame(renderNature);
    beep(220, 0.06, "triangle", 0.04); $("og-close").focus({ preventScroll: true });
  }
  function closeWin() {
    if (!openK) return; openK = null; modal.hidden = true; keys = {};
    if (S && G.screen === "season") { if (!$("og-screen").querySelector(".og-pause")) { S.paused = false; lastT = performance.now(); glc.focus({ preventScroll: true }); } }
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.querySelectorAll(".og-slot, .og-modal-tabs [data-win]").forEach(b => b.addEventListener("click", () => openWin(b.dataset.win)));
  $("og-close").addEventListener("click", closeWin);
  $("og-win-back").addEventListener("click", () => { const prev = winHist.pop(); prev ? openWin(prev, true) : closeWin(); });
  modal.addEventListener("click", e => { if (e.target === modal) closeWin(); });
  window.addEventListener("keydown", e => {
    if (e.target.closest && e.target.closest("input, textarea")) return;
    if (openK && e.key === "Escape") { e.preventDefault(); closeWin(); return; }
    if (e.key === "Escape") { e.preventDefault(); goHome(); return; }
    const k = WIN_KEYS[e.key.toLowerCase()];
    if (k && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openK === k ? closeWin() : openWin(k); }
  });

  /* ---------- Touch controls (Roblox style) and full screen ---------- */
  const stickEl = $("og-stick"), knob = $("og-knob");
  function placeStick(x, y, dx = 0, dy = 0, on = false) { stickEl.style.left = x + "px"; stickEl.style.top = y + "px"; knob.style.transform = `translate(${dx}px, ${dy}px)`; stickEl.classList.toggle("on", on); }
  function restStick() { const r = stageEl.getBoundingClientRect(); placeStick(Math.min(110, r.width * 0.22), r.height - 100); }
  function showTouch() {
    stageEl.classList.toggle("touch", touchMode);
    if (!touchMode) return;
    $("og-touch").hidden = false; restStick();
    const hint = $("og-touch-hint"); hint.hidden = false; setTimeout(() => { hint.hidden = true; }, 6000);
  }
  function endTouch() { stick.active = false; stick.id = null; stick.x = stick.y = 0; look = null; }
  glc.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    if (!touchMode) { touchMode = true; showTouch(); }
    const r = glc.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    glc.setPointerCapture(e.pointerId); e.preventDefault();
    if (x < r.width * 0.5 && !stick.active) { Object.assign(stick, { active: true, id: e.pointerId, ox: x, oy: y, x: 0, y: 0 }); placeStick(x, y, 0, 0, true); }
    else if (!look) look = { id: e.pointerId, x: e.clientX };
  });
  glc.addEventListener("pointermove", e => {
    if (stick.active && e.pointerId === stick.id) {
      const r = glc.getBoundingClientRect(), R = 52; let dx = e.clientX - r.left - stick.ox, dy = e.clientY - r.top - stick.oy;
      const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
      stick.x = dx / R; stick.y = dy / R; placeStick(stick.ox, stick.oy, dx, dy, true);
    } else if (look && e.pointerId === look.id && S) { S.camYaw -= (e.clientX - look.x) * 0.009; look.x = e.clientX; }
  });
  const lift = e => { if (stick.active && e.pointerId === stick.id) { stick.active = false; stick.id = null; stick.x = stick.y = 0; restStick(); } if (look && e.pointerId === look.id) look = null; };
  glc.addEventListener("pointerup", lift); glc.addEventListener("pointercancel", lift);
  document.querySelectorAll(".og-tbtn").forEach(b => { b.addEventListener("pointerdown", () => b.classList.add("on")); ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, () => b.classList.remove("on"))); });
  const smallLandscape = () => matchMedia("(orientation: landscape) and (max-height: 520px)").matches;
  matchMedia("(orientation: landscape)").addEventListener("change", () => setTimeout(() => {
    if (running && touchMode && smallLandscape() && !stageEl.classList.contains("og-fs-on")) setFull(true);
    resize(); size3D(); if (!running) drawIdle(); if (running && touchMode) restStick();
  }, 250));
  $("og-bag").addEventListener("click", () => openWin(document.querySelector(".og-slot.has-new")?.dataset.win || "journal"));
  $("og-end").addEventListener("click", () => { if (S && running && S.ending <= 0) S.ending = 0.01; });
  function setFull(on) {
    stageEl.classList.toggle("og-fs-on", on); document.body.classList.toggle("og-noscroll", on);
    $("og-fs").setAttribute("aria-pressed", String(on)); $("og-fs").setAttribute("aria-label", on ? "Exit full screen" : "Full screen"); $("og-fs").textContent = on ? "✕" : "⛶";
    try { if (on && stageEl.requestFullscreen && !document.fullscreenElement) stageEl.requestFullscreen().then(() => { if (touchMode && screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {}); if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) {}
    requestAnimationFrame(() => { resize(); size3D(); if (!running) drawIdle(); if (S && touchMode && G.screen === "season") restStick(); });
  }
  $("og-fs").addEventListener("click", () => setFull(!stageEl.classList.contains("og-fs-on")));
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && stageEl.classList.contains("og-fs-on")) setFull(false); });

  /* ---------- Main menu button and pause ---------- */
  function quitStage() {
    leaveSeason(); S = null; screenTitle(); idleLoop();
  }
  function goHome() {
    if (openK) closeWin();
    if (G.screen === "season" && S) {
      if (S.paused && $("og-screen").querySelector(".og-pause")) { resume(); return; }
      S.paused = true; keys = {};
      screen(`<div class="og-card og-pause"><h2 class="og-h">Paused</h2>
        <div class="og-actions og-stack"><button type="button" class="og-btn" id="og-resume">▶ Resume</button>
        <button type="button" class="og-btn ghost" id="og-pmenu">🎒 Open backpack</button>
        <button type="button" class="og-btn ghost" id="og-quit">⌂ Main menu</button></div>
        <p class="og-sub og-small">Going to the main menu restarts this stage later. Your progress from finished stages stays saved.</p></div>`);
      $("og-resume").addEventListener("click", resume);
      $("og-pmenu").addEventListener("click", () => openWin(document.querySelector(".og-slot.has-new")?.dataset.win || "journal"));
      $("og-quit").addEventListener("click", quitStage);
      return;
    }
    if (G.screen !== "title") { beep(220, 0.06, "triangle", 0.04); screenTitle(); }
  }
  function resume() { if (!S) return; screen(""); S.paused = false; lastT = performance.now(); glc.focus({ preventScroll: true }); }
  $("og-home").addEventListener("click", goHome);

  /* ---------- Input ---------- */
  const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s", "A", "D", "W", "S", "Shift", "e", "E", "q", "Q", "c", "C"];
  window.addEventListener("keydown", e => { if (G.screen === "season" && !openK && GAME_KEYS.includes(e.key)) { keys[e.key] = true; e.preventDefault(); } });
  window.addEventListener("keyup", e => { keys[e.key] = false; });
  window.addEventListener("blur", () => { keys = {}; });
  document.querySelectorAll("[data-key]").forEach(b => {
    const k = b.dataset.key, on = e => { e.preventDefault(); keys[k] = true; }, off = () => { keys[k] = false; };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });
  glc.addEventListener("pointerdown", () => glc.focus({ preventScroll: true }));
  $("og-mute").addEventListener("click", e => { muted = !muted; e.currentTarget.setAttribute("aria-pressed", String(muted)); e.currentTarget.textContent = muted ? "Sound off" : "Sound on"; glc.focus({ preventScroll: true }); });
  window.addEventListener("resize", () => { resize(); size3D(); updatePanels(); if (!running) drawIdle(); });

  resize(); renderCloset(); renderDex(); renderTreasure(); updatePanels();
  { const seenK = Object.keys(G.seen); if (seenK.length) renderFact(seenK[seenK.length - 1]); }
  screenTitle(); idleLoop();
})();
