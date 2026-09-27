/**
 * Logo Changer - Element Configuration & Inspector Modal
 * Displays an interactive live vector preview, lists detected elements/layers,
 * allows renaming them, toggling modifiability (opt-in/out), and highlights shapes on hover.
 */

import { qs, qsa, showToast, normalizeHex } from './utils.js';
import { sanitizeSvg, parseSvgLayers } from './svg-parser.js';
import { LOGO_REGISTRY } from './config.js';
import { getPermanentLogos } from './permanent-storage.js';

let activeLayers = [];
let currentSvgMarkup = '';
let currentLogoTitle = '';
let applyCallback = null;
let currentStorageMode = 'permanent';
let currentReplaceTargetId = '';

/**
 * Open the element configuration popup modal
 */
export function openElementConfigModal({
  svgContent,
  logoName = 'Custom Vector',
  defaultMode = 'permanent',
  presetReplaceTarget = '',
  onApply = null
}) {
  const modal = qs('#elementConfigModal');
  if (!modal) return;

  currentSvgMarkup = svgContent;
  currentLogoTitle = logoName;
  applyCallback = onApply;
  currentStorageMode = defaultMode;
  currentReplaceTargetId = presetReplaceTarget;

  // Set titles
  const titleText = qs('#modalTitleText');
  if (titleText) titleText.textContent = `Configure Elements: ${logoName}`;

  // Parse SVG for preview
  let previewSvg;
  try {
    previewSvg = sanitizeSvg(svgContent);
  } catch (err) {
    console.error('Failed to parse SVG for modal preview:', err);
    showToast('Invalid SVG format', 'info');
    return;
  }

  // Parse layers and tag SVG elements with layer IDs
  activeLayers = parseSvgLayers(previewSvg);

  // Mount preview SVG
  const previewContainer = qs('#modalPreviewSvg');
  if (previewContainer) {
    previewContainer.innerHTML = '';
    previewSvg.id = 'modalPreviewSvgNode';
    previewContainer.appendChild(previewSvg);

    // Allow clicking SVG elements to highlight and focus corresponding input
    bindSvgElementClicks(previewSvg);
  }

  // Setup storage mode pills & replace dropdown
  setupStorageModeControls(defaultMode, presetReplaceTarget);

  // Update badges & populate elements list
  updateModalBadges();
  renderElementsList();

  // Show modal
  modal.classList.add('open');
  bindModalEventListeners();
}

/**
 * Setup Storage Mode pills and Replace dropdown
 */
function setupStorageModeControls(defaultMode, presetReplaceTarget) {
  const pills = qsa('.storage-mode-pill');
  const replaceRow = qs('#storageReplaceRow');
  const replaceSelect = qs('#storageReplaceSelect');

  // Populate replace dropdown
  if (replaceSelect) {
    replaceSelect.innerHTML = '';

    const permLogos = getPermanentLogos();
    if (permLogos.length > 0) {
      const permGroup = document.createElement('optgroup');
      permGroup.label = 'Permanent Custom Logos';
      permLogos.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = `⭐ ${l.name} (${l.layers?.length || 0} layers)`;
        if (presetReplaceTarget === l.id) opt.selected = true;
        permGroup.appendChild(opt);
      });
      replaceSelect.appendChild(permGroup);
    }

    const presetGroup = document.createElement('optgroup');
    presetGroup.label = 'Built-in Brandmarks';
    Object.values(LOGO_REGISTRY).forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = `🏷️ ${l.name}`;
      if (presetReplaceTarget === l.id) opt.selected = true;
      presetGroup.appendChild(opt);
    });
    replaceSelect.appendChild(presetGroup);

    currentReplaceTargetId = replaceSelect.value || '';
    replaceSelect.onchange = (e) => {
      currentReplaceTargetId = e.target.value;
    };
  }

  // Update active pill
  pills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.mode === defaultMode);
    pill.onclick = () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentStorageMode = pill.dataset.mode;
      if (replaceRow) {
        replaceRow.classList.toggle('visible', currentStorageMode === 'replace');
      }
    };
  });

  if (replaceRow) {
    replaceRow.classList.toggle('visible', defaultMode === 'replace');
  }
}

/**
 * Close the configuration modal
 */
export function closeElementConfigModal() {
  const modal = qs('#elementConfigModal');
  if (modal) {
    modal.classList.remove('open');
    clearHighlights();
  }
}

