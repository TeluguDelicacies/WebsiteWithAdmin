/**
 * Logo Changer - Visual Effects Controller
 * Manages 3D tilt perspective, drop shadows, neon glow, metallic sheens, and emboss.
 */

import { qs } from './utils.js';

export function applyEffects(state) {
  const stage = qs('#previewStage');
  if (!stage) return;

  const { effects } = state;

  stage.classList.toggle('effect-tilt', Boolean(effects.tilt));
  stage.classList.toggle('effect-glow', Boolean(effects.glow));
  stage.classList.toggle('effect-shadow', Boolean(effects.shadow));
  stage.classList.toggle('effect-emboss', Boolean(effects.emboss));
  stage.classList.toggle('effect-sheen', Boolean(effects.sheen));
}
