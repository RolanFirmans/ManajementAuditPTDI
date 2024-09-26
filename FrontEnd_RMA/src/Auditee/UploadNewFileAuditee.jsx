import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import { CloudDownloadOutlined } from "@ant-design/icons";

const UploadFilePdf = () => {
  const [id, setId] = useState("");
  // const [tittle, setTittle] = useState("");  // This is not used in backend, so can be omitted if not needed
  const [file, setFile] = useState();
  const [description, setDescription] = useState("");

  const [msg, setMsg] = useState(""); // State for messages

  const upload = () => {
    const formData = new FormData();
    //   formData.append("id", id);
    formData.append("file", file); // Ensure field name is 'file' as expected by multer
    formData.append("key2", description);

    axios
      .post("http://localhost:3100/Auditee/test", formData)
      .then((response) => {
        console.log(response);
        if (response.data.message === "Test created successfully") {
          setMsg("File Successfully Uploaded");
        } else {
          setMsg("Error");
        }
      })
      .catch((er) => {
        console.error(er);
        setMsg("Error uploading file");
      });
  };

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="row">
        <h1 className="textUploadNewFile">Upload NewFile</h1>
        {/* <div className="col-12">
                  <label className="form-label">ID</label>
                  <input
                      type="text"
                      className="form-control"
                      placeholder='Enter ID'
                      autoComplete='off'
                      onChange={(e) => setId(e.target.value)}
                  />
              </div> */}
       <div className="col-12">
         
          
          {/* Input file yang disembunyikan */}
          <input
            type="file"
            style={{ display: 'none' }}  // Sembunyikan input
            id="fileUpload" 
            onChange={(e) => setFile(e.target.files[0])}
            
          />
          
          {/* Ikon yang berfungsi sebagai pengganti input file */}
          <label htmlFor="fileUpload" style={{ cursor: 'pointer' }} className="dragAuditee">
            {file ? (
              <span>{file.name}</span>  // Tampilkan nama file setelah di-upload
            ) : (     
              <CloudDownloadOutlined style={{ fontSize: '90px' }} />  // Tampilkan ikon jika tidak ada file
            )}
          </label>
      </div>

        <div className="col-12">
          <label className="formLabel">Description</label>
          <input
            type="text"
            className="formAuditee"
            placeholder="Enter Description"
            autoComplete="off"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btnUploadNewAuditee"
          onClick={upload}
          style={{ marginTop: "20px" }}
        >
          Upload
        </button>
        <h1
          style={{ fontSize: "15px", textAlign: "center", marginTop: "20px" }}
        >
          {msg}
        </h1>
      </div>
    </div>
  );

  // // const [file, setFile] = useState(null);
  // // const [description, setDescription] = useState("");
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [message, setMessage] = useState("");
  // const [showMessage, setShowMessage] = useState(false);
  // const [dragOver, setDragOver] = useState(false);

  // // const handleFileChange = (e) => {
  // //   const selectedFile = e.target.files[0];
  // //   setFile(selectedFile);
  // // };

  // const hasExtension = (fileName, exts) => {
  //   return new RegExp(`(${exts.join("|").replace(/\./g, "\\.")})$`).test(fileName);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!file || !hasExtension(file.name, [".pdf"])) {
  //     alert("Hanya file PDF yang diijinkan.");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("description", description);

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:3100/Auditee/upload-new-file",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //         onUploadProgress: (progressEvent) => {
  //           const percentCompleted = Math.round(
  //             (progressEvent.loaded * 100) / progressEvent.total
  //           );
  //           setUploadProgress(percentCompleted);
  //         },
  //       }
  //     );

  //     setMessage(
  //       <span>
  //         <i className="fa fa-check"></i>{" "}
  //         <font color="green">{response.data.message}</font>
  //       </span>
  //     );
  //     setShowMessage(true);
  //     setTimeout(() => setShowMessage(false), 3000);
  //     setFile(null);
  //     setUploadProgress(0);
  //   } catch (error) {
  //     setMessage(<font color="red">ERROR: {error.response?.data.error || 'unable to upload files'}</font>);
  //     setShowMessage(true);
  //   }
  // };

  // const handleDragOver = (e) => {
  //   e.preventDefault();
  //   setDragOver(true);
  // };

  // const handleDragLeave = () => {
  //   setDragOver(false);
  // };

  // // const handleDrop = (e) => {
  // //   e.preventDefault();
  // //   setDragOver(false);
  // //   const droppedFile = e.dataTransfer.files[0];
  // //   if (droppedFile && hasExtension(droppedFile.name, [".pdf"])) {
  // //     setFile(droppedFile);
  // //   } else {
  // //     // alert("Hanya file PDF yang diijinkan.");
  // //   }
  // // };

  // const handleCancel = () => {
  //   setFile(null);
  //   setDescription("");
  //   setUploadProgress(0);
  //   setMessage("");
  //   setShowMessage(false);
  // };

  //   return (
  //     <div>
  //       <header>
  //         <h3>UPLOAD NEW PDF FILE</h3>
  //       </header>
  //       <form
  //         id="FormPdfDoc"
  //         onSubmit={handleSubmit}
  //         encType="multipart/form-data"
  //       >
  //         <div className="row">
  //           <div className="col-md-12" style={{ padding: "10px 30px" }}>
  //             {showMessage && (
  //               <div id="result" className="alert alert-success">
  //                 {message}
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //         <fieldset
  //           className="label_side"
  //           id="facnumber"
  //           onDragOver={handleDragOver}
  //           onDragLeave={handleDragLeave}
  //           // onDrop={handleDrop}
  //           style={{
  //             border: dragOver ? "2px dashed #4CAF50" : "2px dashed #ddd",
  //             padding: "20px",
  //             textAlign: "center",
  //           }}
  //         >
  //           <label>Upload File</label>
  //           <div className="clearfix">
  //             <div className="input-group margin" style={{ width: "50%" }}>
  //               <input
  //                 type="file"
  //                 name="file"
  //                 id="file"
  //                 className="form-control"
  //                 onChange={(e) => setId(e.target.value)}
  //                 style={{ display: "none" }}
  //               />
  //               <div
  //                 onClick={() => document.getElementById("file").click()}
  //                 style={{
  //                   cursor: "pointer",
  //                   padding: "10px",
  //                   borderRadius: "5px",
  //                   backgroundColor: "#f1f1f1",
  //                 }}
  //               >
  //                 {file ? file.name : "Drag & Drop file here or Click to select"}
  //               </div>
  //             </div>
  //           </div>
  //         </fieldset>

  //         {/* Description Field */}
  //         <fieldset className="label_side" id="description">
  //           <label className="font-medium">DESCRIPTION</label>
  //           <textarea
  //             value={description}
  //             onChange={(e) => setDescription(e.target.value)}
  //             rows={3}
  //             className="textarea"
  //           />
  //         </fieldset>
  //         <fieldset className="label_side" id="progress">
  //           <label>Progress</label>
  //           <div className="clearfix">
  //             <div id="progress1">
  //               <div id="bar1" style={{ width: `${uploadProgress}%` }}></div>
  //               <div id="percent1">{uploadProgress}%</div>
  //             </div>
  //           </div>
  //         </fieldset>
  //         <div className="form-buttons">
  //           <button
  //             type="button"
  //             className="btn btn-secondary"
  //             onClick={handleCancel}
  //           >
  //             Cancel
  //           </button>
  //           <input
  //             type="submit"
  //             className="btn btn-info"
  //             value="Save"
  //             title="Save Data"
  //             style={{ marginLeft: "auto" }} // Align button to the right
  //             onClick={upload}
  //             />
  //         </div>
  //       </form>
  //     </div>
  //   );
};

export default UploadFilePdf;
