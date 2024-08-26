// admin.js
const express = require('express');
const cors = require('cors');
const { createUploadExcel } = require('../Controller/spiControler');
const { DownloadFileExcel } = require('../Controller/spiControler');
const { importExcelToDB } = require('../Controller/spiControler');
const { saveDataExcel } = require('../Controller/spiControler');
const { uploadExcel } = require('../Controller/spiControler');



const router = express.Router();

const corsOptions = {
    origin: '*',
    optionSuccessStatus: 200
};

// Middleware untuk CORS dan parsing JSON
router.use(cors(corsOptions));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// GET
// Definisikan route untuk menampilkan template file excel
router.get('/TemplateFileExcel', DownloadFileExcel);
router.get('/import-excel-db', importExcelToDB);


// POST
// Definisikan route untuk upload file excel spi
// router.post('/upload-file-excel-spi', createUploadExcel);
router.post('/save-data-excel', saveDataExcel);
router.post('/upload-file-excel', uploadExcel);



// DELETE
// Definisikan route untuk delete karyawan
// router.delete('/delete-karyawan/:id', deleteKaryawan);

// PUT
// Definisikan route untuk update karyawan
// router.put('/update-karyawan/:n_audusr_usrnm', updateKaryawan); 



module.exports = router;
