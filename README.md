# Walat

WAL Authoring Tool

- Node.js 6.10.x
- npm@3
  - node-gyp
  - @angular/cli
  - electron-forge
  - gulp

## Run

Run `npm i && npm start` for a dev server. Navigate to `http://localhost:9090/`. The app artifacts will be stored in the `dist/` directory.

## Build

Run `electron-forge package` to build the project. The standalone app (for your native platform) will be stored in the `out/` directory.
