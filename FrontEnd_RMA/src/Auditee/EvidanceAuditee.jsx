import React, { useState, useEffect } from "react";
import Modal from "react-modal";
// import StatusTask from "../Commponents/StatusTask";
import "../App.css";

Modal.setAppElement("#root");

const EvidenceAuditee = () => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("orders");
    return savedOrders ? JSON.parse(savedOrders) : initialOrders;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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

  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [taskUser, setTaskUser] = useState(null);
  const [statusColors, setStatusColors] = useState({});

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = () => {
    if (editingUser) {
      setOrders((prev) =>
        prev.map((order) =>
          order.no === editingUser.no ? { ...editingUser, ...newUser } : order
        )
      );
      setEditingUser(null);
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
    setOrders((prev) => {
      const updatedOrders = prev.filter(
        (order) => order.no !== userToDelete.no
      );

      return updatedOrders.map((order, index) => ({
        ...order,
        no: index + 1,
      }));
    });

    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleTaskUser = (user) => {
    setTaskUser(user);
    setIsTaskModalOpen(true);

    setStatusColors((prevColors) => ({
      ...prevColors,
      [user.no]: prevColors[user.no] === "#FF0000" ? "#FFFFFF" : "#FF0000",
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

  return (
    <div className="data-user">
      <h2>Data Evidence</h2>
      <div className="AddUser">
        <button
          className="add-user-button"
          onClick={() => {
            setIsModalOpen(true);
            resetNewUser();
            setEditingUser(null);
          }}
        >
          Add User
        </button>
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
                <td>{order.auditee}</td>
                <td>{order.auditor}</td>
                <td>{order.statusComplete}</td>
                <td>
                  <button onClick={() => handleDeleteUser(order)}>
                    Delete
                  </button>
                  <button onClick={() => handleEditUser(order)}>Edit</button>
                  <button onClick={() => handleTaskUser(order)}>Task</button>
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
            <option value="In Progress">Pending</option>
            <option value="Completed">Not Available</option>
            <option value="Pending">Not Applicable</option>
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
        <h3>Delete Data User</h3>
        <p>Are you sure you want to delete this user?</p>
        <div className="modal-actions">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="modal-cancel"
          >
            Cancel
          </button>
          <button onClick={confirmDeleteUser} className="modal-add">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EvidenceAuditee;
