const axios = require("axios");
require("dotenv").config();

class AdminService {  
    constructor(AdminModel) {
    this.AdminModel = AdminModel;
  }
  validateRole(key2) {
    const roleInt = parseInt(key2);
    if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
      throw new Error(`Role tidak valid: ${key2}`);
    }
    return roleInt;
  }
  
  async getAllKaryawan() {
    try {
      const dbData = await this.AdminModel.getAllKaryawan();
      
      if (dbData.length === 0) {
        return [];
      }

      try {
        const apiData = await this.getExternalData();
        return this.combineData(dbData, apiData);
      } catch (apiError) {
        console.error("Error fetching external data:", apiError);
        return dbData;
      }
    } catch (error) {
      throw new Error(`Error getting karyawan: ${error.message}`);
    }
  }

  async getExternalData() {
    const apiUrl = process.env.VITE_API_LOCAL;
    if (!apiUrl) {
      throw new Error("VITE_API_URL tidak diset dalam file .env");
    }
    
    const response = await axios.get(apiUrl);
    return response.data.data;
  }

  combineData(dbData, apiData) {
    return dbData.map(dbUser => {
      const apiUser = apiData.find(
        apiUser => apiUser.nik === dbUser.n_audusr_usrnm
      );
      return {
        ...dbUser,
        organisasi: apiUser ? apiUser.organisasi : null,
      };
    });
  }
}

module.exports = AdminService;