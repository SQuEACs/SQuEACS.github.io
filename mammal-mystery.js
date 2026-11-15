/* ============================================================
   MAMMAL MYSTERY: a detective game for pre-K to 2nd grade.
   Detective Ollie reads clues aloud. Children tap the animal
   that matches. No reading needed: every screen is spoken.

   Uses mammal-mystery-art.js (drawings) and mammal-mystery-data.js
   (animals, clues, facts). The classroom edition sets
   window.MM_CLASSROOM = true before this file loads.
   ============================================================ */
(function () {
  const ART = window.MM_ART, D = window.MM_DATA;
  // Picture behind an animal: rabbits get a meadow, kangaroos the outback, others their habitat.
  const sceneOf = id => D.ANIMALS[id].scene || D.ANIMALS[id].hab;
  const CL = !!window.MM_CLASSROOM;
  const $ = id => document.getElementById(id);
  const root = $("mm-stage"); if (!root) return;
  const view = $("mm-view"), cap = $("mm-cap"), pop = $("mm-pop");
  const SAVE_KEY = CL ? "squeacs-mammal-mystery-classroom" : "squeacs-mammal-mystery";
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Say it a different way each time: deal from a shuffled pile of wordings, never the same one twice in a row.
  // The pile holds positions, not the sentences themselves, because many wordings name the current
  // animal or body part and must be rebuilt from the list passed in on every call.
  const piles = {}, lastSaid = {};
  function vary(key, list) {
    let p = piles[key];
    if (!p || !p.length || p.n !== list.length) {
      p = piles[key] = shuffle(list.map((_, i) => i)); p.n = list.length;
      if (p.length > 1 && p[p.length - 1] === lastSaid[key]) p.unshift(p.pop());
    }
    return list[(lastSaid[key] = p.pop())];
  }
  const PH = {
    yes: ["Yes!", "You got it!", "That's right!", "Hooray!", "Wow, yes!", "Nice work!", "Great spotting!"],
    solved: ["Mystery solved!", "Case closed!", "You cracked the case!", "Another mystery solved!", "Super sleuthing!"],
    toGuide: ["You earned a new sticker!", "A new sticker for your sticker book!", "Sticker time!", "Your sticker book just got bigger!"],
    notIt: ["Not this time!", "Hmm, not quite.", "Good guess, but no.", "Nope, keep looking!", "Close, but not this one."],
    moreClue: ["Here's another clue.", "Let's hear another clue.", "Listen for the next clue.", "Here comes another clue."],
    first: ["Clue one.", "Here's your first clue.", "First clue!", "Listen closely. Clue one."],
    next: ["Next clue.", "Another clue!", "Here's a new clue.", "Ooh, one more clue.", "Listen to this one."],
    last: ["Last clue!", "Here's the very last clue!", "Final clue!", "One last clue!"],
    who: ["Who am I?", "Who could it be?", "Which animal is it?", "Can you guess who I am?", "Who's hiding?"],
    newCase: ["Here's a new mystery!", "Another animal is hiding!", "Ready, detective? New mystery!", "Shh! Someone new is hiding.", "On to the next case!", "Grab your magnifying glass. New mystery!"],
    tryAgain: ["Try again!", "Give it another try!", "Have another go!", "You can do it. Try again!"],
    done: ["Great job!", "Super detective work!", "You did it!", "Fantastic!", "Way to go!"],
    lastLook: ["Look for the animal that matches all the clues!", "Think about every clue. Which animal fits them all?", "Which animal matches all the clues? Take a look!"],
    endStart: ["Great detective work!", "What a detective you are!", "Wonderful work, detective!", "You were amazing!"],
    pretty: ["Beautiful", "What a colorful", "I love your", "Gorgeous", "What a wonderful"],
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const nm = id => D.ANIMALS[id].name;
  const the = id => "the " + nm(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- saved progress ---------- */
  const S = Object.assign({ grade: null, found: {}, powers: {}, solved: 0, art: {}, cousins: 0, mute: false, opts: { lock: "", slow: false, caps: true, cases: 0 } }, load());
  function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* private mode: progress just isn't kept */ } }
  const urlGrade = new URLSearchParams(location.search).get("grade");
  if (urlGrade && D.GRADES[urlGrade]) S.grade = urlGrade;
  if (CL && S.opts.lock && D.GRADES[S.opts.lock]) S.grade = S.opts.lock;
  const G = () => S.grade || "pk";

  /* ---------- voice ---------- */
  const SY = "speechSynthesis" in window ? window.speechSynthesis : null;
  let voice = null, sayToken = 0;
  // Rank the device's English voices so the friendliest, most natural one wins.
  // Warm voices by platform: Apple Ava/Zoe/Samantha (Enhanced or Premium), Microsoft Natural voices (Edge),
  // Google voices (Chrome and Android). Joke voices and robotic engines are pushed to the bottom.
  const WARM = [/\bava\b/i, /\bzoe\b/i, /\bjenny\b/i, /\bemma\b/i, /\baria\b/i, /\bana\b/i, /\bsamantha\b/i, /\ballison\b/i, /\bsusan\b/i, /\bkaren\b/i, /\bmoira\b/i, /\bsonia\b/i, /\blibby\b/i, /\bmichelle\b/i, /google us english/i, /google uk english female/i];
  const SILLY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|ralph|junior|kathy|grandpa|grandma|rocko|shelley|flo|eddy|reed|sandy|espeak|compact/i;
  function voiceScore(v) {
    const n = v.name; let sc = 0;
    const w = WARM.findIndex(p => p.test(n)); if (w >= 0) sc += 60 - w * 2;
    if (/natural|neural|premium|enhanced|online/i.test(n)) sc += 40;
    if (/^en[-_]us/i.test(v.lang)) sc += 8; else if (/^en[-_](gb|au|ie|ca|nz)/i.test(v.lang)) sc += 5;
    if (/google/i.test(n)) sc += 10;
    if (v.localService === false) sc += 4;
    if (SILLY.test(n)) sc -= 200;
    if (/\bmale\b|daniel|david|mark|guy|alex|aaron|arthur|tom\b|james|george|ryan|eric|roger|christopher|andrew|brian/i.test(n)) sc -= 6;
    return sc;
  }
  let voices = [];
  function pickVoice() {
    if (!SY) return;
    voices = SY.getVoices().filter(v => /^en(-|_|$)/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
    voice = (S.opts.voice && voices.find(v => v.name === S.opts.voice)) || voices[0] || null;
  }
  const isNatural = () => !!voice && /natural|neural|premium|enhanced|online|google/i.test(voice.name);
  if (SY) { pickVoice(); SY.addEventListener && SY.addEventListener("voiceschanged", pickVoice); }
  function stopTalk() { sayToken++; if (SY) SY.cancel(); }
  // Say one line. Resolves when it finishes (or is interrupted). Captions show the words for grown-ups.
  function say(text, opt = {}) {
    const tok = opt.keep ? sayToken : ++sayToken;
    if (!opt.keep && SY) SY.cancel();
    showCap(text);
    return new Promise(res => {
      const fallback = () => setTimeout(res, Math.min(9000, 900 + text.length * 55));
      if (!SY || S.mute) return fallback();
      const u = new SpeechSynthesisUtterance(text.replace(/ossicones/g, "OSS-ih-cones"));
      if (voice) u.voice = voice;
      u.lang = (voice && voice.lang) || "en-US";
      // Gentle, unhurried story-time pace. Natural voices sound best at their own pitch; older voices get a small lift.
      u.rate = S.opts.slow ? 0.76 : G() === "pk" ? 0.86 : 0.92;
      u.pitch = isNatural() ? 1.0 : 1.06;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin;
      // Some browsers never fire onend: after the expected length, finish as soon as the voice goes quiet.
      const idle = () => { if (done) return; if (SY.speaking && tok === sayToken) setTimeout(idle, 250); else fin(); };
      setTimeout(idle, 1200 + text.length * 70 * (0.92 / u.rate));
      setTimeout(fin, 3000 + text.length * 130);   // hard stop in case the browser keeps saying it is speaking
      const go = () => { try { SY.speak(u); } catch (e) { fin(); } };
      // Chrome can drop an utterance queued right after cancel(); wait a moment only if something was playing.
      if (SY.speaking || SY.pending) { SY.cancel(); setTimeout(go, 80); } else go();
    }).then(() => tok === sayToken);   // true if nothing interrupted it
  }
  async function sayAll(lines, each) {
    const tok = ++sayToken; if (SY) SY.cancel();
    for (let i = 0; i < lines.length; i++) {
      if (tok !== sayToken) return false;
      if (each) each(i);
      await say(lines[i], { keep: true });
      if (tok !== sayToken) return false;
      await wait(250);
    }
    if (each) each(-1);
    return tok === sayToken;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let capT = 0;
  function showCap(t) { if (!S.opts.caps) { cap.hidden = true; return; } cap.textContent = t; cap.hidden = false; clearTimeout(capT); capT = setTimeout(() => { cap.hidden = true; }, 2000 + t.length * 80); }
  let lastPrompt = "";
  const prompt = t => { lastPrompt = t; return say(t); };

  /* ---------- little sounds (no files needed) ---------- */
  let AC = null;
  function tone(freq, t0, dur, type = "sine", vol = 0.08) {
    if (S.mute) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0;
      o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* sound is optional */ }
  }
  const sfx = {
    yes: () => { tone(523, 0, 0.18, "triangle"); tone(659, 0.1, 0.18, "triangle"); tone(784, 0.2, 0.3, "triangle"); },
    no: () => { tone(260, 0, 0.18, "sine", 0.06); tone(220, 0.14, 0.24, "sine", 0.06); },
    tap: () => tone(700, 0, 0.06, "triangle", 0.04),
    pop: () => { tone(420, 0, 0.07, "sine", 0.06); tone(840, 0.05, 0.1, "sine", 0.05); },
    whoosh: () => [330, 392, 494, 587].forEach((f, i) => tone(f, i * 0.08, 0.14, "triangle", 0.04)),
    power: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.22, "square", 0.03)),
    clue: () => { tone(880, 0, 0.08, "sine", 0.05); tone(1175, 0.07, 0.12, "sine", 0.05); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle", 0.07)),
  };

  /* ---------- screen helpers ---------- */
  let screenName = "";
  let showN = 0, onwardOff = null;
  function show(name, html) {
    stopTalk(); screenName = name; showN++; if (onwardOff) onwardOff(); closePop(true);
    view.className = "mm-view mm-s-" + name; view.innerHTML = html; view.scrollTop = 0;
    $("mm-home").hidden = name === "title";
    renderBar();
  }
  // After a success: say the line, then move on by itself. A Next arrow shows right away and a tap
  // anywhere on the screen skips ahead, so kids never sit waiting for the voice to finish.
  function onward(text, then, opt = {}) {
    if (onwardOff) onwardOff();
    const myShow = showN; let gone = false, armed = false;
    const nx = document.createElement("button");
    nx.type = "button"; nx.className = "mm-big mm-go mm-skip"; nx.setAttribute("aria-label", "Next"); nx.innerHTML = ART.icon("next");
    const tap = e => { e.stopPropagation(); e.preventDefault(); if (armed) { sfx.tap(); go(); } };
    const off = () => { view.removeEventListener("click", tap, true); nx.remove(); if (onwardOff === off) onwardOff = null; };
    const go = () => { if (gone) return; gone = true; off(); if (showN === myShow) { stopTalk(); then(); } };
    setTimeout(() => { armed = true; }, opt.hold || 400);   // ignore the double tap that got the answer
    view.addEventListener("click", tap, true); view.appendChild(nx); onwardOff = off;
    say(text).then(ok => { if (ok) setTimeout(go, 400); });
  }
  function renderBar() {
    const n = Object.keys(S.found).length;
    $("mm-badge").innerHTML = `${ART.icon("folder")}<b>${n}</b><span class="mm-sr"> of ${D.IDS.length} animals in your sticker book</span>`;
    $("mm-mute").setAttribute("aria-pressed", String(S.mute)); $("mm-mute").classList.toggle("off", S.mute);
  }
  const btn = (cls, attrs, inner) => `<button type="button" class="${cls}" ${attrs || ""}>${inner}</button>`;
  function confetti(host) {
    const box = document.createElement("div"); box.className = "mm-confetti"; box.setAttribute("aria-hidden", "true");
    const cols = ["#ff5fa2", "#2ed3c6", "#ffd23f", "#a47bff", "#7ccf68", "#ff9f6b"];
    for (let i = 0; i < 26; i++) { const s = document.createElement("i"); s.style.left = Math.random() * 100 + "%"; s.style.background = cols[i % cols.length]; s.style.animationDelay = Math.random() * 0.3 + "s"; s.style.setProperty("--dx", (Math.random() * 120 - 60) + "px"); box.appendChild(s); }
    (host || root).appendChild(box); setTimeout(() => box.remove(), 1800);
  }

  /* ---------- title ---------- */
  function title() {
    show("title", `
      <div class="mm-title">
        <div class="mm-title-art">${ART.detective()}</div>
        <h2 class="mm-logo"><span>Mammal</span> <span>Mystery</span></h2>
        <div class="mm-title-row">${["lion", "panda", "fox", "elephant", "kangaroo"].map(id => `<span class="mm-mini">${ART.animal(id, { face: true })}</span>`).join("")}</div>
        ${btn("mm-big mm-go", 'id="mm-play" aria-label="Play"', `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 8 L32 20 L13 32 Z" fill="#0b0a10"/></svg>`)}
        ${btn("mm-gear", `id="mm-gear" aria-label="${CL ? "Teacher" : "Grown-up"} settings: press and hold"`, ART.icon("gear"))}
      </div>`);
    $("mm-play").addEventListener("click", () => {
      sfx.tap();
      if (window.SQ_track && !CL) window.SQ_track("play", "mammal-mystery");
      if (CL && S.opts.lock) { S.grade = S.opts.lock; save(); return menu(true); }
      S.grade ? menu(true) : grades();
    });
    holdToOpen($("mm-gear"), teacherPanel);
  }

  /* ---------- grade picker ---------- */
  function grades() {
    const tiles = Object.entries(D.GRADES).map(([k, g], i) => btn("mm-tile mm-grade", `data-g="${k}" aria-label="${g.say}"`,
      `<span class="mm-grade-dots">${"<i></i>".repeat(i + 1)}</span><b>${g.name}</b>`)).join("");
    show("grades", `<div class="mm-head">${ART.detective()}<p class="mm-q">Which grade are you in?</p></div><div class="mm-grid4">${tiles}</div>`);
    prompt("Hi, I'm Detective Ollie! Which grade are you in? Pre-K, kindergarten, first grade, or second grade?");
    view.querySelectorAll(".mm-grade").forEach(b => b.addEventListener("click", () => { sfx.tap(); S.grade = b.dataset.g; save(); menu(true); }));
  }

  /* ---------- menu for a grade ---------- */
  function menu(greet) {
    const g = G(), items = [
      ["case", ART.icon("map"), "Expedition"],
      ["games", ART.icon("paw"), "Games"],
      ["guide", ART.icon("folder"), "Sticker book"],
    ];
    if (g === "g2") items.push(["family", ART.icon("tree"), "Family secrets"]);
    items.push(["color", ART.icon("crayon"), "Coloring"]);
    const locked = CL && S.opts.lock, rk = rankOf(S.solved || 0);
    show("menu", `
      <div class="mm-head">${ART.detective()}<p class="mm-q">${D.GRADES[g].say}</p>${btn("mm-rankchip", 'id="mm-rank" aria-label="Your detective rank"', badge(rk) + `<b>${RANKS[rk][1]}</b>`)}</div>
      <div class="mm-menu">${items.map(([k, ic, t], i) => btn("mm-tile mm-act" + (i === 0 ? " mm-main" : ""), `data-k="${k}" aria-label="${t}"`, `${ic}<b>${t}</b>`)).join("")}</div>
      ${locked ? "" : `<div class="mm-row mm-chips">${btn("mm-chip", 'id="mm-chg" aria-label="Change grade"', `<span class="mm-grade-dots sm">${"<i></i>".repeat(Object.keys(D.GRADES).indexOf(g) + 1)}</span>Change grade`)}${btn("mm-chip", 'id="mm-restart" aria-label="Start over"', ART.icon("replay") + "Start over")}</div>`}`);
    if (greet) prompt(`Hi, ${RANKS[rk][1]}! Tap the map to go on an expedition and find hidden animals. Tap the paw for games, the book for your stickers${g === "g2" ? ", the tree for family secrets," : ""} or the crayon to color.`);
    view.querySelectorAll(".mm-act").forEach(b => b.addEventListener("click", () => {
      sfx.tap(); const k = b.dataset.k;
      if (k === "case") startRound(); else if (k === "games") games(); else if (k === "guide") guide(); else if (k === "color") colorPick(); else family();
    }));
    $("mm-rank").addEventListener("click", () => { sfx.tap(); const nx = RANKS[rk + 1]; say(`You are a ${RANKS[rk][1]}!${nx ? ` Find ${nx[0] - (S.solved || 0)} more animals to become a ${nx[1]}.` : " That's the top rank!"}`); });
    const chg = $("mm-chg"); if (chg) chg.addEventListener("click", () => { sfx.tap(); grades(); });
    const rs = $("mm-restart"); if (rs) rs.addEventListener("click", () => { sfx.tap(); startOver(); });
  }
  // Start over: a fresh sticker book and rank for a new player (colorings stay).
  function startOver() {
    show("restart", `<div class="mm-head">${ART.detective()}<p class="mm-q">Start over?</p></div>
      <div class="mm-row">${btn("mm-big mm-yes", 'id="mm-rs-yes" aria-label="Yes, start over"', ART.icon("replay"))}${btn("mm-big mm-tog", 'id="mm-rs-no" aria-label="No, go back"', ART.icon("back"))}</div>`);
    prompt("Start a brand new detective case book? Your stickers will be cleared. Tap the green arrow to start over, or go back.");
    $("mm-rs-yes").addEventListener("click", () => { sfx.whoosh(); S.found = {}; S.powers = {}; S.solved = 0; S.cousins = 0; S.level = 1; save(); renderBar(); grades(); });
    $("mm-rs-no").addEventListener("click", () => { sfx.tap(); menu(false); });
  }

  /* ---------- the expedition: a map of habitats, one hidden animal at each stop ---------- */
  let R = null;
  const live = id => ({ cls: "mm-animal mm-live", label: nm(id) });
  const placeOf = id => ART.PLACE_NAMES[sceneOf(id)] || "wild";
  function startRound() {
    const g = G(), n = (CL && S.opts.cases) || D.GRADES[g].cases;
    // Prefer animals not yet in the field guide, then fill with any.
    const fresh = shuffle(D.IDS.filter(id => !S.found[id])), old = shuffle(D.IDS.filter(id => S.found[id]));
    R = { list: fresh.concat(old).slice(0, n), i: 0, stars: 0, rank0: rankOf(S.solved || 0), game: false };
    map(true);
  }
  // Where each stop sits on the map, in percent: a winding path, 4 stops to a row.
  function stopXY(i, n) {
    const per = Math.min(n, 4), rows = Math.ceil(n / per), r = Math.floor(i / per), c0 = i % per, c = r % 2 ? per - 1 - c0 : c0;
    const x = per === 1 ? 50 : 13 + (c / (per - 1)) * 74;
    const y = rows === 1 ? 50 + (c % 2 ? -16 : 14) : 18 + (r / (rows - 1)) * 64 + (c % 2 ? -5 : 5);
    return [x, y];
  }
  function map(first) {
    const n = R.list.length, here = R.i, pts = R.list.map((_, i) => stopXY(i, n));
    const from = here > 0 ? pts[here - 1] : [pts[0][0] - (n > 1 ? 8 : 0), pts[0][1] + 20];
    show("map", `
      <div class="mm-map">
        <svg class="mm-map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${[from].concat(pts).map(p => p.join(",")).join(" ")}" fill="none" stroke="#8a6440" stroke-width="1.6" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" style="stroke-width:5px"/></svg>
        ${R.list.map((id, i) => btn(`mm-stop${i < here ? " done" : i === here ? " now" : ""}`, `data-i="${i}" style="left:${pts[i][0]}%;top:${pts[i][1]}%" aria-label="${i < here ? cap1(nm(id)) + ", found" : "The " + placeOf(id)}"`,
          `<span class="mm-stop-hab">${ART.habitat(sceneOf(id))}</span>${i < here ? `<span class="mm-stop-sticker">${ART.animal(id, { face: true })}</span>` : `<span class="mm-stop-q">?</span>`}`)).join("")}
        <div class="mm-walker" id="mm-walker" style="left:${from[0]}%;top:${from[1]}%">${ART.detective()}</div>
      </div>
      ${btn("mm-big mm-go", 'id="mm-travel" aria-label="Go"', ART.icon("next"))}`);
    const where = "the " + placeOf(R.list[here]);
    const words = here === 0 ? `${first ? "Detective expedition! " : ""}We have ${n} animals to find. Our first stop is ${where}. Tap it to go!`
      : here === n - 1 ? `Last stop: ${where}! Tap it to go.` : `${vary("onward", ["Onward!", "Off we go!", "Next stop!", "Let's keep exploring!"])} Next stop is ${where}. Tap it to go.`;
    prompt(words);
    let going = false;
    const go = async () => {
      if (going) return; going = true; sfx.whoosh();
      const w = $("mm-walker"); w.classList.add("walk"); w.style.left = pts[here][0] + "%"; w.style.top = pts[here][1] + "%";
      stopTalk(); await wait(1300);
      if (screenName === "map") newCase();
    };
    view.querySelector(`.mm-stop[data-i="${here}"]`).addEventListener("click", go);
    $("mm-travel").addEventListener("click", go);
    view.querySelectorAll(".mm-stop.done").forEach(b => b.addEventListener("click", () => { sfx.tap(); say(cap1(nm(R.list[+b.dataset.i])) + "!"); }));
  }

  /* ---------- hide and seek: animals peek out from behind bushes, rocks and snow ---------- */
  function newCase() {
    const g = G(), id = R.list[R.i], hab = sceneOf(id);
    const others = shuffle(D.IDS.filter(x => x !== id)).slice(0, D.GRADES[g].suspects - 1);
    const spots = shuffle([id].concat(others));
    R.c = { id, suspects: spots, clues: teethFirst(D.ANIMALS[id].clues[g], g), shown: 0, wrong: 0, done: false };
    const n = spots.length, w = n <= 3 ? 27 : 22;
    show("case", `
      <div class="mm-case mm-hunt">
        <div class="mm-casebar"><span class="mm-casenum">${ART.icon("map")}<b>${R.i + 1}</b>/${R.list.length}</span><span class="mm-dots" id="mm-dots"></span></div>
        <div class="mm-cluebox">
          <div class="mm-ollie-sm">${ART.detective()}</div>
          <div class="mm-lens" id="mm-lens"></div>
          ${btn("mm-round mm-more", 'id="mm-more" aria-label="Another clue"', ART.icon("glass") + "<b>+</b>")}
        </div>
        <div class="mm-scene" id="mm-scene">
          <div class="mm-scene-bg">${ART.habitat(hab)}</div>
          ${spots.map((s, i) => btn("mm-spot", `data-id="${s}" aria-label="Hiding spot ${i + 1}" style="left:${(((i + 0.5) / n) * 100 - w / 2).toFixed(1)}%;bottom:${i % 2 ? 16 : 4}%;width:${w}%;--d:${(i * 1.3).toFixed(1)}s"`,
            `<span class="mm-peek">${ART.animal(s, { face: true, cls: "mm-animal mm-live" })}</span><span class="mm-prop">${ART.prop(hab, i)}</span>`)).join("")}
        </div>
      </div>`);
    view.querySelectorAll(".mm-spot").forEach(b => b.addEventListener("click", () => guess(b)));
    $("mm-more").addEventListener("click", () => { sfx.tap(); nextClue(); });
    const intro = R.i === 0 ? (g === "pk" ? `Shh! Animals are hiding in the ${placeOf(id)}. Listen to the clue, then tap where the right animal is hiding.` : `Shh! Animals are hiding in the ${placeOf(id)}. Listen to each clue, then tap the hiding spot of the animal that matches.`)
      : vary("newCase", [`We're in the ${placeOf(id)}! Who is hiding here?`, `Shh! Someone is hiding in the ${placeOf(id)}.`, `Look closely! Animals are hiding in the ${placeOf(id)}.`, `Welcome to the ${placeOf(id)}! Let's find the hidden animal.`]);
    say(intro).then(ok => { if (ok) nextClue(); });
  }
  function dots() { const c = R.c; $("mm-dots").innerHTML = c.clues.map((_, i) => `<i class="${i < c.shown ? "on" : ""}"></i>`).join(""); $("mm-more").disabled = c.shown >= c.clues.length || c.done; }
  function clueArt(id, cl) {
    const [type, arg] = cl;
    if (type === "part") {
      let [x, y, w, h] = ART.box(id, arg);
      if (arg === "fur") { const L = ART.SPEC[id].L; x = L.bx - 60; y = L.by - 60; w = 120; h = 120; }
      if (arg !== "fur" && w > h * 1.6) w = w / 2;   // a pair (eyes, ears, paws): zoom on one
      const s = Math.max(w, h) * 1.5 + 24, cx = x + w / 2, cy = y + h / 2;
      return `<div class="mm-zoom">${ART.animal(id, { hab: sceneOf(id), cls: "mm-animal mm-live", vb: `${(cx - s / 2).toFixed(1)} ${(cy - s / 2).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`, label: "A close-up clue" })}</div>`;
    }
    if (type === "shadow") return `<div class="mm-zoom mm-shadow">${ART.animal(id, { hab: sceneOf(id), label: "The animal's shadow" })}</div>`;
    if (type === "hab") return `<div class="mm-zoom mm-pic">${ART.habitat(D.ANIMALS[id].hab === arg ? sceneOf(id) : arg)}</div>`;
    if (type === "teeth") return `<div class="mm-zoom mm-pic">${ART.teeth(id)}</div>`;
    if (type === "food") return `<div class="mm-zoom mm-pic mm-foodclue">${ART.food(arg)}</div>`;
    return "";
  }
  // 2nd grade always sees the teeth first, so every child studies them before guessing.
  function teethFirst(cl, g) { return g === "g2" ? cl.filter(c => c[0] === "teeth").concat(cl.filter(c => c[0] !== "teeth")) : cl; }
  function nextClue() {
    const c = R.c; if (c.done || c.shown >= c.clues.length) return;
    const cl = c.clues[c.shown++];
    const lens = $("mm-lens");
    lens.innerHTML = `<div class="mm-clue-card new">${clueArt(c.id, cl)}<button type="button" class="mm-hear" aria-label="Hear the clue again">${ART.icon("speaker")}</button></div>`;
    lens.querySelector(".mm-hear").addEventListener("click", () => say(cl[2]));
    dots(); sfx.clue();
    const word = c.shown === 1 ? vary("first", PH.first) : c.shown === c.clues.length ? vary("last", PH.last) : vary("next", PH.next);
    prompt(`${word} ${cl[2]} ${vary("who", PH.who)}`);
  }
  async function guess(b) {
    const c = R.c; if (c.done || b.classList.contains("gone") || b.classList.contains("out")) return;
    const id = b.dataset.id, scene = $("mm-scene");
    b.classList.add("out"); sfx.pop();
    if (id === c.id) {
      c.done = true; dots(); R.stars++;
      const first = !S.found[id]; S.found[id] = S.found[id] || G(); S.solved = (S.solved || 0) + 1; save(); renderBar();
      view.querySelectorAll(".mm-spot").forEach(s => { if (s !== b) s.classList.add("gone"); });
      scene.insertAdjacentHTML("beforeend", `<div class="mm-found" style="--x:${parseFloat(b.style.left) + parseFloat(b.style.width) / 2}%">${ART.animal(id, live(id))}</div><div class="mm-stamp" aria-hidden="true">FOUND!</div>`);
      sfx.yes(); confetti(view); call(id);
      onward(`${vary("yes", PH.yes)} You found ${the(id)}! ${vary("solved", PH.solved)}${first ? " " + vary("toGuide", PH.toGuide) : ""}`, () => caseFile(id, afterFile), { hold: 900 });
      return;
    }
    c.wrong++; sfx.no(); b.setAttribute("aria-label", nm(id) + ", not this one");
    const more = c.shown < c.clues.length;
    const ok = await say(`${vary("notMe", ["Not me!", "It's not me!", "Nope, not me!", "Peekaboo! Not me!"])} I'm ${the(id)}. ${more ? vary("moreClue", PH.moreClue) : vary("keepLook", ["Keep looking!", "Try another spot!"])}`);
    b.classList.remove("out"); b.classList.add("gone");
    if (!ok || c.done) return;
    if (more) nextClue();
    else { view.querySelector(`.mm-spot[data-id="${c.id}"]`).classList.add("hint"); prompt(vary("lastLook", PH.lastLook)); }
  }
  function afterFile() { superpower(R.c.id, grade_bonus); }
  function grade_bonus() {
    const g = G(), id = R.c.id;
    if (g === "k") return bonusParts(id);
    if (g === "g1") return bonusHome(id);
    if (g === "g2") return bonusDiet(id);
    nextCaseOrEnd();
  }
  function nextCaseOrEnd() {
    R.i++;
    // Halfway through, a quick bonus game: shadows for the youngest, footprints for 1st and 2nd.
    if (!R.game && R.i === Math.ceil(R.list.length / 2) && R.i < R.list.length && R.list.length >= 3) {
      R.game = true; return miniGame(G() === "pk" || G() === "k" ? "shadow" : "tracks", 2, () => map());
    }
    if (R.i < R.list.length) map(); else roundEnd();
  }
  function roundEnd() {
    sfx.win();
    const solved = S.solved || 0, rk = rankOf(solved), up = rk > R.rank0, nx = RANKS[rk + 1];
    show("end", `<div class="mm-end">
      <div class="mm-rankcard${up ? " up" : ""}">${badge(rk)}<b>${RANKS[rk][1]}</b>${nx ? `<span class="mm-rankbar"><i style="width:${Math.round(100 * (solved - RANKS[rk][0]) / (nx[0] - RANKS[rk][0]))}%"></i></span>` : ""}</div>
      <div class="mm-stars">${R.list.map(id => `<span class="mm-mini mm-sticker">${ART.animal(id, { face: true })}</span>`).join("")}</div>
      <div class="mm-row">${btn("mm-big mm-again", 'id="mm-again" aria-label="Play again"', ART.icon("replay"))}${btn("mm-big mm-tog", 'id="mm-toguide" aria-label="Sticker book"', ART.icon("folder"))}</div></div>`);
    confetti(view); if (up) setTimeout(() => confetti(view), 700);
    const n = Object.keys(S.found).length;
    prompt(`${vary("endStart", PH.endStart)} You found ${R.list.length} animals on this expedition.${up ? ` You leveled up! You are now a ${RANKS[rk][1]}!` : nx ? ` Find ${nx[0] - solved} more to become a ${nx[1]}.` : ""} Your sticker book has ${n} of ${D.IDS.length} animals.`);
    $("mm-again").addEventListener("click", () => { sfx.tap(); startRound(); });
    $("mm-toguide").addEventListener("click", () => { sfx.tap(); guide(); });
  }

  /* ---------- detective ranks ---------- */
  const RANKS = D.RANKS;
  function rankOf(n) { let r = 0; RANKS.forEach(([min], i) => { if (n >= min) r = i; }); return r; }
  function badge(rk) {
    const col = RANKS[rk][2];
    return `<svg class="mm-rank" viewBox="0 0 100 100" aria-hidden="true"><path d="M 30 60 L 18 94 L 34 86 L 42 98 L 50 66 Z M 70 60 L 82 94 L 66 86 L 58 98 L 50 66 Z" fill="#d8304f" stroke="#2a2233" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="42" r="34" fill="${col}" stroke="#2a2233" stroke-width="6"/>` +
      Array.from({ length: rk + 1 }, (_, i) => { const a = (i - rk / 2) * 22, x = 50 + Math.sin(a * Math.PI / 180) * (rk ? 16 : 0), y = 44 - Math.cos(a * Math.PI / 180) * (rk ? 6 : 0); return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${rk > 2 ? 0.55 : 0.75})" d="M 0 -18 L 5 -6 L 18 -5 L 8 4 L 11 17 L 0 10 L -11 17 L -8 4 L -18 -5 L -5 -6 Z" fill="#fff" stroke="#2a2233" stroke-width="3" stroke-linejoin="round"/>`; }).join("") + `</svg>`;
  }

  /* ---------- real animal calls (only when a recording has been added in MM_DATA.SOUNDS) ---------- */
  let callAudio = null;
  function call(id) {
    const s = D.SOUNDS && D.SOUNDS[id];
    if (S.mute || !s || !s.src) return;
    try { if (callAudio) callAudio.pause(); callAudio = new Audio(s.src); callAudio.volume = 0.7; callAudio.play().catch(() => {}); } catch (e) { /* optional */ }
  }

  /* ---------- animal superpowers: tap the glowing part and watch it work ---------- */
  function fx(host, kind, x, y) {
    const box = document.createElement("div"); box.className = "mm-fx mm-fx-" + kind; box.style.left = x + "%"; box.style.top = y + "%"; box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 14; i++) { const s = document.createElement("i"); s.style.setProperty("--a", (i * 26 + Math.random() * 20) + "deg"); s.style.setProperty("--r", (70 + Math.random() * 80) + "px"); s.style.animationDelay = (i * 0.09) + "s"; box.appendChild(s); }
    host.appendChild(box); setTimeout(() => box.remove(), 2600);
  }
  function superpower(id, then) {
    const pw = D.POWERS[id], g = G();
    if (!pw) return then();
    show("power", `<div class="mm-bonus mm-power"><div class="mm-head">${ART.detective()}<p class="mm-q mm-powername">${ART.icon("star")}<span>${pw.name}</span></p></div>
      <div class="mm-bigpic" id="mm-bigpic">${ART.animal(id, { hab: sceneOf(id), cls: "mm-animal mm-live", label: nm(id) })}</div>
</div>`);
    const pic = $("mm-bigpic"), svg = pic.querySelector("svg"), word = partWord(id, pw.part);
    const glow = on => svg.querySelectorAll(`[data-part="${pw.part}"]:not(.mm-hitlayer)`).forEach(x => x.classList.toggle("mm-pulse", on));
    glow(true);
    prompt(`${vary("power", ["Every animal has a superpower!", "Superpower time!", "Let's see a superpower!"])} Tap ${the(id)}'s ${word} to see what it can do!`);
    let done = false, miss = 0;
    const fire = async () => {
      done = true; glow(false); sfx.power();
      svg.classList.add("mm-act-" + pw.act);
      const [x, y, w, h] = ART.box(id, pw.part);
      fx(pic, pw.fx, ((x + w / 2) / 400) * 100, ((y + h / 2) / 400) * 100);
      if (pw.act === "roar" || pw.act === "pounce") call(id);
      const first = !(S.powers || {})[id]; S.powers = S.powers || {}; S.powers[id] = 1; save();
      if (first) pic.insertAdjacentHTML("beforeend", `<div class="mm-flystar" aria-hidden="true">${ART.icon("star")}</div>`);
      setTimeout(() => svg.classList.remove("mm-act-" + pw.act), 2600);
      onward(pw.say[g] + (first ? " " + vary("powSticker", ["You earned a superpower sticker!", "A superpower sticker for your book!", "Superpower sticker unlocked!"]) : ""), then, { hold: 1200 });
    };
    svg.addEventListener("click", e => {
      if (done) return;
      const p = e.target.closest("[data-part]");
      if (p && p.dataset.part === pw.part) return fire();
      sfx.no(); miss++;
      say(miss >= 2 ? `Look for the glowing ${word}!` : `Find the ${word}! It's glowing.`);
      if (miss >= 3) fire();
    });
  }

  /* ---------- mini-games: shadow match and footprint match ---------- */
  function miniGame(kind, rounds, then) {
    let k = 0, used = new Set();
    const one = () => {
      if (k >= rounds) { sfx.win(); confetti(view); onward(vary("done", PH.done) + " " + (kind === "shadow" ? "You're a shadow expert!" : "You're a super tracker!"), then); return; }
      const pool = shuffle(D.IDS.filter(id => !used.has(id)));
      const id = pool[0]; used.add(id);
      // Distractors with a different footprint shape, so every question has one clear answer.
      const opts = shuffle([id].concat(shuffle(D.IDS.filter(x => x !== id && (kind !== "tracks" || ART.TRACK_KIND[x] !== ART.TRACK_KIND[id]))).slice(0, 2)));
      const big = kind === "shadow" ? `<div class="mm-bigpic mm-sil" id="mm-sil" data-a="${id}">${ART.animal(id, { label: "Whose shadow is this?" })}</div>`
        : `<div class="mm-bigpic mm-trackpic" id="mm-sil" data-a="${id}">${ART.track(id, { bare: true, label: "Whose footprints are these?" })}</div>`;
      show("game", `<div class="mm-bonus mm-game"><div class="mm-head">${ART.detective()}<p class="mm-q">${ART.icon(kind === "shadow" ? "shadow" : "paw")}<span class="mm-gdots">${Array.from({ length: rounds }, (_, i) => `<i class="${i < k ? "on" : ""}"></i>`).join("")}</span></p></div>
        ${big}<div class="mm-choices mm-pick3">${opts.map(o => btn("mm-choice mm-pick", `data-id="${o}" aria-label="${nm(o)}"`, ART.animal(o, { face: true, cls: "mm-animal mm-live" }))).join("")}</div></div>`);
      prompt(kind === "shadow" ? vary("shQ", ["Whose shadow is this? Tap the animal.", "Look at the shape! Whose shadow is it?", "Shadow match! Which animal makes this shadow?"])
        : vary("trQ", ["Whose footprints are these? Tap the animal.", "Tracker time! Who left these footprints?", "Look at the toes and claws. Who made these tracks?"]));
      let busy = false;
      view.querySelectorAll(".mm-pick").forEach(b => b.addEventListener("click", async () => {
        if (busy || b.classList.contains("nope")) return;
        if (b.dataset.id === id) {
          busy = true; sfx.yes(); b.classList.add("yes"); k++;
          const pic = $("mm-sil");
          if (kind === "shadow") pic.classList.add("reveal");
          else pic.insertAdjacentHTML("beforeend", `<div class="mm-walkby">${ART.animal(id, live(id))}</div>`);
          onward(`${vary("yes", PH.yes)} ${kind === "shadow" ? `It's ${the(id)}!` : D.TRACK_SAY[id]}`, one, { hold: 900 });
        } else {
          sfx.no(); b.classList.add("nope");
          say(`${kind === "shadow" ? "That's" : "Those aren't"} ${kind === "shadow" ? the(b.dataset.id) + "." : the(b.dataset.id) + "'s tracks."} ${vary("tryAgain", PH.tryAgain)}`);
        }
      }));
    };
    one();
  }
  function games() {
    show("games", `<div class="mm-head">${ART.detective()}<p class="mm-q">Games</p></div>
      <div class="mm-menu">${btn("mm-tile mm-act", 'data-k="shadow" aria-label="Shadow match"', ART.icon("shadow") + "<b>Shadow match</b>")}${btn("mm-tile mm-act", 'data-k="tracks" aria-label="Footprint match"', ART.icon("paw") + "<b>Footprints</b>")}</div>`);
    prompt("Pick a game! Tap the shadow to match animal shadows, or the paw to match footprints.");
    view.querySelectorAll(".mm-act").forEach(b => b.addEventListener("click", () => { sfx.tap(); miniGame(b.dataset.k, 4, () => menu(false)); }));
  }

  /* ---------- case file popup: photo and facts for this grade ---------- */
  function caseFile(id, then) {
    const a = D.ANIMALS[id], g = G(), facts = a.facts[g], ph = D.PHOTOS[id];
    const pic = ph && ph.src
      ? `<figure class="mm-photo"><img src="${ph.src}" alt="Photo of a ${a.name}" onerror="this.parentNode.classList.add('mm-nophoto');this.remove()"><figcaption>${ph.credit}</figcaption>${ART.animal(id, { cls: "mm-photo-fallback", label: a.name })}</figure>`
      : `<figure class="mm-photo mm-nophoto">${ART.animal(id, { cls: "mm-photo-fallback", hab: sceneOf(id), label: a.name })}</figure>`;
    pop.innerHTML = `
      <div class="mm-file" role="dialog" aria-modal="true" aria-labelledby="mm-file-name">
        <div class="mm-file-tab">${ART.icon("folder")}<span>CASE FILE</span></div>
        <div class="mm-file-body">
          ${pic}
          <div class="mm-file-text">
            <h3 id="mm-file-name">${cap1(a.name)}</h3>
            <p class="mm-where">${ART.habitat(sceneOf(id))}<span>${a.where}</span></p>
            <ul class="mm-facts">${facts.map((f, i) => `<li data-i="${i}"><button type="button" class="mm-hear sm" aria-label="Hear this fact">${ART.icon("speaker")}</button><span>${f}</span></li>`).join("")}</ul>
          </div>
        </div>
        ${btn("mm-big mm-go mm-file-next", 'id="mm-file-next" aria-label="Next"', ART.icon("next"))}
      </div>`;
    pop.hidden = false; root.classList.add("mm-popped");
    const lis = pop.querySelectorAll(".mm-facts li");
    lis.forEach(li => li.querySelector("button").addEventListener("click", () => { lis.forEach(x => x.classList.toggle("now", x === li)); say(facts[+li.dataset.i]).then(() => li.classList.remove("now")); }));
    $("mm-file-next").addEventListener("click", () => { sfx.tap(); closePop(); then && then(); });
    $("mm-file-next").focus({ preventScroll: true });
    sayAll([`Case file: the ${a.name}.`].concat(facts), i => lis.forEach((x, j) => x.classList.toggle("now", j === i - 1)));
  }
  function closePop(silent) { if (pop.hidden) return; pop.hidden = true; pop.innerHTML = ""; root.classList.remove("mm-popped"); if (!silent) stopTalk(); }

  /* ---------- bonus: Kindergarten taps body parts ---------- */
  function bonusParts(id) {
    const a = D.ANIMALS[id];
    const parts = shuffle([...new Set(a.clues.k.filter(c => c[0] === "part" && c[1] !== "fur").map(c => c[1]))]).slice(0, 2);
    let k = 0, miss = 0;
    show("parts", `<div class="mm-bonus"><div class="mm-head">${ART.detective()}<p class="mm-q">Detective check!</p></div><div class="mm-bigpic" id="mm-bigpic">${ART.animal(id, { hab: sceneOf(id) })}</div></div>`);
    const svg = view.querySelector("#mm-bigpic svg");
    const ask = () => { const w = `${the(id)}'s ${partWord(id, parts[k])}`; prompt(vary("ask", [`Detective check! Can you tap ${w}?`, `Can you find ${w}? Give a tap!`, `Show me ${w}!`, `Point to ${w} with your finger!`])); };
    ask();
    svg.addEventListener("click", async e => {
      const g = e.target.closest("[data-part]"); if (!g || k >= parts.length) return;
      const want = parts[k], got = g.dataset.part;
      if (got === want) {
        sfx.yes(); svg.querySelectorAll(`[data-part="${want}"]`).forEach(x => x.classList.add("mm-glow")); miss = 0;
        k++;
        const line = `${vary("yes", PH.yes)} ${cap1(partWord(id, want))}. ${cap1(a.name)}s have ${a.partWhy[want] || "these"}.`;
        if (k < parts.length) onward(line, () => { svg.querySelectorAll(".mm-glow").forEach(x => x.classList.remove("mm-glow")); ask(); });
        else { confetti(view); onward(line + " " + vary("done", PH.done), nextCaseOrEnd); }
      } else {
        sfx.no(); miss++;
        await say(vary("partNo", [`That's the ${partWord(id, got)}. Find the ${partWord(id, want)}!`, `Oops, that's the ${partWord(id, got)}. Look for the ${partWord(id, want)}!`, `That's the ${partWord(id, got)}. Can you spot the ${partWord(id, want)}?`]));
        if (miss >= 2) svg.querySelectorAll(`[data-part="${want}"]`).forEach(x => x.classList.add("mm-pulse"));
      }
    });
  }
  function partWord(id, p) { return (D.PART_SAY[p] && D.PART_SAY[p][id]) || D.PARTS[p] || p; }

  /* ---------- bonus: 1st grade picks the habitat ---------- */
  function bonusHome(id) {
    const a = D.ANIMALS[id];
    const opts = shuffle([a.hab].concat(shuffle(Object.keys(ART.HAB_NAMES).filter(h => h !== a.hab)).slice(0, 2)));
    show("home", `<div class="mm-bonus"><div class="mm-head">${ART.detective()}<span class="mm-mini big">${ART.animal(id, { face: true })}</span></div>
      <div class="mm-choices">${opts.map(h => btn("mm-choice", `data-h="${h}" aria-label="${ART.HAB_NAMES[h]}"`, ART.habitat(h === a.hab ? sceneOf(id) : h))).join("")}</div></div>`);
    prompt(vary("where", [`Where does ${the(id)} live? Tap its home.`, `Which home belongs to ${the(id)}? Tap it!`, `Help ${the(id)} get home! Tap where it lives.`]));
    let busy = false;
    view.querySelectorAll(".mm-choice").forEach(b => b.addEventListener("click", async () => {
      if (busy || b.classList.contains("nope")) return;
      const h = b.dataset.h;
      if (h === a.hab) {
        busy = true; sfx.yes(); b.classList.add("yes"); confetti(view);
        const habClue = a.clues.g1.find(c => c[0] === "hab");
        onward(`${vary("yes", PH.yes)} ${cap1(the(id))} lives in the ${ART.HAB_NAMES[h].toLowerCase()}. ${habClue ? habClue[2].replace(/^I /, "It ").replace(/\bmy\b/g, "its").replace(/\bI\b/g, "it").replace(/\bme\b/g, "it") : ""}`, nextCaseOrEnd);
      } else {
        sfx.no(); b.classList.add("nope");
        say(`${vary("habNo", ["Hmm, not the", "It doesn't live in the", "Not the"])} ${ART.HAB_NAMES[h].toLowerCase()}. ${vary("tryAgain", PH.tryAgain)}`);
      }
    }));
  }

  /* ---------- bonus: 2nd grade picks carnivore, herbivore, or omnivore ---------- */
  // What the teeth tell us, by back-tooth shape.
  function teethTip(id) {
    const t = ART.TEETH[id] || {};
    if (t.cheek === "blade") return "See the sharp, pointy teeth? Teeth like scissors slice meat.";
    if (t.cheek === "bumpy") return "See the pointy front teeth and the bumpy back teeth? Bumpy teeth can mash lots of different foods.";
    return t.can === "big" ? "See the big, flat back teeth? Flat teeth grind and crush plants." : "See the flat back teeth? Flat teeth grind and crush plants.";
  }
  function bonusDiet(id) {
    const a = D.ANIMALS[id];
    show("diet", `<div class="mm-bonus"><div class="mm-head">${ART.detective()}<span class="mm-mini big">${ART.animal(id, { face: true })}</span><div class="mm-diet-teeth" aria-label="${cap1(nm(id))}'s teeth">${ART.teeth(id)}</div></div>
      <div class="mm-choices">${["meat", "plants", "both"].map(k => btn("mm-choice mm-diet", `data-d="${k}" aria-label="${D.DIET[k].word}: ${D.DIET[k].kid}"`, `${ART.food(k)}<b>${cap1(D.DIET[k].word)}</b><small>${D.DIET[k].kid}</small>`)).join("")}</div></div>`);
    prompt(`${vary("eat", [`Look at ${the(id)}'s teeth. What does it eat?`, `Detective question: check the teeth! What does ${the(id)} eat?`, `Teeth are clues! What does ${the(id)} eat?`])} ${teethTip(id)} Meat makes it a carnivore. Plants make it an herbivore. Both make it an omnivore.`);
    view.querySelectorAll(".mm-diet").forEach(b => b.addEventListener("click", async () => {
      if (b.classList.contains("nope")) return;
      const d = b.dataset.d;
      if (d === a.diet) {
        sfx.yes(); b.classList.add("yes"); confetti(view);
        const extra = id === "panda" ? " Pandas eat like herbivores, even though they belong to the carnivoran group!" : "";
        onward(`${vary("yes", PH.yes)} ${cap1(a.name)}s eat ${d === "both" ? "plants and animals" : d}, so they are ${D.DIET[d].word}s.${extra}`, nextCaseOrEnd);
      } else {
        sfx.no(); b.classList.add("nope");
        say(vary("dietNo", ["Not quite. Think about the teeth clue. Try again!", "Hmm, what kind of teeth did it have? Try again!", "Almost! Remember the teeth clue and have another go.", "Not that one. Sharp teeth tear meat, flat teeth grind plants. Try again!"]));
      }
    }));
  }

  /* ---------- sticker book: animals found, superpowers earned, and your detective rank ---------- */
  function guide() {
    const n = Object.keys(S.found).length, pw = Object.keys(S.powers || {}).length, rk = rankOf(S.solved || 0);
    show("guide", `
      <div class="mm-guide-head">${badge(rk)}<span><b>${RANKS[rk][1]}</b><small>${ART.icon("folder")}${n}/${D.IDS.length} ${ART.icon("star")}${pw}/${D.IDS.length}</small></span></div>
      <div class="mm-guide">${D.IDS.map(id => S.found[id]
        ? btn("mm-card mm-sticker-card", `data-id="${id}" aria-label="${nm(id)}${S.powers && S.powers[id] ? ", with superpower sticker" : ""}"`, ART.animal(id, { face: true, cls: "mm-animal mm-live" }) + `<span>${cap1(nm(id))}</span>` + (S.powers && S.powers[id] ? `<em class="mm-powstar" title="${D.POWERS[id].name}">${ART.icon("star")}</em>` : ""))
        : `<div class="mm-card locked" aria-label="Not found yet">${ART.animal(id, { face: true })}<span>?</span></div>`).join("")}</div>`);
    prompt(n === 0 ? "This is your sticker book. It's empty! Go on an expedition to find animals and earn stickers." : n === D.IDS.length ? "Wow, you found every animal! Tap one to learn about it." : `You found ${n} of ${D.IDS.length} animals and ${pw} superpowers. Tap a sticker to learn about it. Go on more expeditions to find the rest!`);
    view.querySelectorAll(".mm-card[data-id]").forEach(b => b.addEventListener("click", () => { sfx.tap(); caseFile(b.dataset.id, () => { renderBar(); }); }));
  }


  /* ---------- Pre-K and K: tap to color ---------- */
  const CRAYONS = [["red", "#e8494f"], ["orange", "#ff9f40"], ["yellow", "#ffd23f"], ["green", "#6fc35a"], ["blue", "#4aa3df"], ["purple", "#a47bff"],
    ["pink", "#ff9fc8"], ["brown", "#8a5a3b"], ["tan", "#e3bc8a"], ["gray", "#9aa1ae"], ["black", "#2a2233"], ["white", "#ffffff"]];
  function colorPick() {
    show("colorpick", `
      <div class="mm-head">${ART.icon("crayon")}<p class="mm-q">Pick an animal to color!</p></div>
      <div class="mm-guide">${D.IDS.map(id => btn("mm-card", `data-id="${id}" aria-label="Color the ${nm(id)}"`, (S.art[id] && Object.values(S.art[id]).some(Boolean) ? colored(id) : ART.animal(id, { line: true })) + `<span>${cap1(nm(id))}</span>`)).join("")}</div>`);
    prompt("Pick an animal to color!");
    view.querySelectorAll(".mm-card").forEach(b => b.addEventListener("click", () => { sfx.tap(); colorPage(b.dataset.id); }));
  }
  // The line drawing with this child's saved colors put back in.
  function colored(id, face) {
    const host = document.createElement("div");
    host.innerHTML = ART.animal(id, { line: true, face, label: "Your " + nm(id) });
    const svg = host.firstChild; prepColor(svg);
    const saved = S.art[id] || {};
    paintables(svg).forEach((el, i) => { if (saved[i]) paint(el, saved[i]); });
    return host.innerHTML;
  }
  function prepColor(svg) { svg.querySelectorAll(".mm-hit").forEach(h => h.remove()); }
  // Shapes a child can fill: anything drawn white in the line art (a fill, or a wide white stroke such as a tail).
  function paintables(svg) {
    return [...svg.querySelectorAll("path, ellipse, circle, rect")].filter(el => {
      if (el.dataset.paint) return true;
      const f = (el.getAttribute("fill") || "").toLowerCase(), st = (el.getAttribute("stroke") || "").toLowerCase();
      if (f === "#ffffff" || f === "#fff") { el.dataset.paint = "fill"; return true; }
      if ((f === "none" || !f) && (st === "#ffffff" || st === "#fff") && +el.getAttribute("stroke-width") >= 4) { el.dataset.paint = "stroke"; return true; }
      return false;
    });
  }
  function paint(el, c) { el.setAttribute(el.dataset.paint, c); }
  function colorPage(id) {
    let cur = CRAYONS[pick([0, 1, 2, 3, 4, 5])];
    show("color", `
      <div class="mm-colorwrap">
        <div class="mm-canvas" id="mm-canvas">${ART.animal(id, { line: true, label: "Coloring page: " + nm(id) })}</div>
        <div class="mm-crayons" role="radiogroup" aria-label="Crayons">${CRAYONS.map(([n, c]) => btn("mm-crayon", `data-c="${c}" data-n="${n}" role="radio" aria-checked="false" aria-label="${n}" style="--c:${c}"`, `<svg viewBox="0 0 40 90" aria-hidden="true"><path d="M8 30 L20 4 L32 30 Z" fill="${c}" stroke="#2a2233" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="30" width="24" height="56" rx="4" fill="${c}" stroke="#2a2233" stroke-width="3"/><rect x="8" y="44" width="24" height="12" fill="rgba(255,255,255,.55)"/></svg>`)).join("")}</div>
        <div class="mm-row">${btn("mm-round mm-clear", 'id="mm-clear" aria-label="Start over"', ART.icon("replay"))}${btn("mm-big mm-go", 'id="mm-color-done" aria-label="Done"', `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 21 L17 29 L32 11" fill="none" stroke="#0b0a10" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}</div>
      </div>`);
    const svg = view.querySelector("#mm-canvas svg"); prepColor(svg);
    const shapes = paintables(svg), saved = S.art[id] = S.art[id] || {};
    shapes.forEach((el, i) => { el.dataset.i = i; if (saved[i]) paint(el, saved[i]); });
    const setCur = (b) => { view.querySelectorAll(".mm-crayon").forEach(x => x.setAttribute("aria-checked", String(x === b))); cur = [b.dataset.n, b.dataset.c]; };
    view.querySelectorAll(".mm-crayon").forEach(b => { if (b.dataset.c === cur[1]) setCur(b); b.addEventListener("click", () => { sfx.tap(); setCur(b); say(cap1(b.dataset.n) + "!"); }); });
    prompt(G() !== "pk" ? `Let's color the ${nm(id)}! Tap a crayon, then tap a body part to color it.` : `Let's color the ${nm(id)}! Tap a crayon, then tap the picture.`);
    let lastPart = "", lastT = 0;
    svg.addEventListener("click", e => {
      const el = e.target.closest("[data-paint]"); if (!el) return;
      paint(el, cur[1]); saved[el.dataset.i] = cur[1] === "#ffffff" ? undefined : cur[1]; save();
      tone(500 + Math.random() * 400, 0, 0.08, "triangle", 0.04);
      // Kindergarten hears the body part's name too, which practices the words from the mysteries.
      const part = (el.closest("[data-part]") || {}).dataset ? el.closest("[data-part]").dataset.part : "";
      const now = Date.now();
      if (G() !== "pk" && part && (part !== lastPart || now - lastT > 4000)) say(`${cap1(cur[0])} ${partWord(id, part)}!`);
      else if (now - lastT > 2500) say(cap1(cur[0]) + "!");
      lastPart = part; lastT = now;
    });
    $("mm-clear").addEventListener("click", () => { sfx.tap(); shapes.forEach(el => paint(el, "#ffffff")); S.art[id] = {}; save(); say("Fresh page!"); colorPage(id); });
    $("mm-color-done").addEventListener("click", async () => {
      sfx.win(); confetti(view);
      const ok = await say(`${vary("pretty", PH.pretty)} ${nm(id)}! ${pick(D.ANIMALS[id].facts[G()] || D.ANIMALS[id].facts.pk)}`);
      if (ok && screenName === "color") colorPick();
    });
  }

  /* ---------- 2nd grade: Family secrets ---------- */
  let F = null;
  function family() {
    F = { list: shuffle(D.COUSINS).slice(0, 5), i: 0, right: 0 };
    familyRound(true);
  }
  function familyRound(first) {
    const q = F.list[F.i], three = shuffle(q.pair.concat(q.odd));
    F.sel = []; F.done = false;
    show("family", `
      <div class="mm-case">
        <div class="mm-casebar"><span class="mm-casenum">${ART.icon("tree")}<b>${F.i + 1}</b>/${F.list.length}</span></div>
        <div class="mm-head">${ART.detective()}<p class="mm-q">Which two are closer cousins?</p></div>
        <div class="mm-lineup n3 mm-fam" id="mm-fam">${three.map(s => btn("mm-suspect", `data-id="${s}" aria-label="${nm(s)}" aria-pressed="false"`, ART.animal(s, { face: true }))).join("")}</div>
        <div class="mm-mini-tree" id="mm-mtree" hidden></div>
      </div>`);
    const intro = first ? "Family secrets! All of these animals are mammals: they have fur, and their mothers make milk. Some are closer cousins than others. Close cousins share a more recent great-great-grandparent, from long, long ago. " : "";
    prompt(`${intro}Which two are closer cousins: ${three.map(nm).join(", ")}? Tap two animals.`);
    view.querySelectorAll("#mm-fam .mm-suspect").forEach(b => b.addEventListener("click", () => famTap(b, q)));
  }
  async function famTap(b, q) {
    if (F.done) return;
    const id = b.dataset.id, i = F.sel.indexOf(id);
    sfx.tap();
    if (i >= 0) { F.sel.splice(i, 1); b.setAttribute("aria-pressed", "false"); return; }
    F.sel.push(id); b.setAttribute("aria-pressed", "true"); say(nm(id));
    if (F.sel.length < 2) return;
    F.done = true;
    const right = F.sel.every(s => q.pair.includes(s));
    if (right) { F.right++; sfx.yes(); confetti(view); } else sfx.no();
    const t = $("mm-mtree"); t.innerHTML = miniTree(q); t.hidden = false;
    view.querySelectorAll("#mm-fam .mm-suspect").forEach(x => x.classList.add(q.pair.includes(x.dataset.id) ? "yes" : "dim"));
    // The next arrow shows up right away (after a short fade-in), so nobody waits on a slow voice.
    // It sticks to the bottom corner of the screen so it is never scrolled out of sight.
    view.insertAdjacentHTML("beforeend", btn("mm-big mm-go mm-late mm-stick", 'id="mm-fam-next" aria-label="Next"', ART.icon("next")));
    say(`${right ? vary("yes", PH.yes) : vary("goodTry", ["Good try!", "Nice thinking!", "Ooh, tricky one!"]) + " The closer cousins are " + the(q.pair[0]) + " and " + the(q.pair[1]) + "."} ${q.why}`);
    $("mm-fam-next").addEventListener("click", () => {
      sfx.tap(); F.i++;
      if (F.i < F.list.length) familyRound(false);
      else { S.cousins = Math.max(S.cousins || 0, F.right); save(); bigTree(true); }
    });
  }
  function face(id, x, y, s) { return ART.animal(id, { face: true }).replace("<svg ", `<svg x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" `); }
  function miniTree(q) {
    const [a, b] = q.pair, xs = [70, 190, 330], s = 84;
    return `<svg viewBox="0 0 400 250" class="mm-tree-svg" role="img" aria-label="${nm(a)} and ${nm(b)} branch together first, then join the ${nm(q.odd)}">
      <path d="M 70 92 V 160 H 190 V 92 M 130 160 V 220 H 330 V 92 M 230 220 V 244" fill="none" stroke="#2a2233" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M 70 92 V 160 H 190 V 92" fill="none" stroke="#ff5fa2" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M 130 160 V 220 H 330 V 92 M 230 220 V 244" fill="none" stroke="#a8784a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
      ${face(a, xs[0], 50, s)}${face(b, xs[1], 50, s)}${face(q.odd, xs[2], 50, s)}
      <circle cx="130" cy="160" r="12" fill="#ffd23f" stroke="#2a2233" stroke-width="4"/></svg>`;
  }
  // The whole family tree, with tappable groups.
  function bigTree(fromGame) {
    const tips = []; const nodes = [];
    (function walk(n, depth) {
      if (typeof n === "string") { tips.push(n); return { x: (tips.length - 1) * 80 + 40, h: 0, tips: [n] }; }
      const kids = n.c.map(c => walk(c, depth + 1));
      const node = { n, x: kids.reduce((s, k) => s + k.x, 0) / kids.length, h: Math.max(...kids.map(k => k.h)) + 1, kids, tips: kids.flatMap(k => k.tips) };
      nodes.push(node); return node;
    })(D.TREE, 0);
    const Y = h => 92 + h * 34, W = tips.length * 80;
    let lines = "", dots = "", labels = "";
    nodes.forEach(nd => {
      const y = Y(nd.h);
      nd.kids.forEach(k => { lines += `M ${k.x} ${k.h ? Y(k.h) : 76} V ${y} `; });
      lines += `M ${Math.min(...nd.kids.map(k => k.x))} ${y} H ${Math.max(...nd.kids.map(k => k.x))} `;
      if (nd.n.say) dots += `<g class="mm-node" data-k="${nd.n.k}" tabindex="0" role="button" aria-label="${nd.n.say}"><circle cx="${nd.x}" cy="${y}" r="16" fill="#ffd23f" stroke="#2a2233" stroke-width="4"/><circle cx="${nd.x}" cy="${y}" r="28" fill="transparent"/></g>`;
      if (nd.n.label) labels += `<text x="${nd.x}" y="${y + 36}" text-anchor="middle" class="mm-tlabel">${nd.n.label}</text>`;
    });
    const rootY = Y(Math.max(...nodes.map(n => n.h)));
    show("tree", `<div class="mm-treewrap"><svg viewBox="0 0 ${W} ${rootY + 30}" class="mm-tree-svg big" role="img" aria-label="Family tree of the animals in this game">
      <path d="${lines} M ${nodes[nodes.length - 1].x} ${rootY} V ${rootY + 24}" fill="none" stroke="#2a2233" stroke-width="10" stroke-linecap="round"/>
      <path d="${lines}" fill="none" stroke="#a8784a" stroke-width="4" stroke-linecap="round" id="mm-tlines"/>
      ${tips.map((id, i) => `<g class="mm-tip" data-id="${id}">${face(id, i * 80 + 40, 40, 70)}</g>`).join("")}
      ${labels}${dots}</svg></div>
      <div class="mm-clade" id="mm-clade" aria-live="polite" hidden></div>
      <div class="mm-row">${btn("mm-big mm-again", 'id="mm-fam-again" aria-label="Play family secrets again"', ART.icon("replay"))}</div>`);
    prompt(fromGame ? `You got ${F.right} of ${F.list.length}! Here is the whole family tree. Tap a yellow dot to hear who is in that group.` : "Here is the whole family tree. Tap a yellow dot to hear who is in that group.");
    const byK = {}; nodes.forEach(nd => { byK[nd.n.k] = nd; });
    view.querySelectorAll(".mm-node").forEach(g => {
      const go = () => {
        const nd = byK[g.dataset.k], n = nd.n; sfx.tap();
        view.querySelectorAll(".mm-tip").forEach(t => t.classList.toggle("dim", !nd.tips.includes(t.dataset.id)));
        view.querySelectorAll(".mm-node").forEach(x => x.classList.toggle("on", x === g));
        // A card about the whole group: who is in it from the game, more facts, and relatives not in the game.
        const lines = [n.say, `In this game: ${nd.tips.map(nm).join(", ")}.`].concat(n.teethSay ? [n.teethSay] : [], n.more || []);
        if (n.also && n.also.length) lines.push(`Also in this group: ${n.also.join(", ")}.`);
        const card = $("mm-clade");
        card.innerHTML = `${n.teeth ? `<div class="mm-clade-teeth" aria-label="Teeth of the ${nm(n.teeth)}">${ART.teeth(n.teeth)}</div>` : ""}<h3>${n.name || n.label || "This group"}</h3>
          <div class="mm-clade-faces">${nd.tips.map(id => `<span class="mm-mini" title="${nm(id)}">${ART.animal(id, { face: true })}</span>`).join("")}</div>
          <ul>${lines.slice(2, n.also && n.also.length ? -1 : undefined).map(t => `<li>${t}</li>`).join("")}</ul>
          ${n.also && n.also.length ? `<p class="mm-clade-also"><b>Also in this group:</b> ${n.also.map(a => `<span>${a}</span>`).join("")}</p>` : ""}`;
        card.hidden = false;
        sayAll(lines, i => card.querySelectorAll("li").forEach((li, j) => li.classList.toggle("now", j === i - 2)));
      };
      g.addEventListener("click", go); g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    view.querySelectorAll(".mm-tip").forEach(t => t.addEventListener("click", () => say(cap1(nm(t.dataset.id)) + ".")));
    $("mm-fam-again").addEventListener("click", () => { sfx.tap(); family(); });
  }

  /* ---------- classroom: teacher settings (press and hold the gear) ---------- */
  function holdToOpen(el, fn) {
    let t = 0;
    const start = e => { e.preventDefault(); el.classList.add("holding"); t = setTimeout(() => { el.classList.remove("holding"); fn(); }, 900); };
    const stop = () => { clearTimeout(t); el.classList.remove("holding"); };
    el.addEventListener("pointerdown", start); ["pointerup", "pointerleave", "pointercancel"].forEach(ev => el.addEventListener(ev, stop));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
  }
  function teacherPanel() {
    const o = S.opts;
    const gOpts = [["", "Children choose"]].concat(Object.entries(D.GRADES).map(([k, g]) => [k, g.say]));
    pop.innerHTML = `<div class="mm-file mm-teacher" role="dialog" aria-modal="true" aria-labelledby="mm-t-h">
      <h3 id="mm-t-h">${CL ? "Teacher" : "Grown-up"} settings</h3>
      ${voices.length ? `<label>Voice<span class="mm-t-voice"><select id="mm-t-voice">${voices.slice(0, 12).map((v, i) => `<option value="${esc(v.name)}" ${voice && voice.name === v.name ? "selected" : ""}>${esc(v.name.replace(/^(Microsoft|Google|com\.apple\.[\w.]+)\s*/i, ""))}${i === 0 ? " (recommended)" : ""}</option>`).join("")}</select>${btn("mm-chip", 'id="mm-t-try"', "Try it")}</span></label>` : `<p class="mm-t-note">This device has no voices for reading aloud. Captions will show the words instead.</p>`}
      ${CL ? `<label>Grade<select id="mm-t-lock">${gOpts.map(([k, t]) => `<option value="${k}" ${o.lock === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label>Mysteries per round<select id="mm-t-cases">${[[0, "Grade default"], [3, "3"], [5, "5"], [8, "8"], [12, "All 12"]].map(([k, t]) => `<option value="${k}" ${+o.cases === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>` : ""}
      <label class="mm-check"><input type="checkbox" id="mm-t-slow" ${o.slow ? "checked" : ""}> Slower voice</label>
      <label class="mm-check"><input type="checkbox" id="mm-t-caps" ${o.caps ? "checked" : ""}> Show captions (words on screen)</label>
      <label class="mm-check"><input type="checkbox" id="mm-t-mute" ${S.mute ? "checked" : ""}> Voice and sound off</label>
      <p class="mm-t-note">Settings are saved on this device. For the warmest voice, Apple devices can download "Ava (Premium)" in Settings, Accessibility, Spoken Content, Voices. On Windows, the Edge browser has natural voices built in.${CL ? ` Starting link for one grade: add <code>?grade=pk</code>, <code>k</code>, <code>g1</code>, or <code>g2</code> to the address.` : ""}</p>
      <div class="mm-row">${btn("mm-chip", 'id="mm-t-reset"', "Clear this device's sticker book")}${btn("mm-chip mm-chip-go", 'id="mm-t-done"', "Done")}</div></div>`;
    pop.hidden = false; root.classList.add("mm-popped");
    $("mm-t-done").addEventListener("click", () => {
      if (CL) { o.lock = $("mm-t-lock").value; o.cases = +$("mm-t-cases").value; }
      if ($("mm-t-voice")) { o.voice = $("mm-t-voice").value; pickVoice(); }
      o.slow = $("mm-t-slow").checked; o.caps = $("mm-t-caps").checked; S.mute = $("mm-t-mute").checked;
      if (o.lock) S.grade = o.lock;
      save(); closePop(); renderBar();
    });
    $("mm-t-reset").addEventListener("click", () => { S.found = {}; S.powers = {}; S.solved = 0; S.cousins = 0; save(); renderBar(); $("mm-t-reset").textContent = "Sticker book cleared"; });
    if ($("mm-t-try")) $("mm-t-try").addEventListener("click", () => {
      const keep = o.voice; o.voice = $("mm-t-voice").value; pickVoice(); o.voice = keep;
      say("Hi, I'm Detective Ollie! Let's solve a mammal mystery together.");
    });
    ($("mm-t-voice") || $("mm-t-done")).focus();
  }

  /* ---------- top bar ---------- */
  $("mm-home").innerHTML = ART.icon("home");
  $("mm-say").innerHTML = ART.icon("speaker");
  $("mm-home").addEventListener("click", () => { sfx.tap(); if (screenName === "menu" || screenName === "grades") title(); else menu(false); });
  $("mm-say").addEventListener("click", () => { if (lastPrompt) say(lastPrompt); });
  $("mm-mute").addEventListener("click", () => { S.mute = !S.mute; save(); renderBar(); if (S.mute) stopTalk(); else say("Sound on."); });
  $("mm-badge").addEventListener("click", () => { sfx.tap(); guide(); });
  const fs = $("mm-fs");
  if (fs) {
    const can = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!can) fs.hidden = true;
    fs.addEventListener("click", () => {
      const on = document.fullscreenElement || document.webkitFullscreenElement;
      if (on) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    });
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { closePop(); } });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopTalk(); });

  // Photo credits under the game, built from the PHOTOS list.
  const credits = $("mm-credits");
  if (credits) {
    const list = D.IDS.filter(id => D.PHOTOS[id] && D.PHOTOS[id].src).map(id => `<li>${cap1(nm(id))}: ${D.PHOTOS[id].credit}</li>`);
    const snd = D.IDS.filter(id => D.SOUNDS && D.SOUNDS[id] && D.SOUNDS[id].src).map(id => `<li>${cap1(nm(id))} sound: ${D.SOUNDS[id].credit}</li>`);
    credits.hidden = !list.length && !snd.length;
    credits.innerHTML = (list.length ? `<b>Photo credits</b><ul>${list.join("")}</ul>` : "") + (snd.length ? `<b>Sound credits</b><ul>${snd.join("")}</ul>` : "");
  }

  title();
  window.MM_GAME = { title, grades, menu, guide, family, bigTree, startRound, colorPick, colorPage, games, miniGame, superpower, map, newCase, S, round: () => R };
})();
