/**
 * Ruang Jepret — Strip Renderer (Redesigned)
 * New strip frame themes based on reference images:
 *
 * 1. "Snap On" — Bold cobalt blue background, retro Windows-style frame headers
 *    per photo, sun/flower character stickers between frames, wavy line accents,
 *    checkerboard pattern in corners.
 *
 * 2. "Sukhakala" — Cream/off-white ticket/tag background with a hole-punch
 *    at top, thick rounded colored borders cycling green→red→yellow per frame,
 *    numbered circle badges at frame corners, star accent stickers.
 *
 * 3. "Market Strip" — White background, each frame gets its own thick solid
 *    colored rounded border (cycling pink/blue/red/orange), small sticker
 *    decorations, hashtag at bottom.
 *
 * 4. "Polaroid" — Classic clean white, thin dark border, minimal.
 */

class StripRenderer {
  constructor() {
    this.themes = {
      snapon:     { id: 'snapon',    name: 'Snap On!',       desc: 'Biru kobalt, frame retro, stiker matahari' },
      sukhakala:  { id: 'sukhakala', name: 'Sukhakala',      desc: 'Tiket krem, border tebal warna-warni, nomor badge' },
      market:     { id: 'market',    name: 'Market Strip',   desc: 'Putih, border cerah per frame, stiker lucu' },
      polaroid:   { id: 'polaroid',  name: 'Polaroid Bersih',desc: 'Klasik putih minimalis' },
      custom:     { id: 'custom',    name: 'Frame saya',     desc: 'Frame dari aset sendiri, 3 jendela foto' }
    };

    /* The "Frame saya" artwork. `windows` are the white photo openings measured
       from the PNG itself, in native pixels, so the asset can be swapped for a
       new export without touching anything else. */
    this.customArt = {
      file: 'assets/tes-strips.png',
      w: 142,
      h: 425,
      scale: 5,
      windows: [
        { x: 8,  y: 86,  w: 128, h: 95 },
        { x: 8,  y: 189, w: 128, h: 88 },
        { x: 20, y: 282, w: 116, h: 91 }
      ]
    };

    this._customFrameCache = null;
  }

  /**
   * @param {Object} opts
   * @param {string[]} opts.photos     — DataURL array (len 3 or 4)
   * @param {number}   opts.frameCount — 3 or 4
   * @param {string}   opts.themeId
   * @param {string}   opts.userName
   * @param {string}   opts.filter     — 'none'|'warm'|'mono'|'cool'
   * @returns {Promise<HTMLCanvasElement>}
   */
  async render({ photos = [], frameCount = 4, themeId = 'sukhakala', userName = 'Ruang Jepret', filter = 'none' }) {
    const custom = themeId === 'custom';
    const W = custom ? this.customArt.w * this.customArt.scale : 1200;
    // 4:11 ratio for a classic photobooth strip
    const H = custom ? this.customArt.h * this.customArt.scale
                     : (frameCount === 3 ? 3000 : 3800);

    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const imgs = await Promise.all(photos.map(s => this._loadImg(s)));

    if (themeId === 'custom') await this._renderCustom(ctx, W, H, imgs, frameCount, filter, userName);
    else if (themeId === 'snapon')    await this._renderSnapOn(ctx, W, H, imgs, frameCount, filter, userName);
    else if (themeId === 'sukhakala') await this._renderSukhakala(ctx, W, H, imgs, frameCount, filter, userName);
    else if (themeId === 'market')    await this._renderMarket(ctx, W, H, imgs, frameCount, filter, userName);
    else                               await this._renderPolaroid(ctx, W, H, imgs, frameCount, filter, userName);

    return canvas;
  }

