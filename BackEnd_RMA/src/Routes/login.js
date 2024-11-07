// admin.js
const express = require('express');
const cors = require('cors');
const { loginUser } = require('../Controller/LoginController.js');  // Import fungsi postLogin
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
router.post('/', loginUser );



module.exports = router;
