const pool = require('../utils/dbaudit');
const XLSX = require('xlsx');
const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');
const response = require('../response');
// const { diskStorage } = multer;


// const uploadExcelAuditee = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             return res.status(500).json({ error: 'File upload failed' });
//         }
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }
  
//         const filePath = req.file.path;
  
//         try {
//             // Membaca file Excel yang diunggah
//             const workbook = XLSX.readFile(filePath);
//             const sheetName = workbook.SheetNames[0];
//             const sheet = workbook.Sheets[sheetName];
//             const data = XLSX.utils.sheet_to_json(sheet);
  
//             // Format data atau lakukan operasi lain sesuai kebutuhan
//             const formattedData = data.map(item => ({
//                 ...item,
//                 formattedDate: formatDate(item.date), // contoh format tanggal
//             }));
  
//             // Kirim respon dengan data yang diproses
//             res.json(formattedData);
  
//             // Simpan data Excel ke dalam database
//             await saveDataExcel(filePath);
  
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to process Excel file' });
//         } finally {
//             // Hapus file setelah diproses (opsional)
//             fs.unlink(filePath, (err) => {
//                 if (err) console.error('Failed to delete temporary file:', err);
//             });
//         }
//     });
//   };
  


//   const saveDataExcelAuditee = async (filePath) => {
//     try {
//       // Membaca file Excel
//       const workbook = XLSX.readFile(filePath);
//       const sheetName = workbook.SheetNames[0];
//       const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
//       // Mengambil jumlah data yang sudah ada di tabel AUDIT.TMAUDEVD
//       const result = await pool.query('SELECT COUNT(*) FROM AUDIT.TMAUDEVD');
//       let counter = parseInt(result.rows[0].count) + 1; // Mengatur counter agar dimulai dari jumlah data yang ada + 1
  
//       // Mendapatkan tanggal dan waktu saat ini dalam format ISO
//       const formattedYear = new Date().toISOString();  // Format lengkap tanggal dan waktu UTC
  
//       // Loop melalui setiap baris dan simpan ke PostgreSQL
//       for (const row of sheetData) {
//         // Mengakses nilai dari row sesuai dengan nama kolom di Excel
//         const values = [
//           counter++,  // I_AUDEVD selalu diincrement dari nilai awal counter
//           row['Data & Document Needed'],  // N_AUDEVD_TITLE
//           row['Phase'],                   // N_AUDEVD_PHS
//           row['Status'],                  // C_AUDEVD_STAT
//           row['Deadline'],  // D_AUDEVD_DDL, Gunakan tanggal saat ini jika D_AUDEVD_DDL kosong
//           row['Remarks by Auditor'],  // N_AUDEVD_AUDR
//           row['Auditee'],         // I_AUDEVD_AUD
//           row['Auditor'],          // C_AUDEVD_AUDR
//           row['StatusComplete'],           // C_AUDEVD_STATCMPL (Menggunakan Status dua kali, ini mungkin perlu diperiksa apakah itu sesuai dengan kebutuhan)
//           formattedYear,           // Menggunakan formattedYear untuk C_AUDEVD_YR
//         ];
  
//         // Query SQL dengan jumlah kolom dan nilai yang sesuai
//         const query = `
//           INSERT INTO AUDIT.TMAUDEVD
//           (I_AUDEVD, N_AUDEVD_TITLE, N_AUDEVD_PHS, C_AUDEVD_STAT, D_AUDEVD_DDL, N_AUDEVD_AUDR, I_AUDEVD_AUD, C_AUDEVD_AUDR, C_AUDEVD_STATCMPL, C_AUDEVD_YR)
//           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//         `;
        
//         // Menjalankan query dengan nilai yang sudah ditentukan
//         await pool.query(query, values);
//       }
      
//       console.log('Data has been saved to PostgreSQL');
//     } catch (error) {
//       console.error('Error saving data to PostgreSQL:', error);
//     }
//   };


// MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL DAN ADMIN AUDIT IT MEMILIH AUDITEE

// const GetDataMemilihAuditee = async (req, res) => {
//   try {
//     const currentYear = req.query.current_year;

//     const postgresQuery = `
//       SELECT * 
//       FROM AUDIT.TMAUDEVD A
//       INNER JOIN AUDIT.TMAUDUSR B
//       ON A.I_AUDEVD_AUD = B.N_AUDUSR_USRNM
//       WHERE A.C_AUDEVD_YR = $1
//     `;

//     const result = await pool.query(postgresQuery, [currentYear]);

//     return response(200, result.rows, "Menampilkan Data ADMIN AUDIT IT MEMILIH AUDITEE", res);
//   } catch (error) {
//     console.error("Error executing query", error.stack);
//     return response(500, null, "Terjadi kesalahan pada server", res);
//   }
// };

// Detail Processing Data Evidence (Pop Up Upload File Evidence & Document Needed)

// UPLOAD FILE (TITLE PADA ITEM YANG DIPILIH)

const UploadFileTitleItem = async (req, res) => {
  try {
    // Ambil parameter I_AUDEVD dari query
    const key1 = req.query.I_AUDEVD;

    let postgresQuery;
    let queryParams = [];

    if (key1) {
      // Jika I_AUDEVD disertakan dalam query, maka query berdasarkan I_AUDEVD
      postgresQuery = `
        SELECT n_audevd_title FROM AUDIT.TMAUDEVD WHERE I_AUDEVD = $1
      `;
      queryParams = [key1];
    } else {
      // Jika I_AUDEVD tidak disertakan, ambil semua data
      postgresQuery = `
        SELECT n_audevd_title FROM AUDIT.TMAUDEVD
      `;
    }

    // Eksekusi query ke database
    const result = await pool.query(postgresQuery, queryParams);

    // Cek apakah data ditemukan
    if (result.rows.length === 0) {
      return response(404, null, "Tidak ada data ditemukan untuk I_AUDEVD yang diberikan", res);
    }

    // Kembalikan data sesuai query
    return response(200, result.rows, "Menampilkan data Upload File berdasarkan I_AUDEVD", res);
  } catch (error) {
    console.error("Error executing query", error.stack);
    return response(500, null, "Terjadi kesalahan pada server", res);
  }
};

// MENAMPILKAN LIST EVIDENCE (SEARCH FILE)


const GetSearchFile = async (req, res) => {
  const postgres = `
  SELECT i_audevdfile, n_audevdfile_file, e_audevdfile_desc FROM AUDIT.TMAUDEVDFILE`;

  pool.query(postgres, (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan List Evidence (Search File) ", res);
  });
};

// UPLOAD NEW FILE
// Masih Error
// POST

// const storage = diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = join(__dirname, '..', 'uploads');
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

