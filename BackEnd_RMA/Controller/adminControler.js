const pool = require('../utils/dbaudit');
const bcrypt = require('bcrypt');




const createDataKaryawan = async (req, res) => {
  const { key, key1, key2, key3 } = req.body;
  
  console.log('Data yang diterima:', { key, key1, key2, key3 });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (key2 === undefined || key2 === null) {
      throw new Error('Role (key2) tidak ada dalam body request');
    }

    let roleInt = parseInt(key2);

    if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
      throw new Error(`Role tidak valid: ${key2}`);
    }

    console.log('Role yang dikonversi:', roleInt);

    // Enkripsi NIK (key) sebagai password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(key, saltRounds);

    await client.query(`
      INSERT INTO TMAUDUSR 
      (N_AUDUSR_USRNM, N_AUDUSR_NM, C_AUDUSR_ROLE, C_AUDUSR_AUDR, I_AUDUSR_EMAIL, n_audusr_pswd)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [key, key1, roleInt, roleInt, key3, hashedPassword]);

    await client.query('COMMIT');
    res.status(200).json({ message: 'User berhasil ditambahkan' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saat menambahkan user:', error);
    res.status(400).json({ error: 'Terjadi kesalahan saat menambahkan user', details: error.message });
  } finally {
    client.release();
  }
};


const getKaryawan = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.n_audusr_usrnm, t.n_audusr_nm, t.c_audusr_audr AS role, t.i_audusr_email, e.organisasi
      FROM TMAUDUSR t
      JOIN karyawan e ON t.n_audusr_usrnm = e.nik
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ payload: result.rows });
  } catch (error) {
    console.error('Error fetching karyawan:', error);
    res.status(500).json({ error: 'An error occurred while fetching karyawan data' });
  }
};

// Endpoint DELETE untuk DELETE datana
const deleteKaryawan = async (req, res) => {
  const nik = req.params.nik;
  console.log('Received delete request for NIK:', nik);

  if (!nik) {
    return res.status(400).json({ error: 'NIK tidak valid' });
  }

  const query = 'DELETE FROM TMAUDUSR WHERE n_audusr_usrnm = $1 RETURNING *';

  try {
    const result = await pool.query(query, [nik]);
    
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

// Endpoint PUT untuk UPDATE data masih error 
const updateKaryawan = async (req, res) => {
  const { key1 } = req.params; // N_AUDUSR_USRNM
  const { c_audusr_role, n_audusr_nm, i_audusr_email, c_audusr_audr } = req.body;

  console.log('Data yang diterima untuk update:', { key1, c_audusr_role, n_audusr_nm, i_audusr_email, c_audusr_audr });

  // Validasi field yang kosong
  if (!key1 || !c_audusr_role || !n_audusr_nm || !i_audusr_email) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Konversi role menjadi integer
    const roleInt = parseInt(c_audusr_role, 10);

    // Validasi role jika nilainya tidak sesuai
    if (isNaN(roleInt) || roleInt < 0 || roleInt > 5) {
      throw new Error(`Role tidak valid: ${c_audusr_role}`);
    }

    let updateQuery, queryParams;

    // Logika untuk update berdasarkan role
    if (roleInt <= 3) {
      // Jika role <= 3, ambil data dari tabel `karyawan`
      updateQuery = `
        UPDATE TMAUDUSR SET 
          N_AUDUSR_NM = (SELECT nama FROM karywan WHERE nik = $1),
          C_AUDUSR_ROLE = $2,
          C_AUDUSR_AUDR = (SELECT organisasi FROM karywan WHERE nik = $1),
          I_AUDUSR_EMAIL = $3
        WHERE N_AUDUSR_USRNM = $1
      `;
      queryParams = [key1, roleInt, i_audusr_email];
    } else {
      // Jika role > 3, update langsung dari input
      updateQuery = `
        UPDATE TMAUDUSR SET 
          N_AUDUSR_NM = $1,
          C_AUDUSR_ROLE = $2,
          C_AUDUSR_AUDR = $3,
          I_AUDUSR_EMAIL = $4
        WHERE N_AUDUSR_USRNM = $5
      `;
      queryParams = [n_audusr_nm, roleInt, c_audusr_audr, i_audusr_email, key1];
    }

    // Eksekusi query
    const result = await client.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    // Commit transaksi jika berhasil
    await client.query('COMMIT');
    res.json({ message: 'Data pengguna berhasil diperbarui' });
  } catch (err) {
    // Rollback jika terjadi error
    await client.query('ROLLBACK');
    console.error('Error in updateKaryawan:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Pastikan koneksi ke database ditutup
    client.release();
  }
};


module.exports = {
    createDataKaryawan,
    getKaryawan,
    deleteKaryawan,
    updateKaryawan,
 
};
