# Walat

WAL Authoring Tool

- Node.js 6.11.x
- npm@3
  - node-gyp
  - @angular/cli
  - electron-forge (install separately)
  - gulp

## Run

Run `npm i && npm start` for a dev server. Navigate to `http://localhost:9090/` (port may be randomized). The app artifacts will be stored in the `dist/` directory.

## Build

Run `npm i && electron-forge package` to build the project. The standalone app (for your native platform) will be stored in the `out/` directory.
