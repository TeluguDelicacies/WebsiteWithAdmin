/**
 * Logo Changer - Logo Loader
 * Seamlessly loads SVG vector files from /logos or fallback strings, sanitizes, and renders.
 */

import { LOGO_REGISTRY } from './config.js';
import { sanitizeSvg } from './svg-parser.js';
import { LOGO_SVGS } from '../logos.js';
import { getPermanentLogoById } from './permanent-storage.js';

export async function loadLogoSvg(logoId, customContent = null) {
  let svgText = '';

  if (logoId === 'custom' && customContent) {
    svgText = customContent;
  } else {
    // Check if it's a permanent user-saved logo
    const permLogo = getPermanentLogoById(logoId);
    if (permLogo && permLogo.svgContent) {
      svgText = permLogo.svgContent;
    } else if (LOGO_SVGS && LOGO_SVGS[logoId]) {
      // Check fallback inline string first for instant offline zero-lag load
      svgText = LOGO_SVGS[logoId];
    } else {
      const config = LOGO_REGISTRY[logoId];
      if (!config) throw new Error(`Unknown logo identifier: ${logoId}`);
      try {
        const res = await fetch(config.file);
        if (!res.ok) throw new Error(`Failed to fetch ${config.file}: ${res.statusText}`);
        svgText = await res.text();
      } catch (fetchErr) {
        console.warn(`Fetch for ${config.file} failed, checking fallbacks:`, fetchErr);
        if (LOGO_SVGS && LOGO_SVGS[logoId]) {
          svgText = LOGO_SVGS[logoId];
        } else {
          throw fetchErr;
        }
      }
    }
  }

  // Parse and sanitize SVG
  const svgElement = sanitizeSvg(svgText);
  svgElement.id = 'logoRendererSvg';

  return svgElement;
}
