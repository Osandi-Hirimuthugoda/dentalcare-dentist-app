import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PasswordInput from "../components/PasswordInput";
import "../styles/DoctorLogin.css"; // Make sure this path is correct

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/doctors/login", {
        email,
        password,
      });
      localStorage.setItem("doctor", JSON.stringify(res.data.doctor));
      navigate("/doctor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    // Use the new login-container class for the full page background
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        // Use the new login-card class for the form's container
        className="login-card"
      >
        <h2 className="login-title">
          Doctor Login
        </h2>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input" // Use the new login-input class
            required
          />
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input" // Use the new login-input class
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="login-button" // Use the new login-button class
          >
            Login
          </motion.button>
        </form>

        {error && (
          <p className="error-message">{error}</p> // Use the new error-message class
        )}

        <p className="register-text"> {/* Use the new register-text class */}
          Don’t have an account?{" "}
          <Link
            to="/doctor-register"
            className="register-link" // Use the new register-link class
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}