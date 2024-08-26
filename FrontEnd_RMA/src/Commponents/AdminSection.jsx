

import React, { useState } from 'react';
import LogoPTDI from '../Asset/LogoPTDI.png';
import "../App.css";
import LogoUser from "../Asset/user.png";
import DataUser from '../Admin/DataUser';

const AdminSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderContent = () => {
    if (activePage === "Dashboard") {
      return <Dashboard />;
    } else if (activePage === "Data User") {
      return <DataUser />;
    }
  };

  return (
    <div className={`admin-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">AUDIT</div>
        </div>
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="user-info">
          <p className="user-name">USER</p>
          <img src={LogoUser} alt="User" className="user-image" />
          <button className="logout-button">Log Out</button>
        </div>
      </header>
      <div className="content-wrapper">
        <div className={`side-nav ${isCollapsed ? "collapsed" : ""}`}>
          <nav>
            <ul>
              <li onClick={() => setActivePage("Dashboard")}>Dashboard</li>
              <li onClick={() => setActivePage("Data User")}>Data User</li>
            </ul>
          </nav>
        </div>
        <main className="main-content">{renderContent()}</main>
      </div>
   
    </div>
  );
};

// DASHBOARD
const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-content">{/* Konten dashboard */}</div>
    </div>
  );
};

// DATA USER


export default AdminSection;
