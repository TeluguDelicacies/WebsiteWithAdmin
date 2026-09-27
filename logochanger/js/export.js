/**
 * Logo Changer - Export Engine
 * Generates ultra HD raster assets (PNG, JPG, WebP) and clean vector SVGs with multi-DPI scales.
 */

import { downloadBlob, copyBlobToClipboard, showToast } from './utils.js';

export async function exportAsset(svgElement, state, options = {}) {
  if (!svgElement) {
    showToast('No active SVG found to export', 'info');
    return;
  }

  const format = options.format || state.export.format || 'png';
  const scale = options.scale || state.export.scale || 2;
  const quality = options.quality !== undefined ? options.quality : state.export.quality;
  const fileNameBase = (state.activeLogoId === 'custom' ? state.customSvgName : state.activeLogoId) || 'logo';

  if (format === 'svg') {
    exportPureSvg(svgElement, fileNameBase);
  } else {
    await exportRaster(svgElement, state, { format, scale, quality, fileNameBase });
  }
}

function exportPureSvg(svgElement, fileNameBase) {
  const clonedSvg = svgElement.cloneNode(true);
  
  // Clean up any temporary preview IDs or classes
  clonedSvg.removeAttribute('id');
  clonedSvg.style.transform = '';
  clonedSvg.style.filter = '';

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);

  // Ensure xmlns attributes exist
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${fileNameBase}-custom.svg`);
  showToast(`Exported pure vector SVG successfully!`, 'success');
}

async function exportRaster(svgElement, state, { format, scale, quality, fileNameBase }) {
  showToast(`Rendering ${format.toUpperCase()} at ${scale}x scale...`, 'info');

  const clonedSvg = svgElement.cloneNode(true);
  clonedSvg.removeAttribute('id');

  // Compute viewbox and dimensions
  let vb = clonedSvg.viewBox?.baseVal;
  let baseWidth = vb && vb.width > 0 ? vb.width : parseFloat(clonedSvg.getAttribute('width')) || 800;
  let baseHeight = vb && vb.height > 0 ? vb.height : parseFloat(clonedSvg.getAttribute('height')) || 800;

  // Render SVG to image via data URL
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = svgUrl;
  });

  // Calculate target canvas size with scale factor
  const targetWidth = Math.round(baseWidth * scale);
  const targetHeight = Math.round(baseHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  // Enable high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If JPG or user portal environment selected, fill canvas background
  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  URL.revokeObjectURL(svgUrl);

  const mimeType = format === 'jpg' ? 'image/jpeg' : (format === 'webp' ? 'image/webp' : 'image/png');
  
  canvas.toBlob(blob => {
    if (!blob) {
      showToast('Failed to create image blob', 'info');
      return;
    }
    const ext = format === 'jpg' ? 'jpg' : (format === 'webp' ? 'webp' : 'png');
    downloadBlob(blob, `${fileNameBase}-${scale}x.${ext}`);
    showToast(`Saved ${fileNameBase}-${scale}x.${ext} (${targetWidth}x${targetHeight}px)`, 'success');
  }, mimeType, quality);
}

export async function copyCanvasToClipboard(svgElement, state) {
  try {
    const clonedSvg = svgElement.cloneNode(true);
    let vb = clonedSvg.viewBox?.baseVal;
    let baseWidth = vb && vb.width > 0 ? vb.width : 800;
    let baseHeight = vb && vb.height > 0 ? vb.height : 800;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = baseWidth * 2;
    canvas.height = baseHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(svgUrl);

    canvas.toBlob(async blob => {
      const success = await copyBlobToClipboard(blob);
      if (success) {
        showToast('HD Logo copied to clipboard!', 'success');
      } else {
        showToast('Clipboard copy not supported in this browser context', 'info');
      }
    }, 'image/png');
  } catch (err) {
    console.error('Clipboard copy error:', err);
    showToast('Failed to copy to clipboard', 'info');
  }
}
