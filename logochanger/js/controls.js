/**
 * Logo Changer - UI Controls & Interactions
 * Builds sidebar widgets, binds events, and synchronizes with application state.
 */

import { LOGO_REGISTRY, COLOR_PALETTES, PORTAL_BACKGROUNDS } from './config.js';
import { appState } from './state.js';
import { qs, qsa, normalizeHex, showToast } from './utils.js';
import { exportAsset, copyCanvasToClipboard } from './export.js';
import { openElementConfigModal } from './modal.js';
import { getPermanentLogos, savePermanentLogo, replacePermanentLogo, deletePermanentLogo } from './permanent-storage.js';

let pendingReplaceLogoId = null;

export function initControls() {
  renderLogoGrid();
  renderPalettePresets();
  renderPortalGrid();
  bindSidebarTabs();
  bindTransformSliders();
  bindEffectToggles();
  bindExportControls();
  bindUploadDropzone();
  bindConfigureButtons();
}

/**
 * Render the logo selection grid cards
 */
function renderLogoGrid() {
  const container = qs('#logoGrid');
  if (!container) return;

  container.innerHTML = '';
  const currentActiveId = appState.getState().activeLogoId;

  // 1. Built-in presets
  Object.values(LOGO_REGISTRY).forEach(logo => {
    const card = document.createElement('div');
    card.className = `logo-option-card ${currentActiveId === logo.id ? 'selected' : ''}`;
    card.dataset.logoId = logo.id;

    card.innerHTML = `
      <div class="logo-option-preview">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      </div>
      <span class="logo-option-name">${logo.name}</span>
      <span class="logo-option-badge">${logo.subtitle}</span>
      <div class="logo-card-actions">
        <button class="logo-card-action-btn replace-btn" title="Replace SVG file for ${logo.name}" data-logo-id="${logo.id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          Replace SVG
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.logo-card-action-btn')) return;
      qsa('.logo-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      appState.setActiveLogo(logo.id);
    });

    const replaceBtn = card.querySelector('.replace-btn');
    if (replaceBtn) {
      replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerReplaceLogoFile(logo.id);
      });
    }

    container.appendChild(card);
  });

  // 2. Permanent custom logos from storage
  const permLogos = getPermanentLogos();
  permLogos.forEach(logo => {
    const card = document.createElement('div');
    card.className = `logo-option-card permanent-card ${currentActiveId === logo.id ? 'selected' : ''}`;
    card.dataset.logoId = logo.id;

    card.innerHTML = `
      <div class="logo-option-preview" style="color: var(--accent-gold);">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <span class="logo-option-name">${logo.name}</span>
      <span class="logo-option-badge" style="color: var(--accent-gold); border-color: rgba(230,175,46,0.35);">⭐ Permanent</span>
      <div class="logo-card-actions">
        <button class="logo-card-action-btn replace-btn" title="Replace SVG file for ${logo.name}" data-logo-id="${logo.id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          Replace
        </button>
        <button class="logo-card-action-btn delete delete-btn" title="Delete from permanent library" data-logo-id="${logo.id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.logo-card-action-btn')) return;
      qsa('.logo-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      appState.setActiveLogo(logo.id);
    });

    const replaceBtn = card.querySelector('.replace-btn');
    if (replaceBtn) {
      replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerReplaceLogoFile(logo.id);
      });
    }

    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${logo.name}" from your permanent library?`)) {
          deletePermanentLogo(logo.id);
          showToast(`Deleted "${logo.name}"`);
          if (appState.getState().activeLogoId === logo.id) {
            appState.setActiveLogo('td');
          }
          renderLogoGrid();
        }
      });
    }

    container.appendChild(card);
  });
}


/**
 * Render dynamic color controls based on current logo targets or custom layers
 */
