'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import {
  buildings,
  CampusBuilding,
  toXZ,
  HEALTH_COLORS,
} from '@/lib/scene/buildings';
import { useDigitalTwin } from '@/context/DigitalTwinContext';

// Cache generated window grid textures to avoid re-creating canvas textures on every render
const textureCache = new Map<string, THREE.CanvasTexture>();

function getWindowGridTexture(floors: number, healthColorHex: string): THREE.CanvasTexture {
  const key = `${floors}_${healthColorHex}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  // Create canvas texture on client
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(null as any);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base dark glass panel background
    ctx.fillStyle = '#060B14';
    ctx.fillRect(0, 0, 256, 512);

    const numFloors = Math.max(floors, 2);
    const floorHeight = 512 / numFloors;
    const numCols = 6;
    const colWidth = 256 / numCols;

    // Floor dividers
    ctx.fillStyle = '#17253B';
    for (let f = 0; f <= numFloors; f++) {
      ctx.fillRect(0, f * floorHeight - 1, 256, 3);
    }

    // Mullions and window panes
    for (let f = 0; f < numFloors; f++) {
      for (let c = 0; c < numCols; c++) {
        const isLit = (f * 5 + c * 7 + 3) % 4 !== 0;
        const wx = c * colWidth + 4;
        const wy = f * floorHeight + 4;
        const ww = colWidth - 8;
        const wh = floorHeight - 8;

        if (isLit) {
          ctx.fillStyle = healthColorHex;
          ctx.globalAlpha = 0.38 + ((f * 3 + c * 2) % 3) * 0.15;
          ctx.fillRect(wx, wy, ww, wh);

          // Subtle inner window glow
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = 0.2;
          ctx.fillRect(wx + 2, wy + 2, ww - 4, 2);
        } else {
          ctx.fillStyle = '#08101E';
          ctx.globalAlpha = 0.9;
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  textureCache.set(key, texture);
  return texture;
}

interface BuildingItemProps {
  building: CampusBuilding;
  isSelected: boolean;
  onSelect: (b: CampusBuilding) => void;
}

function BuildingItem({ building, isSelected, onSelect }: BuildingItemProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const currentElevation = useRef(0);

  const [x, z] = useMemo(() => toXZ(building.position.lat, building.position.lng), [building.position]);
  const [width, depth] = building.footprint || [16, 16];
  const height = building.height;
  const healthColor = HEALTH_COLORS[building.health] ?? '#8B9AB4';

  const windowTexture = useMemo(
    () => getWindowGridTexture(building.floors, healthColor),
    [building.floors, healthColor]
  );

  // Inset dimensions for roof cap (penthouse) and base podium
  const capWidth = Math.max(width * 0.82, width - 2.5);
  const capDepth = Math.max(depth * 0.82, depth - 2.5);
  const capHeight = Math.min(2.5, height * 0.12);

  const podiumWidth = width + 1.8;
  const podiumDepth = depth + 1.8;
  const podiumHeight = 1.0;

  // Smooth hover elevation
  useFrame((_, delta) => {
    const targetElevation = (hovered || isSelected) ? 1.5 : 0;
    currentElevation.current = THREE.MathUtils.damp(
      currentElevation.current,
      targetElevation,
      10,
      delta
    );
    if (groupRef.current) {
      groupRef.current.position.y = currentElevation.current;
    }
  });

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect(building);
    },
    [building, onSelect]
  );

  return (
    <group position={[x, 0, z]}>
      <group ref={groupRef}>
        {/* 1. Base Foundation Podium */}
        <mesh
          position={[0, podiumHeight / 2, 0]}
          receiveShadow
          castShadow
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <boxGeometry args={[podiumWidth, podiumHeight, podiumDepth]} />
          <meshStandardMaterial
            color="#0A101C"
            metalness={0.8}
            roughness={0.3}
          />
          <Edges
            linewidth={1.5}
            threshold={20}
            color="#14F1D9"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* 2. Main Architectural Structure */}
        <mesh
          position={[0, podiumHeight + height / 2, 0]}
          receiveShadow
          castShadow
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            map={windowTexture}
            color="#152238"
            emissive={healthColor}
            emissiveIntensity={isSelected ? 0.9 : hovered ? 0.7 : 0.25}
            transparent
            opacity={0.88}
            metalness={0.7}
            roughness={0.25}
          />
          {/* Glowing architectural edges */}
          <Edges
            linewidth={2}
            threshold={15}
            color={healthColor}
            transparent
            opacity={isSelected ? 1 : hovered ? 0.9 : 0.55}
          />
        </mesh>

        {/* 3. Inset Roof Cap / Mechanical Penthouse */}
        <mesh
          position={[0, podiumHeight + height + capHeight / 2, 0]}
          receiveShadow
          castShadow
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <boxGeometry args={[capWidth, capHeight, capDepth]} />
          <meshStandardMaterial
            color="#0E1829"
            emissive={healthColor}
            emissiveIntensity={isSelected ? 0.6 : 0.2}
            metalness={0.85}
            roughness={0.2}
          />
          <Edges
            linewidth={1.5}
            threshold={15}
            color={healthColor}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* 4. Rooftop Details: HVAC Box / Heli-Ring / Communications Beacon */}
        <group position={[0, podiumHeight + height + capHeight, 0]}>
          {/* Rooftop glow ring / Helipad perimeter */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[Math.min(capWidth, capDepth) * 0.25, Math.min(capWidth, capDepth) * 0.35, 32]} />
            <meshBasicMaterial
              color={healthColor}
              transparent
              opacity={isSelected ? 1.0 : hovered ? 0.8 : 0.45}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Roof Antenna / Status Beacon */}
          <mesh position={[capWidth * 0.3, 1.5, capDepth * 0.3]}>
            <cylinderGeometry args={[0.08, 0.12, 3, 8]} />
            <meshBasicMaterial color="#14F1D9" />
          </mesh>
          <mesh position={[capWidth * 0.3, 3.1, capDepth * 0.3]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial color={healthColor} />
          </mesh>
        </group>

        {/* 5. Selected State Highlight Ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <ringGeometry args={[Math.max(width, depth) * 0.8, Math.max(width, depth) * 0.85, 48]} />
            <meshBasicMaterial color="#14F1D9" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* 6. Hover Tooltip Overlay */}
        {hovered && (
          <Html
            position={[0, podiumHeight + height + capHeight + 4, 0]}
            center
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          >
            <div
              style={{
                background: 'rgba(7, 11, 18, 0.94)',
                border: `1px solid ${healthColor}`,
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 11,
                color: '#F0F4FF',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 10px ${healthColor}40`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">{building.name}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: `${healthColor}25`, color: healthColor }}
                >
                  {building.health}
                </span>
              </div>
              <div className="text-[10px] text-[#8B9AB4] mt-0.5 flex items-center gap-2">
                <span>{building.floors} Floors</span>
                <span>•</span>
                <span>{building.footprint[0]}m × {building.footprint[1]}m</span>
                {building.occupancy && (
                  <>
                    <span>•</span>
                    <span>👥 {building.occupancy}</span>
                  </>
                )}
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

interface BuildingLayerProps {
  onSelect: (b: CampusBuilding) => void;
  selectedId?: string | null;
}

export function BuildingLayer({ onSelect, selectedId }: BuildingLayerProps) {
  const { state } = useDigitalTwin();

  if (!state.showBuildings) return null;

  return (
    <group>
      {buildings.map((b) => (
        <BuildingItem
          key={b.id}
          building={b}
          isSelected={selectedId === b.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
