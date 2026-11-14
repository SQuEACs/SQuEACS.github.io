/* ============================================================
   OFFLINE SUPPORT for the games (Tadpole Trek, its classroom
   edition, and Otter Evolution) when installed on a tablet's
   home screen.

   - Game pages: always try the internet first, so tablets get
     updates whenever they are online; use the saved copy offline.
   - Everything else (scripts, styles, models, fonts): use the saved
     copy right away and refresh it in the background.

   When you rename or add a file the games need, add it to CORE
   below and bump VERSION. Bumping ?v= on a script or stylesheet
   without updating this list still works: the old saved copy is
   used offline until the tablet next opens the game online.
   ============================================================ */
const VERSION = "games-v1";

const CORE = [
  "tadpole-game.html",
  "tadpole-classroom.html",
  "otter-game.html",
  "tadpole-trek-science.html",
  "otter-evolution-science.html",
  "tadpole-teachers.html",
  "styles.css?v=40",
  "script.js?v=9",
  "tadpole-game.js?v=15",
  "otter-game.js?v=43",
  "assets/vendor/three-r149.min.js?v=1",
  "models/tadpole-cns.glb",
  "favicon.svg",
  "favicon-32.png",
  "apple-touch-icon.png",
  "tadpole-trek.webmanifest",
  "tadpole-classroom.webmanifest",
  "otter-evolution.webmanifest",
  "assets/app/tadpole-trek-192.png",
  "assets/app/tadpole-trek-512.png",
  "assets/app/tadpole-classroom-192.png",
  "assets/app/tadpole-classroom-512.png",
  "assets/app/otter-evolution-192.png",
  "assets/app/otter-evolution-512.png"
];

// From other sites. Saved if reachable; the games still run without them.
const EXTRA = [
  "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    await Promise.all(EXTRA.map((url) =>
      fetch(url, { mode: "cors" }).then((r) => r.ok && cache.put(url, r)).catch(() => {})
    ));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function fromCache(request) {
  const cache = await caches.open(VERSION);
  return (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
}

async function save(request, response) {
  if (response && (response.ok || response.type === "opaque")) {
    const cache = await caches.open(VERSION);
    await cache.put(request, response.clone());
  }
  return response;
}

const OFFLINE_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0a10;color:#efeaf6;font:18px/1.5 system-ui,sans-serif;text-align:center;padding:24px}
a{display:inline-block;margin:8px;padding:12px 20px;border-radius:999px;background:#a47bff;color:#0b0a10;font-weight:700;text-decoration:none}</style></head>
<body><div><h1>This page needs the internet</h1><p>The games work offline:</p>
<a href="tadpole-game.html">Tadpole Trek</a><a href="otter-game.html">Otter Evolution</a></div></body></html>`;

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;   // e.g. the lab's play counter: leave it alone

  // Pages: internet first (so updates arrive), saved copy when offline.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await save(request, await fetch(request));
      } catch (e) {
        return (await fromCache(request)) ||
          new Response(OFFLINE_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })());
    return;
  }

  // Everything else: saved copy right away, refreshed in the background.
  // A new ?v= version is fetched first; an older saved version is used only offline.
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const exact = await cache.match(request);
    const fresh = fetch(request).then((r) => save(request, r)).catch(() => null);
    if (exact) { event.waitUntil(fresh); return exact; }
    return (await fresh) || (await fromCache(request)) || Response.error();
  })());
});
