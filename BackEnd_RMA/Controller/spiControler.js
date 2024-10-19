const SpiService = require ('../Service/SpiService');
const SpiModel = require ('../Model/SpiModel');
const response = require ('../response')

class spiControler {
  constructor() {
    this.SpiService = new SpiService;
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

  static async getEvidence(req, res) {
    try {
      const evidence = await SpiModel.getEvidence(req.params.year);
      response(200, evidence, 'Menampilkan data evidence SPI', res);
    } catch (error) {
      response(500, null, 'Terjadi kesalahan pada server', res);
    }
  }

  static async getDataRemarks(req, res) {
    try {
      const remarks = await SpiModel.getDataRemarks(req.query.key);
      response(200, remarks, 'Menampilkan data diupload oleh Auditee', res);
    } catch (error) {
      response(500, null, 'Terjadi kesalahan pada server', res);
    }
  }

  static async getSelectedAuditee(req, res) {
    try {
      const auditees = await SpiModel.getSelectedAuditee();
      response(200, auditees, 'Data Auditee terpilih ditemukan', res);
    } catch (error) {
      response(500, [], 'Terjadi kesalahan saat mengambil data Auditee terpilih', res);
    }
  }

  static async updateStatus(req, res) {
    try {
      const key = parseInt(req.params.i_audevd, 10);
      if (isNaN(key)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const updatedStatus = await SpiModel.updateStatus(key);
      if (updatedStatus) {
        response(200, updatedStatus, "Update Status Berhasil", res);
      } else {
        response(404, null, "Data tidak ditemukan", res);
      }
    } catch (error) {
      response(500, null, "Terjadi kesalahan pada server", res);
    }
  }

  static async updateEvidence(req, res) {
    try {
      const updatedEvidence = await this.SpiService.updateEvidence(req.body);
      res.json(updatedEvidence);
    } catch (error) {
      res.status(400).json({ error: error.message });
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