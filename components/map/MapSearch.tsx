'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Flame, Users, Shield, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_INCIDENTS, MOCK_RESPONDERS, MOCK_ZONES } from '@/lib/mock-data';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'building' | 'incident' | 'responder' | 'assembly';
  lat: number;
  lng: number;
  zoom: number;
}

interface MapSearchProps {
  onSelectResult: (result: SearchResult) => void;
  className?: string;
}

export function MapSearch({ onSelectResult, className }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const searchableItems: SearchResult[] = [
    // Buildings
    ...MOCK_ZONES.map((z) => ({
      id: z.id,
      title: z.name,
      subtitle: `Campus Zone · Risk ${z.riskScore}%`,
      category: 'building' as const,
      lat: z.coordinates.lat,
      lng: z.coordinates.lng,
      zoom: 18,
    })),
    // Incidents
    ...MOCK_INCIDENTS.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: `${i.severity.toUpperCase()} · ${i.location}`,
      category: 'incident' as const,
      lat: i.coordinates.lat,
      lng: i.coordinates.lng,
      zoom: 19,
    })),
    // Responders
    ...MOCK_RESPONDERS.map((r) => ({
      id: r.id,
      title: r.name,
      subtitle: `${r.role} · ${r.status.toUpperCase()}`,
      category: 'responder' as const,
      lat: r.coordinates.lat,
      lng: r.coordinates.lng,
      zoom: 18,
    })),
    // Safe Assembly
    {
      id: 'safe-alpha',
      title: 'North Quad Assembly Zone Alpha',
      subtitle: 'Designated Safe Egress Area',
      category: 'assembly' as const,
      lat: 28.6155,
      lng: 77.209,
      zoom: 18,
    },
    {
      id: 'safe-beta',
      title: 'Main Gate Safe Haven Zone Beta',
      subtitle: 'Perimeter Safe Area',
      category: 'assembly' as const,
      lat: 28.6155,
      lng: 77.2075,
      zoom: 18,
    },
  ];

  const filtered = query.trim()
    ? searchableItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    onSelectResult(item);
    setQuery(item.title);
    setIsOpen(false);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'incident':
        return <Flame className="w-3.5 h-3.5 text-[#FF4D6D]" />;
      case 'responder':
        return <Users className="w-3.5 h-3.5 text-[#7C5CFF]" />;
      case 'assembly':
        return <Shield className="w-3.5 h-3.5 text-[#00E59B]" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-[#14F1D9]" />;
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative w-full max-w-sm z-30', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[#8B9AB4] pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search buildings, incidents, squads..."
          className="w-full h-10 pl-10 pr-9 rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 backdrop-blur-xl text-xs text-[#F0F4FF] placeholder:text-[#8B9AB4] outline-none shadow-2xl focus:border-[#14F1D9] transition-all font-sans"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 rounded-md text-[#8B9AB4] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-12 left-0 right-0 max-h-60 overflow-y-auto glass rounded-2xl p-2 border border-[rgba(20,241,217,0.3)] bg-[#070B12]/95 backdrop-blur-xl shadow-2xl space-y-1">
          {filtered.map((item) => (
            <div
              key={`${item.category}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-white/5 flex-shrink-0">
                {getIcon(item.category)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#F0F4FF] truncate">{item.title}</p>
                <p className="text-[10px] text-[#8B9AB4] truncate">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
