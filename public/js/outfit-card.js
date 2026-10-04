/**
 * Outfit Card Component & Renderer for Padu Padan AI
 */
const OutfitRenderer = {
  currentOutfitData: null,

  /**
   * Render the main visual board in Studio Stylist
   */
  renderMainOutfit(data) {
    if (!data) return;
    this.currentOutfitData = data;

    const outfit = data.outfit || {};
    const konteks = data.konteks || {};

    // Tags & Labels
    const resLookTag = document.getElementById('resLookTag');
    if (resLookTag) resLookTag.textContent = konteks.suasana || 'Custom Style';

    const resSourceTag = document.getElementById('resSourceTag');
    if (resSourceTag) {
      resSourceTag.textContent = data.isAIGenerated ? '✨ Gemini AI Stylist' : '✨ Curated AI Stylist';
    }

    // Title & Context
    const resJudulLook = document.getElementById('resJudulLook');
    if (resJudulLook) resJudulLook.textContent = outfit.judulLook || 'Curated Ensemble';

    const resAcara = document.getElementById('resAcara');
    if (resAcara) resAcara.textContent = konteks.acara || 'Acara Pilihan';

    const resCuaca = document.getElementById('resCuaca');
    if (resCuaca) resCuaca.textContent = konteks.cuaca || 'Cuaca Normal';

    // Favorite Button state
    const btnToggleFavorite = document.getElementById('btnToggleFavorite');
    if (btnToggleFavorite) {
      if (data.favorit) {
        btnToggleFavorite.classList.add('active');
        btnToggleFavorite.title = (window.I18n && I18n.currentLanguage === 'en') ? 'Saved in Favorites' : 'Tersimpan di Favorit';
      } else {
        btnToggleFavorite.classList.remove('active');
        btnToggleFavorite.title = (window.I18n && I18n.t('outfit.fav_title')) || 'Simpan ke Favorit';
      }
    }

    // Palette Swatches
    const resPaletWarna = document.getElementById('resPaletWarna');
    if (resPaletWarna) {
      resPaletWarna.innerHTML = '';
      const colors = outfit.paletWarna || [
        { nama: 'Pure White', hex: '#FFFFFF' },
        { nama: 'Mocha Sand', hex: '#B8977E' },
        { nama: 'Charcoal Grey', hex: '#2F3542' }
      ];

      colors.forEach(col => {
        const pill = document.createElement('div');
        pill.className = 'palette-color-pill';
        pill.title = `${col.nama} (${col.hex || ''}) - Klik untuk salin`;

        // Color dot circle
        const circle = document.createElement('span');
        circle.className = 'palette-color-circle';
        circle.style.backgroundColor = col.hex || '#ccc';

        // Color label
        const nameSpan = document.createElement('span');
        nameSpan.className = 'palette-color-name';
        nameSpan.textContent = col.nama;

        pill.appendChild(circle);
        pill.appendChild(nameSpan);

        // HEX badge
        if (col.hex) {
          const hexSpan = document.createElement('span');
          hexSpan.className = 'palette-color-hex';
          hexSpan.textContent = col.hex;
          pill.appendChild(hexSpan);
        }

        // Click to copy hex
        pill.addEventListener('click', () => {
          if (col.hex) {
            navigator.clipboard.writeText(col.hex).then(() => {
              if (window.App && App.showToast) {
                App.showToast(`Kode warna ${col.nama} (${col.hex}) disalin!`);
              }
            });
          }
        });

        resPaletWarna.appendChild(pill);
      });
    }

    // Pieces
    const resAtasan = document.getElementById('resAtasan');
    if (resAtasan) resAtasan.textContent = outfit.atasan || '-';

    const resOuterwearContainer = document.getElementById('resOuterwearContainer');
    const resOuterwear = document.getElementById('resOuterwear');
    if (resOuterwearContainer && resOuterwear) {
      if (outfit.outerwear && outfit.outerwear.trim().length > 0 && outfit.outerwear.toLowerCase() !== 'tidak ada' && outfit.outerwear.toLowerCase() !== 'none') {
        resOuterwearContainer.style.display = 'flex';
        resOuterwear.textContent = outfit.outerwear;
      } else {
        resOuterwearContainer.style.display = 'none';
      }
    }

    const resBawahan = document.getElementById('resBawahan');
    if (resBawahan) resBawahan.textContent = outfit.bawahan || '-';

    const resAlasKaki = document.getElementById('resAlasKaki');
    if (resAlasKaki) resAlasKaki.textContent = outfit.alasKaki || '-';

    // Accessories
    const resAksesori = document.getElementById('resAksesori');
    if (resAksesori) {
      resAksesori.innerHTML = '';
      const accList = Array.isArray(outfit.aksesori) ? outfit.aksesori : [outfit.aksesori || 'Jam tangan minimalis'];
      accList.forEach(acc => {
        if (!acc) return;
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.textContent = acc;
        resAksesori.appendChild(pill);
      });
    }

    // See Something I Like (Inspo Recreator Card)
    const resSeeSomethingCard = document.getElementById('resSeeSomethingCard');
    if (resSeeSomethingCard) {
      if (data.isSeeSomethingILike || data.closetChecklist) {
        resSeeSomethingCard.classList.remove('hidden');

        // Style detected
        const styleNameEl = document.getElementById('resInspoStyleName');
        if (styleNameEl) styleNameEl.textContent = data.styleDetected || 'Casual Streetwear';

        const matchBadgeEl = document.getElementById('resInspoMatchBadge');
        if (matchBadgeEl) matchBadgeEl.textContent = `${data.closetMatchScore || 85}% Closet Match`;

        const styleDescEl = document.getElementById('resInspoStyleDesc');
        if (styleDescEl) styleDescEl.textContent = data.styleDescription || 'Siluet outfit terdeteksi dan dipetakan dengan koleksi pakaian lemarimu.';

        const noteEl = document.getElementById('resInspoRecreationNote');
        if (noteEl) noteEl.textContent = `Koleksi di bawah ini adalah paduan terbaik dari lemarimu untuk merekayasa ulang gaya "${data.styleDetected || 'inspo'}" tersebut tanpa harus beli baru!`;

        // Render YOUR CLOSET Checklist
        const checklistContainer = document.getElementById('resClosetChecklistContainer');
        if (checklistContainer) {
          checklistContainer.innerHTML = '';
          const items = data.closetChecklist || [];
          items.forEach(item => {
            const row = document.createElement('div');
            row.className = `closet-check-row ${item.matched ? 'is-matched' : 'is-missing'}`;

            const isEn = window.I18n && I18n.currentLanguage === 'en';
            const icon = item.matched ? '✅' : '❌';
            const badgeClass = item.matched ? 'badge-match' : 'badge-missing';
            const badgeText = item.matched ? (isEn ? 'In Your Closet' : 'Tersedia di Lemari') : (isEn ? 'Missing from Closet' : 'Belum Ada di Lemari');

            row.innerHTML = `
              <div class="check-left-meta">
                <span class="check-status-icon">${icon}</span>
                <div class="check-text-group">
                  <div class="check-category-line">
                    <strong class="check-category">${item.category || 'Garment'}</strong>
                    <span class="check-status-pill ${badgeClass}">${badgeText}</span>
                    <span class="check-score-pill">${item.matchScore || (item.matched ? 90 : 35)}% Match</span>
                  </div>
                  <div class="check-spotted-line">
                    <span class="line-label">${isEn ? 'Inspo Photo:' : 'Foto Inspirasi:'}</span>
                    <span class="line-val">${item.spottedPiece || '-'}</span>
                  </div>
                  <div class="check-closet-line">
                    <span class="line-label">${isEn ? 'Your Closet Piece:' : 'Koleksi Lemarimu:'}</span>
                    <strong class="line-val ${item.matched ? 'text-highlight' : 'text-missing'}">${item.closetItem || (item.matched ? (isEn ? 'Available' : 'Tersedia') : (isEn ? 'None' : 'Tidak ada'))}</strong>
                  </div>
                  ${item.note ? `<p class="check-note">${item.note}</p>` : ''}
                </div>
              </div>
            `;
            checklistContainer.appendChild(row);
          });
        }
      } else {
        resSeeSomethingCard.classList.add('hidden');
      }
    }

    // Photo Evaluation Card (Multimodal FR-7)
    const resPhotoEvalCard = document.getElementById('resPhotoEvalCard');
    const resEvalProporsi = document.getElementById('resEvalProporsi');
    const resEvalUndertone = document.getElementById('resEvalUndertone');
    if (resPhotoEvalCard) {
      const proporsi = data.evaluasiFoto?.proporsiTubuh || data.evaluasiFoto?.analisisProporsi;
      const undertone = data.evaluasiFoto?.undertoneWarna || data.evaluasiFoto?.analisisUndertone;

      if (proporsi || undertone) {
        resPhotoEvalCard.classList.remove('hidden');
        if (resEvalProporsi) resEvalProporsi.textContent = proporsi || 'Proporsi siluet teranalisis dengan baik.';
        if (resEvalUndertone) resEvalUndertone.textContent = undertone || 'Rona kulit dan warna pelengkap telah disesuaikan.';
      } else {
        resPhotoEvalCard.classList.add('hidden');
      }
    }

    // Editorial Sections
    const resAlasanAI = document.getElementById('resAlasanAI');
    if (resAlasanAI) resAlasanAI.textContent = data.alasanAI || 'Kombinasi ini disusun untuk menciptakan tampilan proporsional dan harmonis.';

    const resTipsStyling = document.getElementById('resTipsStyling');
    if (resTipsStyling) resTipsStyling.textContent = data.tipsStyling || 'Sesuaikan aksesoris dengan kenyamanan Anda.';

    // Smart Wardrobe-Gap Shopping Section (Optional)
    this.renderShoppingRecommendation(data);
  },

  /**
   * Render Smart Wardrobe-Gap Shopping Recommendation (Optional Capsule Module)
   */
  renderShoppingRecommendation(data) {
    const moduleEl = document.getElementById('smartShoppingModule');
    if (!moduleEl) return;

    const shopping = data?.shoppingRecommendation;
    if (!shopping) {
      moduleEl.style.display = 'none';
      return;
    }

    moduleEl.style.display = 'block';

    // Populate missing piece header
    const missingNameEl = document.getElementById('resMissingItemName');
    const missingIconEl = document.getElementById('resShoppingIcon');
    if (missingNameEl) missingNameEl.textContent = shopping.missingItem || 'A lightweight black jacket';
    if (missingIconEl) missingIconEl.textContent = shopping.icon || '🧥';

    // Populate Wardrobe Synergy Card
    const quoteEl = document.getElementById('resSynergyQuote');
    const reasonEl = document.getElementById('resSynergyReason');
    const tagsEl = document.getElementById('resSynergyTags');

    if (quoteEl) {
      quoteEl.textContent = `“${shopping.wardrobeSynergyReason || (shopping.missingItem + ' would work with ' + (shopping.wardrobeSynergyCount || 7) + ' different outfits in your wardrobe.')}”`;
    }

    if (reasonEl) {
      reasonEl.textContent = shopping.alasanKebutuhan || 'Potongan ini dirancang melengkapi outfit saat ini sekaligus memaksimalkan koleksi pakaian yang sudah Anda miliki tanpa belanja berlebihan:';
    }

    if (tagsEl) {
      tagsEl.innerHTML = '';
      const compatible = shopping.compatibleWardrobeItems || [];
      if (compatible.length > 0) {
        compatible.forEach(itemName => {
          const tag = document.createElement('span');
          tag.className = 'synergy-tag';
          tag.textContent = `+ ${itemName}`;
          tagsEl.appendChild(tag);
        });
      } else {
        const defaultTag = document.createElement('span');
        defaultTag.className = 'synergy-tag';
        defaultTag.textContent = '+ Serasi dengan pakaian lemari Anda';
        tagsEl.appendChild(defaultTag);
      }
    }

    // Populate Curated Products Grid
    const gridEl = document.getElementById('resCuratedProductsGrid');
    if (gridEl) {
      gridEl.innerHTML = '';
      const items = shopping.curatedItems || [];
      const isEn = window.I18n && I18n.currentLanguage === 'en';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'curated-product-card';
        card.innerHTML = `
          <div class="product-card-top">
            <span class="product-brand-pill">${item.brand || 'Retail'}</span>
            <span class="product-badge-pill">${item.badge || 'Curated Match'}</span>
          </div>
          <div class="product-info-box">
            <h5 class="product-card-title">${item.nama}</h5>
            <div class="product-price-row">
              <span class="product-price">${item.estimasiHarga || (isEn ? 'Available' : 'Tersedia')}</span>
              <div class="product-color-preview">
                <span class="product-color-dot" style="background: ${item.warnaHex || '#333'}"></span>
                <span>${item.warna || ''}</span>
              </div>
            </div>
            <p class="product-reason-note">${item.alasanCocok || ''}</p>
          </div>
          <div class="product-card-actions">
            <a href="${item.link || '#'}" target="_blank" rel="noopener noreferrer" class="btn-card-primary-action">
              <span>${isEn ? '🔍 Search / Buy Online' : '🔍 Cari / Beli Online'}</span>
            </a>
            <div class="product-card-subactions">
              <button type="button" class="btn-card-subaction btn-locate-store" data-store="${item.queryStore || item.brand}">
                <span>${isEn ? '📍 Stores' : '📍 Toko'}</span>
              </button>
              <button type="button" class="btn-card-subaction btn-add-wardrobe-direct" 
                data-name="${item.nama.replace(/"/g, '&quot;')}" 
                data-kategori="${item.kategori || shopping.kategori || 'outerwear'}" 
                data-color="${item.warna || 'Netral'}" 
                data-hex="${item.warnaHex || '#C5A880'}">
                <span>${isEn ? '+ Closet' : '+ Lemari'}</span>
              </button>
            </div>
          </div>
        `;
        gridEl.appendChild(card);
      });
    }

    // Initialize toggle behavior
    this.initShoppingToggle();
  },

  /**
   * Initialize Collapsible Smart Shopping Capsule Toggle
   */
  initShoppingToggle() {
    const toggleBtn = document.getElementById('btnToggleShopping');
    const drawer = document.getElementById('shoppingDrawer');
    const header = document.getElementById('shoppingCapsuleHeader');
    const label = document.getElementById('shoppingToggleLabel');

    if (!toggleBtn || !drawer || toggleBtn.dataset.bound) return;
    toggleBtn.dataset.bound = 'true';

    const toggle = (e) => {
      e.stopPropagation();
      const isExpanded = drawer.style.display !== 'none';
      const isEn = window.I18n && I18n.currentLanguage === 'en';
      if (isExpanded) {
        drawer.style.display = 'none';
        toggleBtn.classList.remove('expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (label) label.textContent = isEn ? 'Shopping Picks' : 'Rekomendasi Belanja';
      } else {
        drawer.style.display = 'flex';
        toggleBtn.classList.add('expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (label) label.textContent = isEn ? 'Close' : 'Tutup';
      }
    };

    toggleBtn.addEventListener('click', toggle);
    if (header) {
      header.addEventListener('click', (e) => {
        if (!e.target.closest('#btnToggleShopping')) {
          toggle(e);
        }
      });
    }

    // Delegate "+ Lemari" and "📍 Toko" clicks inside grid
    const gridEl = document.getElementById('resCuratedProductsGrid');
    if (gridEl && !gridEl.dataset.bound) {
      gridEl.dataset.bound = 'true';
      gridEl.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('.btn-add-wardrobe-direct');
        if (addBtn) {
          const name = addBtn.getAttribute('data-name');
          const kat = addBtn.getAttribute('data-kategori');
          const color = addBtn.getAttribute('data-color');
          const hex = addBtn.getAttribute('data-hex');

          try {
            addBtn.disabled = true;
            addBtn.textContent = 'Menyimpan...';
            await API.addWardrobeItem({
              nama: name,
              kategori: kat,
              warna: color,
              warnaHex: hex,
              tag: ['smart-buy', 'capsule-essential'],
              catatan: 'Ditambahkan dari rekomendasi belanja AI'
            });

            if (typeof WardrobeManager !== 'undefined') {
              await WardrobeManager.init();
            }
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast(`✨ "${name}" disimpan ke Lemari Digital Anda!`);
            }
            addBtn.textContent = '✓ Tersimpan';
            addBtn.style.color = '#10B981';
            addBtn.style.borderColor = '#10B981';
          } catch (err) {
            addBtn.disabled = false;
            addBtn.textContent = '+ Lemari';
            alert('Gagal menambahkan ke lemari: ' + err.message);
          }
          return;
        }

        const storeBtn = e.target.closest('.btn-locate-store');
        if (storeBtn) {
          const storeQuery = storeBtn.getAttribute('data-store') || 'Uniqlo';
          if (typeof App !== 'undefined') {
            App.switchWorkspaceTab('stores');
            const storesEl = document.getElementById('stores-section');
            if (storesEl) storesEl.scrollIntoView({ behavior: 'smooth' });
            if (App.showToast) {
              App.showToast(`Mengarahkan ke peta toko terdekat: ${storeQuery} 📍`);
            }
          }
        }
      });
    }
  },

  /**
   * Format outfit as clean copyable text
   */
  getOutfitShareText(data) {
    if (!data) return '';
    const outfit = data.outfit || {};
    const konteks = data.konteks || {};

    let text = `✨ PADU PADAN AI: ${outfit.judulLook || 'Rekomendasi Outfit'}\n`;
    text += `🎯 Acara: ${konteks.acara || '-'}\n`;
    text += `🌤️ Cuaca: ${konteks.cuaca || '-'}\n\n`;
    if (data.evaluasiFoto) {
      const prop = data.evaluasiFoto.proporsiTubuh || data.evaluasiFoto.analisisProporsi;
      const under = data.evaluasiFoto.undertoneWarna || data.evaluasiFoto.analisisUndertone;
      if (prop) text += `📏 Proporsi: ${prop}\n`;
      if (under) text += `🎨 Undertone: ${under}\n\n`;
    }
    text += `👔 Atasan: ${outfit.atasan || '-'}\n`;
    if (outfit.outerwear) text += `🧥 Outerwear: ${outfit.outerwear}\n`;
    text += `👖 Bawahan: ${outfit.bawahan || '-'}\n`;
    text += `👟 Alas Kaki: ${outfit.alasKaki || '-'}\n`;
    if (outfit.aksesori && outfit.aksesori.length) {
      text += `💍 Aksesori: ${Array.isArray(outfit.aksesori) ? outfit.aksesori.join(', ') : outfit.aksesori}\n`;
    }
    text += `\n💡 Opini Stylist: ${data.alasanAI || '-'}\n`;
    text += `✂️ Tips Styling: ${data.tipsStyling || '-'}\n`;
    text += `\nGenerated via Padu Padan AI Studio`;
    return text;
  },

  /**
   * Render history list card item
   */
  createHistoryCard(rec, onSelect, onToggleFav, onDelete) {
    const outfit = rec.outfit || {};
    const konteks = rec.konteks || {};

    const card = document.createElement('div');
    card.className = 'history-card';

    const isEn = window.I18n && I18n.currentLanguage === 'en';
    const dateStr = rec.dibuatPada ? new Date(rec.dibuatPada).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : (isEn ? 'Just now' : 'Baru saja');

    const topLabel = (window.I18n && I18n.t('wardrobe.filter_tops')) || 'Atasan';
    const bottomLabel = (window.I18n && I18n.t('wardrobe.filter_bottoms')) || 'Bawahan';
    const shoesLabel = (window.I18n && I18n.t('wardrobe.filter_shoes')) || 'Sepatu';
    const viewStudioText = (window.I18n && I18n.t('history.view_in_studio')) || 'Lihat di Studio';

    card.innerHTML = `
      <div>
        <div class="history-card-header">
          <span class="badge-vibe">${konteks.suasana || 'Ensemble'}</span>
          <div class="card-action-group">
            <button class="round-action-btn ${rec.favorit ? 'active' : ''}" data-fav-id="${rec.id}" title="${rec.favorit ? (isEn ? 'Remove from Favorites' : 'Hapus dari Favorit') : (isEn ? 'Add to Favorites' : 'Tambah ke Favorit')}">
              <svg class="heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button class="round-action-btn btn-delete-history" data-del-id="${rec.id}" title="${isEn ? 'Delete this outfit from history' : 'Hapus outfit ini dari riwayat'}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
        <h3 class="history-card-title">${outfit.judulLook || 'Modern Ensemble'}</h3>
        <p class="history-card-context">${konteks.acara || 'Acara'} • ${dateStr}</p>
      </div>

      <div class="history-card-summary">
        <p><strong>${topLabel}:</strong> ${outfit.atasan || '-'}</p>
        <p><strong>${bottomLabel}:</strong> ${outfit.bawahan || '-'}</p>
        <p><strong>${shoesLabel}:</strong> ${outfit.alasKaki || '-'}</p>
      </div>

      <div class="history-card-actions">
        <div class="palette-swatches">
          ${(outfit.paletWarna || []).slice(0, 3).map(c => `
            <span class="color-dot" style="background-color: ${c.hex};" title="${c.nama}"></span>
          `).join('')}
        </div>
        <button class="btn-ghost-pill btn-apply-look" data-rec-id="${rec.id}">
          ${viewStudioText}
        </button>
      </div>
    `;

    // Attach events
    const favBtn = card.querySelector(`[data-fav-id="${rec.id}"]`);
    if (favBtn && onToggleFav) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newState = !rec.favorit;
        rec.favorit = newState;
        favBtn.classList.toggle('active', newState);
        favBtn.setAttribute('title', newState ? 'Hapus dari Favorit' : 'Tambah ke Favorit');
        onToggleFav(rec.id, newState);
      });
    }

    const delBtn = card.querySelector(`[data-del-id="${rec.id}"]`);
    if (delBtn && onDelete) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onDelete(rec);
      });
    }

    const applyBtn = card.querySelector('.btn-apply-look');
    if (applyBtn && onSelect) {
      applyBtn.addEventListener('click', () => {
        onSelect(rec);
      });
    }

    return card;
  }
};
