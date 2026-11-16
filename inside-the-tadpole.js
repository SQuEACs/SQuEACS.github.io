/* ============================================================
   INSIDE THE TADPOLE: a CT-scan slice game for kindergarten to
   6th grade, built on the lab's iodine-stained scans of tadpoles
   and fish. Each grade has its own mission tied to a standard.
   Everything is read aloud, with captions.

   Uses inside-the-tadpole-art.js and inside-the-tadpole-data.js.
   The classroom edition sets window.TP_CLASSROOM = true first.
   ============================================================ */
(function () {
  const ART = window.TP_ART, D = window.TP_DATA, P = D.PARTS, UI = ART.UI;
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
  const btn = (act, inner, cls = "", extra = "") => `<button type="button" class="tp-btn ${cls}" data-act="${act}"${extra}>${inner}</button>`;
  const head = (q, sub = "") => `<div class="tp-head"><p class="tp-q">${esc(q)}</p>${sub ? `<p class="tp-sub">${esc(sub)}</p>` : ""}</div>`;
  const nextBtn = (label = "Next") => `<div class="tp-row">${btn("next", `${UI.go}<span>${label}</span>`, "tp-go", " data-focus")}</div>`;
  const flash = (el, ok) => { el.classList.remove("tp-ok", "tp-bad"); void el.offsetWidth; el.classList.add(ok ? "tp-ok" : "tp-bad"); };
  const partsOn = () => view.querySelectorAll("[data-part]").forEach(el => { el.dataset.act = "part"; });
  const lit = id => view.querySelectorAll(`[data-part="${id}"]`).forEach(x => x.classList.add("tp-lit"));
  // One multiple-choice question; resolves when answered right.
  function choose(q, opts, right, why, picture = "") {
    return new Promise(res => {
      const o = shuffle(opts);
      screen(`${head(q)}${picture}<div class="tp-choices">${o.map(([v, t]) => btn("o", esc(t), "tp-choice", ` data-v="${v}"`)).join("")}</div>`, {
        o: el => { if (el.dataset.v === right) { el.classList.add("tp-ok"); say(pick(PH.yes) + " " + why).then(ok => ok && res()); } else { flash(el, false); say(pick(PH.no)); } }
      });
      say(q + " " + o.map(x => x[1]).join(". Or, ") + "?");
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
          else if (P[got]) { flash(el, false); say(`That's the ${P[got].name}. ${prompt}`); }
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
      <p class="tp-std">Standards: ${esc(G.std)}</p></div>`, { start: () => PLAY[S.grade](), grades });
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

  /* ================= grade missions ================= */
  const PLAY = {};
  const STAGEPIC = s => `<div class="tp-stagepic">${ART.tadpole(s, { label: D.STAGES[s].name })}</div>`;
  const LIFE = [{ t: "Eggs in the pond", pic: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="3">${[[30, 40], [55, 35], [45, 60], [70, 58], [25, 66], [60, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="rgba(255,255,255,.7)"/><circle cx="${x}" cy="${y}" r="5" fill="#2a2233"/>`).join("")}</g></svg>` },
    { t: "Tadpole", pic: STAGEPIC(0) }, { t: "Tadpole with back legs", pic: STAGEPIC(2) }, { t: "Froglet", pic: STAGEPIC(3) },
    { t: "Adult frog", pic: `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2a2233" stroke-width="3"><ellipse cx="50" cy="62" rx="32" ry="22" fill="#5bb04b"/><circle cx="34" cy="38" r="11" fill="#5bb04b"/><circle cx="66" cy="38" r="11" fill="#5bb04b"/><circle cx="34" cy="38" r="4" fill="#2a2233"/><circle cx="66" cy="38" r="4" fill="#2a2233"/><path d="M36 66 q14 8 28 0" fill="none"/></g></svg>` }];

  PLAY.k = async function () {
    const list = shuffle([["eye", "Tap the eye.", P.eye.k], ["mouth", "Tap the mouth.", P.mouth.k], ["tail", "Tap the tail.", P.tail.k], ["gut", "Tap the curly gut in the belly.", P.gut.k], ["heart", "Tap the heart.", P.heart.k]]).slice(0, 4);
    await tapParts(() => ART.tadpole(0, { parts: true }), list);
    await choose("What does a tadpole use its tail for?", [["swim", "Swimming"], ["fly", "Flying"], ["dig", "Digging"]], "swim", "Swish, swish! The tail pushes the tadpole through the water.", `<div class="tp-pic tp-small">${ART.tadpole(0)}</div>`);
    solved("k", "You found the parts inside a tadpole and learned what they do.");
  };

  PLAY.g1 = async function () {
    await order("Put the frog's life cycle in order, starting with the eggs.", LIFE, "From eggs, to tadpole, to froglet, to frog. That's a life cycle!");
    await tapParts(() => ART.tadpole(1, { parts: true }), [["legs", "This tadpole has something new growing near its tail. Tap it!", "Back legs are starting to grow!"]]);
    await tapParts(() => ART.tadpole(2, { parts: true }), [["arms", "Now the CT scan shows front legs hiding under the skin. Tap them!", "Front legs grow inside before they pop out."]]);
    await tapParts(() => ART.tadpole(3, { parts: true }), [["tail", "The froglet has four legs. Tap the part that is getting smaller.", "The tail shrinks as the froglet gets ready for land."]]);
    await choose("A tadpole doesn't look like its frog parents. What happens as it grows?", [["grow", "It changes until it looks like its parents"], ["same", "It stays a tadpole forever"], ["fish", "It turns into a fish"]], "grow", "Young animals can look very different from their parents, but they grow up to be like them.");
    solved("g1", "You followed a tadpole all the way to a frog, inside and out.");
  };

  PLAY.g2 = async function () {
    await tapParts(() => ART.tadpole(0, { parts: true }), shuffle([
      ["gills", "A tadpole needs air, but it lives under water. Tap the part that takes air out of the water.", P.gills.k],
      ["gut", "A tadpole needs food. Tap the part that digests it.", P.gut.k],
      ["muscle", "A tadpole needs to escape from hungry fish. Tap the strong muscle that helps it swim fast.", P.muscle.k]
    ]));
    await choose("Where could a tadpole survive?", [["pond", "A pond with algae to eat"], ["sand", "Dry desert sand"], ["tree", "A tree top"]], "pond", "Tadpoles need water to breathe with their gills, and algae to eat.");
    await choose("Which animal also lives in the pond and might eat tadpoles?", [["fish", "A fish"], ["camel", "A camel"], ["owl", "A snowy owl"]], "fish", "Many animals share the pond: algae, tadpoles, insects, fish, frogs, and otters.");
    solved("g2", "You found the tadpole's survival kit: gills to breathe, a gut to eat, and muscles to swim.");
  };

  PLAY.g3 = async function () {
    await slicer("tadpole", shuffle(["eye", "gills", "heart", "gut", "noto"]).slice(0, 3), 0, "A CT scanner takes pictures in thin slices, like slicing a loaf of bread. Move the slice from head to tail.");
    const parts = shuffle([["eye", "out"], ["tail", "out"], ["mouth", "out"], ["gut", "in"], ["heart", "in"], ["gills", "in"], ["brain", "in"]]);
    let k = 0;
    await new Promise(res => {
      const one = () => {
        if (k >= parts.length) return res();
        const [id, side] = parts[k];
        screen(`${head(`Is the ${P[id].name} on the outside, or inside the body?`)}<div class="tp-pic tp-small">${ART.tadpole(0, { sys: { [id]: "nervous" } })}</div>
          <div class="tp-row">${btn("s", "Outside", "tp-choice tp-half", ' data-v="out"')}${btn("s", "Inside", "tp-choice tp-half", ' data-v="in"')}</div>`, {
          s: el => { if (el.dataset.v === side) { k++; say(`${pick(PH.yes)} The ${P[id].name} is ${side === "in" ? "an internal part. CT scans let us see it without cutting." : "an external part."}`).then(ok => ok && one()); } else { flash(el, false); say(pick(PH.no)); } }
        });
        say(`Is the ${P[id].name} on the outside, or inside the body? It is shown in yellow.`);
      };
      one();
    });
    await order("Now put the frog's life cycle in order.", LIFE, "Eggs, tadpole, tadpole with legs, froglet, frog. Every frog goes through this cycle.");
    solved("g3", "You sliced through a CT scan, sorted internal and external parts, and ordered the life cycle.");
  };

  PLAY.g4 = async function () {
    await tapParts(() => ART.tadpole(0, { parts: true }), [
      ["eye", "A shadow passes over the pond! Follow the message. First, tap what sees the shadow.", "The eye sees it."],
      ["brain", "The eye sends a message along a nerve. Tap where the message goes.", "The brain decides: danger! Swim away!"],
      ["cord", "Tap the part that carries the brain's message down the body.", "The spinal cord carries the message to the tail."],
      ["muscle", "Tap the part that does the swimming.", "The tail muscles pull, and the tadpole darts away."]
    ]);
    await slicer("tadpole", ["brain", "cord"], 0);
    await order("Put the escape in order.", [{ t: "The eye sees a shadow" }, { t: "A nerve carries the message to the brain" }, { t: "The brain decides to escape" }, { t: "The spinal cord carries the message to the tail" }, { t: "The tail muscles swim away" }], "Senses take in information, the brain processes it, and the body reacts.");
    await choose("A fish uses the same plan. Which part of the fish does the same job as the tadpole's eye?", [["eye", "The fish's eye"], ["gills", "The fish's gills"], ["bladder", "The fish's swim bladder"]], "eye", "Fish and tadpoles both see with eyes and think with a brain.", `<div class="tp-pic tp-small">${ART.fish()}</div>`);
    solved("g4", "You followed a message from the senses to the brain to the muscles.");
  };

  PLAY.g5 = async function () {
    screen(`${head("Unroll the gut!", "Slide to stretch out the tadpole's coiled gut and compare it with its body.")}
      <div class="tp-pic tp-small">${ART.tadpole(0)}</div>
      <svg class="tp-gutbar" viewBox="0 0 420 70" role="img" aria-label="Gut length compared with body length"><g stroke="#2a2233" stroke-width="3"><rect x="10" y="8" width="60" height="16" rx="8" fill="#cfe3a3"/><text x="78" y="22" font-size="14" stroke="none" fill="#2a2233">body</text><rect id="tp-gutr" x="10" y="38" width="10" height="16" rx="8" fill="#f0b46a"/></g></svg>
      <label class="tp-range"><span id="tp-gx">Gut</span><input type="range" min="0" max="100" value="0" id="tp-g" data-focus aria-label="Unroll the gut"></label>
      <div class="tp-row" id="tp-gok" hidden>${btn("next", `${UI.go}<span>Next</span>`, "tp-go")}</div>`, {});
    await new Promise(res => {
      acts.next = res;
      const r = $("tp-g"); let told = false;
      r.addEventListener("input", () => { $("tp-gutr").setAttribute("width", 10 + r.value * 3.9); $("tp-gx").textContent = `${(1 + r.value / 100 * 5.5).toFixed(1)}× body`; if (r.value > 95 && !told) { told = true; $("tp-gok").hidden = false; say("Wow! Unrolled, the gut is several times longer than the tadpole's whole body."); } });
      say("Unroll the gut! Slide to stretch out the tadpole's coiled gut.");
    });
    await choose("Why does a tadpole need such a long gut?", [["plant", "Algae is tough plant food, and takes a long time to digest"], ["meat", "It eats big animals whole"], ["air", "It stores air for swimming"]], "plant", "Plant eaters need long guts to get the energy out of tough plant food.");
    await choose("The froglet's gut gets much shorter. What does a frog eat?", [["bugs", "Insects and other small animals"], ["algae", "More algae"], ["nothing", "Nothing at all"]], "bugs", "Meat is easier to digest, so frogs have a shorter gut. Their bodies change to match their new food.", `<div class="tp-pic tp-small">${ART.tadpole(3)}</div>`);
    await order("Follow the energy, starting where it first comes from.", [{ t: "Sun" }, { t: "Algae" }, { t: "Tadpole" }, { t: "Fish" }, { t: "River otter" }], "The Sun's energy is captured by algae, then passes to the tadpole, the fish, and the otter.");
    await choose("Where did the energy in a tadpole's food first come from?", [["sun", "The Sun"], ["water", "The pond water"], ["mud", "The mud"]], "sun", "Algae use sunlight to make food. Animals get that energy by eating.");
    solved("g5", "You saw how a body fits its food, and followed energy from the Sun to the otter.");
  };

  PLAY.g6 = async function () {
    const SY6 = D.SYSTEMS, todo = shuffle(["brain", "eye", "cord", "gut", "mouth", "gills", "heart", "muscle", "noto"]), done = {};
    await new Promise(res => {
      let held = null;
      const draw = () => {
        const left = todo.filter(x => !done[x]);
        if (!left.length) return res();
        screen(`${head(held ? `Which system is the ${P[held].name} part of?` : "Tap a part of the tadpole, then pick its body system.", `${Object.keys(done).length} of ${todo.length} sorted`)}
          <div class="tp-pic tp-tap">${ART.tadpole(0, { parts: true, sys: done })}</div>
          <div class="tp-systems">${Object.keys(SY6).map(s => btn("sys", `<i style="background:${SY6[s].color}"></i><b>${SY6[s].name}</b><span>${SY6[s].job}</span>`, "tp-sys", ` data-s="${s}"${held ? "" : " disabled"}`)).join("")}</div>`, {});
        partsOn();
        acts.part = el => { const id = el.dataset.part; if (!todo.includes(id) || done[id]) return; held = id; draw(); say(`The ${P[id].name}. Which system is it part of?`); };
        acts.sys = el => {
          if (!held) return;
          if (el.dataset.s === P[held].sys) { done[held] = P[held].sys; const h = held; held = null; draw(); say(`${pick(PH.yes)} ${P[h].says || ""}`); }
          else { flash(el, false); say(`Think about the ${P[held].name}'s job. ${P[held].says || ""}`); }
        };
      };
      draw(); say("Tap a part of the tadpole, then pick its body system.");
    });
    await slicer("fish", ["bladder", "backbone"], 0, "Fish have the same body systems. Slice through a fish to find two parts the tadpole doesn't have.");
    await choose("A tadpole escapes from a fish. Which two systems work together most?", [["nm", "Nervous and muscular"], ["ds", "Digestive and skeletal"], ["rc", "Only the respiratory system"]], "nm", "The nervous system senses and decides, and the muscular system moves the body.");
    await choose("The gills take in oxygen. Which system carries it to the tail muscles?", [["c", "Circulatory"], ["d", "Digestive"], ["n", "Nervous"]], "c", "The heart pumps blood that carries oxygen from the gills to every part of the body.");
    solved("g6", "You sorted parts into body systems, and saw how systems work together in a tadpole and a fish.");
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
