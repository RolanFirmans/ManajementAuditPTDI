import React, { useState } from 'react'
import axios from 'axios'
import '../App.css'
import { CloudDownloadOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'

const UploadFilePdf = () => {
  const [file, setFile] = useState(null) // Set file menjadi null secara default
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('') // State for messages

  const upload = () => {
    // Validasi apakah file telah dipilih
    if (!file) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Silakan pilih file sebelum mengupload!",
        });
        return; // Hentikan eksekusi lebih lanjut jika tidak ada file
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key2', description);

    axios
        .post('http://localhost:3100/Auditee/test', formData)
        .then(response => {
            console.log('Response from server:', response.data); // Debug log
            if (response.data.message === 'Test created successfully') {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Something went wrong!"
                });
            } else {
                Swal.fire({
                    title: "Good job!",
                    text: "Data Berhasil Di Upload!",
                    icon: "success"
                });
            }
        })
        .catch(err => {
            console.error('Upload error:', err);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat mengupload file.",
            });
        });
};


  return (
    <div className='container' style={{ paddingTop: 60 }}>
      <div className='row'>
        <h1 className='textUploadNewFile'>Upload New File</h1>
        <div className='col-12'>
          {/* Input file yang disembunyikan */}
          <input
            type='file'
            style={{ display: 'none' }} // Sembunyikan input
            id='fileUpload'
            onChange={e => setFile(e.target.files[0])} // Set file ke state
          />

          {/* Ikon yang berfungsi sebagai pengganti input file */}
          <label
            htmlFor='fileUpload'
            style={{ cursor: 'pointer' }}
            className='dragAuditee'
          >
            {file ? (
              <span>{file.name}</span> // Tampilkan nama file setelah di-upload
            ) : (
              <CloudDownloadOutlined style={{ fontSize: '90px' }} /> // Tampilkan ikon jika tidak ada file
            )}
          </label>
        </div>

        <div className='col-12'>
          <label className='formLabel'>Description</label>
          <input
            type='text'
            className='formAuditee'
            placeholder='Enter Description'
            autoComplete='off'
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <button
          type='button'
          className='btnUploadNewAuditee'
          onClick={upload}
          style={{ marginTop: '20px' }}
        >
          Upload
        </button>
        <h1
          style={{ fontSize: '15px', textAlign: 'center', marginTop: '20px' }}
        >
          {msg}
        </h1>
      </div>
    </div>
  )
}

export default UploadFilePdf
