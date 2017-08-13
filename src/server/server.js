'use strict';
var cors = require('cors');
var express = require("express");
var bodyParser = require("body-parser");
var Sequelize = require("sequelize");
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

var app = express();

app.use(cors());
app.use(bodyParser.json());

var uploader = require('./controllers/Uploader.js');
uploader(app);

var generator = require('./controllers/Generator.js');
generator(app);

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: path.join(__dirname, 'controllers'),
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname, "../../dist/assets/swagger.yaml"), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);
swaggerDoc.host = process.env.HOST || ("127.0.0.1:" + 9090);

if (process.env.USE_HTTPS) {
  swaggerDoc.schemes.unshift('https');
}

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function(middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Create link to Angular build directory
  var distDir = path.join(__dirname, "../../dist");
  app.use(express.static(distDir));

  app.use(function(req, res, next) {
    res.sendFile(path.join(__dirname, "../../dist/index.html"));
  });

  // Start the server
  app.listen(process.env.PORT || 9090, function() {
    console.log(
      'Your server is listening on port %d (http://localhost:%d)',
      9090, 9090);
    console.log('Swagger-ui is available on http://localhost:%d/docs',
      9090);
  });
});
