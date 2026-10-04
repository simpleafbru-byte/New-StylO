/**
 * Puzzle Board Module — Visual Outfit Builder with AI Harmony Analysis
 * Drag wardrobe items into puzzle slots, then let AI analyze the combination.
 */
const PuzzleBoard = {
  slots: {
    atasan: null,
    outerwear: null,
    bawahan: null,
    alasKaki: null,
    aksesori: null
  },
  wardrobeItems: [],
  analysisResult: null,
  isAnalyzing: false,

  // Slot metadata
  slotMeta: {
    atasan: { label: 'Top', icon: '👕', kategori: 'atasan' },
    outerwear: { label: 'Outerwear', icon: '🧥', kategori: 'outerwear' },
    bawahan: { label: 'Bottom', icon: '👖', kategori: 'bawahan' },
    alasKaki: { label: 'Shoes', icon: '👟', kategori: 'alasKaki' },
    aksesori: { label: 'Accessory', icon: '💍', kategori: 'aksesori' }
  },

  async init() {
    await this.loadWardrobe();
    this.renderPuzzleBoard();
    this.renderWardrobeTray();
    this.setupEventListeners();

    window.addEventListener('languageChanged', () => {
      this.renderPuzzleBoard();
      this.updateAnalyzeButton();
      if (this.analysisResult) {
        this.renderResults(this.analysisResult);
      }
    });
  },

  async loadWardrobe() {
    try {
      if (window.WardrobeManager && Array.isArray(WardrobeManager.items) && WardrobeManager.items.length > 0) {
        this.wardrobeItems = [...WardrobeManager.items];
        return;
      }
      let res = await fetch('/api/wardrobe');
      if (!res.ok) {
        res = await fetch('/api/wardrobe/usr_default');
      }
      if (res.ok) {
        this.wardrobeItems = await res.json();
      }
    } catch (e) {
      console.warn('[Puzzle] Could not load wardrobe:', e);
      if (window.WardrobeManager && Array.isArray(WardrobeManager.items)) {
        this.wardrobeItems = [...WardrobeManager.items];
      }
    }
  },

  renderPuzzleBoard() {
    const board = document.getElementById('puzzleBoardSlots');
    if (!board) return;

    board.innerHTML = Object.entries(this.slotMeta).map(([key, meta]) => {
      const item = this.slots[key];
      const filled = item !== null;
      return `
        <div class="puzzle-slot ${filled ? 'filled' : 'empty'}" 
             data-slot="${key}" 
             id="puzzleSlot_${key}">
          <div class="puzzle-slot-connector puzzle-conn-top"></div>
          <div class="puzzle-slot-connector puzzle-conn-bottom"></div>
          <div class="puzzle-slot-inner">
            ${filled ? `
              <div class="puzzle-item-filled">
                <span class="puzzle-item-color" style="background:${item.warnaHex || '#ccc'}"></span>
                <div class="puzzle-item-info">
                  <span class="puzzle-item-name">${item.nama}</span>
                  <span class="puzzle-item-detail">${item.warna}</span>
                </div>
                <button type="button" class="puzzle-remove-btn" data-slot="${key}" title="Remove">✕</button>
              </div>
            ` : `
              <div class="puzzle-slot-placeholder">
                <span class="puzzle-slot-icon">${meta.icon}</span>
                <span class="puzzle-slot-label">${meta.label}</span>
                <span class="puzzle-slot-hint">Drag item here</span>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Setup drop targets
    board.querySelectorAll('.puzzle-slot').forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const itemId = e.dataTransfer.getData('text/plain');
        const slotName = slot.dataset.slot;
        this.placeItem(slotName, itemId);
      });
    });

    // Remove buttons
    board.querySelectorAll('.puzzle-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeItem(btn.dataset.slot);
      });
    });

    this.updateAnalyzeButton();
  },

  renderWardrobeTray() {
    const tray = document.getElementById('puzzleWardrobeTray');
    if (!tray) return;

    const categories = {};
    this.wardrobeItems.forEach(item => {
      const cat = item.kategori || 'lainnya';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });

    // Check which items are already placed
    const placedIds = new Set(
      Object.values(this.slots).filter(Boolean).map(i => i.id)
    );

    const catLabels = {
      atasan: '👕 Tops',
      outerwear: '🧥 Outerwear',
      bawahan: '👖 Bottoms',
      alasKaki: '👟 Shoes',
      aksesori: '💍 Accessories'
    };

    let html = '';
    for (const [cat, items] of Object.entries(categories)) {
      html += `<div class="puzzle-tray-group">
        <span class="puzzle-tray-label">${catLabels[cat] || cat}</span>
        <div class="puzzle-tray-items">`;

      items.forEach(item => {
        const placed = placedIds.has(item.id);
        html += `
          <div class="puzzle-tray-item ${placed ? 'placed' : ''}" 
               draggable="${placed ? 'false' : 'true'}" 
               data-item-id="${item.id}"
               title="${item.nama} — ${item.warna}">
            <span class="tray-item-swatch" style="background:${item.warnaHex || '#ccc'}"></span>
            <span class="tray-item-name">${item.nama}</span>
            ${placed ? '<span class="tray-placed-badge">✓</span>' : ''}
          </div>
        `;
      });

      html += `</div></div>`;
    }

    if (this.wardrobeItems.length === 0) {
      html = `<div class="puzzle-tray-empty">
        <p>Lemari kosong. Tambahkan pakaian di tab Lemari Digital terlebih dahulu.</p>
      </div>`;
    }

    tray.innerHTML = html;

    // Setup drag sources
    tray.querySelectorAll('.puzzle-tray-item[draggable="true"]').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', el.dataset.itemId);
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
      });
    });
  },

  placeItem(slotName, itemId) {
    const item = this.wardrobeItems.find(i => i.id === itemId);
    if (!item) return;

    // Check if item category matches slot
    const slotKategori = this.slotMeta[slotName]?.kategori;
    if (item.kategori !== slotKategori) {
      if (window.App && window.App.showToast) {
        window.App.showToast(`⚠️ ${item.nama} tidak cocok untuk slot ${this.slotMeta[slotName]?.label}`);
      }
      return;
    }

    // Remove from previous slot if placed elsewhere
    for (const [key, val] of Object.entries(this.slots)) {
      if (val && val.id === itemId) {
        this.slots[key] = null;
      }
    }

    this.slots[slotName] = item;
    this.analysisResult = null;
    this.renderPuzzleBoard();
    this.renderWardrobeTray();
    this.hideResults();
  },

  removeItem(slotName) {
    this.slots[slotName] = null;
    this.analysisResult = null;
    this.renderPuzzleBoard();
    this.renderWardrobeTray();
    this.hideResults();
  },

  clearAll() {
    for (const key of Object.keys(this.slots)) {
      this.slots[key] = null;
    }
    this.analysisResult = null;
    this.renderPuzzleBoard();
    this.renderWardrobeTray();
    this.hideResults();
  },

  updateAnalyzeButton() {
    const btn = document.getElementById('btnAnalyzePuzzle');
    const filledCount = Object.values(this.slots).filter(Boolean).length;
    if (btn) {
      btn.disabled = filledCount < 2 || this.isAnalyzing;
      const countEl = document.getElementById('puzzleFilledCount');
      if (countEl) countEl.textContent = `${filledCount}/5 pieces`;
    }
  },

  async analyzePuzzle() {
    const filledCount = Object.values(this.slots).filter(Boolean).length;
    if (filledCount < 2) return;

    this.isAnalyzing = true;
    this.updateAnalyzeButton();
    this.showLoading(true);

    try {
      const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'id';
      const resp = await fetch('/api/puzzle/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: this.slots, lang })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Analysis failed');
      }

      this.analysisResult = await resp.json();
      this.renderResults(this.analysisResult);
    } catch (err) {
      console.error('[Puzzle] Analysis error:', err);
      if (window.App && window.App.showToast) {
        window.App.showToast(`❌ ${err.message}`);
      }
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzeButton();
      this.showLoading(false);
    }
  },

  renderResults(data) {
    const container = document.getElementById('puzzleResultsArea');
    if (!container || !data) return;

    const scoreColor = data.harmonyScore >= 80 ? '#10B981' : 
                       data.harmonyScore >= 60 ? '#D97706' : '#EF4444';

    let slotAnalysisHtml = '';
    if (data.slotAnalysis) {
      for (const [slot, analysis] of Object.entries(data.slotAnalysis)) {
        const meta = this.slotMeta[slot] || this.slotMeta[slot.toLowerCase()] || { icon: '👕', label: slot };
        const statusIcon = analysis.status === 'perfect' ? '✅' : 
                          analysis.status === 'good' ? '👌' : 
                          analysis.status === 'mismatch' ? '⚠️' : '⬜';
        slotAnalysisHtml += `
          <div class="puzzle-slot-result ${analysis.status}">
            <span class="slot-result-icon">${meta.icon} ${statusIcon}</span>
            <div class="slot-result-text">
              <strong>${meta.label}</strong>
              <p>${analysis.note}</p>
            </div>
          </div>
        `;
      }
    }

    let missingHtml = '';
    if (data.missingPieces && data.missingPieces.length > 0) {
      missingHtml = `
        <div class="puzzle-missing-section">
          <h4 class="puzzle-section-title">🧩 Missing Puzzle Pieces</h4>
          <div class="puzzle-missing-grid">
            ${data.missingPieces.map(mp => `
              <div class="puzzle-missing-card">
                <div class="missing-card-header">
                  <span class="missing-slot-badge">${mp.slot}</span>
                  ${mp.fromWardrobe ? '<span class="missing-from-closet">📦 From Your Closet</span>' : '<span class="missing-buy-new">🛍️ Buy New</span>'}
                </div>
                <h5 class="missing-item-name">${mp.suggestion}</h5>
                <p class="missing-item-reason">${mp.reason}</p>
                <span class="missing-color-hint">Color: ${mp.color}</span>
                ${mp.fromWardrobe ? `<p class="missing-wardrobe-match">→ Use: <strong>${mp.fromWardrobe}</strong></p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let tipsHtml = '';
    if (data.stylingTips && data.stylingTips.length > 0) {
      tipsHtml = `
        <div class="puzzle-tips-section">
          <h4 class="puzzle-section-title">💡 Styling Tips</h4>
          <ul class="puzzle-tips-list">
            ${data.stylingTips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="puzzle-results-card">
        <div class="puzzle-score-header">
          <div class="puzzle-score-gauge">
            <svg viewBox="0 0 120 120" class="score-ring">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="10"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="10"
                      stroke-dasharray="${(data.harmonyScore / 100) * 327} 327"
                      stroke-linecap="round" transform="rotate(-90 60 60)"
                      class="score-ring-fill"/>
            </svg>
            <div class="score-number">
              <span class="score-value">${data.harmonyScore}</span>
              <span class="score-label">Harmony</span>
            </div>
          </div>
          <div class="puzzle-verdict-info">
            <span class="puzzle-verdict-badge">${data.verdict}</span>
            <p class="puzzle-overall-comment">${data.overallComment || ''}</p>
            <div class="puzzle-sub-scores">
              <div class="sub-score">
                <span class="sub-label">🎨 Color</span>
                <span class="sub-val">${data.colorHarmony?.score || '—'}/100</span>
              </div>
              <div class="sub-score">
                <span class="sub-label">✨ Style</span>
                <span class="sub-val">${data.styleCoherence?.score || '—'}/100</span>
              </div>
            </div>
          </div>
        </div>

        <div class="puzzle-detail-sections">
          <div class="puzzle-slot-results">
            <h4 class="puzzle-section-title">🔍 Slot Analysis</h4>
            ${slotAnalysisHtml}
          </div>
          ${missingHtml}
          ${tipsHtml}
        </div>
      </div>
    `;

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  hideResults() {
    const container = document.getElementById('puzzleResultsArea');
    if (container) {
      container.classList.add('hidden');
      container.innerHTML = '';
    }
  },

  showLoading(show) {
    const loader = document.getElementById('puzzleLoadingOverlay');
    if (loader) {
      loader.classList.toggle('hidden', !show);
    }
  },

  setupEventListeners() {
    const btnAnalyze = document.getElementById('btnAnalyzePuzzle');
    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', () => this.analyzePuzzle());
    }

    const btnClear = document.getElementById('btnClearPuzzle');
    if (btnClear) {
      btnClear.addEventListener('click', () => this.clearAll());
    }
  }
};
