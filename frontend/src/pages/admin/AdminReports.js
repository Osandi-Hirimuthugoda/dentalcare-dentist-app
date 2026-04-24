import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Users, Calendar, DollarSign, Download, Filter } from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import styles from "../../styles/pages/DoctorDashboard.module.css";

const API = "/api";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminReports() {
  const [revenueData, setRevenueData] = useState([]);
  const [patientGrowth, setPatientGrowth] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [serviceTrends, setServiceTrends] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [revRes, patRes, apptRes] = await Promise.all([
          axios.get(`${API}/reports/revenue`, config),
          axios.get(`${API}/reports/patients`, config),
          axios.get(`${API}/reports/appointments`, config)
        ]);

        if (revRes.data.success) {
          setSummary(revRes.data.summary);
          // Format monthly revenue for chart
          const formattedRev = revRes.data.summary.monthlyRevenue.map(item => ({
            name: `${item._id.month}/${item._id.year}`,
            revenue: item.revenue
          })).reverse();
          setRevenueData(formattedRev);
        }

        if (patRes.data.success) {
          const formattedGrowth = patRes.data.patientGrowth.map(item => ({
            name: `${item._id.month}/${item._id.year}`,
            count: item.count
          })).reverse();
          setPatientGrowth(formattedGrowth);
        }

        if (apptRes.data.success) {
          setStatusBreakdown(apptRes.data.statusBreakdown);
          setServiceTrends(apptRes.data.serviceTrends);
        }

      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />
      <div className={styles.mainContentArea}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="spinner" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />
      
      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.mainTitle}>System Analytics</h1>
            <p className={styles.statsGridLabel}>Comprehensive reports and insights</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </header>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-teal-50 rounded-xl">
                <DollarSign className="text-teal-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">LKR {summary.totalRevenue?.toLocaleString()}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-teal-600 text-sm font-medium">
              <TrendingUp size={14} /> +12.5% from last month
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Patients</p>
                <h3 className="text-2xl font-bold text-gray-900">1,284</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              <TrendingUp size={14} /> +5.2% from last month
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Appointments</p>
                <h3 className="text-2xl font-bold text-gray-900">452</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-purple-600 text-sm font-medium">
              <TrendingUp size={14} /> +8.1% from last month
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Growth</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Growth Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Registrations</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Appointment Status Pie Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Appointment Status</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Trends Bar Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Popular Services</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceTrends} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 11}} width={120} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Doctor Performance Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Doctor Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.doctorRevenue?.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                          {doc.doctorName?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{doc.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">LKR {doc.revenue?.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="w-full max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 rounded-full" 
                          style={{width: `${Math.min((doc.revenue / (summary.totalRevenue || 1)) * 100 * 5, 100)}%`}}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
