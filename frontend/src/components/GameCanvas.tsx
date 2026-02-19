import React, { useState, useCallback, useEffect } from 'react';
import { Stage, Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import MapLayer from './MapLayer';
import type { MapData, Unit, Point } from '../game-logic/types';
import { validateMovement } from '../game-logic/movement';
import { distance } from '../game-logic/geometry';
import { getSocket } from '../socket';

// Initialize socket
const socket = getSocket();

const GameCanvas: React.FC = () => {
  // State from server
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [role, setRole] = useState<string>('observer');
  const [turn, setTurn] = useState<number>(1);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [otherReady, setOtherReady] = useState<string[]>([]);

  // Local interaction state
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<Point | null>(null);
  const [isValidMove, setIsValidMove] = useState<boolean>(false);

  // Track local intents to visualize them before turn end
  const [localIntents, setLocalIntents] = useState<Map<string, Point>>(new Map());

  useEffect(() => {
    // Listen for initial state
    socket.on('welcome', (data: { role: string, map: MapData, units: Unit[] }) => {
        console.log("Welcome!", data);
        setRole(data.role);
        setMapData(data.map);
        setUnits(data.units);
    });

    socket.on('turn_processed', (data: { turn: number, units: Unit[] }) => {
        console.log("Turn processed:", data);
        setTurn(data.turn);
        setUnits(data.units);
        setIsReady(false);
        setOtherReady([]);
        setLocalIntents(new Map()); // Clear local visualizations
    });

    socket.on('player_ready', (data: { role: string }) => {
        setOtherReady(prev => [...prev, data.role]);
    });

    return () => {
        socket.off('welcome');
        socket.off('turn_processed');
        socket.off('player_ready');
    };
  }, []);

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Handle pointer events
  const onPointerDown = (e: PIXI.FederatedPointerEvent) => {
    const clickPos = { x: e.global.x, y: e.global.y };

    // Check if clicked on a unit
    const clickedUnit = units.find(u => distance(u.position, clickPos) <= 15);

    if (clickedUnit) {
      if (clickedUnit.owner_id === role) {
          setSelectedUnitId(clickedUnit.id);
          setDragTarget(null);
          e.stopPropagation();
      } else {
          // Can select enemy to see stats? Yes.
          setSelectedUnitId(clickedUnit.id);
          setDragTarget(null);
      }
    } else {
      setSelectedUnitId(null);
      setDragTarget(null);
    }
  };

  const onPointerMove = (e: PIXI.FederatedPointerEvent) => {
    if (selectedUnitId && e.buttons === 1) {
       // Only allow moving own units
       const unit = units.find(u => u.id === selectedUnitId);
       if (unit && unit.owner_id === role) {
           const currentPos = { x: e.global.x, y: e.global.y };
           setDragTarget(currentPos);

           if (mapData) {
               const valid = validateMovement(unit, currentPos, mapData);
               setIsValidMove(valid);
           }
       }
    }
  };

  const onPointerUp = () => {
    if (selectedUnitId && dragTarget) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit && unit.owner_id === role && isValidMove) {
        // Emit intent to server
        socket.emit('submit_intent', { unit_id: unit.id, target: dragTarget });

        // Update local intent for visualization
        setLocalIntents(prev => new Map(prev).set(unit.id, dragTarget));
      }
      setDragTarget(null);
    }
  };

  const handleCommitTurn = () => {
      socket.emit('commit_turn');
      setIsReady(true);
  };

  const drawUnits = useCallback((g: PIXI.Graphics) => {
    g.clear();
    units.forEach(unit => {
      const isSelected = unit.id === selectedUnitId;

      // Color based on owner
      // p1: Red, p2: Blue, p3: Green
      let color = 0x888888;
      if (unit.owner_id === 'p1') color = 0xFF0000;
      if (unit.owner_id === 'p2') color = 0x0000FF;
      if (unit.owner_id === 'p3') color = 0x00FF00;

      g.beginFill(color);
      g.lineStyle(2, isSelected ? 0xFFFF00 : 0x000000);
      g.drawCircle(unit.position.x, unit.position.y, 10);
      g.endFill();

      // Draw HP bar
      const hpPct = unit.hp / unit.max_hp;
      g.beginFill(0x000000);
      g.drawRect(unit.position.x - 10, unit.position.y - 15, 20, 4);
      g.beginFill(0x00FF00);
      g.drawRect(unit.position.x - 10, unit.position.y - 15, 20 * hpPct, 4);

      if (isSelected) {
        g.lineStyle(1, 0xFFFFFF, 0.5);
        g.drawCircle(unit.position.x, unit.position.y, unit.max_range);
      }
    });
  }, [units, selectedUnitId]);

  const drawDragLine = useCallback((g: PIXI.Graphics) => {
    g.clear();
    // 1. Draw dragged line
    if (selectedUnitId && dragTarget) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit && unit.owner_id === role) {
        const color = isValidMove ? 0x00FF00 : 0xFF0000;
        g.lineStyle(2, color);
        g.moveTo(unit.position.x, unit.position.y);
        g.lineTo(dragTarget.x, dragTarget.y);
        g.beginFill(color);
        g.drawCircle(dragTarget.x, dragTarget.y, 5);
        g.endFill();
      }
    }

    // 2. Draw existing intents (Ghost lines)
    localIntents.forEach((target, unitId) => {
        // Don't draw if currently dragging this one
        if (unitId === selectedUnitId && dragTarget) return;

        const unit = units.find(u => u.id === unitId);
        if (unit) {
            g.lineStyle(2, 0xFFFFFF, 0.7); // White dashed?
            g.moveTo(unit.position.x, unit.position.y);
            g.lineTo(target.x, target.y);
            g.beginFill(0xFFFFFF);
            g.drawCircle(target.x, target.y, 3);
            g.endFill();
        }
    });

  }, [selectedUnitId, dragTarget, isValidMove, units, localIntents, role]);

  if (!mapData) return <div>Loading Map...</div>;

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

      {/* UI Overlay */}
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
            <p>Owner: {selectedUnit.owner_id}</p>
            <p>HP: {selectedUnit.hp}/{selectedUnit.max_hp}</p>
            <p>Atk: {selectedUnit.attack} | Def: {selectedUnit.defense}</p>
          </>
        ) : (
          <p>Select a unit</p>
        )}
      </div>

      <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '5px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
      }}>
          <h3>Turn {turn}</h3>
          <p>You are: <span style={{color: role === 'p1' ? 'red' : role === 'p2' ? 'blue' : 'green'}}>{role}</span></p>

          <div style={{marginBottom: '10px'}}>
              Ready: {otherReady.join(', ')}
          </div>

          <button
            disabled={isReady}
            onClick={handleCommitTurn}
            style={{
                padding: '10px 20px',
                fontSize: '16px',
                background: isReady ? '#555' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isReady ? 'default' : 'pointer'
            }}
          >
              {isReady ? "Waiting..." : "End Turn"}
          </button>
      </div>
    </div>
  );
};

export default GameCanvas;
