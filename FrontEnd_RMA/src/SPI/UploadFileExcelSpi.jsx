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
      const [selectedDate, setSelectedDate] = useState(null);
      const [dragOver, setDragOver] = useState(false);
    
      const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
      };
      
      const hasExtension = (fileName, exts) => {
        return new RegExp(`(${exts.join("|").replace(/\./g, "\\.")})$`).test(fileName);
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedDate) {
          Swal.fire({
            title: "Error!",
            text: "Silakan pilih tahun terlebih dahulu.",
            icon: "error"
          });
          return;
        }
    
        if (!file || !hasExtension(file.name, [".xls", ".xlsx"])) {
          Swal.fire({
            title: "Error!",
            text: "Hanya file XLS atau XLSX (Excel) yang diijinkan.",
            icon: "error"
          });
          return;
        }
      
        const formData = new FormData();
        formData.append("file", file);
        const selectedYear = selectedDate.getFullYear().toString();
        formData.append("year", selectedYear);
        
        console.log("Sending year:", selectedYear); // Log tahun yang dikirim
      
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_HELP_DESK}/SPI/upload-file-excel`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            }
          );
    
          console.log("Response from server:", response.data);
    
          setMessage(
            <span>
              <i className="fa fa-check"></i>{" "}
              <font color="green">{response.data.message}</font>
            </span>
          );
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);
          setFile(null);
          setUploadProgress(0);
    
          Swal.fire({
            title: "Good job!",
            text: `Data berhasil di Upload untuk tahun ${selectedYear}`,
            icon: "success"
          });
    
        } catch (error) {
          console.error("Error during upload:", error.response?.data || error.message);
          setMessage(<font color="red">ERROR: {error.response?.data.error || 'Tidak dapat mengunggah file'}</font>);
          setShowMessage(true);
        }
      };
    

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
          alert("Hanya file XLS atau XLSX (Excel) yang diijinkan.");
        }
      };

      return (
        <div>
          <header>
            <h3>Import Data Stock</h3>
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
            <fieldset className="label_side" id="facnumber">
              <label>Template File Excel</label>
              <div className="clearfix">
                <a className="btn btn-success" href="http://localhost:3100/SPI/TemplateFileExcel">
                  Download Template
                </a>
              </div>
            </fieldset>
            <fieldset className="label_side" id="facnumber">
          <label>Select Year</label>
          <div className="clearfix">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy"
              showYearPicker
              className="form-control"
              placeholderText="Pilih Tahun"
            />
          </div>
        </fieldset>
            <fieldset
              className="label_side"
              id="facnumber"
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
                    style={{ display: "none" }}
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
                    {file ? file.name : "Drag & Drop file di sini atau Klik untuk memilih"}
                  </div>
                  <span className="input-group-btn">
                    <input
                      type="submit"
                      className="btn btn-info"
                      value="Upload"
                      title="Upload File Excel Stock"
                    />
                  </span>
                </div>
                <i>Format .XLS atau .XLSX (Excel)</i>
              </div>
            </fieldset>
          </form>
        </div>
      );
    };

    export default UploadFileExcelSpi;
