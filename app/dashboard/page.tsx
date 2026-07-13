'use client';

import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FileText, BarChart3, Settings, Bell, Search, ChevronRight,
  TrendingUp, AlertCircle, CheckCircle,
  Clock, Zap, Target, ChevronDown, X,
  Lock, RefreshCw, Eye,
  Menu, Sun, Moon, ChevronLeft, Activity,
  Gem, Sparkles, Users, BookOpen, Route, BellRing,
  CreditCard, FolderOpen, Timer, ExternalLink,
} from 'lucide-react';
import { CreditCard3D } from '@/components/demo/credit-card-3d';
import { StrategyTimeline } from '@/components/demo/strategy-timeline';
import { AIInsights } from '@/components/demo/ai-insights';

type Theme = 'dark' | 'light';

// Mock — replace with API data contract: { accountTier, tierLabel, tierReasons }
const TIER_DATA = {
  accountTier:  'on_track' as 'on_track' | 'in_progress' | 'needs_attention',
  tierLabel:    'Al día',
  tierReasons:  ['active', 'billing_current', 'monitoring_active'],
};
const TIER_CONFIG = {
  on_track:        { pct: 0.88, label: 'Al día',            color: '#22c55e' },
  in_progress:     { pct: 0.50, label: 'En progreso',       color: '#facc15' },
  needs_attention: { pct: 0.15, label: 'Necesita atención', color: '#ef4444' },
} as const;

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',       id: 'overview' },
  { icon: BarChart3,        label: 'Credit Report',   id: 'reports' },
  { icon: FileText,         label: 'Disputes',        id: 'disputes', badge: 3 },
  { icon: Route,            label: 'Mi Plan',         id: 'mi-plan' },
  { icon: TrendingUp,       label: 'Recommendations', id: 'recommendations' },
  { icon: BellRing,         label: 'Alerts',          id: 'alerts' },
  { icon: Users,            label: 'Accounts',        id: 'accounts' },
  { icon: BookOpen,         label: 'Education',       id: 'education' },
  { icon: Settings,         label: 'Settings',        id: 'settings' },
];
// Mock — replace with Google Drive API data contract:
// { documents: [{ id, uploadDate, url }] }
// 'name' comes from Drive file.name metadata in production; url must be a signed temporary link (PII)
const DOCUMENTS = [
  { id: 'doc_001', name: 'Carta enviada', uploadDate: '2026-06-03', url: '/docs/sample.pdf' },
  { id: 'doc_002', name: 'Carta enviada', uploadDate: '2026-07-01', url: '/docs/sample.pdf' },
];

// Mock — replace with API data contract: { cdmPortalUrl, responseClockDays, responseClockActive, newDocuments30d, nextPayment: { amount, date } }
const QA_DATA = {
  cdmPortalUrl:        'https://portal.clientdisputemanager.com/client-login',
  responseClockDays:   16,
  responseClockActive: true,
  newDocuments30d:     2,
  nextPayment:         { amount: 149.00, date: '2026-08-01' },
};

const T = {
  dark: {
    bg: '#0d0507',
    card: 'linear-gradient(135deg, #1e0e12 0%, #150a0d 100%)',
    cardBorder: 'rgba(74,8,32,0.45)',
    skeletonBg: '#2a1218',
    text: 'text-white',
    sub: 'text-wine-200/50',
    inputBg: '#1e0e12', inputBorder: 'rgba(74,8,32,0.55)',
    rowBg: '#150a0d',   rowBorder: 'rgba(74,8,32,0.3)',
    trackBg: '#2a1218',
  },
  light: {
    bg: '#faf4f5',
    card: '#ffffff',
    cardBorder: '#f0d8dd',
    skeletonBg: '#f0d8dd',
    text: 'text-gray-900',
    sub: 'text-wine-800/50',
    inputBg: '#fff0f3', inputBorder: '#f0d0d8',
    rowBg: '#fff8f9',   rowBorder: '#f0d8dd',
    trackBg: '#f5e0e4',
  },
} as const;

