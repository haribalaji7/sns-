'use client';

import { useEffect, useRef } from 'react';

interface LiveLocationMarkerProps {
  map: google.maps.Map | null;
  position: { lat: number; lng: number } | null;
  accuracy?: number;
}

export function LiveLocationMarker({ map, position, accuracy = 40 }: LiveLocationMarkerProps) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || !position || typeof window === 'undefined' || !window.google?.maps) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      return;
    }

    const pos = new window.google.maps.LatLng(position.lat, position.lng);

    // Glowing live location SVG pin
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="#38BDF8" fill-opacity="0.25" stroke="#38BDF8" stroke-width="2">
          <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="fill-opacity" values="0.35;0.1;0.35" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="24" cy="24" r="9" fill="#0284C7" stroke="#FFFFFF" stroke-width="2.5" />
        <circle cx="24" cy="24" r="4" fill="#FFFFFF" />
      </svg>
    `;
    const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map,
        position: pos,
        title: 'Your Current Location (Operator)',
        zIndex: 200,
        icon: {
          url: svgUrl,
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
      });
    } else {
      markerRef.current.setPosition(pos);
    }

    // Accuracy Circle
    if (!circleRef.current) {
      circleRef.current = new window.google.maps.Circle({
        map,
        center: pos,
        radius: Math.max(accuracy, 25),
        fillColor: '#38BDF8',
        fillOpacity: 0.12,
        strokeColor: '#38BDF8',
        strokeOpacity: 0.4,
        strokeWeight: 1,
        clickable: false,
        zIndex: 10,
      });
    } else {
      circleRef.current.setCenter(pos);
      circleRef.current.setRadius(Math.max(accuracy, 25));
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, position, accuracy]);

  return null;
}
