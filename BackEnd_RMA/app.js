const express = require('express');
const app = express();
const cors = require('cors')
const port = 3100;
const host = process.env.PGHOST;
const dontenv = require('dotenv')
dontenv.config()

const { Pool } = require('pg'); // Import pg untuk koneksi ke database

// Buat pool untuk koneksi ke database
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Periksa koneksi ke database
pool.connect((err, client, release) => {
  if (err) {
    // Jika terjadi error saat menghubungkan ke database
    console.error('Error menghubungkan ke database', err.stack);
  } else {
    // Jika berhasil terhubung ke database
    console.log('Berhasil terhubung ke database');
    release(); // Melepaskan koneksi setelah selesai digunakan
  }
});


const auditLogin = require('./src/Routes/login');
const auditRoutes = require('./src/Routes/audit');
const AdminRoutes = require('./src/Routes/AdminRoutes');
const Auditee = require('./src/Routes/auditee')


// SPI
const SpiRoutes = require('./src/Routes/SpiRoutes')

// ADMIN AUDIT IT
const AdminauditIt = require('./src/Routes/adminAuditIT');


// export ecxcel


const bodyParser = require('body-parser');

const deleteTugasAuditee = require('./src/Routes/deleteTugasAuditeeRoutes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors());
app.use(express.json())

app.use("/Login", auditLogin)
app.use("/Data", auditRoutes )
app.use("/Admin", AdminRoutes)

// SPI
app.use("/SPI", SpiRoutes)

// ADMIN AUDIT IT
app.use("/AuditIT", AdminauditIt)

// AUDITEE
app.use("/Auditee", Auditee)

// EXPORT EXCEL

app.use("/Delete", deleteTugasAuditee)

app.listen(port, () => {
  console.log(`Server has been running in http://${host}:${port}`);
});
