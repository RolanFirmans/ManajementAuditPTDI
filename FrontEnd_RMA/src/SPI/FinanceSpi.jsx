import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import { getYear, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Pagination } from 'antd';
import { useMemo } from 'react';
import "../App.css";

Modal.setAppElement("#root");

const Finance = () => {
  const [orders, setOrders] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [statusCompletedOrders, setStatusCompletedOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const sortedOrders = orders.sort((a, b) => a.no - b.no);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Fungsi untuk mengonversi status ke string
  const convertStatusToString = (status) => {
    const statusNum = Number(status);
    switch (statusNum) {
      case 1: return "Pending";
      case 2: return "Not Available";
      case 3: return "Not Applicable";
      default: return "Unknown";
    }
  };

  // Fungsi untuk mengonversi auditor ke string 
  const convertAuditorToString = (auditor) => {
    const auditorNum = Number(auditor);
    switch (auditorNum) {
      case 1: return "DGCA";
      case 2: return "FINANCE";
      case 3: return "ITML";
      case 4: return "PARKERRUSSEL";
      default: return "Unknown";
    }
  };

  // Fungsi untuk mengonversi status ke nomor
  const convertStatusToNumber = (status) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case "pending": return 1;
      case "not available": return 2;
      case "not applicable": return 3;
      default: return 1;
    }
  };

  // Fungsi untuk mengonversi phase ke string
  const convertPhaseToString = function (phase) {
    const phaseNumber = Number(phase);
    switch (phaseNumber) {
      case 1: return "Perencanaan";
      case 2: return "Pelaksanaan";
      case 3: return "Pelaporan";
      default: return "Unknown Phase";
    }
  }

   // Fungsi untuk mengonversi auditor ke nomor
  const convertAuditorToNumber = (auditor) => {
    if (typeof auditor !== 'string') {
      console.warn(`Unexpected auditor value: ${auditor}. Using default value.`);
      return 1;
    }
    
    switch (auditor.toUpperCase()) {
      case "DGCA": return 1;
      case "FINANCE": return 2;
      case "ITML": return 3;
      case "PARKERRUSSEL": return 4;
      default:
        console.warn(`Unknown auditor value: ${auditor}. Using default value.`);
        return 1;
    }
  };

  // Fungsi untuk mengonversi status complete
  const convertStatusComplete = (statusComplete, hasRemarks = false) => {
    console.log("convertStatusComplete dipanggil dengan:", statusComplete, hasRemarks);
    let result;
    if (statusComplete === 3) {
      result = { text: "COMPLETE SPI", backgroundColor: "green", color: "white" };
    } else if (statusComplete === 2) {
      result = { text: "COMPLETE AUDITEE ADMIN IT", backgroundColor: "yellow", color: "black" };
    } else if (statusComplete === 1 && hasRemarks) {
      result = { text: "COMPLETE AUDITEE", backgroundColor: "orange", color: "white" };
    } else {
      result = { text: "NOT COMPLETE", backgroundColor: "red", color: "white" };
    }
    console.log("convertStatusComplete mengembalikan:", result);
    return result;
  };

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

 
 
 // Fungsi untuk memperbarui nomor urutan pada orders
  const updateOrderNumbers = (ordersList) => {
    return ordersList.map((order, index) => ({
      ...order,
      no: index + 1,
    }));
  };

 // Fungsi untuk mengedit user
const handleEditUser = (user) => {
  setEditingUser(user);
  setNewUser({
    no: user.no,
    dataAndDocumentNeeded: user.dataAndDocumentNeeded,
    phase: user.phase,
    status: user.status,
    deadline: user.deadline,
    auditor: user.auditor,
  });
  setIsModalOpen(true);
};

// Fungsi untuk mengupdate input
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewUser(prevState => ({
    ...prevState,
    [name]: value
  }));
};

