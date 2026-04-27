import React, { useState } from "react";
import axios from "axios";

function LoginPage() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const url =
        role === "admin"
          ? "/api/admin/login"
          : "/api/doctors/login";

      const res = await axios.post(url, { email, password });
      setMessage(res.data.message);

      if (res.data.message === "Login successful") {
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("role", role);
        window.location.href = role === "admin" ? "/admin-dashboard" : "/doctor-dashboard";
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg p-8 rounded-2xl w-96 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

        <div className="flex justify-around mb-4">
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
            />{" "}
            Admin
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="doctor"
              checked={role === "doctor"}
              onChange={(e) => setRole(e.target.value)}
            />{" "}
            Doctor
          </label>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
        >
          Login
        </button>

        {message && <p className="text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
