var multer = require('multer');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage });

module.exports = function(app) {
  app.post('/upload', upload.single('file-upload'), function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file);
    res.end('You have uploaded ' + req);
  });

  // max 10 files
  app.post('/bulk-upload', upload.array('file-upload', 10), function(req, res,
    next) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
    console.log(req.files[0].originalname);
  });
}
