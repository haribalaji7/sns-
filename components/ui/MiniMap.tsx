'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useDigitalTwin } from '@/context/DigitalTwinContext';

const CAMPUS_CENTER = { lng: -122.0840, lat: 37.4220 };
const CAMPUS_ZOOM = 15.5;

const incidentTypeColors: Record<string, string> = {
  fire: '#FF4D6D',
  medical: '#7C5CFF',
  crowd: '#FFB347',
  electrical: '#14F1D9',
  flood: '#3B82F6',
  default: '#8B9AB4',
};

export function MiniMap() {
  const { state: { showMiniMap, incidents, responders } } = useDigitalTwin();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const width = expanded ? 320 : 180;
  const height = expanded ? 240 : 160;

  useEffect(() => {
    if (!showMiniMap) return;
    let map: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current) return;
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          console.warn('[MiniMap] NEXT_PUBLIC_MAPBOX_TOKEN not set – map will not load');
          return;
        }
        mapboxgl.accessToken = token;

        map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [CAMPUS_CENTER.lng, CAMPUS_CENTER.lat],
          zoom: CAMPUS_ZOOM,
          interactive: false,
          attributionControl: false,
        });

        map.on('load', () => {
          setMapLoaded(true);
          mapRef.current = map;
        });
      } catch (err) {
        console.warn('[MiniMap] Failed to init mapbox:', err);
      }
    };

    initMap();
    return () => map?.remove();
  }, [showMiniMap]);

  // Add markers when map is loaded and data changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const mapboxgl = require('mapbox-gl');

    // Clear old markers (simple approach – recreate every update)
    const markers: any[] = [];

    incidents.forEach((inc: any) => {
      const el = document.createElement('div');
      const color = incidentTypeColors[inc.type] ?? incidentTypeColors.default;
      el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}`;
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([inc.longitude, inc.latitude])
        .addTo(mapRef.current);
      markers.push(marker);
    });

    responders.forEach((res: any) => {
      const el = document.createElement('div');
      el.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#22D3A5;border:1.5px solid white;';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([res.longitude, res.latitude])
        .addTo(mapRef.current);
      markers.push(marker);
    });

    return () => markers.forEach((m) => m.remove());
  }, [mapLoaded, incidents, responders]);

  // Resize map when expanded state changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.resize(), 300);
    }
  }, [expanded]);

  if (!showMiniMap) return null;

  return (
    <motion.div
      className="absolute bottom-6 left-6 z-20 overflow-hidden rounded-xl"
      style={{
        background: 'rgba(7,11,18,0.75)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      animate={{ width, height }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(7,11,18,0.9), transparent)' }}
      >
        <span className="text-[9px] font-bold text-[#14F1D9] uppercase tracking-widest font-mono">
          Live Campus Map
        </span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[#8B9AB4] hover:text-[#F0F4FF] transition-colors"
        >
          {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
        </button>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Fallback if no token */}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          <div className="text-[#14F1D9] text-[10px] font-bold mb-1">Campus Mini-Map</div>
          <div className="text-[#4A5568] text-[9px]">
            Set <code className="text-[#FFB347]">NEXT_PUBLIC_MAPBOX_TOKEN</code> in .env.local
          </div>
          {/* Dot indicators for incidents */}
          <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
            {incidents.slice(0, 5).map((inc: any) => (
              <div
                key={inc.id}
                className="w-2 h-2 rounded-full"
                style={{ background: incidentTypeColors[inc.type] ?? '#8B9AB4' }}
                title={inc.title}
              />
            ))}
            {responders.slice(0, 5).map((res: any) => (
              <div key={res.id} className="w-2 h-2 rounded-full bg-[#22D3A5]" title={res.name} />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-1"
        style={{ background: 'linear-gradient(to top, rgba(7,11,18,0.9), transparent)' }}
      >
        <span className="flex items-center gap-1 text-[9px] text-[#8B9AB4]">
          <span className="w-2 h-2 rounded-full bg-[#FF4D6D]" /> Incidents
        </span>
        <span className="flex items-center gap-1 text-[9px] text-[#8B9AB4]">
          <span className="w-2 h-2 rounded-full bg-[#22D3A5]" /> Responders
        </span>
      </div>
    </motion.div>
  );
}
