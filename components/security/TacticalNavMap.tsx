'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation2,
  Compass,
  Layers,
  Flame,
  Shield,
  AlertTriangle,
  RotateCw,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  MapPin,
  CheckCircle2,
  Zap,
  Activity,
  Footprints,
  Eye,
  Sliders,
  Sparkles,
  Locate,
  Radio,
  Crosshair,
  Play,
  Pause,
} from 'lucide-react';
import { Coordinates } from '@/types';
import { computeTacticalRoute, calculateGeoDistance, NavigationRoute, TurnStep, CAMPUS_OBSTACLES } from '@/lib/pathfinding/security-nav';
import { useSecurityStore } from '@/store/security';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { soundEffects } from '@/lib/audio-effects';

interface TacticalNavMapProps {
  targetCoordinates?: Coordinates;
  incidentTitle?: string;
  incidentLocation?: string;
  onArrival?: () => void;
}

export function TacticalNavMap({
  targetCoordinates = { lat: 28.6139, lng: 77.2090 },
  incidentTitle = 'Thermal Combustion Spike – Science Lab 302',
  incidentLocation = 'Science Block B – Floor 3, Room 302',
  onArrival,
}: TacticalNavMapProps) {
  const { officer, updateCoordinates, setArrivalStage } = useSecurityStore();

  // Navigation & GPS State
  const [selectedRouteType, setSelectedRouteType] = useState<'primary' | 'alternative'>('primary');
  const [navMode, setNavMode] = useState<'live_gps' | 'simulation'>('live_gps');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [officerProgress, setOfficerProgress] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);
  const [showRerouteBanner, setShowRerouteBanner] = useState(true);
  const [speedKmh, setSpeedKmh] = useState(0);

  // Live Location & GPS Tracking State
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'ip_fallback' | 'denied'>('acquiring');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);
  const [liveLocationCity, setLiveLocationCity] = useState<string>('');

  // Active Layers
  const [layers, setLayers] = useState({
    incidents: true,
    responders: true,
    hazards: true,
    safeExits: true,
    heatmap: false,
    buildings: true,
  });
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);

  // Google Maps
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { map, isLoaded, error, panTo, flyTo, setMapType, setZoom } = useGoogleMap(
    mapContainerRef,
    {
      center: { lat: officer.coordinates.lat, lng: officer.coordinates.lng },
      zoom: 18,
      mapTypeId: 'roadmap',
    },
  );

  // Refs for Google Maps overlays
  const primaryPolylineRef = useRef<google.maps.Polyline | null>(null);
  const altPolylineRef = useRef<google.maps.Polyline | null>(null);
  const officerMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const targetMarkerRef = useRef<google.maps.Marker | null>(null);
  const hazardCirclesRef = useRef<google.maps.Circle[]>([]);
  const assemblyMarkerRef = useRef<google.maps.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  // ─── Multi-tier Live Geolocation Resolver ─────────────────────────
  const fetchLiveLocation = useCallback((isManual = false) => {
    if (typeof window === 'undefined') return;
    setIsFetchingGps(true);
    if (!isManual) setGpsStatus('acquiring');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 15);

          updateCoordinates({ lat, lng });
          setGpsAccuracy(accuracy);
          setGpsStatus('locked');
          setIsFetchingGps(false);
          setSpeedKmh(pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : 0);

          if (isManual) {
            soundEffects.playSuccess();
          }

          if (map) {
            panTo(lat, lng);
            flyTo(lat, lng, 18);
          }
        },
        (geoErr) => {
          console.warn('Browser GPS unavailable, resolving IP geolocation fallback:', geoErr);
          // Fallback to IP Geolocation
          fetch('https://ipapi.co/json/')
            .then((res) => res.json())
            .then((data) => {
              if (data?.latitude && data?.longitude) {
                const lat = Number(data.latitude);
                const lng = Number(data.longitude);
                updateCoordinates({ lat, lng });
                setGpsAccuracy(1000);
                setGpsStatus('ip_fallback');
                setLiveLocationCity(data.city || data.region || '');
                setIsFetchingGps(false);

                if (map) {
                  panTo(lat, lng);
                  flyTo(lat, lng, 17);
                }
              } else {
                setGpsStatus('denied');
                setIsFetchingGps(false);
              }
            })
            .catch(() => {
              setGpsStatus('denied');
              setIsFetchingGps(false);
            });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setGpsStatus('denied');
      setIsFetchingGps(false);
    }
  }, [map, panTo, flyTo, updateCoordinates]);

  // ─── Start Continuous GPS Watch on Mount ──────────────────────────
  useEffect(() => {
    fetchLiveLocation(false);

    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (navMode === 'live_gps') {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = Math.round(pos.coords.accuracy || 15);

            updateCoordinates({ lat, lng });
            setGpsAccuracy(accuracy);
            setGpsStatus('locked');
            if (pos.coords.speed !== null && pos.coords.speed !== undefined) {
              setSpeedKmh(Number((pos.coords.speed * 3.6).toFixed(1)));
            }
          }
        },
        (err) => console.warn('WatchPosition error:', err),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      watchIdRef.current = watchId;
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [fetchLiveLocation, navMode, updateCoordinates]);

  // Compute dynamic routes from current officer coordinates
  const routeData = computeTacticalRoute(officer.coordinates, targetCoordinates);
  const activeRoute: NavigationRoute = selectedRouteType === 'primary' ? routeData.primary : routeData.alternative;
  const currentStep: TurnStep = activeRoute.steps[currentStepIndex] || activeRoute.steps[0];
  const directDistanceToTarget = calculateGeoDistance(officer.coordinates, targetCoordinates);

  // ─── Tactical Simulation Mode Handler ─────────────────────────────
  useEffect(() => {
    if (navMode !== 'simulation' || !isSimulating) return;

    const interval = setInterval(() => {
      const currentProgress = progressRef.current;
      const next = currentProgress + 0.025;
      progressRef.current = next;

      if (next >= 1.0) {
        setIsSimulating(false);
        setArrivalStage('arrived');
        soundEffects.playSuccess();
        setOfficerProgress(1.0);
        if (onArrival) onArrival();
        clearInterval(interval);
        return;
      }

      setOfficerProgress(next);

      const stepCount = activeRoute.steps.length;
      const targetStep = Math.min(stepCount - 1, Math.floor(next * stepCount));
      if (targetStep !== currentStepIndex) {
        setCurrentStepIndex(targetStep);
        soundEffects.playScan();
      }

      const points = activeRoute.points;
      const segmentIdx = Math.min(points.length - 2, Math.floor(next * (points.length - 1)));
      const p1 = points[segmentIdx];
      const p2 = points[segmentIdx + 1] || p1;
      const segmentProgress = (next * (points.length - 1)) - segmentIdx;

      const currentLat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
      const currentLng = p1.lng + (p2.lng - p1.lng) * segmentProgress;
      updateCoordinates({ lat: currentLat, lng: currentLng });
      setSpeedKmh(Number((14.0 + Math.random() * 2.2).toFixed(1)));
    }, 800);

    return () => clearInterval(interval);
  }, [navMode, isSimulating, activeRoute, currentStepIndex, onArrival, setArrivalStage, updateCoordinates]);

  // ─── Render Google Maps Overlays ───────────────────────────────────
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clean up previous overlays
    primaryPolylineRef.current?.setMap(null);
    altPolylineRef.current?.setMap(null);
    hazardCirclesRef.current.forEach((c) => c.setMap(null));
    hazardCirclesRef.current = [];
    assemblyMarkerRef.current?.setMap(null);

    // ── Primary Route Polyline (Neon Cyan) ──
    const primaryPath = routeData.primary.points.map((p) => ({ lat: p.lat, lng: p.lng }));
    const primaryPoly = new google.maps.Polyline({
      path: primaryPath,
      geodesic: true,
      strokeColor: selectedRouteType === 'primary' ? '#14F1D9' : 'rgba(255,255,255,0.25)',
      strokeOpacity: selectedRouteType === 'primary' ? 0.9 : 0.5,
      strokeWeight: selectedRouteType === 'primary' ? 6 : 3,
      map,
    });
    primaryPolylineRef.current = primaryPoly;

    // ── Alternative Route Polyline (Orange dashed) ──
    const altPath = routeData.alternative.points.map((p) => ({ lat: p.lat, lng: p.lng }));
    const altPoly = new google.maps.Polyline({
      path: altPath,
      geodesic: true,
      strokeColor: selectedRouteType === 'alternative' ? '#FFB347' : 'rgba(255,255,255,0.15)',
      strokeOpacity: selectedRouteType === 'alternative' ? 0.9 : 0.4,
      strokeWeight: selectedRouteType === 'alternative' ? 6 : 3,
      map,
      icons: [
        {
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
          offset: '0',
          repeat: '15px',
        },
      ],
    });
    altPolylineRef.current = altPoly;

    // ── Hazard Zones ──
    if (layers.hazards) {
      CAMPUS_OBSTACLES.forEach((obs) => {
        const circle = new google.maps.Circle({
          strokeColor: '#FF4D6D',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF4D6D',
          fillOpacity: 0.15,
          map,
          center: { lat: obs.coordinates.lat, lng: obs.coordinates.lng },
          radius: obs.radiusMeters,
        });
        hazardCirclesRef.current.push(circle);
      });
    }

    // ── Assembly Zone Marker ──
    if (layers.safeExits) {
      const assemblyMarker = new google.maps.Marker({
        position: { lat: 28.6155, lng: 77.2085 },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22D3A5',
          fillOpacity: 0.7,
          strokeColor: '#22D3A5',
          strokeWeight: 3,
        },
        title: 'Assembly Zone Alpha',
      });
      assemblyMarkerRef.current = assemblyMarker;
    }

    return () => {
      primaryPoly.setMap(null);
      altPoly.setMap(null);
      hazardCirclesRef.current.forEach((c) => c.setMap(null));
      assemblyMarkerRef.current?.setMap(null);
    };
  }, [map, isLoaded, selectedRouteType, layers.hazards, layers.safeExits, routeData]);

  // ── Update Officer Live Location Marker & Radar Beacon ──
  useEffect(() => {
    if (!map || !isLoaded) return;

    const officerLatLng = { lat: officer.coordinates.lat, lng: officer.coordinates.lng };

    // Glowing Live Location SVG Pin
    const liveOfficerSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="#14F1D9" fill-opacity="0.2" stroke="#14F1D9" stroke-width="2">
          <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="fill-opacity" values="0.3;0.08;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="28" cy="28" r="11" fill="#070B12" stroke="#14F1D9" stroke-width="3" />
        <circle cx="28" cy="28" r="5" fill="#14F1D9" />
      </svg>
    `;
    const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(liveOfficerSvg)}`;

    if (!officerMarkerRef.current) {
      officerMarkerRef.current = new google.maps.Marker({
        position: officerLatLng,
        map,
        icon: {
          url: svgUrl,
          scaledSize: new google.maps.Size(56, 56),
          anchor: new google.maps.Point(28, 28),
        },
        title: `Officer ${officer.badgeNumber} (Live Location)`,
        zIndex: 200,
      });
    } else {
      officerMarkerRef.current.setPosition(officerLatLng);
    }

    // Accuracy Circle
    const radiusMeters = Math.max(gpsAccuracy || 20, 20);
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new google.maps.Circle({
        map,
        center: officerLatLng,
        radius: radiusMeters,
        fillColor: '#14F1D9',
        fillOpacity: 0.1,
        strokeColor: '#14F1D9',
        strokeOpacity: 0.35,
        strokeWeight: 1,
        clickable: false,
        zIndex: 10,
      });
    } else {
      accuracyCircleRef.current.setCenter(officerLatLng);
      accuracyCircleRef.current.setRadius(radiusMeters);
    }

    // Auto-follow officer if enabled
    if (autoFollow) {
      panTo(officer.coordinates.lat, officer.coordinates.lng);
    }
  }, [map, isLoaded, officer.coordinates, gpsAccuracy, autoFollow, panTo]);

  // ── Update Target Marker ──
  useEffect(() => {
    if (!map || !isLoaded) return;

    if (!targetMarkerRef.current) {
      targetMarkerRef.current = new google.maps.Marker({
        position: { lat: targetCoordinates.lat, lng: targetCoordinates.lng },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="20" fill="rgba(255,77,109,0.3)" stroke="#FF4D6D" stroke-width="3"/>
              <text x="22" y="27" text-anchor="middle" fill="#FF4D6D" font-size="20">🔥</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 22),
        },
        title: 'Incident Target',
        zIndex: 90,
      });
    } else {
      targetMarkerRef.current.setPosition({ lat: targetCoordinates.lat, lng: targetCoordinates.lng });
    }
  }, [map, isLoaded, targetCoordinates]);

  // Turn Action Icons
  const getTurnIcon = (action: TurnStep['action']) => {
    switch (action) {
      case 'turn-right':
        return <CornerUpRight className="w-6 h-6 text-[#14F1D9]" />;
      case 'turn-left':
        return <CornerUpLeft className="w-6 h-6 text-[#14F1D9]" />;
      case 'stairwell':
        return <Footprints className="w-6 h-6 text-[#FFB347]" />;
      case 'avoid-hazard':
        return <AlertTriangle className="w-6 h-6 text-[#FF4D6D]" />;
      case 'arrive':
        return <CheckCircle2 className="w-6 h-6 text-[#22D3A5]" />;
      case 'straight':
      default:
        return <ArrowUp className="w-6 h-6 text-[#14F1D9]" />;
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#030407] overflow-hidden flex flex-col shadow-2xl select-none">
      {/* ─── Top Turn-by-Turn Guidance HUD Banner ──────────────────────── */}
      <div className="relative z-30 p-3 sm:p-4 bg-[#070B12]/95 border-b border-white/[0.08] backdrop-blur-xl flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Main Turn Direction Box */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[rgba(20,241,217,0.15)] border border-[rgba(20,241,217,0.4)] flex items-center justify-center shadow-[0_0_15px_rgba(20,241,217,0.3)] flex-shrink-0">
              {getTurnIcon(currentStep.action)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#14F1D9] uppercase">
                  {directDistanceToTarget > 1000
                    ? `${(directDistanceToTarget / 1000).toFixed(1)} km to target`
                    : `${directDistanceToTarget}m to target`}
                </span>
                <span className="text-[10px] text-[#8B9AB4] font-mono">
                  ({currentStep.roadName})
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-black text-[#F0F4FF] truncate leading-snug">
                {currentStep.instruction}
              </h2>
            </div>
          </div>

          {/* Speed & ETA Badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-mono text-[#8B9AB4] uppercase">Patrol Speed</p>
              <p className="text-xs font-mono font-bold text-[#22D3A5]">{speedKmh} km/h</p>
            </div>

            <div className="bg-[rgba(255,77,109,0.15)] border border-[#FF4D6D]/40 px-3 py-1.5 rounded-xl text-center shadow">
              <p className="text-[9px] font-mono text-[#FF4D6D] uppercase font-bold">EST. ARRIVAL</p>
              <p className="text-sm font-mono font-black text-[#F0F4FF]">
                {Math.max(4, Math.round(activeRoute.totalDurationSeconds * (1 - officerProgress)))}s
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Reroute Alert */}
        <AnimatePresence>
          {showRerouteBanner && routeData.rerouteDetected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-1.5 rounded-lg bg-[rgba(255,179,71,0.12)] border border-[#FFB347]/40 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2 text-[#FFB347]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span className="font-bold">
                  Dynamic Safe Route Active: Avoiding Corridor B Smoke Plume
                </span>
              </div>
              <button
                onClick={() => setShowRerouteBanner(false)}
                className="text-[10px] text-[#8B9AB4] hover:text-white underline cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Google Maps Container ─────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* The actual Google Map */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Fallback if Google Maps fails to load */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B12] z-20">
            <div className="text-center space-y-3 px-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-[#FF4D6D]" />
              </div>
              <h3 className="text-sm font-bold text-[#F0F4FF]">Google Maps Unavailable</h3>
              <p className="text-xs text-[#8B9AB4] max-w-xs">
                Ensure <code className="text-[#14F1D9]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is configured in your environment.
              </p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#070B12] z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#14F1D9] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-[#8B9AB4]">Initializing Live Tactical Radar...</span>
            </div>
          </div>
        )}

        {/* ─── Floating Tactical Controls (Right Sidebar) ──────────────── */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          {/* Live GPS Fetch / Re-center Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              fetchLiveLocation(true);
            }}
            disabled={isFetchingGps}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl relative group ${
              gpsStatus === 'locked'
                ? 'bg-[#14F1D9] text-[#070B12] border-[#14F1D9] shadow-[0_0_15px_rgba(20,241,217,0.6)]'
                : 'bg-[#070B12]/80 text-[#14F1D9] border-[#14F1D9]/40 hover:bg-[#14F1D9]/20'
            }`}
            title="Fetch Live GPS Location"
          >
            <Locate className={`w-4 h-4 ${isFetchingGps ? 'animate-spin' : ''}`} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F1D9] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22D3A5]" />
            </span>
          </button>

          {/* Mode Switch: Live GPS vs Simulation */}
          <button
            onClick={() => {
              soundEffects.playClick();
              if (navMode === 'live_gps') {
                setNavMode('simulation');
                setIsSimulating(true);
              } else {
                setNavMode('live_gps');
                setIsSimulating(false);
                fetchLiveLocation(true);
              }
            }}
            className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-xl ${
              navMode === 'simulation'
                ? 'bg-[#FFB347] text-[#070B12] border-[#FFB347] shadow-[0_0_12px_#FFB347]'
                : 'bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white'
            }`}
            title={navMode === 'simulation' ? 'Switch to Live GPS Mode' : 'Switch to Simulation Run Mode'}
          >
            {navMode === 'simulation' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Satellite / Roadmap Toggle */}
          <button
            onClick={() => {
              soundEffects.playClick();
              const currentType = map?.getMapTypeId();
              setMapType(currentType === 'roadmap' ? 'satellite' : 'roadmap');
            }}
            className="p-2.5 rounded-xl border bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white transition-all cursor-pointer shadow-xl"
            title="Toggle Satellite View"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl ${
                layerMenuOpen
                  ? 'bg-[#14F1D9] text-[#070B12] border-[#14F1D9]'
                  : 'bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white'
              }`}
              title="Map Layers"
            >
              <Layers className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {layerMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-full mr-2 top-0 w-44 rounded-xl bg-[#070B12] border border-white/15 shadow-2xl p-2 z-40 backdrop-blur-xl space-y-1"
                >
                  <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block px-1 font-bold">
                    Tactical Overlays
                  </span>
                  {Object.entries(layers).map(([key, active]) => (
                    <button
                      key={key}
                      onClick={() => setLayers((prev) => ({ ...prev, [key]: !active }))}
                      className={`w-full px-2 py-1 rounded text-left text-xs font-mono flex items-center justify-between cursor-pointer ${
                        active ? 'bg-white/10 text-white font-bold' : 'text-[#8B9AB4]'
                      }`}
                    >
                      <span className="capitalize">{key}</span>
                      {active && <CheckCircle2 className="w-3 h-3 text-[#14F1D9]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compass Auto-Follow Toggle */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setAutoFollow(!autoFollow);
              if (!autoFollow) {
                panTo(officer.coordinates.lat, officer.coordinates.lng);
              }
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl ${
              autoFollow
                ? 'bg-[#14F1D9]/20 text-[#14F1D9] border-[#14F1D9]'
                : 'bg-[#070B12]/80 text-[#8B9AB4] border-white/10'
            }`}
            title="Auto Center on Officer"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Zoom Controls */}
          <button
            onClick={() => { const z = map?.getZoom(); if (z) setZoom(z + 1); }}
            className="p-2.5 rounded-xl border bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white transition-all cursor-pointer shadow-xl text-xs font-bold"
          >
            +
          </button>
          <button
            onClick={() => { const z = map?.getZoom(); if (z) setZoom(z - 1); }}
            className="p-2.5 rounded-xl border bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white transition-all cursor-pointer shadow-xl text-xs font-bold"
          >
            −
          </button>
        </div>

        {/* ─── Route Alternative Switcher (Bottom Left) ────────────────── */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedRouteType('primary');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-lg ${
              selectedRouteType === 'primary'
                ? 'bg-[#14F1D9] text-[#070B12] border-[#14F1D9] shadow-[0_0_12px_#14F1D9]'
                : 'bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white'
            }`}
          >
            Primary Safe ({routeData.primary.totalDistanceMeters}m)
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedRouteType('alternative');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-lg ${
              selectedRouteType === 'alternative'
                ? 'bg-[#FFB347] text-[#070B12] border-[#FFB347] shadow-[0_0_12px_#FFB347]'
                : 'bg-[#070B12]/80 text-[#8B9AB4] border-white/10 hover:text-white'
            }`}
          >
            Alternative ({routeData.alternative.totalDistanceMeters}m)
          </button>
        </div>

        {/* ─── Bottom Right Live GPS Status Pill ───────────────────────── */}
        <div className="absolute bottom-4 right-4 z-30">
          <div className="px-3 py-1.5 rounded-xl bg-[#070B12]/95 border border-[rgba(20,241,217,0.3)] backdrop-blur-md text-[10px] font-mono text-[#F0F4FF] flex items-center gap-2 shadow-xl">
            <span className={`w-2 h-2 rounded-full ${
              gpsStatus === 'locked' ? 'bg-[#22D3A5] animate-ping' : gpsStatus === 'ip_fallback' ? 'bg-[#FFB347] animate-pulse' : 'bg-[#FF4D6D]'
            }`} />
            <span className="font-bold text-[#14F1D9]">
              {gpsStatus === 'locked'
                ? `LIVE GPS LOCKED (±${gpsAccuracy || 15}m)`
                : gpsStatus === 'ip_fallback'
                ? `IP LOCATION (${liveLocationCity || 'DETECTED'})`
                : gpsStatus === 'acquiring'
                ? 'ACQUIRING LIVE GPS...'
                : 'GPS OFFLINE'}
            </span>
            <span className="text-[#8B9AB4] hidden sm:inline">
              · {officer.coordinates.lat.toFixed(4)}, {officer.coordinates.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
