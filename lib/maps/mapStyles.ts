// ─── Google Maps Map Styles for CampusShield AI ─────────────────────────────
// Supports Dark Command Center (#070B12) and Light Enterprise (#F5F7FB).

export const DARK_COMMAND_CENTER_MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#070b12' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#070b12' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b9ab4' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#14f1d9' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0c121d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#09151c' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#121b2a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a273a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b9ab4' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1c2d47' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#243b5e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f0f4ff' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#0e1826' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7c5cff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#05111f' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#14f1d9' }, { opacity: 0.8 }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#05111f' }],
  },
];

export const LIGHT_COMMAND_CENTER_MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f7fb' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0ea5a5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eef2f6' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dcfce7' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#16a34a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fed7aa' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#fdba74' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9a3412' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6d5ef7' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2fe' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0ea5a5' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#bae6fd' }],
  },
];