const UploadNewFile = async (req, res) => {
  const { description, auditeeId } = req.body; // Asumsikan auditeeId dikirim dari client
  const file = req.file;

  if (!file) {
    console.log("No file uploaded by the client.");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log(`Fetching I_AUDEVD for auditeeId: ${auditeeId}`);
    const query1 = 'SELECT I_AUDEVD FROM AUDIT.TMAUDEVD WHERE id = $1';
    const result1 = await pool.query(query1, [auditeeId]);

    if (result1.rows.length === 0) {
      console.log(`Auditee with id ${auditeeId} not found.`);
      return res.status(404).json({ error: "Auditee not found" });
    }

    const TMAUDEVD = result1.rows[0];
    const key3 = AUDIT.TMAUDEVD.i_audevd;
    console.log(`I_AUDEVD found: ${key3}`);

    const fileName = file.originalname;
    const filePath = file.path;
    console.log(`File received: ${fileName}, path: ${filePath}`);

    const query2 = `
      INSERT INTO AUDIT.TMAUDEVDFILE (N_AUDEVDFILE_FILE, E_AUDEVDFILE_DESC)
      VALUES ($1, $2)
      RETURNING I_AUDEVDFILE;
    `;
    console.log("Inserting new file into AUDIT.TMAUDEVDFILE");
    const result2 = await pool.query(query2, [fileName, description]);
    const generatedKey = result2.rows[0].i_audevfile;
    console.log(`File inserted with I_AUDEVDFILE: ${generatedKey}`);

    const query3 = `
      INSERT INTO AUDIT.TMAUDEVDFILEDTL (I_AUDEVD, I_AUDEVDFILE)
      VALUES ($1, $2);
    `;
    console.log(`Linking file with I_AUDEVD: ${key3}`);
    await pool.query(query3, [key3, generatedKey]);

    console.log("Upload New File berhasil.");
    res.status(200).json({ message: "Upload New File berhasil", data: result2.rows });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};




// const UploadNewFile = async (req, res) => {
//   const AUDIT.TMAUDEVD = I_AUDEVD
//   // = { I_AUDEVD: 'some_value_for_key3' }; // Buat test Postman

//   const AUDIT.TMAUDEVDFILE = I_AUDEVDFILE
//   // = { I_AUDEVDFILE: 'some_value_for_key4' }; // Buat test Postman

//   const key3 = AUDIT.TMAUDEVD.I_AUDEVD;
//   const key4 = AUDIT.TMAUDEVDFILE.I_AUDEVDFILE;

//   const { key1, key2 } = req.body;

//   // Query pertama
//   const query1 = `
//     INSERT INTO AUDIT.TMAUDEVDFILE (N_AUDEVDFILE_FILE, E_AUDEVDFILE_DESC)
//     VALUES ($1, $2)
//     RETURNING I_AUDEVDFILE;
//   `;

//   try {
//     // Eksekusi query pertama
//     const result1 = await pool.query(query1, [key1, key2]);

//     // Ambil nilai dari I_AUDEVFILE yang dihasilkan oleh query pertama
//     const generatedKey = result1.rows[0].i_audevfile;

//     // Query kedua
//     const query2 = `
//       INSERT INTO AUDIT.TMAUDEVDFILEDTL (I_AUDEVD, I_AUDEVDFILE)
//       VALUES ($1, $2);
//     `;

//     // Eksekusi query kedua dengan nilai yang dihasilkan dari query pertama
//     await pool.query(query2, [key3, generatedKey]);

//     // Mengirim response sukses
//     response(200, result1.rows, "Upload New File berhasil", res);
//   } catch (error) {
//     console.error("Error executing query", error.stack);
//     response(500, null, "Terjadi kesalahan pada server", res);
//   }
// };

// MEMILIH FILE
// Masih Error
// POST

const MemilihFile = async (req, res) => {
  const TMAUDEVD = { I_AUDEVD: 'some_value_for_key3' }; // Buat test Postman
  const MAUDEVDFILE = { I_AUDEVDFILE: 'some_value_for_key4' }; // Buat test Postman

  const key3 = TMAUDEVD.I_AUDEVD
  const key4 = TMAUDEVDFILE.I_AUDEVDFILE

  const postgres = `
    INSERT INTO AUDIT.TMAUDEVDFILEDTL (I_AUDEVD, I_AUDEVDFILE)
    VALUES ($3, $4)
  `;

  pool.query(postgres,[key3, key4], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Memilih File Berhasil ", res);
  });
};

// DELETE ITEM FILE REMARKS BY AUDITEE
// MASIH ERROR
// DELETE

const DeleteFileRemarksAuditee = async (req, res) => {
  const key1 = TMAUDEVDFILEDTL.I_AUDEVDFILEDTL
  const postgres = `
    DELETE FROM AUDIT.TMAUDEVDFILEDTL WHERE I_AUDEVDFILEDTL = $1
  `;

  pool.query(postgres,[key1], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Delete File ", res);
  });
}

// ----------------------------------------------------------------------------------------------


