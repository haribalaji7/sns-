'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { useMapMode, MapMode } from '@/hooks/useMapMode';
import { MapModeSwitcher } from './MapModeSwitcher';
import { MapControls } from './MapControls';
import { IncidentMarker } from './IncidentMarker';
import { ResponderMarker } from './ResponderMarker';
import { EmergencyRadius } from './EmergencyRadius';
import { CampusBuildingLayer } from './CampusBuildingLayer';
import { SafeRouteLayer } from './SafeRouteLayer';
import { MapLegend } from './MapLegend';
import { MapSearch } from './MapSearch';
import { MapBottomSheet } from './MapBottomSheet';
import { StreetViewPanel } from './StreetViewPanel';
import { LiveLocationMarker } from './LiveLocationMarker';
import { AICampusMap } from './ai-campus-map';
import { useDashboardStore } from '@/store/dashboard';
import {
  Shield,
  ShieldAlert,
  Radio,
  Eye,
  KeyRound,
  ExternalLink,
  Layers,
  Sparkles,
  Flame,
  Navigation,
  MapPin,
} from 'lucide-react';
import { GradientButton } from '@/components/ui';
import type { Incident, Responder, CampusZone } from '@/types';

interface CampusMapProps {
  height?: string;
  onSelectIncident?: (incidentId: string) => void;
  className?: string;
}

const BASE_LAT = 28.6139;
const BASE_LNG = 77.209;

