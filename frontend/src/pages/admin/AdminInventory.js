import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package, Plus, Search, AlertTriangle, Edit3, Trash2,
  Box, Filter, Download, X, CheckCircle, AlertCircle,
} from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import "../../styles/pages/AdminInventory.css";

const API = "/api";

const EMPTY_ITEM = {
  itemName: "", category: "Supplies", quantity: 0,
  unit: "Units", minThreshold: 5, supplier: "", location: "",
};

const getAdminToken = () => {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  return admin.token || localStorage.getItem("token") || "";
};

export default function AdminInventory() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId]         = useState(null);
  const [searchTerm, setSearchTerm]     = useState("");
  const [newItem, setNewItem]           = useState(EMPTY_ITEM);
  const [toast, setToast]               = useState({ type: "", text: "" });

  useEffect(() => { fetchInventory(); }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3000);
  };

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

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      await axios.post(`${API}/inventory/add`, newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Item added successfully.");
      setShowAddModal(false);
      setNewItem(EMPTY_ITEM);
      fetchInventory();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Error adding item.");
    }
  };

  const handleUpdateStock = async (id, quantity, type) => {
    try {
      const token = getAdminToken();
      await axios.put(`${API}/inventory/update/${id}`, { quantity, type }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInventory();
    } catch {
      showToast("error", "Error updating stock.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = getAdminToken();
      await axios.delete(`${API}/inventory/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Item deleted.");
      setDeleteId(null);
      fetchInventory();
    } catch {
      showToast("error", "Error deleting item.");
      setDeleteId(null);
    }
  };

  const filtered = items.filter(item =>
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = items.filter(i => i.quantity <= i.minThreshold).length;

  if (loading) return (
    <div className="ainv-wrapper">
      <AdminSidebar />
      <div className="ainv-content">
        <div className="ainv-loading"><div className="ainv-spinner" /><p>Loading inventory...</p></div>
      </div>
    </div>
  );

  return (
    <div className="ainv-wrapper">
      <AdminSidebar />

      <div className="ainv-content">
        {/* Header */}
        <div className="ainv-header">
          <div>
            <h1><Package size={22} /> Inventory Management</h1>
            <p>Track clinic supplies and equipment</p>
          </div>
          <button className="ainv-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={17} /> Add New Item
          </button>
        </div>

        {/* Toast */}
        {toast.text && (
          <div className={`ainv-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {toast.text}
          </div>
        )}

        {/* Stats */}
        <div className="ainv-stats">
          <div className="ainv-stat-card">
            <div className="ainv-stat-icon teal"><Box size={22} /></div>
            <div>
              <div className="ainv-stat-label">Total Items</div>
              <div className="ainv-stat-value">{items.length}</div>
            </div>
          </div>
          <div className="ainv-stat-card">
            <div className="ainv-stat-icon red"><AlertTriangle size={22} /></div>
            <div>
              <div className="ainv-stat-label">Low Stock Alerts</div>
              <div className="ainv-stat-value">{lowStockCount}</div>
            </div>
          </div>
          <div className="ainv-stat-card">
            <div className="ainv-stat-icon blue"><Package size={22} /></div>
            <div>
              <div className="ainv-stat-label">Categories</div>
              <div className="ainv-stat-value">{new Set(items.map(i => i.category)).size}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ainv-toolbar">
          <div className="ainv-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="ainv-icon-btn" title="Filter"><Filter size={17} /></button>
          <button className="ainv-icon-btn" title="Export"><Download size={17} /></button>
        </div>

        {/* Table */}
        <div className="ainv-table-card">
          <table className="ainv-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id}>
                  <td>
                    <div className="ainv-item-name">{item.itemName}</div>
                    <div className="ainv-item-loc">{item.location || "No location set"}</div>
                  </td>
                  <td><span className="ainv-cat-badge">{item.category}</span></td>
                  <td>
                    <div className="ainv-stock-row">
                      <span className={`ainv-qty${item.quantity <= item.minThreshold ? " low" : ""}`}>
                        {item.quantity} {item.unit}
                      </span>
                      <div className="ainv-qty-btns">
                        <button
                          className="ainv-qty-btn minus"
                          onClick={() => handleUpdateStock(item._id, 1, "subtract")}
                        >−</button>
                        <button
                          className="ainv-qty-btn plus"
                          onClick={() => handleUpdateStock(item._id, 1, "add")}
                        >+</button>
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.quantity <= item.minThreshold ? (
                      <span className="ainv-status-low"><AlertTriangle size={12} /> Low Stock</span>
                    ) : (
                      <span className="ainv-status-ok">In Stock</span>
                    )}
                  </td>
                  <td className="ainv-actions-cell">
                    <div className="ainv-row-actions">
                      <button className="ainv-edit-btn" title="Edit"><Edit3 size={15} /></button>
                      <button className="ainv-del-btn" title="Delete" onClick={() => setDeleteId(item._id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="ainv-empty">
              <Box size={40} />
              <p>{searchTerm ? "No items match your search." : "No items in inventory yet."}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="ainv-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ainv-modal" onClick={e => e.stopPropagation()}>
            <div className="ainv-modal-header">
              <h2>Add New Item</h2>
              <button className="ainv-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ainv-modal-body">
              <form onSubmit={handleAddItem}>
                <div className="ainv-form-grid">
                  <div className="ainv-form-field full">
                    <label>Item Name</label>
                    <input required type="text" value={newItem.itemName}
                      onChange={e => setNewItem({ ...newItem, itemName: e.target.value })} />
                  </div>
                  <div className="ainv-form-field">
                    <label>Category</label>
                    <select value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                      <option>Supplies</option>
                      <option>Equipment</option>
                      <option>Medicine</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="ainv-form-field">
                    <label>Quantity</label>
                    <input required type="number" min="0" value={newItem.quantity}
                      onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="ainv-form-field">
                    <label>Unit (e.g. Boxes)</label>
                    <input required type="text" value={newItem.unit}
                      onChange={e => setNewItem({ ...newItem, unit: e.target.value })} />
                  </div>
                  <div className="ainv-form-field">
                    <label>Min. Threshold</label>
                    <input required type="number" min="0" value={newItem.minThreshold}
                      onChange={e => setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="ainv-form-field">
                    <label>Supplier</label>
                    <input type="text" value={newItem.supplier}
                      onChange={e => setNewItem({ ...newItem, supplier: e.target.value })} />
                  </div>
                  <div className="ainv-form-field">
                    <label>Location</label>
                    <input type="text" value={newItem.location}
                      onChange={e => setNewItem({ ...newItem, location: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="ainv-submit-btn">Confirm and Add</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="ainv-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="ainv-modal ainv-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="ainv-confirm-body">
              <AlertCircle size={44} style={{ color: "#ef4444" }} />
              <h3>Delete Item?</h3>
              <p>This action cannot be undone.</p>
              <div className="ainv-confirm-actions">
                <button className="ainv-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="ainv-delete-confirm-btn" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
