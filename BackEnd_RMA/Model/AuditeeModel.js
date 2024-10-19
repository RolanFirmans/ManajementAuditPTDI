const pool = require('../utils/dbaudit')
class AuditeeModel {
  static async getSearchFile () {
    const query = `
      SELECT i_audevdfile, n_audevdfile_file, e_audevdfile_desc 
      FROM AUDIT.TMAUDEVDFILE
    `
    const result = await pool.query(query)
    return result.rows
  }

  static async uploadNewFile (fileName, description, auditeeId) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const query1 = 'SELECT I_AUDEVD FROM AUDIT.TMAUDEVD WHERE id = $1'
      const result1 = await client.query(query1, [auditeeId])
      if (result1.rows.length === 0) {
        throw new Error('Auditee not found')
      }
      const i_audevd = result1.rows[0].i_audevd

      const query2 = `
        INSERT INTO AUDIT.TMAUDEVDFILE (N_AUDEVDFILE_FILE, E_AUDEVDFILE_DESC)
        VALUES ($1, $2)
        RETURNING I_AUDEVDFILE;
      `
      const result2 = await client.query(query2, [fileName, description])
      const generatedKey = result2.rows[0].i_audevdfile

      const query3 = `
        INSERT INTO AUDIT.TMAUDEVDFILEDTL (I_AUDEVD, I_AUDEVDFILE)
        VALUES ($1, $2);
      `
      await client.query(query3, [i_audevd, generatedKey])

      await client.query('COMMIT')
      return generatedKey
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  static async uploadNewFileAuditee (filePath, key2) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const insertFileQuery = `
        INSERT INTO AUDIT.TMAUDEVDFILE (N_AUDEVDFILE_FILE, E_AUDEVDFILE_DESC) 
        VALUES ($1, $2) RETURNING I_AUDEVDFILE
      `
      const insertFileResult = await client.query(insertFileQuery, [
        filePath,
        key2
      ])
      const insertedFileId = insertFileResult.rows[0].i_audevdfile

      const insertDetailQuery = `
        INSERT INTO AUDIT.TMAUDEVDFILEDTL (I_AUDEVDFILE) 
        VALUES ($1)
      `
      await client.query(insertDetailQuery, [insertedFileId])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  static async updateStatus(key){
    const query = `
      UPDATE AUDIT.TMAUDEVD
      SET C_AUDEVD_STATCMP = 1 WHERE I_AUDEVD = $1 RETURNING *`;
      const result = await pool.query(query, [key])
    return result.rows[0];
  }
}

module.exports = AuditeeModel