export function CampusMap({
  height = '620px',
  onSelectIncident,
  className,
}: CampusMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { incidents, responders, zones, selectIncident, addToast } = useDashboardStore();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedResponder, setSelectedResponder] = useState<Responder | null>(null);
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(true);
  const [useFallbackSvg, setUseFallbackSvg] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsLocked, setGpsLocked] = useState<boolean>(false);
  const [syncToUserLocation, setSyncToUserLocation] = useState<boolean>(true);

  // Street View State
  const [streetViewTarget, setStreetViewTarget] = useState<{
    lat: number;
    lng: number;
    title: string;
  } | null>(null);

  const { map, isLoaded, error, panTo, flyTo, setMapType, setTilt, setZoom } = useGoogleMap(
    containerRef,
    {
      center: { lat: BASE_LAT, lng: BASE_LNG },
      zoom: 17,
      mapTypeId: 'roadmap',
    },
  );

  // Reusable multi-tier geolocation resolver
  const fetchLiveLocation = useCallback((silent: boolean = false) => {
    if (typeof window === 'undefined') return;

    if (navigator.geolocation) {
      // 1. Instant fix with standard accuracy (avoids PC GPS timeout)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 30,
          };
          setUserLocation(coords);
          setGpsLocked(true);
          flyTo(coords.lat, coords.lng, 17);
          if (!silent) {
            addToast({
              type: 'success',
              title: 'Live Location Acquired',
              message: `GPS Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`,
            });
          }
        },
        (err) => {
          console.log('Resolving IP geolocation fallback (standard desktop behavior):', err.message);
          // 2. Fallback to IP Geolocation if browser GPS is unavailable on desktop
          fetch('https://ipapi.co/json/')
            .then((r) => r.json())
            .then((data) => {
              if (data?.latitude && data?.longitude) {
                const coords = {
                  lat: Number(data.latitude),
                  lng: Number(data.longitude),
                  accuracy: 1000,
                };
                setUserLocation(coords);
                setGpsLocked(true);
                flyTo(coords.lat, coords.lng, 16);
                if (!silent) {
                  addToast({
                    type: 'info',
                    title: 'Location Detected',
                    message: `${data.city || 'Local Area'}, ${data.region || ''}`,
                  });
                }
              }
            })
            .catch((e) => console.warn('IP geolocation unavailable:', e));
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
      );
    } else {
      // Direct IP fallback
      fetch('https://ipapi.co/json/')
        .then((r) => r.json())
        .then((data) => {
          if (data?.latitude && data?.longitude) {
            const coords = {
              lat: Number(data.latitude),
              lng: Number(data.longitude),
              accuracy: 1000,
            };
            setUserLocation(coords);
            setGpsLocked(true);
            flyTo(coords.lat, coords.lng, 16);
          }
        })
        .catch(() => {});
    }
  }, [flyTo, addToast]);

  // Auto-locate on map load
  useEffect(() => {
    if (isLoaded) {
      fetchLiveLocation(false);
    }
  }, [isLoaded, fetchLiveLocation]);

  // Dynamically translate mock incidents, responders, and zones around the user's live coordinates
  const effectiveIncidents = useMemo(() => {
    if (!syncToUserLocation || !userLocation) return incidents;
    const dLat = userLocation.lat - BASE_LAT;
    const dLng = userLocation.lng - BASE_LNG;
    return incidents.map((inc) => ({
      ...inc,
      coordinates: {
        lat: inc.coordinates.lat + dLat,
        lng: inc.coordinates.lng + dLng,
      },
    }));
  }, [incidents, syncToUserLocation, userLocation]);

  const effectiveResponders = useMemo(() => {
    if (!syncToUserLocation || !userLocation) return responders;
    const dLat = userLocation.lat - BASE_LAT;
    const dLng = userLocation.lng - BASE_LNG;
    return responders.map((r) => ({
      ...r,
      coordinates: {
        lat: r.coordinates.lat + dLat,
        lng: r.coordinates.lng + dLng,
      },
    }));
  }, [responders, syncToUserLocation, userLocation]);

  const effectiveZones = useMemo(() => {
    if (!syncToUserLocation || !userLocation) return zones;
    const dLat = userLocation.lat - BASE_LAT;
    const dLng = userLocation.lng - BASE_LNG;
    return zones.map((z) => ({
      ...z,
      coordinates: {
        lat: z.coordinates.lat + dLat,
        lng: z.coordinates.lng + dLng,
      },
      bounds: z.bounds.map(([lat, lng]) => [lat + dLat, lng + dLng] as [number, number]),
    }));
  }, [zones, syncToUserLocation, userLocation]);

  const { currentMode, setMode } = useMapMode((mode, mapTypeId, tilt) => {
    setMapType(mapTypeId);
    setTilt(tilt);
  });

  const effectiveRoutes = useMemo(() => {
    if (!syncToUserLocation || !userLocation) return undefined;
    const dLat = userLocation.lat - BASE_LAT;
    const dLng = userLocation.lng - BASE_LNG;
    return [
      {
        id: 'route-scib-alpha',
        type: 'primary' as const,
        coordinates: [
          { lat: BASE_LAT + dLat, lng: BASE_LNG + dLng },
          { lat: 28.6142 + dLat, lng: 77.2092 + dLng },
          { lat: 28.6147 + dLat, lng: 77.2091 + dLng },
          { lat: 28.6155 + dLat, lng: 77.2090 + dLng },
        ],
      },
      {
        id: 'route-it-beta',
        type: 'alternative' as const,
        coordinates: [
          { lat: 28.6145 + dLat, lng: 77.2085 + dLng },
          { lat: 28.6148 + dLat, lng: 77.2082 + dLng },
          { lat: 28.6155 + dLat, lng: 77.2075 + dLng },
        ],
      },
    ];
  }, [syncToUserLocation, userLocation]);

  const effectiveAssemblyPoints = useMemo(() => {
    if (!syncToUserLocation || !userLocation) return undefined;
    const dLat = userLocation.lat - BASE_LAT;
    const dLng = userLocation.lng - BASE_LNG;
    return [
      { id: 'safe-alpha', name: 'Assembly Zone Alpha (North Quad)', coordinates: { lat: 28.6155 + dLat, lng: 77.2090 + dLng } },
      { id: 'safe-beta', name: 'Assembly Zone Beta (Main Gate)', coordinates: { lat: 28.6155 + dLat, lng: 77.2075 + dLng } },
      { id: 'safe-gamma', name: 'Assembly Zone Gamma (Athletic Field)', coordinates: { lat: 28.6125 + dLat, lng: 77.2092 + dLng } },
    ];
  }, [syncToUserLocation, userLocation]);

  const handleZoomIn = () => {
    if (map) setZoom(map.getZoom()! + 1);
  };

  const handleZoomOut = () => {
    if (map) setZoom(map.getZoom()! - 1);
  };

  const handleRecenter = () => {
    if (userLocation) {
      flyTo(userLocation.lat, userLocation.lng, 17, currentMode === '3d' ? 45 : 0);
    } else {
      flyTo(BASE_LAT, BASE_LNG, 17, currentMode === '3d' ? 45 : 0);
    }
  };

  const handleToggleTilt = () => {
    if (currentMode === '3d') {
      setMode('roadmap');
    } else {
      setMode('3d');
    }
  };

  const handleLocateMe = () => {
    fetchLiveLocation(false);
  };

  const handleIncidentClick = useCallback(
    (incident: Incident) => {
      setSelectedIncident(incident);
      setSelectedResponder(null);
      setSelectedZone(null);
      onSelectIncident?.(incident.id);
      selectIncident(incident.id);
      flyTo(incident.coordinates.lat, incident.coordinates.lng, 18);
    },
    [flyTo, onSelectIncident, selectIncident],
  );

  const handleResponderClick = useCallback(
    (responder: Responder) => {
      setSelectedResponder(responder);
      setSelectedIncident(null);
      setSelectedZone(null);
      if (responder.coordinates) {
        flyTo(responder.coordinates.lat, responder.coordinates.lng, 18);
      }
    },
    [flyTo],
  );

  const handleZoneClick = useCallback((zone: CampusZone) => {
    setSelectedZone(zone);
    setSelectedIncident(null);
    setSelectedResponder(null);
  }, []);

  const handleSearchResult = (res: { lat: number; lng: number; zoom: number; id: string; category: string }) => {
    flyTo(res.lat, res.lng, res.zoom);
    if (res.category === 'incident') {
      const inc = effectiveIncidents.find((i) => i.id === res.id);
      if (inc) handleIncidentClick(inc);
    } else if (res.category === 'responder') {
      const r = effectiveResponders.find((resp) => resp.id === res.id);
      if (r) handleResponderClick(r);
    }
  };

  const activeIncident = selectedIncident || effectiveIncidents.find((i) => i.severity === 'critical') || effectiveIncidents[0];

  // If user explicitly switched to fallback SVG or API key is missing and requested fallback
  if (useFallbackSvg) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            onClick={() => setUseFallbackSvg(false)}
            className="px-3 py-1.5 rounded-xl bg-[#14F1D9] text-[#070B12] text-xs font-mono font-bold shadow-lg cursor-pointer"
          >
            Switch to Google Maps JS
          </button>
        </div>
        <AICampusMap height={height} onSelectIncident={onSelectIncident} />
      </div>
    );
  }

  // Missing API Key Error Card (Does NOT crash the app)
  if (error === 'MISSING_API_KEY') {
    return (
      <div
        className="relative w-full rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-gradient-to-br from-[#070B12] via-[#0E1726] to-[#070B12] p-8 flex flex-col items-center justify-center text-center gap-4 shadow-2xl"
        style={{ height }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[rgba(20,241,217,0.1)] border border-[rgba(20,241,217,0.3)] flex items-center justify-center shadow-[0_0_30px_rgba(20,241,217,0.2)]">
          <KeyRound className="w-8 h-8 text-[#14F1D9]" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold text-[#F0F4FF] tracking-tight">
            Google Maps API Key Required
          </h3>
          <p className="text-xs text-[#8B9AB4] leading-relaxed">
            To enable full 3D Google Maps, satellite imagery, and Street View 360, add your Google Maps JavaScript API key to <code className="text-[#14F1D9]">.env.local</code>:
          </p>
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#14F1D9] select-all">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <GradientButton
            variant="primary"
            size="sm"
            onClick={() => setUseFallbackSvg(true)}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Launch Interactive Digital Twin Fallback
          </GradientButton>

          <a
            href="https://console.cloud.google.com/google/maps-apis/overview"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#8B9AB4] hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <span>Google Cloud Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-2xl glass border border-[rgba(20,241,217,0.25)] bg-[#070B12] overflow-hidden shadow-2xl flex flex-col select-none"
      style={{ height }}
    >
      {/* ─── Top Floating Control Layer ────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3 z-20 pointer-events-none">
        {/* Left: Map Search */}
        <div className="pointer-events-auto">
          <MapSearch onSelectResult={handleSearchResult} />
        </div>

        {/* Center: Mode Switcher */}
        <div className="pointer-events-auto hidden md:block">
          <MapModeSwitcher currentMode={currentMode} onModeChange={setMode} />
        </div>

        {/* Right: GPS Indicator & Emergency Mode Indicator */}
        <div className="pointer-events-auto flex items-center gap-2">
          {userLocation && (
            <button
              onClick={() => {
                setSyncToUserLocation(!syncToUserLocation);
                if (!syncToUserLocation && userLocation) {
                  flyTo(userLocation.lat, userLocation.lng, 17);
                } else {
                  flyTo(BASE_LAT, BASE_LNG, 17);
                }
              }}
              title="Click to toggle sandbox location between your live GPS position and original demo coordinates"
              className={`px-2.5 py-1.5 rounded-2xl glass border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                syncToUserLocation
                  ? 'border-[#38BDF8] bg-[#38BDF8]/20 text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'border-white/10 bg-white/5 text-[#8B9AB4]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span>{syncToUserLocation ? 'GPS LIVE (LOCAL SANDBOX)' : 'DEMO CAMPUS MODE'}</span>
            </button>
          )}

          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`px-3 py-1.5 rounded-2xl glass border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xl ${
              emergencyMode
                ? 'border-[#FF4D6D] bg-[#FF4D6D]/20 text-[#FF4D6D] shadow-[0_0_15px_rgba(255,77,109,0.3)]'
                : 'border-white/10 bg-white/5 text-[#8B9AB4]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                emergencyMode ? 'bg-[#FF4D6D] animate-ping' : 'bg-[#8B9AB4]'
              }`}
            />
            <span>EMERGENCY MODE</span>
          </button>
        </div>
      </div>

      {/* ─── Main Map Container / Split View ────────────────────────────── */}
      <div className="relative flex-1 w-full h-full flex overflow-hidden">
        {/* Left: Google Map View */}
        <div
          className={`relative h-full transition-all duration-300 ${
            streetViewTarget ? 'w-full md:w-1/2 border-r border-[rgba(20,241,217,0.3)]' : 'w-full'
          }`}
        >
          <div ref={containerRef} className="w-full h-full bg-[#070B12]" />

          {/* Map Layer Overlays on Google Maps instance */}
          {map && isLoaded && (
            <>
              {/* Incident Markers */}
              {effectiveIncidents.map((inc) => (
                <IncidentMarker
                  key={inc.id}
                  map={map}
                  incident={inc}
                  isSelected={selectedIncident?.id === inc.id}
                  onClick={handleIncidentClick}
                />
              ))}

              {/* Responder Markers */}
              {effectiveResponders.map((r) => (
                <ResponderMarker
                  key={r.id}
                  map={map}
                  responder={r}
                  isSelected={selectedResponder?.id === r.id}
                  onClick={handleResponderClick}
                />
              ))}

              {/* Danger Radius Buffers */}
              {emergencyMode &&
                effectiveIncidents
                  .filter((i) => i.status === 'active' || i.status === 'responding')
                  .map((inc) => (
                    <EmergencyRadius key={`radius-${inc.id}`} map={map} incident={inc} />
                  ))}

              {/* Building Polygons */}
              <CampusBuildingLayer map={map} zones={effectiveZones} onSelectZone={handleZoneClick} />

              {/* Safe Evacuation Routes */}
              <SafeRouteLayer map={map} routes={effectiveRoutes} assemblyPoints={effectiveAssemblyPoints} />

              {/* Live Operator / Current User GPS Location */}
              <LiveLocationMarker map={map} position={userLocation} accuracy={userLocation?.accuracy} />
            </>
          )}

          {/* Map Legend (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
            <MapLegend />
          </div>

          {/* Map Controls (Bottom-Right) */}
          <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onRecenter={handleRecenter}
              onToggleTilt={handleToggleTilt}
              onToggleStreetView={() => {
                if (streetViewTarget) {
                  setStreetViewTarget(null);
                } else if (activeIncident) {
                  setStreetViewTarget({
                    lat: activeIncident.coordinates.lat,
                    lng: activeIncident.coordinates.lng,
                    title: activeIncident.title,
                  });
                }
              }}
              onLocateMe={handleLocateMe}
              is3D={currentMode === '3d'}
              isStreetViewActive={!!streetViewTarget}
            />
          </div>
        </div>

        {/* Right: Immersive Street View Split-View Panel */}
        {streetViewTarget && (
          <div className="w-full md:w-1/2 h-full z-20 p-2">
            <StreetViewPanel
              lat={streetViewTarget.lat}
              lng={streetViewTarget.lng}
              title={streetViewTarget.title}
              onClose={() => setStreetViewTarget(null)}
            />
          </div>
        )}
      </div>

      {/* ─── Bottom Inspection Sheet ───────────────────────────────────── */}
      <MapBottomSheet
        selectedIncident={selectedIncident}
        selectedResponder={selectedResponder}
        selectedZone={selectedZone}
        onClose={() => {
          setSelectedIncident(null);
          setSelectedResponder(null);
          setSelectedZone(null);
        }}
        onOpenStreetView={(lat, lng, title) => {
          setStreetViewTarget({ lat, lng, title });
        }}
        onDispatch={(id) => {
          addToast({
            type: 'success',
            title: 'Squad Dispatched',
            message: `Dispatched Squad Alpha to incident ${id}.`,
          });
        }}
      />
    </div>
  );
}
