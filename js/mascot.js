/**
 * Mascot Jep - Ruang Jepret
 * Pocket camera character with tiny legs and an expressive lens face.
 * Visual design follows DESIGN.md: Cream, Ink, Tomato, Butter Yellow.
 */

const JepMascot = {
  states: {
    idle: {
      expression: 'happy',
      armLeft: 'wave',
      armRight: 'hip',
      speech: 'Yuk senyum! Siap berfoto?',
      badge: 'Pose santai'
    },
    ready: {
      expression: 'sparkle',
      armLeft: 'thumbsUp',
      armRight: 'hip',
      speech: 'Kamera aktif! Pilih filter atau langsung jepret.',
      badge: 'Kamera Siap'
    },
    countdown: {
      expression: 'focused',
      armLeft: 'cheer',
      armRight: 'cheer',
      speech: 'Bersiap dalam 3... 2... 1...',
      badge: 'Tahan pose!'
    },
    snapping: {
      expression: 'wink',
      armLeft: 'snap',
      armRight: 'snap',
      speech: 'Ckiiik! Momen tersimpan!',
      badge: 'Jepret!'
    },
    success: {
      expression: 'love',
      armLeft: 'celebrate',
      armRight: 'celebrate',
      speech: 'Hasilnya keren banget! Mau tambah slot lagi?',
      badge: 'Cakep!'
    },
    error: {
      expression: 'puzzled',
      armLeft: 'point',
      armRight: 'hip',
      speech: 'Tenang, bantu Jep periksa izin kamera ya!',
      badge: 'Perlu Izin'
    }
  },

  getSvg(state = 'idle', width = 120, height = 120) {
    const s = this.states[state] || this.states.idle;
    
    // Lens facial expressions
    let eyesSvg = '';
    let mouthSvg = '';
    let cheeksSvg = `
      <circle cx="58" cy="74" r="3.5" fill="#F415CD" opacity="0.5"/>
      <circle cx="82" cy="74" r="3.5" fill="#F415CD" opacity="0.5"/>
    `;

    if (state === 'idle') {
      eyesSvg = `
        <ellipse cx="63" cy="67" rx="3.5" ry="4" fill="#2411B9"/>
        <circle cx="64" cy="65.5" r="1.2" fill="#FFFFFF"/>
        <ellipse cx="77" cy="67" rx="3.5" ry="4" fill="#2411B9"/>
        <circle cx="78" cy="65.5" r="1.2" fill="#FFFFFF"/>
      `;
      mouthSvg = `<path d="M 67 72 Q 70 76 73 72" stroke="#2411B9" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
    } else if (state === 'ready') {
      eyesSvg = `
        <path d="M 60 68 Q 63 62 66 68" stroke="#2411B9" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M 74 68 Q 77 62 80 68" stroke="#2411B9" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="63" cy="61" r="1.5" fill="#FAE31F"/>
        <circle cx="77" cy="61" r="1.5" fill="#FAE31F"/>
      `;
      mouthSvg = `<path d="M 66 71 Q 70 77 74 71" stroke="#2411B9" stroke-width="2.5" stroke-linecap="round" fill="#F415CD"/>`;
    } else if (state === 'countdown') {
      eyesSvg = `
        <circle cx="63" cy="66" r="4.2" fill="#2411B9"/>
        <circle cx="64.5" cy="64.5" r="1.8" fill="#FFFFFF"/>
        <circle cx="77" cy="66" r="4.2" fill="#2411B9"/>
        <circle cx="78.5" cy="64.5" r="1.8" fill="#FFFFFF"/>
      `;
      mouthSvg = `<ellipse cx="70" cy="74" rx="3" ry="3.5" fill="#2411B9"/>`;
    } else if (state === 'snapping') {
      eyesSvg = `
        <path d="M 60 67 L 66 67" stroke="#2411B9" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="77" cy="66" r="4" fill="#2411B9"/>
        <circle cx="78.5" cy="64.5" r="1.5" fill="#FFFFFF"/>
      `;
      mouthSvg = `<path d="M 66 73 Q 70 77 74 73" stroke="#2411B9" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else if (state === 'success') {
      eyesSvg = `
        <path d="M 60 67 Q 63 62 66 67" stroke="#2411B9" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M 74 67 Q 77 62 80 67" stroke="#2411B9" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      `;
      mouthSvg = `
        <path d="M 65 71 Q 70 80 75 71 Z" fill="#F415CD" stroke="#2411B9" stroke-width="1.8"/>
        <path d="M 67 73 Q 70 75 73 73" fill="#FFFFFF"/>
      `;
    } else if (state === 'error') {
      eyesSvg = `
        <circle cx="63" cy="66" r="3.5" fill="#2411B9"/>
        <circle cx="77" cy="66" r="3.5" fill="#2411B9"/>
        <path d="M 60 61 L 66 63" stroke="#2411B9" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 80 61 L 74 63" stroke="#2411B9" stroke-width="1.8" stroke-linecap="round"/>
      `;
      mouthSvg = `<path d="M 67 74 Q 70 71 73 74" stroke="#2411B9" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
    }

    // Arms
    let armsSvg = '';
    if (state === 'ready') {
      // Left arm thumbs up, right on hip
      armsSvg = `
        <path d="M 40 68 C 30 65, 26 52, 28 46" stroke="#2411B9" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="28" cy="44" r="4" fill="#FAE31F" stroke="#2411B9" stroke-width="2"/>
        <path d="M 28 42 L 28 38" stroke="#2411B9" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 100 68 C 108 72, 110 80, 106 85" stroke="#2411B9" stroke-width="3" stroke-linecap="round" fill="none"/>
      `;
    } else if (state === 'success' || state === 'countdown') {
      // Arms raised high
      armsSvg = `
        <path d="M 40 66 C 30 55, 28 42, 34 34" stroke="#2411B9" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="34" cy="33" r="3.5" fill="#FFFDF5" stroke="#2411B9" stroke-width="2"/>
        <path d="M 100 66 C 110 55, 112 42, 106 34" stroke="#2411B9" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="106" cy="33" r="3.5" fill="#FFFDF5" stroke="#2411B9" stroke-width="2"/>
      `;
    } else {
      // Waving left, relaxed right
      armsSvg = `
        <path d="M 40 66 C 30 60, 26 48, 30 42" stroke="#2411B9" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="30" cy="40" r="3.5" fill="#FFFDF5" stroke="#2411B9" stroke-width="2"/>
        <path d="M 100 68 C 108 74, 110 82, 106 87" stroke="#2411B9" stroke-width="3" stroke-linecap="round" fill="none"/>
      `;
    }

    // Sparkles on success or ready
    let sparklesSvg = '';
    if (state === 'success' || state === 'ready') {
      sparklesSvg = `
        <path d="M 22 26 L 25 21 L 28 26 L 33 29 L 28 32 L 25 37 L 22 32 L 17 29 Z" fill="#FAE31F" stroke="#2411B9" stroke-width="1.2"/>
        <circle cx="116" cy="28" r="3.5" fill="#FF5A00" stroke="#2411B9" stroke-width="1.2"/>
        <path d="M 112 56 L 115 52 L 118 56 L 122 58 L 118 60 L 115 64 L 112 60 L 108 58 Z" fill="#FAE31F" stroke="#2411B9" stroke-width="1"/>
      `;
    } else if (state === 'countdown') {
      sparklesSvg = `
        <path d="M 20 28 L 24 24 L 28 28 L 32 30 L 28 32 L 24 36 L 20 32 L 16 30 Z" fill="#F415CD" stroke="#2411B9" stroke-width="1"/>
      `;
    }

    return `
      <svg class="jep-svg jep-state-${state}" viewBox="0 0 140 135" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maskot Jep (${s.badge})">
        <defs>
          <filter id="jep-shadow" x="-8%" y="-8%" width="124%" height="124%">
            <feDropShadow dx="2" dy="3" stdDeviation="0" flood-color="#2411B9"/>
          </filter>
        </defs>

        <!-- Sparkles -->
        ${sparklesSvg}

        <!-- Tiny Legs -->
        <g class="jep-legs">
          <path d="M 56 98 L 54 116 L 47 116" stroke="#2411B9" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <ellipse cx="48" cy="116" rx="5.5" ry="3" fill="#F415CD" stroke="#2411B9" stroke-width="2"/>
          <path d="M 84 98 L 86 116 L 93 116" stroke="#2411B9" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <ellipse cx="92" cy="116" rx="5.5" ry="3" fill="#F415CD" stroke="#2411B9" stroke-width="2"/>
        </g>

        <!-- Arms (Behind or Beside) -->
        <g class="jep-arms">
          ${armsSvg}
        </g>

        <!-- Camera Body -->
        <g class="jep-body">
          <!-- Viewfinder Bump / Top Flash -->
          <rect x="58" y="32" width="24" height="12" rx="4" fill="#FAE31F" stroke="#2411B9" stroke-width="2.5"/>
          <circle cx="70" cy="38" r="2.8" fill="#FFFFFF" stroke="#2411B9" stroke-width="1.2"/>

          <!-- Top Red Shutter Button -->
          <rect x="42" y="34" width="12" height="7" rx="3" fill="#F415CD" stroke="#2411B9" stroke-width="2"/>

          <!-- Main Camera Shell -->
          <rect x="36" y="40" width="68" height="58" rx="14" fill="#FFFDF5" stroke="#2411B9" stroke-width="3" filter="url(#jep-shadow)"/>
          
          <!-- Top Decorative Strip -->
          <path d="M 36 53 L 104 53" stroke="#2411B9" stroke-width="1.8" stroke-dasharray="3 3"/>
          
          <!-- Accent Corner Grip -->
          <rect x="90" y="45" width="8" height="14" rx="3" fill="#FF5A00" stroke="#2411B9" stroke-width="1.5"/>

          <!-- Big Circular Lens (Face Stage) -->
          <circle cx="70" cy="70" r="23" fill="#FFFFFF" stroke="#2411B9" stroke-width="3"/>
          <circle cx="70" cy="70" r="19" fill="#FFFDF5" stroke="#2411B9" stroke-width="1.5" stroke-dasharray="2 2"/>

          <!-- Lens Cheeks & Facial Expression -->
          ${cheeksSvg}
          ${eyesSvg}
          ${mouthSvg}
        </g>
      </svg>
    `;
  },

  updateMascotEl(containerEl, state = 'idle', customMessage = null) {
    if (!containerEl) return;
    const s = this.states[state] || this.states.idle;
    const msg = customMessage || s.speech;

    containerEl.innerHTML = `
      <div class="jep-widget jep-${state}">
        <div class="jep-avatar">
          ${this.getSvg(state, 88, 88)}
        </div>
        <div class="jep-bubble">
          <span class="jep-badge">${s.badge}</span>
          <p class="jep-text">${msg}</p>
        </div>
      </div>
    `;
  }
};

window.JepMascot = JepMascot;
