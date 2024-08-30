const pool = require('../utils/dbaudit');
const XLSX = require('xlsx');
const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');
const response = require('../response');


const uploadExcelAuditee = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'File upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
  
        const filePath = req.file.path;
  
        try {
            // Membaca file Excel yang diunggah
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
  
            // Format data atau lakukan operasi lain sesuai kebutuhan
            const formattedData = data.map(item => ({
                ...item,
                formattedDate: formatDate(item.date), // contoh format tanggal
            }));
  
            // Kirim respon dengan data yang diproses
            res.json(formattedData);
  
            // Simpan data Excel ke dalam database
            await saveDataExcel(filePath);
  
        } catch (error) {
            res.status(500).json({ error: 'Failed to process Excel file' });
        } finally {
            // Hapus file setelah diproses (opsional)
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete temporary file:', err);
            });
        }
    });
  };
  


  const saveDataExcelAuditee = async (filePath) => {
    try {
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
          row['StatusComplete'],           // C_AUDEVD_STATCMPL (Menggunakan Status dua kali, ini mungkin perlu diperiksa apakah itu sesuai dengan kebutuhan)
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
      
      console.log('Data has been saved to PostgreSQL');
    } catch (error) {
      console.error('Error saving data to PostgreSQL:', error);
    }
  };
  