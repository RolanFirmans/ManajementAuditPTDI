const pool = require('../utils/dbaudit');
const XLSX = require('xlsx');
const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');
const response = require('../response');


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


// -- MENYIMPAN EXCEL KE DATABASE
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

// -- SAVE DATA FILE EXCEL KE DALAM DATABASE

const saveDataExcel = async (filePath) => {
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

// -- DOWNLOAD TEMPLATE EXCEL

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

// -----------------------------------------------------------------------------
// DETAIL PROCESSING SPI AFTER UPLOAD EXCEL

// -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
const GetDataEvidence = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();  // Mendapatkan tahun saat ini
    const result = await pool.query(
      'SELECT * FROM TMAUDEVD WHERE EXTRACT(YEAR FROM C_AUDEVD_YR) = $1', [currentYear]
    );
    console.log('Query berhasil dijalankan', result.rows);
    
    // Menggunakan fungsi response yang sudah didefinisikan sebelumnya
    response(200, result.rows, 'Data ditemukan', res);
  } catch (error) {
    console.error('Error executing query', error.stack);

    response(500, [], 'Terjadi kesalahan', res);
  }
};

// -----------------------------------------------------------------------------
// DETAIL PROCESSING EDIT DATA EVIDEN


// -- EDIT DATA EVIDENCE

const PutDataEvidence = async (req, res) => {
  try {
    const {
      key,    // I_AUDEVD
      key1,   // AUDEVD_TITTLE
      key2,   // N_AUDEVD_PHS
      key3,   // C_AUDEVD_STAT
      key4,   // D_AUDEVD_DDL
      key5    // C_AUDEVD_AUDR
    } = req.body;
    
    const result = await pool.query(`
      UPDATE  tmaudevd
      SET 
        n_audevd_tittle = $1, 
        n_audevd_phs = $2, 
        c_audevd_stat = $3,
        d_audevd_ddl = $4, 
        c_audevd_audr = $5
      WHERE i_audevd = $6
    `, [key1, key2, key3, key4, key5, key]
    );
    console.log('Update Data Evience SPI', result.rows);
    
    // Menggunakan fungsi response yang sudah didefinisikan sebelumnya
    response(200, result.rows, 'Update Tidak Berhasil', res);
  } catch (error) {
    console.error('Error executing query', error.stack);

    response(500, [], 'Terjadi kesalahan', res);
  }
};



// -----------------------------------------------------------------------------
// DETAIL PROCESSING DATA EVIDENCE (ADMIN AUDIT IT & SPI) BEBERAPA REVIEW - STATUS COMPLETE
// -- 


// -- MENAMPILKAN DATA EVIDENCE
const GetEvidence = async (req, res) => {
  const postgres = `SELECT * FROM tmaudevd WHERE c_audevd_yr = $1`;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan data evidence SPI", res);
  });
}


// MENAMPILKAN DATA REMARKS BY AUDITEE :
const getDataRemarks = async (req, res) => {
  const key = req.query.key; //TMAUDEVD.I_AUDEVD  Mendapatkan nilai dari query parameter atau bisa dari sumber lain
  const postgres = `
    SELECT B.N_AUDEVDFILE_FILE, B.E_AUDEVDFILE_DESC FROM TMAUDEVDFILEDTL A,
    TMAUDEVDFILE B WHERE A.I_AUDEVD = $1 AND A.I_AUDEVDFILE = B.I_AUDEVDFILE
  `;
  pool.query(postgres, [key], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan data diupload oleh Auditee ", res);
  });
}

