import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { getYear } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement("#root");

const EvidenceAait = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [auditeeData, setAuditeeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentEditOrder, setCurrentEditOrder] = useState(null);

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

  const convertStatusComplete = (statusComplete) => {
    switch (statusComplete) {
      case 0:
        return { text: "NOT COMPLETE", backgroundColor: "red", color: "white" };
      case 1:
        return { text: "COMPLETE AUDITEE", backgroundColor: "orange", color: "white" };
      case 2:
        return { text: "COMPLETE AUDITEE ADMIN IT", backgroundColor: "yellow", color: "black" };
      case 3:
        return { text: "COMPLETE SPI", backgroundColor: "green", color: "white" };
      case 4:
        return { text: "COMPLETE AUDITOR", backgroundColor: "blue", color: "white" };
      default:  
        return { text: "UNKNOWN STATUS", backgroundColor: "grey", color: "white" };
    }
  };

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const handleAddUser = () => {
    setOrders((prev) => [
      ...prev,
      { no: prev.length > 0 ? prev[prev.length - 1].no + 1 : 1, ...newUser, publishingYear: new Date().getFullYear() },
    ]);
    setIsModalOpen(false);
    resetNewUser();
  };

  const handleEditUser = (order) => {
    setCurrentEditOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.no === currentEditOrder.no ? currentEditOrder : order
      )
    );
    setIsEditModalOpen(false);
    setCurrentEditOrder(null);
  };

  const resetNewUser = () => {
    setNewUser({
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
  };

  const handleYearChange = (date) => {
    const year = date ? getYear(date) : "";
    setSelectedYear(year);
  };
// -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
  const filteredOrders = selectedYear
    ? orders.filter((order) => order.publishingYear === parseInt(selectedYear))
    : orders;

  useEffect(() => {
    const fetchDataByYear = async () => {
      if (selectedYear) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/tmau-devd`, {
            params: { year: selectedYear }
          });
          if (response.data && response.data.payload && Array.isArray(response.data.payload.data)) {
            const formattedData = response.data.payload.data.map(item => ({
              no: item.i_audevd,
              dataAndDocumentNeeded: item.n_audevd_title,
              phase: item.n_audevd_phs,
              status: convertStatus(item.c_audevd_stat),
              deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
              remarksByAuditee: item.i_entry,
              remarksByAuditor: item.n_audevd_audr,
              auditee: item.i_audevd_aud,
              auditor: convertAuditor(item.c_audevd_audr),
              statusComplete: convertStatusComplete(item.c_audevd_statcmpl),
              publishingYear: new Date(item.c_audevd_yr).getFullYear(),
            }));
            setOrders(formattedData);
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
    };

    fetchDataByYear();
  }, [selectedYear]);

  // --MENAMPILKAN DATA AUDITEE
  useEffect(() => {
    const fetchAuditeeData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/auditee`);
        if (response.data && Array.isArray(response.data.payload.data)) {
          setAuditeeData(response.data.payload.data);
        } else {
          console.error('Expected an array but got:', response.data.payload.data);
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
          item.n_audusr_usrnm?.includes(searchQuery) ||
          item.n_audusr_nm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.organisasi?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="evidence-content">
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
              filteredOrders.map((order, index) => (
                <tr key={order.no || index}>
                  <td>{order.no}</td>
                  <td>{order.dataAndDocumentNeeded}</td>
                  <td>{order.phase}</td>
                  <td>{order.status}</td>
                  <td>{order.deadline}</td>
                  <td>{order.remarksByAuditee}</td>
                  <td>{order.remarksByAuditor}</td>
                  <td>{order.auditee}</td>
                  <td>{order.auditor}</td>
                  <td style={{ backgroundColor: order.statusComplete.backgroundColor, color: order.statusComplete.color }}>
                    {order.statusComplete.text}
                  </td>
                  <td>
                    <button onClick={() => handleEditUser(order)}>Edit</button>
                    <button onClick={() => handleDeleteUser(order)}>Delete</button>
                  </td>
                </tr>
              ))
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
                      <td><input type="checkbox" /></td>
                      <td>{item.n_audusr_usrnm}</td>
                      <td>{item.n_audusr_nm}</td>
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

            <div className="pagination">
              <span>Showing 1 to {filteredData.length} of {auditeeData.length} entries</span>
              {/* Add pagination controls if needed */}
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="select-btn">Select</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EvidenceAait;
