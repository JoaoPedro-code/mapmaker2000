# Map and Terrain Data Structure

## Overview
The map system is designed to support free-form movement using vector graphics (Polygons) rather than a tile grid. The data structure is inspired by GeoJSON but optimized for game logic (collision detection, pathfinding costs).

## JSON Schema

The map file (e.g., `world_map.json`) contains the following sections:
1.  **Metadata**: Dimensions, name, etc.
2.  **Terrain Definitions**: Rules for different surface types (cost, restriction).
3.  **Layers**:
    - **Terrain Features**: Physical geography (Land masses, Oceans, Mountains).
    - **Territories**: Political boundaries used for game logic (ownership, income).
    - **Cities**: Point locations for production.

```json
{
  "name": "Global Conflict 2025",
  "version": "1.0",
  "width": 4000,
  "height": 2000,
  "terrain_definitions": {
    "deep_sea": {
      "id": "deep_sea",
      "move_cost": 1.0,
      "color": "#000080",
      "restricted_units": ["infantry", "tank"]
    },
    "coastal_sea": {
      "id": "coastal_sea",
      "move_cost": 1.0,
      "color": "#0000FF",
      "restricted_units": ["infantry", "tank"]
    },
    "land": {
      "id": "land",
      "move_cost": 1.0,
      "color": "#228B22",
      "restricted_units": ["battleship", "submarine"]
    },
    "mountain": {
      "id": "mountain",
      "move_cost": 3.0,
      "color": "#8B4513",
      "restricted_units": ["tank"]
    },
    "river": {
      "id": "river",
      "move_cost": 2.0,
      "color": "#00CED1",
      "restricted_units": []
    }
  },
  "layers": {
    "terrain": [
      {
        "type": "deep_sea",
        "z_index": 0,
        "polygon": [[0, 0], [4000, 0], [4000, 2000], [0, 2000]]
      },
      {
        "type": "land",
        "z_index": 1,
        "polygon": [[100, 100], [500, 100], [600, 400], [50, 300]]
      },
      {
        "type": "mountain",
        "z_index": 2,
        "polygon": [[200, 200], [300, 200], [250, 300]]
      }
    ],
    "territories": [
      {
        "id": "fr_01",
        "name": "France Region 1",
        "owner_id": null,
        "polygon": [[100, 100], [500, 100], [600, 400], [50, 300]],
        "neighbors": ["de_01", "es_01"]
      }
    ],
    "cities": [
      {
        "id": "c_paris",
        "name": "Paris",
        "x": 250,
        "y": 250,
        "territory_id": "fr_01",
        "sp_yield": 10
      }
    ]
  }
}
```

## Logic Description

### Terrain Resolution
When determining the terrain at a specific point `(x, y)`:
1.  Iterate through `layers.terrain`.
2.  Filter for polygons that contain the point.
3.  Sort by `z_index` (descending).
4.  The highest `z_index` polygon determines the active terrain.
    - *Example*: A "Mountain" polygon (z=2) drawn on top of a "Land" polygon (z=1) will return "Mountain".

### Movement Cost Calculation
Movement is calculated as a line segment from Point A to Point B.
1.  The segment is sampled or intersected with terrain polygons.
2.  The total cost is the sum of (distance in terrain * terrain cost).

### Territory Control
Territories are logical overlays. A unit is "in" a territory if its center point is inside the territory polygon. This handles capturing logic, independent of whether the unit is standing on a Mountain or a Plains within that territory.
