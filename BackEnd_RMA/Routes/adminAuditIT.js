// admin.js
const express = require('express');
const cors = require('cors');
const { GetDataEvidence } = require('../Controller/adminAuditControler.js'); 
const { GetAuditee } = require('../Controller/adminAuditControler.js');
const { UpdateAuditee } = require('../Controller/adminAuditControler.js');
const { GetSelectedAuditee } = require('../Controller/adminAuditControler.js');
const { GetEvidence } = require('../Controller/adminAuditControler.js');
const { getDataRemarks} = require('../Controller/adminAuditControler.js');
const { updateStatus } = require('../Controller/adminAuditControler.js');
const { GetTitle } = require('../Controller/adminAuditControler.js');
const { CreateKomen } = require('../Controller/adminAuditControler.js');
const { GetReviewEvidence } = require('../Controller/adminAuditControler.js');
const { GetBalasanReviewEvidence } = require('../Controller/adminAuditControler.js');
const { CreateKomenBaru } = require('../Controller/adminAuditControler.js');
const router = express.Router();

const corsOptions = {
    origin: '*',
    optionSuccessStatus: 200
};

// Middleware untuk CORS dan parsing JSON
router.use(cors(corsOptions));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.get('/tmau-devd', GetDataEvidence);
router.get('/auditee', GetAuditee);
router.put('/up-auditee', UpdateAuditee);
router.get('/selected-auditee', GetSelectedAuditee);  
router.get('/selected-evidence', GetEvidence);
router.get('/selected-remarks-auditee', getDataRemarks);
router.put('/up-status', updateStatus);
router.get('/selected-title', GetTitle);
router.post('/create-koment', CreateKomen);
router.get('/menampilkan-review-evidence', GetReviewEvidence);
router.get('/menampilkan-balasan-review-evidence-admin-audit', GetBalasanReviewEvidence)
router.post('/create-koment-baru', CreateKomenBaru)
module.exports = router;
