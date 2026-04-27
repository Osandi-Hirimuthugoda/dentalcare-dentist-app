import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00695C 0%, #00897B 50%, #26A69A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: 72, marginBottom: 16 }}
      >
        🦷
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: "2.8rem",
          fontWeight: 800,
          color: "#ffffff",
          marginBottom: 8,
          letterSpacing: "1px",
        }}
      >
        DentalCare<span style={{ color: "#E0F2F1" }}>+</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: "1.05rem",
          color: "rgba(255,255,255,0.8)",
          maxWidth: 480,
          marginBottom: 48,
          lineHeight: 1.6,
        }}
      >
        Unified Intelligence for Global Oral Health. AI-powered diagnostics,
        smart scheduling, and seamless patient care — all in one platform.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
      >
        <Link
          to="/doctor-login"
          style={{
            background: "#ffffff",
            color: "#00695C",
            padding: "14px 36px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => (e.target.style.transform = "translateY(-2px)")}
          onMouseLeave={e => (e.target.style.transform = "translateY(0)")}
        >
          Doctor Login
        </Link>

        <Link
          to="/admin-login"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#ffffff",
            padding: "14px 36px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            border: "2px solid rgba(255,255,255,0.5)",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.target.style.background = "rgba(255,255,255,0.25)")}
          onMouseLeave={e => (e.target.style.background = "rgba(255,255,255,0.15)")}
        >
          Admin Login
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: 48 }}
      >
        © 2026 DentalCare+ · Excellence in Dental Intelligence
      </motion.p>
    </div>
  );
};

export default Home;
