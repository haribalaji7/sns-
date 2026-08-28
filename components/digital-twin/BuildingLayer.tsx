import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { buildings } from '@/lib/scene/buildings';

// Simple conversion from lat/lng to X/Z plane (scale factor for visual spacing)
const scale = 1000; // 1 degree ≈ 1000 units in scene
const latLngToXZ = (lat: number, lng: number) => [
  (lng - -122.0840) * scale, // X (east-west)
  (lat - 37.4220) * scale, // Z (north-south)
];

export function BuildingLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Prepare instance data
  const { count, dummy, positions, colors, heights, ids } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const positions: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const heights: number[] = [];
    const ids: string[] = [];
    buildings.forEach((b) => {
      const [x, z] = latLngToXZ(b.position.lat, b.position.lng);
      positions.push(new THREE.Vector3(x, 0, z));
      heights.push(b.height);
      // health status color
      let col = new THREE.Color('#10F1D9'); // default teal safe
      switch (b.health) {
        case 'safe': col = new THREE.Color('#22D3A5'); break; // green teal
        case 'warning': col = new THREE.Color('#FFB347'); break; // orange
        case 'critical': col = new THREE.Color('#FF4D6D'); break; // red
        case 'medical': col = new THREE.Color('#7C5CFF'); break; // purple
        default: col = new THREE.Color('#8B9AB4');
      }
      colors.push(col);
      ids.push(b.id);
    });
    return { count: buildings.length, dummy, positions, colors, heights, ids };
  }, []);

  // Update instance matrices each frame (handle hover elevation)
  useFrame(() => {
    if (!meshRef.current) return;
    buildings.forEach((b, i) => {
      const pos = positions[i];
      const height = heights[i];
      const elevation = hoveredId === ids[i] ? 2 : 0; // lift 2 units on hover
      dummy.position.set(pos.x, elevation, pos.z);
      dummy.scale.set(10, height, 10); // uniform footprint, height varies
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      // set color attribute
      meshRef.current.setColorAt(i, colors[i]);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    const index = e.instanceId as number;
    setHoveredId(ids[index]);
  }, [ids]);

  const handlePointerOut = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const index = e.instanceId as number;
    const building = buildings[index];
    // Emit a custom event – parent components can listen via context or a simple callback.
    const ev = new CustomEvent('building-selected', { detail: building });
    window.dispatchEvent(ev);
  }, []);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors={true}
          transparent={true}
          opacity={0.9}
          metalness={0.2}
          roughness={0.4}
        />
      </instancedMesh>

      {/* Tooltip for hovered building */}
      {hoveredId && (
        <Html position={positions[ids.indexOf(hoveredId)]} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 bg-[#1A202C] text-[#F0F4F8] rounded shadow-lg text-sm">
            {buildings.find((b) => b.id === hoveredId)?.name}
          </div>
        </Html>
      )}
    </group>
  );
}
