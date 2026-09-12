/**
 * DAILYLIFE (Project Mirror) — Authentication & Multi-User State Manager
 * Connects to FastAPI backend (http://localhost:8000/api/auth) with graceful offline fallback.
 */

const USERS_STORAGE_KEY = 'dailylife_users_v2';
const ACTIVE_SESSION_KEY = 'dailylife_active_user';
const TOKEN_KEY = 'dailylife_jwt_token';
const API_BASE_URL = 'http://127.0.0.1:8000';

class AuthManager {
  constructor() {
    this.users = this.loadAllUsers();
  }

  loadAllUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveAllUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  getActiveUsername() {
    try {
      return localStorage.getItem(ACTIVE_SESSION_KEY);
    } catch (e) {
      return null;
    }
  }

  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  isAuthenticated() {
    const user = this.getActiveUsername();
    return !!user;
  }

  getCurrentUser() {
    const username = this.getActiveUsername();
    if (!username) return null;
    return this.users[username] || { username, fullName: username, careerTrack: 'Software Engineer & Builder', themeMode: 'dark' };
  }

  // Register with Backend API + local fallback
  async register(username, password, fullName, careerTrack = 'Software Engineer & Builder') {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return { success: false, message: 'Username cannot be blank.' };
    if (password.length < 3) return { success: false, message: 'Password must be at least 3 characters.' };

    // 1. Try registering with FastAPI backend
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: `${cleanUsername}@life.rpg`,
          password: password,
          full_name: fullName.trim() || cleanUsername,
          career_track: careerTrack
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);

        const newUser = {
          username: cleanUsername,
          fullName: fullName.trim() || cleanUsername,
          careerTrack: careerTrack,
          lifeGoal: '',
          themeMode: 'dark',
          createdAt: new Date().toISOString(),
          userData: null
        };
        this.users[cleanUsername] = newUser;
        this.saveAllUsers();
        return { success: true, user: newUser, isBackend: true };
      } else {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 400 && err.detail) {
          return { success: false, message: err.detail };
        }
      }
    } catch (apiErr) {
      console.log('FastAPI backend offline, registering in local database.');
    }

    // 2. Offline / Local fallback
    if (this.users[cleanUsername]) {
      return { success: false, message: 'Username already registered. Please sign in.' };
    }

    const newUser = {
      username: cleanUsername,
      password: password,
      fullName: fullName.trim() || cleanUsername,
      careerTrack: careerTrack,
      lifeGoal: '',
      themeMode: 'dark',
      createdAt: new Date().toISOString(),
      userData: null
    };

    this.users[cleanUsername] = newUser;
    this.saveAllUsers();
    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
    return { success: true, user: newUser, isBackend: false };
  }

  // Login with Backend API + local fallback
  async login(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return { success: false, message: 'Please enter your username.' };
    if (!password) return { success: false, message: 'Please enter your password.' };

    // 1. Try logging in with FastAPI backend
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: password
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);

        if (!this.users[cleanUsername]) {
          this.users[cleanUsername] = {
            username: cleanUsername,
            fullName: data.user.full_name || cleanUsername,
            careerTrack: data.user.career_track || 'Software Engineer & Builder',
            themeMode: 'dark',
            createdAt: new Date().toISOString(),
            userData: null
          };
          this.saveAllUsers();
        }
        return { success: true, user: this.users[cleanUsername], isBackend: true };
      } else {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 401 || resp.status === 400) {
          return { success: false, message: err.detail || 'Invalid username or password.' };
        }
      }
    } catch (apiErr) {
      console.log('FastAPI backend offline, verifying in local database.');
    }

    // 2. Offline / Local fallback
    const user = this.users[cleanUsername];
    if (!user) {
      return { success: false, message: 'Account not found. Please click Create Account above to register.' };
    }
    if (user.password && user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
    return { success: true, user, isBackend: false };
  }

  logout() {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  saveCurrentUserData(updatedData) {
    const username = this.getActiveUsername();
    if (username && this.users[username]) {
      this.users[username].userData = updatedData;
      if (updatedData.themeMode) this.users[username].themeMode = updatedData.themeMode;
      if (updatedData.careerTrack) this.users[username].careerTrack = updatedData.careerTrack;
      if (updatedData.lifeGoal) this.users[username].lifeGoal = updatedData.lifeGoal;
      this.saveAllUsers();
    }
  }
}

window.Auth = new AuthManager();
