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
                L: { hx: 200, hy: 150, hr: 72, bx: 200, by: 285, brx: 86, bry: 80 } },
    fox:      { plan: "sit", fur: "#e8742f", belly: "#fff6ea", muzzle: "#fff6ea", paw: "#3a2a2a", leg: "#3a2a2a", ears: "point", earIn: "#3a2a2a", earSize: 1.25, tail: "bushy", tailTip: "#fff6ea", whisk: true, claws: true, head: "fox",
                L: { hx: 200, hy: 155, hr: 68, bx: 200, by: 288, brx: 76, bry: 80 } },
    lion:     { plan: "sit", fur: "#e0a845", belly: "#f2cf87", muzzle: "#f7e2b5", paw: "#e0a845", ears: "round", earIn: "#b87a2a", earSize: 0.7, tail: "tuft", tuft: "#6b3510", mane: "#a8571e", whisk: true,
                L: { hx: 200, hy: 148, hr: 64, bx: 200, by: 285, brx: 86, bry: 82 } },
    polarbear:{ plan: "sit", fur: "#f4f1e6", belly: "#e8e1cb", muzzle: "#fbfaf4", paw: "#ebe6d6", ears: "small", tail: "stub", claws: true, bigPaws: true,
                L: { hx: 200, hy: 145, hr: 66, bx: 200, by: 280, brx: 96, bry: 88 } },
    panda:    { plan: "sit", fur: "#f7f7f2", belly: "#f7f7f2", muzzle: "#ffffff", paw: INK, leg: INK, ears: "round", earColor: INK, earIn: INK, tail: "stub", patches: true, band: true, claws: false,
                L: { hx: 200, hy: 145, hr: 70, bx: 200, by: 282, brx: 94, bry: 86 } },
    meerkat:  { plan: "sit", fur: "#c9a37a", belly: "#ecd8ba", muzzle: "#ecd8ba", paw: "#8a6a4a", ears: "crescent", earColor: "#4a3a30", tail: "thin", tuft: "#3a2a20", patches: true, patchColor: "#5a4636", pawsUp: true, claws: true, head: "fox",
                L: { hx: 200, hy: 112, hr: 50, bx: 200, by: 262, brx: 58, bry: 108 } },
    rabbit:   { plan: "sit", fur: "#b88d6a", belly: "#efe0cf", muzzle: "#f3e7da", paw: "#efe0cf", ears: "long", earIn: "#f3b7b7", tail: "puff", tailColor: "#ffffff", whisk: true, buckTeeth: true,
                L: { hx: 200, hy: 175, hr: 60, bx: 200, by: 295, brx: 84, bry: 74 } },
    kangaroo: { plan: "sit", fur: "#c27a4a", belly: "#ecc7a2", muzzle: "#ecc7a2", paw: "#8a5230", ears: "tall", earIn: "#ecc7a2", tail: "roo", bigFeet: true, pouch: true, pawsUp: true, claws: true, head: "fox",
                neckUp: true,
                L: { hx: 200, hy: 90, hr: 46, bx: 196, by: 270, brx: 74, bry: 98 } },
    elephant: { plan: "stand", fur: "#9aa1ae", belly: "#9aa1ae", ears: "elephant", earIn: "#d9a8b5", trunk: true, tusks: true, feet: "feet", tail: "tuft", tuft: INK, nose: "none", mouth: false,
                L: { hx: 118, hy: 168, hr: 62, bx: 248, by: 238, brx: 118, bry: 82, legW: 40, legDark: "#878d9a" } },
    giraffe:  { plan: "stand", fur: "#f2c062", belly: "#f6d48c", muzzle: "#f6d48c", ears: "leaf", earIn: "#f6d48c", horns: true, neck: "giraffe", spots: "#b86a2b", feet: "hooves", tail: "tuft", tuft: "#4a2a10", nose: "dots", maneColor: "#b86a2b",
                L: { hx: 102, hy: 76, hr: 36, bx: 258, by: 236, brx: 92, bry: 52, legW: 20, legDark: "#e2ab4a" } },
    camel:    { plan: "stand", fur: "#d4a66a", belly: "#e5c290", muzzle: "#e5c290", ears: "small", hump: true, neck: "camel", feet: "pads", tail: "tuft", tuft: "#7a5530", nose: "dots",
                L: { hx: 96, hy: 132, hr: 38, bx: 252, by: 238, brx: 100, bry: 60, legW: 24, legDark: "#c0935a" } },
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

  /* ---------- public: draw an animal ---------- */
  const cache = {};
  function layers(id, line) {
    const key = id + (line ? ":l" : "");
    if (!cache[key]) { const a = A[id]; const P = painter(line); cache[key] = a.plan === "stand" ? stand(a, P) : sit(a, P); }
    return cache[key];
  }
  function headBox(id) {
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
