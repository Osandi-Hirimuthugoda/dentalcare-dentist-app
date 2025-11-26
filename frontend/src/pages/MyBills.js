import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Receipt, Wallet, CreditCard, Plus, CheckCircle, XCircle, Clock, DollarSign, Lock, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Footer from "../components/Footer";

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
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
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bills/patient", {
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

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/wallet/balance", {
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
        alert(`Wallet top-up successful! New balance: LKR ${response.data.newBalance.toLocaleString()}`);
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
        "/api/wallet/pay-bill",
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold text-cyan-700 flex items-center space-x-2">
                <Receipt size={28} />
                <span>My Bills & Payments</span>
              </h1>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Plus size={18} />
              <span>Top Up Wallet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg p-6 text-white mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm mb-1">DentalCare+ Wallet</p>
              <h2 className="text-3xl font-bold">
                LKR {walletBalance.toLocaleString()}
              </h2>
            </div>
            <Wallet size={48} className="text-cyan-200" />
          </div>
        </motion.div>

        {/* Bills List */}
        <div className="space-y-4">
          {bills.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <Receipt size={64} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No bills found</p>
            </motion.div>
          ) : (
            bills.map((bill, index) => (
              <motion.div
                key={bill._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {bill.treatment || bill.service || "Dental Service"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                          bill.status
                        )}`}
                      >
                        {getStatusIcon(bill.status)}
                        <span>{bill.status || "Pending"}</span>
                      </span>
                    </div>
                    {bill.doctorName && (
                      <p className="text-sm text-gray-600 mb-1">
                        Doctor: {bill.doctorName}
                      </p>
                    )}
                    {bill.date && (
                      <p className="text-sm text-gray-500">
                        Date: {bill.date}
                      </p>
                    )}
                    {bill.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {bill.dueDate}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-gray-800 mb-2">
                      {bill.amount || `LKR ${bill.total?.toLocaleString() || 0}`}
                    </p>
                    {bill.status?.toLowerCase() !== "paid" && (
                      <button
                        onClick={() => handlePayWithWallet(bill._id)}
                        disabled={walletBalance < (bill.total || parseFloat(bill.amount?.replace(/[^0-9.]/g, "") || 0))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          walletBalance >= (bill.total || parseFloat(bill.amount?.replace(/[^0-9.]/g, "") || 0))
                            ? "bg-cyan-600 text-white hover:bg-cyan-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

      {/* Top-Up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTopUp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <Wallet size={24} className="text-cyan-600" />
                    <span>Top Up Wallet</span>
                  </h2>
                  <button
                    onClick={() => setShowTopUp(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Amount Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <DollarSign size={18} className="text-cyan-600" />
                    <span>Select Top-Up Amount</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[5000, 10000, 15000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCardDetails({ ...cardDetails, customAmount: "" });
                        }}
                        className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedAmount === amount && !cardDetails.customAmount
                            ? "border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 shadow-md"
                            : "border-gray-200 hover:border-cyan-300 hover:bg-gray-50"
                        }`}
                      >
                        <DollarSign 
                          size={20} 
                          className={`mx-auto mb-1 ${
                            selectedAmount === amount && !cardDetails.customAmount
                              ? "text-cyan-600"
                              : "text-gray-400"
                          }`} 
                        />
                        <p className={`font-bold text-sm ${
                          selectedAmount === amount && !cardDetails.customAmount
                            ? "text-cyan-700"
                            : "text-gray-600"
                        }`}>
                          LKR {(amount / 1000).toFixed(0)}K
                        </p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Enter Custom Amount
                    </label>
                    <div className="relative">
                      <DollarSign 
                        size={18} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                      />
                      <input
                        type="number"
                        placeholder="Enter amount (min: LKR 100)"
                        min="100"
                        value={cardDetails.customAmount || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCardDetails({ ...cardDetails, customAmount: value });
                          if (value) {
                            setSelectedAmount(null);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      />
                    </div>
                    {cardDetails.customAmount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Amount: LKR {parseInt(cardDetails.customAmount || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Preview */}
                <div className="mb-6">
                  <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg overflow-hidden">
                    {/* Card Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <CreditCard size={20} className="text-cyan-600" />
                          </div>
                          <span className="text-sm font-medium opacity-90">DentalCare+</span>
                        </div>
                        <Shield size={24} className="opacity-80" />
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-xs opacity-75 mb-2">Card Number</p>
                        <p className="text-xl font-mono tracking-wider">
                          {cardDetails.cardNumber || "•••• •••• •••• ••••"}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs opacity-75 mb-1">Card Holder</p>
                          <p className="text-sm font-medium">
                            {cardDetails.cardHolder || "YOUR NAME"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-75 mb-1">Expires</p>
                          <p className="text-sm font-medium">
                            {cardDetails.expiryDate || "MM/YY"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Details Form */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lock size={18} className="text-cyan-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Card Details</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <CreditCard size={16} />
                      <span>Card Number</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength="19"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                          const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                          setCardDetails({ ...cardDetails, cardNumber: formatted });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-lg font-mono"
                      />
                      {cardDetails.cardNumber && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {cardDetails.cardNumber.replace(/\s/g, "").startsWith("4") ? (
                            <span className="text-blue-600 font-bold text-xs">VISA</span>
                          ) : cardDetails.cardNumber.replace(/\s/g, "").startsWith("5") ? (
                            <span className="text-red-500 font-bold text-xs">MC</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter cardholder name"
                      value={cardDetails.cardHolder}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cardHolder: e.target.value.toUpperCase() })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4);
                          }
                          setCardDetails({ ...cardDetails, expiryDate: value });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <Lock size={14} />
                        <span>CVV</span>
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="4"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value.replace(/\D/g, "")
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <Shield size={14} className="text-green-600" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleTopUp}
                  disabled={(!selectedAmount && !cardDetails.customAmount) || processing}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg ${
                    (!selectedAmount && !cardDetails.customAmount) || processing
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>
                        Secure Payment - Top Up LKR{" "}
                        {(cardDetails.customAmount
                          ? parseInt(cardDetails.customAmount) || 0
                          : selectedAmount || 0
                        ).toLocaleString()}
                      </span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center space-x-1">
                  <Shield size={12} />
                  <span>Secured by SSL encryption</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyBills;

