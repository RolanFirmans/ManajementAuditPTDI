// admin.js
const express = require('express');
const cors = require('cors');
const {
    uploadExcel,
    importExcelToDB,
    saveDataExcel,
    DownloadFileExcel,
    GetDataEvidence,
    PutDataEvidence,
    GetEvidence,
    getDataRemarks,
    GetSelectedAuditee,
    updateStatus,
    GetTitle,
    CreateKomen,
    GetReviewEvidence,
    GetBalasanReviewEvidence,
    ReplyKomen,
    GetEvidenceDGCA,
    GetEvidenceFinance,
    GetEvidenceITML,
    GetEvidenceParkerRussel,
    GetLastUpdate,
    GetSumary,
    DeleteDataSPI,
    
  } = require('../Controller/spiControler');
  


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
router.get('/TemplateFileExcel', DownloadFileExcel);
router.get('/import-excel-db', importExcelToDB);
router.get('/tmau-devd', GetDataEvidence);
router.get('/selected-evidence', GetEvidence);
router.get('/selected-remarks-auditee', getDataRemarks);
router.get('/selected-auditee', GetSelectedAuditee);  
router.get('/selected-title', GetTitle);
router.get('/menampilkan-review-evidence', GetReviewEvidence);
router.get('/menampilkan-balasan-review-evidence-admin-audit', GetBalasanReviewEvidence)
router.get('/selected-evidence-DGCA', GetEvidenceDGCA);
router.get('/selected-evidence-finance', GetEvidenceFinance);
router.get('/selected-evidence-ITML', GetEvidenceITML);
router.get('/selected-evidence-parker-russel', GetEvidenceParkerRussel);
router.get('/last-update', GetLastUpdate);
router.get('/Sumary', GetSumary);







// POST
// Definisikan route untuk upload file excel spi
// router.post('/upload-file-excel-spi', createUploadExcel);
router.post('/save-data-excel', saveDataExcel);
router.post('/upload-file-excel', uploadExcel);
router.post('/create-koment', CreateKomen);
router.post('/reply-komen', ReplyKomen);




// DELETE
// Definisikan route untuk delete karyawan
// router.delete('/delete-karyawan/:id', deleteKaryawan);
router.delete('/delete-evidence/:i_audevd', DeleteDataSPI)

// PUT
// Definisikan route untuk update karyawan
// router.put('/update-karyawan/:n_audusr_usrnm', updateKaryawan); 
router.put('/edit-data', PutDataEvidence);
router.put('/update-status/:i_audevd', updateStatus);




module.exports = router;
