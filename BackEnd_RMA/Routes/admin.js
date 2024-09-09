// admin.js
const express = require('express');
const cors = require('cors');
const { getKaryawan } = require('../Controller/adminControler.js'); 
const { createDataKaryawan } = require('../Controller/adminControler.js');
const { deleteKaryawan } = require('../Controller/adminControler.js'); 
const { updateKaryawan } = require('../Controller/adminControler.js');
const router = express.Router();

const corsOptions = {
    origin: '*',
    optionSuccessStatus: 200
};

// Middleware untuk CORS dan parsing JSON
router.use(cors(corsOptions));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Definisikan route untuk menampilkan karyawan
router.get('/karyawan', getKaryawan);
// Definisikan route untuk menambahkan karyawan
router.post('/add-karyawan', createDataKaryawan);
// Definisikan route untuk delete karyawan
router.delete('/delete-karyawan/:i_audusr', deleteKaryawan);
// Definisikan route untuk update karyawan
router.put('/update-karyawan/:nik', updateKaryawan); 



module.exports = router;
