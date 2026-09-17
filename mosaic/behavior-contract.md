# Mosaic behavior contract
Target: /mosaic/ served from the d3 static site.
1. Initial load shows six distinct geographic maps, location names, simulated populations, and an explicit illustrative-data disclosure.
2. Each picker option 4–8 displays exactly that many populated panels. Layouts fit without overlap or horizontal overflow, and maps refit with the panels.
3. Resimulate changes populations and clusters and recalculates panel sizes. Switching count retains the current simulation for shared regions.
4. Desktop and mobile layouts remain readable; controls work by keyboard with visible focus and selected state. Reduced-motion preference disables layout transitions.
5. Existing root hurricane page remains accessible. All runtime libraries and map data load locally; a failed map request shows an actionable message.
