import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { getYear } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import "../App.css";
import Swal from 'sweetalert2';

Modal.setAppElement("#root");

const EvidenceAait = () => {
  const [orders, setOrders] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [auditeeData, setAuditeeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentEditOrder, setCurrentEditOrder] = useState(null);
  const [selectedAuditees, setSelectedAuditees] = useState({});
  const itemsPerPage = 10;

  const [newUser, setNewUser] = useState({
    no: "",
    dataAndDocumentNeeded: "",
    phase: "",
    status: "",
    deadline: "",
    remarksByAuditee: "",
    remarksByAuditor: "",
    auditee: "",
    auditor: "",
    statusComplete: "",
    publishingYear: "",
  });

  const convertStatus = (status) => {
    switch (status) {
      case 1:
        return "pending";
      case 2:
        return "not available";
      case 3:
        return "not applicable";
      default:
        return "unknown";
    }
  };

  const convertAuditor = (auditor) => {
    switch (auditor) {
      case 1:
        return "DGCA";
      case 2:
        return "Finance";
      case 3:
        return "ITML";
      case 4:
        return "ParkerRussel";
      default:
        return "unknown";
    }
  };

  const convertPhase = (phase) => {
    switch (phase) {
      case 1:
        return "Perencanaan";
      case 2:
        return "Pelaksanaan";
      case 3:
        return "Pelaporan";
      default:
        return "unknown";
    }

  }

  const convertStatusComplete = (statusComplete, hasRemarks = false) => {
    console.log('Converting status:', statusComplete, 'hasRemarks:', hasRemarks);
    if (statusComplete === 2) { 
      return { text: "COMPLETE AUDITEE ADMIN IT", backgroundColor: "yellow", color: "black" };
    }
    if (hasRemarks) {
      return { text: "COMPLETE AUDITEE", backgroundColor: "orange", color: "white" };
    }
    return { text: "NOT COMPLETE", backgroundColor: "red", color: "white" };
  };

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // const handleAddUser = () => {
  //   setOrders((prev) => [
  //     ...prev,
  //     { no: prev.length > 0 ? prev[prev.length - 1].no + 1 : 1, ...newUser, publishingYear: new Date().getFullYear() },
  //   ]);
  //   setIsModalOpen(false);
  //   resetNewUser();
  // };

  const handleEditUser = (order) => {
    setCurrentEditOrder(order);
    setIsEditModalOpen(true);
    fetchRemarks(order.no); 
  };

  const handleYearChange = (date) => {
    const year = date ? getYear(date).toString() : "";
    setSelectedYear(year);
  };

// -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
  const filteredOrders = selectedYear
  ? orders.filter((order) => order.publishingYear === selectedYear)
  : orders;

  const fetchDataByYear = useCallback(async (year) => {
    if (year) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/tmau-devd`, {
          params: { year: year }
        });
        if (response.data && response.data.payload && Array.isArray(response.data.payload.data)) {
          const formattedData = response.data.payload.data.map(item => {
            const storedOrder = JSON.parse(localStorage.getItem("orders") || "[]")
              .find(o => o.no === item.i_audevd);
            return {
              no: item.i_audevd,
              dataAndDocumentNeeded: item.n_audevd_title,
              phase: convertPhase(item.e_audevd_phs),
              status: convertStatus(item.c_audevd_stat),
              deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
              remarksByAuditee: "",
              remarksByAuditor: item.e_audevd_audr,
              auditee: { nik: '', name: '' },
              auditor: convertAuditor(item.c_audevd_audr),
              statusComplete: convertStatusComplete(
                storedOrder ? storedOrder.statusComplete : item.c_audevd_statcmp,
                false,
                storedOrder ? storedOrder.isUpdated : false
              ),
              publishingYear: item.c_year,
              i_audevd_aud: item.i_audevd_aud || '',
              isUpdated: storedOrder ? storedOrder.isUpdated : false,
            };
          });
          setOrders(formattedData);
          for (const order of formattedData) {
            await GetAuditee(order.no, order.i_audevd_aud);
            await fetchRemarks(order.no);
          }
        } else {
          setOrders([]);
          console.log('Data tidak ditemukan atau tidak dalam format array');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      console.log('Tahun tidak dipilih, fetchDataByYear tidak dijalankan');
    }
  }, []);

// --MENAMPILKAN DATA AUDITEE
useEffect(() => {
  const fetchAuditeeData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/auditee`);
      if (response.data && Array.isArray(response.data.payload)) {
        setAuditeeData(response.data.payload);
      } else {
        console.error('Expected an array but got:', response.data.payload);
        setAuditeeData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAuditeeData([]);
    }
  };

  if (isEditModalOpen) {
    fetchAuditeeData();
  }
}, [isEditModalOpen]);