// ── SkeletonCard ──────────────────────────────────────────────────────────────
function SkeletonCard({ theme, lines = 4 }: { theme: Theme; lines?: number }) {
  const bg = T[theme].skeletonBg;
  return (
    <div className="p-5 space-y-3">
      <div className="skeleton-line h-4 w-1/3 rounded" style={{ background: bg }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line rounded" style={{ background: bg, height: '10px', width: `${65 + (i % 3) * 15}%` }} />
      ))}
      <div className="skeleton-line h-8 w-full rounded-xl" style={{ background: bg }} />
    </div>
  );
}

// ── GlowCard ──────────────────────────────────────────────────────────────────
function GlowCard({ children, theme, className = '', delay = 0, loaded }: {
  children: React.ReactNode; theme: Theme; className?: string; delay?: number; loaded: boolean;
}) {
  const t = T[theme];
  return (
    <div
      className={`glow-card rounded-2xl border transition-all duration-700 overflow-hidden ${className} ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: t.card, borderColor: t.cardBorder, transitionDelay: `${delay}ms` }}
    >
      <div className="beam" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── AnimatedCounter ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(from + (target - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{count}</span>;
}

// ── CreditGauge ───────────────────────────────────────────────────────────────
function CreditGauge({ pct, theme }: { pct: number; theme: Theme }) {
  const [mounted, setMounted] = useState(false);
  const r = 80; const cx = 100; const cy = 105;
  const startA = -210; const endA = 30; const totalA = endA - startA;
  const circ = (Math.PI * r * totalA) / 180;
  const offset = circ - pct * circ;
  const toXY = (a: number, rad = r) => {
    const rd = ((a - 90) * Math.PI) / 180;
    return { x: cx + rad * Math.cos(rd), y: cy + rad * Math.sin(rd) };
  };
  const s = toXY(startA); const e = toXY(endA);
  const arc = `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`;
  const needleA = startA + totalA * pct;
  const nRad = ((needleA - 90) * Math.PI) / 180;
  const nx = cx + (r - 12) * Math.cos(nRad);
  const ny = cy + (r - 12) * Math.sin(nRad);
  const trackColor = theme === 'dark' ? '#2a1218' : '#f0d8dd';

  useEffect(() => { const t = setTimeout(() => setMounted(true), 400); return () => clearTimeout(t); }, []);

  return (
    <svg width="200" height="145" viewBox="0 0 200 145">
      <defs>
        <linearGradient id="gG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#dc2626" />
          <stop offset="30%"  stopColor="#f97316" />
          <stop offset="60%"  stopColor="#facc15" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowSm">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={arc} fill="none" stroke="url(#gG)" strokeWidth="18" strokeLinecap="round"
        opacity="0.1"
        strokeDasharray={`${circ}`}
        strokeDashoffset={mounted ? offset : circ}
        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34,1.4,0.64,1)' }}
      />
      <path d={arc} fill="none" stroke={trackColor} strokeWidth="13" strokeLinecap="round" />
      <path d={arc} fill="none" stroke="url(#gG)" strokeWidth="13" strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={mounted ? offset : circ}
        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34,1.4,0.64,1)', filter: 'url(#glow)' }}
      />
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const a = startA + totalA * p;
        const i = toXY(a, r - 20); const o = toXY(a, r - 9);
        return <line key={p} x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke={theme === 'dark' ? 'rgba(249,208,216,0.25)' : 'rgba(122,24,56,0.3)'} strokeWidth="1.5" />;
      })}
      <line x1={cx} y1={cy} x2={mounted ? nx : cx} y2={mounted ? ny : cy}
        stroke={theme === 'dark' ? '#fce7eb' : '#7a1838'} strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: 'x2 1.8s cubic-bezier(0.34,1.4,0.64,1), y2 1.8s cubic-bezier(0.34,1.4,0.64,1)', filter: 'url(#glowSm)' }}
      />
      <circle cx={cx} cy={cy} r="5" fill="#ab1c42" style={{ filter: 'url(#glowSm)' }} />
      <circle cx={cx} cy={cy} r="2.5" fill={theme === 'dark' ? '#fce7eb' : '#fff'} />
      {mounted && (
        <circle cx={nx + Math.cos(nRad) * 12} cy={ny + Math.sin(nRad) * 12}
          r="4" fill="#22c55e"
          style={{ transition: 'cx 1.8s cubic-bezier(0.34,1.4,0.64,1), cy 1.8s cubic-bezier(0.34,1.4,0.64,1)', filter: 'url(#glowSm)' }}
        />
      )}
    </svg>
  );
}

// ── CompactLevelProgress ─────────────────────────────────────────────────────
const TIERS_COMPACT = [
  { label: 'Poor',      min: 300, max: 579,  color: '#dc2626' },
  { label: 'Fair',      min: 580, max: 669,  color: '#f97316' },
  { label: 'Good',      min: 670, max: 739,  color: '#facc15' },
  { label: 'Very Good', min: 740, max: 799,  color: '#84cc16' },
  { label: 'Excellent', min: 800, max: 850,  color: '#22c55e' },
];
function CompactLevelProgress({ score, theme, loaded }: { score: number; theme: Theme; loaded: boolean }) {
  const [barW, setBarW] = useState(0);
  const current = TIERS_COMPACT.find(t => score >= t.min && score <= t.max) ?? TIERS_COMPACT[0];
  const next    = TIERS_COMPACT[TIERS_COMPACT.findIndex(t => t.label === current.label) + 1] ?? null;
  const pct     = Math.min(100, ((score - current.min) / (current.max - current.min + 1)) * 100);
  useEffect(() => { if (loaded) { const t = setTimeout(() => setBarW(pct), 500); return () => clearTimeout(t); } }, [pct, loaded]);
  const dark = theme === 'dark';
  const trackBg = dark ? '#2a1218' : '#f5e0e4';
  return (
    <div className="mt-2 px-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color: current.color }}>{current.label}</span>
        {next && (
          <span className="text-xs font-semibold" style={{ color: next.color }}>
            {next.min - score} pts → {next.label}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden relative" style={{ background: trackBg }}>
        <div className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
          style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${current.color}99, ${current.color})`, boxShadow: `0 0 8px ${current.color}55` }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2.3s infinite' }} />
        </div>
      </div>
    </div>
  );
}