export function updateColorControls(state) {
  const container = qs('#colorElementsList');
  if (!container) return;

  container.innerHTML = '';
  const { activeLogoId, colorOverrides } = state;
  const config = LOGO_REGISTRY[activeLogoId];

  let targetList = [];
  if (state.customLayers && state.customLayers.length > 0) {
    // Only display user-enabled modifiable elements with their custom assigned names!
    targetList = state.customLayers
      .filter(layer => layer.enabled !== false)
      .map(layer => ({
        name: layer.customName || layer.name,
        default: layer.originalHex,
        attr: layer.attr || 'fill',
        strokeWidth: layer.strokeWidth !== undefined ? layer.strokeWidth : (layer.originalStrokeWidth || 1)
      }));
  } else if (config && config.targets) {
    targetList = config.targets;
  }

  if (targetList.length === 0) {
    container.innerHTML = `<div class="help-note" style="padding: 12px; text-align: center;">No customizable color layers active for this logo. Click "⚙ Rename / Configure" to enable elements.</div>`;
    return;
  }

  targetList.forEach(target => {
    const isStroke = target.attr === 'stroke';
    const currentColor = colorOverrides[target.name] || target.default || '#ffffff';
    const hexNorm = normalizeHex(currentColor);

    const item = document.createElement('div');
    item.className = `color-element-item ${isStroke ? 'stroke-element-item' : ''}`;

    let strokeControlHtml = '';
    if (isStroke) {
      const currentSw = state.strokeWidthOverrides?.[target.name] ?? target.defaultStrokeWidth ?? target.strokeWidth ?? 1;
      const swVal = parseFloat(currentSw) || 1;
      strokeControlHtml = `
        <div class="layer-stroke-control-row">
          <div class="layer-stroke-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/></svg>
            <span>Stroke Width</span>
          </div>
          <div class="layer-stroke-interactive-group">
            <button type="button" class="stroke-step-btn stroke-minus-btn" title="Decrease stroke width by 0.5px" aria-label="Decrease stroke width">−</button>
            <div class="stroke-slider-track-wrap">
              <input type="range" class="layer-stroke-slider" min="0" max="30" step="0.1" value="${swVal}" data-target-name="${target.name}">
            </div>
            <button type="button" class="stroke-step-btn stroke-plus-btn" title="Increase stroke width by 0.5px" aria-label="Increase stroke width">+</button>
            <div class="stroke-text-input-wrap">
              <input type="text" class="layer-stroke-text-input" value="${Number.isInteger(swVal) ? swVal : swVal.toFixed(1)}" data-target-name="${target.name}" title="Click or type exact stroke width in px">
              <span class="stroke-unit-label">px</span>
            </div>
          </div>
        </div>
      `;
    }

    item.innerHTML = `
      <div class="color-element-main-row">
        <div class="color-element-info">
          <span class="color-element-label">${target.name}</span>
          <span class="color-element-target ${isStroke ? 'stroke-target' : 'fill-target'}">
            ${isStroke ? '🖌️ STROKE' : '🎨 FILL'}
          </span>
        </div>
        <div class="color-picker-wrapper">
          <label class="color-swatch-btn" style="background-color: ${hexNorm}" title="Change color">
            <input type="color" value="${hexNorm}" data-target-name="${target.name}">
          </label>
          <input type="text" class="color-hex-input" value="${hexNorm}" maxlength="7" data-target-name="${target.name}" title="Hex code">
        </div>
      </div>
      ${strokeControlHtml}
    `;

    const colorInput = item.querySelector('input[type="color"]');
    const hexInput = item.querySelector('.color-hex-input');
    const swatch = item.querySelector('.color-swatch-btn');

    colorInput.addEventListener('input', (e) => {
      const val = e.target.value;
      hexInput.value = val.toUpperCase();
      swatch.style.backgroundColor = val;
      appState.setColorOverride(target.name, val);
    });

    hexInput.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        colorInput.value = val;
        swatch.style.backgroundColor = val;
        appState.setColorOverride(target.name, val);
      }
    });

    if (isStroke) {
      const slider = item.querySelector('.layer-stroke-slider');
      const textInput = item.querySelector('.layer-stroke-text-input');
      const minusBtn = item.querySelector('.stroke-minus-btn');
      const plusBtn = item.querySelector('.stroke-plus-btn');

      const applyStrokeVal = (newVal, syncSlider = true, syncText = true) => {
        let num = parseFloat(newVal);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 100) num = 100;
        const rounded = Math.round(num * 10) / 10;

        if (syncSlider && slider) {
          slider.value = rounded <= 30 ? rounded : 30;
        }
        if (syncText && textInput) {
          textInput.value = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
        }
        appState.setStrokeWidthOverride(target.name, rounded);
      };

      if (slider) {
        slider.addEventListener('input', (e) => {
          applyStrokeVal(e.target.value, false, true);
        });
      }

      if (textInput) {
        textInput.addEventListener('input', (e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          const val = parseFloat(raw);
          if (!isNaN(val)) {
            applyStrokeVal(val, true, false);
          }
        });

        textInput.addEventListener('change', (e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          const val = parseFloat(raw);
          applyStrokeVal(!isNaN(val) ? val : 1, true, true);
        });

        textInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            textInput.blur();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const cur = parseFloat(textInput.value) || 0;
            applyStrokeVal(cur + 0.5, true, true);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const cur = parseFloat(textInput.value) || 0;
            applyStrokeVal(Math.max(0, cur - 0.5), true, true);
          }
        });

        textInput.addEventListener('focus', () => {
          textInput.select();
        });
      }

      if (minusBtn) {
        minusBtn.addEventListener('click', () => {
          const cur = parseFloat(textInput?.value || slider?.value || 1) || 0;
          applyStrokeVal(Math.max(0, cur - 0.5), true, true);
        });
      }

      if (plusBtn) {
        plusBtn.addEventListener('click', () => {
          const cur = parseFloat(textInput?.value || slider?.value || 1) || 0;
          applyStrokeVal(cur + 0.5, true, true);
        });
      }
    }

    container.appendChild(item);
  });
}

