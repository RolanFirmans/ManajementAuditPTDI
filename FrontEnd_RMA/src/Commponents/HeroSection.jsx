import React from 'react'
import q from '../Asset/q.jpg'
import w from '../Asset/w.jpg'
import e from '../Asset/e.jpg'
import '../App.css'


const HeroSection = () => {
  return (
    
    <div className="hero-section">
    <h1>WELLCOME TO AUDIT!</h1>
    <div className="hero-images">
      <img src={q} alt="" />
      <img src={w} alt="" />
      <img src={e} alt="" />
    </div>
    <div className="company-info">
      <h2>PT DIRGANTARA INDONESIA</h2>
      <p>Jl. Pajajaran No 154, Bandung 40174, Indonesia</p>
    </div>
  </div>
 
  )
}

export default HeroSection;