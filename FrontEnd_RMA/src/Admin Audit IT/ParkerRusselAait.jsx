import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import { getYear } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "../App.css";

Modal.setAppElement("#root");

const ParkerRussel = () => {
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

  const [taskToggled, setTaskToggled] = useState({});

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      const ParkerRusselOrders = parsedOrders.filter(
        (order) => order.auditor === "ParkerRussel"
      );
      const orderedParkerRusselOrders = updateOrderNumbers(ParkerRusselOrders);
      setOrders(orderedParkerRusselOrders);
    }
  }, []);

  useEffect(() => {
    console.log('useEffect dijalankan'); // Logging pertama
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
  
            // Filter data API berdasarkan auditor "ParkerRussel"
            const ParkerRusselAPIOrders = formattedData.filter(
              (order) => order.auditor === "ParkerRussel"
            );
            const orderedParkerRusselAPIOrders = updateOrderNumbers(ParkerRusselAPIOrders);
  
            // Gabungkan dengan data dari localStorage
            setOrders(prevOrders => {
              const allOrders = [...prevOrders, ...orderedParkerRusselAPIOrders];
              return updateOrderNumbers(allOrders);
            });
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

  const updateOrderNumbers = (ordersList) => {
    return ordersList.map((order, index) => ({
      ...order,
      no: index + 1,
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

  const handleToggleComplete = (orderNo) => {
    setTaskToggled((prevToggled) => ({
      ...prevToggled,
      [orderNo]: !prevToggled[orderNo],
    }));
  };

  const handleYearChange = (date) => {
    const year = date ? getYear(date) : null;
    setSelectedYear(year);
  };


  return (
    <div className="data-user">
      <h2>Data User - Parker Russel</h2>
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
              <tr>
                <td>{order.no}</td>
                <td>{order.dataAndDocumentNeeded}</td>
                <td>{order.phase}</td>
                <td>{order.status}</td>
                <td>{order.deadline}</td>
                <td>{order.remarksByAuditee}</td>
                <td>{order.remarksByAuditor}</td>
                <td>{order.auditee}</td>
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
                  <button onClick={() => handleDeleteUser(order)}>
                    Delete
                  </button>
                  <button onClick={() => handleToggleComplete(order.no)}>
                    Task
                  </button>
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
        <h3>Are you sure you want to delete this user?</h3>
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

export default ParkerRussel;
