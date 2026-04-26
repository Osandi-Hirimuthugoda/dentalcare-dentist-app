import React, { useState, useEffect } from "react";
import { Receipt, Wallet, CreditCard, Plus, CheckCircle, XCircle, Clock, DollarSign, Lock, Shield, History, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bills"); // bills | history | wallet
  const [filterStatus, setFilterStatus] = useState("all");
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    customAmount: ""
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchWalletBalance();
    fetchPaymentHistory();
    fetchWalletTransactions();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bills/patient/bills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(response.data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bills/patient/payments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/wallet/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletTransactions(response.data || []);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/wallet/info", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setWalletBalance(0);
    }
  };

  const handleTopUp = async () => {
    const amount = cardDetails.customAmount 
      ? parseInt(cardDetails.customAmount) 
      : selectedAmount;

    if (!amount || amount < 100) {
      alert("Please enter a valid amount (minimum LKR 100)");
      return;
    }

    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      alert("Please fill in all card details");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, "");
      const cardType = cleanCardNumber.startsWith("4") 
        ? "Visa" 
        : cleanCardNumber.startsWith("5") 
        ? "MasterCard" 
        : "Other";

      const response = await axios.post(
        "/api/wallet/topup",
        {
          amount: amount,
          paymentMethod: "card",
          cardDetails: {
            cardType: cardType,
            last4Digits: cleanCardNumber.slice(-4),
            cardHolder: cardDetails.cardHolder
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert(`Wallet top-up successful! New balance: LKR ${response.data.balance.toLocaleString()}`);
        setShowTopUp(false);
        setSelectedAmount(null);
        setCardDetails({
          cardNumber: "",
          cardHolder: "",
          expiryDate: "",
          cvv: "",
          customAmount: ""
        });
        fetchWalletBalance();
      }
    } catch (error) {
      console.error("Error topping up wallet:", error);
      alert(error.response?.data?.message || "Top-up failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayWithWallet = async (billId) => {
    if (!window.confirm("Pay this bill using your wallet?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/wallet/pay",
        { billId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert("Payment successful!");
        fetchBills();
        fetchWalletBalance();
      }
    } catch (error) {
      console.error("Error paying bill:", error);
      alert(error.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle size={18} />;
      case "pending":
        return <Clock size={18} />;
      case "overdue":
        return <XCircle size={18} />;
      default:
        return <Receipt size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Page Title & Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Bills & Payments</h2>
          <button
            onClick={() => setShowTopUp(true)}
            className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus size={18} />
            Top Up
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Bills</p>
            <p className="text-2xl font-bold text-gray-800">{bills.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-500">
              {bills.filter(b => b.status?.toLowerCase() === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-500">
              {bills.filter(b => b.status?.toLowerCase() === 'paid').length}
            </p>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm mb-1">DentalCare+ Wallet</p>
              <h2 className="text-3xl font-bold">LKR {walletBalance.toLocaleString()}</h2>
              <p className="text-cyan-200 text-xs mt-1">Available Balance</p>
            </div>
            <div className="text-right">
              <Wallet size={40} className="text-cyan-200 mb-2" />
              <button
                onClick={() => { setShowTopUp(true); }}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition"
              >
                + Top Up
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200/50 rounded-xl p-1">
          {[
            { id: "bills", label: "Bills", icon: Receipt },
            { id: "history", label: "Payments", icon: History },
            { id: "wallet", label: "Wallet", icon: Wallet },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-cyan-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {/* Bills Tab */}
          {activeTab === "bills" && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {["all", "pending", "paid", "overdue"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                      filterStatus === f
                        ? "bg-cyan-600 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-cyan-300"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== "all" && (
                      <span className="ml-1 text-xs opacity-75">
                        ({bills.filter(b => b.status?.toLowerCase() === f).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bills List */}
              <div className="space-y-4">
                {bills.filter(b => filterStatus === "all" || b.status?.toLowerCase() === filterStatus).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <Receipt size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No {filterStatus !== "all" ? filterStatus : ""} bills found</p>
                  </div>
                ) : (
                  bills.filter(b => filterStatus === "all" || b.status?.toLowerCase() === filterStatus).map((bill, index) => (
                    <motion.div
                      key={bill._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              {bill.treatment || bill.service || "Dental Service"}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(bill.status)}`}>
                              {getStatusIcon(bill.status)}
                              <span>{bill.status || "Pending"}</span>
                            </span>
                          </div>
                          <div className="space-y-1">
                            {bill.doctorName && <p className="text-sm text-gray-600">Doctor: {bill.doctorName}</p>}
                            {bill.date && <p className="text-sm text-gray-500">Date: {bill.date}</p>}
                            {bill.dueDate && <p className="text-sm text-gray-500 font-medium text-orange-600">Due: {bill.dueDate}</p>}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-black text-gray-800 mb-3">
                            {bill.amount || `LKR ${bill.total?.toLocaleString() || 0}`}
                          </p>
                          {bill.status?.toLowerCase() !== "paid" && (
                            <button
                              onClick={() => handlePayWithWallet(bill._id)}
                              disabled={walletBalance < (bill.total || parseFloat(bill.amount?.replace(/[^0-9.]/g, "") || 0))}
                              className={`px-6 py-2 rounded-xl font-bold transition-all ${
                                walletBalance >= (bill.total || parseFloat(bill.amount?.replace(/[^0-9.]/g, "") || 0))
                                  ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Pay with Wallet
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <History size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No payment history yet</p>
                </div>
              ) : (
                payments.map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{p.description || 'Payment'}</p>
                      <p className="text-xs text-gray-500 font-mono">{p.transactionId || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-green-600">LKR {(p.amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase">{p.status || 'completed'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Wallet Transactions Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              {walletTransactions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No wallet transactions yet</p>
                </div>
              ) : (
                walletTransactions.map((t, i) => {
                  const isTopup = t.type === 'topup' || t.type === 'refund';
                  return (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isTopup ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {isTopup ? <TrendingUp size={24} /> : <CreditCard size={24} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{t.description || t.type}</p>
                        <p className="text-xs text-gray-500 font-mono">{t.transactionId || ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${isTopup ? 'text-green-600' : 'text-red-500'}`}>
                          {isTopup ? '+' : '-'} LKR {(t.amount || 0).toLocaleString()}
                        </p>
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                          {t.status || 'completed'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top-Up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTopUp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                      <Wallet size={24} />
                    </div>
                    <span>Top Up Wallet</span>
                  </h2>
                  <button onClick={() => setShowTopUp(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <XCircle size={28} className="text-gray-400" />
                  </button>
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Select Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[5000, 10000, 15000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCardDetails({ ...cardDetails, customAmount: "" });
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all font-bold ${
                          selectedAmount === amount && !cardDetails.customAmount
                            ? "border-cyan-600 bg-cyan-50 text-cyan-700 shadow-sm"
                            : "border-gray-100 hover:border-cyan-200 text-gray-600"
                        }`}
                      >
                        LKR {amount / 1000}K
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">LKR</span>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-bold"
                      value={cardDetails.customAmount}
                      onChange={(e) => {
                        setCardDetails({ ...cardDetails, customAmount: e.target.value });
                        setSelectedAmount(null);
                      }}
                    />
                  </div>
                </div>

                {/* Card Preview */}
                <div className="mb-8">
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <CreditCard size={24} />
                        </div>
                        <Shield size={24} className="text-white/30" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Card Number</p>
                        <p className="text-xl font-mono tracking-widest">{cardDetails.cardNumber || "•••• •••• •••• ••••"}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Card Holder</p>
                          <p className="text-sm font-bold">{cardDetails.cardHolder || "YOUR NAME"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Expires</p>
                          <p className="text-sm font-bold font-mono">{cardDetails.expiryDate || "MM/YY"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-8">
                  <div className="space-y-4">
                    <input
                      type="text"
                      maxLength="19"
                      placeholder="Card Number"
                      className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-mono"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                        const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                        setCardDetails({ ...cardDetails, cardNumber: formatted });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Card Holder Name"
                      className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 uppercase font-bold text-sm"
                      value={cardDetails.cardHolder}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-mono"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          setCardDetails({ ...cardDetails, expiryDate: val });
                        }}
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength="4"
                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-mono"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleTopUp}
                  disabled={(!selectedAmount && !cardDetails.customAmount) || processing}
                  className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-black text-lg hover:bg-cyan-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-600/30 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                >
                  {processing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Pay LKR {(cardDetails.customAmount ? parseInt(cardDetails.customAmount) : selectedAmount || 0).toLocaleString()}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-gray-400 text-xs font-bold uppercase mt-6 flex items-center justify-center gap-2">
                  <Shield size={14} /> Secure SSL Encrypted Payment
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBills;
