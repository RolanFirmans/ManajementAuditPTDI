const express = require('express');
const app = express();
const cors = require('cors')
const port = 3100;
const host = process.env.PGHOST;
const dontenv = require('dotenv')

const auditLogin = require('./Routes/login');
const auditRoutes = require('./Routes/audit');
const auditAdmin = require('./Routes/admin');

// SPI
const auditSpi = require('./Routes/spi')

// ADMIN AUDIT IT
const auditIt = require('./Routes/adminAuditIT');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors());
app.use(express.json())

app.use("/Login", auditLogin)
app.use("/Data", auditRoutes )
app.use("/Admin", auditAdmin)

// SPI
app.use("/SPI", auditSpi)

// ADMIN AUDIT IT
app.use("/AuditIT", auditIt)
dontenv.config()


app.listen(port, () => {
  console.log(`Server has been running in http://${host}:${port}`);
})