/**
 * Bind backdrop, close, escape, and footer action buttons
 */
function bindModalEventListeners() {
  const modal = qs('#elementConfigModal');
  const closeBtn = qs('#modalCloseBtn');
  const cancelBtn = qs('#btnCancelConfig');
  const applyBtn = qs('#btnApplyConfig');
  const selectAllBtn = qs('#btnSelectAllElements');
  const deselectAllBtn = qs('#btnDeselectAllElements');

  if (closeBtn) closeBtn.onclick = () => closeElementConfigModal();
  if (cancelBtn) cancelBtn.onclick = () => closeElementConfigModal();

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeElementConfigModal();
    };
  }

  // Keydown ESC
  const handleKeydown = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeElementConfigModal();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);

  // Batch Select / Deselect
  if (selectAllBtn) {
    selectAllBtn.onclick = () => {
      activeLayers.forEach(l => l.enabled = true);
      renderElementsList();
      updateModalBadges();
    };
  }

  if (deselectAllBtn) {
    deselectAllBtn.onclick = () => {
      activeLayers.forEach(l => l.enabled = false);
      renderElementsList();
      updateModalBadges();
    };
  }

  // Apply Button
  if (applyBtn) {
    applyBtn.onclick = () => {
      const enabledLayers = activeLayers.filter(l => l.enabled);
      
      const chosenColors = {};
      const chosenStrokeWidths = {};
      activeLayers.forEach(l => {
        const key = l.customName || l.name;
        chosenColors[key] = l.currentColor || l.originalHex;
        if (l.attr === 'stroke') {
          chosenStrokeWidths[key] = l.strokeWidth !== undefined ? l.strokeWidth : (l.originalStrokeWidth || 1);
        }
      });

      if (typeof applyCallback === 'function') {
        applyCallback({
          layers: activeLayers,
          enabledLayers,
          logoName: currentLogoTitle,
          svgContent: currentSvgMarkup,
          storageMode: currentStorageMode,
          replaceTargetId: currentReplaceTargetId,
          chosenColors,
          chosenStrokeWidths
        });
      }

      closeElementConfigModal();
    };
  }
}

/**
 * Render list of detected elements with interactive controls
 */
