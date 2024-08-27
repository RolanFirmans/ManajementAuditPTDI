const pool = require('../utils/dbaudit');
const response = require('../response');

// DETAILING PROCESSING ADMIN AUDIT IT INPUT DAN AUDITEE 
////////////////////////////////////////////////////////

// -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
const GetDataEvidence = async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();  // Mendapatkan tahun saat ini
      const result = await pool.query(
        'SELECT * FROM TMAUDEVD WHERE EXTRACT(YEAR FROM C_AUDEVD_YR) = $1', [currentYear]
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
    const result = await pool.query(`
      SELECT t.n_audusr_usrnm, t.n_audusr_nm, t.c_audusr_role, e.organisasi
      FROM TMAUDUSR t
      JOIN karyawan e ON t.n_audusr_usrnm = e.nik

    `);

    // Mengirimkan data Auditee dengan struktur JSON yang lebih baik
    response(200, result.rows, 'Data Auditee ditemukan', res);
  } catch (error) {
    console.error('Error executing query', error.stack);
    response(500, [], 'Terjadi kesalahan saat mengambil data Auditee', res);
  }
};

//-- MEMILIH AUDITEE  masih ada kesalahan
const UpdateAuditee = async (req, res) => {
    const { key1, key2 } = req.body;  // Mengambil KEY1 dan KEY2 dari body request
  
    try {
      const result = await pool.query(
        'UPDATE TMAUDEVD SET N_AUDUSR_USRNM = $1 WHERE I_AUDEVD_AUD = $2',
        [key2, key1]
      );
  
      // Memastikan bahwa update berhasil dilakukan
      if (result.rowCount > 0) {
        response(200, result.rowCount, 'Auditee berhasil diperbarui', res);
      } else {
        response(404, [], 'Auditee tidak ditemukan', res);
      }
    } catch (error) {
      console.error('Error executing update', error.stack);
      response(500, [], 'Terjadi kesalahan saat memperbarui Auditee', res);
    }
};

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

///////////////////////////////////////////////
// DETAILING PROCESSING DATA EVIDENCE AFTER ADMIN AUDIT IT INPUT AUDITEE

// MENAMPILKAN DATA EVIDENCE
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

//MENAMPILKAN AUDITEE
//NARIK YANG DI ATAS UDAH ADA 


///////////////////////////////////////////////
// DETAILING PROCESSING DATA EVIDENCE AFTER AUDITEE UPLOAD FILE 

// MENAMPILKAN DATA EVIDENCE 
// SUDAH ADA DI ATAS SAMA 

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

// UPDATE STATUS ADMIN AUDIT IT 
const updateStatus = async (req, res) => {
  const key = req.body.I_AUDEVD; // Mengambil nilai I_AUDEVD dari request body
  const postgres = `UPDATE TMAUDEVD SET C_AUDEVD_STATCMPL = 2 WHERE I_AUDEVD = $1`;

  pool.query(postgres, [key], (error, result) => {
    if (error) {
      console.error("Error executing query", error.stack);
      return response(500, null, "Terjadi kesalahan pada server", res);
    }
    response(200, result.rows, "Update Status Berhasil", res);
  });
}


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

// -- ITEM / REMARKS BY AUDITEE -- //
// SAMA UDAH ADA DI ATAS 

// -- REPLAY KOMEN -- //
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
    INSERT INTO TMAUDEVDCOMNT (I_AUDEVD, I_AUDEVDCOMNT, E_AUDEVDCOMNT_CONTN)
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
    GetSelectedAuditee,
    GetEvidence,
    getDataRemarks,
    updateStatus,
    GetTitle,
    CreateKomen,
    GetReviewEvidence,
    GetBalasanReviewEvidence,
    CreateKomenBaru,
};
