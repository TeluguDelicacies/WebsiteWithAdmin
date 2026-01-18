# Codebase Improvement Roadmap

> **Purpose:** Living document tracking technical debt and improvement tasks.
> **Last Updated:** 2026-01-18
> **Status:** Planning

---

## Current Assessment

### Assumptions to Verify
Before proceeding, validate these assumptions against actual performance:

- [ ] **ASM-001**: Large file size = performance problem (measure actual load times)
- [ ] **ASM-002**: Monolithic JS hurts maintainability (survey: is the team struggling?)
- [ ] **ASM-003**: !important overuse is problematic (are there actual CSS bugs?)
- [ ] **ASM-004**: Current architecture won't scale (what's the expected growth?)

### Questions for Stakeholder
1. What's the actual page load time on target devices?
2. Are there specific pain points in development workflow?
3. What features are planned that current architecture can't support?
4. What's the deployment/hosting strategy (SSR, static, etc.)?

---

## File Inventory

| File | Size | Purpose | Question |
|------|------|---------|----------|
| logos.js | 846KB | Logo SVG data | Is logo changer frequently used? |
| admin.js | 168KB | Admin panel logic | Admin used daily or rarely? |
| script.js | 159KB | Main site JS | Is this causing slow loads? |
| sales.html | 138KB | Sales page | Is template splitting worth it? |
| styles.css | 135KB | Main site CSS | Is unused CSS significant? |

---

## Improvement Phases

### Phase 1: Measurement First
Before optimizing, measure current state.

| Task ID | Task | Status | Blocker |
|---------|------|--------|---------|
| P1-001 | Run Lighthouse audit on index.html | [ ] | None |
| P1-002 | Run Lighthouse audit on sales.html | [ ] | None |
| P1-003 | Run Lighthouse audit on admin.html | [ ] | None |
| P1-004 | Check bundle analyzer output from Vite | [ ] | None |
| P1-005 | Document current load times (3G/4G) | [ ] | None |

---

### Phase 2: Low-Risk Improvements
Changes that can't break functionality.

#### P2-A: Code Organization Documentation
| Task ID | Task | Status | Effort |
|---------|------|--------|--------|
| P2-A-001 | Create ARCHITECTURE.md documenting current structure | [ ] | 1hr |
| P2-A-002 | Document CSS variable system in comments | [ ] | 30min |
| P2-A-003 | Add JSDoc comments to key functions | [ ] | 2hr |

#### P2-B: CSS Cleanup (Non-Breaking)
| Task ID | Task | Status | Effort |
|---------|------|--------|--------|
| P2-B-001 | Audit unused CSS with PurgeCSS (report only) | [ ] | 30min |
| P2-B-002 | List all inline styles in HTML files | [ ] | 30min |
| P2-B-003 | Create CSS class for each inline style pattern | [ ] | 1hr |
| P2-B-004 | Replace inline styles with classes (one file at a time) | [ ] | 2hr |

---

### Phase 3: JavaScript Modularization
Split large files while maintaining functionality.

#### P3-A: Extract Shared Utilities
| Task ID | Task | Status | Effort | Dependencies |
|---------|------|--------|--------|--------------|
| P3-A-001 | Create lib/utils.js file | [ ] | 10min | None |
| P3-A-002 | Move showToast() to utils.js | [ ] | 15min | P3-A-001 |
| P3-A-003 | Move generateSlug() to utils.js | [ ] | 10min | P3-A-001 |
| P3-A-004 | Update imports in script.js | [ ] | 10min | P3-A-002, P3-A-003 |
| P3-A-005 | Update imports in admin.js | [ ] | 10min | P3-A-002, P3-A-003 |
| P3-A-006 | Test both pages work correctly | [ ] | 15min | P3-A-004, P3-A-005 |

#### P3-B: Split script.js
| Task ID | Task | Status | Effort | Dependencies |
|---------|------|--------|--------|--------------|
| P3-B-001 | Create modules/cart.js | [ ] | 30min | P3-A-006 |
| P3-B-002 | Move cart functions to cart.js | [ ] | 1hr | P3-B-001 |
| P3-B-003 | Test cart functionality | [ ] | 30min | P3-B-002 |
| P3-B-004 | Create modules/routing.js | [ ] | 30min | P3-A-006 |
| P3-B-005 | Move routing functions | [ ] | 1hr | P3-B-004 |
| P3-B-006 | Test navigation/routing | [ ] | 30min | P3-B-005 |
| P3-B-007 | Create modules/products.js | [ ] | 30min | P3-A-006 |
| P3-B-008 | Move product view functions | [ ] | 1hr | P3-B-007 |
| P3-B-009 | Test product pages | [ ] | 30min | P3-B-008 |

#### P3-C: Split admin.js
| Task ID | Task | Status | Effort | Dependencies |
|---------|------|--------|--------|--------------|
| P3-C-001 | Create admin/products.js | [ ] | 30min | P3-A-006 |
| P3-C-002 | Move product CRUD functions | [ ] | 1hr | P3-C-001 |
| P3-C-003 | Test product management | [ ] | 30min | P3-C-002 |
| P3-C-004 | Create admin/categories.js | [ ] | 30min | P3-A-006 |
| P3-C-005 | Move category functions | [ ] | 45min | P3-C-004 |
| P3-C-006 | Test category management | [ ] | 20min | P3-C-005 |

---

### Phase 4: Performance Optimization
Only after measuring and identifying bottlenecks.

#### P4-A: logos.js Optimization
| Task ID | Task | Status | Effort | Dependencies |
|---------|------|--------|--------|--------------|
| P4-A-001 | Measure logo changer usage frequency | [ ] | - | Analytics |
| P4-A-002 | Create /assets/logos/ directory | [ ] | 5min | None |
| P4-A-003 | Extract each logo to separate .svg file | [ ] | 1hr | P4-A-002 |
| P4-A-004 | Create dynamic logo loader function | [ ] | 30min | P4-A-003 |
| P4-A-005 | Test logo changer with new approach | [ ] | 30min | P4-A-004 |
| P4-A-006 | Remove old logos.js if tests pass | [ ] | 5min | P4-A-005 |

#### P4-B: Build Optimization
| Task ID | Task | Status | Effort | Dependencies |
|---------|------|--------|--------|--------------|
| P4-B-001 | Review current vite.config.js | [ ] | 15min | None |
| P4-B-002 | Add code splitting configuration | [ ] | 30min | P4-B-001 |
| P4-B-003 | Add CSS minification | [ ] | 15min | P4-B-001 |
| P4-B-004 | Test production build | [ ] | 30min | P4-B-002, P4-B-003 |
| P4-B-005 | Compare bundle sizes before/after | [ ] | 15min | P4-B-004 |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-18 | Start with measurement | Don't optimize blindly |
| 2026-01-18 | Keep HTML structure as-is | Restructuring risky without tests |

---

## Notes

### What We DON'T Know Yet
- Actual performance bottlenecks
- User traffic patterns
- Which features are most used
- Whether current architecture is actually causing problems

### Before Each Phase
1. Back up current working state
2. Create a git branch
3. Test in staging before production
4. Rollback plan ready

---

## Changelog

- 2026-01-18: Initial roadmap created
