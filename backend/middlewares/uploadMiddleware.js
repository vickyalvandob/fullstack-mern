const multer = require('multer');

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// file filter untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
}
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
// This middleware handles file uploads using multer.
// It stores uploaded files in the 'uploads/' directory and renames them with a timestamp to avoid conflicts.
// The file filter ensures that only image files (JPEG, PNG, GIF) are accepted.
// If a non-image file is uploaded, an error is returned.