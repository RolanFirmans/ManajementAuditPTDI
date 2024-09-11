require('dotenv').config();

const jwt = require('jsonwebtoken');
const pool = require('../utils/dbaudit');

const loginUser = async (req, res) => {
  const { nik, confirmNik } = req.body;

  try {
    // Pastikan kedua NIK tidak kosong
    if (!nik || !confirmNik) {
      return res.status(400).json({ error: 'Kedua NIK harus diisi' });
    }

    // Cari user berdasarkan NIK pertama
    const result = await pool.query(
      'SELECT * FROM audit.tmaudusr WHERE n_audusr_usrnm = $1',
      [nik]
    );

    // Jika NIK tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'NIK tidak valid' });
    }

    const user = result.rows[0];

    // Verifikasi NIK konfirmasi
    // Asumsikan NIK konfirmasi disimpan dalam kolom i_audusr_confirm_nik
    if (user.n_audusr_usrnm !== confirmNik) {
      return res.status(401).json({ error: 'NIK konfirmasi tidak cocok' });
    }

    // Pastikan JWT_SECRET terisi
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Konfigurasi JWT tidak valid' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { 
        userId: user.i_audusr, 
        nik: user.n_audusr_usrnm, 
        role: user.c_audusr_role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Kirim respons dengan token
    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.i_audusr,
        name: user.n_audusr,
        nik: user.n_audusr_usrnm,
        role: user.c_audusr_role
      }
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

module.exports = { loginUser };