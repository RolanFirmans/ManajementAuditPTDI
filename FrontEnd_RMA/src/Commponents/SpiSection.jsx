import React, { useState } from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import { HiOutlineLogout, HiChevronDown } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import "../App.css";
import DashboardSpi from "../SPI/DashboardSpi";
import UploadFileExcelSpi from "../SPI/UploadFileExcelSpi";
import EvidenceSpi from "../SPI/EvidenceSpi";
import DGCASpi from "../SPI/DgcaSpi";
import FinanceSpi from "../SPI/FinanceSpi";
import ItmlSpi from "../SPI/ItmlSpi";
import ParkerRusselSpi from "../SPI/ParkerRusselSpi";
import Swal from 'sweetalert2';

import {
  MailOutlined,
  HomeOutlined,
  UploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';


const SpiSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardSpi");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const items = [
    {
      key: '1',
      icon: <HomeOutlined style={{fontSize: '20px' }}/>,
      label: 'Dashboard',
      onClick: () => setActivePage("DashboardSpi")
    },
    {
      key: '2',
      icon: <UploadOutlined style={{fontSize: '20px' }} />,
      label: 'Upload File',
      onClick: () => setActivePage("UploadFileExcelSpi")
    },
    {
      key: '3',
      label: 'Evidence',
      icon: <FileOutlined />,
      onClick: () => setActivePage("EvidenceSpi")
    },
    { 
      key: 'sub1',
      label: 'Organisasi',
      icon: <MailOutlined />,
      children: [
        { key: '5', label: 'DGCA', onClick: () => setActivePage("DGCA") },
        { key: '6', label: 'FINANCE', onClick: () => setActivePage("FINANCE") },
        { key: '7', label: 'ITML', onClick: () => setActivePage("ITML") },
        { key: '8', label: 'PARKER RUSSEL', onClick: () => setActivePage("PARKER RUSSEL") }
      ],
    },
  ];

  


  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

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
  const toggleUserDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  const handleLogout = () => {
    Swal.fire({
      title: "Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Berhasil Keluar",
          text: "Anda keluar dari halaman ini",
          icon: "success",
        }).then(() => {
          navigate('/');
        });
      }
    });
  };

  return (
    <div className={`spi-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">SPI</div>
        </div>
         
        <Button
            type="primary"
            onClick={toggleCollapsed}
            style={{
              marginBottom: -7,
            }}
            className="hamburger"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <div className="user-info relative inline-block">
          <div
            className="flex items-center cursor-pointer text-white"
            onClick={toggleUserDropdown}
          >
            <span className="mr-1">Hallo, SPI!</span>
            <HiChevronDown size={16} />
          </div>
          {isDropdownOpen && (
            <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <HiOutlineLogout size={20} className="mr-2 text-gray-800" /> 
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* <div className="content-wrapper">
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
      </div> */}
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: collapsed ? 80 : 256,
            transition: 'width 0.3s',
          }}
        >
          
          <Menu
            className='menu-bar'
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            inlineCollapsed={collapsed}
            items={items}
          />
        </div>
        <main className="main-content" style={{ flex: 1, padding: '20px' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SpiSection;
