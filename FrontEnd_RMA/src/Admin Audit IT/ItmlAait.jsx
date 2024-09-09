import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import { getYear } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "../App.css";

Modal.setAppElement("#root");

const ITML = () => {
  const [orders, setOrders] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [newUser, setNewUser] = useState({
    dataAndDocumentNeeded: "",
    phase: "",
    status: "",
    deadline: "",
    remarksByAuditee: "",
    remarksByAuditor: "",
    auditee: "",
    auditor: "",
    statusComplete: "",
    action: "",
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
    // mengambil data di local
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      // Filter untuk ITML
      const ItmlOrders = parsedOrders.filter(
        (order) => order.auditor === "ITML"
      );
      // Update nomor urutan setelah filter
      const orderedItmlOrders = updateOrderNumbers(ItmlOrders);
      setOrders(orderedItmlOrders);
    }
  }, []);

  const fetchDataByYear = useCallback(async (year) => {
    if (year) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/tmau-devd`, {
          params: { year: year }
        });
        if (response.data && response.data.payload && Array.isArray(response.data.payload.data)) {
          const formattedData = response.data.payload.data.map(item => ({
            no: item.i_audevd,
            dataAndDocumentNeeded: item.n_audevd_tittle,
            phase: item.n_audevd_phs,
            status: convertStatus(item.c_audevd_stat),
            deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
            remarksByAuditee: "",
            remarksByAuditor: item.n_audevd_audr,
            auditee: { nik: '', name: '' },
            auditor: convertAuditor(item.c_audevd_audr),
            statusComplete: convertStatusComplete(item.c_audevd_statcmpl, false),
            publishingYear: new Date(item.c_audevd_yr).getFullYear(),
            i_audevd_aud: item.i_audevd_aud || '', 
          }));
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

  // Fungsi untuk menampilkan data remarks by auditee
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
            statusComplete: order.statusComplete.text === "COMPLETE AUDITEE ADMIN IT"
              ? order.statusComplete
              : convertStatusComplete(order.statusComplete.text === "COMPLETE AUDITEE ADMIN IT" ? 2 : 0, hasRemarks)
          } : order
        ));
      }
    } catch (error) {
      console.error('Error fetching remarks for key', key, ':', error);
    }
  };

  // Fungsi untuk menampilkan auditee
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
                    name: matchingAuditee.n_audusr_nm
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

  // Fungsi untuk update status
  const handleUpdateStatus = async (order) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_HELP_DESK}/AuditIT/update-status`, {
        I_AUDEVD: order.no
      });

      if (response.data && response.data.message === "Update Status Berhasil") {
        console.log("Status berhasil diperbarui");
        setOrders(prevOrders => prevOrders.map(o => 
          o.no === order.no 
            ? { ...o, statusComplete: convertStatusComplete(2, true) } 
            : o
        ));
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

  const updateOrderNumbers = (ordersList) => {
    return ordersList.map((order, index) => ({
      ...order,
      no: index + 1, // Set number
    }));
  };

  const handleAddUser = () => {
    if (editingUser) {
      setOrders((prev) =>
        prev.map((order) =>
          order.no === editingUser.no ? { ...editingUser, ...newUser } : order
        )
      );
      setEditingUser();
    } else {
      setOrders((prev) => [
        ...prev,
        { no: prev.length > 0 ? prev[prev.length - 1].no + 1 : 1, ...newUser },
      ]);
    }
    setIsModalOpen(false);
    resetNewUser();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    const updatedOrders = orders.filter(
      (order) => order.no !== userToDelete.no
    );

    // Update the order numbers
    const reorderedOrders = updateOrderNumbers(updatedOrders);

    setOrders(reorderedOrders);

    localStorage.setItem("orders", JSON.stringify(reorderedOrders));
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleYearChange = (date) => {
    const year = date ? getYear(date) : null;
    setSelectedYear(year);
  };


  const resetNewUser = () => {
    setNewUser({
      dataAndDocumentNeeded: "",
      phase: "",
      status: "",
      deadline: "",
      remarksByAuditee: "",
      remarksByAuditor: "",
      auditee: "",
      auditor: "",
      statusComplete: "",
      action: "",
    });
  };

  return (
    <div className="data-user">
      <h2>Data User - ITML</h2>
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
    <div className="data-user-content">
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
          {orders.map((order) => (
            <tr key={order.no}>
              <td>{order.no}</td>
              <td>{order.dataAndDocumentNeeded}</td>
              <td>{order.phase}</td>
              <td>{order.status}</td>
              <td>{order.deadline}</td>
              <td>{order.remarksByAuditee}</td>
              <td>{order.remarksByAuditor}</td>
              <td>
                {order.auditee && `${order.auditee.nik} - ${order.auditee.name}`}
              </td>
              <td>{order.auditor}</td>
              <td
                style={{
                  backgroundColor: order.statusComplete.backgroundColor,
                  color: order.statusComplete.color,
                }}
              >
                {order.statusComplete.text}
              </td>
              <td>
                <button onClick={() => handleEditUser(order)}>Edit</button>
                <button onClick={() => handleDeleteUser(order)}>Delete</button>
                {order.statusComplete.text === "COMPLETE AUDITEE" && (
                  <button onClick={() => handleUpdateStatus(order)}>Update Status</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Add User Modal"
        className="user-modal"
        overlayClassName="user-modal-overlay"
      >
        <h3>{editingUser ? "Edit Data User" : "Add Data User"}</h3>
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
            className="modal-select"
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            value={newUser.deadline}
            onChange={handleInputChange}
            className="modal-input"
          />
          <label>Remarks by Auditee</label>
          <input
            type="text"
            name="remarksByAuditee"
            value={newUser.remarksByAuditee}
            onChange={handleInputChange}
            className="modal-input"
          />
          <label>Remarks by Auditor</label>
          <input
            type="text"
            name="remarksByAuditor"
            value={newUser.remarksByAuditor}
            onChange={handleInputChange}
            className="modal-input"
          />
          <label>Auditee</label>
          <input
            type="text"
            name="auditee"
            value={newUser.auditee}
            onChange={handleInputChange}
            className="modal-input"
          />
          <label>Auditor</label>
          <select
            name="auditor"
            value={newUser.auditor}
            onChange={handleInputChange}
            className="modal-select"
          >
            <option value="">Select Auditor</option>
            <option value="DGCA">DGCA</option>
            <option value="Finance">Finance</option>
            <option value="ITML">ITML</option>
            <option value="ParkerRussel">Parker Russel</option>
          </select>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setIsModalOpen(false)}
            className="modal-cancel"
          >
            Cancel
          </button>
          <button onClick={handleAddUser} className="modal-add">
            {editingUser ? "Save" : "Add"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Delete User Modal"
        className="user-modal"
        overlayClassName="user-modal-overlay"
      >
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this user?</p>
        <div className="modal-actions">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="modal-cancel"
          >
            Cancel
          </button>
          <button onClick={confirmDeleteUser} className="modal-delete">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ITML;
