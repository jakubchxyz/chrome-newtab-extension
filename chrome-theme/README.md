# Dark Forest UI

This folder contains only the companion Chrome browser theme. The forest
new-tab page lives in the main extension under `src/newtab`.

In `chrome://extensions`, choose **Load unpacked** and select the `theme`
subfolder. No npm install or build is needed here.

Keep this folder at its current location after loading it: Chrome reads an
unpacked theme directly from that path. The active package is
`chrome-theme/theme/manifest.json`.

Chrome may create `theme/Cached Theme.pak`. This generated cache is ignored by
Git. It is not a second extension or a build output to install.
