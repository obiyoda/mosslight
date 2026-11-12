# Mosslight

[Play the game](https://obiyoda.github.io/mosslight/) · [Source code](https://github.com/obiyoda/mosslight)

A cozy top-down sandbox in progress. Milestone 1 has walking and gathering; building and nighttime monsters are planned next.

```sh
git clone https://github.com/obiyoda/mosslight.git
cd mosslight
npm ci
npm run dev
```

Open http://127.0.0.1:5174. Walk with WASD or arrow keys. Stand close to a tree or rock and press E or click it to gather. Trees give three wood and rocks give two stone, one per action. They regrow after 18 seconds. Esc or the Pause button pauses play. Supplies currently reset on reload.

Try gathering both wood and stone, then check the counters. Press Esc twice to check pause and resume.

`npm run build` exports to `dist/`; `npm run preview` serves the build on port 4174.

Use Node.js 24 LTS. Pushing to `main` runs the build and publishes `dist/` to GitHub Pages through `.github/workflows/pages.yml`. Enable GitHub Actions as the Pages source in the repository settings when setting up a fork.

Original procedural graphics, no external art or fonts. Uses Phaser 4.2.1 (MIT) and Vite (MIT). This project uses the starter repository's MIT license. Inspired by top-down gathering games, with no Minicraft assets or code.
