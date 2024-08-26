import React from "react";
import "../App.css"
import Navbar from "../Commponents/Navbar";
import Home from "../Commponents/Home";
import AboutRolesSection from "../Commponents/AboutRolesSection";

export default function AboutRoles() {
  return (
    <div>
      <Navbar />
      <Home />
      <AboutRolesSection />
    </div>
  );
}
