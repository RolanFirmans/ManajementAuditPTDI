import React, { useState } from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import LogoUser from "../Asset/user.png";
import "../App.css";
import DashboardAait from "../Admin Audit IT/DashboardAait";
import DgcaAait from "../Admin Audit IT/DgcaAait";
import EvidenceAait from "../Admin Audit IT/EvidanceAait";
import FinanceAait from "../Admin Audit IT/FinanceAait";
import ItmlAait from "../Admin Audit IT/ItmlAait";
import ParkerRusselAait from "../Admin Audit IT/ParkerRusselAait";

const AdminAuditITSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardAait");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdownAdminAuditIt = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEvidenceClick = () => {
    setActivePage("EvidenceAait");
    toggleDropdownAdminAuditIt();
  };

  const renderContent = () => {
    switch (activePage) {
      case "DashboardAait":
        return <DashboardAait />;
      case "EvidenceAait":
        return <EvidenceAait />;
      case "DGCA":
        return <DgcaAait />;
      case "FINANCE":
        return <FinanceAait />;
      case "ITML":
        return <ItmlAait />;
      case "PARKER RUSSEL":
        return <ParkerRusselAait />;
      default:
        return null;
    }
  };

  return (
    <div className={`AdminAuditIt-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">Admin Audit It</div>
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

      <div className="contentAAIS-wrapper">
        <div className={`sideAAIS-nav ${isCollapsed ? "collapsed" : ""}`}>
          <nav>
            <ul className="menuAAIS">
              <li onClick={() => setActivePage("DashboardAait")}>Dashboard</li>
              <li
                className={`dropdownAIIS ${isDropdownOpen ? "open" : ""}`}
                onClick={handleEvidenceClick}
              >
                Evidence
                {isDropdownOpen && (
                  <ol
                    className="submenuAIIS"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <li onClick={() => setActivePage("DGCA")}>DGCA</li>
                    <li onClick={() => setActivePage("FINANCE")}>FINANCE</li>
                    <li onClick={() => setActivePage("ITML")}>ITML</li>
                    <li onClick={() => setActivePage("PARKER RUSSEL")}>
                      PARKER RUSSEL
                    </li>
                  </ol>
                )}
              </li>
            </ul>
          </nav>
        </div>
        <main className="main-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminAuditITSection;
