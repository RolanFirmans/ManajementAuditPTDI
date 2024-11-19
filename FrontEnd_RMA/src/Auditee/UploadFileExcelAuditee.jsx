import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2'; 

const UploadFileExcelSpi = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dragOver, setDragOver] = useState(false);
  const [description, setDescription] = useState("");

  const hasExtension = (fileName, exts) => {
    return new RegExp(`(${exts.join("|").replace(/\./g, "\\.")})$`).test(fileName);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && hasExtension(selectedFile.name, [".xls", ".xlsx"])) {
      setFile(selectedFile);
    } else {
      Swal.fire({
        icon: "error",
        title: "Format tidak valid",
        text: "Hanya file XLS atau XLSX yang diijinkan.",
      });
      e.target.value = ''; // Clear the file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi apakah file dipilih
    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Silakan pilih file sebelum mengupload!',
      });
      return; // Hentikan eksekusi lebih lanjut jika tidak ada file
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description); // Include description in form data

    try {
      const response = await axios.post(
        'http://localhost:3100/SPI/upload-file-excel',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Necessary for FormData
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted); // Update upload progress
          },
        }
      );

      // Memeriksa respons dari server
      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title: "Berhasil",
          text: response.data.message,
          icon: "success",
        });
        // Resetting states
        setFile(null);
        setDescription("");
        setUploadProgress(0);
      } else {
        // Jika server mengembalikan respons lainnya yang muncul
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:  "Ada yang tidak beres saat mengunggah!",
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error); // Logging error
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengupload file.';
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage, // Tampilkan pesan kesalahan yang tepat
      });
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && hasExtension(droppedFile.name, [".xls", ".xlsx"])) {
      setFile(droppedFile);
    } else {
      Swal.fire({
        icon: "error",
        title: "Format tidak valid",
        text: "Hanya file XLS atau XLSX yang diijinkan.",
      });
    }
  };

  const handleCancel = () => {
    setFile(null);
    setDescription("");
    setUploadProgress(0);
    setMessage("");
    setShowMessage(false);
  };

  return (
    <div>
      <header>
        <h3>UPLOAD NEW FILE EVIDENCE</h3>
      </header>
      <form
        id="FormExcelDoc"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="row">
          <div className="col-md-12" style={{ padding: "10px 30px" }}>
            {showMessage && (
              <div id="result" className="alert alert-success">
                {message}
              </div>
            )}
          </div>
        </div>
        <fieldset
          className="label_side"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: dragOver ? "2px dashed #4CAF50" : "2px dashed #ddd",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <label>Upload File</label>
          <div className="clearfix">
            <div className="input-group margin" style={{ width: "50%" }}>
              <input
                type="file"
                name="file"
                id="file"
                className="form-control"
                onChange={handleFileChange}
                style={{ display: "none" }} // Hide input
              />
              <div
                onClick={() => document.getElementById("file").click()}
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "5px",
                  backgroundColor: "#f1f1f1",
                }}
              >
                {file ? file.name : "Drag & Drop file here or Click to select"}
              </div>
            </div>
            <i>Format .XLS atau .XLSX (Excel)</i>
          </div>
        </fieldset>
        
        {/* Description Field */}
        <fieldset className="label_side" id="description">
          <label className="font-medium">DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="textarea"
          />
        </fieldset>
        <fieldset className="label_side" id="progress">
          <label>Progress</label>
          <div className="clearfix">
            <div id="progress1">
              <div id="bar1" style={{ width: `${uploadProgress}%` }}></div>
              <div id="percent1">{uploadProgress}%</div>
            </div>
          </div>
        </fieldset>
        <div className="form-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <input
            type="submit"
            className="btn btn-info"
            value="Save"
            title="Save Data"
            style={{ marginLeft: "auto" }} // Align button to the right
          />
        </div>
      </form>
    </div>
  );
};

export default UploadFileExcelSpi;
