const pool = require('../utils/dbaudit');
const axios = require('axios');
const response = require('../response');

// DETAILING PROCESSING ADMIN AUDIT IT INPUT DAN AUDITEE 
////////////////////////////////////////////////////////

// -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
const GetDataEvidence = async (req, res) => {
  try {
      const currentYear = new Date().getFullYear().toString();
      const result = await pool.query(
          'SELECT * FROM audit.tmaudevd WHERE EXTRACT(YEAR FROM TO_DATE(C_YEAR, \'YYYY\')) = $1',
          [currentYear]
      );
      
      // Menggunakan fungsi response yang sudah didefinisikan sebelumnya
      response(200, result.rows, 'Data ditemukan', res);
  } catch (error) {
      console.error('Error executing query', error.stack);
      response(500, [], 'Terjadi kesalahan', res);
  }
};

// --MENAMPILKAN DATA AUDITEE
const GetAuditee = async (req, res) => {
  try {
    // Mengambil parameter role dari query, defaultnya 2 jika tidak ada
    const role = req.query.role || 2;

    // Mengubah query untuk memfilter berdasarkan role
    const result = await pool.query(`
      SELECT t.n_audusr_usrnm, t.N_AUDUSR, t.c_audusr_role
      FROM audit.TMAUDUSR t
      WHERE t.c_audusr_role = $1
    `, [role]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data auditee tidak ditemukan' });
    }

    try {
      const apiUrl = process.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('VITE_API_URL tidak diset dalam file .env');
      }
  
      console.log('Menggunakan API URL:', apiUrl);
  
      const apiResponse = await axios.get(apiUrl);
      const apiData = apiResponse.data.data;

      if (!Array.isArray(apiData)) {
        throw new Error('Data dari API eksternal bukan array');
      }

      const combinedData = result.rows.map(dbUser => {
        const apiUser = apiData.find(apiUser => apiUser.nik === dbUser.n_audusr_usrnm);
        return {
          ...dbUser,
          organisasi: apiUser ? apiUser.organisasi : null
        };
      });

      res.json({ payload: combinedData });
    } catch (error) {
      console.error('Error fetching data from external API:', error);
      res.status(500).json({ 
        error: 'Terjadi kesalahan saat mengambil data dari API eksternal',
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Error fetching karyawan:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat mengambil data karyawan dari database',
      details: error.message 
    });
  }
};

//-- MEMILIH AUDITEE 
const UpdateAuditee = async (req, res) => {
  console.log('Data yang diterima di backend:', req.body);
  try {
    const { i_audevd, n_audusr_usrnm } = req.body;
    
    if (!i_audevd || !n_audusr_usrnm) {
      return response(400, null, 'Data tidak lengkap', res);
    }

    const updateQuery = `
    UPDATE audit.tmaudevd
    SET i_audevd_aud = $2
    WHERE i_audevd = $1
    RETURNING *;
    `;
    
    const result = await pool.query(updateQuery, [i_audevd, n_audusr_usrnm]);

    if (result.rows.length > 0) {
      response(200, result.rows[0], 'Auditee berhasil diperbarui', res);
    } else {
      response(404, null, 'Data tidak ditemukan', res);
    }
  } catch (error) {
    console.error('Error executing update', error.stack);
    response(500, null, 'Terjadi kesalahan saat memperbarui Auditee', res);
  }
};

// -- MENAMPILKAN AUDITEE // belum dijalankan di lewat dulu
const GetMenampilkanAuditee = async (req, res) => {
  try {
    // Query dengan huruf kecil
      const result = await pool.query(`
          select b.n_audusr_usrnm, b.n_audusr
          from audit.tmaudevd a 
          join audit.tmaudusr b on a.i_audevd_aud = b.n_audusr_usrnm
      `);

      // Mengirimkan data auditee yang terpilih
      response(200, result.rows, 'Data Auditee terpilih ditemukan', res);
  } catch (error) {
      console.error('Error executing query', error.stack);
      response(500, [], 'Terjadi kesalahan saat mengambil data Auditee terpilih', res);
  }
};



///////////////////////////////////////////////
// DETAILING PROCESSING DATA EVIDENCE AFTER ADMIN AUDIT IT INPUT AUDITEE

// MENAMPILKAN DATA EVIDENCE
// SUDAH ADA DI ATAS SAMA 

// MENAMPILKAN AUDITEE
//  NARIK YANG DI ATAS UDAH ADA 


///////////////////////////////////////////////
// DETAILING PROCESSING DATA EVIDENCE AFTER AUDITEE UPLOAD FILE 

// MENAMPILKAN DATA EVIDENCE 
// SUDAH ADA DI ATAS SAMA 

