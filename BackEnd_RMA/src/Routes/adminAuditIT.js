const express = require('express');
const router = express.Router();
const AdminAuditController = require('../Controller/adminAuditControler');

router.get('/tmau-devd', AdminAuditController.getDataEvidenceAAIT);
router.get('/auditee', AdminAuditController.getSelectAuditeeAAIT);
router.post('/update-auditee', AdminAuditController.updateDataAuditee);
router.get('/select-auditee', AdminAuditController.getAuditeeAAIT);
router.get('/selected-remarks-auditee', AdminAuditController.getDataRemarksAAIT);
router.post('/update-status', AdminAuditController.updateStatusCompleteAAIT);
router.delete('/delete-evidence/:i_audevd', AdminAuditController.DeleteDataAdminIT);
router.get('/download-file/:fileId', AdminAuditController.getDownloadFileAAIT)
module.exports = router;