import React from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("doctor");
    window.location.href = "/doctor-login";
  };

  return (
    <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-cyan-700">DentalCare+ Doctor</h1>
      <div className="flex items-center space-x-4">
        <Link
          to="/profile"
          className="text-cyan-600 font-medium hover:underline"
        >
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-red-600 font-medium hover:text-red-700"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
