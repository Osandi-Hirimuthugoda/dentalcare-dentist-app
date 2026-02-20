import React from "react";
import { Link } from "react-router-dom";
import { Heart, Receipt } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">
              © {new Date().getFullYear()} DentalCare+. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link
              to="/health"
              className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors"
            >
              <Heart size={18} />
              <span>Health</span>
            </Link>
            <Link
              to="/my-bills"
              className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors"
            >
              <Receipt size={18} />
              <span>My Bills</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