// 5.2.3.4.1 Detail Processing Search File Evidenc

// MENAMPILKAN LIST EVIDENCE (SEARCH FILE) ( sudah ada kondisi query nya sama diatas)

// ----------------------------------------------------------------------------------------------

// 5.2.3.5.1 Detail Processing Upload New File Evidenc

// UPLOAD NEW FILE ( sudah ada kondisi query nya sama diatas)
// Masih Error

// ----------------------------------------------------------------------------------------------

// 5.2.3.6 Hasil Upload File
// 5.2.3.6.1 Detail Processing Hasil Upload File Evidence

// UPLOAD FILE (TITLE PADA ITEM YANG DIPILIH) ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN LIST EVIDENCE (SEARCH FILE) ( sudah ada kondisi query nya sama diatas)

// UPLOAD NEW FILE ( sudah ada kondisi query nya sama diatas)
// Masih Error

// MEMILIH FILE ( sudah ada kondisi query nya sama diatas)
// Masih Error

//DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)
// MASIH ERROR

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

const getDataRemarks = async (req, res) => {
  console.log("Full request body:", req.body);
  console.log("Query params:", req.query);
  console.log("URL params:", req.params);

  // Coba ambil key dari berbagai sumber
  const key = req.body.key || req.query.key || req.params.key;

  console.log("Extracted key:", key);

  if (key === undefined || key === null || key === '') {
    // Jika key tidak ada, ambil semua data
    const postgres = `
      SELECT i_audevdfile, n_audevdfile_file, e_audevdfile_desc 
      FROM AUDIT.TMAUDEVDFILE
    `;

    try {
      const result = await pool.query(postgres);
      console.log("Query result:", result.rows);
      return response(200, result.rows, "Menampilkan semua data remarks", res);
    } catch (error) {
      console.error("Error executing query", error);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
  }

  // Jika key ada, gunakan untuk filter
  const postgres = `
    SELECT i_audevdfile, n_audevdfile_file, e_audevdfile_desc 
    FROM AUDIT.TMAUDEVDFILE
    WHERE i_audevdfile = $1 
  `;

  try {
    console.log("Executing query with key:", key);
    const result = await pool.query(postgres, [key]);
    
    console.log("Query result:", result.rows);
    console.log("Number of rows returned:", result.rowCount);
    
    if (result.rows.length === 0) {
      return response(404, null, `Data tidak ditemukan untuk key: ${key}`, res);
    }
    
    response(200, result.rows, "Menampilkan data remarks by auditee", res);
  } catch (error) {
    console.error("Error executing query", error);
    response(500, null, "Terjadi kesalahan pada server", res);
  }
};

// ----------------------------------------------------------------------------------------------

// 5.2.3.7 Edit File
// 5.2.3.7.1 Detail Processing Edit File Evidence

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN LIST EVIDENCE (SEARCH FILE) ( sudah ada kondisi query nya sama diatas)

// UPLOAD NEW FILE ( sudah ada kondisi query nya sama diatas)
// Masih Error

// MEMILIH FILE ( sudah ada kondisi query nya sama diatas)
// Masih Error

//DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)
// MASIH ERROR
// Sama kaya diatas


// ----------------------------------------------------------------------------------------------

// 5.2.3.8.1 Detail Processing Data Evidence after Complete

// MENAMPILKAN DATA EVIDENCE AUDITEE

const MenampilkanEvidenceAuditee = async (req, res) => {
  const currentYear = req.query.current_year;
  const postgres = `
    SELECT * FROM AUDIT.TMAUDEVD A, AUDIT.TMAUDUSR B
    WHERE A.C_AUDEVD_YR = $1
    AND A.I_AUDEVD_AUD = B.N_AUDUSR_USRNM;
    `;
  pool.query(postgres, [currentYear], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan data evidence AUDITEE", res);
  });
}


// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS AUDITEE

