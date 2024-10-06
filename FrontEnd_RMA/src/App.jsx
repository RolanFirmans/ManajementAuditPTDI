import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./Commponents/AuthContext";
import ProtectedRoute from "./Commponents/ProtectedRoute";

// Import komponen halaman
import Login from "./Login/Login";
import LandingPage from "./LandingPage/LandingPage";
import About from "./LandingPage/About";
import AboutRoles from "./LandingPage/AboutRoles";
import Admin from "./Admin/Admin";
import AdminAuditIT from "./Admin Audit IT/AdminAuditIT";
import SPI from "./SPI/SPI";
import Auditor from "./Auditor/Auditor";
import Auditee from "./Auditee/Auditee";
import DataKaryawan from "./Admin/DataKaryawan";

const App = () => {
  return (
    <AuthProvider>
   
        <Routes>
          {/* Rute publik */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/About" element={<About />} />
          <Route path="/AboutRoles" element={<AboutRoles />} />
          <Route path="/Login" element={<Login />} />

          {/* Rute terproteksi */}
          <Route element={<ProtectedRoute />}>
            <Route path="/Admin" element={<Admin />} />
            <Route path="/AdminAuditIT" element={<AdminAuditIT />} />
            <Route path="/SPI" element={<SPI />} />
            <Route path="/Auditor" element={<Auditor />} />
            <Route path="/Auditee" element={<Auditee />} />
            <Route path="/DataKaryawan" element={<DataKaryawan />} />
          </Route>

          {/* Redirect untuk rute yang tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
   
    </AuthProvider>
  );
};

export default App;