'use client';

import { useEffect, useRef } from 'react';
import { createSafeZoneMarkerSvg } from '@/lib/maps/mapUtils';

interface SafeRouteLayerProps {
  map: google.maps.Map | null;
  routes?: {
    id: string;
    coordinates: { lat: number; lng: number }[];
    type: 'primary' | 'alternative' | 'blocked';
  }[];
  assemblyPoints?: {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
  }[];
}

const DEFAULT_ROUTES = [
  {
    id: 'route-scib-alpha',
    type: 'primary' as const,
    coordinates: [
      { lat: 28.6139, lng: 77.209 },
      { lat: 28.6142, lng: 77.2092 },
      { lat: 28.6147, lng: 77.2091 },
      { lat: 28.6155, lng: 77.209 },
    ],
  },
  {
    id: 'route-it-beta',
    type: 'alternative' as const,
    coordinates: [
      { lat: 28.6145, lng: 77.2085 },
      { lat: 28.6148, lng: 77.2082 },
      { lat: 28.6155, lng: 77.2075 },
    ],
  },
];

const DEFAULT_ASSEMBLY_POINTS = [
  { id: 'safe-alpha', name: 'Assembly Zone Alpha (North Quad)', coordinates: { lat: 28.6155, lng: 77.209 } },
  { id: 'safe-beta', name: 'Assembly Zone Beta (Main Gate)', coordinates: { lat: 28.6155, lng: 77.2075 } },
  { id: 'safe-gamma', name: 'Assembly Zone Gamma (Athletic Field)', coordinates: { lat: 28.6125, lng: 77.2092 } },
];

export function SafeRouteLayer({
  map,
  routes = DEFAULT_ROUTES,
  assemblyPoints = DEFAULT_ASSEMBLY_POINTS,
}: SafeRouteLayerProps) {
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<(google.maps.marker.AdvancedMarkerElement | google.maps.Marker)[]>([]);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;

    // Clear previous elements
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    markersRef.current.forEach((m) => {
      if ('map' in m) m.map = null;
      else (m as google.maps.Marker).setMap(null);
    });
    markersRef.current = [];

    // Render Routes
    routes.forEach((r) => {
      const isPrimary = r.type === 'primary';
      const isBlocked = r.type === 'blocked';
      const color = isBlocked ? '#FF4D6D' : isPrimary ? '#14F1D9' : '#7C5CFF';

      // Outer glow line
      const glowPolyline = new google.maps.Polyline({
        path: r.coordinates,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.35,
        strokeWeight: 8,
        map,
        zIndex: 15,
      });

      // Core route line
      const corePolyline = new google.maps.Polyline({
        path: r.coordinates,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.95,
        strokeWeight: 3.5,
        map,
        zIndex: 16,
      });

      polylinesRef.current.push(glowPolyline, corePolyline);
    });

    // Render Safe Assembly Point Markers using custom SVG Marker
    assemblyPoints.forEach((point) => {
      const svgIcon = createSafeZoneMarkerSvg(point.name);
      const marker = new window.google.maps.Marker({
        position: point.coordinates,
        map,
        title: point.name,
        zIndex: 40,
        icon: {
          url: svgIcon,
          scaledSize: new window.google.maps.Size(36, 36),
          anchor: new window.google.maps.Point(18, 18),
        },
      });
      markersRef.current.push(marker);
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      markersRef.current.forEach((m) => {
        if ('map' in m) m.map = null;
        else (m as google.maps.Marker).setMap(null);
      });
      markersRef.current = [];
    };
  }, [map, routes, assemblyPoints]);

  return null;
}
