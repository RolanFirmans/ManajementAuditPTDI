import React, { useState } from "react";
import Modal from "react-modal";
import ImgLogin from "../Asset/ImgLogin.jpg";
import { useNavigate } from "react-router-dom";
import "../App.css";

Modal.setAppElement("#root");

export default function LoginSection() {
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [nik, setNik] = useState("");
  const [confirmNik, setConfirmNik] = useState("");
  const closeModal = () => setModalIsOpen(false);

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

      // Arahkan pengguna berdasarkan peran
      switch (data.user.role) {
        case 1:
          alert("Welcome, Admin!");
          navigate("../Admin");
          break;
        case 2:
          alert("Welcome, Auditee!");
          navigate("../Auditee");
          break;
        case 3:
          alert("Welcome, SPI!");
          navigate("../Spi");
          break;
        case 4:
          alert("Welcome, Admin Audit IT!");
          navigate("../AdminAuditIt");
          break;
        default:
          alert("Welcome!");
          navigate("../Dashboard");
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
            <label htmlFor="confirmNik">Konfirmasi NIK:</label>
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