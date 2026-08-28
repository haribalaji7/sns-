'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDigitalTwin } from '@/context/DigitalTwinContext';

interface Responder {
  id: string;
  name: string;
  role: string;
  latitude: number;
  longitude: number;
  status: string;
}

const scale = 1000;
const latLngToXZ = (lat: number, lng: number) => [
  (lng - -122.0840) * scale,
  (lat - 37.4220) * scale,
];

const roleColor: Record<string, string> = {
  fire_fighter: '#FF4D6D',
  medic: '#7C5CFF',
  security: '#14F1D9',
  officer: '#FFB347',
  default: '#F0F4FF',
};

export function ResponderLayer() {
  const { state: { responders, showResponders } } = useDigitalTwin();
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { count, positions, colors } = useMemo(() => {
    const positions: [number, number, number][] = [];
    const colors: THREE.Color[] = [];
    (responders as Responder[]).forEach((r) => {
      const [x, z] = latLngToXZ(r.latitude, r.longitude);
      positions.push([x, 2, z]);
      const hex = roleColor[r.role] ?? roleColor.default;
      colors.push(new THREE.Color(hex));
    });
    return { count: Math.max(responders.length, 1), positions, colors };
  }, [responders]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !showResponders) return;
    (responders as Responder[]).forEach((_, i) => {
      const [x, baseY, z] = positions[i] ?? [0, 2, 0];
      const bob = Math.sin(clock.getElapsedTime() * 2 + i * 0.7) * 0.3;
      dummy.position.set(x, baseY + bob, z);
      dummy.scale.setScalar(1.4);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      if (meshRef.current.instanceColor) {
        meshRef.current.setColorAt(i, colors[i] ?? new THREE.Color('#F0F4FF'));
      }
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!showResponders || responders.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
      <meshStandardMaterial
        vertexColors
        emissiveIntensity={1.5}
        roughness={0.3}
        metalness={0.4}
      />
    </instancedMesh>
  );
}
