const pool = require("../utils/dbaudit");
const axios = require("axios");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createDataKaryawan = async (req, res) => {
  const { key, key1, key2 } = req.body;

  console.log("Data yang diterima:", { key, key1, key2 });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (key2 === undefined || key2 === null) {
      throw new Error("Role (key2) tidak ada dalam body request");
    }

    let roleInt = parseInt(key2);

    if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
      throw new Error(`Role tidak valid: ${key2}`);
    }

    console.log("Role yang dikonversi:", roleInt);

    // Enkripsi NIK (key) sebagai password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(key, saltRounds);
    await client.query(`
      INSERT INTO AUDIT.TMAUDUSR  
      (N_AUDUSR_USRNM, N_AUDUSR, C_AUDUSR_ROLE, n_audusr_pswd)
      VALUES ($1, $2, $3, $4)
    `,
      [key, key1, roleInt, hashedPassword]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saat menambahkan user:", error);
    res
      .status(400)
      .json({
        error: "Terjadi kesalahan saat menambahkan user",
        details: error.message,
      });
  } finally {
    client.release();
  }
};

const getKaryawan = async (req, res) => {
  try {
    // 1. Ambil data dari tabel AUDIT.AUDIT.AUDIT.AUDIT.AUDIT.TMAUDUSR
    const result = await pool.query(`
      SELECT i_audusr, n_audusr_usrnm, N_AUDUSR, C_AUDUSR_ROLE AS role
      FROM AUDIT.TMAUDUSR
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // 2. Ambil data dari API eksternal
    try {
      const apiUrl = process.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("VITE_API_URL tidak diset dalam file .env");
      }

      console.log("Menggunakan API URL:", apiUrl); // Untuk debugging

      const apiResponse = await axios.get(apiUrl);
      const apiData = apiResponse.data.data; // Mengakses properti 'data' dari respons API

      // 3. Gabungkan data dari database dengan data dari API
      const combinedData = result.rows.map((dbUser) => {
        const apiUser = apiData.find(
          (apiUser) => apiUser.nik === dbUser.n_audusr_usrnm
        );
        return {
          ...dbUser,
          organisasi: apiUser ? apiUser.organisasi : null,
        };
      });

      res.json({ payload: combinedData });
    } catch (error) {
      console.error("Error fetching data from external API:", error);
      res.status(500).json({
        error: "An error occurred while fetching data from the external API",
        details: error.message,
      });
    }
  } catch (error) {
    console.error("Error fetching karyawan:", error);
    res.status(500).json({
      error: "An error occurred while fetching karyawan data from the database",
      details: error.message,
    });
  }
};

// Endpoint DELETE untuk DELETE datana
const deleteKaryawan = async (req, res) => {
  const i_audusr = req.params.id;
  console.log('Terima delete berdasarkan i_audusr:', i_audusr);

  if (!i_audusr) {
    return res.status(400).json({ error: 'i_audusr tidak valid' });
  }

  const query = 'DELETE FROM AUDIT.TMAUDUSR WHERE i_audusr = $1 RETURNING *';

  try {
    const result = await pool.query(query, [i_audusr]);
    

  const id = req.params.id;
  console.log("Terima delete berdasarkan i_audusr:", id);

  if (!id) {
    return res.status(400).json({ error: "i_audusr tidak valid" });
  }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data karyawan tidak ditemukan" });
    }

    const deletedKaryawan = result.rows[0];
    res.status(200).json({
      message: "Data karyawan berhasil dihapus",
      data: deletedKaryawan,
    });
  } catch (error) {
    console.error("Error saat menghapus karyawan:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat menghapus data karyawan" });
  }
};

// Endpoint PUT untuk UPDATE data masih error
const updateKaryawan = async (req, res) => {
  const { key1 } = req.params; // N_AUDUSR_USRNM
  const { c_audusr_role, N_AUDUSR, c_audusr_audr } = req.body;

  console.log("Data yang diterima untuk update:", {
    key1,
    c_audusr_role,
    N_AUDUSR,
    c_audusr_audr,
  });

  // Validasi field yang kosong
  if (!key1 || !c_audusr_role || !N_AUDUSR) {
    return res.status(400).json({ error: "Semua field harus diisi" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Konversi role menjadi integer
    const roleInt = parseInt(c_audusr_role, 10);

    // Validasi role jika nilainya tidak sesuai
    if (isNaN(roleInt) || roleInt < 0 || roleInt > 5) {
      throw new Error(`Role tidak valid: ${c_audusr_role}`);
    }

    let updateQuery, queryParams;

    // Logika untuk update berdasarkan role
    if (roleInt <= 3) {
      // Jika role <= 3, ambil data dari tabel karyawan
      updateQuery = `
        UPDATE AUDIT.TMAUDUSR SET 
          N_AUDUSR = (SELECT nama FROM karywan WHERE nik = $1),
          C_AUDUSR_ROLE = $2,
          C_AUDUSR_AUDR = (SELECT organisasi FROM karyawan WHERE nik = $1),
          I_AUDUSR_EMAIL = $3
        WHERE N_AUDUSR_USRNM = $1
      `;
      queryParams = [key1, roleInt, i_audusr_email];
    } else {
      // Jika role > 3, update langsung dari input
      updateQuery = `
        UPDATE AUDIT.TMAUDUSR SET 
          N_AUDUSR = $1,
          C_AUDUSR_ROLE = $2,
          C_AUDUSR_AUDR = $3
        WHERE N_AUDUSR_USRNM = $5
      `;
      queryParams = [N_AUDUSR, roleInt, c_audusr_audr, key1];
    }

    // Eksekusi query
    const result = await client.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      throw new Error("Pengguna tidak ditemukan");
    }

    // Commit transaksi jika berhasil
    await client.query("COMMIT");
    res.json({ message: "Data pengguna berhasil diperbarui" });
  } catch (err) {
    // Rollback jika terjadi error
    await client.query("ROLLBACK");
    console.error("Error in updateKaryawan:", err);
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