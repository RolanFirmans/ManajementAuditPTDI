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

  static async uploadNewFile(req, res) {
    const { description, auditeeId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!auditeeId) {
      return res.status(400).json({ error: "No auditeeId provided" });
    }

    try {
      const generatedKey = await AuditeeModel.uploadNewFile(file.originalname, description, auditeeId);
      res.status(200).json({ message: "Upload New File berhasil", data: { i_audevfile: generatedKey } });
    } catch (error) {
      console.error("Error executing query", error.stack);
      res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
  }

  static async uploadNewFileAuditee(req, res) {
    const { key2 } = req.body;
    const filePath = req.file ? req.file.filename : null;

    try {
      const insertedFileId = await AuditeeModel.uploadNewFileAuditee(filePath, key2);
      res.status(200).json({ message: 'File uploaded successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error inserting data' });
    }
  }

  static async updateStatus (req, res) {
    const key = req.body.I_AUDEVD;
    try {
      const result = await AuditeeModel.updateStatus(key);
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
}

module.exports = AusiteeControler;