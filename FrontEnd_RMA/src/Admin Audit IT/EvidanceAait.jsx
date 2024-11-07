import React, { useState, useEffect, useCallback } from 'react'
import Modal from 'react-modal'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import { getYear } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import '../App.css'
import Swal from 'sweetalert2'
import { Pagination } from 'antd'
import { useMemo } from 'react'


Modal.setAppElement('#root')

const EvidenceAait = () => {
  const [orders, setOrders] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [auditeeData, setAuditeeData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentEditOrder, setCurrentEditOrder] = useState(null)
  const [selectedAuditees, setSelectedAuditees] = useState({})
  const itemsPerPage = 10

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
        return 'ParkerRussel'
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

  const convertStatusComplete = (statusComplete, hasRemarks = false) => {
    console.log('Converting status:', statusComplete, 'hasRemarks:', hasRemarks)
    if (statusComplete && statusComplete.isUpdated) {
      return {
        text: 'COMPLETE AUDITEE ADMIN IT',
        backgroundColor: 'yellow',
        color: 'black'
      }
    }
    if (statusComplete === 2) {
      return {
        text: 'COMPLETE AUDITEE ADMIN IT',
        backgroundColor: 'yellow',
        color: 'black'
      }
    }
    if (hasRemarks) {
      return {
        text: 'COMPLETE AUDITEE',
        backgroundColor: 'orange',
        color: 'white'
      }
    }
    return { text: 'NOT COMPLETE', backgroundColor: 'red', color: 'white' }
  }
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  // const handleAddUser = () => {
  //   setOrders((prev) => [
  //     ...prev,
  //     { no: prev.length > 0 ? prev[prev.length - 1].no + 1 : 1, ...newUser, publishingYear: new Date().getFullYear() },
  //   ]);
  //   setIsModalOpen(false);
  //   resetNewUser();
  // };

  const handleEditUser = order => {
    setCurrentEditOrder(order)
    setIsEditModalOpen(true)
    fetchRemarks(order.no)
  }

  const handleYearChange = date => {
    const year = date ? getYear(date).toString() : ''
    setSelectedYear(year)
  }

  // Tambahkan fungsi pencarian yang menggunakan useMemo
  const filteredOrders = useMemo(() => {
    // Pertama, filter berdasarkan tahun
    let result = selectedYear
      ? orders.filter(order => order.publishingYear === selectedYear)
      : orders

    // Kemudian, filter berdasarkan searchQuery jika ada
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
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
        ].some(
          field => field && String(field).toLowerCase().includes(searchLower)
        )
      })
    }

    // Sort berdasarkan nomor
    return result.sort((a, b) => a.no - b.no)
  }, [orders, selectedYear, searchQuery])

  // Menghitung data untuk halaman saat ini
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage])

  // Handler untuk perubahan halaman
  const handlePageChange = page => {
    setCurrentPage(page)
  }

  // -- MENAMPILKAN DATA SETELAH SPI UPLOAD EXCEL
  const fetchDataByYear = useCallback(async year => {
    if (year) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HELP_DESK}/AuditIT/tmau-devd`,
          {
            params: { year: year }
          }
        )
        if (
          response.data &&
          response.data.payload &&
          Array.isArray(response.data.payload.data)
        ) {
          const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
          const formattedData = response.data.payload.data.map(item => {
            const savedOrder = savedOrders.find(o => o.no === item.i_audevd)
            return {
              no: item.i_audevd,
              dataAndDocumentNeeded: item.n_audevd_title,
              phase: convertPhase(item.e_audevd_phs),
              status: convertStatus(item.c_audevd_stat),
              deadline: new Date(item.d_audevd_ddl).toLocaleDateString(),
              remarksByAuditee: item.n_audevdfile_file,
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
      console.log('Tahun tidak dipilih, fetchDataByYear tidak dijalankan')
    }
  }, [])

  // --MENAMPILKAN DATA AUDITEE
  useEffect(() => {
    const fetchAuditeeData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HELP_DESK}/AuditIT/auditee`,
          {
            params: { role: 2 }
          }
        )
        if (response.data && Array.isArray(response.data.payload)) {
          setAuditeeData(response.data.payload)
        } else {
          console.error(
            'Data yang diharapkan adalah array, tetapi menerima:',
            response.data.payload
          )
          setAuditeeData([])
        }
      } catch (error) {
        console.error('Kesalahan saat mengambil data:', error)
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

  // -- MEMILIH AUDITEE
  const handleCheckboxChange = nik => {
    setSelectedAuditees(prev => ({
      ...prev,
      [currentEditOrder.no]: nik
    }))
  }

  const handleSelectAuditee = async () => {
    const selectedNik = selectedAuditees[currentEditOrder.no]
    if (!selectedNik) {
      console.error('Tidak ada auditee yang dipilih')
      return
    }

    const requestData = {
      i_audevd: currentEditOrder.no,
      n_audusr_usrnm: selectedNik
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/AuditIT/update-auditee`,
        requestData
      )

      if (response.data && response.data.payload) {
        console.log('Auditee berhasil diperbarui')
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.no === currentEditOrder.no
              ? {
                  ...order,
                  auditee: {
                    nik: selectedNik,
                    name: auditeeData.find(
                      a => a.n_audusr_usrnm === selectedNik
                    )?.n_audusr
                  }
                }
              : order
          )
        )

        // Update the current edit order
        setCurrentEditOrder(prevOrder => ({
          ...prevOrder,
          auditee: {
            nik: selectedNik,
            name: auditeeData.find(a => a.n_audusr_usrnm === selectedNik)
              ?.n_audusr
          }
        }))

        // Clear the selected auditee for this order
        setSelectedAuditees(prev => {
          const updated = { ...prev }
          delete updated[currentEditOrder.no]
          return updated
        })

        Swal.fire({
          title: 'Good job!',
          text: `Data berhasil di Upload`,
          icon: 'success'
        })
      } else {
        console.error(
          'Gagal memperbarui auditee:',
          response.data ? response.data.message : 'Respons tidak valid'
        )
      }
    } catch (error) {
      console.error(
        'Error saat memperbarui auditee:',
        error.response ? error.response.data : error.message
      )
    }
  }

  // -- MENAMPILKAN AUDITEE --
  const GetAuditee = async (orderNo, i_audevd_aud) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HELP_DESK}/AuditIT/select-auditee`,
        {
          params: { i_audevd: orderNo }
        }
      );
  
      // Memeriksa apakah respon valid dan memiliki payload yang diharapkan
      if (
        response.data &&
        response.data.payload &&
        Array.isArray(response.data.payload.data)
      ) {
        const auditeeDataArray = response.data.payload.data;
        let matchingAuditee;
  
        if (i_audevd_aud) {
          // Mencari auditee yang cocok jika i_audevd_aud diberikan
          matchingAuditee = auditeeDataArray.find(
            auditee => auditee.n_audusr_usrnm === i_audevd_aud
          );
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
          );
        } else {
          console.log(`Tidak ada auditee yang cocok untuk order ${orderNo}`);
        }
      } else {
        console.error(
          `Respons tidak valid untuk order ${orderNo}:`,
          response.data
        );
      }
    } catch (error) {
      console.error(
        `Error mengambil data auditee untuk order ${orderNo}:`,
        error
      );
    }
  };
  

  ////////////////////////////////////

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
        const remarksByAuditee =
          response.data.payload.data[0].e_audevdfile_desc || ''
        const hasRemarks = remarksByAuditee.trim() !== ''
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.no === key
              ? {
                  ...order,
                  remarksByAuditee,
                  statusComplete: order.statusComplete.text === "COMPLETE AUDITEE ADMIN IT"
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

  const handleUpdateStatus = async order => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/AuditIT/update-status`,
        {
          I_AUDEVD: order.no
        }
      )

      if (response.data && response.data.message === 'Update Status Berhasil') {
        console.log('Status berhasil diperbarui')
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.no === order.no
              ? {
                  ...o,
                  statusComplete: {
                    text: 'COMPLETE AUDITEE ADMIN IT',
                    backgroundColor: 'yellow',
                    color: 'black',
                    isUpdated: true
                  }
                }
              : o
          )
        )
        // Simpan status yang diperbarui ke localStorage
        const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        const updatedOrderIndex = updatedOrders.findIndex(
          o => o.no === order.no
        )
        if (updatedOrderIndex) {
          updatedOrders[updatedOrderIndex] = {
            ...updatedOrders[updatedOrderIndex],
            statusComplete: {
              text: 'COMPLETE AUDITEE ADMIN IT',
              backgroundColor: 'yellow',
              color: 'black',
              isUpdated: true
            }
          }
          localStorage.setItem('orders', JSON.stringify(updatedOrders))
        }
      } else {
        console.error(
          'Gagal memperbarui status:',
          response.data ? response.data.message : 'Respons tidak valid'
        )
      }
    } catch (error) {
      console.error(
        'Error saat memperbarui status:',
        error.response ? error.response.data : error.message
      )
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
    if (selectedYear) {
      fetchDataByYear(selectedYear)
    }
  }, [selectedYear, fetchDataByYear])

  useEffect(() => {
    console.log('Orders updated:', orders)
  }, [orders])

  // MENAMPILKAN DATA REMARKS BY AUDITEE END :

  const handleDownloadFile = async (fileId, filename) => {
    try {
        console.log('Attempting to download file:', { fileId, filename });
        console.log(`Attempting to download file from: http://localhost:3100/AuditIT/download-file/${fileId}`);

        const response = await axios.get(
            `${import.meta.env.VITE_HELP_DESK}/AuditIT/download-file/${fileId}`,
            {
                responseType: 'blob'  //  format blob
            }
        );

        // Dapatkan tipe MIME dari respons
        const mimeType = response.data.type || 'application/octet-stream';
        
        // Buat URL objek dari blob
        const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
        const link = document.createElement('a');
        link.href = url;
        
        // Setel nama file yang benar dari database
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'File berhasil diunduh',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Gagal mengunduh file. Silakan coba lagi.'
        });
    }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_HELP_DESK}/SPI/selected-remarks-auditee`);
        console.log('Raw data from server:', response.data);
        
        const formattedData = response.data.map(item => {
          console.log('Processing item:', item);
          return {
            ...item,
            remarksByAuditee: item.n_audevdfile_file,
            i_audevdfile: item.i_audevdfile,
            n_audevdfile_file: item.n_audevdfile_file
          };
        });
        
        console.log('Formatted data:', formattedData);
        setOrders(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

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
                const auditee =
                  auditeeData.find(
                    auditee => auditee.n_audusr_usrnm === order.auditee
                  ) || {}
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
                            onClick={() => handleDownloadFile(order.no, order.remarksByAuditee)}
                          >
                            <i className="bi bi-download"></i> 
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
                      style={{
                        backgroundColor: order.statusComplete.backgroundColor,
                        color: order.statusComplete.color
                      }}
                    >
                      {order.statusComplete.text}
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
                      {order.statusComplete.backgroundColor === 'orange' && (
                        <i
                          className='bi-clipboard2-check-fill'
                          style={{
                            color: 'black',
                            fontSize: '20px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateStatus(order)}
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

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel='Edit User Modal'
        className='evidence-modal'
        overlayClassName='evidence-modal-overlay'
      >
        <div className='modal-content'>
          <div className='auditee-table-container'>
            <h3>DATA AUDITEE</h3>
            <input
              type='text'
              placeholder='Search...'
              className='search-input'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <table className='auditee-table'>
              <table className='table table-striped'>
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
                        <td>
                          <input
                            type='checkbox'
                            checked={
                              selectedAuditees[currentEditOrder?.no] ===
                              item.n_audusr_usrnm
                            }
                            onChange={() =>
                              handleCheckboxChange(item.n_audusr_usrnm)
                            }
                          />
                        </td>
                        <td>{item.n_audusr_usrnm}</td>
                        <td>{item.n_audusr}</td>
                        <td>{item.organisasi}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='5'>No data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </table>

            <div className='modal-actions'>
              <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className='select-btn' onClick={handleSelectAuditee}>
                Select
              </button>
            </div>

              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={itemsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={false}
                className='pagination-auditee'
              />
            
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EvidenceAait
