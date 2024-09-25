import React from "react";
import './App.css';
import Login from "../src/Login/Login.jsx";
import LandingPage from "./LandingPage/LandingPage.jsx";
import About from "./LandingPage/About.jsx";
import AboutRoles from "./LandingPage/AboutRoles.jsx";
import { Route, Routes } from "react-router-dom";
import Admin from "./Admin/Admin.jsx";
import AdminAuditIT from "./Admin Audit IT/AdminAuditIT.jsx";
import SPI from "./SPI/SPI.jsx";
import Auditor from "./Auditor/Auditor.jsx";
import Auditee from "./Auditee/Auditee.jsx";
import DataKaryawan from "./Admin/DataKaryawan.jsx";
import ProtectedRoute from "../src/Commponents/ProtectedRoute.jsx";
import { AuthProvider, AuthContext } from "../src/Commponents/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/About" element={<About />} />
          <Route path="/AboutRoles" element={<AboutRoles />} />
          <Route path="/Login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/Admin" element={<Admin />} />
            <Route path="/AdminAuditIT" element={<AdminAuditIT />} />
            <Route path="/SPI" element={<SPI />} />
            <Route path="/Auditor" element={<Auditor />} />
            <Route path="/Auditee" element={<Auditee />} />
            <Route path="/DataKaryawan" element={<DataKaryawan />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;