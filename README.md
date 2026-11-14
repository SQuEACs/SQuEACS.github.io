# The SQuEACs Lab website

Study of Quantitative Evolution and Anatomy in Carnivorans, Midwestern University. Live at **https://squeacs.github.io**.

The site is plain HTML, CSS, and JavaScript. There is no build step: what is in the repository is exactly what visitors get.

## How it goes live

GitHub Pages serves the `main` branch from the repository root (**Settings → Pages**, "Deploy from a branch", `main`, `/ (root)`). Any change merged or pushed to `main` is live within a few minutes. To try a change first, make it on a separate branch and open a pull request.

## Preview locally

The 3D viewer and the games need a web server, not a double-clicked file. In this folder run:

```
python3 -m http.server
```

then open http://localhost:8000.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: overview, the games, the species and systems we study |
| `research.html` | Research projects, by system (brain, skull, inner ear, limb, human anatomy, methods) |
| `publications.html` | Publications by year, with topic filters |
| `people.html` | Lab members |
| `collaborators.html` | Collaborators |
| `funding.html` | Funding |
| `models.html` | Interactive 3D models |
| `open-science.html` | Open science and data |
| `teaching.html` | Teaching |
| `contact.html` | Contact |
| `otter-game.html`, `otter-game.js` | Otter Evolution game |
| `otter-evolution-science.html` | The science behind Otter Evolution |
| `tadpole-game.html`, `tadpole-game.js` | Tadpole Trek game |
| `tadpole-trek-science.html` | The science behind Tadpole Trek |
| `tadpole-classroom.html` | Tadpole Trek classroom edition (unlisted) |
| `tadpole-teachers.html` | Tadpole Trek teacher guide (unlisted) |
| `tadpole-worksheets.html` | Printable Tadpole Trek worksheets (unlisted) |
| `mammal-mystery.html` | Mammal Mystery, the pre-K to 2nd grade detective game (shared files: `mammal-mystery-art.js`, `-data.js`, `.js`, `.css`) |
| `mammal-mystery-classroom.html` | Mammal Mystery classroom edition (unlisted) |
| `mammal-mystery-teachers.html` | Mammal Mystery teacher guide |
| `mammal-mystery-coloring.html` | Printable source for the Mammal Mystery coloring PDF (rebuild with `tools/build_mammal_mystery_pdf.js`) |
| `tablet-install.html` | QR codes and steps to put the games on an iPad or Fire tablet (unlisted) |
| `mystery/` | Short link that forwards to Mammal Mystery |

The unlisted classroom pages carry a `noindex` tag so search engines skip them. Share their links directly with teachers.

## Other files

| File or folder | What it is |
|---|---|
| `styles.css` | Colors (top of file), fonts, and layout for every page |
| `script.js` | Shared page behavior, the 3D model list (`MODELS`), and the view counter |
| `models/` | The `.glb` 3D model files |
| `assets/` | Photos, figures, game preview images; `assets/vendor/` holds three.js (r149, used by the games) |
| `cv/Lynch_CV.pdf` | Dr. Lynch's CV. Replace it with the latest version under the same file name |
| `counter/Code.gs` | Google Apps Script for the view counter (see below) |
| `tools/` | Python scripts for preparing new 3D models (see below) |
| `sitemap.xml`, `robots.txt` | Help search engines find the public pages |
| `googleb2d71b5d6eddac78.html` | Google Search Console verification. Leave it in place |
| `favicon.*`, `apple-touch-icon.png`, `icon-512.png` | Site icons |
| `sw.js` | Offline support for the games on tablets. Add new game files to `CORE` and bump `VERSION` |
| `*.webmanifest`, `assets/app/` | Home screen names and icons for each game |
| `assets/qr/` | QR codes for `tablet-install.html` (made with the Python `segno` package) |
| `assets/mammal-mystery/photos/` | Openly licensed animal photos for Mammal Mystery, with credits in `mammal-mystery-data.js` |
| `CLAUDE.md` | Working notes, including the rule that game changes also go into the classroom editions |

## Common edits

**Change page text.** Open the page's `.html` file and edit the text directly. Each page has its own copy of the header menu and footer, so a change to the menu (for example, adding a page) has to be made in every `.html` file.

**Add a publication.** In `publications.html`, copy one `<li class="pub" ...>` block, paste it under the right year, and edit the text. Set `data-topic` to `evo` (Evolution & morphology), `imaging` (Imaging & methods), or `clinical` (Human anatomy) so the filter buttons work.

**Add a lab member.** In `people.html`, copy an existing person's block and edit it. Put their photo in `assets/` (a square JPG around 400 px wide keeps the page fast).

