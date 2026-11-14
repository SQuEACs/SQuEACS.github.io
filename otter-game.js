/* ============================================================
   OTTER EVOLUTION  ·  SQuEACs Lab
   Play one season as an otter, then watch natural selection,
   inheritance, mutation, and drift reshape the population over
   generations. Habitat optima below are illustrative, not data.
   ============================================================ */
(function () {
  const $ = id => document.getElementById(id);
  const canvas = $("og-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Constants and helpers ---------- */
  const VIEW_H = 360, GROUND = 262, SEABED = 338, WORLD_W = 2600, SEASON = 75, POP = 12, GENS = 8, QUEST = 8;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const degOf = v => Math.round(65 + v * 0.35);          // canal trait 0-100 -> 65°-100°
  const valOfDeg = d => (d - 65) / 0.35;

  const TRAITS = [
    { k: "size",    name: "Body size",     color: "#ff5fa2" },
    { k: "fur",     name: "Fur thickness", color: "#a47bff" },
    { k: "ext",     name: "Ears and tail", color: "#2ed3c6" },
    { k: "cochlea", name: "Cochlea shape", color: "#ffb347" },
    { k: "canal",   name: "Canal angle",   color: "#7fd1ff" },
    { k: "brain",   name: "Brain size",    color: "#f4f2fa" },
  ];

  /* ---------- Habitats (optima are illustrative) ---------- */
  const HAB = {
    snow:   { name: "Snowy North",      blurb: "Bitter winters. Fish wait under the ice.", land: true,  sky: ["#2a2a55", "#6f6aa8", "#d9d4f2"], ground: "#eef0fb", ground2: "#c8cbe6",
              opt: { size: 82, fur: 90, ext: 18, cochlea: 45, canal: valOfDeg(86), brain: 50 }, facts: ["bergmann", "allen"], hazard: "eagle" },
    desert: { name: "Desert River",     blurb: "Scorching sun and scarce food along a thin river.", land: true, sky: ["#ff8a5c", "#ff5fa2", "#6b3f8f"], ground: "#d9a15b", ground2: "#b97f3f",
              opt: { size: 30, fur: 14, ext: 86, cochlea: 35, canal: valOfDeg(86), brain: 35 }, facts: ["allen", "tissue"], hazard: "eagle" },
    fast:   { name: "Fast Mountain River", blurb: "Roaring rapids and tumbling logs.", water: { flow: 110, murk: 0, top: "rgba(120,220,235,0.88)", deep: "rgba(20,70,95,0.97)" }, sky: ["#2b4f7a", "#3f7fa8", "#9be3f0"],
              opt: { size: 55, fur: 50, ext: 50, cochlea: 75, canal: valOfDeg(93), brain: 66 }, facts: ["agility", "buffer"], hazard: "logs" },
    slow:   { name: "Slow Marsh Stream", blurb: "Calm, weedy water that barely moves.", water: { flow: 18, murk: 0.15, top: "rgba(120,180,120,0.85)", deep: "rgba(30,60,45,0.97)" }, sky: ["#3b4a3a", "#5f7f5a", "#c8e0a8"],
              opt: { size: 55, fur: 45, ext: 55, cochlea: 75, canal: valOfDeg(74), brain: 50 }, facts: ["relaxed", "cochlea"], hazard: "logs" },
    murky:  { name: "Murky Pond",       blurb: "Muddy water. You can barely see your own whiskers.", water: { flow: 0, murk: 0.9, top: "rgba(150,115,70,0.94)", deep: "rgba(55,40,25,0.99)" }, sky: ["#3a2f2a", "#6b5640", "#c9b089"],
              opt: { size: 50, fur: 45, ext: 50, cochlea: 86, canal: valOfDeg(82), brain: 60 }, facts: ["sensory", "cochlea"], hazard: "none" },
    lake:   { name: "Deep Clear Lake",  blurb: "Plenty of fish and plenty of otter friends.", water: { flow: 0, murk: 0, top: "rgba(88,198,224,0.85)", deep: "rgba(20,40,90,0.97)" }, sky: ["#20305f", "#2b5c8f", "#58c6e0"],
              opt: { size: 64, fur: 55, ext: 45, cochlea: 92, canal: valOfDeg(86), brain: 76 }, facts: ["social", "tissue"], hazard: "eagle" },
  };
  const ORDER = ["snow", "desert", "fast", "slow", "murky", "lake"];

  /* ---------- Science cards ---------- */
  const R = "research.html";
  const FACTS = {
    plasticity: { t: "Plasticity is not evolution", k: "Phenotypic plasticity", x: "Your otter's fur changed during this season. Changes within one lifetime are plasticity, and its pups won't inherit them. Evolution only happens across generations.", h: R, l: "Our research" },
    fitness:    { t: "What fitness means", k: "Darwinian fitness", x: "In evolution, fitness means surviving and leaving offspring. The more food your otter found, the more pups it raised.", h: R, l: "Our research" },
    selection:  { t: "Natural selection", k: "Natural selection (Darwin & Wallace, 1858)", x: "Otters whose traits suited this habitat survived more often and left more pups. Repeat that over many generations and the whole population changes.", h: R, l: "Our research" },
    inherit:    { t: "Passing traits on", k: "Heredity and heritability", x: "Pups resemble their parents. Each pup's traits land near its parents' average, so traits that helped parents survive become more common.", h: R, l: "Our research" },
    mutation:   { t: "Brand-new variation", k: "Mutation and genetic variation", x: "Sometimes a pup is born noticeably different from both parents. Mutation supplies the variation that selection acts on.", h: R, l: "Our research" },
    drift:      { t: "Luck matters too", k: "Genetic drift (Wright, 1931)", x: "A well-suited otter did not survive this time. In small populations, chance alone can change which traits get passed on.", h: R, l: "Our research" },
    fluct:      { t: "Some years are harder than others", k: "Fluctuating selection (Grant & Grant, 2002)", x: "In good years most animals survive. In hard years, such as droughts or long winters, only the best-suited survive, so selection is stronger. Studies of Darwin's finches showed populations shifting after droughts.", h: R, l: "Our research" },
    adapt:      { t: "One species, many forms", k: "Local adaptation and intraspecific variation", x: "Populations of one species living in different places can evolve different traits. Which forces drive that variation is the big question our lab studies.", h: "index.html#what-we-do", l: "The big question" },
    bergmann:   { t: "Hypothesis: big bodies in the cold", k: "Bergmann's rule (Bergmann, 1847)", x: "Bigger bodies lose heat more slowly for their size, so this rule predicts larger animals in colder places. We tested it in pine martens.", h: R + "#limb", l: "Limb research" },
    allen:      { t: "Hypothesis: ears and tails track climate", k: "Allen's rule (Allen, 1877)", x: "Long ears and tails shed heat; short ones conserve it. The rule predicts shorter extremities in the cold and longer ones in the heat. We tested it in pine martens.", h: R + "#limb", l: "Limb research" },
    tissue:     { t: "Hypothesis: diet quality and brain size", k: "Expensive tissue hypothesis (Aiello & Wheeler, 1995)", x: "Brains burn a lot of energy. This hypothesis links energy-rich diets with the ability to afford a larger brain. Our work across carnivorans suggests the link differs among groups.", h: R + "#brain", l: "Brain research" },
    buffer:     { t: "Hypothesis: complex habitats and brain size", k: "Cognitive buffer hypothesis (Allman et al., 1993; Sol, 2009)", x: "Larger brains may help animals cope with complex, changing environments. We test whether otters from more demanding habitats have larger brains by comparing endocasts.", h: R + "#brain", l: "Brain research" },
    social:     { t: "Hypothesis: sociality and brain size", k: "Social brain hypothesis (Dunbar, 1998)", x: "Keeping track of others may favor larger brains. We test whether social behavior helps explain brain size and shape among musteloids, from solitary mink to more social otters.", h: R + "#brain", l: "Brain research" },
    agility:    { t: "Hypothesis: fast water and the canals", k: "Agility hypothesis (Spoor et al., 2007); canal orthogonality (Malinzak et al., 2012)", x: "Rapids spin and toss a swimming otter. Canals set close to right angles may sense head rotation more evenly. We test whether canal shape and orientation differ among otters from different waters.", h: R + "#inner-ear", l: "Inner ear research" },
    relaxed:    { t: "Hypothesis: calm water and the canals", k: "Relaxed selection (Lahti et al., 2009)", x: "In slow, calm water the demands on balance may ease, so canals can drift away from right angles without cost. We test this by comparing otters from different water systems.", h: R + "#inner-ear", l: "Inner ear research" },
    sensory:    { t: "Hypothesis: murky water and the senses", k: "Sensory drive hypothesis (Endler, 1992)", x: "When water is too muddy to see through, senses tuned to local conditions matter more, such as hearing and whiskers. We test how environment shapes otter sensory anatomy.", h: R + "#inner-ear", l: "Inner ear research" },
    cochlea:    { t: "Hypothesis: water and the cochlea", k: "Cochlear shape and hearing range (West, 1985; Manoussaki et al., 2008)", x: "Sound travels differently in water than in air. One prediction is that aquatic life favors a flatter, longer cochlear spiral. We test whether cochlear shape differs among otters from different environments.", h: R + "#inner-ear", l: "Inner ear research" },
  };

  /* ---------- Outfits (achievements) ---------- */
  const OUTFITS = {
    beanie:     { name: "Snow beanie",      slot: "hat",  hint: "Evolve thick fur (population average)." },
    scarf:      { name: "Striped scarf",    slot: "neck", hint: "Play a season in the Snowy North." },
    sunglasses: { name: "Sunglasses",       slot: "eyes", hint: "Evolve thin fur (population average)." },
    goggles:    { name: "Swim goggles",     slot: "eyes", hint: "Evolve a flat, long cochlea." },
    chef:       { name: "Chef's hat",       slot: "hat",  hint: "Find 12 food in one season." },
    crown:      { name: "Crayfish crown",   slot: "hat",  hint: "Finish a season without getting hit." },
    gradcap:    { name: "Thinking cap",     slot: "hat",  hint: "Evolve a big brain." },
    labcoat:    { name: "SQuEACs lab coat", slot: "body", hint: "Reach generation 8." },
  };

  /* ---------- Otter Collection: offspring phenotypes to discover ---------- */
  const DEX = [
    { id: "classic",  name: "Classic River Otter", hint: "Raise any pup with middle-of-the-road traits.", why: "Average in every trait, like the starting population.", test: t => TRAITS.every(({ k }) => k === "canal" || (t[k] >= 38 && t[k] <= 62)) },
    { id: "mutant",   name: "Mighty Mutant",       hint: "Raise a pup born with a mutation.",          why: "Carries a new mutation that neither parent had.", test: (t, p) => p.mut },
    { id: "fluff",    name: "Fluffball",           hint: "Evolve very thick fur.",                     why: "Fur thickness 80 or more.", test: t => t.fur >= 80 },
    { id: "giant",    name: "Snow Giant",          hint: "Big body and thick fur. Try the Snowy North.", why: "Large body and thick fur hold in heat (Bergmann's rule).", test: t => t.size >= 70 && t.fur >= 70 },
    { id: "sprinter", name: "Desert Sprinter",     hint: "Small, thin-furred, long ears and tail. Try the Desert River.", why: "Small body, thin fur, and long extremities shed heat (Allen's rule).", test: t => t.size <= 36 && t.fur <= 32 && t.ext >= 66 },
    { id: "racer",    name: "Rapids Racer",        hint: "Canals near right angles. Try the Fast Mountain River.", why: "Canal angle 90° or more for sensing quick turns.", test: t => degOf(t.canal) >= 90 },
    { id: "drifter",  name: "Marsh Drifter",       hint: "Narrow canal angle. Try the Slow Marsh Stream.", why: "Canal angle 77° or less, where calm water relaxes selection.", test: t => degOf(t.canal) <= 77 },
    { id: "listener", name: "Mud Listener",        hint: "Flat, long cochlea. Try the Murky Pond.", why: "Cochlea score 82 or more for hearing in murky water.", test: t => t.cochlea >= 82 },
    { id: "thinker",  name: "Big Thinker",         hint: "Evolve a big brain. Try the Deep Clear Lake.", why: "Brain size 72 or more.", test: t => t.brain >= 72 },
    { id: "saver",    name: "Energy Saver",        hint: "Evolve a small brain where food is scarce.", why: "Brain size 32 or less saves energy (expensive tissue hypothesis).", test: t => t.brain <= 32 },
  ];

  /* ---------- Surprise treasures ---------- */
  const TREASURE = [
    { id: "pebble",    name: "Smooth river pebble", color: "#b8b0a0", shape: "pebble",  rarity: "Common",    w: 30 },
    { id: "quartz",    name: "Quartz crystal",      color: "#f4f2fa", shape: "crystal", rarity: "Common",    w: 22 },
    { id: "agate",     name: "Banded agate",        color: "#ff8a5c", shape: "pebble",  rarity: "Uncommon",  w: 14 },
    { id: "jasper",    name: "Red jasper",          color: "#d8434b", shape: "gem",     rarity: "Uncommon",  w: 12 },
    { id: "geode",     name: "Amethyst geode",      color: "#a47bff", shape: "crystal", rarity: "Rare",      w: 8 },
    { id: "turquoise", name: "Turquoise nugget",    color: "#2ed3c6", shape: "gem",     rarity: "Rare",      w: 7 },
    { id: "fossil",    name: "Fossil shell",        color: "#e0c9a0", shape: "fossil",  rarity: "Rare",      w: 5 },
    { id: "nugget",    name: "Golden nugget",       color: "#ffd23f", shape: "gem",     rarity: "Legendary", w: 2 },
  ];
  function pickTreasure() { let r = Math.random() * TREASURE.reduce((a, b) => a + b.w, 0); for (const tr of TREASURE) { r -= tr.w; if (r <= 0) return tr; } return TREASURE[0]; }

  /* ---------- Game state ---------- */
  let G = { screen: "title", hab: "lake", gen: 1, pop: [], history: [], runs: [], seen: {}, unlocked: {}, worn: {}, habSeasons: {}, dex: {}, treasure: {}, opts: { preds: true, timer: true }, gallery: [], inRun: false };
  try { const s = JSON.parse(localStorage.getItem("squeacs-otter-evo") || "{}"); if (s.unlocked) { G.unlocked = s.unlocked; G.worn = s.worn || {}; G.runs = s.runs || []; G.dex = s.dex || {}; G.treasure = s.treasure || {}; if (s.opts) G.opts = s.opts; G.gallery = s.gallery || []; } } catch (e) {}
  const save = () => { try { localStorage.setItem("squeacs-otter-evo", JSON.stringify({ unlocked: G.unlocked, worn: G.worn, runs: G.runs.slice(-4), dex: G.dex, treasure: G.treasure, opts: G.opts, gallery: G.gallery.slice(-30) })); } catch (e) {} };

  const startTraits = () => ({ size: 50 + gauss() * 10, fur: 50 + gauss() * 10, ext: 50 + gauss() * 10, cochlea: 50 + gauss() * 10, canal: valOfDeg(84) + gauss() * 8, brain: 50 + gauss() * 10 });
  const clampT = t => { const o = {}; for (const k in t) o[k] = clamp(t[k], 0, 100); return o; };
  function newPopulation() { return Array.from({ length: POP }, (_, i) => ({ t: clampT(startTraits()), lead: i === 0 })); }
  const meanTraits = pop => { const m = {}; TRAITS.forEach(({ k }) => m[k] = pop.reduce((s, o) => s + o.t[k], 0) / pop.length); return m; };
  const lead = () => G.pop.find(o => o.lead) || G.pop[0];
  function fitness(t, hab) {
    const opt = HAB[hab].opt, w = { size: 1, fur: 1, ext: 1, cochlea: 1, canal: 1, brain: 0.7 };
    let s = 0, ws = 0; for (const k in w) { s += w[k] * (t[k] - opt[k]) ** 2; ws += w[k]; }
    return Math.exp(-(s / ws) / (2 * 22 * 22));
  }

  /* ---------- Sizing ---------- */
  let scale = 1, viewW = 640, dpr = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    scale = r.height / VIEW_H; viewW = r.width / scale;
  }

  /* ---------- Sound (starts after a click) ---------- */
  let ac = null, muted = false;
  function beep(f, d = 0.09, type = "square", vol = 0.05) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = vol;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
    } catch (e) {}
  }
  function audio() { if (muted) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; } catch (e) { return null; } }
  let noiseBuf = null;
  function noise(a) { if (noiseBuf) return noiseBuf; const b = a.createBuffer(1, Math.floor(a.sampleRate * 0.8), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noiseBuf = b); }
  function env(a, g, vol, att, dur) { const t = a.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function sfx(kind, vol = 0.1) {
    const a = audio(); if (!a) return;
    vol = clamp(vol, 0.005, 0.25); const t = a.currentTime, g = a.createGain(); g.connect(a.destination);
    const osc = (type, f) => { const o = a.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; };
    const lfoTo = (param, rate, depth, dur) => { const l = osc("sine", rate), lg = a.createGain(); lg.gain.value = depth; l.connect(lg); lg.connect(param); l.start(t); l.stop(t + dur); };
    if (kind === "eagle") {           // low wing whoosh plus a deep two-note warning (no high screech)
      const n = a.createBufferSource(); n.buffer = noise(a);
      const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(180, t); f.frequency.linearRampToValueAtTime(520, t + 0.25); f.frequency.linearRampToValueAtTime(160, t + 0.6);
      n.connect(f); f.connect(g); env(a, g, vol * 1.4, 0.12, 0.65); n.start(t); n.stop(t + 0.7);
      [[147, 0], [131, 0.22]].forEach(([fr, dt]) => { const o = a.createOscillator(), gg = a.createGain(); o.type = "triangle"; o.frequency.value = fr; o.connect(gg); gg.connect(a.destination); const st = t + dt; gg.gain.setValueAtTime(0.0001, st); gg.gain.exponentialRampToValueAtTime(vol * 0.9, st + 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, st + 0.2); o.start(st); o.stop(st + 0.22); });
    } else if (kind === "growl") {    // low coyote growl
      const o = osc("sawtooth", 80); lfoTo(o.frequency, 13, 22, 0.7);
      const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 450; o.connect(f); f.connect(g);
      env(a, g, vol, 0.05, 0.65); o.start(t); o.stop(t + 0.7);
    } else if (kind === "howl") {     // distant coyote howl
      const o = osc("sine", 420); o.frequency.exponentialRampToValueAtTime(720, t + 0.45); o.frequency.exponentialRampToValueAtTime(520, t + 1.2); lfoTo(o.frequency, 6, 12, 1.3);
      o.connect(g); env(a, g, vol, 0.12, 1.25); o.start(t); o.stop(t + 1.3);
    } else if (kind === "gator") {    // hiss over a deep rumble
      const n = a.createBufferSource(); n.buffer = noise(a); const f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2200; n.connect(f); f.connect(g);
      env(a, g, vol * 0.8, 0.04, 0.6); n.start(t); n.stop(t + 0.65);
      const g2 = a.createGain(); g2.connect(a.destination); const r = osc("sine", 52); r.connect(g2); env(a, g2, vol, 0.05, 0.7); r.start(t); r.stop(t + 0.75);
    } else if (kind === "splash") {
      const n = a.createBufferSource(); n.buffer = noise(a); const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900; n.connect(f); f.connect(g);
      env(a, g, vol, 0.02, 0.4); n.start(t); n.stop(t + 0.45);
    } else if (kind === "sparkle") {
      [1320, 1760, 2093, 2637].forEach((fr, i) => { const o = a.createOscillator(), gg = a.createGain(); o.type = "triangle"; o.frequency.value = fr; gg.connect(a.destination); o.connect(gg); const st = t + i * 0.07; gg.gain.setValueAtTime(0.0001, st); gg.gain.exponentialRampToValueAtTime(vol, st + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, st + 0.25); o.start(st); o.stop(st + 0.3); });
    }
  }
  const jingle = () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.12, "triangle", 0.06), i * 90));

  /* ---------- Science card panel ---------- */
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
    G.seen[key] = true; renderFact(key); flag("journal");
    const box = $("og-fact"); box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
    toast("New science card in your Journal (J): " + FACTS[key].t.replace(/^Hypothesis: /, ""));
  }
  let toastT = 0;
  function toast(msg) { const el = $("og-toast"); el.textContent = msg; el.hidden = false; toastT = 3; }

  function unlock(id) {
    if (G.unlocked[id]) return;
    G.unlocked[id] = true;
    const slot = OUTFITS[id].slot;
    Object.keys(G.worn).forEach(k => { if (OUTFITS[k].slot === slot) G.worn[k] = false; });
    G.worn[id] = true; save(); renderCloset(); jingle(); flag("wardrobe");
    setTimeout(() => toast("Outfit unlocked: " + OUTFITS[id].name + "! See your Wardrobe (O)."), 400);
  }
  const BASE = { size: 50, fur: 50, ext: 50, cochlea: 50, canal: 50, brain: 50 };
  function paintTile(cv, t, worn, locked) {
    const c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height); c.save();
    drawOtter(c, 64, 94, t, { k: 1.0, worn: worn || {} });
    if (locked) {
      c.globalCompositeOperation = "source-in"; c.fillStyle = "#2b2540"; c.fillRect(0, 0, cv.width, cv.height);
      c.globalCompositeOperation = "source-over"; c.fillStyle = "#ff5fa2"; c.font = "700 34px Fredoka, Arial, sans-serif"; c.textAlign = "center"; c.fillText("?", 70, 62);
    }
    c.restore();
  }
  function tile(id, name, sub, unlocked, extra = "") {
    const tag = unlocked && extra.includes("data-wear") ? "button" : "div";
    return `<${tag} ${tag === "button" ? 'type="button" ' : ""}class="og-tile${unlocked ? "" : " locked"}" data-id="${id}" ${extra}>
      <canvas width="140" height="100" data-tile="${id}" aria-hidden="true"></canvas>
      <b>${unlocked ? name : "???"}</b><span>${sub}</span></${tag}>`;
  }
  function renderCloset() {
    const box = $("og-closet");
    box.innerHTML = Object.entries(OUTFITS).map(([id, o]) => G.unlocked[id]
      ? tile(id, o.name, G.worn[id] ? "Wearing · tap to remove" : "Tap to wear", true, `data-wear aria-pressed="${!!G.worn[id]}"`)
      : tile(id, o.name, o.hint, false)).join("");
    box.querySelectorAll("canvas[data-tile]").forEach(cv => { const id = cv.dataset.tile; paintTile(cv, BASE, { [id]: true }, !G.unlocked[id]); });
    box.querySelectorAll("button.og-tile").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.id, slot = OUTFITS[id].slot, on = !G.worn[id];
      Object.keys(G.worn).forEach(k => { if (OUTFITS[k].slot === slot) G.worn[k] = false; });
      G.worn[id] = on; save(); renderCloset(); if (G.screen !== "season") drawIdle();
    }));
    $("og-outfit-count").textContent = `${Object.keys(OUTFITS).filter(k => G.unlocked[k]).length} of ${Object.keys(OUTFITS).length}`;
  }
  function drawGem(c, tr, locked, w = 140, h = 100) {
    c.clearRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2 + 4);
    const col = locked ? "#2b2540" : tr.color, edge = locked ? "#3a3350" : "#0b0a10";
    c.lineWidth = 3; c.strokeStyle = edge; c.lineJoin = "round"; c.fillStyle = col;
    if (tr.shape === "pebble") {
      c.beginPath(); c.ellipse(0, 0, 34, 24, -0.2, 0, 7); c.fill(); c.stroke();
      if (!locked && tr.id === "agate") { c.strokeStyle = "rgba(255,255,255,0.6)"; c.lineWidth = 3; [14, 22].forEach(r => { c.beginPath(); c.ellipse(0, 0, r, r * 0.65, -0.2, 0, 7); c.stroke(); }); }
    } else if (tr.shape === "crystal") {
      const pts = [[-26, 22], [-30, -2], [-12, -30], [0, -6], [10, -34], [28, -4], [24, 22]];
      c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke();
      if (!locked) { c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -30); c.lineTo(-10, 20); c.moveTo(10, -34); c.lineTo(8, 20); c.stroke(); }
    } else if (tr.shape === "gem") {
      c.beginPath(); c.moveTo(-30, -10); c.lineTo(-16, -26); c.lineTo(16, -26); c.lineTo(30, -10); c.lineTo(0, 28); c.closePath(); c.fill(); c.stroke();
      if (!locked) { c.strokeStyle = "rgba(255,255,255,0.6)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -10); c.lineTo(30, -10); c.moveTo(-8, -26); c.lineTo(0, 28); c.lineTo(8, -26); c.stroke(); }
    } else {
      c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill(); c.stroke();
      if (!locked) { c.strokeStyle = "rgba(90,60,30,0.75)"; c.lineWidth = 2.5; c.beginPath(); for (let a = 0; a < 12; a += 0.15) { const r = 2 + a * 2.3; const x = Math.cos(a) * r, y = Math.sin(a) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    }
    if (locked) { c.fillStyle = "#ff5fa2"; c.font = "700 30px Fredoka, Arial, sans-serif"; c.textAlign = "center"; c.fillText("?", 0, 10); }
    else { c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.arc(-12, -10, 4, 0, 7); c.fill(); }
    c.restore();
  }
  function renderTreasure() {
    const box = $("og-treasure");
    box.innerHTML = TREASURE.map(tr => { const n = G.treasure[tr.id] || 0; return `<div class="og-tile${n ? "" : " locked"}"><canvas width="140" height="100" data-gem="${tr.id}" aria-hidden="true"></canvas><b>${n ? tr.name : "???"}</b><span>${tr.rarity}${n ? ` · found ${n}` : ""}</span></div>`; }).join("");
    box.querySelectorAll("canvas[data-gem]").forEach(cv => { const tr = TREASURE.find(x => x.id === cv.dataset.gem); drawGem(cv.getContext("2d"), tr, !G.treasure[tr.id]); });
    $("og-treasure-count").textContent = `${TREASURE.filter(tr => G.treasure[tr.id]).length} of ${TREASURE.length}`;
  }
  const LOOK = {
    classic:  { t: { size: 50, fur: 50, ext: 50, brain: 50 },  bg: "#cdeefa", icon: "star" },
    mutant:   { t: { size: 38, fur: 25, ext: 120, brain: 95 }, bg: "#fff1a8", icon: "bolt", sparkle: true },
    fluff:    { t: { size: 55, fur: 150, ext: 30, brain: 50 }, bg: "#eadcff", icon: "cloud" },
    giant:    { t: { size: 105, fur: 100, ext: 5, brain: 55 }, bg: "#e8eefc", icon: "snow" },
    sprinter: { t: { size: 5, fur: 0, ext: 140, brain: 40 },   bg: "#ffd9a8", icon: "sun", speed: true },
    racer:    { t: { size: 55, fur: 35, ext: 50, brain: 60 },  bg: "#bfeaf5", icon: "canalWide", speed: true, waves: true },
    drifter:  { t: { size: 60, fur: 55, ext: 55, brain: 50 },  bg: "#d6ecc4", icon: "canalNarrow", reeds: true, waves: true },
    listener: { t: { size: 50, fur: 45, ext: 85, brain: 60 },  bg: "#e6d3b3", icon: "spiral", mud: true },
    thinker:  { t: { size: 52, fur: 50, ext: 45, brain: 190 }, bg: "#f7d6ea", icon: "bulb" },
    saver:    { t: { size: 48, fur: 45, ext: 50, brain: -60 }, bg: "#d9f2df", icon: "battery" },
  };
  function tileIcon(c, kind, x, y) {
    c.save(); c.translate(x, y); c.lineWidth = 2.5; c.strokeStyle = "#0b0a10"; c.lineJoin = c.lineCap = "round";
    const circle = (r, col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke(); };
    if (kind === "star") { c.fillStyle = "#ffd23f"; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 13, a = i / 10 * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
    if (kind === "bolt") { c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(3, -14); c.lineTo(-8, 2); c.lineTo(0, 2); c.lineTo(-3, 14); c.lineTo(8, -3); c.lineTo(0, -3); c.closePath(); c.fill(); c.stroke(); }
    if (kind === "cloud") { c.fillStyle = "#fff"; c.beginPath(); c.arc(-6, 2, 7, 0, 7); c.arc(3, -3, 8, 0, 7); c.arc(10, 3, 6, 0, 7); c.fill(); c.stroke(); }
    if (kind === "snow") { c.strokeStyle = "#5a7fd8"; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * Math.PI / 3); c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 12); c.moveTo(-4, -9); c.lineTo(0, -6); c.lineTo(4, -9); c.moveTo(-4, 9); c.lineTo(0, 6); c.lineTo(4, 9); c.stroke(); c.restore(); } }
    if (kind === "sun") { c.strokeStyle = "#ff8a00"; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); c.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); c.stroke(); } c.strokeStyle = "#0b0a10"; c.lineWidth = 2.5; circle(7.5, "#ffd23f"); }
    if (kind === "canalWide" || kind === "canalNarrow") { const half = (kind === "canalWide" ? 48 : 26) * Math.PI / 180; [["#ff5fa2", -half], ["#a47bff", half]].forEach(([col, r]) => { c.save(); c.rotate(r); c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.ellipse(0, -7, 4.5, 8, 0, 0, 7); c.stroke(); c.restore(); }); c.fillStyle = "#e0b43a"; c.beginPath(); c.arc(0, 3, 4, 0, 7); c.fill(); }
    if (kind === "spiral") { c.strokeStyle = "#e09a1a"; c.lineWidth = 3.5; c.beginPath(); for (let a = 0; a < 15; a += 0.2) { const r = 1 + a * 0.85, px = Math.cos(a) * r, py = Math.sin(a) * r * 0.65; a ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
    if (kind === "bulb") { circle(9, "#ffe066"); c.fillStyle = "#9a93ad"; c.fillRect(-4.5, 8, 9, 6); c.strokeRect(-4.5, 8, 9, 6); }
    if (kind === "battery") { c.fillStyle = "#fff"; c.fillRect(-12, -7, 22, 14); c.strokeRect(-12, -7, 22, 14); c.fillStyle = "#3ddc6f"; c.fillRect(-10, -5, 8, 10); c.fillStyle = "#0b0a10"; c.fillRect(10, -3, 3, 6); }
    c.restore();
  }
  function paintDexTile(cv, id, locked) {
    const L = LOOK[id], c = cv.getContext("2d"), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h); c.save();
    if (!locked) { c.fillStyle = L.bg; c.fillRect(0, 0, w, h); }
    if (!locked) {
      if (L.waves) { c.fillStyle = "rgba(46,150,200,0.35)"; c.fillRect(0, h * 0.68, w, h); c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, h * 0.68 + Math.sin(x * 0.15) * 2); c.stroke(); }
      if (L.mud) { c.fillStyle = "rgba(110,80,40,0.35)"; c.fillRect(0, h * 0.7, w, h); }
      if (L.reeds) { c.strokeStyle = "#4f8a3a"; c.lineWidth = 2.5; [10, 18, 124, 131].forEach(x => { c.beginPath(); c.moveTo(x, h); c.quadraticCurveTo(x + 4, h * 0.6, x + 2, h * 0.3); c.stroke(); }); }
      if (id === "giant") { c.fillStyle = "#fff"; [[16, 18], [40, 32], [30, 60], [110, 70], [90, 40]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); }); }
      if (L.speed) { c.strokeStyle = "rgba(11,10,16,0.35)"; c.lineWidth = 2.5; [[6, 52], [2, 62], [8, 72]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y); c.stroke(); }); }
      if (L.sparkle) { c.fillStyle = "#a47bff"; [[18, 20], [60, 14], [118, 58]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 2, y); c.lineTo(x, y + 6); c.lineTo(x - 2, y); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x, y + 2); c.lineTo(x + 6, y); c.lineTo(x, y - 2); c.closePath(); c.fill(); }); }
    }
    const t = { cochlea: 50, canal: 50, ...L.t };
    drawOtter(c, 62, 92, t, { k: 0.82, swim: !!L.waves, time: 0.3 });
    if (locked) {
      c.globalCompositeOperation = "source-in"; c.fillStyle = "#3a3350"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#15121e"; c.globalCompositeOperation = "destination-over"; c.fillRect(0, 0, w, h); c.globalCompositeOperation = "source-over";
      c.fillStyle = "#ff5fa2"; c.font = "700 30px Fredoka, Arial, sans-serif"; c.textAlign = "center"; c.fillText("?", 70, 44);
    } else tileIcon(c, L.icon, w - 18, 18);
    c.restore();
  }
  function renderDex() {
    const box = $("og-dex");
    box.innerHTML = DEX.map(d => G.dex[d.id] ? tile(d.id, d.name, d.why, true) : tile(d.id, d.name, d.hint, false)).join("");
    box.querySelectorAll("canvas[data-tile]").forEach(cv => paintDexTile(cv, cv.dataset.tile, !G.dex[cv.dataset.tile]));
    $("og-dex-count").textContent = `${DEX.filter(d => G.dex[d.id]).length} of ${DEX.length}`;
  }
  function checkDex(pups) {
    const found = [];
    pups.forEach(p => DEX.forEach(d => {
      if (!G.dex[d.id] && d.test(p.t, p)) { G.dex[d.id] = { t: p.t }; p.newDex = d.name; found.push(d.name); }
    }));
    if (found.length) { save(); renderDex(); flag("dex"); setTimeout(() => { jingle(); toast((found.length > 1 ? "New otters discovered: " : "New otter discovered: ") + found.join(", ") + "!"); }, 900); }
  }

  /* ---------- Otter drawing (shared by game and portraits) ---------- */
  function drawOtter(c, x, y, t, o = {}) {
    const mass = 20 + t.size * 0.8, fur = Math.max(0, t.fur + (o.plastic || 0)), fF = fur / 100;
    const L = 54 + mass * 0.42, H = 18 + mass * 0.2 + fur * 0.05;
    const earR = 3.8 * (0.6 + t.ext * 0.008), tailL = 34 * (0.65 + t.ext * 0.006);
    const swim = !!o.swim, face = o.face || 1, tt = o.time || 0, moving = !!o.moving;
    const legH = swim ? 0 : 7, bob = moving && !reduce && !swim ? Math.sin(tt * 14) * 1.5 : 0;
    const worn = o.worn || {};
    c.save(); c.translate(x, y - legH - H / 2 + bob); if (o.tilt) c.rotate(o.tilt * face); c.scale(face * (o.k || 1), o.k || 1);
    if (o.ghost) c.globalAlpha = 0.28;
    const furC = "#7a4a2c", belly = "#c99a6b", dark = "#4e2e1a";
    c.fillStyle = dark; c.beginPath(); c.moveTo(-L * 0.45, -H * 0.15); c.quadraticCurveTo(-L * 0.45 - tailL * 0.6, H * 0.1, -L * 0.45 - tailL, H * 0.35); c.quadraticCurveTo(-L * 0.45 - tailL * 0.5, H * 0.45, -L * 0.45, H * 0.25); c.fill();
    if (!swim) { const s = moving && !reduce ? Math.sin(tt * 14) * 4 : 0; [[-L * 0.3, s], [-L * 0.15, -s], [L * 0.22, -s], [L * 0.35, s]].forEach(([lx, d]) => c.fillRect(lx + d - 3, H * 0.3, 6, legH + 2)); }
    else { c.beginPath(); c.ellipse(-L * 0.3, H * 0.45, 8, 3, 0.4 + Math.sin(tt * 8) * 0.3, 0, 7); c.fill(); }
    c.fillStyle = furC; c.beginPath();
    const n = fF > 1 ? 40 : 28, fl = Math.max(0, fF - 0.45) * (fF > 1 ? 16 : 5);
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = 1 + (i % 2 ? fl / Math.max(L, H) * 2 : 0); const px = Math.cos(a) * L / 2 * r, py = Math.sin(a) * H / 2 * r; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.fill();
    if (fF > 1) { for (let i = 0; i < 22; i++) { const an = i / 22 * Math.PI * 2; c.beginPath(); c.arc(Math.cos(an) * L * 0.5, Math.sin(an) * H * 0.5, 4 + (fF - 1) * 8, 0, 7); c.fill(); } }
    c.fillStyle = belly; c.beginPath(); c.ellipse(L * 0.05, H * 0.2, L * 0.32, H * 0.22, 0, 0, 7); c.fill();
    if (worn.labcoat) {
      c.fillStyle = "#f4f2fa"; c.strokeStyle = "#c9c2dc"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-L * 0.02, -H * 0.47); c.lineTo(L * 0.4, -H * 0.36); c.quadraticCurveTo(L * 0.5, 0, L * 0.38, H * 0.42); c.lineTo(-L * 0.05, H * 0.47); c.quadraticCurveTo(-L * 0.12, 0, -L * 0.02, -H * 0.47); c.fill(); c.stroke();
      c.fillStyle = "#ff5fa2"; c.fillRect(L * 0.02, -H * 0.12, 6, 5);
    }
    const hx = L * 0.5, hy = -H * 0.32, hr = 9 + mass * 0.04 + t.brain * 0.05;
    c.fillStyle = furC; c.beginPath(); c.arc(hx, hy, hr, 0, 7); c.fill();
    c.fillStyle = belly; c.beginPath(); c.ellipse(hx + hr * 0.45, hy + hr * 0.35, hr * 0.42, hr * 0.32, 0, 0, 7); c.fill();
    c.fillStyle = dark; c.beginPath(); c.arc(hx - hr * 0.35, hy - hr * 0.85, earR, 0, 7); c.fill();
    c.fillStyle = "#0b0a10"; c.beginPath(); c.arc(hx + hr * 0.3, hy - hr * 0.2, 1.9, 0, 7); c.fill();
    c.beginPath(); c.arc(hx + hr * 0.95, hy + hr * 0.15, 2.4, 0, 7); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 0.8; c.beginPath();
    c.moveTo(hx + hr * 0.8, hy + hr * 0.3); c.lineTo(hx + hr * 1.6, hy + hr * 0.1); c.moveTo(hx + hr * 0.8, hy + hr * 0.4); c.lineTo(hx + hr * 1.6, hy + hr * 0.5); c.stroke();
    if (worn.scarf) { c.fillStyle = "#2ed3c6"; c.fillRect(hx - hr * 0.9, hy + hr * 0.55, hr * 1.4, 5); c.fillStyle = "#ff5fa2"; c.fillRect(hx - hr * 0.5, hy + hr * 0.55, 4, 5); c.fillRect(hx, hy + hr * 0.55, 4, 5); c.fillStyle = "#2ed3c6"; c.fillRect(hx - hr * 0.9, hy + hr * 0.55, 5, 13); }
    if (worn.sunglasses) { c.fillStyle = "#a47bff"; c.fillRect(hx + hr * 0.05, hy - hr * 0.42, hr * 0.62, hr * 0.38); c.fillStyle = "#0b0a10"; c.fillRect(hx + hr * 0.1, hy - hr * 0.37, hr * 0.52, hr * 0.28); }
    else if (worn.goggles) { c.strokeStyle = "#2ed3c6"; c.lineWidth = 2.5; c.beginPath(); c.arc(hx + hr * 0.33, hy - hr * 0.2, hr * 0.32, 0, 7); c.stroke(); c.fillStyle = "rgba(180,240,255,0.4)"; c.fill(); c.beginPath(); c.moveTo(hx + hr * 0.02, hy - hr * 0.25); c.lineTo(hx - hr * 0.9, hy - hr * 0.3); c.stroke(); }
    if (worn.beanie) { c.fillStyle = "#ff5fa2"; c.beginPath(); c.arc(hx, hy - hr * 0.35, hr * 0.85, Math.PI, 0); c.fill(); c.fillStyle = "#efeaf6"; c.fillRect(hx - hr * 0.9, hy - hr * 0.45, hr * 1.8, 4); c.beginPath(); c.arc(hx, hy - hr * 1.25, 3.5, 0, 7); c.fill(); }
    else if (worn.chef) { c.fillStyle = "#fff"; c.fillRect(hx - hr * 0.6, hy - hr * 1.5, hr * 1.2, hr * 0.8); c.beginPath(); c.arc(hx - hr * 0.35, hy - hr * 1.6, hr * 0.42, 0, 7); c.arc(hx + hr * 0.35, hy - hr * 1.6, hr * 0.42, 0, 7); c.fill(); }
    else if (worn.gradcap) { c.fillStyle = "#15121e"; c.fillRect(hx - hr * 0.55, hy - hr * 1.05, hr * 1.1, hr * 0.35); c.beginPath(); c.moveTo(hx - hr * 1.05, hy - hr * 1.1); c.lineTo(hx, hy - hr * 1.45); c.lineTo(hx + hr * 1.05, hy - hr * 1.1); c.lineTo(hx, hy - hr * 0.8); c.fill(); c.strokeStyle = "#ff5fa2"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx, hy - hr * 1.12); c.lineTo(hx + hr * 0.95, hy - hr * 0.95); c.lineTo(hx + hr * 0.95, hy - hr * 0.55); c.stroke(); }
    else if (worn.crown) { c.fillStyle = "#ffb347"; c.beginPath(); c.moveTo(hx - hr * 0.6, hy - hr * 0.75); c.lineTo(hx - hr * 0.6, hy - hr * 1.35); c.lineTo(hx - hr * 0.3, hy - hr); c.lineTo(hx, hy - hr * 1.45); c.lineTo(hx + hr * 0.3, hy - hr); c.lineTo(hx + hr * 0.6, hy - hr * 1.35); c.lineTo(hx + hr * 0.6, hy - hr * 0.75); c.fill(); }
    c.restore();
    return { L, H };
  }

  /* ---------- 3D season (the playable part) ---------- */
  const T3 = window.THREE;
  const glc = $("og-3d");
  const ARENA = 66;
  let S = null, keys = {}, running = false, lastT = 0, R3 = null;
  const stick = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
  let look = null, touchMode = matchMedia("(pointer: coarse)").matches;
  const lerpAngle = (a, b, t) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };

  // Water layout per habitat: lakes are ellipses, rivers are sine-wave channels
  const WATER = {
    snow:   { shape: "lake",  rx: 26, rz: 18, cx: 10, cz: 6,  color: 0x6fb7d8, op: 0.78, deep: 0x1d3f63, vis: 45, cold: true },
    desert: { shape: "river", w: 5,  a: 6,  p: 16, color: 0x58c6e0, op: 0.75, deep: 0x1e5566, vis: 40 },
    fast:   { shape: "river", w: 11, a: 7,  p: 24, color: 0x6fd0e4, op: 0.72, deep: 0x154a64, vis: 40, flow: 4.2 },
    slow:   { shape: "river", w: 15, a: 13, p: 18, color: 0x6f9f74, op: 0.82, deep: 0x23402f, vis: 28 },
    murky:  { shape: "lake",  rx: 44, rz: 36, cx: 0,  cz: 0,  color: 0x8a6a3e, op: 0.94, deep: 0x3a2a18, vis: 9, murky: true },
    lake:   { shape: "lake",  rx: 50, rz: 42, cx: 0,  cz: 0,  color: 0x4fb8dc, op: 0.75, deep: 0x163a7a, vis: 55 },
  };
  const LAND = {
    snow:   { ground: 0xeef1fb, ground2: 0xcfd6ee, sky: 0xbfc8ee, fog: 0xd9def5 },
    desert: { ground: 0xdca867, ground2: 0xc28a4a, sky: 0xffb58a, fog: 0xf5c9a0 },
    fast:   { ground: 0x4f8f4f, ground2: 0x6b7f5a, sky: 0x9bd8f0, fog: 0xc8eaf5 },
    slow:   { ground: 0x5f8f45, ground2: 0x7a8f50, sky: 0xc8e0a8, fog: 0xd8e8c0 },
    murky:  { ground: 0x6b7a3a, ground2: 0x7a6440, sky: 0xc9b089, fog: 0xc0aa88 },
    lake:   { ground: 0x4f9f55, ground2: 0x6f8f4a, sky: 0x8fd0f0, fog: 0xc0e4f5 },
  };
  const PREDS = {
    snow: ["eagle", "coyote"], desert: ["eagle", "coyote"], fast: ["eagle", "logs"],
    slow: ["eagle", "gator"], murky: ["gator"], lake: ["eagle", "coyote"],
  };
  const FOODS = {
    trout:    { name: "trout",    color: 0xff8fb0, size: 1.0, energy: 16, water: true },
    minnow:   { name: "minnow",   color: 0xc9d6e8, size: 0.6, energy: 9,  water: true },
    catfish:  { name: "catfish",  color: 0x4a3a2a, size: 1.2, energy: 22, water: true, bottom: true },
    crayfish: { name: "crayfish", color: 0xff5a3a, size: 0.8, energy: 12, crawl: true },
    golden:   { name: "golden fish", color: 0xffd23f, size: 1.0, energy: 40, water: true, rare: true },
  };
  const MENU = {
    snow:   { trout: 10, minnow: 8 },
    desert: { crayfish: 12, minnow: 8 },
    fast:   { trout: 14, minnow: 8 },
    slow:   { catfish: 7, minnow: 10, crayfish: 6 },
    murky:  { catfish: 10, crayfish: 8, minnow: 6 },
    lake:   { trout: 14, minnow: 10, crayfish: 4 },
  };
  const PLACE = {
    snow: "ice cave", desert: "old cottonwood", fast: "waterfall rock",
    slow: "beaver lodge", murky: "sunken boat", lake: "otter slide",
  };
  const YEARS = {
    good:   { name: "Good year",   icon: "sun",   food: 1.35, drain: 0.8, eat: -1, other: -1, pred: 1.4, surv: 0.1 },
    normal: { name: "Normal year", icon: "water", food: 1,    drain: 1,   eat: 0,  other: 0,  pred: 1,   surv: 0 },
    hard:   { name: "Hard year",   icon: "storm", food: 0.6,  drain: 1.3, eat: 2,  other: 1,  pred: 0.7, surv: -0.1 },
  };
  const YEAR_TEXT = {
    good: { snow: "A mild winter. Fish are easy to find.", desert: "Rainy spring! The river runs full.", fast: "Gentle runoff and lots of trout.", slow: "A wet year. The marsh is full of food.", murky: "Clearer water this year. Fish are plentiful.", lake: "A warm spring brought lots of fish." },
    hard: { snow: "A long, bitter winter. Fish are scarce.", desert: "Drought! The river is low and food is scarce.", fast: "Spring floods make the rapids wild.", slow: "A dry summer shrank the marsh.", murky: "An algae bloom left few fish.", lake: "A cold spring means fewer fish." },
  };
  const ALT_FOOD = { snow: ["trout", "minnow"], desert: ["crayfish", "minnow"], fast: ["trout", "minnow"], slow: ["catfish", "crayfish", "minnow"], murky: ["catfish", "crayfish"], lake: ["trout", "minnow", "crayfish"] };
  const BASE_N = { trout: 4, minnow: 6, catfish: 3, crayfish: 5 };
  function planSeason() {
    const key = G.gen + ":" + G.hab;
    if (G.plan && G.plan.key === key) return G.plan;
    const repeat = (G.habSeasons[G.hab] || 0) > 0, r = Math.random();
    const year = !repeat ? "normal" : r < 0.3 ? "good" : r < 0.62 ? "normal" : "hard";
    G.plan = { key, year, tasks: makeTasks(G.hab, year, repeat) };
    return G.plan;
  }
  const yr = () => YEARS[(G.plan && G.plan.year) || "normal"];
  function makeTasks(hab, year = "normal", repeat = false) {
    const L = PLACE[hab];
    let t = {
      snow:   [["eat", "trout", 4], ["dodge", "eagle", 2], ["visit", L, 1]],
      desert: [["eat", "crayfish", 5], ["escape", "coyote", 1], ["visit", L, 1]],
      fast:   [["eat", "trout", 4], ["under", "logs", 3], ["visit", L, 1]],
      slow:   [["eat", "catfish", 2], ["escape", "alligator", 1], ["visit", L, 1]],
      murky:  [["eat", "catfish", 3], ["escape", "alligator", 1], ["visit", L, 1]],
      lake:   [["eat", "trout", 4], ["friends", "otter friends", 2], ["dodge", "eagle", 2]],
    }[hab];
    const label = ([k, what, n]) => k === "eat" ? `Eat ${n} ${what}` : k === "dodge" ? `Dodge ${n} ${what} attacks` : k === "escape" ? `Escape the ${what}` :
      k === "under" ? `Dive under ${n} logs` : k === "friends" ? `Play with ${n} otter friends` : `Find the ${what}`;
    const Y = YEARS[year];
    if (repeat) t = t.map(x => {
      if (x[0] === "eat" && Math.random() < 0.6) { const opts = ALT_FOOD[hab].filter(f => f !== x[1]); const f = opts[Math.floor(Math.random() * opts.length)]; return ["eat", f, BASE_N[f]]; }
      if (x[0] === "visit" && Math.random() < 0.4) return ["treasure", "sparkly treasure", 2];
      return x;
    });
    if (!G.opts.preds) t = t.map(x => ["dodge", "escape", "under"].includes(x[0]) ? ["treasure", "sparkly treasure", 1] : x);
    t = t.map(x => x[0] === "eat" ? ["eat", x[1], Math.max(2, x[2] + Y.eat)] : ["dodge", "under", "friends"].includes(x[0]) ? [x[0], x[1], clamp(x[2] + Y.other, 1, 3)] : x);
    const lab = x => x[0] === "treasure" ? (x[2] > 1 ? `Grab ${x[2]} sparkly treasures` : "Grab a sparkly treasure") : label(x);
    return t.map(x => ({ kind: x[0], what: x[1], need: x[2], have: 0, label: lab(x) }));
  }

  // Signed distance to the shore: negative in water
  function sdf(x, z) {
    const w = WATER[G.hab];
    if (w.shape === "lake") { const dx = (x - w.cx) / w.rx, dz = (z - w.cz) / w.rz; return (Math.sqrt(dx * dx + dz * dz) - 1) * Math.min(w.rx, w.rz); }
    return Math.abs(z - w.a * Math.sin(x / w.p)) - w.w;
  }
  const isWater = (x, z) => sdf(x, z) < 0;
  const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  function groundY(x, z) {
    const d = sdf(x, z), r = Math.max(Math.abs(x), Math.abs(z));
    const deep = -Math.min(4.2, 0.6 - Math.min(d, 0) * 0.55);
    const land = 0.35 + Math.min(Math.max(d, 0), 3) * 0.05 + Math.max(0, r - 56) * 0.35 + Math.sin(x * 0.21) * Math.cos(z * 0.17) * 0.25;
    return lerp(deep, land, smooth(-2.5, 1.5, d));
  }
  function randLand(minD = 4) { for (let i = 0; i < 200; i++) { const x = rand(-60, 60), z = rand(-60, 60); if (sdf(x, z) > minD) return [x, z]; } return [50, 50]; }
  function randWater(minD = 1.5) { for (let i = 0; i < 300; i++) { const x = rand(-60, 60), z = rand(-60, 60); if (sdf(x, z) < -minD) return [x, z]; } return [0, 0]; }
  function shorePoint() { for (let i = 0; i < 400; i++) { const x = rand(-58, 58), z = rand(-58, 58), d = sdf(x, z); if (d > 1.5 && d < 4 && Math.hypot(x, z) > 25) return [x, z]; } return randLand(); }

  /* ----- Mesh builders ----- */
  const M = (c, o = {}) => new T3.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, ...o });
  const ball = (r, c, sx = 1, sy = 1, sz = 1) => { const m = new T3.Mesh(new T3.SphereGeometry(r, 22, 16), M(c)); m.scale.set(sx, sy, sz); return m; };
  const lathe = (pts, seg = 22) => new T3.LatheGeometry(pts.map(([r, y]) => new T3.Vector2(r, y)), seg);
  function buildOtter(t, worn = {}, plastic = 0) {
    const g = new T3.Group(), body = new T3.Group(); g.add(body);
    const fur = clamp(t.fur + plastic, 0, 100), s = 0.75 + t.size / 100 * 0.6, puff = 1 + fur / 100 * 0.25;
    const furC = 0x7a4a2c, belly = 0xd2a878, dark = 0x4a2b18;
    // Sleek torpedo-shaped body with a soft, lighter belly
    const bg = lathe([[0.001, -1.15], [0.2, -1.05], [0.36, -0.8], [0.46, -0.4], [0.5, 0], [0.47, 0.4], [0.38, 0.75], [0.27, 1.0], [0.001, 1.12]], 26);
    bg.rotateX(Math.PI / 2);
    const cols = [], cF = new T3.Color(furC), cBl = new T3.Color(belly), tmp = new T3.Color(), bp = bg.attributes.position;
    for (let i = 0; i < bp.count; i++) { const k = smooth(0.05, 0.38, -bp.getY(i)); tmp.copy(cF).lerp(cBl, k); cols.push(tmp.r, tmp.g, tmp.b); }
    bg.setAttribute("color", new T3.Float32BufferAttribute(cols, 3));
    const bm = new T3.Mesh(bg, new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 })); bm.scale.set(puff, 0.9 * puff, 1); body.add(bm);
    const head = new T3.Group(); head.position.set(0, 0.3, 1.15); body.add(head);
    const hr = 0.34 + t.brain / 100 * 0.12;
    head.add(ball(hr, furC, 1, 0.84, 1.1));
    const muz = ball(hr * 0.58, belly, 1.15, 0.72, 0.9); muz.position.set(0, -hr * 0.28, hr * 0.62); head.add(muz);
    const gloss = new T3.MeshStandardMaterial({ color: 0x0b0a10, roughness: 0.25 });
    const nose = new T3.Mesh(new T3.SphereGeometry(0.075, 14, 10), gloss); nose.scale.set(1.35, 0.8, 0.9); nose.position.set(0, -hr * 0.12, hr * 1.12); head.add(nose);
    const wl = [];
    [-1, 1].forEach(sd => {
      const eye = new T3.Mesh(new T3.SphereGeometry(0.062, 14, 10), gloss); eye.position.set(sd * hr * 0.42, hr * 0.17, hr * 0.8); head.add(eye);
      const hi = new T3.Mesh(new T3.SphereGeometry(0.018, 8, 6), new T3.MeshBasicMaterial({ color: 0xffffff })); hi.position.set(sd * hr * 0.42 + 0.02, hr * 0.17 + 0.03, hr * 0.8 + 0.05); head.add(hi);
      const ear = ball(0.075 + t.ext / 100 * 0.08, dark, 1, 0.8, 0.6); ear.position.set(sd * hr * 0.72, hr * 0.52, -hr * 0.12); head.add(ear);
      for (let i = 0; i < 3; i++) wl.push(sd * hr * 0.45, -hr * 0.25, hr * 0.9, sd * hr * 1.35, -hr * 0.3 + (i - 1) * 0.07, hr * 0.75);
    });
    const wg = new T3.BufferGeometry(); wg.setAttribute("position", new T3.Float32BufferAttribute(wl, 3));
    head.add(new T3.LineSegments(wg, new T3.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })));
    const tl = 0.9 + t.ext / 100 * 0.9;
    const tg = lathe([[0.001, 0], [0.24, 0.04], [0.21, 0.3 * tl], [0.13, 0.7 * tl], [0.001, tl]], 16); tg.rotateX(-Math.PI / 2);
    const tail = new T3.Mesh(tg, M(dark, { roughness: 0.75 })); tail.position.set(0, -0.02, -0.98); tail.rotation.x = 0.12; body.add(tail); g.userData.tail = tail;
    const legs = [];
    [[-0.3, 0.55], [0.3, 0.55], [-0.3, -0.55], [0.3, -0.55]].forEach(([x, z]) => {
      const lg = new T3.Group(); lg.position.set(x, -0.25, z);
      const shin = new T3.Mesh(new T3.CylinderGeometry(0.1, 0.09, 0.36, 10), M(dark)); shin.position.y = -0.16; lg.add(shin);
      const foot = ball(0.11, dark, 1, 0.45, 1.4); foot.position.set(0, -0.35, 0.05); lg.add(foot);
      body.add(lg); legs.push(lg);
    });
    g.userData.legs = legs;
    // Outfits
    if (worn.beanie) { const b = new T3.Mesh(new T3.SphereGeometry(hr * 1.02, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xff5fa2)); b.position.y = hr * 0.25; head.add(b); const pom = ball(0.09, 0xefeaf6); pom.position.y = hr * 1.3; head.add(pom); }
    else if (worn.chef) { const c = new T3.Mesh(new T3.CylinderGeometry(hr * 0.6, hr * 0.55, hr * 0.8, 14), M(0xffffff)); c.position.y = hr * 1.1; head.add(c); const p = ball(hr * 0.65, 0xffffff, 1, 0.6, 1); p.position.y = hr * 1.55; head.add(p); }
    else if (worn.gradcap) { const c = new T3.Mesh(new T3.BoxGeometry(hr * 1.9, 0.06, hr * 1.9), M(0x15121e)); c.position.y = hr * 1.05; c.rotation.y = Math.PI / 4; head.add(c); const k = new T3.Mesh(new T3.CylinderGeometry(hr * 0.55, hr * 0.6, hr * 0.4, 12), M(0x15121e)); k.position.y = hr * 0.85; head.add(k); }
    else if (worn.crown) { const c = new T3.Mesh(new T3.CylinderGeometry(hr * 0.55, hr * 0.5, hr * 0.45, 8, 1, true), M(0xffb347, { side: T3.DoubleSide })); c.position.y = hr * 1.05; head.add(c); }
    if (worn.goggles) { [-1, 1].forEach(sd => { const r = new T3.Mesh(new T3.TorusGeometry(0.1, 0.03, 8, 16), M(0x2ed3c6)); r.position.set(sd * hr * 0.45, hr * 0.2, hr * 0.9); head.add(r); }); }
    else if (worn.sunglasses) { const sg = new T3.Mesh(new T3.BoxGeometry(hr * 1.4, 0.12, 0.05), M(0x0b0a10)); sg.position.set(0, hr * 0.2, hr * 0.92); head.add(sg); }
    if (worn.scarf) { const sc = new T3.Mesh(new T3.TorusGeometry(hr * 0.8, 0.09, 8, 20), M(0x2ed3c6)); sc.position.set(0, 0.15, 0.85); sc.rotation.x = Math.PI / 2.3; body.add(sc); }
    if (worn.labcoat) { const lc = new T3.Mesh(new T3.CylinderGeometry(0.52 * puff, 0.55 * puff, 1.1, 14, 1, true), M(0xf4f2fa, { side: T3.DoubleSide })); lc.rotation.x = Math.PI / 2; lc.position.z = 0.25; lc.scale.set(1, 1, 0.92); body.add(lc); }
    g.scale.setScalar(s); g.userData.scale = s;
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  function buildFish(f) {
    const g = new T3.Group(), mat = M(f.color, { roughness: f.crawl ? 0.6 : 0.35, metalness: f.rare ? 0.5 : 0.1 });
    if (f.crawl) {
      const b = new T3.Mesh(new T3.SphereGeometry(0.25, 16, 12), mat); b.scale.set(1, 0.55, 1.3); g.add(b);
      for (let i = 0; i < 3; i++) { const seg = new T3.Mesh(new T3.SphereGeometry(0.17 - i * 0.03, 12, 8), mat); seg.scale.set(1, 0.6, 1); seg.position.z = -0.3 - i * 0.18; g.add(seg); }
      [-1, 1].forEach(sd => { const cl = new T3.Mesh(new T3.SphereGeometry(0.13, 12, 8), mat); cl.scale.set(0.8, 0.5, 1.4); cl.position.set(sd * 0.25, 0, 0.42); cl.rotation.y = -sd * 0.4; g.add(cl); });
    } else {
      const b = new T3.Mesh(new T3.SphereGeometry(0.3, 18, 12), mat); b.scale.set(0.55, 0.8, 1.55); g.add(b);
      const tail = new T3.Mesh(new T3.ConeGeometry(0.26, 0.42, 3), mat); tail.rotation.x = Math.PI / 2; tail.scale.set(1, 0.25, 1); tail.position.z = -0.6; g.add(tail);
      const fin = new T3.Mesh(new T3.ConeGeometry(0.12, 0.3, 3), mat); fin.scale.set(0.25, 1, 1); fin.position.set(0, 0.26, -0.05); g.add(fin);
      const eye = new T3.Mesh(new T3.SphereGeometry(0.04, 8, 6), new T3.MeshBasicMaterial({ color: 0x0b0a10 })); eye.position.set(0.13, 0.06, 0.32); g.add(eye); const eye2 = eye.clone(); eye2.position.x = -0.13; g.add(eye2);
      if (f.rare) { const glow = new T3.Mesh(new T3.SphereGeometry(0.75, 14, 10), new T3.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.25 })); g.add(glow); }
    }
    g.scale.setScalar(f.size * 1.2);
    return g;
  }
  const GREENS = [0x2f7a45, 0x3a8a4a, 0x2a6b3f, 0x4a9a50];
  function tree(x, z, snowy, h = rand(4, 7)) {
    const g = new T3.Group(), y = groundY(x, z);
    const tr = new T3.Mesh(new T3.CylinderGeometry(0.2, 0.32, 1.7, 9), M(0x5a3d2b)); tr.position.y = 0.85; g.add(tr);
    if (!snowy && Math.random() < 0.45) {
      const leaf = M(GREENS[Math.floor(Math.random() * GREENS.length)], { flatShading: true, roughness: 0.9 });
      [[0, 2.9, 0, 1.7], [0.9, 2.4, 0.3, 1.2], [-0.8, 2.5, -0.2, 1.25], [0.1, 3.6, -0.3, 1.15]].forEach(([dx, dy, dz, r]) => { const l = new T3.Mesh(new T3.IcosahedronGeometry(r * rand(0.9, 1.1), 1), leaf); l.position.set(dx, dy * h / 5.5, dz); g.add(l); });
    } else {
      const col = snowy ? 0x3f6a5a : GREENS[Math.floor(Math.random() * GREENS.length)];
      for (let i = 0; i < 4; i++) { const c = new T3.Mesh(new T3.ConeGeometry(1.9 - i * 0.42, h * 0.36, 12), M(col, { flatShading: true })); c.position.y = 1.3 + i * h * 0.19 + h * 0.17; c.rotation.y = i; g.add(c); }
      if (snowy) { for (let i = 0; i < 4; i++) { const cap = new T3.Mesh(new T3.ConeGeometry(0.9 - i * 0.18, 0.5, 12), M(0xffffff)); cap.position.y = 1.3 + i * h * 0.19 + h * 0.17 + h * 0.13; g.add(cap); } }
    }
    g.rotation.y = rand(0, 6); g.position.set(x, y, z); return g;
  }
  function cactus(x, z) {
    const g = new T3.Group(), mat = M(0x3f8f5a);
    const m = new T3.Mesh(new T3.CylinderGeometry(0.35, 0.4, 3.2, 8), mat); m.position.y = 1.6; g.add(m);
    [-1, 1].forEach(sd => { const a = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.22, 1.2, 8), mat); a.position.set(sd * 0.7, 1.9 + sd * 0.3, 0); g.add(a); const j = new T3.Mesh(new T3.CylinderGeometry(0.2, 0.2, 0.7, 8), mat); j.rotation.z = Math.PI / 2; j.position.set(sd * 0.4, 1.4 + sd * 0.3, 0); g.add(j); });
    g.position.set(x, groundY(x, z), z); return g;
  }
  function rock(x, z, s = rand(0.6, 1.6)) { const r = new T3.Mesh(new T3.DodecahedronGeometry(s, 0), M(0x8a8494)); r.position.set(x, groundY(x, z) + s * 0.3, z); r.rotation.set(rand(0, 3), rand(0, 3), 0); return r; }
  function landmark(hab, x, z) {
    const g = new T3.Group(), y = groundY(x, z);
    if (hab === "snow") { const c = new T3.Mesh(new T3.SphereGeometry(3.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0xdff3ff)); g.add(c); const d = new T3.Mesh(new T3.CircleGeometry(1.3, 16), M(0x2a3a5a)); d.position.set(0, 1.1, 3.1); g.add(d); }
    else if (hab === "desert") { g.add(new T3.Mesh(new T3.CylinderGeometry(0.6, 0.9, 5, 8), M(0x6b4a2b))); for (let i = 0; i < 5; i++) { const l = ball(rand(1.6, 2.4), 0x6f9f3a); l.position.set(rand(-1.5, 1.5), 5 + rand(-0.5, 1), rand(-1.5, 1.5)); g.add(l); } g.children[0].position.y = 2.5; }
    else if (hab === "fast") { const r = new T3.Mesh(new T3.DodecahedronGeometry(3, 0), M(0x7a7486)); r.position.y = 2; g.add(r); const fall = new T3.Mesh(new T3.PlaneGeometry(2.4, 4), new T3.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.8, side: T3.DoubleSide })); fall.position.set(0, 2, 2.6); g.add(fall); }
    else if (hab === "slow") { for (let i = 0; i < 26; i++) { const st = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.12, rand(3, 4.5), 5), M(0x7a5232)); const a = i / 26 * Math.PI * 2; st.position.set(Math.cos(a) * 1.4, 1.4, Math.sin(a) * 1.4); st.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(st); } }
    else if (hab === "murky") { const hull = new T3.Mesh(new T3.BoxGeometry(2.4, 1, 5), M(0x6b4a2b)); hull.rotation.set(0.25, 0.4, 0.2); g.add(hull); }
    else { const sl = new T3.Mesh(new T3.BoxGeometry(2.2, 0.3, 8), M(0x8a6440)); sl.rotation.x = 0.35; sl.position.y = 1.4; g.add(sl); }
    g.position.set(x, y, z); return g;
  }
  function eagleMesh() {
    const g = new T3.Group(), br = M(0x3b2a1e);
    g.add(ball(0.5, 0x3b2a1e, 1, 0.8, 2));
    const head = ball(0.35, 0xffffff); head.position.set(0, 0.2, 0.95); g.add(head);
    const beak = new T3.Mesh(new T3.ConeGeometry(0.12, 0.35, 6), M(0xffb347)); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.15, 1.35); g.add(beak);
    const wings = [-1, 1].map(sd => { const w = new T3.Mesh(new T3.BoxGeometry(3, 0.08, 1.1), br); w.position.x = sd * 1.6; const p = new T3.Group(); p.add(w); g.add(p); return p; });
    g.userData.wings = wings; g.scale.setScalar(1.3); return g;
  }
  function coyoteMesh() {
    const g = new T3.Group(), c = 0xb08a5a;
    g.add(ball(0.5, c, 1, 0.9, 2.1));
    const head = ball(0.4, c, 0.9, 0.9, 1.2); head.position.set(0, 0.45, 1.2); g.add(head);
    const snout = new T3.Mesh(new T3.ConeGeometry(0.22, 0.6, 8), M(c)); snout.rotation.x = Math.PI / 2; snout.position.set(0, 0.38, 1.7); g.add(snout);
    [-1, 1].forEach(sd => { const e = new T3.Mesh(new T3.ConeGeometry(0.13, 0.35, 6), M(0x8a6a40)); e.position.set(sd * 0.22, 0.85, 1.05); g.add(e); });
    const legs = [[-0.3, 0.7], [0.3, 0.7], [-0.3, -0.7], [0.3, -0.7]].map(([x, z]) => { const l = new T3.Mesh(new T3.CylinderGeometry(0.1, 0.1, 0.9, 6), M(0x8a6a40)); l.position.set(x, -0.6, z); g.add(l); return l; });
    const tail = new T3.Mesh(new T3.ConeGeometry(0.2, 1, 8), M(0x8a6a40)); tail.rotation.x = -Math.PI / 1.6; tail.position.set(0, 0.1, -1.4); g.add(tail);
    g.userData.legs = legs; g.scale.setScalar(1.25); return g;
  }
  function gatorMesh() {
    const g = new T3.Group(), c = 0x3f5a2f;
    g.add(ball(0.5, c, 1.1, 0.5, 3.2));
    const jaw = new T3.Mesh(new T3.BoxGeometry(0.7, 0.25, 1.4), M(c)); jaw.position.set(0, 0, 2.1); g.add(jaw);
    [-1, 1].forEach(sd => { const e = ball(0.13, 0xd8e04a); e.position.set(sd * 0.25, 0.28, 1.4); g.add(e); });
    const tail = new T3.Mesh(new T3.ConeGeometry(0.4, 2.6, 6), M(c)); tail.rotation.x = -Math.PI / 2; tail.position.z = -2.6; g.add(tail);
    g.scale.setScalar(1.3); return g;
  }
  function treasureMesh(tr) {
    const g = new T3.Group(), col = new T3.Color(tr.color);
    const mat = new T3.MeshPhongMaterial({ color: col, emissive: col.clone().multiplyScalar(0.35), shininess: 90, flatShading: true });
    const geo = tr.shape === "crystal" ? new T3.OctahedronGeometry(0.55, 0) : tr.shape === "gem" ? new T3.OctahedronGeometry(0.5, 0) : tr.shape === "fossil" ? new T3.TorusGeometry(0.35, 0.18, 8, 16) : new T3.DodecahedronGeometry(0.45, 0);
    const m = new T3.Mesh(geo, mat); if (tr.shape === "crystal") m.scale.set(0.8, 1.4, 0.8); if (tr.shape === "pebble") m.scale.set(1.2, 0.7, 1); g.add(m);
    const ring = new T3.Mesh(new T3.TorusGeometry(0.95, 0.05, 6, 24), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); ring.rotation.x = Math.PI / 2; g.add(ring);
    const beam = new T3.Mesh(new T3.CylinderGeometry(0.15, 0.15, 12, 6, 1, true), new T3.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, depthWrite: false })); beam.position.y = 6; g.add(beam);
    g.userData = { gem: m, ring }; return g;
  }
  function logMesh() { const l = new T3.Mesh(new T3.CylinderGeometry(0.45, 0.45, 5, 10), M(0x6b4a2b)); l.rotation.z = Math.PI / 2; const g = new T3.Group(); g.add(l); return g; }

  function init3D() {
    if (R3) return R3;
    if (!T3) return null;
    try {
      const renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
      R3 = { renderer, cam: new T3.PerspectiveCamera(58, 1, 0.1, 400) };
    } catch (e) { R3 = null; }
    return R3;
  }
  function size3D() {
    if (!R3) return;
    const r = glc.getBoundingClientRect();
    R3.renderer.setSize(r.width, r.height, false);
    R3.cam.aspect = r.width / Math.max(1, r.height); R3.cam.updateProjectionMatrix();
  }

  /* ----- Building one season's world ----- */
  function buildWorld() {
    const hab = G.hab, W = WATER[hab], Lc = LAND[hab];
    const scene = new T3.Scene();
    scene.background = new T3.Color(Lc.fog);
    scene.fog = new T3.Fog(Lc.fog, 45, 150);
    // Gradient sky dome
    const SKYTOP = { snow: 0x7f8fd8, desert: 0xff7fa8, fast: 0x4fa8e0, slow: 0x7fb8e0, murky: 0xa88a68, lake: 0x3f98e0 };
    const skyG = new T3.SphereGeometry(260, 32, 16), sp = skyG.attributes.position, sc = [], top = new T3.Color(SKYTOP[hab]), hor = new T3.Color(Lc.fog), sk = new T3.Color();
    for (let i = 0; i < sp.count; i++) { sk.copy(hor).lerp(top, smooth(0, 160, sp.getY(i))); sc.push(sk.r, sk.g, sk.b); }
    skyG.setAttribute("color", new T3.Float32BufferAttribute(sc, 3));
    const sky = new T3.Mesh(skyG, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false, depthWrite: false })); sky.userData.noShadow = true; scene.add(sky);
    scene.add(new T3.HemisphereLight(0xffffff, 0x6b5a48, 0.7));
    const sun = new T3.DirectionalLight(hab === "desert" ? 0xffe2c0 : 0xfff4e0, 1.05);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 120 });
    scene.add(sun); scene.add(sun.target);
    // Terrain
    const geo = new T3.PlaneGeometry(150, 150, 150, 150); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, cols = [], cA = new T3.Color(Lc.ground), cB = new T3.Color(Lc.ground2), sand = new T3.Color(hab === "snow" ? 0xdfe6f5 : 0xd9c08a), bed = new T3.Color(W.deep).lerp(new T3.Color(0x6b5a40), 0.35), tmp = new T3.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), d = sdf(x, z);
      pos.setY(i, groundY(x, z));
      if (d < 0) tmp.copy(sand).lerp(bed, smooth(0, 2.5, -d));
      else tmp.copy(cA).lerp(cB, 0.5 + 0.5 * Math.sin(x * 0.13 + z * 0.09) * Math.cos(z * 0.07)).lerp(sand, 1 - smooth(1, 3.4, d));
      cols.push(tmp.r, tmp.g, tmp.b);
    }
    geo.setAttribute("color", new T3.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
    const terrain = new T3.Mesh(geo, new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); terrain.receiveShadow = true; terrain.userData.noShadow = true; scene.add(terrain);
    // Water surface with gentle waves
    const wgeo = new T3.PlaneGeometry(150, 150, 75, 75); wgeo.rotateX(-Math.PI / 2);
    const water = new T3.Mesh(wgeo, new T3.MeshPhongMaterial({ color: W.color, transparent: true, opacity: W.op, shininess: 110, specular: 0xbfeaff, side: T3.DoubleSide }));
    water.position.y = -0.05; water.receiveShadow = true; water.userData.noShadow = true; scene.add(water);
    // Grass, flowers, and shrubs
    const dummy = new T3.Object3D();
    const scatter = (geom, mat, n, ok, scale, colors) => {
      const im = new T3.InstancedMesh(geom, mat, n); let k = 0;
      for (let i = 0; i < n * 4 && k < n; i++) {
        const x = rand(-62, 62), z = rand(-62, 62), d = sdf(x, z); if (!ok(d)) continue;
        dummy.position.set(x, groundY(x, z), z); dummy.rotation.set(rand(-0.15, 0.15), rand(0, 6), rand(-0.15, 0.15)); dummy.scale.setScalar(rand(scale[0], scale[1])); dummy.updateMatrix();
        im.setMatrixAt(k, dummy.matrix); if (colors) im.setColorAt(k, new T3.Color(colors[k % colors.length])); k++;
      }
      im.count = k; im.userData.noShadow = true; scene.add(im);
    };
    if (["lake", "fast", "slow", "murky"].includes(hab)) {
      // Soft grass tufts: five thin blades leaning outward, merged into one shape
      const tuft = [];
      for (let i = 0; i < 5; i++) { const bl = new T3.ConeGeometry(0.035, rand(0.28, 0.42), 3).toNonIndexed(); bl.translate(0, 0.17, 0); bl.rotateZ(rand(-0.35, 0.35)); bl.rotateY(i * 1.26); bl.translate(Math.cos(i * 1.26) * 0.06, 0, Math.sin(i * 1.26) * 0.06); tuft.push(...bl.attributes.position.array); }
      const tg = new T3.BufferGeometry(); tg.setAttribute("position", new T3.Float32BufferAttribute(tuft, 3)); tg.computeVertexNormals();
      scatter(tg, M(new T3.Color(Lc.ground).lerp(new T3.Color(0x2f6b2f), 0.35).getHex(), { side: T3.DoubleSide }), 2600, d => d > 1.8, [0.8, 1.5]);
      if (hab !== "murky") scatter(new T3.SphereGeometry(0.1, 8, 6).translate(0, 0.35, 0), M(0xffffff), 220, d => d > 3, [0.8, 1.3], [0xff8fc8, 0xffe066, 0xffffff, 0xc9a8ff]);
    }
    if (hab === "desert") scatter(new T3.IcosahedronGeometry(0.35, 0).translate(0, 0.2, 0), M(0x9a8a4a, { flatShading: true }), 160, d => d > 3, [0.6, 1.4]);
    if (hab === "snow") scatter(new T3.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xffffff), 120, d => d > 3, [0.6, 1.6]);
    // Props
    const props = new T3.Group(); scene.add(props);
    const cover = [];
    for (let i = 0; i < (hab === "desert" ? 18 : 34); i++) { const [x, z] = randLand(5); if (hab === "desert") props.add(cactus(x, z)); else { props.add(tree(x, z, hab === "snow")); cover.push([x, z]); } }
    for (let i = 0; i < 16; i++) { const [x, z] = randLand(2); props.add(rock(x, z)); }
    if (hab === "slow" || hab === "murky") for (let i = 0; i < 70; i++) { const x = rand(-60, 60), z = rand(-60, 60), d = sdf(x, z); if (d > -2.5 && d < 1.5) { const r = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.05, rand(1.5, 2.6), 4), M(0x5f8a3a)); r.position.set(x, groundY(x, z) + 1, z); props.add(r); } }
    if (hab === "murky") for (let i = 0; i < 20; i++) { const [x, z] = randWater(2); const p = new T3.Mesh(new T3.CircleGeometry(rand(0.6, 1.1), 10), M(0x4f7a3a)); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.02, z); props.add(p); }
    if (hab === "snow") for (let i = 0; i < 14; i++) { const [x, z] = randWater(3); const ice = new T3.Mesh(new T3.CircleGeometry(rand(2, 4), 7), M(0xf2f8ff)); ice.rotation.x = -Math.PI / 2; ice.position.set(x, 0.03, z); props.add(ice); }
    return { scene, water, cover, sky, sun, wbase: wgeo.attributes.position.array.slice() };
  }

  function startSeason() {
    if (!init3D()) { toast("Your browser can't show the 3D world, so this season was skipped."); S = { food: 0, hits: 0, dead: false, tasks: [], counts: {}, quick: true }; endSeason(); return; }
    const h = HAB[G.hab], W = WATER[G.hab], me = lead();
    G.habSeasons[G.hab] = (G.habSeasons[G.hab] || 0) + 1;
    const world = buildWorld(), scene = world.scene;
    const [sx, sz] = (() => { for (let i = 0; i < 300; i++) { const x = rand(-40, 40), z = rand(-40, 40), d = sdf(x, z); if (d > 1 && d < 6) return [x, z]; } return randLand(); })();
    const otter = buildOtter(me.t, G.worn); scene.add(otter);
    S = { scene, world, otter, t: 0, x: sx, z: sz, y: groundY(sx, sz) + 0.5, vy: 0, heading: Math.atan2(-sx, -sz), speed: 0,
          inWater: false, depth: 0, hearts: 3, energy: 100, inv: 0, food: 0, counts: {}, hits: 0, dead: false, cause: "", plastic: 0, plasticRebuilt: 0, starve: 0,
          tasks: planSeason().tasks.map(t => ({ ...t, have: 0 })), items: [], bonus: [], bonusT: rand(5, 9), sndT: 0, preds: [], logs: [], friends: [], ending: 0, golden: false, camPos: new T3.Vector3(), tipT: 0 };
    S.camYaw = S.heading;
    // Food
    Object.entries(MENU[G.hab]).forEach(([k, n]) => { for (let i = 0; i < Math.round(n * yr().food); i++) spawnFood(k); });
    if (G.plan.year !== "normal") setTimeout(() => showFact("fluct"), 4000);
    spawnFood("golden");
    // Landmark or friends
    if (G.hab === "lake") {
      for (let i = 0; i < 3; i++) { const [x, z] = randWater(4); const f = buildOtter({ size: 55, fur: 55, ext: 45, brain: 60, cochlea: 50, canal: 50 }); scene.add(f); S.friends.push({ m: f, x, z, hx: x, hz: z, a: rand(0, 6), met: false }); }
    } else {
      const [lx, lz] = shorePoint(); scene.add(landmark(G.hab, lx, lz));
      const beacon = new T3.Mesh(new T3.CylinderGeometry(0.4, 0.4, 30, 8, 1, true), new T3.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.35, side: T3.DoubleSide, depthWrite: false }));
      beacon.position.set(lx, 15, lz); scene.add(beacon);
      S.place = { x: lx, z: lz, beacon, found: false };
    }
    // Predators
    (G.opts.preds ? PREDS[G.hab] : []).forEach(p => {
      if (p === "eagle") { const m = eagleMesh(); scene.add(m); const sh = new T3.Mesh(new T3.CircleGeometry(1.6, 16), new T3.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0, depthWrite: false })); sh.rotation.x = -Math.PI / 2; scene.add(sh); S.preds.push({ kind: "eagle", m, sh, state: "circle", cd: rand(7, 11) * yr().pred, a: 0, x: 0, y: 28, z: 0 }); }
      if (p === "coyote") { const [x, z] = randLand(10); const m = coyoteMesh(); scene.add(m); S.preds.push({ kind: "coyote", m, state: "patrol", x, z, hx: x, hz: z, a: rand(0, 6), cd: 0, chasing: false }); }
      if (p === "gator") { const [x, z] = randWater(5); const m = gatorMesh(); scene.add(m); S.preds.push({ kind: "gator", m, state: "lurk", x, z, hx: x, hz: z, a: rand(0, 6), cd: 0, t: 0 }); }
      if (p === "logs") { for (let i = 0; i < 7; i++) { const m = logMesh(); scene.add(m); const x = rand(-60, 60); S.logs.push({ m, x, z: W.a * Math.sin(x / W.p) + rand(-W.w + 2, W.w - 2), passed: 0 }); } }
    });
    scene.traverse(o => { if (o.isMesh && !o.isInstancedMesh && !o.userData.noShadow && !(o.material && o.material.transparent)) o.castShadow = true; });
    G.screen = "season"; screen("");
    canvas.hidden = true; glc.hidden = false; size3D();
    $("og-hud").hidden = false; document.querySelector(".og-hud-top").appendChild($("og-corner")); $("og-time").parentElement.hidden = !G.opts.timer; $("og-end").hidden = G.opts.timer;
    if (touchMode && smallLandscape() && !stage.classList.contains("og-fs-on")) setFull(true); showTouch(); $("og-gen").textContent = "GEN " + G.gen; $("og-hab").textContent = h.name;
    renderTasks(); renderHearts(); paintMapBase();
    const f = h.facts[(G.habSeasons[G.hab] - 1) % 2]; setTimeout(() => showFact(f), 1500);
    keys = {}; running = true; lastT = performance.now(); glc.focus({ preventScroll: true }); requestAnimationFrame(loop);
  }
  function spawnFood(kind) {
    const f = FOODS[kind]; let x, z, y;
    if (f.crawl) { for (let i = 0; i < 200; i++) { x = rand(-60, 60); z = rand(-60, 60); const d = sdf(x, z); if (d > -3 && d < 2.5) break; } y = groundY(x, z) + 0.15; }
    else { [x, z] = randWater(f.rare ? 3 : 1.5); const bot = groundY(x, z); y = f.bottom ? bot + 0.5 : rand(Math.max(bot + 0.6, -2.5), -0.4); }
    const m = buildFish(f); S.scene.add(m);
    S.items.push({ kind, f, m, x, z, y, hx: x, hz: z, a: rand(0, 6), r: rand(1.5, 4), sp: rand(0.4, 0.9) * (f.rare ? 2 : 1), alive: true, respawn: 0 });
  }

  /* ----- HUD helpers ----- */
  function renderTasks() {
    $("og-tasks").innerHTML = `<b>Goals</b>` + S.tasks.map(t => `<span class="${t.have >= t.need ? "done" : ""}">${t.have >= t.need ? '<i class="og-check">✔</i>' : taskIcon(t)} ${t.label}${t.need > 1 ? ` <em>${Math.min(t.have, t.need)}/${t.need}</em>` : ""}</span>`).join("");
  }
  function renderHearts() { $("og-hearts").innerHTML = [0, 1, 2].map(i => `<i class="${i < S.hearts ? "" : "lost"}">♥</i>`).join(""); }
  function bump(kind, what) {
    let changed = false;
    S.tasks.forEach(t => { if (t.kind === kind && (!what || t.what === what) && t.have < t.need) { t.have++; changed = true; if (t.have === t.need) { jingle(); toast("Goal complete: " + t.label + "!"); } } });
    if (changed) { renderTasks(); if (S.tasks.every(t => t.have >= t.need) && !S.allDone) { S.allDone = true; if (!G.opts.timer) { S.ending = 3; setTimeout(() => toast("All goals done! Season complete!"), 1200); } else setTimeout(() => toast("All goals done! Your otter will survive and raise extra pups."), 1600); } }
  }
  const tasksDone = () => S.tasks.filter(t => t.have >= t.need).length;
  let mapBase = null;
  function paintMapBase() {
    const cv = $("og-map"), c = cv.getContext("2d"), n = cv.width;
    mapBase = c.createImageData(n, n); const Lc = LAND[G.hab], W = WATER[G.hab];
    const land = new T3.Color(Lc.ground), wat = new T3.Color(W.color);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i / n - 0.5) * 2 * ARENA, z = (j / n - 0.5) * 2 * ARENA, col = isWater(x, z) ? wat : land, k = (j * n + i) * 4;
      mapBase.data[k] = col.r * 255; mapBase.data[k + 1] = col.g * 255; mapBase.data[k + 2] = col.b * 255; mapBase.data[k + 3] = 255;
    }
  }
  function drawMap() {
    const cv = $("og-map"), c = cv.getContext("2d"), n = cv.width, P = (x, z) => [(x / ARENA / 2 + 0.5) * n, (z / ARENA / 2 + 0.5) * n];
    c.putImageData(mapBase, 0, 0);
    const radar = 10 + lead().t.brain * 0.3;
    S.items.forEach(it => { if (!it.alive || Math.hypot(it.x - S.x, it.z - S.z) > radar) return; const [x, y] = P(it.x, it.z); c.fillStyle = it.f.rare ? "#ffd23f" : "#ffffff"; c.fillRect(x - 1.5, y - 1.5, 3, 3); });
    S.bonus.forEach(b => { const [x, y] = P(b.x, b.z); c.fillStyle = b.tr.color; c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.lineTo(x - 4, y); c.closePath(); c.fill(); c.stroke(); });
    if (S.place && !S.place.found) { const [x, y] = P(S.place.x, S.place.z); c.fillStyle = "#ffe066"; c.strokeStyle = "#0b0a10"; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); c.stroke(); }
    S.friends.forEach(f => { if (f.met) return; const [x, y] = P(f.x, f.z); c.fillStyle = "#a47bff"; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
    S.preds.forEach(p => { if (p.kind === "eagle" && p.state === "circle") return; const [x, y] = P(p.x, p.z); c.fillStyle = "#ff3b5c"; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
    const [px, py] = P(S.x, S.z); c.save(); c.translate(px, py); c.rotate(-S.heading + Math.PI); c.fillStyle = "#ff5fa2"; c.strokeStyle = "#0b0a10"; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, -7); c.lineTo(5, 5); c.lineTo(-5, 5); c.closePath(); c.fill(); c.stroke(); c.restore();
  }

  /* ----- Damage, death, and dodges ----- */
  function hurt(cause) {
    if (S.inv > 0 || S.dead) return false;
    S.hearts--; S.hits++; S.inv = 1.8; renderHearts(); beep(140, 0.25, "sawtooth", 0.06);
    $("og-stage-flash").classList.remove("on"); void $("og-stage-flash").offsetWidth; $("og-stage-flash").classList.add("on");
    if (S.hearts <= 0) { S.dead = true; S.cause = cause; S.ending = 2.2; toast(cause + " Your otter didn't survive this season."); }
    else toast(cause + " " + S.hearts + (S.hearts === 1 ? " heart left!" : " hearts left."));
    return true;
  }

  /* ----- Main update ----- */
  function update(dt) {
    const W = WATER[G.hab], me = lead(), t = me.t;
    S.t += dt;
    if (S.ending > 0) { S.ending -= dt; if (S.ending <= 0) { endSeason(); return; } }
    const k = keys, alive = !S.dead;
    const L = alive && (k.ArrowLeft || k.a || k.A), Rr = alive && (k.ArrowRight || k.d || k.D), U = alive && (k.ArrowUp || k.w || k.W), D = alive && (k.ArrowDown || k.s || k.S);
    const J = alive && k[" "], DV = alive && (k.Shift || k.e || k.E || k.q || k.Q || k.c || k.C || k.dive);
    const wasWet = S.inWater; S.inWater = isWater(S.x, S.z) && S.y < 0.6; if (S.inWater && !wasWet && S.t > 0.5) sfx("splash", 0.06);
    // Steering: in fast water, canals near right angles turn more sharply
    let turn = 2.6;
    if (W.flow && S.inWater) turn *= 0.55 + 0.45 * clamp(1 - Math.abs(degOf(t.canal) - 93) / 22, 0, 1);
    const top = (S.inWater ? 9 : 6.2 - (t.size - 50) * 0.02) * (S.energy <= 0 && !G.opts.preds ? 0.55 : 1);
    let target = 0;
    if (stick.active && alive) {
      // Thumbstick moves the otter relative to the camera, like Roblox
      const m = Math.min(1, Math.hypot(stick.x, stick.y));
      if (m > 0.15) {
        const y = S.camYaw, dx = Math.sin(y) * -stick.y - Math.cos(y) * stick.x, dz = Math.cos(y) * -stick.y + Math.sin(y) * stick.x;
        S.heading = lerpAngle(S.heading, Math.atan2(dx, dz), Math.min(1, turn * 2.6 * dt)); target = top * m;
      }
    } else {
      if (L) S.heading += turn * dt; if (Rr) S.heading -= turn * dt;
      target = U ? top : D ? -top * 0.45 : 0;
    }
    if (!touchMode) S.camYaw = S.heading;
    else if (!look && Math.abs(S.speed) > 1) S.camYaw = lerpAngle(S.camYaw, S.heading, Math.min(1, 0.7 * dt));
    S.speed = lerp(S.speed, target, 0.12);
    let nx = S.x + Math.sin(S.heading) * S.speed * dt, nz = S.z + Math.cos(S.heading) * S.speed * dt;
    if (W.flow && S.inWater) nx += W.flow * dt;
    S.x = clamp(nx, -ARENA + 2, ARENA - 2); S.z = clamp(nz, -ARENA + 2, ARENA - 2);
    const gy = groundY(S.x, S.z);
    if (isWater(S.x, S.z)) {
      const floor = gy + 0.45;
      if (DV) S.y = Math.max(floor, S.y - 4.2 * dt);
      else if (J && S.y > -0.4) { S.y = Math.min(0.9, S.y + 7 * dt); }
      else S.y = Math.min(0, S.y + 2.6 * dt);
      S.y = Math.max(S.y, floor); S.vy = 0;
    } else {
      S.vy -= 22 * dt; S.y += S.vy * dt;
      if (S.y <= gy + 0.5) { S.y = gy + 0.5; S.vy = J ? 8 : 0; if (J) beep(330, 0.05, "triangle", 0.03); }
    }
    S.depth = Math.min(0, S.y);
    const diving = S.y < -0.9, exposed = !diving && !(S.world.cover.some(([x, z]) => Math.hypot(x - S.x, z - S.z) < 2.2));
    // Energy: climate and traits set the cost of staying warm or cool
    const furE = t.fur + S.plastic;
    let drain = 1.5;
    if (G.hab === "snow") drain += Math.max(0, 70 - furE) * 0.05 + (S.inWater ? Math.max(0, 80 - furE) * 0.05 : 0) - (t.size - 50) * 0.015;
    else if (G.hab === "desert") drain += (!S.inWater ? Math.max(0, furE - 35) * 0.06 : 0) + (t.size - 50) * 0.015;
    else drain += 0.3;
    if (alive) S.energy = clamp(S.energy - Math.max(0.6, drain) * yr().drain * dt, 0, 100);
    if (S.energy <= 0 && alive && !G.opts.preds) { if (S.tipT <= 0) { S.tipT = 6; toast("So hungry! Eat something to speed up."); } }
    else if (S.energy <= 0 && alive) { S.starve += dt; if (S.starve > 3.5) { S.starve = 0; S.inv = 0; hurt(G.hab === "snow" ? "Too cold and hungry!" : G.hab === "desert" ? "Too hot and hungry!" : "Starving!"); } }
    // Plasticity: fur responds to this season's climate within the otter's life
    const pT = G.hab === "snow" ? 18 : G.hab === "desert" ? -18 : 0;
    S.plastic = lerp(S.plastic, pT, 0.12 * dt);
    if (Math.abs(S.plastic) > 8) showFact("plasticity");
    if (Math.abs(S.plastic - S.plasticRebuilt) > 5) { S.plasticRebuilt = S.plastic; const o = buildOtter(t, G.worn, S.plastic); S.scene.remove(S.otter); S.otter = o; S.scene.add(o); }
    // Food
    const hx = S.x + Math.sin(S.heading) * 1.4 * S.otter.userData.scale, hz = S.z + Math.cos(S.heading) * 1.4 * S.otter.userData.scale;
    S.items.forEach(it => {
      if (!it.alive) { if (S.t > it.respawn && !it.f.rare) { it.alive = true; it.m.visible = true; } return; }
      if (!it.f.crawl) {
        it.a += it.sp * dt; const nx2 = it.hx + Math.cos(it.a) * it.r, nz2 = it.hz + Math.sin(it.a) * it.r;
        if (isWater(nx2, nz2)) { it.x = nx2; it.z = nz2; }
        it.m.rotation.y = Math.atan2(-Math.sin(it.a), Math.cos(it.a)) + Math.PI;
        if (W.murky) it.m.visible = Math.hypot(it.x - S.x, it.z - S.z) < 6 + t.cochlea * 0.12 || !isWater(S.x, S.z);
      } else { it.m.rotation.y += dt * 0.5; }
      it.m.position.set(it.x, it.y + (it.f.crawl ? 0 : Math.sin(S.t * 3 + it.a) * 0.08), it.z);
      if (alive && Math.hypot(hx - it.x, hz - it.z) < 1.5 && Math.abs(S.y - it.y) < 1.4) {
        it.alive = false; it.m.visible = false; it.respawn = S.t + 18;
        S.food++; S.counts[it.kind] = (S.counts[it.kind] || 0) + 1; S.energy = clamp(S.energy + it.f.energy, 0, 100);
        beep(880 + S.food * 25, 0.08, "square", 0.04);
        bump("eat", it.f.name);
        if (it.f.rare) { S.golden = true; jingle(); toast("You caught the golden fish! Bonus pup!"); }
      }
    });
    // Landmark and friends
    if (S.place && !S.place.found && Math.hypot(S.place.x - S.x, S.place.z - S.z) < 4.5) { S.place.found = true; S.place.beacon.visible = false; bump("visit"); }
    if (S.place) S.place.beacon.material.opacity = 0.25 + Math.sin(S.t * 3) * 0.1;
    S.friends.forEach(f => {
      if (f.met) {
        // Friends you've met follow you in a line
        const back = 2.6 + f.order * 2.3, side = (f.order % 2 ? 1 : -1) * 0.9;
        const tx = S.x - Math.sin(S.heading) * back + Math.cos(S.heading) * side, tz = S.z - Math.cos(S.heading) * back - Math.sin(S.heading) * side;
        const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
        if (d > 0.3) { const sp = Math.min(d, 11 * dt * Math.min(1.6, d / 2)); f.x += dx / d * sp; f.z += dz / d * sp; f.m.rotation.y = Math.atan2(dx, dz); }
        const wet = isWater(f.x, f.z);
        f.m.position.set(f.x, wet ? Math.min(S.y, -0.1) + Math.sin(S.t * 2 + f.order) * 0.08 : groundY(f.x, f.z) + 0.5, f.z);
        f.m.userData.legs.forEach((l, i) => l.rotation.x = !wet && d > 0.4 ? Math.sin(S.t * 14 + (i % 2) * Math.PI) * 0.6 : 0);
        return;
      }
      f.a += dt * 0.5; const nx2 = f.hx + Math.cos(f.a) * 5, nz2 = f.hz + Math.sin(f.a) * 5; if (isWater(nx2, nz2)) { f.x = nx2; f.z = nz2; }
      f.m.position.set(f.x, -0.1 + Math.sin(S.t * 2 + f.a) * 0.1, f.z); f.m.rotation.y = f.a + Math.PI;
      if (alive && Math.hypot(f.x - S.x, f.z - S.z) < 2.5) { f.met = true; f.order = S.friends.filter(x => x.met).length - 1; bump("friends"); toast("New otter friend! They'll follow you."); showFact("social"); }
    });
    // Predators
    S.inv = Math.max(0, S.inv - dt);
    S.preds.forEach(p => {
      if (p.kind === "eagle") {
        if (p.state === "circle") {
          p.a += dt * 0.4; p.x = S.x + Math.cos(p.a) * 30; p.z = S.z + Math.sin(p.a) * 30; p.y = 28; p.cd -= dt;
          if (p.cd <= 0 && alive) { p.state = "warn"; p.timer = 1.8; p.tx = S.x; p.tz = S.z; toast("Eagle! Dive underwater or hide under a tree!"); sfx("eagle", 0.14); }
        } else if (p.state === "warn") {
          p.timer -= dt; p.tx = lerp(p.tx, S.x, 0.06); p.tz = lerp(p.tz, S.z, 0.06);
          p.x = lerp(p.x, p.tx, 0.03); p.z = lerp(p.z, p.tz, 0.03);
          p.sh.position.set(p.tx, groundY(p.tx, p.tz) + 0.08 + (isWater(p.tx, p.tz) ? -groundY(p.tx, p.tz) : 0), p.tz); p.sh.material.opacity = 0.45 * (1 - p.timer / 1.8) + 0.1;
          if (p.timer <= 0) { p.state = "swoop"; p.timer = 0.7; }
        } else if (p.state === "swoop") {
          p.timer -= dt; p.x = lerp(p.x, p.tx, 0.2); p.z = lerp(p.z, p.tz, 0.2); p.y = lerp(p.y, 1.5, 0.18);
          if (p.timer <= 0) {
            const close = Math.hypot(S.x - p.tx, S.z - p.tz) < 3;
            if (close && exposed && alive) hurt("Grabbed by the eagle!"); else if (alive) { bump("dodge", "eagle"); toast("Dodged the eagle!"); beep(990, 0.1, "triangle", 0.05); }
            p.state = "leave"; p.timer = 2; p.sh.material.opacity = 0;
          }
        } else if (p.state === "leave") { p.timer -= dt; p.y = lerp(p.y, 30, 0.05); if (p.timer <= 0) { p.state = "circle"; p.cd = rand(9, 14) * yr().pred; } }
        p.m.position.set(p.x, p.y, p.z); p.m.rotation.y = Math.atan2(S.x - p.x, S.z - p.z);
        const flap = Math.sin(S.t * (p.state === "swoop" ? 4 : 9)) * 0.5; p.m.userData.wings[0].rotation.z = flap; p.m.userData.wings[1].rotation.z = -flap;
      }
      if (p.kind === "coyote") {
        const d = Math.hypot(S.x - p.x, S.z - p.z), onLand = !isWater(S.x, S.z);
        p.cd = Math.max(0, p.cd - dt);
        if (p.cd <= 0 && onLand && d < 16 && alive) { if (!p.chasing) { p.chasing = true; toast("A coyote is chasing you! Get into the water!"); beep(600, 0.15, "sawtooth", 0.04); } }
        let sp = 2, tx = p.hx + Math.cos(p.a) * 8, tz = p.hz + Math.sin(p.a) * 8;
        if (p.chasing) { sp = 7.4; tx = S.x; tz = S.z; if (!onLand) { p.chasing = false; p.cd = 4; bump("escape", "coyote"); toast("You escaped the coyote!"); } else if (d > 26) p.chasing = false; }
        else p.a += dt * 0.3;
        const ang = Math.atan2(tx - p.x, tz - p.z), nx2 = p.x + Math.sin(ang) * sp * dt, nz2 = p.z + Math.cos(ang) * sp * dt;
        if (sdf(nx2, nz2) > 0.5) { p.x = nx2; p.z = nz2; }
        p.m.position.set(p.x, groundY(p.x, p.z) + 1.3, p.z); p.m.rotation.y = ang;
        p.m.userData.legs.forEach((l, i) => l.rotation.x = Math.sin(S.t * (p.chasing ? 16 : 6) + i * Math.PI) * 0.5);
        if (p.chasing && d < 1.8) { if (hurt("Caught by the coyote!")) { p.chasing = false; p.cd = 4; } }
      }
      if (p.kind === "gator") {
        const d = Math.hypot(S.x - p.x, S.z - p.z), wet = isWater(S.x, S.z);
        p.cd = Math.max(0, p.cd - dt);
        let sp = 1.2, tx = p.hx + Math.cos(p.a) * 6, tz = p.hz + Math.sin(p.a) * 6;
        if (p.state === "lurk") { p.a += dt * 0.25; if (wet && d < 10 && p.cd <= 0 && alive) { p.state = "lunge"; p.t = 2.4; toast("Alligator! Swim for shore!"); beep(220, 0.2, "sawtooth", 0.05); } }
        else { p.t -= dt; sp = 8.2; tx = S.x; tz = S.z; if (!wet || d > 15) { p.state = "lurk"; p.cd = 4; bump("escape", "alligator"); toast("You escaped the alligator!"); } else if (p.t <= 0) { p.state = "lurk"; p.cd = 3; } }
        const ang = Math.atan2(tx - p.x, tz - p.z), nx2 = p.x + Math.sin(ang) * sp * dt, nz2 = p.z + Math.cos(ang) * sp * dt;
        if (sdf(nx2, nz2) < -0.8) { p.x = nx2; p.z = nz2; }
        p.m.position.set(p.x, -0.25, p.z); p.m.rotation.y = ang;
        if (p.state === "lunge" && d < 2.2) { if (hurt("Snapped by the alligator!")) { p.state = "lurk"; p.cd = 4; } }
      }
    });
    S.logs.forEach(lg => {
      lg.x += (W.flow + 1.5) * dt; if (lg.x > ARENA) { lg.x = -ARENA; lg.z = W.a * Math.sin(lg.x / W.p) + rand(-W.w + 2, W.w - 2); }
      lg.m.position.set(lg.x, 0.05, lg.z);
      lg.passed = Math.max(0, lg.passed - dt);
      const near = Math.abs(lg.x - S.x) < 2.8 && Math.abs(lg.z - S.z) < 1.1;
      if (near && alive) { if (S.y > -0.6) hurt("Bonked by a log!"); else if (!lg.passed) { lg.passed = 3; bump("under", "logs"); toast("Dove under a log!"); } }
    });
    // Surprise treasures pop up near the otter now and then
    S.bonusT -= dt;
    if (S.bonusT <= 0 && alive && S.bonus.length < 2) {
      S.bonusT = rand(9, 15);
      for (let i = 0; i < 40; i++) {
        const a = rand(0, Math.PI * 2), r = rand(9, 24), x = clamp(S.x + Math.cos(a) * r, -60, 60), z = clamp(S.z + Math.sin(a) * r, -60, 60);
        if (sdf(x, z) < -3) continue;
        const tr = pickTreasure(), m = treasureMesh(tr); S.scene.add(m);
        S.bonus.push({ tr, m, x, z, y: groundY(x, z) + 0.7, life: 16 });
        sfx("sparkle", 0.05); toast("Something sparkly appeared! Check your map."); break;
      }
    }
    S.bonus = S.bonus.filter(b => {
      b.life -= dt; b.m.position.set(b.x, b.y + Math.sin(S.t * 3) * 0.2, b.z); b.m.userData.gem.rotation.y += dt * 2;
      b.m.userData.ring.scale.setScalar(1 + Math.sin(S.t * 5) * 0.15); b.m.visible = b.life > 3 || Math.floor(S.t * 8) % 2 === 0;
      if (alive && Math.hypot(b.x - S.x, b.z - S.z) < 1.8 && Math.abs(b.y - S.y) < 2) {
        G.treasure[b.tr.id] = (G.treasure[b.tr.id] || 0) + 1; save(); renderTreasure(); flag("treasure"); bump("treasure");
        S.energy = clamp(S.energy + 12, 0, 100); let extra = "";
        if ((b.tr.rarity === "Rare" || b.tr.rarity === "Legendary") && S.hearts < 3) { S.hearts++; renderHearts(); extra = " +1 heart!"; }
        sfx("sparkle", 0.09); toast(`Surprise! ${b.tr.rarity} find: ${b.tr.name}!${extra}`);
        S.scene.remove(b.m); return false;
      }
      if (b.life <= 0) { S.scene.remove(b.m); return false; }
      return true;
    });
    // Predator sounds: louder and faster the closer the danger
    S.sndT -= dt;
    if (alive && S.sndT <= 0) {
      let near = null, nd = 1e9;
      S.preds.forEach(p => { if (p.kind === "eagle" && (p.state === "circle" || p.state === "leave")) return; const d = Math.hypot(p.x - S.x, p.z - S.z); if (d < nd) { nd = d; near = p; } });
      if (near) {
        const range = { eagle: 45, coyote: 26, gator: 18 }[near.kind];
        if (nd < range) {
          const k = 1 - nd / range;
          if (near.kind === "eagle") { sfx("eagle", near.state === "swoop" ? 0.22 : 0.06 + 0.12 * k); S.sndT = near.state === "swoop" ? 0.5 : 0.9 - 0.5 * k; }
          else if (near.kind === "coyote") { if (near.chasing) { sfx("growl", 0.06 + 0.16 * k); S.sndT = 0.25 + (1 - k) * 0.9; } else { sfx("howl", 0.03 + 0.06 * k); S.sndT = 4; } }
          else { sfx("gator", 0.04 + (near.state === "lunge" ? 0.16 : 0.08) * k); S.sndT = near.state === "lunge" ? 0.35 : 0.8 + (1 - k) * 1.4; }
        }
      }
      if (!near || S.sndT <= 0) S.sndT = 0.4;
    }
    // Season clock
    if (!S.dead && G.opts.timer && S.t >= SEASON && S.ending <= 0) S.ending = 0.01;
    // HUD
    $("og-time").style.width = clamp(100 - S.t / SEASON * 100, 0, 100) + "%";
    $("og-energy").style.width = S.energy + "%";
    $("og-energy").parentElement.classList.toggle("low", S.energy < 25);
    S.tipT -= dt;
  }

  function draw3D() {
    const W = WATER[G.hab], Lc = LAND[G.hab], o = S.otter, t = S.t;
    o.position.set(S.x, S.y, S.z); o.rotation.y = S.heading;
    o.rotation.x = S.inWater ? clamp(-S.speed * 0.01, -0.2, 0.2) : 0;
    const moving = Math.abs(S.speed) > 0.5;
    o.userData.legs.forEach((l, i) => l.rotation.x = moving && !S.inWater ? Math.sin(t * 14 + (i % 2) * Math.PI) * 0.6 : 0);
    o.userData.tail.rotation.y = Math.sin(t * (S.inWater ? 8 : 4)) * 0.3;
    o.visible = !(S.inv > 0 && Math.floor(t * 12) % 2) || S.dead;
    if (S.dead) o.rotation.z = Math.min(Math.PI / 2, o.rotation.z + 0.08);
    // Camera follows behind the otter
    // Sun follows the otter so shadows stay crisp nearby
    const sun = S.world.sun; sun.position.set(S.x + 22, 42, S.z + 14); sun.target.position.set(S.x, 0, S.z); sun.target.updateMatrixWorld();
    // Gentle waves; rapids get bigger, faster ripples
    const wp = S.world.water.geometry.attributes.position, base = S.world.wbase, A = W.flow ? 0.13 : W.murky ? 0.03 : G.hab === "snow" ? 0.025 : 0.06, fl = (W.flow || 0) * 0.6;
    for (let i = 0; i < wp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; wp.array[i * 3 + 1] = Math.sin(x * 0.35 - t * (1.6 + fl)) * A + Math.cos(z * 0.3 + t * 1.2) * A * 0.7; }
    wp.needsUpdate = true; if ((S.frame = (S.frame || 0) + 1) % 3 === 0) S.world.water.geometry.computeVertexNormals();
    const cam = R3.cam, back = 7.8, up = 3.6;
    const cy = S.camYaw;
    const want = new T3.Vector3(S.x - Math.sin(cy) * back, Math.max(S.y + up, groundY(S.x - Math.sin(cy) * back, S.z - Math.cos(cy) * back) + 1.5), S.z - Math.cos(cy) * back);
    if (!S.camInit) { cam.position.copy(want); S.camInit = true; } else cam.position.lerp(want, look ? 0.3 : 0.08);
    cam.lookAt(S.x + Math.sin(cy) * 3, S.y + 1, S.z + Math.cos(cy) * 3);
    // Underwater look
    const under = cam.position.y < 0 || (S.y < -0.9);
    const vis = W.murky ? 4 + lead().t.cochlea * 0.12 : W.vis;
    if (under) { S.scene.fog.color.setHex(W.deep); S.scene.background.setHex(W.deep); S.scene.fog.near = 1; S.scene.fog.far = vis; }
    else { S.scene.fog.color.setHex(Lc.fog); S.scene.background.setHex(Lc.fog); S.scene.fog.near = 45; S.scene.fog.far = 150; }
    S.world.sky.visible = !under; S.world.sky.position.copy(cam.position);
    S.world.water.material.opacity = under ? 0.35 : W.op;
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

  /* ---------- Picture icons for directions ---------- */
  const SV = (body, vb = "0 0 32 32") => `<svg class="og-ic" viewBox="${vb}" aria-hidden="true" stroke="#0b0a10" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
  const ICON = {
    trout:    SV('<ellipse cx="14" cy="16" rx="10" ry="6.5" fill="#ff8fb0"/><path d="M23 16 L30 10 L30 22 Z" fill="#ff8fb0"/><circle cx="9.5" cy="14.5" r="1.6" fill="#0b0a10" stroke="none"/><circle cx="16" cy="14" r="1" fill="#c2185b" stroke="none"/><circle cx="19" cy="17" r="1" fill="#c2185b" stroke="none"/>'),
    minnow:   SV('<ellipse cx="14" cy="16" rx="9" ry="5" fill="#c9d6e8"/><path d="M22 16 L29 11 L29 21 Z" fill="#c9d6e8"/><circle cx="10" cy="15" r="1.5" fill="#0b0a10" stroke="none"/>'),
    catfish:  SV('<ellipse cx="15" cy="17" rx="11" ry="6.5" fill="#6b5236"/><path d="M25 17 L31 11 L31 23 Z" fill="#6b5236"/><path d="M5 18 Q1 22 2 26 M6 19 Q4 24 6 27" fill="none"/><circle cx="9" cy="15" r="1.5" fill="#fff" stroke="none"/>'),
    crayfish: SV('<ellipse cx="16" cy="19" rx="5" ry="8" fill="#ff5a3a"/><ellipse cx="8" cy="8" rx="4" ry="5" fill="#ff5a3a"/><ellipse cx="24" cy="8" rx="4" ry="5" fill="#ff5a3a"/><path d="M12 13 L9 12 M20 13 L23 12" fill="none"/>'),
    "golden fish": SV('<ellipse cx="14" cy="16" rx="10" ry="6.5" fill="#ffd23f"/><path d="M23 16 L30 10 L30 22 Z" fill="#ffd23f"/>'),
    eagle:    SV('<path d="M2 15 Q9 7 16 14 Q23 7 30 15 Q23 13 16 21 Q9 13 2 15Z" fill="#6b4a2e"/><circle cx="16" cy="12" r="3.6" fill="#fff"/><path d="M18.5 12.5 L22 13.5 L18.5 14.5Z" fill="#ffb347"/>'),
    coyote:   SV('<path d="M6 6 L11 13 L21 13 L26 6 L25 17 L16 28 L7 17 Z" fill="#c9a06a"/><circle cx="12" cy="17" r="1.6" fill="#0b0a10" stroke="none"/><circle cx="20" cy="17" r="1.6" fill="#0b0a10" stroke="none"/><circle cx="16" cy="24" r="1.8" fill="#0b0a10" stroke="none"/>'),
    alligator: SV('<path d="M2 19 Q6 12 15 13 L30 15 L30 19 L15 21 Q6 23 2 19Z" fill="#4f7a3a"/><circle cx="12" cy="12.5" r="2.4" fill="#d8e04a"/><path d="M17 18 L19 16 L21 18 L23 16 L25 18" fill="none" stroke="#fff" stroke-width="1.5"/>'),
    logs:     SV('<rect x="3" y="11" width="26" height="10" rx="5" fill="#8a6440"/><ellipse cx="25" cy="16" rx="3" ry="5" fill="#c9a06a"/>'),
    flag:     SV('<path d="M8 29 L8 4" fill="none" stroke-width="2.6"/><path d="M8 5 L26 10 L8 16 Z" fill="#ffe066"/>'),
    friends:  SV('<circle cx="10" cy="17" r="7" fill="#9a6440"/><circle cx="22" cy="17" r="7" fill="#c98a5a"/><path d="M16 9 C14 5 9 6 11 10 L16 14 L21 10 C23 6 18 5 16 9Z" fill="#ff5fa2" stroke-width="1.6"/>'),
    heart:    SV('<path d="M16 27 C4 19 3 11 8 8 C12 5 15 8 16 10 C17 8 20 5 24 8 C29 11 28 19 16 27Z" fill="#ff3b5c"/>'),
    bolt:     SV('<path d="M18 3 L7 18 L15 18 L13 29 L25 13 L17 13 Z" fill="#ffd23f"/>'),
    gem:      SV('<path d="M5 12 L10 5 L22 5 L27 12 L16 28 Z" fill="#a47bff"/><path d="M5 12 L27 12 M12 5 L16 28 L20 5" fill="none" stroke-width="1.5"/>'),
    dive:     SV('<path d="M3 10 Q8 7 13 10 T23 10 T30 10" fill="none" stroke="#2b8fc0" stroke-width="2.6"/><path d="M16 13 L16 28 M10 22 L16 28 L22 22" fill="none" stroke-width="3"/>'),
    tree:     SV('<path d="M16 3 L27 22 L5 22 Z" fill="#2f8a4a"/><rect x="13" y="22" width="6" height="7" fill="#6b4a2b"/>'),
    water:    SV('<path d="M3 12 Q8 8 13 12 T23 12 T30 12 M3 20 Q8 16 13 20 T23 20 T30 20" fill="none" stroke="#2b8fc0" stroke-width="3"/>'),
    land:     SV('<path d="M2 24 Q10 12 18 18 T30 14 L30 28 L2 28 Z" fill="#7fbf5a"/>'),
    snow:     SV('<path d="M16 3 V29 M5 9 L27 23 M27 9 L5 23" fill="none" stroke="#5a7fd8" stroke-width="2.8"/>'),
    sun:      SV('<circle cx="16" cy="16" r="6.5" fill="#ffd23f"/><path d="M16 2 V6 M16 26 V30 M2 16 H6 M26 16 H30 M6 6 L9 9 M23 23 L26 26 M26 6 L23 9 M9 23 L6 26" fill="none" stroke="#ff8a00" stroke-width="2.6"/>'),
    ear:      SV('<path d="M16 16 m0 0 a2 2 0 0 1 4 0 a5 5 0 0 1 -9 0 a8 8 0 0 1 15 0 a11 11 0 0 1 -21 0" fill="none" stroke="#e09a1a" stroke-width="3"/>'),
    brain:    SV('<path d="M16 6 C10 4 5 8 6 14 C3 17 5 24 10 24 C12 28 16 27 16 25 C16 27 20 28 22 24 C27 24 29 17 26 14 C27 8 22 4 16 6Z" fill="#ff9fc8"/><path d="M16 6 V25 M10 12 Q13 14 11 17 M22 12 Q19 14 21 17" fill="none" stroke-width="1.6"/>'),
    body:     SV('<ellipse cx="16" cy="18" rx="12" ry="8" fill="#9a6440"/><circle cx="26" cy="12" r="5" fill="#9a6440"/>'),
  };
  ICON.storm = SV('<path d="M7 17 Q3 17 3 13 Q3 9 8 9 Q9 4 15 4 Q21 4 22 9 Q28 9 28 14 Q28 17 24 17 Z" fill="#8a93ad"/><path d="M15 17 L11 24 L15 24 L13 30 L20 21 L16 21 L18 17" fill="#ffd23f"/>');
  const TICON = {
    size: ICON.body,
    fur: SV('<path d="M5 22 Q4 12 12 10 Q14 5 19 7 Q26 7 27 14 Q30 20 25 24 L7 24 Z" fill="#a47bff"/><path d="M9 14 L8 11 M14 11 L14 7 M20 10 L22 7 M25 15 L28 13" fill="none" stroke-width="1.8"/>'),
    ext: SV('<circle cx="10" cy="10" r="5" fill="#2ed3c6"/><path d="M14 22 Q22 22 29 13" fill="none" stroke="#2ed3c6" stroke-width="4"/><path d="M14 22 Q22 22 29 13" fill="none" stroke-width="1.2"/>'),
    cochlea: ICON.ear,
    canal: SV('<ellipse cx="11" cy="13" rx="5" ry="9" fill="none" stroke="#ff5fa2" stroke-width="3" transform="rotate(-25 11 13)"/><ellipse cx="21" cy="13" rx="5" ry="9" fill="none" stroke="#a47bff" stroke-width="3" transform="rotate(25 21 13)"/><circle cx="16" cy="24" r="4" fill="#e0b43a"/>'),
    brain: ICON.brain,
  };
  const ARROW = {
    up: '<svg class="og-arr" viewBox="0 0 16 16" aria-label="up"><path d="M8 2 L14 12 L2 12 Z" fill="#138a4a"/></svg>',
    down: '<svg class="og-arr" viewBox="0 0 16 16" aria-label="down"><path d="M8 14 L14 4 L2 4 Z" fill="#c2185b"/></svg>',
    same: '<svg class="og-arr" viewBox="0 0 16 16" aria-label="no change"><circle cx="8" cy="8" r="3.5" fill="#6b6380"/></svg>',
  };
  const KEY = k => `<kbd class="og-key">${k}</kbd>`;
  const coarse = matchMedia("(pointer: coarse)").matches;
  function taskIcon(t) { return t.kind === "eat" ? ICON[t.what] : t.kind === "dodge" ? ICON.eagle : t.kind === "escape" ? ICON[t.what] : t.kind === "under" ? ICON.logs : t.kind === "treasure" ? ICON.gem : t.kind === "friends" ? ICON.friends : ICON.flag; }
  /* ----- Briefing before each season ----- */
  function traitTips() {
    const t = lead().t, tips = [];
    if (G.hab === "snow") { tips.push(["snow", t.fur >= 65 ? "Thick fur: you stay warm!" : "Thin fur: you get cold fast. Eat a lot!"]); tips.push(["body", t.size >= 60 ? "Big body: holds heat." : "Small body: loses heat fast."]); }
    if (G.hab === "desert") tips.push(["sun", t.fur <= 40 ? "Thin fur: you stay cool!" : "Thick fur: you overheat on land. Cool off in the river."]);
    if (G.hab === "fast") tips.push(["ear", degOf(t.canal) >= 89 ? "Inner ear: sharp turns in the rapids!" : "Inner ear: slow turns in the rapids."]);
    if (G.hab === "murky") tips.push(["ear", t.cochlea >= 65 ? "Great hearing: find fish farther away." : "So-so hearing: find fish only up close."]);
    if (G.hab === "slow") tips.push(["water", "Calm water: easy swimming."]);
    tips.push(["brain", t.brain >= 60 ? "Big brain: see more food on your map." : "Small brain: see less food on your map."]);
    return tips;
  }
  function screenBriefing() {
    G.screen = "brief";
    const plan = planSeason(), tasks = plan.tasks, Y = YEARS[plan.year];
    G.back = G.history.length > 1 ? () => screenHabitat(false) : () => screenHabitat(true);
    const ESC = {
      eagle: [ICON.eagle, [ICON.dive, ICON.tree], "Dive or hide"],
      coyote: [ICON.coyote, [ICON.water], "Jump in water"],
      gator: [ICON.alligator, [ICON.land], "Swim to land"],
      logs: [ICON.logs, [ICON.dive], "Dive under"],
    };
    const controls = (coarse || touchMode)
      ? `<div class="og-ctl"><span class="og-keys-row"><span class="og-mini-stick"><i></i></span></span><small>Left thumb: move</small></div>
         <div class="og-ctl"><span class="og-keys-row">${KEY("↔")}</span><small>Right thumb: swipe to look</small></div>
         <div class="og-ctl"><span class="og-keys-row">${KEY("Jump")}</span><small>Jump / swim up</small></div>
         <div class="og-ctl"><span class="og-keys-row">${KEY("Dive")}</span><small>Dive</small></div>`
      : `<div class="og-ctl"><span class="og-arrows">${KEY("▲")}<span>${KEY("◀")}${KEY("▼")}${KEY("▶")}</span></span><small>Move</small></div>
         <div class="og-ctl"><span class="og-keys-row">${KEY("Space")}</span><small>Jump / swim up</small></div>
         <div class="og-ctl"><span class="og-keys-row">${KEY("Shift")}</span><small>Dive</small></div>`;
    screen(`<div class="og-card og-wide og-brief">${BACK}
      <p class="og-badge">Generation ${G.gen} · ${HAB[G.hab].name}</p>
      ${plan.year !== "normal" ? `<div class="og-year og-year-${plan.year}">${ICON[Y.icon]}<b>${Y.name}!</b><span>${YEAR_TEXT[plan.year][G.hab]} ${plan.year === "hard" ? "Goals are tougher and fewer otters will survive." : "Goals are easier and more otters will survive."}</span></div>` : ""}
      <h2 class="og-h">Your mission</h2>
      <div class="og-modes"><span>${G.opts.preds ? "Predators on" : "No predators"}</span><span>${G.opts.timer ? "75-second timer" : "No timer"}</span><button type="button" class="og-link" id="og-change">Change settings</button></div>
      <ul class="og-goals">${tasks.map(t => `<li>${taskIcon(t)}<span>${t.label}</span></li>`).join("")}</ul>
      <div class="og-brief-grid">
        <section><h3 class="og-mini">Danger!</h3>
          ${G.opts.preds ? PREDS[G.hab].map(p => { const [who, how, txt] = ESC[p]; return `<div class="og-row">${who}<b class="og-arrow">➜</b>${how.join("")}<small>${txt}</small></div>`; }).join("") : `<div class="og-row">${ICON.friends}<small>Relaxed mode: no predators. Explore freely!</small></div>`}
        </section>
        <section><h3 class="og-mini">Stay alive</h3>
          <div class="og-row">${ICON.heart}${ICON.heart}${ICON.heart}<small>3 hearts</small></div>
          <div class="og-row">${ICON.trout}<b class="og-arrow">➜</b>${ICON.bolt}<small>Eat for energy</small></div>
          <div class="og-row">${ICON.gem}<b class="og-arrow">➜</b>${ICON.heart}<small>Grab sparkly treasure</small></div>
        </section>
        <section><h3 class="og-mini">Your otter here</h3>
          ${traitTips().map(([ic, txt]) => `<div class="og-row">${ICON[ic]}<small>${txt}</small></div>`).join("")}
        </section>
      </div>
      <div class="og-controls">${controls}</div>
      <p class="og-sub og-small">${G.opts.timer ? "Finish 2 goals and your otter survives. Finish all 3 for the most pups!" : "Take your time! The season ends when you finish all 3 goals, or tap End season."}</p>${(coarse || touchMode) && matchMedia("(orientation: portrait)").matches ? '<p class="og-sub og-small">📱 Tip: turn your phone sideways for a bigger view.</p>' : ""}
      <button type="button" class="og-btn" id="og-go">Start season ▶</button></div>`);
    $("og-go").addEventListener("click", () => { beep(660, 0.1, "triangle"); startSeason(); });
    onBack(G.back);
    $("og-change").addEventListener("click", () => screenSettings(screenBriefing, screenBriefing));
  }

  /* ---------- Between seasons: selection, inheritance, mutation ---------- */
  function endSeason() {
    running = false; keys = {}; $("og-hud").hidden = true; glc.hidden = true; canvas.hidden = false; $("og-touch").hidden = true; endTouch(); document.querySelector(".og-stage").appendChild($("og-corner"));
    showFact("fitness"); G.lastYear = (G.plan && G.plan.year) || "normal";
    if (S.food >= 12) unlock("chef");
    if (S.hits === 0 && !S.quick) unlock("crown");
    if (G.hab === "snow") unlock("scarf");
    const done = S.tasks.length ? tasksDone() : 0, all = S.tasks.length > 0 && done === S.tasks.length;
    // Selection
    const f = G.pop.map(o => fitness(o.t, G.hab));
    const ranked = f.map((v, i) => i).sort((a, b) => f[b] - f[a]);
    G.pop.forEach((o, i) => {
      if (o.lead && S.dead) { o.alive = false; return; }
      if (o.lead && done >= 2) { o.alive = true; return; }
      o.alive = Math.random() < clamp(0.15 + yr().surv + 0.8 * f[i] * (G.plan && G.plan.year === "hard" ? 0.85 : 1), 0.05, 0.98);
    });
    let alive = G.pop.filter(o => o.alive);
    while (alive.length < 3) { const i = ranked.find(j => !G.pop[j].alive && !(G.pop[j].lead && S.dead)); if (i === undefined) break; G.pop[i].alive = true; alive = G.pop.filter(o => o.alive); }
    const drift = ranked.slice(0, 3).some(i => !G.pop[i].alive && !G.pop[i].lead);
    Object.assign(G, { lastFood: S.food, lastDone: done, lastAll: all, lastDead: S.dead, lastCause: S.cause, lastGolden: S.golden, drift });
    G.plan = null; screenSurvival(f); idleLoop();
  }
  function breed() {
    const surv = G.pop.filter(o => o.alive);
    const fw = surv.map(o => 0.2 + fitness(o.t, G.hab));
    const pick = () => { let r = Math.random() * fw.reduce((a, b) => a + b, 0); for (let i = 0; i < surv.length; i++) { r -= fw[i]; if (r <= 0) return surv[i]; } return surv[surv.length - 1]; };
    const leadParent = surv.find(o => o.lead);
    const extra = leadParent ? G.lastDone + (G.lastGolden ? 1 : 0) : 0;
    const pups = []; let mutated = false;
    for (let i = 0; i < POP; i++) {
      const a = i < extra ? leadParent : pick(); let b = pick(); if (b === a && surv.length > 1) b = surv.find(o => o !== a);
      const t = {}; let mut = false;
      TRAITS.forEach(({ k }) => { let v = (a.t[k] + b.t[k]) / 2 + gauss() * 4; if (Math.random() < 0.025) { v += gauss() * 16; mut = true; } t[k] = v; });
      pups.push({ t: clampT(t), lead: false, mut, fromLead: a === leadParent });
      if (mut) mutated = true;
    }
    const heir = pups.find(p => p.fromLead) || pups[0]; heir.lead = true;
    G.pop = pups; G.mutated = mutated; checkDex(pups); flag("evolution"); flag("anatomy");
    G.history.push(meanTraits(G.pop)); addGallery();
  }

  /* ---------- Screens (DOM overlays) ---------- */
  function screen(html) { const el = $("og-screen"); el.innerHTML = html; el.hidden = !html; if (html) { const b = el.querySelector(".og-btn:not([disabled]), .og-hab, .og-opt, button:not(.og-back)"); if (b) b.focus({ preventScroll: true }); } }
  const BACK = '<button type="button" class="og-back" id="og-back">◀ Back</button>';
  const onBack = fn => { const b = $("og-back"); if (b) b.addEventListener("click", () => { beep(440, 0.06, "triangle", 0.04); fn(); }); };
  function portrait(o, i, cls = "") {
    return `<div class="og-otter ${cls}" data-i="${i}"><canvas width="140" height="96" data-p="${i}"></canvas>${o.lead ? '<span class="og-you">YOU</span>' : ""}${o.mut ? '<span class="og-mut">MUTANT</span>' : ""}${o.newDex ? '<span class="og-new" title="New otter for your Otter-dex!">★</span>' : ""}</div>`;
  }
  function paintPortraits(pop, root) {
    root.querySelectorAll("canvas[data-p]").forEach(cv => {
      const o = pop[+cv.dataset.p], c = cv.getContext("2d");
      c.clearRect(0, 0, 140, 96); c.save();
      drawOtter(c, 64, 92, o.t, { k: 1.0, worn: o.lead ? G.worn : {} }); c.restore();
    });
  }

  function screenSettings(next, back = screenTitle) {
    G.screen = "settings"; G.back = back;
    const opt = (k, val, ic, title, sub) => `<button type="button" class="og-opt" data-k="${k}" data-v="${val}" aria-pressed="${G.opts[k] === val}">${ic}<b>${title}</b><span>${sub}</span></button>`;
    screen(`<div class="og-card og-wide">${BACK}
      <h2 class="og-h">How do you want to play?</h2>
      <h3 class="og-mini">Predators</h3>
      <div class="og-opts">${opt("preds", true, ICON.eagle, "Predators on", "Eagles, coyotes, and alligators. More challenge!")}${opt("preds", false, ICON.friends, "No predators", "Relaxed exploring, great for little kids.")}</div>
      <h3 class="og-mini">Timer</h3>
      <div class="og-opts">${opt("timer", true, ICON.bolt, "Timer on", "Each season lasts 75 seconds.")}${opt("timer", false, ICON.flag, "No timer", "Play until you finish your goals.")}</div>
      <button type="button" class="og-btn" id="og-set-go">Let's go ▶</button></div>`);
    document.querySelectorAll(".og-opt").forEach(b => b.addEventListener("click", () => {
      G.opts[b.dataset.k] = b.dataset.v === "true"; save(); beep(560, 0.06, "triangle", 0.04);
      document.querySelectorAll(`.og-opt[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    }));
    $("og-set-go").addEventListener("click", () => { beep(660, 0.1, "triangle"); next(); });
    onBack(back);
  }
  function screenTitle() {
    G.screen = "title";
    screen(`<div class="og-card og-title">
      <p class="og-badge">SQuEACs Lab presents</p>
      <h2 class="og-logo">Otter<br><span>Evolution</span></h2>
      <p class="og-sub">Guide a population of river otters through ${GENS} generations and watch evolution happen.</p>
      <ol class="og-steps">
        <li><span><b>Play a season</b> as one otter. Eat, swim, and dodge danger.</span></li>
        <li><span><b>Survive and raise pups.</b> Traits pass to the next generation, with the occasional mutation.</span></li>
        <li><span><b>Watch the population evolve</b> to fit its habitat.</span></li>
      </ol>
      <div class="og-actions">${G.inRun && G.pop.length && G.gen <= GENS ? `<button type="button" class="og-btn" id="og-continue">Continue · Gen ${G.gen}</button><button type="button" class="og-btn ghost" id="og-play">New game</button>` : '<button type="button" class="og-btn" id="og-play">Play</button>'}</div></div>`);
    const cont = $("og-continue"); if (cont) cont.addEventListener("click", () => { beep(660, 0.1, "triangle"); screenBriefing(); });
    $("og-play").addEventListener("click", () => { beep(660, 0.1, "triangle"); if (window.SQ_track) window.SQ_track("play", "otter-game"); screenSettings(() => screenHabitat(true)); });
  }
  function screenHabitat(fresh) {
    G.screen = "habitat"; G.back = fresh ? () => screenSettings(() => screenHabitat(true)) : screenBriefing;
    screen(`<div class="og-card og-wide">${BACK}
      <h2 class="og-h">${fresh ? "Choose a home for your otters" : "Stay or move?"}</h2>
      <p class="og-sub">${fresh ? "Each habitat favors different traits." : "Moving changes which traits natural selection favors."}</p>
      <div class="og-habs">${ORDER.map(k => `<button type="button" class="og-hab og-hab-${k}${!fresh && k === G.hab ? " current" : ""}" data-h="${k}"><b>${HAB[k].name}</b><span>${HAB[k].blurb}</span>${!fresh && k === G.hab ? "<em>Current home</em>" : ""}</button>`).join("")}</div></div>`);
    document.querySelectorAll(".og-hab").forEach(b => b.addEventListener("click", () => {
      G.hab = b.dataset.h; beep(520, 0.08, "triangle");
      if (fresh) { G.gen = 1; G.pop = newPopulation(); G.history = [meanTraits(G.pop)]; G.startHab = G.hab; G.habSeasons = {}; G.inRun = true; G.plan = null; if (G.gallery.length && G.gallery[G.gallery.length - 1].label) G.gallery.pop(); addGallery("Starting otters"); }
      updatePanels(); screenBriefing();
    }));
    onBack(G.back);
  }
  function screenSurvival(f) {
    G.screen = "gen";
    const lost = G.pop.filter(o => !o.alive).length;
    screen(`<div class="og-card og-wide">
      <p class="og-badge">Generation ${G.gen} · ${HAB[G.hab].name}</p>
      <h2 class="og-h">Season over! Who survived?</h2>
      <p class="og-sub">${G.lastDead ? `Your otter was lost. ${G.lastCause} You'll play next season as a pup from another family.` : `Your otter ate <b>${G.lastFood}</b> food and finished <b>${G.lastDone} of 3</b> goals${G.lastDone >= 2 ? ", so it survives and raises extra pups" : ""}.`} Across the population, otters whose traits suit this habitat had better odds.${G.lastYear === "hard" ? " It was a hard year, so selection was stronger." : G.lastYear === "good" ? " It was a good year, so more otters made it." : ""}</p>
      <div class="og-grid" id="og-grid">${G.pop.map((o, i) => portrait(o, i)).join("")}</div>
      <p class="og-result" id="og-result" aria-live="polite"></p>
      <button type="button" class="og-btn" id="og-next" disabled>See the pups →</button></div>`);
    paintPortraits(G.pop, $("og-grid"));
    const order = G.pop.map((o, i) => i).filter(i => !G.pop[i].alive);
    let k = 0;
    const step = () => {
      if (k < order.length) { const el = document.querySelector(`.og-otter[data-i="${order[k]}"]`); el.classList.add("lost"); beep(200 - k * 8, 0.12, "sine", 0.04); k++; setTimeout(step, reduce ? 0 : 260); }
      else {
        $("og-result").textContent = `${POP - lost} of ${POP} otters survived.`;
        const b = $("og-next"); b.disabled = false; b.focus({ preventScroll: true });
        showFact(G.drift && G.gen > 1 ? "drift" : "selection");
      }
    };
    setTimeout(step, 500);
    $("og-next").addEventListener("click", () => { beep(600, 0.08, "triangle"); breed(); screenPups(); });
  }
  function screenPups() {
    const prev = G.history[G.history.length - 2], now = G.history[G.history.length - 1];
    const changes = TRAITS.map(({ k, name, color }) => {
      const d = k === "canal" ? degOf(now[k]) - degOf(prev[k]) : Math.round(now[k] - prev[k]);
      const unit = k === "canal" ? "°" : "";
      const start = G.history[0][k];
      return `<li><span class="og-cname">${TICON[k]}${name}</span><span class="og-cmp"><canvas data-tk="${k}" data-tv="${start}" title="Starting otters"></canvas><i aria-hidden="true">▸</i><canvas data-tk="${k}" data-tv="${now[k]}" title="Now"></canvas></span><b class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? ARROW.up + "+" : d < 0 ? ARROW.down : ARROW.same}${d}${unit}</b></li>`;
    }).join("");
    screen(`<div class="og-card og-wide">
      <p class="og-badge">Generation ${G.gen + 1} is born</p>
      <h2 class="og-h">Meet the pups</h2>
      <p class="og-sub">Each pup inherits a blend of its parents' traits.${G.mutated ? " A few carry new mutations." : ""}</p>
      <div class="og-grid" id="og-grid">${G.pop.map((o, i) => portrait(o, i)).join("")}</div>
      <h3 class="og-h3">How the population changed</h3>
      <p class="og-sub og-small">Pictures compare the starting otters (left) with this generation (right). Numbers show the change since last generation.</p>
      <ul class="og-changes og-changes-pics">${changes}</ul>
      <div class="og-actions"><button type="button" class="og-btn" id="og-next">${G.gen + 1 > GENS ? "See your results →" : "Play next season →"}</button>
      ${G.gen + 1 <= GENS ? '<button type="button" class="og-btn ghost" id="og-move">Move to a new habitat</button>' : ""}</div></div>`);
    paintPortraits(G.pop, $("og-grid")); paintTraits($("og-screen"));
    showFact("inherit"); if (G.mutated) setTimeout(() => showFact("mutation"), 600);
    G.gen++; updatePanels(); checkTraitUnlocks();
    $("og-next").addEventListener("click", () => { beep(660, 0.08, "triangle"); G.gen > GENS ? screenSummary() : screenBriefing(); });
    const mv = $("og-move"); if (mv) mv.addEventListener("click", () => screenHabitat(false));
  }
  function screenSummary() {
    unlock("labcoat");
    const start = G.history[0], end = G.history[G.history.length - 1];
    G.runs.push({ hab: G.hab, start: G.startHab, end }); G.runs = G.runs.slice(-4); save();
    const fmt = (k, v) => k === "canal" ? degOf(v) + "°" : Math.round(v);
    const cell = (k, v) => { const d = k === "canal" ? degOf(v) - degOf(start[k]) : Math.round(v - start[k]); return `<td><canvas class="og-tcan" data-tk="${k}" data-tv="${v}"></canvas><span>${fmt(k, v)} <small class="${d > 2 ? "up" : d < -2 ? "down" : ""}">${d > 2 ? ARROW.up : d < -2 ? ARROW.down : ""}</small></span></td>`; };
    const rows = G.runs.slice().reverse().map(r => `<tr><th>${HAB[r.hab].name}</th>${TRAITS.map(({ k }) => cell(k, r.end[k])).join("")}</tr>`).join("");
    screen(`<div class="og-card og-wide">
      <p class="og-badge">${GENS} generations complete</p>
      <h2 class="og-h">Your otters evolved!</h2>
      <p class="og-sub">Started in ${HAB[G.startHab].name}, ended in ${HAB[G.hab].name}. Compare populations from different habitats: one species, many forms.</p>
      <div class="og-table-wrap"><table class="og-table"><thead><tr><th>Population</th>${TRAITS.map(t => `<th><span class="og-th">${TICON[t.k]}${t.name}</span></th>`).join("")}</tr></thead>
      <tbody><tr class="start"><th>Starting otters</th>${TRAITS.map(({ k }) => `<td><canvas class="og-tcan" data-tk="${k}" data-tv="${start[k]}"></canvas><span>${fmt(k, start[k])}</span></td>`).join("")}</tr>${rows}</tbody></table></div>
      <div class="og-actions"><button type="button" class="og-btn" id="og-again">Start a new population</button></div></div>`);
    paintTraits($("og-screen")); showFact("adapt"); G.inRun = false;
    $("og-again").addEventListener("click", () => screenSettings(() => screenHabitat(true)));
  }
  function checkTraitUnlocks() {
    const m = meanTraits(G.pop);
    if (m.fur >= 72) unlock("beanie");
    if (m.fur <= 28) unlock("sunglasses");
    if (m.cochlea >= 78) unlock("goggles");
    if (m.brain >= 68) unlock("gradcap");
  }

  /* ---------- Anatomy and chart panels ---------- */
  function sizeCanvas(cv) { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); const c = cv.getContext("2d"); c.setTransform(d, 0, 0, d, 0, 0); return { c, w: r.width, h: r.height }; }
  // Drawings use a 150 x 120 logical canvas, scaled to fit any size
  function fitCanvas(cv) { const o = sizeCanvas(cv); o.c.clearRect(0, 0, o.w, o.h); const k = Math.min(o.w / 150, o.h / 120) || 1; o.c.translate((o.w - 150 * k) / 2, (o.h - 120 * k) / 2); o.c.scale(k, k); return { c: o.c, w: 150, h: 120, k }; }
  function drawBrain(t, cv = $("og-brain"), opts = {}) {
    const { c, w, h } = fitCanvas(cv);
    const cx = w / 2, cy = h / 2 + 4;
    const shape = (s, fill, stroke, dash) => {
      c.save(); c.translate(cx, cy); c.scale(s, s); c.setLineDash(dash || []);
      c.beginPath(); c.ellipse(-17, -2, 18, 26, -0.08, 0, 7); c.ellipse(17, -2, 18, 26, 0.08, 0, 7);
      if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5 / s; c.stroke(); }
      c.beginPath(); c.ellipse(-7, -31, 6, 5, 0, 0, 7); c.ellipse(7, -31, 6, 5, 0, 0, 7); if (fill) c.fill(); if (stroke) c.stroke();
      c.beginPath(); c.ellipse(0, 28, 16, 8, 0, 0, 7); if (fill) { c.fillStyle = "#24b3a8"; c.fill(); } if (stroke) c.stroke();
      c.restore();
    };
    const sNow = 0.78 + t.brain / 100 * 0.62, sRef = 0.78 + 0.5 * 0.62;
    shape(sNow, "#2ed3c6", "#0b0a10");
    c.save(); c.translate(cx, cy); c.scale(sNow, sNow); c.strokeStyle = "rgba(11,10,16,0.55)"; c.lineWidth = 1.2 / sNow;
    const g = 2 + Math.floor(t.brain / 22);
    for (let i = 0; i < g; i++) { const yy = -18 + i * (40 / g); [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 4, yy); c.quadraticCurveTo(sd * 16, yy - 5, sd * 27, yy + 2); c.stroke(); }); }
    c.beginPath(); c.moveTo(0, -26); c.lineTo(0, 22); c.stroke(); c.restore();
    if (opts.ref !== false) shape(sRef, null, "rgba(255,255,255,0.6)", [4, 4]);
  }
  function drawEar(t, cv = $("og-ear"), opts = {}) {
    const { c, w, h, k } = fitCanvas(cv);
    const aq = t.cochlea / 100, turns = 1.8 + aq * 1.1, flat = 1 - aq * 0.48, grow = 0.95 + aq * 0.45;
    const only = opts.only;
    // Cochlea spiral
    if (only !== "canals") {
    c.save(); if (only === "cochlea") { c.translate(w / 2, h / 2); c.scale(1.45, 1.45 * flat); } else { c.translate(w * 0.28, h * 0.6); c.scale(1, flat); }
    c.strokeStyle = "#ffcc4d"; c.lineWidth = 5; c.lineCap = "round"; c.beginPath();
    for (let a = 0; a <= turns * Math.PI * 2; a += 0.08) { const r = 3 + a * grow; const x = Math.cos(a) * r, y = Math.sin(a) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); c.restore();
    }
    if (only === "cochlea") return;
    // Vestibule
    const vx = only === "canals" ? w / 2 : w * 0.72, vy = only === "canals" ? h * 0.8 : h * 0.66;
    if (only === "canals") { c.translate(vx, vy); c.scale(1.35, 1.35); c.translate(-vx, -vy); }
    c.fillStyle = "#e0b43a"; c.beginPath(); c.ellipse(vx, vy, 16, 12, 0, 0, 7); c.fill();
    if (!only) { c.strokeStyle = "#e0b43a"; c.lineWidth = 6; c.beginPath(); c.moveTo(w * 0.28, h * 0.6); c.lineTo(vx - 14, vy); c.stroke(); }
    // Canals: anterior and posterior separated by the canal angle
    const deg = degOf(t.canal), half = deg / 2 * Math.PI / 180;
    const canal = (rot, col) => { c.save(); c.translate(vx, vy - 8); c.rotate(rot); c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.ellipse(0, -20, 9, 20, 0, Math.PI * 0.55, Math.PI * 2.45); c.stroke(); c.restore(); };
    canal(-half, "#ff5fa2"); canal(half, "#a47bff");
    c.save(); c.translate(vx + 16, vy + 4); c.strokeStyle = "#2ed3c6"; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 18, 7, 0, Math.PI * 0.75, Math.PI * 2.6); c.stroke(); c.restore();
    c.strokeStyle = "rgba(255,255,255,0.75)"; c.lineWidth = 1.2; c.beginPath(); c.arc(vx, vy - 8, 18, -Math.PI / 2 - half, -Math.PI / 2 + half); c.stroke();
    if (!opts.noLabel && k > 0.45) { c.fillStyle = "#fff"; c.font = "700 12px Fredoka, Arial, sans-serif"; c.textAlign = "center"; c.fillText(deg + "°", vx, vy - 52); c.textAlign = "left"; }
  }
  // Small picture of one trait: brain, cochlea, and canals use the anatomy drawings; body traits use the otter
  function paintTrait(cv, k, v) {
    if (k === "brain") return drawBrain({ brain: v }, cv, { ref: false });
    if (k === "cochlea") return drawEar({ cochlea: v, canal: 50 }, cv, { only: "cochlea" });
    if (k === "canal") return drawEar({ cochlea: 50, canal: v }, cv, { only: "canals", noLabel: true });
    const { c } = fitCanvas(cv); c.fillStyle = "#e6f6fb"; c.fillRect(-60, -60, 270, 240);
    drawOtter(c, 64, 112, { size: 50, fur: 50, ext: 50, brain: 50, cochlea: 50, canal: 50, [k]: v }, { k: 1.45 });
  }
  function paintTraits(root) { root.querySelectorAll("canvas[data-tk]").forEach(cv => paintTrait(cv, cv.dataset.tk, +cv.dataset.tv)); }
  function drawChart() {
    const { c, w, h } = sizeCanvas($("og-chart"));
    c.clearRect(0, 0, w, h);
    const pad = { l: 30, r: 10, t: 10, b: 24 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = 1; c.fillStyle = "#a8a0ba"; c.font = "11px 'IBM Plex Mono', monospace";
    [0, 50, 100].forEach(v => { const y = pad.t + ph - v / 100 * ph; c.beginPath(); c.moveTo(pad.l, y); c.lineTo(w - pad.r, y); c.stroke(); c.fillText(v, 4, y + 4); });
    const n = Math.max(GENS, G.history.length - 1);
    for (let g = 0; g <= n; g++) if (g % 2 === 0) c.fillText(g, pad.l + g / n * pw - 3, h - 6);
    if (G.history.length < 1) return;
    TRAITS.forEach(({ k, color }) => {
      c.strokeStyle = color; c.lineWidth = 2.2; c.beginPath();
      G.history.forEach((m, g) => { const x = pad.l + g / n * pw, y = pad.t + ph - clamp(m[k], 0, 100) / 100 * ph; g ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.stroke();
      const last = G.history[G.history.length - 1], x = pad.l + (G.history.length - 1) / n * pw, y = pad.t + ph - clamp(last[k], 0, 100) / 100 * ph;
      c.fillStyle = color; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill();
    });
  }
  function addGallery(label) {
    const m = meanTraits(G.pop);
    G.gallery.push({ hab: G.hab, gen: label ? 0 : G.gen + 1, label: label || "", brain: Math.round(m.brain), cochlea: Math.round(m.cochlea), canal: Math.round(m.canal) });
    G.gallery = G.gallery.slice(-30); save();
  }
  function renderGallery() {
    const box = $("og-gallery"); if (!box) return;
    if (!G.gallery.length) { box.innerHTML = '<p class="og-panel-sub">Play a season to start collecting brains and inner ears.</p>'; return; }
    box.innerHTML = G.gallery.slice().reverse().map((g, i) => `<figure class="og-gtile og-g-${g.hab}"><div><canvas data-gi="${i}" data-kind="brain"></canvas><canvas data-gi="${i}" data-kind="ear"></canvas></div>
      <figcaption><b>${g.label || "Gen " + g.gen} · ${HAB[g.hab].name}</b><span>Brain ${g.brain} · Cochlea ${(1.8 + g.cochlea / 100 * 1.1).toFixed(1)} turns · Canals ${degOf(g.canal)}°</span></figcaption></figure>`).join("");
    const list = G.gallery.slice().reverse();
    box.querySelectorAll("canvas[data-gi]").forEach(cv => { const g = list[+cv.dataset.gi]; (cv.dataset.kind === "brain" ? drawBrain : drawEar)(g, cv); });
  }
  function updatePanels() {
    const pop = G.pop.length ? G.pop : newPopulation(), m = meanTraits(pop);
    drawBrain(m); drawEar(m); drawChart();
    $("og-brain-cap").textContent = `Brain size ${Math.round(m.brain)} (dashed outline = starting otters)`;
    $("og-ear-cap").textContent = `Cochlea ${(1.8 + m.cochlea / 100 * 1.1).toFixed(1)} turns, ${m.cochlea > 60 ? "flatter and longer" : m.cochlea < 40 ? "tightly coiled" : "in between"} · Canal angle ${degOf(m.canal)}°`;
    $("og-anat-sub").textContent = G.pop.length ? `Population average · generation ${G.gen}` : "Starting otters";
  }

  /* ---------- Idle canvas (behind menus) ---------- */
  function drawIdle() {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H); g.addColorStop(0, "#2b1d5c"); g.addColorStop(0.6, "#7a3f9c"); g.addColorStop(1, "#ff5fa2");
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, VIEW_H);
    ctx.fillStyle = "rgba(88,198,224,0.85)"; ctx.fillRect(0, GROUND, viewW, VIEW_H);
    const t = performance.now() / 1000;
    for (let i = 0; i < 4; i++) drawOtter(ctx, ((t * 40 + i * viewW / 4) % (viewW + 120)) - 60, GROUND + 18, { size: 40 + i * 12, fur: 30 + i * 15, ext: 70 - i * 12, brain: 45 + i * 8 }, { swim: true, time: t, k: 0.9, worn: i === 1 ? G.worn : {} });
  }
  function idleLoop() { if (!running && G.screen !== "season") { drawIdle(); if (!reduce) requestAnimationFrame(idleLoop); } }

  /* ---------- RPG menu: hotbar slots open game windows ---------- */
  const modal = $("og-modal"); let openK = null, lastFocus = null;
  document.querySelector(".og-stage").appendChild(modal);   // so menus also show in full screen
  const WIN_KEYS = { j: "journal", k: "anatomy", v: "evolution", o: "wardrobe", x: "dex", t: "treasure" };
  function flag(k) { if (openK === k) return; const b = document.querySelector(`.og-slot[data-win="${k}"] .og-badge-new`); if (b) { b.hidden = false; b.parentElement.classList.add("has-new"); } $("og-bag").classList.add("has-new"); }
  let winHist = [];
  function openWin(k, fromBack) {
    if (!openK) { lastFocus = document.activeElement; winHist = []; }
    else if (!fromBack && openK !== k) winHist.push(openK);
    openK = k; modal.hidden = false; keys = {};
    if (S && G.screen === "season") S.paused = true;
    document.querySelectorAll(".og-window").forEach(w => w.hidden = w.dataset.win !== k);
    document.querySelectorAll(".og-modal-tabs [data-win]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.win === k)));
    const w = document.querySelector(`.og-window[data-win="${k}"]`);
    $("og-modal-title").textContent = w.querySelector("h2").textContent;
    $("og-modal-icon").innerHTML = document.querySelector(`.og-slot[data-win="${k}"] svg`).outerHTML;
    const b = document.querySelector(`.og-slot[data-win="${k}"]`); b.querySelector(".og-badge-new").hidden = true; b.classList.remove("has-new"); $("og-bag").classList.toggle("has-new", !!document.querySelector(".og-slot.has-new"));
    if (k === "anatomy" || k === "evolution") requestAnimationFrame(() => { updatePanels(); if (k === "anatomy") renderGallery(); });
    beep(520, 0.06, "triangle", 0.04);
    $("og-close").focus({ preventScroll: true });
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
  const stage = document.querySelector(".og-stage"), stickEl = $("og-stick"), knob = $("og-knob");
  function placeStick(x, y, dx = 0, dy = 0, on = false) {
    stickEl.style.left = x + "px"; stickEl.style.top = y + "px";
    knob.style.transform = `translate(${dx}px, ${dy}px)`; stickEl.classList.toggle("on", on);
  }
  function restStick() { const r = stage.getBoundingClientRect(); placeStick(Math.min(110, r.width * 0.22), r.height - 100); }
  function showTouch() {
    stage.classList.toggle("touch", touchMode);
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
  const lift = e => {
    if (stick.active && e.pointerId === stick.id) { stick.active = false; stick.id = null; stick.x = stick.y = 0; restStick(); }
    if (look && e.pointerId === look.id) look = null;
  };
  glc.addEventListener("pointerup", lift); glc.addEventListener("pointercancel", lift);
  document.querySelectorAll(".og-tbtn").forEach(b => {
    b.addEventListener("pointerdown", () => b.classList.add("on")); ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, () => b.classList.remove("on")));
  });
  const smallLandscape = () => matchMedia("(orientation: landscape) and (max-height: 520px)").matches;
  matchMedia("(orientation: landscape)").addEventListener("change", () => setTimeout(() => {
    if (running && touchMode && smallLandscape() && !stage.classList.contains("og-fs-on")) setFull(true);
    resize(); size3D(); if (!running) drawIdle(); if (running && touchMode) restStick();
  }, 250));
  $("og-bag").addEventListener("click", () => openWin(document.querySelector(".og-slot.has-new")?.dataset.win || "journal"));
  $("og-end").addEventListener("click", () => { if (S && running && S.ending <= 0) { S.ending = 0.01; } });
  function setFull(on) {
    stage.classList.toggle("og-fs-on", on); document.body.classList.toggle("og-noscroll", on);
    $("og-fs").setAttribute("aria-pressed", String(on)); $("og-fs").setAttribute("aria-label", on ? "Exit full screen" : "Full screen"); $("og-fs").textContent = on ? "✕" : "⛶";
    try { if (on && stage.requestFullscreen && !document.fullscreenElement) stage.requestFullscreen().then(() => { if (touchMode && screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {}); if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) {}
    requestAnimationFrame(() => { resize(); size3D(); if (!running) drawIdle(); if (S && touchMode && G.screen === "season") restStick(); });
  }
  $("og-fs").addEventListener("click", () => setFull(!stage.classList.contains("og-fs-on")));
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && stage.classList.contains("og-fs-on")) setFull(false); });

  /* ---------- Main menu button and pause ---------- */
  function quitSeason() {
    running = false; keys = {}; $("og-hud").hidden = true; glc.hidden = true; canvas.hidden = false; $("og-touch").hidden = true; endTouch();
    document.querySelector(".og-stage").appendChild($("og-corner"));
    if (G.habSeasons[G.hab]) G.habSeasons[G.hab]--;
    S = null; screenTitle(); idleLoop();
  }
  function goHome() {
    if (openK) closeWin();
    if (G.screen === "season" && S) {
      if (S.paused && G.screen === "season" && $("og-screen").querySelector(".og-pause")) { resume(); return; }
      S.paused = true; keys = {};
      screen(`<div class="og-card og-pause"><h2 class="og-h">Paused</h2>
        <div class="og-actions og-stack"><button type="button" class="og-btn" id="og-resume">▶ Resume</button>
        <button type="button" class="og-btn ghost" id="og-pmenu">🎒 Open backpack</button>
        <button type="button" class="og-btn ghost" id="og-quit">⌂ Main menu</button></div>
        <p class="og-sub og-small">Going to the main menu skips this season. Your population stays saved.</p></div>`);
      $("og-resume").addEventListener("click", resume);
      $("og-pmenu").addEventListener("click", () => openWin(document.querySelector(".og-slot.has-new")?.dataset.win || "journal"));
      $("og-quit").addEventListener("click", quitSeason);
      return;
    }
    if (G.screen !== "title") { beep(440, 0.06, "triangle", 0.04); screenTitle(); }
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

  resize(); renderCloset(); renderDex(); renderTreasure(); updatePanels(); screenTitle(); idleLoop();
})();
