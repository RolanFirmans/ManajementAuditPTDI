const AuditeeModel = require('../Model/AuditeeModel');

class AusiteeControler {
  static async getSearchFile(req, res) {
    try {
      const result = await AuditeeModel.getSearchFile();
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Berhasil menampilkan List Evidence (Search File)'
      });
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({
        status: 'error',
        data: null,
        message: 'Terjadi kesalahan pada server: ' + error.message
      });
    }
  }

  static async uploadNewTugas(req, res) {
    const { description, auditeeId } = req.body;
    const file = req.file;

    // Logging untuk memastikan data yang diterima
    console.log('Received Data:', {
        description,
        auditeeId,
        fileName: file ? file.originalname : 'No File'
    });

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    if (!auditeeId) {
      return res.status(400).json({ error: "No auditeeId provided" });
    }

    try {
      const generatedKey = await AuditeeModel.uploadNewTugas(
        file.originalname, 
        description || 'Deskripsi Default', 
        auditeeId
      );
      
      res.status(200).json({ 
        message: "Upload New File berhasil", 
        data: { i_audevfile: generatedKey } 
      });
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ 
        error: "Terjadi kesalahan pada server", 
        details: error.message 
      });
    }
  }

  static async uploadNewTugasAuditee(req, res) {
    const { key2 } = req.body;
    const filePath = req.file ? req.file.filename : null;

    try {
      const insertedFileId = await AuditeeModel.uploadNewTugasAuditee(filePath, key2);
      res.status(200).json({ message: 'File uploaded successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error inserting data' });
    }
  }

  static async updateStatusComleteAuditee (req, res) {
    const key = req.body.I_AUDEVD;
    try {
      const result = await AuditeeModel.updateStatusComleteAuditee(key);
      if (result) {
        res.status(200).json({ message: "Update Status Berhasil", data: result });
      } else {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
    } catch (error) {
      console.error("Error executing query", error.stack);
      res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
  }

  // static async handleDeleteFileAuditee (req, res) {
  //   const key = req.params.i_audevdfile;
  //   try {
  //     const result = await AuditeeModel.handleDeleteFileAuditee(key);
  //     if (result) {
  //       res.status(200).json({ message: "File berhasil dihapus" });
  //     } else {
  //       res.status(404).json({ message: "Data tidak ditemukan" });
  //     }
  //   } catch (error) {
  //     console.error("Error executing query", error.stack);
  //     res.status(500).json({ error: "Terjadi kesalahan pada server" });
  //   }
  // }
  
  static async getAuditeData(req, res) {
    const { nik } = req.params;
    try {
        const data = await AuditeeModel.getDataByNik(nik);
        if (data.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data' });
    }
  }
}

module.exports = AusiteeControler;