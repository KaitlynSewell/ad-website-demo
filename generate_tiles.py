#!/usr/bin/env python3
"""
Generate Mapbox Vector Tiles (.pbf) from GeoJSON files for all map layers.
Outputs to tiles/{key}/{z}/{x}/{y}.pbf, readable by leaflet-vectorgrid.
"""

import json
import os
import math
import sys

try:
    import mapbox_vector_tile
    from shapely.geometry import shape, box
    from shapely.errors import TopologicalError
except ImportError as e:
    print(f"Missing package: {e}")
    print("Run: pip install mapbox-vector-tile shapely")
    sys.exit(1)

# Tile zoom range to generate
MIN_ZOOM = 4
MAX_ZOOM = 14

# All layers: key -> GeoJSON path
LAYERS = {
    'beef':        'geojson/beef.geojson',
    'dairy':       'geojson/dairy.geojson',
    'swine':       'geojson/swine.geojson',
    'horses':      'geojson/horses.geojson',
    'turkeys':     'geojson/turkeys.geojson',
    'chickens':    'geojson/chickens.geojson',
    'sheep':       'geojson/sheep.geojson',
    'biodiesel':   'geojson/biodiesel.geojson',
    'ethanol':     'geojson/ethanol.geojson',
    'wastewater':  'geojson/wastewater.geojson',
    'utilities':   'geojson/utilities.geojson',
    'powerplants': 'geojson/powerplants.geojson',
    'pipelines':   'geojson/pipelines.geojson',
    'landfill':    'geojson/landfill.geojson',
    'digesters':   'geojson/digesters.geojson',
    'lmop':        'geojson/lmop.geojson',
}


def tile_bounds(z, x, y):
    """Return (west, south, east, north) in WGS84 degrees for tile z/x/y."""
    n = 2 ** z
    west  = x / n * 360 - 180
    east  = (x + 1) / n * 360 - 180
    north = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    south = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n))))
    return west, south, east, north


def lon_to_x(lon, z):
    n = 2 ** z
    return int((lon + 180) / 360 * n)


def lat_to_y(lat, z):
    n = 2 ** z
    lr = math.radians(lat)
    return int((1 - math.log(math.tan(lr) + 1 / math.cos(lr)) / math.pi) / 2 * n)


def collect_tiles(geom, z):
    """Return set of (x, y) tile coords that a geometry touches at zoom z."""
    gt = geom.geom_type
    tiles = set()

    if gt == 'Point':
        tiles.add((lon_to_x(geom.x, z), lat_to_y(geom.y, z)))

    elif gt in ('LineString', 'MultiLineString'):
        lines = geom.geoms if gt == 'MultiLineString' else [geom]
        for line in lines:
            prev_tx, prev_ty = None, None
            for lon, lat in line.coords:
                tx = lon_to_x(lon, z)
                ty = lat_to_y(lat, z)
                tiles.add((tx, ty))
                # Fill in tiles between consecutive vertices (diagonal steps)
                if prev_tx is not None:
                    for ix in range(min(prev_tx, tx), max(prev_tx, tx) + 1):
                        for iy in range(min(prev_ty, ty), max(prev_ty, ty) + 1):
                            tiles.add((ix, iy))
                prev_tx, prev_ty = tx, ty
    return tiles


def process_layer(key, filepath):
    print(f"\nProcessing {key} ...")
    with open(filepath, encoding='utf-8') as f:
        data = json.load(f)

    # Parse and validate features up front
    features = []
    for feat in data.get('features', []):
        if not feat.get('geometry'):
            continue
        try:
            geom = shape(feat['geometry'])
            if not geom.is_valid:
                geom = geom.buffer(0)   # attempt repair
            if geom.is_empty:
                continue
            # Filter out features with out-of-bounds coordinates
            bounds = geom.bounds  # (minx, miny, maxx, maxy)
            if (not (-180 <= bounds[0] <= 180) or not (-90 <= bounds[1] <= 90) or
                    not (-180 <= bounds[2] <= 180) or not (-90 <= bounds[3] <= 90)):
                print(f"  Skipping feature with out-of-bounds coords: {bounds}")
                continue
            features.append((geom, feat.get('properties') or {}))
        except Exception as e:
            print(f"  Skipping invalid feature: {e}")

    print(f"  {len(features)} valid features")
    if not features:
        return

    total_tiles = 0
    for z in range(MIN_ZOOM, MAX_ZOOM + 1):
        # Collect every tile that intersects any feature
        all_tiles = set()
        for geom, _ in features:
            all_tiles.update(collect_tiles(geom, z))

        written = 0
        for tx, ty in sorted(all_tiles):
            w, s, e, n = tile_bounds(z, tx, ty)
            tile_box = box(w, s, e, n)

            tile_features = []
            for geom, props in features:
                if not geom.intersects(tile_box):
                    continue
                try:
                    clipped = geom.intersection(tile_box)
                except TopologicalError:
                    clipped = geom  # fall back to unclipped
                if clipped.is_empty:
                    continue
                tile_features.append({
                    'geometry': clipped.wkt,
                    'properties': props,
                })

            if not tile_features:
                continue

            try:
                pbf = mapbox_vector_tile.encode(
                    [{'name': key, 'features': tile_features}],
                    quantize_bounds=(w, s, e, n),
                    default_options={'extents': 4096},
                )
            except Exception as e:
                print(f"  Encode error {z}/{tx}/{ty}: {e}")
                continue

            out_dir = os.path.join('tiles', key, str(z), str(tx))
            os.makedirs(out_dir, exist_ok=True)
            with open(os.path.join(out_dir, f'{ty}.pbf'), 'wb') as f:
                f.write(pbf)
            written += 1

        print(f"  Zoom {z:2d}: {written} tiles")
        total_tiles += written

    print(f"  Total: {total_tiles} tiles")


if __name__ == '__main__':
    # Run from the project directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    target = sys.argv[1] if len(sys.argv) > 1 else None

    for key, path in LAYERS.items():
        if target and key != target:
            continue
        if not os.path.exists(path):
            print(f"Skipping {key}: {path} not found")
            continue
        process_layer(key, path)

    print("\nDone.")
