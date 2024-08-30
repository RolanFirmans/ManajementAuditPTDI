const express = require('express');
const cors = require('cors');
const {} = require('../Controller/auditeeControler');


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


// POST


// DELETE


// PUT


module.exports = router;
