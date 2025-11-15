import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-100 flex flex-col items-center justify-center text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold text-cyan-700 mb-4"
      >
        Welcome to <span className="text-blue-600">DentalCare+</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-gray-600 max-w-xl mb-8"
      >
        Manage your dental practice efficiently with appointment tracking,
        patient management, and secure record keeping.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex space-x-4"
      >
        <Link
          to="/doctor-login"
          // Teal-like color for Doctor Login
          className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-all"
        >
          Doctor Login
        </Link>
        <Link
          to="/admin-login"
          // Blue color for Admin Login
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
        >
          Admin Login
        </Link>
        <Link
          to="/doctor-register"
          // White background with a teal border for Register
          className="bg-white text-teal-600 border border-teal-500 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all"
        >
          Register
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;