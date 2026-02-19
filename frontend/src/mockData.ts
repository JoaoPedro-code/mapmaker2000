import type { MapData } from './game-logic/types';

export const MOCK_MAP: MapData = {
  name: "Test Map",
  version: "1.0",
  width: 800,
  height: 600,
  terrain_definitions: {
    "sea": { id: "sea", move_cost: 1.0, color: "#87CEEB", restricted_units: ["infantry"] }, // Light Blue
    "land": { id: "land", move_cost: 1.0, color: "#90EE90", restricted_units: [] }, // Light Green
    "mountain": { id: "mountain", move_cost: 2.0, color: "#8B4513", restricted_units: ["tank"] } // Brown
  },
  layers: {
    terrain: [
      {
        type: "sea",
        z_index: 0,
        polygon: [{x: 0, y: 0}, {x: 800, y: 0}, {x: 800, y: 600}, {x: 0, y: 600}]
      },
      {
        type: "land",
        z_index: 1,
        polygon: [{x: 100, y: 100}, {x: 700, y: 100}, {x: 700, y: 500}, {x: 100, y: 500}]
      },
      {
        type: "mountain",
        z_index: 2,
        polygon: [{x: 300, y: 200}, {x: 500, y: 200}, {x: 400, y: 400}]
      }
    ],
    territories: [],
    cities: []
  }
};
