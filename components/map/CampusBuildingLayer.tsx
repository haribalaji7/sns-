'use client';

import { useEffect, useRef } from 'react';
import type { CampusZone } from '@/types';

interface CampusBuildingLayerProps {
  map: google.maps.Map | null;
  zones: CampusZone[];
  onSelectZone?: (zone: CampusZone) => void;
}

export function CampusBuildingLayer({
  map,
  zones,
  onSelectZone,
}: CampusBuildingLayerProps) {
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;

    // Clear previous polygons and label markers
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    zones.forEach((zone) => {
      if (!zone.bounds || zone.bounds.length < 3) return;

      const path = zone.bounds.map(([lat, lng]) => ({ lat, lng }));
      const isDanger = zone.status === 'danger' || zone.riskScore > 70;
      const isCaution = zone.status === 'caution' || zone.riskScore > 40;

      const strokeColor = isDanger ? '#FF4D6D' : isCaution ? '#F59E0B' : '#14F1D9';
      const fillColor = isDanger ? '#FF4D6D' : isCaution ? '#F59E0B' : '#00E59B';

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor,
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor,
        fillOpacity: isDanger ? 0.25 : 0.12,
        map,
        zIndex: 5,
      });

      polygon.addListener('click', () => {
        onSelectZone?.(zone);
      });

      polygonsRef.current.push(polygon);

      // Compute centroid for label badge
      let latSum = 0;
      let lngSum = 0;
      path.forEach((p) => {
        latSum += p.lat;
        lngSum += p.lng;
      });
      const center = {
        lat: latSum / path.length,
        lng: lngSum / path.length,
      };

      // Truncate building name to avoid collision and overlap
      const truncatedName =
        zone.name.length > 16 ? `${zone.name.slice(0, 14)}…` : zone.name;

      const svgBadge = `
        <svg xmlns="http://www.w3.org/2000/svg" width="130" height="24" viewBox="0 0 130 24">
          <rect x="1" y="1" width="128" height="22" rx="6" fill="#070B12" fill-opacity="0.92" stroke="${strokeColor}" stroke-width="1.2" />
          <text x="65" y="15" fill="#F0F4FF" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">${truncatedName}</text>
        </svg>
      `;

      const marker = new window.google.maps.Marker({
        position: center,
        map,
        title: `${zone.name} (${zone.id}) — Risk: ${zone.riskScore ?? 0}% · Occupancy: ${zone.occupancy ?? 0}`,
        zIndex: 6,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgBadge)}`,
          scaledSize: new window.google.maps.Size(130, 24),
          anchor: new window.google.maps.Point(65, 12),
        },
      });

      marker.addListener('click', () => {
        onSelectZone?.(zone);
      });

      markersRef.current.push(marker);
    });

    return () => {
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, zones, onSelectZone]);

  return null;
}
