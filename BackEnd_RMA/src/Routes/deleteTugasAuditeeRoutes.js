const express = require('express');
const router = express.Router();
const cors = require("cors");
const DeleteTugasAuditeeControler = require('../Controller/DeleteTugasAuditeeControler');
// const router = express.Router();
const multer = require("multer");

// Pindahkan inisialisasi storage sebelum penggunaan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ganti dengan folder penyimpanan yang Anda inginkan
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200,
};
// Middleware untuk CORS dan parsing JSON
router.use(cors(corsOptions));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Inisialisasi multer setelah storage
const upload = multer({ storage });

// router.get('/search-file', auditeeControler.getSearchFile);
// router.post('/upload-new-file', upload.single('file'), auditeeControler.uploadNewTugas);
// router.post('/test', upload.single('file'), auditeeControler.uploadNewTugasAuditee);
// router.post('/update-status', auditeeControler.updateStatusComleteAuditee);
router.delete('/delete-file/:i_audevdfile', DeleteTugasAuditeeControler.handleDeleteFileAuditee)
module.exports = router;