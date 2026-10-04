/**
 * Store Locator Component for Padu Padan AI (Haven Minimalist Edition)
 * Integrates HTML5 Geolocation with interactive Google Maps Embed
 * to locate fashion stores, boutiques, thrift shops, and tailors.
 */
const StoreLocator = {
  userCoords: {
    lat: -6.2088, // Default fallback: Jakarta Pusat
    lng: 106.8456
  },
  locationName: 'Jakarta Pusat (Default)',
  currentCategory: 'all',
  activeStoreId: null,

  // Curated representative clothing stores & fashion hotspots
  stores: [
    {
      id: 'store_1',
      name: 'Uniqlo Grand Indonesia',
      category: 'mall',
      categoryLabel: 'Mall & Fast Fashion',
      address: 'Grand Indonesia Mall, East Mall Lt. 1, Jakarta Pusat',
      distText: '1.2 km',
      tags: ['Basic Timeless', 'Linen', 'Smart Casual'],
      query: 'Uniqlo Grand Indonesia',
      lat: -6.1954,
      lng: 106.8209
    },
    {
      id: 'store_2',
      name: 'Zara Senayan City',
      category: 'mall',
      categoryLabel: 'Mall & Fast Fashion',
      address: 'Senayan City Lt. Ground, Jl. Asia Afrika, Jakarta Pusat',
      distText: '2.8 km',
      tags: ['Trendsetter', 'Tailoring', 'Blazer & Outerwear'],
      query: 'Zara Senayan City',
      lat: -6.2272,
      lng: 106.7974
    },
    {
      id: 'store_3',
      name: 'Pasar Senen Blok III (Pusat Thrifting)',
      category: 'thrift',
      categoryLabel: 'Thrift & Vintage',
      address: 'Lt. 2 & 3 Blok III Pasar Senen, Jakarta Pusat',
      distText: '3.4 km',
      tags: ['Vintage Denim', 'Retro Jackets', 'Thrift Bargain'],
      query: 'Pasar Senen Blok III Thrifting',
      lat: -6.1772,
      lng: 106.8436
    },
    {
      id: 'store_4',
      name: 'Metro Atom Plaza Pasar Baru',
      category: 'thrift',
      categoryLabel: 'Thrift & Vintage',
      address: 'Lt. 4 Metro Atom Plaza, Pasar Baru, Jakarta Pusat',
      distText: '3.1 km',
      tags: ['Curated Vintage', 'Leather Goods', 'Hawaiian Shirts'],
      query: 'Metro Atom Plaza Pasar Baru Thrift',
      lat: -6.1648,
      lng: 106.8331
    },
    {
      id: 'store_5',
      name: 'Sejauh Mata Memandang Studio',
      category: 'boutique',
      categoryLabel: 'Butik Desainer Lokal',
      address: 'Jl. Bumi No. 34, Kebayoran Baru, Jakarta Selatan',
      distText: '4.5 km',
      tags: ['Sustainable', 'Wastra Nusantara', 'Modern Etnik'],
      query: 'Sejauh Mata Memandang',
      lat: -6.2415,
      lng: 106.7932
    },
    {
      id: 'store_6',
      name: 'Cottonink Flagship Store',
      category: 'boutique',
      categoryLabel: 'Butik Desainer Lokal',
      address: 'Plaza Senayan Lt. 2, Jl. Asia Afrika, Jakarta Pusat',
      distText: '2.9 km',
      tags: ['Minimalist Daily', 'Earth Tone', 'Relaxed Chic'],
      query: 'Cottonink Plaza Senayan',
      lat: -6.2253,
      lng: 106.7997
    },
    {
      id: 'store_7',
      name: 'Wong Hang Distinguished Tailor',
      category: 'tailor',
      categoryLabel: 'Tailor & Jahit',
      address: 'Jl. Sultan Iskandar Muda No. 99F, Jakarta Selatan',
      distText: '5.2 km',
      tags: ['Bespoke Suit', 'Fitting Proporsional', 'Alteration'],
      query: 'Wong Hang Tailor Jakarta',
      lat: -6.2625,
      lng: 106.7827
    },
    {
      id: 'store_8',
      name: 'Laxmi Tailors & Alterations',
      category: 'tailor',
      categoryLabel: 'Tailor & Jahit',
      address: 'Jl. KH Wahid Hasyim No. 10B, Menteng, Jakarta Pusat',
      distText: '1.6 km',
      tags: ['Fine Suiting', 'Potong Celana', 'Blazer Custom'],
      query: 'Laxmi Tailors Wahid Hasyim',
      lat: -6.1867,
      lng: 106.8286
    }
  ],

  /**
   * Initialize Store Locator
   */
  init() {
    this.setupEventListeners();
    this.renderStoreCards();
    this.detectLocation(false); // Initial passive check
  },

  /**
   * Setup UI Event Listeners
   */
  setupEventListeners() {
    // Detect GPS button
    const btnDetect = document.getElementById('btnDetectLocation');
    if (btnDetect) {
      btnDetect.addEventListener('click', () => this.detectLocation(true));
    }

    // Category filter pills
    const filterPills = document.querySelectorAll('.stores-filter-chips .store-filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-store-category') || 'all';
        this.setCategory(cat);
      });
    });

    // Custom search input
    const inputSearch = document.getElementById('inputStoreSearch');
    const btnSearch = document.getElementById('btnSearchStore');
    if (inputSearch) {
      inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleCustomSearch(inputSearch.value.trim());
        }
      });
    }
    if (btnSearch && inputSearch) {
      btnSearch.addEventListener('click', () => {
        this.handleCustomSearch(inputSearch.value.trim());
      });
    }
  },

  /**
   * Detect User Geolocation
   */
  detectLocation(isUserInitiated = false) {
    const locStatus = document.getElementById('locCurrentStatus');
    const btnDetect = document.getElementById('btnDetectLocation');

    if (!navigator.geolocation) {
      if (locStatus) locStatus.textContent = '📍 Geolocation tidak didukung browser (Menggunakan Jakarta)';
      this.updateMap();
      return;
    }

    if (locStatus) {
      locStatus.innerHTML = '<span class="loc-spinner"></span> Mendeteksi koordinat GPS...';
    }
    if (btnDetect) btnDetect.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userCoords.lat = position.coords.latitude;
        this.userCoords.lng = position.coords.longitude;
        this.locationName = `${this.userCoords.lat.toFixed(4)}, ${this.userCoords.lng.toFixed(4)}`;

        if (locStatus) {
          locStatus.innerHTML = `📍 <strong>Lokasi Anda Terdeteksi</strong> (${this.locationName})`;
        }
        if (btnDetect) btnDetect.disabled = false;

        this.updateMap();
        if (isUserInitiated && typeof App !== 'undefined' && App.showToast) {
          App.showToast('Lokasi GPS Anda berhasil ditemukan! 📍');
        }
      },
      (error) => {
        if (btnDetect) btnDetect.disabled = false;
        console.warn('Geolocation error:', error.message);

        if (locStatus) {
          locStatus.innerHTML = '📍 Lokasi GPS nonaktif / default: <strong>Jakarta Pusat</strong>';
        }
        this.updateMap();

        if (isUserInitiated && typeof App !== 'undefined' && App.showToast) {
          App.showToast('Izin lokasi tidak diberikan. Menggunakan pusat kota default.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  },

  /**
   * Set Store Category Filter
   */
  setCategory(category) {
    this.currentCategory = category;
    this.activeStoreId = null;
    this.renderStoreCards();
    this.updateMap();
  },

  /**
   * Handle Custom Search Text
   */
  handleCustomSearch(text) {
    if (!text) {
      this.updateMap();
      return;
    }
    const query = `${text} toko pakaian clothing store`;
    this.updateMapWithQuery(query, `Hasil pencarian: "${text}"`);
  },

  /**
   * Get search query based on current category
   */
  getCategoryQuery() {
    switch (this.currentCategory) {
      case 'mall':
        return 'clothing store fashion brand mall zara uniqlo';
      case 'thrift':
        return 'thrift store vintage clothing second hand pasar pakaian';
      case 'boutique':
        return 'butik pakaian fashion designer lokal';
      case 'tailor':
        return 'tailor jas penjahit pakaian permak celana';
      case 'all':
      default:
        return 'toko pakaian clothing store fashion boutique';
    }
  },

  /**
   * Update Google Maps Embed Iframe
   */
  updateMap() {
    const query = this.getCategoryQuery();
    this.updateMapWithQuery(query);
  },

  /**
   * Set specific query to map iframe
   */
  updateMapWithQuery(query, customTitle = null) {
    const iframe = document.getElementById('googleMapsIframe');
    const directLink = document.getElementById('btnOpenDirectGoogleMaps');
    const mapCaption = document.getElementById('mapCurrentQueryCaption');

    const lat = this.userCoords.lat;
    const lng = this.userCoords.lng;

    // Google Maps Embed URL format
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&ll=${lat},${lng}&z=13&output=embed`;
    const fullSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},13z`;

    if (iframe) {
      iframe.src = embedUrl;
    }
    if (directLink) {
      directLink.href = fullSearchUrl;
    }
    if (mapCaption) {
      mapCaption.textContent = customTitle || `Menampilkan toko di sekitar (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    }
  },

  /**
   * Center map on specific selected store
   */
  selectStore(store) {
    this.activeStoreId = store.id;
    this.renderStoreCards();

    const query = store.query || store.name;
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&ll=${store.lat},${store.lng}&z=16&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

    const iframe = document.getElementById('googleMapsIframe');
    const directLink = document.getElementById('btnOpenDirectGoogleMaps');
    const mapCaption = document.getElementById('mapCurrentQueryCaption');

    if (iframe) iframe.src = embedUrl;
    if (directLink) directLink.href = directionsUrl;
    if (mapCaption) mapCaption.innerHTML = `📍 Terfokus pada <strong>${store.name}</strong>`;

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Peta difokuskan ke: ${store.name}`);
    }
  },

  /**
   * Render filtered store cards
   */
  renderStoreCards() {
    const container = document.getElementById('storesCardContainer');
    if (!container) return;

    const filtered = this.currentCategory === 'all'
      ? this.stores
      : this.stores.filter(s => s.category === this.currentCategory);

    container.innerHTML = '';

    const isEn = window.I18n && I18n.currentLanguage === 'en';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="store-empty-card">
          <p>${isEn ? 'No stores match this category.' : 'Tidak ada toko yang cocok dengan kategori ini.'}</p>
        </div>
      `;
      return;
    }

    filtered.forEach(store => {
      const card = document.createElement('div');
      const isSelected = this.activeStoreId === store.id;
      card.className = `store-card-item ${isSelected ? 'active' : ''}`;

      const tagsHtml = store.tags.map(t => `<span class="store-mini-tag">${t}</span>`).join('');
      const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

      card.innerHTML = `
        <div class="store-card-top">
          <span class="store-cat-badge">${store.categoryLabel}</span>
          <span class="store-dist-badge">📍 ~${store.distText}</span>
        </div>
        <h4 class="store-name">${store.name}</h4>
        <p class="store-address">${store.address}</p>
        <div class="store-tags-row">${tagsHtml}</div>
        <div class="store-card-actions">
          <button type="button" class="btn-focus-map" data-store-id="${store.id}">
            ${isEn ? '🗺️ View on Map' : '🗺️ Lihat di Peta'}
          </button>
          <a href="${routeUrl}" target="_blank" rel="noopener noreferrer" class="btn-store-route">
            ${isEn ? 'Directions ↗' : 'Petunjuk Rute ↗'}
          </a>
        </div>
      `;

      // Click card to focus
      card.querySelector('.btn-focus-map').addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectStore(store);
      });

      card.addEventListener('click', () => {
        this.selectStore(store);
      });

      container.appendChild(card);
    });
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => StoreLocator.init());
} else {
  StoreLocator.init();
}
