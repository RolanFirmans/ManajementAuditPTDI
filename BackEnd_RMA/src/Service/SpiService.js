const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const pool = require('../../utils/dbaudit');
const SpiModel = require('../Model/SpiModel');
const response = require('../../response');

class SpiService {
    constructor(){
      this.response = response;
    }
    static SpiModel = SpiModel;
    static async uploadExcel(filePath, selectedYear) {
      try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
    
        const formattedData = data.map(item => ({
          ...item,
          formattedDate: this.formatDate(item.date),
        }));
    
        await this.saveDataExcel(filePath, selectedYear);
    
        return formattedData;
      } catch (error) {
        console.error('Error in uploadExcel:', error);
        throw error;
      }
    }

    static formatDate(date) {
      return new Date(date).toISOString().slice(0, 10);
    }

    static async saveDataExcel(filePath, selectedYear) {
      try {
        console.log(`Saving data for year: ${selectedYear}`);
        
        // Cek apakah selectedYear ada
        if (!selectedYear) {
          return res.status(400).json({ success: false, message: 'Year is required' });
        }
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
        const result = await pool.query('SELECT COUNT(*) FROM AUDIT.TMAUDEVD');
        let counter = parseInt(result.rows[0].count) + 1;
    
        for (const row of sheetData) {
          const deadline = row['Deadline'] ? new Date(row['Deadline']).toISOString().slice(0, 10) : null;
    
          const values = [
            counter++,
            row['Data & Document Needed'],
            row['Phase'],
            row['Status'],
            deadline,
            row['Remarks by Auditor'],
            row['Auditee'],
            row['Auditor'],
            row['StatusComplete'],
            selectedYear,
          ];
    
          const query = `
            INSERT INTO AUDIT.TMAUDEVD
            (I_AUDEVD, n_audevd_title, e_audevd_phs, C_AUDEVD_STAT, D_AUDEVD_DDL, e_audevd_audr, I_AUDEVD_AUD, C_AUDEVD_AUDR, c_audevd_statcmp, C_YEAR)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `;
    
          await pool.query(query, values);
        }
    
        console.log(`Data has been saved to PostgreSQL for year ${selectedYear}`);
        return { success: true, message: `Data berhasil disimpan untuk tahun ${selectedYear}` };
      } catch (error) {
        console.error('Error saving data to PostgreSQL:', error);
        throw error;
      }
    }
    
      static formatDate(dateString) {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
      }
        
    
      // Download File Excel
      static async downloadFileExcel() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
    
        worksheet.columns = [
          { header: 'Data & Document Needed', key: 'ddn', width: 25 },
          { header: 'Phase',                  key: 'phase', width: 25 },
          { header: 'Status',                 key: 'status', width: 10 },
          { header: 'Deadline',               key: 'dl', width: 10 },
          { header: 'Remarks by Auditor',     key: 'rba', width: 25 },
          { header: 'Auditor',                key: 'aud', width: 10 },
        ];
    
        const filePath = path.join(__dirname, './utils', 'Template.xlsx');
    
        if (!fs.existsSync(path.dirname(filePath))) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
    
        await workbook.xlsx.writeFile(filePath);
        
        return filePath;
      }
  
}

module.exports = SpiService;