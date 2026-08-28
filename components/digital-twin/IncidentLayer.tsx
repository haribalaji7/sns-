'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwin } from '@/context/DigitalTwinContext';
import { toXZ, INCIDENT_COLORS } from '@/lib/scene/buildings';
import { simulateBlastRadiusExpansion } from '@/lib/ml/risk-prediction-engine';
import { findShortestSafePath, HazardZone } from '@/lib/pathfinding/astar';

// Demo incidents shown when Supabase has no realtime records
export const DEMO_INCIDENTS = [
  {
    id: 'd1',
    title: 'Lab Chemical Fire',
    type: 'fire',
    severity: 'critical',
    latitude: 37.4221,
    longitude: -122.0841,
    location: 'Science Block - Lab 302',
  },
  {
    id: 'd2',
    title: 'Cardiac Arrest',
    type: 'medical',
    severity: 'high',
    latitude: 37.4240,
    longitude: -122.0840,
    location: 'Hostel A - Wing B',
  },
  {
    id: 'd3',
    title: 'Crowd Congestion',
    type: 'crowd',
    severity: 'medium',
    latitude: 37.4250,
    longitude: -122.0842,
    location: 'Auditorium Main Exit',
  },
];

// ─── Pulsing Expanding Ground Ring Wave (for Crowd / Medical / Blast) ─────────
function ExpandingRingWave({ color, speedMultiplier = 1 }: { color: string; speedMultiplier?: number }) {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 1.5 * speedMultiplier;
    
    // Wave 1
    const p1 = (t % 2.0) / 2.0; // 0 to 1
    if (ring1Ref.current) {
      const scale1 = 1 + p1 * 18;
      ring1Ref.current.scale.set(scale1, scale1, 1);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - p1) * 0.7);
    }

    // Wave 2 (offset by 1.0s)
    const p2 = ((t + 1.0) % 2.0) / 2.0;
    if (ring2Ref.current) {
      const scale2 = 1 + p2 * 18;
      ring2Ref.current.scale.set(scale2, scale2, 1);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - p2) * 0.7);
    }
  });

  return (
    <group position={[0, 0.15, 0]}>
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Rising Smoke Particles for Fire ─────────────────────────────────────────
function FireSmokeParticles({ speedMultiplier = 1 }: { speedMultiplier?: number }) {
  const smokeRef = useRef<THREE.Points>(null!);
  const count = 28;

  const [positions, initialY] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 1] = 2 + Math.random() * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      initY[i] = pos[i * 3 + 1];
    }
    return [pos, initY];
  }, [count]);

  useFrame((_, delta) => {
    if (!smokeRef.current) return;
    const posAttr = smokeRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Rise up
      array[i * 3 + 1] += delta * 6 * speedMultiplier;
      // Slight outward dispersion
      const spread = (array[i * 3 + 1] - 2) * 0.05;
      array[i * 3 + 0] += (Math.sin(array[i * 3 + 1] + i) * delta * 2) * spread;

      // Reset when particle reaches top
      if (array[i * 3 + 1] > 18) {
        array[i * 3 + 1] = 2;
        array[i * 3 + 0] = (Math.random() - 0.5) * 4;
        array[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. Rising dark/ember smoke points */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.6}
          color="#FF6B6B"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Hot Sparks & Embers using Sparkles */}
      <Sparkles
        count={22}
        scale={[6, 12, 6]}
        size={4}
        speed={1.2 * speedMultiplier}
        color="#FF385C"
        opacity={0.8}
      />
    </group>
  );
}

// ─── Individual Incident Marker ───────────────────────────────────────────────
interface IncidentMarkerProps {
  incident: any;
  speedMultiplier: number;
}

