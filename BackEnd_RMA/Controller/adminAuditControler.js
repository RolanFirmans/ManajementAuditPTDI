const AdminAuditItModel = require('../Model/AdminAuditItModel')
const pool = require('../utils/dbaudit')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const mime = require('mime-types')
const response = require('../response')

class adminAuditControler {
  static async GetDataEvidence (req, res) {
    try {
      const evidence = await AdminAuditItModel.getDataEvidence(req.params.year)
      response(200, evidence, 'Menampilkan data evidence SPI', res)
    } catch (error) {
      response(500, null, 'Terjadi kesalahan pada server', res)
    }
  }

  static async GetAuditee (req, res) {
    try {
      const role = req.query.role || 2
      const result = await AdminAuditItModel.getAuditee(role)

      if (!result || result.length === 0) {
        return res.status(404).json({ message: 'Data auditee tidak ditemukan' })
      }

      try {
        const apiUrl = process.env.VITE_API_LOCAL
        if (!apiUrl) {
          throw new Error('VITE_API_URL tidak diset dalam file .env')
        }

        console.log('Menggunakan API URL:', apiUrl)

        const apiResponse = await axios.get(apiUrl)
        const apiData = apiResponse.data.data

        if (!Array.isArray(apiData)) {
          throw new Error('Data dari API eksternal bukan array')
        }

        const combinedData = result.map(dbUser => {
          const apiUser = apiData.find(
            apiUser => apiUser.nik === dbUser.n_audusr_usrnm
          )
          return {
            ...dbUser,
            organisasi: apiUser ? apiUser.organisasi : null
          }
        })

        res.json({ payload: combinedData })
      } catch (error) {
        console.error('Error fetching data from external API:', error)
        res.status(500).json({
          error: 'Terjadi kesalahan saat mengambil data dari API eksternal',
          details: error.message
        })
      }
    } catch (error) {
      console.error('Error fetching karyawan:', error)
      res.status(500).json({
        error: 'Terjadi kesalahan saat mengambil data karyawan dari database',
        details: error.message
      })
    }
  }

  static async UpdateAuditee (req, res) {
    console.log('Data yang diterima di backend:', req.body)
    try {
      const { i_audevd, n_audusr_usrnm } = req.body

      if (!i_audevd || !n_audusr_usrnm) {
        return response(400, null, 'Data tidak lengkap', res)
      }

      const result = await AdminAuditItModel.updateAuditee(
        i_audevd,
        n_audusr_usrnm
      )

      if (result) {
        response(200, result, 'Auditee berhasil diperbarui', res)
      } else {
        response(404, null, 'Data tidak ditemukan', res)
      }
    } catch (error) {
      console.error('Error executing update', error.stack)
      response(500, null, 'Terjadi kesalahan saat memperbarui Auditee', res)
    }
  }

  static async GetMenampilkanAuditee (req, res) {
    try {
      const result = await AdminAuditItModel.getMenampilkanAuditee()
      response(200, result, 'Data Auditee terpilih ditemukan', res)
    } catch (error) {
      console.error('Error executing query', error.stack)
      response(
        500,
        [],
        'Terjadi kesalahan saat mengambil data Auditee terpilih',
        res
      )
    }
  }

  static async getDataRemarks (req, res) {
    console.log('Full request body:', req.body)
    console.log('Query params:', req.query)
    console.log('URL params:', req.params)

    const key = req.body.key || req.query.key || req.params.key

    console.log('Extracted key:', key)

    try {
      const result = await AdminAuditItModel.getDataRemarks(key)
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

  static async updateStatus (req, res) {
    const key = req.body.I_AUDEVD
    try {
      const result = await AdminAuditItModel.updateStatus(key)
      if (result) {
        res
          .status(200)
          .json({ message: 'Update Status Berhasil', data: result })
      } else {
        res.status(404).json({ message: 'Data tidak ditemukan' })
      }
    } catch (error) {
      console.error('Error executing query', error.stack)
      res.status(500).json({ message: 'Terjadi kesalahan pada server' })
    }
  }

  static async DeleteDataAdminIT (req, res) {
    const i_audevd = req.params.i_audevd
    console.log('Received delete request for i_audevd:', i_audevd)

    if (!i_audevd) {
      return res.status(400).json({ error: 'i_audevd tidak valid' })
    }

    try {
      const deletedKaryawan = await AdminAuditItModel.deleteDataAdminIT(
        i_audevd
      )

      if (!deletedKaryawan) {
        return res
          .status(404)
          .json({ message: 'Data karyawan tidak ditemukan' })
      }

      res.status(200).json({
        message: 'Data karyawan berhasil dihapus',
        data: deletedKaryawan
      })
    } catch (error) {
      console.error('Error saat menghapus karyawan:', error)
      res
        .status(500)
        .json({ error: 'Terjadi kesalahan saat menghapus data karyawan' })
    }
  }
  static async GetDownloadFile (req, res) {
    try {
      const { fileId } = req.params
      const result = await AdminAuditItModel.getDownloadFile(fileId)

      if (!result) {
        return res.status(404).json({
          status: false,
          message: 'File tidak ditemukan dalam database'
        })
      }

      const { n_audevdfile_file } = result
      const filePath = path.join(__dirname, '../uploads', n_audevdfile_file)

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: false,
          message: 'File fisik tidak ditemukan'
        })
      }

      // Tentukan MIME type dari file yang diambil dari database
      const mimeType = mime.lookup(n_audevdfile_file)

      if (!mimeType) {
        return res.status(400).json({
          status: false,
          message: 'Tipe file tidak valid atau tidak dikenali'
        })
      }

      // Set the appropriate headers
      res.setHeader('Content-Type', mimeType)
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${n_audevdfile_file}"`
      )

      // Kirimkan file menggunakan stream
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)

      fileStream.on('error', err => {
        console.error('Error during file streaming:', err)
        res.status(500).json({
          status: false,
          message: 'Terjadi kesalahan saat mengirim file'
        })
      })
    } catch (error) {
      console.error('Error in GetDownloadFile:', error)
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat mengunduh file',
        error: error.message
      })
    }
  }
  static async GetDownloadFile (req, res) {
    try {
      const { fileId } = req.params

      const result = await AdminAuditItModel.getDownloadFile(fileId)
      if (!result) {
        return res.status(404).json({
          status: false,
          message: 'File tidak ditemukan dalam database'
        })
      }

      const { n_audevdfile_file } = result
      const filePath = path.join(__dirname, '../uploads', n_audevdfile_file)

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: false,
          message: 'File fisik tidak ditemukan'
        })
      }

      const stat = fs.statSync(filePath)
      const mimeType = mime.lookup(filePath) || 'application/octet-stream'

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          n_audevdfile_file
        )}"`
      })

      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    } catch (error) {
      console.error('Error in GetDownloadFile:', error)
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat mengunduh file',
        error: error.message
      })
    }
  }
}

module.exports = adminAuditControler