  /* =========================================================================
     THEME 1: Snap On — Bold cobalt, retro frame headers, sticker characters
     ========================================================================= */
  async _renderSnapOn(ctx, W, H, imgs, count, filter, brand) {
    // --- Background ---
    ctx.fillStyle = '#1845CC';
    ctx.fillRect(0, 0, W, H);

    // Grid overlay (like graph paper)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x <= W; x += gridSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y <= H; y += gridSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Checkerboard corners
    this._drawChecker(ctx, 0, 0, 120, 120, '#0A2A8A', '#1845CC');
    this._drawChecker(ctx, W-120, 0, 120, 120, '#0A2A8A', '#1845CC');
    this._drawChecker(ctx, 0, H-120, 120, 120, '#0A2A8A', '#1845CC');
    this._drawChecker(ctx, W-120, H-120, 120, 120, '#0A2A8A', '#1845CC');

    // Header brand text
    ctx.font = '700 88px "Fredoka", sans-serif';
    ctx.fillStyle = '#FFE532';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    this._drawTextOutlined(ctx, 'Ruang', 80, 40, '#FFE532', '#0A2A8A', 5);
    this._drawTextOutlined(ctx, 'Jepret!', 80, 118, '#FFE532', '#0A2A8A', 5);

    // Photo frames layout
    const sidePad = 80;
    const topPad  = 260;
    const frameW  = W - sidePad * 2;   // 1040px
    const frameH  = Math.round(frameW * 0.74); // maintain ~4:3 feel
    const betweenH = count === 3 ? Math.round((H - topPad - 180 - frameH * count) / (count - 1))
                                  : Math.round((H - topPad - 180 - frameH * count) / (count - 1));

    for (let i = 0; i < count; i++) {
      const x = sidePad;
      const y = topPad + i * (frameH + betweenH);
      this._drawSnapOnFrame(ctx, x, y, frameW, frameH, imgs[i], filter, i);

      // Sticker characters between frames (not after last)
      if (i < count - 1) {
        const stickerY = y + frameH + Math.round(betweenH / 2) - 70;
        if (i % 2 === 0) {
          this._drawSunChar(ctx, x + 30, stickerY, 110);
          this._drawWavyLine(ctx, x + 160, stickerY + 50, 300, '#FF4D4D');
          this._drawFlowerChar(ctx, W - sidePad - 140, stickerY, 110);
        } else {
          this._drawFlowerChar(ctx, x + 30, stickerY, 110);
          this._drawWavyLine(ctx, x + 160, stickerY + 50, 280, '#FFD300');
          this._drawSunChar(ctx, W - sidePad - 140, stickerY, 110);
        }
      }
    }

    // Bottom accents
    const bottomY = topPad + count * (frameH + betweenH) - betweenH + frameH + 30;

    // Colorful dots
    const dotColors = ['#FF4D4D', '#4DC8FF', '#FFD300'];
    dotColors.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(sidePad + 40 + i * 90, bottomY + 50, 28, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });

    // Brand text bottom
    ctx.font = '700 58px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#FFE532';
    ctx.fillText(brand.toUpperCase() || 'RUANG JEPRET', W / 2, bottomY + 30);

