/**
 * Ruang Jepret - Main Application Logic
 * Implements camera stream handling, countdown, shutter,
 * 3/4 photo slot assignment, strip renderer integration, and pairing modal.
 */

(() => {
  'use strict';

  // State Management
  const state = {
    stream: null,
    devices: [],
    currentDeviceId: null,
    facingMode: 'user', // 'user' (front) or 'environment' (back)
    isMirrored: true,
    isCameraActive: false,
    filter: 'none',
    timerSeconds: 3,
    isCountingDown: false,
    soundEnabled: true,
    
    // Strip & Slots State
    stripFormat: 4, // 3 or 4 photos
    slots: [null, null, null, null], // array of length stripFormat holding dataURLs
    activeSlotIndex: 0,
    currentTheme: 'snapon',
    nameTagText: 'Ruang Jepret',

    // Session Raw Captures
    sessionPhotos: [], // array of { id, dataUrl, timestamp }

    // Pairing Mock Session
    pairingCode: 'RJ-8821'
  };

  // DOM Elements
  const DOM = {
    // Stage & Video
    stageWrapper: document.getElementById('stageWrapper'),
    cameraVideo: document.getElementById('cameraVideo'),
    stageWelcome: document.getElementById('stageWelcome'),
    stageErrorState: document.getElementById('stageErrorState'),
    errorStateTitle: document.getElementById('errorStateTitle'),
    errorStateMessage: document.getElementById('errorStateMessage'),
    stageGrid: document.getElementById('stageGrid'),
    stageFlash: document.getElementById('stageFlash'),
    stageCountdown: document.getElementById('stageCountdown'),
    countdownNum: document.getElementById('countdownNum'),
    welcomeJepSlot: document.getElementById('welcomeJepSlot'),
    errorJepSlot: document.getElementById('errorJepSlot'),
    mascotReactiveWidget: document.getElementById('mascotReactiveWidget'),

    // Topbar & Status
    globalStatusDot: document.getElementById('globalStatusDot'),
    globalStatusText: document.getElementById('globalStatusText'),
    hudStatusBadge: document.getElementById('hudStatusBadge'),
    hudStatusDot: document.getElementById('hudStatusDot'),
    hudStatusText: document.getElementById('hudStatusText'),
    hudRatioBadge: document.getElementById('hudRatioBadge'),
    btnSoundToggle: document.getElementById('btnSoundToggle'),
    soundIconOn: document.getElementById('soundIconOn'),
    soundIconOff: document.getElementById('soundIconOff'),
    soundLabelText: document.getElementById('soundLabelText'),
    btnOpenPairing: document.getElementById('btnOpenPairing'),

    // Controls
    btnStartCamera: document.getElementById('btnStartCamera'),
    btnRetryCamera: document.getElementById('btnRetryCamera'),
    cameraSelect: document.getElementById('cameraSelect'),
    btnFlipCamera: document.getElementById('btnFlipCamera'),
    timerSelect: document.getElementById('timerSelect'),
    btnToggleGrid: document.getElementById('btnToggleGrid'),
    filterSelect: document.getElementById('filterSelect'),
    btnShutter: document.getElementById('btnShutter'),
    shutterBtnLabel: document.getElementById('shutterBtnLabel'),
    shutterHintTitle: document.getElementById('shutterHintTitle'),
    shutterHintSub: document.getElementById('shutterHintSub'),

    // Strip Planning & Slots
    btnFormat3: document.getElementById('btnFormat3'),
    btnFormat4: document.getElementById('btnFormat4'),
    slotsGridContainer: document.getElementById('slotsGridContainer'),

    // Strip Preview & Customizer
    stripReadyBadge: document.getElementById('stripReadyBadge'),
    themeChips: document.querySelectorAll('.btn-theme-chip'),
    nameTagInput: document.getElementById('nameTagInput'),
    stripPreviewImg: document.getElementById('stripPreviewImg'),
    btnDownloadStrip: document.getElementById('btnDownloadStrip'),

    // Gallery
    sessionGalleryGrid: document.getElementById('sessionGalleryGrid'),
    galleryEmptyNotice: document.getElementById('galleryEmptyNotice'),
    galleryCountTag: document.getElementById('galleryCountTag'),

    // Pairing Modal
    pairingModal: document.getElementById('pairingModal'),
    btnClosePairing: document.getElementById('btnClosePairing'),
    pairingCodePill: document.getElementById('pairingCodePill'),
    btnCopyPairingLink: document.getElementById('btnCopyPairingLink'),
    btnRefreshPairingCode: document.getElementById('btnRefreshPairingCode'),

    // Toast
    toastNotice: document.getElementById('toastNotice')
  };

  const stripRenderer = new StripRenderer();

  /* --------------------------------------------------------------------------
     Web Audio Sound Generator (Zero external assets needed)
     -------------------------------------------------------------------------- */
  const SoundFX = {
    ctx: null,

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },

    playBeep(freq = 600, duration = 0.08) {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },

    playShutterSnap() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        // Short white noise burst followed by a low mechanical pop
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }
  };

  /* --------------------------------------------------------------------------
     Toast Notification Helper
     -------------------------------------------------------------------------- */
  function showToast(message, duration = 3000) {
    if (!DOM.toastNotice) return;
    DOM.toastNotice.textContent = message;
    DOM.toastNotice.classList.add('visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      DOM.toastNotice.classList.remove('visible');
    }, duration);
  }

  /* --------------------------------------------------------------------------
     Camera Lifecycle & Hardware Access
     -------------------------------------------------------------------------- */
  async function initCamera(preferredDeviceId = null) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      handleCameraError(new Error('Browser ini belum mendukung akses kamera navigator.mediaDevices.'));
      return false;
    }

    try {
      // Release existing tracks first
      stopCameraTracks();

      const videoConstraints = preferredDeviceId
        ? { deviceId: { exact: preferredDeviceId } }
        : {
            facingMode: { ideal: state.facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1440 }
          };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: videoConstraints
      });

      state.stream = stream;
      DOM.cameraVideo.srcObject = stream;
      await DOM.cameraVideo.play();

      state.isCameraActive = true;
      state.isMirrored = (state.facingMode === 'user');

      // Update Viewfinder DOM
      DOM.cameraVideo.classList.add('active');
      DOM.cameraVideo.classList.toggle('unmirrored', !state.isMirrored);
      DOM.stageWelcome.hidden = true;
      DOM.stageErrorState.classList.remove('visible');

      // Update Controls State
      DOM.btnShutter.disabled = false;
      DOM.btnFlipCamera.disabled = false;
      DOM.cameraSelect.disabled = false;

      // Update Statuses
      updateCameraStatus(true);
      applyFilter(state.filter);

      // Enumerate available devices
      await enumerateVideoDevices();

      // Update Jep Mascot
      JepMascot.updateMascotEl(DOM.mascotReactiveWidget, 'ready', 'Kamera aktif! Tahan pose terbaikmu, lalu klik jepret.');
      showToast('Kamera berhasil dinyalakan!');
      return true;

    } catch (err) {
      handleCameraError(err);
      return false;
    }
  }

  function stopCameraTracks() {
    if (state.stream) {
      state.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      state.stream = null;
    }
    if (DOM.cameraVideo) {
      DOM.cameraVideo.srcObject = null;
      DOM.cameraVideo.classList.remove('active');
    }
    state.isCameraActive = false;
    updateCameraStatus(false);
  }

  function handleCameraError(err) {
    stopCameraTracks();
    let title = 'Kamera Belum Dapat Diakses';
    let message = 'Pastikan kamera tidak sedang dipakai oleh aplikasi lain dan browser memiliki izin akses.';

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      title = 'Izin Kamera Ditolak';
      message = 'Akses kamera ditolak oleh browser. Klik ikon gembok di sebelah kiri bilah URL browser Anda, pilih "Izinkan Kamera", lalu klik tombol Coba Lagi di bawah.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      title = 'Perangkat Kamera Tidak Ditemukan';
      message = 'Kamera tidak terdeteksi pada perangkat ini. Silakan pasang webcam atau gunakan fitur "Hubungkan HP" untuk menjadikan ponsel sebagai kamera.';
    } else if (!window.isSecureContext) {
      title = 'Koneksi Memerlukan HTTPS';
      message = 'Browser membatasi akses kamera hanya pada HTTPS atau localhost. Pastikan membuka website ini melalui koneksi aman.';
    }

    DOM.errorStateTitle.textContent = title;
    DOM.errorStateMessage.textContent = message;
    DOM.stageWelcome.hidden = true;
    DOM.stageErrorState.classList.add('visible');

    // Mascot reaction
    JepMascot.updateMascotEl(DOM.errorJepSlot, 'error');
    JepMascot.updateMascotEl(DOM.mascotReactiveWidget, 'error', message);

    DOM.btnShutter.disabled = true;
    showToast(title);
  }

  async function enumerateVideoDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      state.devices = devices.filter(d => d.kind === 'videoinput');

      DOM.cameraSelect.innerHTML = '';
      if (state.devices.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Kamera Utama';
        DOM.cameraSelect.appendChild(opt);
      } else {
        state.devices.forEach((device, idx) => {
          const opt = document.createElement('option');
          opt.value = device.deviceId;
          opt.textContent = device.label || `Kamera ${idx + 1}`;
          DOM.cameraSelect.appendChild(opt);
        });

        // Match current active track's deviceId if available
        const currentTrack = state.stream?.getVideoTracks()[0];
        const currentSettings = currentTrack?.getSettings?.();
        if (currentSettings?.deviceId) {
          DOM.cameraSelect.value = currentSettings.deviceId;
          state.currentDeviceId = currentSettings.deviceId;
        }
      }

      DOM.btnFlipCamera.disabled = (state.devices.length < 2 && !state.facingMode);
    } catch (e) {
      console.warn('Device enumeration error:', e);
    }
  }

  function updateCameraStatus(isActive) {
    if (isActive) {
      DOM.globalStatusDot.classList.add('active');
      DOM.globalStatusText.textContent = 'Kamera Aktif';
      DOM.hudStatusDot.classList.add('active');
      DOM.hudStatusText.textContent = 'LIVE';
      DOM.shutterBtnLabel.textContent = 'Jepret Foto';
      updateShutterHint();
    } else {
      DOM.globalStatusDot.classList.remove('active');
      DOM.globalStatusText.textContent = 'Kamera Nonaktif';
      DOM.hudStatusDot.classList.remove('active');
      DOM.hudStatusText.textContent = 'STANDBY';
      DOM.btnShutter.disabled = true;
      DOM.shutterHintTitle.textContent = 'Kamera Belum Dinyalakan';
      DOM.shutterHintSub.textContent = 'Klik tombol Nyalakan Kamera untuk memulai sesi foto.';
    }
  }

  /* --------------------------------------------------------------------------
     Shutter & Countdown Flow
     -------------------------------------------------------------------------- */
  async function triggerShutter() {
    if (!state.isCameraActive) {
      await initCamera();
      return;
    }
    if (state.isCountingDown) return;

    // Check if slots are completely filled
    const filledCount = state.slots.filter(Boolean).length;
    if (filledCount >= state.stripFormat && state.activeSlotIndex >= state.stripFormat) {
      showToast('Semua slot strip sudah penuh! Anda bisa mengulangi slot foto mana pun.');
      // Auto-target the first slot for replacement if user clicks again
      state.activeSlotIndex = 0;
      renderSlotsGrid();
    }

    state.isCountingDown = true;
    DOM.btnShutter.disabled = true;

    // Countdown sequence
    const seconds = state.timerSeconds;
    if (seconds > 0) {
      DOM.stageCountdown.classList.add('active');
      JepMascot.updateMascotEl(DOM.mascotReactiveWidget, 'countdown', '3... 2... 1... Tahan pose terbaikmu!');

      for (let i = seconds; i > 0; i--) {
        DOM.countdownNum.textContent = i;
        SoundFX.playBeep(440 + (seconds - i) * 120, 0.08);
        await new Promise(r => setTimeout(r, 850));
      }
      DOM.stageCountdown.classList.remove('active');
    }

    // Capture Frame
    captureCurrentFrame();
    state.isCountingDown = false;
    DOM.btnShutter.disabled = false;
  }

  function captureCurrentFrame() {
    if (!DOM.cameraVideo || !DOM.cameraVideo.videoWidth) return;

    // Flash animation and sound
    SoundFX.playShutterSnap();
    DOM.stageFlash.classList.remove('firing');
    void DOM.stageFlash.offsetWidth; // trigger reflow
    DOM.stageFlash.classList.add('firing');

    // Create offscreen canvas for snapshot
    const vw = DOM.cameraVideo.videoWidth;
    const vh = DOM.cameraVideo.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');

    // Handle horizontal mirroring
    if (state.isMirrored) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }

    // Draw video frame
    ctx.drawImage(DOM.cameraVideo, 0, 0, vw, vh);

    const snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.94);

    // Save to temporary session gallery
    const captureObj = {
      id: 'photo-' + Date.now(),
      dataUrl: snapshotDataUrl,
      timestamp: new Date().toLocaleTimeString()
    };
    state.sessionPhotos.unshift(captureObj);
    renderSessionGallery();

    // Assign to active slot
    const targetSlot = state.activeSlotIndex < state.stripFormat ? state.activeSlotIndex : getFirstEmptySlot();
    state.slots[targetSlot] = snapshotDataUrl;

    // Advance active slot index
    state.activeSlotIndex = (targetSlot + 1) % state.stripFormat;

    // Refresh UI
    renderSlotsGrid();
    updateShutterHint();
    updateStripPreview();

    // Mascot celebration
    JepMascot.updateMascotEl(
      DOM.mascotReactiveWidget,
      'success',
      `Jepret berhasil di Slot ${targetSlot + 1}! Cakep banget!`
    );
    showToast(`Foto disimpan ke Slot ${targetSlot + 1}`);
  }

  function getFirstEmptySlot() {
    const idx = state.slots.findIndex(s => s === null);
    return idx !== -1 ? idx : 0;
  }

  function updateShutterHint() {
    const filledCount = state.slots.filter(Boolean).length;
    const total = state.stripFormat;

    if (filledCount === total) {
      DOM.shutterHintTitle.textContent = `Strip ${total} Foto Lengkap!`;
      DOM.shutterHintSub.textContent = 'Siap diunduh. Anda bisa mengulang slot foto jika diinginkan.';
    } else {
      const nextSlot = (state.activeSlotIndex < total) ? state.activeSlotIndex + 1 : getFirstEmptySlot() + 1;
      DOM.shutterHintTitle.textContent = `Mengambil Foto untuk Slot ${nextSlot} dari ${total}`;
      DOM.shutterHintSub.textContent = `Tersisa ${total - filledCount} slot foto kosong.`;
    }
  }

  /* --------------------------------------------------------------------------
     Filter & Visual Adjustments
     -------------------------------------------------------------------------- */
  function applyFilter(filterName) {
    state.filter = filterName;
    DOM.stageWrapper.classList.remove('filter-warm', 'filter-mono', 'filter-cool');
    if (filterName !== 'none') {
      DOM.stageWrapper.classList.add('filter-' + filterName);
    }
    updateStripPreview();
  }

  /* --------------------------------------------------------------------------
     Slots Planner UI (3 Foto vs 4 Foto)
     -------------------------------------------------------------------------- */
  function setStripFormat(format) {
    if (format !== 3 && format !== 4) return;
    state.stripFormat = format;

    // Resize slots array preserving existing items
    const newSlots = [];
    for (let i = 0; i < format; i++) {
      newSlots[i] = state.slots[i] || null;
    }
    state.slots = newSlots;

    if (state.activeSlotIndex >= format) {
      state.activeSlotIndex = 0;
    }

    // Toggle active segment buttons
    DOM.btnFormat3.classList.toggle('active', format === 3);
    DOM.btnFormat3.setAttribute('aria-pressed', format === 3);
    DOM.btnFormat4.classList.toggle('active', format === 4);
    DOM.btnFormat4.setAttribute('aria-pressed', format === 4);

    renderSlotsGrid();
    updateShutterHint();
    updateStripPreview();

    showToast(`Format diubah ke ${format} Foto`);
  }

  function renderSlotsGrid() {
    DOM.slotsGridContainer.innerHTML = '';
    DOM.slotsGridContainer.style.gridTemplateColumns = `repeat(${state.stripFormat}, 1fr)`;

    for (let i = 0; i < state.stripFormat; i++) {
      const photo = state.slots[i];
      const slotEl = document.createElement('div');
      slotEl.className = 'slot-item' + (photo ? ' filled' : '') + (state.activeSlotIndex === i ? ' active-target' : '');
      slotEl.setAttribute('role', 'button');
      slotEl.setAttribute('tabindex', '0');
      slotEl.setAttribute('aria-label', `Slot Foto ${i + 1} (${photo ? 'Terisi' : 'Kosong'})`);

      // Slot Badge Number
      const badge = document.createElement('span');
      badge.className = 'slot-badge-num';
      badge.textContent = i + 1;
      slotEl.appendChild(badge);

      if (photo) {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `Foto Slot ${i + 1}`;
        slotEl.appendChild(img);

        // Hover / Focus Action buttons (Ulangi & Hapus)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'slot-actions';

        const btnRetake = document.createElement('button');
        btnRetake.type = 'button';
        btnRetake.className = 'btn-slot-action retake';
        btnRetake.textContent = 'Ulangi';
        btnRetake.onclick = (e) => {
          e.stopPropagation();
          state.activeSlotIndex = i;
          renderSlotsGrid();
          updateShutterHint();
          showToast(`Target kamera diset ke Slot ${i + 1}`);
        };

        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn-slot-action delete';
        btnDelete.textContent = 'Hapus';
        btnDelete.onclick = (e) => {
          e.stopPropagation();
          state.slots[i] = null;
          state.activeSlotIndex = i;
          renderSlotsGrid();
          updateShutterHint();
          updateStripPreview();
          showToast(`Foto di Slot ${i + 1} dihapus`);
        };

        actionsDiv.appendChild(btnRetake);
        actionsDiv.appendChild(btnDelete);
        slotEl.appendChild(actionsDiv);
      } else {
        const p = document.createElement('span');
        p.className = 'slot-placeholder-text';
        p.textContent = `+ Slot ${i + 1}`;
        slotEl.appendChild(p);
      }

      // Slot Click targets this slot
      slotEl.onclick = () => {
        state.activeSlotIndex = i;
        renderSlotsGrid();
        updateShutterHint();
      };

      slotEl.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          state.activeSlotIndex = i;
          renderSlotsGrid();
          updateShutterHint();
        }
      };

      DOM.slotsGridContainer.appendChild(slotEl);
    }
  }

  /* --------------------------------------------------------------------------
     Strip Preview & High-Res Download
     -------------------------------------------------------------------------- */
  let renderPreviewDebounce = null;

  async function updateStripPreview() {
    clearTimeout(renderPreviewDebounce);
    renderPreviewDebounce = setTimeout(async () => {
      const filledCount = state.slots.filter(Boolean).length;
      const total = state.stripFormat;

      DOM.stripReadyBadge.textContent = `${filledCount} / ${total} Terisi`;
      DOM.stripReadyBadge.classList.toggle('ready', filledCount === total);
      DOM.btnDownloadStrip.disabled = (filledCount === 0);

      try {
        const canvas = await stripRenderer.render({
          photos: state.slots,
          frameCount: state.stripFormat,
          themeId: state.currentTheme,
          userName: state.nameTagText,
          filter: state.filter
        });

        DOM.stripPreviewImg.src = canvas.toDataURL('image/jpeg', 0.92);
      } catch (err) {
        console.error('Failed to render strip preview:', err);
      }
    }, 120);
  }

  async function downloadFinalStrip() {
    const filledCount = state.slots.filter(Boolean).length;
    if (filledCount === 0) {
      showToast('Belum ada foto yang diambil untuk strip.');
      return;
    }

    try {
      showToast('Menyiapkan gambar resolusi tinggi...');
      const canvas = await stripRenderer.render({
        photos: state.slots,
        frameCount: state.stripFormat,
        themeId: state.currentTheme,
        userName: state.nameTagText,
        filter: state.filter
      });

      const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `ruang-jepret-${state.currentTheme}-${state.stripFormat}foto-${dateStr}.jpg`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.96);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Strip foto berhasil diunduh!');
    } catch (e) {
      showToast('Gagal mengunduh strip foto: ' + e.message);
    }
  }

  /* --------------------------------------------------------------------------
     Session Gallery Management
     -------------------------------------------------------------------------- */
  function renderSessionGallery() {
    DOM.sessionGalleryGrid.innerHTML = '';
    const photos = state.sessionPhotos;
    DOM.galleryCountTag.textContent = `${photos.length} Foto`;

    if (photos.length === 0) {
      DOM.sessionGalleryGrid.appendChild(DOM.galleryEmptyNotice);
      return;
    }

    photos.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-thumb-card';
      card.title = `Foto diambil ${item.timestamp}`;

      const img = document.createElement('img');
      img.src = item.dataUrl;
      img.alt = `Foto Sesi ${item.timestamp}`;

      // Delete action button
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'thumb-del-btn';
      delBtn.setAttribute('aria-label', 'Hapus foto dari sesi');
      delBtn.innerHTML = '×';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        state.sessionPhotos = state.sessionPhotos.filter(p => p.id !== item.id);
        renderSessionGallery();
      };

      // Click thumbnail to assign to active slot
      card.onclick = () => {
        state.slots[state.activeSlotIndex] = item.dataUrl;
        renderSlotsGrid();
        updateStripPreview();
        showToast(`Foto dipasang ke Slot ${state.activeSlotIndex + 1}`);
      };

      card.appendChild(img);
      card.appendChild(delBtn);
      DOM.sessionGalleryGrid.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     Remote Phone Camera Pairing Architecture (Modular Interface)
     -------------------------------------------------------------------------- */
  const RemoteCameraPairing = {
    generateCode() {
      const num = Math.floor(1000 + Math.random() * 9000);
      state.pairingCode = `RJ-${num}`;
      DOM.pairingCodePill.textContent = state.pairingCode;
    },

    openModal() {
      this.generateCode();
      DOM.pairingModal.classList.add('open');
    },

    closeModal() {
      DOM.pairingModal.classList.remove('open');
    },

    copyLink() {
      const url = `${window.location.origin}${window.location.pathname}#session=${state.pairingCode}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => showToast('Tautan pairing disalin!'))
          .catch(() => showToast('Tautan: ' + url));
      } else {
        showToast('Tautan pairing: ' + url);
      }
    }
  };

  /* --------------------------------------------------------------------------
     Event Listeners & Initialization
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Explicit Camera Activation
    DOM.btnStartCamera?.addEventListener('click', () => initCamera());
    DOM.btnRetryCamera?.addEventListener('click', () => initCamera());

    // Shutter Trigger
    DOM.btnShutter?.addEventListener('click', triggerShutter);

    // Camera Switch / Flip
    DOM.btnFlipCamera?.addEventListener('click', async () => {
      if (state.devices.length > 1) {
        const curIdx = state.devices.findIndex(d => d.deviceId === DOM.cameraSelect.value);
        const nextDevice = state.devices[(curIdx + 1) % state.devices.length];
        await initCamera(nextDevice.deviceId);
      } else {
        state.facingMode = (state.facingMode === 'user') ? 'environment' : 'user';
        await initCamera();
      }
    });

    DOM.cameraSelect?.addEventListener('change', (e) => {
      if (e.target.value) {
        initCamera(e.target.value);
      }
    });

    // Timer Selector
    DOM.timerSelect?.addEventListener('change', (e) => {
      state.timerSeconds = parseInt(e.target.value, 10) || 0;
      showToast(`Timer diset ke ${state.timerSeconds} detik`);
    });

    // Grid Toggle
    DOM.btnToggleGrid?.addEventListener('click', () => {
      const isVisible = DOM.stageGrid.classList.toggle('visible');
      DOM.btnToggleGrid.classList.toggle('active', isVisible);
      DOM.btnToggleGrid.setAttribute('aria-pressed', isVisible);
    });

    // Filter Selector
    DOM.filterSelect?.addEventListener('change', (e) => {
      applyFilter(e.target.value);
      showToast(`Filter: ${e.target.options[e.target.selectedIndex].text}`);
    });

    // 3 vs 4 Format Buttons
    DOM.btnFormat3?.addEventListener('click', () => setStripFormat(3));
    DOM.btnFormat4?.addEventListener('click', () => setStripFormat(4));

    // Theme Chips
    DOM.themeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.themeChips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-checked', 'true');
        state.currentTheme = chip.getAttribute('data-theme');
        updateStripPreview();
      });
    });

    // Name Tag Input
    DOM.nameTagInput?.addEventListener('input', (e) => {
      state.nameTagText = e.target.value;
      updateStripPreview();
    });

    // Download Strip
    DOM.btnDownloadStrip?.addEventListener('click', downloadFinalStrip);

    // Sound Toggle
    DOM.btnSoundToggle?.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      DOM.soundIconOn.style.display = state.soundEnabled ? 'block' : 'none';
      DOM.soundIconOff.style.display = state.soundEnabled ? 'none' : 'block';
      DOM.soundLabelText.textContent = state.soundEnabled ? 'Suara' : 'Bisu';
      showToast(state.soundEnabled ? 'Suara diaktifkan' : 'Suara dimatikan');
    });

    // Pairing Modal
    DOM.btnOpenPairing?.addEventListener('click', () => RemoteCameraPairing.openModal());
    DOM.btnClosePairing?.addEventListener('click', () => RemoteCameraPairing.closeModal());
    DOM.pairingModal?.addEventListener('click', (e) => {
      if (e.target === DOM.pairingModal) RemoteCameraPairing.closeModal();
    });
    DOM.btnCopyPairingLink?.addEventListener('click', () => RemoteCameraPairing.copyLink());
    DOM.btnRefreshPairingCode?.addEventListener('click', () => {
      RemoteCameraPairing.generateCode();
      showToast('Kode sesi baru diperbarui');
    });

    // Keyboard Shortcuts (Space for shutter if camera active, Escape for modal)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && state.isCameraActive && !state.isCountingDown && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        triggerShutter();
      } else if (e.key === 'Escape' && DOM.pairingModal.classList.contains('open')) {
        RemoteCameraPairing.closeModal();
      }
    });

    // Clean up tracks when navigating away or closing window
    window.addEventListener('pagehide', stopCameraTracks);
    window.addEventListener('beforeunload', stopCameraTracks);
  }

  // Initial App Mount
  function init() {
    // Render initial Mascot Jep in welcome slot & speech widget
    JepMascot.updateMascotEl(DOM.welcomeJepSlot, 'idle');
    JepMascot.updateMascotEl(DOM.mascotReactiveWidget, 'idle');

    // Build initial slot grid for 4-photo default
    renderSlotsGrid();

    // Initial strip render
    updateStripPreview();

    // Attach all event handlers
    setupEventListeners();

    // Secure context check notice
    if (!window.isSecureContext) {
      showToast('Perhatian: Gunakan HTTPS atau localhost untuk akses kamera browser.', 5000);
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
