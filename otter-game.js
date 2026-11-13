/* ============================================================
   OTTER ADVENTURE
   A small side-scroller for the SQuEACs Lab site.
   The otter's body responds to what it eats, the climate it
   lives in, and how much it swims. Outfits unlock as it changes.
   ============================================================ */
(function () {
  const canvas = document.getElementById("otter-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- World layout (logical units; the view is 360 tall) ---------- */
  const VIEW_H = 360, GROUND = 272, SEABED = 334;
  const ZONES = [
    { id: "desert", name: "Warm desert river", x0: 0,    x1: 1700, sky: ["#ff8a5c", "#ff5fa2", "#6b3f8f"], ground: "#d9a15b", ground2: "#b97f3f" },
    { id: "forest", name: "Temperate forest",  x0: 1700, x1: 3300, sky: ["#3b2a66", "#4f3f8f", "#2ed3c6"], ground: "#2f6b4a", ground2: "#1f4d35" },
    { id: "lake",   name: "Deep lake",         x0: 3300, x1: 4600, sky: ["#20305f", "#2b5c8f", "#58c6e0"], ground: "#2f6b4a", ground2: "#1f4d35" },
    { id: "snow",   name: "Snowy north",       x0: 4600, x1: 6400, sky: ["#2a2a55", "#6f6aa8", "#d9d4f2"], ground: "#eef0fb", ground2: "#c8cbe6" },
  ];
  const WORLD_W = 6400;
  const zoneAt = x => ZONES.find(z => x >= z.x0 && x < z.x1) || ZONES[ZONES.length - 1];
  const inLake = x => x >= ZONES[2].x0 + 40 && x < ZONES[2].x1 - 40;

  /* ---------- Research facts ---------- */
  const FACTS = {
    food:  { title: "Fish fuel growth", text: "Each fish adds body mass. Body size shapes nearly every trait we measure, so every analysis we run accounts for it.", href: "research.html#brain", link: "See our research" },
    jaw:   { title: "Crunch time", text: "Hard-shelled crayfish work the jaw muscles. We dissect cranial muscles to link a skull's anatomy with what an animal eats.", href: "research.html#skull", link: "Skull research" },
    cold:  { title: "Built for the cold", text: "Bergmann's rule predicts bigger, rounder bodies in cold places, and Allen's rule predicts shorter ears and tails that lose less heat. We tested both rules in pine martens.", href: "research.html#limb", link: "Limb research" },
    warm:  { title: "Shedding heat", text: "In warm places the predictions flip: leaner bodies and longer tails help shed heat. Climate can shape a species differently from one population to the next.", href: "research.html#limb", link: "Limb research" },
    water: { title: "Keeping your balance", text: "Diving and turning underwater challenge balance. The semicircular canals of the inner ear sense head rotation, and we study how they vary among river otters living in different environments.", href: "research.html#inner-ear", link: "Inner ear research" },
    brainDiet:   { title: "Hypothesis: diet quality and brain size", text: "Brain tissue is energy-hungry. One hypothesis we test is that energy-rich diets, like a steady supply of fish, help animals afford larger brains. Our work across carnivorans suggests the link differs from one group to another.", href: "research.html#brain", link: "Brain research" },
    brainHabitat:{ title: "Hypothesis: complex habitats and brain size", text: "Moving through forests, waterways, and three-dimensional underwater space may demand more brainpower. We test whether animals from more complex environments have larger brains by comparing endocasts across populations.", href: "research.html#brain", link: "Brain research" },
    brainSocial: { title: "Hypothesis: sociality and brain size", text: "The social brain hypothesis proposes that keeping track of others favors larger brains. We test whether social behavior helps explain brain size and shape among musteloids, from solitary mink to more social otters.", href: "research.html#brain", link: "Brain research" },
    size:  { title: "One species, many shapes", text: "Your otter now looks different from where it started. Populations of the same species vary like this, and our lab asks which forces drive that variation.", href: "index.html#what-we-do", link: "The big question" },
  };

  /* ---------- Outfits ---------- */
  const OUTFITS = {
    beanie:     { name: "Snow beanie",      slot: "hat",  hint: "Grow a thick winter coat." },
    scarf:      { name: "Striped scarf",    slot: "neck", hint: "Grow a thick winter coat." },
    sunglasses: { name: "Sunglasses",       slot: "eyes", hint: "Spend time in the desert heat." },
    goggles:    { name: "Swim goggles",     slot: "eyes", hint: "Dive deep and swim a lot." },
    chef:       { name: "Chef's hat",       slot: "hat",  hint: "Eat 8 fish." },
    crown:      { name: "Crayfish crown",   slot: "hat",  hint: "Eat 5 crayfish." },
    gradcap:    { name: "Thinking cap",     slot: "hat",  hint: "Grow a big brain." },
    labcoat:    { name: "SQuEACs lab coat", slot: "body", hint: "Unlock every other outfit." },
  };

  /* ---------- State ---------- */
  let friends = [];
  function makeFriends() {
    return [
      { x: 2450, y: GROUND, swim: false, color: "#2ed3c6", phase: 0 },
      { x: 3750, y: GROUND + 4, swim: true, color: "#a47bff", phase: 1.5 },
      { x: 4150, y: GROUND + 4, swim: true, color: "#ff5fa2", phase: 3 },
    ];
  }
  let st, items, flakes, keys = {}, running = false, lastT = 0, toastTimer = 0;
  function freshState() {
    return {
      x: 300, y: GROUND, vx: 0, vy: 0, face: 1, onGround: true, swimming: false, diving: false,
      mass: 30, fur: 40, jaw: 20, balance: 10, brain: 20, habitat: 0, social: 0, visited: {},
      fish: 0, crayfish: 0, seen: {}, unlocked: {}, worn: {}, t: 0,
    };
  }
  function loadSaved() {
    try {
      const s = JSON.parse(localStorage.getItem("squeacs-otter") || "{}");
      if (s && s.unlocked) { st.unlocked = s.unlocked; st.worn = s.worn || {}; }
    } catch (e) { /* storage unavailable */ }
  }
  function save() {
    try { localStorage.setItem("squeacs-otter", JSON.stringify({ unlocked: st.unlocked, worn: st.worn })); } catch (e) {}
  }

  function makeItems() {
    const out = [];
    const r = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 6; i++) out.push({ type: "crayfish", x: r(150, 1650), y: GROUND - 6 });
    for (let i = 0; i < 6; i++) out.push({ type: "crayfish", x: r(1750, 3250), y: GROUND - 6 });
    for (let i = 0; i < 16; i++) out.push({ type: "fish", x: r(3400, 4500), y: r(GROUND + 12, SEABED - 10), swim: true, phase: Math.random() * 6 });
    for (let i = 0; i < 8; i++) { const hx = r(4700, 6300); out.push({ type: "fish", x: hx, y: GROUND - 8, hole: true, phase: Math.random() * 6 }); }
    out.forEach(it => { it.alive = true; it.respawn = 0; it.x0 = it.x; });
    return out;
  }
  function makeFlakes() {
    return Array.from({ length: 70 }, () => ({ x: ZONES[3].x0 + Math.random() * (ZONES[3].x1 - ZONES[3].x0), y: Math.random() * VIEW_H, s: 1 + Math.random() * 2 }));
  }

  /* ---------- Sizing ---------- */
  let cssW = 0, cssH = 0, scale = 1, viewW = 640, dpr = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    cssW = rect.width; cssH = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    scale = cssH / VIEW_H; viewW = cssW / scale;
  }

  /* ---------- Helpers ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function hexMix(a, b, t) {
    const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
    return "rgb(" + pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(",") + ")";
  }
  function skyAt(camX) {
    const cx = camX + viewW / 2;
    const z = zoneAt(cx), i = ZONES.indexOf(z);
    const edge = 260;
    let t = 0, other = z;
    if (i < ZONES.length - 1 && cx > z.x1 - edge) { other = ZONES[i + 1]; t = (cx - (z.x1 - edge)) / (2 * edge); }
    else if (i > 0 && cx < z.x0 + edge) { other = ZONES[i - 1]; t = ((z.x0 + edge) - cx) / (2 * edge); }
    return z.sky.map((c, k) => hexMix(c, other.sky[k], clamp(t, 0, 0.5)));
  }

  /* ---------- Game flow ---------- */
  function reset(keepOutfits) {
    const keep = st ? { unlocked: st.unlocked, worn: st.worn } : null;
    st = freshState();
    if (keepOutfits && keep) { st.unlocked = keep.unlocked; st.worn = keep.worn; } else loadSaved();
    items = makeItems(); flakes = makeFlakes(); friends = makeFriends();
    updatePanel(true); renderCloset();
  }

  function renderFact(key) {
    const f = FACTS[key];
    const found = Object.keys(FACTS).filter(k => st.seen[k]);
    const box = document.getElementById("otter-fact");
    box.innerHTML = `<p class="label">Did you know?</p><h3>${f.title}</h3><p>${f.text}</p><a href="${f.href}">${f.link} →</a>
      <div class="fact-log"><p class="label">Facts found: ${found.length} of ${Object.keys(FACTS).length}</p>
      <div class="fact-chips">${found.map(k => `<button type="button" class="fact-chip" data-fact="${k}" aria-pressed="${k === key}">${(t => t.charAt(0).toUpperCase() + t.slice(1))(FACTS[k].title.replace(/^Hypothesis: /, ""))}</button>`).join("")}</div></div>`;
    box.querySelectorAll(".fact-chip").forEach(b => b.addEventListener("click", () => renderFact(b.dataset.fact)));
  }
  function showFact(key) {
    if (st.seen[key]) return;
    st.seen[key] = true;
    renderFact(key);
    const box = document.getElementById("otter-fact");
    box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
  }
  function toast(msg) {
    const el = document.getElementById("otter-toast");
    el.textContent = msg; el.hidden = false; toastTimer = 3.2;
  }
  function unlock(id) {
    if (st.unlocked[id]) return;
    st.unlocked[id] = true;
    const o = OUTFITS[id];
    Object.keys(st.worn).forEach(k => { if (st.worn[k] && OUTFITS[k].slot === o.slot) st.worn[k] = false; });
    st.worn[id] = true;
    toast("New outfit: " + o.name + "!");
    const all = Object.keys(OUTFITS).filter(k => k !== "labcoat").every(k => st.unlocked[k]);
    if (all && !st.unlocked.labcoat) setTimeout(() => unlock("labcoat"), 900);
    save(); renderCloset();
  }

  /* ---------- Update ---------- */
  function update(dt) {
    st.t += dt;
    const left = keys.ArrowLeft || keys.a || keys.A, right = keys.ArrowRight || keys.d || keys.D;
    const up = keys.ArrowUp || keys.w || keys.W || keys[" "], down = keys.ArrowDown || keys.s || keys.S;
    const speed = 3.4 - st.mass * 0.012;
    const target = (right ? 1 : 0) - (left ? 1 : 0);
    st.vx = lerp(st.vx, target * speed * 60, 0.18);
    if (target) st.face = target;

    const water = inLake(st.x);
    if (water && st.y >= GROUND - 2) {
      st.swimming = true; st.onGround = false;
      st.vy *= 0.88;
      if (down) st.vy += 0.6;
      else if (up && st.y <= GROUND + 6) st.vy = -6.5;
      else st.vy -= 0.28;
      if (!down && st.y > GROUND && st.vy > 0) st.vy *= 0.6;
      st.diving = st.y > GROUND + 14;
    } else {
      st.swimming = false; st.diving = false;
      st.vy += 0.55;
      if (up && st.onGround) { st.vy = -9.2; st.onGround = false; }
    }
    st.x = clamp(st.x + st.vx * dt, 40, WORLD_W - 40);
    st.y += st.vy;
    if (water) { st.y = clamp(st.y, GROUND - 120, SEABED - 6); if (st.y < GROUND - 2) st.swimming = false; }
    else if (st.y >= GROUND) { st.y = GROUND; st.vy = 0; st.onGround = true; }

    // Climate and activity shape the body
    const z = zoneAt(st.x).id;
    if (z === "snow") st.fur = clamp(st.fur + 9 * dt, 0, 100);
    else if (z === "desert") st.fur = clamp(st.fur - 9 * dt, 0, 100);
    else st.fur = lerp(st.fur, 40, 0.15 * dt);
    if (st.swimming) st.balance = clamp(st.balance + (st.diving ? 9 : 3) * dt, 0, 100);
    else st.balance = clamp(st.balance - 0.6 * dt, 0, 100);
    st.mass = clamp(st.mass - (Math.abs(st.vx) > 20 ? 0.45 : 0.15) * dt, 15, 100);
    st.jaw = clamp(st.jaw - 0.35 * dt, 10, 100);

    // Eating
    const headX = st.x + st.face * (bodyLen() * 0.55), headY = st.y - 16;
    for (const it of items) {
      if (!it.alive) { if (st.t > it.respawn) { it.alive = true; it.x = it.x0; } continue; }
      if (it.swim) { it.x = it.x0 + Math.sin(st.t * 0.8 + it.phase) * 40; }
      const iy = it.hole ? it.y - Math.max(0, Math.sin(st.t * 2 + it.phase)) * 18 : it.y;
      if (Math.hypot(headX - it.x, headY - iy) < 26) {
        it.alive = false; it.respawn = st.t + 12;
        if (it.type === "fish") { st.mass = clamp(st.mass + 6, 15, 100); st.fish++; showFact("food"); }
        else { st.mass = clamp(st.mass + 3, 15, 100); st.jaw = clamp(st.jaw + 9, 10, 100); st.crayfish++; showFact("jaw"); }
        burst(it.x, iy, it.type === "fish" ? "#2ed3c6" : "#ff8a5c");
      }
    }
    // Brain: three hypotheses (diet quality, habitat complexity, sociality)
    st.visited[z] = true;
    if (z === "forest") st.habitat = clamp(st.habitat + 4 * dt, 0, 100);
    if (st.diving) st.habitat = clamp(st.habitat + 5 * dt, 0, 100);
    st.habitat = clamp(st.habitat - 0.3 * dt, Object.keys(st.visited).length * 10, 100);
    let near = false;
    friends.forEach(f => {
      if (f.swim) f.x = f.x0 === undefined ? (f.x0 = f.x) : f.x0 + Math.sin(st.t * 0.6 + f.phase) * 60;
      if (Math.abs(f.x - st.x) < 80 && Math.abs(f.y - st.y) < 50) { near = true; if (!reduceMotion && Math.random() < 0.12) parts.push({ x: (f.x + st.x) / 2, y: st.y - 40, vx: (Math.random() - 0.5), vy: -1, life: 0.9, c: "#ff5fa2", heart: true }); }
    });
    st.social = clamp(st.social + (near ? 14 : -0.6) * dt, 0, 100);
    const eaten = st.fish + st.crayfish;
    const dietQ = eaten ? (st.fish / eaten) * 100 * Math.min(1, eaten / 6) : 0;
    st.dietQ = dietQ;
    const brainTarget = 15 + 0.3 * dietQ + 0.3 * st.habitat + 0.3 * st.social;
    st.brain = clamp(lerp(st.brain, brainTarget, 0.6 * dt), 0, 100);
    if (st.fish >= 3 && dietQ > 55) showFact("brainDiet");
    if (st.habitat > 50) showFact("brainHabitat");
    if (near) showFact("brainSocial");
    if (st.brain >= 68) unlock("gradcap");

    // Facts and unlocks
    if (st.fur > 68) showFact("cold");
    if (st.fur < 18) showFact("warm");
    if (st.diving) showFact("water");
    if (st.mass > 70) showFact("size");
    if (st.fur >= 82) { unlock("beanie"); unlock("scarf"); }
    if (st.fur <= 10) unlock("sunglasses");
    if (st.balance >= 70) unlock("goggles");
    if (st.fish >= 8) unlock("chef");
    if (st.crayfish >= 5) unlock("crown");

    // Particles and snow
    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= dt; });
    parts = parts.filter(p => p.life > 0);
    if (!reduceMotion) flakes.forEach(f => { f.y += f.s * 0.6; f.x += Math.sin((st.t + f.y) * 0.02) * 0.3; if (f.y > VIEW_H) f.y = -5; });

    if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) document.getElementById("otter-toast").hidden = true; }
    document.getElementById("otter-zone").textContent = zoneAt(st.x).name;
  }
  let parts = [];
  function burst(x, y, c) { for (let i = 0; i < 10; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3, life: 0.6, c }); }

  /* ---------- Otter geometry ---------- */
  const bodyLen = () => 54 + st.mass * 0.42;
  const bodyH = () => 18 + st.mass * 0.2 + st.fur * 0.05;

  /* ---------- Drawing ---------- */
  function draw() {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const camX = clamp(st.x - viewW * 0.4, 0, WORLD_W - viewW);
    const sky = skyAt(camX);
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, sky[2]); g.addColorStop(0.55, sky[1]); g.addColorStop(1, sky[0]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, VIEW_H);

    // Sun / moon
    const z = zoneAt(camX + viewW / 2).id;
    ctx.fillStyle = z === "desert" ? "rgba(255,230,170,0.9)" : "rgba(255,255,255,0.75)";
    ctx.beginPath(); ctx.arc(viewW - 70, 60, z === "desert" ? 28 : 18, 0, 7); ctx.fill();

    // Far hills (parallax)
    ctx.save(); ctx.translate(-camX * 0.3, 0);
    ctx.fillStyle = "rgba(20,14,40,0.35)";
    ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= WORLD_W * 0.3 + viewW + 200; x += 80) ctx.lineTo(x, GROUND - 60 - Math.sin(x * 0.011) * 30 - Math.sin(x * 0.027) * 18);
    ctx.lineTo(WORLD_W, GROUND); ctx.fill(); ctx.restore();

    ctx.save(); ctx.translate(-camX, 0);
    // Ground and water per zone
    for (const zn of ZONES) {
      if (zn.x1 < camX - 50 || zn.x0 > camX + viewW + 50) continue;
      if (zn.id === "lake") {
        ctx.fillStyle = "#2f6b4a"; ctx.fillRect(zn.x0, GROUND, 40, VIEW_H); ctx.fillRect(zn.x1 - 40, GROUND, 40, VIEW_H);
        const wg = ctx.createLinearGradient(0, GROUND, 0, VIEW_H);
        wg.addColorStop(0, "rgba(88,198,224,0.85)"); wg.addColorStop(1, "rgba(20,40,90,0.95)");
        ctx.fillStyle = wg; ctx.fillRect(zn.x0 + 40, GROUND - 2, zn.x1 - zn.x0 - 80, VIEW_H);
        ctx.fillStyle = "#1c2b4d"; ctx.fillRect(zn.x0 + 40, SEABED + 6, zn.x1 - zn.x0 - 80, VIEW_H);
        ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.5; ctx.beginPath();
        for (let x = zn.x0 + 40; x < zn.x1 - 40; x += 6) ctx.lineTo(x, GROUND - 2 + Math.sin(x * 0.05 + st.t * 2) * 1.5);
        ctx.stroke();
      } else {
        ctx.fillStyle = zn.ground; ctx.fillRect(zn.x0, GROUND, zn.x1 - zn.x0, VIEW_H);
        ctx.fillStyle = zn.ground2; ctx.fillRect(zn.x0, GROUND + 14, zn.x1 - zn.x0, VIEW_H);
      }
    }
    drawDecor(camX);
    // Items
    for (const it of items) {
      if (!it.alive || it.x < camX - 40 || it.x > camX + viewW + 40) continue;
      if (it.type === "fish") {
        if (it.hole) {
          ctx.fillStyle = "#1c2b4d"; ctx.beginPath(); ctx.ellipse(it.x0, GROUND + 3, 18, 5, 0, 0, 7); ctx.fill();
          const jy = it.y - Math.max(0, Math.sin(st.t * 2 + it.phase)) * 18;
          drawFish(it.x, jy, 1);
        } else drawFish(it.x, it.y, Math.cos(st.t * 0.8 + it.phase) > 0 ? 1 : -1);
      } else drawCrayfish(it.x, it.y);
    }
    // Snow
    if (camX + viewW > ZONES[3].x0) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      flakes.forEach(f => { if (f.x > camX - 10 && f.x < camX + viewW + 10) { ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, 7); ctx.fill(); } });
    }
    friends.forEach(f => { if (f.x > camX - 80 && f.x < camX + viewW + 80) drawFriend(f); });
    drawOtter();
    parts.forEach(p => { ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.6)); ctx.fillStyle = p.c; if (p.heart) heart(p.x, p.y, 5); else ctx.fillRect(p.x, p.y, 3, 3); });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawDecor(camX) {
    const vis = (x) => x > camX - 80 && x < camX + viewW + 80;
    for (let x = 120; x < 1650; x += 230) if (vis(x)) cactus(x, GROUND);
    for (let x = 1760; x < 3300; x += 120) if (vis(x)) pine(x, GROUND, 52 + (x % 3) * 14, false);
    for (let x = 4680; x < 6380; x += 150) if (vis(x)) pine(x, GROUND, 50 + (x % 4) * 10, true);
    // creek in desert and forest for crayfish
    ctx.fillStyle = "rgba(88,198,224,0.55)";
    [600, 1250, 2200, 2900].forEach(x => { if (vis(x)) { ctx.beginPath(); ctx.ellipse(x, GROUND + 6, 60, 5, 0, 0, 7); ctx.fill(); } });
    // zone signposts
    ZONES.forEach(zn => { if (vis(zn.x0 + 60)) sign(zn.x0 + 60, zn.name); });
  }
  function sign(x, text) {
    ctx.fillStyle = "#5a3d2b"; ctx.fillRect(x - 2, GROUND - 46, 4, 46);
    ctx.font = "600 11px 'IBM Plex Sans', Arial, sans-serif";
    const w = ctx.measureText(text).width + 14;
    ctx.fillStyle = "#15121e"; ctx.fillRect(x - w / 2, GROUND - 66, w, 22);
    ctx.strokeStyle = "#ff5fa2"; ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2, GROUND - 66, w, 22);
    ctx.fillStyle = "#efeaf6"; ctx.textAlign = "center"; ctx.fillText(text, x, GROUND - 51); ctx.textAlign = "left";
  }
  function cactus(x, y) {
    ctx.fillStyle = "#3f8f5a";
    ctx.fillRect(x - 6, y - 56, 12, 56); ctx.fillRect(x - 20, y - 36, 8, 16); ctx.fillRect(x - 20, y - 26, 16, 6);
    ctx.fillRect(x + 12, y - 44, 8, 18); ctx.fillRect(x + 4, y - 32, 16, 6);
  }
  function pine(x, y, h, snowy) {
    ctx.fillStyle = "#5a3d2b"; ctx.fillRect(x - 3, y - 12, 6, 12);
    ctx.fillStyle = snowy ? "#2f5a4a" : "#1f4d35";
    for (let i = 0; i < 3; i++) { const w = 26 - i * 6, ty = y - 12 - i * h * 0.28; ctx.beginPath(); ctx.moveTo(x - w, ty); ctx.lineTo(x + w, ty); ctx.lineTo(x, ty - h * 0.42); ctx.fill(); }
    if (snowy) { ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(x - 8, y - 12 - h * 0.62); ctx.lineTo(x + 8, y - 12 - h * 0.62); ctx.lineTo(x, y - 12 - h * 0.98); ctx.fill(); }
  }
  function heart(x, y, r) {
    ctx.beginPath(); ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.4, x, y - r * 0.4);
    ctx.bezierCurveTo(x + r * 0.6, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); ctx.fill();
  }
  function drawFriend(f) {
    const L = 62, H = 22, face = Math.sin(st.t * 0.6 + f.phase) > 0 ? 1 : -1;
    const by = f.swim ? GROUND + 2 + Math.sin(st.t * 2 + f.phase) * 2 : f.y - 7 - H / 2;
    ctx.save(); ctx.translate(f.x, by); ctx.scale(f.swim ? face : (st.x > f.x ? 1 : -1), 1);
    ctx.fillStyle = "#4e2e1a";
    ctx.beginPath(); ctx.moveTo(-L * 0.45, -2); ctx.quadraticCurveTo(-L * 0.8, 4, -L * 0.95, 9); ctx.quadraticCurveTo(-L * 0.7, 10, -L * 0.45, 6); ctx.fill();
    if (!f.swim) [[-L * 0.3], [-L * 0.15], [L * 0.22], [L * 0.35]].forEach(([lx]) => ctx.fillRect(lx - 3, H * 0.3, 6, 9));
    ctx.fillStyle = "#8a5634"; ctx.beginPath(); ctx.ellipse(0, 0, L / 2, H / 2, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#d7ad80"; ctx.beginPath(); ctx.ellipse(L * 0.05, H * 0.2, L * 0.3, H * 0.2, 0, 0, 7); ctx.fill();
    const hx = L * 0.5, hy = -H * 0.32, hr = 10;
    ctx.fillStyle = "#8a5634"; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.fill();
    ctx.fillStyle = "#d7ad80"; ctx.beginPath(); ctx.ellipse(hx + hr * 0.45, hy + hr * 0.35, 5, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#4e2e1a"; ctx.beginPath(); ctx.arc(hx - hr * 0.35, hy - hr * 0.85, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#0b0a10"; ctx.beginPath(); ctx.arc(hx + hr * 0.3, hy - hr * 0.2, 1.8, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + hr * 0.95, hy + hr * 0.15, 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = f.color; ctx.fillRect(hx - hr * 0.9, hy + hr * 0.55, hr * 1.3, 4);
    ctx.restore();
  }
  function drawFish(x, y, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = "#2ed3c6"; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-17, -6); ctx.lineTo(-17, 6); ctx.fill();
    ctx.fillStyle = "#0b0a10"; ctx.beginPath(); ctx.arc(6, -1, 1.4, 0, 7); ctx.fill();
    ctx.restore();
  }
  function drawCrayfish(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = "#ff6b4a";
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 4, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-11, -2, 4, 3, 0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(11, -3, 5, 3, -0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(14, 1, 4, 2.5, 0.3, 0, 7); ctx.fill();
    ctx.strokeStyle = "#ff6b4a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(16, -10); ctx.stroke();
    ctx.restore();
  }

  function drawOtter() {
    const L = bodyLen(), H = bodyH();
    const furF = st.fur / 100;
    const earR = 3.8 * (1.35 - furF * 0.6);
    const tailL = 34 * (1.25 - furF * 0.45);
    const bob = st.onGround && Math.abs(st.vx) > 20 && !reduceMotion ? Math.sin(st.t * 14) * 1.5 : 0;
    const swimTilt = st.swimming ? clamp(st.vy * 0.05, -0.35, 0.35) : 0;
    const legH = st.swimming ? 0 : 7;
    ctx.save();
    ctx.translate(st.x, st.y - legH - H / 2 + bob);
    ctx.rotate(swimTilt * st.face);
    ctx.scale(st.face, 1);
    const fur = "#7a4a2c", belly = "#c99a6b", dark = "#4e2e1a";

    // Tail
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.moveTo(-L * 0.45, -H * 0.15); ctx.quadraticCurveTo(-L * 0.45 - tailL * 0.6, H * 0.1, -L * 0.45 - tailL, H * 0.35);
    ctx.quadraticCurveTo(-L * 0.45 - tailL * 0.5, H * 0.45, -L * 0.45, H * 0.25); ctx.fill();
    // Legs
    if (!st.swimming) {
      ctx.fillStyle = dark;
      const step = Math.abs(st.vx) > 20 && !reduceMotion ? Math.sin(st.t * 14) * 4 : 0;
      [[-L * 0.3, step], [-L * 0.15, -step], [L * 0.22, -step], [L * 0.35, step]].forEach(([lx, s]) => ctx.fillRect(lx + s - 3, H * 0.3, 6, legH + 2));
    } else {
      ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(-L * 0.3, H * 0.45, 8, 3, 0.4 + Math.sin(st.t * 8) * 0.3, 0, 7); ctx.fill();
    }
    // Body (fluffy outline when fur is thick)
    ctx.fillStyle = fur; ctx.beginPath();
    const n = 28, fluff = Math.max(0, furF - 0.45) * 5;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 1 + (i % 2 ? fluff / Math.max(L, H) * 2 : 0);
      const px = Math.cos(a) * (L / 2) * r, py = Math.sin(a) * (H / 2) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.fill();
    ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(L * 0.05, H * 0.2, L * 0.32, H * 0.22, 0, 0, 7); ctx.fill();

    // Lab coat (body slot)
    if (st.worn.labcoat) {
      // Coat covers the front half of the body, like a jacket
      ctx.fillStyle = "#f4f2fa"; ctx.strokeStyle = "#c9c2dc"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-L * 0.02, -H * 0.47); ctx.lineTo(L * 0.4, -H * 0.36);
      ctx.quadraticCurveTo(L * 0.5, 0, L * 0.38, H * 0.42); ctx.lineTo(-L * 0.05, H * 0.47);
      ctx.quadraticCurveTo(-L * 0.12, 0, -L * 0.02, -H * 0.47); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#a47bff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L * 0.3, -H * 0.38); ctx.lineTo(L * 0.18, H * 0.1); ctx.stroke();
      ctx.fillStyle = "#ff5fa2"; ctx.fillRect(L * 0.02, -H * 0.12, 6, 5);
    }
    // Head
    const hx = L * 0.5, hy = -H * 0.32, hr = 9 + st.mass * 0.04 + st.brain * 0.05;
    ctx.fillStyle = fur; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.fill();
    // Cheeks grow with jaw muscles
    const cheek = 3 + st.jaw * 0.07;
    ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(hx + hr * 0.45, hy + hr * 0.35, cheek + 2, cheek, 0, 0, 7); ctx.fill();
    // Ear
    ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(hx - hr * 0.35, hy - hr * 0.85, earR, 0, 7); ctx.fill();
    // Eye and nose
    ctx.fillStyle = "#0b0a10";
    ctx.beginPath(); ctx.arc(hx + hr * 0.3, hy - hr * 0.2, 1.9, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + hr * 0.95, hy + hr * 0.15, 2.4, 0, 7); ctx.fill();
    // Whiskers
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 0.8; ctx.beginPath();
    ctx.moveTo(hx + hr * 0.8, hy + hr * 0.3); ctx.lineTo(hx + hr * 1.6, hy + hr * 0.1);
    ctx.moveTo(hx + hr * 0.8, hy + hr * 0.4); ctx.lineTo(hx + hr * 1.6, hy + hr * 0.5); ctx.stroke();

    // Neck slot
    if (st.worn.scarf) {
      ctx.fillStyle = "#2ed3c6"; ctx.fillRect(hx - hr * 0.9, hy + hr * 0.55, hr * 1.4, 5);
      ctx.fillStyle = "#ff5fa2"; ctx.fillRect(hx - hr * 0.5, hy + hr * 0.55, 4, 5); ctx.fillRect(hx, hy + hr * 0.55, 4, 5);
      ctx.fillStyle = "#2ed3c6"; ctx.fillRect(hx - hr * 0.9, hy + hr * 0.55, 5, 13);
    }
    // Eyes slot
    if (st.worn.sunglasses) {
      ctx.fillStyle = "#a47bff"; ctx.fillRect(hx + hr * 0.05, hy - hr * 0.42, hr * 0.62, hr * 0.38);
      ctx.fillStyle = "#0b0a10"; ctx.fillRect(hx + hr * 0.1, hy - hr * 0.37, hr * 0.52, hr * 0.28);
      ctx.strokeStyle = "#a47bff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx + hr * 0.05, hy - hr * 0.3); ctx.lineTo(hx - hr * 0.6, hy - hr * 0.4); ctx.stroke();
    } else if (st.worn.goggles) {
      ctx.strokeStyle = "#2ed3c6"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx + hr * 0.33, hy - hr * 0.2, hr * 0.32, 0, 7); ctx.stroke();
      ctx.fillStyle = "rgba(180,240,255,0.4)"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(hx + hr * 0.02, hy - hr * 0.25); ctx.lineTo(hx - hr * 0.9, hy - hr * 0.3); ctx.stroke();
    }
    // Hat slot
    if (st.worn.beanie) {
      ctx.fillStyle = "#ff5fa2"; ctx.beginPath(); ctx.arc(hx, hy - hr * 0.35, hr * 0.85, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#efeaf6"; ctx.fillRect(hx - hr * 0.9, hy - hr * 0.45, hr * 1.8, 4);
      ctx.beginPath(); ctx.arc(hx, hy - hr * 1.25, 3.5, 0, 7); ctx.fill();
    } else if (st.worn.chef) {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(hx - hr * 0.6, hy - hr * 1.5, hr * 1.2, hr * 0.8);
      ctx.beginPath(); ctx.arc(hx - hr * 0.35, hy - hr * 1.6, hr * 0.42, 0, 7); ctx.arc(hx + hr * 0.35, hy - hr * 1.6, hr * 0.42, 0, 7); ctx.fill();
    } else if (st.worn.gradcap) {
      ctx.fillStyle = "#15121e"; ctx.fillRect(hx - hr * 0.55, hy - hr * 1.05, hr * 1.1, hr * 0.35);
      ctx.beginPath(); ctx.moveTo(hx - hr * 1.05, hy - hr * 1.1); ctx.lineTo(hx, hy - hr * 1.45); ctx.lineTo(hx + hr * 1.05, hy - hr * 1.1); ctx.lineTo(hx, hy - hr * 0.8); ctx.fill();
      ctx.strokeStyle = "#ff5fa2"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx, hy - hr * 1.12); ctx.lineTo(hx + hr * 0.95, hy - hr * 0.95); ctx.lineTo(hx + hr * 0.95, hy - hr * 0.55); ctx.stroke();
    } else if (st.worn.crown) {
      ctx.fillStyle = "#ffb347"; ctx.beginPath();
      ctx.moveTo(hx - hr * 0.6, hy - hr * 0.75); ctx.lineTo(hx - hr * 0.6, hy - hr * 1.35); ctx.lineTo(hx - hr * 0.3, hy - hr * 1.0);
      ctx.lineTo(hx, hy - hr * 1.45); ctx.lineTo(hx + hr * 0.3, hy - hr * 1.0); ctx.lineTo(hx + hr * 0.6, hy - hr * 1.35); ctx.lineTo(hx + hr * 0.6, hy - hr * 0.75); ctx.fill();
      ctx.fillStyle = "#ff6b4a"; ctx.beginPath(); ctx.arc(hx, hy - hr * 0.95, 2.2, 0, 7); ctx.fill();
    }
    ctx.restore();
    // Bubbles when diving
    if (st.diving && !reduceMotion && Math.random() < 0.15) parts.push({ x: st.x + st.face * L * 0.5, y: st.y - 20, vx: 0, vy: -1.2, life: 0.6, c: "rgba(255,255,255,0.8)" });
  }

  /* ---------- Panel ---------- */
  const BARS = [
    ["mass", "Body size", () => st.mass],
    ["fur", "Fur thickness", () => st.fur],
    ["ext", "Ear and tail length", () => 100 - st.fur * 0.8],
    ["jaw", "Jaw muscles", () => st.jaw],
    ["balance", "Balance (inner ear)", () => st.balance],
    ["brain", "Brain size", () => st.brain],
  ];
  function updatePanel(build) {
    const box = document.getElementById("otter-traits");
    if (build) {
      box.innerHTML = BARS.map(([k, label]) => `<div class="trait"><span>${label}</span><div class="bar" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" id="bar-${k}"><i></i></div></div>`).join("");
    }
    BARS.forEach(([k, , f]) => {
      const v = Math.round(clamp(f(), 0, 100));
      const el = document.getElementById("bar-" + k);
      el.firstChild.style.width = v + "%"; el.setAttribute("aria-valuenow", v);
    });
    document.getElementById("otter-count").textContent = `${st.fish} fish · ${st.crayfish} crayfish`;
  }
  function renderCloset() {
    const box = document.getElementById("otter-closet");
    box.innerHTML = Object.entries(OUTFITS).map(([id, o]) => st.unlocked[id]
      ? `<button type="button" class="outfit" data-id="${id}" aria-pressed="${!!st.worn[id]}">${o.name}</button>`
      : `<span class="outfit locked" title="${o.hint}"><b>Locked</b> ${o.hint}</span>`).join("");
    box.querySelectorAll("button.outfit").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.id, slot = OUTFITS[id].slot, on = !st.worn[id];
      Object.keys(st.worn).forEach(k => { if (OUTFITS[k].slot === slot) st.worn[k] = false; });
      st.worn[id] = on; save(); renderCloset();
    }));
    const n = Object.keys(OUTFITS).filter(k => st.unlocked[k]).length;
    document.getElementById("otter-outfit-count").textContent = `${n} of ${Object.keys(OUTFITS).length} unlocked`;
  }

  /* ---------- Loop ---------- */
  let panelTimer = 0;
  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
    update(dt); draw();
    panelTimer += dt; if (panelTimer > 0.15) { panelTimer = 0; updatePanel(false); }
    requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true; lastT = performance.now();
    document.getElementById("otter-start").hidden = true;
    canvas.focus({ preventScroll: true });
    if (window.SQ_track) window.SQ_track("play", "otter-game");
    requestAnimationFrame(loop);
  }

  /* ---------- Input ---------- */
  const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s", "A", "D", "W", "S"];
  canvas.addEventListener("keydown", e => { if (GAME_KEYS.includes(e.key)) { keys[e.key] = true; e.preventDefault(); } });
  canvas.addEventListener("keyup", e => { keys[e.key] = false; });
  canvas.addEventListener("blur", () => { keys = {}; });
  document.querySelectorAll("[data-key]").forEach(btn => {
    const k = btn.dataset.key;
    const on = e => { e.preventDefault(); keys[k] = true; if (!running) start(); };
    const off = () => { keys[k] = false; };
    btn.addEventListener("pointerdown", on); btn.addEventListener("pointerup", off);
    btn.addEventListener("pointerleave", off); btn.addEventListener("pointercancel", off);
  });
  document.getElementById("otter-start").addEventListener("click", start);
  canvas.addEventListener("pointerdown", () => { if (!running) start(); canvas.focus({ preventScroll: true }); });
  document.getElementById("otter-reset").addEventListener("click", () => { reset(true); if (!running) draw(); canvas.focus({ preventScroll: true }); });

  window.addEventListener("resize", () => { resize(); if (!running) draw(); });
  resize(); reset(false); draw();
})();
