import React, { useState, useCallback } from 'react';
import { Stage, Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import type { MapData, Point } from '../game-logic/types';

// Initial Empty Map for Editor
const INITIAL_MAP_DATA: MapData = {
    name: "New Map",
    version: "1.0",
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
          { type: "sea", z_index: 0, polygon: [{x:0,y:0}, {x:2000,y:0}, {x:2000,y:2000}, {x:0,y:2000}] }
      ],
      territories: [],
      cities: []
    }
  };

const MapEditor: React.FC = () => {
  const [mapData, setMapData] = useState<MapData>(INITIAL_MAP_DATA);
  const [activeTerrain, setActiveTerrain] = useState<string>("land");
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);

  const parseColor = (color: string): number => {
    if (color.startsWith('#')) return parseInt(color.slice(1), 16);
    return 0xFFFFFF;
  };

  const onPointerDown = (e: PIXI.FederatedPointerEvent) => {
    const clickPos = { x: e.global.x, y: e.global.y };
    setCurrentPolygon(prev => [...prev, clickPos]);
  };

  const handleFinishPolygon = () => {
    if (currentPolygon.length < 3) return;

    // Determine Z-index based on type
    let z = 1;
    if (activeTerrain === "sea") z = 0;
    if (activeTerrain === "mountain") z = 2;
    if (activeTerrain === "forest") z = 2;

    const newFeature = {
        type: activeTerrain,
        z_index: z,
        polygon: currentPolygon
    };

    setMapData(prev => ({
        ...prev,
        layers: {
            ...prev.layers,
            terrain: [...prev.layers.terrain, newFeature]
        }
    }));

    setCurrentPolygon([]);
  };

  const handleExport = () => {
      const json = JSON.stringify(mapData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'map_data.json';
      a.click();
  };

  const drawMap = useCallback((g: PIXI.Graphics) => {
    g.clear();

    // Draw Existing
    const sortedFeatures = [...mapData.layers.terrain].sort((a, b) => a.z_index - b.z_index);
    sortedFeatures.forEach(feature => {
      const def = mapData.terrain_definitions[feature.type];
      const color = def ? parseColor(def.color) : 0xCCCCCC;

      g.beginFill(color);
      g.lineStyle(1, 0x000000, 0.5);
      const path = feature.polygon.flatMap(p => [p.x, p.y]);
      g.drawPolygon(path);
      g.endFill();
    });

    // Draw Active Polygon
    if (currentPolygon.length > 0) {
        g.lineStyle(2, 0xFF00FF);
        g.moveTo(currentPolygon[0].x, currentPolygon[0].y);
        for (let i = 1; i < currentPolygon.length; i++) {
            g.lineTo(currentPolygon[i].x, currentPolygon[i].y);
        }

        // Draw Points
        g.beginFill(0xFF00FF);
        currentPolygon.forEach(p => g.drawCircle(p.x, p.y, 4));
        g.endFill();
    }

  }, [mapData, currentPolygon]);

  return (
    <div style={{ position: 'relative' }}>
      <Stage width={800} height={600} options={{ backgroundColor: 0x333333 }}>
        <Container
            interactive={true}
            hitArea={new PIXI.Rectangle(0, 0, 800, 600)}
            pointerdown={onPointerDown}
        >
          <Graphics draw={drawMap} />
        </Container>
      </Stage>

      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px' }}>
          <h3>Map Editor</h3>
          <div style={{ marginBottom: '10px'}}>
            <label>Terrain Type: </label>
            <select value={activeTerrain} onChange={(e) => setActiveTerrain(e.target.value)}>
                {Object.keys(mapData.terrain_definitions).map(key => (
                    <option key={key} value={key}>{key}</option>
                ))}
            </select>
          </div>
          <button onClick={handleFinishPolygon} disabled={currentPolygon.length < 3}>Finish Polygon</button>
          <button onClick={() => setCurrentPolygon([])} style={{marginLeft: '10px'}}>Clear Points</button>
          <div style={{ marginTop: '20px'}}>
              <button onClick={handleExport}>Export JSON</button>
          </div>
          <div style={{marginTop: '10px', fontSize: '12px'}}>
              Click to add points. "Finish Polygon" to commit.
          </div>
      </div>
    </div>
  );
};

export default MapEditor;
