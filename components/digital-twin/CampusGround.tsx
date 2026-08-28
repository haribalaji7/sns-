'use client';

import React, { useMemo, useRef } from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import { buildings, toXZ } from '@/lib/scene/buildings';

// ─── Tree Cluster Definitions ────────────────────────────────────────────────
interface TreeData {
  position: [number, number, number];
  scale: number;
  rotationY: number;
  foliageColor: THREE.Color;
}

const TREE_CLUSTER_CENTERS: Array<[number, number, number, number]> = [
  // [centerX, centerZ, radius, count]
  [-14, 0, 12, 7],      // South Entrance Park
  [16, 22, 10, 6],      // Science-Library Courtyard
  [16, 92, 12, 8],      // Hostel Quad Green
  [-16, 134, 10, 6],    // Cafeteria Plaza
  [14, 176, 10, 6],     // Medical Center Garden
];

function generateTreeData(): TreeData[] {
  const trees: TreeData[] = [];
  const colorPalette = [
    new THREE.Color('#0D9488'), // teal-600
    new THREE.Color('#059669'), // emerald-600
    new THREE.Color('#10B981'), // emerald-500
    new THREE.Color('#14F1D9'), // cyber teal
  ];

  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  TREE_CLUSTER_CENTERS.forEach(([cx, cz, rad, count]) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (pseudoRandom() - 0.5) * 0.8;
      const dist = (pseudoRandom() * 0.7 + 0.3) * rad;
      const x = cx + Math.cos(angle) * dist;
      const z = cz + Math.sin(angle) * dist;
      const scale = 0.8 + pseudoRandom() * 0.5;
      const rotationY = pseudoRandom() * Math.PI * 2;
      const color = colorPalette[Math.floor(pseudoRandom() * colorPalette.length)];

      trees.push({
        position: [x, 0, z],
        scale,
        rotationY,
        foliageColor: color,
      });
    }
  });

  return trees;
}

function LowPolyTrees() {
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null!);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null!);

  const treeList = useMemo(() => generateTreeData(), []);

  useMemo(() => {
    // Setup matrices and colors once on mount
    const dummy = new THREE.Object3D();

    setTimeout(() => {
      if (!trunkMeshRef.current || !foliageMeshRef.current) return;

      treeList.forEach((tree, i) => {
        // 1. Trunk transform
        dummy.position.set(tree.position[0], 1.2 * tree.scale, tree.position[2]);
        dummy.scale.set(tree.scale, tree.scale, tree.scale);
        dummy.rotation.set(0, tree.rotationY, 0);
        dummy.updateMatrix();
        trunkMeshRef.current.setMatrixAt(i, dummy.matrix);

        // 2. Foliage transform (stacked above trunk)
        dummy.position.set(tree.position[0], 3.2 * tree.scale, tree.position[2]);
        dummy.scale.set(tree.scale * 1.8, tree.scale * 2.2, tree.scale * 1.8);
        dummy.rotation.set(0, tree.rotationY, 0);
        dummy.updateMatrix();
        foliageMeshRef.current.setMatrixAt(i, dummy.matrix);
        foliageMeshRef.current.setColorAt(i, tree.foliageColor);
      });

      trunkMeshRef.current.instanceMatrix.needsUpdate = true;
      foliageMeshRef.current.instanceMatrix.needsUpdate = true;
      if (foliageMeshRef.current.instanceColor) {
        foliageMeshRef.current.instanceColor.needsUpdate = true;
      }
    }, 0);
  }, [treeList]);

  return (
    <group>
      {/* Trunks */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[undefined, undefined, treeList.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.25, 0.4, 2.4, 5]} />
        <meshStandardMaterial color="#1E293B" roughness={0.9} metalness={0.1} />
      </instancedMesh>

      {/* Low-Poly Foliage Canopies */}
      <instancedMesh
        ref={foliageMeshRef}
        args={[undefined, undefined, treeList.length]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.2}
          emissiveIntensity={0.25}
          flatShading
        />
      </instancedMesh>
    </group>
  );
}

