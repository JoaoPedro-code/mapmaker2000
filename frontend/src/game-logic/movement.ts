import type { Point, MapData, Unit } from './types';
import { distance, getLineIntersection } from './geometry';
import { getTerrainAtPoint } from './collision';

/**
 * Calculates the movement cost for a unit to move from start to end.
 * Accounts for terrain costs and restrictions.
 */
export function calculateMovementCost(unit: Unit, start: Point, end: Point, map: MapData): number {
    // 1. Collect all significant points along the path (start, end, and intersections)
    let points: Point[] = [start, end];

    // Iterate over all terrain polygons to find intersections
    // In a real implementation, a spatial index (QuadTree/R-Tree) would be used here.
    for (const layer of map.layers.terrain) {
        const poly = layer.polygon;
        for (let i = 0; i < poly.length; i++) {
            const p1 = poly[i];
            const p2 = poly[(i + 1) % poly.length];
            const intersection = getLineIntersection(start, end, p1, p2);
            if (intersection) {
                points.push(intersection);
            }
        }
    }

    // 2. Sort points by distance from start to ensure correct segment ordering
    points.sort((a, b) => distance(start, a) - distance(start, b));

    // 3. Filter duplicates (points extremely close to each other)
    points = points.filter((p, i) => {
        if (i === 0) return true;
        return distance(points[i-1], p) > 0.001; // Epsilon check
    });

    // 4. Calculate cost segment by segment
    let totalCost = 0;

    for (let i = 0; i < points.length - 1; i++) {
        const pA = points[i];
        const pB = points[i+1];
        const segDist = distance(pA, pB);

        // Sample the terrain at the midpoint of the segment
        const mid: Point = {
            x: (pA.x + pB.x) / 2,
            y: (pA.y + pB.y) / 2
        };

        const terrain = getTerrainAtPoint(map, mid);

        if (!terrain) {
             // If outside defined terrain, treat as base cost (1.0) or void.
             // Here we assume a base cost of 1.0.
             totalCost += segDist;
        } else {
             // Check unit restrictions (e.g., Tank cannot enter Mountain)
             if (terrain.restricted_units && terrain.restricted_units.includes(unit.type)) {
                 return Infinity;
             }
             totalCost += segDist * terrain.move_cost;
        }
    }

    return totalCost;
}

/**
 * Validates if a movement is possible within the unit's range.
 */
export function validateMovement(unit: Unit, target: Point, map: MapData): boolean {
    // Basic range check (Euclidean) first as an optimization
    // If straight line distance > max_range, it's definitely impossible
    // UNLESS terrain cost is < 1 (e.g. roads? unlikely in this context).
    // Assuming min cost is 1.0.
    if (distance(unit.position, target) > unit.max_range) {
        return false;
    }

    const cost = calculateMovementCost(unit, unit.position, target, map);
    return cost <= unit.max_range;
}
