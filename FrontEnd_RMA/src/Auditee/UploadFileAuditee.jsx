import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from 'react-modal'
import '../App.css'
import Swal from 'sweetalert2'
import UploadNewFileAuditee from './UploadNewFileAuditee'

const UploadFileAuditee = () => {
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [isModalUpload, setIsModalUpload] = useState(false)
  const [isModalSearch, setIsModalSearch] = useState(false)
  const [placeholder, setPlaceholder] = useState('Loading...')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAuditee, setSelectedAuditee] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3100/Auditee/search-file'
      )
      console.log('API Response:', response.data)
      if (Array.isArray(response.data.data)) {
        setData(response.data.data)
      } else {
        console.error(
          'Expected array in response.data.data, got:',
          response.data
        )
        setError('Data yang diterima tidak sesuai format yang diharapkan')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Terjadi kesalahan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = e => setFile(e.target.files[0])

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Periksa apakah file dipilih
    if (!file && !selectedAuditee) {
        // Menggunakan SweetAlert untuk menampilkan pesan
        Swal.fire({
            icon: 'error',
            title: 'Gagal', // Judul alert
            text: 'Silakan pilih file atau pilih file dari daftar pencarian.', // Isi pesan
        });
        return; // Keluar dari fungsi jika kondisi tidak terpenuhi
    }

    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    } else if (selectedAuditee) {
        formData.append('file_path', selectedAuditee.n_audevdfile_file);
    }
    formData.append('description', description);

    console.log('Mengirim data ke server:', {
        description,
        file: file ? file.name : selectedAuditee?.n_audevdfile_file
    });

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_HELP_DESK}/Auditee/upload-new-file`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // Pastikan header ini diset ketika menggunakan FormData
                },
            }
        );

        // Cek apakah upload berhasil
        if (response.status === 200 || response.status === 201) {
            Swal.fire({
                title: 'Good job!',
                text: 'Data berhasil diunggah!',
                icon: 'success',
            });
            handleCancel(); // Reset form setelah berhasil mengunggah
        } else {
            // Server mengembalikan status lain
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while uploading the file!',
            });
        }
    } catch (error) {
        console.error('Error mengunggah file:', error.response); // Log respons error
        const errorMessage = error.response?.data?.error || 'Terjadi kesalahan saat mengunggah file.';
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: errorMessage,
        });
    }
};


  const handleCancel = () => {
    console.log('Cancelling upload...')
    setFile(null)
    setSelectedAuditee(null)
    setDescription('')
    closeModal()
  }


  const handleUploadFile = () => setIsModalUpload(true)
  const handleSearchFile = () => setIsModalSearch(true)
  const handleCheckboxChange = file => {
    setSelectedAuditee(file)
    closeModal()
  }

  const closeModal = () => {
    console.log('Closing modal...')
    setIsModalSearch(false)
    setIsModalUpload(false)
  }

  if (loading) return <p>Memuat...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className='upload-form'>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        UNGGAH FILE BUKTI
        <br />
        DATA & DOKUMEN YANG DIBUTUHKAN
      </h3>
      <form onSubmit={handleSubmit}>
        <div className='formAAuditee'>
          <label htmlFor='title'>Judul:</label>
          <input
            type='text'
            id='title'
            value={description}
            onChange={e => setDescription(e.target.value)}
            className='form-text'
            placeholder={placeholder}
          />
        </div>
        <div className='form-group'>
          <label htmlFor='file'>Bukti:</label>
          <div className='file-buttons'>
            <button
              type='button'
              className='btnSearchAuditee'
              onClick={handleSearchFile}
            >
              Cari File
            </button>
            <button
              type='button'
              className='btnUploadAuditee'
              onClick={handleUploadFile}
            >
              Unggah File Baru
            </button>
            <input
              type='file'
              id='file'
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <div>
            {file
              ? file.name
              : selectedAuditee
              ? selectedAuditee.n_audevdfile_file
              : 'Tidak ada file yang dipilih'}
          </div>
        </div>
    
          <button
            type='button'
            className='btnCancelAuditee'
            onClick={handleCancel}
          >
            Batal
          </button>
          <button type='submit' className='btnSaveAuditee' onClick={handleSubmit}>
            Simpan
          </button>
    
      </form>

      <Modal
        isOpen={isModalUpload}
        onRequestClose={closeModal}
        contentLabel='Modal Unggah File Baru'
        className='user-modal'
        overlayClassName='user-modal-overlay'
      >
        <UploadNewFileAuditee onClose={closeModal} />
      </Modal>

      <Modal
        isOpen={isModalSearch}
        onRequestClose={closeModal}
        contentLabel='Modal Pencarian File'
        className='karyawan-modal'
        overlayClassName='user-modal-overlay'
      >
        <div>
          <h1>Daftar Data</h1>
          <table className='table table-striped'>
            <thead className='table-dark'>
              <tr>
                <th>No</th>
                <th>Pilih</th>
                <th>Path File</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map(item => (
                  <tr key={item.i_audevdfile}>
                    <td>{item.i_audevdfile}</td>
                    <td>
                      <input
                        type='checkbox'
                        checked={
                          selectedAuditee &&
                          selectedAuditee.i_audevdfile === item.i_audevdfile
                        }
                        onChange={() => handleCheckboxChange(item)}
                      />
                    </td>
                    <td>{item.n_audevdfile_file}</td>
                    <td>{item.e_audevdfile_desc}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='4'>Tidak ada data tersedia</td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={closeModal} className='CloseDataList'>
            Batal
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default UploadFileAuditee
