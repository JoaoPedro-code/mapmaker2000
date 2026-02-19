import { Point, MapData, TerrainDefinition, TerrainFeature } from './types';
import { isPointInPolygon } from './geometry';

/**
 * Determines the terrain type at a specific point on the map.
 * It checks all terrain polygons and returns the one with the highest Z-index.
 */
export function getTerrainAtPoint(map: MapData, point: Point): TerrainDefinition | null {
    const matchingFeatures: TerrainFeature[] = [];

    // Check all terrain features
    for (const feature of map.layers.terrain) {
        if (isPointInPolygon(point, feature.polygon)) {
            matchingFeatures.push(feature);
        }
    }

    // If no terrain is found, it might be outside the map or in undefined space.
    if (matchingFeatures.length === 0) {
        return null;
    }

    // Sort by z_index descending to find the topmost layer
    matchingFeatures.sort((a, b) => b.z_index - a.z_index);

    const topFeature = matchingFeatures[0];
    const terrainDef = map.terrain_definitions[topFeature.type];

    if (!terrainDef) {
        console.warn(`Terrain type '${topFeature.type}' not found in definitions.`);
        return null;
    }

    return terrainDef;
}
