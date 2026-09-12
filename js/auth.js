/**
 * MIRROR — Authentication Manager (Dual FastAPI Backend + Local Fallback)
 */

const USERS_STORAGE_KEY = 'dailylife_users_v2';
const ACTIVE_SESSION_KEY = 'mirror_active_user_v3';

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
        currentProfession: 'Student & Academic Learner',
        dreamCareer: 'Software Engineer & Full-Stack Developer',
        careerTrack: 'Software Engineer & Builder',
        lifeGoal: 'Master full-stack engineering, ship real tools, and cultivate calm presence.',
        themeMode: 'dark',
        dob: '2004-05-14',
        photoUrl: '',
        skipRelationships: false,
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
        currentProfession: 'Software Engineer & Full-Stack Developer',
        dreamCareer: 'Software Engineer & Full-Stack Developer',
        careerTrack: 'Software Engineer & Builder',
        lifeGoal: 'Build resilient distributed backends and provide security for my family.',
        themeMode: 'dark',
        dob: '2003-11-20',
        photoUrl: '',
        skipRelationships: false,
        createdAt: new Date().toISOString(),
        userData: null
      };
    }
    this.saveAllUsers();
    // Notice: We intentionally do NOT auto-set ACTIVE_SESSION_KEY so first-time users see the setup gate!
  }

  getActiveUsername() {
    try {
      return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  isAuthenticated() {
    const active = this.getActiveUsername();
    return !!(active && this.users[active]);
  }

  getCurrentUser() {
    const username = this.getActiveUsername();
    if (!username) return null;
    return this.users[username] || null;
  }

  // Register with backend + local fallback
  async register(username, password, fullName, careerTrack = 'Software Engineer & Builder', details = {}) {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return { success: false, message: 'Username cannot be blank.' };
    if (password.length < 3) return { success: false, message: 'Password must be at least 3 characters.' };

    const newUser = {
      username: cleanUsername,
      password: password,
      fullName: fullName.trim() || cleanUsername,
      careerTrack: careerTrack,
      currentProfession: details.currentProfession || 'Student & Academic Learner',
      dreamCareer: details.dreamCareer || careerTrack,
      dob: details.dob || '',
      photoUrl: details.photoUrl || '',
      lifeGoal: details.lifeGoal || 'Master high-leverage skills and build a peaceful life.',
      skipRelationships: !!details.skipRelationships,
      relationshipBonds: details.relationshipBonds || [],
      themeMode: 'dark',
      createdAt: new Date().toISOString(),
      userData: null
    };

    // Try FastAPI Backend
    if (window.API) {
      try {
        await window.API.register(cleanUsername, password, fullName, careerTrack);
      } catch (err) {
        console.warn('Backend register sync fallback to local:', err);
      }
    }

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
      try {
        const apiRes = await window.API.login(cleanUsername, password);
        if (apiRes.ok) {
          localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
          if (!this.users[cleanUsername]) {
            this.users[cleanUsername] = {
              username: cleanUsername,
              password: password,
              fullName: apiRes.data?.user?.full_name || cleanUsername,
              careerTrack: apiRes.data?.user?.career_track || 'Software Engineer & Builder',
              currentProfession: 'Student & Academic Learner',
              dreamCareer: apiRes.data?.user?.career_track || 'Software Engineer & Builder',
              lifeGoal: 'Master full-stack architecture and build a peaceful life.',
              themeMode: 'dark'
            };
            this.saveAllUsers();
          }
          return { success: true, user: this.users[cleanUsername] };
        }
      } catch (err) {
        console.warn('Backend login fallback to local:', err);
      }
    }

    // Local Fallback
    let user = this.users[cleanUsername];
    if (!user) {
      return { success: false, message: 'Account not found. Please click Create Account.' };
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