// MENAMPILKAN DATA REMARKS BY AUDITEE :
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
      FROM audit.tmaudevdFILE
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
    FROM audit.tmaudevdFILE
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

// MENAMPILKAN AUDITEE
// SUDAH ADA DI ATAS SAMA

// UPDATE STATUS ADMIN AUDIT IT 
const updateStatus = async (req, res) => {
  const key = req.body.I_AUDEVD;
  const postgres = `update audit.tmaudevd set c_audevd_statcmp = 2 where i_audevd = $1 returning *
`;

  try {
    const result = await pool.query(postgres, [key]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Update Status Berhasil", data: result.rows[0] });
    } else {
      res.status(404).json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Delete data 
const DeleteDataAdminIT = async (req, res) => {
  const i_audevd = req.params.i_audevd;
  console.log('Received delete request for i_audevd:', i_audevd);

  if (!i_audevd) {
    return res.status(400).json({ error: 'i_audevd tidak valid' });
  }

  const query = 'DELETE FROM AUDIT.tmaudevd WHERE i_audevd = $1 RETURNING *';

  try {
    const result = await pool.query(query, [i_audevd]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Data karyawan tidak ditemukan' });
    }

    const deletedKaryawan = result.rows[0];
    res.status(200).json({ 
      message: 'Data karyawan berhasil dihapus',
      data: deletedKaryawan
    });
  } catch (error) {
    console.error('Error saat menghapus karyawan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus data karyawan' });
  }
};
///////////////////////////////////////////////////////
// --- DETAIL PROCESSING DATA EVIDENCE ADMIN AUDIT IT REVIEW FILE EVIDENCE --- //

// -- MENAMPILKAN DATA EVIDENCE -- //
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN DATA REMARKS BY AUDITEE -- //
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN AUDITEE -- //
// SUDAH ADA DI ATAS SAMA 

// -- UPDATE STATUS ADMIN AUDIT IT -- //
// SUDAH ADA DI ATAS SAMA 

//////////////////////////////////////////////////////

// --- DETAIL PROCESSING DATA EVIDENCE COMPLETE AUDITEE --- //
// -- MENAMPILKAN DATA EVIDENCE -- //
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN DATA REMARKS BY AUDITEE -- // 
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN AUDITEE -- //
// SUDAH ADA DI ATAS SAMA -- //

// -- UPDATE STATUS -- //
// SUDAH ADA DI ATAS SAMA 

//////////////////////////////////////////////////////

// --- DETAIL PROCESSING DATA EVIDENCE AFTER COMPLETE AUDITEE AND UPDATE ADMIN AUDIT IT ---//

// -- MENAMPILKAN DATA EVIDENCE -- //
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN DATA REMARKS BY AUDITEE -- //
// SUDAH ADA DI ATAS SAMA

// -- MENAMPILKAN AUDITEE -- //
// SUDAH ADA DI ATAS SAMA

// -- UPDATE STATUS -- //
// SUDAH ADA DI ATAS SAMA

//////////////////////////////////////////////////////

// --- DETAIL PROCESSING REPLY FILE EVIDENCE ADMIN AUDIT IT & AUDITE --- //

// -- MENAMPILKAN TITLE EVIDENCE YANG DI PILIH --// 
const GetTitle = async (req, res) => {
  const key = req.params.I_AUDEVD; // Mengambil nilai I_AUDEVD dari request params
  const postgres = `
      SELECT N_AUDEVD_TITLE FROM audit.tmaudevd WHERE I_AUDEVD=$1
    `;

  pool.query(postgres, [key], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Menampilkan Auditee", res);
  });
}

// -- ITEM / REMARKS BY AUDITEE -- //
// SAMA UDAH ADA DI ATAS 

// -- REPLAY KOMEN -- //
// -- ERROR KARENA BELUM ADA DATANYA BELUM DI INSERT --/
const CreateKomen = async (req, res) => {
  const { key1, key2, key3, key4, key5 } = req.body;

  const postgres = `
  INSERT INTO audit.tmaudevdCOMNT 
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
  FROM audit.tmaudevdCOMNT A, TMAUDUSR B 
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
      FROM audit.tmaudevdCOMNT A
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


//////////////////////////////////////////////////////////////

// --- DETAILING PROCESSING DATA EVIDENCE COMPLETE ADMIN AUDIT IT --- //

// -- MENAMPILKAN DATA EVIDENCE -- //
// SUDAH ADA ADA DI ATAS 


// -- MENAMPILKAN DATA REMARKS BY AUDITEE -- //
// SUDAH ADA DI ATAS SAMA 

//-- MENAMPILKAN AUDITEE -- //
// SUDAH ADA DI ATAS SAMA 

// -- UPDATE STATUS  -- //
// SUDAH ADA DI ATAS SAMA 


////////////////////////////////////////////////////////////////

// --- DETAIL PROCESSING DATA EVIDENCE DGCA

// --DGCA
  // -- MENAMPILKAN DATA EVIDENCE
  // SUDAH ADA DI ATAS SAMA 

  // -- MENAMPILKAN DATA REMARKS BY AUDITEE -- //
  // SUDAH ADA DI ATAS SAMA 

  // -- MENAMPILKAN AUDITEE -- //
  // SUDAH ADA DI ATAS SAMA

  // -- UPDATE STATUS  -- //
  // SUDAH ADA DI ATAS SAMA


////////////////////////////////////////////////////////////////

// --- DETAIL PROCESSING DATA EVIDENCE FINANCE --- // 
// --- FINANCE

// -- MENAMPILKAN DATA REMARKS BY AUDITEE --- //
// SUDAH ADA DI ATAS SAMA

// -- MENAMPILKAN AUDITEE --- //
// SUDA ADA DI ATAS SAMA

// -- UPDATE STATUS  -- //
// SUDAH ADA DI ATAS SAMA


////////////////////////////////////////////////////////////////////////

// --- DETAIL PROCESSING DATA EVIDENCE ITML --- //

// -- MENAMPILKAN DATA EVIDENCE -- //
// SUDAH ADA DI ATAS SAMA

// -- MENAMPILKAN DATA REMARKS BY AUDITEE -- //
// SUDHA ADA DI ATAS SAMA

// -- MENAMPILKAN AUDITEE -- //
// SUDAH ADA DI ATAS SAMA

// -- UPDATE STATUS  -- //
// SUDAH ADA  DI ATAS SAMA  

////////////////////////////////////////////////////////////////////////

// --- DETAIL PROCESSING DATA EVIDENCE PARKER RUSSSEL --- //

// -- PARKER RUSSELL 
// -- MENAMPILKAN DATA EVIDENCE -- //
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN DATA REMARKS BY AUDITEE -- //
// SUDAH ADA DI ATAS SAMA

// -- MENAMPILKAN AUDITEE -- //
// SUDAH ADA DI ATAS SAMA 

// -- UPDATE STATUS  -- //
// SUDAH ADA DI ATAS SAMA

////////////////////////////////////////////////////////////////////////

// --- DATA PROCESSING REVIEW FILE EVIDENCE ADMIN AUDIT IT & SPI ---//

// -- MENAMPILKAN TITLE EVIDENCE YANG DIPILIH -- // 
// SUDAH ADA DI ATAS SAMA 

// -- ITEM / REMARKS BY AUDITEE -- // 
// SUDAH ADA DI ATAS SAMA 

// -- REVIEW FILE EVINDENCE 
// -- TAMBAH KOMEN BARU 
const CreateKomenBaru = async (req, res) => {
  const { i_audevd, i_audevdcomnt, content } = req.body; // Pastikan body request mengandung data

  if (!i_audevdcomnt) {
    return response(400, null, "Kolom i_audevdcomnt tidak boleh kosong", res);
  }

  const postgres = `
    INSERT INTO audit.tmaudevdCOMNT (I_AUDEVD, I_AUDEVDCOMNT, E_AUDEVDCOMNT_CONTN)
    VALUES ($1, $2, $3) RETURNING *`;

  pool.query(postgres, [i_audevd, i_audevdcomnt, content], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(201, result.rows[0], "Komentar berhasil dibuat", res);
  });
}


// -- MENAMPILKAN REVIEW EVIDENCE -- // 
// SUDAH ADA DI ATAS SAMA 

// -- MENAMPILKAN BALASAN REVIEW EVIDENCE -- //
// SUDAH ADA DI ATAS SAMA


////////////////////////////////////////////////////////////////////////////////

// --- DATA PROCESSING REPLY FILE EVIDENCE ADMIN AUDIT IT & SPI --- //

// -- MENAMPILKAN TITLE EVIDENCE YANG DIPILI --// 
// SUDAH ADA  DI ATAS SAMA 

// -- ITEM / REMARKS BY AUDITEE --// 
// SUDAH ADA DI ATAS SAMA

// REPLY KOMEN
// SUDAH ADA DI ATAS SAMAA

// -- MENAMPILKAN REVIEWE EVIDENCE -- ..
// SUDAH ADA DI ATAS SAMA 















module.exports = {
    GetDataEvidence,
    GetAuditee,
    UpdateAuditee,
    GetMenampilkanAuditee,
    getDataRemarks,
    updateStatus,
    GetTitle,
    CreateKomen,
    GetReviewEvidence,
    GetBalasanReviewEvidence,
    CreateKomenBaru,
    DeleteDataAdminIT,
};
