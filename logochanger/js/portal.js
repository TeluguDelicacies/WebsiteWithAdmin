/**
 * Logo Changer - Packaging Mockup & Portal Environments
 * Manages packaging mockup textures, box materials, and ambient preview stages.
 */

import { PORTAL_BACKGROUNDS } from './config.js';
import { qs } from './utils.js';

export function applyPortalEnvironment(portalId) {
  const artboard = qs('#artboardBox');
  if (!artboard) return;

  // Remove existing environment classes
  PORTAL_BACKGROUNDS.forEach(bg => {
    artboard.classList.remove(bg.className);
  });

  const selected = PORTAL_BACKGROUNDS.find(b => b.id === portalId) || PORTAL_BACKGROUNDS[0];
  artboard.classList.add(selected.className);
}
