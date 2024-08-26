import React, { useState } from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import LogoUser from "../Asset/user.png";
import "../App.css";
import DashboardSpi from "../SPI/DashboardSpi";
import UploadFileExcelSpi from "../SPI/UploadFileExcelSpi";
import EvidenceSpi from "../SPI/EvidenceSpi";
import DGCASpi from "../SPI/DgcaSpi";
import FinanceSpi from "../SPI/FinanceSpi";
import ItmlSpi from "../SPI/ItmlSpi";
import ParkerRusselSpi from "../SPI/ParkerRusselSpi";

const SpiSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardSpi");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdownSpi = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEvidenceSpiClick = () => {
    setActivePage("EvidenceSpi");
    toggleDropdownSpi();
  };

  const renderContent = () => {
    switch (activePage) {
      case "DashboardSpi":
        return <DashboardSpi />;
      case "UploadFileExcelSpi":
        return <UploadFileExcelSpi />;
      case "EvidenceSpi":
        return <EvidenceSpi />;
      case "DGCA":
        return <DGCASpi />;
      case "FINANCE":
        return <FinanceSpi />;
      case "ITML":
        return <ItmlSpi />;
      case "PARKER RUSSEL":
        return <ParkerRusselSpi />;
      default:
        return null;
    }
  };

  return (
    <div className={`spi-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">SPI</div>
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
            <ul className="menuSpi">
              <li onClick={() => setActivePage("DashboardSpi")}>Dashboard</li>
              <li onClick={() => setActivePage("UploadFileExcelSpi")}>
                Upload File Excel
              </li>
              <li
                className={`dropdownSpi ${isDropdownOpen ? "open" : ""}`}
                onClick={handleEvidenceSpiClick}
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

export default SpiSection;
