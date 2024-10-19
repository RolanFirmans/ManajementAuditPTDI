const pool = require("../utils/dbaudit");
const bcrypt = require("bcrypt");

class AdminModel {
  constructor() {
    this.pool = pool;
    this.saltRounds = 10;
  }

  async create(userData) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const hashedPassword = await bcrypt.hash(userData.key, this.saltRounds);
      
      const result = await client.query(`
        INSERT INTO AUDIT.TMAUDUSR  
        (N_AUDUSR_USRNM, N_AUDUSR, C_AUDUSR_ROLE, n_audusr_pswd)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userData.key, userData.key1, userData.roleInt, hashedPassword]);
      
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getAll() {
    try {
      const result = await pool.query(`
        SELECT i_audusr, n_audusr_usrnm, N_AUDUSR, C_AUDUSR_ROLE AS role
        FROM AUDIT.TMAUDUSR
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  

  async delete(nik) {
    const result = await this.pool.query(
      'DELETE FROM AUDIT.TMAUDUSR WHERE n_audusr_usrnm = $1 RETURNING *',
      [nik]
    );
    return result.rows[0];
  }

  async update(userData) {
    const result = await this.pool.query(`
      UPDATE AUDIT.TMAUDUSR SET 
        N_AUDUSR = $1,
        C_AUDUSR_ROLE = $2
      WHERE N_AUDUSR_USRNM = $3
      RETURNING *
    `, [userData.N_AUDUSR, userData.roleInt, userData.n_audusr_usrnm]);
    
    return result.rows[0];
  }
}

module.exports = new AdminModel();
