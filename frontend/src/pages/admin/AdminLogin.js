import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import PasswordInput from "../../components/common/PasswordInput";
import "../../styles/pages/DoctorLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/admins/login", {
        email: username,
        password,
      });
      
      if (res.data.message === "Login successful") {
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        localStorage.setItem("role", "admin");
        navigate("/admin-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <Shield size={32} style={{ color: "#00897B" }} />
          <h1 className="login-title" style={{ marginBottom: 0 }}>Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Email Address"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <PasswordInput
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <p className="register-text">
          Managing the dental care system
        </p>
      </motion.div>
    </div>
  );
}

