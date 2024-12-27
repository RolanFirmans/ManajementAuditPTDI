const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Received Token:', token); // Log token yang diterima
    if (!token) return res.status(403).send('Token tidak ditemukan');

    const bearerToken = token.split(' ')[1];

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err); // Log kesalahan verifikasi
            return res.status(401).send('Token tidak valid');
        }
        req.user = decoded; // Simpan informasi pengguna di request
        next();
    });
};


module.exports = { verifyToken };
