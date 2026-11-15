/* ============================================================
   MAMMAL MYSTERY: original cartoon art.
   Every animal is drawn from simple shapes so the same drawing
   works in the game (color) and on the coloring sheets (line art).
   Each body part sits in <g data-part="..."> so it can be tapped,
   hidden, or zoomed as a clue.

   MM_ART.animal(id, { line, face, hide, cls })  -> SVG string
   MM_ART.teeth(id, { line })                    -> SVG string
   MM_ART.habitat(key, { line })                 -> SVG string
   MM_ART.food(key) / MM_ART.icon(key)           -> SVG string
   MM_ART.box(id, part)                          -> [x, y, w, h] around a part (for clue zooms)
   ============================================================ */
(function () {
  const INK = "#2a2233";
  const SW = 5;

  /* ---------- Animal specs ----------
     plan "sit": sitting, facing you. plan "stand": side-on body, head turned to you.
     L = layout (head center hx,hy radius hr; body center bx,by radii brx,bry). */
  const A = {
    otter:    { plan: "sit", fur: "#8a5a3b", belly: "#d9b48f", muzzle: "#ecd3b2", paw: "#6e4529", ears: "small", tail: "thick", whisk: true, claws: true, webbed: true,
                L: { hx: 200, hy: 150, hr: 66, bx: 200, by: 278, brx: 80, bry: 86 } },
    raccoon:  { plan: "sit", fur: "#8f8a96", belly: "#c9c5cf", muzzle: "#f2f0f4", paw: "#4a4452", ears: "point", earIn: "#f2f0f4", earSize: 0.85, tail: "ringed", tailDark: INK, mask: true, whisk: true, claws: true, head: "fox",
                L: { hx: 200, hy: 150, hr: 60, bx: 200, by: 300, brx: 70, bry: 66 } },
    fox:      { plan: "fox", fur: "#e8742f", belly: "#fff6ea", muzzle: "#fff6ea", paw: "#3a2a2a", earIn: "#fff6ea", tailTip: "#fff6ea",
                L: { hx: 200, hy: 140, hr: 60, bx: 200, by: 300, brx: 70, bry: 70 } },
    lion:     { plan: "sit", legDark: "#c9913a", fur: "#e0a845", belly: "#f2cf87", muzzle: "#f7e2b5", paw: "#e0a845", ears: "round", earIn: "#b87a2a", earSize: 0.7, tail: "tuft", tuft: "#6b3510", mane: "#a8571e", whisk: true,
                L: { hx: 100, hy: 176, hr: 48, bx: 220, by: 248, brx: 100, bry: 50 } },
    polarbear:{ plan: "sit", legDark: "#dcd6c2", fur: "#f4f1e6", belly: "#e8e1cb", muzzle: "#fbfaf4", paw: "#ebe6d6", ears: "small", tail: "stub", claws: true, bigPaws: true,
                L: { hx: 60, hy: 222, hr: 40, bx: 228, by: 245, brx: 110, bry: 55 } },
    panda:    { plan: "sit", fur: "#f7f7f2", belly: "#f7f7f2", muzzle: "#ffffff", paw: INK, leg: INK, ears: "round", earColor: INK, earIn: INK, tail: "stub", patches: true, band: true, claws: false,
                L: { hx: 200, hy: 150, hr: 64, bx: 200, by: 290, brx: 82, bry: 74 } },
    meerkat:  { plan: "sit", fur: "#c9a37a", belly: "#ecd8ba", muzzle: "#ecd8ba", paw: "#8a6a4a", ears: "crescent", earColor: "#4a3a30", tail: "thin", tuft: "#3a2a20", patches: true, patchColor: "#5a4636", pawsUp: true, claws: true, head: "fox",
                L: { hx: 200, hy: 116, hr: 40, bx: 200, by: 260, brx: 36, bry: 100 } },
    rabbit:   { plan: "sit", fur: "#b88d6a", belly: "#efe0cf", muzzle: "#f3e7da", paw: "#efe0cf", ears: "long", earIn: "#f3b7b7", tail: "puff", tailColor: "#ffffff", whisk: true, buckTeeth: true,
                L: { hx: 128, hy: 196, hr: 42, bx: 220, by: 300, brx: 80, bry: 60 } },
    kangaroo: { plan: "roo", fur: "#c27a4a", belly: "#ecc7a2", muzzle: "#ecc7a2", paw: "#8a5230", earIn: "#ecc7a2", legDark: "#9a5c34",
                L: { hx: 160, hy: 108, hr: 40, bx: 228, by: 280, brx: 60, bry: 80 } },
    elephant: { plan: "stand", legDark: "#878d9a", fur: "#9aa1ae", belly: "#9aa1ae", ears: "elephant", earIn: "#d9a8b5", trunk: true, tusks: true, feet: "feet", tail: "tuft", tuft: INK, nose: "none", mouth: false,
                L: { hx: 96, hy: 160, hr: 50, bx: 230, by: 220, brx: 110, bry: 70, legW: 40, legDark: "#878d9a" } },
    giraffe:  { plan: "stand", legDark: "#e2ab4a", fur: "#f2c062", belly: "#f6d48c", muzzle: "#f6d48c", ears: "leaf", earIn: "#f6d48c", horns: true, neck: "giraffe", spots: "#b86a2b", feet: "hooves", tail: "tuft", tuft: "#4a2a10", nose: "dots", maneColor: "#b86a2b",
                L: { hx: 100, hy: 72, hr: 32, bx: 250, by: 200, brx: 60, bry: 40, legW: 20, legDark: "#e2ab4a" } },
    camel:    { plan: "stand", legDark: "#c0935a", fur: "#d4a66a", belly: "#e5c290", muzzle: "#e5c290", ears: "small", hump: true, neck: "camel", feet: "pads", tail: "tuft", tuft: "#7a5530", nose: "dots",
                L: { hx: 80, hy: 116, hr: 36, bx: 236, by: 222, brx: 90, bry: 40, legW: 24, legDark: "#c0935a" } },
  };

  /* ---------- small helpers ---------- */
  const r1 = n => Math.round(n * 10) / 10;
  const at = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => `${k}="${v}"`).join(" ");
  function painter(line) {
    // In line-art mode every fill is white except pupils, so children can color it.
    const f = (c, keep) => line && !keep ? "#ffffff" : c; f.line = line; return f;
  }
  const ell = (cx, cy, rx, ry, fill, x = {}) => `<ellipse ${at({ cx: r1(cx), cy: r1(cy), rx: r1(rx), ry: r1(ry), fill, stroke: INK, "stroke-width": SW, ...x })}/>`;
  const circ = (cx, cy, r, fill, x = {}) => `<circle ${at({ cx: r1(cx), cy: r1(cy), r: r1(r), fill, stroke: INK, "stroke-width": SW, ...x })}/>`;
  const path = (d, fill, x = {}) => `<path ${at({ d, fill, stroke: INK, "stroke-width": SW, "stroke-linejoin": "round", "stroke-linecap": "round", ...x })}/>`;
  const hit = (inner) => `<g class="mm-hit">${inner}</g>`;   // invisible, larger tap areas
  const hitEll = (cx, cy, rx, ry) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="transparent" stroke="none"/>`;

  /* ---------- face (shared by both body plans) ---------- */
  function face(a, P, L) {
    const { hx, hy, hr } = L; const out = [];
    const isStand = a.plan === "stand";
    // markings under the eyes
    if (a.mask) out.push({ p: "fur", head: 1, s: path(`M ${hx - hr * 0.95} ${hy - hr * 0.05} Q ${hx - hr * 0.6} ${hy - hr * 0.42} ${hx} ${hy - hr * 0.14} Q ${hx + hr * 0.6} ${hy - hr * 0.42} ${hx + hr * 0.95} ${hy - hr * 0.05} Q ${hx + hr * 0.62} ${hy + hr * 0.28} ${hx + hr * 0.2} ${hy + hr * 0.12} Q ${hx} ${hy + hr * 0.08} ${hx - hr * 0.2} ${hy + hr * 0.12} Q ${hx - hr * 0.62} ${hy + hr * 0.28} ${hx - hr * 0.95} ${hy - hr * 0.05} Z`, P(INK)) });
    if (a.patches) {
      const pc = a.patchColor || INK;
      out.push({ p: "fur", head: 1, s: ell(hx - hr * 0.36, hy - hr * 0.02, hr * 0.24, hr * 0.32, P(pc), { transform: `rotate(28 ${r1(hx - hr * 0.36)} ${r1(hy - hr * 0.02)})` }) + ell(hx + hr * 0.36, hy - hr * 0.02, hr * 0.24, hr * 0.32, P(pc), { transform: `rotate(-28 ${r1(hx + hr * 0.36)} ${r1(hy - hr * 0.02)})` }) });
    }
    // muzzle
    const my = isStand ? hy + hr * 0.6 : hy + hr * 0.42, mrx = isStand ? hr * 0.62 : hr * 0.44, mry = isStand ? hr * 0.42 : hr * 0.32;
    if (a.muzzle && !a.trunk) out.push({ p: "fur", head: 1, s: ell(hx, my, mrx, mry, P(a.muzzle)) });
    // eyes
    const er = hr * (isStand ? 0.15 : 0.135), ey = hy - hr * (isStand ? 0.05 : 0.06), ex = hr * (isStand ? 0.42 : 0.36);
    let eyes = "";
    [-1, 1].forEach(sg => {
      const x = hx + sg * ex;
      eyes += `<ellipse cx="${r1(x)}" cy="${r1(ey)}" rx="${r1(er)}" ry="${r1(er * 1.18)}" fill="${INK}"/>` + `<circle cx="${r1(x + er * 0.35)}" cy="${r1(ey - er * 0.42)}" r="${r1(er * 0.38)}" fill="#fff"/>`;
      if (a.lashes) eyes += `<path d="M ${r1(x - er)} ${r1(ey - er * 1.1)} l -6 -6 M ${r1(x)} ${r1(ey - er * 1.25)} l 0 -8 M ${r1(x + er)} ${r1(ey - er * 1.1)} l 6 -6" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    });
    out.push({ p: "eyes", head: 1, s: eyes + hit(hitEll(hx - ex, ey, er * 2.1, er * 2.1) + hitEll(hx + ex, ey, er * 2.1, er * 2.1)) });
    // nose
    if (!a.trunk) {
      let ns, ny;
      if (a.nose === "dots") {
        ny = my - mry * 0.2;
        ns = `<ellipse cx="${r1(hx - mrx * 0.38)}" cy="${r1(ny)}" rx="5" ry="7" fill="${INK}"/><ellipse cx="${r1(hx + mrx * 0.38)}" cy="${r1(ny)}" rx="5" ry="7" fill="${INK}"/>`;
      } else {
        const w = hr * 0.3, h = hr * 0.2; ny = my - mry * 0.55;
        ns = path(`M ${hx - w / 2} ${ny - h / 2} Q ${hx} ${ny - h * 0.8} ${hx + w / 2} ${ny - h / 2} Q ${hx + w * 0.3} ${ny + h * 0.5} ${hx} ${ny + h * 0.55} Q ${hx - w * 0.3} ${ny + h * 0.5} ${hx - w / 2} ${ny - h / 2} Z`, P(a.noseColor || INK, !a.noseColor), { "stroke-width": 3 });
      }
      out.push({ p: "nose", head: 1, s: ns + hit(hitEll(hx, ny, hr * 0.32, hr * 0.2)), ny });
      // mouth
      if (a.mouth !== false) {
        const top = a.nose === "dots" ? my + mry * 0.25 : ny + hr * 0.12, w = isStand ? mrx * 0.45 : hr * 0.2;
        let ms = a.nose === "dots"
          ? `<path d="M ${r1(hx - w)} ${r1(top)} Q ${hx} ${r1(top + 12)} ${r1(hx + w)} ${r1(top)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
          : `<path d="M ${hx} ${r1(top - 4)} L ${hx} ${r1(top + 6)} M ${r1(hx - w)} ${r1(top + 10)} Q ${r1(hx - w / 2)} ${r1(top + 18)} ${hx} ${r1(top + 6)} Q ${r1(hx + w / 2)} ${r1(top + 18)} ${r1(hx + w)} ${r1(top + 10)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (a.buckTeeth) ms += `<rect x="${r1(hx - 10)}" y="${r1(top + 9)}" width="20" height="16" rx="3" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M ${hx} ${r1(top + 9)} V ${r1(top + 25)}" stroke="${INK}" stroke-width="2.5"/>`;
        out.push({ p: "mouth", head: 1, s: ms + hit(hitEll(hx, top + 10, hr * 0.3, hr * 0.16)) });
      }
    }
    // whiskers
    if (a.whisk) {
      let ws = "";
      [-1, 1].forEach(sg => [-9, 3, 15].forEach((dy, i) => {
        const x0 = hx + sg * mrx * 0.72, y0 = my + dy * 0.6, x1 = hx + sg * (mrx + hr * 0.62), y1 = my + dy * 1.5 - 6 + i * 2;
        ws += `<path d="M ${r1(x0)} ${r1(y0)} Q ${r1((x0 + x1) / 2)} ${r1(y0 - 4)} ${r1(x1)} ${r1(y1)}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
      }));
      out.push({ p: "whiskers", head: 1, s: ws + hit(hitEll(hx - mrx - hr * 0.25, my + 2, hr * 0.32, hr * 0.24) + hitEll(hx + mrx + hr * 0.25, my + 2, hr * 0.32, hr * 0.24)) });
    }
    return out;
  }

  /* ---------- ears ---------- */
  function ears(a, P, L) {
    const { hx, hy, hr } = L; const k = a.earSize || 1;
    const col = P(a.earColor || a.fur), inn = P(a.earIn || a.belly);
    const one = (sg) => {
      switch (a.ears) {
        case "small": return circ(hx + sg * hr * 0.72, hy - hr * 0.62, hr * 0.2, col) + circ(hx + sg * hr * 0.72, hy - hr * 0.62, hr * 0.09, P(a.earIn || a.paw || INK), { "stroke-width": 0 });
        case "round": return circ(hx + sg * hr * 0.7, hy - hr * 0.7, hr * 0.32 * k * 1.3, col) + circ(hx + sg * hr * 0.7, hy - hr * 0.7, hr * 0.16 * k * 1.3, inn, { "stroke-width": 0 });
        case "crescent": return ell(hx + sg * hr * 0.92, hy - hr * 0.2, hr * 0.18, hr * 0.24, col);
        case "point": {
          const bx1 = hx + sg * hr * 0.25, bx2 = hx + sg * hr * 0.92, by = hy - hr * 0.45, tx = hx + sg * hr * (0.78 + 0.1 * k), ty = hy - hr * (0.95 + 0.4 * k);
          return path(`M ${bx1} ${by} Q ${(bx1 + tx) / 2 - sg * 4} ${(by + ty) / 2} ${tx} ${ty} Q ${(bx2 + tx) / 2 + sg * 6} ${(by + ty) / 2} ${bx2} ${by + hr * 0.12} Z`, col) +
                 path(`M ${bx1 + sg * hr * 0.12} ${by - 2} Q ${(bx1 + tx) / 2} ${(by + ty) / 2 + 6} ${tx - sg * 2} ${ty + hr * 0.18} Q ${(bx2 + tx) / 2} ${(by + ty) / 2 + 8} ${bx2 - sg * hr * 0.1} ${by + hr * 0.05} Z`, inn, { "stroke-width": 0 });
        }
        case "long": case "tall": {
          const tall = a.ears === "long" ? 1.25 : 0.95, w = a.ears === "long" ? 0.26 : 0.22;
          const cx = hx + sg * hr * 0.42, cy = hy - hr * (0.75 + tall * 0.55), rot = sg * (a.ears === "long" ? 10 : 18);
          return `<g transform="rotate(${rot} ${r1(cx)} ${r1(hy - hr * 0.6)})">` + ell(cx, cy, hr * w, hr * tall * 0.7, col) + ell(cx, cy + hr * 0.08, hr * w * 0.5, hr * tall * 0.52, inn, { "stroke-width": 0 }) + `</g>`;
        }
        case "elephant": return ell(hx + sg * hr * 1.05, hy + hr * 0.05, hr * 0.78, hr * 1.0, col) + ell(hx + sg * hr * 1.08, hy + hr * 0.05, hr * 0.52, hr * 0.74, inn, { "stroke-width": 0 });
        case "leaf": return `<g transform="rotate(${sg * -20} ${r1(hx + sg * hr * 0.95)} ${r1(hy - hr * 0.55)})">` + ell(hx + sg * hr * 1.15, hy - hr * 0.55, hr * 0.42, hr * 0.17, col) + `</g>`;
      }
      return "";
    };
    const box = a.ears === "elephant" ? [hr * 1.05, hr * 0.05, hr * 0.8, hr * 1.0] : [hr * 0.75, -hr * 0.85, hr * 0.42, hr * 0.5];
    return one(-1) + one(1) + hit(hitEll(hx - box[0], hy + box[1], box[2], box[3]) + hitEll(hx + box[0], hy + box[1], box[2], box[3]));
  }

  function headShape(a, P, L) {
    const { hx, hy, hr } = L;
    if (a.head === "fox") return path(`M ${hx - hr} ${hy - hr * 0.35} Q ${hx - hr * 1.12} ${hy + hr * 0.42} ${hx} ${hy + hr * 0.82} Q ${hx + hr * 1.12} ${hy + hr * 0.42} ${hx + hr} ${hy - hr * 0.35} Q ${hx + hr * 0.7} ${hy - hr * 0.95} ${hx} ${hy - hr * 0.92} Q ${hx - hr * 0.7} ${hy - hr * 0.95} ${hx - hr} ${hy - hr * 0.35} Z`, P(a.fur));
    if (a.plan === "stand" && !a.trunk) return ell(hx, hy + hr * 0.12, hr * 0.82, hr * 1.02, P(a.fur));
    return ell(hx, hy, hr, hr * 0.9, P(a.fur));
  }

  /* ---------- tails ---------- */
  function tail(a, P, L) {
    const { bx, by, brx, bry } = L;
    if (a.plan === "stand") {
      const x0 = bx + brx * 0.93, y0 = by - bry * 0.35, x1 = x0 + 22, y1 = by + bry * 0.75;
      return `<path d="M ${r1(x0)} ${r1(y0)} Q ${r1(x0 + 26)} ${r1((y0 + y1) / 2)} ${r1(x1)} ${r1(y1)}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>` +
             `<path d="M ${r1(x0)} ${r1(y0)} Q ${r1(x0 + 26)} ${r1((y0 + y1) / 2)} ${r1(x1)} ${r1(y1)}" fill="none" stroke="${P(a.fur)}" stroke-width="5" stroke-linecap="round"/>` +
             path(`M ${x1 - 9} ${y1 - 4} Q ${x1} ${y1 + 34} ${x1 + 9} ${y1 - 4} Z`, P(a.tuft)) + hit(hitEll(x0 + 18, (y0 + y1) / 2 + 10, 26, (y1 - y0) / 2 + 22));
    }
    const TX = bx + brx * 0.66, TY = by + bry * 0.52;
    switch (a.tail) {
      case "bushy": {
        const d = `M ${TX - 12} ${TY + 14} C ${TX + 70} ${TY + 34} ${TX + 132} ${TY - 18} ${TX + 112} ${TY - 112} C ${TX + 104} ${TY - 152} ${TX + 62} ${TY - 150} ${TX + 66} ${TY - 104} C ${TX + 72} ${TY - 50} ${TX + 34} ${TY - 26} ${TX - 12} ${TY - 30} Z`;
        const tip = `M ${TX + 113} ${TY - 100} C ${TX + 110} ${TY - 150} ${TX + 62} ${TY - 152} ${TX + 66} ${TY - 104} Q ${TX + 90} ${TY - 116} ${TX + 113} ${TY - 100} Z`;
        return path(d, P(a.fur)) + path(tip, P(a.tailTip)) + hit(hitEll(TX + 70, TY - 50, 62, 95));
      }
      case "ringed": {
        const d = `M ${TX - 10} ${TY} C ${TX + 60} ${TY + 10} ${TX + 100} ${TY - 40} ${TX + 92} ${TY - 118}`;
        return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="50" stroke-linecap="round"/>` +
               `<path d="${d}" fill="none" stroke="${P(a.fur)}" stroke-width="40" stroke-linecap="round"/>` +
               `<path d="${d}" fill="none" stroke="${P(a.tailDark)}" stroke-width="40" stroke-dasharray="16 18" stroke-dashoffset="-20"/>` + hit(hitEll(TX + 60, TY - 50, 56, 90));
      }
      case "thick": case "roo": case "thin": {
        const k = a.tail === "roo" ? 1.45 : a.tail === "thin" ? 0.95 : 1, th = a.tail === "thin" ? 0.45 : 1;
        const d = `M ${TX - 20} ${TY - 26 * th} C ${TX + 40 * k} ${TY - 22 * th} ${TX + 92 * k} ${TY + 6} ${TX + 138 * k} ${TY + 36} Q ${TX + 146 * k} ${TY + 44} ${TX + 134 * k} ${TY + 46} C ${TX + 84 * k} ${TY + 44} ${TX + 30 * k} ${TY + 28 * th} ${TX - 20} ${TY + 26 * th} Z`;
        let s = path(d, P(a.fur));
        if (a.tuft) s += path(`M ${TX + 110 * k} ${TY + 24} Q ${TX + 146 * k} ${TY + 40} ${TX + 134 * k} ${TY + 46} Q ${TX + 120 * k} ${TY + 46} ${TX + 106 * k} ${TY + 40} Z`, P(a.tuft));
        return s + hit(hitEll(TX + 62 * k, TY + 14, 74 * k, 40));
      }
      case "tuft": {
        const d = `M ${TX - 10} ${TY + 10} C ${TX + 60} ${TY + 46} ${TX + 112} ${TY + 4} ${TX + 104} ${TY - 64}`;
        return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${P(a.fur)}" stroke-width="8" stroke-linecap="round"/>` +
               path(`M ${TX + 104} ${TY - 56} C ${TX + 84} ${TY - 70} ${TX + 92} ${TY - 100} ${TX + 106} ${TY - 104} C ${TX + 122} ${TY - 98} ${TX + 124} ${TY - 70} ${TX + 104} ${TY - 56} Z`, P(a.tuft)) + hit(hitEll(TX + 60, TY - 30, 60, 70));
      }
      case "stub": return circ(bx + brx * 0.9, by + bry * 0.6, 20, P(a.tailColor || a.fur)) + hit(hitEll(bx + brx * 0.9, by + bry * 0.6, 34, 34));
      case "puff": {
        let s = ""; const cx = bx + brx * 0.94, cy = by + bry * 0.55;
        s += path(`M ${cx - 24} ${cy} Q ${cx - 30} ${cy - 26} ${cx - 6} ${cy - 26} Q ${cx + 4} ${cy - 42} ${cx + 22} ${cy - 24} Q ${cx + 40} ${cy - 12} ${cx + 26} ${cy + 8} Q ${cx + 22} ${cy + 28} ${cx} ${cy + 24} Q ${cx - 26} ${cy + 26} ${cx - 24} ${cy} Z`, P(a.tailColor));
        return s + hit(hitEll(cx, cy, 40, 40));
      }
    }
    return "";
  }

  /* ---------- sitting body plan ---------- */
  function sit(a, P) {
    const L = a.L; const { hx, hy, hr, bx, by, brx, bry } = L; const lay = [];
    lay.push({ p: "tail", s: tail(a, P, L) });
    // hind feet
    const fw = a.bigFeet ? 58 : a.bigPaws ? 38 : 32, fy = by + bry * 0.88;
    lay.push({ p: "paws", s: ell(bx - brx * 0.72, fy, fw, 18, P(a.paw)) + ell(bx + brx * 0.72, fy, fw, 18, P(a.paw)) + (a.bigFeet ? "" : "") });
    // body
    if (a.neckUp) {
      const t = by - bry * 0.8, nb = brx * 0.36, nt = hr * 0.42, ny = hy + hr * 0.55;
      lay.push({ p: "fur", s: path(`M ${bx - nb} ${t} C ${bx - nb * 0.7} ${(t + ny) / 2} ${hx - nt} ${ny + 14} ${hx - nt} ${ny} L ${hx + nt} ${ny} C ${hx + nt} ${ny + 14} ${bx + nb * 0.7} ${(t + ny) / 2} ${bx + nb} ${t} Z`, P(a.fur)) +
        path(`M ${bx - nb * 0.45} ${t + 4} Q ${hx} ${(t + ny) / 2} ${hx - nt * 0.4} ${ny} L ${hx + nt * 0.4} ${ny} Q ${hx} ${(t + ny) / 2} ${bx + nb * 0.45} ${t + 4} Z`, P(a.belly), { "stroke-width": 0 }) });
    }
    lay.push({ p: "fur", s: ell(bx, by, brx, bry, P(a.fur)) });
    if (a.band) lay.push({ p: "fur", s: path(`M ${bx - brx * 0.98} ${by - bry * 0.18} Q ${bx} ${by - bry * 0.62} ${bx + brx * 0.98} ${by - bry * 0.18} Q ${bx + brx * 0.9} ${by - bry * 0.62} ${bx + brx * 0.55} ${by - bry * 0.85} Q ${bx} ${by - bry * 1.0} ${bx - brx * 0.55} ${by - bry * 0.85} Q ${bx - brx * 0.9} ${by - bry * 0.62} ${bx - brx * 0.98} ${by - bry * 0.18} Z`, P(INK)) });
    if (a.belly !== a.fur) lay.push({ p: "fur", s: ell(bx, by + bry * 0.12, brx * 0.48, bry * 0.66, P(a.belly)) });
    if (a.pouch) lay.push({ p: "pouch", s:
      circ(bx, by + bry * 0.22, 17, P(a.fur)) + ell(bx - 12, by + bry * 0.22 - 20, 6, 12, P(a.fur)) + ell(bx + 12, by + bry * 0.22 - 20, 6, 12, P(a.fur)) +
      `<circle cx="${r1(bx - 6)}" cy="${r1(by + bry * 0.2)}" r="3" fill="${INK}"/><circle cx="${r1(bx + 6)}" cy="${r1(by + bry * 0.2)}" r="3" fill="${INK}"/>` +
      path(`M ${bx - brx * 0.42} ${by + bry * 0.28} Q ${bx} ${by + bry * 0.4} ${bx + brx * 0.42} ${by + bry * 0.28} Q ${bx + brx * 0.4} ${by + bry * 0.72} ${bx} ${by + bry * 0.74} Q ${bx - brx * 0.4} ${by + bry * 0.72} ${bx - brx * 0.42} ${by + bry * 0.28} Z`, P(a.belly)) +
      hit(hitEll(bx, by + bry * 0.45, brx * 0.48, bry * 0.36)) });
    // front legs + paws
    const px = brx * (a.pawsUp ? 0.3 : 0.36), py = a.pawsUp ? by - bry * 0.12 : by + bry * 0.92;
    {
      let arms = "";
      const up = !!a.pawsUp, aw = up ? 30 : 38;
      [-1, 1].forEach(sg => {
        const x0 = bx + sg * brx * (up ? 0.72 : 0.6), y0 = by - bry * (up ? 0.52 : 0.5), x1 = bx + sg * px, y1 = up ? py : py - 8;
        const cx = up ? x0 + sg * 6 : bx + sg * brx * 0.62, cy = up ? py + 6 : by + bry * 0.35;
        const d = `M ${r1(x0)} ${r1(y0)} Q ${r1(cx)} ${r1(cy)} ${r1(x1)} ${r1(y1)}`;
        arms += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${aw}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${P(a.leg || a.fur)}" stroke-width="${aw - 10}" stroke-linecap="round"/>`;
      });
      lay.push({ p: "fur", s: arms });
    }
    const pw = a.bigPaws ? 34 : a.pawsUp ? 16 : 27, ph = a.bigPaws ? 20 : a.pawsUp ? 13 : 17;
    let paws = ell(bx - px, py, pw, ph, P(a.paw)) + ell(bx + px, py, pw, ph, P(a.paw));
    if (a.webbed) [-1, 1].forEach(sg => { paws += `<path d="M ${r1(bx + sg * px - 9)} ${r1(py - 6)} V ${r1(py + 8)} M ${r1(bx + sg * px + 9)} ${r1(py - 6)} V ${r1(py + 8)}" stroke="${INK}" stroke-width="2.5"/>`; });
    lay.push({ p: "paws", s: paws + hit(hitEll(bx - px, py, pw + 14, ph + 16) + hitEll(bx + px, py, pw + 14, ph + 16) + hitEll(bx - brx * 0.72, fy, fw + 8, 26) + hitEll(bx + brx * 0.72, fy, fw + 8, 26)) });
    if (a.claws) {
      let cl = "";
      [-1, 1].forEach(sg => [-1, 0, 1].forEach(i => {
        const x = bx + sg * px + i * pw * 0.42, y = py + ph * (a.pawsUp ? 0.6 : 0.7);
        cl += `<path d="M ${r1(x)} ${r1(y)} q ${r1(i * 1.5)} 7 ${r1(i * 1.5)} 11" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
      }));
      lay.push({ p: "claws", s: cl + hit(hitEll(bx - px, py + ph, pw + 6, 14) + hitEll(bx + px, py + ph, pw + 6, 14)) });
    }
    // head
    if (a.mane) {
      let d = ""; const R = hr * 1.5, n = 16;
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2, tm = ((i - 0.5) / n) * Math.PI * 2;
        const x = hx + Math.cos(t) * R, y = hy + 6 + Math.sin(t) * R * 0.95, cx = hx + Math.cos(tm) * R * 1.18, cy = hy + 6 + Math.sin(tm) * R * 1.12;
        d += i === 0 ? `M ${r1(x)} ${r1(y)} ` : `Q ${r1(cx)} ${r1(cy)} ${r1(x)} ${r1(y)} `;
      }
      lay.push({ p: "mane", head: 1, s: path(d + "Z", P(a.mane)) });
    }
    lay.push({ p: "ears", head: 1, s: ears(a, P, L) });
    lay.push({ p: "fur", head: 1, s: headShape(a, P, L) });
    return lay.concat(face(a, P, L));
  }

  /* ---------- standing body plan ---------- */
  function stand(a, P) {
    const L = a.L; const { hx, hy, hr, bx, by, brx, bry, legW } = L; const lay = []; const G = 372;
    lay.push({ p: "tail", s: tail(a, P, L) });
    const legX = [bx - brx * 0.62, bx - brx * 0.3, bx + brx * 0.42, bx + brx * 0.72];
    const footH = a.feet === "hooves" ? 16 : 14;
    const leg = (x, far) => {
      const col = P(far ? L.legDark : a.fur);
      return path(`M ${x - legW / 2} ${by + bry * 0.3} L ${x - legW / 2} ${G - footH} L ${x + legW / 2} ${G - footH} L ${x + legW / 2} ${by + bry * 0.3} Z`, col);
    };
    let feetS = "";
    const foot = (x, far) => {
      if (a.feet === "hooves") return path(`M ${x - legW / 2 - 2} ${G - footH} L ${x + legW / 2 + 2} ${G - footH} L ${x + legW / 2 + 3} ${G} L ${x - legW / 2 - 3} ${G} Z`, P(far ? "#3a2a20" : "#4a3628")) + `<path d="M ${r1(x)} ${G - footH} V ${G}" stroke="${INK}" stroke-width="3"/>`;
      if (a.feet === "pads") return ell(x, G - 6, legW / 2 + 9, 9, P(far ? L.legDark : a.belly));
      return ell(x, G - 8, legW / 2 + 4, 11, P(far ? L.legDark : a.fur)) + [-1, 0, 1].map(i => `<path d="M ${r1(x + i * legW * 0.28)} ${G - 10} v 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("");
    };
    // far legs first
    lay.push({ p: "fur", s: leg(legX[1] + 14, 1) + leg(legX[3] + 12, 1) });
    feetS += foot(legX[1] + 14, 1) + foot(legX[3] + 12, 1);
    if (a.hump) lay.push({ p: "hump", s: path(`M ${bx - brx * 0.55} ${by - bry * 0.55} Q ${bx - brx * 0.25} ${by - bry * 1.85} ${bx + brx * 0.05} ${by - bry * 1.7} Q ${bx + brx * 0.4} ${by - bry * 1.55} ${bx + brx * 0.55} ${by - bry * 0.6} Z`, P(a.fur)) + hit(hitEll(bx - brx * 0.05, by - bry * 1.25, brx * 0.55, bry * 0.6)) });
    lay.push({ p: "fur", s: ell(bx, by, brx, bry, P(a.fur)) });
    if (a.spots) {
      const sp = [[-0.55, -0.15, 16], [-0.2, -0.45, 14], [0.15, -0.1, 18], [0.5, -0.4, 13], [0.55, 0.2, 14], [-0.3, 0.3, 13], [0.15, 0.48, 10], [-0.75, 0.25, 9]];
      lay.push({ p: "fur", s: sp.map(([dx, dy, r]) => path(blob(bx + dx * brx, by + dy * bry, r), P(a.spots), { "stroke-width": P.line ? 3 : 0 })).join("") });
    }
    lay.push({ p: "fur", s: leg(legX[0], 0) + leg(legX[2], 0) });
    feetS += foot(legX[0], 0) + foot(legX[2], 0);
    const fp = a.feet === "hooves" ? "hooves" : "paws";
    lay.push({ p: fp, s: feetS + hit(legX.map(x => hitEll(x + 6, G - 10, legW / 2 + 16, 22)).join("")) });
    // neck
    if (a.neck) {
      let d;
      if (a.neck === "giraffe") d = `M ${bx - brx * 0.92} ${by - bry * 0.05} L ${hx - hr * 0.35} ${hy + hr * 0.5} L ${hx + hr * 0.5} ${hy + hr * 0.25} L ${bx - brx * 0.5} ${by - bry * 0.82} Z`;
      else d = `M ${bx - brx * 0.9} ${by + bry * 0.2} Q ${hx - 6} ${by + bry * 0.4} ${hx - hr * 0.4} ${hy + hr * 0.7} L ${hx + hr * 0.55} ${hy + hr * 0.5} Q ${hx + 34} ${by - bry * 0.3} ${bx - brx * 0.55} ${by - bry * 0.75} Z`;
      let ns = path(d, P(a.fur));
      if (a.maneColor) ns += `<path d="M ${r1(bx - brx * 0.52)} ${r1(by - bry * 0.84)} L ${r1(hx + hr * 0.5)} ${r1(hy + hr * 0.2)}" stroke="${P(a.maneColor)}" stroke-width="9" stroke-linecap="round"/>`;
      if (a.spots) {
        const t = [0.2, 0.45, 0.7];
        t.forEach((f, i) => { const x = (bx - brx * 0.7) * (1 - f) + (hx + 4) * f, y = (by - bry * 0.42) * (1 - f) + (hy + hr * 0.4) * f; ns += path(blob(x + (i % 2 ? 6 : -4), y, 10 - i), P(a.spots), { "stroke-width": P.line ? 3 : 0 }); });
      }
      lay.push({ p: "neck", s: ns });
    }
    // head
    if (a.horns) {
      let h = "";
      [-1, 1].forEach(sg => { const x = hx + sg * hr * 0.32; h += `<path d="M ${r1(x)} ${r1(hy - hr * 0.6)} L ${r1(x + sg * 4)} ${r1(hy - hr * 1.35)}" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M ${r1(x)} ${r1(hy - hr * 0.6)} L ${r1(x + sg * 4)} ${r1(hy - hr * 1.35)}" stroke="${P(a.fur)}" stroke-width="5" stroke-linecap="round"/>` + circ(x + sg * 4, hy - hr * 1.4, 8, P("#4a2a10")); });
      lay.push({ p: "horns", head: 1, s: h + hit(hitEll(hx, hy - hr * 1.15, hr * 0.7, hr * 0.42)) });
    }
    lay.push({ p: "ears", head: 1, s: ears(a, P, L) });
    lay.push({ p: "fur", head: 1, s: headShape(a, P, L) });
    if (a.trunk) {
      const d = `M ${hx - 20} ${hy + 22} C ${hx - 24} ${hy + 100} ${hx - 14} ${hy + 152} ${hx + 22} ${hy + 160} Q ${hx + 42} ${hy + 160} ${hx + 36} ${hy + 140} C ${hx + 10} ${hy + 138} ${hx + 16} ${hy + 92} ${hx + 20} ${hy + 22} Z`;
      let t = path(d, P(a.fur));
      [0.35, 0.5, 0.65, 0.8].forEach(f => { const y = hy + 22 + f * 115; t += `<path d="M ${r1(hx - 18 + f * 4)} ${r1(y)} q 16 4 ${r1(32 - f * 12)} 0" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`; });
      if (a.tusks) lay.push({ p: "tusks", head: 1, s: [-1, 1].map(sg => path(`M ${hx + sg * 22} ${hy + 50} Q ${hx + sg * 30} ${hy + 92} ${hx + sg * 60} ${hy + 98} Q ${hx + sg * 40} ${hy + 80} ${hx + sg * 34} ${hy + 46} Z`, P("#fffaf0"))).join("") + hit(hitEll(hx - 44, hy + 76, 26, 30) + hitEll(hx + 44, hy + 76, 26, 30)) });
      lay.push({ p: "trunk", head: 1, s: t + hit(hitEll(hx + 6, hy + 100, 36, 70)) });
    }
    return lay.concat(face(a, P, L));
  }

  function blob(cx, cy, r) {
    const pts = [[1, 0], [0.55, 0.85], [-0.5, 0.9], [-1, 0.05], [-0.55, -0.85], [0.5, -0.9]];
    return "M " + pts.map(([x, y], i) => `${r1(cx + x * r * (i % 2 ? 1.1 : 0.95))} ${r1(cy + y * r * 0.85)}`).join(" L ") + " Z";
  }

  /* ---------- red fox: drawn by hand so it reads as a fox, not a cat or bear ----------
     Slim sitting body, long narrow snout, white bib and cheeks, black "socks",
     big black-tipped ears, and a long bushy tail with a white tip. */
  const MIRROR = 'transform="matrix(-1 0 0 1 400 0)"';
  const both = s => s + `<g ${MIRROR}>${s}</g>`;   // draw the left side, then mirror it for the right
  function foxArt(a, P) {
    const lay = [];
    // tail: a long plume lying beside the fox and curling up, white tip
    lay.push({ p: "tail", s:
      path("M 250 352 C 300 360 352 362 374 334 C 394 308 384 270 358 262 C 336 256 322 276 334 296 C 344 314 320 330 286 330 C 272 330 262 332 252 334 Z", P(a.fur)) +
      path("M 358 262 C 336 256 322 276 334 296 C 346 296 362 300 382 306 C 386 286 378 268 358 262 Z", P(a.tailTip)) +
      hit(hitEll(330, 316, 62, 46)) });
    // back feet peeking out beside the haunches
    const hind = ell(138, 364, 22, 9, P(a.paw));
    // body: narrow chest, wide haunches
    lay.push({ p: "fur", s:
      path("M 166 196 Q 150 232 150 268 Q 126 298 124 336 Q 126 368 162 370 L 238 370 Q 274 368 276 336 Q 274 298 250 268 Q 250 232 234 196 Z", P(a.fur)) +
      both(path("M 128 334 Q 130 296 162 296 Q 182 318 176 352 Q 168 370 146 368 Q 128 360 128 334 Z", P(a.fur))) +
      path("M 172 200 Q 174 244 200 300 Q 226 244 228 200 Z", P(a.belly)) });
    // front legs: orange at the top, black socks below
    // Open path: no outline across the top, so the legs flow out of the chest.
    lay.push({ p: "fur", s: both(path("M 172 262 Q 170 296 177 320 L 196 320 Q 199 294 197 262", P(a.fur))) });
    lay.push({ p: "paws", s: both(path("M 177 318 Q 179 340 177 356 Q 186 368 198 358 Q 196 340 196 318 Z", P(a.paw)) + hind) +
      hit(hitEll(186, 340, 20, 30) + hitEll(214, 340, 20, 30) + hitEll(138, 362, 26, 16) + hitEll(262, 362, 26, 16)) });
    // ears: big triangles, black tips, pale inside
    const ear = path("M 150 110 Q 128 72 128 34 Q 164 50 186 98 Z", P(a.fur)) + path("M 155 104 Q 140 78 139 54 Q 160 68 176 98 Z", P(a.earIn), { "stroke-width": 3 }) + path("M 128 34 Q 131 50 135 58 Q 146 50 156 48 Q 143 38 128 34 Z", P(a.paw), { "stroke-width": 3 });
    lay.push({ p: "ears", head: 1, s: both(ear) + hit(hitEll(150, 70, 28, 40) + hitEll(250, 70, 28, 40)) });
    // head: wide fluffy cheeks narrowing to a long snout
    lay.push({ p: "fur", head: 1, s:
      path("M 200 92 Q 160 90 146 108 Q 134 128 122 160 L 142 164 L 134 177 Q 160 186 178 200 Q 190 214 200 217 Q 210 214 222 200 Q 240 186 266 177 L 258 164 L 278 160 Q 266 128 254 108 Q 240 90 200 92 Z", P(a.fur)) +
      path("M 122 160 L 142 164 L 134 177 Q 160 186 178 200 Q 190 214 200 217 Q 210 214 222 200 Q 240 186 266 177 L 258 164 L 278 160 Q 252 172 232 160 Q 214 150 200 168 Q 186 150 168 160 Q 148 172 122 160 Z", P(a.muzzle), { "stroke-width": 3 }) });
    // eyes: almond shaped, slanting up at the outside
    const eye = ell(177, 129, 10, 8.5, P(INK, true), { "stroke-width": 0, transform: "rotate(-14 177 129)" }) + `<circle cx="180" cy="125.5" r="3.2" fill="#fff"/>` + `<path d="M 163 131 Q 160 134 156 135" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    lay.push({ p: "eyes", head: 1, s: both(eye) + hit(hitEll(176, 130, 18, 14) + hitEll(224, 130, 18, 14)) });
    lay.push({ p: "nose", head: 1, s: ell(200, 205, 10, 7, P(INK, true), { "stroke-width": 2 }) + hit(hitEll(200, 205, 18, 14)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 200 212 V 216" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(200, 216, 14, 8)) });
    lay.push({ p: "whiskers", head: 1, s: both(`<path d="M 186 198 Q 168 196 152 200 M 188 204 Q 170 206 156 212" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`) + hit(hitEll(166, 204, 20, 12) + hitEll(234, 204, 20, 12)) });
    return lay;
  }

  /* ---------- kangaroo: side view, upright on huge back legs ----------
     Long feet flat on the ground, thick tail as a third leg, small arms,
     a pouch with a joey peeking out, a deer-like head and tall ears. */
  function rooArt(a, P) {
    const lay = [];
    lay.push({ p: "tail", s: path("M 270 296 C 300 330 338 352 394 364 Q 400 370 392 374 C 340 376 296 364 252 338 Z", P(a.fur)) + hit(hitEll(330, 350, 66, 26)) });
    // far foot, behind
    lay.push({ p: "paws", s: path("M 250 360 Q 232 366 190 366 Q 178 367 180 372 L 276 372 Q 280 362 270 354 Z", P(a.legDark)) });
    // body, leaning forward, with a pale belly
    lay.push({ p: "fur", s:
      path("M 194 118 C 198 144 210 164 226 178 C 262 208 284 246 288 288 C 292 330 270 354 236 356 C 200 358 172 332 168 290 C 164 250 168 214 178 188 C 172 168 166 150 160 130 Z", P(a.fur)) +
      path("M 182 194 C 176 240 176 292 196 332 C 210 346 228 348 238 342 C 220 300 206 250 198 198 Z", P(a.belly), { "stroke-width": 3 }) });
    // pouch with a joey peeking out
    lay.push({ p: "pouch", s:
      ell(204, 276, 12, 11, P(a.fur), { "stroke-width": 3 }) + ell(197, 266, 4, 9, P(a.fur), { "stroke-width": 3, transform: "rotate(-20 197 266)" }) +
      `<circle cx="201" cy="275" r="2.6" fill="${INK}"/><circle cx="193" cy="280" r="2" fill="${INK}"/>` +
      path("M 180 284 Q 200 294 230 286 Q 236 316 220 336 Q 196 342 186 320 Q 178 302 180 284 Z", P(a.belly)) +
      hit(hitEll(206, 304, 30, 34)) });
    // big back leg: thigh, shin, and long foot
    lay.push({ p: "fur", s:
      ell(250, 300, 46, 58, P(a.fur), { transform: "rotate(-18 250 300)" }) +
      path("M 262 336 Q 282 352 268 366 L 244 366 Q 246 352 238 342 Z", P(a.fur)) });
    lay.push({ p: "paws", s: path("M 244 352 Q 222 360 166 362 Q 150 364 152 372 L 268 372 Q 276 362 266 350 Z", P(a.paw)) +
      hit(hitEll(212, 364, 64, 18)) });
    // small arms held in front
    const arm = "M 188 204 Q 168 222 160 244";
    lay.push({ p: "fur", s: `<path d="${arm}" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="${arm}" fill="none" stroke="${P(a.fur)}" stroke-width="8" stroke-linecap="round"/>` + ell(158, 248, 8, 6, P(a.paw), { "stroke-width": 3 }) });
    // tall ears (far one first)
    lay.push({ p: "ears", head: 1, s:
      ell(196, 62, 10, 28, P(a.legDark), { transform: "rotate(22 196 62)", "stroke-width": 4 }) +
      ell(178, 58, 12, 32, P(a.fur), { transform: "rotate(8 178 58)", "stroke-width": 4 }) + ell(177, 62, 5, 22, P(a.earIn), { transform: "rotate(8 177 62)", "stroke-width": 0 }) +
      hit(hitEll(186, 60, 30, 40)) });
    // head: rounded skull and a long deer-like snout pointing left
    lay.push({ p: "fur", head: 1, s:
      path("M 196 100 C 196 82 176 76 162 80 C 146 84 140 96 132 104 C 118 112 112 122 116 130 C 120 138 132 138 146 136 C 164 134 178 134 190 126 C 196 120 196 110 196 100 Z", P(a.fur)) +
      path("M 118 130 C 124 140 146 140 162 134 C 150 132 132 132 118 130 Z", P(a.muzzle), { "stroke-width": 3 }) });
    lay.push({ p: "eyes", head: 1, s: ell(160, 98, 5.5, 7, P(INK, true), { "stroke-width": 0 }) + `<circle cx="162" cy="95" r="2" fill="#fff"/>` + `<path d="M 153 91 Q 160 87 167 90" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` + hit(hitEll(160, 98, 14, 14)) });
    lay.push({ p: "nose", head: 1, s: path("M 114 118 Q 116 110 124 112 Q 128 118 122 124 Q 114 124 114 118 Z", P(INK, true), { "stroke-width": 2 }) + hit(hitEll(120, 118, 14, 12)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 122 129 Q 132 133 144 131" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(132, 131, 16, 8)) });
    return lay;
  }

  /* ---------- hand-drawn animals (2026 redraw) ----------
     Each animal below is drawn by hand in the 400 x 400 box so its outline
     looks like the real animal. Side-view animals face left, like a field-guide
     plate. Ground is at y = 372. Every body part keeps its data-part name and an
     invisible tap area, so clues, the K detective check, and coloring all work. */
  // A leg or arm: wide at the top, narrow at the bottom, rounded foot. The top is
  // left open so the limb flows out of the body without an outline across it.
  const limb = (x1, y1, w1, x2, y2, w2, fill) => path(`M ${x1 - w1 / 2} ${y1} C ${x1 - w1 / 2} ${(y1 + y2) / 2} ${x2 - w2 / 2} ${(y1 + y2) / 2} ${x2 - w2 / 2} ${y2} Q ${x2} ${y2 + w2 * 0.35} ${x2 + w2 / 2} ${y2} C ${x2 + w2 / 2} ${(y1 + y2) / 2} ${x1 + w1 / 2} ${(y1 + y2) / 2} ${x1 + w1 / 2} ${y1}`, fill);
  const eyeDot = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${INK}"/><circle cx="${r1(x + r * 0.3)}" cy="${r1(y - r * 0.4)}" r="${r1(r * 0.38)}" fill="#fff"/>`;
  const strokeTube = (d, w, fill) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
  const whiskerLines = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;

  // River otter: long, low, sleek body on short legs, webbed feet, thick tapering tail.
  function otterArt(a, P) {
    const lay = [];
    lay.push({ p: "tail", s: path("M 296 258 C 338 270 372 300 394 334 Q 397 344 388 342 C 360 326 330 310 292 304 Z", P(a.fur)) + hit(hitEll(344, 300, 52, 28)) });
    lay.push({ p: "fur", s: limb(146, 282, 26, 136, 350, 20, P(a.paw)) + limb(272, 286, 30, 284, 350, 22, P(a.paw)) });
    lay.push({ p: "fur", s:
      path("M 80 234 C 92 214 118 204 146 212 C 196 218 250 220 280 234 C 304 248 312 276 302 296 C 292 314 266 318 240 316 L 150 316 C 112 314 88 290 80 262 Z", P(a.fur)) +
      path("M 56 228 C 66 252 92 276 132 290 C 116 272 106 252 104 232 Z", P(a.belly), { "stroke-width": 3 }) });
    lay.push({ p: "fur", s: limb(166, 288, 32, 158, 350, 22, P(a.fur)) + limb(278, 288, 36, 270, 350, 24, P(a.fur)) });
    const foot = (x, c) => path(`M ${x + 10} ${350} Q ${x - 18} ${352} ${x - 24} ${364} Q ${x - 22} ${371} ${x - 10} ${370} L ${x + 16} ${370} Q ${x + 22} ${360} ${x + 10} ${350} Z`, c) +
      `<path d="M ${x - 14} ${369} l -2 -9 M ${x - 4} ${370} l -1 -11 M ${x + 6} ${370} l 0 -12" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    lay.push({ p: "paws", s: foot(132, P(a.paw)) + foot(282, P(a.paw)) + foot(156, P(a.paw)) + foot(268, P(a.paw)) +
      hit(hitEll(146, 360, 34, 16) + hitEll(274, 360, 34, 16)) });
    lay.push({ p: "ears", head: 1, s: ell(118, 182, 10, 9, P(a.fur)) + ell(118, 183, 4.5, 4, P(a.paw), { "stroke-width": 0 }) + hit(hitEll(118, 182, 18, 16)) });
    lay.push({ p: "fur", head: 1, s:
      path("M 132 196 C 126 172 102 164 82 170 C 62 176 48 190 44 204 C 40 214 44 224 56 228 C 70 234 92 236 106 234 C 124 230 136 214 132 196 Z", P(a.fur)) +
      ell(62, 214, 18, 12, P(a.muzzle), { "stroke-width": 3 }) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(88, 196, 6) + hit(hitEll(88, 196, 14, 14)) });
    lay.push({ p: "nose", head: 1, s: path("M 40 200 Q 44 192 54 196 Q 56 204 48 208 Q 40 207 40 200 Z", P(INK, true), { "stroke-width": 2 }) + hit(hitEll(48, 201, 14, 12)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 48 222 Q 58 228 72 225" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(60, 224, 16, 8)) });
    lay.push({ p: "whiskers", head: 1, s: whiskerLines("M 58 210 Q 36 204 14 206 M 60 216 Q 38 216 16 222 M 62 221 Q 42 228 24 238") + hit(hitEll(34, 218, 28, 20)) });
    return lay;
  }

  // Raccoon: hunched and round, black mask, pointed snout, ringed tail, little hands.
  function raccoonArt(a, P) {
    const lay = [];
    const td = "M 240 344 C 300 354 352 338 360 298 C 366 270 354 250 338 242";
    lay.push({ p: "tail", s: strokeTube(td, 40, P(a.fur)) + (P.line ? `<path d="${td}" fill="none" stroke="${INK}" stroke-width="40" stroke-dasharray="3 12 3 14" stroke-dashoffset="-20.5"/>` : `<path d="${td}" fill="none" stroke="${INK}" stroke-width="40" stroke-dasharray="15 17" stroke-dashoffset="-22"/>`) + hit(hitEll(318, 300, 54, 58)) });
    lay.push({ p: "fur", s:
      path("M 158 194 Q 126 236 124 292 Q 120 352 158 366 L 242 366 Q 280 352 276 292 Q 274 236 242 194 Z", P(a.fur)) +
      ell(200, 300, 44, 56, P(a.belly), { "stroke-width": 3 }) });
    lay.push({ p: "fur", s: both(limb(160, 232, 30, 180, 312, 22, P(a.fur))) });
    const hand = ell(184, 320, 15, 11, P(a.paw)) + `<path d="M 174 326 l -2 7 M 181 329 l -1 7 M 188 329 l 0 7 M 195 326 l 1 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    lay.push({ p: "paws", s: both(hand + ell(146, 364, 24, 9, P(a.paw))) + hit(hitEll(186, 322, 22, 18) + hitEll(214, 322, 22, 18) + hitEll(146, 362, 28, 14) + hitEll(254, 362, 28, 14)) });
    const ear = path("M 144 122 Q 136 88 150 72 Q 172 82 182 106 Z", P(a.fur)) + path("M 150 112 Q 146 92 153 82 Q 166 90 172 106 Z", P(a.earIn), { "stroke-width": 3 });
    lay.push({ p: "ears", head: 1, s: both(ear) + hit(hitEll(158, 92, 24, 28) + hitEll(242, 92, 24, 28)) });
    lay.push({ p: "fur", head: 1, s:
      path("M 200 96 Q 156 94 140 118 Q 124 142 128 166 Q 136 186 172 196 Q 188 206 200 216 Q 212 206 228 196 Q 264 186 272 166 Q 276 142 260 118 Q 244 94 200 96 Z", P(a.fur)) +
      path("M 160 166 Q 180 158 200 172 Q 220 158 240 166 Q 236 190 220 200 Q 208 214 200 216 Q 192 214 180 200 Q 164 190 160 166 Z", P(a.muzzle), { "stroke-width": 3 }) +
      path("M 150 132 Q 172 118 194 136 Q 172 128 150 132 Z", P(a.muzzle), { "stroke-width": 2 }) + `<g ${MIRROR}>` + path("M 150 132 Q 172 118 194 136 Q 172 128 150 132 Z", P(a.muzzle), { "stroke-width": 2 }) + `</g>` +
      path("M 130 150 Q 160 132 196 152 Q 200 155 204 152 Q 240 132 270 150 Q 264 174 240 174 Q 220 172 204 163 L 196 163 Q 180 172 160 174 Q 136 174 130 150 Z", P(INK)) });
    const eye = circ(172, 154, 8.5, P("#6a6272", true), { "stroke-width": 0 }) + eyeDot(172, 154, 5.5);
    lay.push({ p: "eyes", head: 1, s: both(eye) + hit(hitEll(172, 154, 18, 14) + hitEll(228, 154, 18, 14)) });
    lay.push({ p: "nose", head: 1, s: ell(200, 206, 9, 7, P(INK, true), { "stroke-width": 2 }) + hit(hitEll(200, 206, 16, 12)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 200 213 V 217" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(200, 216, 12, 7)) });
    lay.push({ p: "whiskers", head: 1, s: both(whiskerLines("M 182 196 Q 164 194 148 198 M 184 202 Q 166 206 152 212")) + hit(hitEll(164, 202, 18, 12) + hitEll(236, 202, 18, 12)) });
    return lay;
  }

  // Lion: walking side view, big shaggy mane, tail with a dark tuft.
  function lionArt(a, P) {
    const lay = [];
    const td = "M 320 226 C 352 246 360 296 372 272 C 378 258 374 240 380 222";
    lay.push({ p: "tail", s: strokeTube(td, 7, P(a.fur)) + path("M 380 206 Q 368 214 372 226 Q 380 236 390 228 Q 396 214 380 206 Z", P(a.tuft)) + hit(hitEll(360, 252, 30, 46)) });
    lay.push({ p: "fur", s: limb(150, 276, 34, 144, 358, 26, P(a.legDark)) + limb(296, 270, 38, 304, 358, 28, P(a.legDark)) });
    lay.push({ p: "fur", s: path("M 118 212 C 160 196 250 192 302 204 C 332 212 338 248 326 272 C 312 296 282 298 252 290 L 160 292 C 132 290 114 270 112 246 Z", P(a.fur)) +
      ell(292, 250, 38, 44, P(a.fur)) });
    lay.push({ p: "fur", s: limb(172, 266, 42, 166, 358, 30, P(a.fur)) + limb(298, 276, 36, 288, 358, 28, P(a.fur)) });
    const paw = (x, c) => ell(x, 362, 20, 9, c) + `<path d="M ${x - 8} 356 v 8 M ${x} 355 v 9 M ${x + 8} 356 v 8" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    lay.push({ p: "paws", s: paw(140, P(a.legDark)) + paw(306, P(a.legDark)) + paw(162, P(a.fur)) + paw(284, P(a.fur)) + hit(hitEll(152, 362, 32, 14) + hitEll(294, 362, 32, 14)) });
    // mane: a shaggy ring of points around the head
    let d = ""; const cx = 116, cy = 178, n = 16;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2, tm = ((i - 0.5) / n) * Math.PI * 2;
      const x = cx + Math.cos(t) * 62, y = cy + Math.sin(t) * 66, qx = cx + Math.cos(tm) * 80, qy = cy + Math.sin(tm) * 84;
      d += i === 0 ? `M ${r1(x)} ${r1(y)} ` : `Q ${r1(qx)} ${r1(qy)} ${r1(x)} ${r1(y)} `;
    }
    lay.push({ p: "mane", head: 1, s: path(d + "Z", P(a.mane)) + hit(hitEll(150, 160, 34, 50)) });
    lay.push({ p: "ears", head: 1, s: circ(132, 132, 11, P(a.fur)) + circ(132, 133, 5, P(a.earIn), { "stroke-width": 0 }) + hit(hitEll(132, 132, 16, 16)) });
    lay.push({ p: "fur", head: 1, s:
      path("M 142 154 C 136 130 108 122 86 130 C 66 138 56 152 52 168 C 48 182 50 198 62 206 C 76 216 98 218 118 212 C 138 206 148 180 142 154 Z", P(a.fur)) +
      ell(68, 194, 22, 16, P(a.muzzle), { "stroke-width": 3 }) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(96, 162, 6) + `<path d="M 86 154 Q 96 149 106 153" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` + hit(hitEll(96, 162, 14, 14)) });
    lay.push({ p: "nose", head: 1, s: path("M 46 178 Q 48 168 60 170 Q 64 180 56 186 Q 46 186 46 178 Z", P("#8a4b2a")) + hit(hitEll(54, 178, 14, 12)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 54 186 Q 54 196 60 200 M 52 202 Q 64 210 82 204" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(66, 202, 22, 12)) });
    lay.push({ p: "whiskers", head: 1, s: whiskerLines("M 66 190 Q 46 186 28 190 M 68 196 Q 48 198 30 206") + hit(hitEll(46, 196, 22, 14)) });
    return lay;
  }

  // Polar bear: big walking side view, long neck and long narrow head, small ears, huge paws.
  function polarArt(a, P) {
    const lay = [];
    lay.push({ p: "tail", s: ell(342, 236, 12, 10, P(a.fur)) + hit(hitEll(342, 236, 18, 16)) });
    lay.push({ p: "fur", s: limb(160, 276, 46, 150, 352, 40, P(a.legDark)) + limb(306, 266, 50, 314, 352, 42, P(a.legDark)) });
    lay.push({ p: "fur", s: path("M 72 206 C 98 192 140 186 180 188 C 230 182 300 184 330 202 C 352 218 350 256 338 274 C 324 296 296 298 268 294 L 172 298 C 142 296 120 280 110 256 C 100 244 86 240 74 240 Z", P(a.fur)) });
    lay.push({ p: "fur", s: limb(182, 270, 52, 172, 352, 44, P(a.fur)) + limb(300, 262, 58, 292, 352, 46, P(a.fur)) });
    const paw = (x, c) => ell(x, 360, 30, 11, c) + `<path d="M ${x - 22} 364 l -4 6 M ${x - 13} 366 l -3 6 M ${x - 4} 367 l -2 6" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    lay.push({ p: "paws", s: paw(146, P(a.legDark)) + paw(318, P(a.legDark)) + paw(168, P(a.paw)) + paw(290, P(a.paw)) + hit(hitEll(160, 358, 40, 18) + hitEll(300, 358, 40, 18)) });
    lay.push({ p: "ears", head: 1, s: circ(92, 198, 9, P(a.fur)) + circ(92, 199, 4, P("#c9c2ad"), { "stroke-width": 0 }) + hit(hitEll(92, 198, 16, 16)) });
    lay.push({ p: "fur", head: 1, s: path("M 104 222 C 104 202 86 194 66 196 C 48 198 30 208 22 220 C 16 230 18 240 30 244 C 46 250 72 250 90 244 C 100 240 104 232 104 222 Z", P(a.fur)) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(66, 212, 5) + hit(hitEll(66, 212, 12, 12)) });
    lay.push({ p: "nose", head: 1, s: path("M 14 220 Q 16 212 26 214 Q 30 222 24 228 Q 14 228 14 220 Z", P(INK, true), { "stroke-width": 2 }) + hit(hitEll(22, 220, 14, 12)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 26 236 Q 40 244 58 242" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(42, 240, 18, 8)) });
    return lay;
  }

  // Giant panda: sitting with legs out, black arms and shoulder band, eye patches, chewing bamboo.
  function pandaArt(a, P) {
    const lay = [];
    lay.push({ p: "fur", s: path("M 150 192 Q 116 232 118 292 Q 122 350 170 362 L 230 362 Q 278 350 282 292 Q 284 232 250 192 Z", P(a.fur)) +
      path("M 138 216 Q 200 182 262 216 Q 278 236 272 260 Q 236 234 200 238 Q 164 234 128 260 Q 122 236 138 216 Z", P(INK)) });
    const leg = ell(146, 336, 40, 30, P(INK), { transform: "rotate(24 146 336)" }) + ell(134, 348, 17, 14, P("#5a5262", true), { "stroke-width": 3 }) +
      [[118, 336], [126, 328], [136, 326]].map(([x, y]) => circ(x, y, 4.5, P("#5a5262", true), { "stroke-width": 2 })).join("");
    lay.push({ p: "paws", s: both(leg) + hit(hitEll(144, 340, 44, 32) + hitEll(256, 340, 44, 32)) });
    // bamboo held across the chest
    lay.push({ p: "bamboo", s: path("M 166 338 L 226 176 L 238 180 L 178 342 Z", P("#7cc96b")) + `<path d="M 186 288 l 12 4 M 202 246 l 12 4 M 216 206 l 12 4" stroke="${INK}" stroke-width="3"/>` });
    lay.push({ p: "fur", s: both(limb(150, 234, 40, 186, 286, 30, P(INK))) });
    lay.push({ p: "paws", s: both(ell(190, 288, 16, 13, P(INK))) + hit(hitEll(190, 288, 20, 18) + hitEll(210, 288, 20, 18)) });
    lay.push({ p: "ears", head: 1, s: both(circ(146, 104, 21, P(a.earColor))) + hit(hitEll(146, 104, 26, 26) + hitEll(254, 104, 26, 26)) });
    lay.push({ p: "fur", head: 1, s: ell(200, 152, 68, 58, P(a.fur)) + both(ell(174, 150, 16, 23, P(INK), { transform: "rotate(32 174 150)" })) + ell(200, 182, 26, 18, P(a.muzzle), { "stroke-width": 3 }) });
    const eye = circ(176, 148, 6.5, P("#f7f7f2", true), { "stroke-width": 0 }) + `<circle cx="177" cy="149" r="3.8" fill="${INK}"/>`;
    lay.push({ p: "eyes", head: 1, s: both(eye) + hit(hitEll(174, 150, 18, 22) + hitEll(226, 150, 18, 22)) });
    lay.push({ p: "nose", head: 1, s: ell(200, 174, 10, 7, P(INK, true), { "stroke-width": 2 }) + hit(hitEll(200, 174, 16, 12)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 200 181 V 186 M 190 190 Q 195 194 200 186 Q 205 194 210 190" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` + hit(hitEll(200, 188, 14, 8)) });
    return lay;
  }

  // Meerkat: standing tall on guard, slim body, dark eye patches, paws held up, thin tail for balance.
  function meerkatArt(a, P) {
    const lay = [];
    lay.push({ p: "tail", s: path("M 222 352 C 266 360 316 362 360 352 Q 368 349 362 345 C 318 349 268 345 228 338 Z", P(a.fur)) + path("M 340 351 Q 352 352 362 347 Q 366 349 360 352 Q 350 356 338 356 Z", P(a.tuft), { "stroke-width": 3 }) + hit(hitEll(300, 350, 64, 14)) });
    lay.push({ p: "fur", s: path("M 182 146 Q 168 190 166 240 Q 160 300 170 340 Q 176 364 200 366 Q 224 364 230 340 Q 240 300 234 240 Q 232 190 218 146 Z", P(a.fur)) +
      path("M 188 170 Q 182 240 186 330 Q 200 344 214 330 Q 218 240 212 170 Z", P(a.belly), { "stroke-width": 3 }) +
      both(path("M 174 296 Q 162 322 172 352 Q 182 360 188 346 Q 190 320 182 298 Z", P(a.fur))) });
    lay.push({ p: "paws", s: both(ell(180, 364, 16, 7, P(a.paw))) + hit(hitEll(180, 362, 22, 12) + hitEll(220, 362, 22, 12)) });
    lay.push({ p: "fur", s: both(limb(178, 196, 20, 186, 240, 14, P(a.fur))) });
    lay.push({ p: "paws", s: both(ell(188, 244, 9, 7, P(a.paw))) + hit(hitEll(188, 246, 14, 12) + hitEll(212, 246, 14, 12)) });
    lay.push({ p: "claws", s: both(`<path d="M 183 249 q 0 6 -2 9 M 188 250 q 0 6 0 10 M 193 249 q 0 6 2 9" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`) + hit(hitEll(188, 256, 12, 8) + hitEll(212, 256, 12, 8)) });
    lay.push({ p: "ears", head: 1, s: both(ell(165, 106, 6, 9, P(a.earColor))) + hit(hitEll(165, 106, 12, 14) + hitEll(235, 106, 12, 14)) });
    lay.push({ p: "fur", head: 1, s: path("M 200 78 Q 176 78 168 96 Q 160 114 172 130 Q 186 146 200 158 Q 214 146 228 130 Q 240 114 232 96 Q 224 78 200 78 Z", P(a.fur)) +
      both(ell(184, 108, 10, 13, P(a.patchColor), { transform: "rotate(28 184 108)", "stroke-width": 0 })) });
    lay.push({ p: "eyes", head: 1, s: both(eyeDot(185, 108, 4.5)) + hit(hitEll(185, 108, 12, 12) + hitEll(215, 108, 12, 12)) });
    lay.push({ p: "nose", head: 1, s: ell(200, 151, 6, 5, P(INK, true), { "stroke-width": 2 }) + hit(hitEll(200, 151, 12, 10)) });
    return lay;
  }

  // Rabbit: side view sitting, long ears, big back foot, round haunch, cotton tail.
  function rabbitArt(a, P) {
    const lay = [];
    lay.push({ p: "tail", s: path("M 296 300 Q 290 284 304 280 Q 312 268 324 280 Q 338 288 330 302 Q 330 316 314 316 Q 296 318 296 300 Z", P(a.tailColor)) + hit(hitEll(312, 298, 26, 26)) });
    lay.push({ p: "fur", s: path("M 124 220 C 150 200 240 206 280 232 C 312 252 320 300 302 330 C 288 354 252 362 222 360 L 150 360 C 128 356 116 330 118 300 C 118 270 116 240 124 220 Z", P(a.fur)) +
      path("M 126 236 C 120 268 124 306 140 336 C 148 310 152 276 152 240 Z", P(a.belly), { "stroke-width": 3 }) +
      ell(256, 316, 46, 40, P(a.fur)) });
    lay.push({ p: "fur", s: limb(160, 300, 20, 156, 356, 16, P(a.fur)) });
    lay.push({ p: "paws", s: path("M 236 352 Q 196 356 160 358 Q 146 360 148 370 L 256 370 Q 264 360 254 350 Z", P(a.paw)) + ell(150, 362, 14, 7, P(a.paw)) + hit(hitEll(204, 362, 60, 14)) });
    lay.push({ p: "ears", head: 1, s: ell(166, 112, 12, 44, P(a.fur), { transform: "rotate(22 166 112)" }) + ell(150, 106, 14, 48, P(a.fur), { transform: "rotate(10 150 106)" }) + ell(150, 110, 6, 36, P(a.earIn), { transform: "rotate(10 150 110)", "stroke-width": 0 }) + hit(hitEll(156, 108, 26, 50)) });
    lay.push({ p: "fur", head: 1, s: path("M 172 196 C 170 172 152 160 128 162 C 106 164 90 178 86 196 C 84 210 92 222 108 226 C 130 232 160 228 170 212 Z", P(a.fur)) +
      ell(100, 208, 16, 12, P(a.muzzle), { "stroke-width": 3 }) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(124, 186, 7) + hit(hitEll(124, 186, 14, 14)) });
    lay.push({ p: "nose", head: 1, s: path("M 84 196 Q 86 190 94 192 Q 96 198 90 202 Q 84 202 84 196 Z", P("#e58fa3")) + hit(hitEll(90, 197, 12, 10)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 90 203 Q 92 210 98 212 M 98 212 Q 104 214 108 210" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><rect x="92" y="212" width="9" height="9" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` + hit(hitEll(98, 212, 14, 10)) });
    lay.push({ p: "whiskers", head: 1, s: whiskerLines("M 100 204 Q 80 198 62 200 M 102 210 Q 82 212 66 220") + hit(hitEll(80, 208, 18, 12)) });
    return lay;
  }

  // Elephant: side view, big domed back, column legs, fan ear, long curling trunk, tusk.
  function elephantArt(a, P) {
    const lay = [];
    const td = "M 332 206 C 344 230 346 256 342 278";
    lay.push({ p: "tail", s: strokeTube(td, 5, P(a.fur)) + path("M 336 276 Q 342 296 350 278 Z", P(a.tuft)) + hit(hitEll(342, 244, 16, 40)) });
    lay.push({ p: "fur", s: limb(146, 258, 50, 144, 362, 46, P(a.legDark)) + limb(302, 258, 52, 308, 362, 46, P(a.legDark)) });
    lay.push({ p: "fur", s: path("M 120 200 C 140 140 240 124 300 150 C 340 168 348 220 332 256 C 320 280 292 288 262 286 L 160 288 C 132 286 116 262 116 236 Z", P(a.fur)) });
    lay.push({ p: "fur", s: limb(170, 262, 58, 166, 362, 52, P(a.fur)) + limb(282, 262, 60, 278, 362, 52, P(a.fur)) });
    const nails = x => [-14, 0, 14].map(dx => `<path d="M ${x + dx - 6} 368 Q ${x + dx} 360 ${x + dx + 6} 368" fill="#fffaf0" stroke="${INK}" stroke-width="2.5"/>`).join("");
    lay.push({ p: "paws", s: nails(166) + nails(278) + nails(144) + nails(308) + hit(hitEll(166, 344, 34, 26) + hitEll(278, 344, 34, 26)) });
    lay.push({ p: "fur", head: 1, s: path("M 152 152 C 142 118 112 104 84 112 C 60 120 50 146 52 172 C 54 196 62 210 78 216 C 98 222 126 216 142 200 Z", P(a.fur)) });
    lay.push({ p: "trunk", head: 1, s: path("M 62 168 C 46 200 42 240 48 280 C 50 300 62 312 76 306 Q 84 300 76 292 C 66 286 66 250 72 220 C 76 202 82 192 84 186 Z", P(a.fur)) +
      [228, 248, 268].map(y => `<path d="M ${48 + (y - 228) * 0.02} ${y} q 10 3 22 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`).join("") + hit(hitEll(62, 250, 26, 64)) });
    lay.push({ p: "tusks", head: 1, s: path("M 84 204 Q 62 226 32 232 Q 52 238 68 232 Q 86 224 92 210 Z", P("#fffaf0")) + hit(hitEll(60, 222, 30, 16)) });
    lay.push({ p: "ears", head: 1, s: path("M 112 128 C 142 108 182 122 186 160 C 190 202 162 230 132 228 C 114 226 106 206 110 184 Z", P(a.fur)) +
      path("M 124 138 C 146 126 172 136 174 162 C 176 194 156 214 136 214 C 124 212 118 198 120 182 Z", P(a.earIn), { "stroke-width": 0 }) + hit(hitEll(148, 172, 38, 52)) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(96, 150, 5.5) + `<path d="M 86 142 Q 96 137 106 141" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` + hit(hitEll(96, 150, 12, 12)) });
    return lay;
  }

  // Giraffe: side view, very long neck, sloping back, thin legs, patchwork spots, ossicones.
  function giraffeArt(a, P) {
    const lay = [];
    const td = "M 302 196 C 312 220 316 250 316 276";
    lay.push({ p: "tail", s: strokeTube(td, 4, P(a.fur)) + path("M 310 274 Q 316 300 324 274 Z", P(a.tuft)) + hit(hitEll(314, 238, 14, 44)) });
    lay.push({ p: "fur", s: limb(212, 224, 18, 206, 356, 13, P(a.legDark)) + limb(292, 214, 20, 302, 356, 13, P(a.legDark)) });
    // neck with a short mane along the back
    lay.push({ p: "neck", s: path("M 184 198 C 168 160 136 112 110 84 L 136 66 C 158 100 198 142 224 172 Z", P(a.fur)) +
      `<path d="M 136 70 C 160 104 196 144 220 170" fill="none" stroke="${P(a.maneColor)}" stroke-width="8" stroke-linecap="round"/>` +
      [[140, 112, 9], [160, 140, 10], [180, 168, 10], [124, 92, 7]].map(([x, y, r]) => path(blob(x, y, r), P(a.spots), { "stroke-width": P.line ? 3 : 0 })).join("") +
      hit(hitEll(162, 130, 30, 56)) });
    lay.push({ p: "fur", s: path("M 196 164 C 232 152 282 168 304 186 C 320 202 314 228 298 236 L 210 240 C 190 236 182 214 186 194 Z", P(a.fur)) +
      [[214, 192, 13], [246, 182, 14], [278, 194, 13], [232, 220, 12], [266, 222, 12], [296, 214, 9], [204, 222, 9]].map(([x, y, r]) => path(blob(x, y, r), P(a.spots), { "stroke-width": P.line ? 3 : 0 })).join("") });
    lay.push({ p: "fur", s: limb(226, 230, 22, 220, 356, 14, P(a.fur)) + limb(282, 226, 24, 288, 356, 14, P(a.fur)) });
    const hoof = (x, c) => path(`M ${x - 9} 354 L ${x + 9} 354 L ${x + 10} 370 L ${x - 10} 370 Z`, c);
    lay.push({ p: "hooves", s: hoof(206, P("#3a2a20")) + hoof(302, P("#3a2a20")) + hoof(220, P("#4a3628")) + hoof(288, P("#4a3628")) + hit(hitEll(213, 362, 22, 14) + hitEll(295, 362, 22, 14)) });
    lay.push({ p: "horns", head: 1, s: [[118, 50], [130, 54]].map(([x, y]) => strokeTube(`M ${x} ${y + 14} L ${x + 2} ${y - 4}`, 4, P(a.fur)) + circ(x + 2, y - 7, 6, P("#4a2a10"))).join("") + hit(hitEll(124, 48, 20, 16)) });
    lay.push({ p: "ears", head: 1, s: ell(146, 60, 14, 6, P(a.fur), { transform: "rotate(-18 146 60)" }) + hit(hitEll(146, 60, 18, 12)) });
    lay.push({ p: "fur", head: 1, s: path("M 138 70 C 134 52 114 46 98 50 C 84 54 72 64 62 74 C 54 82 56 94 68 96 C 84 100 110 98 126 92 C 136 86 140 78 138 70 Z", P(a.fur)) +
      ell(70, 88, 14, 9, P(a.muzzle), { "stroke-width": 3 }) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(106, 66, 5) + `<path d="M 98 60 l -3 -5 M 104 58 l -1 -6 M 110 59 l 1 -5" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` + hit(hitEll(106, 66, 12, 12)) });
    lay.push({ p: "nose", head: 1, s: `<ellipse cx="64" cy="80" rx="3.5" ry="5" fill="${INK}"/>` + hit(hitEll(64, 80, 10, 10)) });
    return lay;
  }

  // Camel (dromedary): side view, one big hump, long curved neck, long legs, wide padded feet.
  function camelArt(a, P) {
    const lay = [];
    const td = "M 320 202 C 332 226 334 250 330 270";
    lay.push({ p: "tail", s: strokeTube(td, 5, P(a.fur)) + path("M 324 268 Q 330 290 338 270 Z", P(a.tuft)) + hit(hitEll(330, 236, 14, 38)) });
    lay.push({ p: "fur", s: limb(172, 244, 22, 166, 352, 15, P(a.legDark)) + limb(300, 240, 24, 308, 352, 15, P(a.legDark)) });
    lay.push({ p: "hump", s: path("M 184 194 C 192 128 262 122 280 196 Z", P(a.fur)) + hit(hitEll(232, 166, 46, 34)) });
    lay.push({ p: "fur", s: path("M 148 210 C 158 188 190 182 220 188 C 250 194 292 190 320 204 C 336 216 332 244 314 252 L 172 256 C 152 252 144 232 148 210 Z", P(a.fur)) +
      path("M 172 250 C 210 258 270 258 310 250 C 290 244 220 244 172 250 Z", P(a.belly), { "stroke-width": 0 }) });
    lay.push({ p: "neck", s: path("M 162 212 C 122 220 104 210 96 182 C 90 160 86 142 84 126 L 110 120 C 114 142 120 166 132 180 C 146 194 166 194 176 192 Z", P(a.fur)) + hit(hitEll(118, 176, 28, 46)) });
    lay.push({ p: "fur", s: limb(188, 248, 26, 182, 352, 16, P(a.fur)) + limb(290, 246, 28, 296, 352, 16, P(a.fur)) +
      ell(184, 302, 10, 8, P(a.belly), { "stroke-width": 3 }) + ell(293, 302, 10, 8, P(a.belly), { "stroke-width": 3 }) });
    const pad = (x, c) => ell(x, 362, 20, 8, c);
    lay.push({ p: "paws", s: pad(166, P(a.legDark)) + pad(308, P(a.legDark)) + pad(182, P(a.belly)) + pad(296, P(a.belly)) + hit(hitEll(176, 360, 28, 14) + hitEll(302, 360, 28, 14)) });
    lay.push({ p: "ears", head: 1, s: ell(110, 96, 6, 9, P(a.fur), { transform: "rotate(30 110 96)" }) + hit(hitEll(110, 96, 12, 12)) });
    lay.push({ p: "fur", head: 1, s: path("M 116 116 C 112 98 96 90 78 92 C 60 94 46 104 40 116 C 36 126 38 136 50 140 C 68 146 92 142 106 134 C 114 128 118 122 116 116 Z", P(a.fur)) +
      path("M 42 132 Q 44 146 60 146 Q 74 144 76 138 Q 60 140 42 132 Z", P(a.muzzle), { "stroke-width": 3 }) });
    lay.push({ p: "eyes", head: 1, s: eyeDot(86, 108, 5) + `<path d="M 79 101 l -3 -4 M 84 99 l -1 -5 M 90 100 l 1 -5" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` + hit(hitEll(86, 108, 12, 12)) });
    lay.push({ p: "nose", head: 1, s: `<path d="M 42 114 Q 46 110 50 114" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + hit(hitEll(46, 114, 12, 10)) });
    lay.push({ p: "mouth", head: 1, s: `<path d="M 42 130 Q 56 134 70 130" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` + hit(hitEll(56, 132, 16, 8)) });
    return lay;
  }

  const HAND = { fox: foxArt, kangaroo: rooArt, raccoon: raccoonArt, lion: lionArt, polarbear: polarArt, panda: pandaArt, meerkat: meerkatArt, rabbit: rabbitArt, elephant: elephantArt, giraffe: giraffeArt, camel: camelArt };
  // Square boxes [x, y, size, size] around each head, for the suspect lineup and field guide faces.
  const FACEBOX = { fox: [100, 26, 200, 200], kangaroo: [100, 24, 116, 116], raccoon: [112, 60, 176, 176], lion: [30, 92, 176, 176], polarbear: [6, 168, 116, 116],
    panda: [118, 76, 164, 164], meerkat: [146, 64, 108, 108], rabbit: [56, 56, 180, 180], elephant: [14, 92, 210, 210], giraffe: [36, 14, 132, 132], camel: [20, 64, 112, 112] };


  /* ---------- public: draw an animal ---------- */
  const cache = {};
  function layers(id, line) {
    const key = id + (line ? ":l" : "");
    if (!cache[key]) { const a = A[id]; const P = painter(line); cache[key] = HAND[id] ? HAND[id](a, P) : a.plan === "stand" ? stand(a, P) : sit(a, P); }
    return cache[key];
  }
  function headBox(id) {
    if (FACEBOX[id]) return FACEBOX[id];
    const a = A[id], { hx, hy, hr } = a.L;
    if (id === "elephant") return [hx - hr * 2.05, hy - hr * 1.3, hr * 4.1, hr * 4.1];
    if (id === "giraffe") return [hx - hr * 2, hy - hr * 1.85, hr * 4, hr * 4];
    if (a.mane) return [hx - hr * 1.75, hy - hr * 1.7, hr * 3.5, hr * 3.5];
    if (a.ears === "long" || a.ears === "tall") return [hx - hr * 1.65, hy - hr * 2.05, hr * 3.3, hr * 3.3];
    return [hx - hr * 1.55, hy - hr * 1.5, hr * 3.1, hr * 3.1];
  }
  function animal(id, o = {}) {
    const lay = layers(id, !!o.line);
    const hide = new Set(o.hide || []);
    const vb = o.face ? headBox(id).map(r1).join(" ") : (o.vb || "0 0 400 400");
    const shown = lay.filter(l => (!o.face || l.head) && !hide.has(l.p));
    let body = shown.map(l => `<g data-part="${l.p}">${l.s}</g>`).join("");
    // Tap areas go on top, so a part tucked behind the head (like ears) is still easy to tap.
    if (!o.line && !o.face) body += shown.map(l => { const h = (l.s.match(/<g class="mm-hit">[\s\S]*?<\/g>/g) || []).join(""); return h ? `<g data-part="${l.p}" class="mm-hitlayer">${h}</g>` : ""; }).join("");
    // o.hab: draw the animal standing in its habitat, with a few plants or rocks in front at the edges.
    const bg = o.hab && !o.face ? scene(o.hab, !!o.line) : "", fg = o.hab && !o.face ? front(o.hab, !!o.line) : "";
    return `<svg class="${o.cls || "mm-animal"}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || NAMES[id] || id}">${bg}${o.shadow || o.hab ? `<ellipse cx="200" cy="376" rx="150" ry="14" fill="rgba(0,0,0,.18)"/>` : ""}${body}${fg}</svg>`;
  }
  function scene(k, line) {
    return habitat(k, { line }).replace("<svg ", '<svg x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" ').replace(/ role="img" aria-label="[^"]*"/, "");
  }
  function front(k, line) {
    const P = painter(line); let s = "";
    const tuft = (x, y, c) => [-14, -5, 4, 13].map((dx, i) => path(`M ${x + dx - 5} ${y} Q ${x + dx} ${y - 30 - (i % 2) * 14} ${x + dx + 5} ${y} Z`, P(c), { "stroke-width": 3 })).join("");
    const flower = (x, y, c) => `<path d="M ${x} ${y} v 34" stroke="${INK}" stroke-width="4"/>` + [0, 72, 144, 216, 288].map(d => { const r = d * Math.PI / 180; return circ(x + Math.cos(r) * 9, y + Math.sin(r) * 9, 8, P(c), { "stroke-width": 3 }); }).join("") + circ(x, y, 5, P("#ffb02e"), { "stroke-width": 3 });
    if (k === "grassland") s = tuft(22, 400, "#d9b043") + tuft(380, 400, "#d9b043");
    else if (k === "meadow") s = tuft(22, 404, "#5aa04a") + flower(48, 366, "#ff8fb1") + tuft(382, 404, "#5aa04a") + flower(356, 372, "#ffffff");
    else if (k === "outback") s = tuft(22, 402, "#c9a24a") + ell(384, 394, 26, 15, P("#b8502a"), { "stroke-width": 4 });
    else if (k === "forest") s = circ(10, 392, 34, P("#3f9a55"), { "stroke-width": 4 }) + circ(40, 404, 26, P("#4fae62"), { "stroke-width": 4 }) + circ(392, 396, 30, P("#3f9a55"), { "stroke-width": 4 });
    else if (k === "river") s = [372, 386].map((x, i) => `<path d="M ${x} 404 V ${330 - i * 14}" stroke="${INK}" stroke-width="5"/>` + ell(x, 322 - i * 14, 8, 18, P("#8a5a3b"), { "stroke-width": 3 })).join("") + tuft(24, 404, "#5aa04a");
    else if (k === "desert") s = ell(18, 392, 30, 18, P("#c79a5a"), { "stroke-width": 4 }) + ell(388, 396, 22, 13, P("#c79a5a"), { "stroke-width": 4 });
    else if (k === "ice") s = ell(14, 398, 40, 20, P("#ffffff"), { "stroke-width": 4 }) + ell(392, 400, 32, 16, P("#ffffff"), { "stroke-width": 4 });
    return `<g aria-hidden="true" pointer-events="none">${s}</g>`;
  }
  // Only the layers for one part, e.g. a dragged piece or a clue close-up.
  function partOnly(id, part, o = {}) {
    return layers(id, !!o.line).filter(l => l.p === part).map(l => l.s).join("");
  }

  /* bounding boxes, measured once in the page (getBBox), for clue zooms */
  const boxCache = {};
  function box(id, part) {
    const k = id + ":" + part; if (boxCache[k]) return boxCache[k];
    let host = document.getElementById("mm-measure");
    if (!host) { host = document.createElement("div"); host.id = "mm-measure"; host.style.cssText = "position:absolute;left:-9999px;top:0;width:400px;height:400px;visibility:hidden"; document.body.appendChild(host); }
    host.innerHTML = animal(id);
    const gs = host.querySelectorAll(`[data-part="${part}"]`);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    gs.forEach(g => { g.querySelectorAll(".mm-hit").forEach(h => h.remove()); const b = g.getBBox(); if (b.width) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); } });
    if (x0 > x1) return [0, 0, 400, 400];
    return (boxCache[k] = [x0, y0, x1 - x0, y1 - y0]);
  }

  const NAMES = { otter: "river otter", raccoon: "raccoon", fox: "red fox", lion: "lion", polarbear: "polar bear", panda: "giant panda", meerkat: "meerkat", rabbit: "rabbit", kangaroo: "kangaroo", elephant: "elephant", giraffe: "giraffe", camel: "camel" };

  /* ---------- teeth (side view of upper and lower teeth, front on the left) ---------- */
  const TEETH = {
    lion: { inc: "s", can: "big", cheek: "blade" }, polarbear: { inc: "s", can: "big", cheek: "blade" }, otter: { inc: "s", can: "big", cheek: "blade" }, meerkat: { inc: "s", can: "big", cheek: "blade" },
    raccoon: { inc: "s", can: "big", cheek: "bumpy" }, fox: { inc: "s", can: "big", cheek: "bumpy" },
    panda: { inc: "s", can: "big", cheek: "flat" }, rabbit: { inc: "big", can: "none", cheek: "flat" }, kangaroo: { inc: "big", can: "none", cheek: "flat" },
    elephant: { inc: "none", can: "none", cheek: "flat", tusk: true }, giraffe: { inc: "s", can: "none", cheek: "flat" }, camel: { inc: "s", can: "s", cheek: "flat" },
  };
  function teeth(id, o = {}) {
    const P = painter(!!o.line), t = TEETH[id];
    const gum = P("#f29bb0"), tooth = P("#fffdf5");
    let s = `<rect x="20" y="30" width="360" height="44" rx="22" fill="${gum}" stroke="${INK}" stroke-width="${SW}"/><rect x="20" y="186" width="360" height="44" rx="22" fill="${gum}" stroke="${INK}" stroke-width="${SW}"/>`;
    const row = (up) => {
      const base = up ? 74 : 186, dir = up ? 1 : -1; let x = 40, out = "";
      const tri = (w, h) => { const d = `M ${x} ${base} L ${x + w / 2} ${base + dir * h} L ${x + w} ${base} Z`; x += w + 4; return path(d, tooth, { "stroke-width": 4 }); };
      const rect = (w, h, ridge) => { const y = up ? base : base - h; let r = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${tooth}" stroke="${INK}" stroke-width="4"/>`; if (ridge) for (let i = 1; i < ridge; i++) r += `<path d="M ${x + (w * i) / ridge} ${up ? base + h : base - h} v ${dir * -10}" stroke="${INK}" stroke-width="2.5"/>`; x += w + 4; return r; };
      const bump = (w, h) => { const tip = base + dir * h; const d = `M ${x} ${base} L ${x} ${tip - dir * 8} Q ${x + w * 0.25} ${tip + dir * 6} ${x + w * 0.5} ${tip - dir * 6} Q ${x + w * 0.75} ${tip + dir * 6} ${x + w} ${tip - dir * 8} L ${x + w} ${base} Z`; x += w + 4; return path(d, tooth, { "stroke-width": 4 }); };
      const blade = (w, h) => { const d = `M ${x} ${base} L ${x + w * 0.2} ${base + dir * h * 0.55} L ${x + w * 0.45} ${base + dir * h} L ${x + w * 0.7} ${base + dir * h * 0.5} L ${x + w} ${base + dir * h * 0.8} L ${x + w} ${base} Z`; x += w + 4; return path(d, tooth, { "stroke-width": 4 }); };
      if (t.tusk && up) { out += path(`M 30 ${base - 10} Q 0 140 40 168 Q 70 176 70 150 Q 40 140 62 ${base}`, tooth, { "stroke-width": 4 }); x = 110; }
      if (t.inc === "s" && !(id === "giraffe" && up)) { out += rect(14, 26); out += rect(14, 26); }
      else if (t.inc === "big") { out += rect(26, up ? 58 : 48, 2); }
      else if (id === "giraffe" && up) { x += 34; }
      else x += 30;
      if (t.can === "big") out += tri(26, 46); else if (t.can === "s") out += tri(20, 34);
      x += t.cheek === "flat" ? 46 : 16;
      for (let i = 0; i < (t.cheek === "flat" ? (t.tusk ? 2 : 4) : 4); i++) {
        if (t.cheek === "blade") out += blade(44, 44);
        else if (t.cheek === "bumpy") out += bump(42, 34);
        else out += rect(t.tusk ? 96 : 44, 32, t.tusk ? 7 : 3);
      }
      return out;
    };
    s += row(true) + row(false);
    return `<svg class="mm-teeth" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Teeth">${s}</svg>`;
  }

  /* ---------- habitats ---------- */
  function habitat(k, o = {}) {
    const P = painter(!!o.line); let s = "";
    const sky = P(k === "ice" ? "#cfe9f7" : k === "desert" ? "#ffe2a8" : "#bfe6ff");
    s += `<rect x="0" y="0" width="300" height="200" fill="${sky}"/>`;
    if (k === "desert") s += circ(240, 46, 26, P("#ffcf3f"), { "stroke-width": 4 });
    else s += circ(250, 40, 18, P("#ffd84f"), { "stroke-width": 4 });
    if (k === "river") {
      s += path("M 0 110 Q 150 96 300 112 L 300 200 L 0 200 Z", P("#7cc96b"), { "stroke-width": 4 });
      s += path("M 0 140 Q 80 124 150 142 Q 220 160 300 138 L 300 180 Q 220 196 150 176 Q 80 160 0 178 Z", P("#4aa3df"), { "stroke-width": 4 });
      s += `<path d="M 40 156 q 12 -6 24 0 M 180 162 q 12 -6 24 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      [[24, 120], [36, 112], [262, 118]].forEach(([x, y]) => { s += `<path d="M ${x} ${y + 20} V ${y - 20}" stroke="${INK}" stroke-width="4"/>` + ell(x, y - 26, 6, 13, P("#8a5a3b"), { "stroke-width": 3 }); });
    } else if (k === "forest") {
      s += path("M 0 140 Q 150 128 300 142 L 300 200 L 0 200 Z", P("#6dbb5c"), { "stroke-width": 4 });
      [[50, 1], [130, 1.25], [215, 1.05], [275, 0.85]].forEach(([x, k2]) => { s += `<rect x="${x - 7}" y="${140 - 40 * k2}" width="14" height="${44 * k2}" fill="${P("#8a5a3b")}" stroke="${INK}" stroke-width="4"/>` + path(`M ${x - 40 * k2} ${140 - 34 * k2} L ${x} ${140 - 130 * k2} L ${x + 40 * k2} ${140 - 34 * k2} Z`, P("#2f8f4e"), { "stroke-width": 4 }); });
    } else if (k === "grassland") {
      s += path("M 0 120 Q 150 110 300 124 L 300 200 L 0 200 Z", P("#e8c35a"), { "stroke-width": 4 });
      s += `<path d="M 210 124 V 70" stroke="${INK}" stroke-width="10"/><path d="M 210 124 V 70" stroke="${P("#8a5a3b")}" stroke-width="4"/>` + path("M 150 72 Q 210 40 270 72 Q 210 84 150 72 Z", P("#5aa04a"), { "stroke-width": 4 });
      for (let i = 0; i < 14; i++) { const x = 10 + i * 21, y = 150 + (i % 3) * 14; s += `<path d="M ${x} ${y} l -5 -16 M ${x} ${y} l 0 -20 M ${x} ${y} l 5 -16" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; }
    } else if (k === "meadow") {
      // cool green rolling meadow: wildflowers, a burrow, no trees
      s += path("M 0 112 Q 80 84 170 108 Q 240 92 300 104 L 300 200 L 0 200 Z", P("#9fd77a"), { "stroke-width": 4 });
      s += path("M 0 150 Q 110 128 210 150 Q 260 140 300 146 L 300 200 L 0 200 Z", P("#6fc35a"), { "stroke-width": 4 });
      s += path("M 196 132 Q 214 112 232 132 Z", P("#5a3d2a"), { "stroke-width": 4 });
      [[30, 140, "#ff8fb1"], [74, 172, "#ffffff"], [118, 146, "#ffd84f"], [150, 182, "#c79bff"], [252, 170, "#ff8fb1"], [282, 130, "#ffffff"], [96, 120, "#ffd84f"]].forEach(([x, y, c]) => {
        s += `<path d="M ${x} ${y} v 14" stroke="${INK}" stroke-width="3"/>` + [0, 72, 144, 216, 288].map(d => { const r = d * Math.PI / 180; return circ(x + Math.cos(r) * 5, y + Math.sin(r) * 5, 4.5, P(c), { "stroke-width": 2 }); }).join("") + circ(x, y, 3, P("#ffb02e"), { "stroke-width": 2 });
      });
    } else if (k === "outback") {
      // Australian outback: red earth, a big rock, a gum tree, spiky grass
      s += path("M 0 124 Q 150 116 300 126 L 300 200 L 0 200 Z", P("#d9733b"), { "stroke-width": 4 });
      s += path("M 18 124 Q 22 96 52 92 L 118 92 Q 142 96 146 122 Z", P("#b8502a"), { "stroke-width": 4 });
      s += `<path d="M 240 126 Q 236 96 248 70 M 248 92 Q 262 80 272 70" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M 240 126 Q 236 96 248 70 M 248 92 Q 262 80 272 70" stroke="${P("#f1ece0")}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      s += path("M 214 70 Q 220 44 250 46 Q 282 38 292 62 Q 300 80 274 80 Q 250 88 230 80 Q 206 82 214 70 Z", P("#8fae7a"), { "stroke-width": 4 });
      [[40, 170], [120, 186], [190, 160], [272, 184]].forEach(([x, y]) => { s += `<path d="M ${x} ${y} l -12 -12 M ${x} ${y} l -5 -18 M ${x} ${y} l 3 -18 M ${x} ${y} l 11 -13" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; });
      [[90, 150], [230, 150]].forEach(([x, y]) => { s += ell(x, y, 9, 5, P("#8a3a1e"), { "stroke-width": 3 }); });
    } else if (k === "desert") {
      s += path("M 0 130 Q 70 96 150 128 Q 220 100 300 124 L 300 200 L 0 200 Z", P("#f2c46b"), { "stroke-width": 4 });
      s += path("M 0 168 Q 90 140 180 170 Q 240 150 300 166 L 300 200 L 0 200 Z", P("#e8ad4f"), { "stroke-width": 4 });
      [[60, 182], [230, 150]].forEach(([x, y]) => { s += ell(x, y, 10, 6, P("#c79a5a"), { "stroke-width": 3 }); });
    } else if (k === "ice") {
      s += `<rect x="0" y="120" width="300" height="80" fill="${P("#5aaee0")}" stroke="${INK}" stroke-width="4"/>`;
      s += path("M 0 112 L 140 108 L 150 140 L 0 146 Z", P("#ffffff"), { "stroke-width": 4 }) + path("M 180 128 L 280 122 L 290 150 L 176 154 Z", P("#ffffff"), { "stroke-width": 4 });
      s += path("M 30 112 L 60 60 L 96 110 Z", P("#eef8ff"), { "stroke-width": 4 });
      [[40, 30], [120, 50], [200, 24], [160, 80]].forEach(([x, y]) => { s += `<path d="M ${x - 5} ${y} h 10 M ${x} ${y - 5} v 10" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`; });
    }
    return `<svg class="mm-hab" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${HAB_NAMES[k] || HAB_NAMES.grassland}">${s}</svg>`;
  }
  const HAB_NAMES = { river: "River", forest: "Forest", grassland: "Grassland", desert: "Desert", ice: "Ice and snow" };

  /* ---------- foods and small icons ---------- */
  const fish = (x, y, k = 1) => path(`M ${x - 40 * k} ${y} Q ${x - 10 * k} ${y - 26 * k} ${x + 22 * k} ${y} Q ${x - 10 * k} ${y + 26 * k} ${x - 40 * k} ${y} Z`, "#7fb6e8", { "stroke-width": 4 }) + path(`M ${x + 20 * k} ${y} L ${x + 42 * k} ${y - 16 * k} L ${x + 42 * k} ${y + 16 * k} Z`, "#7fb6e8", { "stroke-width": 4 }) + `<circle cx="${x - 26 * k}" cy="${y - 4 * k}" r="${4 * k}" fill="${INK}"/>`;
  const leaf = (x, y, k = 1) => path(`M ${x - 34 * k} ${y + 22 * k} Q ${x - 30 * k} ${y - 30 * k} ${x + 34 * k} ${y - 26 * k} Q ${x + 24 * k} ${y + 30 * k} ${x - 34 * k} ${y + 22 * k} Z`, "#6fc35a", { "stroke-width": 4 }) + `<path d="M ${x - 34 * k} ${y + 22 * k} Q ${x} ${y} ${x + 26 * k} ${y - 18 * k}" stroke="${INK}" stroke-width="3" fill="none"/>`;
  function food(k) {
    let s = "";
    if (k === "meat") s = fish(100, 70, 1.3);
    else if (k === "plants") s = leaf(100, 70, 1.3);
    else s = fish(66, 64, 0.95) + leaf(140, 84, 0.85);
    return `<svg class="mm-food" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }

  function icon(k) {
    const S = (inner, vb = "0 0 100 100") => `<svg class="mm-ic" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
    switch (k) {
      case "glass": return S(circ(42, 42, 26, "#cfefff", { "stroke-width": 7 }) + `<path d="M 61 61 L 86 86" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M 30 34 Q 36 26 46 26" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      case "speaker": return S(path("M 16 38 H 34 L 54 20 V 80 L 34 62 H 16 Z", "#ffd23f", { "stroke-width": 6 }) + `<path d="M 66 34 Q 78 50 66 66 M 76 24 Q 96 50 76 76" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`);
      case "home": return S(path("M 14 50 L 50 18 L 86 50 L 76 50 L 76 84 L 24 84 L 24 50 Z", "#ff9f6b", { "stroke-width": 6 }) + `<rect x="42" y="58" width="16" height="26" fill="#ffd23f" stroke="${INK}" stroke-width="5"/>`);
      case "back": return S(path("M 62 18 L 28 50 L 62 82", "none", { "stroke-width": 12 }));
      case "next": return S(path("M 38 18 L 72 50 L 38 82", "none", { "stroke-width": 12 }));
      case "star": return S(path("M 50 8 L 62 36 L 92 38 L 68 58 L 76 88 L 50 72 L 24 88 L 32 58 L 8 38 L 38 36 Z", "#ffd23f", { "stroke-width": 6 }));
      case "folder": return S(path("M 10 26 H 40 L 48 34 H 90 V 84 H 10 Z", "#f2c46b", { "stroke-width": 6 }) + `<rect x="22" y="44" width="56" height="8" rx="3" fill="#fff" stroke="${INK}" stroke-width="3"/>`);
      case "tree": return S(`<path d="M 50 92 V 66 M 50 66 L 24 40 M 50 66 L 76 40 M 24 40 L 12 18 M 24 40 L 36 18 M 76 40 L 64 18 M 76 40 L 88 18" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>` + [12, 36, 64, 88].map(x => circ(x, 14, 8, "#7ccf68", { "stroke-width": 4 })).join(""));
      case "replay": return S(`<path d="M 76 50 A 26 26 0 1 1 64 28" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>` + path("M 56 14 L 80 26 L 60 42 Z", INK, { "stroke-width": 3 }));
      case "print": return S(`<rect x="24" y="12" width="52" height="28" fill="#fff" stroke="${INK}" stroke-width="6"/><rect x="10" y="38" width="80" height="34" rx="8" fill="#a47bff" stroke="${INK}" stroke-width="6"/><rect x="24" y="60" width="52" height="28" fill="#fff" stroke="${INK}" stroke-width="6"/>`);
      case "hat": return S(path("M 10 64 Q 50 74 90 64 Q 84 56 72 56 Q 70 26 50 24 Q 30 26 28 56 Q 16 56 10 64 Z", "#8a6440", { "stroke-width": 6 }) + `<path d="M 30 50 Q 50 56 70 50" stroke="${INK}" stroke-width="5" fill="none"/>`);
      case "crayon": return S(`<g transform="rotate(35 50 50)">` + path("M 38 22 L 50 2 L 62 22 Z", "#ff5fa2", { "stroke-width": 5 }) + `<rect x="38" y="22" width="24" height="70" rx="5" fill="#ff5fa2" stroke="${INK}" stroke-width="5"/><rect x="38" y="40" width="24" height="14" fill="#fff" stroke="${INK}" stroke-width="4"/></g>`);
      case "gear": return S(circ(50, 50, 26, "#c9c5cf", { "stroke-width": 6 }) + circ(50, 50, 9, "#fff", { "stroke-width": 5 }) + [0, 45, 90, 135, 180, 225, 270, 315].map(d => `<rect x="44" y="10" width="12" height="14" rx="3" fill="${INK}" transform="rotate(${d} 50 50)"/>`).join(""));
    }
    return "";
  }

  /* ---------- Detective Ollie: an otter in a detective hat ---------- */
  function detective(line) {
    const P = painter(!!line);
    const otter = layers("otter", !!line).filter(l => l.head).map(l => `<g>${l.s}</g>`).join("");
    const { hx, hy, hr } = A.otter.L;
    const hat = path(`M ${hx - hr * 1.15} ${hy - hr * 0.55} Q ${hx} ${hy - hr * 0.3} ${hx + hr * 1.15} ${hy - hr * 0.55} Q ${hx + hr * 0.95} ${hy - hr * 0.78} ${hx + hr * 0.72} ${hy - hr * 0.72} Q ${hx + hr * 0.6} ${hy - hr * 1.45} ${hx} ${hy - hr * 1.5} Q ${hx - hr * 0.6} ${hy - hr * 1.45} ${hx - hr * 0.72} ${hy - hr * 0.72} Q ${hx - hr * 0.95} ${hy - hr * 0.78} ${hx - hr * 1.15} ${hy - hr * 0.55} Z`, P("#8a6440")) +
      `<path d="M ${r1(hx - hr * 0.72)} ${r1(hy - hr * 0.86)} Q ${hx} ${r1(hy - hr * 0.66)} ${r1(hx + hr * 0.72)} ${r1(hy - hr * 0.86)}" stroke="${INK}" stroke-width="10" fill="none"/><path d="M ${r1(hx - hr * 0.72)} ${r1(hy - hr * 0.86)} Q ${hx} ${r1(hy - hr * 0.66)} ${r1(hx + hr * 0.72)} ${r1(hy - hr * 0.86)}" stroke="${P("#ff5fa2")}" stroke-width="5" fill="none"/>`;
    const glass = `<g transform="translate(${r1(hx + hr * 0.75)} ${r1(hy + hr * 0.55)}) rotate(-20)">` + `<path d="M 10 30 L 30 70" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M 10 30 L 30 70" stroke="${P("#8a6440")}" stroke-width="8" stroke-linecap="round"/>` + circ(0, 0, 30, P("rgba(207,239,255,.75)"), { "stroke-width": 7 }) + `</g>`;
    return `<svg class="mm-ollie" viewBox="${r1(hx - hr * 1.5)} ${r1(hy - hr * 1.7)} ${r1(hr * 3.4)} ${r1(hr * 3.2)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Detective Ollie, an otter in a detective hat">${otter}${hat}${glass}</svg>`;
  }

  window.MM_ART = { SPEC: A, NAMES, TEETH, HAB_NAMES, animal, partOnly, box, teeth, habitat, food, icon, detective, headBox };
})();
