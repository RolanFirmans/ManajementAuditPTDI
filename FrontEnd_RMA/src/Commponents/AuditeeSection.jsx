import React, { useState } from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import LogoUser from "../Asset/user.png";
import "../App.css";
import DashboardAuditee from "../Auditee/DashboardAuditee";
import DgcaAuditee from "../Auditee/DgcaAuditee";
import EvidenceAuditee from "../Auditee/EvidanceAuditee";
import FinanceAuditee from "../Auditee/FinanceAuditee";
import ItmlAuditee from "../Auditee/ItmlAuditee";
import ParkerRusselAuditee from "../Auditee/ParkerRusselAuditee";

const AuditeeSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardAuditee");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdownSpi = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEvidenceClick = () => {
    setActivePage("EvidenceAuditee ");
    toggleDropdownSpi();
  };

  const renderContent = () => {
    switch (activePage) {
      case "DashboardAuditee":
        return <DashboardAuditee />;
      case "EvidenceAuditee ":
        return <EvidenceAuditee />;
      case "DGCA":
        return <DgcaAuditee />;
      case "FINANCE":
        return <FinanceAuditee />;
      case "ITML":
        return <ItmlAuditee />;
      case "PARKER RUSSEL":
        return <ParkerRusselAuditee />;
      default:
        return null;
    }
  };

  return (
    <div className={`Auditee-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">Auditee</div>
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
            <ul className="menuAuditee">
              <li onClick={() => setActivePage("DashboardAuditee")}>
                Dashboard
              </li>
              <li
                className={`dropdownSpi ${isDropdownOpen ? "open" : ""}`}
                onClick={handleEvidenceClick}
              >
                Evidence
                {isDropdownOpen && (
                  <ol
                    className="submenuSpi"
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

export default AuditeeSection;
