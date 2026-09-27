/**
 * Logo Changer - SVG Auto-Parser & Layer Detector
 * Analyzes arbitrary SVG vectors to extract distinct visual layers, fills, and strokes.
 */

import { normalizeHex } from './utils.js';

/**
 * Generates a human-friendly color descriptor for a hex code
 */
function getFriendlyColorDescriptor(hex) {
  const cleanHex = hex.replace('#', '').toLowerCase();
  if (cleanHex.length !== 6) return 'Color';
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Check grayscale
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  if (diff < 15) {
    if (r > 230) return 'Snow White';
    if (r > 170) return 'Light Silver';
    if (r > 100) return 'Medium Gray';
    if (r > 40) return 'Charcoal Slate';
    return 'Deep Black';
  }

  // Check hues
  if (r > 180 && g > 130 && b < 80) return 'Warm Gold';
  if (r > 200 && g > 80 && b < 50) return 'Vibrant Saffron';
  if (r > 180 && g < 70 && b < 70) return 'Royal Crimson';
  if (r > 160 && g < 90 && b > 140) return 'Deep Purple';
  if (r < 70 && g > 150 && b < 100) return 'Emerald Green';
  if (r < 70 && g > 120 && b > 180) return 'Ocean Azure';
  if (r < 50 && g < 90 && b > 160) return 'Royal Blue';
  if (r > 180 && g > 160 && b > 80) return 'Mustard Amber';
  if (r > 150 && g < 100 && b < 60) return 'Terracotta Spice';
  if (r > 180 && g < 130 && b > 80) return 'Magenta Rose';

  return 'Accent Tone';
}

export function parseSvgLayers(svgElement) {
  const elements = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, text');
  const layerMap = new Map();

  elements.forEach((el, index) => {
    const styleStr = el.getAttribute('style') || '';

    // 1. Check fill
    let fill = el.getAttribute('fill');
    if (!fill && el.style.fill) fill = el.style.fill;
    const fillMatch = styleStr.match(/fill:\s*([^;]+)/i);
    if (fillMatch && !fill) {
      fill = fillMatch[1].trim();
    }

    if (fill && fill !== 'none' && fill !== 'transparent') {
      const hex = normalizeHex(fill);
      const fillKey = `fill:${hex}`;
      if (!layerMap.has(fillKey)) {
        layerMap.set(fillKey, {
          property: 'fill',
          hex,
          items: []
        });
      }
      layerMap.get(fillKey).items.push({
        element: el,
        property: 'fill',
        originalColor: hex,
        index,
        idAttr: el.id || el.closest('[id]')?.id || ''
      });
    }

    // 2. Check stroke
    let stroke = el.getAttribute('stroke');
    if (!stroke && el.style.stroke) stroke = el.style.stroke;
    const strokeMatch = styleStr.match(/stroke:\s*([^;]+)/i);
    if (strokeMatch && !stroke) {
      stroke = strokeMatch[1].trim();
    }

    if (stroke && stroke !== 'none' && stroke !== 'transparent') {
      const hex = normalizeHex(stroke);
      
      // Extract element stroke-width
      let sw = el.getAttribute('stroke-width');
      if (!sw && el.style.strokeWidth) sw = el.style.strokeWidth;
      const swMatch = styleStr.match(/stroke-width:\s*([^;]+)/i);
      if (swMatch && !sw) sw = swMatch[1].trim();
      let strokeWidthNum = sw ? parseFloat(sw) : 1;
      if (isNaN(strokeWidthNum) || strokeWidthNum <= 0) strokeWidthNum = 1;
      // Round to 1 decimal place for clustering identical strokes
      const swRounded = Math.round(strokeWidthNum * 10) / 10;

      const strokeKey = `stroke:${hex}:${swRounded}`;
      if (!layerMap.has(strokeKey)) {
        layerMap.set(strokeKey, {
          property: 'stroke',
          hex,
          strokeWidth: swRounded,
          items: []
        });
      }
      layerMap.get(strokeKey).items.push({
        element: el,
        property: 'stroke',
        originalColor: hex,
        strokeWidth: strokeWidthNum,
        index,
        idAttr: el.id || el.closest('[id]')?.id || ''
      });
    }
  });

  // Format into friendly target layer descriptors
  const layers = [];
  let layerIndex = 1;

  layerMap.forEach((group) => {
    const { property, hex, items, strokeWidth } = group;
    const layerId = `layer-${layerIndex}`;
    
    // Tag the DOM elements with the layer ID for fast preview interaction
    items.forEach(item => {
      if (item.element) {
        item.element.dataset.layerId = layerId;
      }
    });

    // Determine smart descriptive name
    const sampleId = items.find(it => it.idAttr)?.idAttr;
    const colorDesc = getFriendlyColorDescriptor(hex);
    let defaultName = '';
    
    if (sampleId && !sampleId.startsWith('_') && !sampleId.startsWith('svg_')) {
      const cleaned = sampleId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      defaultName = property === 'stroke' 
        ? `${cleaned} Stroke (${colorDesc})`
        : `${cleaned} (${colorDesc})`;
    } else {
      defaultName = property === 'stroke'
        ? `Stroke / Outline (${colorDesc})`
        : `${colorDesc} (${hex.toUpperCase()})`;
    }

    layers.push({
      id: layerId,
      name: defaultName,
      customName: defaultName,
      originalHex: hex,
      currentColor: hex,
      items,
      count: items.length,
      enabled: true,
      attr: property,
      strokeWidth: property === 'stroke' ? (strokeWidth || 1) : undefined,
      originalStrokeWidth: property === 'stroke' ? (strokeWidth || 1) : undefined
    });
    layerIndex++;
  });

  return layers;
}

export function sanitizeSvg(svgText) {
  // Strip out malicious scripts or unwanted tags, ensure valid SVG structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) throw new Error('Invalid SVG markup: No <svg> root element found');

  // Remove <script> elements
  svg.querySelectorAll('script').forEach(s => s.remove());

  // Ensure viewBox exists
  if (!svg.getAttribute('viewBox')) {
    const width = parseFloat(svg.getAttribute('width')) || 800;
    const height = parseFloat(svg.getAttribute('height')) || 800;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  return svg;
}
