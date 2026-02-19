// Point type for coordinates
export interface Point {
  x: number;
  y: number;
}

// Polygon type: Array of points forming a closed loop
export type Polygon = Point[];

// Terrain Definition
export interface TerrainDefinition {
  id: string;
  move_cost: number;
  color: string;
  restricted_units?: string[];
}

// Map Layer Feature (Terrain)
export interface TerrainFeature {
  type: string; // Refers to a TerrainDefinition.id
  z_index: number;
  polygon: Polygon;
}

// Territory Definition (Political)
export interface Territory {
  id: string;
  name: string;
  owner_id: string | null;
  polygon: Polygon;
  neighbors: string[];
}

// City Definition
export interface City {
  id: string;
  name: string;
  x: number;
  y: number;
  territory_id: string;
  sp_yield: number;
}

// Complete Map Data Structure
export interface MapData {
  name: string;
  version: string;
  width: number;
  height: number;
  terrain_definitions: { [key: string]: TerrainDefinition };
  layers: {
    terrain: TerrainFeature[];
    territories: Territory[];
    cities: City[];
  };
}

// Unit Definition (for movement validation context)
export interface Unit {
  id: string;
  type: string; // e.g., 'infantry', 'tank'
  owner_id: string;
  position: Point;
  max_range: number; // Movement range in base units
}
