/* ============================================================
   INSIDE THE TADPOLE drawings: a see-through tadpole (four
   stages) and fish, plus cross-section "slices" like the ones a
   CT scan makes. Parts carry data-part so the game can make them
   tappable; opt.sys colours each part by body system.
   ============================================================ */
window.TP_ART = (function () {
  const INK = "#2a2233", SKIN = "rgba(150,170,90,.35)", D = () => window.TP_DATA;
  const f = n => Math.round(n * 10) / 10;
  const col = (part, opt, base) => opt.sys && opt.sys[part] ? D().SYSTEMS[opt.sys[part]].color : base;
  const T = (opt, id) => opt.parts ? ` data-part="${id}" class="tp-part${opt.hi === id ? " tp-hi" : ""}" tabindex="0" role="button" aria-label="${D().PARTS[id] ? D().PARTS[id].name : id}"` : opt.hi === id ? ` class="tp-hi"` : "";

  /* See-through tadpole, side view, head left. viewBox 0 0 420 220. */
  function tadpole(stage = 0, opt = {}) {
    const tailLen = stage === 3 ? 90 : 230, tx = 195;
    let g = `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">`;
    // tail fin and body skin
    g += `<path d="M ${tx - 10} 80 C ${tx + tailLen * .4} 40 ${tx + tailLen * .8} 70 ${tx + tailLen} 105 C ${tx + tailLen * .8} 140 ${tx + tailLen * .4} 170 ${tx - 10} 130 Z" fill="rgba(170,190,120,.35)"${T(opt, "tail")}/>`;
    g += `<ellipse cx="125" cy="105" rx="${stage === 3 ? 66 : 78}" ry="${stage === 3 ? 46 : 54}" fill="${SKIN}"/>`;
    // tail muscle blocks
    let m = `<path d="M ${tx - 6} 92 C ${tx + tailLen * .5} 84 ${tx + tailLen * .8} 96 ${tx + tailLen - 6} 105 C ${tx + tailLen * .8} 114 ${tx + tailLen * .5} 126 ${tx - 6} 118 Z" fill="${col("muscle", opt, "#d9a3a8")}"${T(opt, "muscle")}/>`;
    for (let x = tx + 12; x < tx + tailLen - 20; x += 18) m += `<path d="M ${x} ${92 + (x - tx) / tailLen * 8} l 8 13 l -8 13" fill="none" stroke-width="2"/>`;
    g += m;
    // notochord and spinal cord
    g += `<path d="M 120 90 L ${tx + tailLen - 10} 104" fill="none" stroke="${col("noto", opt, "#f3e7cf")}" stroke-width="7"${T(opt, "noto")}/>`;
    g += `<path d="M 118 82 L ${tx + tailLen - 14} 99" fill="none" stroke="${col("cord", opt, "#ffe79a")}" stroke-width="4"${T(opt, "cord")}/>`;
    // gut: long coil, or a short loop in the froglet
    const gutC = col("gut", opt, "#f0b46a");
    if (stage < 3) {
      let d = "M 118 128"; for (let a = 0; a < Math.PI * 7; a += .3) { const r = 32 - a * 1.25; d += ` L ${f(150 + r * Math.cos(a))} ${f(122 + r * .8 * Math.sin(a))}`; }
      g += `<path d="${d}" fill="none" stroke="${gutC}" stroke-width="7"${T(opt, "gut")}/><path d="${d}" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".6"/>`;
    } else g += `<path d="M 105 125 C 140 150 175 140 160 115 C 150 100 130 110 140 125" fill="none" stroke="${gutC}" stroke-width="8"${T(opt, "gut")}/>`;
    // gills, heart, brain, eye, mouth
    if (stage < 3) g += `<g${T(opt, "gills")}><path d="M 96 92 q 8 10 0 20 q 8 10 0 20 M 104 92 q 8 10 0 20 q 8 10 0 20" fill="none" stroke="${col("gills", opt, "#ff8fa3")}" stroke-width="5"/><rect x="88" y="88" width="28" height="48" fill="transparent" stroke="none"/></g>`;
    g += `<path d="M 86 138 q -8 -14 4 -16 q 8 -2 8 8 q 0 -10 8 -8 q 10 4 0 18 l -10 10 Z" fill="${col("heart", opt, "#e8445a")}"${T(opt, "heart")}/>`;
    g += `<path d="M 52 84 C 60 66 98 66 118 80 C 104 92 66 94 52 84 Z" fill="${col("brain", opt, "#f6a5b5")}"${T(opt, "brain")}/>`;
    g += `<circle cx="66" cy="92" r="12" fill="#1b1530"${T(opt, "eye")}/><circle cx="62" cy="88" r="3.5" fill="#fff" stroke="none"/>`;
    g += `<path d="M 47 112 q 8 6 16 0" fill="none" stroke-width="4"/><circle cx="55" cy="112" r="11" fill="transparent" stroke="none"${T(opt, "mouth")}/>`;
    // legs
    if (stage >= 1) {
      const s = stage === 1 ? .35 : 1;
      g += `<g${T(opt, "legs")}><path d="M 188 138 q ${f(20 * s)} ${f(14 * s)} ${f(6 * s)} ${f(40 * s)} q ${f(-6 * s)} ${f(6 * s)} ${f(-18 * s)} ${f(6 * s)}" fill="none" stroke="${col("legs", opt, "#8fbf3f")}" stroke-width="${stage === 1 ? 8 : 10}"/><circle cx="196" cy="160" r="22" fill="transparent" stroke="none"/></g>`;
    }
    if (stage >= 2) g += `<g${T(opt, "arms")}><path d="M 104 148 q 6 18 -8 28" fill="none" stroke="${col("arms", opt, "#8fbf3f")}" stroke-width="${stage === 2 ? 6 : 9}" ${stage === 2 ? 'stroke-dasharray="4 4"' : ""}/><circle cx="102" cy="162" r="18" fill="transparent" stroke="none"/></g>`;
    if (opt.sliceX != null) g += `<path d="M ${opt.sliceX} 20 V 200" stroke="#2ed3c6" stroke-width="5" opacity=".9"/>`;
    return `<svg viewBox="0 0 420 220" role="img" aria-label="${opt.label || "See-through tadpole"}">${g}</g></svg>`;
  }

  /* See-through fish, side view, head left. viewBox 0 0 420 220. */
  function fish(opt = {}) {
    let g = `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">`;
    g += `<path d="M 30 110 C 60 50 250 40 330 100 L 400 60 L 390 110 L 400 160 L 330 120 C 250 180 60 170 30 110 Z" fill="rgba(127,182,217,.35)"/>`;
    g += `<path d="M 150 80 C 220 70 300 90 330 105 C 300 125 220 140 150 135 Z" fill="${col("muscle", opt, "#d9a3a8")}"${T(opt, "muscle")}/>`;
    g += `<path d="M 100 92 C 200 82 280 92 360 108" fill="none" stroke="${col("backbone", opt, "#f3e7cf")}" stroke-width="7"${T(opt, "backbone")}/>`;
    g += `<path d="M 100 86 C 200 76 280 86 356 102" fill="none" stroke="${col("cord", opt, "#ffe79a")}" stroke-width="3.5"${T(opt, "cord")}/>`;
    g += `<ellipse cx="180" cy="110" rx="52" ry="14" fill="${col("bladder", opt, "#e9f7ff")}"${T(opt, "bladder")}/>`;
    g += `<path d="M 110 128 C 150 150 210 150 240 130 C 210 140 160 140 130 120" fill="none" stroke="${col("gut", opt, "#f0b46a")}" stroke-width="8"${T(opt, "gut")}/>`;
    g += `<g${T(opt, "gills")}><path d="M 92 88 q 10 14 0 28 q 10 14 0 28 M 100 88 q 10 14 0 28 q 10 14 0 28" fill="none" stroke="${col("gills", opt, "#ff8fa3")}" stroke-width="5"/><rect x="86" y="86" width="24" height="60" fill="transparent" stroke="none"/></g>`;
    g += `<path d="M 104 150 q -8 -12 4 -14 q 8 -2 8 8 q 0 -10 8 -8 q 10 4 0 16 l -10 10 Z" fill="${col("heart", opt, "#e8445a")}"${T(opt, "heart")}/>`;
    g += `<path d="M 54 92 C 62 76 88 76 96 86 C 86 96 64 98 54 92 Z" fill="${col("brain", opt, "#f6a5b5")}"${T(opt, "brain")}/>`;
    g += `<circle cx="58" cy="100" r="11" fill="#1b1530"${T(opt, "eye")}/><circle cx="55" cy="97" r="3" fill="#fff" stroke="none"/>`;
    g += `<path d="M 30 112 q 8 4 14 0" fill="none" stroke-width="4"/><circle cx="36" cy="112" r="10" fill="transparent" stroke="none"${T(opt, "mouth")}/>`;
    if (opt.sliceX != null) g += `<path d="M ${opt.sliceX} 20 V 200" stroke="#2ed3c6" stroke-width="5" opacity=".9"/>`;
    return `<svg viewBox="0 0 420 220" role="img" aria-label="${opt.label || "See-through fish"}">${g}</g></svg>`;
  }

  /* Cross-section at position x (0 to 420) through the tadpole or fish, like one CT slice.
     Returns { svg, parts: [ids present] }. viewBox 0 0 200 200. */
  function slice(kind, x, stage = 0, opt = {}) {
    const parts = []; let g = "", outline = "";
    const add = (id, s) => { parts.push(id); g += s.replace("/>", `${T(opt, id)}/>`); };
    const c = (id, base) => col(id, opt, base);
    if (kind === "tadpole") {
      const tailEnd = stage === 3 ? 285 : 425;
      if (x < 46 || x > tailEnd) return { svg: `<svg viewBox="0 0 200 200" aria-hidden="true"><text x="100" y="105" text-anchor="middle" font-size="16" fill="${INK}">Outside the body</text></svg>`, parts };
      if (x < 200) {
        const bw = Math.min(80, 30 + (x - 46) * .9), bh = Math.min(70, 28 + (x - 46) * .8);
        outline = `<ellipse cx="100" cy="100" rx="${f(bw)}" ry="${f(bh)}" fill="rgba(170,190,120,.45)"/>`;
        if (x < 66) add("mouth", `<ellipse cx="100" cy="${f(100 + bh * .5)}" rx="18" ry="7" fill="#5a3e3e"/>`);
        if (x >= 52 && x < 120) add("brain", `<ellipse cx="100" cy="${f(100 - bh * .55)}" rx="${f(bw * .35)}" ry="${f(bh * .25)}" fill="${c("brain", "#f6a5b5")}"/>`);
        if (x >= 54 && x < 80) { add("eye", `<circle cx="${f(100 - bw * .78)}" cy="95" r="12" fill="#1b1530"/>`); g += `<circle cx="${f(100 + bw * .78)}" cy="95" r="12" fill="#1b1530"/>`; }
        if (x >= 88 && x < 118 && stage < 3) { add("gills", `<path d="M ${f(100 - bw * .7)} 100 q 10 -14 20 0 q 10 14 20 0" fill="none" stroke="${c("gills", "#ff8fa3")}" stroke-width="6"/>`); g += `<path d="M ${f(100 + bw * .7 - 40)} 100 q 10 -14 20 0 q 10 14 20 0" fill="none" stroke="${c("gills", "#ff8fa3")}" stroke-width="6"/>`; }
        if (x >= 82 && x < 110) add("heart", `<circle cx="100" cy="${f(100 + bh * .55)}" r="11" fill="${c("heart", "#e8445a")}"/>`);
        if (x >= 112) { add("cord", `<circle cx="100" cy="${f(100 - bh * .7)}" r="6" fill="${c("cord", "#ffe79a")}"/>`); add("noto", `<circle cx="100" cy="${f(100 - bh * .5)}" r="9" fill="${c("noto", "#f3e7cf")}"/>`); }
        if (x >= 112 && x < 188) {
          const n = stage === 3 ? 2 : 7;
          for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = stage === 3 ? 14 : 30; const s = `<circle cx="${f(100 + r * Math.cos(a))}" cy="${f(112 + r * .7 * Math.sin(a))}" r="9" fill="${c("gut", "#f0b46a")}"/>`; if (i === 0) add("gut", s); else g += s; }
        }
        if (x >= 180 && stage >= 1) add("legs", `<circle cx="${f(100 - bw * .6)}" cy="${f(100 + bh * .8)}" r="${stage === 1 ? 6 : 11}" fill="${c("legs", "#8fbf3f")}"/>`);
        if (x >= 90 && x < 115 && stage >= 2) add("arms", `<circle cx="${f(100 - bw * .7)}" cy="${f(100 + bh * .7)}" r="${stage === 2 ? 6 : 9}" fill="${c("arms", "#8fbf3f")}"/>`);
      } else {
        const k = (x - 195) / (tailEnd - 195), fh = 70 - k * 50, mh = 28 - k * 18;
        outline = `<ellipse cx="100" cy="100" rx="${f(16 - k * 8)}" ry="${f(fh)}" fill="rgba(170,190,120,.45)"/>`;
        add("muscle", `<ellipse cx="100" cy="100" rx="${f(13 - k * 6)}" ry="${f(mh)}" fill="${c("muscle", "#d9a3a8")}"/>`);
        add("noto", `<circle cx="100" cy="100" r="${f(6 - k * 3)}" fill="${c("noto", "#f3e7cf")}"/>`);
        add("cord", `<circle cx="100" cy="${f(100 - 8 + k * 3)}" r="${f(3.5 - k * 1.5)}" fill="${c("cord", "#ffe79a")}"/>`);
      }
    } else {
      if (x < 32 || x > 400) return { svg: `<svg viewBox="0 0 200 200" aria-hidden="true"><text x="100" y="105" text-anchor="middle" font-size="16" fill="${INK}">Outside the body</text></svg>`, parts };
      const h = Math.max(22, Math.min(80, 36 + (x - 32) * .9) * (x > 250 ? 1 - (x - 250) / 170 : 1)), w = h * .62;
      outline = `<ellipse cx="100" cy="100" rx="${f(w)}" ry="${f(h)}" fill="rgba(127,182,217,.45)"/>`;
      if (x < 46) add("mouth", `<ellipse cx="100" cy="${f(100 + h * .1)}" rx="6" ry="4" fill="#5a3e3e"/>`);
      if (x >= 50 && x < 98) add("brain", `<ellipse cx="100" cy="${f(100 - h * .45)}" rx="${f(w * .5)}" ry="${f(h * .18)}" fill="${c("brain", "#f6a5b5")}"/>`);
      if (x >= 48 && x < 70) { add("eye", `<circle cx="${f(100 - w * .8)}" cy="${f(100 - h * .1)}" r="9" fill="#1b1530"/>`); g += `<circle cx="${f(100 + w * .8)}" cy="${f(100 - h * .1)}" r="9" fill="#1b1530"/>`; }
      if (x >= 86 && x < 112) add("gills", `<path d="M ${f(100 - w * .8)} 100 q 6 -12 12 0 q 6 12 12 0 M ${f(100 + w * .8 - 24)} 100 q 6 -12 12 0 q 6 12 12 0" fill="none" stroke="${c("gills", "#ff8fa3")}" stroke-width="5"/>`);
      if (x >= 98 && x < 126) add("heart", `<circle cx="100" cy="${f(100 + h * .6)}" r="9" fill="${c("heart", "#e8445a")}"/>`);
      if (x >= 100) { add("cord", `<circle cx="100" cy="${f(100 - h * .62)}" r="4" fill="${c("cord", "#ffe79a")}"/>`); add("backbone", `<circle cx="100" cy="${f(100 - h * .45)}" r="7" fill="${c("backbone", "#f3e7cf")}"/>`); }
      if (x >= 128 && x < 232) add("bladder", `<ellipse cx="100" cy="${f(100 - h * .05)}" rx="${f(w * .55)}" ry="${f(h * .18)}" fill="${c("bladder", "#e9f7ff")}"/>`);
      if (x >= 110 && x < 240) add("gut", `<circle cx="100" cy="${f(100 + h * .4)}" r="9" fill="${c("gut", "#f0b46a")}"/>`);
      if (x >= 150) { const s = `<path d="M ${f(100 - w * .85)} ${f(100 - h * .3)} q ${f(w * .3)} ${f(h * .5)} 0 ${f(h * .9)} M ${f(100 + w * .85)} ${f(100 - h * .3)} q ${f(-w * .3)} ${f(h * .5)} 0 ${f(h * .9)}" fill="none" stroke="${c("muscle", "#d9a3a8")}" stroke-width="${f(w * .35)}"/>`; add("muscle", s); }
    }
    return { svg: `<svg viewBox="0 0 200 200" role="img" aria-label="Cross-section slice"><g stroke="${INK}" stroke-width="2.5">${outline}${g}</g></svg>`, parts };
  }

  /* Lifelike pictures for "meet the animals": a tadpole and a small fish seen from the side. viewBox 0 0 420 200. */
  function realTadpole(w = 340) {
    const spots = [[92, 82, 4], [118, 74, 3], [140, 96, 3.5], [104, 108, 3], [150, 80, 2.5], [128, 118, 2.5], [76, 96, 2.5]];
    return `<svg viewBox="0 0 420 200" width="${w}" role="img" aria-label="A river frog tadpole"><defs>
      <radialGradient id="tpb" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#6f6a3c"/><stop offset=".6" stop-color="#4a4526"/><stop offset="1" stop-color="#2d2a18"/></radialGradient>
      <linearGradient id="tpt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d7650" stop-opacity=".85"/><stop offset="1" stop-color="#b9b48e" stop-opacity=".35"/></linearGradient></defs>
      <path d="M 170 82 C 230 40 330 50 405 98 C 330 140 230 150 170 118 Z" fill="url(#tpt)" stroke="#5b5636" stroke-width="1.2"/>
      ${[[230, 72], [262, 84], [300, 78], [330, 94], [252, 112], [290, 116], [360, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#3f3b22" opacity=".55"/>`).join("")}
      <path d="M 172 92 C 250 90 330 94 400 98 C 330 102 250 108 172 110 Z" fill="#5d5733" opacity=".9"/>
      <path d="M 40 100 C 40 62 82 48 132 54 C 176 60 196 82 192 102 C 188 128 160 146 118 146 C 70 146 40 132 40 100 Z" fill="url(#tpb)" stroke="#262313" stroke-width="1.5"/>
      ${spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c9b25a" opacity=".7"/>`).join("")}
      <path d="M 112 130 C 130 140 160 134 170 118" fill="none" stroke="#8a845a" stroke-width="1.5" opacity=".6"/>
      <ellipse cx="74" cy="80" rx="9" ry="8" fill="#14110a"/><ellipse cx="74" cy="80" rx="9" ry="8" fill="none" stroke="#b49a44" stroke-width="2"/><circle cx="71" cy="77" r="2.4" fill="#fff"/>
      <path d="M 44 110 q 6 5 13 2" fill="none" stroke="#1a170c" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 150 128 q 6 6 14 4" fill="none" stroke="#262313" stroke-width="1.5"/></svg>`;
  }
  function realFish(w = 340) {
    return `<svg viewBox="0 0 420 200" width="${w}" role="img" aria-label="An eastern mosquitofish"><defs>
      <linearGradient id="tpf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f6247"/><stop offset=".45" stop-color="#9aa88d"/><stop offset=".7" stop-color="#d9dccd"/><stop offset="1" stop-color="#f2efe2"/></linearGradient></defs>
      <path d="M 318 98 L 398 52 Q 384 100 398 148 Z" fill="#7d8a6c" stroke="#3b4734" stroke-width="1.5"/>
      <path d="M 170 56 Q 200 22 238 50 Z" fill="#6f7d60" stroke="#3b4734" stroke-width="1.3"/>
      <path d="M 250 132 Q 268 160 288 132 Z" fill="#8e9a7d" stroke="#3b4734" stroke-width="1.3"/>
      <path d="M 30 104 C 52 64 130 48 210 52 C 270 56 310 80 326 98 C 310 118 270 142 210 146 C 130 150 52 140 30 104 Z" fill="url(#tpf)" stroke="#33402d" stroke-width="1.6"/>
      <path d="M 92 100 C 160 94 240 96 318 98" fill="none" stroke="#56634c" stroke-width="1.4" stroke-dasharray="3 4"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M ${130 + i * 30} 64 q 10 16 0 34 M ${130 + i * 30} 100 q 10 16 0 34" fill="none" stroke="#6b7760" stroke-width=".8" opacity=".5"/>`).join("")}
      <path d="M 96 66 C 112 84 112 120 96 138" fill="none" stroke="#3b4734" stroke-width="1.8"/>
      <path d="M 120 118 Q 140 142 160 124 Z" fill="#b8bfa6" stroke="#3b4734" stroke-width="1.2"/>
      <circle cx="62" cy="92" r="11" fill="#e8dfb0" stroke="#33402d" stroke-width="1.3"/><circle cx="62" cy="92" r="6.5" fill="#15130c"/><circle cx="60" cy="90" r="2" fill="#fff"/>
      <path d="M 31 106 q 8 4 16 1" fill="none" stroke="#33402d" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  const UI = {
    home: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 18 50 L 50 20 L 82 50 V 82 H 18 Z" fill="#ffd23f" stroke="#2a2233" stroke-width="7" stroke-linejoin="round"/><rect x="40" y="56" width="20" height="26" fill="#2a2233"/></svg>`,
    speak: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 16 38 H 34 L 54 20 V 80 L 34 62 H 16 Z" fill="#2ed3c6" stroke="#2a2233" stroke-width="6" stroke-linejoin="round"/><path d="M 64 36 Q 76 50 64 64 M 74 26 Q 94 50 74 74" fill="none" stroke="#2a2233" stroke-width="6" stroke-linecap="round"/></svg>`,
    lens: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="42" cy="42" r="26" fill="#d7f5f2" stroke="#2a2233" stroke-width="8"/><path d="M 62 62 L 86 86" stroke="#2a2233" stroke-width="12" stroke-linecap="round"/></svg>`,
    go: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 30 18 L 82 50 L 30 82 Z" fill="#fff" stroke="#2a2233" stroke-width="7" stroke-linejoin="round"/></svg>`,
    star: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 L62 38 L94 38 L68 58 L78 90 L50 70 L22 90 L32 58 L6 38 L38 38 Z" fill="#ffd23f" stroke="#2a2233" stroke-width="6" stroke-linejoin="round"/></svg>`,
    gear: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="16" fill="none" stroke="#2a2233" stroke-width="8"/><g stroke="#2a2233" stroke-width="12" stroke-linecap="round">${[0, 45, 90, 135].map(a => `<path d="M50 14 V24 M50 76 V86" transform="rotate(${a} 50 50)"/>`).join("")}</g></svg>`
  };
  return { tadpole, fish, slice, realTadpole, realFish, INK, UI };
})();
