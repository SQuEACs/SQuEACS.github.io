/* ============================================================
   VIEW COUNTS (lab's own counter, saved to a Google Sheet)
   Paste the Web app URL from counter/Code.gs here (see README).
   Leave it empty to turn counting off.
   ============================================================ */
const COUNTER_URL = "";

// Sends one event to the lab's Sheet. Fire-and-forget; never blocks the page.
function track(event, model, label) {
  if (!COUNTER_URL) return;
  try {
    fetch(COUNTER_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ event, model: model || "", label: label || "" })
    }).catch(() => {});
  } catch (e) { /* counting is optional */ }
}

function slug(file) { return file.replace(/^.*\//, "").replace(/\.glb$/, ""); }

// Per model: "view" = the model finished loading on screen; "rotate" = a visitor
// turned or zoomed it (once per visit); "label" = a visitor selected a structure.
function trackModel(fig, m) {
  const mv = fig.querySelector("model-viewer");
  const id = slug(m.file);
  let interacted = false;
  mv.addEventListener("load", () => track("view", id), { once: true });
  mv.addEventListener("camera-change", e => {
    if (interacted || e.detail.source !== "user-interaction") return;
    interacted = true;
    track("rotate", id);
  });
}

/* ============================================================
   3D MODEL GALLERY
   Edit this list to add, remove, or rename models.
   Put each .glb file in the /models folder with the same name.
   ============================================================ */
const MODELS = [
  {
    file: "models/tadpole-cns.glb",
    title: "Tadpole central nervous system",
    specimen: "Lithobates heckscheri",
    caption: "Brain, spinal cord, and spinal and cranial nerves from microCT of a tadpole stained with buffered Lugol's iodine. Scanned at the University of Florida Nanoscale Research Facility and segmented in AVIZO. Model by Megan Hostetter.",
    wide: true,
    // Opening view: the brain, seen from the left and above. "Whole CNS" zooms out to the full specimen.
    view: { orbit: "62deg 58deg 26m", target: "0m 1.6m 19.5m", zoom: "14m", homeLabel: "Brain", fullLabel: "Whole CNS" },
    // Numbered labels, matching the Sketchfab annotations. pos/normal are in model coordinates.
    labels: [
    { n:  1, name: "Olfactory Bulb", color: "#ff00e4", pos: "-0.358m 2.235m 23.475m", normal: "0.199m 0.921m 0.336m" },
    { n:  2, name: "Telencephalon", color: "#ff5900", pos: "0.070m 2.869m 21.718m", normal: "0.046m 0.998m 0.052m" },
    { n:  3, name: "Diencephalon", color: "#ffbf00", pos: "0.469m 2.610m 20.030m", normal: "0.752m 0.659m 0.003m" },
    { n:  4, name: "Ephiphysis Cerebri (Pineal Body)", color: "#ffbf00", pos: "-0.480m 2.825m 20.174m", normal: "-0.255m 0.949m 0.185m" },
    { n:  5, name: "Paraphysis Cerebri", color: "#00ffa1", pos: "-0.584m 2.511m 20.927m", normal: "-0.047m 0.910m -0.411m" },
    { n:  6, name: "Optic Tectum", color: "#36ff00", pos: "0.818m 3.227m 18.702m", normal: "0.083m 0.968m 0.237m" },
    { n:  7, name: "Cerebellum", color: "#00b1ff", pos: "-0.066m 2.702m 16.885m", normal: "-0.165m 0.984m 0.072m" },
    { n:  8, name: "Choroid Process of the Fourth Ventricle", color: "#cfa8f6", pos: "0.135m 2.665m 15.672m", normal: "-0.059m 0.978m 0.199m" },
    { n:  9, name: "Fourth Ventricle", color: "#8300ff", pos: "0.313m 1.659m 14.400m", normal: "-0.780m 0.621m -0.073m" },
    { n: 10, name: "Medulla Oblongata", color: "#8300ff", pos: "-0.439m 2.115m 14.415m", normal: "-0.708m 0.572m -0.413m" },
    { n: 11, name: "Preoptic Area", color: "#ffbf00", pos: "-0.519m 0.287m 20.996m", normal: "-0.028m -0.896m 0.443m" },
    { n: 12, name: "Optic Chiasm", color: "#ffbd00", pos: "-0.390m 0.251m 20.116m", normal: "-0.006m -0.910m -0.415m" },
    { n: 13, name: "Infundibulum", color: "#00fff2", pos: "-0.456m -0.005m 19.396m", normal: "-0.248m -0.968m 0.047m" },
    { n: 14, name: "Hypophysis Cerebri", color: "#00fff2", pos: "-0.235m 0.141m 18.220m", normal: "0.085m -0.900m -0.427m" },
    { n: 15, name: "CN IX, X, XI, and XII", color: "#ff0014", pos: "-1.444m 1.436m 15.470m", normal: "0.010m -0.966m 0.259m" },
    { n: 16, name: "CN V, VII, VIII", color: "#ff0014", pos: "-1.403m 0.991m 16.850m", normal: "0.867m -0.479m -0.137m" },
    { n: 17, name: "CN VI", color: "#ff0014", pos: "-0.481m 0.740m 16.064m", normal: "0.072m -0.997m 0.036m" },
    { n: 18, name: "CN III, and IV", color: "#ff0014", pos: "-1.530m 0.867m 18.865m", normal: "0.119m -0.888m -0.444m" },
    { n: 19, name: "CN II", color: "#ff0014", pos: "-2.262m 0.678m 20.505m", normal: "-0.188m -0.936m 0.297m" },
    { n: 20, name: "CN I", color: "#ff0014", pos: "-1.653m 1.461m 24.747m", normal: "0.231m -0.930m -0.285m" }
    ]
  },
  {
    file: "models/procyon-endocast.glb",
    title: "Raccoon endocast anatomy",
    specimen: "Procyon lotor",
    caption: "Virtual endocast with gyri colored and labeled on one hemisphere and sulci on the other. Built from micro-CT of a Midwestern University ARCIVES specimen and segmented in Avizo 2022.2. Model by Angela Boyer.",
    wide: true,
    // Opening view: left side and slightly above, showing the labeled gyri.
    view: { orbit: "25deg 65deg auto", zoom: "40m", homeLabel: "Reset view" },
    labels: [
    { n:  1, name: "Olfactory bulb", color: "#ff8800", pos: "-32.704m -12.443m -0.133m", normal: "-0.790m -0.239m 0.565m" },
    { n:  2, name: "Proreal gyrus", color: "#ff0011", pos: "-23.264m -1.503m 2.275m", normal: "-0.717m 0.327m 0.615m" },
    { n:  3, name: "Orbital gyrus", color: "#833338", pos: "-20.135m -6.688m 6.625m", normal: "-0.633m -0.064m 0.771m" },
    { n:  4, name: "Rhinal fissure", color: "#a670db", pos: "-18.542m -12.530m 5.475m", normal: "-0.158m -0.321m 0.934m" },
    { n:  5, name: "Anterior sigmoid gyrus", color: "#eb96e9", pos: "-18.646m 0.892m 11.405m", normal: "-0.787m 0.610m 0.092m" },
    { n:  6, name: "Post cruciate gyrus", color: "#0400ff", pos: "-10.003m 12.345m 4.362m", normal: "-0.452m 0.868m 0.205m" },
    { n:  7, name: "Lateral gyrus", color: "#2d9f27", pos: "7.588m 15.767m 7.044m", normal: "0.174m 0.908m 0.381m" },
    { n:  8, name: "Posterior sigmoid gyrus", color: "#34c39f", pos: "-10.757m 6.010m 15.618m", normal: "-0.360m 0.602m 0.713m" },
    { n:  9, name: "Suprasylvian gyrus", color: "#0bf21e", pos: "3.161m 11.203m 16.002m", normal: "-0.169m 0.749m 0.641m" },
    { n: 10, name: "Pro-coronal gyrus", color: "#271493", pos: "-10.602m -4.797m 17.441m", normal: "-0.412m -0.538m 0.735m" },
    { n: 11, name: "Coronal gyrus", color: "#00ffaa", pos: "-3.040m -0.649m 20.390m", normal: "-0.304m 0.094m 0.948m" },
    { n: 12, name: "Pro-anterior ectosylvian gyrus", color: "#fbc35a", pos: "-3.939m -7.384m 18.625m", normal: "-0.124m -0.352m 0.928m" },
    { n: 13, name: "Anterior ectosylvian gyrus", color: "#f2ff00", pos: "3.149m -0.289m 20.625m", normal: "-0.065m 0.135m 0.989m" },
    { n: 14, name: "Medial ectosylvian gyrus", color: "#f2fe00", pos: "9.825m 5.182m 20.455m", normal: "0.018m 0.301m 0.953m" },
    { n: 15, name: "Posterior ectosylvian gyrus", color: "#f2fe00", pos: "6.630m -6.202m 21.778m", normal: "0.320m -0.216m 0.922m" },
    { n: 16, name: "Presylvian sulcus", color: "#b65170", pos: "-17.385m -5.796m -10.827m", normal: "-0.832m -0.535m 0.150m" },
    { n: 17, name: "Pseudosylvian sulcus", color: "#f3fe0e", pos: "4.753m -2.361m -19.957m", normal: "-0.034m -0.031m -0.999m" },
    { n: 18, name: "Suprasylvian sulcus", color: "#fef200", pos: "10.169m 9.919m -16.000m", normal: "0.432m 0.826m -0.363m" },
    { n: 19, name: "Lateral sulcus", color: "#0cf01e", pos: "10.536m 14.588m -7.919m", normal: "-0.212m 0.823m -0.526m" }
    ]
  }
  // Add more models like this:
  // { file: "models/otter-endocast.glb", title: "River otter endocast", specimen: "Lontra canadensis", caption: "Virtual endocast of the braincase." },
];

function buildGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  MODELS.forEach((m, mi) => {
    const fig = document.createElement("figure");
    fig.className = "model" + (m.wide ? " wide" : "") + (m.labels ? " labeled" : "");
    const v = m.view || {};
    const hotspots = (m.labels || []).map(l => `
      <button class="hotspot" type="button" slot="hotspot-${mi}-${l.n}" data-n="${l.n}"
        data-position="${l.pos}" data-normal="${l.normal}" style="--dot:${l.color}"
        aria-label="${l.n}. ${l.name}">
        <span class="num">${l.n}</span><span class="tip">${l.name}</span>
      </button>`).join("");
    const list = (m.labels || []).map(l => `
      <li><button type="button" class="label-item" data-n="${l.n}">
        <span class="sw" style="background:${l.color}"></span><span class="ln">${l.n}</span>${l.name}
      </button></li>`).join("");

    fig.innerHTML = `
      <div class="stage">
        <model-viewer src="${m.file}" alt="3D model: ${m.title}"
          camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="4000" rotation-per-second="10deg"
          interpolation-decay="120" ${v.orbit ? `camera-orbit="${v.orbit}"` : ""} ${v.target ? `camera-target="${v.target}"` : ""}
          field-of-view="30deg" min-camera-orbit="auto auto 3m" shadow-intensity="0" exposure="1.1" loading="lazy">
          <div class="empty" slot="poster"><span class="label">Loading model…</span></div>
          ${hotspots}
        </model-viewer>
        ${m.labels ? `<div class="view-tools">
          <button type="button" class="tool" data-act="brain">${v.homeLabel || "Reset view"}</button>
          ${v.fullLabel ? `<button type="button" class="tool" data-act="all">${v.fullLabel}</button>` : ""}
          <button type="button" class="tool" data-act="labels" aria-pressed="true">Labels</button>
        </div>` : ""}
      </div>
      ${m.labels ? `<aside class="label-panel" aria-label="Structures">
        <p class="label">Structures · select to zoom</p>
        <ol class="label-list">${list}</ol>
      </aside>` : ""}
      <figcaption>
        <p class="label"><i>${m.specimen}</i></p>
        <h3>${m.title}</h3>
        <p>${m.caption}</p>
      </figcaption>`;
    gallery.appendChild(fig);
    trackModel(fig, m);
    if (m.labels) wireLabels(fig, m);
  });
}

function wireLabels(fig, m) {
  const mv = fig.querySelector("model-viewer");
  const items = fig.querySelectorAll(".label-item");
  const spots = fig.querySelectorAll(".hotspot");
  const home = m.view || {};

  function select(n) {
    const l = m.labels.find(x => x.n === n);
    if (!l) return;
    track("label", slug(m.file), `${n} ${l.name}`);
    spots.forEach(s => s.classList.toggle("on", Number(s.dataset.n) === n));
    items.forEach(i => i.setAttribute("aria-current", Number(i.dataset.n) === n ? "true" : "false"));
    mv.removeAttribute("auto-rotate");
    mv.cameraTarget = l.pos;
    const orbit = mv.getCameraOrbit();
    mv.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${home.zoom || "14m"}`;
  }
  items.forEach(i => i.addEventListener("click", () => select(Number(i.dataset.n))));
  spots.forEach(s => s.addEventListener("click", () => select(Number(s.dataset.n))));

  fig.querySelectorAll(".tool").forEach(btn => btn.addEventListener("click", () => {
    const act = btn.dataset.act;
    if (act === "labels") {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      fig.classList.toggle("labels-off", !on);
      return;
    }
    spots.forEach(s => s.classList.remove("on"));
    items.forEach(i => i.setAttribute("aria-current", "false"));
    if (act === "brain") { mv.cameraTarget = home.target || "auto auto auto"; mv.cameraOrbit = home.orbit || "auto auto auto"; }
    if (act === "all") { mv.cameraTarget = "auto auto auto"; mv.cameraOrbit = "62deg 70deg auto"; }
  }));
}

/* ============================================================
   PUBLICATION FILTERS
   ============================================================ */
function setupFilters() {
  const chips = document.querySelectorAll(".chip[data-filter]");
  const years = document.querySelectorAll("#pubs .year");

  chips.forEach(chip => chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    chips.forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    years.forEach(year => {
      let shown = 0;
      year.querySelectorAll(".pub").forEach(p => {
        const match = f === "all" || p.dataset.topic === f;
        p.hidden = !match;
        if (match) shown++;
      });
      year.hidden = shown === 0;
    });
  }));
}

/* ============================================================
   COPY EMAIL
   ============================================================ */
function setupCopy() {
  document.querySelectorAll(".copy[data-target]").forEach(btn => {
  const email = document.getElementById(btn.dataset.target);
  if (!email) return;
  btn.addEventListener("click", () => {
    const text = email.textContent.trim();
    const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => selectText(email));
    } else {
      selectText(email);
    }
  });
  });
}
function selectText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ============================================================
   HERO: rotating landmark point cloud (schematic endocast)
   ============================================================ */
function startCloud() {
  const canvas = document.getElementById("cloud");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build a lobed, elongated ellipsoid with a forward olfactory bulb.
  const pts = [];
  const N = 1500;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    let x = Math.cos(th) * r, z = Math.sin(th) * r;
    // Shape: long axis on z (rostral-caudal), cerebral bulges, flattened base.
    let sx = 0.78, sy = 0.62, sz = 1.05;
    const lobe = 1 + 0.12 * Math.cos(3 * th) * r + 0.08 * Math.sin(2 * y * Math.PI);
    let px = x * sx * lobe, py = y * sy * lobe, pz = z * sz;
    if (py < -0.35) py = -0.35 + (py + 0.35) * 0.4;           // flatter ventral surface
    if (pz > 0.75) { px *= 0.55; py *= 0.55; pz += 0.18; }     // olfactory bulbs
    if (pz < -0.6 && py < 0) { py *= 0.8; }                    // cerebellum taper
    pts.push({ x: px, y: py, z: pz, lm: false });
  }
  // Mark 48 evenly spread points as landmarks.
  for (let k = 0; k < 48; k++) pts[Math.floor((k + 0.5) * (N / 48))].lm = true;

  const css = getComputedStyle(document.documentElement);
  const pink = css.getPropertyValue("--pink").trim() || "#ff5fa2";

  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Surface color by depth: purple (far) to teal (near).
  const far = [164, 123, 255], near = [46, 211, 198];
  function mix(t) {
    return `rgb(${Math.round(far[0] + (near[0] - far[0]) * t)},${Math.round(far[1] + (near[1] - far[1]) * t)},${Math.round(far[2] + (near[2] - far[2]) * t)})`;
  }

  let angle = 0.6;
  function frame() {
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w, h) * 0.36;
    const cx = w / 2, cy = h / 2;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const tilt = 0.35, ct = Math.cos(tilt), st = Math.sin(tilt);

    const proj = pts.map(p => {
      const x1 = p.x * ca + p.z * sa;
      const z1 = -p.x * sa + p.z * ca;
      const y1 = p.y * ct - z1 * st;
      const z2 = p.y * st + z1 * ct;
      return { sx: cx + x1 * s, sy: cy - y1 * s, z: z2, lm: p.lm };
    }).sort((a, b) => a.z - b.z);

    for (const p of proj) {
      const t = (p.z + 1.2) / 2.4;
      if (p.lm) {
        ctx.fillStyle = pink;
        ctx.globalAlpha = 0.55 + 0.45 * t;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.6 + 1.6 * t, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = mix(t);
        ctx.globalAlpha = 0.25 + 0.6 * t;
        ctx.fillRect(p.sx, p.sy, 1.4 + t, 1.4 + t);
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) { angle += 0.0045; requestAnimationFrame(frame); }
  }

  resize();
  window.addEventListener("resize", () => { resize(); if (reduce) frame(); });
  frame();
}



/* ============================================================
   COLLABORATIVE MANUSCRIPTS
   publications.html#with-smith highlights papers whose data-with includes "smith".
   To tag a new paper, add the collaborator's key to its data-with attribute.
   ============================================================ */
const COLLABORATORS = {
  felice: "Ryan Felice", gignac: "Paul Gignac", smith: "Heather Smith", heesy: "Christopher Heesy",
  delap: "Celeste Delap", ritzman: "Terrence Ritzman", campbell: "Tim Campbell",
  allen: "Kari Allen", obrien: "Haley O'Brien", valdez: "Dominik Valdez"
};

function setupCollabHighlight() {
  const banner = document.getElementById("with-banner");
  const pubs = document.querySelectorAll("#pubs .pub");
  if (!banner || !pubs.length) return;

  function apply() {
    const m = location.hash.match(/^#with-([a-z]+)$/);
    const key = m && COLLABORATORS[m[1]] ? m[1] : null;
    document.body.classList.toggle("collab-view", !!key);
    let first = null, n = 0;
    pubs.forEach(p => {
      const hit = !!key && (p.dataset.with || "").split(" ").includes(key);
      p.classList.toggle("hl", hit);
      if (hit) { n++; if (!first) first = p; }
    });
    if (!key) { banner.hidden = true; return; }
    banner.hidden = false;
    banner.innerHTML = `<p><strong>${n} manuscript${n === 1 ? "" : "s"} with ${COLLABORATORS[key]}</strong> are highlighted below.</p>
      <a class="btn" href="publications.html">Show all equally</a>`;
    if (first) setTimeout(() => first.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }), 150);
  }
  window.addEventListener("hashchange", apply);
  apply();
}


/* ============================================================
   PUBLICATION FIGURES
   Add a thumbnail to any paper: put the image in assets/pubs/ and add
   data-fig="assets/pubs/your-file.jpg" to that paper's <li class="pub">.
   ============================================================ */
function setupPubFigures() {
  document.querySelectorAll(".pub[data-fig]").forEach(li => {
    const img = document.createElement("img");
    img.className = "pub-fig"; img.loading = "lazy"; img.src = li.dataset.fig;
    const title = li.querySelector(".t"); img.alt = title ? "Figure from: " + title.textContent : "Figure";
    img.onerror = () => img.remove();
    li.classList.add("has-fig"); li.appendChild(img);
  });
}


/* ============================================================
   MENU: close the dropdown on outside click, Escape, or link click
   ============================================================ */
function setupMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;
  document.addEventListener("click", e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { menu.open = false; }));
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
setupMenu();
track("page", "", location.pathname.split("/").pop() || "index.html");
buildGallery();
setupFilters();
setupCollabHighlight();
setupPubFigures();
startCloud();
setupCopy();
