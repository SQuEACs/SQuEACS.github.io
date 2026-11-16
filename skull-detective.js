/* ============================================================
   SKULL DETECTIVE: a CT-scan skull game for kindergarten to
   6th grade. Five weasel-family cousins (river otter, mink,
   marten, fisher, badger); each grade has its own case built on
   a science standard. Everything is read aloud, with captions.

   Uses skull-detective-art.js (drawings) and skull-detective-data.js.
   The classroom edition sets window.SD_CLASSROOM = true first.
   ============================================================ */
(function () {
  const ART = window.SD_ART, D = window.SD_DATA, SK = D.SKULLS;
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
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const PH = {
    yes: ["Yes!", "You got it!", "That's right!", "Great detective work!", "Nice work!", "Spot on!"],
    no: ["Not quite. Try again!", "Hmm, not that one. Have another look.", "Good guess, but no. Try again!", "Look again, detective."],
    solved: ["Case closed!", "Mystery solved!", "You cracked the case!", "Super sleuthing!"]
  };

  /* ---------- saved progress ---------- */
  const S = Object.assign({ grade: null, done: {}, cards: {}, mute: false, opts: { lock: "", slow: false, caps: true } }, load());
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
  function say(text) {
    const tok = ++sayToken, sid = scr; lastLine = text;
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
    }).then(() => sid === scr);   // true while the same screen is still showing
  }
  let capT = 0;
  function showCap(t) { if (!S.opts.caps) { cap.hidden = true; return; } cap.textContent = t; cap.hidden = false; clearTimeout(capT); capT = setTimeout(() => { cap.hidden = true; }, 2500 + t.length * 80); }

  /* ---------- screens ---------- */
  let acts = {};
  function screen(html, a) { stopTalk(); scr++; acts = a || {}; view.innerHTML = html; view.scrollTop = 0; const f = view.querySelector("[data-focus]"); if (f) f.focus({ preventScroll: true }); }
  view.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el || !view.contains(el) || el.disabled) return;
    const fn = acts[el.dataset.act]; if (fn) fn(el, e);
  });
  view.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest("[data-act]"); if (!el || el.tagName === "BUTTON" || el.tagName === "INPUT") return;
    e.preventDefault(); el.click();
  });
  const btn = (act, inner, cls = "", extra = "") => `<button type="button" class="sd-btn ${cls}" data-act="${act}"${extra}>${inner}</button>`;
  const head = (q, sub = "") => `<div class="sd-head"><p class="sd-q">${esc(q)}</p>${sub ? `<p class="sd-sub">${esc(sub)}</p>` : ""}</div>`;
  const nextBtn = (label = "Next") => `<div class="sd-row">${btn("next", `${ART.UI.go}<span>${label}</span>`, "sd-go", " data-focus")}</div>`;
  const flash = (el, ok) => { el.classList.remove("sd-ok", "sd-bad"); void el.offsetWidth; el.classList.add(ok ? "sd-ok" : "sd-bad"); };

  // A skull picture: the CT render if the lab has added one, otherwise the drawing.
  function skullPic(id, view = "side", opt = {}) {
    const sp = SK[id], src = sp.ct && sp.ct[view];
    if (src && !opt.parts && !opt.brain) return `<img class="sd-ct" src="${esc(src)}" alt="CT scan of a ${esc(nm(id))} skull, ${view === "side" ? "side" : "top"} view">`;
    if (view === "top") return `<svg viewBox="-170 -10 340 320" role="img" aria-label="${esc(nm(id))} skull from above">${ART.top(sp, { L: 300 })}</svg>`;
    const hgt = sp.shape.h * 300;
    return `<svg viewBox="-20 ${-(hgt * 1.05 + 30)} 350 ${hgt * 1.05 + 30 + 130}" role="img" aria-label="${esc(nm(id))} skull from the side">${ART.side(sp, Object.assign({ L: 300 }, opt))}</svg>`;
  }
  const animalTile = (id, act = "pick") => btn(act, `${ART.animal(SK[id], 150)}<span>${esc(cap1(nm(id)))}</span>`, "sd-tile", ` data-id="${id}" aria-label="${esc(nm(id))}"`);

  /* ---------- title and grade picker ---------- */
  function title() {
    $("sd-home").hidden = true;
    const n = Object.keys(S.cards).length;
    screen(`<div class="sd-title">
      <div class="sd-title-art">${skullPic("otter")}</div>
      <h2 class="sd-logo"><span>Skull</span> <span>Detective</span></h2>
      <p class="sd-sub">Real CT-scanned skulls. Five weasel-family cousins. One detective: you.</p>
      <div class="sd-row">${btn("play", `${ART.UI.go}<span>Play</span>`, "sd-go", " data-focus")}${btn("file", `${ART.UI.star}<span>Case file ${n}/5</span>`, "sd-chip")}</div>
      ${CL ? `<button type="button" class="sd-gear" id="sd-gear" aria-label="Teacher settings (press and hold)">${ART.UI.gear}</button>` : ""}
    </div>`, { play: () => (S.grade ? menu() : grades()), file: caseFile });
    if (CL) holdGear();
    say("Skull Detective! Every skull tells a story. Tap play to start.");
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
      <div class="sd-row">${btn("start", `${ART.UI.lens}<span>Open the case</span>`, "sd-go", " data-focus")}${CL && S.opts.lock ? "" : btn("grades", "Change grade", "sd-chip")}</div>
      <p class="sd-std">Standards: ${esc(G.std)}</p></div>`,
      { start: () => PLAY[S.grade](), grades });
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
    screen(`${head("Case file", "Solve cases to collect all five skull cards.")}
      <div class="sd-cards">${D.IDS.map(id => S.cards[id] ? `<div class="sd-card"><div class="sd-card-pic">${ART.card(SK[id])}</div>${ART.animal(SK[id], 130)}<b>${esc(cap1(nm(id)))}</b><i>${esc(SK[id].sci)}</i><p>${esc(SK[id].fact)}</p></div>` : `<div class="sd-card sd-locked" aria-label="Locked card"><div class="sd-card-pic">?</div></div>`).join("")}</div>
      <div class="sd-row">${btn("back", "Back", "sd-chip", " data-focus")}</div>`, { back: () => (S.grade ? menu() : title()) });
    say(`You have ${Object.keys(S.cards).length} of 5 skull cards.`);
  }

  /* ---------- the X-ray scanner (used in grades 3 and 4) ---------- */
  function scanner(id, then) {
    const sp = SK[id], hgt = sp.shape.h * 300, vb = `-20 ${-(hgt * 1.05 + 30)} 350 ${hgt * 1.05 + 160}`;
    screen(`${head("How does a CT scanner see inside?", "Light bounces off bone, but X-rays pass through it a little. A CT scanner takes hundreds of X-ray pictures from all sides and stacks them up. Slide the scanner across the skull.")}
      <div class="sd-scan"><svg viewBox="${vb}" role="img" aria-label="Skull with the inside revealed where the scanner has passed">
        <defs><clipPath id="sd-clip"><rect id="sd-cliprect" x="-20" y="-400" width="0" height="800"/></clipPath></defs>
        ${ART.side(sp, { L: 300 })}<g clip-path="url(#sd-clip)"><rect x="-20" y="-400" width="400" height="800" fill="#1f2a44"/><g class="sd-xray">${ART.side(sp, { L: 300, brain: true })}</g></g>
        <rect id="sd-beam" x="-20" y="-400" width="6" height="800" fill="#2ed3c6" opacity=".8"/></svg>
      <label class="sd-range"><span>Scanner</span><input type="range" min="0" max="100" value="0" id="sd-scanr" data-focus aria-label="Move the scanner"></label></div>
      <div class="sd-row" id="sd-scanok" hidden>${btn("next", `${ART.UI.go}<span>Next</span>`, "sd-go")}</div>`, { next: then });
    const r = $("sd-scanr"), rect = $("sd-cliprect"), beam = $("sd-beam");
    let told = false;
    r.addEventListener("input", () => {
      const x = -20 + r.value / 100 * 370; rect.setAttribute("width", x + 20); beam.setAttribute("x", x - 3);
      if (r.value > 85 && !told) { told = true; $("sd-scanok").hidden = false; say("Now you can see inside! The pink shape is where the brain sat, and the yellow part is for smelling."); }
    });
    say("How does a CT scanner see inside a skull? X-rays pass through bone a little, and the scanner takes hundreds of pictures. Slide the scanner across the skull.");
  }

  /* ================= grade cases ================= */
  const PLAY = {};

  // K: find the parts of a skull, then name the animal.
  PLAY.k = function () {
    const ids = shuffle(D.IDS).slice(0, 3); let i = 0;
    const round = () => {
      if (i >= ids.length) return solved("k", "You found the eyes, noses, and teeth on three skulls.");
      const id = ids[i++], parts = shuffle(["eye", "nose", "teeth", "brain", "ear"]).slice(0, 2); let p = 0;
      const ask = () => {
        if (p >= parts.length) return who(id);
        const part = D.PARTS[parts[p]];
        screen(`${head(cap1(part.ask.split(".")[0]) + "!")}<div class="sd-skull sd-tap">${skullPic(id, "side", { parts: true })}</div>`, {});
        say(part.ask);
        view.querySelectorAll("[data-part]").forEach(el => { el.dataset.act = "part"; });
        acts.part = el => {
          const got = el.dataset.part;
          if (got === parts[p]) { view.querySelectorAll(`[data-part="${got}"]`).forEach(x => x.classList.add("sd-lit")); p++; say(pick(PH.yes) + " " + part.does).then(ok => ok && ask()); }
          else if (D.PARTS[got]) { flash(el, false); say(`That is the ${D.PARTS[got].name}. ${part.ask}`); }
          else say(part.ask);
        };
      };
      ask();
    };
    const who = id => {
      const opts = shuffle([id, pick(D.IDS.filter(x => x !== id))]);
      screen(`${head("Whose skull is this?")}<div class="sd-skull sd-small">${skullPic(id)}</div><div class="sd-row">${opts.map(o => animalTile(o)).join("")}</div>`, {
        pick: el => {
          if (el.dataset.id === id) { unlock(id); say(`Yes! It's ${the(id)}. ${SK[id].clues[0]}`).then(ok => ok && round()); el.classList.add("sd-ok"); }
          else { flash(el, false); say(`Not the ${nm(el.dataset.id)}. Listen: ${SK[id].clues[0]}`); }
        }
      });
      say(`Whose skull is this? Is it ${the(opts[0])}, or ${the(opts[1])}? Here's a clue. ${SK[id].clues[0]}`);
    };
    round();
  };

  // 1st: sort skulls by job (classify), then copy a skull's shape to build something.
  const BUILD = {
    boat: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="5" stroke-linejoin="round"><path d="M10 60 H90 L76 80 H24Z" fill="#c2552a"/><path d="M50 60 V20 L74 54Z" fill="#fff"/><path d="M4 88 q12 -8 24 0 t24 0 t24 0 t24 0" fill="none" stroke="#3aa0e0"/></g></svg>`,
    shovel: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="5" stroke-linejoin="round"><path d="M50 8 V56" stroke-width="9"/><path d="M30 56 H70 V74 Q50 96 30 74Z" fill="#8f8a80"/><rect x="38" y="4" width="24" height="10" rx="5" fill="#ffd23f"/></g></svg>`,
    ladder: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="6" stroke-linecap="round"><path d="M30 8 V92 M70 8 V92 M30 24 H70 M30 44 H70 M30 64 H70 M30 84 H70" stroke="#9a6a35"/></g></svg>`,
    helmet: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="5" stroke-linejoin="round"><path d="M14 66 Q14 20 50 20 Q86 20 86 66Z" fill="#2ed3c6"/><path d="M8 66 H92" stroke-width="8"/></g></svg>`
  };
  const JOBICON = { swimmer: "river", climber: "trees", digger: "grassland" };
  PLAY.g1 = function () {
    const ids = shuffle(D.IDS); let i = 0;
    const sortOne = () => {
      if (i >= ids.length) return copy(0);
      const id = ids[i++];
      screen(`${head(`Is the ${nm(id)} a swimmer, a climber, or a digger?`)}
        <div class="sd-pair"><div class="sd-skull sd-small">${skullPic(id)}</div>${ART.animal(SK[id], 190)}</div>
        <div class="sd-row">${Object.keys(D.JOBS).map(j => btn("job", `${ART.habitat(JOBICON[j])}<span>${D.JOBS[j].name}</span>`, "sd-tile sd-hab", ` data-j="${j}"`)).join("")}</div>`, {
        job: el => {
          if (el.dataset.j === SK[id].job) { el.classList.add("sd-ok"); unlock(id); say(`${pick(PH.yes)} The ${nm(id)} is a ${SK[id].job}. ${SK[id].clues[1]}`).then(ok => ok && sortOne()); }
          else { flash(el, false); say(`Hmm. ${SK[id].clues[0]} ${SK[id].clues[1]}`); }
        }
      });
      say(`This is the skull of ${the(id)}. ${SK[id].clues[0]} Is it a swimmer, a climber, or a digger?`);
    };
    const Q = [
      { id: "otter", q: "Engineers copy animals! The otter's flat, smooth head slips through water. What could you build with that shape?", a: "boat", opts: ["boat", "ladder", "shovel"], yes: "A boat! Its smooth, flat front slips through the water, just like an otter's head." },
      { id: "badger", q: "The badger's wide, strong skull pushes through dirt. What could you build that works the same way?", a: "shovel", opts: ["helmet", "shovel", "boat"], yes: "A shovel! Strong and wide for pushing dirt, like a badger's head and claws." }
    ];
    const copy = k => {
      if (k >= Q.length) return solved("g1", "You sorted all five cousins by the job they do, and copied nature to invent new things.");
      const q = Q[k];
      screen(`${head(q.q)}<div class="sd-skull sd-small">${skullPic(q.id)}</div>
        <div class="sd-row">${q.opts.map(o => btn("b", `${BUILD[o]}<span>${cap1(o)}</span>`, "sd-tile", ` data-o="${o}"`)).join("")}</div>`, {
        b: el => { if (el.dataset.o === q.a) { el.classList.add("sd-ok"); say(q.yes).then(ok => ok && copy(k + 1)); } else { flash(el, false); say(`A ${el.dataset.o}? Think about what the ${nm(q.id)} does with its head. Try again!`); } }
      });
      say(q.q + " A " + q.opts.join(", a ") + "?");
    };
    sortOne();
  };

  // 2nd: clues from the skull lead to the animal's home (habitat).
  PLAY.g2 = function () {
    const ids = shuffle(D.IDS); let i = 0;
    const one = () => {
      if (i >= ids.length) return solved("g2", "You matched all five cousins to their homes. Same family, four different habitats!");
      const id = ids[i++]; let c = 0;
      const draw = () => {
        screen(`${head("Where does this animal live?", `Clue ${c + 1}: ${SK[id].clues[c]}`)}
          <div class="sd-skull sd-small">${skullPic(id)}</div>
          <div class="sd-habs">${Object.keys(D.HABITATS).map(h => btn("h", `${ART.habitat(h)}<span>${cap1(D.HABITATS[h].name)}</span>`, "sd-tile sd-hab", ` data-h="${h}"`)).join("")}</div>
          ${c < 2 ? `<div class="sd-row">${btn("more", "Another clue", "sd-chip")}</div>` : ""}`, {
          h: el => {
            if (el.dataset.h === SK[id].hab) {
              unlock(id);
              screen(`<div class="sd-reveal"><div class="sd-hab-big">${ART.habitat(SK[id].hab)}<div class="sd-in">${ART.animal(SK[id], 220)}</div></div>${head(`It's ${the(id)}!`, SK[id].fact)}</div>${nextBtn()}`, { next: one });
              say(`${pick(PH.yes)} It's ${the(id)}, at home in ${D.HABITATS[SK[id].hab].say}. ${SK[id].fact}`);
            } else { flash(el, false); if (c < 2) { c++; draw(); say("Not there. Here's another clue. " + SK[id].clues[c]); } else say(pick(PH.no)); }
          },
          more: () => { c++; draw(); say(SK[id].clues[c]); }
        });
      };
      draw(); say("Where does this animal live? " + SK[id].clues[0]);
    };
    one();
  };

  // 3rd: measure skulls with calipers; compare with a bar graph; argue from evidence.
  PLAY.g3 = function () {
    const PX = 2.4;   // drawing pixels per millimetre, the same for every skull
    const ids = shuffle(D.IDS).slice(0, 3), meas = {}; let i = 0;
    const measure = (id, what, then) => {
      const sp = SK[id], real = sp[what === "len" ? "len" : "wid"], L = sp.len * PX, w = 360;
      const hgt = what === "len" ? sp.shape.h * L : L;
      const skull = what === "len" ? ART.side(sp, { L, x: 20, y: 0 }) : ART.top(sp, { L, cx: 20 + sp.wid * PX / 2, y: 0 });
      const top = what === "len" ? -(hgt * 1.1 + 10) : -10, h = what === "len" ? hgt * 1.1 + 70 : L + 60, base = what === "len" ? 40 : L + 10;
      let ticks = ""; for (let mm = 0; mm <= 140; mm += 10) ticks += `<path d="M ${20 + mm * PX} ${base} v ${mm % 50 ? 6 : 12}"/>` + (mm % 50 ? "" : `<text x="${20 + mm * PX}" y="${base + 24}">${mm}</text>`);
      screen(`${head(`Measure the ${nm(id)}'s skull ${what === "len" ? "length" : "width"}`, what === "len" ? "Slide the caliper until it touches the back of the skull." : "Slide the caliper until it touches the widest part of the cheekbones.")}
        <div class="sd-measure"><svg viewBox="0 ${top} ${w} ${h + 30}" role="img" aria-label="${esc(nm(id))} skull with a ruler in millimetres">${skull}
          <g class="sd-ruler" stroke="#2a2233" stroke-width="2"><path d="M 20 ${base} H ${20 + 140 * PX}"/>${ticks}</g>
          <path d="M 20 ${top} V ${base}" stroke="#c2552a" stroke-width="4"/><path id="sd-jaw" d="M 20 ${top} V ${base}" stroke="#c2552a" stroke-width="4"/></svg>
        <label class="sd-range"><span id="sd-mm">0 mm</span><input type="range" min="0" max="140" value="0" id="sd-cal" data-focus aria-label="Caliper, in millimetres"></label></div>
        <div class="sd-row">${btn("check", "Check", "sd-go")}</div>`, {
        check: () => {
          const v = +$("sd-cal").value;
          if (Math.abs(v - real) <= 5) { meas[id] = meas[id] || {}; meas[id][what] = real; say(`${pick(PH.yes)} The ${nm(id)}'s skull is about ${real} millimetres ${what === "len" ? "long" : "wide"}.`).then(ok => ok && then()); }
          else say(v < real ? "Not touching yet. Slide a little farther." : "Too far! The caliper should just touch the bone. Slide back a little.");
        }
      });
      const r = $("sd-cal"), jaw = $("sd-jaw"), out = $("sd-mm");
      r.addEventListener("input", () => { const x = 20 + r.value * PX; jaw.setAttribute("d", `M ${x} ${top} V ${base}`); out.textContent = r.value + " mm"; r.setAttribute("aria-valuetext", r.value + " millimetres"); });
      say(`Measure the ${nm(id)}'s skull ${what === "len" ? "length. Slide the caliper until it just touches the back of the skull." : "width. Slide the caliper until it touches the widest part of the cheekbones."}`);
    };
    const next = () => {
      if (i >= ids.length) return graph();
      const id = ids[i++]; measure(id, "len", () => measure(id, "wid", () => { unlock(id); next(); }));
    };
    const graph = () => {
      const max = 130, bar = (id, k) => { const v = SK[id][k], mine = meas[id] && meas[id][k]; return `<div class="sd-gbar"><span>${esc(cap1(nm(id)))}</span><i style="width:${v / max * 100}%" class="${mine ? "mine" : ""}"></i><b>${v} mm</b></div>`; };
      screen(`${head("Your class data", "Orange bars are the skulls you measured; grey bars come from the lab's measurements.")}
        <div class="sd-graph"><h4>Skull length</h4>${D.IDS.map(id => bar(id, "len")).join("")}<h4>Skull width</h4>${D.IDS.map(id => bar(id, "wid")).join("")}</div>${nextBtn("Use the evidence")}`, { next: () => ask(0) });
      say("Here is your data. The orange bars are the skulls you measured. Now use the evidence.");
    };
    const QS = [
      { q: "Which skull is the biggest?", a: "badger", opts: ["mink", "badger", "marten"], why: "The badger's skull is the biggest and widest. Big jaw muscles help it bite and dig." },
      { q: "The otter's skull is almost as wide as the badger's, but flatter. How does a short, wide, flat head help the otter survive?", a: "swim", opts: [["swim", "It slips through water when hunting fish"], ["climb", "It helps it climb trees"], ["dig", "It helps it dig burrows"]], why: "A flat, wide head slips through water, so the otter can chase fish." },
      { q: "A dry summer shrinks the river. Which cousins would have the hardest time?", a: "water", opts: [["water", "Otter and mink"], ["trees", "Marten and fisher"], ["dig", "Badger"]], why: "Otters and mink hunt in water. When their habitat changes, they must move or go hungry." }
    ];
    const ask = k => {
      if (k >= QS.length) return solved("g3", "You measured skulls and used the numbers as evidence.");
      const q = QS[k], opts = q.opts.map(o => Array.isArray(o) ? o : [o, cap1(nm(o))]);
      screen(`${head(q.q)}<div class="sd-choices">${opts.map(([v, t]) => btn("o", esc(t), "sd-choice", ` data-v="${v}"`)).join("")}</div>`, {
        o: el => { if (el.dataset.v === q.a) { el.classList.add("sd-ok"); say(pick(PH.yes) + " " + q.why).then(ok => ok && ask(k + 1)); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say(q.q + " " + opts.map(o => o[1]).join(". Or, ") + "?");
    };
    scanner(pick(D.IDS), next);
  };

  // 4th: senses and the brain; the size of the smell bulbs; adapting to change.
  PLAY.g4 = function () {
    const steps = [];
    const path = (id, from, to, line, done) => {
      let stage = 0;
      screen(`${head(line)}<div class="sd-skull sd-tap">${skullPic(id, "side", { parts: true, brain: true })}</div>`, {});
      view.querySelectorAll("[data-part]").forEach(el => { el.dataset.act = "part"; });
      acts.part = el => {
        const want = stage === 0 ? from : to, got = el.dataset.part;
        if (got === want) { view.querySelectorAll(`[data-part="${got}"]`).forEach(x => x.classList.add("sd-lit")); stage++; if (stage === 2) say(done).then(ok => ok && steps.shift()()); else say(to === "brainmass" ? "Now tap the brain, where the message goes." : "Now tap the smell bulb, the yellow part of the brain."); }
        else if (stage === 0) say(from === "eye" ? "First tap the eye hole." : "First tap the nose hole.");
        else say(to === "brainmass" ? "Tap the pink brain." : "Tap the yellow smell bulb.");
      };
      say(line);
    };
    const compare = () => {
      const ids = ["badger", "fisher", "otter"];
      screen(`${head("Who is the super-smeller?", "The yellow smell bulbs sit at the front of the brain. Bigger bulbs mean a stronger sense of smell.")}
        <div class="sd-row">${shuffle(ids).map(id => btn("b", `<div class="sd-mini-skull">${skullPic(id, "side", { brain: true })}</div><span>${esc(cap1(nm(id)))}</span>`, "sd-tile sd-wide", ` data-id="${id}"`)).join("")}</div>`, {
        b: el => { if (el.dataset.id === "badger") { el.classList.add("sd-ok"); unlock("badger"); say("Yes! The badger has the biggest smell bulbs. It sniffs out ground squirrels hiding under the dirt.").then(ok => ok && whyOtter()); } else { flash(el, false); say("Look at the yellow parts. Which is biggest?"); } }
      });
      say("Who is the super-smeller? Look at the yellow smell bulbs at the front of each brain.");
    };
    const whyOtter = () => {
      const opts = shuffle([["w", "Smells don't travel well under water, so it feels for fish with its whiskers"], ["f", "Otters don't need to find food"], ["t", "Otters live in trees"]]);
      screen(`${head("The otter has the smallest smell bulbs. Why might that be?")}<div class="sd-skull sd-small">${skullPic("otter", "side", { brain: true })}</div>
        <div class="sd-choices">${opts.map(([v, t]) => btn("o", esc(t), "sd-choice", ` data-v="${v}"`)).join("")}</div>`, {
        o: el => { if (el.dataset.v === "w") { el.classList.add("sd-ok"); unlock("otter"); say("That's it! Otters hunt under water, where smelling is hard. The big holes by the otter's nose carry nerves to its super-sensitive whiskers.").then(ok => ok && adapt()); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say("The otter has the smallest smell bulbs. Why might that be? " + opts.map(o => o[1]).join(". Or, ") + "?");
    };
    const adapt = () => {
      const opts = shuffle(["otter", "badger", "marten"]);
      screen(`${head("A long drought dries up the river. Whose senses and body are built for a world that is disappearing?")}<div class="sd-row">${opts.map(id => animalTile(id)).join("")}</div>`, {
        pick: el => { if (el.dataset.id === "otter") { el.classList.add("sd-ok"); say("Yes. The otter's whiskers, flat head, and small smell bulbs are made for water. If its river dries up, it must move, adapt, or its population shrinks.").then(ok => ok && solved("g4", "You traced messages from the senses to the brain, and saw how body parts fit a habitat.")); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say("A long drought dries up the river. Whose senses and body are built for a world that is disappearing?");
    };
    steps.push(() => path("badger", "nose", "bulb", "Smells go in the nose. Tap the nose hole, then tap the smell bulb that gets the message.", "Smell travels from the nose to the smell bulb, then into the brain."));
    steps.push(compare);
    scanner("fisher", () => path("fisher", "eye", "brainmass", "Light goes into the eye. Tap the eye, then tap the brain that makes sense of what it sees.", "The eye sends a message along a nerve to the brain, and the brain decides what to do."));
  };

  // 5th: teeth tell the diet; build a food chain from the Sun.
  PLAY.g5 = function () {
    const ids = shuffle(D.IDS).slice(0, 3); let i = 0;
    const TEETH = { slicer: "Slicer", crusher: "Crusher", mixed: "Slicer and crusher" };
    const teeth = () => {
      if (i >= ids.length) return whatIf();
      const id = ids[i]; const sp = SK[id], hgt = sp.shape.h * 300;
      screen(`${head(`Look at the ${nm(id)}'s teeth. Are they slicers, crushers, or both?`, "Slicers have sharp blades like scissors. Crushers are wide and bumpy.")}
        <div class="sd-skull sd-zoom"><svg viewBox="-10 -45 180 120" role="img" aria-label="Close-up of the ${esc(nm(id))}'s teeth">${ART.side(sp, { L: 300 })}</svg></div>
        <div class="sd-choices">${Object.keys(TEETH).map(t => btn("t", TEETH[t], "sd-choice", ` data-t="${t}"`)).join("")}</div>`, {
        t: el => { if (el.dataset.t === sp.teeth) { el.classList.add("sd-ok"); say(pick(PH.yes) + " " + sp.teethSay).then(ok => ok && foods(id)); } else { flash(el, false); say("Look closely at the big back teeth. " + pick(PH.no)); } }
      });
      say(`Look at the ${nm(id)}'s teeth. Are they slicers, crushers, or both?`);
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
      const lbl = k => k === id ? cap1(nm(id)) : cap1(D.FOODS[k]), pic = k => k === id ? ART.animal(SK[id], 90) : ART.icon(k);
      screen(`${head("Follow the energy!", `Tap the cards in order, starting with the Sun, to show how energy flows to the ${nm(id)}.`)}
        <div class="sd-chain" id="sd-chain"></div><div class="sd-foods">${cards.map(k => btn("c", `${pic(k)}<span>${lbl(k)}</span>`, "sd-food", ` data-k="${k}"`)).join("")}</div>`, {
        c: el => {
          if (el.dataset.k === order[n]) {
            el.disabled = true; el.classList.add("sd-used");
            $("sd-chain").insertAdjacentHTML("beforeend", (n ? `<i class="sd-arrow" aria-hidden="true">→</i>` : "") + `<div class="sd-link">${pic(order[n])}<span>${lbl(order[n])}</span></div>`);
            n++;
            if (n === order.length) { unlock(id); i++; say(`Energy from the Sun flows from ${order.slice(1).map(lbl).join(", to ")}. Every animal in the chain depends on the Sun.`).then(ok => ok && teeth()); }
          } else { flash(el, false); say(n === 0 ? "Start with the Sun. It gives the energy for everything." : n === 1 ? "What uses the Sun's energy to grow?" : `Who eats the ${lbl(order[n - 1]).toLowerCase()}?`); }
        }
      });
      say(`Follow the energy! Tap the cards in order, starting with the Sun.`);
    };
    const whatIf = () => {
      const opts = shuffle(["otter", "marten", "badger"]);
      screen(`${head("Pollution kills most of the fish in a river. Which cousin will go hungry first?")}<div class="sd-row">${opts.map(id => animalTile(id)).join("")}</div>`, {
        pick: el => { if (el.dataset.id === "otter") { el.classList.add("sd-ok"); say("Yes. Fish are the otter's main food. When one link in a food web breaks, the animals that depend on it are in trouble.").then(ok => ok && solved("g5", "You read teeth like a scientist and followed energy from the Sun through food chains.")); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say("Pollution kills most of the fish in a river. Which cousin will go hungry first?");
    };
    teeth();
  };

  // 6th: score shared skull features, build the family tree, think about look-alikes.
  PLAY.g6 = function () {
    const F = [
      { id: "flat", name: "Flat, low braincase", has: ["otter", "mink"] },
      { id: "short", name: "Short snout", has: ["otter", "mink"] },
      { id: "long", name: "Long snout and long tooth row", has: ["marten", "fisher"] },
      { id: "light", name: "Light build with big eye holes", has: ["marten", "fisher"] },
      { id: "ridge", name: "Tall ridge on top of the skull", has: ["fisher", "badger"] },
      { id: "wide", name: "Very wide, triangle-shaped skull", has: ["badger"] }
    ];
    const marks = {}; let k = 0;
    const feature = () => {
      if (k >= F.length) return table();
      const ft = F[k]; const sel = {};
      screen(`${head(`Feature ${k + 1} of ${F.length}: ${ft.name}`, "Tap every skull that has this feature, then tap Done.")}
        <div class="sd-skulls5">${D.IDS.map(id => btn("s", `<div class="sd-mini-skull">${skullPic(id)}</div><span>${esc(cap1(nm(id)))}</span>`, "sd-tile sd-wide", ` data-id="${id}" aria-pressed="false"`)).join("")}</div>
        <div class="sd-row">${btn("done", "Done", "sd-go")}</div>`, {
        s: el => { const id = el.dataset.id; sel[id] = !sel[id]; el.setAttribute("aria-pressed", sel[id]); el.classList.toggle("sd-sel", sel[id]); },
        done: () => {
          const want = new Set(ft.has), chose = Object.keys(sel).filter(x => sel[x]);
          if (chose.length === want.size && chose.every(x => want.has(x))) { marks[ft.id] = ft.has; k++; say(`Right: ${ft.has.map(nm).join(" and ")}.`).then(ok => ok && feature()); }
          else say(`Not quite. Look again for: ${ft.name}. Hint: ${want.size === 1 ? "only one skull" : want.size + " skulls"} have it.`);
        }
      });
      say(`Feature ${k + 1}: ${ft.name}. Tap every skull that has it, then tap done.`);
    };
    const table = () => {
      screen(`${head("Your feature table", "Which pairs share the most features? Shared features are clues to close relatives.")}
        <div class="sd-table-wrap"><table class="sd-table"><thead><tr><th>Feature</th>${D.IDS.map(id => `<th>${esc(cap1(nm(id)).replace("American ", ""))}</th>`).join("")}</tr></thead>
        <tbody>${F.map(ft => `<tr><td>${esc(ft.name)}</td>${D.IDS.map(id => `<td>${ft.has.includes(id) ? "●" : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${nextBtn("Build the tree")}`, { next: tree });
      say("Here is your feature table. Which pairs share the most features?");
    };
    const tree = () => {
      const slots = { a: null, b: null, c: null, d: null, e: null }; let held = null;
      const draw = () => {
        const slot = s => btn("slot", slots[s] ? `<div class="sd-mini-skull">${skullPic(slots[s])}</div><span>${esc(cap1(nm(slots[s])).replace("American ", ""))}</span>` : `<span>Empty</span>`, "sd-slot" + (slots[s] ? " full" : ""), ` data-s="${s}" aria-label="Tree spot ${s.toUpperCase()}${slots[s] ? ": " + esc(nm(slots[s])) : ", empty"}"`);
        const left = D.IDS.filter(id => !Object.values(slots).includes(id));
        screen(`${head("Build the family tree", "Close cousins go in the same pair. The cousin that branched off first goes on its own. Tap a skull, then tap a spot.")}
          <div class="sd-tree"><svg viewBox="0 0 400 120" aria-hidden="true" preserveAspectRatio="none"><g fill="none" stroke="#2a2233" stroke-width="5" stroke-linecap="round"><path d="M140 116 V90 M40 90 H240 M40 90 V8 M240 90 V60 M160 60 H320 M160 60 V36 M320 60 V36 M120 36 H200 M280 36 H360 M120 36 V8 M200 36 V8 M280 36 V8 M360 36 V8"/></g></svg>
            <div class="sd-tree-slots"><div>${slot("e")}</div><div class="sd-pairbox">${slot("a")}${slot("b")}</div><div class="sd-pairbox">${slot("c")}${slot("d")}</div></div></div>
          <div class="sd-skulls5">${left.map(id => btn("hold", `<div class="sd-mini-skull">${skullPic(id)}</div><span>${esc(cap1(nm(id)).replace("American ", ""))}</span>`, "sd-tile sd-wide" + (held === id ? " sd-sel" : ""), ` data-id="${id}" aria-pressed="${held === id}"`)).join("")}</div>
          ${left.length ? "" : `<div class="sd-row">${btn("check", "Check my tree", "sd-go", " data-focus")}</div>`}`, {
          hold: el => { held = el.dataset.id; draw(); say(cap1(nm(held)) + ". Now tap a spot on the tree."); },
          slot: el => { const s = el.dataset.s; if (slots[s]) { slots[s] = null; draw(); return; } if (!held) return say("First tap a skull."); slots[s] = held; held = null; draw(); },
          check: () => {
            const pair = (x, y) => [slots[x], slots[y]].sort().join();
            const P = D.TREE.pairs.map(p => p.slice().sort().join());
            const ok = slots.e === D.TREE.first && P.includes(pair("a", "b")) && P.includes(pair("c", "d")) && pair("a", "b") !== pair("c", "d");
            if (ok) { D.IDS.forEach(unlock); say("Your tree matches the one scientists built from DNA! The badger branched off first. Martens and fishers are close cousins, and so are otters and mink.").then(r => r && lookalike()); }
            else { say(slots.e !== D.TREE.first ? "Look at the feature table. Which skull shares the fewest features with the others? That one goes on its own." : "Check your pairs. Put together the two skulls that share the most features."); }
          }
        });
      };
      draw(); say("Build the family tree. Tap a skull, then tap a spot. Close cousins go in the same pair.");
    };
    const lookalike = () => {
      const opts = shuffle([["no", "No. A tall ridge helps any strong biter, so it can evolve more than once in different families."], ["yes", "Yes. Any shared feature proves they are closest cousins."], ["same", "Yes. Ridges only come from one ancestor."]]);
      screen(`${head("The fisher and the badger both have a tall ridge on top of the skull. Does that make them closest cousins?")}<div class="sd-choices">${opts.map(([v, t]) => btn("o", esc(t), "sd-choice", ` data-v="${v}"`)).join("")}</div>`, {
        o: el => { if (el.dataset.v === "no") { el.classList.add("sd-ok"); say("Exactly. Scientists look at many features, and DNA, because a single look-alike feature can fool you.").then(ok => ok && solved("g6", "You used shared skull features as evidence to build a family tree, just like a museum scientist.")); } else { flash(el, false); say("Think again. Could the same feature evolve twice?"); } }
      });
      say("The fisher and the badger both have a tall ridge on top of the skull. Does that make them closest cousins?");
    };
    feature();
  };

  /* ---------- top bar ---------- */
  $("sd-home").innerHTML = ART.UI.home; $("sd-say").innerHTML = ART.UI.speak;
  $("sd-home").addEventListener("click", () => (S.grade ? (CL && S.opts.lock ? menu() : grades()) : title()));
  $("sd-say").addEventListener("click", () => { if (lastLine) say(lastLine); });
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
        if ($("sd-reset").checked) { S.done = {}; S.cards = {}; }
        if (S.opts.lock) S.grade = S.opts.lock;
        save(); title();
      }
    });
  }

  if (S.grade && CL && S.opts.lock) menu(); else title();
})();
