# Map context

`map-context.json` is a regional subset of Natural Earth public-domain geographic data, retrieved 2026-09-16 from the project's `nvkelso/natural-earth-vector` repository:

- https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_1_states_provinces_lines.geojson
- https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_populated_places.geojson
- https://www.naturalearthdata.com/about/terms-of-use/

Extent: 180°W–15°W, 0°–65°N. Administrative lines intersecting that extent are simplified using Douglas–Peucker at 0.035° tolerance and rounded to 0.001°. Cities in the extent with `POP_MAX >= 200000` retain name, coordinates and population ranking. Population is used only to choose prominent map labels; it is not a current census or an estimate of people affected by a storm.

The page draws cities as a permanent basemap layer ordered by population, with the number shown scaled to the map's zoom level. Cities within 600 km of an active storm center are drawn with heavier weight, and at most six are named in the side notes. Proximity does not establish storm impacts. Storm impact context is limited to recorded landfalls in the supplied hurricane dataset.
