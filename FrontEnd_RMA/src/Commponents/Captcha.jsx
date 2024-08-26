// import React, { useState, useEffect } from "react";

// const Captcha = ({ onVerify }) => {
//   const [num1, setNum1] = useState(0);
//   const [num2, setNum2] = useState(0);
//   const [userInput, setUserInput] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     generateCaptcha();
//   }, []);

//   const generateCaptcha = () => {
//     const rand1 = Math.floor(Math.random() * 10);
//     const rand2 = Math.floor(Math.random() * 10);
//     setNum1(rand1);
//     setNum2(rand2);
//     setUserInput("");
//     setError("");
//   };

//   const handleChange = (e) => {
//     setUserInput(e.target.value);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (parseInt(userInput) === num1 + num2) {
//       onVerify(true);
//     } else {
//       setError("Captcha tidak valid. Coba lagi.");
//       onVerify(false);
//       generateCaptcha();
//     }
//   };

//   return (
//     <div>
//       <p>
//         Selesaikan Captcha: {num1} + {num2} = ?
//       </p>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="number"
//           value={userInput}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Verifikasi</button>
//       </form>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default Captcha;
