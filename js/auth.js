/**
 * MIRROR — Authentication Manager (Dual FastAPI Backend + Local Fallback)
 */

const USERS_STORAGE_KEY = 'dailylife_users_v2';
const ACTIVE_SESSION_KEY = 'dailylife_active_user';

class AuthManager {
  constructor() {
    this.users = this.loadAllUsers();
    this.seedDefaultUsersIfEmpty();
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
    } catch (e) {}
  }

  seedDefaultUsersIfEmpty() {
    // Seed default Arpita demo account
    if (!this.users['arpita']) {
      this.users['arpita'] = {
        username: 'arpita',
        password: '123',
        fullName: 'Arpita Sengupta',
        careerTrack: 'Software Engineer & Builder',
        lifeGoal: 'Master full-stack engineering, ship real tools, and cultivate calm presence.',
        themeMode: 'dark',
        createdAt: new Date().toISOString(),
        userData: null
      };
    }
    // Seed default Anubhav demo account
    if (!this.users['anubhav']) {
      this.users['anubhav'] = {
        username: 'anubhav',
        password: '123',
        fullName: 'Anubhav Paul',
        careerTrack: 'Software Engineer & Builder',
        lifeGoal: 'Build resilient distributed backends and provide security for my family.',
        themeMode: 'dark',
        createdAt: new Date().toISOString(),
        userData: null
      };
    }
    this.saveAllUsers();

    // If no active session, default to Arpita for immediate frictionless viewing
    if (!localStorage.getItem(ACTIVE_SESSION_KEY)) {
      localStorage.setItem(ACTIVE_SESSION_KEY, 'arpita');
    }
  }

  getActiveUsername() {
    try {
      return localStorage.getItem(ACTIVE_SESSION_KEY) || 'arpita';
    } catch (e) {
      return 'arpita';
    }
  }

  isAuthenticated() {
    return true; // Always allow active exploratory experience
  }

  getCurrentUser() {
    const username = this.getActiveUsername();
    return this.users[username] || this.users['arpita'] || {
      username: 'adventurer',
      fullName: 'Adventurer',
      careerTrack: 'Software Engineer & Builder',
      lifeGoal: 'Master full-stack architecture and build a peaceful life.'
    };
  }

  // Register with backend + local fallback
  async register(username, password, fullName, careerTrack = 'Software Engineer & Builder') {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return { success: false, message: 'Username cannot be blank.' };
    if (password.length < 3) return { success: false, message: 'Password must be at least 3 characters.' };

    // Try FastAPI Backend
    if (window.API) {
      const apiRes = await window.API.register(cleanUsername, password, fullName, careerTrack);
      if (apiRes.ok) {
        const newUser = {
          username: cleanUsername,
          password: password,
          fullName: fullName.trim() || cleanUsername,
          careerTrack: careerTrack,
          lifeGoal: 'Master full-stack architecture and build a peaceful life.',
          themeMode: 'dark',
          createdAt: new Date().toISOString(),
          userData: null
        };
        this.users[cleanUsername] = newUser;
        this.saveAllUsers();
        localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
        return { success: true, user: newUser };
      }
    }

    // Local Fallback if backend offline or user exists
    const newUser = {
      username: cleanUsername,
      password: password,
      fullName: fullName.trim() || cleanUsername,
      careerTrack: careerTrack,
      lifeGoal: 'Master full-stack architecture and build a peaceful life.',
      themeMode: 'dark',
      createdAt: new Date().toISOString(),
      userData: null
    };

    this.users[cleanUsername] = newUser;
    this.saveAllUsers();
    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
    return { success: true, user: newUser };
  }

  // Login with backend + local fallback
  async login(username, password) {
    const cleanUsername = username.trim().toLowerCase();

    // Try FastAPI Backend
    if (window.API) {
      const apiRes = await window.API.login(cleanUsername, password);
      if (apiRes.ok) {
        localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
        if (!this.users[cleanUsername]) {
          this.users[cleanUsername] = {
            username: cleanUsername,
            password: password,
            fullName: apiRes.data?.user?.full_name || cleanUsername,
            careerTrack: apiRes.data?.user?.career_track || 'Software Engineer & Builder',
            lifeGoal: 'Master full-stack architecture and build a peaceful life.',
            themeMode: 'dark'
          };
          this.saveAllUsers();
        }
        return { success: true, user: this.users[cleanUsername] };
      }
    }

    // Local Fallback
    let user = this.users[cleanUsername];
    if (!user) {
      // Auto-create local account for fast hackathon judging demo
      user = {
        username: cleanUsername,
        password: password,
        fullName: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        careerTrack: 'Software Engineer & Builder',
        lifeGoal: 'Master full-stack architecture and build a peaceful life.',
        themeMode: 'dark'
      };
      this.users[cleanUsername] = user;
      this.saveAllUsers();
    }

    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
    return { success: true, user };
  }

  logout() {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    if (window.API) window.API.clearToken();
  }

  saveCurrentUserData(updatedData) {
    const username = this.getActiveUsername();
    if (username && this.users[username]) {
      this.users[username].userData = updatedData;
      this.saveAllUsers();
    }
  }
}

window.Auth = new AuthManager();