// ── Brand Logo — matches real MCC logo (cup on credit card) ──────────────────
function CoffeeCreditIcon({ size = 32, color = '#dc2626' }: { size?: number; color?: string }) {
  const h = Math.round(size * 0.8);
  return (
    <svg width={size} height={h} viewBox="0 0 65 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body — trapezoid */}
      <path d="M8 6 L53 6 L47 26 L14 26 Z" stroke={color} strokeWidth="2.3" strokeLinejoin="round"/>
      {/* Cup handle — D-curve on right */}
      <path d="M47 14 Q62 14 62 20 Q62 26 47 26" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Credit card body */}
      <rect x="1" y="26" width="58" height="23" rx="3.5" stroke={color} strokeWidth="2.3"/>
      {/* Chip */}
      <rect x="7" y="33" width="11" height="8" rx="1.5" stroke={color} strokeWidth="1.8"/>
      {/* Card lines */}
      <line x1="23" y1="37" x2="44" y2="37" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="23" y1="43" x2="38" y2="43" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function BrandText() {
  return (
    <div className="min-w-0">
      <div className="text-sm font-bold leading-tight tracking-tight">
        <span className="text-white">My Credit </span>
        <span style={{ color: '#e03050' }}>Café</span>
      </div>
      <div className="text-xs tracking-wide" style={{ color: 'rgba(220,150,150,0.45)' }}>
        Better Credit, Better Life.
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, collapsed, setCollapsed, mobileOpen, setMobileOpen }: {
  active: string; setActive: (id: string) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void;
}) {
  const sidebarBg = 'linear-gradient(180deg, #2a1218 0%, #150a0d 60%, #0d0507 100%)';

  const NavBtn = ({ item, showLabel }: { item: (typeof NAV_ITEMS)[0]; showLabel: boolean }) => (
    <button
      onClick={() => { setActive(item.id); setMobileOpen(false); }}
      title={collapsed ? item.label : undefined}
      className={`nav-item group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active === item.id ? 'active text-white' : 'text-wine-200/50 hover:text-white'}`}
      style={active === item.id ? { background: 'rgba(74,30,39,0.7)', borderLeft: '2px solid #ab1c42' } : undefined}
    >
      <item.icon size={16} className="flex-shrink-0" />
      {showLabel && <span className="flex-1 text-left truncate">{item.label}</span>}
      {showLabel && 'badge' in item && item.badge != null && (
        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: '#ab1c42' }}>{item.badge}</span>
      )}
      {!showLabel && 'badge' in item && item.badge != null && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-wine-600" />
      )}
    </button>
  );

  const Inner = ({ showLabel }: { showLabel: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3.5 border-b border-wine-950/50 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <CoffeeCreditIcon size={24} color="white" />
          {showLabel && <BrandText />}
        </div>
        {showLabel && (
          <button onClick={() => setCollapsed(true)} className="text-wine-400/40 hover:text-wine-200/70 transition-colors flex-shrink-0">
            <ChevronLeft size={15} />
          </button>
        )}
      </div>
      <nav className="flex-1 px-2 pt-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => <NavBtn key={item.id} item={item} showLabel={showLabel} />)}
      </nav>
      {showLabel && (
        <div className="mx-2 mb-3 rounded-xl p-3.5 border border-wine-900/50" style={{ background: 'linear-gradient(135deg,#38171f,#1e0e12)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Gem size={14} style={{ color: '#f59e0b' }} />
            <div className="text-sm font-bold text-white">Unlock Premium</div>
          </div>
          <div className="text-xs text-wine-300/55 mb-2.5 leading-relaxed">Get advanced tools, more insights and 3-bureau monitoring.</div>
          <button className="w-full py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>Upgrade Now</button>
        </div>
      )}
      {!showLabel && (
        <div className="px-2 pb-2">
          <button onClick={() => setCollapsed(false)} className="w-full flex items-center justify-center py-2 rounded-lg text-wine-400/50 hover:text-white transition-colors"
            style={{ background: 'rgba(74,8,32,0.2)' }}><ChevronRight size={15} /></button>
        </div>
      )}
      <div className="px-3 py-3 border-t border-wine-950/50 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#ab1c42,#4a0820)' }}>EM</div>
        {showLabel && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Elena Manchehi</div>
              <div className="text-xs text-wine-400/45">Premium Member</div>
            </div>
            <ChevronDown size={13} className="text-wine-400/35 flex-shrink-0" />
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 border-r border-wine-950/50 transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: sidebarBg }}
      >
        <Inner showLabel={!collapsed} />
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full flex flex-col border-r border-wine-950/50 animate-slide-in-left" style={{ background: sidebarBg }}>
            <Inner showLabel />
          </aside>
        </div>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeNav, setActiveNav]       = useState('overview');
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [theme, setTheme]               = useState<Theme>('dark');
  const [themeLoading, setThemeLoading] = useState(false);
  const [loaded, setLoaded]             = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [searchVal, setSearchVal]       = useState('');
  const [showDemo,  setShowDemo]        = useState(false);

  const tier   = TIER_CONFIG[TIER_DATA.accountTier];
  const t = T[theme];

  useEffect(() => { const tid = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(tid); }, []);
  useEffect(() => { const tid = setTimeout(() => setShowDemo(true), 10000); return () => clearTimeout(tid); }, []);

  const handleThemeToggle = () => {
    setThemeLoading(true);
    setTimeout(() => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); setThemeLoading(false); }, 300);
  };

  return (
    <div className="min-h-screen flex" style={{ background: t.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar
        active={activeNav} setActive={setActiveNav}
        collapsed={collapsed} setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* topbar */}
        <header
          className={`flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b flex-shrink-0 transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          style={{ background: 'linear-gradient(90deg,#2a1218 0%,#1e0e12 100%)', borderColor: 'rgba(74,8,32,0.5)' }}
        >
          <button className="lg:hidden text-wine-300/70 hover:text-white transition-colors" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="flex-1 min-w-0">
            <div className="text-base sm:text-lg font-bold text-white leading-tight truncate">Good afternoon, Elena.</div>
            <p className="text-xs text-wine-300/50 hidden sm:block">Your credit health is strong. Let's keep building.</p>
          </div>
          <div className="relative hidden md:flex items-center">
            <Search size={13} className="absolute left-3 text-wine-400/40" />
            <input
              value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Search disputes, reports, accounts..."
              className="text-xs pl-8 pr-3 py-2 rounded-lg outline-none w-44 xl:w-52 text-wine-200/60 placeholder-wine-400/30 border transition-all"
              style={{ background: 'rgba(74,8,32,0.3)', borderColor: 'rgba(74,8,32,0.5)' }}
            />
          </div>
          <button
            onClick={handleThemeToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
            style={{ background: 'rgba(74,8,32,0.4)', borderColor: 'rgba(74,8,32,0.6)' }}
          >
            {theme === 'dark' ? <Sun size={14} className="text-yellow-300" /> : <Moon size={14} className="text-blue-300" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
              style={{ background: 'rgba(74,8,32,0.4)', borderColor: 'rgba(74,8,32,0.6)' }}
            >
              <Bell size={14} className="text-wine-300/70" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-wine-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-wine-400" />
            </button>
            {showNotif && (
              <div
                className="absolute right-0 top-11 w-64 rounded-xl border shadow-2xl z-50 p-4 animate-slide-in-up"
                style={{ background: theme === 'dark' ? '#150a0d' : '#fff', borderColor: t.cardBorder }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${t.text}`}>Notifications</span>
                  <button onClick={() => setShowNotif(false)}><X size={13} className="text-wine-400/50" /></button>
                </div>
                {[
                  { text: 'Dispute #3812 resolved', time: '2h ago',  icon: CheckCircle, c: '#22c55e' },
                  { text: 'Score increased +62 pts', time: '1d ago', icon: TrendingUp,  c: '#ab1c42' },
                  { text: 'New report available',    time: '2d ago', icon: FileText,    c: '#f59e0b' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-t" style={{ borderColor: t.cardBorder }}>
                    <n.icon size={13} color={n.c} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={`text-xs ${t.text}`}>{n.text}</p>
                      <p className={`text-xs ${t.sub}`}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#ab1c42,#4a0820)' }}>EM</div>
        </header>

        {/* main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-5 xl:p-7 2xl:p-9">
          {themeLoading ? (
            <div className="grid grid-cols-12 gap-4 max-w-screen-2xl mx-auto">
              {[5, 7, 7, 5, 6, 6, 12].map((span, i) => (
                <div key={i} className={`col-span-12 lg:col-span-${span} rounded-2xl border`}
                  style={{ borderColor: t.cardBorder, background: t.card }}>
                  <SkeletonCard theme={theme} lines={3 + (i % 3)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 xl:gap-5 2xl:gap-6 max-w-screen-2xl mx-auto">

              {/* Estado de tu cuenta */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-5" delay={200} loaded={loaded}>
                <div className="pt-4 sm:pt-5 px-4 sm:px-5 pb-4 flex flex-col h-full">
                  <div className="text-center">
                    <div className={`text-xs uppercase tracking-widest mb-1 ${t.sub}`}>Estado de tu cuenta</div>
                    {/* overflow-hidden clips the SVG's empty bottom (below cy=105) */}
                    <div className="flex justify-center overflow-hidden" style={{ height: '88px' }}>
                      <div style={{ transform: 'scale(0.82)', transformOrigin: 'top center', flexShrink: 0 }}>
                        <CreditGauge pct={tier.pct} theme={theme} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mt-1 mb-2" style={{ color: tier.color }}>
                      {tier.label}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-2">
                    <CreditCard3D />
                  </div>
                  <button className="flex items-center gap-1 text-xs font-semibold mx-auto hover:opacity-80 transition-opacity"
                    style={{ color: '#e04a6e' }}>
                    View Credit Report <ChevronRight size={13} />
                  </button>
                </div>
              </GlowCard>

              {/* Quick Actions */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-7" delay={300} loaded={loaded}>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-semibold ${t.text}`}>Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {/* Card 1 — Detalle de disputas (link-out to CDM portal) */}
                      <div className="rounded-xl p-3 sm:p-4 border flex flex-col gap-2 transition-all duration-200 hover:scale-[1.02]"
                        style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#ab1c4222' }}>
                          <ExternalLink size={16} color="#ab1c42" />
                        </div>
                        <div className="min-h-0 flex-1 mt-1">
                          <div className={`text-xs font-semibold ${t.text}`}>Detalle de disputas</div>
                          <div className={`text-xs mt-0.5 ${t.sub}`}>Status por item y bureau</div>
                        </div>
                        <a
                          href={QA_DATA.cdmPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto w-full py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all text-center block"
                          style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>
                          Abrir portal →
                        </a>
                      </div>
                      {/* Card 2 — Reloj de respuesta FCRA */}
                      {(() => {
                        const { responseClockDays: days, responseClockActive: clockOn } = QA_DATA;
                        const urgent = clockOn && days <= 7;
                        const color  = urgent ? '#ef4444' : clockOn ? '#f59e0b' : '#22c55e';
                        return (
                          <div className="rounded-xl p-3 sm:p-4 border flex flex-col gap-2 transition-all duration-200 hover:scale-[1.02]"
                            style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                              <Timer size={16} color={color} />
                            </div>
                            <div className={`text-xl font-bold ${t.text}`}>
                              {clockOn ? `${days}d` : '—'}
                            </div>
                            <div className="min-h-0 flex-1">
                              <div className={`text-xs font-semibold ${t.text}`}>Reloj FCRA</div>
                              <div className={`text-xs mt-0.5 ${t.sub}`}>
                                {clockOn ? 'Días para respuesta del buró' : 'Sin disputas activas'}
                              </div>
                            </div>
                            <button className="mt-auto w-full py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all"
                              style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>
                              Ver plan
                            </button>
                          </div>
                        );
                      })()}
                      {/* Card 3 — Documentos nuevos */}
                      {(() => {
                        const docs = QA_DATA.newDocuments30d;
                        return (
                          <div className="rounded-xl p-3 sm:p-4 border flex flex-col gap-2 transition-all duration-200 hover:scale-[1.02]"
                            style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3b82f622' }}>
                              <FolderOpen size={16} color="#3b82f6" />
                            </div>
                            <div className={`text-xl font-bold ${t.text}`}>{docs}</div>
                            <div className="min-h-0 flex-1">
                              <div className={`text-xs font-semibold ${t.text}`}>Documentos nuevos</div>
                              <div className={`text-xs mt-0.5 ${t.sub}`}>En los últimos 30 días</div>
                            </div>
                            <button className="mt-auto w-full py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all"
                              style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>
                              Ver documentos
                            </button>
                          </div>
                        );
                      })()}
                      {/* Card 4 — Próximo pago */}
                      {(() => {
                        const { amount, date } = QA_DATA.nextPayment;
                        const payDate = new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
                        return (
                          <div className="rounded-xl p-3 sm:p-4 border flex flex-col gap-2 transition-all duration-200 hover:scale-[1.02]"
                            style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#22c55e22' }}>
                              <CreditCard size={16} color="#22c55e" />
                            </div>
                            <div className={`text-xl font-bold ${t.text}`}>${amount.toFixed(0)}</div>
                            <div className="min-h-0 flex-1">
                              <div className={`text-xs font-semibold ${t.text}`}>Próximo pago</div>
                              <div className={`text-xs mt-0.5 ${t.sub}`}>{payDate}</div>
                            </div>
                            <button className="mt-auto w-full py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all"
                              style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>
                              Ver facturación
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
              </GlowCard>

              {/* Strategy Plan */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-6" delay={550} loaded={loaded}>
                <StrategyTimeline theme={theme} />
              </GlowCard>

              {/* AI Insights */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-6" delay={600} loaded={loaded}>
                <AIInsights theme={theme} />
              </GlowCard>

              {/* Documentos */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-7" delay={650} loaded={loaded}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-semibold ${t.text}`}>Documentos</span>
                  </div>
                  {DOCUMENTS.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText size={28} color="#ab1c42" className="mx-auto mb-2 opacity-30" />
                      <p className={`text-xs ${t.sub}`}>No hay documentos disponibles aún.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {DOCUMENTS.map((doc) => {
                        const uploadDate = new Date(doc.uploadDate).toLocaleDateString('es-MX', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        });
                        return (
                          <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
                            style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(224,74,110,0.12)' }}>
                              <FileText size={13} color="#e04a6e" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold ${t.text}`}>{doc.name}</div>
                              <div className={`text-xs mt-0.5 ${t.sub}`}>{uploadDate}</div>
                            </div>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:brightness-110"
                              style={{ background: 'rgba(224,74,110,0.12)', color: '#e04a6e' }}>
                              Ver <ExternalLink size={10} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </GlowCard>

              {/* Account Summary */}
              <GlowCard theme={theme} className="col-span-12 lg:col-span-5" delay={700} loaded={loaded}>
                <div className="p-5 flex flex-col gap-4">
                  {/* Link-out to monitoring portal */}
                  <div className="rounded-xl p-4 border flex flex-col items-center text-center gap-3"
                    style={{ background: t.rowBg, borderColor: t.rowBorder }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(224,74,110,0.1)' }}>
                      <BarChart3 size={20} color="#e04a6e" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold mb-1 ${t.text}`}>Resumen de cuenta</div>
                      <div className={`text-xs leading-relaxed ${t.sub}`}>
                        Tu resumen de cuenta está disponible en tu portal de monitoreo
                      </div>
                    </div>
                    <a href="https://portal.myfreescorenow.com" target="_blank" rel="noopener noreferrer"
                      className="w-full py-2 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all text-center block"
                      style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}>
                      Ver balances y cuentas →
                    </a>
                  </div>

                  {/* Identity Protection — real source: MyFreeScoreNow */}
                  <div className="p-3 rounded-xl flex items-center gap-3 border"
                    style={{ background: theme === 'dark' ? 'linear-gradient(135deg,#2a1218,#1e0e12)' : '#fff5f6', borderColor: t.cardBorder }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ab1c4222' }}>
                      <Lock size={13} color="#ab1c42" />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${t.text}`}>Identity Protection Active</div>
                      <div className={`text-xs ${t.sub}`}>Monitoring 3 bureaus 24/7</div>
                    </div>
                    <button className="ml-auto flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#e04a6e' }}>
                      View status <ChevronRight size={11} />
                    </button>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  </div>
                </div>
              </GlowCard>

            </div>
          )}
        </main>
      </div>

      {/* Demo banner — slim bar on mobile, card on desktop */}
      {showDemo && (
        <>
          {/* Mobile: thin bottom bar, full-width, above safe area */}
          <div
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 border-t animate-slide-in-up"
            style={{
              background:  '#150a0d',
              borderColor: 'rgba(224,74,110,0.3)',
              boxShadow:   '0 -4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <p className="flex-1 text-xs" style={{ color: 'rgba(249,208,216,0.6)' }}>
              <span className="font-semibold text-white">Demo</span>
              {' — '}Se está revisando qué data conectar. Se les avisará pronto.
            </p>
            <button onClick={() => setShowDemo(false)} className="flex-shrink-0 p-1" aria-label="Cerrar">
              <X size={13} style={{ color: 'rgba(249,208,216,0.4)' }} />
            </button>
          </div>

          {/* Desktop: card bottom-right */}
          <div
            className="hidden sm:block fixed bottom-6 right-6 z-50 w-72 rounded-2xl border shadow-2xl p-4 animate-slide-in-up"
            style={{
              background:  'linear-gradient(135deg, #1e0e12 0%, #150a0d 100%)',
              borderColor: 'rgba(224,74,110,0.35)',
              boxShadow:   '0 8px 40px rgba(171,28,66,0.25), 0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Demo</span>
              </div>
              <button onClick={() => setShowDemo(false)} className="text-wine-400/40 hover:text-wine-200/70 transition-colors" aria-label="Cerrar">
                <X size={14} />
              </button>
            </div>
            <p className="text-sm font-semibold text-white leading-snug mb-1">Esto es un demo</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(249,208,216,0.55)' }}>
              Se está revisando qué data puede ser conectada. Se les avisará pronto.
            </p>
            <div className="mt-3 pt-3 flex items-center justify-between border-t" style={{ borderColor: 'rgba(74,8,32,0.5)' }}>
              <div className="flex items-center gap-1.5">
                <CoffeeCreditIcon size={16} color="#e04a6e" />
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(249,208,216,0.35)' }}>My Credit Café</span>
              </div>
              <button
                onClick={() => setShowDemo(false)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:brightness-110"
                style={{ background: 'rgba(171,28,66,0.25)', color: '#e04a6e' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