function renderElementsList() {
  const container = qs('#modalElementsScroll');
  if (!container) return;

  container.innerHTML = '';

  if (activeLayers.length === 0) {
    container.innerHTML = `<div class="help-note" style="padding: 20px; text-align: center;">No configurable vector elements detected in this file.</div>`;
    return;
  }

  activeLayers.forEach((layer, idx) => {
    const card = document.createElement('div');
    card.className = `element-config-card ${layer.enabled ? '' : 'disabled'}`;
    card.dataset.layerId = layer.id;

    const currentColor = normalizeHex(layer.currentColor || layer.originalHex);
    layer.currentColor = currentColor;

    const isStroke = layer.attr === 'stroke';
    const strokeWidthVal = layer.strokeWidth !== undefined ? layer.strokeWidth : (layer.originalStrokeWidth || 1);
    layer.strokeWidth = strokeWidthVal;

    let strokeControlHtml = '';
    if (isStroke) {
      strokeControlHtml = `
        <div class="element-stroke-row">
          <span class="element-stroke-label">Width:</span>
          <div class="modal-stroke-interactive-group">
            <button type="button" class="stroke-step-btn modal-minus-btn" title="Decrease stroke width by 0.5px" aria-label="Decrease stroke width">−</button>
            <div class="stroke-slider-track-wrap">
              <input type="range" class="element-stroke-slider" min="0" max="30" step="0.1" value="${strokeWidthVal}" data-layer-idx="${idx}">
            </div>
            <button type="button" class="stroke-step-btn modal-plus-btn" title="Increase stroke width by 0.5px" aria-label="Increase stroke width">+</button>
            <div class="stroke-text-input-wrap modal-stroke-wrap">
              <input type="text" class="element-stroke-text-input" value="${Number.isInteger(strokeWidthVal) ? strokeWidthVal : strokeWidthVal.toFixed(1)}" data-layer-idx="${idx}" title="Click or type exact stroke width in px">
              <span class="stroke-unit-label">px</span>
            </div>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <label class="element-optin-label" title="${layer.enabled ? 'Click to disable customization' : 'Click to enable customization'}">
        <input type="checkbox" class="element-optin-checkbox" ${layer.enabled ? 'checked' : ''} data-layer-idx="${idx}">
      </label>

      <div class="element-color-picker-wrapper">
        <label class="element-swatch-btn" style="background-color: ${currentColor};" title="Click to choose color">
          <input type="color" class="element-color-input" value="${currentColor}" data-layer-idx="${idx}">
        </label>
        <input type="text" class="element-hex-input" value="${currentColor.toUpperCase()}" maxlength="7" data-layer-idx="${idx}" title="Hex code">
      </div>

      <div class="element-name-wrapper">
        <input type="text" class="element-name-input" value="${layer.customName || layer.name}" placeholder="Element name..." data-layer-idx="${idx}">
        <div class="element-meta-tags">
          <span class="element-count-badge">${layer.count} ${layer.count === 1 ? 'shape' : 'shapes'}</span>
          <span>•</span>
          <span>${isStroke ? 'STROKE' : 'FILL'}</span>
        </div>
        ${strokeControlHtml}
      </div>

      <span class="element-status-pill ${layer.enabled ? 'modifiable' : 'locked'}">
        ${layer.enabled ? 'Modifiable' : 'Locked'}
      </span>
    `;

    // 1. Checkbox toggle
    const checkbox = card.querySelector('.element-optin-checkbox');
    checkbox.addEventListener('change', (e) => {
      layer.enabled = e.target.checked;
      card.classList.toggle('disabled', !layer.enabled);
      const pill = card.querySelector('.element-status-pill');
      if (pill) {
        pill.className = `element-status-pill ${layer.enabled ? 'modifiable' : 'locked'}`;
        pill.textContent = layer.enabled ? 'Modifiable' : 'Locked';
      }
      updateModalBadges();
    });

    // 2. Color picker & Hex input (Change color directly in modal!)
    const colorInput = card.querySelector('.element-color-input');
    const hexInput = card.querySelector('.element-hex-input');
    const swatchBtn = card.querySelector('.element-swatch-btn');

    colorInput.addEventListener('input', (e) => {
      const val = e.target.value;
      layer.currentColor = val;
      swatchBtn.style.backgroundColor = val;
      hexInput.value = val.toUpperCase();
      updateLayerColorInPreview(layer.id, val, layer.attr);
    });

    hexInput.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        layer.currentColor = val;
        colorInput.value = val;
        swatchBtn.style.backgroundColor = val;
        updateLayerColorInPreview(layer.id, val, layer.attr);
      }
    });

    // 2b. Stroke Width Slider & Text Input in modal
    if (isStroke) {
      const swSlider = card.querySelector('.element-stroke-slider');
      const swTextInput = card.querySelector('.element-stroke-text-input');
      const swMinus = card.querySelector('.modal-minus-btn');
      const swPlus = card.querySelector('.modal-plus-btn');

      const applyModalStroke = (newVal, syncSlider = true, syncText = true) => {
        let num = parseFloat(newVal);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 100) num = 100;
        const rounded = Math.round(num * 10) / 10;
        layer.strokeWidth = rounded;

        if (syncSlider && swSlider) {
          swSlider.value = rounded <= 30 ? rounded : 30;
        }
        if (syncText && swTextInput) {
          swTextInput.value = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
        }
        updateLayerStrokeWidthInPreview(layer.id, rounded);
      };

      if (swSlider) {
        swSlider.addEventListener('input', (e) => {
          applyModalStroke(e.target.value, false, true);
        });
      }

      if (swTextInput) {
        swTextInput.addEventListener('input', (e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          const val = parseFloat(raw);
          if (!isNaN(val)) {
            applyModalStroke(val, true, false);
          }
        });

        swTextInput.addEventListener('change', (e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          const val = parseFloat(raw);
          applyModalStroke(!isNaN(val) ? val : 1, true, true);
        });

        swTextInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            swTextInput.blur();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const cur = parseFloat(swTextInput.value) || 0;
            applyModalStroke(cur + 0.5, true, true);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const cur = parseFloat(swTextInput.value) || 0;
            applyModalStroke(Math.max(0, cur - 0.5), true, true);
          }
        });

        swTextInput.addEventListener('focus', () => {
          swTextInput.select();
        });
      }

      if (swMinus) {
        swMinus.addEventListener('click', () => {
          const cur = parseFloat(swTextInput?.value || swSlider?.value || 1) || 0;
          applyModalStroke(Math.max(0, cur - 0.5), true, true);
        });
      }

      if (swPlus) {
        swPlus.addEventListener('click', () => {
          const cur = parseFloat(swTextInput?.value || swSlider?.value || 1) || 0;
          applyModalStroke(cur + 0.5, true, true);
        });
      }
    }

    // 3. Name input change
    const nameInput = card.querySelector('.element-name-input');
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      layer.customName = val || layer.name;
    });

    nameInput.addEventListener('focus', () => {
      highlightLayerInPreview(layer.id);
      card.classList.add('active-hover');
    });

    nameInput.addEventListener('blur', () => {
      clearHighlights();
      card.classList.remove('active-hover');
    });

    // 4. Hover to highlight preview SVG elements
    card.addEventListener('mouseenter', () => {
      highlightLayerInPreview(layer.id);
      card.classList.add('active-hover');
    });

    card.addEventListener('mouseleave', () => {
      if (document.activeElement !== nameInput && document.activeElement !== hexInput) {
        clearHighlights();
        card.classList.remove('active-hover');
      }
    });

    container.appendChild(card);
  });
}

