import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package, Search, AlertTriangle, Box, Filter, CheckCircle,
} from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorInventory.css";

const API = "/api";

const CATEGORY_COLORS = {
  Medicine:  "medicine",
  Equipment: "equipment",
  Supplies:  "supplies",
  Other:     "",
};

export default function DoctorInventory() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter]   = useState("All");

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API}/inventory/all`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(items.map(i => i.category).filter(Boolean))];

  const filtered = items.filter(item => {
    const matchSearch =
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === "All" || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStockItems = items.filter(i => i.quantity <= i.minThreshold);
  const medicineCount = items.filter(i => i.category === "Medicine").length;
  const suppliesCount = items.filter(i => i.category === "Supplies").length;

  if (loading) return (
    <div className="dinv-wrapper">
      <DoctorSidebar />
      <div className="dinv-content">
        <div className="dinv-loading"><div className="dinv-spinner" /><p>Loading inventory...</p></div>
      </div>
    </div>
  );

  return (
    <div className="dinv-wrapper">
      <DoctorSidebar />

      <div className="dinv-content">
        {/* Header */}
        <div className="dinv-header">
          <h1><Package size={22} /> Clinic Inventory</h1>
          <p>View available supplies, medicines, and equipment</p>
        </div>

        {/* Low stock alert */}
        {lowStockItems.length > 0 && (
          <div className="dinv-alert-banner">
            <AlertTriangle size={18} />
            {lowStockItems.length} item{lowStockItems.length > 1 ? "s are" : " is"} running low on stock —
            {" "}{lowStockItems.map(i => i.itemName).join(", ")}
          </div>
        )}

        {/* Stats */}
        <div className="dinv-stats">
          <div className="dinv-stat-card">
            <div className="dinv-stat-icon teal"><Box size={20} /></div>
            <div>
              <div className="dinv-stat-label">Total Items</div>
              <div className="dinv-stat-value">{items.length}</div>
            </div>
          </div>
          <div className="dinv-stat-card">
            <div className="dinv-stat-icon red"><AlertTriangle size={20} /></div>
            <div>
              <div className="dinv-stat-label">Low Stock</div>
              <div className="dinv-stat-value">{lowStockItems.length}</div>
            </div>
          </div>
          <div className="dinv-stat-card">
            <div className="dinv-stat-icon blue"><Package size={20} /></div>
            <div>
              <div className="dinv-stat-label">Medicines</div>
              <div className="dinv-stat-value">{medicineCount}</div>
            </div>
          </div>
          <div className="dinv-stat-card">
            <div className="dinv-stat-icon orange"><Box size={20} /></div>
            <div>
              <div className="dinv-stat-label">Supplies</div>
              <div className="dinv-stat-value">{suppliesCount}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="dinv-toolbar">
          <div className="dinv-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, category, or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="dinv-filter-select"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="dinv-table-card">
          <table className="dinv-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.quantity <= item.minThreshold;
                const catClass = CATEGORY_COLORS[item.category] || "";
                return (
                  <tr key={item._id}>
                    <td>
                      <div className="dinv-item-name">{item.itemName}</div>
                      {item.supplier && (
                        <div className="dinv-item-loc">Supplier: {item.supplier}</div>
                      )}
                    </td>
                    <td>
                      <span className={`dinv-cat-badge ${catClass}`}>{item.category}</span>
                    </td>
                    <td>
                      <span className={`dinv-qty${isLow ? " low" : ""}`}>
                        {item.quantity} {item.unit}
                      </span>
                      {isLow && (
                        <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 2 }}>
                          Min: {item.minThreshold} {item.unit}
                        </div>
                      )}
                    </td>
                    <td style={{ color: "#6b7280" }}>
                      {item.location || "—"}
                    </td>
                    <td>
                      {isLow ? (
                        <span className="dinv-status-low">
                          <AlertTriangle size={11} /> Low Stock
                        </span>
                      ) : (
                        <span className="dinv-status-ok">
                          <CheckCircle size={11} /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="dinv-empty">
              <Box size={40} />
              <p>{searchTerm || catFilter !== "All" ? "No items match your search." : "No inventory items found."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
