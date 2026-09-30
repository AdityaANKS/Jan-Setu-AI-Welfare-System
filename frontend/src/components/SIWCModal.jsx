import React, { useState } from 'react';
import { ShieldCheck, KeyRound, CheckCircle2, LogOut, RefreshCw, Cpu, Lock, ExternalLink, X } from 'lucide-react';
import { api } from '../api';

export default function SIWCModal({ isOpen, onClose, session, onSessionChange }) {
  const [email, setEmail] = useState(session?.user?.email || 'dwo.jansetu@india-stack.gov.in');
  const [planTier, setPlanTier] = useState(session?.user?.plan_tier || 'ChatGPT Pro (SIWC Token-Sharing Enabled)');
  const [selectedModel, setSelectedModel] = useState(session?.active_model || 'gpt-4o');
  const [pkceTrace, setPkceTrace] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignInWithChatGPT = async () => {
    setLoading(true);
    try {
      const authChallenge = await api.authorizeSIWC({
        redirect_uri: window.location.origin + '/auth/siwc/callback',
        plan_preference: planTier,
      });
      setPkceTrace(authChallenge);
      const updatedSession = await api.callbackSIWC({
        state: authChallenge.state,
        email,
        plan_tier: planTier,
        active_model: selectedModel,
      });
      onSessionChange(updatedSession);
    } catch (err) {
      console.error('SIWC Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      await api.revokeSIWC();
      const updated = await api.getSIWCSession();
      onSessionChange(updated);
    } catch (err) {
      console.error('SIWC Revoke Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="siwc-modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted shadow-2xl overflow-hidden">
        {/* Top Accent Rule */}
        <div className="h-1.5 w-full bg-gradient-to-r from-navy-deep via-terracotta to-forest" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline dark:border-navy-muted">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-navy-deep text-white font-mono text-xs font-bold">
              SIWC
            </span>
            <div>
              <h2 id="siwc-modal-title" className="font-serif text-xl text-ink-primary dark:text-parchment leading-tight">
                Sign in with ChatGPT — OpenAI SIWC Broker
              </h2>
              <p className="text-xs font-mono text-ink-mono dark:text-stone/70">
                OAuth 2.0 Authorization Code + PKCE (S256) • OpenID Connect
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sign in with ChatGPT modal"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-ink-secondary hover:bg-stone/50 dark:text-stone dark:hover:bg-navy-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: OpenAI SIWC Auth Card (styled per developers.openai.com/siwc) */}
          <div className="md:col-span-6 bg-white dark:bg-navy-deep border border-hairline dark:border-navy-muted rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mx-auto mb-3 h-12 w-12 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-surface flex items-center justify-center text-terracotta font-serif text-2xl font-bold">
                जन
              </div>
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-ink-primary dark:text-white">
                  Connect ChatGPT Plan to Jan-Setu AI
                </h3>
                <p className="text-xs text-ink-secondary dark:text-stone/80 mt-1">
                  Use your eligible ChatGPT plan for Stage 01 Gazette GraphRAG parsing and multilingual NLU.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="siwc-email">
                    Officer / Analyst Account
                  </label>
                  <input
                    id="siwc-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-lg border border-hairline dark:border-navy-muted bg-ivory dark:bg-navy-surface text-ink-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="siwc-plan">
                    ChatGPT Plan Tier
                  </label>
                  <select
                    id="siwc-plan"
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-lg border border-hairline dark:border-navy-muted bg-ivory dark:bg-navy-surface text-ink-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                  >
                    <option value="ChatGPT Pro (SIWC Token-Sharing Enabled)">ChatGPT Pro (SIWC Token-Sharing)</option>
                    <option value="ChatGPT Plus (Developer Quota)">ChatGPT Plus (Developer Quota)</option>
                    <option value="ChatGPT Enterprise (NIC Sovereign Workspace)">ChatGPT Enterprise (NIC Sovereign)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="siwc-model">
                    Stage 01 Gazette Parser Model
                  </label>
                  <select
                    id="siwc-model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono rounded-lg border border-hairline dark:border-navy-muted bg-ivory dark:bg-navy-surface text-ink-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                  >
                    <option value="gpt-4o">gpt-4o (Multilingual Gazette AST Parser)</option>
                    <option value="o3-mini">o3-mini (Formal Boolean Clause Verifier)</option>
                    <option value="gpt-4.1-mini">gpt-4.1-mini (Low-Latency Dialect NLU)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleSignInWithChatGPT}
                disabled={loading}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center justify-between hover:opacity-90 transition-opacity"
              >
                {/* OpenAI Blossom Vector */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
                  <path d="M38.355 36.52v-9.415c0-.793.297-1.388.99-1.784l18.93-10.902c2.578-1.486 5.65-2.18 8.82-2.18 11.894 0 19.426 9.218 19.426 19.029 0 .694 0 1.486-.1 2.28L66.799 22.05c-1.189-.694-2.379-.694-3.568 0L38.355 36.52Zm44.202 36.67V50.694c0-1.388-.596-2.38-1.785-3.073L55.897 33.15l8.126-4.658c.694-.396 1.289-.396 1.982 0l18.93 10.902c5.452 3.172 9.118 9.91 9.118 16.452 0 7.531-4.46 14.47-11.496 17.344Zm-50.05-19.82-8.127-4.757c-.693-.396-.99-.99-.99-1.784V25.025c0-10.605 8.126-18.633 19.127-18.633 4.163 0 8.028 1.388 11.3 3.865l-19.525 11.3c-1.189.693-1.784 1.684-1.784 3.072v28.74ZM50 63.478l-11.645-6.541V43.062L50 36.522l11.645 6.54v13.875L50 63.477Z" />
                </svg>
                <span>{loading ? 'Verifying PKCE S256 Handshake...' : 'Continue with ChatGPT (SIWC)'}</span>
                <span className="h-5 w-5 rounded-full bg-white/20 dark:bg-black/15 inline-flex items-center justify-center text-xs">
                  ✓
                </span>
              </button>

              {session?.authenticated && (
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={loading}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-terracotta/50 text-terracotta text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-terracotta/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Revoke SIWC OAuth Token</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: PKCE & Tier 01 Governance Guardrails */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div className="bg-navy-deep text-parchment rounded-xl p-4 border border-navy-muted space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-ochre flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Active SIWC Telemetry
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                    session?.authenticated ? 'bg-forest text-white' : 'bg-terracotta text-white'
                  }`}
                >
                  {session?.authenticated ? 'OAUTH2_PKCE_ACTIVE' : 'REVOKED'}
                </span>
              </div>

              <div className="text-xs font-mono space-y-1.5 text-stone/90">
                <div className="flex justify-between">
                  <span className="text-stone/60">Client ID:</span>
                  <span className="truncate max-w-[200px]">{session?.client_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone/60">Host VM ID:</span>
                  <span>{session?.host_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone/60">PKCE Method:</span>
                  <span className="text-ochre">{session?.pkce?.code_challenge_method || 'S256'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone/60">Active Model:</span>
                  <span className="text-white font-bold">{session?.active_model}</span>
                </div>
              </div>

              {pkceTrace && (
                <div className="pt-2 border-t border-navy-muted text-xs font-mono text-stone/80">
                  <div className="text-ochre mb-0.5">Latest PKCE S256 Challenge:</div>
                  <div className="truncate bg-navy-surface p-1.5 rounded">
                    {pkceTrace.pkce?.code_challenge}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-stone/50 dark:bg-navy-deep/60 border border-hairline dark:border-navy-muted rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-ochre">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Tier 01 No-Black-Box Safeguard</span>
              </div>
              <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
                OpenAI SIWC and <strong>Jevify (`jevify`)</strong> are strictly sandboxed to{' '}
                <strong>Stage 01 Gazette Text-to-AST Parsing</strong> and{' '}
                <strong>Stage 03 Bhashini NLU Intent Readout</strong>. Actual citizen eligibility
                matching runs 100% on Jan-Setu’s deterministic boolean rule engine with auditable Gazette clause citations.
              </p>
              <div className="pt-1 flex items-center gap-4 text-xs font-mono">
                <a
                  href="https://developers.openai.com/siwc"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-terracotta hover:underline"
                >
                  <span>OpenAI SIWC Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://github.com/fidecastro/jevify"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-forest dark:text-ochre hover:underline"
                >
                  <span>fidecastro/jevify</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
