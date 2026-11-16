/* ============================================================
   INSIDE THE TADPOLE: a CT-scan slice game for kindergarten to
   6th grade, built on the lab's iodine-stained scans of tadpoles
   and fish. Each grade has its own mission tied to a standard.
   Everything is read aloud, with captions.

   Uses inside-the-tadpole-art.js and inside-the-tadpole-data.js.
   The classroom edition sets window.TP_CLASSROOM = true first.
   ============================================================ */
(function () {
  const ART = window.TP_ART, D = window.TP_DATA, P = D.PARTS, UI = ART.UI, TERMS = D.TERMS;
  const CL = !!window.TP_CLASSROOM;
  const $ = id => document.getElementById(id);
  const root = $("tp-stage"); if (!root) return;
  const view = $("tp-view"), cap = $("tp-cap");
  const SAVE_KEY = CL ? "squeacs-inside-the-tadpole-classroom" : "squeacs-inside-the-tadpole";
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const PH = {
    yes: ["Yes!", "You got it!", "That's right!", "Nice work!", "Spot on!", "Great looking!"],
    no: ["Not quite. Try again!", "Hmm, not that one.", "Good guess, but no. Try again!", "Look again."],
    solved: ["Mission complete!", "You did it!", "Super scientist!", "Great exploring!"]
  };

  /* ---------- science words: {key} or {key|shown words} ---------- */
  const TERM_RE = /\{(\w+)(?:\|([^}]*))?\}/g;
  const plain = s => String(s).replace(TERM_RE, (m, k, alt) => alt || (TERMS[k] ? TERMS[k].t : k));
  const rich = s => esc(s).replace(TERM_RE, (m, k, alt) => TERMS[k] ? `<button type="button" class="tp-term" data-act="term" data-k="${k}">${alt || TERMS[k].t}</button>` : (alt || k));

  /* ---------- saved progress ---------- */
  const S = Object.assign({ grade: null, done: {}, mute: false, opts: { lock: "", slow: false, caps: true } }, load());
  function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }
  const urlGrade = new URLSearchParams(location.search).get("grade");
  if (urlGrade && D.GRADES[urlGrade]) S.grade = urlGrade;
  if (CL && S.opts.lock && D.GRADES[S.opts.lock]) S.grade = S.opts.lock;
  const young = () => ["k", "g1", "g2"].includes(S.grade);

  /* ---------- voice ---------- */
  const SY = "speechSynthesis" in window ? window.speechSynthesis : null;
  let voice = null, sayToken = 0, lastLine = "", scr = 0;
  const WARM = [/\bava\b/i, /\bzoe\b/i, /\bjenny\b/i, /\bemma\b/i, /\baria\b/i, /\bsamantha\b/i, /\ballison\b/i, /\bsusan\b/i, /\bkaren\b/i, /\bmoira\b/i, /\bsonia\b/i, /\blibby\b/i, /\bmichelle\b/i, /google us english/i, /google uk english female/i];
  const SILLY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|ralph|junior|kathy|grandpa|grandma|rocko|shelley|flo|eddy|reed|sandy|espeak|compact/i;
  function voiceScore(v) {
    let sc = 0; const w = WARM.findIndex(p => p.test(v.name)); if (w >= 0) sc += 60 - w * 2;
    if (/natural|neural|premium|enhanced|online/i.test(v.name)) sc += 40;
    if (/^en[-_]us/i.test(v.lang)) sc += 8;
    if (/google/i.test(v.name)) sc += 10;
    if (SILLY.test(v.name)) sc -= 200;
    return sc;
  }
  function pickVoice() { if (!SY) return; const vs = SY.getVoices().filter(v => /^en(-|_|$)/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)); voice = vs[0] || null; }
  if (SY) { pickVoice(); SY.addEventListener && SY.addEventListener("voiceschanged", pickVoice); }
  function stopTalk() { sayToken++; if (SY) SY.cancel(); }
  function speak(text) {
    ++sayToken; lastLine = text;
    if (SY) SY.cancel();
    showCap(text);
    return new Promise(res => {
      const fallback = () => setTimeout(res, Math.min(9000, 900 + text.length * 55));
      if (!SY || S.mute) return fallback();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = (voice && voice.lang) || "en-US";
      u.rate = S.opts.slow ? 0.78 : young() ? 0.9 : 0.97;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 3000 + text.length * 120);
      const go = () => { try { SY.speak(u); } catch (e) { fin(); } };
      if (SY.speaking || SY.pending) { SY.cancel(); setTimeout(go, 80); } else go();
    });
  }
  // Resolves true when the line ends and the same screen is still showing (waits for an open word pop-up).
  function say(text) {
    const sid = scr;
    return speak(plain(text)).then(() => (pop.hidden ? null : new Promise(r => popWaiters.push(r)))).then(() => sid === scr);
  }
  let capT = 0;
  function showCap(t) { if (!S.opts.caps) { cap.hidden = true; return; } cap.textContent = t; cap.hidden = false; clearTimeout(capT); capT = setTimeout(() => { cap.hidden = true; }, 2500 + t.length * 80); }

  /* ---------- word pop-up ---------- */
  const pop = document.createElement("div");
  pop.className = "tp-popwrap"; pop.hidden = true; root.appendChild(pop);
  let popWaiters = [], popBack = null, popKey = null;
  function showTerm(k) {
    const T = TERMS[k]; if (!T) return Promise.resolve();
    popBack = document.activeElement; popKey = k;
    pop.innerHTML = `<div class="tp-pop" role="dialog" aria-modal="true" aria-labelledby="tp-pop-t">
      <p class="tp-pop-k">Science word</p><h3 id="tp-pop-t">${esc(cap1(T.t))}</h3>${T.say ? `<p class="tp-pop-say">Say it: <b>${esc(T.say)}</b></p>` : ""}
      <p class="tp-pop-def">${esc(T.def)}</p>
      <div class="tp-row"><button type="button" class="tp-btn tp-chip" data-pop="say">${UI.speak}<span>Hear it</span></button><button type="button" class="tp-btn tp-go" data-pop="close">${UI.go}<span>Got it</span></button></div></div>`;
    pop.hidden = false;
    pop.querySelector('[data-pop="close"]').focus({ preventScroll: true });
    speak(`${T.t}. ${T.def}`);
    return new Promise(r => popWaiters.push(r));
  }
  function closePop(quiet) {
    if (pop.hidden) return;
    pop.hidden = true; stopTalk(); cap.hidden = true;
    const w = popWaiters; popWaiters = []; w.forEach(r => r());
    if (!quiet && popBack && document.contains(popBack)) popBack.focus({ preventScroll: true });
  }
  pop.addEventListener("click", e => {
    const b = e.target.closest("[data-pop]");
    if (b) { if (b.dataset.pop === "close") closePop(); else speak(`${TERMS[popKey].t}. ${TERMS[popKey].def}`); }
    else if (e.target === pop) closePop();
  });
  pop.addEventListener("keydown", e => { if (e.key === "Escape") closePop(); });

  /* ---------- screens ---------- */
  let acts = {};
  function screen(html, a) { stopTalk(); closePop(true); scr++; acts = a || {}; view.innerHTML = html; view.scrollTop = 0; const f = view.querySelector("[data-focus]"); if (f) f.focus({ preventScroll: true }); }
  view.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el || !view.contains(el) || el.disabled) return;
    if (el.dataset.act === "term") { e.stopPropagation(); showTerm(el.dataset.k); return; }
    const fn = acts[el.dataset.act]; if (fn) fn(el, e);
  });
  view.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest("[data-act]"); if (!el || el.tagName === "BUTTON" || el.tagName === "INPUT") return;
    e.preventDefault(); el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  const btn = (act, inner, cls = "", extra = "") => `<button type="button" class="tp-btn ${cls}" data-act="${act}"${extra}>${inner}</button>`;
  const head = (q, sub = "") => `<div class="tp-head"><p class="tp-q">${rich(q)}</p>${sub ? `<p class="tp-sub">${rich(sub)}</p>` : ""}</div>`;
  const nextBtn = (label = "Next", hidden = false) => `<div class="tp-row" id="tp-nextrow"${hidden ? " hidden" : ""}>${btn("next", `${UI.go}<span>${label}</span>`, "tp-go", hidden ? "" : " data-focus")}</div>`;
  const showNext = () => { const r = $("tp-nextrow"); if (r) { r.hidden = false; r.querySelector("button").focus({ preventScroll: true }); } };
  // A simple screen with a Next button; resolves when Next is tapped.
  const lesson = (html, line) => new Promise(res => { screen(html + nextBtn(), { next: res }); say(line); });
  const flash = (el, ok) => { el.classList.remove("tp-ok", "tp-bad"); void el.offsetWidth; el.classList.add(ok ? "tp-ok" : "tp-bad"); };
  const partsOn = () => view.querySelectorAll("[data-part]").forEach(el => { el.dataset.act = "part"; });
  const lit = id => view.querySelectorAll(`[data-part="${id}"]`).forEach(x => x.classList.add("tp-lit"));
  // One multiple-choice question; resolves when answered right.
  function choose(q, opts, right, why, picture = "") {
    return new Promise(res => {
      const o = shuffle(opts);
      screen(`${head(q)}${picture}<div class="tp-choices">${o.map(([v, t]) => btn("o", esc(plain(t)), "tp-choice", ` data-v="${v}"`)).join("")}</div>`, {
        o: el => { if (el.dataset.v === right) { el.classList.add("tp-ok"); say(pick(PH.yes) + " " + why).then(ok => ok && res()); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say(plain(q) + " " + o.map(x => plain(x[1])).join(". Or, ") + "?");
    });
  }
  // Tap parts on a drawing, one prompt at a time.
  function tapParts(drawing, list, title) {
    return new Promise(res => {
      let i = 0;
      const ask = () => {
        if (i >= list.length) return res();
        const [id, prompt, after] = list[i];
        screen(`${head(prompt)}<div class="tp-pic tp-tap">${drawing()}</div>`, {});
        partsOn(); say(prompt);
        acts.part = el => {
          const got = el.dataset.part;
          if (got === id) { lit(id); i++; say(pick(PH.yes) + " " + (after || "")).then(ok => ok && ask()); }
          else if (P[got]) { flash(el, false); say(`That's the ${P[got].name}. ${plain(prompt)}`); }
        };
      };
      ask();
    });
  }
  // Put cards in order; resolves when done.
  function order(q, items, done) {
    return new Promise(res => {
      let n = 0; const cards = shuffle(items.map((x, i) => [i, x]));
      screen(`${head(q)}<ol class="tp-order" id="tp-order"></ol><div class="tp-cards">${cards.map(([i, x]) => btn("c", `${x.pic || ""}<span>${esc(x.t)}</span>`, "tp-card", ` data-i="${i}"`)).join("")}</div>`, {
        c: el => {
          if (+el.dataset.i === n) { el.disabled = true; el.classList.add("tp-used"); $("tp-order").insertAdjacentHTML("beforeend", `<li>${items[n].pic || ""}<span>${esc(items[n].t)}</span></li>`); n++; if (n === items.length) say(done).then(ok => ok && res()); else say(items[n - 1].t); }
          else { flash(el, false); say(n === 0 ? "What comes first?" : `What comes after: ${items[n - 1].t}?`); }
        }
      });
      say(q);
    });
  }

  /* ---------- the slice explorer ---------- */
  const them = id => (/s$/.test(P[id].name) ? "them" : "it");
  // Slide through the body; tap a part in the slice. kind: "tadpole" or "fish".
  function slicer(kind, targets, stage = 0, intro) {
    return new Promise(res => {
      let i = 0;
      const draw = () => {
        if (i >= targets.length) return res();
        const id = targets[i], ct = D.CT[kind] || [];
        screen(`${head(`Slide to find the ${P[id].name}, then tap ${them(id)} in the slice.`, intro && i === 0 ? intro : "")}
          <div class="tp-slicer"><div><div class="tp-side" id="tp-side"></div><label class="tp-range"><span>Slice</span><input type="range" min="40" max="${kind === "fish" ? 400 : stage === 3 ? 280 : 410}" value="60" id="tp-pos" data-focus aria-label="Move the slice from head to tail"></label></div><div class="tp-slices"><div class="tp-slice tp-tap" id="tp-slice"></div>${ct.length ? `<div class="tp-slice"><img id="tp-ct" alt="Real CT slice of a ${kind}"></div>` : ""}</div></div>`, {
          part: el => {
            if (el.dataset.part === id) { el.classList.add("tp-lit"); i++; say(pick(PH.yes) + " " + (P[id].says || P[id].k || "")).then(ok => ok && draw()); }
            else if (P[el.dataset.part]) { flash(el, false); say(`That's the ${P[el.dataset.part].name}. Keep looking for the ${P[id].name}.`); }
          }
        });
        const r = $("tp-pos");
        const upd = () => {
          const x = +r.value, sl = ART.slice(kind, x, stage, { parts: true });
          $("tp-side").innerHTML = kind === "fish" ? ART.fish({ sliceX: x }) : ART.tadpole(stage, { sliceX: x });
          $("tp-slice").innerHTML = sl.svg; partsOn();
          if (ct.length) $("tp-ct").src = ct[Math.min(ct.length - 1, Math.floor((x - 40) / 370 * ct.length))];
          r.setAttribute("aria-valuetext", sl.parts.length ? "Slice shows: " + [...new Set(sl.parts)].map(p => P[p].name).join(", ") : "No body parts here");
        };
        r.addEventListener("input", upd); upd();
        say(`Slide to find the ${P[id].name}, then tap ${them(id)} in the slice.`);
      };
      if (intro) say(intro);
      draw();
    });
  }

  /* ---------- title, grades, end ---------- */
  function title() {
    $("tp-home").hidden = true;
    screen(`<div class="tp-title"><div class="tp-title-art">${ART.tadpole(1, { label: "A see-through tadpole" })}</div>
      <h2 class="tp-logo"><span>Inside the</span> <span>Tadpole</span></h2>
      <p class="tp-sub">Real CT scans let us see inside without cutting. Slice in and explore!</p>
      <div class="tp-row">${btn("play", `${UI.go}<span>Play</span>`, "tp-go", " data-focus")}</div>
      ${CL ? `<button type="button" class="tp-gear" id="tp-gear" aria-label="Teacher settings (press and hold)">${UI.gear}</button>` : ""}</div>`,
      { play: () => (S.grade ? menu() : grades()) });
    if (CL) holdGear();
    say("Inside the Tadpole! Tap play to start.");
  }
  function grades() {
    $("tp-home").hidden = false;
    screen(`${head("Pick your grade")}<div class="tp-grades">${D.GRADE_IDS.map(g => btn("g", `<b>${D.GRADES[g].label}</b><span>${esc(D.GRADES[g].title)}</span>${S.done[g] ? `<i class="tp-stamp">${UI.star}</i>` : ""}`, "tp-grade", ` data-g="${g}" aria-label="Grade ${D.GRADES[g].label}: ${esc(D.GRADES[g].title)}"`)).join("")}</div>`,
      { g: el => { S.grade = el.dataset.g; save(); menu(); } });
    say("Pick your grade.");
  }
  function menu() {
    $("tp-home").hidden = false;
    const G = D.GRADES[S.grade];
    screen(`<div class="tp-intro">${head(`Grade ${G.label}: ${G.title}`, G.say.replace(/^[^.]*\.\s*/, ""))}
      <div class="tp-row">${btn("start", `${UI.lens}<span>Start the mission</span>`, "tp-go", " data-focus")}${CL && S.opts.lock ? "" : btn("grades", "Change grade", "tp-chip")}</div>
      <p class="tp-std">Standards: ${esc(G.std)}</p></div>`, { start: () => meet().then(() => PLAY[S.grade]()), grades });
    say(G.say + " Tap start the mission.");
  }
  function solved(g, msg) {
    S.done[g] = true; save();
    const w = pick(PH.solved);
    screen(`<div class="tp-done"><div class="tp-big-star">${UI.star}</div>${head(w, msg)}
      <div class="tp-row">${btn("again", "Play again", "tp-chip")}<a class="tp-btn tp-chip" href="skull-detective${CL ? "-classroom" : ""}.html">Try Skull Detective</a>${CL && S.opts.lock ? "" : btn("grades", `${UI.go}<span>Another grade</span>`, "tp-go", " data-focus")}</div></div>`,
      { again: () => PLAY[g](), grades });
    say(w + " " + msg);
  }

  /* ---------- meet the animals (before every mission) ---------- */
  function meet() {
    return new Promise(res => {
      const ids = ["tadpole", "fish"]; let i = 0;
      const card = () => {
        if (i >= ids.length) return res();
        const A = D.ANIMALS[ids[i]], last = i === ids.length - 1;
        screen(`<div class="tp-meet"><p class="tp-meet-n">Meet the animals: ${i + 1} of ${ids.length}</p>
          <div class="tp-meet-pic">${ids[i] === "tadpole" ? ART.realTadpole(360) : ART.realFish(360)}</div>
          <div class="tp-meet-txt"><h3>${esc(A.name)} <i>${esc(A.sci)}</i></h3><p>${rich(A.intro)}</p>
            <dl><dt>Lives</dt><dd>${esc(A.lives)}</dd><dt>Eats</dt><dd>${esc(A.eats)}</dd></dl><p class="tp-meet-fact">${rich(A.fact)}</p></div></div>
          <div class="tp-row">${btn("next", `${UI.go}<span>${last ? "Start the mission" : "Next animal"}</span>`, "tp-go", " data-focus")}${btn("skip", "Skip", "tp-chip")}</div>`, { next: () => { i++; card(); }, skip: res });
        say(`Meet the ${A.name.toLowerCase()}. ${A.intro} ${A.fact}`);
      };
      card();
    });
  }

  /* ---------- how CT works, and the cartoon slices versus a real CT slice ---------- */
  const ctIntro = () => lesson(`${head("How does a CT scanner see inside?", "A {ct} uses {xray|X-rays}. The scanner takes hundreds of X-ray pictures from every side, and a computer stacks them into thin {slice|slices}, like slices of a loaf of bread. Scientists can look inside without cutting the animal open.")}
      <div class="tp-ctdiag"><svg viewBox="0 0 420 150" role="img" aria-label="An X-ray tube, a tadpole on a turning stage, and a detector"><g stroke="#2a2233" stroke-width="3">
        <rect x="6" y="48" width="56" height="54" rx="10" fill="#6b6f7a"/><g stroke="#2ed3c6" stroke-width="2" opacity=".8">${[-36, -18, 0, 18, 36].map(d => `<path d="M 62 75 L 360 ${75 + d * 1.6}"/>`).join("")}</g>
        <ellipse cx="200" cy="128" rx="70" ry="12" fill="#e3ddd0"/><path d="M 186 128 V 112" stroke-width="4"/>
        <rect x="360" y="8" width="20" height="134" rx="4" fill="#1f2a44"/></g>
        <g transform="translate(140 40) scale(.3)">${ART.tadpole(0).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>
        <path d="M 230 30 a 40 14 0 1 1 -6 -6" fill="none" stroke="#c2552a" stroke-width="3"/>
        <text x="34" y="122" font-size="13" text-anchor="middle">X-ray tube</text><text x="370" y="150" font-size="13" text-anchor="end">detector</text></svg></div>`,
    "How does a CT scanner see inside? It takes hundreds of X-ray pictures from every side, and a computer stacks them into thin slices, like slices of a loaf of bread. Scientists can look inside without cutting the animal open.");
  // After the cartoon slices: what a real CT slice looks like, and how it is different.
  function ctCompare(kind = "tadpole", deep = false) {
    const real = (D.CT[kind] || [])[Math.floor((D.CT[kind] || []).length * .3)];
    const x = kind === "fish" ? 104 : 100, cartoon = ART.slice(kind, x, 0, {}).svg;
    const ctPic = real ? `<img class="tp-ct" src="${esc(real)}" alt="A real CT slice of a ${kind}">` : `<div class="tp-fakect">${cartoon}</div>`;
    return lesson(`${head("Now compare with a real CT scan", `Real CT slices are {grayscale}. The lab soaked the ${kind} in {iodine}, so soft tissues block more X-rays and look brighter. There are no colors and no labels: scientists must work out which gray shape is which organ, then color each one in. That is called {segment}.`)}
      <div class="tp-compare"><figure>${cartoon}<figcaption>Cartoon slice: colored and simplified</figcaption></figure><figure>${ctPic}<figcaption>${real ? "Real CT slice from the lab" : "What a CT slice looks like: gray and fuzzy (the lab's real images are coming soon)"}</figcaption></figure></div>`,
      `Now compare with a real CT scan. Real CT slices are shades of gray. The lab soaked the ${kind} in iodine stain, so soft tissues block more X-rays and look brighter. There are no colors and no labels. Scientists must work out which gray shape is which organ, then color each one in. That is called segmentation.`)
      .then(() => choose("What is one way a real CT slice is different from the cartoon?", [["gray", "It is gray, with no colors or labels"], ["color", "It shows the animal's real colors"], ["photo", "It is a photo of the outside of the animal"]], "gray", "Real slices are grayscale. Brightness shows how much the tissue blocked X-rays, not its color."))
      .then(() => deep ? choose("Why did scientists soak the animal in iodine stain before scanning?", [["stain", "So soft tissues block more X-rays and show up in the scan"], ["color", "To make the animal brown"], ["clean", "To clean it"]], "stain", "Without a stain, X-rays pass straight through soft tissue. Iodine makes muscles, nerves, and organs visible. This method is called diceCT.") : null);
  }

  /* ================= grade missions ================= */
  const PLAY = {};
  const STAGEPIC = s => `<div class="tp-stagepic">${ART.tadpole(s, { label: D.STAGES[s].name })}</div>`;
  const LIFE = [{ t: "Eggs in the pond", pic: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="3">${[[30, 40], [55, 35], [45, 60], [70, 58], [25, 66], [60, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="rgba(255,255,255,.7)"/><circle cx="${x}" cy="${y}" r="5" fill="#2a2233"/>`).join("")}</g></svg>` },
    { t: "Tadpole", pic: STAGEPIC(0) }, { t: "Tadpole with back legs", pic: STAGEPIC(2) }, { t: "Froglet", pic: STAGEPIC(3) },
    { t: "Adult frog", pic: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="3"><ellipse cx="50" cy="62" rx="32" ry="22" fill="#5bb04b"/><circle cx="34" cy="38" r="11" fill="#5bb04b"/><circle cx="66" cy="38" r="11" fill="#5bb04b"/><circle cx="34" cy="38" r="4" fill="#2a2233"/><circle cx="66" cy="38" r="4" fill="#2a2233"/><path d="M36 66 q14 8 28 0" fill="none"/></g></svg>` }];

  PLAY.k = async function () {
    const list = shuffle([["eye", "Tap the {eye}.", P.eye.k], ["mouth", "Tap the {mouth}.", P.mouth.k], ["tail", "Tap the tail.", P.tail.k], ["gut", "Tap the {intestine}, the long, coiled tube in the belly.", P.gut.k], ["heart", "Tap the {heart}.", P.heart.k], ["gills", "Tap the {gills}, behind the head.", P.gills.k]]).slice(0, 4);
    await tapParts(() => ART.tadpole(0, { parts: true }), list);
    await choose("What does a tadpole use its tail for?", [["swim", "Swimming"], ["fly", "Flying"], ["dig", "Digging"]], "swim", "Swish, swish! The tail muscles push the tadpole through the water.", `<div class="tp-pic tp-small">${ART.tadpole(0)}</div>`);
    solved("k", "You found the eye, mouth, intestine, heart, and gills inside a tadpole, and learned what they do.");
  };
  PLAY.g1 = async function () {
    await order("Put the frog's life cycle in order, starting with the eggs.", LIFE, "From eggs, to tadpole, to froglet, to frog. That's a life cycle!");
    await tapParts(() => ART.tadpole(1, { parts: true }), [["legs", "This tadpole has something new growing near its tail. Tap it!", "Those are the hind limbs, the back legs. They are starting to grow!"]]);
    await tapParts(() => ART.tadpole(2, { parts: true }), [["arms", "The CT scan shows {forelimb|forelimbs}, the front legs, hiding under the skin. Tap them!", "Forelimbs grow inside before they pop out."]]);
    await tapParts(() => ART.tadpole(3, { parts: true }), [["tail", "This {froglet} has four legs. Tap the part that is getting smaller.", "The tail shrinks as the froglet gets ready for land."]]);
    await choose("A tadpole doesn't look like its frog parents. What happens as it grows?", [["grow", "It changes until it looks like its parents"], ["same", "It stays a tadpole forever"], ["fish", "It turns into a fish"]], "grow", "Young animals can look very different from their parents, but they grow up to be like them. This big change is called metamorphosis.");
    solved("g1", "You followed a tadpole's life cycle all the way to a frog, inside and out.");
  };
  PLAY.g2 = async function () {
    await tapParts(() => ART.tadpole(0, { parts: true }), shuffle([
      ["gills", "A tadpole needs {oxygen}, but it lives under water. Tap the part that takes oxygen out of the water.", P.gills.k],
      ["gut", "A tadpole needs food. Tap the {intestine}, the part that digests it.", P.gut.k],
      ["muscle", "A tadpole needs to escape from hungry fish. Tap the strong {muscle|tail muscles} that help it swim fast.", P.muscle.k]
    ]));
    await choose("Which {habitat} could a tadpole survive in?", [["pond", "A pond with algae to eat"], ["sand", "Dry desert sand"], ["tree", "A tree top"]], "pond", "Tadpoles need water to breathe with their gills, and algae to eat.");
    await choose("Which animal also lives in the pond and might eat tadpoles?", [["fish", "A fish"], ["camel", "A camel"], ["owl", "A snowy owl"]], "fish", "Many animals share the pond: algae, tadpoles, insects, fish, frogs, and otters.");
    solved("g2", "You found the tadpole's survival kit: gills to breathe, an intestine to digest food, and muscles to swim.");
  };
  // Show one highlighted part and ask a question about it (no tapping needed).
  function askPart(drawing, id, q, opts, right, why) { return choose(q, opts, right, why, `<div class="tp-pic tp-small tp-hipic">${drawing(id)}</div>`); }
  PLAY.g3 = async function () {
    await ctIntro();
    await slicer("tadpole", shuffle(["eye", "gills", "heart", "gut", "noto"]).slice(0, 3), 0, "This cartoon shows what CT slices let us see. Move the slice from head to tail.");
    await ctCompare("tadpole");
    const JOBS = ["eye", "gills", "heart", "gut", "muscle", "brain"];
    await lesson(`${head("Structure and function", "Every body part, or {structure}, has a job, or {function}. Next, a part of the tadpole will glow pink. Pick the job it does.")}<div class="tp-pic tp-small">${ART.tadpole(0)}</div>`, "Structure and function. Every body part has a job. Next, a part of the tadpole will glow pink. Pick the job it does.");
    for (const id of shuffle(JOBS).slice(0, 4)) {
      const wrong = shuffle(JOBS.filter(x => x !== id)).slice(0, 2);
      await askPart(h => ART.tadpole(0, { hi: h }), id, `This glowing part is the ${P[id].name}. What is its function?`, [[id, P[id].job], ...wrong.map(w => [w, P[w].job])], id, P[id].says || P[id].k);
    }
    await order("Now put the frog's life cycle in order.", LIFE, "Eggs, tadpole, tadpole with legs, froglet, frog. Every frog goes through this cycle.");
    solved("g3", "You learned how CT scanners see inside, sliced through a tadpole, compared cartoon and real CT slices, matched structures to their functions, and ordered the life cycle.");
  };
  PLAY.g4 = async function () {
    // How messages travel: sense organ, to the brain, and back out to a muscle.
    const STEPS = [
      { hi: null, t: "1. A {stimulus}", d: "Something happens: a shadow passes over the pond. A stimulus is anything an animal can sense." },
      { hi: "eye", t: "2. A {sensory}", d: "Cells in the eye detect the change in light." },
      { hi: "eye", t: "3. {sensoryn|Sensory neurons}", d: "Nerve cells carry the message along the optic nerve to the brain, as tiny electrical signals." },
      { hi: "brain", t: "4. The {brain}", d: "The brain decides: danger! Swim away!" },
      { hi: "cord", t: "5. The {cord}", d: "The message travels down the spinal cord toward the tail." },
      { hi: "muscle", t: "6. {motorn|Motor neurons}", d: "Nerve cells carry the message out of the spinal cord to the tail muscles." },
      { hi: "muscle", t: "7. A {response}", d: "The tail muscles contract and the tadpole darts away. The action is the response." }
    ];
    await new Promise(res => {
      let n = 0;
      const draw = () => {
        const st = STEPS[n];
        screen(`${head("How do messages travel in the body?", "Messages travel from a sense organ to the brain, and back out to a muscle. Tap Next step to follow one.")}
          <div class="tp-pic tp-small tp-hipic">${ART.tadpole(0, { hi: st.hi })}${n === 0 ? `<svg class="tp-shadow" viewBox="0 0 420 220" aria-hidden="true"><ellipse cx="160" cy="18" rx="120" ry="14" fill="#2a2233" opacity=".35"/></svg>` : ""}</div>
          <ol class="tp-flow">${STEPS.map((x, i) => `<li class="${i < n ? "done" : i === n ? "now" : ""}">${i <= n ? `<b>${rich(x.t)}</b>${i === n ? `<span>${esc(x.d)}</span>` : ""}` : "<b>?</b>"}</li>`).join("")}</ol>
          <div class="tp-row">${btn("step", `${UI.go}<span>${n < STEPS.length - 1 ? "Next step" : "Next"}</span>`, "tp-go", " data-focus")}</div>`, { step: () => { n++; if (n >= STEPS.length) res(); else draw(); } });
        say(`${plain(st.t).replace(/^\d+\. /, "")}. ${st.d}`);
      };
      draw();
    });
    await tapParts(() => ART.tadpole(0, { parts: true }), [
      ["eye", "Your turn! A shadow passes over the pond. First, tap the {sensory} that detects it.", "The eye detects it."],
      ["brain", "{sensoryn|Sensory neurons} carry the message along the optic nerve. Tap where the message goes.", "The brain decides: danger! Swim away!"],
      ["cord", "Tap the part that carries the brain's message down the body.", "The spinal cord carries the message toward the tail."],
      ["muscle", "{motorn|Motor neurons} carry the message out to the part that does the swimming. Tap it.", "The tail muscles contract, and the tadpole darts away."]
    ]);
    await slicer("tadpole", ["brain", "cord"], 0, "In a CT slice, the nervous system shows up too. Find the brain and spinal cord in this cartoon slice.");
    await ctCompare("tadpole");
    await order("Put the escape in order.", [{ t: "Stimulus: the eye detects a shadow" }, { t: "Sensory neurons carry the message to the brain" }, { t: "The brain decides to escape" }, { t: "The spinal cord carries the message toward the tail" }, { t: "Motor neurons signal the tail muscles" }, { t: "Response: the tail muscles swim away" }], "Stimulus, sense organ, sensory neurons, brain, spinal cord, motor neurons, muscle, response.");
    await choose("A fish uses the same plan. Which part of the fish does the same job as the tadpole's eye?", [["eye", "The fish's eye"], ["gills", "The fish's gills"], ["bladder", "The fish's swim bladder"]], "eye", "Fish and tadpoles both sense light with their eyes and send messages to the brain.", `<div class="tp-pic tp-small">${ART.fish()}</div>`);
    solved("g4", "You followed a message from a stimulus, through the senses, brain, and spinal cord, out to the muscles for a response.");
  };
  PLAY.g5 = async function () {
    screen(`${head("Unroll the intestine!", "Slide to stretch out the tadpole's coiled {intestine} and compare it with its body.")}
      <div class="tp-pic tp-small">${ART.tadpole(0)}</div>
      <svg class="tp-gutbar" viewBox="0 0 420 70" role="img" aria-label="Intestine length compared with body length"><g stroke="#2a2233" stroke-width="3"><rect x="10" y="8" width="60" height="16" rx="8" fill="#cfe3a3"/><text x="78" y="22" font-size="14" stroke="none" fill="#2a2233">body</text><rect id="tp-gutr" x="10" y="38" width="10" height="16" rx="8" fill="#f0b46a"/></g></svg>
      <label class="tp-range"><span id="tp-gx">Intestine</span><input type="range" min="0" max="100" value="0" id="tp-g" data-focus aria-label="Unroll the intestine"></label>
      <div class="tp-row" id="tp-gok" hidden>${btn("next", `${UI.go}<span>Next</span>`, "tp-go")}</div>`, {});
    await new Promise(res => {
      acts.next = res;
      const r = $("tp-g"); let told = false;
      r.addEventListener("input", () => { $("tp-gutr").setAttribute("width", 10 + r.value * 3.9); $("tp-gx").textContent = `${(1 + r.value / 100 * 5.5).toFixed(1)}× body`; if (r.value > 95 && !told) { told = true; $("tp-gok").hidden = false; say("Wow! Unrolled, the intestine is several times longer than the tadpole's whole body."); } });
      say("Unroll the intestine! Slide to stretch out the tadpole's coiled intestine.");
    });
    await choose("Why does a tadpole, an {herbivore}, need such a long intestine?", [["plant", "Algae is tough plant food, and takes a long time to digest"], ["meat", "It eats big animals whole"], ["air", "It stores air for swimming"]], "plant", "Plant eaters need long intestines to get the energy out of tough plant food. This is called digestion.");
    await choose("The froglet's intestine gets much shorter. What does a frog eat?", [["bugs", "Insects and other small animals"], ["algae", "More algae"], ["nothing", "Nothing at all"]], "bugs", "Frogs are carnivores. Meat is easier to digest, so frogs have a shorter intestine. Their bodies change to match their new food.", `<div class="tp-pic tp-small">${ART.tadpole(3)}</div>`);
    await order("Follow the energy, starting where it first comes from.", [{ t: "Sun" }, { t: "Algae" }, { t: "Tadpole" }, { t: "Fish" }, { t: "River otter" }], "The Sun's energy is captured by algae, then passes to the tadpole, the fish, and the otter.");
    // Energy levels: only about a tenth passes up each step.
    const LV = [["Algae", "producer", 10000, "#3aa65b"], ["Tadpole", "consumer (herbivore)", 1000, "#8a7a3a"], ["Fish", "consumer (carnivore)", 100, "#3a8dde"], ["River otter", "consumer (carnivore)", 10, "#7a4a2a"]];
    await lesson(`${head("How much energy moves up the food chain?", "Each step is a {trophic}. Algae, the {producer}, capture energy from sunlight. When a {consumer} eats, only about one tenth of the {energy} passes up to the next level. The rest is used to live and grow, and leaves as {heat}.")}
      <div class="tp-pyr" role="img" aria-label="Energy pyramid: algae 10,000 units, tadpoles 1,000, fish 100, river otter 10">${LV.slice().reverse().map(([n, r, e, c], i) => `<div class="tp-lv" style="--w:${[22, 40, 64, 96][i]}%;--c:${c}"><b>${n}</b><span>${r}</span><i>${e.toLocaleString()} energy units</i></div>`).join("")}</div>
      <p class="tp-sub">${rich("This is an {pyramid}. The numbers are an example for teaching: real ecosystems vary, but each level always holds much less energy than the one below it.")}</p>`,
      "How much energy moves up the food chain? Algae, the producer, capture energy from sunlight. When a consumer eats, only about one tenth of the energy passes up to the next level. The rest is used to live and grow, and leaves as heat. This is an energy pyramid.");
    const pyr = `<div class="tp-pyr tp-pyr-sm" aria-hidden="true">${LV.slice().reverse().map(([n, r, e, c], i) => `<div class="tp-lv" style="--w:${[22, 40, 64, 96][i]}%;--c:${c}"><b>${n}</b><i>${i === 1 ? "? units" : e.toLocaleString() + " units"}</i></div>`).join("")}</div>`;
    await choose("The tadpoles get 1,000 units of energy. About how much reaches the fish that eat them?", [["100", "About 100 units"], ["1000", "All 1,000 units"], ["2000", "About 2,000 units"]], "100", "Only about one tenth passes up: 1,000 divided by 10 is 100.", pyr);
    await choose("Where does most of the energy go at each level?", [["heat", "It is used to live and grow, and leaves as heat"], ["gone", "It disappears forever"], ["sun", "It goes back to the Sun"]], "heat", "Energy is not destroyed. Animals use it to move, grow, and keep their bodies working, and much of it leaves as heat.");
    await choose("Why are there far fewer otters than tadpoles in a pond?", [["energy", "Less energy reaches the top of the food chain"], ["big", "Otters are too big to fit"], ["cold", "Otters don't like water"]], "energy", "Each level has about one tenth of the energy of the level below, so a pond can feed only a few top predators.");
    await choose("Where did the energy in a tadpole's food first come from?", [["sun", "The Sun"], ["water", "The pond water"], ["mud", "The mud"]], "sun", "Algae use sunlight to make food. Animals get that energy by eating.");
    solved("g5", "You saw how a body fits its food, followed energy from the Sun up a food chain, and found out why only a little energy reaches the top.");
  };
  PLAY.g6 = async function () {
    const SY6 = D.SYSTEMS;
    await lesson(`${head("How is a body organized?", "Living things are built in levels. {cell|Cells} make up {tissue|tissues}. Tissues make up {organ|organs}. Organs work together in {system|organ systems}. All the systems together make the {organism}.")}
      <ol class="tp-levels"><li><b>Cell</b><span>one muscle cell</span></li><li><b>Tissue</b><span>muscle tissue</span></li><li><b>Organ</b><span>the heart</span></li><li><b>Organ system</b><span>the circulatory system</span></li><li><b>Organism</b><span>the tadpole</span></li></ol>`,
      "How is a body organized? Cells make up tissues. Tissues make up organs. Organs work together in organ systems. All the systems together make the organism.");
    // A brief lesson on each body system: tap a system to see its organs and hear what it does.
    await new Promise(res => {
      const seen = {}; let on = null;
      const draw = () => {
        const sys = {}; if (on) SY6[on].parts.forEach(id => { sys[id] = on; });
        screen(`${head("Meet the body systems", "Tap each system to see its organs light up and learn its job.")}
          <div class="tp-pic tp-small">${ART.tadpole(0, { sys })}</div>
          <div class="tp-systems">${Object.keys(SY6).map(s => btn("sys", `<i style="background:${SY6[s].color}"></i><b>${SY6[s].name}</b><span>${SY6[s].job}</span>`, "tp-sys" + (seen[s] ? " tp-seen" : "") + (on === s ? " tp-sel" : ""), ` data-s="${s}"`)).join("")}</div>
          ${nextBtn("Next", Object.keys(seen).length < 6)}`, {
          sys: el => { on = el.dataset.s; seen[on] = 1; draw(); const parts = SY6[on].parts.map(id => P[id].name).join(", "); showTerm(on).then(() => { say(`In the tadpole, the ${SY6[on].name.toLowerCase()} system includes the ${parts}.`); if (Object.keys(seen).length === 6) showNext(); }); },
          next: res
        });
      };
      draw(); say("Meet the body systems. Tap each system to see its organs light up and learn its job.");
    });
    // Highlight each organ and ask which system it belongs to.
    for (const id of shuffle(["brain", "eye", "cord", "gut", "mouth", "gills", "heart", "muscle", "noto"])) {
      await askPart(h => ART.tadpole(0, { hi: h }), id, `The glowing organ is the ${P[id].name}. Which organ system is it part of?`, Object.keys(SY6).map(s => [s, `${SY6[s].name} system: ${SY6[s].job}`]), P[id].sys, P[id].says || "");
    }
    await slicer("fish", ["bladder", "backbone"], 0, "Fish have the same body systems. Slice through this cartoon fish to find two parts the tadpole doesn't have.");
    await ctCompare("fish", true);
    await choose("A tadpole escapes from a fish. Which two systems work together most?", [["nm", "Nervous and muscular"], ["ds", "Digestive and skeletal"], ["rc", "Only the respiratory system"]], "nm", "The nervous system senses and decides, and the muscular system moves the tail.");
    await choose("The gills take in oxygen. Which system carries it to the tail muscles?", [["c", "Circulatory"], ["d", "Digestive"], ["n", "Nervous"]], "c", "The heart pumps blood that carries oxygen from the gills to every part of the body. The respiratory and circulatory systems work together.");
    solved("g6", "You learned the levels of organization and six body systems, named the system for each organ, compared cartoon and real CT slices, and saw how systems work together.");
  };

  /* ---------- top bar and settings ---------- */
  $("tp-home").innerHTML = UI.home; $("tp-say").innerHTML = UI.speak;
  $("tp-home").addEventListener("click", () => (S.grade ? (CL && S.opts.lock ? menu() : grades()) : title()));
  $("tp-say").addEventListener("click", () => { if (lastLine) say(lastLine); });
  const muteB = $("tp-mute");
  const setMute = () => { muteB.setAttribute("aria-pressed", S.mute); muteB.classList.toggle("off", S.mute); };
  muteB.addEventListener("click", () => { S.mute = !S.mute; save(); setMute(); if (S.mute) stopTalk(); });
  setMute();
  $("tp-fs").addEventListener("click", () => { if (document.fullscreenElement) document.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen().catch(() => {}); });
  function holdGear() {
    const g = $("tp-gear"); let t = 0;
    const start = e => { e.preventDefault(); g.classList.add("holding"); t = setTimeout(settings, 900); };
    const stop = () => { g.classList.remove("holding"); clearTimeout(t); };
    g.addEventListener("pointerdown", start); g.addEventListener("pointerup", stop); g.addEventListener("pointerleave", stop);
    g.addEventListener("keydown", e => { if (e.key === "Enter") settings(); });
  }
  function settings() {
    screen(`${head("Teacher settings")}<div class="tp-settings">
        <label>Lock a grade <select id="tp-lock"><option value="">No lock (children pick)</option>${D.GRADE_IDS.map(g => `<option value="${g}"${S.opts.lock === g ? " selected" : ""}>Grade ${D.GRADES[g].label}: ${esc(D.GRADES[g].title)}</option>`).join("")}</select></label>
        <label><input type="checkbox" id="tp-slow"${S.opts.slow ? " checked" : ""}> Slower voice</label>
        <label><input type="checkbox" id="tp-caps"${S.opts.caps ? " checked" : ""}> Show captions</label>
        <label><input type="checkbox" id="tp-reset"> Clear this tablet's progress</label>
      </div><div class="tp-row">${btn("ok", "Save", "tp-go", " data-focus")}</div>`, {
      ok: () => { S.opts.lock = $("tp-lock").value; S.opts.slow = $("tp-slow").checked; S.opts.caps = $("tp-caps").checked; if ($("tp-reset").checked) S.done = {}; if (S.opts.lock) S.grade = S.opts.lock; save(); title(); }
    });
  }

  if (S.grade && CL && S.opts.lock) menu(); else title();
})();
