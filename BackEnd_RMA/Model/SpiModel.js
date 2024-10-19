const pool = require('../utils/dbaudit');

class SpiModel {
    constructor() {
      this.pool = pool;
    }

    static async getEvidence() {
      const currentYear = new Date().getFullYear().toString();
      const result = await pool.query(
          'SELECT * FROM audit.tmaudevd WHERE EXTRACT(YEAR FROM TO_DATE(C_YEAR, \'YYYY\')) = $1',
          [currentYear]
      );
        return result.rows;
      }
    
      static async getDataRemarks(key) {
        const query = `
          SELECT B.N_AUDEVDFILE_FILE, B.E_AUDEVDFILE_DESC 
          FROM AUDIT.TMAUDEVDFILEDTL A, AUDIT.TMAUDEVDFILE B 
          WHERE A.I_AUDEVD = $1 AND A.I_AUDEVDFILE = B.I_AUDEVDFILE
        `;
        const result = await pool.query(query, [key]);
        return result.rows;
      }
    
      static async getSelectedAuditee() {
        const query = `
          SELECT b.n_audusr_usrnm, b.n_audusr
          FROM audit.tmaudevd a 
          JOIN audit.tmaudusr b ON a.i_audevd_aud = b.n_audusr_usrnm
        `;
        const result = await pool.query(query);
        return result.rows;
      }
    
      static async updateStatus(key) {
        const query = 'UPDATE AUDIT.TMAUdevd SET c_audevd_statcmp = 3 WHERE i_audevd = $1 RETURNING *';
        const result = await pool.query(query, [key]);
        return result.rows[0];
      }
    
      static async deleteDataSPI(i_audevd) {
        const query = 'DELETE FROM AUDIT.tmaudevd WHERE i_audevd = $1 RETURNING *';
        const result = await pool.query(query, [i_audevd]);
        return result.rows[0];
      }

      static async updateEvidence(id, title, phs, status, date, auditor) {
        const result = await this.pool.query(`
          UPDATE AUDIT.TMAUdevd
          SET
            n_audevd_title = $1,
            e_audevd_phs = $2,
            c_audevd_stat = $3,
            d_audevd_ddl = $4,
            c_audevd_audr = $5
          WHERE i_audevd = $6
          RETURNING *
        `, [title, phs, status, date, auditor, id]);
    
        return result.rows[0];
      }
      
}

module.exports = SpiModel;