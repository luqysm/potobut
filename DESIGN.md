---
version: alpha
name: Ruang Jepret
description: Playful scrapbook-inspired photobooth with warm paper, bold pop colors, original camera mascot, and selectable photo-strip layouts.
colors:
  primary: "#EF5B45"
  secondary: "#4263D8"
  tertiary: "#FFD45C"
  neutral: "#FFF4DE"
  ink: "#24211D"
  paper: "#FFFFFF"
  green: "#85A86A"
  lilac: "#B99AE8"
typography:
  display:
    fontFamily: Fredoka
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.05
  heading:
    fontFamily: Fredoka
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: DM Sans
    fontSize: 0.8125rem
    fontWeight: 700
    lineHeight: 1.3
rounded:
  sm: 10px
  md: 18px
  lg: 28px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 14px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#C93E2B"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: 14px
  sticker-success:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 8px
  sticker-decorative:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 8px
  card-photo:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 10px
  canvas-app:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
---

## Overview

Ruang Jepret feels like a lively scrapbook table: warm paper, punchy cut-paper accents, bold friendly lettering, small doodles, and an original camera mascot. Keep the camera preview and resulting photo strips as the visual focus. Decorative elements frame the interaction; they never obscure faces, controls, countdown, or accessibility labels. Borrow broad visual principles from the user-provided portfolio reference, not its artwork, characters, exact lettering, or composition.

## Colors

Cream paper is the calm base. Tomato is the primary action color for capture; cobalt marks selected states and secondary actions; butter yellow, leaf green, and lilac are small supporting accents. Ink is the default text and outline color. Use text labels or icons alongside color-coded status. Maintain WCAG AA contrast for text and controls; verify every pairing in the implementation. Do not put small white text on yellow or low-contrast green.

## Typography

Use Fredoka for short expressive headlines and DM Sans for all controls, instructions, captions, and error messages. Provide robust system sans-serif fallbacks. Display type may vary in color only for short decorative words, never for long instructions. Handwritten lettering is an optional accent for brief sticker labels only. Prefer locally bundled fonts for offline reliability; if remote font loading is chosen, include fallback and document that internet access is needed.

## Layout

Mobile-first responsive composition. On phones, prioritize a tall camera preview, reachable shutter button, then strip selection and recent results. On tablets, place preview and controls side by side when width allows. On desktop, give the preview primary space and show strip templates/results in a side panel. Keep the responsive design tested at 360px, 768px, and 1280px widths. Offer two explicit photo-strip templates: 3-frame and 4-frame; selecting one must be clear before capture. Keep printable strip ratio approximately 2:6, with a configurable color/background and a small footer for date or product branding. Show a preview of the final composed strip before download/print.

## Elevation & Depth

Use paper-like solid surfaces, visible ink outlines, and restrained offset shadows to suggest layered cut paper. Avoid full-screen gradients and excessive blur. Slight rotation is allowed for gallery thumbnails only; camera preview and final strip preview remain straight and undistorted.

## Shapes

Use friendly rounded corners, ticket-like labels, sticker pills, bold outlined controls, simple stars, tape shapes, and hand-drawn motion marks. Use consistent line icons with accessible names for camera, flip, timer, grid, filter, download, delete, and pairing. Avoid ambiguous doodles in place of functional icons.

## Components

The shutter is the single dominant action, tomato with ink text and a clear camera glyph. Secondary controls use paper surfaces with ink outlines; selected template/filter uses cobalt or a clear outline plus selected text. Photo strip templates show a small, accurate preview and labels “3 frame” and “4 frame”; do not imply a template is selected until it is. Strip exports use the selected template and preserve photo orientation. The original mascot “Jep” is a small pocket-camera creature with tiny legs and a simple lens-face. Jep may appear in empty, ready, countdown, success, and camera-error states, but must never cover the preview subject or become the only carrier of an instruction.

## Do's and Don'ts

- Do keep the photo preview and final strip as the focal point.
- Do provide clear selection state and a preview before exporting a 3-frame or 4-frame strip.
- Do provide keyboard focus, accessible labels, and touch targets at least 44×44px.
- Do respect `prefers-reduced-motion` and keep key actions immediate.
- Do use color plus icon/text for status.
- Don't reproduce the reference portfolio's artwork, character, or page layout.
- Don't make decorative motion continuous or flash rapidly.
- Don't use display font for long copy or error text.
- Don't let stickers, mascot, or doodles obscure faces, controls, QR codes, or status.
