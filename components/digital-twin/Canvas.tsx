'use client';

import { Canvas as ThreeCanvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { OrbitControls, Stars, Html, Grid } from '@react-three/drei';
import { BuildingLayer } from '@/components/digital-twin/BuildingLayer';
import { IncidentLayer } from '@/components/digital-twin/IncidentLayer';
import { ResponderLayer } from '@/components/digital-twin/ResponderLayer';
import { useDigitalTwin } from '@/context/DigitalTwinContext';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

// Camera reset helper that registers via window event
function CameraController() {
  const { camera, controls } = useThree() as any;
  const initialPos = useRef(new THREE.Vector3(40, 35, 40));

  useEffect(() => {
    const resetCamera = () => {
      camera.position.copy(initialPos.current);
      if (controls) {
        (controls as OrbitControlsImpl).target.set(0, 0, 0);
        (controls as OrbitControlsImpl).update();
      }
    };
    window.addEventListener('camera-reset', resetCamera);
    return () => window.removeEventListener('camera-reset', resetCamera);
  }, [camera, controls]);

  return null;
}

// Ground plane with grid
function CampusGround() {
  return (
    <>
      {/* Flat ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#0D1117" transparent opacity={0.9} />
      </mesh>
      {/* Grid lines */}
      <Grid
        args={[600, 600]}
        position={[0, 0, 0]}
        cellSize={20}
        cellThickness={0.4}
        cellColor="#14F1D9"
        sectionSize={100}
        sectionThickness={0.8}
        sectionColor="#7C5CFF"
        fadeDistance={400}
        fadeStrength={1.5}
        infiniteGrid
      />
    </>
  );
}

export default function Canvas() {
  const { state } = useDigitalTwin();

  return (
    <ThreeCanvas
      shadows
      camera={{ position: [40, 35, 40], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#070B12' }}
    >
      <Suspense fallback={<Html center><span style={{ color: '#14F1D9', fontSize: 14 }}>Loading 3D Scene…</span></Html>}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 20, 0]} intensity={0.6} color="#14F1D9" distance={150} />

        {/* Background stars */}
        <Stars radius={200} count={6000} depth={80} factor={5} saturation={0} fade speed={0.5} />

        {/* Ground */}
        <CampusGround />

        {/* Scene layers – visibility controlled by context */}
        {state.showBuildings && <BuildingLayer />}
        <IncidentLayer />
        <ResponderLayer />

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.1}
          minDistance={10}
          maxDistance={250}
          target={[0, 0, 0]}
        />

        {/* Camera reset wired via window events */}
        <CameraController />
      </Suspense>
    </ThreeCanvas>
  );
}
