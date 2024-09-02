import React, { useState, useEffect } from 'react';
import "../App.css";

const DataKaryawan = ({ onSelectKaryawan }) => {
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Data`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        
        if (Array.isArray(result.data)) {
          setDataKaryawan(result.data);
        } else {
          setDataKaryawan([]);
          console.error('Expected array but got:', result.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataKaryawan.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(dataKaryawan.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="karyawan-modal-content">
      <div className="table-container">
        <table>
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
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DataKaryawan;