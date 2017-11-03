const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const open = require('open');

const app = express();
let currentPort = 0;

app.use(cors());
app.use(bodyParser.json());

const uploader = require('./controllers/Uploader.js');
const generator = require('./controllers/Generator.js');
const exportor = require('./controllers/Exportor.js');

uploader(app);
generator(app);
exportor(app);

const getPort = require('get-port');

getPort().then((PORT) => {
  // swaggerRouter configuration
  const options = {
    swaggerUi: '/swagger.json',
    controllers: path.join(__dirname, 'controllers'),
    useStubs: process.env.NODE_ENV === 'development', // Conditionally turn on stubs (mock mode)
  };

  // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
  const spec = fs.readFileSync(path.join(...[
    __dirname, '..', '..', 'dist',
    'assets',
    'swagger.yaml',
  ]), 'utf8');
  const swaggerDoc = jsyaml.safeLoad(spec);
  swaggerDoc.host = process.env.HOST || (`127.0.0.1:${PORT}`);

  if (process.env.USE_HTTPS) {
    swaggerDoc.schemes.unshift('https');
  }

  // Initialize the Swagger middleware
  swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
    // Interpret Swagger resources and attach metadata to request -
    // must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    // Create link to Angular build directory
    const distDir = path.join(__dirname, '..', '..', 'dist');
    app.use(express.static(distDir));

    app.use((req, res) => {
      res.sendFile(path.join(...[
        __dirname, '..', '..', 'dist',
        'index.html',
      ]));
    });

    // Start the server
    app.listen(process.env.PORT || PORT, () => {
      currentPort = process.env.PORT || PORT;
      console.log(...[
        'Your server is listening on port %d (http://localhost:%d)',
        currentPort,
        currentPort,
      ]);
      console.log(...[
        'Swagger-ui is available on http://localhost:%d/docs',
        currentPort,
      ]);

      // open(`http://localhost:${currentPort}`);
    });
  });
});

exports.getCurrentPort = () => currentPort;
