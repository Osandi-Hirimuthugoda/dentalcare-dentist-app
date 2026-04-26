import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Wallet as WalletIcon, CreditCard, 
  Plus, History, TrendingUp, Shield, Lock, 
  DollarSign, CheckCircle, XCircle, Clock, Search, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    customAmount: ""
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [balanceRes, transRes] = await Promise.all([
        axios.get("/api/wallet/info", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/wallet/transactions", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBalance(balanceRes.data.balance || 0);
      setTransactions(transRes.data || []);
    } catch (err) {
      console.error("Wallet data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = cardDetails.customAmount ? parseInt(cardDetails.customAmount) : selectedAmount;
    if (!amount || amount < 100) return alert("Min LKR 100 required");
    
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const cleanNum = cardDetails.cardNumber.replace(/\s/g, "");
      
      const res = await axios.post("/api/wallet/topup", {
        amount,
        paymentMethod: "card",
        cardDetails: {
          cardType: cleanNum.startsWith("4") ? "Visa" : "MasterCard",
          last4Digits: cleanNum.slice(-4),
          cardHolder: cardDetails.cardHolder
        }
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        alert("Top-up successful!");
        setShowTopUp(false);
        fetchWalletData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">My Wallet</h2>
        <button 
          onClick={() => setShowTopUp(true)}
          className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
        >
          <Plus size={18} />
          Top Up
        </button>
      </div>

      <div className="max-w-5xl space-y-8">
        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
          >
            <div className="relative z-10">
              <p className="text-slate-400 font-medium mb-1">Available Balance</p>
              <h2 className="text-5xl font-black mb-6">LKR {balance.toLocaleString()}</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                  <Shield size={14} className="text-emerald-400" />
                  Secured Wallet
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                  <TrendingUp size={14} className="text-cyan-400" />
                  Verified Account
                </div>
              </div>
            </div>
            <WalletIcon size={180} className="absolute -right-10 -bottom-10 text-white/5 transform rotate-12" />
          </motion.div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mx-auto">
               <TrendingUp size={32} />
             </div>
             <div>
               <p className="text-slate-500 text-sm">Monthly Spend</p>
               <h3 className="text-2xl font-bold text-slate-800">LKR 12,450</h3>
               <p className="text-xs text-emerald-600 font-bold mt-1">2.4% less than last month</p>
             </div>
          </div>
        </div>

        {/* Transactions List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-500 transition-all"><Search size={18}/></button>
               <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-500 transition-all"><Filter size={18}/></button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading your transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <History size={40} />
                </div>
                <p className="text-slate-500 font-medium">No transactions found yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((t, i) => (
                  <TransactionItem key={i} transaction={t} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Top Up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowTopUp(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-800">Top Up Wallet</h3>
                  <button onClick={() => setShowTopUp(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <XCircle size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Select Amount</p>
                   <div className="grid grid-cols-3 gap-3">
                     {[2000, 5000, 10000].map(amt => (
                       <button 
                         key={amt}
                         onClick={() => { setSelectedAmount(amt); setCardDetails({...cardDetails, customAmount: ""}); }}
                         className={`py-4 rounded-2xl border-2 transition-all font-bold ${
                           (selectedAmount === amt && !cardDetails.customAmount)
                           ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                           : "border-slate-100 hover:border-cyan-200 text-slate-600"
                         }`}
                       >
                         {amt / 1000}K
                       </button>
                     ))}
                   </div>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                     <input 
                       type="number"
                       placeholder="Enter custom amount"
                       className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-bold"
                       value={cardDetails.customAmount}
                       onChange={(e) => { 
                         setCardDetails({...cardDetails, customAmount: e.target.value}); 
                         setSelectedAmount(null); 
                       }}
                     />
                   </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Card Details</p>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Card Number"
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-mono"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Card Holder Name"
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500"
                      value={cardDetails.cardHolder}
                      onChange={(e) => setCardDetails({...cardDetails, cardHolder: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-mono"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                      />
                      <input 
                        type="password" 
                        placeholder="CVV"
                        className="px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-mono"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleTopUp}
                  disabled={processing}
                  className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-black text-lg hover:bg-cyan-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-600/30"
                >
                  {processing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Lock size={20}/> Pay Securely</>}
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Shield size={14} /> Secure Encrypted Payment
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TransactionItem = ({ transaction: t }) => {
  const isTopup = t.type === 'topup' || t.type === 'refund';
  return (
    <div className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isTopup ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isTopup ? <TrendingUp size={24}/> : <CreditCard size={24}/>}
        </div>
        <div>
          <p className="font-bold text-slate-800">{t.description || t.type}</p>
          <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-xs font-medium">
             <Clock size={12}/>
             {new Date(t.createdAt).toLocaleDateString()} • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-black ${isTopup ? 'text-emerald-600' : 'text-slate-800'}`}>
          {isTopup ? '+' : '-'} LKR {(t.amount || 0).toLocaleString()}
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
           <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t.status || 'pending'}</span>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
