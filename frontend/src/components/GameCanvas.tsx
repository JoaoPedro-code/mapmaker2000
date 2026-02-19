import React, { useState, useCallback } from 'react';
import { Stage, Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import MapLayer from './MapLayer';
import type { MapData, Unit, Point } from '../game-logic/types';
import { MOCK_MAP } from '../mockData';
import { validateMovement } from '../game-logic/movement';
import { distance } from '../game-logic/geometry';

const INITIAL_UNITS: Unit[] = [
  { id: 'u1', type: 'infantry', owner_id: 'p1', position: { x: 150, y: 150 }, max_range: 100 },
  { id: 'u2', type: 'tank', owner_id: 'p1', position: { x: 400, y: 300 }, max_range: 200 }
];

const GameCanvas: React.FC = () => {
  const [mapData] = useState<MapData>(MOCK_MAP);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<Point | null>(null);
  const [isValidMove, setIsValidMove] = useState<boolean>(false);

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Handle pointer events
  const onPointerDown = (e: PIXI.FederatedPointerEvent) => {
    const clickPos = { x: e.global.x, y: e.global.y };

    // Check if clicked on a unit
    const clickedUnit = units.find(u => distance(u.position, clickPos) <= 15);

    if (clickedUnit) {
      setSelectedUnitId(clickedUnit.id);
      setDragTarget(null);
      e.stopPropagation();
    } else {
      setSelectedUnitId(null);
      setDragTarget(null);
    }
  };

  const onPointerMove = (e: PIXI.FederatedPointerEvent) => {
    if (selectedUnitId && e.buttons === 1) {
       const currentPos = { x: e.global.x, y: e.global.y };
       setDragTarget(currentPos);

       const unit = units.find(u => u.id === selectedUnitId);
       if (unit) {
           const valid = validateMovement(unit, currentPos, mapData);
           setIsValidMove(valid);
       }
    }
  };

  const onPointerUp = () => {
    if (selectedUnitId && dragTarget) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit && isValidMove) {
        setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, position: dragTarget } : u));
      }
      setDragTarget(null);
    }
  };

  const drawUnits = useCallback((g: PIXI.Graphics) => {
    g.clear();
    units.forEach(unit => {
      const isSelected = unit.id === selectedUnitId;
      g.beginFill(isSelected ? 0xFFFF00 : 0xFF0000);
      g.lineStyle(2, 0x000000);
      g.drawCircle(unit.position.x, unit.position.y, 10);
      g.endFill();

      if (isSelected) {
        g.lineStyle(1, 0xFFFFFF, 0.5);
        g.drawCircle(unit.position.x, unit.position.y, unit.max_range);
      }
    });
  }, [units, selectedUnitId]);

  const drawDragLine = useCallback((g: PIXI.Graphics) => {
    g.clear();
    if (selectedUnitId && dragTarget) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit) {
        const color = isValidMove ? 0x00FF00 : 0xFF0000;
        g.lineStyle(2, color);
        g.moveTo(unit.position.x, unit.position.y);
        g.lineTo(dragTarget.x, dragTarget.y);
        g.beginFill(color);
        g.drawCircle(dragTarget.x, dragTarget.y, 5);
        g.endFill();
      }
    }
  }, [selectedUnitId, dragTarget, isValidMove, units]);

  return (
    <div style={{ position: 'relative' }}>
      <Stage width={800} height={600} options={{ backgroundColor: 0x1099bb }}>
        <Container
          interactive={true}
          hitArea={new PIXI.Rectangle(0, 0, 800, 600)}
          pointerdown={onPointerDown}
          pointermove={onPointerMove}
          pointerup={onPointerUp}
          pointerupoutside={onPointerUp}
        >
          <MapLayer mapData={mapData} />
          <Graphics draw={drawUnits} />
          <Graphics draw={drawDragLine} />
        </Container>
      </Stage>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        pointerEvents: 'none'
      }}>
        <h3>Unit Info</h3>
        {selectedUnit ? (
          <>
            <p>ID: {selectedUnit.id}</p>
            <p>Type: {selectedUnit.type}</p>
            <p>Pos: {Math.round(selectedUnit.position.x)}, {Math.round(selectedUnit.position.y)}</p>
            {dragTarget && (
              <p>Status: {isValidMove ? 'Valid Move' : 'Invalid Move'}</p>
            )}
          </>
        ) : (
          <p>Select a unit to move</p>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
