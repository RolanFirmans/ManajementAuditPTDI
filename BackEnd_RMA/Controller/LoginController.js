require('dotenv').config();  // Pastikan dotenv di-load

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../utils/dbaudit');

const loginUser = async (req, res) => {
  const { email, nik } = req.body;

  try {
    // Pastikan email dan nik tidak kosong
    if (!email || !nik) {
      return res.status(400).json({ error: 'Email dan NIK harus diisi' });
    }

    // Cari user berdasarkan email
    const result = await pool.query(
      'SELECT * FROM tmaudusr WHERE i_audusr_email = $1',
      [email]
    );

    // Jika email tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau NIK salah' });
    }

    const user = result.rows[0];

    // Pastikan n_audusr_pswd tidak null atau undefined
    if (!user.n_audusr_pswd) {
      return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }

    // Verifikasi NIK
    const isNikValid = await bcrypt.compare(nik, user.n_audusr_pswd);

    if (!isNikValid) {
      return res.status(401).json({ error: 'Email atau NIK salah' });
    }

    // Pastikan JWT_SECRET terisi
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Konfigurasi JWT tidak valid' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { 
        userId: user.i_audusr, 
        email: user.i_audusr_email, 
        role: user.c_audusr_role 
      },
      process.env.JWT_SECRET,  // Pastikan ini tidak undefined
      { expiresIn: '1h' }
    );

    // Kirim respons dengan token
    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.i_audusr,
        name: user.n_audusr_nm,
        email: user.i_audusr_email,
        role: user.c_audusr_role
      }
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

module.exports = { loginUser };
