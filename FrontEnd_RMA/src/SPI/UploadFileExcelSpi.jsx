import React, { useState } from 'react'
import axios from 'axios'
import '../App.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import { CloudDownloadOutlined } from '@ant-design/icons'

const UploadFileExcelSpi = () => {
  const [file, setFile] = useState(null)
  const [setUploadProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedYear] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const formData = new FormData() // Deklarasikan di baris ini
  formData.append('file', file)
  formData.append('year', selectedYear)

  const handleFileChange = e => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
  }

  const hasExtension = (fileName, exts) => {
    return new RegExp(`(${exts.join('|').replace(/\./g, '\\.')})$`).test(
      fileName
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
  
    // Kondisi untuk memeriksa jika belum memilih tahun dan file
    if (!selectedDate && !file) {
      Swal.fire({
        title: 'Error!', 
        text: 'Silakan upload file dan pilih tahun terlebih dahulu.',
        icon: 'error'
      })
      return
    }
  
    // Kondisi untuk memeriksa jika tahun belum dipilih
    if (!selectedDate) {
      Swal.fire({
        title: 'Error!',
        text: 'Silakan pilih tahun terlebih dahulu.',
        icon: 'error'
      })
      return
    }
  
    // Kondisi untuk memeriksa jika file belum dipilih
    if (!file) {
      Swal.fire({
        title: 'Error!',
        text: 'Silakan upload file terlebih dahulu.',
        icon: 'error'
      })
      return
    }
  
    // Kondisi untuk memeriksa jika file tidak sesuai format
    if (!hasExtension(file.name, ['.xls', '.xlsx'])) {
      Swal.fire({
        title: 'Error!',
        text: 'Hanya file XLS atau XLSX (Excel) yang diijinkan.',
        icon: 'error'
      })
      return
    }
  
    const formData = new FormData()
    formData.append('file', file)
    const selectedYear = selectedDate.getFullYear().toString()
    formData.append('year', selectedYear) 
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/SPI/upload-file-excel`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          }
        }
      )
  
      console.log('Response from server:', response.data)
  
      // Set pesan sukses jika upload berhasil
      if (response.data && response.data.message) {
        setMessage(
          <span>
            <i className='fa fa-check'></i>{' '}
            <font color='green'>{response.data.message}</font>
          </span>
        )
        Swal.fire({
          title: 'Good job!',
          text: `Data berhasil di Upload untuk tahun ${selectedYear}`,
          icon: 'success'
        })
      } else {
        throw new Error('Unknown error occurred.')
      }
  
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 3000)
      setFile(null)
      setUploadProgress(0)
    } catch (error) {
      // Tangani kesalahan dengan baik
      console.error(
        'Error during upload:',
        error.response?.data || error.message
      )
      // setMessage(
      //   <font color='red'>
      //     ERROR: {error.response?.data.error || 'Tidak dapat mengunggah file'}
      //   </font>
      // )
      setShowMessage(true)
    }
  }
  
  

  const handleDragOver = e => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && hasExtension(droppedFile.name, ['.xls', '.xlsx'])) {
      setFile(droppedFile)
    } else {
      alert('Hanya file XLS atau XLSX (Excel) yang diijinkan.')
    }
  }

  return (
    <div className='dashboard'>
      <h2>UPLOAD FILE EXCEL</h2>
      <div className='dashboard-content'>
        <form
          id='FormExcelDoc'
          onSubmit={handleSubmit}
          encType='multipart/form-data'
        >
          <div className='row'>
            <div className='col-md-12' style={{ padding: '10px 30px' }}>
              {showMessage && (
                <div id='result' className='alert alert-success'>
                  {message}
                </div>
              )}
            </div>
          </div>
          <fieldset className='label_side_d' id='facnumber'>
            <div className='clearfix'>
              <a
                className='btnTe'
                href='http://localhost:3100/SPI/TemplateFileExcel'
              >
                Download Template
              </a>
            </div>
          </fieldset>
          <fieldset className='label_side' id='facnumber'></fieldset>
          <fieldset
            className='label_side'
            id='facnumber'
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: dragOver ? 'd2px dashed #4CAF50' : '2px dashed #dd',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <div className='clearfix'>
              <div className='input-group margin' style={{ width: '50%' }}>
                <input
                  type='file'
                  name='file'
                  id='file'
                  className='form-control'
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div
                  className='drag'
                  onClick={() => document.getElementById('file').click()}
                >
                  {file ? (
                    file.name
                  ) : (
                    <CloudDownloadOutlined style={{ fontSize: '90px' }} />
                  )}
                </div>
                <span className='input-group-btn'>
                  <input
                    type='submit'
                    className='btn_upload'
                    value='Upload'
                    title='Upload File Excel Stock'
                  />
                </span>
              </div>
              <i className='fm'>Format .XLS atau .XLSX (Excel)</i>
            </div>
          </fieldset>
        </form>

        <div className='filter-year-SPI'>
          <label>Select Year: </label>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat='yyyy'
            showYearPicker
            placeholderText='Pilih Tahun'
          />
        </div>
      </div>
    </div>
  )
}

export default UploadFileExcelSpi
