'use client';

import { useEffect, useRef } from 'react';
import { severityToColor } from '@/lib/maps/mapUtils';
import type { Incident } from '@/types';

interface EmergencyRadiusProps {
  map: google.maps.Map | null;
  incident: Incident;
  radiusMeters?: number;
}

export function EmergencyRadius({
  map,
  incident,
  radiusMeters = 80,
}: EmergencyRadiusProps) {
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const color = severityToColor(incident.severity);
    const radius =
      incident.severity === 'critical'
        ? 110
        : incident.severity === 'high'
        ? 80
        : 50;

    const center = {
      lat: incident.coordinates.lat,
      lng: incident.coordinates.lng,
    };

    if (!circleRef.current) {
      const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: color,
        fillOpacity: 0.18,
        map,
        center,
        radius,
        clickable: false,
        zIndex: 10,
      });

      circleRef.current = circle;
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
      circleRef.current.setOptions({
        strokeColor: color,
        fillColor: color,
      });
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, incident, radiusMeters]);

  return null;
}
