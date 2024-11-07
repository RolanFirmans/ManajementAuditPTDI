const pool = require("../../utils/dbaudit");


class AdminAuditItModel {
    constructor() {
        this.pool = pool;
      }
  static async getDataEvidenceAAIT() {
    const currentYear = new Date().getFullYear().toString();
      const result = await pool.query(
          'SELECT * FROM audit.tmaudevd WHERE EXTRACT(YEAR FROM TO_DATE(C_YEAR, \'YYYY\')) = $1',
          [currentYear]
      );
        return result.rows;
  }


  static async getSelectAuditeeAAIT(role) {
   
    const result = await pool.query(`
      SELECT t.n_audusr_usrnm, t.N_AUDUSR, t.c_audusr_role
      FROM audit.TMAUDUSR t
      WHERE t.c_audusr_role = $1
    `, [role]);
    return result.rows;
  }

  
  static async updateDataAuditee(i_audevd, n_audusr_usrnm) {
    const updateQuery = `
    UPDATE audit.tmaudevd
    SET i_audevd_aud = $2
    WHERE i_audevd = $1
    RETURNING *;
    `;
    const result = await pool.query(updateQuery, [i_audevd, n_audusr_usrnm]);
    return result.rows[0];
  }


  static async getAuditeeAAIT() {
    const query = `
      select b.n_audusr_usrnm, b.n_audusr
      from audit.tmaudevd a 
      join audit.tmaudusr b on a.i_audevd_aud = b.n_audusr_usrnm
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getDataRemarksAAIT(key) {
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

  static async updateStatusCompleteAAIT(key) {
    const query = `update audit.tmaudevd set c_audevd_statcmp = 2 where i_audevd = $1 returning *`;
    const result = await pool.query(query, [key]);
    return result.rows[0];
  }

  static async DeleteDataAdminIT(i_audevd) {
    const query = 'DELETE FROM AUDIT.tmaudevd WHERE i_audevd = $1 RETURNING *';
    const result = await pool.query(query, [i_audevd]);
    return result.rows[0];
  }

  static async getDownloadFileAAIT (fileId){

    try {
      const query = 'SELECT i_audevdfile, n_audevdfile_file FROM audit.tmaudevdfile WHERE i_audevdfile = $1';
      const result = await pool.query(query, [parseInt(fileId)]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getDownloadFile:', error);
      throw error;
    }  
  }
}

module.exports = AdminAuditItModel;