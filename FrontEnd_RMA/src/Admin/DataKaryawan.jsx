import React, { useState, useEffect } from "react";
import "../App.css";
import { Pagination } from 'antd';

const DataKaryawan = ({ onSelectKaryawan, filterOrganisasi }) => {
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_LOCAL}`);
        if (!response.ok) {
          throw new Error("Respon jaringan tidak baik");
        }
        const result = await response.json();
        console.log("Data yang diterima dari API:", result);
        if (Array.isArray(result.data)) {
          setDataKaryawan(result.data);
        } else {
          setDataKaryawan([]);
          console.error("Diharapkan array tapi mendapatkan:", result.data);
        }
      } catch (error) {
        console.error("Error mengambil data:", error);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk Search dan Filter data
  const filteredData = dataKaryawan.filter((karyawan) => {
    const matchesFilter = filterOrganisasi
      ? karyawan.organisasi &&
        karyawan.organisasi
          .toLowerCase()
          .startsWith(filterOrganisasi.toLowerCase())
      : true;
    const matchesSearch =
      (karyawan.nik &&
        karyawan.nik.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (karyawan.nama &&
        karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (karyawan.organisasi &&
        karyawan.organisasi.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="modal-content">
      <input
        type="text"
        placeholder="Search..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="auditee-table-container">
        <table className="auditee-table">
          <thead>
            <tr>
              <th>NIK</th>
              <th>Nama</th>
              <th>Organisasi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((karyawan, index) => (
              <tr 
                key={karyawan.nik || index} 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  console.log('Row clicked:', karyawan);
                  onSelectKaryawan(karyawan);
                }}
              >
                <td>{karyawan.nik}</td>
                <td>{karyawan.nama}</td>
                <td>{karyawan.organisasi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="entries-info">
        Showing {indexOfFirstItem + 1} to{" "}
        {Math.min(indexOfLastItem, filteredData.length)} of{" "}
        {filteredData.length} entries
      </div>
      
      <Pagination
        current={currentPage}
        total={filteredData.length}
        pageSize={itemsPerPage}
        onChange={handlePageChange}
        showSizeChanger={false}
        showQuickJumper={false}
        className="pagination_Karyawan"
      />

      
    </div>
  );
};

export default DataKaryawan;