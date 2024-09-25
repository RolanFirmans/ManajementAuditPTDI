import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DataKaryawan from './DataKaryawan'; // Import DataKaryawan component
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Pagination } from 'antd';


Modal.setAppElement('#root');

const DataUser = () => {
  const [orders, setOrders] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [filterOrganisasi, setFilterOrganisasi] = useState('');
  const [isKaryawanModalOpen, setIsKaryawanModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const [newUser, setNewUser] = useState({
    No: '',
    NIK: '',
    Name: '',
    Role: '',
    Organization: '',
    Email: '',
  });

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

  // Fungsi untuk memfilter data berdasarkan pencarian
  const filteredData = orders.filter((order) => {
    const matchesFilter = filterOrganisasi
      ? order.Organization &&
        order.Organization
          .toLowerCase()
          .startsWith(filterOrganisasi.toLowerCase())
      : true;
    const matchesSearch =
      (order.NIK &&
        order.NIK.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.Name &&
        order.Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.Organization &&
        order.Organization.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  console.log("Data yang difilter:", filteredData);

  // Logika paginasi
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  


  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/Admin/karyawan`);
      const mappedUsers = response.data.payload
        .map((item, index) => ({
          ...item,
          sortOrder: index, // Tambahkan field untuk pengurutan
          No: item.i_audusr,
          NIK: item.n_audusr_usrnm,
          Name: item.n_audusr,
          Role: getRoleLabel(item.role),
          Organization: item.organisasi,
        }))
        .sort((a, b) => a.No - b.No); // Urutkan berdasarkan No
      setOrders(mappedUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Gagal mengambil data karyawan: ${error.message}`);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchKaryawan = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/Admin/karyawan`);
      const mappedUsers = response.data.payload.map((item) => ({
        No: item.i_audusr,
        NIK: item.n_audusr_usrnm,
        Name: item.n_audusr,
        Role: getRoleLabel(item.role),
        Organization: item.organisasi,
      }));
      setOrders(mappedUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
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
  
      console.log('Data yang dikirim untuk penambahan:', bodyData);
  
      const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Admin/add-karyawan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Terjadi kesalahan yang tidak diketahui');
      }
  
      const responseData = await response.json();
      console.log('Data respon penambahan:', responseData);
  
      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil ditambahkan",
        icon: "success"
      });

      setIsUserModalOpen(false);
      fetchKaryawan();
  
    } catch (error) {
      console.error('Error menambahkan pengguna:', error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error Menambahkan Pengguna!",
      });
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
        n_audusr_usrnm: newUser.NIK,
        c_audusr_role: roleValue.toString(),
        N_AUDUSR: newUser.Name.trim()
      };
  
      console.log('Data yang akan dikirim untuk update:', bodyData);
  
      const response = await axios.put(
        `${import.meta.env.VITE_HELP_DESK}/Admin/update-karyawan/${newUser.NIK}`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
     
    if (response.status === 200) {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.NIK === newUser.NIK 
            ? { ...order, ...newUser, Role: getRoleLabel(roleValue) } 
            : order
        ).sort((a, b) => a.No - b.No) // Urutkan kembali berdasarkan No
      );
      console.log('Hasil update:', response.data);
  
      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil diperbarui",
        icon: "success"
      });
  
      setIsUserModalOpen(false);
      setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' });
      setIsEditing(false);
    } else {
      throw new Error(response.data.error || 'Terjadi kesalahan saat memperbarui pengguna');
    }
  
    } catch (error) {
      console.error('Error memperbarui pengguna:', error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Error memperbarui pengguna: ${error.response?.data?.error || error.message}`,
      });
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
    console.log("Edit user data:", user);
    setNewUser({
      NIK: user.NIK,
      Name: user.Name,
      Role: user.Role,
      Organization: user.Organization
    });
    setIsEditing(true);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (NIK) => {
    console.log('Attempting to delete user with NIK:', NIK);
    if (!NIK) {
      toast.error('NIK karyawan tidak valid');
      return;
    }
  
    // Setup SweetAlert with custom Bootstrap buttons
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });
  
    const result = await swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    });
  
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_HELP_DESK}/Admin/delete-karyawan/${NIK}`);
        
        if (response.status === 200) {
          console.log('User berhasil dihapus:', response.data);
          setOrders(prevOrders => prevOrders.filter(order => order.NIK !== NIK));
          toast.success('User berhasil dihapus');
  
          // Menampilkan SweetAlert bahwa penghapusan berhasil
          swalWithBootstrapButtons.fire({
            title: "Deleted!",
            text: "User telah berhasil dihapus.",
            icon: "success"
          });
        } else {
          throw new Error(response.data.message || 'Gagal menghapus user');
        }
      } catch (error) {
        console.error('Error saat menghapus user:', error);
        toast.error(`Gagal menghapus user: ${error.response?.data?.message || error.message}`);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Menampilkan SweetAlert jika penghapusan dibatalkan
      swalWithBootstrapButtons.fire({
        title: "Cancelled",
        text: "User tidak jadi dihapus.",
        icon: "error"
      });
    }
  };
  
  
  

// Panggil handleDeleteUser dengan ID yang sesuai
  const openKaryawanModal = () => {
    setIsUserModalOpen(false);
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
    setIsUserModalOpen(true);
  };  

  return (
    <div className="data-user">
      <h2>Data User</h2>
      <div className="AddUser">
        <button
          className="add-user-button"
          onClick={() => {
            setIsEditing(false);
            setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' });
            setIsUserModalOpen(true);
          }}
        >
          Add User
        </button>
      </div>
      <div className="search-container">
      <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
      </div>
      <div className="data-user-content">
        <table className="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>No</th>
              <th>NIK</th>
              <th>Name</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {currentItems.map((order) => (
              <tr key={order.NIK}>
                <td>{order.No}</td>
                <td>{order.NIK}</td>
                <td>{order.Name}</td>
                <td>{order.Role}</td>
                <td>{order.Organization}</td>
                <td>
                  <i className="bi-pencil-fill" style={{ color: 'black', fontSize: '25px', cursor: 'pointer', marginRight: '10px' }} onClick={() => handleEditUser(order)}></i>
                  <i className="bi-trash" style={{ color: 'black', fontSize: '25px', cursor: 'pointer' }} onClick={() => handleDeleteUser(order.NIK)}></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      <div className="pagination-admin">
      <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper={false}
        />
      </div>
      {/* Add User Modal */}
      <Modal
      isOpen={isUserModalOpen}
      onRequestClose={() => {
        setIsUserModalOpen(false);
        setIsEditing(false);
        setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' });
      }}
      contentLabel="User Modal"
      className="user-modal"
      overlayClassName="user-modal-overlay"
    >
         <h3>{isEditing ? 'Edit' : 'Add'} Data User</h3>
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
{/*           
          <label>Organization</label>
          <input
            type="text"
            name="Organization"
            value={newUser.Organization}
            onChange={handleInputChange}
            className="modal-input"
          /> */}
          
        </div>
        <div className="modal-actions">
          <button onClick={() => {
            setIsUserModalOpen(false);
            setIsEditing(false);
            setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' });
          }} className="modal-cancel">Cancel</button>
          <button onClick={handleSaveUser} className="modal-add">
            {isEditing ? 'Update' : 'Add'}
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