const filteredData = Array.isArray(auditeeData)
  ? auditeeData.filter(
      item =>
        item.n_audusr_usrnm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.n_audusr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organisasi?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : [];

// -- MEMILIH AUDITEE
const handleCheckboxChange = (nik) => {
  setSelectedAuditees(prev => ({
    ...prev,
    [currentEditOrder.no]: nik
  }));
};

const handleSelectAuditee = async () => {
  const selectedNik = selectedAuditees[currentEditOrder.no];
  if (!selectedNik) {
    console.error("Tidak ada auditee yang dipilih");
    return;
  }

  const requestData = {
    i_audevd: currentEditOrder.no,
    n_audusr_usrnm: selectedNik
  };
  console.log('Data yang dikirim:', requestData);

  try {
    const response = await axios.post(`${import.meta.env.VITE_HELP_DESK}/AuditIT/update-auditee`, requestData);
    
    if (response.data && response.data.payload) {
      console.log("Auditee berhasil diperbarui");
      setOrders(prevOrders => prevOrders.map(order => 
        order.no === currentEditOrder.no 
          ? { ...order, auditee: { nik: selectedNik, name: auditeeData.find(a => a.n_audusr_usrnm === selectedNik)?.n_audusr } } 
          : order
      ));
      setIsEditModalOpen(false);
      setSelectedAuditees({});
      Swal.fire({
        title: "Good job!",
        text: `Data berhasil di Upload`,
        icon: "success"
      });
    } else {
      console.error("Gagal memperbarui auditee:", response.data ? response.data.message : "Respons tidak valid");
    }
  } catch (error) {
    console.error("Error saat memperbarui auditee:", error.response ? error.response.data : error.message);
  }
};

// -- MENAMPILKAN AUDITEE --
const GetAuditee = async (orderNo, i_audevd_aud) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/select-auditee`, {
      params: { i_audevd: orderNo }
    });
    if (response.data && response.data.payload && Array.isArray(response.data.payload.data)) {
      const auditeeDataArray = response.data.payload.data;
      let matchingAuditee;

      if (i_audevd_aud) {
        matchingAuditee = auditeeDataArray.find(auditee => auditee.n_audusr_usrnm === i_audevd_aud);
      } else if (auditeeDataArray.length > 0) {
        // Jika i_audevd_aud undefined, ambil auditee pertama dari array
        matchingAuditee = auditeeDataArray[0];
        console.log(`i_audevd_aud undefined untuk order ${orderNo}, menggunakan auditee pertama`);
      }
      
      if (matchingAuditee) {
        setOrders(prevOrders => prevOrders.map(order => 
          order.no === orderNo 
            ? { 
                ...order, 
                auditee: {
                  nik: matchingAuditee.n_audusr_usrnm,
                  name: matchingAuditee.n_audusr  
                }
              } 
            : order
        ));
      } else {
        console.log(`Tidak ada auditee yang cocok untuk order ${orderNo}`);
      }
    } else {
      console.error(`Respons tidak valid untuk order ${orderNo}:`, response.data);
    }
  } catch (error) {
    console.error(`Error mengambil data auditee untuk order ${orderNo}:`, error);
  }
};

////////////////////////////////////

// MENAMPILKAN DATA REMARKS BY AUDITEE START :
const fetchRemarks = async (key) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/selected-remarks-auditee`, {
      params: { key: key }
    });
    if (response.data && response.data.payload && response.data.payload.data && response.data.payload.data.length > 0) {
      const remarksByAuditee = response.data.payload.data[0].e_audevdfile_desc || "";
      const hasRemarks = remarksByAuditee.trim() !== "";
      setOrders(prevOrders => prevOrders.map(order => 
        order.no === key ? { 
          ...order, 
          remarksByAuditee,
          statusComplete: order.isUpdated 
            ? order.statusComplete 
            : convertStatusComplete(order.statusComplete.text === "COMPLETE AUDITEE ADMIN IT" ? 2 : hasRemarks ? 1 : 0, hasRemarks)
        } : order
      ));
    }
  } catch (error) {
    console.error('Error fetching remarks for key', key, ':', error);
  }
};

