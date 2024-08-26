import React, { useState } from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import LogoUser from "../Asset/user.png";
import "../App.css";
import DashboardAuditor from "../Auditor/DashboardAuditor";
import DgcaAuditor from "../Auditor/DgcaAuditor";
import EvidenceAuditor from "../Auditor/EvidanceAuditor";
import FinanceAuditor from "../Auditor/FinanceAuditor";
import ItmlAuditor from "../Auditor/ItmlAuditor";
import ParkerRusselAuditor from "../Auditor/ParkerRusselAuditor";

const AuditorSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardAuditor");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdownAuditor = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEvidenceClick = () => {
    setActivePage("EvidenceAuditor");
    toggleDropdownAuditor();
  };

  const renderContent = () => {
    switch (activePage) {
      case "DashboardAuditor":
        return <DashboardAuditor />;
      case "EvidenceAuditor":
        return <EvidenceAuditor />;
      case "DGCA":
        return <DgcaAuditor />;
      case "FINANCE":
        return <FinanceAuditor />;
      case "ITML":
        return <ItmlAuditor />;
      case "PARKER RUSSEL":
        return <ParkerRusselAuditor />;
      default:
        return null;
    }
  };

  return (
    <div className={`Auditor-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">Auditor</div>
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
            <ul className="menuAuditor">
              <li onClick={() => setActivePage("DashboardAuditor")}>
                Dashboard
              </li>
              <li
                className={`dropdownAuditor ${isDropdownOpen ? "open" : ""}`}
                onClick={handleEvidenceClick}
              >
                Evidence
                {isDropdownOpen && (
                  <ol
                    className="submenuAuditor"
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

export default AuditorSection;