/**
 * Render preset color palette chips
 */
function renderPalettePresets() {
  const container = qs('#palettePresets');
  if (!container) return;

  container.innerHTML = '';

  COLOR_PALETTES.forEach(pal => {
    const chip = document.createElement('button');
    chip.className = 'palette-chip';
    chip.title = pal.name;

    const dotsHtml = pal.colors.map(c => `<span class="palette-dot" style="background-color: ${c}"></span>`).join('');
    chip.innerHTML = `<div class="palette-dots">${dotsHtml}</div><span>${pal.name}</span>`;

    chip.addEventListener('click', () => {
      const state = appState.getState();
      const config = LOGO_REGISTRY[state.activeLogoId];
      if (!config && state.activeLogoId !== 'custom') return;

      let targets = [];
      if (state.customLayers && state.customLayers.length > 0) {
        targets = state.customLayers
          .filter(l => l.enabled !== false)
          .map(l => ({ name: l.customName || l.name }));
      } else if (config && config.targets) {
        targets = config.targets;
      }

      const newColors = {};
      targets.forEach((target, i) => {
        newColors[target.name] = pal.colors[i % pal.colors.length];
      });

      appState.setAllColors(newColors);
      showToast(`Applied "${pal.name}" palette!`);
    });

    container.appendChild(chip);
  });
}

/**
 * Render packaging mockup backgrounds grid
 */
