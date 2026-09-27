/**
 * Logo Changer - Styles Applier
 * Applies color overrides, vector transforms, and geometry scaling to the mounted SVG.
 */

import { LOGO_REGISTRY } from './config.js';

export function applyLogoStyles(svgElement, state) {
  if (!svgElement) return;

  const { activeLogoId, colorOverrides, transform } = state;
  const config = LOGO_REGISTRY[activeLogoId];

  // 1. Apply color overrides
  if (config && config.targets) {
    config.targets.forEach(target => {
      const color = colorOverrides[target.name] || target.default;
      const matchedEls = svgElement.querySelectorAll(target.selector);
      matchedEls.forEach(el => {
        if (target.attr === 'fill') {
          if (color) {
            el.setAttribute('fill', color);
            el.style.fill = color;
            if (el.style && el.style.cssText) {
              el.style.cssText = el.style.cssText.replace(/fill:\s*[^;]+;?/gi, `fill: ${color};`);
            }
          }
        } else if (target.attr === 'stroke') {
          if (color) {
            el.setAttribute('stroke', color);
            el.style.stroke = color;
            if (el.style && el.style.cssText) {
              el.style.cssText = el.style.cssText.replace(/stroke:\s*[^;]+;?/gi, `stroke: ${color};`);
            }
          }
          // Apply individual stroke width override for this specific target
          const sw = state.strokeWidthOverrides?.[target.name] ?? target.defaultStrokeWidth;
          if (sw !== undefined && sw !== null) {
            el.setAttribute('stroke-width', sw);
            el.style.strokeWidth = `${sw}px`;
            if (el.style && el.style.cssText) {
              el.style.cssText = el.style.cssText.replace(/stroke-width:\s*[^;]+;?/gi, `stroke-width: ${sw}px;`);
            }
          }
        }
      });
    });
  } else if (activeLogoId === 'custom' && state.customLayers) {
    // Custom uploaded SVG with dynamic user-configured layers
    state.customLayers.forEach(layer => {
      if (layer.enabled === false) return; // User opted out of modifying this element
      const key = layer.customName || layer.name;
      const color = colorOverrides[key] || colorOverrides[layer.name];
      const sw = state.strokeWidthOverrides?.[key] ?? state.strokeWidthOverrides?.[layer.name] ?? layer.strokeWidth;

      const applyToElement = (el) => {
        if (layer.attr === 'stroke') {
          if (color) {
            el.setAttribute('stroke', color);
            el.style.stroke = color;
            if (el.style && el.style.cssText) {
              el.style.cssText = el.style.cssText.replace(/stroke:\s*[^;]+;?/gi, `stroke: ${color};`);
            }
          }
          if (sw !== undefined && sw !== null) {
            el.setAttribute('stroke-width', sw);
            el.style.strokeWidth = `${sw}px`;
            if (el.style && el.style.cssText) {
              el.style.cssText = el.style.cssText.replace(/stroke-width:\s*[^;]+;?/gi, `stroke-width: ${sw}px;`);
            }
          }
        } else {
          if (color) {
            el.setAttribute('fill', color);
            el.style.fill = color;
            if (el.style && el.style.cssText) {
              el.style.cssText = el.style.cssText.replace(/fill:\s*[^;]+;?/gi, `fill: ${color};`);
            }
          }
        }
      };

      // Match via data-layer-id or original hex
      const matchedByDataId = svgElement.querySelectorAll(`[data-layer-id="${layer.id}"]`);
      if (matchedByDataId.length > 0) {
        matchedByDataId.forEach(applyToElement);
      } else if (layer.items) {
        layer.items.forEach(item => {
          if (item.element && svgElement.contains(item.element)) {
            applyToElement(item.element);
          }
        });
      }
    });
  }

  // 3. Apply transforms
  const { scale = 1, rotate = 0, flipH = false, flipV = false, opacity = 1 } = transform;
  
  const scaleX = flipH ? -scale : scale;
  const scaleY = flipV ? -scale : scale;

  // Apply to the SVG element style for hardware-accelerated preview
  svgElement.style.transform = `scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`;
  svgElement.style.opacity = opacity;
  svgElement.style.transformOrigin = 'center center';
}

export function getSvgDimensions(svgElement) {
  if (!svgElement) return { width: 0, height: 0 };
  
  const viewBox = svgElement.viewBox?.baseVal;
  if (viewBox && viewBox.width && viewBox.height) {
    return {
      width: Math.round(viewBox.width),
      height: Math.round(viewBox.height)
    };
  }

  const bbox = svgElement.getBBox ? svgElement.getBBox() : { width: 800, height: 800 };
  return {
    width: Math.round(bbox.width) || 800,
    height: Math.round(bbox.height) || 800
  };
}