const handleUpdateStatus = async (order) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_HELP_DESK}/AuditIT/update-status`, {
        I_AUDEVD: order.no
      });

      if (response.data && response.data.message === "Update Status Berhasil") {
        console.log("Status berhasil diperbarui");
        setOrders(prevOrders => prevOrders.map(o => 
          o.no === order.no 
            ? { ...o, statusComplete: convertStatusComplete(2, true, true), isUpdated: true } 
            : o
        ));
        // Simpan status yang diperbarui ke localStorage
        const updatedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        const updatedOrderIndex = updatedOrders.findIndex(o => o.no === order.no);
        if (updatedOrderIndex !== -1) {
          updatedOrders[updatedOrderIndex] = { ...updatedOrders[updatedOrderIndex], statusComplete: 2, isUpdated: true };
          localStorage.setItem("orders", JSON.stringify(updatedOrders));
        }
      } else {
        console.error("Gagal memperbarui status:", response.data ? response.data.message : "Respons tidak valid");
      }
    } catch (error) {
      console.error("Error saat memperbarui status:", error.response ? error.response.data : error.message);
    }
  };

useEffect(() => {
    if (selectedYear) {
      fetchDataByYear(selectedYear);
    }
  }, [selectedYear, fetchDataByYear]);


useEffect(() => {
  console.log('Orders updated:', orders);
}, [orders]);


// MENAMPILKAN DATA REMARKS BY AUDITEE END :

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

  return (
    <div className="evidence-content">
      <h2>Data Evidence</h2>
      <h2>Data Evidence</h2>
      <div className="filter-year-evidence">
        <label>Filter Berdasarkan Tahun Penerbitan: </label>
        <DatePicker
          selected={selectedYear ? new Date(`${selectedYear}-01-01`) : null}
          onChange={handleYearChange}
          showYearPicker
          dateFormat="yyyy"
          placeholderText="Select year" 
        />
      </div>  
      <div className="evidence-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Data and Document Needed</th>
              <th>Phase</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Remarks by Auditee</th>
              <th>Remarks by Auditor</th>
              <th>Auditee</th>
              <th>Auditor</th>
              <th>Status Complete</th>
              <th>Action</th>
            </tr>
          </thead>
               <tbody>
                  {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => {
                  // Cari data auditee berdasarkan `order.auditee`
                  const auditee = auditeeData.find(auditee => auditee.n_audusr_usrnm === order.auditee) || {};
                  return (
                    <tr key={order.no || index}>
                      <td>{order.no}</td>
                      <td>{order.dataAndDocumentNeeded}</td>
                      <td>{order.phase}</td>
                      <td>{order.status}</td>
                      <td>{order.deadline}</td>
                      <td>{order.remarksByAuditee !== undefined ? order.remarksByAuditee : "Loading..." }</td>
                      <td>{order.remarksByAuditor}</td>
                      <td>
                      {order.auditee && order.auditee.nik ? 
                        `${order.auditee.nik} - ${order.auditee.name}` : 
                        "-"
                      }
                    </td>                 
                    <td>{order.auditor}</td>
                      <td style={{ backgroundColor: order.statusComplete.backgroundColor, color: order.statusComplete.color }}>
                        {order.statusComplete.text}
                      </td>
                      <td>
                        <button onClick={() => handleEditUser(order)}>Edit</button>
                        <button onClick={() => handleDeleteUser(order)}>Delete</button>
                        {order.statusComplete.backgroundColor === "orange" && (
                        <button onClick={() => handleUpdateStatus(order)}>Update Status</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11">Tidak ada data untuk ditampilkan</td>
                </tr>
              )}
            </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit User Modal"
        className="evidence-modal"
        overlayClassName="evidence-modal-overlay"
      >
        <h2>Edit User</h2>
        <div className="modal-content">
          <div className="auditee-table-container">
            <h3>DATA AUDITEE</h3>
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <table className="auditee-table">
              <table className="table table-striped">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Check</th>
                  <th>NIK</th>
                  <th>Name</th>
                  <th>Organization</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.n_audusr_usrnm || index}>
                      <td>{index + 1}</td>
                      <td><input 
                          type="checkbox" 
                          checked={selectedAuditees[currentEditOrder?.no] === item.n_audusr_usrnm}
                          onChange={() => handleCheckboxChange(item.n_audusr_usrnm)}
                        /></td>
                      <td>{item.n_audusr_usrnm}</td>
                      <td>{item.n_audusr}</td>
                      <td>{item.organisasi}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No data found</td>
                  </tr>
                )}
              </tbody>
            </table>
            </table>
            
            <div className="modal-actions">
              <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="select-btn" onClick={handleSelectAuditee} >Select</button>
            </div>
            <div className="entries-info">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="pagination">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&laquo;</button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
      </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EvidenceAait;