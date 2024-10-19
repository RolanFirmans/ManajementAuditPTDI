const AdminModel = require("../Model/AdminModel");
const AdminService = require("../Service/AdminService");

class adminControler {
  constructor() {
    this.adminService = new AdminService(AdminModel);
  }


  async createKaryawan(req, res) {
    try {
      const { key, key1, key2 } = req.body;
      console.log("Data yang diterima:", { key, key1, key2 });

      if (!key2) {
        return res.status(400).json({ error: "Role (key2) tidak ada dalam body request" });
      }

      const roleInt = this.adminService.validateRole(key2);
      const result = await AdminModel.create({ key, key1, roleInt });
      console.log("Role yang dikonversi:", roleInt);

      res.status(200).json({ message: "User berhasil ditambahkan", data: result });
    } catch (error) {
      console.error("Error saat menambahkan user:", error);
      res.status(400).json({
        error: "Terjadi kesalahan saat menambahkan user",
        details: error.message
      });
    }
  }

  async getKaryawan(req, res) {
    try {
      const karyawanData = await this.adminService.getAllKaryawan();
      
      if (karyawanData.length === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.json({ payload: karyawanData });
    } catch (error) {
      console.error("Error fetching karyawan:", error);
      res.status(500).json({
        error: "Terjadi kesalahan saat mengambil data karyawan",
        details: error.message
      });
    }
  }

  async deleteKaryawan(req, res) {
    try {
      const nik = req.params.nik;
      
      if (!nik) {
        return res.status(400).json({ error: 'NIK tidak valid' });
      }

      const result = await AdminModel.delete(nik);
      
      if (!result) {
        return res.status(404).json({ message: 'Data karyawan tidak ditemukan' });
      }

      res.status(200).json({ 
        message: 'Data karyawan berhasil dihapus',
        data: result
      });
    } catch (error) {
      console.error('Error saat menghapus karyawan:', error);
      res.status(500).json({ 
        error: 'Terjadi kesalahan saat menghapus data karyawan',
        details: error.message
      });
    }
  }

  async updateKaryawan(req, res) {
    try {
      const { n_audusr_usrnm, c_audusr_role, N_AUDUSR } = req.body;

      if (!n_audusr_usrnm || !c_audusr_role || !N_AUDUSR) {
        return res.status(400).json({ error: "Semua field harus diisi" });
      }

      const roleInt = this.adminService.validateRole(c_audusr_role);
      const result = await AdminModel.update({
        n_audusr_usrnm,
        roleInt,
        N_AUDUSR
      });

      if (!result) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      res.json({ 
        message: "Data pengguna berhasil diperbarui",
        data: result
      });
    } catch (error) {
      console.error("Error in updateKaryawan:", error);
      res.status(500).json({ 
        error: "Terjadi kesalahan saat memperbarui data karyawan",
        details: error.message
      });
    }
  }
}


module.exports = new adminControler();
