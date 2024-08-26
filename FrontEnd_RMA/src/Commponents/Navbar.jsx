import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoPTDI from "../Asset/LogoPTDI.png";
import "../Commponents/LoginSection";
import "../App.css";

const Navbar = () => {
  const navigate = useNavigate();

  const openLoginPage = () => {
    navigate("/login");
  };

  return (
    <header>
      <nav className="navbar">
        <div className="container">
          <img src={LogoPTDI} className="brand-logo" alt="Logo PTDI" />
          <ul className="nav-list">
            <li>
              <Link to="/">HOME</Link>
            </li>
            <li>
              <Link to="/About">ABOUT US</Link>
            </li>
            <li>
              <Link to="/AboutRoles">ABOUT AUDIT ROLES</Link>
            </li>
          </ul>
          <button onClick={openLoginPage} className="btn-login">
            Login
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
