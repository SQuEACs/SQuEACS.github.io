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

  /* Side view, snout to the left. L = skull length in px, (x, y) = front of the tooth row.
     opt.parts: tappable parts (data-part). opt.brain: cut-away endocast. opt.teeth: tappable tooth types.
     opt.fade: draw the bone faded (for pathway diagrams). */
  function geo(sp, opt = {}) {
    const s = sp.shape, L = opt.L || 300, X = opt.x || 0, B = opt.y || 0, H = s.h * L;
    const P = (x, y) => [X + x * L, B - y * H];
    return { s, L, X, B, H, P, ox: X + (s.r + .1) * L, oy: B - s.oy * H, orx: s.or * L * 1.15, ory: s.or * L,
      canX: X + .0625 * L, canTip: B + L * s.ca, iof: P(s.r - .015, .38), nose: P(.012, .4), ear: P(.88, .26) };
  }
  function brainParts(G, T, sw) {
    const { s, L, H, P, X, B } = G;
    const bRx = L * (.02 + .018 * s.bulb), bRy = H * (.09 + .07 * s.bulb), bx = X + .5 * L - bRx * .55, by = B - .6 * H;
    let g = `<path d="${smooth([P(.72, .42), P(.86, .36), P(.99, .31), P(.99, .21), P(.86, .24), P(.72, .32)], true)}" fill="#d48fae" stroke-width="${sw}"${T("brainstem")}/>`;
    g += `<path d="${smooth([P(.8, .76), P(.89, .8), P(.94, .64), P(.93, .42), P(.86, .34), P(.79, .46)], true)}" fill="#e7a6c8" stroke-width="${sw}"${T("cerebellum")}/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M ${f(X + (.82 + i * .025) * L)} ${f(B - .72 * H + i * 2)} q ${f(L * .012)} ${f(H * .18)} 0 ${f(H * .32)}" fill="none" stroke-width="${sw * .6}" opacity=".6"/>`;
    g += `<path d="${smooth([P(.505, .5), P(.54, .78), P(.64, .9), P(.76, .9), P(.835, .8), P(.845, .55), P(.78, .38), P(.66, .32), P(.55, .37)], true)}" fill="#f4b6c2" stroke-width="${sw}"${T("cerebrum")}/>`;
    g += `<path d="M ${f(X + .58 * L)} ${f(B - .8 * H)} q ${f(L * .06)} ${f(H * .1)} ${f(L * .1)} ${f(H * .02)} M ${f(X + .56 * L)} ${f(B - .6 * H)} q ${f(L * .1)} ${f(-H * .06)} ${f(L * .2)} ${f(H * .04)} M ${f(X + .62 * L)} ${f(B - .45 * H)} q ${f(L * .08)} ${f(-H * .1)} ${f(L * .16)} 0" fill="none" stroke-width="${sw * .6}" opacity=".6"/>`;
    g += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="${f(bRx)}" ry="${f(bRy)}" transform="rotate(-18 ${f(bx)} ${f(by)})" fill="#ffd27a" stroke-width="${sw}"${T("olfbulb")}/>`;
    return g;
  }
  function side(sp, opt = {}) {
    const G = geo(sp, opt), { s, L, X, B, H, P } = G, LW = opt.lw || L;
    const top = [P(0, .4), P(.03, .54), P(s.r * .7, .6), P(s.r + .06, .68), P(.42, .78), P(.6, .92), P(.8, .97 + s.crest * 2.5), P(.93, .9 + s.crest * 2), P(.995, .62), P(1, .36)];
    const under = [P(.96, .2), P(.86, .12), P(.8, -.04), P(.72, .1), P(.56, .12), P(.46, .04), P(.3, 0), P(.12, 0), P(.03, .06)];
    const skull = smooth(top.concat(under), true);
    const zyg = smooth([P(s.r + .03, .34), P(s.r + .12, .24), P(.5, .25), P(.64, .3)], false);
    const T = opt.parts || opt.teeth || opt.brainParts ? (id, extra = "") => ` data-part="${id}" class="sd-part" tabindex="0" role="button" aria-label="${id}"${extra}` : () => "";
    const TT = opt.teeth ? T : () => "", TP = opt.parts ? T : () => "";
    const teeth = { incisor: "", canine: "", premolar: "", carnassial: "", molar: "" };
    const tooth = (type, x0, x1, depth, kind) => {
      const a = X + x0 * L, b = X + x1 * L, m = (a + b) / 2;
      let d;
      if (kind === "blade") d = `M ${f(a)} ${f(B)} L ${f(m - (b - a) * .15)} ${f(B + depth)} L ${f(m + (b - a) * .1)} ${f(B + depth * .55)} L ${f(b)} ${f(B)} Z`;
      else if (kind === "flat") d = `M ${f(a)} ${f(B)} Q ${f(a)} ${f(B + depth)} ${f(m)} ${f(B + depth)} Q ${f(b)} ${f(B + depth)} ${f(b)} ${f(B)} Z`;
      else d = `M ${f(a)} ${f(B)} L ${f(m)} ${f(B + depth)} L ${f(b)} ${f(B)} Z`;
      teeth[type] += `<path d="${d}"/>`;
    };
    const lt = (type, x0, x1, depth) => { const m = X + (x0 + x1) / 2 * L, y = B - L * .012; teeth[type] += `<path d="M ${f(X + x0 * L)} ${f(y)} L ${f(m)} ${f(y - depth)} L ${f(X + x1 * L)} ${f(y)} Z"/>`; };
    tooth("incisor", .005, .03, L * .025);
    tooth("canine", .04, .085, L * s.ca);
    tooth("premolar", .1, .14, L * .035); tooth("premolar", .15, .2, L * .045); tooth("premolar", .21, .27, L * .055);
    const molarW = s.molar === "crush" ? .1 : s.molar === "mixed" ? .11 : .05;
    tooth("carnassial", .28, .37, L * .075, "blade");
    tooth("molar", .375, .375 + molarW, L * (s.molar === "slice" ? .025 : .04), s.molar === "slice" ? "" : "flat");
    lt("incisor", .02, .045, L * .02); lt("canine", .055, .095, L * s.ca * .85); lt("premolar", .12, .17, L * .035); lt("premolar", .18, .24, L * .045); lt("carnassial", .25, .36, L * .065); lt("molar", .37, .41, L * .02);
    const jaw = smooth([P(.03, -.05), P(.2, -.06), P(.45, -.08), P(.56, -.06), P(.6, .3), P(.65, .44), P(.68, .22), P(.71, .06), P(.74, -.12), P(.68, -.3), P(.45, -.36), P(.2, -.32), P(.05, -.22)], true);
    const op = opt.fade ? ` opacity="${opt.fade}"` : "";
    let g = `<g stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">`;
    g += `<g${op}><path d="${jaw}" fill="${BONE2}" stroke-width="${f(LW * .012)}"/>`;
    g += `<g fill="#fffaf0" stroke-width="${f(LW * .006)}"${opt.teeth ? "" : TP("teeth")}>${Object.keys(teeth).map(k => `<g${TT("t-" + k)} data-tooth="${k}">${teeth[k]}</g>`).join("")}</g>`;
    g += `<path d="${skull}" fill="${BONE}" stroke-width="${f(LW * .013)}"${TP("skull", ' aria-hidden="true" tabindex="-1"')}/>`;
    if (opt.crest && s.crest > .015) g += `<path d="${smooth([P(.6, .92), P(.8, .97 + s.crest * 2.5), P(.93, .9 + s.crest * 2)], false)}" fill="none" stroke="#c2552a" stroke-width="${f(LW * .02)}"/>`;
    g += `</g>`;
    if (opt.parts && !opt.brain) g += `<path d="${smooth([P(.52, .5), P(.62, .88), P(.8, .92), P(.94, .7), P(.92, .34), P(.76, .24), P(.6, .32)], true)}" fill="transparent" stroke="none"${TP("brain")}/>`;
    if (opt.brain) g += brainParts(G, opt.brainParts ? T : () => "", LW * .006);
    g += `<g${op}><path d="${zyg}" fill="none" stroke="${INK}" stroke-width="${L * .036}"/><path d="${zyg}" fill="none" stroke="${BONE}" stroke-width="${L * .018}"/>`;
    g += `<ellipse cx="${f(G.ox)}" cy="${f(G.oy)}" rx="${f(G.orx)}" ry="${f(G.ory)}" fill="${HOLE}" stroke-width="${f(LW * .01)}"${TP("eye")}/>`;
    g += `<ellipse cx="${f(G.nose[0])}" cy="${f(G.nose[1])}" rx="${f(L * .016)}" ry="${f(L * .03)}" fill="${HOLE}" stroke-width="${f(LW * .008)}"${TP("nose")}/>`;
    g += `<ellipse cx="${f(G.iof[0])}" cy="${f(G.iof[1])}" rx="${f(L * s.iof * .7)}" ry="${f(L * s.iof)}" fill="${HOLE}" stroke-width="${f(LW * .006)}"${opt.iofHi ? ` stroke="#c2552a" stroke-width="${f(LW * .012)}"` : ""}/>`;
    g += `<circle cx="${f(G.ear[0])}" cy="${f(G.ear[1])}" r="${f(L * .025)}" fill="${HOLE}" stroke-width="${f(LW * .008)}"${TP("ear")}/></g>`;
    if (opt.parts) {
      g += `<rect x="${f(X)}" y="${f(B - L * .01)}" width="${f(L * .45)}" height="${f(L * .12)}" fill="transparent" stroke="none"${TP("teeth", ' aria-hidden="true" tabindex="-1"')}/>`;
      g += `<circle cx="${f(G.ox)}" cy="${f(G.oy)}" r="${f(Math.max(G.orx, L * .07))}" fill="transparent" stroke="none"${TP("eye", ' aria-hidden="true" tabindex="-1"')}/>`;
      g += `<circle cx="${f(G.nose[0])}" cy="${f(G.nose[1])}" r="${f(L * .06)}" fill="transparent" stroke="none"${TP("nose", ' aria-hidden="true" tabindex="-1"')}/>`;
      g += `<circle cx="${f(G.ear[0])}" cy="${f(G.ear[1])}" r="${f(L * .06)}" fill="transparent" stroke="none"${TP("ear", ' aria-hidden="true" tabindex="-1"')}/>`;
    }
    return g + "</g>";
  }

  /* Sense pathways (4th grade): a faded skull with the brain, and the route a message takes
     from a sense organ to the brain. Each stop is a tappable label (data-step). Returns
     { svg, steps } with steps in order. */
  const ROUTES = {
    sight: { color: "#3a8dde", stops: G => [["Eye, in the {orbit}", [G.ox, G.oy]], ["{opticn}", G.P(.45, .4)], ["Vision area of the {cerebrum}", G.P(.77, .78)]], via: G => [G.P(.6, .34), G.P(.72, .55)] },
    smell: { color: "#d98a1e", stops: G => [["{turbinals} in the nose", G.P(.1, .5)], ["{olfn}", G.P(.43, .6)], ["{olfbulb}", G.P(.495, .6)], ["Smell area of the {cerebrum}", G.P(.6, .42)]], via: () => [] },
    touch: { color: "#2e9e6a", stops: G => [["{vibrissae}", [G.X - G.L * .07, G.B - G.H * .32]], ["{iof}", G.iof], ["{trigeminal}", G.P(.62, .2)], ["{brainstem}", G.P(.88, .27)], ["Touch area of the {cerebrum}", G.P(.68, .86)]], via: () => [] },
    hearing: { color: "#8a4fd8", stops: G => [["Ear opening ({meatus})", G.ear], ["Middle ear in the {bulla}", G.P(.8, -.04)], ["{cochlea}", G.P(.76, .14)], ["{auditoryn}", G.P(.82, .25)], ["Hearing area of the {cerebrum}", G.P(.7, .55)]], via: () => [] }
  };
  function pathway(sp, sense, opt = {}) {
    const L = 300, G = geo(sp, { L, x: 30, y: 0 }), R = ROUTES[sense], stops = R.stops(G);
    let g = side(sp, { L, x: 30, y: 0, brain: true, fade: .55 });
    if (sense === "touch") g += `<g stroke="#6b5f55" stroke-width="1.4">${[-.06, 0, .06].map(d => `<path d="M ${f(G.X + L * .02)} ${f(G.B - G.H * (.35 + d))} l ${f(-L * .11)} ${f(L * (d * .6 - .01))}"/>`).join("")}</g>`;
    if (sense === "smell") g += `<g fill="none" stroke="#d98a1e" stroke-width="1.6" opacity=".9">${[.06, .12, .18, .24].map(x => `<path d="M ${f(G.X + x * L)} ${f(G.B - G.H * .62)} q ${f(L * .02)} ${f(G.H * .12)} 0 ${f(G.H * .22)}"/>`).join("")}</g>`;
    const pts = stops.map(s => s[1]), path = [pts[0]];
    const via = R.via(G); for (let i = 1; i < pts.length; i++) { if (i === pts.length - 1) path.push(...via); path.push(pts[i]); }
    const shown = opt.upto == null ? pts.length : opt.upto;
    // route drawn up to the last stop found so far
    if (shown > 1) { const k = path.indexOf(pts[shown - 1]); g += `<path d="${smooth(path.slice(0, k + 1), false)}" fill="none" stroke="${R.color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 12" class="sd-flow"/><path d="${smooth(path.slice(0, k + 1), false)}" fill="none" stroke="${R.color}" stroke-width="3.5" opacity=".75"/>`; }
    // numbered markers at each stop; the labels are buttons in the page
    const steps = stops.map(st => st[0]);
    stops.forEach((st, i) => {
      const done = i < shown;
      g += `<circle cx="${f(st[1][0])}" cy="${f(st[1][1])}" r="${done ? 11 : 6}" fill="${done ? R.color : "#fff"}" stroke="${INK}" stroke-width="2"/>`;
      if (done) g += `<text x="${f(st[1][0])}" y="${f(st[1][1] + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" stroke="none">${i + 1}</text>`;
    });
    const topY = -G.H * 1.1 - 6, botY = L * .2;
    return { svg: `<svg viewBox="-20 ${f(topY)} 380 ${f(botY - topY)}" role="img" aria-label="${sense} pathway from sense organ to brain">${g}</svg>`, steps };
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

  /* The living animal, side view facing left, drawn from body proportions (look in the data). */
  let gradN = 0;
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * k)))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); }
  function animal(sp, w = 200) {
    const a = sp.look, id = ++gradN, gid = "sdfur" + id, line = shade(a.fur, .5), GY = 170;
    const L = a.L, H = a.H, leg = a.leg, s = 110, h = s + L * .72, yb = GY - leg, yt = yb - H;
    const hl = a.head, hh = H * (a.stripe ? .7 : .78), hx = s - hl * .55, hy = yt + H * (a.flat ? .38 : .22);
    const lw = a.stripe ? 13 : 9 + H * .08, legC = a.legs || shade(a.fur, .9), far = shade(legC, .72);
    const tl = a.tail[0], th = a.tail[1], bu = a.tail[2];
    const body = smooth([
      [hx - hl * .62, hy + hh * .08], [hx - hl * .55, hy - hh * .12], [hx - hl * .2, hy - hh * .42], [hx + hl * .15, hy - hh * .5], [hx + hl * .4, hy - hh * .36],
      [s - 6, yt + H * .1], [s + 14, yt - a.arch * .3], [s + L * .45, yt - a.arch], [h - 4, yt - a.arch * .4], [h + L * .14, yt + H * .16],
      [h + L * .2, yt + H * .55], [h + L * .1, yb - H * .02], [s + L * .5, yb - H * .08], [s + 8, yb + 3], [s - L * .08, yb - H * .3],
      [hx + hl * .32, hy + hh * .5], [hx - hl * .15, hy + hh * .44], [hx - hl * .5, hy + hh * .28]], true);
    const fore = (dx, c) => `<path d="${smooth([[s + dx - lw * .9, yb - H * .55], [s + dx + lw * .8, yb - H * .5], [s + dx + lw * .6, yb + leg * .35], [s + dx + lw * .35, GY - 6], [s + dx + lw * .45, GY], [s + dx - lw * 1.3, GY], [s + dx - lw * .5, GY - 7], [s + dx - lw * .55, yb + leg * .2]], true)}" fill="${c}" stroke="${line}" stroke-width="1.2"/>`;
    const hind = (dx, c) => `<path d="${smooth([[h + dx - lw * 1.4, yb - H * .62], [h + dx + lw * 1.3, yb - H * .5], [h + dx + lw * .9, yb + leg * .15], [h + dx + lw * .55, GY - leg * .42], [h + dx + lw * .45, GY], [h + dx - lw * 1.4, GY], [h + dx - lw * .4, GY - 6], [h + dx - lw * .3, GY - leg * .35], [h + dx - lw * .9, yb + leg * .25]], true)}" fill="${c}" stroke="${line}" stroke-width="1.2"/>`;
    const toes = dx => [0, 1, 2].map(i => `<path d="M ${dx - lw * (1.1 - i * .35)} ${GY - .5} v -3.5" stroke="${line}" stroke-width=".9"/>`).join("");
    const tail = smooth([[h + L * .1, yt + H * .12], [h + L * .1 + tl * .45, yt + H * .1 - bu * 5 + (bu ? 0 : 4)], [h + L * .1 + tl * .9, yt + H * .3 + (bu ? -2 : 10)], [h + L * .1 + tl, yt + H * .42 + (bu ? 0 : 14)],
      [h + L * .1 + tl * .86, yt + H * .44 + th * .45 + (bu ? 2 : 10)], [h + L * .1 + tl * .45, yt + H * .3 + th + bu * 4], [h + L * .16, yt + H * .55]], true);
    let g = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(a.fur, .78)}"/><stop offset=".5" stop-color="${a.fur}"/><stop offset="1" stop-color="${a.belly}"/></linearGradient>
      <linearGradient id="${gid}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a.fur}"/><stop offset="1" stop-color="${shade(a.fur, .7)}"/></linearGradient></defs>`;
    g += hind(14, far) + fore(12, far);
    g += `<path d="${tail}" fill="url(#${gid}t)" stroke="${line}" stroke-width="1.2"/>`;
    // fur texture on the tail
    for (let i = 1; i < 7; i++) { const x = h + L * .1 + tl * i / 7.5; g += `<path d="M ${f(x)} ${f(yt + H * .2 + i * (bu ? 1 : 2.4))} q 5 ${f(th * .25)} 9 ${f(th * .5)}" fill="none" stroke="${shade(a.fur, .55)}" stroke-width=".8" opacity=".55"/>`; }
    g += `<path d="${body}" fill="url(#${gid})" stroke="${line}" stroke-width="1.4"/>`;
    // shoulder and haunch shading, fur strokes along the back
    g += `<ellipse cx="${f(h + 2)}" cy="${f(yb - H * .45)}" rx="${f(lw * 2.2)}" ry="${f(H * .38)}" fill="${shade(a.fur, .82)}" opacity=".45"/>`;
    g += `<ellipse cx="${f(s + 6)}" cy="${f(yb - H * .45)}" rx="${f(lw * 1.6)}" ry="${f(H * .34)}" fill="${shade(a.fur, .85)}" opacity=".35"/>`;
    for (let i = 0; i < 14; i++) { const x = s + 4 + i * (L * .95 / 14), y = yt - a.arch * Math.sin(Math.PI * Math.min(1, (x - s) / (L * .9))) + 4; g += `<path d="M ${f(x)} ${f(y)} q 3 3 7 3" fill="none" stroke="${shade(a.fur, .6)}" stroke-width=".8" opacity=".5"/>`; }
    for (let i = 0; i < 8; i++) { const x = s + 10 + i * (L * .8 / 8); g += `<path d="M ${f(x)} ${f(yb - H * .14)} q 3 2 6 2" fill="none" stroke="${shade(a.belly, 1.12)}" stroke-width=".8" opacity=".6"/>`; }
    if (a.frost) g += `<path d="${smooth([[hx - hl * .3, hy - hh * .4], [hx + hl * .3, hy - hh * .48], [s + L * .32, yt + 2], [s + L * .26, yt + H * .5], [s - 4, yt + H * .5], [hx + hl * .1, hy + hh * .05]], true)}" fill="${a.frost}" opacity=".5" stroke="none"/>`;
    if (a.bib) g += `<path d="${smooth([[hx - hl * .05, hy + hh * .38], [hx + hl * .35, hy + hh * .25], [s + 6, yb - H * .5], [s + 2, yb - 1], [s - L * .07, yb - H * .32]], true)}" fill="${a.bib}" stroke="none"/>`;
    if (a.chin) g += `<ellipse cx="${f(hx - hl * .4)}" cy="${f(hy + hh * .33)}" rx="${f(hl * .13)}" ry="${f(hh * .09)}" fill="${a.chin}" stroke="none"/>`;
    if (a.stripe) {
      g += `<path d="${smooth([[hx - hl * .35, hy - hh * .02], [hx - hl * .05, hy + hh * .02], [hx + hl * .25, hy + hh * .2], [hx + hl * .1, hy + hh * .36], [hx - hl * .2, hy + hh * .24]], true)}" fill="#1f1b18" stroke="none"/>`;
      g += `<path d="M ${f(hx - hl * .52)} ${f(hy - hh * .12)} Q ${f(hx - hl * .1)} ${f(hy - hh * .62)} ${f(s + L * .22)} ${f(yt + 2)}" fill="none" stroke="#f4f1ea" stroke-width="${f(hh * .14)}" stroke-linecap="round"/>`;
      g += `<path d="M ${f(hx + hl * .05)} ${f(hy + hh * .3)} q ${f(hl * .2)} ${f(-hh * .1)} ${f(hl * .35)} ${f(hh * .05)}" fill="none" stroke="#f4f1ea" stroke-width="${f(hh * .1)}" stroke-linecap="round"/>`;
    }
    g += hind(0, legC) + fore(0, legC) + toes(s) + toes(h);
    if (a.claws) g += [s, s + 7].map(x => `<path d="M ${f(x - lw * 1.1)} ${GY - 1} q -8 1 -11 -4" fill="none" stroke="#e9e2d2" stroke-width="1.8" stroke-linecap="round"/>`).join("");
    // ear, eye, nose, mouth, whiskers
    const ex = hx + hl * .22, ey = hy - hh * .42, er = a.ear * .9 + 3;
    g += `<path d="M ${f(ex - er)} ${f(ey + 2)} a ${f(er)} ${f(er * .95)} 0 0 1 ${f(er * 2)} 0 Z" fill="${shade(a.fur, .82)}" stroke="${line}" stroke-width="1.1"/><path d="M ${f(ex - er * .55)} ${f(ey + 1)} a ${f(er * .55)} ${f(er * .5)} 0 0 1 ${f(er * 1.1)} 0 Z" fill="${shade(a.fur, .45)}"/>`;
    const eyx = hx - hl * .2, eyy = hy - hh * .14;
    g += `<path d="M ${f(eyx - 4.2)} ${f(eyy)} q 4.2 -3.6 8.4 0 q -4.2 3.6 -8.4 0 Z" fill="#120d0a"/><circle cx="${f(eyx - 1)}" cy="${f(eyy - 1)}" r="1" fill="#fff"/>`;
    g += `<path d="M ${f(hx - hl * .64)} ${f(hy + hh * .02)} q -1 -4 3 -5 q 4 0 4 4 q -2 4 -7 1 Z" fill="#140f0c"/>`;
    g += `<path d="M ${f(hx - hl * .55)} ${f(hy + hh * .2)} q ${f(hl * .15)} ${f(hh * .08)} ${f(hl * .32)} ${f(hh * .04)}" fill="none" stroke="${line}" stroke-width="1"/>`;
    g += `<g stroke="${a.whisk ? "#efe8da" : "#bdb3a6"}" stroke-width=".7" opacity=".9">${[-3, -1, 1, 3].map(d => `<path d="M ${f(hx - hl * .48)} ${f(hy + hh * .08 + d * .8)} q ${f(-hl * .2)} ${f(d * .6 - 1)} ${f(-hl * (a.whisk ? .5 : .32))} ${f(d * 2.2 - 1)}"/>`).join("")}</g>`;
    const x0 = hx - hl * .95, x1 = h + L * .1 + tl + 10;
    return `<svg viewBox="${f(x0)} ${f(yt - a.arch - 30)} ${f(x1 - x0)} ${f(GY + 6 - (yt - a.arch - 30))}" width="${w}" role="img" aria-label="Drawing of ${sp.name}">${g}</svg>`;
  }

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

  return { side, top, card, animal, habitat, icon, UI, INK, geo, pathway, smooth, f };
})();
