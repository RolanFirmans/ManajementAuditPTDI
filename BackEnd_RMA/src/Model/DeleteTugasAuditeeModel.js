const pool = require('../../utils/dbaudit')

class deleteTugasAuditee {
    static async handleDeleteFileAuditee(key){
        const query = `
          DELETE FROM AUDIT.TMAUDEVDFILE WHERE i_audevdfile = $1 RETURNING *`;
          const result = await pool.query(query, [key])
        return result.rows[0];
      }
}

module.exports = deleteTugasAuditee;