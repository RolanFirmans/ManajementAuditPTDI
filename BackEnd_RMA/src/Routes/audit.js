const express = require('express')
const router = express.Router()
const cors = require('cors');
const corsOptions = {
    origin: '*',
    optionSuccessStatus: 200
};

router.use(cors(corsOptions));
const getData = require('../Controller/datakaryawan')
router.get("/", getData)

module.exports = router