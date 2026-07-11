'use client';

import { useState, useRef } from 'react';

export function CreditCard3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 5, y: -15 });
  const [hovering, setHovering] = useState(false);
  const rafRef = useRef<number>(0);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setTilt({ x: -dy * 20, y: dx * 25 }));
  };

  const onLeave = () => {
    setHovering(false);
    setTilt({ x: 5, y: -15 });
  };

  const glowX = 50 + tilt.y * 1.8;
  const glowY = 50 - tilt.x * 1.8;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ perspective: '900px', cursor: 'pointer' }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={onLeave}
    >
      <div
        className="relative w-56 h-32 rounded-2xl overflow-hidden"
        style={{
          transform: hovering
            ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.06)`
            : undefined,
          animation: !hovering ? 'rotateCard 6s ease-in-out infinite' : 'none',
          transition: hovering ? 'transform 0.08s ease-out, box-shadow 0.2s' : 'transform 0.6s ease-out',
          background: 'linear-gradient(135deg, #4a0820 0%, #150a0d 40%, #38171f 70%, #7a1838 100%)',
          boxShadow: hovering
            ? '0 35px 90px rgba(74,8,32,0.95), 0 0 70px rgba(171,28,66,0.55)'
            : '0 20px 60px rgba(74,8,32,0.8), 0 0 40px rgba(171,28,66,0.3)',
        }}
      >
        {/* shimmer sweep */}
        <div className="absolute inset-0 card-shimmer pointer-events-none" />
        {/* dynamic glow spot */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.14) 0%, transparent 65%)`,
          }}
        />
        {/* circuit lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 224 128">
          <circle cx="180" cy="40" r="30" stroke="#f9d0d8" strokeWidth="0.5" fill="none" />
          <circle cx="180" cy="40" r="22" stroke="#f9d0d8" strokeWidth="0.5" fill="none" />
          <line x1="0" y1="80" x2="224" y2="80" stroke="#f9d0d8" strokeWidth="0.3" />
          <line x1="40" y1="0" x2="40" y2="128" stroke="#f9d0d8" strokeWidth="0.3" />
          <path d="M60 60 L90 60 L90 90 L120 90" stroke="#f9d0d8" strokeWidth="0.3" fill="none" />
        </svg>
        {/* Chip */}
        <div
          className="absolute top-4 left-4 w-8 h-6 rounded"
          style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24, #d97706)' }}
        >
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40 gap-px p-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-yellow-900 rounded-sm" />
            ))}
          </div>
        </div>
        {/* Brand logo top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <svg width="26" height="21" viewBox="0 0 65 52" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.85">
            <path d="M8 6 L53 6 L47 26 L14 26 Z" stroke="white" strokeWidth="2.3" strokeLinejoin="round"/>
            <path d="M47 14 Q62 14 62 20 Q62 26 47 26" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="1" y="26" width="58" height="23" rx="3.5" stroke="white" strokeWidth="2.3"/>
            <rect x="7" y="33" width="11" height="8" rx="1.5" stroke="white" strokeWidth="1.8"/>
            <line x1="23" y1="37" x2="44" y2="37" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="23" y1="43" x2="38" y2="43" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <div className="leading-none">
            <div className="text-white font-bold text-xs leading-tight">My Credit</div>
            <div className="font-bold text-xs leading-tight" style={{ color: '#f87295' }}>Café</div>
          </div>
        </div>
        <div className="absolute bottom-10 left-4 text-white/55 text-xs tracking-widest font-mono">
          •••• •••• •••• 7480
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
          <span className="text-white/80 text-xs font-semibold tracking-wide">ELENA MANCHEHI</span>
          <span className="text-white/45 text-xs font-mono">12/28</span>
        </div>
      </div>
      {/* ground reflection */}
      <div
        className="absolute -bottom-5 left-2 right-2 h-8 rounded-xl blur-md opacity-25"
        style={{ background: '#ab1c42', transform: 'scaleY(0.4)' }}
      />
    </div>
  );
}
