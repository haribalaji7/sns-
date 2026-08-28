'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMaps } from '@/lib/maps/googleMapsLoader';

export interface StreetViewOptions {
  lat: number;
  lng: number;
  radius?: number; // Search radius in meters
}

export function useStreetView(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: StreetViewOptions,
) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(null);

  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const serviceRef = useRef<google.maps.StreetViewService | null>(null);

  const checkAndLoadStreetView = useCallback(
    async (lat: number, lng: number, radius: number = 100) => {
      setIsLoading(true);
      try {
        const googleInstance = await loadGoogleMaps();
        if (!serviceRef.current) {
          serviceRef.current = new googleInstance.maps.StreetViewService();
        }

        const latLng = new googleInstance.maps.LatLng(lat, lng);

        serviceRef.current.getPanorama(
          { location: latLng, radius, preference: googleInstance.maps.StreetViewPreference.NEAREST },
          (data, status) => {
            setIsLoading(false);
            if (status === googleInstance.maps.StreetViewStatus.OK && data?.location?.latLng) {
              setIsAvailable(true);

              if (containerRef.current && !panoramaInstanceRef.current) {
                const pano = new googleInstance.maps.StreetViewPanorama(containerRef.current, {
                  position: data.location.latLng,
                  pov: { heading: 165, pitch: 0 },
                  zoom: 1,
                  disableDefaultUI: true,
                  showRoadLabels: true,
                  motionTracking: false,
                  motionTrackingControl: false,
                });
                panoramaInstanceRef.current = pano;
                setPanorama(pano);
              } else if (panoramaInstanceRef.current && data.location.latLng) {
                panoramaInstanceRef.current.setPosition(data.location.latLng);
              }
            } else {
              setIsAvailable(false);
            }
          },
        );
      } catch (err) {
        setIsLoading(false);
        setIsAvailable(false);
      }
    },
    [containerRef],
  );

  useEffect(() => {
    if (options && typeof options.lat === 'number' && typeof options.lng === 'number') {
      checkAndLoadStreetView(options.lat, options.lng, options.radius || 100);
    }
  }, [options?.lat, options?.lng, options?.radius, checkAndLoadStreetView]);

  return {
    isAvailable,
    isLoading,
    panorama,
    checkAndLoadStreetView,
  };
}
