import React, { useState } from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import LogoUser from "../Asset/user.png";
import "../App.css";
import { HiOutlineLogout, HiChevronDown } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import DashboardAait from "../Admin Audit IT/DashboardAait";
import DgcaAait from "../Admin Audit IT/DgcaAait";
import EvidenceAait from "../Admin Audit IT/EvidanceAait";
import FinanceAait from "../Admin Audit IT/FinanceAait";
import ItmlAait from "../Admin Audit IT/ItmlAait";
import ParkerRusselAait from "../Admin Audit IT/ParkerRusselAait";
import Swal from 'sweetalert2';

import {
  MailOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';

const AdminAuditITSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardAait");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const items = [
    {
      key: '1',
      icon: <HomeOutlined style={{fontSize: '20px' }}/>,
      label: 'Dashboard',
      onClick: () => setActivePage("DashboardAait")
    },
    {
      key: '2',
      label: 'Evidence',
      icon: <FileOutlined />,
      onClick: () => setActivePage("EvidenceAait")
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

  const toggleDropdownAdminAuditIt = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleUserDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  // const handleEvidenceClick = () => {
  //   setActivePage("EvidenceAait");
  //   toggleDropdownAdminAuditIt();
  // };

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
            <span className="mr-1">Hallo, Admin Audit IT!</span>
            <HiChevronDown size={16} />
          </div>
          {isDropdownOpen && (
            <div className="absolute">
              <button
                onClick={handleLogout}
                className="buttonLogOutAdminIT"
              >
                <HiOutlineLogout size={20} className="mr-2 text-gray-800" /> 
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* <div className="contentAAIS-wrapper">
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
            theme="dark"
          />
        </div>
        <main className="main-content" style={{ flex: 1, padding: '20px' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminAuditITSection;
