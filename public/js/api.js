/**
 * API Service Layer for Padu Padan AI
 * Handles all REST API communications with the Node.js backend.
 */
const API = {
  baseUrl: '',

  /**
   * Helper to get client-side override API key from localStorage if set
   */
  getClientApiKey() {
    return localStorage.getItem('padupadan_api_key') || '';
  },

  /**
   * Helper headers generator
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'x-lang': typeof I18n !== 'undefined' ? I18n.getLanguage() : (localStorage.getItem('stylO_language') || 'id')
    };
    const clientKey = this.getClientApiKey();
    if (clientKey) {
      headers['x-gemini-key'] = clientKey;
    }
    return headers;
  },

  /**
   * Check backend health and AI engine mode
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('API health check error:', err);
      return { status: 'offline', mode: 'offline', error: err.message };
    }
  },

  /**
   * Get user profile
   */
  async getProfile(userId = 'usr_default') {
    try {
      const res = await fetch(`${this.baseUrl}/api/profile/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('getProfile error:', err);
      return null;
    }
  },

  /**
   * Save user profile
   */
  async saveProfile(profileData) {
    try {
      const res = await fetch(`${this.baseUrl}/api/profile`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      });
      return await res.json();
    } catch (err) {
      console.error('saveProfile error:', err);
      throw err;
    }
  },

  /**
   * Get wardrobe items for user
   */
  async getWardrobe(userId = 'usr_default') {
    try {
      const res = await fetch(`${this.baseUrl}/api/wardrobe/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('getWardrobe error:', err);
      return [];
    }
  },

  /**
   * Add a new wardrobe item
   */
  async addWardrobeItem(itemData) {
    try {
      const res = await fetch(`${this.baseUrl}/api/wardrobe`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(itemData)
      });
      return await res.json();
    } catch (err) {
      console.error('addWardrobeItem error:', err);
      throw err;
    }
  },

  /**
   * Delete wardrobe item
   */
  async deleteWardrobeItem(itemId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/wardrobe/${itemId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('deleteWardrobeItem error:', err);
      throw err;
    }
  },

  /**
   * Get wardrobe gap analysis (missing pieces)
   */
  async getWardrobeGapAnalysis(userId = 'usr_default', refresh = false) {
    try {
      const url = `${this.baseUrl}/api/wardrobe/gap-analysis/${userId}${refresh ? `?refresh=${Date.now()}` : ''}`;
      const res = await fetch(url, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('getWardrobeGapAnalysis error:', err);
      return null;
    }
  },

  /**
   * Request outfit recommendation via Form
   */
  async generateOutfit(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/recommendation`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('generateOutfit error:', err);
      throw err;
    }
  },

  /**
   * Request Photo Outfit Matching with Gemini Multimodal
   */
  async matchPhotoOutfit(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/match-photo`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('matchPhotoOutfit error:', err);
      throw err;
    }
  },

  /**
   * Request "See Something I Like" Inspo Outfit Recreation
   */
  async seeSomethingILike(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/see-something-i-like`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('seeSomethingILike error:', err);
      throw err;
    }
  },

  /**
   * Send multi-turn chat follow-up to refine outfit
   */
  async sendChatFollowUp(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/api/recommendation/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('sendChatFollowUp error:', err);
      throw err;
    }
  },

  /**
   * Get recommendation history for user
   */
  async getRecommendations(userId = 'usr_default') {
    try {
      const res = await fetch(`${this.baseUrl}/api/recommendations/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('getRecommendations error:', err);
      return [];
    }
  },

  /**
   * Toggle favorite recommendation
   */
  async toggleFavorite(recId, favorite) {
    try {
      const res = await fetch(`${this.baseUrl}/api/recommendations/favorite`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ id: recId, favorit: favorite })
      });
      return await res.json();
    } catch (err) {
      console.error('toggleFavorite error:', err);
      throw err;
    }
  },

  /**
   * Delete single recommendation
   */
  async deleteRecommendation(recId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/recommendations/${recId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('deleteRecommendation error:', err);
      throw err;
    }
  },

  /**
   * Delete all recommendations for a user
   */
  async deleteAllRecommendations(userId = 'usr_default') {
    try {
      const res = await fetch(`${this.baseUrl}/api/recommendations/all/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('deleteAllRecommendations error:', err);
      throw err;
    }
  }
};
