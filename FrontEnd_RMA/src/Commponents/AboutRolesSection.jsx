import React from "react";
import AboutRoles from "../Asset/AboutRoles.jpg";
import "../App.css";

const AboutRolesSection = () => {
  return (
    <div className="aboutroles-section">
      <h1>ABOUT AUDIT ROLES</h1>
      <p>About Roles in an audit context can be described as follows:</p>
      <div className="aboutroles-images">
        <div className="card">
          <img src={AboutRoles} alt="" />
          <p>
            Admin adalah pengguna dengan hak akses penuh untuk mengelola
            pengguna, konfigurasi sistem, dan mendukung pengguna lain. Tujuannya
            adalah memastikan sistem berjalan dengan lancar dan aman serta
            mendukung seluruh pengguna dalam menggunakan sistem audit dengan
            efektif.
          </p>
        </div>
        <div className="card">
          <img src={AboutRoles} alt="" />
          <p>
            Admin Audit IT adalah pengguna yang memiliki hak akses khusus untuk
            mengelola dan menampilkan data audit. Tujuannya adalah memastikan
            kelancaran proses audit dengan mengelola data dan tanggung jawab
            auditor serta memastikan data yang diunggah lengkap dan sesuai
            sebelum mengirimkannya ke pihak terkait.
          </p>
        </div>

        <div className="card">
          <img src={AboutRoles} alt="" />
          <p>
            Auditee adalah entitas atau pengguna yang diaudit, bertanggung jawab
            menyediakan dokumen dan data relevan untuk audit. Tujuannya adalah
            memastikan semua dokumen dan evidence tersedia untuk proses audit
            dan mendukung auditor dengan informasi yang diperlukan.
          </p>
        </div>

        <div className="card">
          <img src={AboutRoles} alt="" />
          <p>
            SPI adalah pengguna yang bertanggung jawab mengunggah dan
            mengonfirmasi dokumen awal yang diperlukan untuk audit (file excel).
            Tujuannya adalah memastikan dokumen awal yang diperlukan telah
            diunggah dan divalidasi, menyediakan dokumen yang akurat dan valid
            untuk memulai proses audit.
          </p>
        </div>
      </div>
      <div className=""></div>
    </div>
  );
};

export default AboutRolesSection;
