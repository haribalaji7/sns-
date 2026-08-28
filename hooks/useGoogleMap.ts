'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/lib/maps/googleMapsLoader';
import { DARK_COMMAND_CENTER_MAP_STYLE } from '@/lib/maps/mapStyles';

export interface UseGoogleMapOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  tilt?: number;
  heading?: number;
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  disableDefaultUI?: boolean;
  mapId?: string;
}

export function useGoogleMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseGoogleMapOptions = {},
) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initialCenter = options.center || { lat: 28.6139, lng: 77.209 };
  const initialZoom = options.zoom || 17;
  const initialTilt = options.tilt || 0;
  const initialHeading = options.heading || 0;
  const initialMapType = options.mapTypeId || 'roadmap';
  const mapId = options.mapId;

  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isGoogleMapsConfigured()) {
      setError('MISSING_API_KEY');
      return;
    }

    if (!containerRef.current) return;

    loadGoogleMaps()
      .then((googleInstance) => {
        if (!isMounted || !containerRef.current) return;

        if (!mapInstanceRef.current) {
          const mapOptions: google.maps.MapOptions = {
            center: initialCenter,
            zoom: initialZoom,
            tilt: initialTilt,
            heading: initialHeading,
            mapTypeId: initialMapType,
            disableDefaultUI: options.disableDefaultUI ?? true,
            gestureHandling: 'greedy',
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: true,
            fullscreenControl: false,
            backgroundColor: '#070B12',
          };

          // If mapId is explicitly provided, use it (and don't set client styles).
          // Otherwise, set client-side dark command center styles when on roadmap.
          if (mapId) {
            mapOptions.mapId = mapId;
          } else if (initialMapType === 'roadmap') {
            mapOptions.styles = DARK_COMMAND_CENTER_MAP_STYLE;
          }

          const MapConstructor = googleInstance?.maps?.Map || (typeof window !== 'undefined' ? window.google?.maps?.Map : null);
          if (!MapConstructor) {
            throw new Error('Google Maps Map constructor is not available yet');
          }

          const instance = new MapConstructor(containerRef.current, mapOptions);
          mapInstanceRef.current = instance;
          setMap(instance);
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load Google Maps:', err);
          setError(err.message || 'LOAD_FAILED');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [containerRef]);

  const panTo = useCallback((lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
    }
  }, []);

  const flyTo = useCallback(
    (lat: number, lng: number, zoom?: number, tilt?: number, heading?: number) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
        if (typeof zoom === 'number') mapInstanceRef.current.setZoom(zoom);
        if (typeof tilt === 'number') mapInstanceRef.current.setTilt(tilt);
        if (typeof heading === 'number') mapInstanceRef.current.setHeading(heading);
      }
    },
    [],
  );

  const setMapType = useCallback(
    (type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setMapTypeId(type);
        // Only update client-side styles if mapId is NOT present
        if (!mapId) {
          if (type === 'roadmap') {
            mapInstanceRef.current.setOptions({ styles: DARK_COMMAND_CENTER_MAP_STYLE });
          } else {
            mapInstanceRef.current.setOptions({ styles: [] });
          }
        }
      }
    },
    [mapId],
  );

  const setTilt = useCallback((tilt: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTilt(tilt);
    }
  }, []);

  const setZoom = useCallback((zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, []);

  return {
    map,
    isLoaded,
    error,
    panTo,
    flyTo,
    setMapType,
    setTilt,
    setZoom,
  };
}
