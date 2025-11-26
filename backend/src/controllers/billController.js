import Bill from "../models/Bill.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/doctorModel.js";
import Payment from "../models/Payment.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Service costs mapping
const SERVICE_COSTS = {
  'Dental Checkups & Consultations': 2500,
  'Teeth Cleaning (Scaling & Polishing)': 3000,
  'Cavity Filling': 4500,
  'Tooth Extraction': 5000,
  'Root Canal Treatment (RCT)': 12000,
  'Braces & Teeth Alignment (Orthodontics)': 5000,
  'Teeth Whitening': 8000,
  'Dental Crowns & Bridges': 15000,
  'Dental Implants & Dentures': 50000,
  'Emergency Dental Care': 4000,
};

// Helper to get service cost
const getServiceCost = (serviceName) => {
  for (const [key, value] of Object.entries(SERVICE_COSTS)) {
    if (serviceName.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      return value;
    }
  }
  return 3000; // Default cost
};

// Get all bills for a patient
export const getPatientBills = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const bills = await Bill.find({ patient: user.id })
      .populate("patient", "name email phone")
      .populate("doctor", "fullName specialization email")
      .populate("appointment", "startTime status notes")
      .sort({ createdAt: -1 });
    
    // Format bills for mobile app
    const formattedBills = bills.map((bill) => {
      // Determine status color and icon
      let statusColor = 'orange';
      let icon = 'pending_actions';
      
      if (bill.status === 'paid') {
        statusColor = 'green';
        icon = 'receipt';
      } else if (bill.status === 'overdue') {
        statusColor = 'red';
        icon = 'error';
      } else if (bill.status === 'pending') {
        statusColor = 'orange';
        icon = 'pending_actions';
      }
      
      // Format date
      const billDate = new Date(bill.createdAt);
      const formattedDate = billDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Format due date
      const dueDate = new Date(bill.dueDate);
      const formattedDueDate = dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return {
        id: bill.billNumber,
        _id: bill._id.toString(),
        treatment: bill.service,
        date: formattedDate,
        amount: `LKR ${bill.total.toLocaleString()}`,
        status: bill.status.charAt(0).toUpperCase() + bill.status.slice(1),
        color: statusColor,
        icon: icon,
        dueDate: formattedDueDate,
        appointmentId: bill.appointment?._id?.toString(),
        doctorName: bill.doctor?.fullName || 'Unknown Doctor',
      };
    });
    
    res.status(200).json(formattedBills);
  } catch (err) {
    console.error("❌ Error fetching patient bills:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get a single bill by ID
export const getBillById = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const bill = await Bill.findOne({ 
      _id: req.params.id,
      patient: user.id 
    })
      .populate("patient", "name email phone")
      .populate("doctor", "fullName specialization email")
      .populate("appointment", "startTime status notes");
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    
    res.status(200).json(bill);
  } catch (err) {
    console.error(" Error fetching bill:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create a bill from an appointment
export const createBillFromAppointment = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    // Check if appointment exists and belongs to patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: user.id
    }).populate("doctor", "fullName specialization");
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Check if bill already exists for this appointment
    const existingBill = await Bill.findOne({ appointment: appointmentId });
    if (existingBill) {
      return res.status(400).json({ 
        message: "Bill already exists for this appointment",
        bill: existingBill
      });
    }
    
    // Extract service name from appointment notes
    let serviceName = 'Dental Checkups & Consultations'; // Default
    if (appointment.notes) {
      const parts = appointment.notes.split(':');
      if (parts.length > 0) {
        serviceName = parts[0].trim();
      }
    }
    
    // Calculate amount
    const amount = getServiceCost(serviceName);
    const subtotal = amount;
    const tax = 0; // No tax for now
    const discount = 0;
    const total = subtotal + tax - discount;
    
    // Set due date (30 days from appointment date or current date)
    const dueDate = new Date(appointment.startTime);
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Create bill
    const bill = new Bill({
      patient: user.id,
      appointment: appointmentId,
      doctor: appointment.doctor?._id,
      service: serviceName,
      amount: amount,
      status: 'pending',
      dueDate: dueDate,
      description: appointment.notes || `Bill for ${serviceName}`,
      items: [{
        description: serviceName,
        quantity: 1,
        price: amount,
        subtotal: amount
      }],
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total: total
    });
    
    await bill.save();
    await bill.populate("patient", "name email phone");
    await bill.populate("doctor", "fullName specialization");
    await bill.populate("appointment", "startTime status notes");
    
    console.log(`Bill created: ${bill.billNumber} for appointment ${appointmentId}`);
    
    res.status(201).json(bill);
  } catch (err) {
    console.error("Error creating bill:", err);
    res.status(500).json({ message: err.message });
  }
};

