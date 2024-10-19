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


const auditLogin = require('./Routes/login');
const auditRoutes = require('./Routes/audit');
const AdminRoutes = require('./Routes/AdminRoutes');
const Auditee = require('./Routes/auditee')

// SPI
const SpiRoutes = require('./Routes/SpiRoutes')

// ADMIN AUDIT IT
const AdminauditIt = require('./Routes/adminAuditIT');

const bodyParser = require('body-parser');

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

app.listen(port, () => {
  console.log(`Server has been running in http://${host}:${port}`);
});