/**
 * Update layer color live in the modal preview SVG
 */
function updateLayerColorInPreview(layerId, newColor, attr) {
  const previewSvg = qs('#modalPreviewSvgNode');
  if (!previewSvg) return;

  const matched = previewSvg.querySelectorAll(`[data-layer-id="${layerId}"]`);
  matched.forEach(el => {
    if (attr === 'stroke') {
      el.setAttribute('stroke', newColor);
      el.style.stroke = newColor;
    } else {
      el.setAttribute('fill', newColor);
      el.style.fill = newColor;
      if (el.style && el.style.cssText) {
        el.style.cssText = el.style.cssText.replace(/fill:\s*[^;]+;?/gi, `fill: ${newColor};`);
      }
    }
  });
}

/**
 * Update layer stroke width live in the modal preview SVG
 */
function updateLayerStrokeWidthInPreview(layerId, strokeWidth) {
  const previewSvg = qs('#modalPreviewSvgNode');
  if (!previewSvg) return;

  const matched = previewSvg.querySelectorAll(`[data-layer-id="${layerId}"]`);
  matched.forEach(el => {
    el.setAttribute('stroke-width', strokeWidth);
    el.style.strokeWidth = `${strokeWidth}px`;
    if (el.style && el.style.cssText) {
      el.style.cssText = el.style.cssText.replace(/stroke-width:\s*[^;]+;?/gi, `stroke-width: ${strokeWidth}px;`);
    }
  });
}

/**
 * Highlight matching SVG elements in the preview window
 */
function highlightLayerInPreview(layerId) {
  clearHighlights();

  const previewSvg = qs('#modalPreviewSvgNode');
  if (!previewSvg) return;

  const matched = previewSvg.querySelectorAll(`[data-layer-id="${layerId}"]`);
  matched.forEach(el => {
    el.classList.add('element-highlight-pulse');
  });
}

/**
 * Clear all highlights from preview SVG
 */
function clearHighlights() {
  const previewSvg = qs('#modalPreviewSvgNode');
  if (!previewSvg) return;

  const highlighted = previewSvg.querySelectorAll('.element-highlight-pulse');
  highlighted.forEach(el => {
    el.classList.remove('element-highlight-pulse');
  });
}

/**
 * Allow clicking shapes in the preview SVG to focus the card in the list
 */
function bindSvgElementClicks(previewSvg) {
  previewSvg.addEventListener('click', (e) => {
    const target = e.target.closest('[data-layer-id]');
    if (!target) return;

    const layerId = target.dataset.layerId;
    highlightLayerInPreview(layerId);

    const card = qs(`.element-config-card[data-layer-id="${layerId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.classList.add('active-hover');
      const input = card.querySelector('.element-name-input');
      if (input) input.focus();
    }
  });
}

/**
 * Update the header badge and footer summary counts
 */
function updateModalBadges() {
  const totalCount = activeLayers.length;
  const enabledCount = activeLayers.filter(l => l.enabled).length;

  const countBadge = qs('#modalElementCountBadge');
  if (countBadge) {
    countBadge.textContent = `${totalCount} Detected`;
  }

  const summary = qs('#modalSelectedCountSummary');
  if (summary) {
    summary.innerHTML = `<strong>${enabledCount}</strong> of <strong>${totalCount}</strong> elements selected for modification`;
  }
}
