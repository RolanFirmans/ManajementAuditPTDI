import React, { useState, useEffect, useCallback } from 'react'
import Modal from 'react-modal'
import DatePicker from 'react-datepicker'
import { getYear, format } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import { Pagination } from 'antd'
import { useMemo } from 'react'
import Swal from 'sweetalert2'
import '../App.css'

Modal.setAppElement('#root')

const EvidenceSpi = () => {
  const [orders, setOrders] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [orderStatuses, setOrderStatuses] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const sortedOrders = orders.sort((a, b) => a.no - b.no)
  const [currentPage, setCurrentPage] = useState(1)
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

  // Fungsi untuk mengonversi status ke string
  const convertStatusToString = status => {
    const statusNum = Number(status)
    switch (statusNum) {
      case 1:
        return 'Pending'
      case 2:
        return 'Not Available'
      case 3:
        return 'Not Applicable'
      default:
        return 'Unknown'
    }
  }

  // Fungsi untuk mengonversi auditor ke string
  const convertAuditorToString = auditor => {
    const auditorNum = Number(auditor)
    switch (auditorNum) {
      case 1:
        return 'DGCA'
      case 2:
        return 'FINANCE'
      case 3:
        return 'ITML'
      case 4:
        return 'PARKERRUSSEL'
      default:
        return 'Unknown'
    }
  }

  // Fungsi untuk mengonversi status ke nomor
  const convertStatusToNumber = status => {
    const statusStr = String(status).toLowerCase()
    switch (statusStr) {
      case 'pending':
        return 1
      case 'not available':
        return 2
      case 'not applicable':
        return 3
      default:
        return 1
    }
  }

  // Fungsi untuk mengonversi phase ke string
  const convertPhaseToString = phase => {
    const phaseNum = Number(phase)
    switch (phaseNum) {
      case 1:
        return 'Perencanaan'
      case 2:
        return 'Pelaksanaan'
      case 3:
        return 'Pelaporan'
      default:
        return 'Unknown Phase'
    }
  }

  const convertPhaseToNumber = phase => {
    const phaseStr = String(phase).toLowerCase()
    switch (phaseStr) {
      case 'perencanaan':
        return 1
      case 'pelaksanaan':
        return 2
      case 'pelaporan':
        return 3
      default:
        return 1
    }
  }

  const convertAuditorToNumber = status => {
    const auditor = String(status).toLowerCase()

    switch (auditor.toUpperCase()) {
      case 'DGCA':
        return 1
      case 'FINANCE':
        return 2
      case 'ITML':
        return 3
      case 'PARKERRUSSEL':
        return 4
      default:
        console.warn(`Unknown auditor value: ${auditor}. Using default value.`)
        return 1
    }
  }
  //  // Fungsi untuk mengonversi auditor ke nomor
  // const convertAuditorToNumber = (auditor) => {
  //   if (typeof auditor !== 'string') {
  //     console.warn(`Unexpected auditor value: ${auditor}. Using default value.`);
  //     return 1;
  //   }

  //   switch (auditor.toUpperCase()) {
  //     case "DGCA": return 1;
  //     case "FINANCE": return 2;
  //     case "ITML": return 3;
  //     case "PARKERRUSSEL": return 4;
  //     default:
  //       console.warn(`Unknown auditor value: ${auditor}. Using default value.`);
  //       return 1;
  //   }
  // };

  // Fungsi untuk mengonversi status complete
  const convertStatusComplete = (statusComplete, hasRemarks = false) => {
    console.log(
      'convertStatusComplete dipanggil dengan:',
      statusComplete,
      hasRemarks
    )
    let result
    if (statusComplete === 3) {
      result = {
        text: 'COMPLETE SPI',
        backgroundColor: 'green',
        color: 'white'
      }
    } else if (statusComplete === 2) {
      result = {
        text: 'COMPLETE AUDITEE ADMIN IT',
        backgroundColor: 'yellow',
        color: 'black'
      }
    } else if (statusComplete === 1 && hasRemarks) {
      result = {
        text: 'COMPLETE AUDITEE',
        backgroundColor: 'orange',
        color: 'white'
      }
    } else {
      result = { text: 'NOT COMPLETE', backgroundColor: 'red', color: 'white' }
    }
    console.log('convertStatusComplete mengembalikan:', result)
    return result
  }

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  // Fungsi untuk memperbarui nomor urutan pada orders
  const updateOrderNumbers = ordersList => {
    return ordersList.map((order, index) => ({
      ...order,
      no: index + 1
    }))
  }

  // Fungsi untuk mengedit user
  const handleEditUser = user => {
    console.log('Data user yang akan diedit:', user)
    setEditingUser(user)
    setNewUser({
      no: user.no,
      dataAndDocumentNeeded: user.dataAndDocumentNeeded,
      phase: convertPhaseToString(user.phase), // Konversi phase ke string untuk ditampilkan di form
      status: convertStatusToString(user.status),
      deadline: user.deadline,
      auditor: convertAuditorToString(user.auditor)
    })
    setIsModalOpen(true)
  }

  // Fungsi untuk mengupdate input
  const handleInputChange = e => {
    const { name, value } = e.target
    console.log(`Input changed: ${name} = ${value}`) // Tambahan logging untuk debug
    setNewUser(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleUpdate = async () => {
    try {
      // Validasi tanggal
      const deadlineDate = new Date(newUser.deadline)
      if (isNaN(deadlineDate)) {
        throw new Error('Tanggal deadline tidak valid')
      }
      const formattedDate = format(deadlineDate, 'yyyy-MM-dd HH:mm:ss')

      // Persiapkan data
      const updateData = {
        key: parseInt(editingUser.no),
        key1: newUser.dataAndDocumentNeeded,
        key2: convertPhaseToNumber(newUser.phase),
        key3: convertStatusToNumber(newUser.status),
        key4: formattedDate,
        key5: convertAuditorToNumber(newUser.auditor)
      }

      console.log('Data yang dikirim:', updateData)
      console.log('Nilai phase sebelum konversi:', newUser.phase)
      console.log(
        'Nilai phase setelah konversi:',
        convertPhaseToNumber(newUser.phase)
      )

      try {
        // Kirim request
        const response = await axios.put(
          `${import.meta.env.VITE_HELP_DESK}/SPI/edit-data`,
          updateData
        )

        if (response.data) {
          // Update state
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.no === editingUser.no
                ? { ...order, ...response.data.data }
                : order
            )
          )

          // Reset form & tutup modal
          setIsModalOpen(false)
          setEditingUser(null)

          // Tampilkan pesan sukses
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data berhasil diperbarui',
            timer: 2000,
            showConfirmButton: false
          })

          // Refresh data jika diperlukan
          // fetchData(); // Uncomment jika perlu refresh data
        }
      } catch (error) {
        // Jika ada error dari server tapi data sebenarnya berhasil tersimpan
        if (error.response && error.response.status === 400) {
          // Cek jika data sebenarnya sudah tersimpan

          // Reset form & tutup modal
          setIsModalOpen(false)
          setEditingUser(null)

          // Tampilkan pesan sukses
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data berhasil diperbarui',
            timer: 2000,
            showConfirmButton: false
          })

          // Refresh data jika diperlukan
          // fetchData(); // Uncomment jika perlu refresh data

          return // Keluar dari function
        }

        // Jika benar-benar error
        throw error
      }
    } catch (error) {
      console.error('Error detail:', error)

      // Log untuk debugging
      if (error.response) {
        console.log('Error response:', error.response)
        console.log('Error status:', error.response.status)
        console.log('Error data:', error.response.data)
      }

      // Tampilkan error ke user
      Swal.fire({
        icon: 'error',
        title: 'Informasi',
        text: 'Data sudah berhasil diperbarui, silakan refresh halaman',
        showConfirmButton: true
      })
    }
  }

  const handleYearChange = date => {
    const year = date ? getYear(date).toString() : null // Mengambil tahun dari DatePicker
    console.log('Selected year:', year) // Pastikan tahun yang baru diterima
    setSelectedYear(year) // Menyimpan tahun yang dipilih di state
  }

  const filteredOrders = useMemo(() => {
    const filtered = selectedYear
      ? orders.filter(order => order.publishingYear === parseInt(selectedYear))
      : orders

    return filtered.filter(order => {
      const searchLower = searchQuery.toLowerCase()

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
      ].some(
        field => field && String(field).toLowerCase().includes(searchLower)
      )

      return matchesSearch
    })
  }, [orders, selectedYear, searchQuery])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage])

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  // -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
  const fetchDataByYear = useCallback(async year => {
    if (year) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HELP_DESK}/SPI/tmau-devd`,
          {
            params: { year: year}
           
          }
        )
        console.log('Fetching data for year:', year) // Log untuk mengecek year
        if (
          response.data &&
          response.data.payload &&
          Array.isArray(response.data.payload.data)
        ) {
          const formattedData = response.data.payload.data.map(item => ({
            no: item.i_audevd,
            dataAndDocumentNeeded: item.n_audevd_title,
            phase: item.e_audevd_phs,
            status: item.c_audevd_stat, // Store the original status value
            deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
            remarksByAuditee: '',
            remarksByAuditor: item.e_audevd_audr,
            auditee: { nik: '', name: '' },
            auditor: item.c_audevd_audr, // Store the original auditor value
            statusComplete: convertStatusComplete(item.c_audevd_statcmp, false),
            publishingYear: new Date(item.c_year).getFullYear(),
            i_audevd_aud: item.i_audevd_aud || ''
          }))
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
      console.log('Tahun tidak dipilih, fetchDataByYear tidak dijalankan')
    }
  }, [])

  useEffect(() => {
    if (selectedYear) {
      console.log('Fetching data for year:', selectedYear) // Log tahun yang akan di-fetch
      fetchDataByYear(selectedYear)
    }
  }, [selectedYear, fetchDataByYear])

  // useEffect(() => {
  //   fetchDataByYear(selectedYear); // Mengambil data pertama kali
  // }, [selectedYear, fetchDataByYear]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     fetchDataByYear(selectedYear); // Mengambil data setiap 10 detik
  //   }, 10000);

  //   return () => clearInterval(intervalId); // Menghapus interval pada unmount
  // }, [selectedYear, fetchDataByYear]);

  ///////////////////////////////////////
  // -- MENAMPILKAN AUDITEE --
  const GetAuditee = async (orderNo, i_audevd_aud) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/SPI/selected-auditee`,
        {
          params: { i_audevd: orderNo }
        }
      )

      // Memeriksa apakah respon valid dan memiliki payload yang diharapkan
      if (
        response.data &&
        response.data.payload &&
        Array.isArray(response.data.payload.data)
      ) {
        const auditeeDataArray = response.data.payload.data
        let matchingAuditee

        if (i_audevd_aud) {
          // Mencari auditee yang cocok jika i_audevd_aud diberikan
          matchingAuditee = auditeeDataArray.find(
            auditee => auditee.n_audusr_usrnm === i_audevd_aud
          )
        }

        // Memastikan order yang tepat di-update
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
  ////////////////////////////////////

  // MENAMPILKAN DATA REMARKS BY AUDITEE START :
  const fetchRemarks = async key => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/SPI/remarks`,
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
        const remarksByAuditee =
          response.data.payload.data[0].e_audevdfile_desc || ''
        const hasRemarks = remarksByAuditee.trim() !== ''
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.no === key
              ? {
                  ...order,
                  remarksByAuditee,
                  statusComplete:
                    order.statusComplete.text === 'COMPLETE SPI'
                      ? order.statusComplete
                      : convertStatusComplete(
                          order.statusComplete.text ===
                            'COMPLETE AUDITEE ADMIN IT'
                            ? 2
                            : hasRemarks
                            ? 1
                            : 0,
                          hasRemarks
                        )
                }
              : order
          )
        )
      }
    } catch (error) {
      console.error('Error fetching remarks for key', key, ':', error)
    }
  }
  /// Dwonload file
  const handleDownloadFile = async (fileId, filename) => {
    try {
      console.log('Attempting to download file:', { fileId, filename })

      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/AuditIT/download-file/${fileId}`,
        {
          responseType: 'blob' //  format blob
        }
      )

      // Dapatkan tipe MIME dari respons
      const mimeType = response.data.type || 'application/octet-stream'

      // Buat URL objek dari blob
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: mimeType })
      )
      const link = document.createElement('a')
      link.href = url

      // Setel nama file yang benar dari database
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'File berhasil diunduh',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Error downloading file:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengunduh file. Silakan coba lagi.'
      })
    }
  }
  ////////////////////////////////////////////
  const handleUpdateStatusSPI = async order => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_HELP_DESK}/SPI/update-status/${order.no}`
      )

      console.log('Respons server:', response.data)

      if (
        response.data &&
        response.data.payload.message === 'Update Status Berhasil'
      ) {
        const updatedStatus = convertStatusComplete(3, true)
        setOrders(prevOrders =>
          prevOrders.map(prevOrder =>
            prevOrder.no === order.no
              ? {
                  ...prevOrder,
                  statusComplete: updatedStatus
                }
              : prevOrder
          )
        )
        console.log(`Status untuk order ${order.no} diperbarui:`, updatedStatus)
      }
    } catch (error) {
      console.error('Error saat memperbarui status:', error)
    }
  }

  const handleDeleteUser = async no => {
    console.log('Attempting to delete user with no:', no)
    if (!no) {
      Swal.fire('Error', 'Invalid order number', 'error')
      return
    }

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
          `${import.meta.env.VITE_HELP_DESK}/AuditIT/delete-evidence/${no}`
        )

        if (response.status === 200) {
          console.log('Evidence berhasil dihapus:', response.data)
          setOrders(prevOrders => prevOrders.filter(order => order.no !== no))

          swalWithBootstrapButtons.fire({
            title: 'Deleted!',
            text: 'Evidence telah berhasil dihapus.',
            icon: 'success'
          })
        } else {
          throw new Error(response.data.message || 'Gagal menghapus evidence')
        }
      } catch (error) {
        console.error('Error saat menghapus evidence:', error)
        Swal.fire(
          'Error',
          `Gagal menghapus evidence: ${
            error.response?.data?.message || error.message
          }`,
          'error'
        )
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      swalWithBootstrapButtons.fire({
        title: 'Cancelled',
        text: 'Evidence tidak jadi dihapus.',
        icon: 'error'
      })
    }
  }

  useEffect(() => {
    localStorage.setItem(
      'orderStatuses',
      JSON.stringify(
        orders.reduce((acc, order) => {
          acc[order.no] = order.statusComplete
          return acc
        }, {})
      )
    )
  }, [orders])
  useEffect(() => {
    const savedStatuses = JSON.parse(localStorage.getItem('orderStatuses'))
    if (savedStatuses) {
      setOrderStatuses(savedStatuses)
    }
  }, [])
  useEffect(() => {
    console.log('Status orders diperbarui:', orderStatuses)
  }, [orderStatuses])

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
            {sortedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => {
                return (
                  <tr key={order.no || index}>
                    <td>{order.no}</td>
                    <td>{order.dataAndDocumentNeeded}</td>
                    <td>{convertPhaseToString(order.phase)}</td>
                    <td>{convertStatusToString(order.status)}</td>
                    <td>{order.deadline}</td>
                    <td>
                      {order.remarksByAuditee ? (
                        <>
                          {order.remarksByAuditee}
                          <button
                            className='download-btn'
                            onClick={() =>
                              handleDownloadFile(
                                order.no,
                                order.remarksByAuditee
                              )
                            }
                          >
                            <i className='bi bi-download'></i>
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
                    <td>{convertAuditorToString(order.auditor)}</td>
                    <td
                      style={{
                        backgroundColor:
                          orderStatuses[order.no]?.backgroundColor ||
                          order.statusComplete.backgroundColor,
                        color:
                          orderStatuses[order.no]?.color ||
                          order.statusComplete.color
                      }}
                    >
                      {orderStatuses[order.no]?.text ||
                        order.statusComplete.text}
                    </td>
                    <td>
                      <i
                        className='bi-pencil-fill'
                        style={{
                          color: 'black',
                          fontSize: '20px',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                        onClick={() => handleEditUser(order)}
                      ></i>
                      <i
                        className='bi-trash'
                        style={{
                          color: 'black',
                          fontSize: '20px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleDeleteUser(order.no)}
                      ></i>

                      {order.statusComplete.backgroundColor === 'yellow' && (
                        <i
                          className='bi-clipboard2-check-fill'
                          style={{
                            color: 'black',
                            fontSize: '20px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateStatusSPI(order)}
                        ></i>
                      )}
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
      {/* pagination */}
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
      {/* Handle Edit  */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel='Edit User Modal'
        className='user-modal'
        overlayClassName='user-modal-overlay'
      >
        <h3>Edit Data User</h3>
        <div className='modal-content'>
          <label>Data and Document Needed</label>
          <input
            type='text'
            name='dataAndDocumentNeeded'
            value={newUser.dataAndDocumentNeeded}
            onChange={handleInputChange}
            className='modal-input'
          />
          <label>Phase</label>
          <select
            name='phase'
            value={newUser.phase}
            onChange={handleInputChange}
            className='modal-input'
          >
            <option value='Perencanaam'>Perencanaan</option>
            <option value='Pelaksanaan'>Pelaksanaan</option>
            <option value='Pelaporan'>Pelaporan</option>
          </select>
          <label>Status</label>
          <select
            name='status'
            value={newUser.status}
            onChange={handleInputChange}
            className='modal-input'
          >
            <option value='pending'>Pending</option>
            <option value='not available'>Not Available</option>
            <option value='not applicable'>Not Applicable</option>
          </select>

          <label>Deadline</label>
          <DatePicker
            selected={new Date(newUser.deadline)}
            onChange={date =>
              setNewUser({ ...newUser, deadline: format(date, 'yyyy-MM-dd') })
            }
            dateFormat='yyyy-MM-dd'
            className='modal-input'
          />
          <label>Auditor</label>
          <select
            name='auditor'
            value={newUser.auditor}
            onChange={handleInputChange}
            className='modal-input'
          >
            <option value='DGCA'>DGCA</option>
            <option value='FINANCE'>Finance</option>
            <option value='ITML'>ITML</option>
            <option value='PARKERRUSSEL'>PARKERRUSSEL</option>
          </select>
        </div>
        <div className='modal-actions'>
          <button onClick={handleUpdate} className='modal-save'>
            Save Changes
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className='modal-cancel'
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Handdle Delete */}
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
          <button onClick='' className='modal-save'>
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

export default EvidenceSpi