const StatusAuditee = async (req, res) => {
  const key = TMAUDEVD.I_AUDEVD; 
  const postgres = `UPDATE AUDIT.TMAUDEVD SET C_AUDEVD_STATCMPL = 1 WHERE I_AUDEVD = $1`;

  pool.query(postgres, [key], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Update Status Berhasil ", res);
  });
}


// ----------------------------------------------------------------------------------------------
// -----------------------DGCA------------------------------------

// 5.2.3.9.1 Data Evidence DGC

// DGCA
// MENAMPILKAN DATA EVIDENCE DGCA AUDITEE
// Masih Error

const DgcaAuditee = async (req, res) => {
  const currentYear = req.query.current_year;

  const postgres = `
    SELECT * FROM AUDIT.TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 1
    AND A.I_AUDEVD_AUD=B.N_AUDUSR_USRNM
    `;

  pool.query(postgres,[currentYear], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Data Evidence DGCA ", res);
  });

}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

//DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)
// MASIH ERROR

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS AUDITEE( sudah ada kondisi query nya sama diatas)


// ----------------------------------------------------------------------------------------------

// 5.2.3.9.2 Data Evidence Finance
// 5.2.3.9.2.1 Detail Processing Data Evidence Finance

// -----------------------FINANCE------------------------------------

// MENAMPILKAN DATA EVIDENCE FINANCE AUDITEE
// Masih Error

