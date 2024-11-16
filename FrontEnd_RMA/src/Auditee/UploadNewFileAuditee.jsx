import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import { CloudDownloadOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const UploadFilePdf = ({ onClose }) => { // Tambahkan prop onClose
  const [file, setFile] = useState(null); // Inisialisasi file dengan null
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  const upload = () => {
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Silakan pilih file sebelum mengupload!",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key2', description);

    axios
      .post('http://localhost:3100/Auditee/test', formData)
      .then(response => {
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
          onClose(); // Jika berhasil, panggil onClose untuk menutup modal
        }
      })
      .catch(err => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan saat mengupload file.",
        });
      });
  };

  const resetFields = () => {
    setFile(null);
    setDescription('');
    setMsg('');

    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
      fileInput.value = ''; // Reset nilai input file
    }
  };

  return (
    <div className='container' style={{ paddingTop: 60 }}>
      <div className='row'>
        <h1 className='textUploadNewFile'>Upload New File</h1>
        <div className='col-12'>
          <input
            type='file'
            style={{ display: 'none' }} // Sembunyikan input
            id='fileUpload'
            onChange={e => setFile(e.target.files[0])} // Set file ke state
          />

          <label
            htmlFor='fileUpload'
            style={{ cursor: 'pointer' }}
            className='dragAuditee'
          >
            {file ? (
              <span>{file.name}</span>
            ) : (
              <CloudDownloadOutlined style={{ fontSize: '90px' }} />
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
            value={description} // Control input value
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

        <button
          type='button'
          className='btnUploadNewAuditee'
          onClick={resetFields}
          style={{ marginTop: '-10px' }}
        >
          Cancel
        </button>

        <h1 style={{ fontSize: '15px', textAlign: 'center', marginTop: '20px' }}>
          {msg}
        </h1>
      </div>
    </div>
  );
}

export default UploadFilePdf;
