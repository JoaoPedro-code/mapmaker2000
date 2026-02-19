# atWar Clone - Map and Terrain System

## Project Overview
This project is a Proof of Concept (PoC) for a web-based clone of the "atWar" strategy game. The focus of this module is the Map and Terrain System, specifically handling vector-based territories, movement validation, and collision logic.

## Technical Architecture
- **Language**: TypeScript
- **Map Format**: JSON (GeoJSON-like structure)
- **Geometry**: Custom polygon algorithms for collision and pathfinding.

## Directory Structure
- `docs/`: Architectural documentation and schema definitions.
- `src/`: Source code for the movement and collision logic.

## Key Features Implemented
1.  **Map Data Structure**: JSON schema for territories and terrains.
2.  **Movement Validation**: Algorithm to check movement validity based on range and terrain cost.
3.  **Collision Logic**: Point-in-Polygon checks.
4.  **Editor Logic**: Design for the Polygon Pen Tool.

## Usage
To run the movement validation tests:
```bash
npx tsx src/test_movement.ts
```
