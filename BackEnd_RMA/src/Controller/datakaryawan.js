const pool = require('../../utils/dbaudit');

module.exports = (req, res) => {
    pool.query(
            `
           SELECT * FROM karyawan 
            
            `,
              
        // SELECT * FROM karyawan a
        // join tmaudusr b
        // on b.n_audusr_usrnm = a.nik
        // where 
        // (b.c_audusr_role in (0,2, 3) AND substring(a.organisasi, 1, 2) = 'IT') OR 
        // (b.c_audusr_role in (1) AND substring(a.organisasi, 1, 2) = 'PI')
        

        (dbError, dbResponse) => {
            if (dbError) {
                console.error('Database error:', dbError);
                return res.status(500).json({
                    info: 'error',
                    pesan: 'Internal Server Error',
                    data: null
                });
            }

            // Memastikan bahwa dbResponse.rows adalah array
            if (!Array.isArray(dbResponse.rows)) {
                console.error('Expected array but got:', typeof dbResponse.rows);
                return res.status(500).json({
                    info: 'error',
                    pesan: 'Unexpected response format',
                    data: null
                });
            }

            // Mengirimkan respons JSON dengan data yang diambil dari database dalam payload
            return res.status(200).json({
                info: 'sukses',
                pesan: 'Data karyawan berhasil diambil',
                data: dbResponse.rows
            });
        }
    );
};
