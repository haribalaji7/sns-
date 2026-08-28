/**
 * CampusShield AI — Intelligent Prompt Builder & Visual Engine
 * Enhances user requests with incident context and classifies intents into:
 * 1. Text Intelligence
 * 2. Image Generation
 * 3. Map & Diagram Generation (Evacuation SVG, Risk Heatmap)
 * 4. Emergency Document Generation (Poster, Incident Report)
 */

import { Incident, Responder, CampusZone, SystemMetrics } from '@/types';

export type VisualType =
  | 'image'
  | 'evacuation_map'
  | 'risk_heatmap'
  | 'emergency_poster'
  | 'incident_report';

export interface VisualCardData {
  id: string;
  type: VisualType;
  title: string;
  subtitle?: string;
  promptUsed?: string;
  originalQuery: string;
  imageUrl?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  resolution?: string;
  category: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface ConversationContext {
  activeIncidentId?: string;
  activeBuilding?: string;
  lastTopic?: string;
  incidentType?: string;
  severity?: string;
  occupancy?: number;
  historySummary?: string;
}

// ─── High-Fidelity Curated Emergency Visual Assets ──────────────────────────
export const EMERGENCY_IMAGE_PRESETS: Record<string, {
  url: string;
  title: string;
  category: string;
  promptTemplate: string;
  lighting: string;
}> = {
  lab_fire: {
    url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1200&auto=format&fit=crop&q=85',
    title: 'Laboratory Thermal Runaway & Fire Scene',
    category: 'Fire inside laboratory',
    promptTemplate: 'A realistic emergency response illustration of a modern university chemical laboratory with active localized flame near a fume hood, dense thermal smoke rising to optical sensors, flashing strobe emergency beacons, automated halon suppression nozzles armed, students evacuating in orderly line, cinematic dark lighting with cyan and amber volumetric glow.',
    lighting: 'Cinematic low-key with emergency amber and cyan neon strobes',
  },
  smoke_scene: {
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1200&auto=format&fit=crop&q=85',
    title: 'Smoke Dispersion in Library Corridor',
    category: 'Smoke detection scene',
    promptTemplate: 'A realistic architectural safety illustration of a university library basement corridor with dense swirling smoke layer along the ceiling, green glowing illuminated exit signs, emergency floor route laser guides, safety responders in high-vis jackets clearing students, high-tech campus environment, 8k resolution, cinematic lighting.',
    lighting: 'Soft volumetric emergency illumination through dense particulate smoke',
  },
  student_collapse: {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=85',
    title: 'Medical Triage at Campus Quad',
    category: 'Student collapse',
    promptTemplate: 'A professional and respectful emergency medical response illustration on a university plaza, student lying safely in recovery position assisted by trained campus first responders, automated AED beacon station active nearby, campus ambulance arriving in background, realistic, safe and dignified depiction, cinematic morning light.',
    lighting: 'Natural daylight with soft emergency beacon highlights',
  },
  medical_emergency: {
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=85',
    title: 'Athletic Arena Paramedic Deployment',
    category: 'Medical emergency',
    promptTemplate: 'A professional medical emergency response scene on a university indoor running track, Advanced Life Support paramedic team deploying portable AED and oxygen equipment, campus safety officers managing perimeter, modern futuristic sports complex, clean and realistic presentation.',
    lighting: 'Overhead stadium floodlights with tactical medical spotlighting',
  },
  flooded_corridor: {
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&auto=format&fit=crop&q=85',
    title: 'Substation Water Ingress & Pooling',
    category: 'Flooded corridor',
    promptTemplate: 'A realistic campus engineering illustration of an IT server basement corridor with 4cm water pooling reflecting overhead neon emergency lighting, maintenance engineers shutting main pressure valves, electrical breaker cabinets elevated on safety risers, highly detailed, realistic industrial scene.',
    lighting: 'Reflective water specular glow with emergency cyan accents',
  },
  electrical_fire: {
    url: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=1200&auto=format&fit=crop&q=85',
    title: 'High-Voltage Transformer Arc Flash',
    category: 'Electrical fire',
    promptTemplate: 'A dramatic but professional emergency illustration of a power distribution substation with electrical arc sparks leaping from transformer panel 4, automated CO2 deluge system activating, safety hazard warning signs glowing, responders in insulated arc-flash suits approaching with fire suppression equipment.',
    lighting: 'High-intensity electric purple plasma spark lighting against dark background',
  },
  crowd_congestion: {
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=85',
    title: 'Auditorium Entry Bottleneck Surge',
    category: 'Crowd congestion',
    promptTemplate: 'An aerial architectural view of a university auditorium plaza during a high-density crowd gathering, campus marshals guiding flow through auxiliary exits, digital signage showing green evacuation arrows, calm and orderly crowd management, futuristic university campus.',
    lighting: 'Warm dusk ambient light with illuminated neon directional arrows',
  },
  security_evacuation: {
    url: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1200&auto=format&fit=crop&q=85',
    title: 'Tactical Campus Perimeter Evacuation',
    category: 'Security evacuation',
    promptTemplate: 'A high-tech campus security response scene at main entrance gate, uniformed safety officers directing university shuttle buses and students toward designated safe assembly zones, emergency barrier gates in locked-down security mode, futuristic command center aesthetic.',
    lighting: 'Night setting with neon teal and amber campus security beacons',
  },
  rescue_operation: {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=85',
    title: 'Squad Alpha Tactical Rescue Operation',
    category: 'Rescue operation',
    promptTemplate: 'A cinematic, highly detailed emergency response illustration showing Fire and HAZMAT responders equipped with SCBA respirators conducting a structured search-and-rescue sweep through a university building, thermal imaging tablets in hand, professional and reassuring composition.',
    lighting: 'Tactical handheld LED beam lights cutting through atmospheric haze',
  },
  campus_overview: {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=85',
    title: 'CampusShield Integrated Emergency Overview',
    category: 'Campus emergency overview',
    promptTemplate: 'A stunning futuristic bird-eye view of an illuminated university campus at night, showing overlaid holographic safe evacuation corridors, perimeter security zones, responder tactical GPS beacons, and emergency assembly greens, 8k ultra-detailed architectural concept.',
    lighting: 'Futuristic night cityscape with glowing cyan and neon purple holographic telemetry',
  },
};

// ─── Intelligent Prompt Context Synthesizer ─────────────────────────────────
export function buildContextualImagePrompt(
  rawQuery: string,
  context: ConversationContext,
  activeIncident?: Incident,
): { enhancedPrompt: string; presetKey: string; title: string; category: string } {
  const q = rawQuery.toLowerCase();
  const location = activeIncident?.location || context.activeBuilding || 'Science Block B';
  const incidentType = activeIncident?.type || context.incidentType || 'fire';
  const occupancy = activeIncident?.peopleAtRisk || context.occupancy || 42;

  let presetKey = 'lab_fire';
  let title = `Emergency Visual — ${location}`;
  let category = 'Fire inside laboratory';

  if (q.includes('smoke') || incidentType === 'smoke') {
    presetKey = 'smoke_scene';
    title = `Smoke Dispersion Scene — ${location}`;
    category = 'Smoke detection scene';
  } else if (q.includes('collapse') || q.includes('fallen') || incidentType === 'person_fallen') {
    presetKey = 'student_collapse';
    title = `Medical Response & Triage — ${location}`;
    category = 'Student collapse';
  } else if (q.includes('medical') || q.includes('cardiac') || q.includes('aed') || incidentType === 'medical') {
    presetKey = 'medical_emergency';
    title = `Paramedic ALS Deployment — ${location}`;
    category = 'Medical emergency';
  } else if (q.includes('flood') || q.includes('water') || q.includes('pipe') || incidentType === 'flood') {
    presetKey = 'flooded_corridor';
    title = `Substation Water Ingress Scene — ${location}`;
    category = 'Flooded corridor';
  } else if (q.includes('electrical') || q.includes('arc') || q.includes('transformer') || incidentType === 'electrical') {
    presetKey = 'electrical_fire';
    title = `Electrical Arc Flash Scene — ${location}`;
    category = 'Electrical fire';
  } else if (q.includes('crowd') || q.includes('bottleneck') || q.includes('surge') || incidentType === 'crowd') {
    presetKey = 'crowd_congestion';
    title = `Auditorium Crowd Flow Visual — ${location}`;
    category = 'Crowd congestion';
  } else if (q.includes('evacuat') || q.includes('perimeter') || q.includes('gate')) {
    presetKey = 'security_evacuation';
    title = `Perimeter Security & Evacuation — ${location}`;
    category = 'Security evacuation';
  } else if (q.includes('rescue') || q.includes('responder') || q.includes('hazmat')) {
    presetKey = 'rescue_operation';
    title = `Tactical Rescue Operation — ${location}`;
    category = 'Rescue operation';
  } else if (q.includes('overview') || q.includes('campus') || q.includes('aerial')) {
    presetKey = 'campus_overview';
    title = 'Campus-Wide Emergency Telemetry Overview';
    category = 'Campus emergency overview';
  }

  const enhancedPrompt = `Create a realistic emergency response illustration of ${location} with a localized ${incidentType} emergency. Estimated occupancy is ${occupancy} occupants. Show visible safety equipment, emergency exit signs, calmly evacuating students, uniformed campus responders providing assistance, highly detailed, futuristic university architecture, cinematic lighting with volumetric atmospheric haze. Clean, professional illustration suitable for command center briefing. No graphic or disturbing elements.`;

  return { enhancedPrompt, presetKey, title, category };
}

// ─── Intent Classifier with 4 Core Response Modes ───────────────────────────
export type CopilotMode =
  | 'text_intelligence'
  | 'image_generation'
  | 'evacuation_map'
  | 'risk_heatmap'
  | 'emergency_poster'
  | 'incident_report'
  | 'dispatch_playbook';

export function classifyCopilotMode(query: string): CopilotMode {
  const q = query.toLowerCase();

  // 1. Poster / Print materials
  if (/poster|flyer|awareness notice|safety graphic|printable|bulletin/.test(q)) {
    return 'emergency_poster';
  }

  // 2. Formal PDF / Incident Report
  if (/report|incident brief|pdf|dossier|executive summary|investigation document/.test(q)) {
    return 'incident_report';
  }

  // 3. Heatmap
  if (/heatmap|heat map|density map|risk gradient|intensity map/.test(q)) {
    return 'risk_heatmap';
  }

  // 4. Evacuation Map / Vector Diagram
  if (/evacuation map|evacuation diagram|escape route|safe path|floor plan|route diagram|how to exit/.test(q)) {
    return 'evacuation_map';
  }

  // 5. Image / Illustration Generation
  if (
    /generate.*(image|visual|photo|picture|scene|illustration|render)|show me.*(how|what).*look|create.*(visual|picture|rendering)|draw|visualize/i.test(q) ||
    /how the fire may spread|visual of the accident|visual of the incident/i.test(q)
  ) {
    return 'image_generation';
  }

  // 6. Autonomous Playbook / Dispatch Agent
  if (/playbook|dispatch|tactical plan|action plan|auto-orchestrate|orchestrate|execute plan/.test(q)) {
    return 'dispatch_playbook';
  }

  // Default: Text Intelligence with supporting data cards
  return 'text_intelligence';
}
