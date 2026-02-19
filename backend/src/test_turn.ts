import { processTurn } from './turnProcessor';
import { Unit, MoveIntent, MapData } from './types';
import { INITIAL_MAP } from './initialData';

// Place units on Land (300, 300 is inside the Land polygon 200,200 -> 1800,1800)
const mockUnits: Unit[] = [
    { id: 'u1', type: 'infantry', owner_id: 'p1', position: {x: 300, y: 300}, max_range: 100, hp: 10, max_hp: 10, attack: 5, defense: 0 },
    { id: 'u2', type: 'infantry', owner_id: 'p2', position: {x: 400, y: 300}, max_range: 100, hp: 10, max_hp: 10, attack: 5, defense: 0 }
];

const mockMap = INITIAL_MAP;

// Test 1: Movement
console.log("--- Test 1: Movement ---");
// Move u1 from 300,300 to 350,300.
const intents1: MoveIntent[] = [
    { unit_id: 'u1', target: {x: 350, y: 300}, path_cost: 0 }
];
const result1 = processTurn(mockUnits, intents1, mockMap);
const u1 = result1.find(u => u.id === 'u1');
if (u1 && u1.position.x === 350) {
    console.log("✅ PASS: Unit moved correctly.");
} else {
    console.log(`❌ FAIL: Unit did not move. Pos: ${u1?.position.x}`);
}

// Test 2: Combat
console.log("\n--- Test 2: Combat ---");
// Move u1 to 350, 300. Move u2 to 360, 300. Distance = 10.
const intents2: MoveIntent[] = [
    { unit_id: 'u1', target: {x: 350, y: 300}, path_cost: 0 },
    { unit_id: 'u2', target: {x: 360, y: 300}, path_cost: 0 }
];

const result2 = processTurn(mockUnits, intents2, mockMap);
const u1_combat = result2.find(u => u.id === 'u1');
const u2_combat = result2.find(u => u.id === 'u2');

if (u1_combat && u1_combat.hp === 5 && u2_combat && u2_combat.hp === 5) {
    console.log("✅ PASS: Combat resolved correctly.");
} else {
    console.log(`❌ FAIL: Combat HP incorrect. U1: ${u1_combat?.hp}, U2: ${u2_combat?.hp}`);
}

// Test 3: Death
console.log("\n--- Test 3: Death ---");
const weakUnits: Unit[] = [
    { id: 'u1', type: 'infantry', owner_id: 'p1', position: {x: 300, y: 300}, max_range: 100, hp: 1, max_hp: 10, attack: 5, defense: 0 },
    { id: 'u2', type: 'infantry', owner_id: 'p2', position: {x: 310, y: 300}, max_range: 100, hp: 10, max_hp: 10, attack: 5, defense: 0 }
];
const result3 = processTurn(weakUnits, [], mockMap);
const u1_dead = result3.find(u => u.id === 'u1');
const u2_alive = result3.find(u => u.id === 'u2');

if (!u1_dead && u2_alive) {
    console.log("✅ PASS: Unit died and was removed.");
} else {
    console.log(`❌ FAIL: Unit death handling failed. U1 present: ${!!u1_dead}`);
}
