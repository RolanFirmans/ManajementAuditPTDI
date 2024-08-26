import React from "react";
import '../App.css';
import Navbar from "../Commponents/Navbar";
import Home from "../Commponents/Home";
import AboutUsSection from "../Commponents/AboutUsSection";

export default function About() {
  return (
    <div>
      <Navbar />
      <Home />
      <AboutUsSection />
    </div>
  );
}