const handleUpdate = async () => {
  try {
    const formattedDate = format(new Date(newUser.deadline), 'yyyy-MM-dd');
    
    const updateData = {
      key: parseInt(editingUser.no),
      key1: newUser.dataAndDocumentNeeded,
      key2: newUser.phase,
      key3: convertStatusToNumber(newUser.status),
      key4: formattedDate,
      key5: convertAuditorToNumber(newUser.auditor)
    };

    console.log('Sending update request with data:', updateData);

    const response = await axios.put(`${import.meta.env.VITE_HELP_DESK}/SPI/edit-data`, updateData);
    
    console.log('Server response:', response.data);
    
    if (response.data && response.data.statusCode === 200) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.no === editingUser.no ? { ...order, ...response.data.data } : order
        )
      );
      setIsModalOpen(false);
      setEditingUser(null);
      alert('Data berhasil diperbarui');
    } else {
      console.error("Update failed. Server response:", response.data);
      let errorMessage = 'Berhasil memperbarui data: ';
      if (response.data && response.data.payload && response.data.payload.message) {
        errorMessage += response.data.payload.message;
      } else if (response.data && response.data.message) {
        errorMessage += response.data.message;
      } else {
        errorMessage += 'Terjadi kesalahan yang tidak diketahui';
      }
      alert(errorMessage);
    }
  } catch (error) {
    console.error("Error updating evidence:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    alert('Gagal memperbarui data: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'));
  }
};


  
  const handleYearChange = (date) => {
    const year = date ? getYear(date) : "";
    setSelectedYear(year);
  };

  const filteredOrders = useMemo(() => {
    const filtered = selectedYear
      ? orders.filter((order) => order.publishingYear === parseInt(selectedYear))
      : orders;
  
    return filtered.filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = [
        order.dataAndDocumentNeeded,
        order.phase,
        order.status,
        order.deadline,
        order.remarksByAuditee,
        order.remarksByAuditor,
        order.auditee?.nik,
        order.auditor,
        order.statusComplete?.text
      ].some(field => 
        field && String(field).toLowerCase().includes(searchLower)
      );
  
      return matchesSearch;
    });
  }, [orders, selectedYear, searchQuery]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  

// -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
const fetchDataByYear = useCallback(async (year) => {
  if (year) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/SPI/tmau-devd`, {
        params: { 
          year: year,
          auditor: 2 // Menambahkan parameter untuk filter FINANCE (asumsi FINANCE = 1)
        }
      });
      if (response.data && response.data.payload && Array.isArray(response.data.payload.data)) {
        const formattedData = response.data.payload.data
          .filter(item => item.c_audevd_audr === 2) // Double check filter di frontend
          .map(item => ({
            no: item.i_audevd,
            dataAndDocumentNeeded: item.n_audevd_title,
            phase: convertPhaseToString(item.e_audevd_phs),
            status: item.c_audevd_stat,
            deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
            remarksByAuditee: "",
            remarksByAuditor: item.e_audevd_audr,
            auditee: { nik: '', name: '' },
            auditor: item.c_audevd_audr,
            statusComplete: convertStatusComplete(item.c_audevd_statcmp, false),
            publishingYear: new Date(item.c_year).getFullYear(),
            i_audevd_aud: item.i_audevd_aud || '',
          }));
        setOrders(formattedData);
        for (const order of formattedData) {
          await GetAuditee(order.no, order.i_audevd_aud);
          await fetchRemarks(order.no);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}, []);

  
  useEffect(() => {
    console.log('Orders updated:', orders);
  }, [orders]);

  useEffect(() => {
    if (selectedYear) {
      fetchDataByYear(selectedYear);
    }
  }, [selectedYear, fetchDataByYear]);

  ///////////////////////////////////////

  // -- MENAMPILKAN AUDITEE --
const GetAuditee = async (orderNo, i_audevd_aud) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/SPI/selected-auditee`, {
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
    const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/SPI/selected-remarks-auditee`, {
      params: { key: key }
    });
    if (response.data && response.data.payload && response.data.payload.data && response.data.payload.data.length > 0) {
      const remarksByAuditee = response.data.payload.data[0].e_audevdfile_desc || "";
      const hasRemarks = remarksByAuditee.trim() !== "";
      setOrders(prevOrders => prevOrders.map(order => 
        order.no === key ? { 
          ...order, 
          remarksByAuditee,
          statusComplete: order.statusComplete.text === "COMPLETE SPI" 
            ? order.statusComplete 
            : convertStatusComplete(order.statusComplete.text === "COMPLETE AUDITEE ADMIN IT" ? 2 : hasRemarks ? 1 : 0, hasRemarks)
        } : order
      ));
    }
  } catch (error) {
    console.error('Error fetching remarks for key', key, ':', error);
  }
};

////////////////////////////////////////////
const handleUpdateStatusSPI = async (order) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_HELP_DESK}/SPI/update-status/${order.no}`);
    
    console.log("Respons server:", response.data);

    if (response.data && response.data.payload.message === "Update Status Berhasil") {
      const updatedStatus = convertStatusComplete(3, true);
      setOrders((prevOrders) =>
        prevOrders.map((prevOrder) =>
          prevOrder.no === order.no
            ? {
                ...prevOrder,
                statusComplete: updatedStatus,
              }
            : prevOrder
        )
      );
      console.log(`Status untuk order ${order.no} diperbarui:`, updatedStatus);
    }
  } catch (error) {
    console.error("Error saat memperbarui status:", error);
  }
};

