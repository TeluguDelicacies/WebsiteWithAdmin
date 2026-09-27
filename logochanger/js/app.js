/**
 * Logo Changer - Main Application Controller
 * Orchestrates rendering, reactive state subscriptions, canvas interactions, and keyboard shortcuts.
 */

import { appState } from './state.js';
import { loadLogoSvg } from './logo-loader.js';
import { parseSvgLayers } from './svg-parser.js';
import { applyLogoStyles, getSvgDimensions } from './styles-applier.js';
import { applyEffects } from './effects.js';
import { applyPortalEnvironment } from './portal.js';
import { initControls, updateColorControls } from './controls.js';
import { exportAsset, copyCanvasToClipboard } from './export.js';
import { qs, qsa, showToast } from './utils.js';

class LogoChangerApp {
  constructor() {
    this.currentSvgElement = null;
    this.isPanning = false;
    this.startPan = { x: 0, y: 0 };
  }

  async init() {
    console.log('Initializing Modern Logo Changer from scratch...');
    
    // 1. Initialize UI Controls
    initControls();

    // 2. Bind Canvas Pan & Zoom
    this.bindCanvasInteractions();

    // 3. Bind Keyboard Shortcuts
    this.bindKeyboardShortcuts();

    // 4. Subscribe to State Changes
    appState.subscribe(async (state, changedProp) => {
      await this.handleStateChange(state, changedProp);
    });

    // 5. Initial Load
    await this.loadActiveLogo();
    applyEffects(appState.getState());
    applyPortalEnvironment(appState.getState().portalBg);
  }

  async loadActiveLogo() {
    const loader = qs('#stageLoader');
    if (loader) loader.classList.add('visible');

    const state = appState.getState();
    const artboard = qs('#artboardBox');
    if (!artboard) return;

    try {
      // Remove old SVG
      const oldSvg = qs('#logoRendererSvg');
      if (oldSvg) oldSvg.remove();

      // Load new SVG
      const svg = await loadLogoSvg(state.activeLogoId, state.customSvgContent);
      this.currentSvgElement = svg;

      // If custom SVG, tag elements and auto-parse layers
      if (state.activeLogoId === 'custom') {
        const detectedLayers = parseSvgLayers(svg);
        if (!state.customLayers || state.customLayers.length === 0) {
          state.customLayers = detectedLayers;
          const initialColors = {};
          const initialStrokes = {};
          detectedLayers.forEach(l => {
            const key = l.customName || l.name;
            initialColors[key] = l.currentColor || l.originalHex;
            if (l.attr === 'stroke') {
              initialStrokes[key] = l.strokeWidth !== undefined ? l.strokeWidth : (l.originalStrokeWidth || 1);
            }
          });
          state.colorOverrides = initialColors;
          state.strokeWidthOverrides = initialStrokes;
        }
      }

      // Append to artboard
      artboard.appendChild(svg);

      // Apply initial styling & effects
      applyLogoStyles(svg, state);
      updateColorControls(state);
      this.updateDimensionsReadout(svg);

    } catch (err) {
      console.error('Failed to load SVG logo:', err);
      showToast('Error loading vector logo', 'info');
    } finally {
      if (loader) loader.classList.remove('visible');
    }
  }

  async handleStateChange(state, changedProp) {
    if (changedProp === 'activeLogoId' || changedProp === 'customSvg') {
      await this.loadActiveLogo();
      qsa('.logo-option-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.logoId === state.activeLogoId);
      });
    } else if (changedProp === 'colorOverrides' || changedProp === 'strokeWidthOverrides' || changedProp === 'transform') {
      if (this.currentSvgElement) {
        applyLogoStyles(this.currentSvgElement, state);
      }
    } else if (changedProp === 'effects') {
      applyEffects(state);
    } else if (changedProp === 'portalBg') {
      applyPortalEnvironment(state.portalBg);
    } else if (changedProp === 'canvas') {
      this.renderCanvasTransform(state);
    } else if (changedProp === 'history') {
      if (this.currentSvgElement) {
        applyLogoStyles(this.currentSvgElement, state);
        applyEffects(state);
        applyPortalEnvironment(state.portalBg);
        updateColorControls(state);
      }
    }
  }

  updateDimensionsReadout(svg) {
    const dims = getSvgDimensions(svg);
    const badge = qs('#stageDimensionsBadge');
    if (badge) {
      badge.textContent = `${dims.width} × ${dims.height} px`;
    }
  }

  renderCanvasTransform(state) {
    const artboard = qs('#artboardBox');
    const zoomBadge = qs('#stageZoomText');
    if (!artboard) return;

    const { zoom, panX, panY } = state.canvas;
    artboard.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;

    if (zoomBadge) {
      zoomBadge.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  bindCanvasInteractions() {
    const viewport = qs('#viewportWrapper');
    if (!viewport) return;

    // Mouse Wheel Zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const currentZoom = appState.getState().canvas.zoom;
      const factor = e.deltaY < 0 ? 1.15 : 0.85;
      appState.setZoom(currentZoom * factor);
    }, { passive: false });

    // Drag Pan
    viewport.addEventListener('mousedown', (e) => {
      // Ignore if clicking directly on a button or control
      if (e.target.closest('button, input, .stage-toolbar')) return;
      this.isPanning = true;
      viewport.classList.add('panning');
      this.startPan = {
        x: e.clientX - appState.getState().canvas.panX,
        y: e.clientY - appState.getState().canvas.panY
      };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      appState.setPan(e.clientX - this.startPan.x, e.clientY - this.startPan.y);
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
      viewport.classList.remove('panning');
    });

    // Toolbar Zoom Buttons
    const btnZoomIn = qs('#btnZoomIn');
    const btnZoomOut = qs('#btnZoomOut');
    const btnZoomReset = qs('#btnZoomReset');
    const btnToggleGrid = qs('#btnToggleGrid');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        appState.setZoom(appState.getState().canvas.zoom * 1.25);
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        appState.setZoom(appState.getState().canvas.zoom * 0.8);
      });
    }

    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', () => {
        appState.resetCanvasView();
      });
    }

    if (btnToggleGrid) {
      btnToggleGrid.addEventListener('click', () => {
        const vp = qs('#viewportWrapper');
        if (vp) vp.classList.toggle('canvas-checkerboard');
        btnToggleGrid.classList.toggle('active');
      });
    }
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore inside text/input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          appState.redo();
        } else {
          appState.undo();
        }
      } else if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        appState.redo();
      } else if (cmdKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (this.currentSvgElement) {
          copyCanvasToClipboard(this.currentSvgElement, appState.getState());
        }
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        appState.setZoom(appState.getState().canvas.zoom * 1.2);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        appState.setZoom(appState.getState().canvas.zoom * 0.8);
      } else if (e.key === '0') {
        e.preventDefault();
        appState.resetCanvasView();
      }
    });

    const undoBtn = qs('#btnHeaderUndo');
    const redoBtn = qs('#btnHeaderRedo');
    if (undoBtn) undoBtn.addEventListener('click', () => appState.undo());
    if (redoBtn) redoBtn.addEventListener('click', () => appState.redo());
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  const app = new LogoChangerApp();
  app.init();
});