function IncidentMarker({ incident, speedMultiplier }: IncidentMarkerProps) {
  const orbRef = useRef<THREE.Mesh>(null!);
  const cylinderRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  const color = INCIDENT_COLORS[incident.type] ?? INCIDENT_COLORS.default;
  const lat = incident.latitude ?? incident.location?.lat ?? 37.4221;
  const lng = incident.longitude ?? incident.location?.lng ?? -122.0841;
  const [x, z] = useMemo(() => toXZ(lat, lng), [lat, lng]);

  const [threatLevel, setThreatLevel] = useState<string>('contained');
  const [radiusM, setRadiusM] = useState(0);

  // Animate pulse orb
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3 * speedMultiplier;
    if (orbRef.current) {
      orbRef.current.position.y = 14 + Math.sin(t) * 1.5;
      orbRef.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.2);
    }
  });

  // Blast Radius ML Simulator
  useEffect(() => {
    let raf: number;
    const start = Date.now();

    const animate = () => {
      const secondsPassed = (Date.now() - start) / 1000;
      const simSeconds = Math.min(180, secondsPassed * 4 * speedMultiplier);

      const snapshot = simulateBlastRadiusExpansion(
        { x: 0, y: 0, lat, lng },
        simSeconds,
        { speedKmh: 14, directionDeg: 45 }
      );

      setThreatLevel(snapshot.threatLevel);
      setRadiusM(snapshot.radiusMeters);

      if (cylinderRef.current) {
        cylinderRef.current.scale.set(snapshot.radiusUnits, 1, snapshot.radiusUnits);
      }
      if (ringRef.current) {
        ringRef.current.scale.set(snapshot.radiusUnits * 1.05, 1, snapshot.radiusUnits * 1.05);
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [lat, lng, speedMultiplier]);

  return (
    <group position={[x, 0, z]}>
      {/* Dynamic 3D Threat Blast Radius Volumetric Cylinder */}
      <mesh ref={cylinderRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        <meshStandardMaterial
          color="#FF4D6D"
          emissive="#FF4D6D"
          emissiveIntensity={threatLevel === 'critical' ? 2.5 : 1.2}
          transparent
          opacity={threatLevel === 'critical' ? 0.35 : 0.22}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Pulsing Outer Hazard Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial color="#FFB347" transparent opacity={0.6} />
      </mesh>

      {/* Lightweight Type-Specific Particle Effects */}
      {incident.type === 'fire' ? (
        <FireSmokeParticles speedMultiplier={speedMultiplier} />
      ) : (
        <>
          <ExpandingRingWave color={color} speedMultiplier={speedMultiplier} />
          <Sparkles
            count={incident.type === 'medical' ? 14 : 18}
            scale={[6, 8, 6]}
            size={3.5}
            speed={0.8 * speedMultiplier}
            color={color}
            opacity={0.7}
          />
        </>
      )}

      {/* Vertical Light Beacon Column */}
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 14, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Pulsing Core Sphere */}
      <mesh ref={orbRef} position={[0, 14, 0]}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Floating Sci-Fi HUD Label */}
      <Html position={[0, 20, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(7,11,18,0.92)',
            border: `1px solid ${color}`,
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 10,
            color,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 8px ${color}30`,
          }}
        >
          {incident.type?.toUpperCase()} · RADIUS: {radiusM}m [{threatLevel.toUpperCase()}] · {incident.location ?? incident.title}
        </div>
      </Html>
    </group>
  );
}

// ─── Dynamic A* Evacuation Trail ────────────────────────────────────────────
function DynamicEvacuationRoute3D() {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    let raf: number;
    const start = Date.now();
    let lastRadius = -1;

    const animate = () => {
      const secondsPassed = (Date.now() - start) / 1000;
      const simSeconds = Math.min(180, secondsPassed * 4);

      const snapshot = simulateBlastRadiusExpansion(
        { x: 230, y: 320, lat: 37.4221, lng: -122.0841 },
        simSeconds,
        { speedKmh: 14, directionDeg: 45 }
      );

      // Recalculate A* only when hazard radius changes significantly
      if (Math.abs(snapshot.radiusUnits - lastRadius) > 1.0) {
        lastRadius = snapshot.radiusUnits;

        const hazard: HazardZone = {
          id: 'hz-1',
          x: snapshot.center.x,
          y: snapshot.center.y,
          radius: snapshot.radiusUnits,
          severity: 'critical',
        };

        const result = findShortestSafePath('N-SCIB-302', [hazard], []);
        if (result && result.path.length > 0) {
          const vPoints = result.path.map((p) => {
            const [x, z] = toXZ(p.lat, p.lng);
            return new THREE.Vector3(x, 0.5, z);
          });
          setPoints(vPoints);
        }
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (points.length < 2) return null;

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
  const tubeGeometry = new THREE.TubeGeometry(curve, Math.max(32, points.length * 10), 0.45, 8, false);

  return (
    <group>
      {/* Outer Glow Tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#14F1D9" transparent opacity={0.4} />
      </mesh>
      {/* Core Laser Trail */}
      <mesh geometry={tubeGeometry} scale={[0.9, 0.9, 0.9]}>
        <meshStandardMaterial
          color="#22D3A5"
          emissive="#14F1D9"
          emissiveIntensity={2.0}
        />
      </mesh>
    </group>
  );
}

// ─── Master Incident Layer ───────────────────────────────────────────────────
export function IncidentLayer() {
  const { state } = useDigitalTwin();
  const { showIncidents, emergencyMode, incidents } = state;

  if (!showIncidents) return null;

  const data = incidents.length > 0 ? incidents : DEMO_INCIDENTS;
  const speedMultiplier = emergencyMode ? 2.5 : 1.0;

  return (
    <group>
      {data.map((inc: any) => (
        <IncidentMarker
          key={inc.id}
          incident={inc}
          speedMultiplier={speedMultiplier}
        />
      ))}
      <DynamicEvacuationRoute3D />
    </group>
  );
}
