import React, { useState, useEffect } from 'react';
import "../App.css";

// const DataKaryawan = ({ onSelectKaryawan }) => {
//   const [dataKaryawan, setDataKaryawan] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Data/`);
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         const result = await response.json();
        
//         // Memastikan result.data adalah array
//         if (Array.isArray(result.data)) {
//           setDataKaryawan(result.data);
//         } else {
//           setDataKaryawan([]);
//           console.error('Expected array but got:', result.data);
//         }

//         console.log('API response:', result);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="table-container">
//       <table>
//         <thead>
//           <tr>
//             <th>NIK</th>
//             <th>Nama</th>
//             <th>Organisasi</th>
//             <th>Email</th>
//           </tr>
//         </thead>
//         <tbody>
//           {dataKaryawan.length === 0 ? (
//             <tr>
//               <td colSpan="5">No data available</td>
//             </tr>
//           ) : (
//             dataKaryawan.map((karyawan, index) => (
//               <tr
//                 key={index}
//                 onClick={() => onSelectKaryawan(karyawan)}
//               >
//                 <td>{karyawan.nik}</td>
//                 <td>{karyawan.nama}</td>
//                 <td>{karyawan.organisasi}</td>
//                 <td>{karyawan.email}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default DataKaryawan;
const DataKaryawan = ({ onSelectKaryawan }) => {
  const [dataKaryawan, setDataKaryawan] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_HELP_DESK}/Data`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
         // Memastikan result.data adalah array
//         if (Array.isArray(result.data)) {
//           setDataKaryawan(result.data);
//         } else {
//           setDataKaryawan([]);
//           console.error('Expected array but got:', result.data);
//         }

//         console.log('API response:', result);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
        // Memastikan result.data adalah array
        if (Array.isArray(result.data)) {
          // // Filter data karyawan yang organisasi-nya dimulai dengan 'IT'
          // const filteredData = result.data.filter(karyawan => 
          //   karyawan.organisasi && karyawan.organisasi.startsWith('IT')
          // );
          setDataKaryawan(result.data);
        } else {
          setDataKaryawan([]);
          console.error('Expected array but got:', result.data);
        }

        console.log('API response:', result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>Organisasi</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {dataKaryawan.length === 0 ? (
            <tr>
              <td colSpan="4">No data available</td>
            </tr>
          ) : (
            dataKaryawan.map((karyawan, index) => (
              <tr
                key={index}
                onClick={() => onSelectKaryawan(karyawan)}
              >
                <td>{karyawan.nik}</td>
                <td>{karyawan.nama}</td>
                <td>{karyawan.organisasi}</td>
                <td>{karyawan.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataKaryawan;
