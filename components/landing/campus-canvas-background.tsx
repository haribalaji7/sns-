'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  alphaSpeed: number;
  pulsePhase: number;
}

interface NodePoint {
  x: number;
  y: number;
  label: string;
  type: 'hub' | 'sensor' | 'beacon';
  pulseRadius: number;
}

export function CampusCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate floating particles
    const particleCount = Math.min(Math.floor((width * height) / 14000), 80);
    const particles: Particle[] = [];
    const colors = ['#14F1D9', '#7C5CFF', '#0BB8A7', '#38BDF8'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Fixed isometric campus node locations
    const nodes: NodePoint[] = [
      { x: 0.22, y: 0.32, label: 'Science B (Lab 302)', type: 'hub', pulseRadius: 0 },
      { x: 0.78, y: 0.28, label: 'IT Data Center', type: 'hub', pulseRadius: 0 },
      { x: 0.35, y: 0.68, label: 'Athletic Pavilion', type: 'sensor', pulseRadius: 0 },
      { x: 0.68, y: 0.62, label: 'Library Archives', type: 'sensor', pulseRadius: 0 },
      { x: 0.50, y: 0.48, label: 'Central Overwatch', type: 'beacon', pulseRadius: 0 },
      { x: 0.15, y: 0.55, label: 'West Perimeter Gate', type: 'sensor', pulseRadius: 0 },
      { x: 0.85, y: 0.52, label: 'East Security Gate', type: 'sensor', pulseRadius: 0 },
    ];

    let radarAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle perspective isometric grid
      ctx.strokeStyle = 'rgba(20, 241, 217, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw connecting lines between campus nodes
      const actualNodes = nodes.map((n) => ({
        ...n,
        px: n.x * width,
        py: n.y * height,
      }));

      ctx.strokeStyle = 'rgba(20, 241, 217, 0.12)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);

      for (let i = 0; i < actualNodes.length; i++) {
        for (let j = i + 1; j < actualNodes.length; j++) {
          const dist = Math.hypot(actualNodes[i].px - actualNodes[j].px, actualNodes[i].py - actualNodes[j].py);
          if (dist < width * 0.45) {
            ctx.beginPath();
            ctx.moveTo(actualNodes[i].px, actualNodes[i].py);
            ctx.lineTo(actualNodes[j].px, actualNodes[j].py);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);

      // Draw Radar Sweep from Central Beacon
      const centerNode = actualNodes[4];
      if (centerNode) {
        radarAngle += 0.012;
        const sweepRadius = Math.min(width, height) * 0.42;

        const gradient = ctx.createRadialGradient(
          centerNode.px,
          centerNode.py,
          0,
          centerNode.px,
          centerNode.py,
          sweepRadius,
        );
        gradient.addColorStop(0, 'rgba(20, 241, 217, 0.15)');
        gradient.addColorStop(0.7, 'rgba(20, 241, 217, 0.03)');
        gradient.addColorStop(1, 'rgba(20, 241, 217, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerNode.px, centerNode.py);
        ctx.arc(centerNode.px, centerNode.py, sweepRadius, radarAngle - 0.4, radarAngle, false);
        ctx.closePath();
        ctx.fill();

        // Concentric radar circles
        ctx.strokeStyle = 'rgba(20, 241, 217, 0.08)';
        ctx.lineWidth = 1;
        [0.25, 0.5, 0.75, 1].forEach((factor) => {
          ctx.beginPath();
          ctx.arc(centerNode.px, centerNode.py, sweepRadius * factor, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      // Draw Campus Nodes & Beacons
      actualNodes.forEach((node) => {
        // Outer pulsing ring
        node.pulseRadius = (node.pulseRadius + 0.3) % 24;
        const pulseAlpha = Math.max(0, 1 - node.pulseRadius / 24) * 0.4;

        ctx.strokeStyle = node.type === 'hub' ? 'rgba(255, 77, 109, ' + pulseAlpha + ')' : 'rgba(20, 241, 217, ' + pulseAlpha + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.px, node.py, 6 + node.pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Core dot
        ctx.fillStyle = node.type === 'hub' ? '#FF4D6D' : node.type === 'beacon' ? '#7C5CFF' : '#14F1D9';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(node.px, node.py, node.type === 'beacon' ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update & Draw Particles with inter-particle connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce from edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Pulsing alpha
        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.85 || p.alpha < 0.15) p.alphaSpeed *= -1;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 110) * 0.15;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
      {/* Cinematic Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-radial from-transparent via-background/60 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-t from-secondary/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
}
