#!/usr/bin/env python3
"""
Parse nervous-system.obj, generate neural pathway lines, visualize, and export JSON.

OBJ groups:
  brain        — 1646 vertices (Y ~2.9–4.6)
  C-1 .. C-7   — cervical vertebrae (top of spine, Y ~2.0–3.2)
  L-1 .. L-7   — lumbar vertebrae (lower spine, Y ~-0.07–2.1)

Each nerve line travels:
  brain endpoint → jittered brain center → down the spinal cord through
  segment centers → branches out at the target segment → spine endpoint
"""

import json
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import CubicSpline

# ── 1. Parse OBJ ────────────────────────────────────────────────────────────

groups = {}       # name → list of [x, y, z]
brain_faces = []  # list of face vertex indices (0-based, local to brain)
current = None
global_vertex_idx = 0
brain_vertex_offset = 0

with open('../source/nervous-system.obj', 'r') as f:
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
            # Parse face indices (handles v, v/vt, v/vt/vn formats)
            parts = line.split()[1:]
            indices = [int(p.split('/')[0]) - 1 - brain_vertex_offset for p in parts]
            brain_faces.append(indices)

# Extract unique edges from brain faces
brain_edges = set()
for face in brain_faces:
    for k in range(len(face)):
        a, b = face[k], face[(k + 1) % len(face)]
        brain_edges.add((min(a, b), max(a, b)))
brain_edges = list(brain_edges)
print(f"Brain wireframe: {len(brain_faces)} faces, {len(brain_edges)} unique edges")

# Convert to numpy arrays and compute centers
group_data = {}
for name, verts in groups.items():
    v = np.array(verts)
    group_data[name] = {
        'vertices': v,
        'center': v.mean(axis=0),
    }
    print(f"{name:6s}  verts={len(v):5d}  Y=[{v[:,1].min():.2f}, {v[:,1].max():.2f}]  center=({v.mean(0)[0]:.3f}, {v.mean(0)[1]:.3f}, {v.mean(0)[2]:.3f})")

brain = group_data['brain']['vertices']
brain_center = group_data['brain']['center']

# Spine segments ordered top-to-bottom (C-1 is highest, L-7 is lowest)
spine_order = ['C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6', 'C-7',
               'L-1', 'L-2', 'L-3', 'L-4', 'L-5', 'L-6', 'L-7']

spine_centers = np.array([group_data[s]['center'] for s in spine_order])

print(f"\nSpinal column path ({len(spine_order)} segments):")
for i, name in enumerate(spine_order):
    c = group_data[name]['center']
    print(f"  {name}: center Y={c[1]:.3f}")

# ── 2. Subsample vertices ───────────────────────────────────────────────────

def farthest_point_sample(points, n_samples):
    """Greedy farthest-point sampling for well-distributed subset."""
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

# Subsample brain
n_brain_samples = 500
brain_idx = farthest_point_sample(brain, n_brain_samples)
brain_sampled = brain[brain_idx]

# Subsample each spine segment (keep proportional representation)
spine_sampled_by_seg = {}
spine_sampled_all = []
spine_seg_labels = []  # which segment each sampled spine vertex belongs to

