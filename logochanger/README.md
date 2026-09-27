# Logo Studio Pro (Telugu Delicacies)

A modern, high-performance vector logo customizer, mockup studio, and multi-format HD export suite built completely from scratch using Vanilla JS (ES Modules) and modern CSS.

## Architecture

```
logochanger/
├── index.html                 # Slim, semantic entry point (HTML5)
├── README.md                  # System documentation
├── logos/                     # Standalone vector SVG brandmarks
│   ├── td.svg                 # Telugu Delicacies primary mark
│   ├── akshaya.svg            # Akshaya Sweets & Savouries
│   ├── tasty.svg              # Tasty Pinch
│   └── teepi.svg              # Teepi Gurthu
├── styles/                    # Modern modular CSS design system
│   ├── variables.css          # Design tokens (colors, radii, elevations)
│   ├── base.css               # Reset, typography, app container
│   ├── preview.css            # Interactive viewport, checkerboard, zoom
│   ├── controls.css           # Sidebar panels, color pickers, range sliders
│   ├── effects.css            # 3D tilt, neon glow, gold sheen, emboss
│   ├── portal.css             # Realistic packaging environments
│   ├── export.css             # Multi-DPI export options & toasts
│   ├── components.css         # Badges, tooltips, switch toggles
│   └── main.css               # CSS aggregator
└── js/                        # ES Modules logic
    ├── config.js              # Logo metadata, palette presets & portal configs
    ├── state.js               # Reactive state manager with undo/redo
    ├── utils.js               # Color convertors, download triggers & DOM helpers
    ├── svg-parser.js          # SVG auto-layer parser for custom uploads
    ├── logo-loader.js         # SVG loader with offline fallback
    ├── styles-applier.js      # Color overrides & vector transform engine
    ├── effects.js             # Visual effects controller
    ├── portal.js              # Packaging environment controller
    ├── controls.js            # Sidebar UI generator & interaction binder
    ├── export.js              # Multi-resolution rasterizer & clipboard engine
    └── app.js                 # Central orchestrator & keyboard shortcuts
```

## Features

- **Brandmark Library**: Built-in support for Telugu Delicacies, Akshaya Sweets, Tasty Pinch, and Teepi Gurthu.
- **Custom SVG Upload**: Drag-and-drop any custom SVG vector file with automatic color layer detection.
- **Curated Palette Presets**: Instant one-click color themes (Classic Heritage, Royal Gold, Emerald & Saffron, Neon, etc.).
- **Vector Transformations**: Real-time scale (20% to 250%), 360° rotation, opacity control, and horizontal/vertical flips.
- **Visual Effects**: 3D tilt perspective, ambient neon glow, drop shadows, metallic gold sheen, and soft emboss.
- **Packaging Mockups**: Preview logos directly on luxury dark sweet boxes, golden gift tins, kraft pouches, and white cards.
- **Ultra HD Export**:
  - Pure Vector SVG download
  - PNG with alpha transparency at 1x, 2x (Retina HD), 4x (Print 300DPI), and 8x (Studio 600DPI)
  - JPG with adjustable quality slider
  - WebP for modern web delivery
  - Copy to Clipboard shortcut (`Ctrl+C` / `Cmd+C`)
- **Interactive Canvas**: Mouse wheel zoom (15% to 800%), drag pan, transparency checkerboard toggle, and reset view.
- **History**: Full undo/redo (`Ctrl+Z`, `Ctrl+Y`).
