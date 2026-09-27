/**
 * Logo Changer - Permanent Storage Manager
 * Persists user-added logos in browser localStorage, allowing permanent retention,
 * library card integration, SVG file replacement, and deletion.
 */

const STORAGE_KEY = 'logo_studio_permanent_logos';

/**
 * Retrieve all permanent logos stored in localStorage
 * @returns {Array<Object>}
 */
export function getPermanentLogos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse permanent logos from storage:', err);
    return [];
  }
}

/**
 * Get a specific permanent logo by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getPermanentLogoById(id) {
  const logos = getPermanentLogos();
  return logos.find(logo => logo.id === id) || null;
}

/**
 * Save a new permanent logo to storage
 * @param {Object} logoData { name, svgContent, layers, defaultColors, subtitle }
 * @returns {Object} Saved logo object
 */
export function savePermanentLogo({ name, svgContent, layers = [], defaultColors = {}, defaultStrokeWidths = {}, subtitle = 'Custom Brandmark' }) {
  const logos = getPermanentLogos();
  const id = `perm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newLogo = {
    id,
    name: name || 'Custom Logo',
    subtitle,
    svgContent,
    layers: layers.map(l => ({
      id: l.id,
      name: l.name,
      customName: l.customName || l.name,
      originalHex: l.originalHex,
      enabled: l.enabled !== false,
      attr: l.attr || 'fill',
      strokeWidth: l.strokeWidth !== undefined ? l.strokeWidth : (l.originalStrokeWidth || 1),
      originalStrokeWidth: l.originalStrokeWidth || l.strokeWidth || 1
    })),
    defaultColors: { ...defaultColors },
    defaultStrokeWidths: { ...defaultStrokeWidths },
    createdAt: new Date().toISOString(),
    isPermanent: true
  };

  logos.push(newLogo);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
  } catch (err) {
    console.error('Failed to save permanent logo to localStorage:', err);
  }

  return newLogo;
}

/**
 * Replace the SVG content and layers of an existing permanent logo
 * @param {string} targetLogoId
 * @param {Object} updateData { name, svgContent, layers, defaultColors, defaultStrokeWidths }
 * @returns {Object|null} Updated logo object
 */
export function replacePermanentLogo(targetLogoId, { name, svgContent, layers = [], defaultColors = {}, defaultStrokeWidths = {} }) {
  const logos = getPermanentLogos();
  const index = logos.findIndex(l => l.id === targetLogoId);

  if (index === -1) {
    console.warn(`Permanent logo "${targetLogoId}" not found for replacement. Creating new entry instead.`);
    return savePermanentLogo({ name, svgContent, layers, defaultColors, defaultStrokeWidths });
  }

  const existing = logos[index];
  existing.name = name || existing.name;
  existing.svgContent = svgContent;
  existing.layers = layers.map(l => ({
    id: l.id,
    name: l.name,
    customName: l.customName || l.name,
    originalHex: l.originalHex,
    enabled: l.enabled !== false,
    attr: l.attr || 'fill',
    strokeWidth: l.strokeWidth !== undefined ? l.strokeWidth : (l.originalStrokeWidth || 1),
    originalStrokeWidth: l.originalStrokeWidth || l.strokeWidth || 1
  }));
  existing.defaultColors = { ...defaultColors };
  existing.defaultStrokeWidths = { ...defaultStrokeWidths };
  existing.updatedAt = new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
  } catch (err) {
    console.error('Failed to update permanent logo in localStorage:', err);
  }

  return existing;
}

/**
 * Delete a permanent logo from storage
 * @param {string} logoId
 * @returns {boolean} Success status
 */
export function deletePermanentLogo(logoId) {
  let logos = getPermanentLogos();
  const initialLen = logos.length;
  logos = logos.filter(l => l.id !== logoId);

  if (logos.length !== initialLen) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
      return true;
    } catch (err) {
      console.error('Failed to delete permanent logo from localStorage:', err);
    }
  }
  return false;
}
