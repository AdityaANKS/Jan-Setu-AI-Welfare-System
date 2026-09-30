import { handleOfflineRequest } from './offlineFallback';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api/v1';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    // Try relative /api/v1 proxy first, then fall back to in-browser static engine (for Netlify/Vercel)
    if (API_BASE.startsWith('http')) {
      try {
        res = await fetch(`/api/v1${path}`, { ...options, headers });
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          return await handleOfflineRequest(path, options);
        }
      } catch {
        return await handleOfflineRequest(path, options);
      }
    } else {
      return await handleOfflineRequest(path, options);
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return await handleOfflineRequest(path, options);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `HTTP ${res.status}`);
  }
  return await res.json();
}

export const api = {
  getHealth: () => request('/health'),
  getSchemes: () => request('/schemes'),
  ingestPolicy: (payload) =>
    request('/policy/ingest', { method: 'POST', body: JSON.stringify(payload) }),
  uploadPolicyPdf: (file, jevifyRecipe = 'gemma-4-e4b-it.llamacpp') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jevify_recipe', jevifyRecipe);
    return request('/policy/upload-pdf', { method: 'POST', body: formData });
  },
  getCitizens: ({ cohort = 'all', state = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (cohort) params.set('cohort', cohort);
    if (state) params.set('state', state);
    if (search) params.set('search', search);
    return request(`/citizens?${params.toString()}`);
  },
  getCitizenEntitlements: (citizenId) =>
    request(`/citizens/${encodeURIComponent(citizenId)}/entitlements`),
  matchCohort: (payload) =>
    request('/match/cohort', { method: 'POST', body: JSON.stringify(payload) }),
  triggerOutboundVoice: (payload) =>
    request('/voice/outbound', { method: 'POST', body: JSON.stringify(payload) }),
  verifyVoiceConsent: (payload) =>
    request('/voice/verify-consent', { method: 'POST', body: JSON.stringify(payload) }),
  dispatchDBT: (payload) =>
    request('/dbt/dispatch', { method: 'POST', body: JSON.stringify(payload) }),
  getAdminAnalytics: () => request('/admin/analytics'),
  submitHITLReview: (payload) =>
    request('/admin/hitl-review', { method: 'POST', body: JSON.stringify(payload) }),
  getJevifyRecipes: () => request('/ai/jevify/recipes'),
  probeJevify: (recipe) =>
    request(`/ai/jevify/probe?recipe=${encodeURIComponent(recipe)}`, { method: 'POST' }),
  askJevify: (payload) =>
    request('/ai/jevify/ask', { method: 'POST', body: JSON.stringify(payload) }),
  getSIWCSession: () => request('/auth/siwc/session'),
  authorizeSIWC: (payload = {}) =>
    request('/auth/siwc/authorize', { method: 'POST', body: JSON.stringify(payload) }),
  callbackSIWC: (payload = {}) =>
    request('/auth/siwc/callback', { method: 'POST', body: JSON.stringify(payload) }),
  revokeSIWC: () => request('/auth/siwc/revoke', { method: 'POST' }),
};
