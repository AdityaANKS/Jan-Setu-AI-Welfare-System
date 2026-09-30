import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Network,
  UserCheck,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
  ShieldCheck,
  Cpu,
  KeyRound,
} from 'lucide-react';
import { api } from './api';
import PipelineStudio from './components/PipelineStudio';
import KnowledgeGraphView from './components/KnowledgeGraphView';
import CitizenDashboard from './components/CitizenDashboard';
import AdminPanchayatView from './components/AdminPanchayatView';
import ExecutiveDeckView from './components/ExecutiveDeckView';
import SIWCModal from './components/SIWCModal';

const NAV_TABS = [
  { id: 'studio', label: '01. Live 4-Step Pipeline', icon: Sparkles },
  { id: 'kg', label: '02. Policy KG & Jevify AI', icon: Network },
  { id: 'citizen', label: '03. Citizen Dashboard', icon: UserCheck },
  { id: 'admin', label: '04. Admin / Panchayat View', icon: BarChart3 },
  { id: 'deck', label: '05. Executive Deck & Roadmap', icon: BookOpen },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [darkMode, setDarkMode] = useState(false);
  const [health, setHealth] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [siwcSession, setSiwcSession] = useState(null);
  const [siwcModalOpen, setSiwcModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const refreshGlobalData = async () => {
    try {
      const [hRes, sRes, aRes, siwcRes] = await Promise.all([
        api.getHealth(),
        api.getSchemes(),
        api.getAdminAnalytics(),
        api.getSIWCSession(),
      ]);
      setHealth(hRes);
      setSchemes(sRes.schemes || []);
      setAnalytics(aRes);
      setSiwcSession(siwcRes);
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-parchment dark:bg-[#0F1626] text-ink-primary dark:text-parchment">
      {/* Top Sovereign Editorial Header Bar */}
      <header className="sticky top-0 z-40 bg-ivory/95 dark:bg-navy-deep/95 backdrop-blur-sm border-b border-hairline dark:border-navy-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Upper Editorial Kicker Strip */}
          <div className="py-2 border-b border-hairline/70 dark:border-navy-muted flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="font-bold text-terracotta">JAN-SETU AI • जन-सेतु • ಜನ-ಸೇತು</span>
              <span className="hidden md:inline text-ink-mono dark:text-stone/70">
                ZERO-CLICK PROACTIVE ENTITLEMENT DELIVERY ON THE INDIA STACK
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-forest/15 text-forest dark:text-emerald-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DEPA ZKP • 200 Citizens • 15 Schemes</span>
              </span>
              <span className="text-ink-mono dark:text-ochre font-semibold">
                TRACK 1 — DPI &amp; GOVERNANCE
              </span>
            </div>
          </div>

          {/* Main Navigation Row */}
          <div className="py-2.5 flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Primary Modules" className="flex items-center gap-1.5 overflow-x-auto py-1">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-all ${
                      active
                        ? 'bg-navy-deep dark:bg-terracotta text-white shadow-sm'
                        : 'text-ink-secondary dark:text-stone hover:bg-stone/60 dark:hover:bg-navy-surface'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Sign in with ChatGPT (SIWC) + Theme Toggle */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setSiwcModalOpen(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <KeyRound className="w-3.5 h-3.5 text-ochre dark:text-terracotta" />
                <span>
                  {siwcSession?.authenticated
                    ? `SIWC: ${siwcSession.active_model}`
                    : 'Sign in with ChatGPT'}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    siwcSession?.authenticated ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle Gazette Light and Sovereign Dark Mode"
                className="min-h-[44px] min-w-[44px] rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-surface flex items-center justify-center text-ink-primary dark:text-ochre hover:bg-stone/60 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'studio' && (
          <PipelineStudio schemes={schemes} onGlobalRefresh={refreshGlobalData} />
        )}
        {activeTab === 'kg' && <KnowledgeGraphView schemes={schemes} />}
        {activeTab === 'citizen' && (
          <CitizenDashboard onGlobalRefresh={refreshGlobalData} />
        )}
        {activeTab === 'admin' && (
          <AdminPanchayatView analytics={analytics} onRefresh={refreshGlobalData} />
        )}
        {activeTab === 'deck' && (
          <ExecutiveDeckView onJumpToStudio={() => setActiveTab('studio')} />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-hairline dark:border-navy-muted bg-stone/50 dark:bg-navy-deep py-5 px-4 sm:px-6 text-xs font-mono text-ink-mono dark:text-stone/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            JAN-SETU AI (जन-सेतु) • ZERO-CLICK PROACTIVE ENTITLEMENT DELIVERY ON THE INDIA STACK
          </div>
          <div className="flex items-center gap-4">
            <span>DEPA v1.2 • DPDP Act 2023</span>
            <span>Bhashini 22 Languages</span>
            <span>Jevify + OpenAI SIWC</span>
          </div>
        </div>
      </footer>

      {/* OpenAI Sign in with ChatGPT (SIWC) Modal */}
      <SIWCModal
        isOpen={siwcModalOpen}
        onClose={() => setSiwcModalOpen(false)}
        session={siwcSession}
        onSessionChange={(updated) => setSiwcSession(updated)}
      />
    </div>
  );
}
