'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwin } from '@/context/DigitalTwinContext';
import { toXZ, ROLE_COLORS } from '@/lib/scene/buildings';

// Demo responders shown when Supabase has no records
export const DEMO_RESPONDERS = [
  {
    id: 'r1',
    name: 'Officer Davis',
    role: 'security',
    status: 'patrol',
    latitude: 37.4222,
    longitude: -122.0843,
  },
  {
    id: 'r2',
    name: 'Medic Unit 4',
    role: 'medic',
    status: 'en_route',
    latitude: 37.4238,
    longitude: -122.0839,
  },
  {
    id: 'r3',
    name: 'Fire Squad 1',
    role: 'fire_fighter',
    status: 'on_scene',
    latitude: 37.4228,
    longitude: -122.0844,
  },
];

interface ResponderMarkerProps {
  responder: any;
  index: number;
}

function ResponderMarker({ responder, index }: ResponderMarkerProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const lat = responder.latitude ?? responder.position?.lat ?? 37.4222;
  const lng = responder.longitude ?? responder.position?.lng ?? -122.0843;
  const [x, z] = useMemo(() => toXZ(lat, lng), [lat, lng]);
  const color = ROLE_COLORS[responder.role] ?? '#F0F4FF';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = 1.2 + Math.sin(t * 2.5 + index) * 0.35;
    }
    if (ringRef.current) {
      const p = (t * 1.2 + index * 0.4) % 1.5 / 1.5;
      const s = 1 + p * 2.5;
      ringRef.current.scale.set(s, s, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - p) * 0.6);
    }
  });

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <group position={[x, 0, z]}>
      {/* Expanding ground sonar ping */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.6, 0.75, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Holographic Responder Avatar */}
      <group
        ref={groupRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Torso Capsule */}
        <mesh position={[0, 1.0, 0]}>
          <capsuleGeometry args={[0.45, 1.0, 4, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Visor / Head Sphere */}
        <mesh position={[0, 2.0, 0]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={color}
            emissiveIntensity={1.0}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Halo Beacon Ring */}
        <mesh position={[0, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Tooltip / Name Tag on hover */}
      {hovered && (
        <Html position={[0, 5, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <div
            style={{
              background: 'rgba(7, 11, 18, 0.94)',
              border: `1px solid ${color}`,
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 10,
              color: '#F0F4FF',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 4px 14px rgba(0,0,0,0.6)`,
            }}
          >
            <div className="font-bold">{responder.name}</div>
            <div className="text-[9px] uppercase mt-0.5" style={{ color }}>
              {responder.role?.replace('_', ' ')} · {responder.status?.replace('_', ' ')}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function ResponderLayer() {
  const { state } = useDigitalTwin();
  const { showResponders, responders } = state;

  if (!showResponders) return null;

  const data = responders.length > 0 ? responders : DEMO_RESPONDERS;

  return (
    <group>
      {data.map((r: any, idx: number) => (
        <ResponderMarker key={r.id} responder={r} index={idx} />
      ))}
    </group>
  );
}