const FinanceAuditee = async (req, res) => {
  const currentYear = req.query.current_year;

  const postgres = `
    SELECT * FROM AUDIT.TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 2
    AND A.I_AUDEVD_AUD=B.N_AUDUSR_USRNM
    `;

  pool.query(postgres,[currentYear], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Data Evidence DGCA ", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS AUDITEE( sudah ada kondisi query nya sama diatas)

// ----------------------------------------------------------------------------------------------
// ----------------------------ITML-------------------------------

// 5.2.3.9.3 Data Evidence ITML
// 5.2.3.9.3.1 Detail Processing Data Evidence I

// ITML
// MENAMPILKAN DATA EVIDENCE ITML AUDITEE

const ItmlAuditee = async (req, res) => {
  const currentYear = req.query.current_year;
  const postgres = `
    SELECT * FROM AUDIT.TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 3
    AND A.I_AUDEVD_AUD=B.N_AUDUSR_USRNM
    `;

  pool.query(postgres,[currentYear], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Data Evidence ITML Auditee ", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS AUDITEE( sudah ada kondisi query nya sama diatas)

// ----------------------------------------------------------------------------------------------

//

// ----------------------------------------------------------------------------------------------
// ----------------------------PARKER RUSSEL-------------------------------

// 5.2.3.9.4 Data Evidence Parker Russe
// 5.2.3.9.4.1 Detail Processing Data Evidence Parker Russel

// PARKER RUSSEL
// MENAMPILKAN DATA EVIDENCE ITML AUDITEE

const ParkerRusselAuditee = async (req, res) => {
  const currentYear = req.query.current_year;
  const postgres = `
    SELECT * FROM AUDIT.TMAUDEVD
    WHERE C_AUDEVD_YR = $1
    AND C_AUDEVD_AUDR = 4
    AND A.I_AUDEVD_AUD=B.N_AUDUSR_USRNM
    `;

  pool.query(postgres,[currentYear], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Data Evidence ITML Auditee ", res);
  });
}

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// DELETE ITEM FILE REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN AUDITEE ( sudah ada kondisi query nya sama diatas)

// UPDATE STATUS AUDITEE( sudah ada kondisi query nya sama diatas)


// ----------------------------------------------------------------------------------------------

// 5.2.3.9.5 Review File Evidence Admin Audit IT
// 5.2.3.9.5.1 Detail Processing Review File Evidence Admin 

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE ( sudah ada kondisi query nya sama diatas )

// REVIEW FILE EVIDENCE AUDITEE
// TAMBAH KOMEN BARU
// masih error

// Post

const ReviewFileAuditee = async (req, res) => {
  const { I_AUDEVD, E_AUDEVDCOMNT_CONTN, D_AUDEVDCOMNT_DT, I_AUDEVDCOMNT_AUT } = req.body;  const postgres = `
    INSERT INTO AUDIT.TMAUDEVDCOMNT 
    (I_AUDEVD, I_AUDEVDCOMNT_PRNT, E_AUDEVDCOMNT_CONTN, D_AUDEVDCOMNT_DT, I_AUDEVDCOMNT_AUT)
    VALUES ($1, 0, $2, $3, $4) RETURNING *
      `;

  pool.query(postgres, [I_AUDEVD, E_AUDEVDCOMNT_CONTN, D_AUDEVDCOMNT_DT, I_AUDEVDCOMNT_AUT], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menambahkan Review File Evidence Auditee ", res);
  });

}

// MENAMPILKAN REVIEW EVIDENCE AUDITEE

// Get

const MenampilkanReviewFileAuditee = async (req, res) => {
  const key1 = req.params.key1;
  const postgres = `
    SELECT A.I_AUDEVDCOMNT, A.I_AUDEVD, A.I_AUDEVDCOMNT_PRNT,
    A.E_AUDEVDCOMNT_CONTN, A.D_AUDEVDCOMNT_DT, A.I_AUDEVDCOMNT_AUT
    FROM AUDIT.TMAUDEVDCOMNT A, AUDIT.TMAUDUSR B 
    WHERE A.I_AUDEVDCOMNT_AUT = B.N_AUDUSR_USRNM AND A.I_AUDEVD = $1 AND 
    A.I_AUDEVDCOMNT_PRNT = 0
    ORDER BY A.D_AUDEVDCOMNT_DT ASC`;

  pool.query(postgres,[key1], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Balasan Review Evidence Auditee ", res);
  });
}

// MENAMPILKAN BALASAN REVIEW EVIDENCE AUDITEE

// Get

const MenampilkanBalsanReviewAuditee = async (req, res) => {
  const key1 = AUDIT.TMAUDEVD.I_AUDEVD; // AUDIT.TMAUDEVD.I_AUDEVD
  const key2 = AUDIT.TMAUDEVDCOMNT.I_AUDEVDCOMNT; // AUDIT.TMAUDEVDCOMNT.I_AUDEVDCOMNT

  const postgres = `
  SELECT A.I_AUDEVDCOMNT, A.I_AUDEVD, A.I_AUDEVDCOMNT_PRNT,
      A.E_AUDEVDCOMNT_CONTN, A.D_AUDEVDCOMNT_DT, A.I_AUDEVDCOMNT_AUT
      FROM AUDIT.TMAUDEVDCOMNT A
      JOIN AUDIT.TMAUDUSR B ON A.I_AUDEVDCOMNT_AUT = B.N_AUDUSR_USRNM
      WHERE A.I_AUDEVD = $1 AND A.I_AUDEVDCOMNT_PRNT = $2
      ORDER BY A.D_AUDEVDCOMNT_DT ASC`;

  pool.query(postgres,[key1, key2], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, " Menampilkan Balasan Review Evidence Aduitee ", res);
  });
}

// ----------------------------------------------------------------------------------------------

// 5.2.3.9.6 Reply File Evidence Admin Audit IT & 
// 5.2.3.9.6.1 Detail Processing Reply File Evidence Admin Audit IT & Audite

// MENAMPILKAN TITLE EVIDENCE YANG DIPILIH ( sudah ada kondisi query nya sama diatas)

// MENAMPILKAN DATA REMARKS BY AUDITEE
// ( sudah ada kondisi query nya sama diatas)

// REPLY KOMEN
// Erro diakrenakan input di di postman tipe data tidak sesuai

// MENAMPILKAN REVIEW EVIDENCE ( sudah ada kondisi query nya sama diatas)

//  MENAMPILKAN BALASAN REVIEW EVIDENCE // ( sudah ada kondisi query nya sama diatas)


