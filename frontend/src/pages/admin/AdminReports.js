import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, Calendar, DollarSign, Download, Filter } from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import "../../styles/pages/AdminReports.css";

const API = "/api";
const COLORS = ["#00897B", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReports() {
  const [revenueData, setRevenueData]         = useState([]);
  const [patientGrowth, setPatientGrowth]     = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [serviceTrends, setServiceTrends]     = useState([]);
  const [summary, setSummary]                 = useState({ totalRevenue: 0 });
  const [dashStats, setDashStats]             = useState({ totalPatients: 0, totalAppointments: 0, completedThisMonth: 0 });
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const admin = JSON.parse(localStorage.getItem("admin") || "{}");
        const token = admin.token || localStorage.getItem("token") || "";
        const cfg = { headers: { Authorization: `Bearer ${token}` } };

        const [revRes, patRes, apptRes, statsRes] = await Promise.allSettled([
          axios.get(`${API}/reports/revenue`, cfg),
          axios.get(`${API}/reports/patients`, cfg),
          axios.get(`${API}/reports/appointments`, cfg),
          axios.get(`${API}/admins/dashboard/stats`, cfg),
        ]);

        if (revRes.status === "fulfilled" && revRes.value.data.success) {
          setSummary(revRes.value.data.summary);
          setRevenueData(
            (revRes.value.data.summary.monthlyRevenue || [])
              .map(item => ({ name: `${item._id.month}/${item._id.year}`, revenue: item.revenue }))
              .reverse()
          );
        }

        if (patRes.status === "fulfilled" && patRes.value.data.success) {
          setPatientGrowth(
            (patRes.value.data.patientGrowth || [])
              .map(item => ({ name: `${item._id.month}/${item._id.year}`, count: item.count }))
              .reverse()
          );
        }

        if (apptRes.status === "fulfilled" && apptRes.value.data.success) {
          setStatusBreakdown(apptRes.value.data.statusBreakdown || []);
          setServiceTrends(apptRes.value.data.serviceTrends || []);
        }

        if (statsRes.status === "fulfilled" && statsRes.value.data.stats) {
          const s = statsRes.value.data.stats;
          setDashStats({
            totalPatients:      s.totalPatients      || 0,
            totalAppointments:  s.totalAppointments  || 0,
            completedThisMonth: s.completedThisMonth || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="arep-wrapper">
      <AdminSidebar />
      <div className="arep-content">
        <div className="arep-loading"><div className="arep-spinner" /><p>Loading reports...</p></div>
      </div>
    </div>
  );

  const tooltipStyle = { borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };

  return (
    <div className="arep-wrapper">
      <AdminSidebar />

      <div className="arep-content">
        {/* Header */}
        <div className="arep-header">
          <div>
            <h1>System Analytics</h1>
            <p>Comprehensive reports and insights</p>
          </div>
          <div className="arep-header-actions">
            <button className="arep-btn-outline"><Filter size={14} /> Filter</button>
            <button className="arep-btn-primary"><Download size={14} /> Export</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="arep-stats">
          <div className="arep-stat-card">
            <div className="arep-stat-icon teal"><DollarSign size={22} /></div>
            <div>
              <div className="arep-stat-label">Total Revenue</div>
              <div className="arep-stat-value">LKR {(summary.totalRevenue || 0).toLocaleString()}</div>
              <div className="arep-stat-trend up"><TrendingUp size={12} /> +12.5% from last month</div>
            </div>
          </div>

          <div className="arep-stat-card">
            <div className="arep-stat-icon blue"><Users size={22} /></div>
            <div>
              <div className="arep-stat-label">Active Patients</div>
              <div className="arep-stat-value">{dashStats.totalPatients.toLocaleString()}</div>
              <div className="arep-stat-trend up"><TrendingUp size={12} /> Total registered</div>
            </div>
          </div>

          <div className="arep-stat-card">
            <div className="arep-stat-icon purple"><Calendar size={22} /></div>
            <div>
              <div className="arep-stat-label">Total Appointments</div>
              <div className="arep-stat-value">{dashStats.totalAppointments.toLocaleString()}</div>
              <div className="arep-stat-trend up"><TrendingUp size={12} /> {dashStats.completedThisMonth} completed this month</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="arep-charts">
          {/* Revenue Growth */}
          <div className="arep-chart-card">
            <h3 className="arep-chart-title">Revenue Growth</h3>
            <div className="arep-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="revenue" stroke="#00897B" strokeWidth={3}
                    dot={{ r: 4, fill: "#00897B", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Registrations */}
          <div className="arep-chart-card">
            <h3 className="arep-chart-title">Patient Registrations</h3>
            <div className="arep-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Appointment Status */}
          <div className="arep-chart-card">
            <h3 className="arep-chart-title">Appointment Status</h3>
            <div className="arep-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} innerRadius={60} outerRadius={100}
                    paddingAngle={5} dataKey="count" nameKey="_id">
                    {statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Services */}
          <div className="arep-chart-card">
            <h3 className="arep-chart-title">Popular Services</h3>
            <div className="arep-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceTrends} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 11 }} width={130} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Doctor Performance Table */}
        <div className="arep-table-card">
          <div className="arep-table-header">
            <h3>Doctor Performance</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="arep-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Revenue</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {(summary.doctorRevenue || []).map((doc, i) => (
                  <tr key={i}>
                    <td>
                      <div className="arep-doc-cell">
                        <div className="arep-doc-avatar">{doc.doctorName?.charAt(0)}</div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{doc.doctorName}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>LKR {doc.revenue?.toLocaleString()}</td>
                    <td>
                      <div className="arep-progress-bar">
                        <div
                          className="arep-progress-fill"
                          style={{ width: `${Math.min((doc.revenue / (summary.totalRevenue || 1)) * 500, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {(!summary.doctorRevenue || summary.doctorRevenue.length === 0) && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                      No revenue data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
