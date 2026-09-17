# Mosaic hero validation

Target: http://127.0.0.1:8766/mosaic/ against behavior-contract.md.

- PASS: initial six maps have distinct geography, city labels, and simulated populations.
- PASS: all picker values 4–8 render the correct number of maps. Desktop compositions use staggered portrait and landscape slots with negative space; full-page screenshots reviewed for six and eight panels.
- PASS: at a 1280px viewport every count retains a 1172 × 586px banner (2:1) and the same footer top, 980.84375px. All target panel rectangles are in bounds and disjoint.
- PASS: at a 390px viewport all counts retain a 350 × 437.5px banner (4:5); no horizontal document overflow. The rendered eight-panel view after resimulation has no overlapping or out-of-bounds rectangles.
- PASS: resimulating eight regions changes total population from 204.7m to 199.9m; switching to six retains the shared values (164.0m total). Enter activates the six-panel picker.
- PASS: maps refit to compact panels and all city/population labels remain visible in the phone screenshot.
- INSPECTED: existing reduced-motion handling and load-error handling remain intact; original hurricane page and local libraries/geography are unchanged.

Manual scoped code review completed: checked all composition bounds, safe population scaling, matching CSS/JS mobile breakpoints, positive map-fitting extents, and observer updates. No remaining actionable findings. `node --check mosaic/mosaic.js` and `git diff --check` passed. The installed autoreview skill is text-only, so helper automation was unavailable. Browser validation was performed by the implementing agent, not an independent source-blind validator.
