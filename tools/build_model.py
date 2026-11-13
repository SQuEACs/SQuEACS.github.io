"""Build a web GLB + hotspot list from a colored mesh npz and Sketchfab label coords.
usage: build_model.py mesh.npz labels.json out.glb out_labels.json target_faces rot
rot: 3x3 matrix name mapping mesh coords -> glTF (Y-up) coords."""
import numpy as np, trimesh, json, sys, os, fast_simplification
from scipy.spatial import cKDTree
ROTS = {
  "zup_dorsal": np.array([[1,0,0],[0,0,1],[0,-1,0]], float),   # mesh z = dorsal -> glTF +Y
}
npz, lab, out, outlab, target, rot = sys.argv[1:7]
d = np.load(npz); v, c, f = d["v"].astype(np.float32), d["c"], d["f"]
cmax = 1.0 if c.max() <= 1.01 else 255.0
L = json.load(open(lab))["labels"]
P = np.array([[x, z, -y] for _, x, y, z in L])          # Sketchfab Z-up -> mesh coords
dist, ni = cKDTree(v).query(P)
print("label->surface distance max:", round(float(dist.max()), 3))
Vd, Fd = fast_simplification.simplify(v, f, target_reduction=max(0, 1 - int(target)/len(f)))
_, nn = cKDTree(v).query(Vd)
cols = np.hstack([(np.clip(c[nn]/cmax, 0, 1)*255).astype(np.uint8), np.full((len(Vd),1),255,np.uint8)])
R = ROTS[rot]; center = (Vd.min(0)+Vd.max(0))/2
Vw = (Vd - center) @ R.T
tm = trimesh.Trimesh(vertices=Vw, faces=Fd, vertex_colors=cols, process=False)
tm.export(out); print("faces", len(Fd), "glb MB", round(os.path.getsize(out)/1e6, 2))
Pw = (P - center) @ R.T
_, vi = cKDTree(Vw).query(Pw); N = tm.vertex_normals
spots = []
for i, (name, *_r) in enumerate(L):
    p, n = Vw[vi[i]], N[vi[i]]
    rgb = (np.clip(c[ni[i]]/cmax, 0, 1)*255).astype(int)
    spots.append({"n": i+1, "name": name, "color": "#%02x%02x%02x" % tuple(rgb),
                  "pos": f"{p[0]:.3f}m {p[1]:.3f}m {p[2]:.3f}m", "normal": f"{n[0]:.3f}m {n[1]:.3f}m {n[2]:.3f}m"})
json.dump({"spots": spots, "extent": (Vw.max(0)-Vw.min(0)).round(2).tolist()}, open(outlab, "w"), indent=1)
print("extent", (Vw.max(0)-Vw.min(0)).round(1))
