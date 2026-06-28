#!/usr/bin/env python3
"""
Generate v4 compact nervous-system binary: geometry + pre-sampled spine.
Nerve curves are generated on the frontend via CatmullRomCurve3.

Brain mesh decimated to ≤1024 verts via Open3D quadric edge collapse.
Stores faces (not edges) — frontend extracts edges.
Faces are delta-encoded for better gzip compression.
Spine endpoints are pre-sampled (not raw verts).

Output: nervous-system-compact.bin

Format:
  Header (30 bytes):
    float32  minX, minY, minZ
    float32  rangeX, rangeY, rangeZ
    uint16   numBrainFaces
    uint16   numBrainVerts
    uint8    numSpineSegments
    uint8    reserved

  Spine segment centers (quantized):
    uint8    x, y, z × numSpineSegments         (42 bytes)

  Spine pre-sampled endpoints:
    uint8    sampleCount × numSpineSegments      (14 bytes)
    Per endpoint:
      uint8  x, y, z                            (quantized position)

  Brain faces (delta-encoded):
    Sorted by first vertex. Per face: 3 varint-encoded deltas from prev face.
    Varint: if |delta| ≤ 63 → 1 byte, else → 2 bytes.

  Brain vertices (quantized):
    uint8    x, y, z × numBrainVerts
"""

import numpy as np
import open3d as o3d
import struct, os

MAX_BRAIN_VERTS = 1024

# ── 1. Parse OBJ ────────────────────────────────────────────────────────────

groups = {}
brain_faces = []
current = None
global_vertex_idx = 0
brain_vertex_offset = 0

with open('../reference/blender-source/nervous-system.obj', 'r') as f:
    for line in f:
        line = line.strip()
        if line.startswith('o '):
            current = line[2:]
            groups[current] = []
            if current == 'brain':
                brain_vertex_offset = global_vertex_idx
        elif line.startswith('v ') and current:
            parts = line.split()
            groups[current].append([float(parts[1]), float(parts[2]), float(parts[3])])
            global_vertex_idx += 1
        elif line.startswith('f ') and current == 'brain':
            parts = line.split()[1:]
            indices = [int(p.split('/')[0]) - 1 - brain_vertex_offset for p in parts]
            brain_faces.append(indices)

group_data = {}
for name, verts in groups.items():
    v = np.array(verts)
    group_data[name] = {'vertices': v, 'center': v.mean(axis=0)}

brain_all = group_data['brain']['vertices']
brain_tris = np.array(brain_faces)
print(f"Brain original: {len(brain_all)} verts, {len(brain_tris)} faces")

spine_order = ['C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6', 'C-7',
               'L-1', 'L-2', 'L-3', 'L-4', 'L-5', 'L-6', 'L-7']

# ── 2. Decimate brain mesh with quadric edge collapse ────────────────────────

mesh = o3d.geometry.TriangleMesh()
mesh.vertices = o3d.utility.Vector3dVector(brain_all)
mesh.triangles = o3d.utility.Vector3iVector(brain_tris)

target_faces = 2 * (MAX_BRAIN_VERTS - 2)
simplified = mesh.simplify_quadric_decimation(target_number_of_triangles=target_faces)

brain_verts = np.asarray(simplified.vertices)
dec_faces = np.asarray(simplified.triangles).astype(np.int32)

print(f"Brain decimated: {len(brain_verts)} verts, {len(dec_faces)} faces")
assert len(brain_verts) <= MAX_BRAIN_VERTS

# ── 3. Pre-sample spine endpoints ───────────────────────────────────────────

def farthest_point_sample(points, n_samples):
    if len(points) <= n_samples:
        return np.arange(len(points))
    indices = [np.random.randint(len(points))]
    dists = np.full(len(points), np.inf)
    for _ in range(n_samples - 1):
        last = points[indices[-1]]
        new_dists = np.linalg.norm(points - last, axis=1)
        dists = np.minimum(dists, new_dists)
        indices.append(np.argmax(dists))
    return np.array(indices)

np.random.seed(42)

# Consume brain FPS random state (same seed as original for consistency)
_ = farthest_point_sample(brain_all, 500)

# Pre-sample each spine segment
spine_centers = []
spine_sampled = []  # list of (segment_index, sampled_vertices_array)
total_samples = 0

