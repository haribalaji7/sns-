'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwin } from '@/context/DigitalTwinContext';

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: string;
  latitude: number;
  longitude: number;
  location?: string;
}

const scale = 1000;
const latLngToXZ = (lat: number, lng: number) => [
  (lng - -122.0840) * scale,
  (lat - 37.4220) * scale,
];

const typeColor: Record<string, string> = {
  fire: '#FF4D6D',
  medical: '#7C5CFF',
  crowd: '#FFB347',
  electrical: '#14F1D9',
  flood: '#3B82F6',
  default: '#8B9AB4',
};

export function IncidentLayer() {
  const { state: { incidents, showIncidents } } = useDigitalTwin();
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const clockRef = useRef(0);

  const { count, dummy, positions, colors, ids } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const positions: [number, number, number][] = [];
    const colors: THREE.Color[] = [];
    const ids: string[] = [];
    (incidents as Incident[]).forEach((inc) => {
      const [x, z] = latLngToXZ(inc.latitude, inc.longitude);
      positions.push([x, 8, z]);
      const hex = typeColor[inc.type] ?? typeColor.default;
      colors.push(new THREE.Color(hex));
      ids.push(inc.id);
    });
    return { count: Math.max(incidents.length, 1), dummy, positions, colors, ids };
  }, [incidents]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !showIncidents) return;
    clockRef.current = clock.getElapsedTime();
    (incidents as Incident[]).forEach((_, i) => {
      const [x, baseY, z] = positions[i] ?? [0, 8, 0];
      const pulse = Math.sin(clockRef.current * 3 + i) * 0.5;
      dummy.position.set(x, baseY + pulse, z);
      const s = 1.5 + Math.sin(clockRef.current * 2 + i) * 0.3;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      if (meshRef.current.instanceColor) {
        meshRef.current.setColorAt(i, colors[i] ?? new THREE.Color('#8B9AB4'));
      }
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!showIncidents || incidents.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          vertexColors
          emissiveIntensity={2}
          transparent
          opacity={0.92}
          roughness={0.2}
          metalness={0.5}
        />
      </instancedMesh>

      {/* Tooltip for each incident */}
      {(incidents as Incident[]).map((inc, i) => (
        <Html
          key={inc.id}
          position={positions[i] ?? [0, 8, 0]}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div
            style={{
              background: 'rgba(7,11,18,0.85)',
              border: `1px solid ${typeColor[inc.type] ?? '#8B9AB4'}`,
              borderRadius: 8,
              padding: '3px 8px',
              fontSize: 10,
              color: typeColor[inc.type] ?? '#F0F4FF',
              fontWeight: 600,
              backdropFilter: 'blur(6px)',
            }}
          >
            {inc.type.toUpperCase()} · {inc.location ?? inc.title}
          </div>
        </Html>
      ))}
    </group>
  );
}
