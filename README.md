# Screenshot & Customize

One Chrome extension for screenshots, page customization, YouTube enhancements,
and the Dark Forest new-tab page, plus an optional companion browser theme.

## Install

Run commands from the repository root:

```sh
npm ci
npm run build
```

Open `chrome://extensions`, enable Developer mode, and use **Load unpacked**:

| Folder | What it installs |
| --- | --- |
| `dist` | Screenshot & Customize, including the forest new-tab page |
| `chrome-theme/theme` | Dark Forest UI: dark browser tabs and toolbar |

Those are the only two installable packages. The theme needs no build step.
The old standalone Dark Forest new-tab extension is no longer part of this
project; remove or leave disabled any old **Dark Forest** entry in Chrome.

Keep the loaded folders in place. Chrome reads unpacked extensions directly
from their original paths. After rebuilding, reload **Screenshot & Customize**
on `chrome://extensions` and open a fresh tab. If Chrome asks about the new-tab
change, choose to keep it. The companion theme installation path is unchanged.

## Development

```sh
npm run dev      # Vite development server
npm run build    # Type-check and build the main extension into dist
npm run lint     # Lint the source
npm run preview  # Preview built pages; Chrome APIs require an installed extension
```

## Project layout

```text
src/
  manifest.json           Main extension manifest
  background/index.ts     Screenshot capture and message handling
  content/
    customize.ts          Per-site CSS and element hiding
    fullpage.ts           Full-page screenshot capture
    youtube/              YouTube styles, cinema mode, and recommendations
  popup/
    main.tsx              Popup tools and settings
    styles.css            Popup-only styles
  newtab/
    main.tsx              New-tab entry point
    App.tsx               Forest background
    styles.css            New-tab-only styles
    forest.jpg            Bundled background image
public/
  icon128.png             Main extension icon
chrome-theme/
  theme/manifest.json     Standalone browser colors (no JavaScript or npm project)
index.html                New-tab HTML entry
popup.html                Popup HTML entry
vite.config.ts            Shared build configuration
```

There is one npm project, lockfile, and main build output. Popup and new-tab
styles are separate. Browser theme colors remain a separate Chrome package.
Generated `dist`, `node_modules`, and `Cached Theme.pak` files are ignored by Git.

The main extension version is recorded in `src/manifest.json`; keep it aligned
with the root package version when releasing. The companion theme has its own
version in `chrome-theme/theme/manifest.json`.
