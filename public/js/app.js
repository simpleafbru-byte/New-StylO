/**
 * Main Application Orchestrator for Padu Padan AI (Haven Minimalist Edition)
 */
const App = {
  activeTab: 'studio',
  currentRecommendation: null,
  recommendationHistory: [],
  userProfile: null,
  chatHistory: [],
  currentPhotoBase64: null,
  currentPhotoMimeType: null,
  currentInspoBase64: null,
  currentInspoMimeType: null,
  currentInspoPreset: null,
  wasVoiceTriggered: false,
  isChatBusy: false,

  async init() {
    if (typeof I18n !== 'undefined') {
      I18n.init();
    }
    this.setupNavigation();
    this.setupCustomDropdowns();
    this.setupStudioControls();
    this.setupSeeSomethingControls();
    this.setupPhotoMatcherControls();
    VoiceStylist.init();
    this.setupProfileControls();
    this.setupHistoryControls();
    this.setupShoppingAndWardrobeGaps();

    // Check backend health & AI status
    await this.refreshAIStatus();

    // Initialize wardrobe manager
    await WardrobeManager.init();

    // Load initial profile
    await this.loadUserProfile();

    // Initialize live weather forecast & dressing suggestions
    if (typeof WeatherService !== 'undefined') {
      await WeatherService.init();
    }

    // Initialize shop / market
    if (typeof ShopMarket !== 'undefined') {
      ShopMarket.init();
    }


    // Load recommendation history
    await this.loadHistory();

    // Set initial outfit display
    if (this.recommendationHistory.length > 0) {
      this.currentRecommendation = this.recommendationHistory[0];
      OutfitRenderer.renderMainOutfit(this.currentRecommendation);
    }
  },

  /**
   * Navigation Tabs & Smooth Scrolling
   */
  setupNavigation() {
    // 1. Workspace Segmented Tabs
    const segmentButtons = document.querySelectorAll('.workspace-segmented-capsule .segment-btn');
    segmentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-workspace-tab');
        if (tab) this.switchWorkspaceTab(tab);
      });
    });

    // 2. Navbar Menu Links
    const navLinks = document.querySelectorAll('.nav-menu-links .nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const target = link.getAttribute('data-tab-target');
        if (target === 'hero') {
          // Default anchor behavior to #hero-section
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          return;
        }

        if (target === 'stores') {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          const storesEl = document.getElementById('stores-section');
          if (storesEl) {
            storesEl.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        e.preventDefault();
        this.switchWorkspaceTab(target);
        const studioEl = document.getElementById('studio-section');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // 3. Hero CTA buttons
    const btnHeroStart = document.getElementById('btnHeroGetStarted');
    if (btnHeroStart) {
      btnHeroStart.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchWorkspaceTab('studio');
        const studioEl = document.getElementById('studio-section');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const btnHeroWardrobe = document.getElementById('btnHeroExploreWardrobe');
    if (btnHeroWardrobe) {
      btnHeroWardrobe.addEventListener('click', () => {
        this.switchWorkspaceTab('wardrobe');
        const studioEl = document.getElementById('studio-section');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const btnHeroSeeSomething = document.getElementById('btnHeroSeeSomething');
    if (btnHeroSeeSomething) {
      btnHeroSeeSomething.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchWorkspaceTab('studio');
        const btnModeSeeSomething = document.getElementById('btnModeSeeSomething');
        if (btnModeSeeSomething) {
          btnModeSeeSomething.click();
        }
        const studioEl = document.getElementById('studio-section');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const btnHeroVoiceStylist = document.getElementById('btnHeroVoiceStylist');
    if (btnHeroVoiceStylist) {
      btnHeroVoiceStylist.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchWorkspaceTab('studio');
        const btnModeChat = document.getElementById('btnModeChat');
        if (btnModeChat) {
          btnModeChat.click();
        }
        const studioEl = document.getElementById('studio-section');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (window.VoiceStylist) VoiceStylist.startListening();
        }, 500);
      });
    }

    const btnNavAction = document.getElementById('btnNavAction');
    if (btnNavAction) {
      btnNavAction.addEventListener('click', () => {
        this.switchWorkspaceTab('studio');
        const studioEl = document.getElementById('studio-section');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const brandLogo = document.getElementById('navBrandLogo');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Language switcher toggle in navbar
    const navLangToggle = document.getElementById('navLangToggle');
    if (navLangToggle) {
      navLangToggle.addEventListener('click', () => {
        if (typeof I18n !== 'undefined') {
          I18n.toggleLanguage();
        }
      });
    }

    // 4. Dynamic scroll elevation for floating navbar
    const pillNavbar = document.getElementById('pillNavbar');
    if (pillNavbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
          pillNavbar.classList.add('scrolled');
        } else {
          pillNavbar.classList.remove('scrolled');
        }
      }, { passive: true });
    }

    // 5. Footer Quick Navigation Chips
    const footerChips = document.querySelectorAll('.footer-quick-nav .footer-nav-chip');
    footerChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const target = chip.getAttribute('data-tab-target');
        if (target === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (target === 'stores') {
          const storesEl = document.getElementById('stores-section');
          if (storesEl) storesEl.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        this.switchWorkspaceTab(target);
        const studioEl = document.getElementById('studio-section');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // 6. Footer Back To Top Button
    const btnBackToTop = document.getElementById('footerBackToTopBtn');
    if (btnBackToTop) {
      btnBackToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  },

  /**
   * Switch Active Workspace Tab
   */
  switchWorkspaceTab(tabName) {
    this.activeTab = tabName;

    // Update segmented buttons
    const segmentButtons = document.querySelectorAll('.workspace-segmented-capsule .segment-btn');
    segmentButtons.forEach(b => {
      if (b.getAttribute('data-workspace-tab') === tabName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update panels
    const panels = document.querySelectorAll('.workspace-panel');
    panels.forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`workspace-${tabName}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Update navbar active link
    const navLinks = document.querySelectorAll('.nav-menu-links .nav-link');
    navLinks.forEach(l => {
      if (l.getAttribute('data-tab-target') === tabName) {
        l.classList.add('active');
      } else if (tabName !== 'hero' && l.getAttribute('data-tab-target') === 'hero') {
        l.classList.remove('active');
      }
    });

    if (tabName === 'history') {
      this.renderHistoryGrid();
    } else if (tabName === 'wardrobe') {
      WardrobeManager.renderGrid();
    }
  },

  /**
   * Status checking
   */
  async refreshAIStatus() {
    const navModelText = document.getElementById('navModelText');
    const heroBadgePill = document.getElementById('heroBadgePill');

    try {
      const res = await API.checkHealth();
      const rawModel = res && res.model ? res.model.replace('models/', '') : 'Gemini 3.8 Flash';
      const modelName = rawModel.includes('gemini') 
        ? rawModel.replace(/gemini-?/i, 'Gemini ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()
        : rawModel;
      if (res && res.status === 'ok') {
        if (navModelText) navModelText.textContent = modelName;
        if (heroBadgePill) {
          heroBadgePill.innerHTML = `<span>✨ Powered by ${modelName}</span>`;
        }
      } else {
        if (navModelText) navModelText.textContent = 'Offline';
      }
    } catch (err) {
      console.warn('Could not fetch AI status:', err);
      if (navModelText) navModelText.textContent = 'Curated Mode';
    }
  },

  /**
   * Studio Stylist Control Setup (Form & Multi-turn Chat)
   */
  setupStudioControls() {
    // Mode Switcher (Form vs See Something vs Photo vs Chat)
    const btnForm = document.getElementById('btnModeForm');
    const btnSeeSomething = document.getElementById('btnModeSeeSomething');
    const btnPhoto = document.getElementById('btnModePhoto');
    const btnChat = document.getElementById('btnModeChat');
    const viewForm = document.getElementById('viewForm');
    const viewSeeSomething = document.getElementById('viewSeeSomething');
    const viewPhoto = document.getElementById('viewPhoto');
    const viewChat = document.getElementById('viewChat');

    const switchStudioMode = (mode) => {
      [btnForm, btnSeeSomething, btnPhoto, btnChat].forEach(b => b && b.classList.remove('active'));
      [viewForm, viewSeeSomething, viewPhoto, viewChat].forEach(v => v && v.classList.remove('active'));

      if (mode === 'form') {
        btnForm?.classList.add('active');
        viewForm?.classList.add('active');
      } else if (mode === 'see-something') {
        btnSeeSomething?.classList.add('active');
        viewSeeSomething?.classList.add('active');
      } else if (mode === 'photo') {
        btnPhoto?.classList.add('active');
        viewPhoto?.classList.add('active');
      } else if (mode === 'chat') {
        btnChat?.classList.add('active');
        viewChat?.classList.add('active');
      }
    };

    btnForm?.addEventListener('click', () => switchStudioMode('form'));
    btnSeeSomething?.addEventListener('click', () => switchStudioMode('see-something'));
    btnPhoto?.addEventListener('click', () => switchStudioMode('photo'));
    btnChat?.addEventListener('click', () => switchStudioMode('chat'));

    // Quick chips for Acara
    const chipButtons = document.querySelectorAll('.chip-acara');
    const inputAcara = document.getElementById('inputAcara');
    chipButtons.forEach(chip => {
      chip.addEventListener('click', () => {
        chipButtons.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        inputAcara.value = chip.getAttribute('data-val') || '';
      });
    });

    // Form Submit
    const outfitForm = document.getElementById('outfitForm');
    outfitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });

    // Chat Submit
    const chatForm = document.getElementById('chatInputForm');
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleChatSubmit();
    });

    // Chat suggestions clicks & Voice Quote clicks
    document.addEventListener('click', (e) => {
      const promptBtn = e.target.closest('.chat-pill-prompt, .voice-example-quote-btn');
      if (promptBtn) {
        if (this.isChatBusy) {
          this.showToast('Mohon tunggu sebentar, Stylist AI sedang merespons... ⏳');
          return;
        }
        if ('speechSynthesis' in window) {
          try { window.speechSynthesis.resume(); } catch (err) {}
        }
        const text = promptBtn.textContent.replace(/^🎙️\s*|["“”]/g, '').trim();
        const chatInput = document.getElementById('chatTextInput');
        if (chatInput) {
          chatInput.value = text;
          const isVoicePrompt = promptBtn.classList.contains('highlight-voice-prompt') || promptBtn.textContent.includes('🎙️');
          if (isVoicePrompt && window.VoiceStylist) {
            VoiceStylist.ttsEnabled = true;
          }
          this.handleChatSubmit(isVoicePrompt);
        }
      }
    });

    // Outfit Action Buttons
    const btnToggleFavorite = document.getElementById('btnToggleFavorite');
    btnToggleFavorite.addEventListener('click', async () => {
      if (!this.currentRecommendation) return;
      const newState = !this.currentRecommendation.favorit;
      this.currentRecommendation.favorit = newState;
      btnToggleFavorite.classList.toggle('active', newState);

      try {
        await API.toggleFavorite(this.currentRecommendation.id, newState);
        this.showToast(newState ? 'Disimpan ke Favorit ❤️' : 'Dihapus dari Favorit');
      } catch (err) {
        console.error(err);
      }
    });

    const btnCopyOutfit = document.getElementById('btnCopyOutfit');
    btnCopyOutfit.addEventListener('click', () => {
      if (!this.currentRecommendation) return;
      const text = OutfitRenderer.getOutfitShareText(this.currentRecommendation);
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Rincian outfit berhasil disalin! 📋');
      });
    });

    // Variation & Refine in chat
    const btnVariation = document.getElementById('btnRequestVariation');
    btnVariation.addEventListener('click', () => {
      const inputAcara = document.getElementById('inputAcara');
      inputAcara.value = `${inputAcara.value} (Alternatif Gaya)`;
      this.handleFormSubmit();
    });

    const btnRefineInChat = document.getElementById('btnRefineInChat');
    btnRefineInChat.addEventListener('click', () => {
      btnChat.click();
      const chatInput = document.getElementById('chatTextInput');
      chatInput.focus();
      chatInput.placeholder = `Revisi look "${this.currentRecommendation?.outfit?.judulLook || ''}"...`;
    });
  },

  /**
   * Smart Wardrobe-Gap Shopping Controls & Wardrobe Drawer
   */
  setupShoppingAndWardrobeGaps() {
    const btnAnalyze = document.getElementById('btnAnalyzeWardrobeGaps');
    const drawer = document.getElementById('wardrobeGapDrawer');
    const btnClose = document.getElementById('btnCloseWardrobeGaps');
    const btnRefresh = document.getElementById('btnRefreshWardrobeGaps');
    const container = document.getElementById('wardrobeGapCardsContainer');

    if (!btnAnalyze || !drawer) return;

    const loadAndRenderGaps = async (isRefresh = false) => {
      if (!container) return;

      if (btnRefresh) {
        btnRefresh.classList.add('spinning');
        btnRefresh.disabled = true;
      }

      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 36px 20px; text-align: center; color: var(--text-medium); font-size: 0.9rem;">
          <span style="display: inline-block; animation: spinRefresh 0.8s linear infinite; font-size: 1.5rem; margin-bottom: 8px;">🔄</span>
          <p>${isRefresh ? 'Menganalisis variasi potongan kunci baru untuk lemarimu...' : 'Menganalisis koleksi pakaian lemari Anda untuk mencari potongan pelengkap paling bernilai guna...'}</p>
        </div>
      `;

      try {
        const res = await API.getWardrobeGapAnalysis('usr_default', isRefresh);
        if (!res || !res.gaps || res.gaps.length === 0) {
          container.innerHTML = '<p style="grid-column: 1 / -1; padding: 24px; text-align: center; font-size: 0.88rem; color: var(--text-medium);">Lemari Anda sudah sangat lengkap dan terpadu!</p>';
          return;
        }

        container.innerHTML = '';
        res.gaps.forEach(gap => {
          const card = document.createElement('div');
          card.className = 'gap-insight-card';

          const tagsHtml = (gap.compatibleWardrobeItems || []).map(name => `<span class="synergy-tag">+ ${name}</span>`).join(' ');

          card.innerHTML = `
            <div class="gap-card-header">
              <span class="gap-card-icon">${gap.icon || '🧥'}</span>
              <div>
                <span class="gap-kicker">Missing Piece Kunci</span>
                <h4 class="gap-card-item-title">${gap.missingItem}</h4>
              </div>
            </div>
            <div class="gap-card-synergy-banner">
              ✨ ${gap.wardrobeSynergyReason}
            </div>
            <p class="product-reason-note">${gap.alasanKebutuhan}</p>
            <div class="synergy-compatible-tags">
              ${tagsHtml}
            </div>
            <div style="margin-top: 10px;">
              <button type="button" class="btn-dark-pill btn-gap-explore-btn" style="font-size: 0.76rem; padding: 6px 14px; width: 100%;">
                Buka Opsi Belanja Terkurasi →
              </button>
            </div>
          `;

          // When user clicks explore, switch to studio and open shopping drawer
          const exploreBtn = card.querySelector('.btn-gap-explore-btn');
          if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
              App.switchWorkspaceTab('studio');
              const studioEl = document.getElementById('studio-section');
              if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
              const shoppingToggle = document.getElementById('btnToggleShopping');
              const shoppingDrawer = document.getElementById('shoppingDrawer');
              if (shoppingDrawer && shoppingDrawer.style.display === 'none' && shoppingToggle) {
                shoppingToggle.click();
              }
            });
          }

          container.appendChild(card);
        });

        if (isRefresh) {
          this.showToast('Potongan kunci baru berhasil diacak & dianalisis! 🛍️✨');
        }
      } catch (err) {
        container.innerHTML = `<p style="grid-column: 1 / -1; color: #EF4444; padding: 20px; font-size: 0.88rem;">Gagal memuat analisis: ${err.message}</p>`;
      } finally {
        if (btnRefresh) {
          btnRefresh.classList.remove('spinning');
          btnRefresh.disabled = false;
        }
      }
    };

    btnAnalyze.addEventListener('click', () => {
      const isVisible = drawer.style.display !== 'none';
      if (isVisible) {
        drawer.style.display = 'none';
      } else {
        drawer.style.display = 'block';
        loadAndRenderGaps(false);
      }
    });

    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        loadAndRenderGaps(true);
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        drawer.style.display = 'none';
      });
    }
  },

  /**
   * Handle Request from Form Cepat
   */
  async handleFormSubmit() {
    const overlay = document.getElementById('loadingOverlay');
    const loadingTip = document.getElementById('loadingTip');
    overlay.classList.remove('hidden');

    const tips = [
      'Menyelaraskan palet warna dengan rona kulit dan acara...',
      'Memeriksa siluet potongan busana agar proporsional...',
      'Mengecek koleksi lemari pakaian Anda untuk paduan terbaik...',
      'Menyusun sentuhan akhir aksesori dan alas kaki...'
    ];
    let tipIdx = 0;
    const interval = setInterval(() => {
      tipIdx = (tipIdx + 1) % tips.length;
      loadingTip.textContent = tips[tipIdx];
    }, 1200);

    try {
      const acara = document.getElementById('inputAcara').value.trim();
      const cuaca = document.getElementById('selectCuaca').value;
      const suasana = document.getElementById('selectVibe').value;
      const catatanPengguna = document.getElementById('inputCatatan').value.trim();
      const useWardrobe = document.getElementById('checkUseWardrobe').checked;

      const payload = {
        userId: 'usr_default',
        konteks: {
          acara,
          cuaca,
          suasana,
          catatanPengguna
        },
        wardrobeItems: useWardrobe ? WardrobeManager.getSelectedItems() : [],
        profile: this.userProfile
      };

      const result = await API.generateOutfit(payload);
      clearInterval(interval);
      overlay.classList.add('hidden');

      this.currentRecommendation = result;
      this.recommendationHistory.unshift(result);
      OutfitRenderer.renderMainOutfit(result);
      this.showToast('Outfit baru berhasil diracik! ✨');

      // Add to chat history context
      this.addChatMessage('user', `Rekomendasikan outfit untuk "${acara}" (${suasana}).`);
      this.addChatMessage('ai', `Saya telah meracik tampilan **${result.outfit.judulLook}**. ${result.alasanAI}`);

    } catch (err) {
      clearInterval(interval);
      overlay.classList.add('hidden');
      alert('Gagal meracik outfit: ' + err.message);
    }
  },

  /**
   * "See Something I Like" Inspo Recreator Control Setup
   */
  setupSeeSomethingControls() {
    const dropzone = document.getElementById('seeSomethingDropzone');
    const fileInput = document.getElementById('inputSeeSomethingFile');
    const dropzoneIdle = document.getElementById('seeSomethingDropzoneIdle');
    const dropzonePreview = document.getElementById('seeSomethingDropzonePreview');
    const previewImg = document.getElementById('seeSomethingPreviewImg');
    const previewBadge = document.getElementById('seeSomethingPreviewBadge');
    const previewFileName = document.getElementById('seeSomethingFileName');
    const btnRemove = document.getElementById('btnRemoveSeeSomethingPhoto');
    const form = document.getElementById('seeSomethingForm');
    const presetButtons = document.querySelectorAll('.inspo-preset-card');

    const presetSVGs = {
      streetwear: {
        title: 'Casual Streetwear Inspo',
        style: 'Casual Streetwear',
        svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" rx="16" fill="%231E2026"/><circle cx="240" cy="115" r="50" fill="%23FF6B4A" opacity="0.2"/><text x="240" y="125" font-size="48" text-anchor="middle" fill="%23FFF">🛹</text><text x="240" y="195" font-family="system-ui,sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%23FFF">Casual Streetwear</text><text x="240" y="225" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle" fill="%23A1A1AA">Oversized Boxy Tee • Cargo Trousers • Chunky Sneakers</text><circle cx="205" cy="265" r="8" fill="%232E3033"/><circle cx="240" cy="265" r="8" fill="%23556B2F"/><circle cx="275" cy="265" r="8" fill="%23F8F6F0"/></svg>'
      },
      oldmoney: {
        title: 'Old Money Luxury Inspo',
        style: 'Old Money Luxury',
        svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" rx="16" fill="%231A1C20"/><circle cx="240" cy="115" r="50" fill="%23D97706" opacity="0.2"/><text x="240" y="125" font-size="48" text-anchor="middle" fill="%23FFF">🏛️</text><text x="240" y="195" font-family="system-ui,sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%23FFF">Old Money Luxury</text><text x="240" y="225" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle" fill="%23A1A1AA">Linen Shirt • Tailored Pleated Trousers • Loafers</text><circle cx="205" cy="265" r="8" fill="%23FAF9F6"/><circle cx="240" cy="265" r="8" fill="%23D8C3A5"/><circle cx="275" cy="265" r="8" fill="%232B2D42"/></svg>'
      },
      parisian: {
        title: 'Parisian Minimalist Inspo',
        style: 'Parisian Minimalist Chic',
        svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" rx="16" fill="%231C1B24"/><circle cx="240" cy="115" r="50" fill="%238B5CF6" opacity="0.2"/><text x="240" y="125" font-size="48" text-anchor="middle" fill="%23FFF">☕</text><text x="240" y="195" font-family="system-ui,sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%23FFF">Parisian Chic</text><text x="240" y="225" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle" fill="%23A1A1AA">Structured Blazer • Crisp White Tee • Straight Leg Denim</text><circle cx="205" cy="265" r="8" fill="%23121316"/><circle cx="240" cy="265" r="8" fill="%23FFFFFF"/><circle cx="275" cy="265" r="8" fill="%23385776"/></svg>'
      }
    };

    // Preset cards click
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        const presetData = presetSVGs[presetKey];
        if (!presetData) return;

        presetButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        this.currentInspoBase64 = presetData.svg;
        this.currentInspoMimeType = 'image/svg+xml';
        this.currentInspoPreset = presetData.style;

        if (previewImg) previewImg.src = presetData.svg;
        if (previewFileName) previewFileName.textContent = `${presetData.title}.svg`;
        if (previewBadge) previewBadge.textContent = `✨ Inspo: ${presetData.style}`;
        if (dropzoneIdle) dropzoneIdle.classList.add('hidden');
        if (dropzonePreview) dropzonePreview.classList.remove('hidden');

        this.showToast(`Inspirasi ${presetData.style} dipilih! Klik tombol di bawah untuk merekayasa dari lemarimu.`);
      });
    });

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target !== btnRemove && !e.target.closest('#btnRemoveSeeSomethingPhoto')) {
          fileInput.click();
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });

      ['dragleave', 'dragend'].forEach(evt => {
        dropzone.addEventListener(evt, () => dropzone.classList.remove('drag-active'));
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFile(e.target.files[0]);
        }
      });
    }

    const handleFile = (file) => {
      if (!file.type.startsWith('image/')) {
        alert('Mohon unggah berkas gambar (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 10MB.');
        return;
      }

      presetButtons.forEach(b => b.classList.remove('selected'));

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const fullDataUrl = loadEvt.target.result;
        this.currentInspoBase64 = fullDataUrl;
        this.currentInspoMimeType = file.type;
        this.currentInspoPreset = null;

        if (previewImg) previewImg.src = fullDataUrl;
        if (previewFileName) previewFileName.textContent = file.name;
        if (previewBadge) previewBadge.textContent = '✨ Foto Inspirasi Siap';
        if (dropzoneIdle) dropzoneIdle.classList.add('hidden');
        if (dropzonePreview) dropzonePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };

    if (btnRemove) {
      btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentInspoBase64 = null;
        this.currentInspoMimeType = null;
        this.currentInspoPreset = null;
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (dropzonePreview) dropzonePreview.classList.add('hidden');
        if (dropzoneIdle) dropzoneIdle.classList.remove('hidden');
        presetButtons.forEach(b => b.classList.remove('selected'));
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSeeSomethingSubmit();
      });
    }
  },

  /**
   * Handle "See Something I Like" Submission
   */
  async handleSeeSomethingSubmit() {
    if (!this.currentInspoBase64) {
      // Auto-select streetwear preset if none selected to make it super friendly
      const firstPreset = document.querySelector('.inspo-preset-card[data-preset="streetwear"]');
      if (firstPreset) {
        firstPreset.click();
      } else {
        alert('Silakan unggah foto outfit inspirasi atau pilih salah satu contoh inspirasi di atas.');
        return;
      }
    }

    const overlay = document.getElementById('loadingOverlay');
    const loadingTip = document.getElementById('loadingTip');
    if (overlay) overlay.classList.remove('hidden');

    const tips = [
      'Menganalisis gaya busana dari foto inspirasi...',
      'Mendeteksi potongan atasan, bawahan, dan alas kaki...',
      'Memeriksa isi lemarimu (YOUR CLOSET checklist)...',
      'Meracik padanan paling mendekati dari pakaian yang kamu miliki...',
      'Menyusun trik styling untuk meniru siluet aslinya...'
    ];
    let tipIdx = 0;
    if (loadingTip) loadingTip.textContent = tips[0];
    const interval = setInterval(() => {
      tipIdx = (tipIdx + 1) % tips.length;
      if (loadingTip) loadingTip.textContent = tips[tipIdx];
    }, 1200);

    try {
      const notes = document.getElementById('inputSeeSomethingNotes')?.value.trim() || '';

      const payload = {
        userId: 'usr_default',
        imageBase64: this.currentInspoBase64,
        mimeType: this.currentInspoMimeType || 'image/jpeg',
        konteks: {
          catatanPengguna: notes,
          presetStyle: this.currentInspoPreset || ''
        },
        profile: this.userProfile
      };

      const result = await API.seeSomethingILike(payload);
      clearInterval(interval);

      this.currentRecommendation = result;
      this.recommendationHistory.unshift(result);
      OutfitRenderer.renderMainOutfit(result);

      if (overlay) overlay.classList.add('hidden');
      this.showToast(`✨ Gaya "${result.styleDetected || 'Inspo'}" berhasil direkayasa ulang dari lemarimu!`);

      const resCard = document.getElementById('outfitResultCard');
      if (resCard) {
        resCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      clearInterval(interval);
      if (overlay) overlay.classList.add('hidden');
      console.error('See Something I Like error:', err);
      alert('Gagal merekayasa ulang outfit: ' + (err.message || 'Terjadi kesalahan'));
    }
  },

  /**
   * Photo Matcher Setup (Multimodal FR-7)
   */
  setupPhotoMatcherControls() {
    const dropzone = document.getElementById('photoDropzone');
    const fileInput = document.getElementById('inputPhotoFile');
    const dropzoneIdle = document.getElementById('dropzoneIdle');
    const dropzonePreview = document.getElementById('dropzonePreview');
    const previewImg = document.getElementById('photoPreviewImg');
    const previewFileName = document.getElementById('previewFileName');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');
    const photoForm = document.getElementById('photoMatchForm');

    if (!dropzone || !fileInput) return;

    const handleFile = (file) => {
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Format file tidak didukung. Silakan pilih foto dengan format JPG, PNG, atau WebP.');
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 8MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fullDataUrl = e.target.result;
        this.currentPhotoBase64 = fullDataUrl;
        this.currentPhotoMimeType = file.type;

        if (previewImg) previewImg.src = fullDataUrl;
        if (previewFileName) previewFileName.textContent = file.name;
        if (dropzoneIdle) dropzoneIdle.classList.add('hidden');
        if (dropzonePreview) dropzonePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    // Reset / remove photo
    if (btnRemovePhoto) {
      btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentPhotoBase64 = null;
        this.currentPhotoMimeType = null;
        fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (dropzonePreview) dropzonePreview.classList.add('hidden');
        if (dropzoneIdle) dropzoneIdle.classList.remove('hidden');
      });
    }

    // Submit Photo Form
    if (photoForm) {
      photoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handlePhotoSubmit();
      });
    }
  },

  /**
   * Handle Photo Match Submission
   */
  async handlePhotoSubmit() {
    if (!this.currentPhotoBase64) {
      alert('Silakan pilih atau unggah foto selfie / seluruh tubuh terlebih dahulu.');
      return;
    }

    const overlay = document.getElementById('loadingOverlay');
    const loadingTip = document.getElementById('loadingTip');
    if (overlay) overlay.classList.remove('hidden');

    const tips = [
      'Menganalisis proporsi tubuh dan siluet fisik...',
      'Mendeteksi rona kulit dan harmoni undertone...',
      'Mencocokkan item pakaian yang ada di lemari Anda...',
      'Menyusun styling tips personal dan aksentuasi...'
    ];
    let tipIdx = 0;
    if (loadingTip) loadingTip.textContent = tips[0];
    const interval = setInterval(() => {
      tipIdx = (tipIdx + 1) % tips.length;
      if (loadingTip) loadingTip.textContent = tips[tipIdx];
    }, 1400);

    try {
      const acara = document.getElementById('inputPhotoAcara')?.value.trim() || 'Acara Santai';
      const cuaca = document.getElementById('selectPhotoCuaca')?.value || 'Ruangan Ber-AC Dingin';
      const suasana = document.getElementById('selectPhotoVibe')?.value || 'Smart Casual & Proporsional';
      const catatanPengguna = document.getElementById('inputPhotoNotes')?.value.trim() || '';

      const payload = {
        userId: 'usr_default',
        imageBase64: this.currentPhotoBase64,
        mimeType: this.currentPhotoMimeType || 'image/jpeg',
        konteks: {
          acara,
          cuaca,
          suasana,
          catatanPengguna
        },
        profile: this.userProfile
      };

      const result = await API.matchPhotoOutfit(payload);
      clearInterval(interval);
      if (overlay) overlay.classList.add('hidden');

      this.currentRecommendation = result;
      this.recommendationHistory.unshift(result);
      OutfitRenderer.renderMainOutfit(result);

      // Scroll to display card
      const resultCard = document.getElementById('outfitResultCard');
      if (resultCard) {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.showToast('Outfit dari lemari pakaian berhasil dicocokkan dengan fotomu! 📸✨');

      const evalP = result.evaluasiFoto?.proporsiTubuh || result.evaluasiFoto?.analisisProporsi || 'Siluet proporsional';
      const evalU = result.evaluasiFoto?.undertoneWarna || result.evaluasiFoto?.analisisUndertone || 'Warna selaras';
      this.addChatMessage('ai', `Saya telah menganalisis foto fisikmu: **${evalP}** (${evalU}). Tampilan yang saya racik dari lemarimu adalah **${result.outfit.judulLook}**.`);

    } catch (err) {
      clearInterval(interval);
      if (overlay) overlay.classList.add('hidden');
      alert('Gagal menganalisis foto & mencocokkan outfit: ' + err.message);
    }
  },

  /**
   * Handle Chat Multi-turn Refinement (FR-4)
   */
  async handleChatSubmit(isVoice = false) {
    if (this.isChatBusy) {
      this.showToast('Mohon tunggu sebentar, Stylist AI sedang merespons... ⏳');
      return;
    }

    const input = document.getElementById('chatTextInput');
    const message = input ? input.value.trim() : '';
    if (!message) return;

    // Set busy lock
    this.isChatBusy = true;

    // Detect if this interaction came from voice
    const fromVoice = Boolean(isVoice || this.wasVoiceTriggered || (window.VoiceStylist && VoiceStylist.ttsEnabled));
    this.wasVoiceTriggered = false;

    // If voice recognition is running, stop it cleanly
    if (window.VoiceStylist && VoiceStylist.isListening) {
      VoiceStylist.stopListening();
    }
    const voiceBar = document.getElementById('voiceListeningBar');
    if (voiceBar) voiceBar.classList.add('hidden');

    // Disable chat inputs while waiting for AI response
    const btnSend = document.getElementById('btnSendChat');
    const btnVoice = document.getElementById('btnVoiceRecord');
    const chatForm = document.getElementById('chatInputForm');
    const quickPrompts = document.querySelector('.quick-chat-prompts');

    if (input) {
      input.value = '';
      input.disabled = true;
      input.placeholder = 'Stylist sedang meracik jawaban, mohon tunggu...';
    }
    if (btnSend) btnSend.disabled = true;
    if (btnVoice) btnVoice.disabled = true;
    if (chatForm) chatForm.classList.add('is-busy');
    if (quickPrompts) quickPrompts.classList.add('is-busy');

    this.addChatMessage('user', message);

    const typingId = this.addTypingIndicator();

    try {
      const payload = {
        userId: 'usr_default',
        pesan: message,
        currentOutfit: this.currentRecommendation,
        chatHistory: this.chatHistory,
        wardrobeItems: WardrobeManager.getSelectedItems(),
        profile: this.userProfile
      };

      const response = await API.sendChatFollowUp(payload);
      this.removeTypingIndicator(typingId);

      const aiMsgElement = this.addChatMessage('ai', response.jawabanChat);

      // Auto-speak response if user used voice chat or if Voice Stylist is active
      if (fromVoice && window.VoiceStylist) {
        VoiceStylist.ttsEnabled = true;
        const btnToggleTTS = document.getElementById('btnToggleTTS');
        if (btnToggleTTS) btnToggleTTS.classList.add('active');
        const icon = document.getElementById('ttsIcon');
        const label = document.getElementById('ttsLabel');
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Voice: ON';

        const speakBtn = aiMsgElement?.querySelector ? aiMsgElement.querySelector('.btn-speak-bubble') : null;
        VoiceStylist.speak(response.jawabanChat, speakBtn);
      }

      if (response.updatedOutfit) {
        this.currentRecommendation = response.updatedOutfit;
        this.recommendationHistory.unshift(response.updatedOutfit);
        OutfitRenderer.renderMainOutfit(response.updatedOutfit);
        this.showToast('Outfit diperbarui berdasarkan obrolan! 👗');
      }

    } catch (err) {
      this.removeTypingIndicator(typingId);
      this.addChatMessage('ai', `Maaf, terjadi kendala saat memproses saran: ${err.message}`);
    } finally {
      // Release busy lock and re-enable inputs
      this.isChatBusy = false;
      if (input) {
        input.disabled = false;
        input.placeholder = 'Ketik pesan atau tekan 🎙️ untuk berbicara...';
        input.focus();
      }
      if (btnSend) btnSend.disabled = false;
      if (btnVoice) btnVoice.disabled = false;
      if (chatForm) chatForm.classList.remove('is-busy');
      if (quickPrompts) quickPrompts.classList.remove('is-busy');
    }
  },

  /**
   * Append message into Chat UI
   */
  addChatMessage(sender, text) {
    const container = document.getElementById('chatMessagesArea');
    if (!container) return null;

    this.chatHistory.push({ sender, text });

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-row msg-${sender}`;

    const avatar = sender === 'ai' ? '✦' : '👤';
    const senderName = sender === 'ai' ? 'Personal Stylist AI' : 'Anda';

    if (sender === 'ai') {
      msgDiv.innerHTML = `
        <div class="avatar-circle">${avatar}</div>
        <div class="bubble-content">
          <div class="bubble-header-line">
            <p class="bubble-author">${senderName}</p>
            <button type="button" class="btn-speak-bubble" title="Dengarkan suara asisten">🔊</button>
          </div>
          <p>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
        </div>
      `;
      const speakBtn = msgDiv.querySelector('.btn-speak-bubble');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          if (VoiceStylist.isSpeaking && VoiceStylist.activeSpeakerBtn === speakBtn) {
            VoiceStylist.stopSpeaking();
          } else {
            VoiceStylist.speak(text, speakBtn);
          }
        });
      }
    } else {
      msgDiv.innerHTML = `
        <div class="avatar-circle">${avatar}</div>
        <div class="bubble-content">
          <p class="bubble-author">${senderName}</p>
          <p>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
        </div>
      `;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    return msgDiv;
  },

  addTypingIndicator() {
    const container = document.getElementById('chatMessagesArea');
    if (!container) return null;

    // Remove any previous typing indicator to avoid duplicate bubbles
    container.querySelectorAll('[id^="typing-"]').forEach(el => el.remove());

    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-row msg-ai';
    div.innerHTML = `
      <div class="avatar-circle">✦</div>
      <div class="bubble-content" style="padding: 10px 16px; display: inline-flex; align-items: center; gap: 8px;">
        <span class="typing-dots"><span></span><span></span><span></span></span>
        <span style="font-size: 0.82rem; color: var(--text-medium);">Stylist sedang memikirkan paduan gaya...</span>
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  },

  removeTypingIndicator(id) {
    if (id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }
    // Also cleanup any orphaned indicators
    const container = document.getElementById('chatMessagesArea');
    if (container) {
      container.querySelectorAll('[id^="typing-"]').forEach(el => el.remove());
    }
  },

  /**
   * History & Favorites (FR-5)
   */
  async loadHistory() {
    try {
      this.recommendationHistory = await API.getRecommendations('usr_default');
    } catch (e) {
      console.error(e);
    }
  },

  setupHistoryControls() {
    let showOnlyFavorites = false;
    const btnAll = document.getElementById('btnShowAllHistory');
    const btnFavs = document.getElementById('btnShowOnlyFavorites');
    const btnClearAll = document.getElementById('btnClearAllHistory');

    if (btnAll && btnFavs) {
      btnAll.addEventListener('click', () => {
        btnAll.classList.add('active');
        btnFavs.classList.remove('active');
        showOnlyFavorites = false;
        this.renderHistoryGrid(showOnlyFavorites);
      });

      btnFavs.addEventListener('click', () => {
        btnFavs.classList.add('active');
        btnAll.classList.remove('active');
        showOnlyFavorites = true;
        this.renderHistoryGrid(showOnlyFavorites);
      });
    }

    if (btnClearAll) {
      btnClearAll.addEventListener('click', async () => {
        if (!this.recommendationHistory || this.recommendationHistory.length === 0) {
          this.showToast('Riwayat rekomendasi sudah kosong ✨');
          return;
        }

        const confirmMsg = showOnlyFavorites
          ? 'Hapus seluruh riwayat rekomendasi (termasuk outfit favorit)? Tindakan ini tidak dapat dibatalkan.'
          : 'Hapus SELURUH riwayat rekomendasi outfit? Tindakan ini tidak dapat dibatalkan.';

        const confirmed = await this.showConfirmModal({
          title: 'Hapus Seluruh Riwayat?',
          message: confirmMsg,
          confirmText: 'Hapus Semua',
          cancelText: 'Batal',
          icon: '🗑️',
          isDanger: true
        });

        if (!confirmed) return;

        try {
          btnClearAll.disabled = true;
          await API.deleteAllRecommendations('usr_default');
          this.recommendationHistory = [];
          this.renderHistoryGrid(showOnlyFavorites);
          this.showToast('Seluruh riwayat rekomendasi berhasil dihapus 🗑️');
        } catch (err) {
          alert('Gagal menghapus riwayat: ' + err.message);
        } finally {
          btnClearAll.disabled = false;
        }
      });
    }
  },

  renderHistoryGrid(onlyFavs = false) {
    const grid = document.getElementById('historyGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const list = onlyFavs 
      ? this.recommendationHistory.filter(r => r.favorit)
      : this.recommendationHistory;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-light); background: #FFFFFF; border-radius: 20px;">
          <p style="font-size: 1.15rem; margin-bottom: 8px;">${onlyFavs ? 'Belum ada rekomendasi yang difavoritkan.' : 'Belum ada riwayat rekomendasi.'}</p>
          <p style="font-size: 0.85rem;">Kembali ke Studio Stylist untuk mulai meracik tampilan Anda!</p>
        </div>
      `;
      return;
    }

    list.forEach(rec => {
      const card = OutfitRenderer.createHistoryCard(
        rec,
        (selectedRec) => {
          this.currentRecommendation = selectedRec;
          OutfitRenderer.renderMainOutfit(selectedRec);
          this.switchWorkspaceTab('studio');
          const studioEl = document.getElementById('studio-section');
          if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
          this.showToast(`Membuka "${selectedRec.outfit?.judulLook}" di Studio`);
        },
        async (recId, isFav) => {
          try {
            await API.toggleFavorite(recId, isFav);
            const found = this.recommendationHistory.find(r => r.id === recId);
            if (found) found.favorit = isFav;
            if (onlyFavs && !isFav) {
              this.renderHistoryGrid(onlyFavs);
            }
          } catch (err) {
            console.error(err);
          }
        },
        async (recToDelete) => {
          const lookTitle = recToDelete.outfit?.judulLook || 'look ini';
          const confirmed = await this.showConfirmModal({
            title: 'Hapus Rekomendasi?',
            message: `Apakah Anda yakin ingin menghapus "${lookTitle}" dari riwayat inspirasi outfit?`,
            confirmText: 'Hapus Look',
            cancelText: 'Batal',
            icon: '🗑️',
            isDanger: true
          });
          if (!confirmed) return;

          try {
            await API.deleteRecommendation(recToDelete.id);
            this.recommendationHistory = this.recommendationHistory.filter(r => r.id !== recToDelete.id);
            this.renderHistoryGrid(onlyFavs);
            this.showToast(`"${lookTitle}" dihapus dari riwayat 🗑️`);
          } catch (err) {
            alert('Gagal menghapus rekomendasi: ' + err.message);
          }
        }
      );
      grid.appendChild(card);
    });
  },

  /**
   * User Profile Controls (FR-1)
   */
  async loadUserProfile() {
    try {
      this.userProfile = await API.getProfile('usr_default');
      if (this.userProfile) {
        const profNama = document.getElementById('profNama');
        if (profNama && this.userProfile.namaOpsional) {
          profNama.value = this.userProfile.namaOpsional;
        }

        // Gender
        const gender = this.userProfile.gender || this.userProfile.preferensi?.gender || 'female';
        const profGender = document.getElementById('profGender');
        if (profGender) profGender.value = gender;
        document.querySelectorAll('.gender-pill-btn').forEach(btn => {
          if (btn.getAttribute('data-gender') === gender) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        // Body metrics
        const tinggi = this.userProfile.tinggiBadan || this.userProfile.preferensi?.tinggiBadan || 165;
        const berat = this.userProfile.beratBadan || this.userProfile.preferensi?.beratBadan || 54;
        const bentuk = this.userProfile.bentukTubuh || this.userProfile.preferensi?.bentukTubuh || 'Jam Pasir (Hourglass)';
        const ukuran = this.userProfile.ukuranBaju || this.userProfile.preferensi?.ukuranBaju || 'M';
        const catatan = this.userProfile.catatanProporsi || this.userProfile.preferensi?.catatanProporsi || '';

        const profTinggi = document.getElementById('profTinggi');
        if (profTinggi) profTinggi.value = tinggi;

        const profBerat = document.getElementById('profBerat');
        if (profBerat) profBerat.value = berat;

        const profBentuk = document.getElementById('profBentukTubuh');
        if (profBentuk) profBentuk.value = bentuk;

        const profUkuran = document.getElementById('profUkuranBaju');
        if (profUkuran) profUkuran.value = ukuran;

        const profCatatan = document.getElementById('profCatatanProporsi');
        if (profCatatan && catatan) profCatatan.value = catatan;

        const profBudget = document.getElementById('profBudget');
        if (profBudget && this.userProfile.preferensi?.budget) {
          profBudget.value = this.userProfile.preferensi.budget;
        }

        const profTipe = document.getElementById('profTipeTubuh');
        if (profTipe && this.userProfile.preferensi?.tipeTubuh) {
          profTipe.value = this.userProfile.preferensi.tipeTubuh;
        }

        const profBahasa = document.getElementById('profBahasa');
        if (profBahasa) {
          const userLang = this.userProfile.preferensi?.bahasa || localStorage.getItem('stylO_language') || 'id';
          profBahasa.value = userLang;
          if (typeof I18n !== 'undefined') {
            I18n.setLanguage(userLang);
          }
        }

        // Set style tags
        const styles = this.userProfile.preferensi?.gayaFavorit || [];
        document.querySelectorAll('.tag-pill-btn').forEach(btn => {
          const styleVal = btn.getAttribute('data-style');
          if (styles.includes(styleVal)) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        // Set color chips
        const colors = this.userProfile.preferensi?.warnaFavorit || [];
        if (colors.length > 0) {
          document.querySelectorAll('.swatch-circle').forEach(chip => {
            const hex = chip.getAttribute('data-color');
            if (colors.includes(hex)) {
              chip.classList.add('active');
            } else {
              chip.classList.remove('active');
            }
          });
        }

        // Update live body display card
        this.updateBodyProfileDisplay(this.userProfile);
      }
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Update Live Body Information & Silhouette Guidance Display Card
   */
  updateBodyProfileDisplay(profile) {
    if (!profile) return;

    const gender = profile.gender || profile.preferensi?.gender || 'female';
    const isMale = gender === 'male' || gender === 'pria';

    // Update gender badge in header
    const dispGenderIcon = document.getElementById('dispGenderIcon');
    const dispGenderText = document.getElementById('dispGenderText');
    if (dispGenderIcon) dispGenderIcon.textContent = isMale ? '👨' : '👩';
    if (dispGenderText) dispGenderText.textContent = isMale ? (typeof I18n !== 'undefined' ? I18n.t('profile.gender_male') : 'Pria (Male)') : (typeof I18n !== 'undefined' ? I18n.t('profile.gender_female') : 'Wanita (Female)');

    const tinggi = Number(profile.tinggiBadan || profile.preferensi?.tinggiBadan || 165);
    const berat = Number(profile.beratBadan || profile.preferensi?.beratBadan || 54);
    const bentuk = profile.bentukTubuh || profile.preferensi?.bentukTubuh || 'Jam Pasir (Hourglass)';
    const ukuran = profile.ukuranBaju || profile.preferensi?.ukuranBaju || 'M';
    const catatan = profile.catatanProporsi || profile.preferensi?.catatanProporsi || '';

    // Calculate BMI
    let bmiText = '-';
    let bmiCategory = 'Proporsional';
    if (tinggi > 0 && berat > 0) {
      const heightInMeters = tinggi / 100;
      const bmi = (berat / (heightInMeters * heightInMeters)).toFixed(1);
      if (bmi < 18.5) bmiCategory = 'Ramping (Underweight)';
      else if (bmi < 24.9) bmiCategory = 'Seimbang & Proporsional';
      else if (bmi < 29.9) bmiCategory = 'Berisi (Overweight)';
      else bmiCategory = 'Plump Silhouette';
      bmiText = `BMI ${bmi} • ${bmiCategory}`;
    }

    // Height Category
    let heightCat = 'Postur Ideal Proporsional';
    if (tinggi < 155) heightCat = 'Petite Chic (Perlu Trik Kaki Jenjang)';
    else if (tinggi > 175) heightCat = 'Tall Statuesque (Ideal untuk Layering)';

    // DOM Updates
    const dispTinggi = document.getElementById('dispTinggiBadan');
    if (dispTinggi) dispTinggi.innerHTML = `${tinggi} <span class="unit">cm</span>`;

    const dispTinggiCat = document.getElementById('dispTinggiKategori');
    if (dispTinggiCat) dispTinggiCat.textContent = heightCat;

    const dispBerat = document.getElementById('dispBeratBadan');
    if (dispBerat) dispBerat.innerHTML = `${berat} <span class="unit">kg</span>`;

    const dispBMI = document.getElementById('dispBMILabel');
    if (dispBMI) dispBMI.textContent = bmiText;

    // Body shape label cleaning
    const shapeShortName = bentuk.split('—')[0].split('(')[0].trim();
    const dispBentuk = document.getElementById('dispBentukTubuh');
    if (dispBentuk) dispBentuk.textContent = shapeShortName;

    const dispUkuran = document.getElementById('dispUkuranBaju');
    if (dispUkuran) dispUkuran.textContent = ukuran;

    const dispFit = document.getElementById('dispFitSub');
    if (dispFit) {
      const fit = profile.preferensi?.tipeTubuh || 'regular';
      dispFit.textContent = fit === 'slim fit' ? 'Siluet Slim Fit' : (fit === 'oversized relaxed' ? 'Siluet Oversized' : 'Regular Seimbang');
    }

    // Proportion notes box
    const dispNoteBox = document.getElementById('dispProporsiNoteBox');
    const dispCatatan = document.getElementById('dispCatatanProporsi');
    if (dispNoteBox && dispCatatan) {
      if (catatan && catatan.trim() !== '') {
        dispCatatan.textContent = catatan;
        dispNoteBox.style.display = 'flex';
      } else {
        dispCatatan.textContent = 'Tidak ada catatan proporsi khusus. AI mengacu pada rasio tinggi dan bentuk tubuh.';
      }
    }

    // Silhouette & Tailoring Rules
    const dispRules = document.getElementById('dispSilhouetteRules');
    const dispShapeSub = document.getElementById('dispBentukSub');
    if (dispRules) {
      const bentukLower = bentuk.toLowerCase();
      if (isMale) {
        if (bentukLower.includes('jam pasir') || bentukLower.includes('hourglass') || bentukLower.includes('trapezoid') || bentukLower.includes('atletis')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Bahu bidang, pinggang proporsional';
          dispRules.textContent = `Untuk postur Pria Atletis/Trapezoid (${tinggi} cm, ${berat} kg), proporsi tubuh Anda sangat seimbang. Gunakan kemeja slim-to-regular fit, celana tapered trousers atau flat-front chinos, serta unstructured blazer atau casual overshirt untuk garis tubuh maskulin yang rapi dan tegas.`;
        } else if (bentukLower.includes('persegi panjang') || bentukLower.includes('rectangle')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Torso lurus sejajar';
          dispRules.textContent = `Untuk siluet Pria Persegi Panjang (${tinggi} cm), ciptakan dimensi bahu yang lebih tegap menggunakan outerwear berstruktur (trucker jacket, tailored blazer, atau overshirt berbahan kokoh) dipadukan dengan celana tapered chinos.`;
        } else if (bentukLower.includes('segitiga terbalik') || bentukLower.includes('inverted')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Dada & bahu lebar (V-Taper)';
          dispRules.textContent = `Untuk siluet Pria Segitiga Terbalik (${tinggi} cm), tonjolkan bahu bidang dengan atasan kerah crew-neck atau kemeja fitted, dipadukan dengan celana straight-leg atau relaxed-fit agar proporsi kaki seimbang dengan torso atas yang tegap.`;
        } else if (bentukLower.includes('pir') || bentukLower.includes('pear') || bentukLower.includes('segitiga')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Pinggul & paha dominan';
          dispRules.textContent = `Untuk siluet Pria Segitiga, tarik fokus ke pundak dan dada menggunakan outerwear berstruktur bahu tegas, atasan bertekstur, dan celana straight berwarna netral gelap untuk siluet yang lebih proporsional.`;
        } else if (bentukLower.includes('apel') || bentukLower.includes('apple') || bentukLower.includes('oval')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Torso tengah berisi';
          dispRules.textContent = `Untuk siluet Pria Oval/Berisi (${tinggi} cm), kenakan paduan vertikal dengan warna senada monokrom gelap, kemeja unbuttoned di atas kaos polos, dan celana straight berkancing flat untuk ilusi tubuh lebih ramping dan jenjang.`;
        } else {
          if (dispShapeSub) dispShapeSub.textContent = 'Siluet maskulin proporsional';
          dispRules.textContent = `Untuk postur Pria (${tinggi} cm, ${berat} kg), pilih potongan tailored yang nyaman bergerak, kombinasikan kemeja kasual atau polo dengan chinos dan clean sneakers/loafers.`;
        }
      } else {
        if (bentukLower.includes('jam pasir') || bentukLower.includes('hourglass')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Garis pinggang terdefinisi';
          dispRules.textContent = `Dengan bentuk Jam Pasir dan tinggi ${tinggi} cm, fokuskan siluet pada penekanan garis pinggang (high-waisted trousers, wrap dress, tailored blazer kancing tunggal). Siluet ini menonjolkan lekuk feminin tanpa menambah volume berlebih di bahu atau pinggul.`;
        } else if (bentukLower.includes('persegi panjang') || bentukLower.includes('rectangle')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Siluet lurus & seimbang';
          dispRules.textContent = `Untuk bentuk Persegi Panjang (${tinggi} cm), ciptakan dimensi visual melalui teknik layering terstruktur, sabuk beraksen, celana wide-leg pleated, dan atasan dengan detail kerah atau saku untuk menciptakan ilusi lekukan tubuh yang anggun.`;
        } else if (bentukLower.includes('segitiga terbalik') || bentukLower.includes('inverted')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Bahu bidang & tegap';
          dispRules.textContent = `Untuk Segitiga Terbalik, seimbangkan bahu yang bidang dengan menambah volume di bagian bawah lewat celana palazzo/wide-leg, rok A-line, atau hem bermotif. Pilih atasan V-neck atau raglan cut yang melembutkan torso atas.`;
        } else if (bentukLower.includes('pir') || bentukLower.includes('pear')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Pinggul berlekuk feminin';
          dispRules.textContent = `Untuk bentuk Pir, tarik fokus ke bagian dada dan bahu dengan outerwear berstruktur, kemeja kerah boatneck atau puff sleeve ringan, dipadukan dengan celana straight leg berwarna gelap untuk proporsi tubuh yang memanjang.`;
        } else if (bentukLower.includes('apel') || bentukLower.includes('apple') || bentukLower.includes('oval')) {
          if (dispShapeSub) dispShapeSub.textContent = 'Torso dominan & kaki ramping';
          dispRules.textContent = `Untuk bentuk Apel/Oval, gunakan potongan vertikal (long outerwear, unbuttoned blazer, atasan leher V atau scoop neck) dan tonjolkan keindahan kaki Anda dengan rok midi atau celana straight berkancing datar.`;
        } else {
          if (dispShapeSub) dispShapeSub.textContent = 'Siluet bugar atletis';
          dispRules.textContent = `Untuk postur Atletis (${tinggi} cm, ${berat} kg), padukan tailored suit dengan bahan knit lembut atau flowy trouser untuk memadukan ketegasan bahu dengan sentuhan modern effortless.`;
        }
      }
    }
  },

  /**
   * Seamless bridge from Body Profile to Chat Stylist
   */
  askStylistBodyTips(promptText) {
    // 1. Switch to studio tab
    this.switchWorkspaceTab('studio');

    // 2. Switch mode inside studio to chat
    const btnChat = document.getElementById('btnModeChat');
    const btnForm = document.getElementById('btnModeForm');
    const btnPhoto = document.getElementById('btnModePhoto');
    const viewChat = document.getElementById('viewChat');
    const viewForm = document.getElementById('viewForm');
    const viewPhoto = document.getElementById('viewPhoto');

    [btnForm, btnPhoto].forEach(b => b?.classList.remove('active'));
    [viewForm, viewPhoto].forEach(v => v?.classList.remove('active'));
    btnChat?.classList.add('active');
    viewChat?.classList.add('active');

    // 3. Scroll to studio view
    const studioEl = document.getElementById('studio-section');
    if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });

    // 4. Fill chat input and send
    const chatInput = document.getElementById('chatTextInput');
    if (chatInput) {
      chatInput.value = promptText;
      this.handleChatSubmit();
    }
    this.showToast('Stylist AI sedang membaca profil tubuh & meracik tips proporsional... 💬');
  },

  setupProfileControls() {
    // Gender toggle pills
    document.querySelectorAll('.gender-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gender = btn.getAttribute('data-gender');
        document.querySelectorAll('.gender-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const profGender = document.getElementById('profGender');
        if (profGender) profGender.value = gender;

        if (this.userProfile) {
          this.userProfile.gender = gender;
          if (this.userProfile.preferensi) this.userProfile.preferensi.gender = gender;
          this.updateBodyProfileDisplay(this.userProfile);
        }
      });
    });

    // Style tags toggle
    document.querySelectorAll('.tag-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
      });
    });

    // Color chips toggle
    document.querySelectorAll('.swatch-circle').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
    });

    // Interactive Body AI Consultation Prompts
    document.querySelectorAll('.body-consult-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) {
          this.askStylistBodyTips(prompt);
        }
      });
    });

    // Big button: Buka Konsultasi Penuh di Chat Stylist
    const btnOpenChat = document.getElementById('btnOpenBodyChatStylist');
    if (btnOpenChat) {
      btnOpenChat.addEventListener('click', () => {
        const tinggi = document.getElementById('profTinggi')?.value || '165';
        const berat = document.getElementById('profBerat')?.value || '54';
        const bentuk = document.getElementById('profBentukTubuh')?.value || 'Jam Pasir';
        const prompt = `Halo Stylist! Berdasarkan data tubuh saya (Tinggi: ${tinggi} cm, Berat: ${berat} kg, Bentuk Tubuh: ${bentuk}), berikan panduan komprehensif tentang siluet pakaian, panjang hem, dan potongan busana yang paling flattering untuk postur saya.`;
        this.askStylistBodyTips(prompt);
      });
    }

    // Language preference dropdown in profile
    const profBahasa = document.getElementById('profBahasa');
    if (profBahasa) {
      profBahasa.addEventListener('change', (e) => {
        if (typeof I18n !== 'undefined') {
          I18n.setLanguage(e.target.value);
        }
      });
    }

        const form = document.getElementById('profileForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const namaOpsional = document.getElementById('profNama').value.trim();
        const gender = document.getElementById('profGender')?.value || 'female';
        const tinggiBadan = Number(document.getElementById('profTinggi').value) || 165;
        const beratBadan = Number(document.getElementById('profBerat').value) || 54;
        const bentukTubuh = document.getElementById('profBentukTubuh').value;
        const ukuranBaju = document.getElementById('profUkuranBaju').value;
        const catatanProporsi = document.getElementById('profCatatanProporsi').value.trim();

        const budget = document.getElementById('profBudget').value;
        const tipeTubuh = document.getElementById('profTipeTubuh').value;
        const bahasa = document.getElementById('profBahasa')?.value || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'id');

        const gayaFavorit = Array.from(document.querySelectorAll('.tag-pill-btn.active'))
          .map(b => b.getAttribute('data-style'));

        const warnaFavorit = Array.from(document.querySelectorAll('.swatch-circle.active'))
          .map(c => c.getAttribute('data-color'));

        const profileData = {
          id: 'usr_default',
          namaOpsional,
          gender,
          tinggiBadan,
          beratBadan,
          bentukTubuh,
          ukuranBaju,
          catatanProporsi,
          preferensi: {
            gender,
            gayaFavorit,
            warnaFavorit,
            budget,
            tipeTubuh,
            tinggiBadan,
            beratBadan,
            bentukTubuh,
            ukuranBaju,
            catatanProporsi,
            bahasa
          }
        };

        try {
          const saved = await API.saveProfile(profileData);
          this.userProfile = saved;
          this.updateBodyProfileDisplay(saved);

          const status = document.getElementById('profileSaveStatus');
          if (status) {
            status.textContent = typeof I18n !== 'undefined' ? I18n.t('profile.saved_status') : '✓ Profil & Preferensi berhasil disimpan!';
            setTimeout(() => { status.textContent = ''; }, 3500);
          }
          this.showToast(typeof I18n !== 'undefined' ? I18n.t('toast.profile_saved') : 'Data proporsi tubuh & preferensi gaya berhasil disimpan ke AI! ✨');
        } catch (err) {
          alert('Gagal menyimpan profil: ' + err.message);
        }
      });
    }
  },

  /**
   * Toast helper
   */
  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✦</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  },

  /**
   * Custom Minimalist Confirmation Modal (replaces native browser confirm)
   * @param {Object} options
   * @param {string} options.title
   * @param {string} options.message
   * @param {string} options.confirmText
   * @param {string} options.cancelText
   * @param {string} options.icon
   * @param {boolean} options.isDanger
   * @returns {Promise<boolean>}
   */
  showConfirmModal({
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Hapus',
    cancelText = 'Batal',
    icon = '🗑️',
    isDanger = true
  } = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('customConfirmModal');
      const titleEl = document.getElementById('customConfirmTitle');
      const msgEl = document.getElementById('customConfirmMessage');
      const iconEl = document.getElementById('customConfirmIcon');
      const btnCancel = document.getElementById('btnCustomConfirmCancel');
      const btnDanger = document.getElementById('btnCustomConfirmDanger');

      if (!modal || !btnCancel || !btnDanger) {
        // Fallback gracefully to native confirm if elements are absent
        resolve(window.confirm(message || title));
        return;
      }

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;
      if (iconEl) iconEl.textContent = icon;
      btnCancel.textContent = cancelText;
      btnDanger.textContent = confirmText;

      if (isDanger) {
        btnDanger.className = 'btn-confirm-danger';
      } else {
        btnDanger.className = 'btn-confirm-primary';
      }

      modal.classList.remove('hidden');
      btnDanger.focus();

      const cleanup = () => {
        modal.classList.add('hidden');
        btnCancel.removeEventListener('click', onCancel);
        btnDanger.removeEventListener('click', onConfirm);
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeyDown);
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onBackdrop = (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(false);
        }
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup();
          resolve(false);
        } else if (e.key === 'Enter') {
          if (document.activeElement !== btnCancel) {
            e.preventDefault();
            cleanup();
            resolve(true);
          }
        }
      };

      btnCancel.addEventListener('click', onCancel);
      btnDanger.addEventListener('click', onConfirm);
      modal.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKeyDown);
    });
  },

  /**
   * Initialize Modern Luxury Custom Select Dropdowns
   */
  setupCustomDropdowns() {
    const targetSelectIds = [
      'selectVibe',
      'selectPhotoVibe',
      'selectCuaca',
      'selectPhotoCuaca'
    ];

    targetSelectIds.forEach(id => {
      const selectEl = document.getElementById(id);
      if (selectEl) {
        this.initCustomSelect(selectEl);
      }
    });
  },

  /**
   * Convert a native select element into a sleek, accessible custom pull-down UI
   * @param {HTMLSelectElement} selectEl 
   */
  initCustomSelect(selectEl) {
    if (!selectEl || selectEl.dataset.customized === 'true') return;
    selectEl.dataset.customized = 'true';

    // Create custom wrapper
    const wrap = document.createElement('div');
    wrap.className = 'custom-select-wrapper';

    // Trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    // Menu listbox
    const menu = document.createElement('div');
    menu.className = 'custom-select-menu hidden';
    menu.setAttribute('role', 'listbox');

    const getCleanData = (opt) => {
      if (!opt) return { icon: '✦', text: '', desc: '' };
      const rawText = opt.text.trim();
      const emojiMatch = rawText.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\uFE0F|\u200D)+/);
      const icon = opt.dataset.icon || (emojiMatch ? emojiMatch[0] : '✦');
      const text = rawText.replace(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\uFE0F|\u200D|\s)+/, '').trim() || rawText;
      const desc = opt.dataset.desc || '';
      return { icon, text, desc };
    };

    const updateTrigger = () => {
      const selectedOpt = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
      const { icon, text } = getCleanData(selectedOpt);
      trigger.innerHTML = `
        <span class="custom-select-selected">
          <span class="custom-select-icon">${icon}</span>
          <span class="custom-select-label">${text}</span>
        </span>
        <span class="custom-select-arrow">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      `;
    };

    const renderOptions = () => {
      menu.innerHTML = '';
      Array.from(selectEl.options).forEach((opt, index) => {
        const isSelected = index === selectEl.selectedIndex;
        const item = document.createElement('div');
        item.className = `custom-select-item ${isSelected ? 'active' : ''}`;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', isSelected ? 'true' : 'false');

        const { icon, text, desc } = getCleanData(opt);

        item.innerHTML = `
          <div class="custom-item-left">
            <span class="custom-item-icon">${icon}</span>
            <div class="custom-item-info">
              <span class="custom-item-title">${text}</span>
              ${desc ? `<span class="custom-item-desc">${desc}</span>` : ''}
            </div>
          </div>
          <span class="custom-item-check">${isSelected ? '✓' : ''}</span>
        `;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectEl.selectedIndex = index;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          updateTrigger();
          renderOptions();
          closeMenu();
        });

        menu.appendChild(item);
      });
    };

    const openMenu = () => {
      // Close other open custom dropdowns
      document.querySelectorAll('.custom-select-menu:not(.hidden)').forEach(m => m.classList.add('hidden'));
      document.querySelectorAll('.custom-select-trigger.open').forEach(t => {
        t.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => w.classList.remove('is-open'));

      menu.classList.remove('hidden');
      trigger.classList.add('open');
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');

      // Scroll active item smoothly into view
      const activeEl = menu.querySelector('.custom-select-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    };

    const closeMenu = () => {
      menu.classList.add('hidden');
      trigger.classList.remove('open');
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        closeMenu();
      }
    });

    // Keyboard support: Escape closes, arrow keys navigate
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        trigger.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (menu.classList.contains('hidden')) {
          openMenu();
        } else {
          const delta = e.key === 'ArrowDown' ? 1 : -1;
          const nextIndex = Math.max(0, Math.min(selectEl.options.length - 1, selectEl.selectedIndex + delta));
          selectEl.selectedIndex = nextIndex;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          updateTrigger();
          renderOptions();
          const activeEl = menu.querySelector('.custom-select-item.active');
          if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
        }
      }
    });

    // Native select value / change listener
    selectEl.addEventListener('change', () => {
      updateTrigger();
      renderOptions();
    });

    // Intercept property setter for .value so script mutations sync automatically
    const protoDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (protoDesc && protoDesc.set) {
      const origSet = protoDesc.set;
      Object.defineProperty(selectEl, 'value', {
        get() {
          return protoDesc.get.call(selectEl);
        },
        set(newVal) {
          origSet.call(selectEl, newVal);
          updateTrigger();
          renderOptions();
        },
        configurable: true
      });
    }

    // Hide native select visually
    selectEl.style.display = 'none';

    // Mount into DOM
    selectEl.parentNode.insertBefore(wrap, selectEl);
    wrap.appendChild(selectEl);
    wrap.appendChild(trigger);
    wrap.appendChild(menu);

    updateTrigger();
    renderOptions();
  }
};

/**
 * Voice Stylist Controller (Web Speech API - SpeechRecognition & SpeechSynthesis)
 */
const VoiceStylist = {
  recognition: null,
  isListening: false,
  ttsEnabled: true,
  isSpeaking: false,
  activeSpeakerBtn: null,
  cachedVoices: [],
  keepAliveTimer: null,

  init() {
    this.setupRecognition();
    this.setupSynthesis();
    this.bindEvents();
  },

  setupRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'id-ID';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.ttsEnabled = true;
        App.wasVoiceTriggered = true;
        this.updateListeningUI(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const input = document.getElementById('chatTextInput');
        if (input) {
          input.value = transcript;
        }

        const textPreview = document.getElementById('voiceListeningText');
        if (textPreview && transcript) {
          textPreview.textContent = `"${transcript}"`;
        }

        // Auto-send when final sentence boundary reached
        if (event.results[0] && event.results[0].isFinal) {
          this.stopListening();
          if (App.isChatBusy) return;
          App.wasVoiceTriggered = true;
          setTimeout(() => {
            if (input && input.value.trim().length > 0 && !App.isChatBusy) {
              App.handleChatSubmit(true);
            }
          }, 350);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.stopListening();
        if (event.error === 'not-allowed') {
          App.showToast('Izin mikrofon diperlukan untuk Voice Stylist 🎙️');
        } else if (event.error !== 'no-speech') {
          App.showToast(`Voice input: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateListeningUI(false);
      };
    } else {
      console.log('Web SpeechRecognition not natively available in this browser');
    }
  },

  setupSynthesis() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
  },

  bindEvents() {
    const btnVoiceRecord = document.getElementById('btnVoiceRecord');
    const btnBigVoiceRecord = document.getElementById('btnBigVoiceRecord');
    const btnCancelVoice = document.getElementById('btnCancelVoice');
    const btnToggleTTS = document.getElementById('btnToggleTTS');
    const btnClearChat = document.getElementById('btnClearChatHistory');

    const handleToggle = () => {
      if (App.isChatBusy) {
        App.showToast('Mohon tunggu sebentar sampai Stylist selesai menjawab ya! ⏳');
        return;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      }
      if (this.isListening) {
        this.stopListening();
        const input = document.getElementById('chatTextInput');
        if (input && input.value.trim().length > 0 && !App.isChatBusy) {
          App.handleChatSubmit(true);
        }
      } else {
        this.startListening();
      }
    };

    btnVoiceRecord?.addEventListener('click', (e) => {
      e.preventDefault();
      handleToggle();
    });

    btnBigVoiceRecord?.addEventListener('click', (e) => {
      e.preventDefault();
      handleToggle();
    });

    btnCancelVoice?.addEventListener('click', (e) => {
      e.preventDefault();
      this.stopListening();
      const input = document.getElementById('chatTextInput');
      if (input) input.value = '';
    });

    btnToggleTTS?.addEventListener('click', () => {
      this.ttsEnabled = !this.ttsEnabled;
      btnToggleTTS.classList.toggle('active', this.ttsEnabled);
      const icon = document.getElementById('ttsIcon');
      const label = document.getElementById('ttsLabel');
      if (this.ttsEnabled) {
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Voice: ON';
        App.showToast('Suara Stylist diaktifkan 🔊');
      } else {
        if (icon) icon.textContent = '🔇';
        if (label) label.textContent = 'Voice: OFF';
        this.stopSpeaking();
        App.showToast('Suara Stylist dinonaktifkan 🔇');
      }
    });

    btnClearChat?.addEventListener('click', () => {
      App.chatHistory = [];
      const container = document.getElementById('chatMessagesArea');
      if (container) {
        container.innerHTML = `
          <div class="chat-row msg-ai">
            <div class="avatar-circle">✦</div>
            <div class="bubble-content">
              <div class="bubble-header-line">
                <p class="bubble-author">Personal Stylist AI</p>
                <button type="button" class="btn-speak-bubble" title="Dengarkan suara stylist">🔊</button>
              </div>
              <p>Halo! Saya asisten stylist pribadimu. Kamu bisa berbicara langsung menggunakan suara atau mengetik. Ceritakan rencana acaramu hari ini!</p>
              <div class="quick-chat-prompts">
                <button type="button" class="chat-pill-prompt highlight-voice-prompt">🎙️ "Hey, I need something for dinner tonight, but I don't want to wear jeans."</button>
                <button type="button" class="chat-pill-prompt">"Apa rekomendasi outfit terbaik untuk cuaca hari ini?"</button>
                <button type="button" class="chat-pill-prompt">"Tips outfit terbaik sesuai bentuk tubuh & tinggi saya"</button>
                <button type="button" class="chat-pill-prompt">"Ganti alas kakinya jadi clean white sneakers"</button>
                <button type="button" class="chat-pill-prompt">"Buat versi yang lebih santai untuk nongkrong"</button>
              </div>
            </div>
          </div>
        `;
        const speakBtn = container.querySelector('.btn-speak-bubble');
        if (speakBtn) {
          speakBtn.addEventListener('click', () => {
            this.speak('Halo! Saya asisten stylist pribadimu. Kamu bisa berbicara langsung menggunakan suara atau mengetik. Ceritakan rencana acaramu hari ini!');
          });
        }
      }
      this.stopSpeaking();
      App.showToast('Riwayat obrolan direset ✨');
    });
  },

  startListening() {
    if (App.isChatBusy) {
      App.showToast('Mohon tunggu sebentar sampai Stylist selesai menjawab ya! ⏳');
      return;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.resume(); } catch (e) {}
    }
    this.ttsEnabled = true;
    App.wasVoiceTriggered = true;

    const btnToggleTTS = document.getElementById('btnToggleTTS');
    if (btnToggleTTS) btnToggleTTS.classList.add('active');
    const icon = document.getElementById('ttsIcon');
    const label = document.getElementById('ttsLabel');
    if (icon) icon.textContent = '🔊';
    if (label) label.textContent = 'Voice: ON';

    if (!this.recognition) {
      App.showToast('🎤 Klik prompt suara di atas atau ketik langsung di kolom chat!');
      const input = document.getElementById('chatTextInput');
      if (input) {
        input.focus();
        input.placeholder = 'Katakan kebutuhanmu, misal: "Hey, I need something for dinner tonight..."';
      }
      return;
    }

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start warning:', e);
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.updateListeningUI(false);
  },

  updateListeningUI(listening) {
    const bar = document.getElementById('voiceListeningBar');
    const textPreview = document.getElementById('voiceListeningText');
    const btnVoiceRecord = document.getElementById('btnVoiceRecord');
    const btnBigVoice = document.getElementById('btnBigVoiceRecord');
    const statusLabel = document.getElementById('voiceStatusLabel');
    const statusPill = document.getElementById('voiceStatusPill');

    if (listening) {
      if (bar) bar.classList.remove('hidden');
      if (textPreview) textPreview.textContent = 'Mendengarkan suara Anda... Silakan berbicara';
      btnVoiceRecord?.classList.add('listening');
      btnBigVoice?.classList.add('listening');
      statusPill?.classList.add('is-recording');
      if (statusLabel) statusLabel.textContent = '🎙️ Listening...';
    } else {
      if (bar) bar.classList.add('hidden');
      btnVoiceRecord?.classList.remove('listening');
      btnBigVoice?.classList.remove('listening');
      statusPill?.classList.remove('is-recording');
      if (statusLabel) statusLabel.textContent = this.isSpeaking ? '🔊 Stylist Speaking...' : 'Voice Assistant Ready';
    }
  },

  speak(rawText, btnElement = null) {
    if (!('speechSynthesis' in window)) return;
    if (!this.ttsEnabled) return;

    // Reset any ongoing keepAlive timer
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }

    // Cancel currently speaking utterance if active
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    // Clean text from markdown bolding, hashtags, bullet points, and emojis for smooth TTS
    const cleanText = rawText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/[•✦✨❤️👗👟📸👀🎙️🔊🔇🍽️🛹🏛️☕]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    // Timeout prevents Chromium cancel race condition where cancel cancels the new utterance
    setTimeout(() => {
      try {
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        // Detect language for proper pronunciation
        const englishKeywords = ['dinner', 'tonight', 'hey', 'need', 'wear', 'jeans', 'shirt', 'dress', 'shoes', 'outfit', 'style'];
        const lower = cleanText.toLowerCase();
        const isEnglish = englishKeywords.some(w => lower.includes(w)) && !lower.includes('saya') && !lower.includes('kamu') && !lower.includes('baju');

        utterance.lang = isEnglish ? 'en-US' : 'id-ID';

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        if (isEnglish) {
          selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Zira')));
        } else {
          selectedVoice = voices.find(v => v.lang.startsWith('id') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Gadis') || v.name.includes('Indonesian') || v.name.includes('Andika')));
        }

        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith(isEnglish ? 'en' : 'id')) || voices.find(v => v.lang.startsWith('id')) || voices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        const statusLabel = document.getElementById('voiceStatusLabel');
        const statusPill = document.getElementById('voiceStatusPill');

        utterance.onstart = () => {
          this.isSpeaking = true;
          statusPill?.classList.add('is-speaking');
          if (statusLabel) statusLabel.textContent = '🔊 Stylist Speaking...';
          if (btnElement) btnElement.classList.add('speaking');
          this.activeSpeakerBtn = btnElement;

          // Prevent Chromium 15-second speech cutoff by pulsing resume
          this.keepAliveTimer = setInterval(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.resume();
            } else {
              clearInterval(this.keepAliveTimer);
              this.keepAliveTimer = null;
            }
          }, 8000);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
          }
          statusPill?.classList.remove('is-speaking');
          if (statusLabel) statusLabel.textContent = 'Voice Assistant Ready';
          if (this.activeSpeakerBtn) {
            this.activeSpeakerBtn.classList.remove('speaking');
            this.activeSpeakerBtn = null;
          }
        };

        utterance.onerror = (e) => {
          if (e.error !== 'canceled') {
            this.isSpeaking = false;
            if (this.keepAliveTimer) {
              clearInterval(this.keepAliveTimer);
              this.keepAliveTimer = null;
            }
            statusPill?.classList.remove('is-speaking');
            if (statusLabel) statusLabel.textContent = 'Voice Assistant Ready';
            if (this.activeSpeakerBtn) {
              this.activeSpeakerBtn.classList.remove('speaking');
              this.activeSpeakerBtn = null;
            }
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis speak error:', err);
      }
    }, 60);
  },

  stopSpeaking() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    const statusLabel = document.getElementById('voiceStatusLabel');
    const statusPill = document.getElementById('voiceStatusPill');
    statusPill?.classList.remove('is-speaking');
    if (statusLabel) statusLabel.textContent = 'Voice Assistant Ready';
    if (this.activeSpeakerBtn) {
      this.activeSpeakerBtn.classList.remove('speaking');
      this.activeSpeakerBtn = null;
    }
  }
};

// Expose App globally so other modules (WeatherService, etc.) can access it
window.App = App;

// Launch when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
