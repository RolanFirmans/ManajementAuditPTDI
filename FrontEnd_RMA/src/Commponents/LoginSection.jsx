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
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const closeModal = () => setModalIsOpen(false);

  // Username dan password admin yang di tanam di kode
  const adminUsername = "admin"; // NIK admin
  const adminPassword = "admin123"; // Password admin

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Cek apakah kedua NIK dan password diisi
    if (!nik && !password) {
      console.log("Both fields are empty");
      Swal.fire({
        title: "Error!",
        text: "Kedua Username dan password harus diisi.",
        icon: "error"
      });
      setError("Kedua Username dan password harus diisi.");
      return; // Menghentikan eksekusi lebih lanjut
    }

    // Cek apakah NIK dan Password sesuai dengan admin
    if (nik === adminUsername && password === adminPassword) {
      localStorage.setItem('token', 'dummy_token_admin'); // Token dummy untuk admin
      login(); // Panggil fungsi login dari AuthContext
      Swal.fire({
        title: "Good job!",
        text: "Welcome, Admin!",
        icon: "success"
      });
      navigate("/Admin");
      closeModal();
      return; // Menghentikan eksekusi lebih lanjut
    }

    // Jika bukan admin, coba login melalui API
    try {
      const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nik, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Cek untuk kesalahan khusus dari API
        switch (data.error) {
          case 'Username tidak valid':
            Swal.fire({
              title: "Error!",
              text: "Username yang Anda masukkan salah.",
              icon: "error"
            });
            setError("NIK salah.");
            break;
          case 'Password salah':
            Swal.fire({
              title: "Error!",
              text: "Password yang Anda masukkan salah.",
              icon: "error"
            });
            setError("Password salah.");
            break;
          
          default:
            // Untuk kesalahan umum
            Swal.fire({
              title: "Error!",
              text: "Terjadi kesalahan saat login.",
              icon: "error"
            });
            setError("Terjadi kesalahan saat login.");
        }
        return; // Menghentikan eksekusi lebih lanjut jika terdapat error
      }

      // Simpan token di localStorage
      localStorage.setItem('token', data.token);
      login(); // Panggil fungsi login dari AuthContext

      // Arahkan pengguna berdasarkan peran
      switch (String(data.user.role)) {
        case "1":
          Swal.fire("Good job!", "Welcome, Admin!", "success");
          navigate("/Admin");
          break;
        case "2":
          Swal.fire("Good job!", "Welcome, Auditee!", "success");
          navigate("/Auditee");
          break;
        case "3":
          Swal.fire("Good job!", "Welcome, SPI!", "success");
          navigate("/Spi");
          break;
        case "4":
          Swal.fire("Good job!", "Welcome, Admin Audit IT!", "success");
          navigate("/AdminAuditIt");
          break;
        default:
          Swal.fire("Welcome!", "You've successfully logged in.", "success");
          navigate("/Dashboard");
      }
      closeModal();
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat login.",
        icon: "error"
      });
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
            <label htmlFor="nik">Username:</label>
            <input
              type="text" // Tipe input untuk NIK
              id="nik"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </Modal>
    </div>
  );
}
