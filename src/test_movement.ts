import { MapData, Unit, Point } from './types';
import { calculateMovementCost, validateMovement } from './movement';

// Mock Map Data
const mockMap: MapData = {
  name: "Test Map",
  version: "1.0",
  width: 1000,
  height: 1000,
  terrain_definitions: {
    "sea": { id: "sea", move_cost: 1.0, color: "blue", restricted_units: ["infantry"] },
    "land": { id: "land", move_cost: 1.0, color: "green", restricted_units: [] },
    "mountain": { id: "mountain", move_cost: 2.0, color: "brown", restricted_units: ["tank"] }
  },
  layers: {
    terrain: [
      // Base Sea (implicit or explicit? Let's make it explicit)
      {
        type: "sea",
        z_index: 0,
        polygon: [{x: 0, y: 0}, {x: 1000, y: 0}, {x: 1000, y: 1000}, {x: 0, y: 1000}]
      },
      // Land Mass
      {
        type: "land",
        z_index: 1,
        polygon: [{x: 100, y: 100}, {x: 500, y: 100}, {x: 500, y: 500}, {x: 100, y: 500}]
      },
      // Mountain Range inside Land
      {
        type: "mountain",
        z_index: 2,
        polygon: [{x: 200, y: 200}, {x: 300, y: 200}, {x: 300, y: 300}, {x: 200, y: 300}]
      }
    ],
    territories: [],
    cities: []
  }
};

// Test Helper
function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

// 1. Infantry Unit on Land
const infantry: Unit = {
    id: "u1",
    type: "infantry",
    owner_id: "p1",
    position: {x: 150, y: 150},
    max_range: 100
};

console.log("--- Testing Infantry Movement ---");

// Test 1: Move inside Land (Cost 1 per unit)
// Distance: 50. Cost: 50. Valid.
const target1: Point = {x: 200, y: 150};
const cost1 = calculateMovementCost(infantry, infantry.position, target1, mockMap);
console.log(`Move 1 Cost: ${cost1} (Expected ~50)`);
assert(Math.abs(cost1 - 50) < 0.1, "Cost inside land should be distance * 1");
assert(validateMovement(infantry, target1, mockMap), "Move inside land within range");

// Test 2: Move into Mountain (Cost 2 per unit)
// Start: 150,150. Target: 250,250 (Center of Mountain).
// Dist to mountain edge (200,200 from 150,150)?
// Line: (150,150) -> (250,250).
// Intersects mountain at (200,200).
// Segment 1: (150,150)->(200,200). Length: sqrt(50^2+50^2) = 70.71. Terrain: Land. Cost: 70.71.
// Segment 2: (200,200)->(250,250). Length: 70.71. Terrain: Mountain. Cost: 70.71 * 2 = 141.42.
// Total Cost: ~212.13.
// Range: 100. Should fail validation.
const target2: Point = {x: 250, y: 250};
const cost2 = calculateMovementCost(infantry, infantry.position, target2, mockMap);
console.log(`Move 2 Cost: ${cost2} (Expected ~212)`);
assert(cost2 > 200, "Cost entering mountain increases");
assert(!validateMovement(infantry, target2, mockMap), "Move into mountain exceeds range");

// Test 3: Move into Sea (Restricted)
// Start: 150,150. Target: 50, 150.
// Line crosses x=100 (Land boundary).
// Seg 1: 150,150 -> 100,150 (Land). Cost 50.
// Seg 2: 100,150 -> 50,150 (Sea). Restricted! Cost Infinity.
const target3: Point = {x: 50, y: 150};
const cost3 = calculateMovementCost(infantry, infantry.position, target3, mockMap);
console.log(`Move 3 Cost: ${cost3} (Expected Infinity)`);
assert(cost3 === Infinity, "Moving into restricted sea should be infinite cost");
assert(!validateMovement(infantry, target3, mockMap), "Move into sea is invalid");


console.log("\n--- Testing Tank Movement ---");
// 2. Tank Unit
const tank: Unit = {
    id: "u2",
    type: "tank",
    owner_id: "p1",
    position: {x: 150, y: 150},
    max_range: 300
};

// Tank moves into Mountain (Restricted for Tank in this map)
const target4: Point = {x: 250, y: 250};
const cost4 = calculateMovementCost(tank, tank.position, target4, mockMap);
console.log(`Move 4 Cost: ${cost4} (Expected Infinity)`);
assert(cost4 === Infinity, "Tank entering mountain should be restricted");

console.log("\nAll tests passed!");
