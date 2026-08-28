/**
 * CampusShield AI — Enterprise Emergency Copilot Engine
 * Flagship Multi-Modal AI Assistant with Intelligent Visual Generation
 */

import type { Incident, Responder, CampusZone, SystemMetrics } from '@/types';
import {
  VisualCardData,
  ConversationContext,
  EMERGENCY_IMAGE_PRESETS,
  buildContextualImagePrompt,
  classifyCopilotMode,
  CopilotMode,
} from './intelligent-prompt-builder';

// ─── Types ─────────────────────────────────────────────────────────────────

export type CardType =
  | 'incident_summary'
  | 'risk_analysis'
  | 'responder_recommendation'
  | 'evacuation_route'
  | 'alert_draft'
  | 'timeline'
  | 'metric_stats'
  | 'trend_chart'
  | 'image_generation'
  | 'evacuation_diagram'
  | 'risk_heatmap'
  | 'emergency_poster'
  | 'visual_asset';

export interface ResponseCard {
  type: CardType;
  data: Record<string, unknown>;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface CopilotMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  cards?: ResponseCard[];
  visuals?: VisualCardData[];
  suggestions?: string[];
  intent?: string;
  mode?: CopilotMode;
}

export interface CopilotContext {
  incidents: Incident[];
  responders: Responder[];
  zones: CampusZone[];
  metrics: SystemMetrics;
  sessionContext?: ConversationContext;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Math.round((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.round(diff / 60)}h ago`;
}

function severityColor(s: string) {
  switch (s) {
    case 'critical': return '#FF4D6D';
    case 'high': return '#FF8C42';
    case 'medium': return '#FFB347';
    case 'low': return '#22D3A5';
    default: return '#8B9AB4';
  }
}

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function classifyIntent(query: string): string {
  const q = query.toLowerCase();
  
  // Visual Generation Intents
  if (/image|visual|picture|photo|illustration|show me how.*spread/.test(q) && !/map|poster|report/.test(q)) return 'generate_image';
  if (/map|diagram/.test(q)) return 'generate_map';
  if (/poster|awareness/.test(q)) return 'generate_poster';
  if (/(incident )?report/.test(q) && /diagram|visual|pdf/.test(q)) return 'generate_report';

  // Standard Intents
  if (/what.*happen|status|right now|current|overview|situation/.test(q)) return 'status_report';
  if (/evacuat|exit route|safe route|escape|evacuate/.test(q)) return 'evacuation_plan';
  if (/risk|danger|threat|hazard|vulnerable/.test(q) && !/highest|most/.test(q)) return 'risk_analysis';
  if (/nearest|closest|who.*respond|find.*responder|available unit/.test(q)) return 'responder_find';
  if (/alert|announcement|broadcast|notify|warn/.test(q)) return 'generate_alert';
  if (/summar|report|incident.*today|log/.test(q)) return 'incident_summary';
  if (/predict|forecast|anticipate|expect|likelihood/.test(q)) return 'predict_risk';
  if (/trend|pattern|week|chart|analytics|analysis/.test(q)) return 'trend_analysis';
  if (/how many|people|count|occupancy|capacity/.test(q)) return 'people_count';
  if (/building|block|zone|highest risk|most dangerous/.test(q)) return 'building_risk';
  
  return 'general';
}

// ─── Main AI Response Generator with 4 Core Modes ───────────────────────────

export interface GeneratedCopilotResponse {
  text: string;
  cards: ResponseCard[];
  visuals: VisualCardData[];
  suggestions: string[];
  intent: string;
  mode: CopilotMode;
  updatedContext: ConversationContext;
}

export function generateAIResponse(
  query: string,
  ctx: CopilotContext,
): GeneratedCopilotResponse {
  const { incidents, responders, zones, metrics, sessionContext = {} } = ctx;
  const mode = classifyCopilotMode(query);

  const activeIncidents = incidents.filter(
    (i) => i.status === 'active' || i.status === 'responding',
  );
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical');
  const targetIncident =
    (sessionContext.activeIncidentId && incidents.find(i => i.id === sessionContext.activeIncidentId)) ||
    criticalIncidents[0] ||
    activeIncidents[0] ||
    incidents[0];

  // Conversation Memory Update
  const updatedContext: ConversationContext = {
    ...sessionContext,
    activeIncidentId: targetIncident?.id || 'INC-0091',
    activeBuilding: targetIncident?.location || sessionContext.activeBuilding || 'Science Block B',
    incidentType: targetIncident?.type || 'fire',
    severity: targetIncident?.severity || 'critical',
    occupancy: targetIncident?.peopleAtRisk || 42,
    lastTopic: mode,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // MODE 2: IMAGE GENERATION & VISUALIZATION
  // ───────────────────────────────────────────────────────────────────────────
  if (mode === 'image_generation') {
    const { enhancedPrompt, presetKey, title, category } = buildContextualImagePrompt(
      query,
      updatedContext,
      targetIncident
    );

    const preset = EMERGENCY_IMAGE_PRESETS[presetKey] || EMERGENCY_IMAGE_PRESETS.lab_fire;

    const visual: VisualCardData = {
      id: `vis-${Date.now()}`,
      type: 'image',
      title,
      subtitle: `Cinematic Emergency Scene · ${targetIncident.location}`,
      promptUsed: enhancedPrompt,
      originalQuery: query,
      imageUrl: preset.url,
      aspectRatio: '16:9',
      resolution: '4K Ultra-HD',
      category,
      timestamp: new Date().toISOString(),
      metadata: {
        lighting: preset.lighting,
        incidentType: targetIncident.type,
        location: targetIncident.location,
        occupancy: targetIncident.peopleAtRisk,
      },
    };

    return {
      mode,
      intent: 'generate_image',
      text: `**Emergency Visual Synthesized — ${title}**\n\nI have generated a high-fidelity emergency simulation visual based on current telemetry at **${targetIncident.location}**.\n\n- **Incident:** ${targetIncident.title} (${targetIncident.severity.toUpperCase()})\n- **Occupants:** ${targetIncident.peopleAtRisk} personnel\n- **Prompt Strategy:** Cinematic lighting, volumetric smoke propagation, emergency exit visibility, zero-gore safety compliance.\n\n*Click the card below to open in full-resolution Lightbox or attach to the official incident dossier.*`,
      cards: [{ type: 'image_generation', data: { prompt: enhancedPrompt } }],
      visuals: [visual],
      suggestions: [
        'Generate an evacuation map for this scene',
        'Show safest evacuation route',
        'Create an emergency awareness poster',
        'Who is the nearest responder to this location?',
      ],
      updatedContext,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE 3A: EVACUATION MAP & VECTOR DIAGRAM
  // ───────────────────────────────────────────────────────────────────────────
  if (mode === 'evacuation_map') {
    const visual: VisualCardData = {
      id: `evac-map-${Date.now()}`,
      type: 'evacuation_map',
      title: `Evacuation Routing Blueprint — ${targetIncident.location}`,
      originalQuery: query,
      category: 'Vector Evacuation Blueprint',
      timestamp: new Date().toISOString(),
      metadata: {
        buildingName: targetIncident.location,
        dangerZone: 'Lab 302 (342 °C)',
        primaryExit: 'Exit B (East Stairwell)',
        secondaryExit: 'Exit A (West Wing)',
        assemblyPoint: 'Assembly Point Alpha (North Quad)',
      },
    };

    return {
      mode,
      intent: 'evacuation_plan',
      text: `**Evacuation Routing & Blueprint — ${targetIncident.location}**\n\nUsing campus blueprint coordinates from the spatial database, I have generated a vector evacuation diagram for **${targetIncident.location}**.\n\n- **Danger Origin:** ${targetIncident.title} (Thermal spike $342\\ ^\\circ\\text{C}$)\n- **Primary Safe Corridor:** Route East via Corridor B3 $\\rightarrow$ **Exit B** $\\rightarrow$ Assembly Point Alpha\n- **Estimated Clearance Time:** **6–9 minutes** for ${targetIncident.peopleAtRisk} occupants\n- **Status:** Emergency lighting active · Elevators automatically locked to Ground Floor`,
      cards: [
        {
          type: 'evacuation_diagram',
          data: {
            incidentTitle: targetIncident.title,
            incidentLocation: targetIncident.location,
            severity: targetIncident.severity,
            peopleAtRisk: targetIncident.peopleAtRisk,
            eta: '6–9 minutes',
            primaryRoute: [
              { step: 1, label: 'Corridor B3 East', detail: 'Follow green illuminated emergency strip' },
              { step: 2, label: 'Stairwell 2B', detail: 'Proceed to Ground Floor (Elevators offline)' },
              { step: 3, label: 'Assembly Point Alpha', detail: 'Report to Warden A-7 at North Quad' },
            ],
            alternativeRoute: [
              { step: 1, label: 'West Corridor Exit A', detail: 'Auxiliary route if smoke spreads' },
              { step: 2, label: 'Perimeter Gate 1', detail: 'Secondary muster area' },
            ],
            assemblyPoints: ['Assembly Alpha (North Quad - 800 cap)', 'Assembly Beta (Perimeter Gate - 400 cap)'],
          },
        },
      ],
      visuals: [visual],
      suggestions: [
        'Create fire safety poster for this building',
        'Show risk heatmap overlay',
        'Dispatch Squad Alpha to secure Exit B',
        'Generate an incident report with diagrams',
      ],
      updatedContext,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE 3B: RISK HEATMAP GENERATOR
  // ───────────────────────────────────────────────────────────────────────────
  if (mode === 'risk_heatmap') {
    const visual: VisualCardData = {
      id: `heatmap-${Date.now()}`,
      type: 'risk_heatmap',
      title: 'Campus Risk & Occupancy Intensity Heatmap',
      originalQuery: query,
      category: 'Realtime Thermal & Risk Gradient',
      timestamp: new Date().toISOString(),
      metadata: {
        totalZones: zones.length,
        criticalZones: zones.filter(z => z.riskScore > 80).length,
      },
    };

    return {
      mode,
      intent: 'risk_analysis',
      text: `**Realtime Campus Risk & Density Heatmap**\n\nSynthesized risk gradient across all **${zones.length} campus zones** utilizing IoT sensor telemetry, active incident vectors, and occupancy density.\n\n- 🔴 **Critical Red Zone:** Science Block B (Score: **94/100** · 340 Pax)\n- 🟠 **High Orange Zones:** Athletic Arena (71/100) · IT Building (62/100)\n- 🟢 **Safe Green Zones:** Main Library (18/100) · Admin Quad (12/100)\n\n*Heatmap contours show thermal and congestion propagation vectors.*`,
      cards: [
        {
          type: 'risk_heatmap',
          data: {
            zones: zones.map(z => ({
              id: z.id,
              name: z.name,
              riskScore: z.riskScore,
              status: z.status,
              occupancy: z.occupancy,
              capacity: z.capacity,
              color: z.riskScore > 80 ? '#FF4D6D' : z.riskScore > 50 ? '#FFB347' : '#22D3A5',
            })),
            summary: {
              critical: zones.filter(z => z.riskScore > 80).length,
              high: zones.filter(z => z.riskScore > 50 && z.riskScore <= 80).length,
              moderate: zones.filter(z => z.riskScore > 20 && z.riskScore <= 50).length,
              safe: zones.filter(z => z.riskScore <= 20).length,
            },
          },
        },
      ],
      visuals: [visual],
      suggestions: [
        'Generate evacuation map for Science Block',
        'Show me how the fire may spread',
        'Dispatch responders to high risk zones',
        'Create emergency awareness poster',
      ],
      updatedContext,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE 4A: EMERGENCY POSTER GENERATOR
  // ───────────────────────────────────────────────────────────────────────────
  if (mode === 'emergency_poster') {
    const visual: VisualCardData = {
      id: `poster-${Date.now()}`,
      type: 'emergency_poster',
      title: `Emergency Action Poster — ${targetIncident.location}`,
      originalQuery: query,
      category: 'Printable Emergency Bulletin',
      timestamp: new Date().toISOString(),
      metadata: {
        building: targetIncident.location,
        type: targetIncident.type,
      },
    };

    return {
      mode,
      intent: 'generate_alert',
      text: `**Printable Emergency Awareness Poster Generated**\n\nI have designed a dark futuristic safety bulletin formatted for immediate digital display and A3/Tabloid print distribution.\n\n- **Header:** CampusShield Emergency Advisory\n- **Directives:** 3-step actionable evacuation protocol with icons\n- **Digital Access:** Dynamic QR code linked to live student evacuation routes\n- **Branding:** Campus Emergency Operations seal & reference ID`,
      cards: [{ type: 'emergency_poster', data: { building: targetIncident.location } }],
      visuals: [visual],
      suggestions: [
        'Print or download this poster',
        'Generate an evacuation map for this building',
        'Create an incident report with diagrams',
        'Broadcast this alert to all campus screens',
      ],
      updatedContext,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE 4B: INCIDENT REPORT WITH DIAGRAMS
  // ───────────────────────────────────────────────────────────────────────────
  if (mode === 'incident_report') {
    const visual: VisualCardData = {
      id: `report-${Date.now()}`,
      type: 'incident_report',
      title: `Official Incident Report Dossier — ${targetIncident.id}`,
      originalQuery: query,
      category: 'Executive Incident Brief',
      timestamp: new Date().toISOString(),
      metadata: {
        incidentId: targetIncident.id,
        title: targetIncident.title,
        severity: targetIncident.severity,
        location: targetIncident.location,
      },
    };

    return {
      mode,
      intent: 'incident_summary',
      text: `**Executive Incident Dossier & Telemetry Report — ${targetIncident.id}**\n\nCompiled structured incident report with coupled sensor telemetry, spatial maps, and responder logs.\n\n### 1. Executive Summary\nOn ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}, CampusShield AI detected **${targetIncident.title}** in **${targetIncident.location}** (${targetIncident.zone}) with **${targetIncident.aiConfidence}% confidence**.\n\n### 2. Hazard & Occupancy\n- **Severity:** ${targetIncident.severity.toUpperCase()}\n- **People at Risk:** ${targetIncident.peopleAtRisk} occupants\n- **Assigned Response Squad:** Squad Alpha (Cpt. Alex Rivera)\n- **Suppression Status:** Halon armed · Evacuation Route B engaged\n\n### 3. Integrated Visuals\nAttached vector evacuation blueprint and CCTV thermal telemetry frames below.`,
      cards: [
        {
          type: 'incident_summary',
          data: {
            incidents: [
              {
                id: targetIncident.id,
                title: targetIncident.title,
                severity: targetIncident.severity,
                location: targetIncident.location,
                timeAgo: formatTime(targetIncident.reportedAt),
                color: severityColor(targetIncident.severity),
                peopleAtRisk: targetIncident.peopleAtRisk,
              },
            ],
          },
        },
      ],
      visuals: [
        {
          id: `evac-embedded-${Date.now()}`,
          type: 'evacuation_map',
          title: `Evacuation Blueprint — ${targetIncident.location}`,
          originalQuery: query,
          category: 'Vector Evacuation Blueprint',
          timestamp: new Date().toISOString(),
          metadata: { buildingName: targetIncident.location },
        },
      ],
      suggestions: [
        'Download full PDF report',
        'Create fire safety poster',
        'Show risk heatmap overlay',
        'Dispatch backup responders',
      ],
      updatedContext,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE 1: TEXT INTELLIGENCE & TACTICAL DISPATCH
  // ───────────────────────────────────────────────────────────────────────────
  const q = query.toLowerCase();

  // Responder query
  if (q.includes('responder') || q.includes('who') || q.includes('nearest') || q.includes('unit')) {
    const incidentCoords = targetIncident?.coordinates ?? { lat: 28.6139, lng: 77.2090 };
    const ranked = [...responders]
      .filter((r) => r.coordinates)
      .map((r) => ({
        ...r,
        distanceM: Math.round(haversineMeters(r.coordinates!, incidentCoords)),
        etaMin: Math.max(1, Math.round(haversineMeters(r.coordinates!, incidentCoords) / 60)),
      }))
      .sort((a, b) => a.distanceM - b.distanceM);

    const nearestAvailable = ranked.find((r) => r.status === 'available') || ranked[0];

    return {
      mode: 'text_intelligence',
      intent: 'responder_find',
      text: `**Tactical Responder Deployment Recommendation**\n\nTriangulating **${responders.length} units** against active coordinates at **${targetIncident.location}**:\n\n- **Top Recommended Unit:** **${nearestAvailable.name}** (${nearestAvailable.role} · ${nearestAvailable.team})\n- **Distance / ETA:** ${nearestAvailable.distanceM} meters · **~${nearestAvailable.etaMin} min ETA**\n- **Radio Channel:** ${nearestAvailable.radioChannel || 'CH-4 Tactical'}\n- **Certifications:** ${nearestAvailable.certifications?.join(', ') || 'First Aid, Fire Suppression'}\n\n*Command protocol suggests immediate dispatch order to secure perimeter at Exit B.*`,
      cards: [
        {
          type: 'responder_recommendation',
          data: {
            ranked: ranked.slice(0, 4).map((r) => ({
              id: r.id,
              name: r.name,
              role: r.role,
              team: r.team,
              status: r.status,
              etaMin: r.etaMin,
              distanceM: r.distanceM,
              certifications: r.certifications,
              phone: r.phone,
              isRecommended: r.id === nearestAvailable.id,
            })),
          },
        },
      ],
      visuals: [],
      suggestions: [
        'Generate visual of the accident scene',
        'Generate an evacuation map for Science Block',
        'Show risk heatmap',
        'Draft emergency broadcast alert',
      ],
      updatedContext,
    };
  }

  // Default Operational Status
  const highestRiskZone = zones.reduce((a, b) => (a.riskScore > b.riskScore ? a : b));
  const totalAtRisk = activeIncidents.reduce((s, i) => s + (i.peopleAtRisk || 0), 0);

  return {
    mode: 'text_intelligence',
    intent: 'status_report',
    text: `**CampusShield Operational Intelligence — ${new Date().toLocaleTimeString()}**\n\nCurrently monitoring **${metrics.totalZones} campus zones** with **${metrics.sensorsOnline}/${metrics.totalSensors} sensors** online.\n\n- **Active Incidents:** **${activeIncidents.length} active** (${totalAtRisk} occupants at risk)\n- **Highest Priority:** **${targetIncident.title}** at ${targetIncident.location} (${targetIncident.severity.toUpperCase()})\n- **Highest Threat Zone:** **${highestRiskZone.name}** (Risk Index: **${highestRiskZone.riskScore}/100**)\n- **Responders:** ${responders.filter(r => r.status === 'available').length} available · ${responders.filter(r => r.status !== 'available').length} deployed on-scene\n\n*How can I assist? I can generate evacuation maps, risk heatmaps, visual incident simulations, or emergency posters.*`,
    cards: [
      {
        type: 'metric_stats',
        data: {
          stats: [
            { label: 'Active Emergencies', value: activeIncidents.length, trend: '+1', color: '#FF4D6D' },
            { label: 'People at Risk', value: totalAtRisk, trend: '', color: '#FF8C42' },
            { label: 'AI Accuracy', value: `${metrics.aiAccuracy}%`, trend: '+0.4%', color: '#14F1D9' },
            { label: 'Available Responders', value: responders.filter(r => r.status === 'available').length, trend: '', color: '#7C5CFF' },
          ],
        },
      },
    ],
    visuals: [],
    suggestions: [
      'Show me how the fire may spread',
      'Generate an evacuation map for Science Block',
      'Create a crowd density heatmap',
      'Generate an emergency awareness poster',
    ],
    updatedContext,
  };
}

// ─── Streaming Response Simulator ───────────────────────────────────────────

export async function streamResponse(
  fullText: string,
  onChunk: (partial: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
): Promise<void> {
  const tokens = fullText.split(/(\s+)/);
  let accumulated = '';

  for (let i = 0; i < tokens.length; i++) {
    if (signal?.aborted) break;
    accumulated += tokens[i];
    onChunk(accumulated);

    const delay =
      tokens[i].includes('\n') ? 45 :
      tokens[i].includes('**') ? 20 :
      Math.random() * 14 + 4;

    await new Promise<void>((res) => setTimeout(res, delay));
  }

  onDone();
}
