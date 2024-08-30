import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UploadFileExcelSpi = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dragOver, setDragOver] = useState(false);
  const [description, setDescription] = useState(""); // Added state for description

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3100/SPI/upload-file-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('File saved successfully:', result);
      alert('Data sudah terupload!');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const hasExtension = (fileName, exts) => {
    return new RegExp(`(${exts.join("|").replace(/\./g, "\\.")})$`).test(fileName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !hasExtension(file.name, [".xls", ".xlsx"])) {
      alert("Hanya file XLS atau XLSX (Excel) yang diijinkan.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description); // Include description in form data

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/SPI/upload-file-excel-spi`,
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
    } catch (error) {
      setMessage(<font color="red">ERROR: {error.response?.data.error || 'unable to upload files'}</font>);
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
