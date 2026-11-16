/* ============================================================
   SKULL DETECTIVE drawings. Skulls are drawn from each species'
   real proportions (skull-detective-data.js), so they can be
   compared and measured. Parts carry data-part so the game can
   make them tappable. When a CT render is listed in the data,
   the game shows that instead of the drawing.
   ============================================================ */
window.SD_ART = (function () {
  const INK = "#2a2233", BONE = "#f3e7cf", BONE2 = "#e2cfa8", HOLE = "#3a2f3f";
  const f = n => Math.round(n * 10) / 10;

  // Smooth closed or open path through points (Catmull-Rom as cubic Beziers).
  function smooth(pts, closed) {
    const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + (closed ? " Z" : "");
  }

  /* Side view, snout to the left. Returns an SVG group in a box of width W.
     opt.scale: pixels per skull length (default W). opt.brain: cut-away brain.
     opt.parts: make parts tappable. opt.zoomTeeth: emphasise the tooth row. */
  function side(sp, opt = {}) {
    const s = sp.shape, L = opt.L || 300, X = opt.x || 0, B = opt.y || 0;   // B = tooth row line (y)
    const H = s.h * L;
    const P = (x, y) => [X + x * L, B - y * H];             // y in braincase heights, up is positive
    // top profile then underside, closed
    const top = [P(0, .4), P(.03, .54), P(s.r * .7, .6), P(s.r + .06, .68), P(.42, .78), P(.6, .92), P(.8, .97 + s.crest * 2.5), P(.93, .9 + s.crest * 2), P(.995, .62), P(1, .36)];
    const under = [P(.96, .2), P(.86, .12), P(.8, -.04), P(.72, .1), P(.56, .12), P(.46, .04), P(.3, 0), P(.12, 0), P(.03, .06)];
    const skull = smooth(top.concat(under), true);
    const ox = X + (s.r + .1) * L, oy = B - s.oy * H, orx = s.or * L * 1.15, ory = s.or * L;
    // cheekbone (zygomatic arch) drawn over the skull
    const zyg = smooth([P(s.r + .03, .34), P(s.r + .12, .24), P(.5, .25), P(.64, .3)], false);
    // teeth along the upper row
    let teeth = "";
    const tooth = (x0, x1, depth, kind) => {
      const a = P(x0, 0), b = P(x1, 0), m = X + (x0 + x1) / 2 * L;
      if (kind === "blade") teeth += `<path d="M ${f(a[0])} ${f(B)} L ${f(m - (x1 - x0) * L * .15)} ${f(B + depth)} L ${f(m + (x1 - x0) * L * .1)} ${f(B + depth * .55)} L ${f(b[0])} ${f(B)} Z"/>`;
      else if (kind === "flat") teeth += `<path d="M ${f(a[0])} ${f(B)} Q ${f(a[0])} ${f(B + depth)} ${f(m)} ${f(B + depth)} Q ${f(b[0])} ${f(B + depth)} ${f(b[0])} ${f(B)} Z"/>`;
      else teeth += `<path d="M ${f(a[0])} ${f(B)} L ${f(m)} ${f(B + depth)} L ${f(b[0])} ${f(B)} Z"/>`;
    };
    tooth(.005, .03, L * .025);                              // incisors
    tooth(.04, .085, L * .1);                                // canine
    tooth(.1, .14, L * .035); tooth(.15, .2, L * .045); tooth(.21, .27, L * .055);
    const molarW = s.molar === "crush" ? .1 : s.molar === "mixed" ? .11 : .05;
    tooth(.28, .37, L * .075, "blade");                      // carnassial
    tooth(.375, .375 + molarW, L * (s.molar === "slice" ? .025 : .04), s.molar === "slice" ? "" : "flat");
    // lower jaw
    const jaw = smooth([P(.03, -.05), P(.2, -.06), P(.45, -.08), P(.56, -.06), P(.6, .3), P(.65, .44), P(.68, .22), P(.71, .06), P(.74, -.12), P(.68, -.3), P(.45, -.36), P(.2, -.32), P(.05, -.22)], true);
    let lowTeeth = "";
    const lt = (x0, x1, depth) => { const m = X + (x0 + x1) / 2 * L; lowTeeth += `<path d="M ${f(X + x0 * L)} ${f(B - L * .012)} L ${f(m)} ${f(B - L * .012 - depth)} L ${f(X + x1 * L)} ${f(B - L * .012)} Z"/>`; };
    lt(.02, .045, L * .02); lt(.055, .095, L * .085); lt(.12, .17, L * .035); lt(.18, .24, L * .045); lt(.25, .36, L * .065); lt(.37, .41, L * .02);
    const T = opt.parts ? (id, extra = "") => ` data-part="${id}" class="sd-part" tabindex="0" role="button" aria-label="${id}"${extra}` : () => "";
    const nose = P(.012, .4), ear = P(.88, .26), iof = P(s.r - .015, .38);
    let g = `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">`;
    g += `<path d="${jaw}" fill="${BONE2}" stroke-width="${L * .012}"/>`;
    g += `<g fill="#fffaf0" stroke-width="${L * .006}"${T("teeth")}>${lowTeeth}${teeth}</g>`;
    g += `<path d="${skull}" fill="${BONE}" stroke-width="${L * .013}"${T("skull", ' aria-hidden="true" tabindex="-1"')}/>`;
    if (opt.parts && !opt.brain) g += `<path d="${smooth([P(.52, .5), P(.62, .88), P(.8, .92), P(.94, .7), P(.92, .34), P(.76, .24), P(.6, .32)], true)}" fill="transparent" stroke="none"${T("brain")}/>`;
    if (opt.brain) {
      const bulbR = L * .035 * (.6 + s.bulb * .6);
      const bx = X + (.495 + (1 - s.bulb) * .015) * L, by = B - .6 * H;
      g += `<g data-brain="1"><path d="${smooth([P(.51, .5), P(.6, .82), P(.78, .88), P(.92, .7), P(.9, .34), P(.75, .22), P(.58, .3)], true)}" fill="#f6a5b5" stroke-width="${L * .007}"${T("brainmass")}/>`;
      g += `<path d="M ${f(X + .62 * L)} ${f(B - .75 * H)} q ${f(L * .06)} ${f(-L * .03)} ${f(L * .12)} 0 M ${f(X + .6 * L)} ${f(B - .5 * H)} q ${f(L * .08)} ${f(L * .03)} ${f(L * .2)} ${f(-L * .02)}" fill="none" stroke-width="${L * .005}"/>`;
      g += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="${f(bulbR * 1.3)}" ry="${f(bulbR)}" fill="#ffd23f" stroke-width="${L * .007}"${T("bulb")}/></g>`;
    }
    g += `<path d="${zyg}" fill="none" stroke="${INK}" stroke-width="${L * .036}"/><path d="${zyg}" fill="none" stroke="${BONE}" stroke-width="${L * .018}"/>`;
    g += `<ellipse cx="${f(ox)}" cy="${f(oy)}" rx="${f(orx)}" ry="${f(ory)}" fill="${HOLE}" stroke-width="${L * .01}"${T("eye")}/>`;
    g += `<ellipse cx="${f(nose[0])}" cy="${f(nose[1])}" rx="${f(L * .016)}" ry="${f(L * .03)}" fill="${HOLE}" stroke-width="${L * .008}"${T("nose")}/>`;
    g += `<ellipse cx="${f(iof[0])}" cy="${f(iof[1])}" rx="${f(L * s.iof * .7)}" ry="${f(L * s.iof)}" fill="${HOLE}" stroke-width="${L * .006}"${T("whisker")}/>`;
    g += `<circle cx="${f(ear[0])}" cy="${f(ear[1])}" r="${f(L * .025)}" fill="${HOLE}" stroke-width="${L * .008}"${T("ear")}/>`;
    if (opt.parts) {
      // generous invisible tap areas for small fingers
      g += `<rect x="${f(X)}" y="${f(B - L * .01)}" width="${f(L * .45)}" height="${f(L * .12)}" fill="transparent" stroke="none"${T("teeth", ' aria-hidden="true" tabindex="-1"')}/>`;
      g += `<circle cx="${f(ox)}" cy="${f(oy)}" r="${f(Math.max(orx, L * .07))}" fill="transparent" stroke="none"${T("eye", ' aria-hidden="true" tabindex="-1"')}/>`;
      g += `<circle cx="${f(nose[0])}" cy="${f(nose[1])}" r="${f(L * .06)}" fill="transparent" stroke="none"${T("nose", ' aria-hidden="true" tabindex="-1"')}/>`;
      g += `<circle cx="${f(ear[0])}" cy="${f(ear[1])}" r="${f(L * .06)}" fill="transparent" stroke="none"${T("ear", ' aria-hidden="true" tabindex="-1"')}/>`;
    }
    return g + "</g>";
  }

  /* Top view, snout up, centred on cx. len px = skull length. */
  function top(sp, opt = {}) {
    const s = sp.shape, L = opt.L || 300, cx = opt.cx || 0, y0 = opt.y || 0;
    const half = (w, t) => [cx + w * L / 2, y0 + t * L];
    const R = [half(s.rw * .55, 0), half(s.rw, .08), half(s.rw * 1.05, .2), half(s.zw * .9, .3), half(s.zw, .45), half(s.zw * .92, .58), half(s.bw, .66), half(s.mw, .86), half(s.mw * .7, .97), half(.1, 1)];
    const Lf = R.slice().reverse().map(p => [2 * cx - p[0], p[1]]);
    const outline = smooth(R.concat(Lf), true);
    const brain = smooth([half(s.pc, .33), half(s.pc * 1.05, .48), half(s.bw * .95, .66), half(s.mw * .85, .88), half(0, .99), [2 * cx - half(s.mw * .85, .88)[0], half(0, .88)[1]], [2 * cx - half(s.bw * .95, .66)[0], half(0, .66)[1]], [2 * cx - half(s.pc * 1.05, .48)[0], half(0, .48)[1]], [2 * cx - half(s.pc, .33)[0], half(0, .33)[1]], half(0, .3)], true);
    const orbit = side => { const k = side; const a = [cx + k * L * s.pc * .55, y0 + L * .32], b = [cx + k * L * s.zw * .42, y0 + L * .5], c = [cx + k * L * s.pc * .62, y0 + L * .56]; return smooth([a, [cx + k * L * s.zw * .4, y0 + L * .34], b, c], true); };
    let g = `<g stroke="${INK}" stroke-linejoin="round">`;
    g += `<path d="${outline}" fill="${BONE}" stroke-width="${L * .013}"/>`;
    g += `<path d="${brain}" fill="${BONE2}" stroke-width="${L * .008}"/>`;
    g += `<path d="${orbit(1)}" fill="${HOLE}" stroke-width="${L * .008}"/><path d="${orbit(-1)}" fill="${HOLE}" stroke-width="${L * .008}"/>`;
    if (s.crest > .015) g += `<path d="M ${cx} ${f(y0 + L * .5)} L ${cx} ${f(y0 + L * .97)}" stroke-width="${L * .012 + s.crest * L * .15}" stroke="${INK}"/>`;
    g += `<ellipse cx="${cx}" cy="${f(y0 + L * .015)}" rx="${f(L * s.rw * .22)}" ry="${f(L * .015)}" fill="${HOLE}" stroke-width="${L * .006}"/>`;
    return g + "</g>";
  }

  // Whole-skull SVG for cards: side view fit in a 200x120 box.
  function card(sp) {
    return `<svg viewBox="-10 -${f(200 * sp.shape.h + 20)} 220 ${f(200 * sp.shape.h + 135)}" aria-hidden="true">${side(sp, { L: 200, x: 0, y: 0 })}</svg>`;
  }

  /* A cartoon of the living animal (side view, facing left). */
  function animal(sp, w = 200) {
    const s = sp.shape, k = w / 200, body = 110 * s.body, leg = 40 * s.leg;
    const bx = 100 - body / 2 + 10, by = 70, bh = 30 + (s.stripe ? 8 : 0);
    let tail = "";
    if (s.tail === "otter") tail = `<path d="M ${bx + body - 6} ${by + 4} Q ${bx + body + 40} ${by + 10} ${bx + body + 62} ${by + 34} Q ${bx + body + 30} ${by + 26} ${bx + body - 6} ${by + 22} Z" fill="${s.fur}"/>`;
    else if (s.tail === "bushy" || s.tail === "long") { const tl = s.tail === "long" ? 66 : 48; tail = `<path d="M ${bx + body - 8} ${by + 2} Q ${bx + body + tl * .6} ${by - 14} ${bx + body + tl} ${by + 10} Q ${bx + body + tl * .55} ${by + 22} ${bx + body - 8} ${by + 18} Z" fill="${s.fur}"/>`; }
    else tail = `<path d="M ${bx + body - 6} ${by + 6} L ${bx + body + 16} ${by + 2} L ${bx + body - 2} ${by + 20} Z" fill="${s.fur}"/>`;
    const legs = [bx + 18, bx + 34, bx + body - 34, bx + body - 18].map(x => `<rect x="${x - 7}" y="${by + bh - 8}" width="14" height="${leg}" rx="7" fill="${s.fur}"/>`).join("") +
      (s.stripe ? [bx + 18, bx + 34].map(x => `<path d="M ${x - 8} ${by + bh + leg - 6} l -6 6 M ${x - 3} ${by + bh + leg - 4} l -5 7 M ${x + 2} ${by + bh + leg - 4} l -4 7" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("") : "");
    const hx = bx - 6, hy = by + 6, hr = 22 * (s.stripe ? 1.15 : 1);
    let head = `<ellipse cx="${hx}" cy="${hy}" rx="${hr * 1.15}" ry="${hr * .9}" fill="${s.fur}"/>`;
    head += `<path d="M ${hx - hr * .7} ${hy - 4} Q ${hx - hr * 1.9} ${hy + 2} ${hx - hr * 1.7} ${hy + 10} Q ${hx - hr} ${hy + 14} ${hx - hr * .4} ${hy + 12} Z" fill="${s.fur}"/>`;
    if (s.chin) head += `<path d="M ${hx - hr * 1.4} ${hy + 10} Q ${hx - hr * .6} ${hy + 22} ${hx + 2} ${hy + 14}" fill="none" stroke="${s.chin}" stroke-width="7" stroke-linecap="round"/>`;
    if (s.stripe) head += `<path d="M ${hx - hr * 1.6} ${hy + 3} Q ${hx - hr * .4} ${hy - hr * 1.1} ${hx + hr} ${hy - 6}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    head += `<circle cx="${hx + 6}" cy="${hy - hr * .65}" r="${8 * s.ear}" fill="${s.fur}"/>`;
    head += `<circle cx="${hx - hr * .55}" cy="${hy - 3}" r="3.6" fill="${INK}" stroke="none"/><circle cx="${hx - hr * 1.72}" cy="${hy + 5}" r="3.6" fill="${INK}" stroke="none"/>`;
    if (sp.job === "swimmer" && s.tail === "otter") head += `<path d="M ${hx - hr * 1.3} ${hy + 9} l -14 -4 M ${hx - hr * 1.3} ${hy + 11} l -15 3" stroke="#fff" stroke-width="1.6"/>`;
    let bodyP = `<rect x="${bx}" y="${by - (s.stripe ? 4 : 0)}" width="${body}" height="${bh}" rx="${bh / 2}" fill="${s.fur}"/>`;
    if (s.belly !== s.fur) bodyP += `<rect x="${bx + 10}" y="${by + bh * .55}" width="${body - 20}" height="${bh * .4}" rx="${bh * .2}" fill="${s.belly}" stroke="none"/>`;
    if (s.frost) bodyP += `<path d="M ${bx + 6} ${by + 6} Q ${hx} ${hy - hr} ${hx - hr} ${hy - 8}" fill="none" stroke="#8a7d72" stroke-width="5" stroke-linecap="round"/>`;
    return `<svg viewBox="-10 0 ${200 + 80} 140" width="${w}" aria-hidden="true"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">${tail}${legs}${bodyP}${head}</g></svg>`;
  }

  /* Habitat tiles. */
  const HAB = {
    river: `<rect width="200" height="140" fill="#bfe8ff"/><path d="M0 80 Q50 64 100 80 T200 80 V140 H0Z" fill="#3aa0e0"/><path d="M10 100 q15 -8 30 0 M80 112 q15 -8 30 0 M140 96 q15 -8 30 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M0 80 Q30 70 46 82 L0 96Z" fill="#6bbf59"/>`,
    trees: `<rect width="200" height="140" fill="#cdeec0"/><rect x="40" y="70" width="14" height="70" fill="#7a5233"/><rect x="130" y="60" width="14" height="80" fill="#7a5233"/><circle cx="47" cy="50" r="36" fill="#2f8f4e"/><circle cx="137" cy="40" r="40" fill="#2f8f4e"/><circle cx="90" cy="30" r="26" fill="#3aa65b"/><path d="M54 70 L130 62" stroke="#7a5233" stroke-width="6"/>`,
    forest: `<rect width="200" height="140" fill="#dfeccf"/><rect x="20" y="0" width="22" height="110" fill="#6b4a2f"/><rect x="160" y="0" width="24" height="110" fill="#6b4a2f"/><rect width="200" height="34" y="106" fill="#8a6a3f"/><rect x="60" y="92" width="80" height="18" rx="9" fill="#9a6a35"/><path d="M50 108 q10 -26 22 0 M140 108 q10 -26 22 0" fill="#3aa65b"/>`,
    grassland: `<rect width="200" height="140" fill="#fff0b3"/><circle cx="160" cy="30" r="16" fill="#ffd23f"/><rect y="90" width="200" height="50" fill="#d9b25c"/><path d="M0 92 l6 -16 l6 16 l6 -14 l6 14 M60 92 l6 -18 l6 18 l6 -12 l6 12 M150 92 l6 -16 l6 16 l6 -14 l6 14" fill="#8fbf3f"/><ellipse cx="100" cy="118" rx="26" ry="14" fill="#5a3e22"/>`
  };
  const habitat = id => `<svg viewBox="0 0 200 140" aria-hidden="true"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">${HAB[id]}</g></svg>`;

  /* Small food and food-chain pictures (5th grade). */
  const IC = {
    sun: `<circle cx="50" cy="50" r="22" fill="#ffd23f"/><g stroke-width="6" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return `<path d="M ${f(50 + 30 * Math.cos(r))} ${f(50 + 30 * Math.sin(r))} L ${f(50 + 42 * Math.cos(r))} ${f(50 + 42 * Math.sin(r))}"/>`; }).join("")}</g>`,
    algae: `<path d="M30 90 q-10 -30 6 -60 q6 30 -2 60Z M50 90 q-4 -40 10 -70 q4 40 -4 70Z M70 90 q10 -30 0 -55 q-8 30 -6 55Z" fill="#3aa65b"/><rect x="14" y="86" width="72" height="8" rx="4" fill="#3aa0e0"/>`,
    seeds: `<ellipse cx="34" cy="60" rx="12" ry="18" fill="#c99a52" transform="rotate(-20 34 60)"/><ellipse cx="62" cy="54" rx="12" ry="18" fill="#a87b3c" transform="rotate(25 62 54)"/><ellipse cx="50" cy="32" rx="9" ry="14" fill="#c99a52"/>`,
    bark: `<rect x="30" y="10" width="40" height="80" rx="6" fill="#7a5233"/><path d="M40 20 v20 M55 30 v30 M44 60 v22 M60 70 v14" stroke-width="4" stroke-linecap="round"/>`,
    tadpole: `<path d="M56 50 q22 -14 36 6 q-16 -2 -36 8Z" fill="#6b7a3a"/><ellipse cx="40" cy="52" rx="20" ry="16" fill="#6b7a3a"/><circle cx="32" cy="46" r="4" fill="#fff"/>`,
    frog: `<ellipse cx="50" cy="62" rx="30" ry="20" fill="#5bb04b"/><circle cx="36" cy="40" r="10" fill="#5bb04b"/><circle cx="64" cy="40" r="10" fill="#5bb04b"/><circle cx="36" cy="40" r="4" fill="${INK}"/><circle cx="64" cy="40" r="4" fill="${INK}"/><path d="M38 66 q12 8 24 0" fill="none" stroke-width="3"/>`,
    fish: `<path d="M20 50 q30 -30 60 0 q-30 30 -60 0Z" fill="#7fb6d9"/><path d="M78 50 l16 -14 v28Z" fill="#7fb6d9"/><circle cx="34" cy="46" r="4" fill="${INK}"/>`,
    crayfish: `<path d="M30 50 h40 q10 0 10 8 q0 8 -10 8 h-40Z" fill="#d9573a"/><path d="M30 52 l-18 -16 l4 -6 l18 14 M30 64 l-18 14 l4 6 l18 -14" fill="#d9573a"/><path d="M80 58 l12 -6 v12Z" fill="#d9573a"/>`,
    mouse: `<ellipse cx="54" cy="58" rx="28" ry="18" fill="#a59a8c"/><circle cx="32" cy="48" r="10" fill="#a59a8c"/><circle cx="40" cy="36" r="8" fill="#e8b4b4"/><circle cx="28" cy="48" r="3" fill="${INK}"/><path d="M82 60 q14 4 10 20" fill="none" stroke-width="3"/>`,
    squirrel: `<path d="M60 76 q30 -6 26 -40 q-4 -26 -24 -18 q14 10 10 30 q-4 18 -12 28Z" fill="#b5652c"/><ellipse cx="46" cy="62" rx="20" ry="18" fill="#c46f30"/><circle cx="34" cy="40" r="12" fill="#c46f30"/><circle cx="30" cy="38" r="3" fill="${INK}"/><path d="M36 28 l4 -10 l4 10" fill="#c46f30"/>`,
    rabbit: `<ellipse cx="56" cy="62" rx="28" ry="20" fill="#eee8dd"/><circle cx="32" cy="48" r="13" fill="#eee8dd"/><ellipse cx="32" cy="22" rx="5" ry="16" fill="#eee8dd"/><ellipse cx="42" cy="24" rx="5" ry="16" fill="#eee8dd"/><circle cx="27" cy="46" r="3" fill="${INK}"/>`,
    porcupine: `<ellipse cx="54" cy="62" rx="30" ry="20" fill="#5a4a3a"/><g stroke-width="3">${Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.05 + i * .11); return `<path d="M ${f(56 + 26 * Math.cos(a))} ${f(62 + 18 * Math.sin(a))} l ${f(14 * Math.cos(a))} ${f(14 * Math.sin(a))}"/>`; }).join("")}</g><circle cx="28" cy="64" r="10" fill="#5a4a3a"/><circle cx="24" cy="62" r="2.5" fill="#fff" stroke="none"/>`,
    berries: `<circle cx="38" cy="58" r="12" fill="#6b4fd8"/><circle cx="60" cy="56" r="12" fill="#6b4fd8"/><circle cx="50" cy="74" r="12" fill="#6b4fd8"/><path d="M50 44 q2 -18 16 -24" fill="none" stroke-width="3"/><ellipse cx="66" cy="22" rx="10" ry="5" fill="#3aa65b"/>`,
    insect: `<ellipse cx="50" cy="56" rx="14" ry="22" fill="#2a2233"/><circle cx="50" cy="30" r="9" fill="#2a2233"/><path d="M36 48 l-14 -6 M36 58 l-16 0 M36 68 l-14 8 M64 48 l14 -6 M64 58 l16 0 M64 68 l14 8" stroke-width="3"/>`
  };
  IC.otter = null;   // animals in chains use their cartoon
  const icon = id => `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">${IC[id] || ""}</g></svg>`;

  const UI = {
    home: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 18 50 L 50 20 L 82 50 V 82 H 18 Z" fill="#ffd23f" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="40" y="56" width="20" height="26" fill="${INK}"/></svg>`,
    speak: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 16 38 H 34 L 54 20 V 80 L 34 62 H 16 Z" fill="#2ed3c6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M 64 36 Q 76 50 64 64 M 74 26 Q 94 50 74 74" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></svg>`,
    lens: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="42" cy="42" r="26" fill="#d7f5f2" stroke="${INK}" stroke-width="8"/><path d="M 62 62 L 86 86" stroke="${INK}" stroke-width="12" stroke-linecap="round"/></svg>`,
    go: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 30 18 L 82 50 L 30 82 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></svg>`,
    star: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 L62 38 L94 38 L68 58 L78 90 L50 70 L22 90 L32 58 L6 38 L38 38 Z" fill="#ffd23f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></svg>`,
    gear: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="16" fill="none" stroke="${INK}" stroke-width="8"/><g stroke="${INK}" stroke-width="12" stroke-linecap="round">${[0, 45, 90, 135].map(a => `<path d="M50 14 V24 M50 76 V86" transform="rotate(${a} 50 50)"/>`).join("")}</g></svg>`
  };

  return { side, top, card, animal, habitat, icon, UI, INK };
})();
