// import React, { createContext, useState } from "react";

// export const StatusContext = createContext();

// export const StatusProvider = ({ children }) => {
//   const [status, setStatus] = useState("NOT COMPLETE");
//   const [color, setColor] = useState("red");

//   const updateStatus = (newStatus, newColor) => {
//     setStatus(newStatus);
//     setColor(newColor);
//   };

//   return (
//     <StatusContext.Provider value={{ status, color, updateStatus }}>
//       {children}
//     </StatusContext.Provider>
//   );
// };