for seg_name in spine_order:
    seg_verts = group_data[seg_name]['vertices']
    n_seg_samples = max(8, len(seg_verts) // 5)  # ~20% of each segment
    idx = farthest_point_sample(seg_verts, n_seg_samples)
    sampled = seg_verts[idx]
    spine_sampled_by_seg[seg_name] = sampled
    for v in sampled:
        spine_sampled_all.append(v)
        spine_seg_labels.append(seg_name)

spine_sampled_all = np.array(spine_sampled_all)
print(f"\nSampled: {len(brain_sampled)} brain, {len(spine_sampled_all)} spine endpoints")

# ── 3. Generate neural pathway lines ────────────────────────────────────────

def generate_pathway(brain_pt, spine_pt, brain_center, spinal_waypoints, n_points=40):
    """
    Generate a smooth nerve pathway:
      brain_pt → jittered near brain center → down spinal cord → branch to spine_pt

    spinal_waypoints: the segment centers from C-1 down to the target segment
    """
    # Jitter the brain center so each line is distinctive
    jitter_scale = 0.08
    bc_jittered = brain_center + np.random.uniform(-jitter_scale, jitter_scale, size=3)

    # Build waypoint sequence
    waypoints = [brain_pt, bc_jittered]

    # Add spinal cord centers (with small per-line jitter)
    for sc in spinal_waypoints:
        jittered_sc = sc + np.random.uniform(-0.02, 0.02, size=3)
        waypoints.append(jittered_sc)

    # Final destination
    waypoints.append(spine_pt)
    waypoints = np.array(waypoints)

    # Need at least 4 points for cubic spline; pad if needed
    if len(waypoints) < 4:
        mid = (waypoints[0] + waypoints[-1]) / 2 + np.random.uniform(-0.05, 0.05, size=3)
        waypoints = np.insert(waypoints, 1, mid, axis=0)

    # Parameterize by cumulative arc length
    diffs = np.diff(waypoints, axis=0)
    seg_lengths = np.linalg.norm(diffs, axis=1)
    t_knots = np.concatenate([[0], np.cumsum(seg_lengths)])
    if t_knots[-1] == 0:
        return waypoints  # degenerate case
    t_knots /= t_knots[-1]

    # Ensure strictly increasing (deduplicate near-zero segments)
    for i in range(1, len(t_knots)):
        if t_knots[i] <= t_knots[i - 1]:
            t_knots[i] = t_knots[i - 1] + 1e-6

    cs_x = CubicSpline(t_knots, waypoints[:, 0], bc_type='natural')
    cs_y = CubicSpline(t_knots, waypoints[:, 1], bc_type='natural')
    cs_z = CubicSpline(t_knots, waypoints[:, 2], bc_type='natural')

    t_fine = np.linspace(0, 1, n_points)
    path = np.column_stack([cs_x(t_fine), cs_y(t_fine), cs_z(t_fine)])
    return path


lines = []

for i, bp in enumerate(brain_sampled):
    # Pick 1-2 spine endpoints, weighted by spatial proximity in X/Z
    xz_brain = np.array([bp[0], bp[2]])
    xz_spine = spine_sampled_all[:, [0, 2]]
    dists = np.linalg.norm(xz_spine - xz_brain, axis=1)

    weights = 1.0 / (dists + 0.1)
    weights /= weights.sum()

    n_connections = 1 if np.random.random() < 0.7 else 2
    chosen = np.random.choice(len(spine_sampled_all), size=n_connections, replace=False, p=weights)

    for j in chosen:
        sp = spine_sampled_all[j]
        seg_name = spine_seg_labels[j]

        # Build spinal waypoints: from C-1 down to the target segment
        seg_idx = spine_order.index(seg_name)
        spinal_waypoints = spine_centers[:seg_idx + 1]  # C-1 center, C-2 center, ..., target center

        # Scale points by path complexity: 12 base + 1.2 per waypoint, max 30
        n_pts = min(30, 12 + int(len(spinal_waypoints) * 1.2))
        path = generate_pathway(bp, sp, brain_center, spinal_waypoints, n_points=n_pts)

        # Slightly trim the brain end so endpoints fill the brain interior
        # Small trim: 1-4 points off the start (~2-10% of the line)
        if np.random.random() < 0.5:
            trim = np.random.randint(1, 5)
            path = path[trim:]

        lines.append(path)

print(f"Generated {len(lines)} neural pathways")

# ── 4. Visualize ────────────────────────────────────────────────────────────

fig = plt.figure(figsize=(10, 14))
ax = fig.add_subplot(111, projection='3d')

# Plot pathway lines
for path in lines:
    ax.plot(path[:, 0], path[:, 2], path[:, 1],
            color='#119FCD', alpha=0.12, linewidth=0.5)

# Plot brain nodes
ax.scatter(brain_sampled[:, 0], brain_sampled[:, 2], brain_sampled[:, 1],
           c='#7DD3FC', s=8, alpha=0.9, zorder=5)

# Plot spine nodes (colored by segment)
colors_spine = plt.cm.winter(np.linspace(0, 1, len(spine_order)))
for idx, seg_name in enumerate(spine_order):
    sv = spine_sampled_by_seg[seg_name]
    ax.scatter(sv[:, 0], sv[:, 2], sv[:, 1],
               color=colors_spine[idx], s=5, alpha=0.7, zorder=5)

# Plot spinal column centers
ax.plot(spine_centers[:, 0], spine_centers[:, 2], spine_centers[:, 1],
        color='white', linewidth=1.5, alpha=0.6, zorder=8)
ax.scatter(spine_centers[:, 0], spine_centers[:, 2], spine_centers[:, 1],
           c='white', s=15, alpha=0.8, zorder=9)

# Mark brain center
ax.scatter([brain_center[0]], [brain_center[2]], [brain_center[1]],
           c='yellow', s=40, marker='*', zorder=10)

ax.set_facecolor('#07111A')
fig.patch.set_facecolor('#07111A')
ax.xaxis.pane.fill = False
ax.yaxis.pane.fill = False
ax.zaxis.pane.fill = False
ax.grid(False)
ax.set_xlabel('X', color='#3D6B7D')
ax.set_ylabel('Z', color='#3D6B7D')
ax.set_zlabel('Y', color='#3D6B7D')
ax.tick_params(colors='#3D6B7D')
ax.set_title('Central Nervous System – Neural Pathways', color='#ECF4F8', pad=20)

# Equal aspect ratio so geometry isn't distorted
all_pts = np.concatenate([brain_sampled, spine_sampled_all], axis=0)
mid_x = (all_pts[:, 0].min() + all_pts[:, 0].max()) / 2
mid_y = (all_pts[:, 1].min() + all_pts[:, 1].max()) / 2
mid_z = (all_pts[:, 2].min() + all_pts[:, 2].max()) / 2
max_range = max(
    all_pts[:, 0].max() - all_pts[:, 0].min(),
    all_pts[:, 1].max() - all_pts[:, 1].min(),
    all_pts[:, 2].max() - all_pts[:, 2].min(),
) / 2
ax.set_xlim(mid_x - max_range, mid_x + max_range)
ax.set_ylim(mid_z - max_range, mid_z + max_range)  # Y axis shows Z
ax.set_zlim(mid_y - max_range, mid_y + max_range)  # Z axis shows Y

ax.view_init(elev=10, azim=45)

plt.tight_layout()
plt.savefig('../reference/nervous-system-preview.png', dpi=150, facecolor='#07111A')
plt.show()

# ── 5. Export binary (uint8 quantized) ───────────────────────────────────────
#
# Format: nervous-system.bin
#   Header (32 bytes):
#     uint32  numLines
#     float32 minX, minY, minZ        (bounding box min)
#     float32 rangeX, rangeY, rangeZ  (bounding box extent)
#     uint32  numBrainEdges
#   Brain wireframe:
#     uint16  vertA, vertB * numBrainEdges  (vertex index pairs into brain verts)
#   Brain vertices:
#     uint8   x, y, z * numBrainVerts       (quantized, same bounding box)
#   Nerve lines:
#     Per line:
#       uint8   pointCount
#       uint8   x, y, z * pointCount

import struct, os

num_lines = len(lines)
brain_verts = group_data['brain']['vertices']

# Compute global bounding box (include brain verts + nerve lines)
all_pts = np.concatenate([*lines, brain_verts], axis=0)
bb_min = all_pts.min(axis=0).astype(np.float32)
bb_range = (all_pts.max(axis=0) - all_pts.min(axis=0)).astype(np.float32)

with open('../nervous-system.bin', 'wb') as f:
    # Header
    f.write(struct.pack('<I', num_lines))
    f.write(struct.pack('<3f', *bb_min))
    f.write(struct.pack('<3f', *bb_range))
    f.write(struct.pack('<I', len(brain_edges)))

    # Brain wireframe edges (uint16 pairs)
    for a, b in brain_edges:
        f.write(struct.pack('<HH', a, b))

    # Brain vertices (uint8 quantized)
    f.write(struct.pack('<H', len(brain_verts)))
    brain_norm = (brain_verts - bb_min) / bb_range
    brain_q = np.clip(brain_norm * 255, 0, 255).astype(np.uint8)
    f.write(brain_q.tobytes())

    # Nerve lines
    for path in lines:
        n = len(path)
        f.write(struct.pack('<B', n))
        normalized = (path - bb_min) / bb_range
        quantized = np.clip(normalized * 255, 0, 255).astype(np.uint8)
        f.write(quantized.tobytes())

bin_size = os.path.getsize('../nervous-system.bin')
total_points = sum(len(p) for p in lines)
print(f"\nExported nervous-system.bin ({bin_size / 1024:.0f} KB)")
print(f"  {num_lines} nerve lines, {total_points} points, variable length")
print(f"  Line lengths: min={min(len(p) for p in lines)}, max={max(len(p) for p in lines)}")
print(f"  Brain wireframe: {len(brain_verts)} verts, {len(brain_edges)} edges")
print(f"  Bounding box: min=({bb_min[0]:.3f}, {bb_min[1]:.3f}, {bb_min[2]:.3f})")
print(f"                range=({bb_range[0]:.3f}, {bb_range[1]:.3f}, {bb_range[2]:.3f})")
print(f"  Preview saved to nervous-system-preview.png")
