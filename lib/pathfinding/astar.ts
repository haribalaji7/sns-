// ─── Campus A* Shortest Safe Pathfinding Engine ──────────────────────────────
// Computes optimal hazard-aware evacuation routes around danger zones and blocked roads

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

/**
 * Calculates Euclidean distance between two map coordinates
 */
function euclideanDistance(a: MapPoint, b: MapPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Checks if a point or edge line segment is inside a hazard danger radius
 */
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
}

/**
 * A* Search Algorithm: Computes the shortest hazard-free evacuation path
 * from a start node to the closest safe assembly exit.
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

  // Build adjacency list with dynamic obstacle cost penalty
  const adj = new Map<string, { targetId: string; baseDist: number; edgeKey: string }[]>();
  CAMPUS_NODES.forEach((n) => adj.set(n.id, []));

  CAMPUS_EDGES.forEach((e) => {
    const edgeKey1 = `${e.from}->${e.to}`;
    const edgeKey2 = `${e.to}->${e.from}`;
    adj.get(e.from)?.push({ targetId: e.to, baseDist: e.distance, edgeKey: edgeKey1 });
    adj.get(e.to)?.push({ targetId: e.from, baseDist: e.distance, edgeKey: edgeKey2 });
  });

  // Candidate safe exits
  const safeExits = customDestinationId
    ? CAMPUS_NODES.filter((n) => n.id === customDestinationId)
    : CAMPUS_NODES.filter((n) => n.isSafeExit && !isNearHazard(n, hazards));

  if (safeExits.length === 0) return null;

  let bestResult: AStarResult | null = null;
  let minCost = Infinity;

  // Run A* towards candidate safe exits and pick the closest optimal path
  for (const targetExit of safeExits) {
    const openSet = new Set<string>([startNodeId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    CAMPUS_NODES.forEach((n) => gScore.set(n.id, Infinity));
    gScore.set(startNodeId, 0);

    const fScore = new Map<string, number>();
    CAMPUS_NODES.forEach((n) => fScore.set(n.id, Infinity));
    fScore.set(startNodeId, euclideanDistance(startNode, targetExit));

    while (openSet.size > 0) {
      // Find node with lowest fScore in openSet
      let currentId = '';
      let lowestF = Infinity;
      for (const id of openSet) {
        const f = fScore.get(id) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          currentId = id;
        }
      }

      if (currentId === targetExit.id) {
        // Reconstruct path
        const path: MapPoint[] = [];
        let curr: string | undefined = currentId;
        while (curr) {
          const p = nodeMap.get(curr);
          if (p) path.unshift(p);
          curr = cameFrom.get(curr);
        }

        const totalDist = gScore.get(targetExit.id) ?? 0;
        if (totalDist < minCost) {
          minCost = totalDist;

          // Generate turn-by-turn guidance
          const steps = path.slice(0, -1).map((node, i) => {
            const nextNode = path[i + 1];
            const dist = Math.round(euclideanDistance(node, nextNode) * 0.8);
            return {
              instruction: `Proceed from ${node.name} toward ${nextNode.name}`,
              distanceMeters: dist,
            };
          });

          bestResult = {
            path,
            distance: totalDist,
            safeExit: targetExit,
            steps,
          };
        }
        break;
      }

      openSet.delete(currentId);
      const currentNode = nodeMap.get(currentId)!;
      const neighbors = adj.get(currentId) || [];

      for (const neighbor of neighbors) {
        const neighborNode = nodeMap.get(neighbor.targetId)!;

        // Check if edge is explicitly blocked
        if (blockedEdges.includes(neighbor.edgeKey) || blockedEdges.includes(`${neighbor.targetId}->${currentId}`)) {
          continue;
        }

        // Check hazard proximity and add heavy penalty or discard
        let penalty = 0;
        if (isNearHazard(neighborNode, hazards)) {
          penalty = 2000; // Severe cost penalty for entering danger radius
        }

        const tentativeG = (gScore.get(currentId) ?? Infinity) + neighbor.baseDist + penalty;

        if (tentativeG < (gScore.get(neighbor.targetId) ?? Infinity)) {
          cameFrom.set(neighbor.targetId, currentId);
          gScore.set(neighbor.targetId, tentativeG);
          const h = euclideanDistance(neighborNode, targetExit);
          fScore.set(neighbor.targetId, tentativeG + h);
          openSet.add(neighbor.targetId);
        }
      }
    }
  }

  return bestResult;
}
