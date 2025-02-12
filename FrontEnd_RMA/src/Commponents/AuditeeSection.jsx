import React, { useState, useEffect} from "react";
import LogoPTDI from "../Asset/LogoPTDI.png";
import LogoUser from "../Asset/user.png";
import "../App.css";
import { HiOutlineLogout, HiChevronDown } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";
import DashboardAuditee from "../Auditee/DashboardAuditee";
import DgcaAuditee from "../Auditee/DgcaAuditee";
import EvidenceAuditee from "../Auditee/EvidanceAuditee";
import FinanceAuditee from "../Auditee/FinanceAuditee";
import ItmlAuditee from "../Auditee/ItmlAuditee";
import ParkerRusselAuditee from "../Auditee/ParkerRusselAuditee";
import Swal from 'sweetalert2';

import {
  MailOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { NineKPlusSharp } from "@mui/icons-material";

const AuditeeSection = () => {
  const { nik } = useParams(); // Ambil NIK dari URL
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("DashboardAuditee");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const items = [
    {
      key: '1',
      icon: <HomeOutlined style={{fontSize: '20px' }}/>,
      label: 'Dashboard',
      onClick: () => setActivePage("DashboardAuditee")
    },
    {
      key: '2',
      label: 'Evidence',
      icon: <FileOutlined />,
      onClick: () => setActivePage("EvidenceAuditee")
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

  useEffect(() => {
    // Tampilkan pesan selamat datang saat halaman dimuat
    Swal.fire({
        title: "Selamat Datang!",
        text: `Anda Masuk Sebagai, Auditee ${nik}! `,
        icon: "success"
    });
  }, [nik]);
  
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleUserDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // const handleEvidenceClick = () => {
  //   setActivePage("EvidenceAuditee ");
  //   toggleDropdownSpi();
  // };

  const renderContent = () => {
    switch (activePage) {
      case "DashboardAuditee":
        return <DashboardAuditee />;
      case "EvidenceAuditee":
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

  async function fetchAuditeeData(nik) {
    const response = await axios.get (`${import.meta.env.VITE_HELP_DESK}/AuditIT/data/${nik}`, {
        headers: {
            'Authorization': `Bearer ${your_jwt_token}`, // Sertakan token jika diperlukan
        },
    });

    if (!response.ok) {
        throw new Error('Data tidak ditemukan');
    }

    const data = await response.json();
    // Tampilkan data di halaman
    console.log(data);
  }

  // Panggil fungsi dengan NIK yang sesuai
  fetchAuditeeData('your_nik');


  return (
    <div className={`Auditee-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">Auditee</div>
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
            <span className="mr-1">Hallo, Auditee {nik}!</span>
            <HiChevronDown size={16} />
          </div>
          {isDropdownOpen && (
            <div className="absolute">
              <button
                onClick={handleLogout}
                className="buttonLogOutAuditee"
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

export default AuditeeSection;
