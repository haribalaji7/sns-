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

  useEffect(() => {
    if (!map) return;

    // Clear previous polygons
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    zones.forEach((zone) => {
      if (!zone.bounds || zone.bounds.length < 3) return;

      const path = zone.bounds.map(([lat, lng]) => ({ lat, lng }));
      const isDanger = zone.status === 'danger' || zone.riskScore > 70;
      const isCaution = zone.status === 'caution' || zone.riskScore > 40;

      const strokeColor = isDanger ? '#FF4D6D' : isCaution ? '#F59E0B' : '#00E59B';
      const fillColor = isDanger ? '#FF4D6D' : isCaution ? '#F59E0B' : '#00E59B';

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor,
        strokeOpacity: 0.8,
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
    });

    return () => {
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, zones, onSelectZone]);

  return null;
}
