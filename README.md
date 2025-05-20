# remas web ui (remas-ui)

Resource management system web user interface.

Rest of the application (backend) is available at [this repository](https://github.com/xraurp/remas).

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

Builded application files are located at `dist/spa` directory.

### Change server URL and other options

Server URL and debug options are stored in `build.env` section in `quasar.config.ts`.
To point frontend at correct backend URL (domain) and enable / disable debug output to console change settings in this section.
Default server URL is `http://localhost:8000`, which is used for testing on development machine.

## Repository structure

Project follows Quasar project structure described on [this](#https://quasar.dev/quasar-cli-vite/directory-structure/) page.
