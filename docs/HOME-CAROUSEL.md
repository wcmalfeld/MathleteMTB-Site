# Home page photo carousel

Built from `PRDs/photoCarousel.md`. It's a 16:9 photo window beside the
logo on the home page (`index.html`), and drops below the logo on screens
narrower than 860 px.

| File | What it does |
|---|---|
| `js/gallery-config.js` | The list of photos: `src`, `alt`, and an optional `position`. Edit this to add, remove or reorder photos. |
| `assets/gallery/` | The photos: 16:9 JPEGs, about 1280 × 720 and under 400 KB. |
| `js/carousel.js` | The component. No dependencies. |
| `css/carousel.css` | Its look, plus the logo-and-carousel row. Loaded only on the home page. |

**How it behaves**
- **Rotation:** crossfades every 5.5 s and loops.
- **Navigation:** arrows, dots, swipe on touch screens, and the arrow keys
  when it has focus.
- **Pausing:** while hovered, while anything in it has focus, while the
  tab is hidden, and with its Pause button.
- **Reduced motion:** no automatic rotation and no fade.
- **Screen readers:** rotation is silent; manual moves are announced.
- **Loading:** only the current and next photos load.
- **No JavaScript:** the first photo is written into `index.html`, so the
  page still shows a photo and doesn't shift when the script runs.

## Adding a photo

1. Crop it to 16:9 (about 1280 × 720) and save it as a JPEG under 400 KB.
   **Strip its location data.** Phone photos carry GPS coordinates, and the
   site check fails on any gallery photo with EXIF/GPS. Re-exporting from
   Preview with "Remove location info", or any editor's "save for web",
   does it.
2. Put it in `assets/gallery/` and add a line to `js/gallery-config.js`
   with a good `alt` description.
3. If you change the **first** photo, update its `<img>` in `index.html`
   to match. `check-site.mjs` checks this.

`node scripts/check-site.mjs` checks:
- the gallery: alt text, file size, no metadata
- the first photo matches `index.html`
- the script order
- the carousel sits beside the logo
