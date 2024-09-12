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

  useEffect(() => {
    axios
      .get("http://localhost:3100/Auditee/upload-file")
      .then((response) => {
        setPlaceholder(
          response.data?.placeholder || "Exp: Backup & Restoration Management"
        );
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
        setPlaceholder("Exp: Backup & Restoration Management");
      });
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3100/Auditee/get-test"
        );
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [isModalSearch]);

  useEffect(() => {
    const filterData = () => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const result = files.filter(
        (item) =>
          item.n_audusr_usrnm?.toLowerCase().includes(lowerCaseQuery) ||
          item.n_audusr_nm?.toLowerCase().includes(lowerCaseQuery) ||
          item.organisasi?.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredData(result);
    };

    filterData();
  }, [searchQuery, files]);

  useEffect(() => {
    axios
      .get("http://localhost:3100/Auditee/get-test")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

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
      [file.id]: !prevSelected[file.id] ? file : null,
    }));
  };

  const handleUpload1 = async () => {
    // Cek apakah ada file yang dipilih
    const selectedFile = Object.values(selectedAuditees).find(
      (file) => file !== null
    );

    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile.file_path); // Gunakan path file terpilih dari checkbox

    try {
      await axios.post("http://localhost:3100/Auditee/test", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully");
      setFile(null);
      setSelectedAuditees({}); // Reset state setelah upload
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

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
        onRequestClose={() => setIsModalSearch(false)}
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
                {/* Tambahkan kolom Select */}
                <th>File Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedAuditees[item.id]} // Mengecek apakah file sudah dipilih
                      onChange={() => handleCheckboxChange(item)} // Handle perubahan checkbox
                    />
                  </td>
                  <td>{item.file_path}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleUpload1}>Upload File</button>
        </div>
      </Modal>
    </div>
  );
};

export default UploadFileAuditee;