// ----------------------------------------------------------------------------------------------



// TEST



const UploadNewFileAuditee = async (req, res) => {

  const { key2 } = req.body; // Ambil data dari request body
  const filePath = req.file ? req.file.filename : null; // Ambil file yang diupload, jika ada

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Mulai transaksi

    // Query pertama
    const insertFileQuery = `
      INSERT INTO AUDIT.TMAUDEVDFILE (N_AUDEVDFILE_FILE, E_AUDEVDFILE_DESC) 
      VALUES ($1, $2) RETURNING I_AUDEVDFILE
    `;
    const insertFileResult = await client.query(insertFileQuery, [filePath, key2]);
    const insertedFileId = insertFileResult.rows[0].i_audevdfile; // Sesuaikan nama kolom dengan yang digunakan di tabel

    // Query kedua
    const insertDetailQuery = `
      INSERT INTO AUDIT.TMAUDEVDFILEDTL (I_AUDEVDFILE) 
      VALUES ($1)
    `;
    await client.query(insertDetailQuery, [insertedFileId]);

    await client.query('COMMIT'); // Commit transaksi
    res.status(200).json({ message: 'Test created successfully' }); // Sesuaikan pesan respons
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback jika terjadi error
    console.error(err);
    res.status(500).json({ error: 'Error inserting data' });
  } finally {
    client.release(); // Kembalikan client ke pool
  }
  
  // console.log('File:', req.file);  // Periksa apakah file diupload
  // console.log('Body:', req.body);  // Periksa data lainnya

  // const { id, description} = req.body;
  // const filePath = req.file ? req.file.filename : null;

  // // Validasi input
  // if (!id || !filePath) {
  //   return res.status(400).json({ message: "ID and file are required." });
  // }

  // // Mengatur tittle dengan nama file
  // const tittle = filePath;

  // const postgres = `
  //   INSERT INTO files (id, tittle, file_path, description) 
  //   VALUES ($1, $2, $3, $4)
  //   RETURNING *
  // `;

  // try {
  //   const result = await pool.query(postgres, [id, tittle, filePath, description]);
  //   res.status(200).json({ message: "Test created successfully", data: result.rows[0] });
  // } catch (error) {
  //   console.error("Error saving Test information:", error.stack);
  //   res.status(500).json({ message: "Error saving Test information" });
  // }
};


// const getFileAuditee = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM files');
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching files:', error.stack);
//     res.status(500).json({ message: 'Error fetching files' });
//   }};


const getTest = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM files');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching files:", error.stack);
    res.status(500).json({ message: "Error fetching files" });
  }
};




// const getTest = async (req, res) => {
//   const { id } = req.params;

//   // Validasi input
//   if (!id) {
//     return res.status(400).json({ message: "ID is required." });
//   }

//   const query = `
//     SELECT * FROM files WHERE id = $1
//   `;

//   try {
//     const result = await pool.query(query, [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "File not found." });
//     }

//     res.status(200).json({ message: "File retrieved successfully", data: result.rows[0] });
//   } catch (error) {
//     console.error("Error retrieving Test information:", error.stack);
//     res.status(500).json({ message: "Error retrieving Test information" });
//   }
// };


const downloadFileAuditee = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ message: 'Error downloading file' });
    }
  });

};


module.exports = {
  // GetDataMemilihAuditee,
  UploadFileTitleItem,
  GetSearchFile,
  UploadNewFile,
  MemilihFile,
  DeleteFileRemarksAuditee,
  getDataRemarks,
  MenampilkanEvidenceAuditee,
  StatusAuditee,
  DgcaAuditee,
  FinanceAuditee,
  ItmlAuditee,
  ParkerRusselAuditee,
  ReviewFileAuditee,
  MenampilkanReviewFileAuditee,
  MenampilkanBalsanReviewAuditee,
  UploadNewFileAuditee,
  downloadFileAuditee,

}
