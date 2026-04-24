import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, Plus, Search, AlertTriangle, Edit3, Trash2, 
  ChevronRight, Box, Filter, Download
} from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import styles from "../../styles/pages/DoctorDashboard.module.css";
import { toast } from "react-toastify";

const API = "/api";

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    itemName: "", category: "Supplies", quantity: 0, unit: "Units", minThreshold: 5, supplier: "", location: ""
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API}/inventory/all`);
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || "";
      await axios.post(`${API}/inventory/add`, newItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Item added successfully");
      setShowAddModal(false);
      fetchInventory();
      setNewItem({ itemName: "", category: "Supplies", quantity: 0, unit: "Units", minThreshold: 5, supplier: "", location: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding item");
    }
  };

  const handleUpdateStock = async (id, quantity, type) => {
    try {
      const token = localStorage.getItem("token") || "";
      await axios.put(`${API}/inventory/update/${id}`, { quantity, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory();
    } catch (error) {
      toast.error("Error updating stock");
    }
  };

  const filteredItems = items.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />
      
      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.mainTitle}>Inventory Management</h1>
            <p className={styles.statsGridLabel}>Track clinic supplies and equipment</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Add New Item
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600"><Box size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <h3 className="text-xl font-bold text-gray-900">{items.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Alert</p>
              <h3 className="text-xl font-bold text-gray-900">{items.filter(i => i.quantity <= i.minThreshold).length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Package size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Recently Restocked</p>
              <h3 className="text-xl font-bold text-gray-900">4</h3>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search items by name or category..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm"><Filter size={18} /></button>
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm"><Download size={18} /></button>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.itemName}</div>
                    <div className="text-xs text-gray-400">{item.location || "No location set"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${item.quantity <= item.minThreshold ? "text-red-600" : "text-gray-900"}`}>
                        {item.quantity} {item.unit}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleUpdateStock(item._id, 1, 'subtract')}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                        >-</button>
                        <button 
                          onClick={() => handleUpdateStock(item._id, 1, 'add')}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        >+</button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.quantity <= item.minThreshold ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                        <AlertTriangle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-teal-600">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-400">
              <Box size={40} className="mx-auto mb-4 opacity-20" />
              <p>No items found in inventory.</p>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-8 py-6 bg-teal-600 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Add New Item</h2>
                <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform">
                  <ChevronRight size={24} className="rotate-90" />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                  <input 
                    required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
                      value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                    >
                      <option>Supplies</option><option>Equipment</option><option>Medicine</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                    <input 
                      required type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
                      value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                    <input 
                      required type="text" placeholder="e.g. Boxes" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
                      value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Min. Threshold</label>
                    <input 
                      required type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
                      value={newItem.minThreshold} onChange={e => setNewItem({...newItem, minThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] mt-4">
                  Confirm and Add
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