function renderPortalGrid() {
  const container = qs('#portalPresetsGrid');
  if (!container) return;

  container.innerHTML = '';

  PORTAL_BACKGROUNDS.forEach(bg => {
    const card = document.createElement('div');
    card.className = `portal-card ${appState.getState().portalBg === bg.id ? 'active' : ''}`;
    card.dataset.portalId = bg.id;

    card.innerHTML = `
      <div class="portal-thumbnail" style="background: ${bg.color === 'transparent' ? 'repeating-conic-gradient(#262626 0% 25%, #181818 0% 50%) 50% / 10px 10px' : bg.color}"></div>
      <span class="portal-name">${bg.name}</span>
    `;

    card.addEventListener('click', () => {
      qsa('.portal-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      appState.setPortalBackground(bg.id);
    });

    container.appendChild(card);
  });
}

/**
 * Bind Sidebar Tabs Navigation
 */
function bindSidebarTabs() {
  const tabs = qsa('.tab-btn');
  const panels = qsa('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = qs(`#panel-${targetId}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/**
 * Bind vector transform controls (scale, rotate, flip, opacity)
 */
function bindTransformSliders() {
  const scaleSlider = qs('#scaleSlider');
  const scaleInput = qs('#scaleInput') || qs('#scaleBadge');
  const rotateSlider = qs('#rotateSlider');
  const rotateInput = qs('#rotateInput') || qs('#rotateBadge');
  const opacitySlider = qs('#opacitySlider');
  const opacityInput = qs('#opacityInput') || qs('#opacityBadge');

  const setInputValue = (el, val) => {
    if (!el) return;
    if (el.tagName === 'INPUT') el.value = val;
    else el.textContent = val;
  };

  // Scale
  if (scaleSlider && scaleInput) {
    scaleSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setInputValue(scaleInput, `${Math.round(val * 100)}%`);
      appState.setTransform({ scale: val });
    });

    if (scaleInput.tagName === 'INPUT') {
      scaleInput.addEventListener('change', (e) => {
        let raw = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
        if (isNaN(raw) || raw <= 0) raw = 100;
        // If user typed '1.5' instead of 150
        if (raw <= 3 && !e.target.value.includes('%')) raw = raw * 100;
        const scaleVal = Math.max(0.1, Math.min(5, raw / 100));
        scaleSlider.value = Math.max(0.2, Math.min(2.5, scaleVal));
        setInputValue(scaleInput, `${Math.round(scaleVal * 100)}%`);
        appState.setTransform({ scale: scaleVal });
      });
      scaleInput.addEventListener('focus', () => scaleInput.select());
    }
  }

  // Rotation
  if (rotateSlider && rotateInput) {
    rotateSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      setInputValue(rotateInput, `${val}°`);
      appState.setTransform({ rotate: val });
    });

    if (rotateInput.tagName === 'INPUT') {
      rotateInput.addEventListener('change', (e) => {
        let raw = parseInt(e.target.value.replace(/[^0-9\-]/g, ''), 10);
        if (isNaN(raw)) raw = 0;
        const deg = ((raw % 360) + 360) % 360;
        const clampedSlider = Math.max(-180, Math.min(180, raw));
        rotateSlider.value = clampedSlider;
        setInputValue(rotateInput, `${raw}°`);
        appState.setTransform({ rotate: raw });
      });
      rotateInput.addEventListener('focus', () => rotateInput.select());
    }
  }

  // Opacity
  if (opacitySlider && opacityInput) {
    opacitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setInputValue(opacityInput, `${Math.round(val * 100)}%`);
      appState.setTransform({ opacity: val });
    });

    if (opacityInput.tagName === 'INPUT') {
      opacityInput.addEventListener('change', (e) => {
        let raw = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
        if (isNaN(raw)) raw = 100;
        if (raw <= 1 && !e.target.value.includes('%')) raw = raw * 100;
        const opVal = Math.max(0.05, Math.min(1, raw / 100));
        opacitySlider.value = opVal;
        setInputValue(opacityInput, `${Math.round(opVal * 100)}%`);
        appState.setTransform({ opacity: opVal });
      });
      opacityInput.addEventListener('focus', () => opacityInput.select());
    }
  }

  const flipHBtn = qs('#flipHBtn');
  const flipVBtn = qs('#flipVBtn');

  if (flipHBtn) {
    flipHBtn.addEventListener('click', () => {
      const current = appState.getState().transform.flipH;
      flipHBtn.classList.toggle('active', !current);
      appState.setTransform({ flipH: !current });
    });
  }

  if (flipVBtn) {
    flipVBtn.addEventListener('click', () => {
      const current = appState.getState().transform.flipV;
      flipVBtn.classList.toggle('active', !current);
      appState.setTransform({ flipV: !current });
    });
  }

  const resetTransformBtn = qs('#resetTransformBtn');
  if (resetTransformBtn) {
    resetTransformBtn.addEventListener('click', () => {
      if (scaleSlider) scaleSlider.value = 1;
      setInputValue(scaleInput, '100%');
      if (rotateSlider) rotateSlider.value = 0;
      setInputValue(rotateInput, '0°');
      if (opacitySlider) opacitySlider.value = 1;
      setInputValue(opacityInput, '100%');
      if (flipHBtn) flipHBtn.classList.remove('active');
      if (flipVBtn) flipVBtn.classList.remove('active');
      appState.setTransform({ scale: 1, rotate: 0, flipH: false, flipV: false, opacity: 1 });
    });
  }
}



