import React, { useState, useEffect, useCallback } from 'react'
import Modal from 'react-modal'
import DatePicker from 'react-datepicker'
import { getYear } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import { useParams } from "react-router-dom";
import { Pagination } from 'antd'
import { useMemo } from 'react'
import Swal from 'sweetalert2';
import '../App.css'

import UploadFileAuditee from '../Auditee/UploadFileAuditee'

Modal.setAppElement('#root')

const EvidenceAuditeeFinance = () => {
  const { nik, setUserNik } = useParams(); // Ambil NIK dari URL
  const [orders, setOrders] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [auditeeData, setAuditeeData] = useState([])
  const [isModalUpload, setIsModalUpload] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const itemsPerPage = 10

  const [newUser, setNewUser] = useState({
    no: '',
    dataAndDocumentNeeded: '',
    phase: '',
    status: '',
    deadline: '',
    remarksByAuditee: '',
    remarksByAuditor: '',
    auditee: '',
    auditor: '',
    statusComplete: '',
    publishingYear: ''
  })

  const convertStatus = status => {
    switch (status) {
      case 1:
        return 'pending'
      case 2:
        return 'not available'
      case 3:
        return 'not applicable'
      default:
        return 'unknown'
    }
  }

  const convertAuditor = auditor => {
    switch (auditor) {
      case 1:
        return 'DGCA'
      case 2:
        return 'Finance'
      case 3:
        return 'ITML'
      case 4:
        return 'PARKERRUSSEL'
      default:
        return 'unknown'
    }
  }

  const convertPhase = phase => {
    switch (phase) {
      case 1:
        return 'Perencanaan'
      case 2:
        return 'Pelaksanaan'
      case 3:
        return 'Pelaporan'
      default:
        return 'unknown'
    }
  }

  const convertStatusComplete = (statusComplete) => {
    console.log('Converting status:', statusComplete)
    if (statusComplete === 1) {
      return {
        text: 'COMPLETE AUDITEE',
        backgroundColor: 'orange',
        color: 'white',
      }
    }
    return { text: 'NOT COMPLETE', backgroundColor: 'red', color: 'white' }
  }

  useEffect(() => {
    const fetchUserNik = async () => {
        try {
            const token = localStorage.getItem('jwt_token'); // Ambil token dari local storage
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/AuditIT/data/${nik}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setUserNik(response.data.nik); // Simpan NIK pengguna
        } catch (error) {
            console.error('Error fetching user info:', error);
            // Tambahkan logika untuk menangani kesalahan, misalnya redirect ke login
        }
    };

    fetchUserNik();
}, []);

  

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  const updateOrderNumbers = ordersList => {
    return ordersList.map((order, index) => ({
      ...order,
      no: index + 1
    }))
  }

  const handleAddUser = async () => {
    try {
      if (editingUser) {
        // Mengedit data yang ada
        const response = await axios.put(
          `${import.meta.env.VITE_HELP_DESK}/SPI/edit-data`, // Ubah endpoint sesuai API yang digunakan
          { ...editingUser, ...newUser }
        )
        if (response.status === 200) {
          setOrders(prev =>
            prev.map(order =>
              order.no === editingUser.no
                ? { ...editingUser, ...newUser }
                : order
            )
          )
          setEditingUser(null)
        }
      } else {
        // Menambahkan data baru
        const response = await axios.post(
          `${import.meta.env.VITE_HELP_DESK}/AuditIT/tmau-devd`, // Ubah endpoint sesuai API yang digunakan
          newUser
        )
        if (response.status === 201) {
          setOrders(prev => [
            ...prev,
            {
              no: prev.length > 0 ? prev[prev.length - 1].no + 1 : 1,
              ...newUser
            }
          ])
        }
      }
      setIsModalOpen(false)
      resetNewUser()
    } catch (error) {
      console.error('Error adding or editing user:', error)
      // Handle error sesuai kebutuhan, misalnya dengan menampilkan pesan kesalahan ke pengguna
    }
  }

  const handleEditUser = user => {
    setEditingUser(user)
    setNewUser(user)
    setIsModalOpen(true)
  }

  const handleUploadFile = user => {
    setIsModalUpload(true)
  }

  // const handleDeleteUser = user => {
  //   setUserToDelete(user)
  //   setIsDeleteModalOpen(true)
  // }

  const confirmDeleteUser = () => {
    const updatedOrders = orders.filter(order => order.no !== userToDelete.no)
    const reorderedOrders = updateOrderNumbers(updatedOrders)
    setOrders(reorderedOrders)
    localStorage.setItem('orders', JSON.stringify(reorderedOrders))
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const handleUpdateUser = async event => {
    try {
      const bodyData = {
        key: newUser.no, // I_AUDEVD
        key1: newUser.dataAndDocumentNeeded, // AUDEVD_TITTLE
        key2: newUser.phase, // N_AUDEVD_PHS
        key3: newUser.status, // C_AUDEVD_STAT
        key4: newUser.deadline, // D_AUDEVD_DDL
        key5: newUser.auditor // C_AUDEVD_AUDR
      }

      console.log('Data yang akan dikirim:', bodyData)

      const response = await fetch(
        `${import.meta.env.VITE_HELP_DESK}/SPI/edit-data/${newUser.no}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Terjadi kesalahan saat memperbarui pengguna'
        )
      }

      const result = await response.json()
      console.log('Hasil update:', result)

      toast.success('Pengguna berhasil diperbarui')
      setIsAddUserModalOpen(false)
      setNewUser({
        no: '',
        dataAndDocumentNeeded: '',
        phase: '',
        status: '',
        deadline: '',
        auditor: ''
      }) // Reset newUser
      fetchKaryawan() // Refresh daftar karyawan setelah update
      setIsEditing(false) // Reset flag isEditing setelah update
    } catch (error) {
      console.error('Error memperbarui pengguna:', error)
      toast.error(`Error memperbarui pengguna: ${error.message}`)
    }
  }

  const handleYearChange = date => {
    const year = date ? getYear(date).toString() : ''
    setSelectedYear(year)
  }

  const filteredOrders = useMemo(() => {
    let result = selectedYear
      ? orders.filter(order => order.publishingYear === selectedYear && order.auditee.nik === nik) // Filter berdasarkan NIK
      : orders.filter(order => order.auditee.nik === nik); // Filter berdasarkan NIK jika tahun tidak dipilih
  
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(order => {
        return [
          order.dataAndDocumentNeeded,
          order.phase,
          order.status,
          order.deadline,
          order.remarksByAuditee,
          order.remarksByAuditor,
          order.auditee?.nik,
          order.auditee?.name,
          order.auditor,
          order.statusComplete?.text
        ].some(field => field && String(field).toLowerCase().includes(searchLower));
      });
    }
  
    return result.sort((a, b) => a.no - b.no);
  }, [orders, selectedYear, searchQuery, nik]);
  

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage])

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  // -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
  const fetchDataByYear = useCallback(async year => {
    if (year && nik) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HELP_DESK}/AuditIT/tmau-devd`,
          {
            params: { year: year, nik: nik , auditor : 2}
          }
        )
        if (
          response.data &&
          response.data.payload &&
          Array.isArray(response.data.payload.data)
        ) {
          const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
          const formattedData = response.data.payload.data
          .filter(item => item.c_audevd_audr === 2)
          .map(item => {
            const savedOrder = savedOrders.find(o => o.no === item.i_audevd)
            return {
              no: item.i_audevd,
              dataAndDocumentNeeded: item.n_audevd_title,
              phase: convertPhase(item.e_audevd_phs),
              status: convertStatus(item.c_audevd_stat),
              deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
              remarksByAuditee: savedOrder ? savedOrder.remarksByAuditee : '',
              remarksByAuditor: item.e_audevd_audr,
              auditee: savedOrder ? savedOrder.auditee : { nik: '', name: '' },
              auditor: convertAuditor(item.c_audevd_audr),
              statusComplete: savedOrder
                ? savedOrder.statusComplete
                : convertStatusComplete(item.c_audevd_statcmp),
              publishingYear: item.c_year,
              i_audevd_aud: item.i_audevd_aud || '',
              isUpdated: savedOrder ? savedOrder.isUpdated : false
            }
          })
          setOrders(formattedData)
          for (const order of formattedData) {
            if (!order.auditee.nik) {
              await GetAuditee(order.no, order.i_audevd_aud)
            }
            if (!order.remarksByAuditee) {
              await fetchRemarks(order.no)
            }
          }
        } else {
          setOrders([])
          console.log('Data tidak ditemukan atau tidak dalam format array')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    } else {
      console.log('Tahun atau nik tidak dipilih, fetchDataByYear tidak dijalankan')
    }
  }, [nik])

  useEffect(() => {
    if (selectedYear) {
      fetchDataByYear(selectedYear)
    }
  }, [selectedYear, fetchDataByYear])

  // const refreshData = useCallback(async () => {
  //   if (selectedYear) {
  //     await fetchDataByYear(selectedYear);
  //   }
  // }, [selectedYear, fetchDataByYear]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     refreshData();
  //   }, 1); // Adjust the time as needed

  //   return () => clearInterval(intervalId); // Cleanup on unmount
  // }, [refreshData]);

  // --MENAMPILKAN DATA AUDITEE
  useEffect(() => {
    const fetchAuditeeData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HELP_DESK}/AuditIT/auditee`
        )
        if (response.data && Array.isArray(response.data.payload)) {
          setAuditeeData(response.data.payload)
        } else {
          console.error('Expected an array but got:', response.data.payload)
          setAuditeeData([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setAuditeeData([])
      }
    }

    if (isEditModalOpen) {
      fetchAuditeeData()
    }
  }, [isEditModalOpen])

  const filteredData = Array.isArray(auditeeData)
    ? auditeeData.filter(
        item =>
          item.n_audusr_usrnm
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.n_audusr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.organisasi?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  // -- MENAMPILKAN AUDITEE --
  const GetAuditee = async (orderNo, i_audevd_aud) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/SPI/selected-auditee`,
        {
          params: { i_audevd: orderNo }
        }
      )
      if (
        response.data &&
        response.data.payload &&
        Array.isArray(response.data.payload.data)
      ) {
        const auditeeDataArray = response.data.payload.data
        let matchingAuditee

        if (i_audevd_aud) {
          matchingAuditee = auditeeDataArray.find(
            auditee => auditee.n_audusr_usrnm === i_audevd_aud
          )
        } 

        if (matchingAuditee) {
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.no === orderNo
                ? {
                    ...order,
                    auditee: {
                      nik: matchingAuditee.n_audusr_usrnm,
                      name: matchingAuditee.n_audusr
                    }
                  }
                : order
            )
          )
        } else {
          console.log(`Tidak ada auditee yang cocok untuk order ${orderNo}`)
        }
      } else {
        console.error(
          `Respons tidak valid untuk order ${orderNo}:`,
          response.data
        )
      }
    } catch (error) {
      console.error(
        `Error mengambil data auditee untuk order ${orderNo}:`,
        error
      )
    }
  }

  // MENAMPILKAN DATA REMARKS BY AUDITEE START :
  const fetchRemarks = async key => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/AuditIT/selected-remarks-auditee`,
        {
          params: { key: key }
        }
      )
      if (
        response.data &&
        response.data.payload &&
        response.data.payload.data &&
        response.data.payload.data.length > 0
      ) {
        const remarksByAuditee = response.data.payload.data[0].e_audevdfile_desc || ''
        // Hanya update remarks, tidak mengubah status
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.no === key
              ? {
                  ...order,
                  remarksByAuditee
                  // Status tidak berubah di sini
                }
              : order
          )
        )
      }
    } catch (error) {
      console.error('Error fetching remarks for key', key, ':', error)
    }
  }

  const handleUpdateStatus = async order => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/Auditee/update-status`,
        {
          I_AUDEVD: order.no
        }
      )

      if (response.data && response.data.message === 'Update Status Berhasil') {
        console.log('Status berhasil diperbarui')
        // Update status ke warna orange setelah tombol diklik
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.no === order.no
              ? {
                  ...o,
                  statusComplete: {
                    text: 'COMPLETE AUDITEE',
                    backgroundColor: 'orange',
                    color: 'white',
                    isUpdated: true
                  }
                }
              : o
          )
        )
        
        // Update localStorage
        const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        const updatedOrderIndex = updatedOrders.findIndex(o => o.no === order.no)
        if (updatedOrderIndex !== -1) {
          updatedOrders[updatedOrderIndex] = {
            ...updatedOrders[updatedOrderIndex],
            statusComplete: {
              text: 'COMPLETE AUDITEE',
              backgroundColor: 'orange',
              color: 'white',
              isUpdated: true
            }
          }
          localStorage.setItem('orders', JSON.stringify(updatedOrders))
        }
      } else {
        console.error('Gagal memperbarui status:', response.data ? response.data.message : 'Respons tidak valid')
      }
    } catch (error) {
      console.error('Error saat memperbarui status:', error.response ? error.response.data : error.message)
    }
  }

  const handleDeleteFileAuditee = async (no) => {
    console.log('Attempting to delete user with no:', no);
    if (!no) {
      Swal.fire('Error', 'Invalid order number', 'error');
      return;
    }
  
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btnConfirmAdmin",
        cancelButton: "btnCancelAdmin"
      },
      buttonsStyling: false
    });
  
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan bisa membalikkan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus ini!',
      cancelButtonText: 'Tidak, batalkan!',
      reverseButtons: true
    })
    
  
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_HELP_DESK}/Delete/delete-file/${no}`);
        
        if (response.status === 200) {
          console.log('Evidence berhasil dihapus:', response.data);
          setOrders(prevOrders => prevOrders.filter(order => order.no !== no));
  
          Swal.fire({
            title: "Hapus!",
            text: "Evidence telah berhasil dihapus.",
            icon: "success"
          });
        } else {
          throw new Error(response.data.message || 'Gagal menghapus evidence');
        }
      } catch (error) {
        console.error('Error saat menghapus evidence:', error);
        Swal.fire('Error', `Gagal menghapus evidence: ${error.response?.data?.message || error.message}`, 'error');
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Batalkan",
        text: "Evidence tidak jadi dihapus.",
        icon: "error"
      });
    }
  };
  

  return (
    <div className='evidence-content'>
      <h2>Data Evidence</h2>
      <div className='filter-year-evidence'>
        <label>Year: </label>
        <DatePicker
          selected={selectedYear ? new Date(`${selectedYear}-01-01`) : null}
          onChange={handleYearChange}
          showYearPicker
          dateFormat='yyyy'
          placeholderText='Select year'
        />
      </div>
      <div className='search-container'>
        <input
          type='text'
          placeholder='Search...'
          className='search-input'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className='evidence-table'>
        <table className='table  table-striped'>
          <thead class=' table-spi table-dark'>
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
              currentPageData.map((order, index) => {
                // Cari data auditee berdasarkan `order.auditee`
                return (
                  <tr key={order.no || index}>
                    <td>{order.no}</td>
                    <td>{order.dataAndDocumentNeeded}</td>
                    <td>{order.phase}</td>
                    <td>{order.status}</td>
                    <td>{order.deadline}</td>
                    <td>
                    {order.remarksByAuditee ? (
                        <>
                          {order.remarksByAuditee}
                          <button
                            className="download-btn"
                            onClick={() => handleDeleteFileAuditee(order.no, order.remarksByAuditee)}
                          >
                            <i className="bi-trash"></i> 
                          </button>
                        </>
                      ) : (
                        '-'
                      )}
                    </td> 
                    <td>{order.remarksByAuditor}</td>
                    <td>
                      {order.auditee && order.auditee.nik
                        ? `${order.auditee.nik} - ${order.auditee.name}`
                        : '-'}
                    </td>
                    <td>{order.auditor}</td>
                    <td
                    
                    className='StatusComplete'
                      style={{
                        backgroundColor: order.statusComplete.backgroundColor,
                        color: order.statusComplete.color,
                      }} 
                    >
                      {order.statusComplete.text}
                    </td>
                    <td>
                      <i
                        className='bi-cloud-arrow-up-fill'
                        style={{
                          color: 'black',
                          fontSize: '20px',
                          cursor: 'pointer',
                          marginRight: '10px',
                        }}
                        title="Upload"
                        onClick={() => handleUploadFile(order)}
                      ></i>
                      {/* <i
                        className='bi-pencil-fill'
                        style={{
                          color: 'black',
                          fontSize: '20px',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                        onClick={() => handleEditUser(order)}
                      ></i> */}
                      <i
                        className='bi-clipboard2-check-fill'
                        style={{
                          color: 'black',
                          fontSize: '20px',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                        onClick={() => handleUpdateStatus(order)}
                        title="Status Complete"
                      ></i>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='pagination-admin'>
        <Pagination
          current={currentPage}
          total={filteredOrders.length}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper={false}
        />
      </div>

      {/* Upload File Excel */}

      {/* Upload New File Auditee */}

      <Modal
        isOpen={isModalUpload}
        onRequestClose={() => setIsModalUpload(false)}
        contentLabel='Upload New File Modal'
        className='user-modal'
        overlayClassName='user-modal-overlay'
      >
        <UploadFileAuditee />
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel='Add User Modal'
        className='user-modal'
        overlayClassName='user-modal-overlay'
      >
        <h3>{editingUser ? 'Edit Data User' : 'Add Data User'}</h3>
        <div className='modal-content'>
          <label>Data and Document Needed</label>
          <input
            type='text'
            name='dataAndDocumentNeeded'
            value={newUser.dataAndDocumentNeeded}
            onChange={handleUpdateUser}
            className='modal-input'
          />
          <label>Phase</label>
          <input
            type='text'
            name='phase'
            value={newUser.phase}
            onChange={handleUpdateUser}
            className='modal-input'
          />
          <label>Status</label>
          <input
            type='text'
            name='status'
            value={newUser.status}
            onChange={handleUpdateUser}
            className='modal-input'
          />
          <label>Deadline</label>
          <input
            type='text'
            name='deadline'
            value={newUser.deadline}
            onChange={handleUpdateUser}
            className='modal-input'
          />
          <label>Auditor</label>
          <input
            type='text'
            name='auditor'
            value={newUser.auditor}
            onChange={handleUpdateUser}
            className='modal-input'
          />
        </div>
        <div className='modal-actions'>
          <button onClick={handleAddUser} className='modal-save'>
            {editingUser ? 'Save Changes' : 'Add User'}
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className='modal-cancel'
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel='Delete User Modal'
        className='delete-modal'
        overlayClassName='delete-modal-overlay'
      >
        <h3>Delete User</h3>
        <p>Are you sure you want to delete this user?</p>
        <div className='modal-actions'>
          <button onClick={confirmDeleteUser} className='modal-save'>
            Delete
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className='modal-cancel'
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default EvidenceAuditeeFinance
