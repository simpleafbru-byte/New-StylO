/**
 * Weather Service & Outfit Suggestion Engine for Padu Padan AI
 * Automatically detects the user's real location (GPS with instant IP fallback)
 * and integrates live Open-Meteo forecast with tailored fashion styling advice.
 */
const WeatherService = {
  currentCity: 'Mendeteksi Lokasi...',
  currentProvince: '',
  currentCoords: null,
  currentData: null,
  isExpanded: true,

  async init() {
    this.setupEventListeners();
    await this.detectUserLocation(true);
  },

  setupEventListeners() {
    // Refresh / Detect GPS button
    const btnGps = document.getElementById('btnWeatherDetectGps');
    if (btnGps) {
      btnGps.addEventListener('click', async () => {
        await this.detectUserLocation(false);
      });
    }

    // Navbar weather badge click
    const navBadge = document.getElementById('navWeatherBadge');
    if (navBadge) {
      navBadge.addEventListener('click', (e) => {
        e.preventDefault();
        const weatherCard = document.getElementById('weatherForecastCard');
        if (weatherCard) {
          weatherCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          weatherCard.classList.add('highlight-glow');
          setTimeout(() => weatherCard.classList.remove('highlight-glow'), 1800);
        }
      });
    }

    // 1-Click Racik Outfit by Weather
    const btnRacik = document.getElementById('btnRacikByWeather');
    if (btnRacik) {
      btnRacik.addEventListener('click', async () => {
        await this.generateWeatherOutfitDirectly();
      });
    }

    // Sync button inside Form Cepat
    const btnSyncForm = document.getElementById('btnSyncWeatherToForm');
    if (btnSyncForm) {
      btnSyncForm.addEventListener('click', () => {
        this.applyWeatherToStudio();
      });
    }

    // Apply to studio button
    const btnApply = document.getElementById('btnApplyWeatherToStudio');
    if (btnApply) {
      btnApply.addEventListener('click', () => {
        this.applyWeatherToStudio();
      });
    }

    // Ask in chat button
    const btnChat = document.getElementById('btnAskWeatherInChat');
    if (btnChat) {
      btnChat.addEventListener('click', () => {
        this.askWeatherInChat();
      });
    }

    // Toggle collapse/expand button
    const btnToggle = document.getElementById('btnToggleWeatherExpand');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        const details = document.getElementById('weatherExpandableDetails');
        if (details) {
          details.style.display = this.isExpanded ? 'block' : 'none';
        }
        btnToggle.classList.toggle('active', this.isExpanded);
        btnToggle.setAttribute('aria-expanded', this.isExpanded);
      });
    }
  },

  /**
   * Automatically detect user location (GPS -> IP Geolocation Fallback)
   */
  async detectUserLocation(isAuto = false) {
    const elCity = document.getElementById('dispWeatherCity');
    const btnGps = document.getElementById('btnWeatherDetectGps');
    const btnGpsLabel = document.getElementById('btnGpsLabel');

    if (elCity) elCity.textContent = 'Mendeteksi Lokasi...';
    if (btnGps) btnGps.classList.add('loading');
    if (btnGpsLabel) btnGpsLabel.textContent = 'Mencari...';

    const getBrowserGPS = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('No geolocation API'));
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          err => reject(err),
          { timeout: 7000, enableHighAccuracy: true }
        );
      });
    };

    let detected = null;

    // Attempt 1: Browser GPS
    try {
      const coords = await getBrowserGPS();
      const reverseName = await this.reverseGeocode(coords.lat, coords.lon);
      detected = {
        lat: coords.lat,
        lon: coords.lon,
        name: reverseName.city || reverseName.locality || 'Lokasi Anda',
        province: reverseName.province || ''
      };
    } catch (gpsErr) {
      console.log('GPS not granted or unavailable, resolving via IP location:', gpsErr.message);

      // Attempt 2: IP-based location (instant, no user prompt required)
      try {
        const ipRes = await fetch('https://ipwho.is/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && ipData.success) {
            detected = {
              lat: ipData.latitude,
              lon: ipData.longitude,
              name: ipData.city || ipData.region || 'Lokasi Anda',
              province: ipData.region || ''
            };
          }
        }
      } catch (ipErr) {
        console.warn('IP geolocation failed:', ipErr);
      }
    }

    // Default fallback if totally offline
    if (!detected) {
      detected = {
        lat: -6.2088,
        lon: 106.8456,
        name: 'Lokasi Anda',
        province: 'Indonesia'
      };
    }

    this.currentCity = detected.name;
    this.currentProvince = detected.province;
    this.currentCoords = { lat: detected.lat, lon: detected.lon };

    if (elCity) elCity.textContent = detected.name;
    if (btnGps) btnGps.classList.remove('loading');
    if (btnGpsLabel) btnGpsLabel.textContent = 'Perbarui Lokasi';

    await this.fetchWeatherForCoordinates(detected.lat, detected.lon, detected.name, detected.province);

    if (!isAuto && window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(`Lokasi diperbarui: ${detected.name} 📍`);
    }
  },

  async reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.city || data.locality || data.principalSubdivision || 'Lokasi Anda',
          locality: data.locality || '',
          province: data.principalSubdivision || ''
        };
      }
    } catch (e) {
      // fallback
    }
    return { city: 'Lokasi Anda', locality: '', province: '' };
  },

  async fetchWeatherForCoordinates(lat, lon, cityName, provinceName = '') {
    this.showLoading(true);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this.currentData = this.formatWeatherData({ name: cityName, province: provinceName }, data);
      this.renderWeatherUI(this.currentData);
      this.updateNavbarWeather(this.currentData);
    } catch (err) {
      console.warn('Weather fetch failed, using fallback forecast:', err.message);
      this.currentData = this.getFallbackWeather({ name: cityName, province: provinceName });
      this.renderWeatherUI(this.currentData);
      this.updateNavbarWeather(this.currentData);
    } finally {
      this.showLoading(false);
    }
  },

  formatWeatherData(city, rawData) {
    const cur = rawData.current;
    const temp = Math.round(cur.temperature_2m);
    const feelsLike = Math.round(cur.apparent_temperature);
    const humidity = cur.relative_humidity_2m;
    const wind = Math.round(cur.wind_speed_10m);
    const code = cur.weather_code;

    const condition = this.interpretWeatherCode(code, temp);
    const timeline = this.extractPeriodForecast(rawData.hourly, temp, condition);
    const suggestion = this.generateDressingSuggestion(temp, code, condition.name, city.name);

    return {
      cityName: city.name,
      province: city.province,
      temp,
      feelsLike,
      humidity,
      wind,
      code,
      condition,
      timeline,
      suggestion,
      updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  },

  getFallbackWeather(city) {
    const temp = 31;
    const condition = {
      name: 'Cerah Berawan',
      icon: '🌤️',
      desc: 'Langit cerah dengan awan tipis berarak dan suhu tropis hangat.'
    };
    const timeline = [
      { period: 'Pagi', time: '07:00', temp: 26, icon: '⛅' },
      { period: 'Siang', time: '12:00', temp: 33, icon: '☀️' },
      { period: 'Sore', time: '16:30', temp: 29, icon: '🌤️' },
      { period: 'Malam', time: '20:00', temp: 25, icon: '🌙' }
    ];
    const suggestion = this.generateDressingSuggestion(temp, 2, condition.name, city.name);

    return {
      cityName: city.name,
      province: city.province,
      temp: 31,
      feelsLike: 35,
      humidity: 68,
      wind: 9,
      code: 2,
      condition,
      timeline,
      suggestion,
      updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  },

  interpretWeatherCode(code, temp) {
    if (code === 0) {
      return {
        name: temp >= 32 ? 'Panas Terik' : 'Cerah Benderang',
        icon: '☀️',
        desc: 'Paparan sinar matahari langsung yang terik dan langit bersih.'
      };
    } else if (code === 1 || code === 2) {
      return {
        name: 'Cerah Berawan',
        icon: '🌤️',
        desc: 'Sinar matahari hangat dengan gumpalan awan tipis yang nyaman.'
      };
    } else if (code === 3) {
      return {
        name: 'Berawan Sejuk',
        icon: '⛅',
        desc: 'Awan mendominasi langit sehingga udara terasa lebih teduh.'
      };
    } else if (code === 45 || code === 48) {
      return {
        name: 'Berkabut Sejuk',
        icon: '🌫️',
        desc: 'Udara lembab berkabut dengan jarak pandang sejuk.'
      };
    } else if (code >= 51 && code <= 55) {
      return {
        name: 'Gerimis Ringan',
        icon: '🌦️',
        desc: 'Hujan rintik-rintik ringan yang menyegarkan udara.'
      };
    } else if (code >= 61 && code <= 65) {
      return {
        name: 'Hujan Tropis',
        icon: '🌧️',
        desc: 'Curah hujan intensitas sedang membasahi area sekitar.'
      };
    } else if (code >= 80 && code <= 82) {
      return {
        name: 'Hujan Lebat / Basah',
        icon: '🌧️',
        desc: 'Hujan deras mendadak dengan jalanan basah.'
      };
    } else if (code >= 95) {
      return {
        name: 'Badai Petir',
        icon: '⛈️',
        desc: 'Aktivitas petir dan hembusan angin kencang berawan gelap.'
      };
    }
    return {
      name: 'Normal Sejuk',
      icon: '🌤️',
      desc: 'Kondisi cuaca harian seimbang khas kepulauan tropis.'
    };
  },

  extractPeriodForecast(hourly, currentTemp, condition) {
    if (!hourly || !hourly.temperature_2m || hourly.temperature_2m.length < 24) {
      return [
        { period: 'Pagi', time: '07:00', temp: Math.round(currentTemp - 4), icon: '⛅' },
        { period: 'Siang', time: '12:00', temp: Math.round(currentTemp + 2), icon: '☀️' },
        { period: 'Sore', time: '16:30', temp: Math.round(currentTemp - 1), icon: '🌤️' },
        { period: 'Malam', time: '20:00', temp: Math.round(currentTemp - 5), icon: '🌙' }
      ];
    }

    // Extract hours: 7 (pagi), 12 (siang), 16 (sore), 20 (malam)
    const getHourVal = (hrIdx) => {
      const t = Math.round(hourly.temperature_2m[hrIdx] || currentTemp);
      const c = hourly.weather_code ? hourly.weather_code[hrIdx] : 1;
      let icon = '🌤️';
      if (c === 0) icon = hrIdx >= 19 ? '🌙' : '☀️';
      else if (c >= 61 && c <= 82) icon = '🌧️';
      else if (c >= 95) icon = '⛈️';
      else if (c === 3) icon = '⛅';
      return { temp: t, icon };
    };

    const morning = getHourVal(7);
    const afternoon = getHourVal(12);
    const evening = getHourVal(16);
    const night = getHourVal(20);

    return [
      { period: 'Pagi', time: '07:00', temp: morning.temp, icon: morning.icon },
      { period: 'Siang', time: '12:00', temp: afternoon.temp, icon: afternoon.icon },
      { period: 'Sore', time: '16:30', temp: evening.temp, icon: evening.icon },
      { period: 'Malam', time: '20:00', temp: night.temp, icon: night.icon }
    ];
  },

  generateDressingSuggestion(temp, code, conditionName, cityName) {
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 99);

    if (isRain) {
      return {
        title: 'Proteksi Hujan Stylish & Tahan Air',
        advice: `Cuaca di ${cityName} diprediksi basah (${temp}°C). Kenakan outerwear berbahan water-repellent (jaket utility atau unlined trench), celana berwarna gelap agar aman dari cipratan air, serta alas kaki berbahan kulit atau sneakers bersol karet anti-selip.`,
        garments: ['🧥 Jaket Water-Repellent', '👖 Celana Gelap (Dark Indigo/Charcoal)', '👢 Boots Kulit / Sneakers Karet', '☂️ Payung Lipat Saku'],
        matchingFormCuaca: 'Hujan Sejuk / Berangin',
        chatPrompt: `Hari ini di ${cityName} sedang hujan (${temp}°C, ${conditionName}). Berikan rekomendasi outfit tahan air dan stylish yang tidak mudah kotor terkena cipratan air namun tetap terlihat rapi!`
      };
    }

    if (temp >= 31) {
      return {
        title: 'Gaya Bernapas & Proteksi Terik Matahari',
        advice: `Suhu siang hari di ${cityName} mencapai ${temp}°C dengan terik matahari. Prioritaskan bahan bersirkulasi udara tinggi seperti katun supima, linen, atau rayon. Pilih warna cerah atau earth tone lembut (broken white, beige, soft sage) untuk memantulkan panas.`,
        garments: ['🌿 Kemeja Linen / Katun Bernapas', '🕶️ Kacamata Hitam UV400', '👖 Celana Straight Breathable', '👟 Sneakers Ringan Berpori'],
        matchingFormCuaca: 'Panas Terik Tropis (30°C+)',
        chatPrompt: `Suhu di ${cityName} hari ini cukup panas (${temp}°C, ${conditionName}). Rekomendasikan padu padan outfit kasual yang sangat sejuk, tidak mudah gerah, dan tetap modis untuk dipakai seharian!`
      };
    }

    if (temp <= 24) {
      return {
        title: 'Layering Sejuk & Tailoring Terstruktur',
        advice: `Udara di ${cityName} terasa sejuk (${temp}°C). Sangat ideal untuk eksplorasi layering cerdas: kenakan cardigan rajut bertekstur, unlined linen blazer, atau overshirt katun twill di atas kaos basic, dipadukan dengan celana ankle pleated.`,
        garments: ['🧥 Unlined Blazer / Cardigan Rajut', '🧶 Knitwear Halus', '👖 Pleated Trousers', '👞 Leather Loafers / Mules'],
        matchingFormCuaca: 'Ruangan Ber-AC Dingin (Indoor)',
        chatPrompt: `Cuaca di ${cityName} cukup sejuk (${temp}°C, ${conditionName}). Bagaimana panduan layering outerwear yang elegan dan proporsional untuk cuaca sejuk seperti ini?`
      };
    }

    // Default 25-30°C
    return {
      title: 'Smart Casual Fleksibel & Effortless',
      advice: `Cuaca di ${cityName} relatif bersahabat (${temp}°C, ${conditionName}). Anda bisa memadukan kaos crewneck basic dengan kemeja overshirt terbuka yang fleksibel dilepas saat berpindah ke ruangan hangat. Celana bahan rileks melengkapi siluet seimbang.`,
      garments: ['👔 Overshirt Santai / Kemeja Katun', '👕 Kaos Basic Broken White', '👖 Relaxed Denim / Chino', '👟 Clean White Leather Sneakers'],
      matchingFormCuaca: 'Sore Teduh & Berangin',
      chatPrompt: `Cuaca di ${cityName} hari ini bersahabat (${temp}°C, ${conditionName}). Apa saran outfit smart casual terbaik untuk mobilitas dari siang hingga malam?`
    };
  },

  renderWeatherUI(data) {
    if (!data) return;

    // City name & time
    const isEn = window.I18n && I18n.currentLanguage === 'en';
    const elCity = document.getElementById('dispWeatherCity');
    if (elCity) elCity.textContent = data.cityName;

    const elUpdated = document.getElementById('dispWeatherUpdated');
    if (elUpdated) elUpdated.textContent = isEn ? `Updated ${data.updatedAt}` : `Diperbarui ${data.updatedAt}`;

    // Temperature & Condition
    const elTemp = document.getElementById('dispWeatherTemp');
    if (elTemp) elTemp.innerHTML = `${data.temp}<span class="temp-degree">°C</span>`;

    const elIcon = document.getElementById('dispWeatherIcon');
    if (elIcon) elIcon.textContent = data.condition.icon;

    const elCondName = document.getElementById('dispWeatherCondition');
    if (elCondName) elCondName.textContent = data.condition.name;

    const elDesc = document.getElementById('dispWeatherDesc');
    if (elDesc) elDesc.textContent = data.condition.desc;

    // Stats
    const elFeels = document.getElementById('dispWeatherFeelsLike');
    if (elFeels) elFeels.textContent = `${data.feelsLike}°C`;

    const elHumid = document.getElementById('dispWeatherHumidity');
    if (elHumid) elHumid.textContent = `${data.humidity}%`;

    const elWind = document.getElementById('dispWeatherWind');
    if (elWind) elWind.textContent = isEn ? `${data.wind} km/h` : `${data.wind} km/j`;

    // Timeline pills
    const timelineContainer = document.getElementById('weatherTimelinePills');
    if (timelineContainer && data.timeline) {
      timelineContainer.innerHTML = '';
      const periodMap = {
        'Pagi': isEn ? 'Morning' : 'Pagi',
        'Siang': isEn ? 'Afternoon' : 'Siang',
        'Sore': isEn ? 'Evening' : 'Sore',
        'Malam': isEn ? 'Night' : 'Malam'
      };

      data.timeline.forEach(item => {
        const div = document.createElement('div');
        div.className = 'weather-period-pill';
        div.innerHTML = `
          <span class="period-name">${periodMap[item.period] || item.period}</span>
          <span class="period-icon">${item.icon}</span>
          <span class="period-temp">${item.temp}°</span>
        `;
        timelineContainer.appendChild(div);
      });
    }

    // Outfit Dressing Suggestion
    const elSuggTitle = document.getElementById('dispDressingTitle');
    if (elSuggTitle) elSuggTitle.textContent = data.suggestion.title;

    const elSuggAdvice = document.getElementById('dispDressingAdvice');
    if (elSuggAdvice) elSuggAdvice.textContent = data.suggestion.advice;

    const tagsContainer = document.getElementById('dispDressingTags');
    if (tagsContainer && data.suggestion.garments) {
      tagsContainer.innerHTML = '';
      data.suggestion.garments.forEach(g => {
        const span = document.createElement('span');
        span.className = 'weather-garment-tag';
        span.textContent = g;
        tagsContainer.appendChild(span);
      });
    }

    // Form live sync pill
    const elFormIcon = document.getElementById('formWeatherLiveIcon');
    if (elFormIcon) elFormIcon.textContent = data.condition.icon;

    const elFormText = document.getElementById('formWeatherLiveText');
    if (elFormText) elFormText.textContent = `Live: ${data.temp}°C`;
  },

  updateNavbarWeather(data) {
    const navBadge = document.getElementById('navWeatherBadge');
    if (!navBadge) return;

    navBadge.innerHTML = `
      <span class="nav-weather-icon">${data.condition.icon}</span>
      <span class="nav-weather-text"><strong>${data.temp}°C</strong> ${data.cityName}</span>
    `;
    navBadge.title = `Cuaca ${data.cityName}: ${data.condition.name}, ${data.temp}°C (Klik untuk rincian)`;
  },

  applyWeatherToStudio() {
    if (!this.currentData || !this.currentData.suggestion) return;

    const matchingCuaca = this.currentData.suggestion.matchingFormCuaca;
    
    // 1. Set form dropdowns
    const selectCuaca = document.getElementById('selectCuaca');
    if (selectCuaca) {
      // Find matching option
      for (let opt of selectCuaca.options) {
        if (opt.value.includes(matchingCuaca) || matchingCuaca.includes(opt.value)) {
          selectCuaca.value = opt.value;
          selectCuaca.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }

    const selectPhotoCuaca = document.getElementById('selectPhotoCuaca');
    if (selectPhotoCuaca) {
      for (let opt of selectPhotoCuaca.options) {
        if (opt.value.includes(matchingCuaca) || matchingCuaca.includes(opt.value)) {
          selectPhotoCuaca.value = opt.value;
          selectPhotoCuaca.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }

    // 2. Switch to studio tab
    if (window.App && typeof window.App.switchWorkspaceTab === 'function') {
      window.App.switchWorkspaceTab('studio');
    }

    // 3. Scroll to form & highlight
    const formEl = document.getElementById('outfitForm');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const cuacaField = selectCuaca?.closest('.form-field');
      if (cuacaField) {
        cuacaField.classList.add('highlight-glow');
        setTimeout(() => cuacaField.classList.remove('highlight-glow'), 1800);
      }
    }

    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(`Cuaca "${matchingCuaca}" diterapkan ke Studio Stylist! ✨`);
    }
  },

  async generateWeatherOutfitDirectly() {
    if (!this.currentData || !this.currentData.suggestion) return;

    // 1. Switch to studio tab
    if (window.App && typeof window.App.switchWorkspaceTab === 'function') {
      window.App.switchWorkspaceTab('studio');
    }

    // 2. Set form values
    const inputAcara = document.getElementById('inputAcara');
    if (inputAcara) {
      inputAcara.value = `Aktivitas Harian di ${this.currentCity} (${this.currentData.condition.name} ${this.currentData.temp}°C)`;
    }

    this.applyWeatherToStudio();

    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(`Meracik outfit khusus cuaca ${this.currentData.temp}°C di ${this.currentCity}... ⚡`);
    }

    // 3. Scroll to form and trigger submission
    const formEl = document.getElementById('outfitForm');
    if (formEl && window.App && typeof window.App.handleFormSubmit === 'function') {
      await window.App.handleFormSubmit();
    }
  },

  askWeatherInChat() {
    if (!this.currentData || !this.currentData.suggestion) return;
    const prompt = this.currentData.suggestion.chatPrompt;

    if (window.App && typeof window.App.askStylistBodyTips === 'function') {
      window.App.askStylistBodyTips(prompt);
    }
  },

  showLoading(isLoading) {
    const card = document.getElementById('weatherForecastCard');
    if (card) {
      card.classList.toggle('weather-loading', isLoading);
    }
  }
};