// Process payment
export const processPayment = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { billId, paymentMethod, cardDetails } = req.body;
    
    if (!billId || !paymentMethod) {
      return res.status(400).json({ 
        message: "Bill ID and payment method are required" 
      });
    }
    
    // Find bill
    const bill = await Bill.findOne({ 
      _id: billId,
      patient: user.id 
    });
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    
    if (bill.status === 'paid') {
      return res.status(400).json({ message: "Bill is already paid" });
    }
    
    // Create payment record
    const payment = new Payment({
      bill: billId,
      patient: user.id,
      amount: bill.total,
      paymentMethod: paymentMethod,
      status: paymentMethod === 'card' ? 'pending' : 'completed',
      cardDetails: cardDetails ? {
        cardType: cardDetails.cardType,
        last4Digits: cardDetails.last4Digits,
        cardHolder: cardDetails.cardHolder
      } : undefined,
      processedAt: new Date()
    });
    
    // Simulate payment processing (for card payments)
    if (paymentMethod === 'card') {
      // In production, integrate with payment gateway (Stripe, PayPal, etc.)
      // For now, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      payment.status = 'completed';
      payment.gatewayTransactionId = `GW${Date.now()}`;
    }
    
    await payment.save();
    
    // Update bill status
    bill.status = 'paid';
    bill.paidDate = new Date();
    await bill.save();
    
    console.log(`Payment processed: ${payment.transactionId} for bill ${bill.billNumber}`);
    
    res.status(201).json({
      success: true,
      payment: payment,
      bill: bill,
      message: "Payment processed successfully"
    });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get payment history for a patient
export const getPatientPayments = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const payments = await Payment.find({ patient: user.id })
      .populate("bill", "billNumber service amount")
      .sort({ createdAt: -1 });
    
    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ message: err.message });
  }
};

// Auto-generate bills for completed appointments
export const generateBillsForCompletedAppointments = async (req, res) => {
  try {
    // Find all completed appointments without bills
    const completedAppointments = await Appointment.find({
      status: 'completed'
    }).populate("doctor", "fullName specialization");
    
    const billsCreated = [];
    
    for (const appointment of completedAppointments) {
      // Check if bill already exists
      const existingBill = await Bill.findOne({ appointment: appointment._id });
      if (existingBill) continue;
      
      // Extract service name
      let serviceName = 'Dental Checkups & Consultations';
      if (appointment.notes) {
        const parts = appointment.notes.split(':');
        if (parts.length > 0) {
          serviceName = parts[0].trim();
        }
      }
      
      // Calculate amount
      const amount = getServiceCost(serviceName);
      const subtotal = amount;
      const tax = 0;
      const discount = 0;
      const total = subtotal + tax - discount;
      
      // Set due date
      const dueDate = new Date(appointment.startTime);
      dueDate.setDate(dueDate.getDate() + 30);
      
      // Create bill
      const bill = new Bill({
        patient: appointment.patient,
        appointment: appointment._id,
        doctor: appointment.doctor?._id,
        service: serviceName,
        amount: amount,
        status: 'pending',
        dueDate: dueDate,
        description: appointment.notes || `Bill for ${serviceName}`,
        items: [{
          description: serviceName,
          quantity: 1,
          price: amount,
          subtotal: amount
        }],
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total
      });
      
      await bill.save();
      billsCreated.push(bill);
    }
    
    console.log(`Generated ${billsCreated.length} bills for completed appointments`);
    
    res.status(200).json({
      message: `Generated ${billsCreated.length} bills`,
      bills: billsCreated
    });
  } catch (err) {
    console.error("Error generating bills:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all bills for a doctor (for doctor dashboard)
export const getDoctorBills = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const doctorId = user.id;
    
    const bills = await Bill.find({ doctor: doctorId })
      .populate("patient", "name email phone age gender")
      .populate("appointment", "startTime status notes")
      .sort({ createdAt: -1 });
    
    res.status(200).json(bills);
  } catch (err) {
    console.error("Error fetching doctor bills:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get payment statistics for a doctor
export const getDoctorPaymentStats = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const doctorId = user.id;
    
    // Get all bills for this doctor
    const bills = await Bill.find({ doctor: doctorId });
    
    // Calculate statistics
    const totalBills = bills.length;
    const paidBills = bills.filter(b => b.status === 'paid').length;
    const pendingBills = bills.filter(b => b.status === 'pending').length;
    const overdueBills = bills.filter(b => b.status === 'overdue').length;
    
    const totalAmount = bills.reduce((sum, bill) => sum + bill.total, 0);
    const paidAmount = bills
      .filter(b => b.status === 'paid')
      .reduce((sum, bill) => sum + bill.total, 0);
    const pendingAmount = bills
      .filter(b => b.status === 'pending' || b.status === 'overdue')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    // Get payments for this doctor's bills
    const billIds = bills.map(b => b._id);
    const payments = await Payment.find({ 
      bill: { $in: billIds },
      status: 'completed'
    }).populate("bill", "billNumber service");
    
    // Monthly statistics (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyPayments = payments.filter(p => new Date(p.createdAt) >= startOfMonth);
    const monthlyAmount = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    res.status(200).json({
      totalBills,
      paidBills,
      pendingBills,
      overdueBills,
      totalAmount,
      paidAmount,
      pendingAmount,
      monthlyAmount,
      monthlyPayments: monthlyPayments.length,
      recentPayments: payments.slice(0, 10) // Last 10 payments
    });
  } catch (err) {
    console.error("Error fetching payment stats:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get payments for a doctor's bills
export const getDoctorPayments = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const doctorId = user.id;
    
    // Get all bills for this doctor
    const bills = await Bill.find({ doctor: doctorId });
    const billIds = bills.map(b => b._id);
    
    // Get all payments for these bills
    const payments = await Payment.find({ bill: { $in: billIds } })
      .populate("bill", "billNumber service amount")
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 });
    
    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching doctor payments:", err);
    res.status(500).json({ message: err.message });
  }
};

