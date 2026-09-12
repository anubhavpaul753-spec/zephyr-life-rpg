/**
 * MIRROR — FastAPI Backend API Client
 * Connects frontend directly to FastAPI backend endpoints with JWT authentication:
 * /api/auth, /api/quests, /api/career, /api/relationships, /api/shop, /api/crossroads
 */

class MirrorApiClient {
  constructor(baseUrl = '') {
    if (!baseUrl && typeof window !== 'undefined' && window.location) {
      // If served by VS Code Live Server (port 5500/3000) or file://, target local FastAPI backend port 8000
      if (window.location.port === '5500' || window.location.port === '3000' || window.location.protocol === 'file:') {
        this.baseUrl = 'http://127.0.0.1:8000';
      } else {
        this.baseUrl = '';
      }
    } else {
      this.baseUrl = baseUrl;
    }
    this.tokenKey = 'mirror_jwt_token';
  }

  getToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (e) {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
    } catch (e) {
      console.warn('Could not persist JWT token:', e);
    }
  }

  clearToken() {
    this.setToken(null);
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const opts = {
      ...options,
      headers: this.getHeaders(options.headers)
    };

    try {
      const res = await fetch(url, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: data.detail || data.message || `Request failed with status ${res.status}`,
          data: null
        };
      }
      return { ok: true, status: res.status, data, error: null };
    } catch (err) {
      console.warn(`[API] Network error calling ${path}:`, err);
      return { ok: false, status: 0, error: err.message, data: null };
    }
  }

  // Auth Endpoints
  async register(username, password, fullName, careerTrack, email) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email ? email.trim() : `${cleanUsername}@zephyr.app`;
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: cleanUsername,
        email: cleanEmail,
        password: password,
        full_name: fullName.trim() || cleanUsername,
        career_track: careerTrack || 'Software Engineer & Builder',
        life_goal: 'Master full-stack architecture and build a peaceful life.'
      })
    });

    if (res.ok && res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res;
  }

  async login(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: cleanUsername,
        password: password
      })
    });

    if (res.ok && res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Quests Endpoints
  async getQuests() {
    return this.request('/api/quests');
  }

  async completeQuest(questId) {
    return this.request(`/api/quests/${questId}/complete`, {
      method: 'POST'
    });
  }

  async resetRoutine() {
    return this.request('/api/quests/reset-routine', {
      method: 'POST'
    });
  }

  // Career Endpoints
  async getCareerTracks() {
    return this.request('/api/career/tracks');
  }

  async selectCareer(track, lifeGoal) {
    return this.request('/api/career/select', {
      method: 'POST',
      body: JSON.stringify({
        career_track: track,
        life_goal: lifeGoal || ''
      })
    });
  }

  // Relationships Endpoints
  async getRelationships() {
    return this.request('/api/relationships');
  }

  async logRelationship(bondId, action, reflection) {
    return this.request(`/api/relationships/${bondId}/log`, {
      method: 'POST',
      body: JSON.stringify({
        action_summary: action,
        personal_reflection: reflection,
        trust_delta: 5
      })
    });
  }

  // Shop Endpoints
  async getShopItems() {
    return this.request('/api/shop/items');
  }

  async buyShopItem(itemKey) {
    return this.request(`/api/shop/buy/${encodeURIComponent(itemKey)}`, {
      method: 'POST'
    });
  }

  // Crossroads Endpoints
  async evaluateCrossroads(action, deadlock) {
    return this.request('/api/crossroads/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        contemplating_action: action,
        perceived_deadlock: deadlock
      })
    });
  }

  async resolveCrossroads(path, notes, newTrack) {
    return this.request('/api/crossroads/resolve', {
      method: 'POST',
      body: JSON.stringify({
        resolution_path: path,
        reflection_notes: notes,
        new_career_track: newTrack || null
      })
    });
  }
}

window.API = new MirrorApiClient();
