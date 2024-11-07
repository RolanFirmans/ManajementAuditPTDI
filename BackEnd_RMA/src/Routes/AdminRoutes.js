const express = require("express");
const adminControler = require("../Controller/adminControler");

const router = express.Router();


// Rute untuk mendapatkan semua karyawan
router.get('/karyawan', adminControler.getAllKaryawan.bind(adminControler));

// Rute untuk menambah karyawan
router.post("/add-karyawan", adminControler.createKaryawan.bind(adminControler));

// Rute untuk menghapus karyawan berdasarkan NIK
router.delete("/delete-karyawan/:nik", adminControler.deleteKaryawan.bind(adminControler));

// Rute untuk update karyawan
router.put("/update-karyawan/:nik", adminControler.editKaryawan.bind(adminControler));

module.exports = router;
