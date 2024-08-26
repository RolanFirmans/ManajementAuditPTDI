const pool = require('../utils/dbaudit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');


// Fungsi untuk memformat tanggal
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
};

// Membuat folder 'uploads' jika belum ada
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('file');

const uploadExcel = async (req, res) => {
  try {
      console.log(req.file); // Harusnya menampilkan informasi file

      res.send('File berhasil di-upload');
  } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan saat meng-upload file');
  }
}


const importExcelToDB = async (req, res) => {
  try {
      // Path ke file Excel
      const filePath = path.join(__dirname, '..', 'uploads', 'SPI.xlsx');
  
      // Membaca file Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      // Menampilkan data dari file Excel
      res.json(sheetData);
    } catch (error) {
      console.error('Error Membaca File Excel:', error);
      res.status(500).send('Terjadi Kesalahan');
    }
};


const saveDataExcel = async (req, res) => {
  try {
    // Path ke file Excel
    const filePath = path.join(__dirname, '..', 'uploads', 'SPI.xlsx');
      
    // Membaca file Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Mengambil jumlah data yang sudah ada di tabel TMAUDEVD
    const result = await pool.query('SELECT COUNT(*) FROM TMAUDEVD');
    let counter = parseInt(result.rows[0].count) + 1; // Mengatur counter agar dimulai dari jumlah data yang ada + 1

    // Mendapatkan tanggal dan waktu saat ini dalam format ISO
    const formattedYear = new Date().toISOString();  // Format lengkap tanggal dan waktu UTC

    // Loop melalui setiap baris dan simpan ke PostgreSQL
    for (const row of sheetData) {
      // Mengakses nilai dari row sesuai dengan nama kolom di Excel
      const values = [
        counter++,  // I_AUDEVD selalu diincrement dari nilai awal counter
        row['Data & Document Needed'],  // N_AUDEVD_TITLE
        row['Phase'],                   // N_AUDEVD_PHS
        row['Status'],                  // C_AUDEVD_STAT
        row['Deadline'],  // D_AUDEVD_DDL, Gunakan tanggal saat ini jika D_AUDEVD_DDL kosong
        row['Remarks by Auditor'],  // N_AUDEVD_AUDR
        row['Auditee'],         // I_AUDEVD_AUD
        row['Auditor'],          // C_AUDEVD_AUDR
        row['Status'],           // C_AUDEVD_STATCMPL (Menggunakan Status dua kali, ini mungkin perlu diperiksa apakah itu sesuai dengan kebutuhan)
        formattedYear,           // Menggunakan formattedYear untuk C_AUDEVD_YR
      ];

      // Query SQL dengan jumlah kolom dan nilai yang sesuai
      const query = `
        INSERT INTO TMAUDEVD
        (I_AUDEVD, N_AUDEVD_TITLE, N_AUDEVD_PHS, C_AUDEVD_STAT, D_AUDEVD_DDL, N_AUDEVD_AUDR, I_AUDEVD_AUD, C_AUDEVD_AUDR, C_AUDEVD_STATCMPL, C_AUDEVD_YR)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      // Menjalankan query dengan nilai yang sudah ditentukan
      await pool.query(query, values);
    }
    
    res.send('Data has been saved to PostgreSQL');
  } catch (error) {
    console.error('Error saving data to PostgreSQL:', error);
    res.status(500).send('Internal Server Error');
  }
};


const DownloadFileExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

    // Tambahkan header
  worksheet.columns = [
      { header: 'Data & Document Needed', key: 'ddn', width: 25 },
      { header: 'Phase',                  key: 'phase', width: 25 },
      { header: 'Status',                 key: 'status', width: 10 },
      { header: 'Deadline',               key: 'dl', width: 10 },
      { header: 'Reamarks by Auditor',    key: 'rba', width: 25 },
      { header: 'Auditor',                key: 'aud', width: 10 },
  ];

    // Tambahkan data
  //   worksheet.addRows([
  //     { ddn: 'Document B', phase: 'Phase 2', status: 'In Progress', dl: '2024-08-30', rba: 'Pending review', aud: 'Auditor 2' },
  //     { ddn: 'Document C', phase: 'Phase 3', status: 'Not Started', dl: '2024-09-10', rba: 'To be reviewed', aud: 'Auditor 3' }
  // ]);
  

    // Tentukan path untuk menyimpan file Excel
    const filePath = path.join(__dirname, './utils', 'Template.xlsx');

    // Pastikan direktori ada, jika tidak buat
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Simpan file Excel
    await workbook.xlsx.writeFile(filePath);

    // Set response headers untuk download file
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=data.xlsx'
    );

    // Kirim file ke client
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error downloading file');
        } else {
            console.log('File sent successfully');
        }
    });
};



module.exports = {
//   createUploadExcel,
  uploadExcel,
  importExcelToDB,
  saveDataExcel,
  DownloadFileExcel,
}

