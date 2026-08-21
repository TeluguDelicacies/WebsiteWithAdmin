# Master Function Registry

**Audit Date:** 2026-01-06
**Scope:** `script.js` (Client), `admin.js` (Admin Dashboard)
**Coverage:** Core Business Logic, State Management, DOM Manipulation

## 1. Dependency & State Mapping

| Function Signature | Architecture Role | Scope & Impact | Logic Type | Pure/Side Effect | Risks/Warnings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Global Helpers** | | | | | |
| `generateSlug(name)` | Utility | URL formatting (Products/Cats) | Declarative | ✅ Pure | |
| `showToast(msg, type)` | UI Feedback | Global Notification System | Imperative | ⚡ Side Effect (DOM) | |
| **Client-Side (`script.js`)** | | | | | |
| `preloadCatalogue()` | Network Opt. | Performance (Resource Hinting) | Imperative | ⚡ Side Effect (Network) | |
| `shareCatalogue()` | Feature | Validates & Triggers Native Share | Imperative | ⚡ Side Effect (API) | |
| `scrollToSection(id)` | User Nav | Smooth Scroll Behavior | Imperative | ⚡ Side Effect (Window) | |
| `handleRouting()` | Router | SPA Navigation / URL Sync | Imperative | ⚡ Side Effect (History/DOM) | ⚠️ Complex logic with multiple path checks |
| `showProductDescription(el, cat)` | UI Interaction | Product Card Details | Imperative | ⚡ Side Effect (Style) | ⚠️ **Direct `style.display` manipulation** (CSS Conflict Risk) |
| `updateHeaderOnScroll()` | Visual Effect | Sticky Header Styles | Imperative | ⚡ Side Effect (Style) | ⚠️ **Direct `style.background` manipulation** (Root of `!important` wars) |
| `initializeScrollAnimations()` | UI Animation | Scroll-triggered Fade-ins | Imperative | ⚡ Side Effect (Observer) | ⚠️ Manually sets `opacity/transform`. Conflict with CSS classes. |
| `initializeProductShowcaseControls()`| UX Control | Product Ticker Interaction | Imperative | ⚡ Side Effect (Events) | ⚠️ High Complexity (>50 lines), mixes event types |
| **Admin Dashboard (`admin.js`)** | | | | | |
| `fetchProducts()` | Data Fetcher | Populates `allProducts` State | Imperative | ⚡ Side Effect (Mutates Global) | 🚩 **Single Source of Truth Mutation** (Global `allProducts`) |
| `renderProductList()` | UI Renderer | Main Dashboard Grid | Imperative | ⚡ Side Effect (DOM Writes) | ⚠️ **High Complexity (>150 lines)**. Concatenates HTML strings. Hard to maintain. |
| `saveCurrentOrder(override)` | Data Persister | Reordering (DB Sync) | Imperative | ⚡ Side Effect (Network/Read DOM)| ⚠️ Reads DOM for state (Source of Truth Ambiguity) |
| `handleAssetUpload(input, target)`| Feature | Image Upload to Storage | Imperative | ⚡ Side Effect (Network) | |
| `toggleCardDetails(id)` | UX Interaction | Expand/Collapse Cards | Imperative | ⚡ Side Effect (Class) | Good practice (uses `.classList` vs `.style`) |
| `updateVisualOrder(type, cont)` | UI Feedback | Drag & Drop visual sync | Imperative | ⚡ Side Effect (DOM Text) | |
| `handleDragStart/Over/Drop` | Event Handler | DnD Mechanics | Imperative | ⚡ Side Effect (DOM Classes) | |
| `isLooseEqual(v1, v2)` | Utility | Change Detection | Declarative | ✅ Pure | |
| `getChanges(orig, curr)` | Utility | Diffing for Updates | Declarative | ✅ Pure | |

## 2. State Ownership & Architecture Bloat Analysis

### Single Source of Truth Violations
- **Global Variables**: `admin.js` relies heavily on `let allProducts = []`, `let allCategories = []`, `let allTestimonials = []`.
    - **Risk**: These mutable globals are updated by fetch functions and read by render functions. Any async race condition or accidental mutation by another function can desync the UI.
- **DOM as State**: `saveCurrentOrder` derives the "new order" by reading the DOM node order (`container.children`), rather than manipulating an abstract data model and re-rendering.
    - **Impact**: The UI is the source of truth for "Order", not the JS memory. This makes optimistic UI updates harder and validation more brittle.

### CSS Conflict Zones
The following functions directly manipulate local styles, which often overrides external CSS and forces developers to use `!important`.

1.  **`updateHeaderOnScroll`**:
    -   Sets: `header.style.background`, `header.style.borderBottom`
    -   **Recommendation**: Toggle a class `.header-scrolled` instead.

2.  **`initializeScrollAnimations`**:
    -   Sets: `el.style.opacity`, `el.style.transform`, `el.style.transition`
    -   **Recommendation**: Use CSS Animation classes (e.g., `.animate-on-scroll`) and just toggle the visibility class via Observer.

3.  **`showProductDescription`**:
    -   Sets: `desc.style.display = 'none'` / `'block'`
    -   **Recommendation**: Use `hidden` attribute or a utility class `.d-none`.

### Refactoring Candidates (Bloat Warning)
1.  **`renderProductList` (Admin)**:
    -   **Reason**: Massive string concatenation block (~120 lines). Logic for "Variants Grid", "Drag Grips", "Status Icons", and "Action Buttons" is all mixed in one loop.
    -   **Action**: componentize `createProductCardHTML(product)` and `createVariantGridHTML(variants)`.

2.  **`initializeProductShowcaseControls` (Script)**:
    -   **Reason**: Handles Touch, Mouse, Scroll, *and* Animation frame logic in one function.
    -   **Action**: Split into `setupTouchHandlers()`, `setupMouseHandlers()`, `setupVisibilityObserver()`.
