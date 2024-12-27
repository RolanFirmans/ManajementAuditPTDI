import React from "react";
import q from "../Asset/q.jpg";
import "../App.css";

const AboutUsSection = () => {
  return (
    <div className="aboutroles-section">
      <h1>COMPANY OVERVIEW</h1>
      <div className="about">
        <div className="about-images">
          <img src={q} alt="Company Image" class="circle-image" />
        </div>
        <div class="vertical-line"></div>
        <div className="company-overview">
          <h2>PT DIRGANTARA INDONESIA</h2>
          <p>
            PT Dirgantara Indonesia, juga dikenal sebagai PTDI, adalah salah
            satu perusahaan aerospace terkemuka di Asia dengan kompetensi inti
            dalam desain dan pengembangan pesawat, pembuatan struktur pesawat,
            produksi pesawat, dan layanan pesawat untuk keperluan sipil dan
            militer, termasuk pesawat ringan dan menengah. Sejak didirikan pada
            tahun 1978 sebagai perusahaan milik negara di Bandung, Indonesia,
            PTDI telah berhasil mengembangkan dan memperluas kemampuannya
            sebagai industri kedirgantaraan. Di bidang pembuatan pesawat, PTDI
            telah memproduksi berbagai jenis pesawat, seperti CN235 untuk
            transportasi sipil atau militer, Pesawat Surveillance Maritim,
            Pesawat Patroli Maritim, dan Pesawat Penjaga Pantai. Secara total,
            PTDI telah mengirimkan hampir 400 pesawat ke 50 operator di seluruh
            dunia. Di bawah perjanjian kerjasama strategis dengan Airbus Defense
            & Space, Spanyol, PTDI mengembangkan dan memproduksi NC212i (versi
            perbaikan NC212-400), memproduksi komponen CN235 dan CN295 untuk
            diekspor ke Airbus Defense & Space, serta melakukan Light Final
            Assembly and Delivery. PTDI juga terlibat dalam berbagai proyek
            inovatif lainnya dan bekerja sama dengan perusahaan global untuk
            terus mengembangkan teknologi kedirgantaraan. Perusahaan ini
            berkomitmen untuk memberikan solusi kedirgantaraan yang berkualitas
            tinggi dan memenuhi kebutuhan pelanggan di seluruh dunia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSection;
