# Hurricanes, 2020–2025

**Live: https://michaelzg.github.io/d3/**

Every named storm that reached hurricane strength in the Atlantic and eastern
Pacific between 2020 and 2025 — 103 storms across six seasons — plotted on an
interactive globe and animated from six-hour observations.

Pick a season, play it back, and watch the storms form and dissipate in the
order they happened. Select any storm to fly to it and read its track, peak
intensity and recorded landfalls. The list below the map covers the same
season.

## Data

| Source | Used for |
| --- | --- |
| [National Hurricane Center / HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | Storm tracks, wind speed, pressure, landfalls |
| [Natural Earth](https://www.naturalearthdata.com/) | Coastlines, country and state boundaries, city locations |

Six-hour positions are linearly interpolated between observations, so a
landfall may fall between two recorded points. Colors follow the
Saffir–Simpson wind scale. Cities are shown as geographic context; proximity
to a storm is not a record of impact. These are historical observations, not a
forecast.

## Running it

No build step and no dependencies to install — D3 and topojson-client are
vendored in `lib/`. It does need to be served over HTTP, because it fetches
its data with `fetch()`.

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765/. Append `?debug` to expose a read-only
`window.__atlasDebug.snapshot()` for inspecting render and playback state.

## Layout

```
index.html              the entire page: markup, styles and rendering
data/storms.json        103 storms with six-hour track points and landfalls
data/map-context.json   state boundaries and populated places
data/*-110m.json        land and country topology
lib/                    d3 and topojson-client
```

## Notes

- **Theme follows your clock** — light from 07:00, dark from 19:00, local
  time. Switching manually holds for the rest of that stretch; at the next
  boundary the page goes back to following the clock.
- **The map never hijacks the page.** Scrolling over the globe scrolls the
  document; zoom is Ctrl/⌘ + scroll or double-click. On touch, a vertical drag
  scrolls and a horizontal drag rotates.
- Rendering pauses when the map scrolls out of view or the tab is hidden.
- Honors `prefers-reduced-motion`: no autoplay, no flight animation.
