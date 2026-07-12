'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Zap, Globe, Lock, Cpu, Layers, Terminal,
  Sparkles, ShieldCheck, Users, BarChart3,
  TrendingUp, FileText, Activity,
  Shield, PieChart, Link2, Landmark, BarChart2, Building2,
} from 'lucide-react';

// ── colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#0d0507',
  card:      '#150a0d',
  cardInner: '#1e0e12',
  border:    'rgba(74,8,32,0.45)',
  borderHov: 'rgba(74,8,32,0.75)',
  pill:      'rgba(74,8,32,0.6)',
  accent:    '#ab1c42',
  accentLt:  '#e04a6e',
  textMuted: 'rgba(249,208,216,0.4)',
  textSub:   'rgba(249,208,216,0.65)',
  textCode:  'rgba(249,208,216,0.5)',
};

const features = [
  { id: 0, title: 'Disputas Rápidas',     desc: 'Resolución promedio en 24 días',   icon: Zap,      stat: '24 días' },
  { id: 1, title: 'Análisis IA',          desc: 'Motor inteligente de score',        icon: Cpu,      stat: '94%'     },
  { id: 2, title: '3 Burós',             desc: 'Equifax, Experian, TransUnion',     icon: Globe,    stat: '3'       },
  { id: 3, title: 'Máxima Seguridad',    desc: 'Cifrado de nivel bancario',         icon: Lock,     stat: '256-bit' },
];

const metrics = [
  { label: 'Disputas resueltas',    value: '4,200', unit: '+',  trend: '+18%' },
  { label: 'Días promedio',         value: '24',    unit: 'd',  trend: '-30%' },
  { label: 'Tasa de éxito',         value: '94',    unit: '%',  trend: '+5%'  },
  { label: 'Mejora de score',       value: '+82',   unit: 'pts',trend: '+12%' },
];

const integrations = [
  { name: 'Equifax',    icon: Shield,    color: '#E8171F' },
  { name: 'Experian',   icon: BarChart2, color: '#C41230' },
  { name: 'TransUnion', icon: Building2, color: '#002D9C' },
  { name: 'CFPB',       icon: Landmark,  color: '#3b82f6' },
  { name: 'FICO',       icon: PieChart,  color: '#f59e0b' },
  { name: 'Plaid',      icon: Link2,     color: '#22c55e' },
];

const codeExample = `// Tu plan de acción crediticio
const plan = new CreditCafe({
  client: "Elena Manchehi",
  disputes: ["Capital One", "Equifax"],
  monitoring: "all_bureaus",
  alerts: "real_time"
});

await plan.start();
// ✓ 3 disputas activas hoy
// ✓ Score +62 pts en 90 días`;

const stats = [
  { label: 'Clientes activos', value: '2,500+',  icon: Users      },
  { label: 'Burós cubiertos',  value: '3',       icon: Globe      },
  { label: 'Tasa de éxito',    value: '94%',     icon: ShieldCheck},
  { label: 'Mejora promedio',  value: '+82 pts', icon: TrendingUp },
];

