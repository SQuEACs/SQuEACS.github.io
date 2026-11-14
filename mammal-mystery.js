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
  // Say it a different way each time: deal phrases from a shuffled pile, never the same one twice in a row.
  const piles = {}, lastSaid = {};
  function vary(key, list) {
    let p = piles[key];
    if (!p || !p.length) { p = piles[key] = shuffle(list); if (p.length > 1 && p[p.length - 1] === lastSaid[key]) p.unshift(p.pop()); }
    return (lastSaid[key] = p.pop());
  }
  const PH = {
    yes: ["Yes!", "You got it!", "That's right!", "Hooray!", "Wow, yes!", "Nice work!", "Great spotting!"],
    solved: ["Mystery solved!", "Case closed!", "You cracked the case!", "Another mystery solved!", "Super sleuthing!"],
    toGuide: ["It's going in your field guide.", "I'll add it to your field guide.", "A new page for your field guide!", "Your field guide just got bigger!"],
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
  const S = Object.assign({ grade: null, found: {}, art: {}, cousins: 0, mute: false, opts: { lock: "", slow: false, caps: true, cases: 0 } }, load());
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
      setTimeout(fin, 2500 + text.length * 110);   // some browsers never fire onend
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
    clue: () => { tone(880, 0, 0.08, "sine", 0.05); tone(1175, 0.07, 0.12, "sine", 0.05); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle", 0.07)),
  };

  /* ---------- screen helpers ---------- */
  let screenName = "";
  function show(name, html) {
    stopTalk(); screenName = name; closePop(true);
    view.className = "mm-view mm-s-" + name; view.innerHTML = html; view.scrollTop = 0;
    $("mm-home").hidden = name === "title";
    renderBar();
  }
  function renderBar() {
    const n = Object.keys(S.found).length;
    $("mm-badge").innerHTML = `${ART.icon("folder")}<b>${n}</b><span class="mm-sr"> of ${D.IDS.length} animals in your field guide</span>`;
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
      ["case", ART.icon("glass"), "Solve a mystery"],
      ["guide", ART.icon("folder"), "Field guide"],
    ];
    if (g === "g2") items.push(["family", ART.icon("tree"), "Family secrets"]);
    if (g === "pk" || g === "k") items.push(["color", ART.icon("crayon"), "Coloring"]);
    const locked = CL && S.opts.lock;
    show("menu", `
      <div class="mm-head">${ART.detective()}<p class="mm-q">${D.GRADES[g].say}</p></div>
      <div class="mm-menu">${items.map(([k, ic, t], i) => btn("mm-tile mm-act" + (i === 0 ? " mm-main" : ""), `data-k="${k}" aria-label="${t}"`, `${ic}<b>${t}</b>`)).join("")}</div>
      ${locked ? "" : btn("mm-chip", 'id="mm-chg" aria-label="Change grade"', `<span class="mm-grade-dots sm">${"<i></i>".repeat(Object.keys(D.GRADES).indexOf(g) + 1)}</span>Change grade`)}`);
        if (greet) prompt(g === "g2" ? "Let's be detectives! Tap the magnifying glass to solve a mystery, the folder for your field guide, or the tree for family secrets."
      : g === "pk" || g === "k" ? "Let's be detectives! Tap the magnifying glass to solve a mystery, the folder to see your field guide, or the crayon to color an animal."
      : "Let's be detectives! Tap the magnifying glass to solve a mystery, or the folder to see your field guide.");
    view.querySelectorAll(".mm-act").forEach(b => b.addEventListener("click", () => {
      sfx.tap(); const k = b.dataset.k;
      if (k === "case") startRound(); else if (k === "guide") guide(); else if (k === "color") colorPick(); else family();
    }));
    const chg = $("mm-chg"); if (chg) chg.addEventListener("click", () => { sfx.tap(); grades(); });
  }

  /* ---------- the mystery round ---------- */
  let R = null;
  function startRound() {
    const g = G(), n = (CL && S.opts.cases) || D.GRADES[g].cases;
    // Prefer animals not yet in the field guide, then fill with any.
    const fresh = shuffle(D.IDS.filter(id => !S.found[id])), old = shuffle(D.IDS.filter(id => S.found[id]));
    R = { list: fresh.concat(old).slice(0, n), i: 0, stars: 0 };
    newCase();
  }
  function newCase() {
    const g = G(), id = R.list[R.i];
    const others = shuffle(D.IDS.filter(x => x !== id)).slice(0, D.GRADES[g].suspects - 1);
    R.c = { id, suspects: shuffle([id].concat(others)), clues: D.ANIMALS[id].clues[g], shown: 0, wrong: 0, done: false };
    show("case", `
      <div class="mm-case">
        <div class="mm-casebar"><span class="mm-casenum">${ART.icon("folder")}<b>${R.i + 1}</b>/${R.list.length}</span><span class="mm-dots" id="mm-dots"></span></div>
        <div class="mm-cluebox">
          <div class="mm-ollie-sm">${ART.detective()}</div>
          <div class="mm-lens" id="mm-lens"></div>
          ${btn("mm-round mm-more", 'id="mm-more" aria-label="Another clue"', ART.icon("glass") + "<b>+</b>")}
        </div>
        <div class="mm-lineup n${R.c.suspects.length}" id="mm-lineup">${R.c.suspects.map(s => btn("mm-suspect", `data-id="${s}" aria-label="${nm(s)}"`, ART.animal(s, { face: true }))).join("")}</div>
      </div>`);
    view.querySelectorAll(".mm-suspect").forEach(b => b.addEventListener("click", () => guess(b)));
    $("mm-more").addEventListener("click", () => { sfx.tap(); nextClue(); });
    const intro = R.i === 0 ? (g === "pk" ? "Mystery time! An animal is hiding. Listen to the clue, then tap the animal you think it is." : "Mystery time! An animal is hiding. Listen to each clue, then tap the animal that matches.") : vary("newCase", PH.newCase);
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
      return `<div class="mm-zoom">${ART.animal(id, { hab: sceneOf(id), vb: `${(cx - s / 2).toFixed(1)} ${(cy - s / 2).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`, label: "A close-up clue" })}</div>`;
    }
    if (type === "shadow") return `<div class="mm-zoom mm-shadow">${ART.animal(id, { hab: sceneOf(id), label: "The animal's shadow" })}</div>`;
    if (type === "hab") return `<div class="mm-zoom mm-pic">${ART.habitat(D.ANIMALS[id].hab === arg ? sceneOf(id) : arg)}</div>`;
    if (type === "teeth") return `<div class="mm-zoom mm-pic">${ART.teeth(id)}</div>`;
    if (type === "food") return `<div class="mm-zoom mm-pic mm-foodclue">${ART.food(arg)}</div>`;
    return "";
  }
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
    const c = R.c; if (c.done || b.classList.contains("nope")) return;
    const id = b.dataset.id;
    if (id === c.id) {
      c.done = true; sfx.yes(); b.classList.add("yes"); confetti(view); dots();
      R.stars++;
      const first = !S.found[id]; S.found[id] = S.found[id] || G(); save(); renderBar();
      view.querySelector(".mm-cluebox").insertAdjacentHTML("beforeend", `<div class="mm-stamp" aria-hidden="true">SOLVED!</div>`);
      await say(`${vary("yes", PH.yes)} It's ${the(id)}! ${vary("solved", PH.solved)}${first ? " " + vary("toGuide", PH.toGuide) : ""}`);
      if (screenName === "case" && R.c === c) caseFile(id, afterFile);
      return;
    }
    c.wrong++; sfx.no(); b.classList.add("nope"); b.setAttribute("aria-label", nm(id) + ", not this one");
    const more = c.shown < c.clues.length;
    const ok = await say(`That's ${the(id)}. ${vary("notIt", PH.notIt)}${more ? " " + vary("moreClue", PH.moreClue) : ""}`);
    if (!ok || c.done) return;
    if (more) nextClue();
    else { view.querySelector(`.mm-suspect[data-id="${c.id}"]`).classList.add("hint"); prompt(vary("lastLook", PH.lastLook)); }
  }
  function afterFile() {
    const g = G(), id = R.c.id;
    if (g === "k") return bonusParts(id);
    if (g === "g1") return bonusHome(id);
    if (g === "g2") return bonusDiet(id);
    nextCaseOrEnd();
  }
  function nextCaseOrEnd() {
    R.i++;
    if (R.i < R.list.length) newCase(); else roundEnd();
  }
  function roundEnd() {
    sfx.win();
    show("end", `<div class="mm-end">${ART.detective()}<div class="mm-stars">${R.list.map(id => `<span class="mm-mini">${ART.animal(id, { face: true })}</span>`).join("")}</div>
      <div class="mm-row">${btn("mm-big mm-again", 'id="mm-again" aria-label="Play again"', ART.icon("replay"))}${btn("mm-big mm-tog", 'id="mm-toguide" aria-label="Field guide"', ART.icon("folder"))}</div></div>`);
    confetti(view);
    const n = Object.keys(S.found).length;
    prompt(`${vary("endStart", PH.endStart)} You solved ${R.list.length} mysteries. Your field guide has ${n} of ${D.IDS.length} animals. ${n < D.IDS.length ? "Play again to find them all!" : "You found every animal!"}`);
    $("mm-again").addEventListener("click", () => { sfx.tap(); startRound(); });
    $("mm-toguide").addEventListener("click", () => { sfx.tap(); guide(); });
  }

  /* ---------- case file popup: photo and facts for this grade ---------- */
  function caseFile(id, then) {
    const a = D.ANIMALS[id], g = G(), facts = a.facts[g], ph = D.PHOTOS[id];
    const pic = ph && ph.src
      ? `<figure class="mm-photo"><img src="${ph.src}" alt="Photo of a ${a.name}" onerror="this.parentNode.classList.add('mm-nophoto');this.remove()"><figcaption>${ph.credit}</figcaption>${ART.animal(id, { cls: "mm-photo-fallback", label: a.name })}</figure>`
      : `<figure class="mm-photo mm-nophoto">${ART.animal(id, { cls: "mm-photo-fallback", hab: sceneOf(id), label: a.name })}</figure>`;
    pop.innerHTML = `
      <div class="mm-file" role="dialog" aria-modal="true" aria-labelledby="mm-file-name">
        <div class="mm-file-tab">${ART.icon("folder")}<span>FIELD GUIDE</span></div>
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
    sayAll([`Field guide: the ${a.name}.`].concat(facts), i => lis.forEach((x, j) => x.classList.toggle("now", j === i - 1)));
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
        const ok = await say(`${vary("yes", PH.yes)} ${cap1(partWord(id, want))}. ${cap1(a.name)}s have ${a.partWhy[want] || "these"}.`);
        if (!ok) return;
        if (k < parts.length) { svg.querySelectorAll(".mm-glow").forEach(x => x.classList.remove("mm-glow")); ask(); }
        else { confetti(view); await say(vary("done", PH.done)); if (screenName === "parts") nextCaseOrEnd(); }
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
        const ok = await say(`${vary("yes", PH.yes)} ${cap1(the(id))} lives in the ${ART.HAB_NAMES[h].toLowerCase()}. ${habClue ? habClue[2].replace(/^I /, "It ").replace(/\bmy\b/g, "its").replace(/\bI\b/g, "it").replace(/\bme\b/g, "it") : ""}`);
        if (ok && screenName === "home") nextCaseOrEnd();
      } else {
        sfx.no(); b.classList.add("nope");
        say(`${vary("habNo", ["Hmm, not the", "It doesn't live in the", "Not the"])} ${ART.HAB_NAMES[h].toLowerCase()}. ${vary("tryAgain", PH.tryAgain)}`);
      }
    }));
  }

  /* ---------- bonus: 2nd grade picks carnivore, herbivore, or omnivore ---------- */
  function bonusDiet(id) {
    const a = D.ANIMALS[id];
    show("diet", `<div class="mm-bonus"><div class="mm-head">${ART.detective()}<span class="mm-mini big">${ART.animal(id, { face: true })}</span></div>
      <div class="mm-choices">${["meat", "plants", "both"].map(k => btn("mm-choice mm-diet", `data-d="${k}" aria-label="${D.DIET[k].word}: ${D.DIET[k].kid}"`, `${ART.food(k)}<b>${cap1(D.DIET[k].word)}</b><small>${D.DIET[k].kid}</small>`)).join("")}</div></div>`);
    prompt(`${vary("eat", [`What does ${the(id)} eat?`, `Detective question: what does ${the(id)} eat?`, `Think about the teeth. What does ${the(id)} eat?`])} Meat makes it a carnivore. Plants make it an herbivore. Both make it an omnivore.`);
    view.querySelectorAll(".mm-diet").forEach(b => b.addEventListener("click", async () => {
      if (b.classList.contains("nope")) return;
      const d = b.dataset.d;
      if (d === a.diet) {
        sfx.yes(); b.classList.add("yes"); confetti(view);
        const extra = id === "panda" ? " Pandas eat like herbivores, even though they belong to the carnivoran group!" : "";
        const ok = await say(`${vary("yes", PH.yes)} ${cap1(a.name)}s eat ${d === "both" ? "plants and animals" : d}, so they are ${D.DIET[d].word}s.${extra}`);
        if (ok && screenName === "diet") nextCaseOrEnd();
      } else {
        sfx.no(); b.classList.add("nope");
        say(vary("dietNo", ["Not quite. Think about the teeth clue. Try again!", "Hmm, what kind of teeth did it have? Try again!", "Almost! Remember the teeth clue and have another go.", "Not that one. Sharp teeth tear meat, flat teeth grind plants. Try again!"]));
      }
    }));
  }

  /* ---------- field guide (fills in like a sticker book) ---------- */
  function guide() {
    const n = Object.keys(S.found).length;
    show("guide", `
      <div class="mm-guide-head">${ART.icon("folder")}<b>${n} / ${D.IDS.length}</b></div>
      <div class="mm-guide">${D.IDS.map(id => S.found[id]
        ? btn("mm-card", `data-id="${id}" aria-label="${nm(id)}"`, ART.animal(id, { face: true }) + `<span>${cap1(nm(id))}</span>`)
        : `<div class="mm-card locked" aria-label="Not found yet">${ART.animal(id, { face: true })}<span>?</span></div>`).join("")}</div>`);
    prompt(n === 0 ? "This is your field guide. It's empty! Solve mysteries to fill it with animals." : n === D.IDS.length ? "Wow, you found every animal! Tap one to learn about it." : `You found ${n} of ${D.IDS.length} animals. Tap one to learn about it. Solve more mysteries to find the rest!`);
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
    prompt(G() === "k" ? `Let's color the ${nm(id)}! Tap a crayon, then tap a body part to color it.` : `Let's color the ${nm(id)}! Tap a crayon, then tap the picture.`);
    let lastPart = "", lastT = 0;
    svg.addEventListener("click", e => {
      const el = e.target.closest("[data-paint]"); if (!el) return;
      paint(el, cur[1]); saved[el.dataset.i] = cur[1] === "#ffffff" ? undefined : cur[1]; save();
      tone(500 + Math.random() * 400, 0, 0.08, "triangle", 0.04);
      // Kindergarten hears the body part's name too, which practices the words from the mysteries.
      const part = (el.closest("[data-part]") || {}).dataset ? el.closest("[data-part]").dataset.part : "";
      const now = Date.now();
      if (G() === "k" && part && (part !== lastPart || now - lastT > 4000)) say(`${cap1(cur[0])} ${partWord(id, part)}!`);
      else if (now - lastT > 2500) say(cap1(cur[0]) + "!");
      lastPart = part; lastT = now;
    });
    $("mm-clear").addEventListener("click", () => { sfx.tap(); shapes.forEach(el => paint(el, "#ffffff")); S.art[id] = {}; save(); say("Fresh page!"); colorPage(id); });
    $("mm-color-done").addEventListener("click", async () => {
      sfx.win(); confetti(view);
      const ok = await say(`${vary("pretty", PH.pretty)} ${nm(id)}! ${D.ANIMALS[id].facts.pk[0]}`);
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
    const ok = await say(`${right ? vary("yes", PH.yes) : vary("goodTry", ["Good try!", "Nice thinking!", "Ooh, tricky one!"]) + " The closer cousins are " + the(q.pair[0]) + " and " + the(q.pair[1]) + "."} ${q.why}`);
    if (!ok) return;
    $("mm-mtree").insertAdjacentHTML("beforeend", btn("mm-big mm-go", 'id="mm-fam-next" aria-label="Next"', ART.icon("next")));
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
      <div class="mm-row">${btn("mm-big mm-again", 'id="mm-fam-again" aria-label="Play family secrets again"', ART.icon("replay"))}</div>`);
    prompt(fromGame ? `You got ${F.right} of ${F.list.length}! Here is the whole family tree. Tap a yellow dot to hear who is in that group.` : "Here is the whole family tree. Tap a yellow dot to hear who is in that group.");
    const byK = {}; nodes.forEach(nd => { byK[nd.n.k] = nd; });
    view.querySelectorAll(".mm-node").forEach(g => {
      const go = () => { const nd = byK[g.dataset.k]; sfx.tap(); view.querySelectorAll(".mm-tip").forEach(t => t.classList.toggle("dim", !nd.tips.includes(t.dataset.id))); view.querySelectorAll(".mm-node").forEach(x => x.classList.toggle("on", x === g)); say(nd.n.say + " " + nd.tips.map(nm).join(", ") + "."); };
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
      <div class="mm-row">${btn("mm-chip", 'id="mm-t-reset"', "Clear this device's field guide")}${btn("mm-chip mm-chip-go", 'id="mm-t-done"', "Done")}</div></div>`;
    pop.hidden = false; root.classList.add("mm-popped");
    $("mm-t-done").addEventListener("click", () => {
      if (CL) { o.lock = $("mm-t-lock").value; o.cases = +$("mm-t-cases").value; }
      if ($("mm-t-voice")) { o.voice = $("mm-t-voice").value; pickVoice(); }
      o.slow = $("mm-t-slow").checked; o.caps = $("mm-t-caps").checked; S.mute = $("mm-t-mute").checked;
      if (o.lock) S.grade = o.lock;
      save(); closePop(); renderBar();
    });
    $("mm-t-reset").addEventListener("click", () => { S.found = {}; S.cousins = 0; save(); renderBar(); $("mm-t-reset").textContent = "Field guide cleared"; });
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
    credits.hidden = !list.length; if (list.length) credits.innerHTML = `<b>Photo credits</b><ul>${list.join("")}</ul>`;
  }

  title();
  window.MM_GAME = { title, grades, menu, guide, family, bigTree, startRound, colorPick, colorPage, S, round: () => R };
})();
