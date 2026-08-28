// ─── Campus A* Shortest Safe Pathfinding Engine ──────────────────────────────
// Computes optimal hazard-aware evacuation routes around danger zones, blast radii, and blocked roads

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  x: number; // Normalized coordinate 0..1000 for SVG/Canvas
  y: number; // Normalized coordinate 0..1000 for SVG/Canvas
  isSafeExit?: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  distance: number;
  isBlocked?: boolean;
}

export interface HazardZone {
  id: string;
  x: number;
  y: number;
  radius: number; // Hazard radius in coordinate units
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// ─── Default Campus Navigation Graph Nodes ──────────────────────────────────
export const CAMPUS_NODES: MapPoint[] = [
  // Science Block B Area
  { id: 'N-SCIB-302', name: 'Lab 302 Interior', lat: 28.6139, lng: 77.2090, x: 230, y: 320 },
  { id: 'N-SCIB-CORR', name: 'Science B 3F Corridor', lat: 28.6140, lng: 77.2091, x: 280, y: 320 },
  { id: 'N-SCIB-STAIR-E', name: 'East Stairwell B2', lat: 28.6141, lng: 77.2093, x: 340, y: 300 },
  { id: 'N-SCIB-STAIR-W', name: 'West Fume Stairwell', lat: 28.6138, lng: 77.2087, x: 180, y: 340 },

  // Central Walkways
  { id: 'N-CENTRAL-QUAD', name: 'Central Quad Walkway', lat: 28.6143, lng: 77.2089, x: 450, y: 380 },
  { id: 'N-NORTH-AVENUE', name: 'North Campus Avenue', lat: 28.6149, lng: 77.2088, x: 460, y: 220 },
  { id: 'N-SOUTH-ALLEY', name: 'South Promenade', lat: 28.6133, lng: 77.2091, x: 440, y: 560 },

  // IT Building Area
  { id: 'N-IT-B1', name: 'IT Server Vault B1', lat: 28.6145, lng: 77.2085, x: 740, y: 260 },
  { id: 'N-IT-CORR', name: 'IT Ground Lobby', lat: 28.6146, lng: 77.2086, x: 680, y: 280 },
  { id: 'N-IT-RAMP', name: 'IT Service Ramp', lat: 28.6144, lng: 77.2084, x: 720, y: 350 },

  // Athletic Pavilion
  { id: 'N-ATH-TRACK', name: 'Indoor Athletic Track', lat: 28.6130, lng: 77.2095, x: 320, y: 680 },
  { id: 'N-ATH-EXIT-S', name: 'Gym South Concourse', lat: 28.6128, lng: 77.2096, x: 360, y: 740 },

  // Library Area
  { id: 'N-LIB-B1', name: 'Library Archives B1', lat: 28.6148, lng: 77.2098, x: 680, y: 580 },
  { id: 'N-LIB-MAIN', name: 'Library Main Rotunda', lat: 28.6150, lng: 77.2099, x: 640, y: 520 },

  // Safe Exit Assembly Points
  { id: 'SAFE-NORTH-QUAD', name: 'Assembly Zone Alpha (North Quad)', lat: 28.6155, lng: 77.2090, x: 500, y: 120, isSafeExit: true },
  { id: 'SAFE-WEST-GATE', name: 'Assembly Zone Beta (Main Gate)', lat: 28.6155, lng: 77.2075, x: 120, y: 180, isSafeExit: true },
  { id: 'SAFE-ATH-FIELD', name: 'Assembly Zone Gamma (Athletic Field)', lat: 28.6125, lng: 77.2092, x: 420, y: 880, isSafeExit: true },
  { id: 'SAFE-EAST-PARK', name: 'Assembly Zone Delta (East Park)', lat: 28.6145, lng: 77.2105, x: 880, y: 480, isSafeExit: true },
];

// ─── Default Campus Edges ───────────────────────────────────────────────────
export const CAMPUS_EDGES: MapEdge[] = [
  // Science B Links
  { from: 'N-SCIB-302', to: 'N-SCIB-CORR', distance: 50 },
  { from: 'N-SCIB-CORR', to: 'N-SCIB-STAIR-E', distance: 70 },
  { from: 'N-SCIB-CORR', to: 'N-SCIB-STAIR-W', distance: 100 },
  { from: 'N-SCIB-STAIR-E', to: 'N-CENTRAL-QUAD', distance: 130 },
  { from: 'N-SCIB-STAIR-W', to: 'SAFE-WEST-GATE', distance: 180 },

  // Central Walkway Connections
  { from: 'N-CENTRAL-QUAD', to: 'N-NORTH-AVENUE', distance: 160 },
  { from: 'N-CENTRAL-QUAD', to: 'N-SOUTH-ALLEY', distance: 180 },
  { from: 'N-CENTRAL-QUAD', to: 'N-IT-CORR', distance: 250 },

  // North Avenue Connections
  { from: 'N-NORTH-AVENUE', to: 'SAFE-NORTH-QUAD', distance: 110 },
  { from: 'N-NORTH-AVENUE', to: 'SAFE-WEST-GATE', distance: 340 },
  { from: 'N-NORTH-AVENUE', to: 'N-IT-CORR', distance: 230 },

  // IT Links
  { from: 'N-IT-B1', to: 'N-IT-CORR', distance: 60 },
  { from: 'N-IT-B1', to: 'N-IT-RAMP', distance: 90 },
  { from: 'N-IT-CORR', to: 'SAFE-NORTH-QUAD', distance: 240 },
  { from: 'N-IT-RAMP', to: 'SAFE-EAST-PARK', distance: 210 },
  { from: 'N-IT-RAMP', to: 'N-LIB-MAIN', distance: 190 },

  // Athletic Links
  { from: 'N-ATH-TRACK', to: 'N-ATH-EXIT-S', distance: 70 },
  { from: 'N-ATH-TRACK', to: 'N-SOUTH-ALLEY', distance: 170 },
  { from: 'N-ATH-EXIT-S', to: 'SAFE-ATH-FIELD', distance: 150 },
  { from: 'N-SOUTH-ALLEY', to: 'SAFE-ATH-FIELD', distance: 320 },

  // Library Links
  { from: 'N-LIB-B1', to: 'N-LIB-MAIN', distance: 80 },
  { from: 'N-LIB-MAIN', to: 'SAFE-EAST-PARK', distance: 240 },
  { from: 'N-LIB-MAIN', to: 'N-SOUTH-ALLEY', distance: 210 },
];

function euclideanDistance(a: MapPoint, b: MapPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isNearHazard(point: MapPoint, hazards: HazardZone[]): boolean {
  for (const h of hazards) {
    const dist = Math.hypot(point.x - h.x, point.y - h.y);
    if (dist < h.radius) {
      return true;
    }
  }
  return false;
}

export interface AStarResult {
  path: MapPoint[];
  distance: number;
  safeExit: MapPoint;
  steps: { instruction: string; distanceMeters: number }[];
  isReroutedAroundBlast?: boolean;
}

/**
 * A* Search Algorithm: Computes the shortest hazard-free evacuation path
 * from a start node to the closest safe assembly exit, dynamically avoiding active blast radii.
 */
export function findShortestSafePath(
  startNodeId: string,
  hazards: HazardZone[] = [],
  blockedEdges: string[] = [],
  customDestinationId?: string,
): AStarResult | null {
  const nodeMap = new Map<string, MapPoint>();
  CAMPUS_NODES.forEach((n) => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(startNodeId);
  if (!startNode) return null;

  // Build Adjacency Graph
  const adjacency = new Map<string, Array<{ to: string; distance: number }>>();
  CAMPUS_NODES.forEach((n) => adjacency.set(n.id, []));

  CAMPUS_EDGES.forEach((e) => {
    const edgeKey1 = `${e.from}->${e.to}`;
    const edgeKey2 = `${e.to}->${e.from}`;

    if (blockedEdges.includes(edgeKey1) || blockedEdges.includes(edgeKey2)) {
      return;
    }

    const fromNode = nodeMap.get(e.from);
    const toNode = nodeMap.get(e.to);

    if (!fromNode || !toNode) return;

    // Apply severe penalty if node is inside or near dynamic hazard/blast zone
    const fromNear = isNearHazard(fromNode, hazards);
    const toNear = isNearHazard(toNode, hazards);

    let weightMultiplier = 1.0;
    if (fromNear || toNear) {
      weightMultiplier = 25.0; // Dynamic hazard penalty
    }

    adjacency.get(e.from)?.push({ to: e.to, distance: e.distance * weightMultiplier });
    adjacency.get(e.to)?.push({ to: e.from, distance: e.distance * weightMultiplier });
  });

  // Identify Safe Assembly Exits
  const targetExits = customDestinationId
    ? [nodeMap.get(customDestinationId)!].filter(Boolean)
    : CAMPUS_NODES.filter((n) => n.isSafeExit && !isNearHazard(n, hazards));

  if (targetExits.length === 0) return null;

  let bestResult: AStarResult | null = null;
  let minDistance = Infinity;

  // Run A* towards each safe exit candidate
  for (const exit of targetExits) {
    const openSet = new Set<string>([startNodeId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    CAMPUS_NODES.forEach((n) => gScore.set(n.id, Infinity));
    gScore.set(startNodeId, 0);

    const fScore = new Map<string, number>();
    CAMPUS_NODES.forEach((n) => fScore.set(n.id, Infinity));
    fScore.set(startNodeId, euclideanDistance(startNode, exit));

    while (openSet.size > 0) {
      let currentId: string | null = null;
      let lowestF = Infinity;

      openSet.forEach((id) => {
        const f = fScore.get(id) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          currentId = id;
        }
      });

      if (!currentId) break;

      if (currentId === exit.id) {
        // Reconstruct path
        const reconstructed: MapPoint[] = [];
        let curr: string | undefined = currentId;
        while (curr) {
          reconstructed.unshift(nodeMap.get(curr)!);
          curr = cameFrom.get(curr);
        }

        const totalDist = gScore.get(exit.id) ?? 0;
        if (totalDist < minDistance) {
          minDistance = totalDist;

          // Generate step-by-step guidance
          const steps: { instruction: string; distanceMeters: number }[] = [];
          for (let i = 0; i < reconstructed.length - 1; i++) {
            const from = reconstructed[i];
            const to = reconstructed[i + 1];
            const d = Math.round(euclideanDistance(from, to));
            steps.push({
              instruction: `Proceed from ${from.name} toward ${to.name}`,
              distanceMeters: d,
            });
          }

          bestResult = {
            path: reconstructed,
            distance: Math.round(totalDist),
            safeExit: exit,
            steps,
            isReroutedAroundBlast: hazards.length > 0,
          };
        }
        break;
      }

      openSet.delete(currentId);
      const neighbors = adjacency.get(currentId) || [];

      for (const neighbor of neighbors) {
        const tentativeG = (gScore.get(currentId) ?? Infinity) + neighbor.distance;

        if (tentativeG < (gScore.get(neighbor.to) ?? Infinity)) {
          cameFrom.set(neighbor.to, currentId);
          gScore.set(neighbor.to, tentativeG);

          const neighborNode = nodeMap.get(neighbor.to)!;
          const h = euclideanDistance(neighborNode, exit);
          fScore.set(neighbor.to, tentativeG + h);

          openSet.add(neighbor.to);
        }
      }
    }
  }

  return bestResult;
}
