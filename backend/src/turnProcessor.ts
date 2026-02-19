import { Unit, MoveIntent, MapData, Point } from './types';
import { validateMovement } from './movement';

function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function processTurn(units: Unit[], intents: MoveIntent[], map: MapData): Unit[] {
    console.log("Processing turn with intents:", intents);

    // 1. Validate Movements
    const validMoves: MoveIntent[] = [];

    for (const intent of intents) {
        const unit = units.find(u => u.id === intent.unit_id);
        if (unit) {
            // Re-validate on server side
            if (validateMovement(unit, intent.target, map)) {
                validMoves.push(intent);
            } else {
                console.log(`Invalid move for unit ${unit.id}`);
            }
        }
    }

    // 2. Apply Movements
    // Clone units
    let newUnits = units.map(u => ({ ...u }));

    for (const move of validMoves) {
        const unitIndex = newUnits.findIndex(u => u.id === move.unit_id);
        if (unitIndex !== -1) {
            newUnits[unitIndex].position = move.target;
        }
    }

    // 3. Resolve Combat
    // Simple logic: If units are within range of each other (50), deal damage.
    // Iterating all pairs.
    for (let i = 0; i < newUnits.length; i++) {
        for (let j = i + 1; j < newUnits.length; j++) {
            const u1 = newUnits[i];
            const u2 = newUnits[j];

            if (u1.owner_id !== u2.owner_id) {
                const dist = distance(u1.position, u2.position);

                if (dist <= 50) {
                    // Calculate damage: Attack - Defense (min 1)
                    const dmg1 = Math.max(1, u2.attack - u1.defense); // Damage to u1
                    const dmg2 = Math.max(1, u1.attack - u2.defense); // Damage to u2

                    console.log(`Combat! ${u1.id} vs ${u2.id}. Dist: ${dist}`);
                    console.log(`${u1.id} takes ${dmg1} dmg. ${u2.id} takes ${dmg2} dmg.`);

                    u1.hp -= dmg1;
                    u2.hp -= dmg2;
                }
            }
        }
    }

    // 4. Remove Dead Units
    newUnits = newUnits.filter(u => u.hp > 0);

    return newUnits;
}