export function FeaturesCard() {
  const [activeTab,      setActiveTab]      = useState(0);
  const [selectedMetric, setSelectedMetric] = useState(0);

  const activeFeature = features[activeTab];

  return (
    <section
      className="w-full py-20 px-4 md:px-8 font-sans antialiased overflow-hidden"
      style={{ background: C.bg, color: '#fff' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-14">

        {/* Hero Header */}
        <div className="flex flex-col gap-5 max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
            style={{ background: C.pill, border: `1px solid ${C.border}` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: C.accentLt }} />
            <span className="text-xs font-semibold tracking-wider" style={{ color: C.textSub }}>
              Motor de reparación crediticia de próxima generación
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Recupera tu crédito.<br />
            <span style={{ color: C.accentLt }}>Transforma tu vida.</span>
          </h2>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: C.textSub }}>
            Disputas inteligentes, análisis en tiempo real y seguridad bancaria —
            todo en una plataforma diseñada para resultados reales.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">

          {/* Large card — interactive features */}
          <div
            className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between transition-all duration-300"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHov)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: C.cardInner, border: `1px solid ${C.border}`, color: C.textSub }}
              >
                <Activity className="w-3.5 h-3.5" style={{ color: C.accentLt }} />
                Plataforma Inteligente
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">Funcionalidades Core</h3>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Selecciona para explorar cada módulo
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {features.map((f) => {
                const Icon = f.icon;
                const isActive = activeTab === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveTab(f.id)}
                    className="relative overflow-hidden rounded-xl p-4 flex flex-col transition-all duration-300 text-left"
                    style={{
                      background: isActive ? C.cardInner : 'rgba(30,14,18,0.5)',
                      border: `1px solid ${isActive ? C.accent : C.border}`,
                      boxShadow: isActive ? `0 0 12px rgba(171,28,66,0.2)` : 'none',
                    }}
                  >
                    <Icon
                      className="w-5 h-5 mb-2 transition-colors"
                      style={{ color: isActive ? C.accentLt : C.textMuted }}
                    />
                    <span className="text-xs font-bold text-white">{f.title}</span>
                    <span className="text-[10px] mt-1 line-clamp-1" style={{ color: C.textMuted }}>
                      {f.stat}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="relative z-10 mt-5 p-4 rounded-xl"
              style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-mono mb-1" style={{ color: C.textMuted }}>Seleccionado:</p>
              <p className="text-base font-bold text-white">{activeFeature.title}</p>
              <p className="text-xs mt-1" style={{ color: C.textSub }}>{activeFeature.desc}</p>
              <div className="text-2xl font-bold font-mono text-white mt-3" style={{ color: C.accentLt }}>
                {activeFeature.stat}
              </div>
            </div>
          </div>

          {/* Metrics card */}
          <div
            className="group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between transition-all duration-300"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHov)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ background: C.cardInner, border: `1px solid ${C.border}` }}>
                  <BarChart3 className="w-5 h-5" style={{ color: C.accentLt }} />
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-lg font-semibold"
                  style={{ background: `${C.accent}22`, color: C.accentLt }}
                >
                  Live
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Rendimiento</h3>
              <p className="text-xs mb-4" style={{ color: C.textMuted }}>Métricas en tiempo real</p>

              <div className="space-y-2">
                {metrics.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMetric(idx)}
                    className="w-full text-left p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: selectedMetric === idx ? C.cardInner : 'transparent',
                      border: `1px solid ${selectedMetric === idx ? C.accent : C.border}`,
                    }}
                  >
                    <p className="text-[10px]" style={{ color: C.textMuted }}>{m.label}</p>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-sm font-bold text-white">{m.value}<span className="text-xs ml-0.5" style={{ color: C.textMuted }}>{m.unit}</span></span>
                      <span className="text-[10px] font-semibold" style={{ color: m.trend.startsWith('+') ? '#22c55e' : '#f87171' }}>
                        {m.trend}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Integrations card */}
          <div
            className="group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between transition-all duration-300"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHov)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div>
              <div className="p-2 rounded-lg w-fit mb-4" style={{ background: C.cardInner, border: `1px solid ${C.border}` }}>
                <Layers className="w-5 h-5" style={{ color: C.accentLt }} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Cobertura</h3>
              <p className="text-xs mb-4" style={{ color: C.textMuted }}>Burós y partners integrados</p>

              <div className="grid grid-cols-3 gap-2">
                {integrations.map((int, idx) => {
                  const Icon = int.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${int.color}18` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: int.color }} />
                      </div>
                      <p className="text-[9px] text-center font-medium" style={{ color: C.textMuted }}>{int.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Terminal card */}
          <div
            className="md:col-span-2 group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between transition-all duration-300"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHov)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg" style={{ background: C.cardInner, border: `1px solid ${C.border}` }}>
                  <Terminal className="w-5 h-5" style={{ color: C.accentLt }} />
                </div>
                <h3 className="text-sm font-bold text-white">Plan de acción</h3>
              </div>

              <div
                className="rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-auto max-h-36"
                style={{ background: '#050203', border: `1px solid ${C.border}` }}
              >
                {codeExample.split('\n').map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="select-none w-5 text-right" style={{ color: 'rgba(74,8,32,0.6)' }}>{idx + 1}</span>
                    <span style={{
                      color: line.includes('//')
                        ? 'rgba(74,8,32,0.8)'
                        : line.includes('✓')
                        ? '#22c55e'
                        : line.includes('const') || line.includes('await')
                        ? '#f9d0d8'
                        : C.textCode,
                    }}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHov)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
              >
                <Icon className="w-4 h-4 mb-3 relative z-10" style={{ color: C.accentLt }} />
                <p className="text-xs relative z-10" style={{ color: C.textMuted }}>{s.label}</p>
                <p className="text-xl font-bold text-white mt-1 relative z-10">{s.value}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
