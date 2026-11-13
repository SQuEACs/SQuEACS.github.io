# The SQuEACs Lab website

Study of Quantitative Evolution and Anatomy in Carnivorans, Midwestern University.

## Files

| File | What to edit there |
|---|---|
| `index.html` | All page text: research, publications, people, contact |
| `styles.css` | Colors (top of file), fonts, layout |
| `script.js` | The 3D model list (`MODELS` at the top) |
| `models/` | Your `.glb` 3D model files |
| `cv/Lynch_CV.pdf` | Replace with your latest CV, same file name |

## Publish on GitHub Pages

1. Create a repository on your lab GitHub account (for example `squeacs-lab.github.io`, or any name).
2. Upload every file and folder here to the repository root.
3. In the repository, open **Settings → Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save.
4. The site goes live within a few minutes at the address GitHub shows.
5. For your own domain, enter it under **Settings → Pages → Custom domain** and add the DNS records GitHub lists.

## Add a 3D model

1. On Sketchfab, open your model → **Edit Properties → Download** and save the **glTF / .glb** version.
2. Rename it to match a slot in `script.js` (for example `models/otter-endocast.glb`) or add a new line to `MODELS`.
3. Upload it to the `models/` folder. The slot switches from a placeholder to an interactive viewer automatically.

GitHub rejects files over 100 MB. Keep each model under about 25 MB for fast loading (decimate meshes in MeshLab, Blender, or 3D Slicer first).

## Add a publication

Copy one `<li class="pub" ...>` block in `index.html`, paste it under the right year, and edit the text. Set `data-topic` to `evo`, `imaging`, or `clinical` so the filter buttons work.

## Preview locally

The 3D viewer needs a web server, not a double-clicked file. In this folder run:

```
python3 -m http.server
```

then open http://localhost:8000.

## View counts

The site records how often visitors view each 3D model in a Google Sheet that you own. No outside service, no cookies, and no personal data.

**Set up (about 5 minutes, once):**

1. Create a new Google Sheet, for example "SQuEACs model views".
2. In the Sheet, open **Extensions → Apps Script**. Delete the starter code, paste in everything from `counter/Code.gs`, and save.
3. In the toolbar, choose the `setup` function and click **Run**. Approve the access request (it only touches this Sheet).
4. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* **Me** and *Who has access* **Anyone**, then **Deploy**. Copy the Web app URL (it ends in `/exec`).
5. Paste that URL into `const COUNTER_URL = "";` at the top of the view-count section in `script.js`, and upload the changed file.

**Reading the report:**

| Sheet tab | What it shows |
|---|---|
| Summary | Views and rotations per model, by month, plus all-time totals and site visits |
| Labels | Which structures visitors select most |
| Log | One row per event (timestamp, month, event, model, label) |

You can also open the Web app URL in a browser for a quick text summary.

What counts as what: **view** = the model finished loading on a visitor's screen; **rotate** = the visitor turned or zoomed it (once per visit); **label** = the visitor selected a structure; **page** = a site visit. New models you add to `MODELS` are counted automatically, named after the .glb file.

Anyone who finds the URL could send fake events, so treat the numbers as a good estimate rather than an audit.

## License and credits

**Code.** The website source code (HTML, CSS, JavaScript, and the scripts in `counter/` and `tools/`) is released under the [MIT License](LICENSE).

**Content.** All other material is © its creators, all rights reserved, unless noted below. This includes the site text, the CV, photographs of lab members, and the specimen images.

- Skull and endocast CT rendering on the home page: Dominik Valdez.
- Inner ear figure: from Jones, H., et al. 2026. *Biological Journal of the Linnean Society* 149(2). https://doi.org/10.1093/biolinnean/blag081
- 3D models: *Lithobates heckscheri* CNS by Megan Hostetter; *Procyon lotor* endocast by Angela Boyer. Specimens from the University of Florida and Midwestern University ARCIVES.
- Species photographs load from Wikimedia Commons and are not stored here. Each is credited on the page with its photographer and license.
- Species facts summarize the IUCN Red List and the University of Michigan Animal Diversity Web, cited on each card.