**Add a new page.** Copy an existing page such as `teaching.html` so the header, menu, and footer come with it. Add a link to it in the menu of every page, and add its address to `sitemap.xml`.

**Make sure visitors see your changes.** Pages load `styles.css?v=40`, `script.js?v=9`, and the game scripts with a version number like this. Browsers keep old copies of these files, so after editing one, raise its number by one in every `.html` file that loads it (search the folder for `styles.css?v=` to find them all).

## Add a 3D model

The gallery on `models.html` is built from the `MODELS` list near the top of `script.js` and shown with Google's `<model-viewer>` (loaded from unpkg in `models.html`). Each entry has a `file`, `title`, `specimen` name, `caption`, and optionally an opening `view` and numbered `labels`. The two current models show the full format.

**From Sketchfab (simplest).** Open your model on Sketchfab, choose **Edit Properties → Download**, and save the **glTF / .glb** version. Put it in `models/` and add an entry to `MODELS`. A model with no `labels` still gets an interactive viewer.

**With labels, from a colored mesh.** The scripts in `tools/` turn a colored `.obj` mesh and its Sketchfab annotation positions into a web-sized `.glb` and a list of label positions to paste into `MODELS`. They need Python with `numpy`, `scipy`, `trimesh`, and `fast_simplification`.

```
python3 tools/load_obj.py mesh.obj mesh.npz
python3 tools/build_model.py mesh.npz labels.json models/new-model.glb new-model-labels.json 200000 zup_dorsal
```

`labels.json` holds `{"labels": [[name, x, y, z], ...]}` in Sketchfab coordinates. `tools/pending-labels.json` already holds these for four models not yet on the site: the *Taxidea*, *Martes*, and *Pekania* endocasts and a *Lontra* skull.

GitHub rejects files over 100 MB. Keep each model under about 25 MB for fast loading (decimate meshes in MeshLab, Blender, or 3D Slicer first, or lower the face count passed to `build_model.py`).

## View counts

The site records how often visitors view each 3D model in a Google Sheet that the lab owns. No outside service, no cookies, and no personal data. The counter is already set up: its web app address is `COUNTER_URL` at the top of `script.js`.

**Reading the report** (in the Google Sheet):

| Sheet tab | What it shows |
|---|---|
| Summary | Views and rotations per model, by month, plus all-time totals and site visits |
| Labels | Which structures visitors select most |
| Log | One row per event (timestamp, month, event, model, label) |

You can also open the `COUNTER_URL` address in a browser for a quick text summary.

What counts as what: **view** = the model finished loading on a visitor's screen; **rotate** = the visitor turned or zoomed it (once per visit); **label** = the visitor selected a structure; **page** = a site visit. New models added to `MODELS` are counted automatically, named after the .glb file.

Anyone who finds the address could send fake events, so treat the numbers as a good estimate rather than an audit.

**Setting it up again** (only if you need a new Sheet):

1. Create a new Google Sheet, for example "SQuEACs model views".
2. In the Sheet, open **Extensions → Apps Script**. Delete the starter code, paste in everything from `counter/Code.gs`, and save.
3. In the toolbar, choose the `setup` function and click **Run**. Approve the access request (it only touches this Sheet).
4. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* **Me** and *Who has access* **Anyone**, then **Deploy**. Copy the Web app URL (it ends in `/exec`).
5. Paste that URL into `COUNTER_URL` at the top of `script.js`, and raise the `script.js?v=` number on every page.

## Custom domain

The site uses the free `squeacs.github.io` address. To use your own domain, enter it under **Settings → Pages → Custom domain** and add the DNS records GitHub lists. Then update the addresses in `sitemap.xml`, `robots.txt`, and the `canonical` and `og:` tags at the top of each page.

## License and credits

**Code.** The website source code (HTML, CSS, JavaScript, and the scripts in `counter/` and `tools/`) is released under the [MIT License](LICENSE). three.js is © the three.js authors, MIT License (`assets/vendor/three-LICENSE.txt`).

**Content.** All other material is © its creators, all rights reserved, unless noted below. This includes the site text, the CV, photographs of lab members, and the specimen images.

- Skull and endocast CT rendering on the home page: Dominik Valdez.
- Inner ear figure: from Jones, H., et al. 2026. *Biological Journal of the Linnean Society* 149(2). https://doi.org/10.1093/biolinnean/blag081
- 3D models: *Lithobates heckscheri* CNS by Megan Hostetter; *Procyon lotor* endocast by Angela Boyer. Specimens from the University of Florida and Midwestern University ARCIVES.
- Species photographs load from Wikimedia Commons and are not stored here. Each is credited on the page with its photographer and license.
- Species facts summarize the IUCN Red List and the University of Michigan Animal Diversity Web, cited on each card.
