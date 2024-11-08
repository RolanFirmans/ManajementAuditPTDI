
const SpiModel = require ('../Model/SpiModel');
const response = require ('../../response')
const SpiService = require ('../Service/SpiService');

class spiControler {
  constructor() {
    this.SpiService = new SpiService;
  }

  static async getEvidenceSPI(req, res) {
    try {
      const evidence = await SpiModel.getEvidenceSPI(req.params.year);
      response(200, evidence, 'Menampilkan data evidence SPI', res);
    } catch (error) {
      response(500, null, 'Terjadi kesalahan pada server', res);
    }
  }

  static async uploadExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
      }

      const filePath = req.file.path;
      const selectedYear = req.body.selectedYear || new Date().getFullYear().toString();

      const formattedData = await SpiService.uploadExcel(filePath, selectedYear);
      res.json(formattedData);
    } catch (error) {
      console.error('Error in uploadExcel controller:', error);
      res.status(500).json({ error: 'Gagal memproses file Excel' });
    }
  }

  static async downloadFileExcel(req, res) {
    try {
      const filePath = await SpiService.downloadFileExcel();
      res.sendFile(filePath, 'Template.xlsx');
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate Excel file' });
    }
  }

 

  static async getDataRemarksSPI(req, res) {
    console.log('Full request body:', req.body)
    console.log('Query params:', req.query)
    console.log('URL params:', req.params)

    const key = req.body.key || req.query.key || req.params.key

    console.log('Extracted key:', key)

    try {
      const result = await SpiModel.getDataRemarksSPI(key)
      console.log('Query result:', result)
      console.log('Number of rows returned:', result.length)

      if (result.length === 0 && key) {
        return response(
          404,
          null,
          `Data tidak ditemukan untuk key: ${key}`,
          res
        )
      }

      response(200, result, 'Menampilkan data remarks by auditee', res)
    } catch (error) {
      console.error('Error executing query', error)
      response(500, null, 'Terjadi kesalahan pada server', res)
    }
  }

  static async getAuditeeSPI(req, res) {
    try {
      const auditees = await SpiModel.getAuditeeSPI();
      response(200, auditees, 'Data Auditee terpilih ditemukan', res);
    } catch (error) {
      response(500, [], 'Terjadi kesalahan saat mengambil data Auditee terpilih', res);
    }
  }

  static async updateStatusCompleteSPI(req, res) {
    try {
      const key = parseInt(req.params.i_audevd, 10);
      if (isNaN(key)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const updatedStatus = await SpiModel.updateStatusCompleteSPI(key);
      if (updatedStatus) {
        response(200, updatedStatus, "Update Status Berhasil", res);
      } else {
        response(404, null, "Data tidak ditemukan", res);
      }
    } catch (error) {
      response(500, null, "Terjadi kesalahan pada server", res);
    }
  }

  static async updateEvidenceSPI(req, res) {
    try {
        const {
          key,    // I_AUDEVD
          key1,   // AUDEVD_TITTLE
          key2,   // e_audevd_phs
          key3,   // C_AUDEVD_STAT
          key4,   // D_AUDEVD_DDL
          key5    // C_AUDEVD_AUDR
        } = req.body;

        console.log('Received data:', { key, key1, key2, key3, key4, key5 });
        // Validasi dan konversi input
        const validatedKey = parseInt(key);
        if (isNaN(validatedKey) || validatedKey <= 0) {
          throw new Error('ID tidak valid');
        }
        
        const validatedPhase = parseInt(key2);
        if (isNaN(validatedPhase) || validatedPhase < 1 || validatedPhase > 3) {
          throw new Error('Phase tidak valid');
        }

        const validatedStatus = parseInt(key3);
        if (isNaN(validatedStatus) || validatedStatus < 1 || validatedStatus > 3) {
          throw new Error('Status tidak valid');
        }
    
        const validatedAuditor = parseInt(key5);
        if (isNaN(validatedAuditor) || validatedAuditor < 1 || validatedAuditor > 4) {
          throw new Error('Auditor tidak valid');
        }
      
        if (typeof key1 !== 'string') {
       throw new Error('Title harus berupa string.');
       }
    
        // Validasi tanggal
        const validatedDate = new Date(key4);
        if (isNaN(validatedDate.getTime())) {
          throw new Error('Format tanggal tidak valid');
        }

        const existingData = await SpiModel.updateEvidenceSPI(validatedKey); // Mencari data dengan key yang diberikan
        if (!existingData) {
            throw new Error('Data tidak ditemukan');
        }

        // Jika data ditemukan, lanjutkan proses update
            const result = await SpiModel.updateEvidenceSPI({
                key1,
                validatedPhase,
                validatedStatus,
                validatedDate,
                validatedAuditor,
                validatedKey
            });

              

        if (result.length === 0) {
            throw new Error('Data tidak ditemukan');
        }

        console.log('Update Data Evidence SPI', result[0]);
        response(200, result[0], 'Update Berhasil', res);
    } catch (error) {
        console.error('Error executing query', error);
        response(400, [], error.message || 'Terjadi kesalahan', res);
    }
}

 

  static async deleteDataSPI(req, res) {
    try {
      const i_audevd = req.params.i_audevd;
      if (!i_audevd) {
        return res.status(400).json({ error: 'i_audevd tidak valid' });
      }
      const deletedData = await SpiModel.deleteDataSPI(i_audevd);
      if (deletedData) {
        res.status(200).json({ 
          message: 'Data karyawan berhasil dihapus',
          data: deletedData
        });
      } else {
        res.status(404).json({ message: 'Data karyawan tidak ditemukan' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat menghapus data karyawan' });
    }
  }
}

module.exports = spiControler;