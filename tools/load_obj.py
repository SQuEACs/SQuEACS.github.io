import numpy as np, sys
def load_obj(path):
    vs, fs = [], []
    with open(path) as fh:
        for line in fh:
            if line.startswith("v "): vs.append(line[2:])
            elif line.startswith("f "): fs.append(line[2:])
    V = np.loadtxt(vs, dtype=np.float64)
    F = np.array([[int(t.split("/")[0]) for t in l.split()] for l in fs], dtype=np.int64) - 1
    return V[:, :3], V[:, 3:6] if V.shape[1] >= 6 else None, F
if __name__ == "__main__":
    v, c, f = load_obj(sys.argv[1])
    np.savez(sys.argv[2], v=v, c=c, f=f)
    print(v.shape, f.shape, v.min(0), v.max(0))
