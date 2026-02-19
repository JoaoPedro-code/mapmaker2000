# Map Editor - Polygon Pen Tool Architecture

## Overview
The Polygon Pen Tool is the core interaction mechanism for defining terrain and territories in the Map Editor. It allows designers to trace over a background image (the "Reference Map") to create vector polygons that the game engine uses for collision and movement logic.

## 1. Tool State Machine

The tool operates as a finite state machine (FSM) to handle user input via mouse or touch.

### States
1.  **Idle**: Waiting for the user to start drawing.
2.  **Drawing**: The user has placed the first vertex and is adding subsequent points.
3.  **Editing**: The user has selected an existing polygon and is modifying its vertices.

### Transitions
- **Idle -> Drawing**: Click on the map canvas.
- **Drawing -> Drawing**: Click to add a new vertex.
- **Drawing -> Idle**:
    - *Commit*: Click on the first vertex (close loop) or press Enter.
    - *Cancel*: Press Escape.
- **Idle -> Editing**: Click on an existing polygon.

## 2. Interaction Logic

### Creating a New Polygon
1.  **Start**: User selects "Pen Tool" and a target "Terrain Type" (e.g., Mountain) from the UI.
2.  **First Point**: User clicks at $(x_0, y_0)$. A vertex marker appears.
3.  **Extension**: As the mouse moves, a temporary "rubber band" line is drawn from the last vertex to the cursor position.
4.  **Add Vertex**: User clicks at $(x_1, y_1)$. The line $(x_0, y_0) \rightarrow (x_1, y_1)$ becomes solid.
5.  **Closing the Loop**:
    - If the user clicks near the starting point (within `snap_radius`), the polygon closes automatically.
    - The system validates that the polygon is simple (no self-intersections).
6.  **Commit**: The new polygon is added to the active `MapLayer` with the selected `TerrainType`.

### Editing Polygons
- **Select**: Clicking a polygon handles highlights it and shows all vertices as draggable handles.
- **Move Vertex**: Dragging a handle updates the coordinate in real-time.
- **Insert Vertex**: Clicking on an edge (segment) splits it, adding a new vertex.
- **Delete Vertex**: Right-clicking (or Alt-Clicking) a vertex removes it and connects its neighbors.

## 3. Rendering (Pixi.js Implementation)

The editor uses Pixi.js for high-performance rendering.

- **Graphics Object**: A single `PIXI.Graphics` object is used for the "active" drawing to ensure fluid 60 FPS updates.
- **Layering**:
    - `BackgroundSprite`: The reference image.
    - `TerrainContainer`: Contains completed polygons, rendered as filled shapes with low opacity (0.5) to see the background.
    - `EditOverlay`: Contains the active drawing, handles (circles), and temporary lines.

```typescript
// Pseudocode for rendering the active line
function onMouseMove(event) {
    if (state === 'DRAWING') {
        graphics.clear();
        graphics.lineStyle(2, 0xFF0000);
        graphics.moveTo(lastVertex.x, lastVertex.y);
        graphics.lineTo(event.global.x, event.global.y);
    }
}
```

## 4. Data Integration

When a polygon is committed, it is serialized into the JSON structure defined in `map_schema.md`.

```typescript
interface EditorAction {
    type: 'ADD_POLYGON';
    layerId: string; // e.g., 'terrain'
    data: TerrainFeature;
}
```

### Undo/Redo System
All actions (Add, Move, Delete) are pushed to an `ActionStack` to support Undo (Ctrl+Z).

## 5. Advanced Features needed for "Carving"
To support "carving" (e.g., drawing a Lake inside a Land mass):
- The editor supports **Polygon Boolean Operations** (Union, Difference, Intersection) using a library like `polygon-clipping` or `clipper-js`.
- When drawing a "Sea" polygon on top of "Land", the user can choose "Subtract Mode" to cut a hole in the Land polygon, or simply place it on a higher Z-index layer (as per our Engine Architecture, z-index is simpler and non-destructive).

## 6. Validation
Before saving:
1.  Check for self-intersections.
2.  Ensure minimum vertex distance (remove micro-segments).
3.  Ensure winding order (e.g., clockwise) for consistency.
