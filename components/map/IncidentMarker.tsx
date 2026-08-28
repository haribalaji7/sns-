'use client';

import { useEffect, useRef } from 'react';
import { severityToColor, incidentTypeToIcon, createIncidentMarkerSvg } from '@/lib/maps/mapUtils';
import type { Incident } from '@/types';

interface IncidentMarkerProps {
  map: google.maps.Map | null;
  incident: Incident;
  isSelected?: boolean;
  onClick?: (incident: Incident) => void;
}

export function IncidentMarker({
  map,
  incident,
  isSelected = false,
  onClick,
}: IncidentMarkerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;

    const position = {
      lat: incident.coordinates.lat,
      lng: incident.coordinates.lng,
    };

    const color = severityToColor(incident.severity);
    const icon = incidentTypeToIcon(incident.type);
    const svgIcon = createIncidentMarkerSvg(incident.type, incident.severity, isSelected);

    if (!markerRef.current) {
      const marker = new window.google.maps.Marker({
        map,
        position,
        title: `${incident.title} (${incident.severity.toUpperCase()})`,
        zIndex: isSelected ? 100 : 50,
        icon: {
          url: svgIcon,
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
      });

      marker.addListener('click', () => {
        onClick?.(incident);
      });

      markerRef.current = marker;
    } else {
      const marker = markerRef.current as google.maps.Marker;
      marker.setPosition(position);
      marker.setZIndex(isSelected ? 100 : 50);
      marker.setIcon({
        url: svgIcon,
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24),
      });
    }

    return () => {
      if (markerRef.current) {
        if ('setMap' in markerRef.current) {
          (markerRef.current as google.maps.Marker).setMap(null);
        }
        markerRef.current = null;
      }
    };
  }, [map, incident, isSelected, onClick]);

  return null;
}