// -- MENAMPILKAN AUDITEE
const GetSelectedAuditee = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT B.N_AUDUSR_USRNM, B.N_AUDUSR_NM
      FROM TMAUDEVD A, TMAUDUSR B
      WHERE A.I_AUDEVD_AUD = B.N_AUDUSR_USRNM
    `);

    // Mengirimkan data auditee yang terpilih
    response(200, result.rows, 'Data Auditee terpilih ditemukan', res);
  } catch (error) {
    console.error('Error executing query', error.stack);
    response(500, [], 'Terjadi kesalahan saat mengambil data Auditee terpilih', res);
  }
};

// UPDATE STATUS SPI
const updateStatus = async (req, res) => {
  const key = req.body.I_AUDEVD; // Mengambil nilai I_AUDEVD dari request body
  const postgres = `UPDATE TMAUDEVD SET C_AUDEVD_STATCMPL = 3 WHERE I_AUDEVD = $1`;

  pool.query(postgres, [key], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Update Status Berhasil", res);
  });
}

// -----------------------------------------------------------------------------
// DETAIL PROCESSING DATA EVIDENCE AFTER STATUS COMPLETE ADMIN AUDIT IT

// MENAMPILKAN DATA EVIDENCE (sudah ada sama persis diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// UPDATE STATUS SPI ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING DATA EVIDENCE AFTER COMPLETE ADMIN AUDIT IT AND UPDATE SPI

// MENAMPILKAN DATA EVIDENCE (sudah ada sama persis diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// UPDATE STATUS SPI ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
//DETAIL PROCESSING REVIEW FILE EVIDENCE SPI & ADMIN AUDIT IT

// -- MENAMPILKAN TITLE EVIDENCE YANG DI PILIH 
const GetTitle = async (req, res) => {
  const key = req.params.I_AUDEVD; // Mengambil nilai I_AUDEVD dari request params
  const postgres = `
      SELECT N_AUDEVD_TITLE FROM TMAUDEVD WHERE I_AUDEVD=$1
    `;

  pool.query(postgres, [key], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Auditee", res);
  });
}


// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// -- REPLY KOMEN -- //
// -- ERROR KARENA BELUM ADA DATANYA BELUM DI INSERT --/
const CreateKomen = async (req, res) => {
  const { key1, key2, key3, key4, key5 } = req.body;

  const postgres = `
  INSERT INTO TMAUDEVDCOMNT 
  (I_AUDEVD, I_AUDEVDCOMNT_PRNT, E_AUDEVDCOMNT_CONTN, D_AUDEVDCOMNT_DT, I_AUDEVDCOMNT_AUT)
  VALUES ($1, $2, $3, $4, $5)`;

  pool.query(postgres,[key1, key2, key3, key4, key5], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Reply Komen ", res);
  });
}

// -- MENAMPILAN REVIEW EVIDENCE --//
const GetReviewEvidence = async (req, res) =>{
  const key1 = req.query.key1;
  const postgres = `
  SELECT A.I_AUDEVDCOMNT, A.I_AUDEVD, A.I_AUDEVDCOMNT_PRNT,
  A.E_AUDEVDCOMNT_CONTN, A.D_AUDEVDCOMNT_DT, A.I_AUDEVDCOMNT_AUT
  FROM TMAUDEVDCOMNT A, TMAUDUSR B 
  WHERE A.I_AUDEVDCOMNT_AUT = B.N_AUDUSR_USRNM AND A.I_AUDEVD = $1 AND 
  A.I_AUDEVDCOMNT_PRNT = 0
  ORDER BY A.D_AUDEVDCOMNT_DT ASC`;

  pool.query(postgres,[key1], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Review Evidence ", res);
  });
}

// -- MENAMPILKAN BALASAN REVIEW EVIDENCE -- //
const GetBalasanReviewEvidence = async (req, res) => {
  const key1 = req.params.i_audevd; // mengambil dari URL parameter
  const key2 = req.params.i_audevdcomnt; // mengambil dari URL parameter

  const postgres = `
  SELECT A.I_AUDEVDCOMNT, A.I_AUDEVD, A.I_AUDEVDCOMNT_PRNT,
      A.E_AUDEVDCOMNT_CONTN, A.D_AUDEVDCOMNT_DT, A.I_AUDEVDCOMNT_AUT
      FROM TMAUDEVDCOMNT A
      JOIN TMAUDUSR B ON A.I_AUDEVDCOMNT_AUT = B.N_AUDUSR_USRNM
      WHERE A.I_AUDEVD = $1 AND A.I_AUDEVDCOMNT_PRNT = $2
      ORDER BY A.D_AUDEVDCOMNT_DT ASC`;

  pool.query(postgres, [key1, key2], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Balasan Review Evidence", res);
  });
}

// -----------------------------------------------------------------------------
// DETAIL PROCESSING REPLY FILE EVIDENCE SPI & ADMIN AUDIT IT

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE
// ( sudah ada kondisi query nya sama diatas)

// REPLY KOMEN
// Erro diakrenakan input di di postman tipe data tidak sesuai

const ReplyKomen = async (req, res) => {
  const { key1, key2, key3, key4, key5 } = req.body;

  const postgres = `
  INSERT INTO TMAUDEVDCOMNT 
  (I_AUDEVD, I_AUDEVDCOMNT_PRNT, E_AUDEVDCOMNT_CONTN, D_AUDEVDCOMNT_DT, I_AUDEVDCOMNT_AUT)
  VALUES ($1, $2, $3, $4, $5)`;

  pool.query(postgres,[key1, key2, key3, key4, key5], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Reply Komen ", res);
  });

}

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)

// -----------------------------------------------------------------------------
// DETAIL PROCESSING DATA EVIDENCE COMPLETE SPI

// MENAMPILKAN DATA EVIDENCE (sudah ada sama persis diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS ( sudah ada kondisi query nya sama diatas)

// -----------------------------------------------------------------------------
// -----------------------DGCA------------------------------------

// MENAMPILKAN DATA EVIDENCE DGCA
const GetEvidenceDGCA  = async (req, res) => {
  const postgres = `
    SELECT * FROM TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 1`;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Data Evidence DGCA SPI", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REVIEW FILE EVIDENCE SPI & AUDITOR DGCA

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// TAMBAH KOMEN BARU
// kodingan masih error

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REPLY FILE EVIDENCE SPI & AUDITOR DGCA

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH
// ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REPLY KOMEN
// Erro diakrenakan input di di postman tipe data tidak sesuai
// ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// -----------------------FINANCE------------------------------------

// DETAIL PROCESSING DATA EVIDENCE FINANCE

// MENAMPILKAN DATA EVIDENCE FINANCE

const GetEvidenceFinance  = async (req, res) => {
  const postgres = `
    SELECT * FROM TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 2`;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Data Evidence Finance SPI", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REVIEW FILE EVIDENCE SPI & AUDITOR FINANCE

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH
// ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REVIEW FILE EVIDENCE
// TAMBAH KOMEN BARU
// kodingan masih error

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REPLY FILE EVIDENCE SPI & AUDITOR FINANCE

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REPLY KOMEN
// Erro diakrenakan input di di postman tipe data tidak sesuai

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// ----------------------------ITML-------------------------------
// DETAIL PROCESSING DATA EVIDENCE ITML

// MENAMPILKAN DATA EVIDENCE ITML

const GetEvidenceITML  = async (req, res) => {
  const postgres = `
    SELECT * FROM TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 3`;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Data Evidence Finance SPI", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REVIEW FILE EVIDENCE SPI & AUDITOR ITML

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH
// ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REVIEW FILE EVIDENCE
// TAMBAH KOMEN BARU
// kodingan masih error

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REPLY FILE EVIDENCE SPI & AUDITOR ITML

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REPLY KOMEN
// Erro diakrenakan input di di postman tipe data tidak sesuai

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)



// -----------------------------------------------------------------------------
// ----------------------------PARKER RUSSEL-------------------------------


// DETAIL PROCESSING DATA EVIDENCE PARKER RUSSEL

// MENAMPILKAN DATA EVIDENCE PARKER RUSSEL

const GetEvidenceParkerRussel  = async (req, res) => {
  const postgres = `
    SELECT * FROM TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 4`;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Data Evidence Finance SPI", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REVIEW FILE EVIDENCE SPI & AUDITOR PARKER RUSSEL

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH
// ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REVIEW FILE EVIDENCE
// TAMBAH KOMEN BARU
// kodingan masih error

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// -----------------------------------------------------------------------------
// DETAIL PROCESSING REPLY FILE EVIDENCE SPI & AUDITOR PARKER RUSSEL

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REPLY KOMEN
// Erro diakrenakan input di di postman tipe data tidak sesuai

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)

// -----------------------------------------------------------------------------
// DETAIL PROCESSING EXPORT EXCEL

// MENAMPILKAN DATA EVIDENCE (sudah ada sama persis diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// LAST UPDATE
const GetLastUpdate  = async (req, res) => {
  const postgres = `
    SELECT D_ENTRY FROM TMAUDEVD
    WHERE C_AUDEVD_YR = $1 AND C_AUDEVD_AUDR = $2
    `;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Data Evidence Finance SPI", res);
  });
}

// SUMARY
const GetSumary  = async (req, res) => {
  const postgres = `
    SELECT AVG(C_AUDEVD_STAT) AS average
    FROM TMAUDEVD
    WHERE C_AUDEVD_YR = $1 AND C_AUDEVD_AUDR = $2
    WHERE C_AUDEVD_YR = $1 AND C_AUDEVD_AUDR = $2
  `;
  pool.query(postgres, [req.params.year], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Data Evidence Finance SPI", res);
  });
}

// -----------------------------------------------------------------------------





module.exports = {
  uploadExcel,
  importExcelToDB,
  saveDataExcel,
  DownloadFileExcel,
  GetDataEvidence,
  PutDataEvidence,
  GetEvidence,
  getDataRemarks,
  GetSelectedAuditee,
  updateStatus,
  GetTitle,
  CreateKomen,
  GetReviewEvidence,
  GetBalasanReviewEvidence,
  ReplyKomen,
  GetEvidenceDGCA,
  GetEvidenceFinance,
  GetEvidenceITML,
  GetEvidenceParkerRussel,
  GetLastUpdate,
  GetSumary,
}

