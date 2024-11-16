const pool = require('../../utils/dbaudit');


class SpiModel {
    constructor() {
      this.pool = pool;
    }

    static async getEvidenceSPI() {
      const result = await pool.query(
          'SELECT * FROM audit.tmaudevd WHERE C_YEAR IN (SELECT DISTINCT C_YEAR FROM audit.tmaudevd)'
      );
      return result.rows;
     }
  
      static async getDataRemarksSPI(key) {
        let query = `
        SELECT i_audevdfile, n_audevdfile_file, e_audevdfile_desc 
        FROM audit.tmaudevdFILE
      `;
        let params = [];
    
        if (key) {
          query += ' WHERE i_audevdfile = $1';
          params.push(key);
        }
    
        const result = await pool.query(query, params);
        return result.rows;
      }
    
      static async getAuditeeSPI() {
        const query = `
          SELECT b.n_audusr_usrnm, b.n_audusr
          FROM audit.tmaudevd a 
          JOIN audit.tmaudusr b ON a.i_audevd_aud = b.n_audusr_usrnm
        `;
        const result = await pool.query(query);
        return result.rows;
      }
    
      static async updateStatusCompleteSPI(key) {
        const query = 'UPDATE AUDIT.TMAUdevd SET c_audevd_statcmp = 3 WHERE i_audevd = $1 RETURNING *';
        const result = await pool.query(query, [key]);
        return result.rows[0];
      }
    
      static async deleteDataSPI(i_audevd) {
        const query = 'DELETE FROM AUDIT.tmaudevd WHERE i_audevd = $1 RETURNING *';
        const result = await pool.query(query, [i_audevd]);
        return result.rows[0];
      }

     static async updateEvidenceSPI(data) {
        const {
          key1,   // AUDEVD_TITTLE
          validatedPhase,   // e_audevd_phs
          validatedStatus,   // C_AUDEVD_STAT
          validatedDate,   // D_AUDEVD_DDL
          validatedAuditor,   // C_AUDEVD_AUDR
          validatedKey // I_AUDEVD
        } = data;
    
        const result = await pool.query(`
          UPDATE AUDIT.TMAUDEVD
          SET
            n_audevd_title = $1,
            e_audevd_phs = $2,
            c_audevd_stat = $3,
            d_audevd_ddl = $4,
            c_audevd_audr = $5
          WHERE i_audevd = $6
        `, [key1, validatedPhase, validatedStatus, validatedDate, validatedAuditor, validatedKey]);
        
    
        return result.rows;
      }
      
}

module.exports = SpiModel;