const AuditeeModel = require('../Model/DeleteTugasAuditeeModel');
class deleteTugasAuditee {
    static async handleDeleteFileAuditee (req, res) {
        const key = req.params.i_audevdfile;
        try {
          const result = await AuditeeModel.handleDeleteFileAuditee(key);
          if (result) {
            res.status(200).json({ message: "File berhasil dihapus" });
          } else {
            res.status(404).json({ message: "Data tidak ditemukan" });
          }
        } catch (error) {
          console.error("Error executing query", error.stack);
          res.status(500).json({ error: "Terjadi kesalahan pada server" });
        }
      }
}

module.exports = deleteTugasAuditee;