useEffect(() => {
  localStorage.setItem('orderStatuses', JSON.stringify(
    orders.reduce((acc, order) => {
      acc[order.no] = order.statusComplete;
      return acc;
    }, {})
  ));
}, [orders]);
useEffect(() => {
  const savedStatuses = JSON.parse(localStorage.getItem('orderStatuses'));
  if (savedStatuses) {
    setOrderStatuses(savedStatuses);
  }
}, []);
useEffect(() => {
  console.log("Status orders diperbarui:", orderStatuses);
}, [orderStatuses]);

  return (
    <div className="evidence-content">
      <h2>Data Evidence FINANCE</h2>
    <div className="filter-year-evidence">
      <label>Year: </label>
      <DatePicker
        selected={selectedYear ? new Date(`${selectedYear}-01-01`) : null}
        onChange={handleYearChange}
        showYearPicker
        dateFormat="yyyy"
        placeholderText="Select year" 
      />
    </div>
    <div className="search-container">
      <input
        type="text"
        placeholder="Search..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <div className="evidence-table">
      <table className="table  table-striped">
        <thead class=" table-spi table-dark">
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
                {sortedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => {
                return (
                  <tr key={order.no || index}>
                    <td>{order.no}</td>
                    <td>{order.dataAndDocumentNeeded}</td>
                    <td>{order.phase}</td>
                    <td>{convertStatusToString(order.status)}</td>
                    <td>{order.deadline}</td>
                    <td>{order.remarksByAuditee !== undefined ? order.remarksByAuditee : "Loading..." }</td>
                    <td>{order.remarksByAuditor}</td>
                    <td>
                    {order.auditee && order.auditee.nik ? 
                      `${order.auditee.nik} - ${order.auditee.name}` : 
                      "-"
                    }
                  </td>                 
                  <td>{convertAuditorToString(order.auditor)}</td>
                  <td style={{ 
                    backgroundColor: orderStatuses[order.no]?.backgroundColor || order.statusComplete.backgroundColor, 
                    color: orderStatuses[order.no]?.color || order.statusComplete.color
                  }}>
                    {orderStatuses[order.no]?.text || order.statusComplete.text}
                  </td>
                    <td>
                    <i className="bi-pencil-fill" style={{ color: 'black', fontSize: '20px', cursor: 'pointer', marginRight: '10px' }} onClick={() => handleEditUser(order)}></i>
                    <i className="bi-trash" style={{ color: 'black', fontSize: '20px', cursor: 'pointer' }} onClick={() => handleDeleteUser(order.NIK)}></i>
                
                      {order.statusComplete.backgroundColor === "yellow" && (
                      <i className="bi-clipboard2-check-fill" style={{ color: 'black', fontSize: '20px', cursor: 'pointer' }} onClick={() => handleUpdateStatusSPI(order)}></i>

                    )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                
              </tr>
            )}
          </tbody>
      </table>
    </div>
       {/* pagination */}
      <div className="pagination-admin">
        <Pagination
          current={currentPage}
          total={filteredOrders.length}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper={false}
        />
      </div>
{/* Handle Edit  */}
<Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Edit User Modal"
        className="user-modal"
        overlayClassName="user-modal-overlay"
      >
        <h3>Edit Data User</h3>
        <div className="modal-content">
          <label>Data and Document Needed</label>
          <input
            type="text"
            name="dataAndDocumentNeeded"
            value={newUser.dataAndDocumentNeeded}
            onChange={handleInputChange}
            className="modal-input"
          />
          <label>Phase</label>
          <input
            type="text"
            name="phase"
            value={newUser.phase}
            onChange={handleInputChange}
            className="modal-input"
          />
          <label>Status</label>
          <select
            name="status"
            value={newUser.status}
            onChange={handleInputChange}
            className="modal-input"
          >
            <option value="pending">Pending</option>
            <option value="not available">Not Available</option>
            <option value="not applicable">Not Applicable</option>
          </select>
          <label>Deadline</label>
          <DatePicker
            selected={new Date(newUser.deadline)}
            onChange={(date) => setNewUser({...newUser, deadline: format(date, 'yyyy-MM-dd')})}
            dateFormat="yyyy-MM-dd"
            className="modal-input"
          />
          <label>Auditor</label>
          <select
            name="auditor"
            value={newUser.auditor}
            onChange={handleInputChange}
            className="modal-input"
          >
            <option value="DGCA">DGCA</option>
            <option value="FINANCE">Finance</option>
            <option value="ITML">ITML</option>
            <option value="PARKERRUSSEL">ParkerRussel</option>
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={handleUpdate} className="modal-save">
            Save Changes
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="modal-cancel"
          >
            Cancel
          </button>
        </div>
      </Modal>
      
      {/* Handdle Delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Delete User Modal"
        className="delete-modal"
        overlayClassName="delete-modal-overlay"
      >
        <h3>Delete User</h3>
        <p>Are you sure you want to delete this user?</p>
        <div className="modal-actions">
          <button onClick="" className="modal-save">
            Delete
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="modal-cancel"
          >
            Cancel
          </button>
        </div>
      </Modal>


    </div>
  );
};

export default Finance;
