/**
 * DAILYLIFE (Project Mirror) — Authentication & Multi-User State Manager
 * Handles user registration, login, password checks, and isolated per-user state persistence.
 */

const USERS_STORAGE_KEY = 'dailylife_users_v2';
const ACTIVE_SESSION_KEY = 'dailylife_active_user';

class AuthManager {
  constructor() {
    this.users = this.loadAllUsers();
    this.seedDefaultUsersIfEmpty();
  }

  // Load registered users dictionary from localStorage
  loadAllUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Could not parse users database:', e);
      return {};
    }
  }

  // Save registered users dictionary to localStorage
  saveAllUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  // Seed default account for Arpita so the app can be demoed immediately
  seedDefaultUsersIfEmpty() {
    if (!this.users['arpita']) {
      this.users['arpita'] = {
        username: 'arpita',
        password: '123', // Simple demo password
        fullName: 'Arpita',
        careerTrack: 'Software Engineer & Builder',
        lifeGoal: 'Master full-stack engineering, build impactful real-world tools, and bring security and joy to my family.',
        themeMode: 'dark', // Default to Obsidian Cyber-HUD
        createdAt: new Date().toISOString(),
        userData: null // Will be initialized by StateManager if null
      };
      this.saveAllUsers();
    }
  }

  // Get current logged-in username
  getActiveUsername() {
    try {
      return localStorage.getItem(ACTIVE_SESSION_KEY);
    } catch (e) {
      return null;
    }
  }

  // Check if someone is currently logged in
  isAuthenticated() {
    const user = this.getActiveUsername();
    return !!(user && this.users[user]);
  }

  // Get full record of currently active user
  getCurrentUser() {
    const username = this.getActiveUsername();
    if (!username) return null;
    return this.users[username] || null;
  }

  // Register a new user
  register(username, password, fullName, careerTrack = 'Software Engineer & Builder') {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return { success: false, message: 'Username cannot be blank.' };
    if (this.users[cleanUsername]) return { success: false, message: 'Username already exists. Please log in.' };
    if (password.length < 3) return { success: false, message: 'Password must be at least 3 characters.' };

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
    return { success: true, user: newUser };
  }

  // Log in an existing user
  login(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const user = this.users[cleanUsername];

    if (!user) {
      return { success: false, message: 'User not found. Please register first.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername);
    return { success: true, user };
  }

  // Log out current user
  logout() {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }

  // Save updated user data (quests, XP, career, attributes, history) into their specific user record
  saveCurrentUserData(updatedData) {
    const username = this.getActiveUsername();
    if (username && this.users[username]) {
      this.users[username].userData = updatedData;
      if (updatedData.themeMode) {
        this.users[username].themeMode = updatedData.themeMode;
      }
      if (updatedData.careerTrack) {
        this.users[username].careerTrack = updatedData.careerTrack;
      }
      if (updatedData.lifeGoal) {
        this.users[username].lifeGoal = updatedData.lifeGoal;
      }
      this.saveAllUsers();
    }
  }
}

window.Auth = new AuthManager();
