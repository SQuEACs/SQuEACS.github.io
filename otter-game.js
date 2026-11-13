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
  const VIEW_H = 360, GROUND = 262, SEABED = 338, WORLD_W = 2600, SEASON = 45, POP = 12, GENS = 8, QUEST = 8;
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

  /* ---------- Game state ---------- */
  let G = { screen: "title", hab: "lake", gen: 1, pop: [], history: [], runs: [], seen: {}, unlocked: {}, worn: {}, habSeasons: {}, dex: {} };
  try { const s = JSON.parse(localStorage.getItem("squeacs-otter-evo") || "{}"); if (s.unlocked) { G.unlocked = s.unlocked; G.worn = s.worn || {}; G.runs = s.runs || []; G.dex = s.dex || {}; } } catch (e) {}
  const save = () => { try { localStorage.setItem("squeacs-otter-evo", JSON.stringify({ unlocked: G.unlocked, worn: G.worn, runs: G.runs.slice(-4), dex: G.dex })); } catch (e) {} };

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
    G.seen[key] = true; renderFact(key);
    const box = $("og-fact"); box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
    toast("New science card: " + FACTS[key].t.replace(/^Hypothesis: /, ""));
  }
  let toastT = 0;
  function toast(msg) { const el = $("og-toast"); el.textContent = msg; el.hidden = false; toastT = 3; }

  function unlock(id) {
    if (G.unlocked[id]) return;
    G.unlocked[id] = true;
    const slot = OUTFITS[id].slot;
    Object.keys(G.worn).forEach(k => { if (OUTFITS[k].slot === slot) G.worn[k] = false; });
    G.worn[id] = true; save(); renderCloset(); jingle();
    setTimeout(() => toast("Outfit unlocked: " + OUTFITS[id].name + "!"), 400);
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
  function renderDex() {
    const box = $("og-dex");
    box.innerHTML = DEX.map(d => G.dex[d.id] ? tile(d.id, d.name, d.why, true) : tile(d.id, d.name, d.hint, false)).join("");
    box.querySelectorAll("canvas[data-tile]").forEach(cv => { const d = G.dex[cv.dataset.tile]; paintTile(cv, d ? d.t : BASE, {}, !d); });
    $("og-dex-count").textContent = `${DEX.filter(d => G.dex[d.id]).length} of ${DEX.length}`;
  }
  function checkDex(pups) {
    const found = [];
    pups.forEach(p => DEX.forEach(d => {
      if (!G.dex[d.id] && d.test(p.t, p)) { G.dex[d.id] = { t: p.t }; p.newDex = d.name; found.push(d.name); }
    }));
    if (found.length) { save(); renderDex(); setTimeout(() => { jingle(); toast((found.length > 1 ? "New otters discovered: " : "New otter discovered: ") + found.join(", ") + "!"); }, 900); }
  }

  /* ---------- Otter drawing (shared by game and portraits) ---------- */
  function drawOtter(c, x, y, t, o = {}) {
    const mass = 20 + t.size * 0.8, fur = clamp(t.fur + (o.plastic || 0), 0, 100), fF = fur / 100;
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
    const n = 28, fl = Math.max(0, fF - 0.45) * 5;
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = 1 + (i % 2 ? fl / Math.max(L, H) * 2 : 0); const px = Math.cos(a) * L / 2 * r, py = Math.sin(a) * H / 2 * r; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.fill();
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

  /* ---------- Season (the playable part) ---------- */
  let S = null, keys = {}, parts = [], running = false, lastT = 0;
  function startSeason() {
    const h = HAB[G.hab];
    G.habSeasons[G.hab] = (G.habSeasons[G.hab] || 0) + 1;
    const items = [];
    if (h.land) {
      if (G.hab === "snow") for (let i = 0; i < 14; i++) items.push({ type: "fish", x: rand(250, 2450), y: GROUND - 8, hole: true, ph: rand(0, 6) });
      else { for (let i = 0; i < 7; i++) items.push({ type: "crayfish", x: rand(250, 2450), y: GROUND - 6 }); for (let i = 0; i < 4; i++) items.push({ type: "fish", x: rand(300, 2400), y: GROUND - 8, hole: true, ph: rand(0, 6) }); }
    } else {
      const nf = G.hab === "lake" ? 18 : G.hab === "fast" ? 12 : 11;
      for (let i = 0; i < nf; i++) items.push({ type: "fish", x: rand(260, 2340), y: rand(GROUND + 14, SEABED - 10), swim: true, ph: rand(0, 6) });
      if (G.hab === "slow" || G.hab === "murky") for (let i = 0; i < 6; i++) items.push({ type: "crayfish", x: rand(260, 2340), y: SEABED - 4 });
    }
    items.forEach(it => { it.alive = true; it.x0 = it.x; it.respawn = 0; });
    const logs = h.hazard === "logs" ? Array.from({ length: G.hab === "fast" ? 6 : 3 }, (_, i) => ({ x: 300 + i * 380, w: rand(50, 80) })) : [];
    const friends = G.hab === "lake" ? [{ x: 900, ph: 0, c: "#a47bff" }, { x: 1700, ph: 2, c: "#ff5fa2" }] : [];
    S = { x: 120, y: GROUND, vx: 0, vy: 0, face: 1, ground: true, swim: false, dive: false, t: 0, food: 0, crayfish: 0, hits: 0, inv: 0,
          plastic: 0, items, logs, friends, eagle: { on: false, x: 0, y: 0, cd: rand(5, 9) }, flakes: Array.from({ length: 60 }, () => ({ x: rand(0, WORLD_W), y: rand(0, VIEW_H), s: rand(1, 3) })) };
    parts = []; keys = {};
    G.screen = "season"; screen("");
    $("og-hud").hidden = false; $("og-gen").textContent = "GEN " + G.gen; $("og-hab").textContent = h.name;
    const f = h.facts[(G.habSeasons[G.hab] - 1) % 2]; setTimeout(() => showFact(f), 1200);
    running = true; lastT = performance.now(); canvas.focus({ preventScroll: true }); requestAnimationFrame(loop);
  }
  const waterHab = () => HAB[G.hab].water;
  const inWater = x => !!waterHab() && x > 200 && x < WORLD_W - 200;

  function update(dt) {
    const h = HAB[G.hab], W = waterHab(), me = lead();
    S.t += dt;
    const L = keys.ArrowLeft || keys.a || keys.A, Rt = keys.ArrowRight || keys.d || keys.D;
    const U = keys.ArrowUp || keys.w || keys.W || keys[" "], D = keys.ArrowDown || keys.s || keys.S;
    const tgt = (Rt ? 1 : 0) - (L ? 1 : 0), spd = 3.6 - me.t.size * 0.01;
    S.vx = lerp(S.vx, tgt * spd * 60, 0.18); if (tgt) S.face = tgt;
    const wet = inWater(S.x);
    if (wet && S.y >= GROUND - 2) {
      S.swim = true; S.ground = false; S.vy *= 0.88;
      if (D) S.vy += 0.6; else if (U && S.y <= GROUND + 6) S.vy = -6.5; else S.vy -= 0.28;
      if (!D && S.y > GROUND && S.vy > 0) S.vy *= 0.6;
      S.dive = S.y > GROUND + 14;
      S.x += W.flow * dt;
    } else { S.swim = false; S.dive = false; S.vy += 0.55; if (U && S.ground) { S.vy = -9.2; S.ground = false; beep(330, 0.06, "triangle", 0.03); } }
    S.x = clamp(S.x + S.vx * dt, 40, WORLD_W - 40); S.y += S.vy;
    if (wet) { S.y = clamp(S.y, GROUND - 120, SEABED - 6); if (S.y < GROUND - 2) S.swim = false; }
    else if (S.y >= GROUND) { S.y = GROUND; S.vy = 0; S.ground = true; }
    // Plasticity: fur responds to this season's climate, but isn't inherited
    const pTarget = G.hab === "snow" ? 18 : G.hab === "desert" ? -18 : 0;
    S.plastic = lerp(S.plastic, pTarget, 0.25 * dt);
    if (Math.abs(S.plastic) > 8) showFact("plasticity");
    // Food
    const dims = { L: 54 + (20 + me.t.size * 0.8) * 0.42 };
    const hx = S.x + S.face * dims.L * 0.55, hy = S.y - 16;
    for (const it of S.items) {
      if (!it.alive) { if (S.t > it.respawn) it.alive = true; continue; }
      if (it.swim) it.x = it.x0 + Math.sin(S.t * 0.8 + it.ph) * 40;
      const iy = it.hole ? it.y - Math.max(0, Math.sin(S.t * 2 + it.ph)) * 18 : it.y;
      if (Math.hypot(hx - it.x, hy - iy) < 26) {
        it.alive = false; it.respawn = S.t + 14; S.food++; if (it.type === "crayfish") S.crayfish++;
        burst(it.x, iy, it.type === "fish" ? "#2ed3c6" : "#ff8a5c", 12); beep(880 + S.food * 30, 0.08, "square", 0.04);
        if (S.food === QUEST) { toast("Quest complete! Your otter will raise extra pups."); jingle(); }
      }
    }
    // Hazards
    S.inv = Math.max(0, S.inv - dt);
    const hit = () => { if (S.inv > 0) return; S.inv = 1.5; S.hits++; S.food = Math.max(0, S.food - 1); burst(S.x, S.y - 20, "#ffffff", 14); beep(140, 0.2, "sawtooth", 0.05); toast("Ouch! You dropped a fish."); };
    S.logs.forEach(lg => {
      lg.x += (W ? W.flow + 30 : 0) * dt; if (lg.x > WORLD_W - 200) lg.x = 220;
      if (S.swim && !S.dive && Math.abs(lg.x - S.x) < lg.w / 2 + 12) hit();
    });
    const e = S.eagle;
    if (h.hazard === "eagle") {
      if (!e.on) { e.cd -= dt; if (e.cd <= 0) { e.on = true; e.dir = Math.random() < 0.5 ? 1 : -1; e.x = S.x - e.dir * 420; e.y = 60; } }
      else {
        e.x += e.dir * 210 * dt; e.y = lerp(e.y, Math.abs(e.x - S.x) < 140 ? S.y - 30 : 70, 0.05);
        if (Math.hypot(e.x - S.x, e.y - (S.y - 22)) < 30 && !S.dive) hit();
        if (Math.abs(e.x - S.x) > 520) { e.on = false; e.cd = rand(6, 10); }
      }
    }
    S.friends.forEach(f => { f.cx = f.x + Math.sin(S.t * 0.6 + f.ph) * 70; if (Math.abs(f.cx - S.x) < 80 && !reduce && Math.random() < 0.1) parts.push({ x: (f.cx + S.x) / 2, y: GROUND - 40, vx: rand(-0.5, 0.5), vy: -1, life: 0.9, c: "#ff5fa2", heart: true }); });
    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.heart ? 0 : 0.08; p.life -= dt; }); parts = parts.filter(p => p.life > 0);
    if (!reduce) S.flakes.forEach(f => { f.y += f.s * 0.6; if (f.y > VIEW_H) f.y = -5; });
    // HUD
    $("og-food").textContent = `Food ${S.food}/${QUEST}`;
    $("og-time").style.width = clamp(100 - S.t / SEASON * 100, 0, 100) + "%";
    if (S.t >= SEASON) endSeason();
  }
  function burst(x, y, c, n) { for (let i = 0; i < n; i++) parts.push({ x, y, vx: rand(-1.5, 1.5) * 2, vy: -rand(0, 3), life: 0.6, c }); }

  /* ---------- World drawing ---------- */
  function draw() {
    const h = HAB[G.hab], W = waterHab(), me = lead();
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const camX = clamp(S.x - viewW * 0.4, 0, WORLD_W - viewW);
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, h.sky[2]); g.addColorStop(0.55, h.sky[1]); g.addColorStop(1, h.sky[0]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, VIEW_H);
    ctx.fillStyle = G.hab === "desert" ? "rgba(255,230,170,0.95)" : "rgba(255,255,255,0.75)";
    ctx.beginPath(); ctx.arc(viewW - 80, 62, G.hab === "desert" ? 30 : 18, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(-camX * 0.3, 0); ctx.fillStyle = "rgba(20,14,40,0.32)"; ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= WORLD_W; x += 80) ctx.lineTo(x, GROUND - 60 - Math.sin(x * 0.011) * 30 - Math.sin(x * 0.027) * 18);
    ctx.lineTo(WORLD_W, GROUND); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(-camX, 0);
    if (h.land) {
      ctx.fillStyle = h.ground; ctx.fillRect(0, GROUND, WORLD_W, VIEW_H); ctx.fillStyle = h.ground2; ctx.fillRect(0, GROUND + 14, WORLD_W, VIEW_H);
      for (let x = 160; x < WORLD_W; x += G.hab === "snow" ? 170 : 240) G.hab === "snow" ? pine(x, GROUND, 50 + (x % 4) * 10, true) : cactus(x, GROUND);
      if (G.hab === "desert") { ctx.fillStyle = "rgba(88,198,224,0.6)"; for (let x = 400; x < WORLD_W; x += 520) { ctx.beginPath(); ctx.ellipse(x, GROUND + 6, 70, 5, 0, 0, 7); ctx.fill(); } }
    } else {
      ctx.fillStyle = "#2f6b4a"; ctx.fillRect(0, GROUND, 200, VIEW_H); ctx.fillRect(WORLD_W - 200, GROUND, 200, VIEW_H);
      pine(90, GROUND, 60, false); pine(WORLD_W - 90, GROUND, 60, false);
      const wg = ctx.createLinearGradient(0, GROUND, 0, VIEW_H); wg.addColorStop(0, W.top); wg.addColorStop(1, W.deep);
      ctx.fillStyle = wg; ctx.fillRect(200, GROUND - 2, WORLD_W - 400, VIEW_H);
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = 200; x < WORLD_W - 200; x += 6) ctx.lineTo(x, GROUND - 2 + Math.sin(x * 0.05 + S.t * (2 + W.flow * 0.03)) * (1.5 + W.flow * 0.02));
      ctx.stroke();
      if (W.flow > 50) { ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2; for (let i = 0; i < 40; i++) { const fx = 200 + ((i * 97 + S.t * W.flow * 1.6) % (WORLD_W - 400)), fy = GROUND + 8 + (i * 37) % 70; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 18, fy); ctx.stroke(); } }
      if (G.hab === "slow") { ctx.strokeStyle = "#3f7f4a"; ctx.lineWidth = 2; for (let x = 230; x < WORLD_W - 220; x += 46) { ctx.beginPath(); ctx.moveTo(x, SEABED + 2); ctx.quadraticCurveTo(x + Math.sin(S.t + x) * 6, GROUND + 30, x + 3, GROUND - 14); ctx.stroke(); } }
      if (G.hab === "murky") { ctx.fillStyle = "#4f7a3a"; for (let x = 260; x < WORLD_W - 220; x += 150) { ctx.beginPath(); ctx.ellipse(x, GROUND - 2, 16, 4, 0, 0, 7); ctx.fill(); } }
      ctx.fillStyle = "rgba(10,10,20,0.4)"; ctx.fillRect(200, SEABED + 4, WORLD_W - 400, VIEW_H);
    }
    sign(260, h.name);
    S.items.forEach(it => {
      if (!it.alive || it.x < camX - 40 || it.x > camX + viewW + 40) return;
      if (it.type === "fish") {
        if (it.hole) { ctx.fillStyle = "#1c2b4d"; ctx.beginPath(); ctx.ellipse(it.x0, GROUND + 3, 18, 5, 0, 0, 7); ctx.fill(); fish(it.x, it.y - Math.max(0, Math.sin(S.t * 2 + it.ph)) * 18, 1); }
        else fish(it.x, it.y, Math.cos(S.t * 0.8 + it.ph) > 0 ? 1 : -1);
      } else cray(it.x, it.y);
    });
    S.logs.forEach(lg => { ctx.fillStyle = "#6b4a2b"; ctx.fillRect(lg.x - lg.w / 2, GROUND - 7, lg.w, 12); ctx.fillStyle = "#8a6440"; ctx.beginPath(); ctx.ellipse(lg.x + lg.w / 2, GROUND - 1, 4, 6, 0, 0, 7); ctx.fill(); });
    S.friends.forEach(f => drawOtter(ctx, f.cx, GROUND + 18, { size: 55, fur: 55, ext: 45, brain: 60 }, { swim: true, face: Math.cos(S.t * 0.6 + f.ph) > 0 ? 1 : -1, time: S.t, k: 0.85 }));
    if (G.hab === "snow") { ctx.fillStyle = "rgba(255,255,255,0.85)"; S.flakes.forEach(f => { ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, 7); ctx.fill(); }); }
    const blink = S.inv > 0 && Math.floor(S.t * 10) % 2;
    if (!blink) drawOtter(ctx, S.x, S.swim ? S.y + (S.dive ? 0 : 6) : S.y, me.t, { swim: S.swim, face: S.face, time: S.t, moving: Math.abs(S.vx) > 20, plastic: S.plastic, worn: G.worn, tilt: S.swim ? clamp(S.vy * 0.05, -0.35, 0.35) : 0 });
    if (S.dive && !reduce && Math.random() < 0.15) parts.push({ x: S.x + S.face * 30, y: S.y - 20, vx: 0, vy: -1.2, life: 0.6, c: "rgba(255,255,255,0.8)" });
    const e = S.eagle; if (e.on) eagle(e.x, e.y, e.dir);
    parts.forEach(p => { ctx.globalAlpha = clamp(p.life / 0.6, 0, 1); ctx.fillStyle = p.c; if (p.heart) heart(p.x, p.y, 5); else ctx.fillRect(p.x, p.y, 3, 3); }); ctx.globalAlpha = 1;
    // Murky water hides everything beyond a short range
    if (W && W.murk > 0.2) {
      ctx.save(); ctx.beginPath(); ctx.rect(200, GROUND, WORLD_W - 400, VIEW_H); ctx.clip();
      const rg = ctx.createRadialGradient(S.x, S.y - 18, 30, S.x, S.y - 18, 120);
      rg.addColorStop(0, "rgba(55,40,25,0)"); rg.addColorStop(1, `rgba(55,40,25,${W.murk})`);
      ctx.fillStyle = rg; ctx.fillRect(camX, GROUND, viewW, VIEW_H); ctx.restore();
    }
    ctx.restore();
  }
  function sign(x, text) {
    ctx.fillStyle = "#5a3d2b"; ctx.fillRect(x - 2, GROUND - 46, 4, 46);
    ctx.font = "700 12px Fredoka, 'IBM Plex Sans', Arial, sans-serif"; const w = ctx.measureText(text).width + 16;
    ctx.fillStyle = "#15121e"; ctx.fillRect(x - w / 2, GROUND - 68, w, 24); ctx.strokeStyle = "#ff5fa2"; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, GROUND - 68, w, 24);
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(text, x, GROUND - 51); ctx.textAlign = "left";
  }
  function cactus(x, y) { ctx.fillStyle = "#3f8f5a"; ctx.fillRect(x - 6, y - 56, 12, 56); ctx.fillRect(x - 20, y - 36, 8, 16); ctx.fillRect(x - 20, y - 26, 16, 6); ctx.fillRect(x + 12, y - 44, 8, 18); ctx.fillRect(x + 4, y - 32, 16, 6); }
  function pine(x, y, h, snowy) { ctx.fillStyle = "#5a3d2b"; ctx.fillRect(x - 3, y - 12, 6, 12); ctx.fillStyle = snowy ? "#2f5a4a" : "#1f4d35"; for (let i = 0; i < 3; i++) { const w = 26 - i * 6, ty = y - 12 - i * h * 0.28; ctx.beginPath(); ctx.moveTo(x - w, ty); ctx.lineTo(x + w, ty); ctx.lineTo(x, ty - h * 0.42); ctx.fill(); } if (snowy) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x - 8, y - 12 - h * 0.62); ctx.lineTo(x + 8, y - 12 - h * 0.62); ctx.lineTo(x, y - 12 - h * 0.98); ctx.fill(); } }
  function fish(x, y, d) { ctx.save(); ctx.translate(x, y); ctx.scale(d, 1); ctx.fillStyle = "#2ed3c6"; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-17, -6); ctx.lineTo(-17, 6); ctx.fill(); ctx.fillStyle = "#0b0a10"; ctx.beginPath(); ctx.arc(6, -1, 1.4, 0, 7); ctx.fill(); ctx.restore(); }
  function cray(x, y) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#ff6b4a"; ctx.beginPath(); ctx.ellipse(0, 0, 9, 4, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-11, -2, 4, 3, 0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(11, -3, 5, 3, -0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(14, 1, 4, 2.5, 0.3, 0, 7); ctx.fill(); ctx.restore(); }
  function heart(x, y, r) { ctx.beginPath(); ctx.moveTo(x, y + r * 0.9); ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.4, x, y - r * 0.4); ctx.bezierCurveTo(x + r * 0.6, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); ctx.fill(); }
  function eagle(x, y, d) { ctx.save(); ctx.translate(x, y); ctx.scale(d, 1); const f = Math.sin(performance.now() / 90) * 8; ctx.fillStyle = "#3b2a1e"; ctx.beginPath(); ctx.moveTo(-30, -f); ctx.quadraticCurveTo(0, 6, 30, -f); ctx.quadraticCurveTo(0, 14, -30, -f); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 6, 14, 6, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(14, 3, 5, 0, 7); ctx.fill(); ctx.fillStyle = "#ffb347"; ctx.beginPath(); ctx.moveTo(18, 3); ctx.lineTo(24, 5); ctx.lineTo(18, 7); ctx.fill(); ctx.restore(); }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
    update(dt); if (running) draw();
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $("og-toast").hidden = true; }
    requestAnimationFrame(loop);
  }

  /* ---------- Between seasons: selection, inheritance, mutation ---------- */
  function endSeason() {
    running = false; keys = {}; $("og-hud").hidden = true;
    showFact("fitness");
    if (S.food >= 12) unlock("chef");
    if (S.hits === 0) unlock("crown");
    if (G.hab === "snow") unlock("scarf");
    // Selection
    const f = G.pop.map(o => fitness(o.t, G.hab));
    const ranked = f.map((v, i) => i).sort((a, b) => f[b] - f[a]);
    G.pop.forEach((o, i) => {
      if (o.lead && S.food >= QUEST) { o.alive = true; return; }
      o.alive = Math.random() < 0.15 + 0.8 * f[i];
    });
    let alive = G.pop.filter(o => o.alive);
    while (alive.length < 3) { const i = ranked.find(j => !G.pop[j].alive); G.pop[i].alive = true; alive = G.pop.filter(o => o.alive); }
    const drift = ranked.slice(0, 3).some(i => !G.pop[i].alive);
    G.lastFood = S.food; G.drift = drift;
    screenSurvival(f);
  }
  function breed() {
    const surv = G.pop.filter(o => o.alive);
    const fw = surv.map(o => 0.2 + fitness(o.t, G.hab));
    const pick = () => { let r = Math.random() * fw.reduce((a, b) => a + b, 0); for (let i = 0; i < surv.length; i++) { r -= fw[i]; if (r <= 0) return surv[i]; } return surv[surv.length - 1]; };
    const leadParent = surv.find(o => o.lead);
    const extra = leadParent ? (G.lastFood >= QUEST ? 3 : 1) : 0;
    const pups = []; let mutated = false;
    for (let i = 0; i < POP; i++) {
      const a = i < extra ? leadParent : pick(); let b = pick(); if (b === a && surv.length > 1) b = surv.find(o => o !== a);
      const t = {}; let mut = false;
      TRAITS.forEach(({ k }) => { let v = (a.t[k] + b.t[k]) / 2 + gauss() * 4; if (Math.random() < 0.025) { v += gauss() * 16; mut = true; } t[k] = v; });
      pups.push({ t: clampT(t), lead: false, mut, fromLead: a === leadParent });
      if (mut) mutated = true;
    }
    const heir = pups.find(p => p.fromLead) || pups[0]; heir.lead = true;
    G.pop = pups; G.mutated = mutated; checkDex(pups);
    G.history.push(meanTraits(G.pop));
  }

  /* ---------- Screens (DOM overlays) ---------- */
  function screen(html) { const el = $("og-screen"); el.innerHTML = html; el.hidden = !html; if (html) { const b = el.querySelector("button"); if (b) b.focus({ preventScroll: true }); } }
  function portrait(o, i, cls = "") {
    return `<div class="og-otter ${cls}" data-i="${i}"><canvas width="140" height="96" data-p="${i}"></canvas>${o.lead ? '<span class="og-you">YOU</span>' : ""}${o.mut ? '<span class="og-mut">MUTANT</span>' : ""}${o.newDex ? '<span class="og-new">NEW!</span>' : ""}</div>`;
  }
  function paintPortraits(pop, root) {
    root.querySelectorAll("canvas[data-p]").forEach(cv => {
      const o = pop[+cv.dataset.p], c = cv.getContext("2d");
      c.clearRect(0, 0, 140, 96); c.save();
      drawOtter(c, 64, 92, o.t, { k: 1.0, worn: o.lead ? G.worn : {} }); c.restore();
    });
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
      <button type="button" class="og-btn" id="og-play">Play</button></div>`);
    $("og-play").addEventListener("click", () => { beep(660, 0.1, "triangle"); if (window.SQ_track) window.SQ_track("play", "otter-game"); screenHabitat(true); });
  }
  function screenHabitat(fresh) {
    G.screen = "habitat";
    screen(`<div class="og-card og-wide">
      <h2 class="og-h">${fresh ? "Choose a home for your otters" : "Stay or move?"}</h2>
      <p class="og-sub">${fresh ? "Each habitat favors different traits." : "Moving changes which traits natural selection favors."}</p>
      <div class="og-habs">${ORDER.map(k => `<button type="button" class="og-hab og-hab-${k}${!fresh && k === G.hab ? " current" : ""}" data-h="${k}"><b>${HAB[k].name}</b><span>${HAB[k].blurb}</span>${!fresh && k === G.hab ? "<em>Current home</em>" : ""}</button>`).join("")}</div></div>`);
    document.querySelectorAll(".og-hab").forEach(b => b.addEventListener("click", () => {
      G.hab = b.dataset.h; beep(520, 0.08, "triangle");
      if (fresh) { G.gen = 1; G.pop = newPopulation(); G.history = [meanTraits(G.pop)]; G.startHab = G.hab; G.habSeasons = {}; }
      updatePanels(); startSeason();
    }));
  }
  function screenSurvival(f) {
    G.screen = "gen";
    const lost = G.pop.filter(o => !o.alive).length;
    screen(`<div class="og-card og-wide">
      <p class="og-badge">Generation ${G.gen} · ${HAB[G.hab].name}</p>
      <h2 class="og-h">Season over! Who survived?</h2>
      <p class="og-sub">Your otter found <b>${G.lastFood}</b> food${G.lastFood >= QUEST ? " and completed the quest, so it survives and raises extra pups." : "."} Otters whose traits suit this habitat had better odds.</p>
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
      return `<li><i style="background:${color}"></i>${name}<b class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "▲ +" : d < 0 ? "▼ " : "• "}${d}${unit}</b></li>`;
    }).join("");
    screen(`<div class="og-card og-wide">
      <p class="og-badge">Generation ${G.gen + 1} is born</p>
      <h2 class="og-h">Meet the pups</h2>
      <p class="og-sub">Each pup inherits a blend of its parents' traits.${G.mutated ? " A few carry new mutations." : ""}</p>
      <div class="og-grid" id="og-grid">${G.pop.map((o, i) => portrait(o, i)).join("")}</div>
      <h3 class="og-h3">How the population changed</h3>
      <ul class="og-changes">${changes}</ul>
      <div class="og-actions"><button type="button" class="og-btn" id="og-next">${G.gen + 1 > GENS ? "See your results →" : "Play next season →"}</button>
      ${G.gen + 1 <= GENS ? '<button type="button" class="og-btn ghost" id="og-move">Move to a new habitat</button>' : ""}</div></div>`);
    paintPortraits(G.pop, $("og-grid"));
    showFact("inherit"); if (G.mutated) setTimeout(() => showFact("mutation"), 600);
    G.gen++; updatePanels(); checkTraitUnlocks();
    $("og-next").addEventListener("click", () => { beep(660, 0.08, "triangle"); G.gen > GENS ? screenSummary() : startSeason(); });
    const mv = $("og-move"); if (mv) mv.addEventListener("click", () => screenHabitat(false));
  }
  function screenSummary() {
    unlock("labcoat");
    const start = G.history[0], end = G.history[G.history.length - 1];
    G.runs.push({ hab: G.hab, start: G.startHab, end }); G.runs = G.runs.slice(-4); save();
    const fmt = (k, v) => k === "canal" ? degOf(v) + "°" : Math.round(v);
    const rows = G.runs.slice().reverse().map(r => `<tr><th>${HAB[r.hab].name}</th>${TRAITS.map(({ k }) => `<td>${fmt(k, r.end[k])}</td>`).join("")}</tr>`).join("");
    screen(`<div class="og-card og-wide">
      <p class="og-badge">${GENS} generations complete</p>
      <h2 class="og-h">Your otters evolved!</h2>
      <p class="og-sub">Started in ${HAB[G.startHab].name}, ended in ${HAB[G.hab].name}. Compare populations from different habitats: one species, many forms.</p>
      <div class="og-table-wrap"><table class="og-table"><thead><tr><th>Population</th>${TRAITS.map(t => `<th>${t.name}</th>`).join("")}</tr></thead>
      <tbody><tr class="start"><th>Starting otters</th>${TRAITS.map(({ k }) => `<td>${fmt(k, start[k])}</td>`).join("")}</tr>${rows}</tbody></table></div>
      <div class="og-actions"><button type="button" class="og-btn" id="og-again">Start a new population</button></div></div>`);
    showFact("adapt");
    $("og-again").addEventListener("click", () => screenHabitat(true));
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
  function drawBrain(t) {
    const { c, w, h } = sizeCanvas($("og-brain"));
    c.clearRect(0, 0, w, h);
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
    shape(sRef, null, "rgba(255,255,255,0.6)", [4, 4]);
  }
  function drawEar(t) {
    const { c, w, h } = sizeCanvas($("og-ear"));
    c.clearRect(0, 0, w, h);
    const aq = t.cochlea / 100, turns = 1.8 + aq * 1.1, flat = 1 - aq * 0.48, grow = 0.95 + aq * 0.45;
    // Cochlea spiral
    c.save(); c.translate(w * 0.28, h * 0.6); c.scale(1, flat);
    c.strokeStyle = "#ffcc4d"; c.lineWidth = 5; c.lineCap = "round"; c.beginPath();
    for (let a = 0; a <= turns * Math.PI * 2; a += 0.08) { const r = 3 + a * grow; const x = Math.cos(a) * r, y = Math.sin(a) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); c.restore();
    // Vestibule
    const vx = w * 0.72, vy = h * 0.66;
    c.fillStyle = "#e0b43a"; c.beginPath(); c.ellipse(vx, vy, 16, 12, 0, 0, 7); c.fill();
    c.strokeStyle = "#e0b43a"; c.lineWidth = 6; c.beginPath(); c.moveTo(w * 0.28, h * 0.6); c.lineTo(vx - 14, vy); c.stroke();
    // Canals: anterior and posterior separated by the canal angle
    const deg = degOf(t.canal), half = deg / 2 * Math.PI / 180;
    const canal = (rot, col) => { c.save(); c.translate(vx, vy - 8); c.rotate(rot); c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.ellipse(0, -20, 9, 20, 0, Math.PI * 0.55, Math.PI * 2.45); c.stroke(); c.restore(); };
    canal(-half, "#ff5fa2"); canal(half, "#a47bff");
    c.save(); c.translate(vx + 16, vy + 4); c.strokeStyle = "#2ed3c6"; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 18, 7, 0, Math.PI * 0.75, Math.PI * 2.6); c.stroke(); c.restore();
    c.strokeStyle = "rgba(255,255,255,0.75)"; c.lineWidth = 1.2; c.beginPath(); c.arc(vx, vy - 8, 18, -Math.PI / 2 - half, -Math.PI / 2 + half); c.stroke();
    c.fillStyle = "#fff"; c.font = "700 12px Fredoka, Arial, sans-serif"; c.textAlign = "center"; c.fillText(deg + "°", vx, vy - 52); c.textAlign = "left";
  }
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

  /* ---------- Input ---------- */
  const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s", "A", "D", "W", "S"];
  canvas.addEventListener("keydown", e => { if (GAME_KEYS.includes(e.key)) { keys[e.key] = true; e.preventDefault(); } });
  canvas.addEventListener("keyup", e => { keys[e.key] = false; });
  canvas.addEventListener("blur", () => { keys = {}; });
  document.querySelectorAll("[data-key]").forEach(b => {
    const k = b.dataset.key, on = e => { e.preventDefault(); keys[k] = true; }, off = () => { keys[k] = false; };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });
  canvas.addEventListener("pointerdown", () => canvas.focus({ preventScroll: true }));
  $("og-mute").addEventListener("click", e => { muted = !muted; e.currentTarget.setAttribute("aria-pressed", String(muted)); e.currentTarget.textContent = muted ? "Sound off" : "Sound on"; canvas.focus({ preventScroll: true }); });
  window.addEventListener("resize", () => { resize(); updatePanels(); if (!running) drawIdle(); });

  resize(); renderCloset(); renderDex(); updatePanels(); screenTitle(); idleLoop();
})();
