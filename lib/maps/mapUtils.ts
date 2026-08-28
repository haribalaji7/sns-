// ─── Map Utility Functions & Marker Visualizers ──────────────────────────

export function severityToColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#FF4D6D';
    case 'high':
      return '#F59E0B';
    case 'medium':
      return '#7C5CFF';
    case 'low':
      return '#14F1D9';
    default:
      return '#14F1D9';
  }
}

export function incidentTypeToIcon(type: string): string {
  switch (type?.toLowerCase()) {
    case 'fire':
      return '🔥';
    case 'intrusion':
      return '🚨';
    case 'medical':
      return '🩺';
    case 'gas_leak':
    case 'gas':
      return '💨';
    case 'crowd':
      return '👥';
    case 'electrical':
      return '⚡';
    case 'flood':
      return '🌊';
    case 'suspicious':
      return '📦';
    default:
      return '⚠️';
  }
}

export function responderStatusToColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'on_scene':
      return '#00E59B';
    case 'dispatched':
    case 'en_route':
      return '#F59E0B';
    case 'available':
      return '#14F1D9';
    case 'offline':
    default:
      return '#4A5568';
  }
}

/**
 * Computes great-circle distance between two GPS coordinates in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Creates custom SVG data URL for incident markers
 */
export function createIncidentMarkerSvg(
  type: string,
  severity: string,
  isSelected: boolean = false,
): string {
  const color = severityToColor(severity);
  const icon = incidentTypeToIcon(type);
  const strokeWidth = isSelected ? 3 : 2;
  const haloRadius = isSelected ? 22 : 18;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="${haloRadius}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="${strokeWidth}" />
      <circle cx="24" cy="24" r="14" fill="#070B12" stroke="${color}" stroke-width="2" />
      <text x="24" y="29" font-size="14" text-anchor="middle" font-family="sans-serif">${icon}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Creates custom SVG data URL for responder markers
 */
export function createResponderMarkerSvg(
  role: string,
  status: string,
  name: string,
): string {
  const color = responderStatusToColor(status);
  const initial = name ? name.charAt(0).toUpperCase() : 'R';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="16" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2" />
      <circle cx="22" cy="22" r="11" fill="#070B12" stroke="${color}" stroke-width="2" />
      <text x="22" y="26" font-size="11" font-weight="bold" fill="#F0F4FF" text-anchor="middle" font-family="monospace">${initial}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Creates custom SVG for assembly points
 */
export function createSafeZoneMarkerSvg(name: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="14" fill="#00E59B" fill-opacity="0.2" stroke="#00E59B" stroke-width="2" />
      <circle cx="18" cy="18" r="8" fill="#00E59B" />
      <text x="18" y="21" font-size="9" font-weight="bold" fill="#070B12" text-anchor="middle" font-family="sans-serif">✓</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
