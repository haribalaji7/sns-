'use client';

import { useEffect, useRef } from 'react';
import { responderStatusToColor, createResponderMarkerSvg } from '@/lib/maps/mapUtils';
import type { Responder } from '@/types';

interface ResponderMarkerProps {
  map: google.maps.Map | null;
  responder: Responder;
  isSelected?: boolean;
  onClick?: (responder: Responder) => void;
}

export function ResponderMarker({
  map,
  responder,
  isSelected = false,
  onClick,
}: ResponderMarkerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;

    const position = {
      lat: responder.coordinates.lat,
      lng: responder.coordinates.lng,
    };

    const color = responderStatusToColor(responder.status);
    const initial = responder.name ? responder.name.charAt(0).toUpperCase() : 'R';
    const svgIcon = createResponderMarkerSvg(responder.role, responder.status, responder.name);

    if (!markerRef.current) {
      const marker = new window.google.maps.Marker({
        map,
        position,
        title: `${responder.name} (${responder.role} - ${responder.status.toUpperCase()})`,
        zIndex: isSelected ? 90 : 60,
        icon: {
          url: svgIcon,
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 22),
        },
      });

      marker.addListener('click', () => {
        onClick?.(responder);
      });

      markerRef.current = marker;
    } else {
      const marker = markerRef.current as google.maps.Marker;
      marker.setPosition(position);
      marker.setZIndex(isSelected ? 90 : 60);
      marker.setIcon({
        url: svgIcon,
        scaledSize: new window.google.maps.Size(44, 44),
        anchor: new window.google.maps.Point(22, 22),
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
  }, [map, responder, isSelected, onClick]);

  return null;
}
