const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const spiControler = require('../Controller/spiControler');

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Definisi rute dengan callback yang benar
router.post('/upload-file-excel', upload.single('file'), spiControler.uploadExcel);
router.get('/TemplateFileExcel', spiControler.downloadFileExcel);
router.get('/tmau-devd', spiControler.getEvidence);
router.get('/remarks', spiControler.getDataRemarks);
router.get('/selected-auditee', spiControler.getSelectedAuditee);
router.put('/edit-data', spiControler.updateEvidence);
router.put('/update-status/:i_audevd', spiControler.updateStatus);
router.delete('/delete/:i_audevd', spiControler.deleteDataSPI);


module.exports = router;