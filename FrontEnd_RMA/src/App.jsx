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

const host = window.location.host;
let apiurl;

if (host === '10.1.99.71' || host === 'localhost' || host === 'https://helpdesk-api.indonesian-aerospace.com/general/employee') {
  apiurl = process.env.REACT_APP_API_URL; // URL untuk development
} else if (host === '10.1.94.88' || host === 'audit-test') {
  apiurl = process.env.REACT_APP_API_URL; // URL untuk testing
} else if (host === '10.1.0.15' || host === 'audit.indonesian-aerospace.com') {
  apiurl = process.env.REACT_APP_API_URL; // URL untuk production
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="About" element={<About />} />
        <Route path="AboutRoles" element={<AboutRoles />} />
        <Route path="Login" element={<Login />} />
        <Route path="Admin" element={<Admin />} />
        <Route path="AdminAuditIT" element={<AdminAuditIT />} />
        <Route path="SPI" element={<SPI />} />
        <Route path="Auditor" element={<Auditor />} />
        <Route path="Auditee" element={<Auditee />} />
        <Route path="DataKaryawan" element={<DataKaryawan />} />
      </Routes>
    </div>
  );
}

export { apiurl };
export default App;
