require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../../utils/dbaudit');

const loginUser = async (req, res) => {
  const { nik, password } = req.body;

  try {
    // Pastikan kedua NIK tidak kosong
    if (!nik || !password) {
      return res.status(401).json({ error: 'Kedua Username dan password  harus diisi' });
    }

    // Cari user berdasarkan NIK pertama
    const result = await pool.query(
      'SELECT * FROM audit.tmaudusr WHERE n_audusr_usrnm = $1',
      [nik]
    );

    // Jika NIK tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak valid' });
    }

    const user = result.rows[0];

    // Verifikasi password
    // Ganti logika untuk memverifikasi 'confirmNik' jika harus memeriksa kolom yang sesuai
    if (user.n_audusr_usrnm !== password) {
      return res.status(401).json({ error: 'Password salah' }); // Ubah pesan kesalahan di sini
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
    return res.json({
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
    return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

module.exports = { loginUser };
