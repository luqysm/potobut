# Prompt Google Stitch — Ruang Jepret

Salin prompt ini ke Google Stitch. Lampirkan juga `PRD.md`, `DESIGN.md`, dan gambar referensi yang dikirim user.

```text
Design a responsive, polished web photobooth product called “Ruang Jepret”. Treat the attached PRD.md as product requirements and DESIGN.md as the visual source of truth. Use the attached portfolio image only as broad inspiration (playful scrapbook, warm paper, vivid cut-paper accents, expressive typography, doodles); do not copy its exact layout, artwork, lettering, or character.

PRODUCT EXPERIENCE
This is an interactive camera-taking surface, not a marketing landing page. Make the live camera preview the primary focus. Design the complete main photobooth screen and these key states: camera permission not yet granted, camera ready/live, countdown, captured photos, camera error, and phone-to-laptop pairing entry state. Keep all labels and UI copy in Indonesian.

PHOTO STRIP FEATURE — IMPORTANT
Users must choose between two output layouts before capture: “3 foto” and “4 foto” (number of frames/photos in one photobooth strip). Show both as clear, selectable thumbnail previews, with selected state, frame count, approximate print ratio, and a live strip preview. Selecting a layout must change the session capture plan and final strip composition. Design the completed photo strip as a vertical instant-print strip with even frames, cream/white paper border, small optional date/caption footer, and a clear download action. Do not confuse number of frames with number of separate strips. Include a choice of 3-frame or 4-frame strip, not a carousel of unrelated templates.

SCREENS / RESPONSIVE VARIANTS
1. Mobile portrait (around 390px): tall camera preview, thumb-reachable primary shutter, simple camera/filter controls, strip selector and gallery below the preview.
2. Tablet (around 768px): preview and controls balanced, strip choices and recent captures visible without crowding.
3. Desktop (around 1440px): large preview on left/center, gallery and strip settings in a right panel; include camera source control and “Hubungkan kamera HP” entry point.
4. A compact modal/panel for phone camera pairing with QR placeholder, short pairing code, waiting/connected/error states, and clear security/permission copy. This is UI design only; do not imply pairing works without a backend.

VISUAL DIRECTION
Use DESIGN.md exact palette and typography tokens. Warm cream paper background, dark ink outlines, tomato shutter button, cobalt selected states, butter-yellow and lilac sticker accents, leaf-green success. Friendly expressive display font only for short headings; readable sans-serif for controls and instructions. Use original simple line icons for camera, flip camera, timer, filter, grid, download, delete, and QR. Add a small original mascot “Jep”, a pocket-camera creature with tiny legs and a simple expressive lens-face. Do not imitate any character from the reference. Use paper-cut labels, subtle tape/sticker marks, small hand-drawn stars and motion marks. Keep composition intentional and tidy; never cover face preview, buttons, countdown, QR, or status. No generic SaaS feature-card landing page, no full-screen gradient, no excessive blur.

INTERACTIONS TO SHOW
- Explicit “Nyalakan kamera” / permission state.
- Live preview controls: choose camera, flip, timer, optional grid, filter.
- Main shutter button and 3-2-1 countdown state.
- Strip selector toggling between 3-photo and 4-photo layouts; visibly update strip preview.
- Captured-photo thumbnails and final composed strip preview, with retake/delete/download actions.
- Pairing panel with QR and code states, visually marked as a separate optional camera source.
- Error/empty state with helpful Indonesian instructions and Jep mascot.

ACCESSIBILITY / QUALITY
Use clear hierarchy, WCAG AA contrast for text, visible keyboard focus, accessible labels, 44px minimum touch targets, non-color-only status indicators, and reduced-motion-friendly animations. Keep the actual photo as the main focal point. Do not invent backend features beyond the PRD. Deliver a coherent component system and responsive screens that can be implemented in a web app.
```

## Stitch hasil yang perlu dibawa ke Antigravity

- Screenshot/export desain mobile, tablet, desktop.
- Screenshot state kamera aktif, countdown, strip 3 foto, strip 4 foto, hasil final, dan pairing.
- Jika Stitch menyediakan kode, ekspor komponen/aset juga, tetapi minta Antigravity menyesuaikan ke struktur proyek yang ada.
