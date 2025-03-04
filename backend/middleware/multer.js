const multer = require("multer"); // for upload file

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

module.exports = multer({ storage: storage });
