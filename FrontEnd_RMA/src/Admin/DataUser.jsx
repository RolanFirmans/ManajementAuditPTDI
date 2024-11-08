import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import DataKaryawan from './DataKaryawan' // Import DataKaryawan component
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Swal from 'sweetalert2'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Pagination } from 'antd'
import { useMemo } from 'react'
import _ from 'lodash'

Modal.setAppElement('#root')

const DataUser = () => {
  const [orders, setOrders] = useState([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [filterOrganisasi, setFilterOrganisasi] = useState('')
  const [isKaryawanModalOpen, setIsKaryawanModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortedOrders, setSortedOrders] = useState([])
  const itemsPerPage = 10

  const [newUser, setNewUser] = useState({
    No: '',
    NIK: '',
    Name: '',
    Role: '',
    Organization: '',
    Email: ''
  })

  const getRoleValue = roleLabel => {
    switch (roleLabel) {
      case 'ADMIN':
        return 1
      case 'AUDITEE':
        return 2
      case 'SPI':
        return 3
      case 'ADMIN_IT':
        return 4
      default:
        return null
    }
  }
  const getRoleLabel = roleValue => {
    switch (parseInt(roleValue)) {
      case 1:
        return 'ADMIN'
      case 2:
        return 'AUDITEE'
      case 3:
        return 'SPI'
      case 4:
        return 'ADMIN_IT'
      default:
        return 'null'
    }
  }

  // Fungsi untuk memfilter data berdasarkan pencarian
  const filteredData = useMemo(() => {
    return sortedOrders.filter(order => {
      const matchesFilter = filterOrganisasi
        ? order.Organization &&
          order.Organization.toLowerCase().startsWith(
            filterOrganisasi.toLowerCase()
          )
        : true
      const matchesSearch =
        order.NIK?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.Organization?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [sortedOrders, filterOrganisasi, searchQuery])

  // Calculate currentItems based on filteredData
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  useEffect(() => {
    const sorted = [...orders].sort((a, b) => {
      // Pastikan No adalah number
      const aNo = typeof a.No === 'number' ? a.No : parseInt(a.No)
      const bNo = typeof b.No === 'number' ? b.No : parseInt(b.No)
      return aNo - bNo
    })
    setSortedOrders(sorted)
  }, [orders])

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber)
  }

  useEffect(() => {
    console.log('Current filtered data:', filteredData)
    console.log('Current items being displayed:', currentItems)
  }, [filteredData, currentItems])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/Admin/karyawan`
      )
      const mappedUsers = response.data.payload
        .map(item => ({
          No: parseInt(item.i_audusr),
          NIK: item.n_audusr_usrnm,
          Name: item.n_audusr,
          Role: getRoleLabel(item.role),
          Organization: item.organisasi
        }))
        .sort((a, b) => a.No - b.No)

      setOrders(mappedUsers)
      setSortedOrders(mappedUsers) // Set sortedOrders langsung
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(`Gagal mengambil data karyawan: ${error.message}`)
      setOrders([])
      setSortedOrders([]) // Reset sortedOrders juga
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchKaryawan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/Admin/karyawan`
      )
      const mappedUsers = response.data.payload.map(item => ({
        No: item.i_audusr,
        NIK: item.n_audusr_usrnm,
        Name: item.n_audusr,
        Role: getRoleLabel(item.role),
        Organization: item.organisasi
      }))
      setOrders(mappedUsers)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(`Gagal mengambil data karyawan: ${error.message}`)
      setOrders([])
    }
  }
  useEffect(() => {
    fetchKaryawan()
  }, [])

  const handleAddUser = async () => {
    try {
      const roleValue = getRoleValue(newUser.Role)
      if (roleValue === null) {
        throw new Error('Peran yang dipilih tidak valid')
      }

      const bodyData = {
        key: newUser.NIK,
        key1: newUser.Name,
        key2: roleValue
      }

      const response = await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/Admin/add-karyawan`,
        bodyData
      )

      if (response.status === 200) {
        // Add new user to local state immediately
        const newUserData = {
          No: orders.length > 0 ? Math.max(...orders.map(o => o.No)) + 1 : 1,
          NIK: newUser.NIK,
          Name: newUser.Name,
          Role: newUser.Role,
          Organization: newUser.Organization
        }

        const updatedOrders = [...orders, newUserData].sort(
          (a, b) => a.No - b.No
        )
        setOrders(updatedOrders)
        setSortedOrders(updatedOrders)

        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil ditambahkan',
          icon: 'success'
        })

        setIsUserModalOpen(false)
        setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' })

        // Fetch fresh data from server to ensure synchronization
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error menambahkan pengguna:', error)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error Menambahkan Pengguna!'
      })
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewUser(prev => ({ ...prev, [name]: value }))

    if (name === 'Role') {
      let newFilterOrganisasi = ''
      if (value === 'ADMIN' || value === 'ADMIN_IT' || value === 'AUDITEE') {
        newFilterOrganisasi = 'IT'
      }
      if (value === 'SPI') {
        newFilterOrganisasi = 'PI'
      }
      setFilterOrganisasi(newFilterOrganisasi)

      // Buka modal DataKaryawan jika role yang dipilih memerlukan filter
      if (newFilterOrganisasi) {
        setIsKaryawanModalOpen(true)
      }
    }
  }

  const handleUpdateUser = async () => {
    try {
      const roleValue = getRoleValue(newUser.Role)
      if (roleValue === null) {
        throw new Error('Peran yang dipilih tidak valid')
      }

      const bodyData = {
        n_audusr_usrnm: newUser.NIK,
        c_audusr_role: roleValue.toString(),
        N_AUDUSR: newUser.Name.trim()
      }

      console.log('Data yang akan dikirim untuk update:', bodyData)

      const response = await axios.put(
        `${import.meta.env.VITE_HELP_DESK}/Admin/update-karyawan/${
          newUser.NIK
        }`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        setOrders(
          prevOrders =>
            prevOrders
              .map(order =>
                order.NIK === newUser.NIK
                  ? { ...order, ...newUser, Role: getRoleLabel(roleValue) }
                  : order
              )
              .sort((a, b) => a.No - b.No) // Urutkan kembali berdasarkan No
        )
        console.log('Hasil update:', response.data)

        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil diperbarui',
          icon: 'success'
        })

        setIsUserModalOpen(false)
        setNewUser({ No: '', NIK: '', Name: '', Role: '', Organization: '' })
        setIsEditing(false)
      } else {
        throw new Error(
          response.data.error || 'Terjadi kesalahan saat memperbarui pengguna'
        )
      }
    } catch (error) {
      console.error('Error memperbarui pengguna:', error)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Error memperbarui pengguna: ${
          error.response?.data?.error || error.message
        }`
      })
    }
  }

  const handleSaveUser = () => {
    if (isEditing) {
      handleUpdateUser()
    } else {
      handleAddUser()
    }
  }

  const handleEditUser = user => {
    console.log('Edit user data:', user)
    setNewUser({
      NIK: user.NIK,
      Name: user.Name,
      Role: user.Role,
      Organization: user.Organization
    })
    setIsEditing(true)
    setIsUserModalOpen(true)
  }

  const handleDeleteUser = async NIK => {
    console.log('Attempting to delete user with NIK:', NIK)
    if (!NIK) {
      toast.error('NIK karyawan tidak valid')
      return
    }

    // Setup SweetAlert with custom Bootstrap buttons
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btnConfirmAdmin',
        cancelButton: 'btnCancelAdmin'
      },
      buttonsStyling: false
    })

    const result = await swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    })

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_HELP_DESK}/Admin/delete-karyawan/${NIK}`
        )

        if (response.status === 200) {
          console.log('User berhasil dihapus:', response.data)
          setOrders(prevOrders => prevOrders.filter(order => order.NIK !== NIK))
          toast.success('User berhasil dihapus')

          // Menampilkan SweetAlert bahwa penghapusan berhasil
          swalWithBootstrapButtons.fire({
            title: 'Deleted!',
            text: 'User telah berhasil dihapus.',
            icon: 'success'
          })
        } else {
          throw new Error(response.data.message || 'Gagal menghapus user')
        }
      } catch (error) {
        console.error('Error saat menghapus user:', error)
        toast.error(
          `Gagal menghapus user: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Menampilkan SweetAlert jika penghapusan dibatalkan
      swalWithBootstrapButtons.fire({
        title: 'Cancelled',
        text: 'User tidak jadi dihapus.',
        icon: 'error'
      })
    }
  }

  // Update fungsi openKaryawanModal
  const openKaryawanModal = () => {
    // Simpan state user saat ini sebelum membuka modal karyawan
    const currentUserState = { ...newUser }

    setIsUserModalOpen(false)
    setIsKaryawanModalOpen(true)

    // Gunakan setTimeout untuk memastikan state tersimpan setelah modal tertutup
    setTimeout(() => {
      setNewUser(currentUserState)
    }, 100)
  }

  //Update handleKaryawanSelect
  const handleKaryawanSelect = karyawan => {
    setNewUser(prev => ({
      ...prev, // Pertahankan data yang sudah ada
      NIK: karyawan.nik,
      Name: karyawan.nama,
      Organization: karyawan.organisasi
    }))
    setIsKaryawanModalOpen(false)

    // Gunakan setTimeout untuk memastikan modal karyawan benar-benar tertutup
    setTimeout(() => {
      setIsUserModalOpen(true)
    }, 100)
  }

  // Tambahkan state untuk menyimpan data sementara
  const [tempUserData, setTempUserData] = useState(null)

  return (
    <div className='data-user'>
      <h2>Data User</h2>
      <div className='AddUser'>
        <button
          className='add-user-button'
          onClick={() => {
            setIsEditing(false)
            setNewUser({
              No: '',
              NIK: '',
              Name: '',
              Role: '',
              Organization: ''
            })
            setIsUserModalOpen(true)
          }}
        >
          Add User
        </button>
      </div>
      <div className='search-container'>
        <input
          type='text'
          placeholder='Search...'
          className='search-input'
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            setCurrentPage(1) // Reset to first page when searching
          }}
        />
      </div>
      <div className='data-user-content'>
        <table className='table table-striped'>
          <thead class='table-dark'>
            <tr>
              <th>No</th>
              <th>NIK</th>
              <th>Name</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className='table-group-divider'>
            {currentItems.map(order => (
              <tr key={order.NIK}>
                <td>{order.No}</td>
                <td>{order.NIK}</td>
                <td>{order.Name}</td>
                <td>{order.Role}</td>
                <td>{order.Organization}</td>
                <td>
                  <i
                    className='bi-pencil-fill'
                    style={{
                      color: 'black',
                      fontSize: '25px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                    onClick={() => handleEditUser(order)}
                  ></i>
                  <i
                    className='bi-trash'
                    style={{
                      color: 'black',
                      fontSize: '25px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDeleteUser(order.NIK)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      <Pagination
        current={currentPage}
        total={filteredData.length}
        pageSize={itemsPerPage}
        onChange={handlePageChange}
        showSizeChanger={false}
        showQuickJumper={false}
        className='pagination-admin'
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onRequestClose={() => {
          // Simpan data sementara sebelum menutup modal
          setTempUserData(newUser)
          setIsUserModalOpen(false)
          setIsEditing(false)
        
          
        }}
        onAfterClose={() => {
          // Jika modal ditutup tanpa membuka modal karyawan, baru reset newUser
          if (!isKaryawanModalOpen) {
            setNewUser({
              No: '',
              NIK: '',
              Name: '',
              Role: '',
              Organization: ''
            })
          }
        }}
        contentLabel='User Modal'
        className='user-modal'
        overlayClassName='user-modal-overlay'
      >
        <h3>{isEditing ? 'Edit' : 'Add'} Data User</h3>
        <div className='modal-content'>
          <label>Role</label>
          <select
            name='Role'
            value={newUser.Role}
            onChange={handleInputChange}
            className='modal-select'
          >
            <option value=''>Pilih Peran</option>
            <option value='SPI'>SPI</option>
            <option value='AUDITEE'>Auditee</option>
            <option value='ADMIN_IT'>Admin IT</option>
          </select>
          <label>NIK</label>
          <input
            type='text'
            name='NIK'
            value={newUser.NIK}
            onClick={openKaryawanModal}
            readOnly
            className='modal-input'
          />
          <label>Name</label>
          <input
            type='text'
            name='Name'
            value={newUser.Name}
            onChange={handleInputChange}
            className='modal-input'
          />
        </div>
        <div className='modal-actions'>
          <button
            onClick={() => {
              setIsUserModalOpen(false)
              setIsEditing(false)
              setNewUser({
                No: '',
                NIK: '',
                Name: '',
                Role: '',
                Organization: ''
              })
            }}
            className='modal-cancel'
          >
            Cancel
          </button>
          <button onClick={handleSaveUser} className='modal-add'>
            {isEditing ? 'Update' : 'Add'}
          </button>
        </div>
      </Modal>

      {/* Data Karyawan Modal */}
      <Modal
        isOpen={isKaryawanModalOpen}
        onRequestClose={() => {
          setIsKaryawanModalOpen(false)
          // Kembalikan data user yang disimpan sementara
          if (tempUserData) {
            setNewUser(tempUserData)
            setTempUserData(null)
          }
          // Buka kembali modal user
          setTimeout(() => {
            setIsUserModalOpen(true)
          }, 100)
        }}
        contentLabel='Data Karyawan Modal'
        className='karyawan-modal'
        overlayClassName='karyawan-modal-overlay'
      >
        <div className='modal-header'>
          <h3>Data Karyawan</h3>
          <i
            className='bi-x-square-fill'
            style={{
              color: 'black',
              fontSize: '20px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
            onClick={() => {
              setIsKaryawanModalOpen(false)
              // Kembalikan data user yang disimpan sementara
              if (tempUserData) {
                setNewUser(tempUserData)
                setTempUserData(null)
              }
              // Buka kembali modal user
              setTimeout(() => {
                setIsUserModalOpen(true)
              }, 100)
            }}
          />
        </div>
        <DataKaryawan
          onSelectKaryawan={handleKaryawanSelect}
          filterOrganisasi={filterOrganisasi}
        />
      </Modal>
    </div>
  )
}

export default DataUser
