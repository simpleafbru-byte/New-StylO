/**
 * Wardrobe Manager Component for Padu Padan AI
 * Handles Lemari Digital CRUD and selection integration with AI Studio.
 */
const WardrobeManager = {
  items: [],
  selectedItemIds: new Set(),
  activeFilter: 'all',

  /**
   * Initialize wardrobe items from backend
   */
  async init() {
    await this.loadItems();
    this.setupEventListeners();
  },

  /**
   * Load items from API
   */
  async loadItems() {
    try {
      this.items = await API.getWardrobe('usr_default');
      this.renderGrid();
      this.renderTray();
      this.updateCounters();
    } catch (err) {
      console.error('Failed to load wardrobe items:', err);
    }
  },

  /**
   * Setup UI listeners for wardrobe
   */
  setupEventListeners() {
    // Filter chips (Lemari Digital)
    const filterChips = document.querySelectorAll('.clean-filter-tabs .filter-pill-btn, .wardrobe-filter-bar .filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter') || 'all';
        this.renderGrid();
      });
    });

    // Add Wardrobe Modal Trigger
    const btnOpenModal = document.getElementById('btnOpenAddWardrobeModal');
    const modal = document.getElementById('modalAddWardrobe');
    const btnCloseModal = document.getElementById('btnCloseAddWardrobe');
    const btnCancelModal = document.getElementById('btnCancelAddWardrobe');
    const formAdd = document.getElementById('formAddWardrobe');

    if (btnOpenModal && modal) {
      btnOpenModal.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (btnCancelModal && modal) {
      btnCancelModal.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // Add Item Form Submit
    if (formAdd) {
      formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('wardNama').value.trim();
        const kategori = document.getElementById('wardKategori').value;
        const warna = document.getElementById('wardWarna').value.trim();
        const tagInput = document.getElementById('wardTag').value.trim();
        const catatan = document.getElementById('wardCatatan').value.trim();

        if (!nama || !kategori || !warna) return;

        const tags = tagInput ? tagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];

        const newItem = {
          userId: 'usr_default',
          nama,
          kategori,
          warna,
          tag: tags,
          catatan
        };

        try {
          const created = await API.addWardrobeItem(newItem);
          this.items.push(created);
          this.renderGrid();
          this.renderTray();
          this.updateCounters();
          modal.classList.add('hidden');
          formAdd.reset();
          App.showToast(`Pakaian "${nama}" berhasil ditambahkan ke lemari!`);
        } catch (err) {
          alert('Gagal menambahkan pakaian: ' + err.message);
        }
      });
    }
  },

  /**
   * Render wardrobe items into the Wardrobe Tab grid
   */
  renderGrid() {
    const grid = document.getElementById('wardrobeGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const filtered = this.activeFilter === 'all' 
      ? this.items 
      : this.items.filter(item => item.kategori.toLowerCase() === this.activeFilter.toLowerCase());

    if (filtered.length === 0) {
      const isEn = window.I18n && I18n.currentLanguage === 'en';
      const emptyTitle = (window.I18n && I18n.t('wardrobe.empty_title')) || (isEn ? 'No garments in this category yet' : 'Belum ada pakaian di kategori ini');
      const emptyDesc = (window.I18n && I18n.t('wardrobe.empty_desc')) || (isEn ? 'Click "+ Add Garment" to add a new piece to your digital closet.' : 'Klik "+ Tambah Pakaian" untuk menambahkan koleksi baru ke lemari digital Anda.');
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #FAF9F7; border-radius: 16px; border: 1px dashed rgba(0,0,0,0.1); color: var(--text-medium);">
          <p style="font-size: 1rem; font-weight: 600; margin-bottom: 6px; color: var(--text-dark);">${emptyTitle}</p>
          <p style="font-size: 0.82rem; color: var(--text-light); margin: 0;">${emptyDesc}</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const isEn = window.I18n && I18n.currentLanguage === 'en';
      const card = document.createElement('div');
      card.className = 'wardrobe-card';

      const tagsHtml = (item.tag || []).map(t => `<span class="tag-pill">${t}</span>`).join('');

      card.innerHTML = `
        <div class="wardrobe-card-top">
          <span class="wardrobe-card-cat">${item.kategori}</span>
          <button class="btn-delete-item" data-delete-id="${item.id}" title="${isEn ? 'Remove from closet' : 'Hapus dari lemari'}" aria-label="Hapus pakaian">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
        <h4 class="wardrobe-card-name">${item.nama}</h4>
        <div class="wardrobe-card-meta">
          <span class="color-dot" style="background-color: ${item.warnaHex || '#888'}"></span>
          <span>${item.warna}</span>
        </div>
        <div class="wardrobe-card-tags">
          ${tagsHtml}
        </div>
      `;

      // Delete listener
      const deleteBtn = card.querySelector(`[data-delete-id="${item.id}"]`);
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          const isEnNow = window.I18n && I18n.currentLanguage === 'en';
          const confirmed = (window.App && typeof window.App.showConfirmModal === 'function')
            ? await window.App.showConfirmModal({
                title: isEnNow ? 'Delete Garment?' : 'Hapus Pakaian?',
                message: isEnNow ? `Are you sure you want to remove "${item.nama}" from your digital closet?` : `Apakah Anda yakin ingin menghapus "${item.nama}" dari koleksi lemari digital Anda?`,
                confirmText: isEnNow ? 'Delete Garment' : 'Hapus Pakaian',
                cancelText: isEnNow ? 'Cancel' : 'Batal',
                icon: '🗑️',
                isDanger: true
              })
            : confirm(isEnNow ? `Delete "${item.nama}" from digital closet?` : `Hapus "${item.nama}" dari lemari digital?`);

          if (confirmed) {
            try {
              await API.deleteWardrobeItem(item.id);
              this.items = this.items.filter(i => i.id !== item.id);
              this.selectedItemIds.delete(item.id);
              this.renderGrid();
              this.renderTray();
              this.updateCounters();
              App.showToast(isEnNow ? `Garment "${item.nama}" removed.` : `Pakaian "${item.nama}" dihapus.`);
            } catch (err) {
              if (window.App && typeof window.App.showToast === 'function') {
                window.App.showToast((isEnNow ? 'Failed to delete: ' : 'Gagal menghapus: ') + err.message);
              } else {
                alert((isEnNow ? 'Failed to delete: ' : 'Gagal menghapus: ') + err.message);
              }
            }
          }
        });
      }

      grid.appendChild(card);
    });
  },

  /**
   * Render quick picker tray in Studio form
   */
  renderTray() {
    const trayList = document.getElementById('trayItemsList');
    if (!trayList) return;

    trayList.innerHTML = '';
    const isEn = window.I18n && I18n.currentLanguage === 'en';
    if (this.items.length === 0) {
      trayList.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">${isEn ? 'Closet is empty' : 'Lemari masih kosong'}</span>`;
      return;
    }

    this.items.forEach(item => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `tray-item-pill ${this.selectedItemIds.has(item.id) ? 'selected' : ''}`;
      pill.innerHTML = `
        <span class="color-dot" style="background-color: ${item.warnaHex || '#ccc'}; width: 8px; height: 8px;"></span>
        <span>${item.nama}</span>
      `;

      pill.addEventListener('click', () => {
        if (this.selectedItemIds.has(item.id)) {
          this.selectedItemIds.delete(item.id);
          pill.classList.remove('selected');
        } else {
          this.selectedItemIds.add(item.id);
          pill.classList.add('selected');
        }
      });

      trayList.appendChild(pill);
    });
  },

  /**
   * Update all badge and filter counters
   */
  updateCounters() {
    const isEn = window.I18n && I18n.currentLanguage === 'en';
    const countBadge = document.getElementById('wardrobeCountBadge');
    if (countBadge) countBadge.textContent = this.items.length;

    const navCount = document.getElementById('navWardrobeCount');
    if (navCount) navCount.textContent = this.items.length;

    const countSync = document.getElementById('countWardrobeSync');
    if (countSync) countSync.textContent = isEn ? `${this.items.length} items available` : `${this.items.length} item tersedia`;

    const countInspo = document.getElementById('countSeeSomethingWardrobe');
    if (countInspo) countInspo.textContent = isEn ? `${this.items.length} garments` : `${this.items.length} pakaian`;

    const filterAll = document.getElementById('filterAllCount');
    if (filterAll) filterAll.textContent = this.items.length;

    const filterAtasan = document.getElementById('filterAtasanCount');
    if (filterAtasan) filterAtasan.textContent = this.items.filter(i => i.kategori === 'atasan').length;

    const filterOuter = document.getElementById('filterOuterCount');
    if (filterOuter) filterOuter.textContent = this.items.filter(i => i.kategori === 'outerwear').length;

    const filterBawahan = document.getElementById('filterBawahanCount');
    if (filterBawahan) filterBawahan.textContent = this.items.filter(i => i.kategori === 'bawahan').length;

    const filterSepatu = document.getElementById('filterSepatuCount');
    if (filterSepatu) filterSepatu.textContent = this.items.filter(i => i.kategori === 'alasKaki').length;

    const filterAksesori = document.getElementById('filterAksesoriCount');
    if (filterAksesori) filterAksesori.textContent = this.items.filter(i => i.kategori === 'aksesori').length;
  },

  /**
   * Get selected items object array for sending to AI
   */
  getSelectedItems() {
    return this.items.filter(item => this.selectedItemIds.has(item.id));
  }
};
