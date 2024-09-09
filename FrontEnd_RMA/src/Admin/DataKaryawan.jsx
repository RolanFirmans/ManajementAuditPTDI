import React, { useState, useEffect } from 'react';
import "../App.css";
import { Search } from 'lucide-react';

const DataKaryawan = ({ onSelectKaryawan, filterOrganisasi  }) => {
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}`);
        if (!response.ok) {
          throw new Error('Respon jaringan tidak baik');
        }
        const result = await response.json();
        console.log('Data yang diterima dari API:', result);
        if (Array.isArray(result.data)) {
          setDataKaryawan(result.data);
        } else {
          setDataKaryawan([]);
          console.error('Diharapkan array tapi mendapatkan:', result.data);
        }
      } catch (error) {
        console.error('Error mengambil data:', error);
      }

    };

    fetchData();
  }, []);

   // Fungsi untuk Search dan Filter data
   const filteredData = dataKaryawan.filter(karyawan => {
    const matchesFilter = filterOrganisasi 
      ? karyawan.organisasi.toLowerCase().startsWith(filterOrganisasi.toLowerCase()) 
      : true;
    const matchesSearch = 
      karyawan.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      karyawan.organisasi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  console.log('Data yang difilter:', filteredData); 
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="modal-content">
      <div className="auditee-table-container">
     
        <input type="text"
        placeholder="Search..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} 
        />
      <table className="auditee-table">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>NIK</th>
              <th>Nama</th>
              <th>Organisasi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((karyawan, index) => (
              <tr key={index} onClick={() => onSelectKaryawan(karyawan)}>
                <td>{karyawan.nik}</td>
                <td>{karyawan.nama}</td>
                <td>{karyawan.organisasi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </table>
      </div>
      <div className="entries-info">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </div>  
        <div className="pagination">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&laquo;</button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const pageNumber = currentPage + i - Math.floor(3 / 2);
              if (pageNumber > 0 && pageNumber <= totalPages) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={currentPage === pageNumber ? 'active' : ''}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
          </div>
    </div>
  );
};

export default DataKaryawan;