// ─── Campus Walkways & Paths ─────────────────────────────────────────────────
function Walkways() {
  const pathSegments = useMemo(() => {
    const segments: Array<{ x: number; z: number; width: number; depth: number }> = [];

    // 1. Central spine walkway connecting south to north
    segments.push({
      x: 0,
      z: 90,
      width: 5,
      depth: 210,
    });

    // 2. Branch connectors to each building
    buildings.forEach((b) => {
      const [bx, bz] = toXZ(b.position.lat, b.position.lng);
      // Horizontal connector from spine (x=0) to building (x=bx)
      const connectorWidth = Math.abs(bx) + 2;
      const connectorX = bx / 2;
      segments.push({
        x: connectorX,
        z: bz,
        width: Math.max(connectorWidth, 6),
        depth: 4,
      });
    });

    return segments;
  }, []);

  return (
    <group position={[0, 0.05, 0]}>
      {pathSegments.map((seg, i) => (
        <group key={i} position={[seg.x, 0, seg.z]}>
          {/* Main walkway dark slate slab */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[seg.width, seg.depth]} />
            <meshStandardMaterial
              color="#0B1322"
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>
          {/* Subtle glowing outline ribbon on path edges */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[seg.width + 0.4, seg.depth + 0.4]} />
            <meshBasicMaterial
              color="#14F1D9"
              transparent
              opacity={0.12}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Parking Lot Patch ────────────────────────────────────────────────────────
function ParkingLotPatch() {
  // Parking lot located in front of / beside parking building
  const [parkingX, parkingZ] = toXZ(37.4260, -122.0845); // [-20, 160]

  return (
    <group position={[parkingX - 16, 0.06, parkingZ]}>
      {/* Asphalt Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 32]} />
        <meshStandardMaterial
          color="#080E18"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* Parking Lot Glowing Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[26.4, 32.4]} />
        <meshBasicMaterial color="#7C5CFF" transparent opacity={0.25} />
      </mesh>

      {/* Painted Parking Stalls (Rows of stalls) */}
      {[-10, 0, 10].map((rx, rIdx) => (
        <group key={rIdx} position={[rx, 0.02, 0]}>
          {[-12, -8, -4, 0, 4, 8, 12].map((sz, sIdx) => (
            <mesh key={sIdx} position={[0, 0, sz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[6, 0.2]} />
              <meshBasicMaterial color="#14F1D9" transparent opacity={0.65} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Entry Marking */}
      <mesh position={[10, 0.02, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial color="#FFB347" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// ─── Master Campus Ground Component ──────────────────────────────────────────
export function CampusGround({ emergencyMode = false }: { emergencyMode?: boolean }) {
  const ringColor = emergencyMode ? '#FF4D6D' : '#14F1D9';
  const gridCellColor = emergencyMode ? '#FF4D6D' : '#14F1D9';
  const gridSectionColor = emergencyMode ? '#990022' : '#7C5CFF';

  return (
    <group>
      {/* 1. Base Pedestal with Bevel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 90]} receiveShadow>
        <cylinderGeometry args={[260, 275, 1.2, 64]} />
        <meshStandardMaterial
          color="#060A14"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* 2. Glowing Perimeter Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 90]}>
        <ringGeometry args={[258, 261, 64]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={emergencyMode ? 0.45 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Main Ground Terrain Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 90]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial
          color="#04070F"
          metalness={0.2}
          roughness={0.85}
        />
      </mesh>

      {/* 4. Sci-Fi Campus Grid */}
      <Grid
        args={[800, 800]}
        position={[0, 0, 90]}
        cellSize={15}
        cellThickness={0.4}
        cellColor={gridCellColor}
        sectionSize={75}
        sectionThickness={1.0}
        sectionColor={gridSectionColor}
        fadeDistance={320}
        fadeStrength={2.5}
        infiniteGrid
      />

      {/* 5. Walkways Connecting Buildings */}
      <Walkways />

      {/* 6. Parking Lot Surface */}
      <ParkingLotPatch />

      {/* 7. Low-Poly Landscaping Trees */}
      <LowPolyTrees />
    </group>
  );
}
