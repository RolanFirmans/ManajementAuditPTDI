const express = require("express");
const app = express();
const cors = require("cors");

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

// Inisialisasi multer setelah storage
const upload = multer({ storage });

const {
  // GetDataMemilihAuditee,
  UploadFileTitleItem,
  GetSearchFile,
  UploadNewFile,
  MemilihFile,
  DeleteFileRemarksAuditee,
  getDataRemarks,
  MenampilkanEvidenceAuditee,
  StatusAuditee,
  DgcaAuditee,
  FinanceAuditee,
  ItmlAuditee,
  ParkerRusselAuditee,
  ReviewFileAuditee,
  MenampilkanReviewFileAuditee,
  MenampilkanBalsanReviewAuditee,
  UploadNewFileAuditee,
  downloadFileAuditee,
} = require("../Controller/auditeeControler");

const router = express.Router();

const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200,
};

// Middleware untuk CORS dan parsing JSON
router.use(cors(corsOptions));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// GET
// router.get('/admin-audit-memilih-auditee', GetDataMemilihAuditee)
router.get("/upload-file", UploadFileTitleItem);
router.get("/search-file", GetSearchFile);
router.get("/get-remarks-auditee", getDataRemarks);
router.get("/data-evidence-auditee", MenampilkanEvidenceAuditee);

router.get("menampilkan-data-dgca-auditee", DgcaAuditee);
router.get("menampilkan-data-finance-auditee", FinanceAuditee);
router.get("menampilkan-data-itml-auditee", ItmlAuditee);
router.get("menampilkan-data-parker-russel-auditee", ParkerRusselAuditee);

router.get("/menampilkan-review-evidence", MenampilkanReviewFileAuditee);
router.get(
  "menampilkan-balasan-review-evidence-auditee",
  MenampilkanBalsanReviewAuditee
);

// TEST
router.get("/download/:filename", downloadFileAuditee);

// POST
router.post("/upload-new-file", UploadNewFile);
router.post("/memilih-file", MemilihFile);
router.post("/review-file-evidence-auditee", ReviewFileAuditee);

// TEST
router.post("/test", upload.single("file"), UploadNewFileAuditee);

// DELETE
router.delete("/delete-remarks-auditee-file", DeleteFileRemarksAuditee);

// PUT
router.put("/update-status-auditee", StatusAuditee);

module.exports = router;
