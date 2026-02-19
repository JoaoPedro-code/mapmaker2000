import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import type { MapData } from '../game-logic/types';
import * as PIXI from 'pixi.js';

interface MapLayerProps {
  mapData: MapData;
}

const parseColor = (color: string): number => {
  if (color.startsWith('#')) {
    return parseInt(color.slice(1), 16);
  }
  const colors: Record<string, number> = {
    blue: 0x0000FF,
    green: 0x00FF00,
    brown: 0x8B4513,
    white: 0xFFFFFF,
    black: 0x000000
  };
  return colors[color.toLowerCase()] || 0xCCCCCC;
};

const MapLayer: React.FC<MapLayerProps> = ({ mapData }) => {
  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();

    // Sort features by z-index so higher layers are drawn on top
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
  }, [mapData]);

  return <Graphics draw={draw} />;
};

export default MapLayer;
