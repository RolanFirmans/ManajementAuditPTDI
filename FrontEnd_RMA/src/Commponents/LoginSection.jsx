import React, { useState, useContext } from "react";
import Modal from "react-modal";
import ImgLogin from "../Asset/ImgLogin.jpg";
import { useNavigate, useLocation } from 'react-router-dom';
import "../App.css";
import Swal from 'sweetalert2';
import { AuthContext } from "./AuthContext"; // Asumsikan Anda memiliki AuthContext

Modal.setAppElement("#root");

export default function LoginSection() {
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Gunakan context untuk mengatur status autentikasi
  const location = useLocation();
  const [nik, setNik] = useState("");
  const [confirmNik, setConfirmNik] = useState("");
  const closeModal = () => setModalIsOpen(false);

  const handleLogin = () => {
    login(); // Fungsi login dari AuthContext
    const destination = location.state?.from?.pathname || '/Admin';
    navigate(destination, { replace: true });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nik, confirmNik }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat login');
      }

      // Simpan token di localStorage
      localStorage.setItem('token', data.token);
    
      // Panggil fungsi login dari AuthContext
      login();

      // Arahkan pengguna berdasarkan peran
      switch (String(data.user.role)) { // Memastikan perbandingan dalam bentuk string
        case "1":
          Swal.fire({
            title: "Good job!",
            text: "Welcome, Admin!",
            icon: "success"
          });
          navigate("/Admin");
          break;
        case "2":
          Swal.fire({
            title: "Good job!",
            text: "Welcome, Auditee!",
            icon: "success"
          });
          navigate("/Auditee");
          break;
        case "3":
          Swal.fire({
            title: "Good job!",
            text: "Welcome, SPI!",
            icon: "success"
          });
          navigate("/Spi");
          break;
        case "4":
          Swal.fire({
            title: "Good job!",
            text: "Welcome, Admin Audit IT!",
            icon: "success"
          });
          navigate("/AdminAuditIt");
          break;
        default:
          Swal.fire({
            title: "Welcome!",
            text: "You've successfully logged in.",
            icon: "success"
          });
          navigate("/Dashboard");
      }      
      closeModal();
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="ImgLogin">
      <img src={ImgLogin} alt="Login" />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nik">NIK:</label>
            <input
              type="username"
              id="nik"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNik">Password:</label>
            <input
              type="password"
              id="confirmNik"
              value={confirmNik}
              onChange={(e) => setConfirmNik(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </Modal>
    </div>
  );
}