/**
 * Bind 3D tilt, drop shadow, glow, emboss toggles
 */
function bindEffectToggles() {
  const effectButtons = qsa('.effect-toggle-btn');
  effectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const effectName = btn.dataset.effect;
      appState.toggleEffect(effectName);
      btn.classList.toggle('active', Boolean(appState.getState().effects[effectName]));
    });
  });
}

/**
 * Bind Export Options & Export Triggers
 */
function bindExportControls() {
  const formatPills = qsa('.format-pill-btn');
  formatPills.forEach(pill => {
    pill.addEventListener('click', () => {
      formatPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const format = pill.dataset.format;
      appState.setExportConfig({ format });

      // Toggle quality slider visibility for JPG / WebP
      const qualityRow = qs('#qualityControlRow');
      if (qualityRow) {
        qualityRow.style.display = (format === 'jpg' || format === 'webp') ? 'flex' : 'none';
      }
    });
  });

  const scaleButtons = qsa('.scale-btn');
  scaleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scaleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scale = parseInt(btn.dataset.scale, 10);
      appState.setExportConfig({ scale });
    });
  });

  const qualitySlider = qs('#exportQualitySlider');
  const qualityBadge = qs('#exportQualityBadge');
  if (qualitySlider && qualityBadge) {
    qualitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      qualityBadge.textContent = `${Math.round(val * 100)}%`;
      appState.setExportConfig({ quality: val });
    });
  }

  const primaryExportBtn = qs('#btnPrimaryExport');
  if (primaryExportBtn) {
    primaryExportBtn.addEventListener('click', () => {
      const svg = qs('#logoRendererSvg');
      exportAsset(svg, appState.getState());
    });
  }

  const copyClipboardBtn = qs('#btnCopyClipboard');
  if (copyClipboardBtn) {
    copyClipboardBtn.addEventListener('click', () => {
      const svg = qs('#logoRendererSvg');
      copyCanvasToClipboard(svg, appState.getState());
    });
  }
}

/**
 * Bind Custom SVG Upload Box & Drag-and-Drop
 */
function bindUploadDropzone() {
  const dropzone = qs('#uploadDropzone');
  const fileInput = qs('#svgFileInput');
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleSvgFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleSvgFile(e.target.files[0]);
    }
  });
}

/**
 * Programmatically switch the active sidebar tab
 */
export function switchSidebarTab(tabName) {
  const tabs = qsa('.tab-btn');
  const panels = qsa('.tab-panel');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  panels.forEach(p => p.classList.toggle('active', p.id === `panel-${tabName}`));
}

/**
 * Bind Configure Elements buttons on Library and Colors panels
 */