    ctx.font = '500 32px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(`ruang jepret photobooth`, W / 2, bottomY + 100);
  }

  _drawSnapOnFrame(ctx, x, y, w, h, img, filter, index) {
    ctx.save();

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur  = 20;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 10;

    // Beige/cream header bar (like retro OS window title bar)
    const headerH = 36;
    ctx.fillStyle = '#F5E9C8';
    ctx.beginPath();
    ctx.roundRect(x, y, w, headerH + 6, [10, 10, 0, 0]);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Window traffic-light buttons (right side of header)
    const btnColors = ['#26A32A', '#F5BD00', '#FF3B30'];
    btnColors.forEach((c, bi) => {
      ctx.beginPath();
      ctx.arc(x + w - 24 - bi * 28, y + headerH / 2, 9, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });

    // Horizontal dotted stripe on header (like retro toolbar)
    ctx.strokeStyle = 'rgba(43,18,96,0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 14, y + headerH);
    ctx.lineTo(x + w - 110, y + headerH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Photo area
    const photoY = y + headerH;
    const photoH = h - headerH;
    ctx.beginPath();
    ctx.rect(x, photoY, w, photoH);
    ctx.clip();

    if (img) {
      this._applyFilter(ctx, filter);
      this._imgCover(ctx, img, x, photoY, w, photoH);
    } else {
      ctx.fillStyle = '#1135A0';
      ctx.fillRect(x, photoY, w, photoH);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '700 52px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Foto ${index + 1}`, x + w / 2, photoY + photoH / 2);
    }

    ctx.restore();
  }

  _drawChecker(ctx, x, y, w, h, c1, c2) {
    const sz = 20;
    for (let row = 0; row < h / sz; row++) {
      for (let col = 0; col < w / sz; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? c1 : c2;
        ctx.fillRect(x + col * sz, y + row * sz, sz, sz);
      }
    }
  }

  _drawTextOutlined(ctx, text, x, y, fill, stroke, sw) {
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw * 2;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _drawWavyLine(ctx, x, y, len, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segs = 5;
    const segW = len / segs;
    for (let i = 0; i < segs; i++) {
      const cx1 = x + i * segW + segW * 0.25;
      const cy1 = y + (i % 2 === 0 ? -35 : 35);
      const cx2 = x + i * segW + segW * 0.75;
      const cy2 = y + (i % 2 === 0 ? -35 : 35);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x + (i+1) * segW, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawSunChar(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);

    // Spike rays
    const spikes = 10;
    ctx.fillStyle = '#FFD300';
    ctx.strokeStyle = '#0A2A8A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? size * 0.5 : size * 0.32;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
              : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Face circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE569';
    ctx.fill();
    ctx.stroke();

    // Eyes (round)
    [[-size*0.09, -size*0.06], [size*0.09, -size*0.06]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.arc(ex, ey, size * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = '#0A2A8A';
      ctx.fill();
    });

    // Rosy cheeks
    [-size*0.12, size*0.12].forEach(cx => {
      ctx.beginPath();
      ctx.arc(cx, size * 0.04, size * 0.065, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,80,80,0.55)';
      ctx.fill();
    });

    // Smile
    ctx.beginPath();
    ctx.arc(0, size * 0.02, size * 0.1, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = '#0A2A8A';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
  }

  _drawFlowerChar(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);

    // Pink petals
    const pCount = 8;
    ctx.fillStyle = '#FF8FCC';
    ctx.strokeStyle = '#0A2A8A';
    ctx.lineWidth = 3;
    for (let p = 0; p < pCount; p++) {
      const a = (p / pCount) * Math.PI * 2;
      const px = Math.cos(a) * size * 0.25;
      const py = Math.sin(a) * size * 0.25;
      ctx.beginPath();
      ctx.ellipse(px, py, size * 0.16, size * 0.22, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE532';
    ctx.fill();
    ctx.stroke();

    // Face on center
    [[-size*0.07, -size*0.04], [size*0.07, -size*0.04]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.arc(ex, ey, size * 0.035, 0, Math.PI * 2);
      ctx.fillStyle = '#0A2A8A';
      ctx.fill();
    });

    ctx.beginPath();
    ctx.arc(0, size * 0.02, size * 0.07, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = '#0A2A8A';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.restore();
  }

  /* =========================================================================
     THEME 2: Sukhakala — Cream ticket, thick colored rounded frames, num badge
     ========================================================================= */
  async _renderSukhakala(ctx, W, H, imgs, count, filter, brand) {
    // --- Background ---
    ctx.fillStyle = '#F5EFE2';
    ctx.fillRect(0, 0, W, H);

    // Subtle dotted border
    ctx.strokeStyle = 'rgba(43,18,96,0.12)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.setLineDash([]);

    // Hole punch at top center
    const holeR = 42;
    const holeX = W / 2;
    const holeY = 60;
    ctx.beginPath();
    ctx.arc(holeX, holeY, holeR + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(43,18,96,0.1)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(holeX, holeY, holeR, 0, Math.PI * 2);
    ctx.fillStyle = '#F5EFE2';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(holeX, holeY, holeR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(43,18,96,0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Brand name
    ctx.font = '700 96px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    this._drawTextOutlined(ctx, brand || 'Ruang Jepret', W/2, holeY + holeR + 20, '#E63030', '#2B1260', 5);

    ctx.font = '600 36px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(43,18,96,0.5)';
    ctx.fillText('photobooth ✦ vol. 1', W/2, holeY + holeR + 128);

    // Frame colors (cycling: green, red, yellow)
    const borderColors = ['#2CBE6A', '#E6292D', '#F9C11A'];
    const starColors   = ['#2CBE6A', '#F9C11A'];

    const sidePad = 90;
    const topPad  = holeY + holeR + 200;
    const frameW  = W - sidePad * 2;
    const frameH  = Math.round(frameW * 0.72);
    const border  = 20;   // thick colored border
    const gapH    = count === 3
      ? Math.round((H - topPad - 200 - frameH * count) / (count - 1))
      : Math.round((H - topPad - 200 - frameH * count) / (count - 1));

    for (let i = 0; i < count; i++) {
      const x = sidePad;
      const y = topPad + i * (frameH + gapH);
      const bColor = borderColors[i % borderColors.length];

      this._drawSukhakalaFrame(ctx, x, y, frameW, frameH, border, bColor, imgs[i], filter, i + 1);

      // Star accents between / around frames
      const starSize = 38;
      const sc = starColors[i % 2];
      this._drawStar4(ctx, x - 30, y + frameH / 2 - starSize, starSize, sc);
      this._drawStar4(ctx, x + frameW + 10, y + frameH * 0.7, starSize * 0.85, starColors[(i+1)%2]);
    }

    // Bottom hashtag
    const footerY = topPad + count * (frameH + gapH) - gapH + frameH + 30;
    ctx.font = '600 38px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(43,18,96,0.45)';
    ctx.fillText('#ruangjepret', W/2, footerY + 18);
  }

  _drawSukhakalaFrame(ctx, x, y, w, h, border, bColor, img, filter, num) {
    ctx.save();

    // Shadow
    ctx.shadowColor = 'rgba(43,18,96,0.15)';
    ctx.shadowBlur  = 18;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 8;

    // Colored thick rounded border
    ctx.fillStyle = bColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 30);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // White inner photo area
    const pad = border;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x + pad, y + pad, w - pad * 2, h - pad * 2, 16);
    ctx.fill();

    // Photo
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + pad, y + pad, w - pad * 2, h - pad * 2, 16);
      ctx.clip();
      this._applyFilter(ctx, filter);
      this._imgCover(ctx, img, x + pad, y + pad, w - pad * 2, h - pad * 2);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + pad, y + pad, w - pad * 2, h - pad * 2, 16);
      ctx.clip();
      ctx.fillStyle = '#EDE4D8';
      ctx.fillRect(x + pad, y + pad, w - pad * 2, h - pad * 2);
      ctx.font = '700 52px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(43,18,96,0.3)';
      ctx.fillText(`Foto ${num}`, x + w/2, y + h/2);
      ctx.restore();
    }

    // Number badge circle at bottom-right of frame
    const bR = 38;
    const bX = x + w - border - bR + 12;
    const bY = y + h - border - bR + 12;

    ctx.beginPath();
    ctx.arc(bX, bY, bR, 0, Math.PI * 2);
    ctx.fillStyle = bColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bX, bY, bR - 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '700 42px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(String(num).padStart(2, '0'), bX, bY + 2);

    ctx.restore();
  }

  _drawStar4(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x + size/2, y + size/2);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? size * 0.5 : size * 0.2;
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
              : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* =========================================================================
     THEME 3: Market Strip — White bg, colorful per-frame borders, stickers
     ========================================================================= */
  async _renderMarket(ctx, W, H, imgs, count, filter, brand) {
    // White / light grid background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(200,200,220,0.55)';
    ctx.lineWidth = 1;
    const gs = 36;
    for (let x = 0; x <= W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y <= H; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Top header bar
    const hdrH = 160;
    ctx.fillStyle = '#FF5FA8';
    ctx.beginPath();
    ctx.roundRect(0, 0, W, hdrH, [0, 0, 36, 36]);
    ctx.fill();

    ctx.font = '700 80px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(brand || 'Ruang Jepret', W/2, hdrH/2);

    // Frame colors per slot
    const borderColors = ['#FF5FA8', '#4263D8', '#E6292D', '#FF9A2E'];

    const sidePad = 80;
    const topPad  = hdrH + 60;
    const frameW  = W - sidePad * 2;
    const frameH  = Math.round(frameW * 0.72);
    const gap     = count === 3
      ? Math.round((H - topPad - 180 - frameH * count) / (count - 1))
      : Math.round((H - topPad - 180 - frameH * count) / (count - 1));

    for (let i = 0; i < count; i++) {
      const x = sidePad;
      const y = topPad + i * (frameH + gap);
      const bc = borderColors[i % borderColors.length];
      this._drawMarketFrame(ctx, x, y, frameW, frameH, bc, imgs[i], filter, i);
    }

    // Bottom decoration
    const footerY = topPad + count * (frameH + gap) - gap + frameH + 20;
    ctx.fillStyle = '#BFDF35';
    ctx.beginPath();
    ctx.roundRect(0, footerY, W, H - footerY, [36, 36, 0, 0]);
    ctx.fill();

    ctx.font = '700 52px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2B1260';
    ctx.fillText('★  ' + (brand || 'Ruang Jepret') + '  ★', W/2, footerY + (H - footerY)/2);
  }

  _drawMarketFrame(ctx, x, y, w, h, bc, img, filter, index) {
    ctx.save();
    const bw = 18;

    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.14)';
    ctx.shadowBlur  = 16;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    // Colored border
    ctx.fillStyle = bc;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 28);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // White inner
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x + bw, y + bw, w - bw*2, h - bw*2, 14);
    ctx.fill();

    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + bw, y + bw, w - bw*2, h - bw*2, 14);
      ctx.clip();
      this._applyFilter(ctx, filter);
      this._imgCover(ctx, img, x + bw, y + bw, w - bw*2, h - bw*2);
      ctx.restore();
    } else {
      ctx.fillStyle = '#EDE8F5';
      ctx.beginPath();
      ctx.roundRect(x + bw, y + bw, w - bw*2, h - bw*2, 14);
      ctx.fill();
      ctx.font = '700 48px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(43,18,96,0.3)';
      ctx.fillText(`Foto ${index+1}`, x + w/2, y + h/2);
    }

    ctx.restore();
  }

  /* =========================================================================
     THEME 4: Polaroid — Clean minimal
     ========================================================================= */
  async _renderPolaroid(ctx, W, H, imgs, count, filter, brand) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#2B1260';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    const topPad = 100;
    ctx.font = '700 68px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#2B1260';
    ctx.fillText(brand || 'Ruang Jepret', W/2, 30);

    const sidePad = 90;
    const frameW  = W - sidePad * 2;
    const frameH  = Math.round(frameW * 0.72);
    const gap     = Math.round((H - topPad - 160 - frameH * count) / (count - 1));

    for (let i = 0; i < count; i++) {
      const x = sidePad;
      const y = topPad + i * (frameH + gap);

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur  = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(x, y, frameW, frameH);
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#2B1260';
      ctx.lineWidth   = 4;
      ctx.strokeRect(x, y, frameW, frameH);

      if (imgs[i]) {
        ctx.beginPath();
        ctx.rect(x + 4, y + 4, frameW - 8, frameH - 8);
        ctx.clip();
        this._applyFilter(ctx, filter);
        this._imgCover(ctx, imgs[i], x + 4, y + 4, frameW - 8, frameH - 8);
      }
      ctx.restore();
    }

    const footerY = topPad + count * (frameH + gap) - gap + frameH + 24;
    ctx.font = '500 34px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(43,18,96,0.45)';
    ctx.fillText(`#ruangjepret — ${this._todayStr()}`, W/2, footerY);
  }

  /* =========================================================================
     Frame saya — the user's own artwork from assets/tes-strips.png.

     The PNG is embedded as a data URL (js/frame-asset.js). A plain
     <img src="assets/tes-strips.png"> taints the canvas when index.html is
     opened from disk, which makes toDataURL() throw and the preview/download
     come out empty — that is why the asset "could not be used" before.

     The artwork is drawn on top with its white photo windows made
     transparent, so the photos underneath show through while every doodle,
     squiggle and letter of the original design stays exactly where it was.
     ========================================================================= */
  async _renderCustom(ctx, W, H, imgs, count, filter, brand) {
    const art = this.customArt;

    ctx.fillStyle = '#fae31f';
    ctx.fillRect(0, 0, W, H);

    // 1. Photos, clipped into the artwork's photo windows.
    const slots = art.windows.slice(0, Math.min(count, art.windows.length));
    slots.forEach((win, i) => {
      const x = (win.x / art.w) * W;
      const y = (win.y / art.h) * H;
      const w = (win.w / art.w) * W;
      const h = (win.h / art.h) * H;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 10 * art.scale);
      ctx.clip();

      if (imgs[i]) {
        this._applyFilter(ctx, filter);
        this._imgCover(ctx, imgs[i], x, y, w, h);
      } else {
        ctx.fillStyle = '#fffdf5';
        ctx.fillRect(x, y, w, h);
      }
      ctx.restore();
    });

    // 2. The artwork on top, windows punched out.
    const frame = await this._customFrame();
    if (frame) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(frame, 0, 0, W, H);
    }

    // 3. Name, sitting on the empty paper below the last window.
    const label = (brand || '').trim();
    if (label) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#2411b9';
      let size = Math.round(H * 0.026);
      ctx.font = `800 ${size}px "Baloo 2", "Trebuchet MS", sans-serif`;
      while (size > 12 && ctx.measureText(label).width > W * 0.8) {
        size -= 2;
        ctx.font = `800 ${size}px "Baloo 2", "Trebuchet MS", sans-serif`;
      }
      ctx.fillText(label, W / 2, H * 0.925);
    }
  }

  /** Artwork with the white photo windows made transparent, built once. */
  async _customFrame() {
    if (this._customFrameCache) return this._customFrameCache;

    const b64 = window.FRAME_ASSET_B64;
    const src = b64 ? `data:image/png;base64,${b64}` : this.customArt.file;
    const art = await this._loadImg(src);
    if (!art) return null;

    const cv = document.createElement('canvas');
    cv.width = this.customArt.w;
    cv.height = this.customArt.h;
    const cx = cv.getContext('2d');
    cx.drawImage(art, 0, 0);

    const data = cx.getImageData(0, 0, cv.width, cv.height);
    const px = data.data;

    // Only inside the photo windows: white becomes transparent, edges fade.
    this.customArt.windows.forEach(win => {
      for (let y = win.y; y < win.y + win.h; y++) {
        for (let x = win.x; x < win.x + win.w; x++) {
          const i = (y * cv.width + x) * 4;
          const m = Math.min(px[i], px[i + 1], px[i + 2]);
          if (m >= 244) {
            px[i + 3] = 0;
          } else if (m > 200) {
            px[i + 3] = Math.round(((244 - m) / 44) * 255);
          }
        }
      }
    });

    cx.putImageData(data, 0, 0);
    this._customFrameCache = cv;
    return cv;
  }

  /* =========================================================================
     Shared Utilities
     ========================================================================= */
  _applyFilter(ctx, f) {
    if      (f === 'warm') ctx.filter = 'sepia(0.35) saturate(1.28) brightness(1.03)';
    else if (f === 'mono') ctx.filter = 'grayscale(1) contrast(1.1)';
    else if (f === 'cool') ctx.filter = 'saturate(0.82) hue-rotate(10deg) brightness(1.05)';
    else                   ctx.filter = 'none';
  }

  _imgCover(ctx, img, x, y, w, h) {
    const ir = img.width / img.height;
    const tr = w / h;
    let sx=0, sy=0, sw=img.width, sh=img.height;
    if (ir > tr) { sw = Math.round(img.height * tr); sx = Math.round((img.width - sw) / 2); }
    else          { sh = Math.round(img.width / tr);  sy = Math.round((img.height - sh) / 2); }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  _loadImg(src) {
    if (!src) return Promise.resolve(null);
    return new Promise(res => {
      const i = new Image();
      i.onload  = () => res(i);
      i.onerror = () => res(null);
      i.src = src;
    });
  }

  _todayStr() {
    const d = new Date();
    const m = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()];
    return `${d.getDate()} ${m} ${d.getFullYear()}`;
  }
}

window.StripRenderer = StripRenderer;
