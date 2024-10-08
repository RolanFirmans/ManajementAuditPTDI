import React, { useState, useCallback } from 'react';
import LogoPTDI from '../Asset/LogoPTDI.png';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { HiOutlineLogout, HiChevronDown } from "react-icons/hi";
import Swal from 'sweetalert2';
import DataUser from '../Admin/DataUser';

import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';

const AdminSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

 
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSetActivePage = useCallback((page) => {
    setActivePage(page);
  }, []);

  const items = [
    {
      key: '1',
      icon: <HomeOutlined style={{fontSize:'20px'}} />,
      label: <span className="label-dashboard">Dashboard</span>,
      onClick: () => handleSetActivePage("Dashboard"),
    },
    {
      key: '2',
      icon: <UserOutlined style={{fontSize:'20px'}} />,
      label: <span className="label-datauser">Data User</span>,
      onClick: () => handleSetActivePage("Data User"),
    }
  ];
  

  const renderContent = () => {
    if (activePage === "Dashboard") {
      return <Dashboard />;
    } else if (activePage === "Data User") {
      return <DataUser />;
    }
  };

  const toggleUserDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
    <div className={`admin-section ${isCollapsed ? "collapsed" : ""}`}>
      <header className="header">
        <div className="logo-container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo" />
          <div className="SideNav-text">AUDIT</div>
        </div>
       
        <button
     
            onClick={toggleCollapsed}
            style={{
              marginBottom: -7,
            }}
            className="hamburger"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        <div className="user-info relative inline-block">
          <div
            className="flex items-center cursor-pointer text-white"
            onClick={toggleUserDropdown}
          >
            <span className="mr-1">Hallo, Admin!</span>
            <HiChevronDown size={16} />
          </div>
          {isDropdownOpen && (
            <div className="absolute">
            <button
              onClick={handleLogout}
              className="buttonLogOutAdmin"
            >
              <HiOutlineLogout size={26} color='black' />
              Logout
            </button>
          </div>
          
          )}
        </div>
      </header>
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
            theme='dark'
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

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-content">{/* Konten dashboard */}</div>
    </div>
  );
};

export default AdminSection;