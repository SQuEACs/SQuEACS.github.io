/* ============================================================
   SKULL DETECTIVE: a CT-scan skull game for kindergarten to
   6th grade. Five North American mustelids (river otter, mink,
   marten, fisher, badger); each grade has its own case built on
   a science standard. Everything is read aloud, with captions.
   Science words are tappable: a pop-up shows and reads the
   definition.

   Uses skull-detective-art.js (drawings) and skull-detective-data.js.
   The classroom edition sets window.SD_CLASSROOM = true first.
   ============================================================ */
(function () {
  const ART = window.SD_ART, D = window.SD_DATA, SK = D.SKULLS, TERMS = D.TERMS;
  const CL = !!window.SD_CLASSROOM;
  const $ = id => document.getElementById(id);
  const root = $("sd-stage"); if (!root) return;
  const view = $("sd-view"), cap = $("sd-cap");
  const SAVE_KEY = CL ? "squeacs-skull-detective-classroom" : "squeacs-skull-detective";
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nm = id => SK[id].name, the = id => "the " + nm(id);
  const short = id => cap1(nm(id).replace("American ", ""));
  const PH = {
    yes: ["Yes!", "You got it!", "That's right!", "Great detective work!", "Nice work!", "Spot on!"],
    no: ["Not quite. Try again!", "Hmm, not that one. Have another look.", "Good guess, but no. Try again!", "Look again, detective."],
    solved: ["Case closed!", "Mystery solved!", "You cracked the case!", "Super sleuthing!"]
  };

  /* ---------- science words: {key} or {key|shown words} ---------- */
  const TERM_RE = /\{(\w+)(?:\|([^}]*))?\}([.,!?;:)]*)/g;
  const plain = s => String(s).replace(TERM_RE, (m, k, alt, p) => (alt || (TERMS[k] ? TERMS[k].t : k)) + p);
  /* Photo of the real animal with the game's drawing beside it, so kids link the two */
  const animalPic = (id, w) => { const sp = SK[id];
    return `<div class="sd-meet-pic">${sp.photo ? `<figure class="sd-photo"><img src="${esc(sp.photo.src)}" alt="Photo of ${esc(the(id))}"><figcaption>${sp.photo.credit}</figcaption></figure><figure class="sd-drawn">${ART.animal(sp, w)}<figcaption>In the game, ${esc(the(id))} looks like this.</figcaption></figure>` : ART.animal(sp, w)}</div>`; };
  const rich = s => esc(s).replace(TERM_RE, (m, k, alt, p) => { const w = TERMS[k] ? `<button type="button" class="sd-term" data-act="term" data-k="${k}">${alt || TERMS[k].t}</button>` : (alt || k); return p ? `<span class="sd-nw">${w}${p}</span>` : w; });
  const firstTerm = s => { const m = /\{(\w+)/.exec(s); return m && TERMS[m[1]] ? m[1] : null; };

  /* ---------- saved progress ---------- */
  const S = Object.assign({ grade: null, done: {}, cards: {}, words: {}, mute: false, opts: { lock: "", slow: false, caps: true } }, load());
  S.words = S.words || {};
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
  // Resolves true when the line ends and the same screen is still showing. If a word pop-up
  // interrupted the line, it waits until the pop-up is closed.
  function say(text) {
    const sid = scr;
    return speak(plain(text)).then(() => (pop.hidden ? null : new Promise(r => popWaiters.push(r)))).then(() => sid === scr);
  }
  let capT = 0;
  function showCap(t) { if (!S.opts.caps) { cap.hidden = true; return; } cap.textContent = t; cap.hidden = false; clearTimeout(capT); capT = setTimeout(() => { cap.hidden = true; }, 2500 + t.length * 80); }

  /* ---------- word pop-up ---------- */
  const pop = document.createElement("div");
  pop.className = "sd-popwrap"; pop.hidden = true; root.appendChild(pop);
  let popWaiters = [], popBack = null;
  function showTerm(k) {
    const T = TERMS[k]; if (!T) return Promise.resolve();
    popBack = document.activeElement;
    pop.innerHTML = `<div class="sd-pop" role="dialog" aria-modal="true" aria-labelledby="sd-pop-t">
      <p class="sd-pop-k">Science word</p><h3 id="sd-pop-t">${esc(cap1(T.t))}</h3>${T.say ? `<p class="sd-pop-say">Say it: <b>${esc(T.say)}</b></p>` : ""}
      <p class="sd-pop-def">${esc(T.def)}</p>
      <div class="sd-row"><button type="button" class="sd-btn sd-chip" data-pop="say">${ART.UI.speak}<span>Hear it</span></button><button type="button" class="sd-btn sd-go" data-pop="close">${ART.UI.go}<span>Got it</span></button></div></div>`;
    pop.hidden = false;
    if (!S.words[k]) { S.words[k] = 1; save(); }
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
    if (b) { if (b.dataset.pop === "close") closePop(); else { const k = Object.keys(TERMS).find(x => cap1(TERMS[x].t) === pop.querySelector("h3").textContent); if (k) speak(`${TERMS[k].t}. ${TERMS[k].def}`); } }
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
  const btn = (act, inner, cls = "", extra = "") => `<button type="button" class="sd-btn ${cls}" data-act="${act}"${extra}>${inner}</button>`;
  const head = (q, sub = "") => `<div class="sd-head"><p class="sd-q">${rich(q)}</p>${sub ? `<p class="sd-sub">${rich(sub)}</p>` : ""}</div>`;
  const nextBtn = (label = "Next", hidden = false) => `<div class="sd-row" id="sd-nextrow"${hidden ? " hidden" : ""}>${btn("next", `${ART.UI.go}<span>${label}</span>`, "sd-go", hidden ? "" : " data-focus")}</div>`;
  const showNext = () => { const r = $("sd-nextrow"); if (r) { r.hidden = false; r.querySelector("button").focus({ preventScroll: true }); } };
  const flash = (el, ok) => { el.classList.remove("sd-ok", "sd-bad"); void el.offsetWidth; el.classList.add(ok ? "sd-ok" : "sd-bad"); };
  const choices = opts => `<div class="sd-choices">${opts.map(([v, t]) => btn("o", esc(plain(t)), "sd-choice", ` data-v="${v}"`)).join("")}</div>`;
  const wireParts = (act = "part") => view.querySelectorAll("[data-part]").forEach(el => { el.dataset.act = act; });

  // A skull picture: the CT render if the lab has added one, otherwise the drawing.
  function skullPic(id, view = "side", opt = {}) {
    const sp = SK[id], src = sp.ct && sp.ct[view];
    if (src && !opt.parts && !opt.brain && !opt.teeth && !opt.crest && !opt.iofHi) return `<img class="sd-ct" src="${esc(src)}" alt="CT scan of a ${esc(nm(id))} skull, ${view === "side" ? "side" : "top"} view">`;
    if (view === "top") return `<svg viewBox="-170 -10 340 320" role="img" aria-label="${esc(nm(id))} skull from above">${ART.top(sp, { L: 300 })}</svg>`;
    const hgt = sp.shape.h * 300;
    return `<svg viewBox="-20 ${-(hgt * 1.05 + 30)} 350 ${hgt * 1.05 + 30 + 130}" role="img" aria-label="${esc(nm(id))} skull from the side">${ART.side(sp, Object.assign({ L: 300 }, opt))}</svg>`;
  }
  // Close-up of the tooth row.
  const teethPic = (id, opt = {}) => `<svg viewBox="-8 -40 152 96" role="img" aria-label="Close-up of the ${esc(nm(id))}'s teeth">${ART.side(SK[id], Object.assign({ L: 300 }, opt))}</svg>`;
  const animalTile = (id, act = "pick") => btn(act, `${ART.animal(SK[id], 150)}<span>${esc(cap1(nm(id)))}</span>`, "sd-tile", ` data-id="${id}" aria-label="${esc(nm(id))}"`);

  /* ---------- title and grade picker ---------- */
  function title() {
    $("sd-home").hidden = true;
    const n = Object.keys(S.cards).length;
    screen(`<div class="sd-title">
      <div class="sd-title-art">${skullPic("otter")}</div>
      <h2 class="sd-logo"><span>Skull</span> <span>Detective</span></h2>
      <p class="sd-sub">Real CT-scanned skulls. Five members of the weasel family. One detective: you.</p>
      <div class="sd-row">${btn("play", `${ART.UI.go}<span>Play</span>`, "sd-go", " data-focus")}${btn("file", `${ART.UI.star}<span>Case file ${n}/5</span>`, "sd-chip")}${btn("restart", "Start over", "sd-chip")}</div>
      ${CL ? `<button type="button" class="sd-gear" id="sd-gear" aria-label="Teacher settings (press and hold)">${ART.UI.gear}</button>` : ""}
    </div>`, { play: () => (S.grade ? menu() : grades()), file: caseFile, restart: startOver });
    if (CL) holdGear();
    say("Skull Detective! Every skull tells a story. Tap play to start.");
  }
  // Start over: clear saved progress on this device (teacher settings and sound stay).
  function startOver() {
    $("sd-home").hidden = false;
    screen(`${head("Start over?", "This clears your grade, solved cases, skull cards, and science words on this device.")}
      <div class="sd-row">${btn("yes", "Yes, start over", "sd-go")}${btn("no", "No, go back", "sd-chip", " data-focus")}</div>`, {
      yes: () => { S.grade = CL && S.opts.lock ? S.opts.lock : null; S.done = {}; S.cards = {}; S.words = {}; save(); title(); },
      no: () => (S.grade ? menu() : title())
    });
    say("Start over? This clears your grade, solved cases, skull cards, and science words. Tap yes to start over, or no to go back.");
  }
  function grades() {
    $("sd-home").hidden = false;
    screen(`${head("Pick your grade")}
      <div class="sd-grades">${D.GRADE_IDS.map(g => btn("g", `<b>${D.GRADES[g].label}</b><span>${esc(D.GRADES[g].title)}</span>${S.done[g] ? `<i class="sd-stamp">${ART.UI.star}</i>` : ""}`, "sd-grade", ` data-g="${g}" aria-label="Grade ${D.GRADES[g].label}: ${esc(D.GRADES[g].title)}"`)).join("")}</div>`,
      { g: el => { S.grade = el.dataset.g; save(); menu(); } });
    say("Pick your grade.");
  }
  function menu() {
    $("sd-home").hidden = false;
    const G = D.GRADES[S.grade];
    screen(`<div class="sd-intro">${head(`Grade ${G.label}: ${G.title}`, G.say.replace(/^[^.]*\.\s*/, ""))}
      <div class="sd-row">${btn("start", `${ART.UI.lens}<span>Open the case</span>`, "sd-go", " data-focus")}${CL && S.opts.lock ? "" : btn("grades", "Change grade", "sd-chip")}${btn("restart", "Start over", "sd-chip")}</div>
      <p class="sd-std">Standards: ${esc(G.std)}</p></div>`,
      { start: () => meet(() => PLAY[S.grade]()), grades, restart: startOver });
    say(G.say + " Tap open the case.");
  }
  function solved(g, msg) {
    S.done[g] = true; save();
    screen(`<div class="sd-done"><div class="sd-big-star">${ART.UI.star}</div>${head(pick(PH.solved), msg)}
      <div class="sd-row">${btn("again", "Play again", "sd-chip")}${btn("file", `${ART.UI.star}<span>Case file</span>`, "sd-chip")}${CL && S.opts.lock ? "" : btn("grades", `${ART.UI.go}<span>Another grade</span>`, "sd-go", " data-focus")}</div></div>`,
      { again: () => PLAY[g](), file: caseFile, grades });
    say(pick(PH.solved) + " " + msg);
  }
  function unlock(id) { if (!S.cards[id]) { S.cards[id] = true; save(); } }
  function caseFile() {
    $("sd-home").hidden = false;
    const words = Object.keys(S.words).filter(k => TERMS[k]).sort((a, b) => TERMS[a].t.localeCompare(TERMS[b].t));
    screen(`${head("Case file", "Solve cases to collect all five skull cards. Tap a science word to review it.")}
      <div class="sd-cards">${D.IDS.map(id => S.cards[id] ? `<div class="sd-card"><div class="sd-card-pic">${ART.card(SK[id])}</div>${ART.animal(SK[id], 150)}<b>${esc(cap1(nm(id)))}</b><i>${esc(SK[id].sci)}</i><p>${esc(SK[id].fact)}</p></div>` : `<div class="sd-card sd-locked" aria-label="Locked card"><div class="sd-card-pic">?</div></div>`).join("")}</div>
      <div class="sd-words"><h4>Science words you have learned: ${words.length}</h4><p>${words.map(k => rich(`{${k}}`)).join(" ") || "Tap a highlighted word in any case to learn it."}</p></div>
      <div class="sd-row">${btn("back", "Back", "sd-chip", " data-focus")}</div>`, { back: () => (S.grade ? menu() : title()) });
    say(`You have ${Object.keys(S.cards).length} of 5 skull cards and ${words.length} science words.`);
  }

  /* ---------- meet the animals (before every case) ---------- */
  function meet(then) {
    let i = -1;
    const card = () => {
      if (i >= D.IDS.length) return then();
      if (i < 0) {
        screen(`${head("Meet the mustelids", "In this case you will study the skulls of five {mustelid|mustelids}: members of the weasel family. Most people have never seen a marten or a fisher, so let's meet all five animals first!")}
          <div class="sd-herd">${D.IDS.map(id => `<figure>${ART.animal(SK[id], 170)}<figcaption>${esc(cap1(nm(id)))}</figcaption></figure>`).join("")}</div>
          <div class="sd-row">${btn("next", `${ART.UI.go}<span>Meet them</span>`, "sd-go", " data-focus")}${btn("skip", "Skip to the case", "sd-chip")}</div>`, { next: () => { i++; card(); }, skip: then });
        say("Meet the mustelids! In this case you will study the skulls of five mustelids, members of the weasel family. Most people have never seen a marten or a fisher, so let's meet them first.");
        return;
      }
      const id = D.IDS[i], sp = SK[id], last = i === D.IDS.length - 1;
      screen(`<div class="sd-meet"><p class="sd-meet-n">Animal ${i + 1} of ${D.IDS.length}</p>
        ${animalPic(id, 360)}
        <div class="sd-meet-txt"><h3>${esc(cap1(nm(id)))} <i>${esc(sp.sci)}</i></h3><p>${rich(sp.intro)}</p>
          <dl><dt>Lives</dt><dd>${esc(sp.lives)}</dd>${young() ? "" : `<dt>Size</dt><dd>${esc(sp.size)}</dd>`}<dt>Eats</dt><dd>${esc(sp.eats)}</dd></dl></div></div>
        <div class="sd-row">${btn("next", `${ART.UI.go}<span>${last ? "Start the case" : "Next animal"}</span>`, "sd-go", " data-focus")}${last ? "" : btn("skip", "Skip", "sd-chip")}</div>`, { next: () => { i++; card(); }, skip: then });
      say(`This is the ${nm(id)}. ${sp.intro} It lives in ${sp.lives.charAt(0).toLowerCase() + sp.lives.slice(1)} It eats ${sp.eats.charAt(0).toLowerCase() + sp.eats.slice(1)}`);
    };
    card();
  }

  /* ---------- how CT works (grade 3) and the scanner reveal (grades 3 and 4) ---------- */
  function scanner(id, then, g4) {
    const sp = SK[id], hgt = sp.shape.h * 300, vb = `-20 ${-(hgt * 1.05 + 30)} 350 ${hgt * 1.05 + 160}`;
    const q = g4 ? "Look inside with a {ct}" : "Step 3: slices make a 3D model";
    const sub = g4 ? "A CT scan lets scientists look inside the {braincase} without breaking the skull. Slide the scanner to see the {endocast}: the shape of the brain that once filled the skull." : "The computer turns the X-ray pictures into hundreds of thin {slice|slices}, like slices of a loaf of bread, and stacks them into a 3D model. Slide through the slices to see inside the skull.";
    screen(`${head(q, sub)}
      <div class="sd-scan"><svg viewBox="${vb}" role="img" aria-label="Skull with the inside revealed where the scanner has passed">
        <defs><clipPath id="sd-clip"><rect id="sd-cliprect" x="-20" y="-400" width="0" height="800"/></clipPath></defs>
        ${ART.side(sp, { L: 300 })}<g clip-path="url(#sd-clip)"><rect x="-20" y="-400" width="400" height="800" fill="#1f2a44"/><g class="sd-xray">${ART.side(sp, { L: 300, brain: true })}</g></g>
        <rect id="sd-beam" x="-20" y="-400" width="6" height="800" fill="#2ed3c6" opacity=".8"/></svg>
      <label class="sd-range"><span>Slices</span><input type="range" min="0" max="100" value="0" id="sd-scanr" data-focus aria-label="Move through the slices"></label></div>
      ${nextBtn("Next", true)}`, { next: then });
    const r = $("sd-scanr"), rect = $("sd-cliprect"), beam = $("sd-beam");
    let told = false;
    r.addEventListener("input", () => {
      const x = -20 + r.value / 100 * 370; rect.setAttribute("width", x + 20); beam.setAttribute("x", x - 3);
      if (r.value > 85 && !told) { told = true; showNext(); say(g4 ? "Now you can see the endocast. It shows the parts of the brain. Tap next to learn their names." : "Now you can see inside! The pink shape is the space where the brain was, and the yellow part is for smelling. Scientists can measure every part of the 3D model on a computer."); }
    });
    say(plain(q) + ". " + plain(sub));
  }
  function ctLesson(then) {
    const id = pick(D.IDS), sp = SK[id];
    const xray = () => {
      screen(`${head("Step 1: X-rays", "How can scientists see inside a skull without breaking it? They use {xray|X-rays}: invisible light with lots of energy. X-rays pass through skin and air, but dense bone blocks more of them. The bone makes a shadow on the detector, like your shadow on a sunny day.")}
        <div class="sd-ctdiag"><svg viewBox="0 0 420 200" role="img" aria-label="An X-ray tube shines X-rays through a skull onto a detector, where the bone makes a shadow">
          <rect x="6" y="70" width="58" height="60" rx="10" fill="#6b6f7a" stroke="#2a2233" stroke-width="3"/><circle cx="64" cy="100" r="9" fill="#9fe9ff" stroke="#2a2233" stroke-width="3"/>
          <text x="35" y="152" class="sd-dlab">X-ray tube</text>
          <g stroke="#2ed3c6" stroke-width="2" opacity=".8" class="sd-rays">${[-50, -30, -10, 10, 30, 50].map(d => `<path d="M 70 100 L 352 ${100 + d * 1.6}"/>`).join("")}</g>
          <g transform="translate(150 60) scale(.27)">${ART.top(sp, { L: 300, cx: 0, y: 0 })}</g>
          <rect x="352" y="12" width="22" height="176" rx="4" fill="#1f2a44" stroke="#2a2233" stroke-width="3"/><rect x="354" y="70" width="18" height="60" fill="#f3f0e6" opacity=".85"/>
          <text x="363" y="200" class="sd-dlab">detector</text></svg></div>
        ${nextBtn()}`, { next: rotate });
      say("Step 1: X-rays. How can scientists see inside a skull without breaking it? They use X-rays, invisible light with lots of energy. X-rays pass through skin and air, but dense bone blocks more of them, so the bone makes a shadow on the detector.");
    };
    const rotate = () => {
      screen(`${head("Step 2: pictures from every side", "One X-ray picture is flat, like a shadow. In the lab's micro-{ct|CT scanner}, the skull sits on a stage that turns a tiny bit at a time. After each turn, the scanner takes another X-ray picture. Turn the stage all the way around.")}
        <div class="sd-ctdiag"><svg viewBox="-210 -40 420 210" role="img" aria-label="A skull turning on a stage between the X-ray tube and the detector">
          <rect x="-206" y="21" width="40" height="44" rx="8" fill="#6b6f7a" stroke="#2a2233" stroke-width="3"/>
          <g stroke="#2ed3c6" stroke-width="2" opacity=".7">${[-40, -20, 0, 20, 40].map(d => `<path d="M -166 43 L 178 ${43 + d * 1.6}"/>`).join("")}</g>
          <circle cx="0" cy="43" r="82" fill="#e3ddd0" stroke="#2a2233" stroke-width="3"/><text x="0" y="150" class="sd-dlab">turning stage</text>
          <g id="sd-rot" transform="rotate(0 0 43)"><g transform="translate(0 -20) scale(.42)">${ART.top(sp, { L: 300, cx: 0, y: 0 })}</g></g>
          <rect x="178" y="-10" width="20" height="150" rx="4" fill="#1f2a44" stroke="#2a2233" stroke-width="3"/></svg>
        <p class="sd-found" id="sd-count" aria-live="polite">X-ray pictures taken: 0</p>
        <label class="sd-range"><span>Turn</span><input type="range" min="0" max="360" value="0" id="sd-turn" data-focus aria-label="Turn the stage, in degrees"></label></div>
        ${nextBtn("Next", true)}`, { next: () => scanner(id, check) });
      const r = $("sd-turn"); let told = false;
      r.addEventListener("input", () => {
        const deg = +r.value, n = Math.round(deg / 360 * 1800);
        $("sd-rot").setAttribute("transform", `rotate(${deg} 0 43)`);
        $("sd-count").textContent = `X-ray pictures taken: ${n.toLocaleString()}`;
        r.setAttribute("aria-valuetext", `${deg} degrees, ${n} pictures`);
        if (deg >= 350 && !told) { told = true; showNext(); say("All the way around! The scanner took about 1,800 X-ray pictures, each from a slightly different side."); }
      });
      say("Step 2: pictures from every side. In the lab's micro CT scanner, the skull sits on a stage that turns a tiny bit at a time, and the scanner takes an X-ray picture after each turn. Turn the stage all the way around.");
    };
    const check = () => {
      const opts = shuffle([["dense", "Bone is dense, so it blocks more X-rays than skin does"], ["glow", "Bone glows in the dark"], ["paint", "Scientists paint the bones first"]]);
      screen(`${head("Quick check: why does bone show up in an X-ray picture?")}${choices(opts)}`, {
        o: el => { if (el.dataset.v === "dense") { el.classList.add("sd-ok"); say("Yes! Dense bone blocks more X-rays, so it makes a shadow. A CT scan is computed tomography: the computer puts hundreds of these pictures together into slices and a 3D model.").then(ok => ok && then()); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say("Quick check. Why does bone show up in an X-ray picture? " + opts.map(o => o[1]).join(". Or, ") + "?");
    };
    xray();
  }

  /* ================= grade cases ================= */
  const PLAY = {};

  // K: find the parts of a skull (with their science names), then name the animal.
  PLAY.k = function () {
    const ids = shuffle(D.IDS).slice(0, 3); let i = 0;
    const round = () => {
      if (i >= ids.length) return solved("k", "You found the orbits, nasal openings, braincases, and teeth on three skulls. Those are real science words!");
      const id = ids[i++], parts = shuffle(["eye", "nose", "teeth", "brain", "ear"]).slice(0, 2); let p = 0;
      const ask = () => {
        if (p >= parts.length) return who(id);
        const part = D.PARTS[parts[p]];
        screen(`${head(part.ask)}<div class="sd-skull sd-tap">${skullPic(id, "side", { parts: true })}</div>`, {});
        say(part.ask);
        wireParts();
        acts.part = el => {
          const got = el.dataset.part;
          if (got === parts[p]) { view.querySelectorAll(`[data-part="${got}"]`).forEach(x => x.classList.add("sd-lit")); p++; say(pick(PH.yes) + " " + part.does).then(ok => ok && ask()); }
          else if (D.PARTS[got]) { flash(el, false); say(`That is the ${D.PARTS[got].name}, the ${D.PARTS[got].plain}. ${part.ask}`); }
          else say(part.ask);
        };
      };
      ask();
    };
    const who = id => {
      const opts = shuffle([id, pick(D.IDS.filter(x => x !== id))]);
      screen(`${head("Whose skull is this?", "Clue: " + SK[id].clues[0])}<div class="sd-skull sd-small">${skullPic(id)}</div><div class="sd-row">${opts.map(o => animalTile(o)).join("")}</div>`, {
        pick: el => {
          if (el.dataset.id === id) { unlock(id); say(`Yes! It's ${the(id)}. ${SK[id].intro}`).then(ok => ok && round()); el.classList.add("sd-ok"); }
          else { flash(el, false); say(`Not the ${nm(el.dataset.id)}. Listen: ${SK[id].clues[0]}`); }
        }
      });
      say(`Whose skull is this? Is it ${the(opts[0])}, or ${the(opts[1])}? Here's a clue. ${SK[id].clues[0]}`);
    };
    round();
  };

  // 1st: classify skulls by job, then copy a skull's shape to build something (biomimicry).
  const BUILD = {
    boat: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="5" stroke-linejoin="round"><path d="M10 60 H90 L76 80 H24Z" fill="#c2552a"/><path d="M50 60 V20 L74 54Z" fill="#fff"/><path d="M4 88 q12 -8 24 0 t24 0 t24 0 t24 0" fill="none" stroke="#3aa0e0"/></g></svg>`,
    shovel: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="5" stroke-linejoin="round"><path d="M50 8 V56" stroke-width="9"/><path d="M30 56 H70 V74 Q50 96 30 74Z" fill="#8f8a80"/><rect x="38" y="4" width="24" height="10" rx="5" fill="#ffd23f"/></g></svg>`,
    ladder: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="6" stroke-linecap="round"><path d="M30 8 V92 M70 8 V92 M30 24 H70 M30 44 H70 M30 64 H70 M30 84 H70" stroke="#9a6a35"/></g></svg>`,
    helmet: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="5" stroke-linejoin="round"><path d="M14 66 Q14 20 50 20 Q86 20 86 66Z" fill="#2ed3c6"/><path d="M8 66 H92" stroke-width="8"/></g></svg>`
  };
  const JOBICON = { swimmer: "river", climber: "trees", biter: "forest", digger: "grassland" };
  PLAY.g1 = function () {
    const ids = shuffle(D.IDS); let i = 0;
    const sortOne = () => {
      if (i >= ids.length) return copy(0);
      const id = ids[i++];
      screen(`${head(`{classify|Classify} the ${nm(id)}: how does it hunt?`, "Skull clues: " + SK[id].clues[0] + " " + SK[id].clues[1])}
        <div class="sd-pair"><div class="sd-skull sd-small">${skullPic(id)}</div>${ART.animal(SK[id], 220)}</div>
        <div class="sd-row">${Object.keys(D.JOBS).map(j => btn("job", `${ART.habitat(JOBICON[j])}<span>${D.JOBS[j].name}</span>`, "sd-tile sd-hab", ` data-j="${j}"`)).join("")}</div>`, {
        job: el => {
          if (el.dataset.j === SK[id].job) { el.classList.add("sd-ok"); unlock(id); say(`${pick(PH.yes)} The ${nm(id)} ${D.JOBS[SK[id].job].say}. ${SK[id].clues[2]}`).then(ok => ok && sortOne()); }
          else { flash(el, false); say(`Hmm. ${SK[id].clues[0]} ${SK[id].clues[1]}`); }
        }
      });
      say(`This is the skull of ${the(id)}. ${SK[id].clues[0]} ${SK[id].clues[1]} How does it hunt? In water, in trees, after big prey, or by digging?`);
    };
    const Q = [
      { id: "otter", q: "Engineers copy animals! This is called {biomimicry}. The otter's flat, smooth {cranium} slips through water. What could you build with that shape?", a: "boat", opts: ["boat", "ladder", "shovel"], yes: "A boat! Its smooth, flat front slips through the water, just like an otter's head." },
      { id: "badger", q: "The badger's wide, strong {skull} pushes through dirt. What could you build that works the same way?", a: "shovel", opts: ["helmet", "shovel", "boat"], yes: "A shovel! Strong and wide for pushing dirt, like a badger's head and claws." }
    ];
    const copy = k => {
      if (k >= Q.length) return solved("g1", "You classified all five mustelids by how they hunt, using clues from their skulls, and used biomimicry to invent new things.");
      const q = Q[k];
      screen(`${head(q.q)}<div class="sd-skull sd-small">${skullPic(q.id)}</div>
        <div class="sd-row">${q.opts.map(o => btn("b", `${BUILD[o]}<span>${cap1(o)}</span>`, "sd-tile", ` data-o="${o}"`)).join("")}</div>`, {
        b: el => { if (el.dataset.o === q.a) { el.classList.add("sd-ok"); say(q.yes).then(ok => ok && copy(k + 1)); } else { flash(el, false); say(`A ${el.dataset.o}? Think about what the ${nm(q.id)} does with its head. Try again!`); } }
      });
      say(q.q + " A " + q.opts.join(", a ") + "?");
    };
    sortOne();
  };

  // 2nd: clues from the skull (teeth, orbits, jaws) point to what the animal eats.
  PLAY.g2 = function () {
    const ids = shuffle(D.IDS); let i = 0;
    const dietBtn = id => btn("d", `<span class="sd-diet-pics">${D.DIETS[id].foods.map(f => ART.icon(f)).join("")}</span><span>${esc(D.DIETS[id].name)}</span>`, "sd-tile sd-diet", ` data-id="${id}"`);
    const one = () => {
      if (i >= ids.length) return solved("g2", "You used teeth, orbits, and jaws as evidence to figure out what all five mustelids eat. Same family, five different diets!");
      const id = ids[i++], opts = shuffle([id, ...shuffle(D.IDS.filter(x => x !== id)).slice(0, 2)]); let c = 0;
      const draw = () => {
        screen(`${head("What does this animal eat?", `Skull clue ${c + 1}: ${SK[id].clues[c]}`)}
          <div class="sd-skull sd-small">${skullPic(id)}</div>
          <div class="sd-row">${opts.map(dietBtn).join("")}</div>
          ${c < 2 ? `<div class="sd-row">${btn("more", "Another clue", "sd-chip")}</div>` : ""}`, {
          d: el => {
            if (el.dataset.id === id) {
              unlock(id);
              screen(`<div class="sd-reveal">${animalPic(id, 300)}${head(`It's ${the(id)}!`, `It eats ${SK[id].eats.charAt(0).toLowerCase() + SK[id].eats.slice(1)} ${SK[id].fact}`)}</div>${nextBtn()}`, { next: one });
              say(`${pick(PH.yes)} It's ${the(id)}. It eats ${SK[id].eats.charAt(0).toLowerCase() + SK[id].eats.slice(1)} ${SK[id].fact}`);
            } else { flash(el, false); if (c < 2) { c++; draw(); say("Not quite. Here's another skull clue. " + SK[id].clues[c]); } else say(pick(PH.no)); }
          },
          more: () => { c++; draw(); say(SK[id].clues[c]); }
        });
      };
      draw(); say(`What does this animal eat? ${SK[id].clues[0]} Is it ${opts.map(o => D.DIETS[o].name).join(", or ")}?`);
    };
    one();
  };

  // 3rd: how CT works; measure skull length, orbit width, and canine height; make a graph; use the evidence.
  const TRAIT = {
    len: { name: "skull length", title: "Skull length", PX: 2.4, max: 140, tol: 4, how: "Slide the {caliper} until its jaw just touches the back of the {skull}." },
    orbit: { name: "orbit width", title: "Orbit width", PX: 14, max: 20, tol: 1, how: "Zoomed in on the {orbit}. Slide the {caliper} until it touches the back edge of the eye socket." },
    canine: { name: "canine height", title: "Canine height", PX: 12, max: 16, tol: 1, how: "Zoomed in on the upper {canine}. Slide the {caliper} down from the gum line to the tip of the tooth." }
  };
  const TK = ["len", "orbit", "canine"];
  PLAY.g3 = function () {
    const ids = shuffle([pick(["badger", "fisher", "otter"]), pick(["mink", "marten"])]), meas = {}, graphed = [];
    const jobs = []; ids.forEach(id => TK.forEach(k => jobs.push([id, k])));
    let j = 0;
    const caliper = (id, k, then) => {
      const sp = SK[id], T = TRAIT[k], real = sp[k], PX = T.PX, L = sp.len * PX, vert = k === "canine";
      let art, vb, x0, y0, ruler = "", jaw = v => "";
      const tick = (mm, a, b) => mm % (k === "len" ? 50 : 5) === 0;
      if (k === "len") {
        x0 = 20; const hgt = sp.shape.h * L, top = -(hgt * 1.1 + 10), base = 40;
        art = ART.side(sp, { L, x: 20, y: 0, lw: 300 });
        for (let mm = 0; mm <= T.max; mm += 10) ruler += `<path d="M ${x0 + mm * PX} ${base} v ${tick(mm) ? 12 : 6}"/>` + (tick(mm) ? `<text x="${x0 + mm * PX}" y="${base + 26}">${mm}</text>` : "");
        ruler = `<path d="M ${x0} ${base} H ${x0 + T.max * PX}"/>` + ruler;
        jaw = v => `M ${x0 + v * PX} ${top} V ${base}`; vb = `0 ${top - 4} 360 ${base + 40 - top}`;
      } else if (k === "orbit") {
        const G = ART.geo(sp, { L, x: 0, y: 0 }); x0 = G.ox - G.orx;
        const base = G.oy - G.ory - 26, bot = G.oy + G.ory + 16;
        art = ART.side(sp, { L, x: 0, y: 0, lw: 320 });
        for (let mm = 0; mm <= T.max; mm++) ruler += `<path d="M ${x0 + mm * PX} ${base} v ${tick(mm) ? -14 : -7}"/>` + (tick(mm) ? `<text x="${x0 + mm * PX}" y="${base - 20}">${mm}</text>` : "");
        ruler = `<rect x="${x0 - 22}" y="${base - 46}" width="${T.max * PX + 44}" height="50" rx="8" fill="#fff" opacity=".92" stroke="none"/><path d="M ${x0} ${base} H ${x0 + T.max * PX}"/>` + ruler;
        jaw = v => `M ${x0 + v * PX} ${base} V ${bot}`; vb = `${x0 - 30} ${base - 52} ${T.max * PX + 60} ${bot + 12 - base + 52}`;
      } else {
        const G = ART.geo(sp, { L, x: 0, y: 0 }); y0 = G.B; const rx = .105 * L + 14, left = .015 * L;
        art = ART.side(sp, { L, x: 0, y: 0, lw: 320 });
        for (let mm = 0; mm <= T.max; mm++) ruler += `<path d="M ${rx} ${y0 + mm * PX} h ${tick(mm) ? 14 : 7}"/>` + (tick(mm) ? `<text x="${rx + 32}" y="${y0 + mm * PX + 5}">${mm}</text>` : "");
        ruler = `<rect x="${rx - 6}" y="${y0 - 14}" width="56" height="${T.max * PX + 28}" rx="8" fill="#fff" opacity=".92" stroke="none"/><path d="M ${rx} ${y0} V ${y0 + T.max * PX}"/>` + ruler;
        jaw = v => `M ${left} ${y0 + v * PX} H ${rx}`; vb = `${left - 20} ${y0 - 60} ${rx + 76 - left} ${T.max * PX + 84}`;
      }
      const fixed = jaw(0);
      screen(`${head(`Measure the ${nm(id)}'s ${T.name}`, T.how)}
        <div class="sd-measure${vert ? " sd-tall" : ""}"><svg viewBox="${vb}" role="img" aria-label="${esc(nm(id))} skull with a ruler in millimeters">${art}
          <g class="sd-ruler" stroke="#2a2233" stroke-width="2">${ruler}</g>
          <path d="${fixed}" stroke="#c2552a" stroke-width="4"/><path id="sd-jaw" d="${fixed}" stroke="#c2552a" stroke-width="4"/></svg>
        <label class="sd-range"><span id="sd-mm">0 mm</span><input type="range" min="0" max="${T.max}" value="0" id="sd-cal" data-focus aria-label="Caliper, in millimeters"></label></div>
        <div class="sd-row">${btn("check", "Check", "sd-go")}</div>
        <p class="sd-std">Measurement ${j} of ${jobs.length}</p>`, {
        check: () => {
          const v = +$("sd-cal").value;
          if (Math.abs(v - real) <= T.tol) { meas[id] = meas[id] || {}; meas[id][k] = real; say(`${pick(PH.yes)} The ${nm(id)}'s ${T.name} is about ${real} millimeters.`).then(ok => ok && then()); }
          else say(v < real ? "Not touching yet. Slide a little farther." : "Too far! The caliper should just touch the bone. Slide back a little.");
        }
      });
      const r = $("sd-cal"), jw = $("sd-jaw"), out = $("sd-mm");
      r.addEventListener("input", () => { jw.setAttribute("d", jaw(+r.value)); out.textContent = r.value + " mm"; r.setAttribute("aria-valuetext", r.value + " millimeters"); });
      say(`Measure the ${nm(id)}'s ${T.name}. ${T.how}` + (j === 1 ? " Scientists measure in millimeters. Ten millimeters make one centimeter." : ""));
    };
    const next = () => {
      if (j >= jobs.length) { ids.forEach(unlock); return table(); }
      const [id, k] = jobs[j++]; caliper(id, k, next);
    };
    const tableHtml = (hi) => `<div class="sd-table-wrap"><table class="sd-table sd-data"><caption>Skull measurements (millimeters)</caption><thead><tr><th>Animal</th>${TK.map(k => `<th${hi === k ? ' class="hi"' : ""}>${TRAIT[k].title}</th>`).join("")}</tr></thead>
      <tbody>${D.IDS.map(id => `<tr><td>${esc(short(id))}</td>${TK.map(k => `<td class="${meas[id] && meas[id][k] ? "mine" : ""}${hi === k ? " hi" : ""}">${SK[id][k]}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const table = () => {
      screen(`${head("Your data table", "Orange numbers are the ones you measured. The lab measured the others from their CT scans. Pick a {trait} to graph.")}
        ${tableHtml()}<div class="sd-row">${TK.filter(k => !graphed.includes(k)).map(k => btn("pick", `Graph ${TRAIT[k].name}`, "sd-chip", ` data-k="${k}"`)).join("")}</div>`, { pick: el => build(el.dataset.k) });
      say("Here is your data table. The orange numbers are the ones you measured. Pick a trait to graph.");
    };
    const chart = k => {
      const T = TRAIT[k], max = k === "len" ? 140 : 20, step = k === "len" ? 20 : 5, H = 200, W = 360, bw = 46;
      let g = `<text x="${W / 2 + 20}" y="-14" class="sd-ctitle">${T.title} of five mustelid skulls</text>`;
      for (let v = 0; v <= max; v += step) { const y = H - v / max * H; g += `<path d="M 40 ${y} H ${W + 30}" stroke="#d6cfc2" stroke-width="1"/><text x="34" y="${y + 4}" class="sd-ax" text-anchor="end">${v}</text>`; }
      D.IDS.forEach((id, i) => {
        const v = SK[id][k], h = v / max * H, x = 56 + i * 64;
        g += `<rect x="${x}" y="${H - h}" width="${bw}" height="${h}" rx="4" fill="${meas[id] && meas[id][k] ? "#ff9a52" : "#2ed3c6"}" stroke="#2a2233" stroke-width="2"/><text x="${x + bw / 2}" y="${H - h - 6}" class="sd-ax" text-anchor="middle">${v}</text><text x="${x + bw / 2}" y="${H + 18}" class="sd-ax" text-anchor="middle">${esc(short(id))}</text>`;
      });
      g += `<path d="M 40 0 V ${H} H ${W + 30}" fill="none" stroke="#2a2233" stroke-width="2.5"/><text transform="translate(-6 ${H / 2}) rotate(-90)" class="sd-ax" text-anchor="middle">${T.title} (mm)</text><text x="${W / 2 + 20}" y="${H + 40}" class="sd-ax" text-anchor="middle">Animal</text>`;
      return `<div class="sd-chart"><svg viewBox="-20 -34 420 290" role="img" aria-label="Bar graph of ${T.name}: ${D.IDS.map(id => `${nm(id)} ${SK[id][k]} millimeters`).join(", ")}">${g}</svg></div>`;
    };
    const build = k => {
      const T = TRAIT[k], max = k === "len" ? 140 : 20;
      screen(`${head(`Make a bar graph of ${T.name}`, "Drag each bar until it matches the number in the data table. Then tap Check my graph.")}
        ${tableHtml(k)}
        <div class="sd-gb">${D.IDS.map(id => `<label class="sd-gbar"><span>${esc(short(id))}</span><input type="range" min="0" max="${max}" value="0" data-id="${id}" aria-label="${esc(nm(id))} bar, ${T.name} in millimeters"><b id="sd-gv-${id}">0 mm</b></label>`).join("")}</div>
        <div class="sd-row">${btn("check", "Check my graph", "sd-go")}</div>`, {
        check: () => {
          const bad = [...view.querySelectorAll(".sd-gb input")].filter(r => Math.abs(+r.value - SK[r.dataset.id][k]) > (k === "len" ? 3 : 0.5));
          if (!bad.length) { graphed.push(k); say(`${pick(PH.yes)} You made a bar graph of ${T.name}. Now let's read it.`).then(ok => ok && ask(k, 0)); }
          else { bad.forEach(r => flash(r.closest("label"), false)); say(`Check the ${bad.map(r => short(r.dataset.id)).join(" and ")} bar${bad.length > 1 ? "s" : ""}. Look at the table again.`); }
        }
      });
      view.querySelectorAll(".sd-gb input").forEach(r => r.addEventListener("input", () => { $("sd-gv-" + r.dataset.id).textContent = r.value + " mm"; r.style.setProperty("--v", r.value / max * 100 + "%"); r.setAttribute("aria-valuetext", r.value + " millimeters"); }));
      say(`Make a bar graph of ${T.name}. Drag each bar until it matches the number in the data table.`);
    };
    const WHY = {
      len: { q: "The badger has the longest {skull}. How does a big, strong skull help a badger survive?", a: "dig", opts: [["dig", "Big jaw muscles help it bite hard and dig after ground squirrels"], ["swim", "It helps it float in the river"], ["fly", "It helps it glide between trees"]], why: "A big skull has room for big jaw muscles. The badger bites hard and digs after ground squirrels." },
      orbit: { q: "The marten's skull is much shorter than the fisher's, but its {orbit|orbits} are almost as wide. How might big orbits help a marten?", a: "jump", opts: [["jump", "Big eyes help it see well to judge jumps between branches"], ["smell", "Big orbits help it smell food"], ["dig", "Big orbits help it dig"]], why: "Big orbits hold big eyes. A marten leaps from branch to branch, so good eyesight helps it judge each jump." },
      canine: { q: "The fisher has the tallest {canine|canines}. How do long canines help a fisher survive?", a: "grab", opts: [["grab", "They grab and hold big prey, like snowshoe hares"], ["chew", "They grind up leaves"], ["swim", "They help it swim faster"]], why: "Long canines grab and hold big prey. Fishers hunt snowshoe hares and even porcupines." }
    };
    const ask = (k, n) => {
      const T = TRAIT[k], vals = D.IDS.map(id => [id, SK[id][k]]).sort((a, b) => b[1] - a[1]);
      const big = vals[0][0], small = vals[vals.length - 1][0], diff = vals[0][1] - vals[vals.length - 1][1];
      const QS = [
        () => ({ q: `Which animal has the largest ${T.name}?`, a: big, opts: shuffle(D.IDS).map(id => [id, cap1(nm(id))]), why: `The ${nm(big)}'s ${T.name} is ${SK[big][k]} millimeters, the tallest bar.` }),
        () => ({ q: `Which animal has the smallest ${T.name}?`, a: small, opts: shuffle(D.IDS).map(id => [id, cap1(nm(id))]), why: `The ${nm(small)}'s ${T.name} is ${SK[small][k]} millimeters, the shortest bar.` }),
        () => { const o = shuffle([diff, diff + (diff > 6 ? 5 : 2), Math.max(1, diff - (diff > 6 ? 5 : 2)), SK[big][k]].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4); if (!o.includes(diff)) o[0] = diff; return { q: `How many millimeters larger is the ${nm(big)}'s ${T.name} than the ${nm(small)}'s?`, a: String(diff), opts: shuffle(o).map(v => [String(v), `${v} mm`]), why: `${SK[big][k]} minus ${SK[small][k]} is ${diff} millimeters.` }; },
        () => WHY[k]
      ];
      if (n >= QS.length) return more();
      const q = QS[n]();
      screen(`${chart(k)}${head(q.q)}${choices(q.opts)}`, {
        o: el => { if (el.dataset.v === q.a) { el.classList.add("sd-ok"); say(pick(PH.yes) + " " + q.why).then(ok => ok && ask(k, n + 1)); } else { flash(el, false); say(pick(PH.no) + " Look at the graph."); } }
      });
      say(q.q + " " + q.opts.map(o => plain(o[1])).join(". Or, ") + "?");
    };
    const more = () => {
      const left = TK.filter(k => !graphed.includes(k));
      screen(`${head("You made a graph from your own measurements!", "Scientists often graph more than one {trait}. Do you want to graph another one?")}
        <div class="sd-row">${left.map(k => btn("pick", `Graph ${TRAIT[k].name}`, "sd-chip", ` data-k="${k}"`)).join("")}${btn("next", `${ART.UI.go}<span>Finish the case</span>`, "sd-go", " data-focus")}</div>`, { pick: el => build(el.dataset.k), next: finale });
      say("You made a graph from your own measurements! Do you want to graph another trait, or finish the case?");
    };
    const finale = () => {
      const opts = shuffle([["var", "Variation"], ["photo", "Photosynthesis"], ["erosion", "Erosion"]]);
      screen(`${head("All five animals are mustelids, but their skull lengths, orbits, and canines are different sizes. What is the science word for these differences?")}${choices(opts)}`, {
        o: el => { if (el.dataset.v === "var") { el.classList.add("sd-ok"); showTerm("variation").then(() => solved("g3", "You learned how CT scanners see inside, measured skulls with a caliper, made a bar graph, and used the data as evidence.")); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say("All five animals are mustelids, but their skull traits are different sizes. What is the science word for these differences? Variation, photosynthesis, or erosion?");
    };
    ctLesson(next);
  };

  // 4th: brain parts, sense pathways to the brain, and more cases about adaptations.
  const SENSE = {
    sight: { id: "fisher", title: "Sight: from the eye to the brain", sum: "Light enters the eye. The optic nerve carries the message to the vision area of the cerebrum, and the brain works out what the animal sees." },
    smell: { id: "badger", title: "Smell: from the nose to the brain", sum: "Smell molecules land on the turbinals inside the nose. The olfactory nerves pass through tiny holes in the skull to the olfactory bulb, which sends the message on to the cerebrum." },
    touch: { id: "otter", title: "Touch: from the whiskers to the brain", sum: "When a whisker bends, the trigeminal nerve carries the message back through the infraorbital foramen to the brainstem, and then up to the touch area of the cerebrum." },
    hearing: { id: "marten", title: "Hearing: from the ear to the brain", sum: "Sound goes in the ear opening and shakes the middle ear inside the auditory bulla. The cochlea turns the sound into nerve messages, and the auditory nerve carries them to the brainstem and the hearing area of the cerebrum." }
  };
  PLAY.g4 = function () {
    const queue = [brainLesson, () => sense("sight"), () => sense("smell"), () => sense("touch"), () => sense("hearing"), smeller, whiskers, bite, () => adapt(0), () => adapt(1)];
    let qi = 0; const next = () => (qi < queue.length ? queue[qi++]() : solved("g4", "You named the parts of the brain, followed four senses from the body to the brain, and used skull evidence to predict which animals would struggle when their environment changes."));
    function brainLesson() {
      const parts = ["olfbulb", "cerebrum", "cerebellum", "brainstem"], found = {};
      screen(`${head("Parts of the brain", "The {endocast} shows four main parts of the brain. Tap each colored part to learn its name.")}
        <div class="sd-skull sd-tap">${skullPic("fisher", "side", { brain: true, brainParts: true })}</div>
        <p class="sd-found" id="sd-found">Found 0 of 4</p>${nextBtn("Next", true)}`, { next });
      wireParts();
      acts.part = el => {
        const k = el.dataset.part; if (!parts.includes(k)) return;
        el.classList.add("sd-lit"); found[k] = 1;
        const n = Object.keys(found).length;
        $("sd-found").innerHTML = `Found ${n} of 4: ${Object.keys(found).map(x => rich(`{${x}}`)).join(", ")}`;
        say(`This is the ${TERMS[k].t}. ${TERMS[k].def}`);
        if (n === 4) showNext();
      };
      say("Parts of the brain. The endocast shows four main parts of the brain. Tap each colored part to learn its name.");
    }
    function sense(s) {
      const M = SENSE[s], sp = SK[M.id]; let upto = 0;
      const first = ART.pathway(sp, s, { upto: 0 }), stops = first.steps, n = stops.length;
      screen(`${head(M.title, "A sense organ collects information. A {nerve} carries it as a message to the brain. Tap the stops in order, starting where the message begins.")}
        <div class="sd-pw" id="sd-pw">${first.svg}</div>
        <div class="sd-stops">${shuffle(stops.map((t, i) => [i, t])).map(([i, t]) => btn("step", `<i></i><span>${esc(plain(t))}</span>`, "sd-chip sd-stop", ` data-step="${i}"`)).join("")}</div>
        <ol class="sd-path" id="sd-path"></ol>${nextBtn("Next", true)}`, { next });
      acts.step = el => {
        const i = +el.dataset.step;
        if (i < upto) return;
        if (i !== upto) { flash(el, false); return say(upto === 0 ? "Not yet. Where does the message start?" : `Not yet. Where does the message go after the ${plain(stops[upto - 1])}?`); }
        upto++; el.disabled = true; el.classList.add("sd-ok"); el.querySelector("i").textContent = upto;
        $("sd-pw").innerHTML = ART.pathway(sp, s, { upto }).svg;
        $("sd-path").insertAdjacentHTML("beforeend", `<li>${rich(stops[i])}</li>`);
        const k = firstTerm(stops[i]);
        if (upto === n) { showNext(); say(`${plain(stops[i])}. ${M.sum}`); }
        else say(`${plain(stops[i])}. ${k ? TERMS[k].def : ""}`);
      };
      say(`${M.title}. A sense organ collects information, and a nerve carries it as a message to the brain. Tap the stops in order, starting where the message begins.`);
    }
    function compare(q, sub, ids, ans, opt, yes, hint) {
      screen(`${head(q, sub)}<div class="sd-row">${shuffle(ids).map(id => btn("b", `<div class="sd-mid-skull">${skullPic(id, "side", opt)}</div><span>${esc(cap1(nm(id)))}</span>`, "sd-tile sd-wide", ` data-id="${id}"`)).join("")}</div>`, {
        b: el => { if (el.dataset.id === ans) { el.classList.add("sd-ok"); unlock(ans); say(yes).then(ok => ok && next()); } else { flash(el, false); say(hint); } }
      });
      say(plain(q) + " " + plain(sub));
    }
    function smeller() {
      compare("Case 1: Who is the super-smeller?", "The yellow {olfbulb|olfactory bulbs} sit at the front of the brain. Bigger bulbs usually mean a stronger sense of smell.", ["badger", "fisher", "otter"], "badger", { brain: true },
        "Yes! The badger has the biggest olfactory bulbs. It sniffs out ground squirrels hiding under the dirt. The otter's are the smallest, because smells don't travel well under water.", "Look at the yellow parts. Which is biggest?");
    }
    function whiskers() {
      compare("Case 2: Who has the most sensitive whiskers?", "The {trigeminal} passes through the {iof}, the hole outlined in orange. A bigger hole means a bigger nerve and more sensitive {vibrissae|whiskers}.", ["otter", "marten", "badger"], "otter", { iofHi: true },
        "Yes! The otter's infraorbital foramen is the biggest. In muddy water, it finds fish by feeling with its whiskers.", "Compare the orange holes in front of the orbits. Which is biggest?");
    }
    function bite() {
      compare("Case 3: Who has the strongest bite?", "The {temporalis} attaches to the {sagcrest}, the ridge on top of the skull, shown in orange. A taller crest means room for a bigger muscle and a stronger bite.", ["fisher", "otter", "mink"], "fisher", { crest: true },
        "Yes! The fisher has the tallest sagittal crest, so it has a big temporalis muscle and a powerful bite, strong enough for porcupines.", "Look for the tallest orange ridge on top of the skull.");
    }
    const ADAPT = [
      { change: "A long drought dries up the river for years.", opts: ["otter", "badger", "marten"], a: "otter", why: "The otter's flat head, sensitive whiskers, and small olfactory bulbs are adaptations for hunting fish under water. If its river dries up, it must move, or its population will shrink. Badgers and martens do not need rivers to hunt." },
      { change: "Logging cuts down most of the old forest.", opts: ["marten", "badger", "mink"], a: "marten", why: "The marten's adaptations are for life in old forests: big orbits for judging jumps, and a light body for climbing after red squirrels. It needs big old trees for dens. Badgers live in open grasslands, and mink live along rivers." }
    ];
    function adapt(n) {
      const c = ADAPT[n], opts = shuffle(c.opts), Q = "Which animal will have the most difficult time {adaptation|adapting} to a changing {environment}?";
      screen(`${head(`Case ${4 + n}: ${c.change}`, Q)}<div class="sd-row">${opts.map(id => animalTile(id)).join("")}</div>`, {
        pick: el => { if (el.dataset.id === c.a) { el.classList.add("sd-ok"); unlock(c.a); say("Yes. " + c.why).then(ok => ok && next()); } else { flash(el, false); say(`Think about where the ${nm(el.dataset.id)} lives and hunts. ` + plain(Q)); } }
      });
      const ask = () => say(`${c.change} ${plain(Q)}`);
      if (n === 0) showTerm("adaptation").then(ask); else ask();
    }
    scanner("fisher", next, true);
  };

  // 5th: a lesson on mammal teeth and carnassials; teeth tell the diet; energy from the Sun.
  const TOOTH = ["incisor", "canine", "premolar", "carnassial", "molar"];
  PLAY.g5 = function () {
    const ids = shuffle(D.IDS).slice(0, 3); let i = 0;
    const tour = () => {
      const found = {};
      screen(`${head("Mammal teeth", "Mammals have four kinds of teeth: {incisor|incisors}, {canine|canines}, {premolar|premolars}, and {molar|molars}. Carnivorans also have special {carnassial|carnassials}. Tap each kind of tooth on the marten's jaw.")}
        <div class="sd-skull sd-teethpick sd-tap">${teethPic("marten", { teeth: true })}</div>
        <p class="sd-found" id="sd-found">Found 0 of 5</p>${nextBtn("Next", true)}`, { next: carn });
      wireParts();
      acts.part = el => {
        const k = el.dataset.part.replace("t-", ""); if (!TOOTH.includes(k)) return;
        view.querySelectorAll(`[data-part="t-${k}"]`).forEach(x => x.classList.add("sd-lit")); found[k] = 1;
        const n = Object.keys(found).length;
        $("sd-found").innerHTML = `Found ${n} of 5: ${TOOTH.filter(x => found[x]).map(x => rich(`{${x}}`)).join(", ")}`;
        say(`${cap1(TERMS[k].t)}. ${TERMS[k].def}`);
        if (n === 5) showNext();
      };
      say("Mammal teeth. Mammals have four kinds of teeth: incisors, canines, premolars, and molars. Carnivorans also have special carnassials. Tap each kind of tooth on the marten's jaw.");
    };
    const carn = () => {
      screen(`${head("What makes carnivorans special?", "Mustelids are {carnivoran|carnivorans}, in the mammal order Carnivora with cats, dogs, bears, and seals. Every carnivoran has {carnassial|carnassials}: the upper fourth premolar and the lower first molar. They slide past each other like scissor blades to slice meat.")}
        <div class="sd-skull sd-teethpick">${teethPic("marten").replace('data-tooth="carnassial"', 'data-tooth="carnassial" class="sd-lit"')}</div>
        <p class="sd-sub">${rich("Scientists count teeth with a {dental}.")} For one side of a marten's mouth it is <b>I 3/3, C 1/1, P 4/4, M 1/2</b>: 3 upper and 3 lower incisors, 1 and 1 canines, 4 and 4 premolars, 1 and 2 molars. Double it for both sides: 38 teeth.</p>${nextBtn()}`, { next: check });
      view.querySelectorAll(".sd-teethpick .sd-lit path").forEach(p => p.setAttribute("fill", "#ffd23f"));
      say("What makes carnivorans special? Mustelids are carnivorans, in the mammal order Carnivora with cats, dogs, bears, and seals. Every carnivoran has carnassials: the upper fourth premolar and the lower first molar. They slide past each other like scissor blades to slice meat.");
    };
    const check = () => {
      const id = pick(["otter", "fisher", "badger", "mink"]);
      screen(`${head(`Quick check: tap the ${nm(id)}'s {carnassial|carnassials}.`)}<div class="sd-skull sd-teethpick sd-tap">${teethPic(id, { teeth: true })}</div>`, {});
      wireParts();
      acts.part = el => {
        if (el.dataset.part === "t-carnassial") { view.querySelectorAll('[data-part="t-carnassial"]').forEach(x => x.classList.add("sd-lit")); say("Yes! Those are the carnassials, the slicing blades every carnivoran has.").then(ok => ok && teeth()); }
        else { flash(el, false); { const t = TERMS[el.dataset.part.replace("t-", "")]; const w = t ? t.t.replace(/s$/, "") : "tooth"; say(`That is ${/^[aeiou]/.test(w) ? "an" : "a"} ${w}. The carnassials are the big blade-shaped cheek teeth.`); } }
      };
      say(`Quick check. Tap the ${nm(id)}'s carnassials.`);
    };
    const KIND = { slicer: "Mostly slicing: blade-like carnassials and small molars", mixed: "Slicing and crushing: carnassials plus wide, bumpy molars", crusher: "Mostly crushing: wide, flat molars and no blades" };
    const teeth = () => {
      if (i >= ids.length) return whatIf();
      const id = ids[i], sp = SK[id];
      screen(`${head(`Read the ${nm(id)}'s teeth. What kind of cheek teeth does it have?`, "Look at the {carnassial|carnassials} and the {molar|molars} behind them. Blades slice meat. Wide molars with many {cusp|cusps} crush shells and plants.")}
        <div class="sd-skull sd-teethpick">${teethPic(id)}</div>
        ${choices(Object.keys(KIND).map(t => [t, KIND[t]]))}`, {
        o: el => { if (el.dataset.v === sp.teeth) { el.classList.add("sd-ok"); say(pick(PH.yes) + " " + sp.teethSay).then(ok => ok && foods(id)); } else { flash(el, false); say("Look closely at the molars behind the carnassials. " + pick(PH.no)); } }
      });
      say(`Read the ${nm(id)}'s teeth. What kind of cheek teeth does it have?`);
    };
    const foods = id => {
      const sp = SK[id], all = ["fish", "crayfish", "frog", "mouse", "squirrel", "rabbit", "porcupine", "berries", "insect"];
      const menu = shuffle(sp.foods.concat(shuffle(all.filter(f => !sp.foods.includes(f))).slice(0, 3))), got = {};
      screen(`${head(`Tap the ${nm(id)}'s three main foods.`)}<div class="sd-foods">${menu.map(f => btn("f", `${ART.icon(f)}<span>${cap1(D.FOODS[f])}</span>`, "sd-food", ` data-f="${f}"`)).join("")}</div>`, {
        f: el => {
          const f = el.dataset.f;
          if (sp.foods.includes(f)) { if (got[f]) return; got[f] = 1; el.classList.add("sd-ok"); el.disabled = true; if (Object.keys(got).length === 3) say(`Yes! The ${nm(id)} eats ${sp.foods.map(x => D.FOODS[x]).join(", ")}.`).then(ok => ok && chain(id)); else say(cap1(D.FOODS[f]) + "! Yum."); }
          else { flash(el, false); say(`${cap1(D.FOODS[f])} is not on the ${nm(id)}'s menu.`); }
        }
      });
      say(`Tap the ${nm(id)}'s three main foods.`);
    };
    const chain = id => {
      const order = SK[id].chain, cards = shuffle(order); let n = 0;
      const lbl = k => k === id ? cap1(nm(id)) : cap1(D.FOODS[k]), pic = k => k === id ? ART.animal(SK[id], 110) : ART.icon(k);
      screen(`${head("Follow the energy!", `Tap the cards in order, starting with the Sun, to build a {foodchain} that ends with the ${nm(id)}. The {producer} comes right after the Sun. Every animal is a {consumer}.`)}
        <div class="sd-chain" id="sd-chain"></div><div class="sd-foods">${cards.map(k => btn("c", `${pic(k)}<span>${lbl(k)}</span>`, "sd-food", ` data-k="${k}"`)).join("")}</div>`, {
        c: el => {
          if (el.dataset.k === order[n]) {
            el.disabled = true; el.classList.add("sd-used");
            $("sd-chain").insertAdjacentHTML("beforeend", (n ? `<i class="sd-arrow" aria-hidden="true">→</i>` : "") + `<div class="sd-link">${pic(order[n])}<span>${lbl(order[n])}</span></div>`);
            n++;
            if (n === order.length) { unlock(id); i++; say(`Energy from the Sun flows to the ${lbl(order[1]).toLowerCase()}, the producer, and then to the consumers: ${order.slice(2).map(lbl).join(", then ")}. Every animal in the chain depends on the Sun.`).then(ok => ok && teeth()); }
          } else { flash(el, false); say(n === 0 ? "Start with the Sun. It gives the energy for everything." : n === 1 ? "Which producer uses the Sun's energy to grow?" : `Who eats the ${lbl(order[n - 1]).toLowerCase()}?`); }
        }
      });
      say(`Follow the energy! Tap the cards in order, starting with the Sun. The producer comes right after the Sun.`);
    };
    const whatIf = () => {
      const opts = shuffle(["otter", "marten", "badger"]);
      screen(`${head("Pollution kills most of the fish in a river. Which animal will go hungry first?")}<div class="sd-row">${opts.map(id => animalTile(id)).join("")}</div>`, {
        pick: el => { if (el.dataset.id === "otter") { el.classList.add("sd-ok"); say("Yes. Fish are the otter's main food. When one link in a food web breaks, the consumers that depend on it are in trouble.").then(ok => ok && solved("g5", "You learned the four kinds of mammal teeth and the carnassials, read teeth like a scientist, and followed energy from the Sun through food chains.")); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say("Pollution kills most of the fish in a river. Which animal will go hungry first?");
    };
    tour();
  };

  // 6th: an introduction to phylogenetics, then score shared skull traits and build the tree.
  PLAY.g6 = function () {
    const TREEPART = { node: "#c2552a", sister: "#3a8dde", clade: "#2e9e6a", outgroup: "#8a4fd8", ancestor: "#c2552a" };
    const demo = (hi = "") => `<svg viewBox="0 0 400 210" role="img" aria-label="An example phylogenetic tree of five animals" class="sd-demo">
      <g fill="none" stroke="#2a2233" stroke-width="4" stroke-linecap="round">
        <path d="M 135 190 V 160 M 40 160 H 230 M 40 160 V 30 M 230 160 V 120 M 155 120 H 305 M 155 120 V 80 M 305 120 V 80 M 120 80 H 190 M 270 80 H 340 M 120 80 V 30 M 190 80 V 30 M 270 80 V 30 M 340 80 V 30"/></g>
      ${hi === "clade" ? `<path d="M 305 120 V 80 M 270 80 H 340 M 270 80 V 30 M 340 80 V 30" fill="none" stroke="${TREEPART.clade}" stroke-width="8" stroke-linecap="round"/><rect x="250" y="4" width="112" height="128" rx="14" fill="none" stroke="${TREEPART.clade}" stroke-width="3" stroke-dasharray="6 4"/>` : ""}
      ${hi === "sister" ? `<path d="M 270 80 V 30 M 340 80 V 30" stroke="${TREEPART.sister}" stroke-width="8" stroke-linecap="round"/><path d="M 120 80 V 30 M 190 80 V 30" stroke="${TREEPART.sister}" stroke-width="8" stroke-linecap="round"/>` : ""}
      ${hi === "outgroup" ? `<path d="M 40 160 V 30" stroke="${TREEPART.outgroup}" stroke-width="8" stroke-linecap="round"/>` : ""}
      ${hi === "node" || hi === "ancestor" ? [[135, 160], [230, 120], [155, 80], [305, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${TREEPART.node}" stroke="#2a2233" stroke-width="2"/>`).join("") : `<circle cx="230" cy="120" r="5" fill="#2a2233"/>`}
      ${[["Lizard", 40], ["Wolf", 120], ["Coyote", 190], ["House cat", 270], ["Lion", 340]].map(([t, x]) => `<text x="${x}" y="20" text-anchor="middle" class="sd-dlab">${t}</text>`).join("")}
      <text x="300" y="185" class="sd-dlab" text-anchor="middle">past (bottom) → today (top)</text></svg>`;
    const intro = () => {
      const seen = {};
      screen(`${head("What is a phylogenetic tree?", "A {phylogeny} is the evolutionary history of a group: who is related to whom. Scientists draw it as a {phylotree}. The tips at the top are living species. Lines join back in time at shared ancestors. Tap each word below to see it on the tree.")}
        <div class="sd-demo-wrap" id="sd-demo">${demo()}</div>
        <div class="sd-legend">${["node", "sister", "clade", "outgroup"].map(k => btn("hl", `<i style="background:${TREEPART[k]}"></i>${esc(cap1(TERMS[k].t))}`, "sd-chip", ` data-k="${k}"`)).join("")}</div>
        <p class="sd-found" id="sd-found">Tap all four words.</p>${nextBtn("Next", true)}`, {
        hl: el => { const k = el.dataset.k; seen[k] = 1; el.classList.add("sd-sel"); $("sd-demo").innerHTML = demo(k); showTerm(k).then(() => { if (Object.keys(seen).length === 4 && $("sd-found")) { $("sd-found").textContent = "You learned all four words!"; showNext(); } }); },
        next: anatomy
      });
      say("What is a phylogenetic tree? A phylogeny is the evolutionary history of a group, who is related to whom. Scientists draw it as a phylogenetic tree. Tap each word to see it on the tree.");
    };
    const anatomy = () => {
      screen(`${head("How can anatomy show relationships?", "Species that share a recent {ancestor} inherit many of the same body parts. These are {homologous} traits. The strongest evidence is a {derived}: a new trait that only one branch has, because it first appeared in that branch's ancestor.")}
        <div class="sd-pair"><div class="sd-mid-skull">${skullPic("marten")}</div><div class="sd-mid-skull">${skullPic("fisher")}</div></div>
        <p class="sd-sub">${rich("Martens and fishers both have four {premolar|premolars} in every jaw, 38 teeth in all. The other three mustelids have fewer. That shared trait is evidence that martens and fishers are {sister|sister taxa}. But be careful: {convergent} can make distant species look alike, so scientists compare many traits, and DNA.")}</p>${nextBtn()}`, { next: () => quiz(0) });
      say("How can anatomy show relationships? Species that share a recent common ancestor inherit many of the same body parts. These are homologous traits. The strongest evidence is a shared derived trait, a new trait that only one branch has. Martens and fishers both have four premolars in every jaw. But be careful: convergent evolution can make distant species look alike.");
    };
    const QZ = [
      { q: "On a phylogenetic tree, what does a {node} stand for?", a: "anc", opts: [["anc", "A common ancestor"], ["liv", "A living species today"], ["food", "What the animal eats"]], why: "A node is a branching point. It stands for a common ancestor." },
      { q: "Which is the best evidence that two species are closely related?", a: "der", opts: [["der", "They share many derived traits, like special teeth only their branch has"], ["place", "They live in the same place"], ["color", "They are the same color"]], why: "Shared derived traits come from a common ancestor that only their branch has." }
    ];
    const quiz = n => {
      if (n >= QZ.length) return feature();
      const q = QZ[n];
      screen(`${head(q.q)}${choices(shuffle(q.opts))}`, { o: el => { if (el.dataset.v === q.a) { el.classList.add("sd-ok"); say(pick(PH.yes) + " " + q.why).then(ok => ok && quiz(n + 1)); } else { flash(el, false); say(pick(PH.no)); } } });
      say(plain(q.q));
    };
    const F = [
      { id: "short", name: "Short {rostrum}", has: ["otter", "mink"] },
      { id: "flat", name: "Flattened, low {braincase}", has: ["otter", "mink"] },
      { id: "pm4", name: "Four {premolar|premolars} in every jaw (38 teeth)", has: ["marten", "fisher"] },
      { id: "long", name: "Long, narrow {rostrum}", has: ["marten", "fisher"] },
      { id: "crest", name: "Tall {sagcrest}", has: ["fisher", "badger"] },
      { id: "wide", name: "Broad, triangular {cranium}", has: ["badger"] }
    ];
    let k = 0;
    const feature = () => {
      if (k >= F.length) return table();
      const ft = F[k]; const sel = {};
      screen(`${head(`Trait ${k + 1} of ${F.length}: ${ft.name}`, "Tap every skull that has this {trait}, then tap Done.")}
        <div class="sd-skulls5">${D.IDS.map(id => btn("s", `<div class="sd-mini-skull">${skullPic(id)}</div><span>${esc(short(id))}</span>`, "sd-tile sd-wide", ` data-id="${id}" aria-pressed="false"`)).join("")}</div>
        <div class="sd-row">${btn("done", "Done", "sd-go")}</div>`, {
        s: el => { const id = el.dataset.id; sel[id] = !sel[id]; el.setAttribute("aria-pressed", sel[id]); el.classList.toggle("sd-sel", sel[id]); },
        done: () => {
          const want = new Set(ft.has), chose = Object.keys(sel).filter(x => sel[x]);
          if (chose.length === want.size && chose.every(x => want.has(x))) { k++; say(`Right: ${ft.has.map(nm).join(" and ")}.`).then(ok => ok && feature()); }
          else say(`Not quite. Look again for: ${plain(ft.name)}. Hint: ${want.size === 1 ? "only one skull has" : want.size + " skulls have"} it.`);
        }
      });
      say(`Trait ${k + 1}: ${plain(ft.name)}. Tap every skull that has it, then tap done.`);
    };
    const traitTable = (cls = "") => `<div class="sd-table-wrap${cls}"><table class="sd-table"><caption class="sd-table-cap">Your trait table</caption><thead><tr><th>Trait</th>${D.IDS.map(id => `<th>${esc(short(id))}</th>`).join("")}</tr></thead>
        <tbody>${F.map(ft => `<tr><td>${rich(ft.name)}</td>${D.IDS.map(id => `<td>${ft.has.includes(id) ? "●" : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const table = () => {
      screen(`${head("Your trait table", "Which pairs share the most traits? Shared derived traits are clues to {sister|sister taxa}.")}
        ${traitTable()}${nextBtn("Build the tree")}`, { next: tree });
      say("Here is your trait table. Which pairs share the most traits?");
    };
    const tree = () => {
      const slots = { a: null, b: null, c: null, d: null, e: null }; let held = null;
      const draw = () => {
        const slot = s => btn("slot", slots[s] ? `<div class="sd-mini-skull">${skullPic(slots[s])}</div><span>${esc(short(slots[s]))}</span>` : `<span>Empty</span>`, "sd-slot" + (slots[s] ? " full" : ""), ` data-s="${s}" aria-label="Tree spot ${s.toUpperCase()}${slots[s] ? ": " + esc(nm(slots[s])) : ", empty"}"`);
        const left = D.IDS.filter(id => !Object.values(slots).includes(id));
        screen(`${head("Build the {phylotree}", "Put each pair of {sister|sister taxa} together. The {outgroup}, the lineage that branched off first, goes on its own. Tap a skull, then tap a spot.")}
          <div class="sd-treewrap"><div class="sd-treemain"><div class="sd-tree"><div class="sd-tree-lab"><span>Outgroup</span><span>Sister taxa</span><span>Sister taxa</span></div>
            <svg viewBox="0 0 400 120" aria-hidden="true" preserveAspectRatio="none"><g fill="none" stroke="#2a2233" stroke-width="5" stroke-linecap="round"><path d="M140 116 V90 M40 90 H240 M40 90 V8 M240 90 V60 M160 60 H320 M160 60 V36 M320 60 V36 M120 36 H200 M280 36 H360 M120 36 V8 M200 36 V8 M280 36 V8 M360 36 V8"/></g></svg>
            <div class="sd-tree-slots"><div>${slot("e")}</div><div class="sd-pairbox">${slot("a")}${slot("b")}</div><div class="sd-pairbox">${slot("c")}${slot("d")}</div></div></div>
          <div class="sd-skulls5">${left.map(id => btn("hold", `<div class="sd-mini-skull">${skullPic(id)}</div><span>${esc(short(id))}</span>`, "sd-tile sd-wide" + (held === id ? " sd-sel" : ""), ` data-id="${id}" aria-pressed="${held === id}"`)).join("")}</div>
          ${left.length ? "" : `<div class="sd-row">${btn("check", "Check my tree", "sd-go", " data-focus")}</div>`}</div>
          ${traitTable(" sd-table-small")}</div>`, {
          hold: el => { held = el.dataset.id; draw(); say(cap1(nm(held)) + ". Now tap a spot on the tree."); },
          slot: el => { const s = el.dataset.s; if (slots[s]) { slots[s] = null; draw(); return; } if (!held) return say("First tap a skull."); slots[s] = held; held = null; draw(); },
          check: () => {
            const pair = (x, y) => [slots[x], slots[y]].sort().join();
            const P = D.TREE.pairs.map(p => p.slice().sort().join());
            const ok = slots.e === D.TREE.first && P.includes(pair("a", "b")) && P.includes(pair("c", "d")) && pair("a", "b") !== pair("c", "d");
            if (ok) { D.IDS.forEach(unlock); say("Your tree matches the one scientists built from anatomy and DNA! The badger lineage is the outgroup: it branched off first. Martens and fishers are sister taxa, and otters and mink are on sister branches. Each pair shares a common ancestor that no other animal here shares.").then(r => r && lookalike()); }
            else { say(slots.e !== D.TREE.first ? "Look at the trait table. Which skull shares the fewest traits with the others? That one is the outgroup." : "Check your pairs. Put together the two skulls that share the most derived traits."); }
          }
        });
      };
      draw(); say("Build the phylogenetic tree. Put each pair of sister taxa together. The outgroup goes on its own. Tap a skull, then tap a spot.");
    };
    const lookalike = () => {
      const opts = shuffle([["no", "No. A tall sagittal crest helps any strong biter, so it evolved separately. This is convergent evolution."], ["yes", "Yes. Any shared trait proves they are sister taxa."], ["same", "Yes. A crest can only come from one common ancestor."]]);
      screen(`${head("The fisher and the badger both have a tall {sagcrest}. Does that make them {sister|sister taxa}?")}<div class="sd-pair"><div class="sd-mid-skull">${skullPic("fisher", "side", { crest: true })}</div><div class="sd-mid-skull">${skullPic("badger", "side", { crest: true })}</div></div>${choices(opts)}`, {
        o: el => { if (el.dataset.v === "no") { el.classList.add("sd-ok"); say("Exactly. That is convergent evolution: both lineages evolved a crest because both need a strong bite. Scientists compare many traits, and DNA, because one look-alike trait can fool you.").then(ok => ok && solved("g6", "You learned how to read a phylogenetic tree, used shared derived traits as evidence, built a tree for five mustelids, and spotted convergent evolution, just like a museum scientist.")); } else { flash(el, false); say("Think again. Could the same trait evolve twice, in two different lineages?"); } }
      });
      say("The fisher and the badger both have a tall sagittal crest. Does that make them sister taxa? " + opts.map(o => o[1]).join(" Or, "));
    };
    intro();
  };

  /* ---------- top bar ---------- */
  $("sd-home").innerHTML = ART.UI.home; $("sd-say").innerHTML = ART.UI.speak;
  $("sd-home").addEventListener("click", () => (S.grade ? (CL && S.opts.lock ? menu() : grades()) : title()));
  $("sd-say").addEventListener("click", () => { if (lastLine) speak(lastLine); });
  const muteB = $("sd-mute");
  const setMute = () => { muteB.setAttribute("aria-pressed", S.mute); muteB.classList.toggle("off", S.mute); };
  muteB.addEventListener("click", () => { S.mute = !S.mute; save(); setMute(); if (S.mute) stopTalk(); });
  setMute();
  $("sd-fs").addEventListener("click", () => { if (document.fullscreenElement) document.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen().catch(() => {}); });

  /* ---------- teacher settings (classroom: press and hold the gear) ---------- */
  function holdGear() {
    const g = $("sd-gear"); let t = 0;
    const start = e => { e.preventDefault(); g.classList.add("holding"); t = setTimeout(settings, 900); };
    const stop = () => { g.classList.remove("holding"); clearTimeout(t); };
    g.addEventListener("pointerdown", start); g.addEventListener("pointerup", stop); g.addEventListener("pointerleave", stop);
    g.addEventListener("keydown", e => { if (e.key === "Enter") settings(); });
  }
  function settings() {
    screen(`${head("Teacher settings")}
      <div class="sd-settings">
        <label>Lock a grade <select id="sd-lock"><option value="">No lock (children pick)</option>${D.GRADE_IDS.map(g => `<option value="${g}"${S.opts.lock === g ? " selected" : ""}>Grade ${D.GRADES[g].label}: ${esc(D.GRADES[g].title)}</option>`).join("")}</select></label>
        <label><input type="checkbox" id="sd-slow"${S.opts.slow ? " checked" : ""}> Slower voice</label>
        <label><input type="checkbox" id="sd-caps"${S.opts.caps ? " checked" : ""}> Show captions</label>
        <label><input type="checkbox" id="sd-reset"> Clear this tablet's progress</label>
      </div><div class="sd-row">${btn("ok", "Save", "sd-go", " data-focus")}</div>`, {
      ok: () => {
        S.opts.lock = $("sd-lock").value; S.opts.slow = $("sd-slow").checked; S.opts.caps = $("sd-caps").checked;
        if ($("sd-reset").checked) { S.done = {}; S.cards = {}; S.words = {}; }
        if (S.opts.lock) S.grade = S.opts.lock;
        save(); title();
      }
    });
  }

  if (S.grade && CL && S.opts.lock) menu(); else title();
})();
