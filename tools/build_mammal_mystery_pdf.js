/* Rebuilds assets/mammal-mystery-coloring-sheets.pdf from mammal-mystery-coloring.html.
   Needs Node and Playwright (npm i -D playwright, then npx playwright install chromium).
   Run from the repository root:   node tools/build_mammal_mystery_pdf.js
   Optional: MM_FONT=/path/to/Fredoka.ttf uses a local copy of the Fredoka font instead of Google Fonts. */
const path = require("path"), fs = require("fs"), http = require("http");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
server.listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  if (process.env.MM_FONT) {
    const ttf = fs.readFileSync(process.env.MM_FONT);
    await page.route("https://fonts.googleapis.com/**", r => r.fulfill({ contentType: "text/css", body: "@font-face{font-family:Fredoka;font-weight:300 700;src:url(https://fonts.gstatic.com/local-fredoka.ttf) format('truetype');}" }));
    await page.route("https://fonts.gstatic.com/**", r => r.fulfill({ contentType: "font/ttf", body: ttf }));
  }
  await page.goto(`http://localhost:${port}/mammal-mystery-coloring.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(root, "assets", "mammal-mystery-coloring-sheets.pdf");
  await page.pdf({ path: out, format: "Letter", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close(); server.close();
  console.log("Wrote " + path.relative(root, out));
});
