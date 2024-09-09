import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DataKaryawan from './DataKaryawan'; // Import DataKaryawan component
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const DataUser = () => {
  const [orders, setOrders] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isKaryawanModalOpen, setIsKaryawanModalOpen] = useState(false);
  const [filterOrganisasi, setFilterOrganisasi] = useState('');
  const getRoleValue = (roleLabel) => {
    switch (roleLabel) {
      case 'ADMIN': return 1;
      case 'AUDITEE': return 2;
      case 'SPI': return 3;
      case 'ADMIN_IT': return 4;
      default: return null;
    }
  };
  const getRoleLabel = (roleValue) => {
    switch (parseInt(roleValue)) {
      case 1: return 'ADMIN';
      case 2: return 'AUDITEE';
      case 3: return 'SPI';
      case 4: return 'ADMIN_IT';
      default: return 'null';
    }
  };

  const [newUser, setNewUser] = useState({
    No: '',
    NIK: '',
    Name: '',
    Role: '',
    Organization: '',
    Email: '',
  });


  
  const fetchKaryawan = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Admin/karyawan`);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      const result = await response.json();
  
      if (result.payload === 'Data tidak ditemukan') {
        console.warn('Data karyawan tidak ditemukan');
        setOrders([]);
        return;
      }
      
      if (!Array.isArray(result.payload)) {
        throw new Error('Data yang diterima bukan array');
      }

      const mappedKaryawan = result.payload.map((item) => ({
        No: item.i_audusr,
        NIK: item.n_audusr_usrnm,
        Name: item.n_audusr,
        Role: getRoleLabel(item.role),
        Organization: item.organisasi,
      }));
  
      console.log('Mapped Karyawan:', mappedKaryawan);
      setOrders(mappedKaryawan);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      toast.error(`Gagal mengambil data karyawan: ${error.message}`);
      setOrders([]);
    }
  };
  
  useEffect(() => {
    fetchKaryawan();
  }, []);
  
  const handleAddUser = async () => {
    try {
      const roleValue = getRoleValue(newUser.Role);
      if (roleValue === null) {
        throw new Error('Peran yang dipilih tidak valid');
      }
  
      const bodyData = {
        key: newUser.NIK,
        key1: newUser.Name,
        key2: roleValue,
      };
  
      console.log('Data yang dikirim:', bodyData);
  
      const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Admin/add-karyawan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Terjadi kesalahan yang tidak diketahui');
      }
  
      const responseData = await response.json();
      console.log('Data respon:', responseData);
  
      alert('Pengguna berhasil ditambahkan');
      setIsAddUserModalOpen(false);
      fetchKaryawan(); // Refresh daftar karyawan
  
    } catch (error) {
      console.error('Error menambahkan pengguna:', error);
      alert(`Error menambahkan pengguna: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'Role') {
      let newFilterOrganisasi = '';
      if (value === 'ADMIN' || value === 'ADMIN_IT' || value === 'AUDITEE') {
        newFilterOrganisasi = 'IT';
      }
      if (value === 'SPI'){
        newFilterOrganisasi = 'PI';
      }
      setFilterOrganisasi(newFilterOrganisasi);
      
      // Buka modal DataKaryawan jika role yang dipilih memerlukan filter
      if (newFilterOrganisasi) {
        setIsKaryawanModalOpen(true);
      }
    }
  };

  
  
  const handleUpdateUser = async () => {
    try {
      const roleValue = getRoleValue(newUser.Role);
      
      if (roleValue === null) {
        throw new Error('Peran yang dipilih tidak valid');
      }

      const bodyData = {
        key1: newUser.NIK,
        c_audusr_role: roleValue.toString(),
        n_audusr_nm: newUser.Name,
      };

      console.log('Data yang akan dikirim:', bodyData);

      const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Admin/update-karyawan/${newUser.NIK}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Terjadi kesalahan saat memperbarui pengguna');
      }

      const result = await response.json();
      console.log('Hasil update:', result);

      toast.success('Pengguna berhasil diperbarui');
      setIsAddUserModalOpen(false);
      setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' }); // Reset newUser
      fetchKaryawan(); // Refresh daftar karyawan setelah update
      setIsEditing(false); // Reset flag isEditing setelah update

    } catch (error) {
      console.error('Error memperbarui pengguna:', error);
      toast.error(`Error memperbarui pengguna: ${error.message}`);
    }
  };
  const handleSaveUser = () => {
    if (isEditing) {
      handleUpdateUser();
    } else {
      handleAddUser();
    }
  };

  const handleEditUser = (user) => {
    console.log("Edit user data:", user); // Untuk debugging
    setNewUser({
      NIK: user.NIK,
      Name: user.Name,
      Role: user.Role,
      Organization: user.Organization
    });
    setIsAddUserModalOpen(true);
  };