for si, seg_name in enumerate(spine_order):
    seg_verts = group_data[seg_name]['vertices']
    spine_centers.append(seg_verts.mean(axis=0))
    n_samples = max(8, len(seg_verts) // 5)
    idx = farthest_point_sample(seg_verts, n_samples)
    sampled = seg_verts[idx]
    spine_sampled.append(sampled)
    total_samples += len(sampled)
    print(f"  {seg_name}: {len(seg_verts)} verts → {len(sampled)} samples")

spine_centers = np.array(spine_centers)
print(f"Spine: {total_samples} pre-sampled endpoints, {len(spine_order)} centers")

# ── 4. Delta-encode brain faces ─────────────────────────────────────────────

# Sort faces by first vertex for better delta compression
sort_idx = dec_faces[:, 0].argsort()
sorted_faces = dec_faces[sort_idx]

def varint_encode(delta):
    """Encode signed int as 1 or 2 bytes. Range: [-8192, 8191]."""
    if -64 <= delta <= 63:
        return bytes([(delta + 64) & 0x7F])
    else:
        val = delta + 8192
        return bytes([0x80 | (val & 0x7F), (val >> 7) & 0x7F])

face_data = bytearray()
prev = [0, 0, 0]
for face in sorted_faces:
    for k in range(3):
        d = int(face[k]) - prev[k]
        face_data += varint_encode(d)
    prev = [int(x) for x in face]

print(f"Face data: {len(face_data)} bytes (delta-encoded, {len(face_data)/len(dec_faces):.1f} bytes/face)")

# ── 5. Export compact binary ────────────────────────────────────────────────

# Bounding box: brain verts + spine segment verts (all raw, for quantization)
all_verts_list = [brain_verts]
for seg_name in spine_order:
    all_verts_list.append(group_data[seg_name]['vertices'])
all_pts = np.concatenate(all_verts_list, axis=0)
bb_min = all_pts.min(axis=0).astype(np.float32)
bb_range = (all_pts.max(axis=0) - all_pts.min(axis=0)).astype(np.float32)

def quantize(pts):
    normalized = (np.atleast_2d(pts) - bb_min) / bb_range
    return np.clip(normalized * 255, 0, 255).astype(np.uint8)

num_spine_segs = len(spine_order)

with open('../public/nervous-system-compact.bin', 'wb') as f:
    # Header (30 bytes)
    f.write(struct.pack('<3f', *bb_min))             # 12
    f.write(struct.pack('<3f', *bb_range))            # 12
    f.write(struct.pack('<H', len(dec_faces)))        # 2 (faces, not edges)
    f.write(struct.pack('<H', len(brain_verts)))      # 2
    f.write(struct.pack('<B', num_spine_segs))        # 1
    f.write(struct.pack('<B', 0))                     # 1 reserved

    # Spine segment centers (quantized)
    f.write(quantize(spine_centers).tobytes())         # 14 × 3 = 42

    # Spine pre-sampled endpoint counts + vertices
    for sampled in spine_sampled:
        f.write(struct.pack('<B', len(sampled)))       # 1 byte count
    for sampled in spine_sampled:
        f.write(quantize(sampled).tobytes())           # n × 3 bytes

    # Brain faces (delta-encoded)
    f.write(struct.pack('<H', len(face_data)))         # 2 byte length of face blob
    f.write(face_data)

    # Brain vertices (quantized)
    f.write(quantize(brain_verts).tobytes())

bin_size = os.path.getsize('../public/nervous-system-compact.bin')
orig_size = os.path.getsize('../public/nervous-system.bin') if os.path.exists('../public/nervous-system.bin') else 0

spine_data_size = 42 + total_samples * 3 + num_spine_segs
print(f"\nExported nervous-system-compact.bin ({bin_size / 1024:.1f} KB)")
print(f"  Header:         30 bytes")
print(f"  Spine centers:  42 bytes")
print(f"  Spine samples:  {num_spine_segs + total_samples * 3} bytes ({(num_spine_segs + total_samples * 3) / 1024:.1f} KB)")
print(f"  Face data:      {len(face_data) + 2} bytes ({(len(face_data) + 2) / 1024:.1f} KB)")
print(f"  Brain verts:    {len(brain_verts) * 3} bytes ({len(brain_verts) * 3 / 1024:.1f} KB)")
if orig_size:
    print(f"\n  Original: {orig_size / 1024:.1f} KB → Compact: {bin_size / 1024:.1f} KB ({100 * (1 - bin_size / orig_size):.0f}% smaller)")
