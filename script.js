/* ============================================================
   VIEW COUNTS (lab's own counter, saved to a Google Sheet)
   Paste the Web app URL from counter/Code.gs here (see README).
   Leave it empty to turn counting off.
   ============================================================ */
const COUNTER_URL = "https://script.google.com/macros/s/AKfycbwX39W08Ex43gFEn0304uEZ386CL40Azq_WrvVnqJ6Faic6dcPQ8u9J7pmzw4o6awcn/exec";

// Sends one event to the lab's Sheet. Fire-and-forget; never blocks the page.
function track(event, model, label) {
  if (!COUNTER_URL) return;
  try {
    fetch(COUNTER_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ event, model: model || "", label: label || "" })
    }).catch(() => {});
  } catch (e) { /* counting is optional */ }
}

window.SQ_track = track;

function slug(file) { return file.replace(/^.*\//, "").replace(/\.glb$/, ""); }

// Per model: "view" = the model finished loading on screen; "rotate" = a visitor
// turned or zoomed it (once per visit); "label" = a visitor selected a structure.
function trackModel(fig, m) {
  const mv = fig.querySelector("model-viewer");
  const id = slug(m.file);
  let interacted = false;
  mv.addEventListener("load", () => track("view", id), { once: true });
  mv.addEventListener("camera-change", e => {
    if (interacted || e.detail.source !== "user-interaction") return;
    interacted = true;
    track("rotate", id);
  });
}

/* ============================================================
   3D MODEL GALLERY
   Edit this list to add, remove, or rename models.
   Put each .glb file in the /models folder with the same name.
   ============================================================ */
const MODELS = [
  {
    file: "models/tadpole-cns.glb",
    title: "Tadpole central nervous system",
    specimen: "Lithobates heckscheri",
    caption: "Brain, spinal cord, and spinal and cranial nerves from microCT of a tadpole stained with buffered Lugol's iodine. Scanned at the University of Florida Nanoscale Research Facility and segmented in AVIZO. Model by Megan Hostetter.",
    wide: true,
    // Opening view: the brain, seen from the left and above. "Whole CNS" zooms out to the full specimen.
    view: { orbit: "62deg 58deg 26m", target: "0m 1.6m 19.5m", zoom: "14m", homeLabel: "Brain", fullLabel: "Whole CNS" },
    // Numbered labels, matching the Sketchfab annotations. pos/normal are in model coordinates.
    labels: [
    { n:  1, name: "Olfactory Bulb", color: "#ff00e4", pos: "-0.358m 2.235m 23.475m", normal: "0.199m 0.921m 0.336m" },
    { n:  2, name: "Telencephalon", color: "#ff5900", pos: "0.070m 2.869m 21.718m", normal: "0.046m 0.998m 0.052m" },
    { n:  3, name: "Diencephalon", color: "#ffbf00", pos: "0.469m 2.610m 20.030m", normal: "0.752m 0.659m 0.003m" },
    { n:  4, name: "Ephiphysis Cerebri (Pineal Body)", color: "#ffbf00", pos: "-0.480m 2.825m 20.174m", normal: "-0.255m 0.949m 0.185m" },
    { n:  5, name: "Paraphysis Cerebri", color: "#00ffa1", pos: "-0.584m 2.511m 20.927m", normal: "-0.047m 0.910m -0.411m" },
    { n:  6, name: "Optic Tectum", color: "#36ff00", pos: "0.818m 3.227m 18.702m", normal: "0.083m 0.968m 0.237m" },
    { n:  7, name: "Cerebellum", color: "#00b1ff", pos: "-0.066m 2.702m 16.885m", normal: "-0.165m 0.984m 0.072m" },
    { n:  8, name: "Choroid Process of the Fourth Ventricle", color: "#cfa8f6", pos: "0.135m 2.665m 15.672m", normal: "-0.059m 0.978m 0.199m" },
    { n:  9, name: "Fourth Ventricle", color: "#8300ff", pos: "0.313m 1.659m 14.400m", normal: "-0.780m 0.621m -0.073m" },
    { n: 10, name: "Medulla Oblongata", color: "#8300ff", pos: "-0.439m 2.115m 14.415m", normal: "-0.708m 0.572m -0.413m" },
    { n: 11, name: "Preoptic Area", color: "#ffbf00", pos: "-0.519m 0.287m 20.996m", normal: "-0.028m -0.896m 0.443m" },
    { n: 12, name: "Optic Chiasm", color: "#ffbd00", pos: "-0.390m 0.251m 20.116m", normal: "-0.006m -0.910m -0.415m" },
    { n: 13, name: "Infundibulum", color: "#00fff2", pos: "-0.456m -0.005m 19.396m", normal: "-0.248m -0.968m 0.047m" },
    { n: 14, name: "Hypophysis Cerebri", color: "#00fff2", pos: "-0.235m 0.141m 18.220m", normal: "0.085m -0.900m -0.427m" },
    { n: 15, name: "CN IX, X, XI, and XII", color: "#ff0014", pos: "-1.444m 1.436m 15.470m", normal: "0.010m -0.966m 0.259m" },
    { n: 16, name: "CN V, VII, VIII", color: "#ff0014", pos: "-1.403m 0.991m 16.850m", normal: "0.867m -0.479m -0.137m" },
    { n: 17, name: "CN VI", color: "#ff0014", pos: "-0.481m 0.740m 16.064m", normal: "0.072m -0.997m 0.036m" },
    { n: 18, name: "CN III, and IV", color: "#ff0014", pos: "-1.530m 0.867m 18.865m", normal: "0.119m -0.888m -0.444m" },
    { n: 19, name: "CN II", color: "#ff0014", pos: "-2.262m 0.678m 20.505m", normal: "-0.188m -0.936m 0.297m" },
    { n: 20, name: "CN I", color: "#ff0014", pos: "-1.653m 1.461m 24.747m", normal: "0.231m -0.930m -0.285m" }
    ]
  },
  {
    file: "models/procyon-endocast.glb",
    title: "Raccoon endocast anatomy",
    specimen: "Procyon lotor",
    caption: "Virtual endocast with gyri colored and labeled on one hemisphere and sulci on the other. Built from micro-CT of a Midwestern University ARCIVES specimen and segmented in Avizo 2022.2. Model by Angela Boyer.",
    wide: true,
    // Opening view: left side and slightly above, showing the labeled gyri.
    view: { orbit: "25deg 65deg auto", zoom: "40m", homeLabel: "Reset view" },
    labels: [
    { n:  1, name: "Olfactory bulb", color: "#ff8800", pos: "-32.704m -12.443m -0.133m", normal: "-0.790m -0.239m 0.565m" },
    { n:  2, name: "Proreal gyrus", color: "#ff0011", pos: "-23.264m -1.503m 2.275m", normal: "-0.717m 0.327m 0.615m" },
    { n:  3, name: "Orbital gyrus", color: "#833338", pos: "-20.135m -6.688m 6.625m", normal: "-0.633m -0.064m 0.771m" },
    { n:  4, name: "Rhinal fissure", color: "#a670db", pos: "-18.542m -12.530m 5.475m", normal: "-0.158m -0.321m 0.934m" },
    { n:  5, name: "Anterior sigmoid gyrus", color: "#eb96e9", pos: "-18.646m 0.892m 11.405m", normal: "-0.787m 0.610m 0.092m" },
    { n:  6, name: "Post cruciate gyrus", color: "#0400ff", pos: "-10.003m 12.345m 4.362m", normal: "-0.452m 0.868m 0.205m" },
    { n:  7, name: "Lateral gyrus", color: "#2d9f27", pos: "7.588m 15.767m 7.044m", normal: "0.174m 0.908m 0.381m" },
    { n:  8, name: "Posterior sigmoid gyrus", color: "#34c39f", pos: "-10.757m 6.010m 15.618m", normal: "-0.360m 0.602m 0.713m" },
    { n:  9, name: "Suprasylvian gyrus", color: "#0bf21e", pos: "3.161m 11.203m 16.002m", normal: "-0.169m 0.749m 0.641m" },
    { n: 10, name: "Pro-coronal gyrus", color: "#271493", pos: "-10.602m -4.797m 17.441m", normal: "-0.412m -0.538m 0.735m" },
    { n: 11, name: "Coronal gyrus", color: "#00ffaa", pos: "-3.040m -0.649m 20.390m", normal: "-0.304m 0.094m 0.948m" },
    { n: 12, name: "Pro-anterior ectosylvian gyrus", color: "#fbc35a", pos: "-3.939m -7.384m 18.625m", normal: "-0.124m -0.352m 0.928m" },
    { n: 13, name: "Anterior ectosylvian gyrus", color: "#f2ff00", pos: "3.149m -0.289m 20.625m", normal: "-0.065m 0.135m 0.989m" },
    { n: 14, name: "Medial ectosylvian gyrus", color: "#f2fe00", pos: "9.825m 5.182m 20.455m", normal: "0.018m 0.301m 0.953m" },
    { n: 15, name: "Posterior ectosylvian gyrus", color: "#f2fe00", pos: "6.630m -6.202m 21.778m", normal: "0.320m -0.216m 0.922m" },
    { n: 16, name: "Presylvian sulcus", color: "#b65170", pos: "-17.385m -5.796m -10.827m", normal: "-0.832m -0.535m 0.150m" },
    { n: 17, name: "Pseudosylvian sulcus", color: "#f3fe0e", pos: "4.753m -2.361m -19.957m", normal: "-0.034m -0.031m -0.999m" },
    { n: 18, name: "Suprasylvian sulcus", color: "#fef200", pos: "10.169m 9.919m -16.000m", normal: "0.432m 0.826m -0.363m" },
    { n: 19, name: "Lateral sulcus", color: "#0cf01e", pos: "10.536m 14.588m -7.919m", normal: "-0.212m 0.823m -0.526m" }
    ]
  },
  {
    file: "models/martes-endocast.glb",
    title: "American marten endocast anatomy",
    specimen: "Martes americana",
    caption: "Virtual endocast (a cast of the braincase) with gyri and sulci colored. Model by Angela Boyer.",
    wide: true,
    view: { orbit: "25deg 65deg auto", zoom: "30m", homeLabel: "Reset view" },
    labels: [
    { n:  1, name: "Olfactory bulb", color: "#ff8c00", pos: "-24.997m 3.157m -7.701m", normal: "-0.887m -0.120m 0.446m" },
    { n:  2, name: "Proreal gyrus", color: "#ef230b", pos: "-17.521m 12.945m -8.286m", normal: "-0.076m 0.952m -0.296m" },
    { n:  3, name: "Anterior sigmoid gyrus", color: "#ea96e9", pos: "-6.993m 14.436m -5.744m", normal: "0.073m 0.986m -0.148m" },
    { n:  4, name: "Lateral gyrus", color: "#2e9f27", pos: "17.571m 9.512m 4.755m", normal: "0.523m 0.739m 0.426m" },
    { n:  5, name: "Rhinal fissure", color: "#9a6fa2", pos: "-15.963m -1.176m 2.382m", normal: "-0.791m -0.370m 0.487m" },
    { n:  6, name: "Orbital gyrus", color: "#8b1a43", pos: "-18.012m 4.440m 1.640m", normal: "-0.798m 0.005m 0.603m" },
    { n:  7, name: "Pro-coronal gyrus", color: "#0839fe", pos: "-12.598m 3.481m 8.076m", normal: "-0.578m 0.145m 0.803m" },
    { n:  8, name: "Posterior sigmoid gyrus", color: "#34c39f", pos: "-6.968m 10.893m 7.453m", normal: "-0.229m 0.616m 0.754m" },
    { n:  9, name: "Coronal gyrus", color: "#08fe8f", pos: "-4.250m 8.037m 10.486m", normal: "-0.305m 0.542m 0.783m" },
    { n: 10, name: "Suprasylvian gyrus", color: "#0cf21d", pos: "7.961m 11.690m 8.189m", normal: "0.115m 0.875m 0.470m" },
    { n: 11, name: "Pro-anterior ectosylvian gyrus", color: "#fac359", pos: "-8.267m 0.238m 10.819m", normal: "-0.478m -0.039m 0.877m" },
    { n: 12, name: "Anterior ectosylvian gyrus", color: "#f8fa04", pos: "-1.386m 5.807m 12.421m", normal: "-0.294m 0.409m 0.864m" },
    { n: 13, name: "Medial ectosylvian gyrus", color: "#faf704", pos: "5.204m 7.933m 12.534m", normal: "0.184m 0.678m 0.712m" },
    { n: 14, name: "Posterior ectosylvian gyrus", color: "#fbf802", pos: "0.505m 1.166m 15.736m", normal: "-0.273m 0.264m 0.925m" },
    { n: 15, name: "Presylvian sulcus", color: "#546779", pos: "-13.500m 3.882m -14.432m", normal: "-0.368m -0.372m -0.852m" },
    { n: 16, name: "Cruciate sulcus", color: "#967355", pos: "-5.344m 9.628m -14.476m", normal: "0.111m 0.584m -0.804m" },
    { n: 17, name: "Coronal sulcus", color: "#17e892", pos: "2.098m 6.590m -14.660m", normal: "0.253m 0.448m -0.857m" },
    { n: 18, name: "Lateral sulcus", color: "#1cc823", pos: "13.718m 8.803m -8.844m", normal: "0.395m 0.524m -0.755m" },
    { n: 19, name: "Suprasylvian sulcus", color: "#b2f210", pos: "8.112m 4.186m -14.357m", normal: "0.152m 0.591m -0.792m" },
    { n: 20, name: "Pseudosylvian sulcus", color: "#f2f30b", pos: "2.761m -2.715m -16.428m", normal: "-0.166m 0.153m -0.974m" }
    ]
  },
  {
    file: "models/pekania-endocast.glb",
    title: "Fisher endocast anatomy",
    specimen: "Pekania pennanti",
    caption: "Virtual endocast (a cast of the braincase) with gyri and sulci colored. Model by Angela Boyer.",
    wide: true,
    view: { orbit: "25deg 65deg auto", zoom: "30m", homeLabel: "Reset view" },
    labels: [
    { n:  1, name: "Olfactory bulb", color: "#ff5d00", pos: "-22.440m 6.581m 0.847m", normal: "-0.705m 0.517m -0.485m" },
    { n:  2, name: "Proreal gyrus", color: "#ff1d00", pos: "-14.051m 8.544m 8.373m", normal: "-0.398m 0.290m 0.870m" },
    { n:  3, name: "Orbital gyrus", color: "#963734", pos: "-14.883m 2.480m 7.109m", normal: "-0.526m -0.385m 0.758m" },
    { n:  4, name: "Rhinal fissure", color: "#a56fda", pos: "-14.973m -1.457m 4.477m", normal: "-0.554m -0.680m 0.481m" },
    { n:  5, name: "Anterior sigmoid gyrus", color: "#eb95ea", pos: "-9.708m 8.803m 9.872m", normal: "-0.200m 0.325m 0.924m" },
    { n:  6, name: "Posterior sigmoid gyrus", color: "#34c39f", pos: "-3.130m 8.280m 10.056m", normal: "0.456m 0.745m 0.488m" },
    { n:  7, name: "Post cruciate gyrus", color: "#0400ff", pos: "2.248m 11.475m 4.735m", normal: "0.191m 0.882m 0.432m" },
    { n:  8, name: "Lateral gyrus", color: "#2e9f28", pos: "10.827m 9.129m 5.797m", normal: "0.086m 0.846m 0.526m" },
    { n:  9, name: "Suprasylvian gyrus", color: "#0cf31f", pos: "8.492m 4.219m 12.697m", normal: "0.030m 0.434m 0.900m" },
    { n: 10, name: "Coronal gyrus", color: "#00ffaa", pos: "-2.193m 1.488m 13.186m", normal: "-0.202m 0.085m 0.976m" },
    { n: 11, name: "Pro-coronal gyrus", color: "#271493", pos: "-9.786m 0.853m 10.643m", normal: "-0.485m 0.081m 0.870m" },
    { n: 12, name: "Posterior ectosylvian gyrus", color: "#fbff00", pos: "2.239m -4.463m 14.826m", normal: "-0.326m 0.056m 0.944m" },
    { n: 13, name: "Medial ectosylvian gyrus", color: "#ffff00", pos: "5.840m 1.710m 14.414m", normal: "-0.072m 0.332m 0.940m" },
    { n: 14, name: "Anterior ectosylvian gyrus", color: "#ffff00", pos: "0.522m -1.447m 13.591m", normal: "-0.427m -0.074m 0.901m" },
    { n: 15, name: "Pro-anterior ectosylvian gyrus", color: "#fbc259", pos: "-5.212m -2.675m 11.806m", normal: "-0.383m -0.152m 0.911m" },
    { n: 16, name: "Lateral sulcus", color: "#20df2c", pos: "12.922m 6.037m -9.167m", normal: "0.628m 0.522m -0.577m" },
    { n: 17, name: "Suprasylvian sulcus", color: "#f8fe03", pos: "10.270m 5.753m -10.483m", normal: "0.013m 0.629m -0.777m" },
    { n: 18, name: "Pseudosylvian sulcus", color: "#ffff00", pos: "5.253m 4.636m -11.269m", normal: "-0.003m 0.547m -0.837m" },
    { n: 19, name: "Coronal sulcus", color: "#4ac9a9", pos: "-0.714m 8.812m -8.535m", normal: "0.346m 0.474m -0.809m" }
    ]
  },
  {
    file: "models/neogale-endocast.glb",
    title: "American mink endocast anatomy",
    specimen: "Neogale vison",
    caption: "Virtual endocast (a cast of the braincase) with gyri and sulci colored. Model by Angela Boyer.",
    wide: true,
    view: { orbit: "25deg 65deg auto", zoom: "25m", homeLabel: "Reset view" },
    labels: [
    { n:  1, name: "Olfactory bulb", color: "#ff6a00", pos: "-19.852m 3.324m -9.277m", normal: "-0.680m 0.150m 0.717m" },
    { n:  2, name: "Rhinal fissure", color: "#a570da", pos: "-14.272m -1.559m -1.654m", normal: "-0.704m -0.236m 0.669m" },
    { n:  3, name: "Orbital gyrus", color: "#9b1515", pos: "-16.111m 2.000m -2.467m", normal: "-0.812m -0.069m 0.579m" },
    { n:  4, name: "Proreal gyrus", color: "#f3210a", pos: "-16.365m 6.689m -4.281m", normal: "-0.611m 0.547m 0.573m" },
    { n:  5, name: "Anterior sigmoid gyrus", color: "#eb96ea", pos: "-12.963m 8.791m -6.818m", normal: "-0.008m 0.999m 0.040m" },
    { n:  6, name: "Posterior sigmoid gyrus", color: "#07eee7", pos: "-6.268m 8.429m -2.833m", normal: "-0.113m 0.955m -0.275m" },
    { n:  7, name: "Lateral gyrus", color: "#2e9f28", pos: "3.522m 8.995m 0.905m", normal: "-0.195m 0.945m 0.264m" },
    { n:  8, name: "Pro-coronal gyrus", color: "#261493", pos: "-13.086m 5.449m 1.072m", normal: "-0.636m 0.602m 0.482m" },
    { n:  9, name: "Coronal gyrus", color: "#00fea9", pos: "-8.266m 6.960m 2.540m", normal: "-0.391m 0.693m 0.606m" },
    { n: 10, name: "Suprasylvian gyrus", color: "#0bf21d", pos: "3.766m 6.175m 8.086m", normal: "-0.352m 0.786m 0.508m" },
    { n: 11, name: "Pro-anterior ectosylvian gyrus", color: "#fbc35a", pos: "-12.202m 1.610m 3.025m", normal: "-0.577m -0.003m 0.817m" },
    { n: 12, name: "Anterior ectosylvian gyrus", color: "#fafe00", pos: "-6.203m 3.839m 6.725m", normal: "-0.489m 0.306m 0.817m" },
    { n: 13, name: "Medial ectosylvian gyrus", color: "#f4f508", pos: "0.983m 6.045m 7.798m", normal: "0.047m 0.672m 0.739m" },
    { n: 14, name: "Posterior ectosylvian gyrus", color: "#f3f30a", pos: "-3.461m -0.126m 10.923m", normal: "-0.432m 0.486m 0.760m" },
    { n: 15, name: "Presylvian sulcus", color: "#c76d83", pos: "-11.161m 3.445m -12.011m", normal: "-0.686m -0.018m -0.728m" },
    { n: 16, name: "Cruciate sulcus", color: "#50e9f5", pos: "-7.982m 5.987m -11.062m", normal: "0.438m 0.592m -0.677m" },
    { n: 17, name: "Coronal sulcus", color: "#00feaa", pos: "-0.800m 5.439m -9.825m", normal: "0.348m 0.655m -0.671m" },
    { n: 18, name: "Lateral sulcus", color: "#2bb42b", pos: "8.758m 6.113m -5.727m", normal: "0.428m 0.896m -0.120m" },
    { n: 19, name: "Suprasylvian sulcus", color: "#dff30d", pos: "6.634m 4.016m -9.035m", normal: "0.373m 0.628m -0.682m" },
    { n: 20, name: "Pseudosylvian sulcus", color: "#fcfd00", pos: "2.920m -1.208m -12.425m", normal: "0.004m 0.334m -0.943m" }
    ]
  },
  {
    file: "models/mustela-endocast.glb",
    title: "Ermine endocast anatomy",
    specimen: "Mustela erminea",
    caption: "Virtual endocast (a cast of the braincase) with gyri and sulci colored. Model by Angela Boyer.",
    wide: true,
    view: { orbit: "25deg 65deg auto", zoom: "15m", homeLabel: "Reset view" },
    labels: [
    { n:  1, name: "Olfactory bulb", color: "#ff8700", pos: "-10.637m 2.230m -0.669m", normal: "-0.930m 0.179m 0.321m" },
    { n:  2, name: "Anterior sigmoid gyrus", color: "#eb96ea", pos: "-6.017m 4.589m -0.697m", normal: "-0.002m 0.948m 0.318m" },
    { n:  3, name: "Lateral gyrus", color: "#2e9f28", pos: "4.953m 4.230m 1.132m", normal: "0.190m 0.955m 0.229m" },
    { n:  4, name: "Rhinal fissure", color: "#a56fda", pos: "-6.121m -1.219m 3.430m", normal: "-0.739m -0.078m 0.669m" },
    { n:  5, name: "Orbital gyrus", color: "#9f1809", pos: "-7.219m 0.891m 2.774m", normal: "-0.861m -0.231m 0.454m" },
    { n:  6, name: "Proreal gyrus", color: "#fe1900", pos: "-7.496m 3.763m 2.411m", normal: "-0.699m 0.038m 0.714m" },
    { n:  7, name: "Pro-coronal gyrus", color: "#271493", pos: "-5.291m 0.760m 4.582m", normal: "-0.442m -0.042m 0.896m" },
    { n:  8, name: "Pro-posterior sigmoid gyrus", color: "#34c29f", pos: "-3.702m 3.123m 4.141m", normal: "-0.144m 0.687m 0.712m" },
    { n:  9, name: "Coronal gyrus", color: "#00fea9", pos: "-1.468m 2.684m 4.767m", normal: "-0.025m 0.657m 0.754m" },
    { n: 10, name: "Suprasylvian gyrus", color: "#0bf31e", pos: "1.969m 3.338m 4.118m", normal: "0.105m 0.671m 0.734m" },
    { n: 11, name: "Pro-anterior ectosylvian gyrus", color: "#fac359", pos: "-2.230m -0.509m 5.575m", normal: "-0.383m 0.144m 0.912m" },
    { n: 12, name: "Anterior ectosylvian gyrus", color: "#fffa00", pos: "-0.756m 1.345m 5.525m", normal: "-0.157m 0.383m 0.910m" },
    { n: 13, name: "Medial ectosylvian gyrus", color: "#fefa00", pos: "1.169m 1.887m 5.396m", normal: "0.085m 0.548m 0.832m" },
    { n: 14, name: "Posterior ectosylvian gyrus", color: "#fffa00", pos: "0.276m -0.514m 6.187m", normal: "-0.017m 0.074m 0.997m" },
    { n: 15, name: "Presylvian sulcus", color: "#a0518b", pos: "-5.952m 1.336m -4.316m", normal: "-0.583m -0.004m -0.812m" },
    { n: 16, name: "Cruciate sulcus", color: "#95aec7", pos: "-4.085m 3.326m -3.739m", normal: "0.266m 0.653m -0.709m" },
    { n: 17, name: "Coronal sulcus", color: "#14e7a5", pos: "-2.745m 2.391m -4.894m", normal: "0.136m 0.408m -0.903m" },
    { n: 18, name: "Lateral sulcus", color: "#0bf21e", pos: "0.597m 3.647m -3.358m", normal: "-0.092m 0.943m -0.319m" },
    { n: 19, name: "Suprasylvian sulcus", color: "#e9f604", pos: "0.370m 2.320m -4.866m", normal: "0.133m 0.575m -0.807m" },
    { n: 20, name: "Ansate sulcus", color: "#33c097", pos: "-2.342m 3.745m -3.308m", normal: "0.073m 0.929m -0.364m" }
    ]
  }
  // Add more models like this:
  // { file: "models/otter-endocast.glb", title: "River otter endocast", specimen: "Lontra canadensis", caption: "Virtual endocast of the braincase." },
];

function buildGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  MODELS.forEach((m, mi) => {
    const fig = document.createElement("figure");
    const labeled = !!(m.labels && m.labels.length);
    fig.className = "model" + (m.wide ? " wide" : "") + (labeled ? " labeled" : "");
    const v = m.view || {};
    const hotspots = (m.labels || []).map(l => `
      <button class="hotspot" type="button" slot="hotspot-${mi}-${l.n}" data-n="${l.n}"
        data-position="${l.pos}" data-normal="${l.normal}" style="--dot:${l.color}"
        aria-label="${l.n}. ${l.name}">
        <span class="num">${l.n}</span><span class="tip">${l.name}</span>
      </button>`).join("");
    const list = (m.labels || []).map(l => `
      <li><button type="button" class="label-item" data-n="${l.n}">
        <span class="sw" style="background:${l.color}"></span><span class="ln">${l.n}</span>${l.name}
      </button></li>`).join("");

    fig.innerHTML = `
      <div class="stage">
        <model-viewer src="${m.file}" alt="3D model: ${m.title}"
          camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="4000" rotation-per-second="10deg"
          interpolation-decay="120" ${v.orbit ? `camera-orbit="${v.orbit}"` : ""} ${v.target ? `camera-target="${v.target}"` : ""}
          field-of-view="30deg" min-camera-orbit="auto auto 3m" shadow-intensity="0" exposure="1.1" loading="lazy">
          <div class="empty" slot="poster"><span class="label">Loading model…</span></div>
          ${hotspots}
        </model-viewer>
        ${labeled ? `<div class="view-tools">
          <button type="button" class="tool" data-act="brain">${v.homeLabel || "Reset view"}</button>
          ${v.fullLabel ? `<button type="button" class="tool" data-act="all">${v.fullLabel}</button>` : ""}
          <button type="button" class="tool" data-act="labels" aria-pressed="true">Labels</button>
        </div>` : ""}
      </div>
      ${labeled ? `<aside class="label-panel" aria-label="Structures">
        <p class="label">Structures · select to zoom</p>
        <ol class="label-list">${list}</ol>
      </aside>` : ""}
      <figcaption>
        <p class="label"><i>${m.specimen}</i></p>
        <h3>${m.title}</h3>
        <p>${m.caption}</p>
      </figcaption>`;
    gallery.appendChild(fig);
    trackModel(fig, m);
    if (labeled) wireLabels(fig, m);
  });
}

function wireLabels(fig, m) {
  const mv = fig.querySelector("model-viewer");
  const items = fig.querySelectorAll(".label-item");
  const spots = fig.querySelectorAll(".hotspot");
  const home = m.view || {};

  function select(n) {
    const l = m.labels.find(x => x.n === n);
    if (!l) return;
    track("label", slug(m.file), `${n} ${l.name}`);
    spots.forEach(s => s.classList.toggle("on", Number(s.dataset.n) === n));
    items.forEach(i => i.setAttribute("aria-current", Number(i.dataset.n) === n ? "true" : "false"));
    mv.removeAttribute("auto-rotate");
    mv.cameraTarget = l.pos;
    const orbit = mv.getCameraOrbit();
    mv.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${home.zoom || "14m"}`;
  }
  items.forEach(i => i.addEventListener("click", () => select(Number(i.dataset.n))));
  spots.forEach(s => s.addEventListener("click", () => select(Number(s.dataset.n))));

  fig.querySelectorAll(".tool").forEach(btn => btn.addEventListener("click", () => {
    const act = btn.dataset.act;
    if (act === "labels") {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      fig.classList.toggle("labels-off", !on);
      return;
    }
    spots.forEach(s => s.classList.remove("on"));
    items.forEach(i => i.setAttribute("aria-current", "false"));
    if (act === "brain") { mv.cameraTarget = home.target || "auto auto auto"; mv.cameraOrbit = home.orbit || "auto auto auto"; }
    if (act === "all") { mv.cameraTarget = "auto auto auto"; mv.cameraOrbit = "62deg 70deg auto"; }
  }));
}

/* ============================================================
   PUBLICATION FILTERS
   ============================================================ */
function setupFilters() {
  const chips = document.querySelectorAll(".chip[data-filter]");
  const years = document.querySelectorAll("#pubs .year");

  chips.forEach(chip => chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    chips.forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    years.forEach(year => {
      let shown = 0;
      year.querySelectorAll(".pub").forEach(p => {
        const match = f === "all" || p.dataset.topic === f;
        p.hidden = !match;
        if (match) shown++;
      });
      year.hidden = shown === 0;
    });
  }));
}

/* ============================================================
   COPY EMAIL
   ============================================================ */
function setupCopy() {
  document.querySelectorAll(".copy[data-target]").forEach(btn => {
  const email = document.getElementById(btn.dataset.target);
  if (!email) return;
  btn.addEventListener("click", () => {
    const text = email.textContent.trim();
    const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => selectText(email));
    } else {
      selectText(email);
    }
  });
  });
}
function selectText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ============================================================
   HERO: rotating landmark point cloud (schematic endocast)
   ============================================================ */
function startCloud() {
  const canvas = document.getElementById("cloud");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build a lobed, elongated ellipsoid with a forward olfactory bulb.
  const pts = [];
  const N = 1500;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    let x = Math.cos(th) * r, z = Math.sin(th) * r;
    // Shape: long axis on z (rostral-caudal), cerebral bulges, flattened base.
    let sx = 0.78, sy = 0.62, sz = 1.05;
    const lobe = 1 + 0.12 * Math.cos(3 * th) * r + 0.08 * Math.sin(2 * y * Math.PI);
    let px = x * sx * lobe, py = y * sy * lobe, pz = z * sz;
    if (py < -0.35) py = -0.35 + (py + 0.35) * 0.4;           // flatter ventral surface
    if (pz > 0.75) { px *= 0.55; py *= 0.55; pz += 0.18; }     // olfactory bulbs
    if (pz < -0.6 && py < 0) { py *= 0.8; }                    // cerebellum taper
    pts.push({ x: px, y: py, z: pz, lm: false });
  }
  // Mark 48 evenly spread points as landmarks.
  for (let k = 0; k < 48; k++) pts[Math.floor((k + 0.5) * (N / 48))].lm = true;

  const css = getComputedStyle(document.documentElement);
  const pink = css.getPropertyValue("--pink").trim() || "#ff5fa2";

  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Surface color by depth: purple (far) to teal (near).
  const far = [164, 123, 255], near = [46, 211, 198];
  function mix(t) {
    return `rgb(${Math.round(far[0] + (near[0] - far[0]) * t)},${Math.round(far[1] + (near[1] - far[1]) * t)},${Math.round(far[2] + (near[2] - far[2]) * t)})`;
  }

  let angle = 0.6;
  function frame() {
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w, h) * 0.36;
    const cx = w / 2, cy = h / 2;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const tilt = 0.35, ct = Math.cos(tilt), st = Math.sin(tilt);

    const proj = pts.map(p => {
      const x1 = p.x * ca + p.z * sa;
      const z1 = -p.x * sa + p.z * ca;
      const y1 = p.y * ct - z1 * st;
      const z2 = p.y * st + z1 * ct;
      return { sx: cx + x1 * s, sy: cy - y1 * s, z: z2, lm: p.lm };
    }).sort((a, b) => a.z - b.z);

    for (const p of proj) {
      const t = (p.z + 1.2) / 2.4;
      if (p.lm) {
        ctx.fillStyle = pink;
        ctx.globalAlpha = 0.55 + 0.45 * t;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.6 + 1.6 * t, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = mix(t);
        ctx.globalAlpha = 0.25 + 0.6 * t;
        ctx.fillRect(p.sx, p.sy, 1.4 + t, 1.4 + t);
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) { angle += 0.0045; requestAnimationFrame(frame); }
  }

  resize();
  window.addEventListener("resize", () => { resize(); if (reduce) frame(); });
  frame();
}



/* ============================================================
   COLLABORATIVE MANUSCRIPTS
   publications.html#with-smith highlights papers whose data-with includes "smith".
   To tag a new paper, add the collaborator's key to its data-with attribute.
   ============================================================ */
const COLLABORATORS = {
  felice: "Ryan Felice", gignac: "Paul Gignac", smith: "Heather Smith", heesy: "Christopher Heesy",
  delap: "Celeste Delap", ritzman: "Terrence Ritzman", campbell: "Tim Campbell",
  allen: "Kari Allen", obrien: "Haley O'Brien", valdez: "Dominik Valdez"
};

function setupCollabHighlight() {
  const banner = document.getElementById("with-banner");
  const pubs = document.querySelectorAll("#pubs .pub");
  if (!banner || !pubs.length) return;

  function apply() {
    const m = location.hash.match(/^#with-([a-z]+)$/);
    const key = m && COLLABORATORS[m[1]] ? m[1] : null;
    document.body.classList.toggle("collab-view", !!key);
    let first = null, n = 0;
    pubs.forEach(p => {
      const hit = !!key && (p.dataset.with || "").split(" ").includes(key);
      p.classList.toggle("hl", hit);
      if (hit) { n++; if (!first) first = p; }
    });
    if (!key) { banner.hidden = true; return; }
    banner.hidden = false;
    banner.innerHTML = `<p><strong>${n} manuscript${n === 1 ? "" : "s"} with ${COLLABORATORS[key]}</strong> are highlighted below.</p>
      <a class="btn" href="publications.html">Show all equally</a>`;
    if (first) setTimeout(() => first.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }), 150);
  }
  window.addEventListener("hashchange", apply);
  apply();
}


/* ============================================================
   PUBLICATION FIGURES
   Add a thumbnail to any paper: put the image in assets/pubs/ and add
   data-fig="assets/pubs/your-file.jpg" to that paper's <li class="pub">.
   ============================================================ */
function setupPubFigures() {
  document.querySelectorAll(".pub[data-fig]").forEach(li => {
    const img = document.createElement("img");
    img.className = "pub-fig"; img.loading = "lazy"; img.src = li.dataset.fig;
    const title = li.querySelector(".t"); img.alt = title ? "Figure from: " + title.textContent : "Figure";
    img.onerror = () => img.remove();
    li.classList.add("has-fig"); li.appendChild(img);
  });
}


/* ============================================================
   MENU: close the dropdown on outside click, Escape, or link click
   ============================================================ */
function setupMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;
  document.addEventListener("click", e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { menu.open = false; }));
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
setupMenu();
track("page", "", location.pathname.split("/").pop() || "index.html");
buildGallery();
setupFilters();
setupCollabHighlight();
setupPubFigures();
startCloud();
setupCopy();