// Fungsi untuk menghapus user
const handleDeleteUser = async (i_audusr) => {
  console.log('Menghapus Pengguna dengan i_audusr:', i_audusr);
  if (!i_audusr) {
    toast.error('i_audusr karyawan tidak valid');
    return;
  }

  if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_HELP_DESK}/Admin/delete-karyawan/${i_audusr}`);
      
      if (response.status === 200) {
        console.log('User berhasil dihapus:', response.data);
        setOrders(prevOrders => prevOrders.filter(order => order.i_audusr !== i_audusr));
        toast.success('User berhasil dihapus');
      } else {
        throw new Error(response.data.message || 'Gagal menghapus user');
      }
    } catch (error) {
      console.error('Error saat menghapus user:', error);
      toast.error(`Gagal menghapus user: ${error.response?.data?.message || error.message}`);
    }
  }
};

// Panggil handleDeleteUser dengan ID yang sesuai
  const openKaryawanModal = () => {
    setIsAddUserModalOpen(false);
    setIsKaryawanModalOpen(true);
  };

  const handleKaryawanSelect = (karyawan) => {
    setNewUser(prev => ({
      ...prev,
      NIK: karyawan.nik,
      Name: karyawan.nama,
      Organization: karyawan.organisasi,
    }));
    setIsKaryawanModalOpen(false);
    setIsAddUserModalOpen(true); // Buka kembali modal Add User
  };  

  useEffect(() => {
    if (filterOrganisasi) {
      setIsKaryawanModalOpen(true);
    }
  }, [filterOrganisasi]);

  return (
    <div className="data-user">
      <h2>Data User</h2>
      <div className="AddUser">
        <button
          className="add-user-button"
          onClick={() => setIsAddUserModalOpen(true)}
        >
          Add User
        </button>
      </div>
      <div className="data-user-content">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>No</th>
              <th>NIK</th>
              <th>Name</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.i_audusr}>
                <td>{order.No}</td>
                <td>{order.NIK}</td>
                <td>{order.Name}</td>
                <td>{order.Role}</td>
                <td>{order.Organization}</td>
                <td>
                  <button onClick={() => handleDeleteUser(order.No)}>Delete</button>
                  <button onClick={() => handleEditUser(order)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onRequestClose={() => setIsAddUserModalOpen(false)}
        contentLabel="Add User Modal"
        className="user-modal"
        overlayClassName="user-modal-overlay"
      >
        <h3>{newUser.NIK ? 'Edit' : 'Add'} Data User</h3>
        <div className="modal-content">
        <label>Role</label>
          <select
              name="Role"
              value={newUser.Role}
              onChange={handleInputChange}
              className="modal-select"
            >
              <option value="">Pilih Peran</option>
              <option value="ADMIN">Admin</option>
              <option value="SPI">SPI</option>
              <option value="AUDITEE">Auditee</option>
              <option value="AUDITOR">Auditor</option>
              <option value="ADMIN_IT">Admin IT</option>
            </select>
          <label>NIK</label>
          <input
            type="text"
            name="NIK"
            value={newUser.NIK}
            onClick={openKaryawanModal}
            readOnly
            className="modal-input"
          />
          <label>Name</label>
          <input
            type="text"
            name="Name"
            value={newUser.Name}
            onChange={handleInputChange}
            className="modal-input"
          />
          
          {/* <label>Organization</label>
          <input
            type="text"
            name="Organization"
            value={newUser.Organization}
            onChange={handleInputChange}
            className="modal-input"
          /> */}
        </div>
        <div className="modal-actions">
          <button onClick={() => setIsAddUserModalOpen(false)} className="modal-cancel">Cancel</button>
          <button onClick={newUser.No ? handleUpdateUser : handleAddUser} className="modal-add">
            {newUser.No ? 'Update' : 'Add'}
          </button>
        </div>
      </Modal>

      {/* Data Karyawan Modal */}
      <Modal
        isOpen={isKaryawanModalOpen}
        onRequestClose={() => setIsKaryawanModalOpen(false)}
        contentLabel="Data Karyawan Modal"
        className="karyawan-modal"
        overlayClassName="karyawan-modal-overlay"
      >
        <div className="modal-header">
          <h3>Data Karyawan</h3>
          <button onClick={() => setIsKaryawanModalOpen(false)} className="modal-close">&times;</button>
        </div>
        <DataKaryawan onSelectKaryawan={handleKaryawanSelect} filterOrganisasi={filterOrganisasi} />
        </Modal>
      </div>
  );
};

export default DataUser;