/**
 * Logo Changer - Reactive State Manager
 * Handles centralized application state, history (undo/redo), and subscription broadcasts.
 */

import { LOGO_REGISTRY } from './config.js';
import { getPermanentLogoById } from './permanent-storage.js';

class StateManager {
  constructor() {
    this.state = {
      activeLogoId: 'td',
      customSvgContent: null,
      customSvgName: null,
      colorOverrides: {},
      strokeWidthOverrides: {},
      transform: {
        scale: 1,
        rotate: 0,
        flipH: false,
        flipV: false,
        opacity: 1
      },
      effects: {
        tilt: false,
        glow: false,
        shadow: true,
        emboss: false,
        sheen: false
      },
      portalBg: 'dark-box',
      canvas: {
        zoom: 1,
        panX: 0,
        panY: 0,
        showCheckerboard: true
      },
      export: {
        format: 'png',
        scale: 2, // Default to 2x Retina HD
        quality: 0.95
      }
    };

    this.listeners = new Set();
    this.undoStack = [];
    this.redoStack = [];
    this.isApplyingHistory = false;

    // Initialize default colors for active logo
    this.resetColorsToDefault(this.state.activeLogoId);
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changedProp) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, changedProp);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  pushHistory() {
    if (this.isApplyingHistory) return;
    const snapshot = JSON.stringify({
      activeLogoId: this.state.activeLogoId,
      colorOverrides: this.state.colorOverrides,
      strokeWidthOverrides: this.state.strokeWidthOverrides,
      transform: this.state.transform,
      effects: this.state.effects,
      portalBg: this.state.portalBg
    });

    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snapshot) {
      return;
    }

    this.undoStack.push(snapshot);
    if (this.undoStack.length > 40) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length <= 1) return;
    this.isApplyingHistory = true;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const previous = JSON.parse(this.undoStack[this.undoStack.length - 1]);

    Object.assign(this.state, previous);
    this.isApplyingHistory = false;
    this.notify('history');
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.isApplyingHistory = true;
    const next = JSON.parse(this.redoStack.pop());
    this.undoStack.push(JSON.stringify(next));

    Object.assign(this.state, next);
    this.isApplyingHistory = false;
    this.notify('history');
  }

  setActiveLogo(logoId) {
    this.pushHistory();
    this.state.activeLogoId = logoId;
    this.state.customSvgContent = null;
    
    // Check if it is a permanent custom logo
    const permLogo = getPermanentLogoById(logoId);
    if (permLogo) {
      this.state.customLayers = permLogo.layers;
    } else {
      this.state.customLayers = null;
    }
    
    this.resetColorsToDefault(logoId);
    this.notify('activeLogoId');
  }

  setCustomSvg(svgContent, fileName) {
    this.pushHistory();
    this.state.activeLogoId = 'custom';
    this.state.customSvgContent = svgContent;
    this.state.customSvgName = fileName || 'Custom SVG';
    this.state.customLayers = null;
    this.state.colorOverrides = {};
    this.state.strokeWidthOverrides = {};
    this.notify('customSvg');
  }

  setCustomSvgWithLayers(svgContent, fileName, layers, initialStrokeWidths = {}) {
    this.pushHistory();
    this.state.activeLogoId = 'custom';
    this.state.customSvgContent = svgContent;
    this.state.customSvgName = fileName || 'Custom SVG';
    this.state.customLayers = layers;
    
    const initialColors = {};
    const strokeWidths = { ...initialStrokeWidths };
    layers.forEach(l => {
      const key = l.customName || l.name;
      initialColors[key] = l.currentColor || l.originalHex;
      if (l.attr === 'stroke' && strokeWidths[key] === undefined) {
        strokeWidths[key] = l.strokeWidth !== undefined ? l.strokeWidth : (l.originalStrokeWidth || 1);
      }
    });
    this.state.colorOverrides = initialColors;
    this.state.strokeWidthOverrides = strokeWidths;
    this.notify('customSvg');
  }

  setCustomLayers(layers) {
    this.pushHistory();
    this.state.customLayers = layers;
    this.notify('colorOverrides');
  }

  setColorOverride(key, hexColor) {
    this.pushHistory();
    this.state.colorOverrides[key] = hexColor;
    this.notify('colorOverrides');
  }

  setAllColors(colorsMap) {
    this.pushHistory();
    this.state.colorOverrides = { ...colorsMap };
    this.notify('colorOverrides');
  }

  resetColorsToDefault(logoId) {
    const config = LOGO_REGISTRY[logoId];
    this.state.strokeWidthOverrides = {};

    if (config) {
      if (config.defaultColors) {
        this.state.colorOverrides = { ...config.defaultColors };
      }
      if (config.targets) {
        config.targets.forEach(t => {
          if (t.attr === 'stroke' && t.defaultStrokeWidth !== undefined) {
            this.state.strokeWidthOverrides[t.name] = t.defaultStrokeWidth;
          }
        });
      }
    } else {
      const permLogo = getPermanentLogoById(logoId);
      if (permLogo) {
        const initialColors = {};
        (permLogo.layers || []).forEach(l => {
          const key = l.customName || l.name;
          initialColors[key] = permLogo.defaultColors?.[key] || l.originalHex;
          if (l.attr === 'stroke') {
            this.state.strokeWidthOverrides[key] = l.strokeWidth !== undefined ? l.strokeWidth : (l.originalStrokeWidth || 1);
          }
        });
        this.state.colorOverrides = initialColors;
      } else {
        this.state.colorOverrides = {};
      }
    }
    this.notify('colorOverrides');
  }

  setStrokeWidthOverride(key, width) {
    this.pushHistory();
    this.state.strokeWidthOverrides[key] = parseFloat(width);
    this.notify('strokeWidthOverrides');
  }

  setTransform(updates) {
    this.pushHistory();
    this.state.transform = { ...this.state.transform, ...updates };
    this.notify('transform');
  }

  toggleEffect(effectName) {
    this.pushHistory();
    if (this.state.effects[effectName] !== undefined) {
      this.state.effects[effectName] = !this.state.effects[effectName];
      this.notify('effects');
    }
  }

  setPortalBackground(portalId) {
    this.pushHistory();
    this.state.portalBg = portalId;
    this.notify('portalBg');
  }

  setZoom(zoom) {
    this.state.canvas.zoom = Math.max(0.15, Math.min(8, zoom));
    this.notify('canvas');
  }

  setPan(x, y) {
    this.state.canvas.panX = x;
    this.state.canvas.panY = y;
    this.notify('canvas');
  }

  resetCanvasView() {
    this.state.canvas.zoom = 1;
    this.state.canvas.panX = 0;
    this.state.canvas.panY = 0;
    this.notify('canvas');
  }

  setExportConfig(updates) {
    this.state.export = { ...this.state.export, ...updates };
    this.notify('export');
  }
}

export const appState = new StateManager();
