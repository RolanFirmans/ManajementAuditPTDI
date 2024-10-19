const express = require('express');
const router = express.Router();
const adminAuditControler = require('../Controller/adminAuditControler');

router.get('/tmau-devd', adminAuditControler.GetDataEvidence);
router.get('/auditee', adminAuditControler.GetAuditee);
router.post('/update-auditee', adminAuditControler.UpdateAuditee);
router.get('/select-auditee', adminAuditControler.GetMenampilkanAuditee);
router.get('/selected-remarks-auditee', adminAuditControler.getDataRemarks);
router.post('/update-status', adminAuditControler.updateStatus);
router.delete('/delete-evidence/:i_audevd', adminAuditControler.DeleteDataAdminIT);
router.get('/download-file/:fileId', adminAuditControler.GetDownloadFile)
module.exports = router;