import { MapData, Unit, PlayerState, MoveIntent } from './types';

// Large Map Mock Data (2000x2000)
export const INITIAL_MAP: MapData = {
  name: "Big World",
  version: "1.1",
  width: 2000,
  height: 2000,
  terrain_definitions: {
    "sea": { id: "sea", move_cost: 1.0, color: "#87CEEB", restricted_units: ["infantry", "tank", "artillery"] },
    "land": { id: "land", move_cost: 1.0, color: "#90EE90", restricted_units: ["battleship"] },
    "mountain": { id: "mountain", move_cost: 3.0, color: "#8B4513", restricted_units: ["tank"] },
    "forest": { id: "forest", move_cost: 1.5, color: "#228B22", restricted_units: [] }
  },
  layers: {
    terrain: [
      { type: "sea", z_index: 0, polygon: [{x:0,y:0}, {x:2000,y:0}, {x:2000,y:2000}, {x:0,y:2000}] },
      // Main Continent
      { type: "land", z_index: 1, polygon: [{x:200,y:200}, {x:1800,y:200}, {x:1800,y:1800}, {x:200,y:1800}] },
      // Mountain Range
      { type: "mountain", z_index: 2, polygon: [{x:800,y:800}, {x:1200,y:800}, {x:1000,y:1200}] },
      // Forest
      { type: "forest", z_index: 2, polygon: [{x:300,y:300}, {x:600,y:300}, {x:600,y:600}, {x:300,y:600}] }
    ],
    territories: [],
    cities: []
  }
};

export const INITIAL_UNITS: Unit[] = [
    // P1 Units (Top Left)
    { id: 'u1', type: 'infantry', owner_id: 'p1', position: {x: 300, y: 300}, max_range: 150, hp: 100, max_hp: 100, attack: 10, defense: 5 },
    { id: 'u2', type: 'tank', owner_id: 'p1', position: {x: 400, y: 300}, max_range: 300, hp: 150, max_hp: 150, attack: 30, defense: 20 },

    // P2 Units (Bottom Right)
    { id: 'u3', type: 'infantry', owner_id: 'p2', position: {x: 1700, y: 1700}, max_range: 150, hp: 100, max_hp: 100, attack: 10, defense: 5 },
    { id: 'u4', type: 'tank', owner_id: 'p2', position: {x: 1600, y: 1700}, max_range: 300, hp: 150, max_hp: 150, attack: 30, defense: 20 },

    // P3 Units (Top Right)
    { id: 'u5', type: 'artillery', owner_id: 'p3', position: {x: 1700, y: 300}, max_range: 100, hp: 80, max_hp: 80, attack: 50, defense: 2 },
];
