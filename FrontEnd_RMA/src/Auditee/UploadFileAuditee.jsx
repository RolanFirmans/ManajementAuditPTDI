import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import "../App.css";
import UploadNewFileAuditee from "./UploadNewFileAuditee";

const UploadFileAuditee = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isModalUpload, setIsModalUpload] = useState(false);
  const [isModalSearch, setIsModalSearch] = useState(false);
  const [placeholder, setPlaceholder] = useState("Loading...");
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedAuditees, setSelectedAuditees] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:3100/Auditee/upload-file")
  //     .then((response) => {
  //       setPlaceholder(
  //         response.data?.placeholder || "Exp: Backup & Restoration Management"
  //       );
  //     })
  //     .catch((error) => {
  //       console.error("There was an error fetching the data!", error);
  //       setPlaceholder("Exp: Backup & Restoration Management");
  //     });
  // }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3100/Auditee/search-file")
      .then((response) => {
        console.log('API Response:', response.data);
        if (Array.isArray(response.data)) {
          setData(response.data);
          setFiles(response.data);
        } else {
          console.error('Expected array, got:', response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);  
  
  // Filter data based on search query
  useEffect(() => {
    const filterData = () => {
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        return;
      }
  
      const lowerCaseQuery = searchQuery.toLowerCase();
      const result = data.filter(
        (item) =>
          item.i_audevdfile?.toLowerCase().includes(lowerCaseQuery) ||
          item.n_audevdfile_file?.toLowerCase().includes(lowerCaseQuery) ||
          item.e_audevdfile_desc?.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredData(result);
    };
  
    filterData();
  }, [searchQuery, data]);
  
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      await axios.post(
        `${import.meta.env.VITE_HELP_DESK}/SPI/upload-file-evidence`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("File uploaded successfully!");
      setFile(null);
      setDescription("");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setDescription("");
  };

  const handleUploadFile = () => setIsModalUpload(true);

  const handleSearchFile = () => setIsModalSearch(true);

  // const handleCheckboxChange = (userName) => {
  //   setSelectedAuditees(prev => ({
  //     ...prev,
  //     [userName]: !prev[userName]
  //   }));
  // };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleCheckboxChange = (file) => {
    setSelectedAuditees((prevSelected) => ({
      ...prevSelected,
      [file.i_audevdfile]: !prevSelected[file.i_audevdfile] ? file : null,
    }));
  };

  // const handleUpload1 = async () => {
  //   const selectedFile = Object.values(selectedAuditees).find(
  //     (file) => file !== null
  //   );
  
  //   if (!selectedFile) {
  //     alert("Please select a file to upload");
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append("file", selectedFile.file); // Pastikan menggunakan data file, bukan file_path
  
  //   try {
  //     await axios.post("http://localhost:3100/Auditee/search-file", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     alert("File uploaded successfully");
  //     setFile(null);
  //     setSelectedAuditees({});
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     alert("Failed to upload file");
  //   }
  // };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="upload-form">
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        UPLOAD FILE EVIDENCE
        <br />
        DATA & DOCUMENT NEEDED
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            placeholder={placeholder}
          />
        </div>
        <div className="form-group">
          <label htmlFor="file">Evidence:</label>
          <div className="file-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearchFile}
            >
              Search File
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUploadFile}
            >
              Upload New File
            </button>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <div>{file ? file.name : "No file selected"}</div>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-success">
            Save
          </button>
        </div>
      </form>

      {/* Modal untuk "Upload New File" */}
      <Modal
        isOpen={isModalUpload}
        onRequestClose={() => setIsModalUpload(false)}
        contentLabel="Upload New File Modal"
        className="user-modal"
        overlayClassName="user-modal-overlay"
      >
        <UploadNewFileAuditee />
      </Modal>

      {/* Modal untuk "Search File" */}
      <Modal
        isOpen={isModalSearch}
        onRequestClose={closeModal}
        contentLabel="Search File Modal"
        className="user-modal"
        overlayClassName="user-modal-overlay"
      >
        <div>
          <h1>Data List</h1>
          <button onClick={closeModal}>Close</button>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Select</th>
                <th>File Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.i_audevdfile}>
                      <td>{item.i_audevdfile}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selectedAuditees[item.i_audevdfile]}
                          onChange={() => handleCheckboxChange(item)}
                        />
                      </td>
                      <td>{item.n_audevdfile_file}</td>
                      <td>{item.e_audevdfile_desc}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}            
            </tbody>
          </table>
          <button>Upload File</button>
        </div>
      </Modal> 
    </div>
  );
};

export default UploadFileAuditee;
