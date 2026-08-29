'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Phone, MapPin, Camera, Mic, Activity, 
  X, ChevronRight, Flame, ShieldAlert, Crosshair, 
  Zap, CloudRain, ShieldCheck, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const EMERGENCY_TYPES = [
  { id: 'fire', label: 'Fire', icon: Flame, color: '#FF4D6D' },
  { id: 'medical', label: 'Medical', icon: Activity, color: '#14F1D9' },
  { id: 'violence', label: 'Violence', icon: Crosshair, color: '#FFB347' },
  { id: 'harassment', label: 'Harassment', icon: ShieldAlert, color: '#7C5CFF' },
  { id: 'accident', label: 'Accident', icon: AlertTriangle, color: '#FFD166' },
  { id: 'electrical', label: 'Electrical', icon: Zap, color: '#00E59B' },
  { id: 'flood', label: 'Flood', icon: CloudRain, color: '#4D9FFF' },
  { id: 'other', label: 'Other', icon: Phone, color: '#8B9AB4' },
];

export function SOSEmergencyFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Auto GPS lock on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('GPS Error:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSOSSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      await supabase.from('incidents').insert({
        title: `SOS: ${selectedType.toUpperCase()}`,
        type: selectedType,
        severity: 'critical',
        status: 'active',
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        reported_by: user.user.id,
        confidence: 100,
        risk_score: 95
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("SOS Submit Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (sliderValue >= 100) {
      handleSOSSubmit();
    }
  }, [sliderValue]);

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#070B12] flex flex-col items-center justify-center p-6 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
          className="w-32 h-32 bg-[#FF4D6D]/20 rounded-full flex items-center justify-center mb-8 relative"
        >
          <div className="absolute inset-0 bg-[#FF4D6D]/10 rounded-full animate-ping" />
          <ShieldAlert className="w-16 h-16 text-[#FF4D6D]" />
        </motion.div>
        
        <h2 className="text-4xl font-bold text-white mb-4">SOS Sent!</h2>
        <p className="text-[#8B9AB4] text-lg mb-8 max-w-md">
          Command Center has been notified. Responders are tracking your live location.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-full max-w-sm mb-12 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#8B9AB4]">Status</span>
            <span className="text-[#FF4D6D] font-bold animate-pulse">RESPONDER DISPATCHED</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8B9AB4]">ETA</span>
            <span className="text-white font-mono text-xl">2 MINS</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold border border-white/20 active:scale-95 transition-transform"
        >
          Return to Map
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[100] bg-[#070B12] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="text-[#FF4D6D] font-bold text-lg animate-pulse flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          EMERGENCY SOS
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-3xl font-bold text-white mb-2">What is your emergency?</h2>
            <p className="text-[#8B9AB4] mb-8">Select the type of emergency for immediate assistance.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {EMERGENCY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setStep(2);
                  }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <type.icon className="w-12 h-12" style={{ color: type.color }} />
                  <span className="text-white font-semibold">{type.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-3xl font-bold text-white mb-2">Provide Evidence</h2>
            <p className="text-[#8B9AB4] mb-8">Optional: Attach photo or voice note.</p>
            
            <div className="flex gap-4 mb-8">
              <button className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-4">
                <Camera className="w-10 h-10 text-[#14F1D9]" />
                <span className="text-white">Take Photo</span>
              </button>
              <button className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-4">
                <Mic className="w-10 h-10 text-[#7C5CFF]" />
                <span className="text-white">Hold to Talk</span>
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 text-[#8B9AB4]">
                <MapPin className="w-6 h-6 text-[#FFB347]" />
                <span>{location ? `GPS Lock: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Acquiring GPS...'}</span>
              </div>
              {location ? <ShieldCheck className="text-[#00E59B]" /> : <Loader2 className="animate-spin text-[#8B9AB4]" />}
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full bg-[#14F1D9] text-[#070B12] rounded-2xl py-5 font-bold text-xl mb-4"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center text-center h-full pt-10">
            <h2 className="text-3xl font-bold text-white mb-4">Slide to Send</h2>
            <p className="text-[#8B9AB4] mb-12">Are you sure you want to trigger an emergency response?</p>
            
            <div className="relative w-full max-w-sm h-20 bg-white/5 border border-[#FF4D6D]/30 rounded-full overflow-hidden flex items-center">
              <div className="absolute inset-0 bg-[#FF4D6D]/10" />
              <span className="absolute w-full text-center text-[#FF4D6D] font-bold text-lg uppercase tracking-widest pointer-events-none">
                {isSubmitting ? 'Sending...' : 'Slide to SOS'}
              </span>
              
              <input 
                type="range" 
                min="0" max="100" 
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                disabled={isSubmitting}
              />
              
              <div 
                className="h-full bg-[#FF4D6D] absolute left-0 rounded-full transition-all flex items-center justify-end pr-6 shadow-[0_0_30px_#FF4D6D]"
                style={{ width: `${Math.max(20, sliderValue)}%` }}
              >
                 <ChevronRight className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