function bindConfigureButtons() {
  const btnLogo = qs('#btnConfigureLogoElements');
  const btnColors = qs('#btnConfigureColorsElements');

  const openConfigForActiveLogo = () => {
    const state = appState.getState();
    const svgNode = qs('#logoRendererSvg');
    if (!svgNode) {
      showToast('No logo loaded on artboard to configure', 'info');
      return;
    }

    let svgMarkup = '';
    let logoTitle = 'Logo';

    if (state.activeLogoId === 'custom' && state.customSvgContent) {
      svgMarkup = state.customSvgContent;
      logoTitle = state.customSvgName || 'Custom Vector';
    } else {
      const config = LOGO_REGISTRY[state.activeLogoId];
      logoTitle = config ? config.name : 'Active Logo';
      svgMarkup = svgNode.outerHTML;
    }

    openElementConfigModal({
      svgContent: svgMarkup,
      logoName: logoTitle,
      defaultMode: state.activeLogoId.startsWith('perm_') ? 'permanent' : 'temporary',
      presetReplaceTarget: state.activeLogoId,
      onApply: ({ layers, logoName, svgContent, storageMode, replaceTargetId, chosenColors, chosenStrokeWidths }) => {
        if (storageMode === 'permanent') {
          const saved = savePermanentLogo({ name: logoName, svgContent, layers, defaultColors: chosenColors, defaultStrokeWidths: chosenStrokeWidths });
          renderLogoGrid();
          appState.setActiveLogo(saved.id);
          if (chosenColors) appState.setAllColors(chosenColors);
          if (chosenStrokeWidths) {
            Object.entries(chosenStrokeWidths).forEach(([k, v]) => appState.setStrokeWidthOverride(k, v));
          }
          switchSidebarTab('colors');
          showToast(`Saved "${saved.name}" to Permanent Library!`);
        } else if (storageMode === 'replace') {
          const effectiveTargetId = replaceTargetId || state.activeLogoId;
          const updated = replacePermanentLogo(effectiveTargetId, { name: logoName, svgContent, layers, defaultColors: chosenColors, defaultStrokeWidths: chosenStrokeWidths });
          renderLogoGrid();
          appState.setActiveLogo(effectiveTargetId);
          if (chosenColors) appState.setAllColors(chosenColors);
          if (chosenStrokeWidths) {
            Object.entries(chosenStrokeWidths).forEach(([k, v]) => appState.setStrokeWidthOverride(k, v));
          }
          switchSidebarTab('colors');
          showToast(`Updated "${updated.name}"!`);
        } else {
          appState.setCustomSvgWithLayers(svgContent, logoName, layers, chosenStrokeWidths);
          if (chosenColors) appState.setAllColors(chosenColors);
          switchSidebarTab('colors');
        }
      }
    });
  };

  if (btnLogo) btnLogo.addEventListener('click', openConfigForActiveLogo);
  if (btnColors) btnColors.addEventListener('click', openConfigForActiveLogo);
}

/**
 * Trigger file replacement for a specific logo
 */
function triggerReplaceLogoFile(logoId) {
  pendingReplaceLogoId = logoId;
  const fileInput = qs('#svgFileInput');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

function handleSvgFile(file) {
  if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
    showToast('Please upload a valid SVG file (.svg)', 'info');
    pendingReplaceLogoId = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const logoName = file.name.replace(/\.svg$/i, '');
    const isReplacing = !!pendingReplaceLogoId;
    const targetId = pendingReplaceLogoId || '';
    pendingReplaceLogoId = null;

    // When logo is added, trigger popup to name, configure elements, pick colors, and select storage mode
    openElementConfigModal({
      svgContent: content,
      logoName: logoName,
      defaultMode: isReplacing ? 'replace' : 'permanent',
      presetReplaceTarget: targetId,
      onApply: ({ layers, logoName, svgContent, storageMode, replaceTargetId, chosenColors, chosenStrokeWidths }) => {
        if (storageMode === 'permanent') {
          const saved = savePermanentLogo({ name: logoName, svgContent, layers, defaultColors: chosenColors, defaultStrokeWidths: chosenStrokeWidths });
          renderLogoGrid();
          appState.setActiveLogo(saved.id);
          if (chosenColors) appState.setAllColors(chosenColors);
          if (chosenStrokeWidths) {
            Object.entries(chosenStrokeWidths).forEach(([k, v]) => appState.setStrokeWidthOverride(k, v));
          }
          switchSidebarTab('colors');
          showToast(`Added "${saved.name}" to Permanent Library!`);
        } else if (storageMode === 'replace') {
          const effectiveTargetId = replaceTargetId || targetId;
          const updated = replacePermanentLogo(effectiveTargetId, { name: logoName, svgContent, layers, defaultColors: chosenColors, defaultStrokeWidths: chosenStrokeWidths });
          renderLogoGrid();
          appState.setActiveLogo(effectiveTargetId);
          if (chosenColors) appState.setAllColors(chosenColors);
          if (chosenStrokeWidths) {
            Object.entries(chosenStrokeWidths).forEach(([k, v]) => appState.setStrokeWidthOverride(k, v));
          }
          switchSidebarTab('colors');
          showToast(`Replaced SVG for "${updated.name}"!`);
        } else {
          // Temporary session mode
          appState.setCustomSvgWithLayers(svgContent, logoName, layers, chosenStrokeWidths);
          if (chosenColors) appState.setAllColors(chosenColors);
          switchSidebarTab('colors');
          showToast(`Loaded "${logoName}" as session vector!`);
        }
      }
    });
  };
  reader.readAsText(file);
}


