import React from "react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flexGrow: 1 }}>
        <h2>Welcome to DentalCare+ Dashboard</h2>
        <p>Quick stats, upcoming appointments, and patient alerts here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
