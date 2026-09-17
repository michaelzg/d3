# Validation

Target: http://127.0.0.1:8766/mosaic/ against behavior-contract.md.

- PASS: six maps on initial load, distinct labels/populations, illustrative-data disclosure.
- PASS: buttons 4, 5, 6, 7, 8 show the requested number of articles with populated SVG maps.
- PASS: resimulation changes the eight-region total from 204.7m to 199.9m and changes individual populations and point counts. Count switching preserves shared simulation values.
- PASS: eight-panel desktop view at 1280px has no intersecting panel rectangles; smallest panel width is 185px. Fixed a previously narrow outer panel by choosing the largest two regions as anchors.
- PASS: 390px mobile screenshot remains readable; document width equals viewport width (390px), no horizontal overflow. Mobile deliberately uses equal-sized maps.
- PASS: Enter activates the four-panel button, with updated selected state and four visible maps.
- PASS: root URL responds HTTP 200; existing root files remain unchanged. Libraries and geography are repository-local.
- INSPECTED, NOT RUNTIME-EXERCISED: reduced-motion CSS and map-load failure handling.

Review: manual scoped review of map loading, population simulation, keyed panel updates, observer cleanup, breakpoints, and projection refitting. No remaining actionable findings. `node --check mosaic/mosaic.js` and `git diff --check` passed. Autoreview helper automation was unavailable: the installed text-only skill has no scripts directory. Browser checks were conducted by the implementing agent, not an independent source-blind validator.
