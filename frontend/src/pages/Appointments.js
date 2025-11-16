// import React from "react";
// import { motion } from "framer-motion";
// import DoctorSidebar from "../components/DoctorSidebar";

// const Appointments = () => {
//   const appointments = [
//     { id: 1, name: "John Smith", date: "2025-11-10", time: "09:00 AM", status: "Confirmed" },
//     { id: 2, name: "Emily Johnson", date: "2025-11-11", time: "10:30 AM", status: "Pending" },
//     { id: 3, name: "Michael Brown", date: "2025-11-12", time: "01:00 PM", status: "Cancelled" },
//     { id: 4, name: "Sophia Davis", date: "2025-11-13", time: "03:00 PM", status: "Confirmed" },
//     { id: 5, name: "David Wilson", date: "2025-11-14", time: "11:00 AM", status: "Confirmed" },
//   ];

//   const statusColors = {
//     Confirmed: "text-green-600 bg-green-100",
//     Pending: "text-yellow-600 bg-yellow-100",
//     Cancelled: "text-red-600 bg-red-100",
//   };

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-100">
//       <DoctorSidebar />

//       <motion.div
//         className="flex-1 p-10"
//         initial={{ opacity: 0, x: 50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="text-4xl font-bold text-cyan-700 mb-8"
//         >
//           Appointments
//         </motion.h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {appointments.map((appt) => (
//             <motion.div
//               key={appt.id}
//               whileHover={{ scale: 1.05 }}
//               className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
//             >
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 {appt.name}
//               </h3>
//               <p className="text-gray-600">
//                 <span className="font-medium">Date:</span> {appt.date}
//               </p>
//               <p className="text-gray-600">
//                 <span className="font-medium">Time:</span> {appt.time}
//               </p>
//               <span
//                 className={`inline-block mt-4 px-3 py-1 rounded-full text-sm font-semibold ${
//                   statusColors[appt.status]
//                 }`}
//               >
//                 {appt.status}
//               </span>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Appointments;
