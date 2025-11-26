import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Bill from "../models/Bill.js";

// Get health data (tips, score, recent activities)
export const getHealthData = async (req, res) => {
  try {
    // Health tips - can be stored in database or returned as static data
    const healthTips = [
      {
        emoji: "🦷",
        title: "Brush twice daily",
        description: "Morning and night for 2 minutes",
      },
      {
        emoji: "🧵",
        title: "Floss regularly",
        description: "Remove food particles between teeth",
      },
      {
        emoji: "🍎",
        title: "Healthy diet",
        description: "Limit sugary foods and drinks",
      },
      {
        emoji: "👨‍⚕️",
        title: "Regular checkups",
        description: "Visit dentist every 6 months",
      },
      {
        emoji: "💧",
        title: "Stay hydrated",
        description: "Drink plenty of water to maintain saliva production",
      },
      {
        emoji: "🚭",
        title: "Avoid tobacco",
        description: "Tobacco increases risk of gum disease and oral cancer",
      },
    ];

    // Calculate health score based on recent appointments
    // If user is authenticated, get their specific data
    let healthScore = 85; // Default score
    let recentActivities = [];

    // Try to get patient ID from token or query params
    const patientId = req.query.patientId || req.user?.id;

    if (patientId) {
      try {
        // Get all recent appointments for the patient (all statuses)
        const appointments = await Appointment.find({
          patient: patientId,
        })
          .populate("doctor", "fullName specialization")
          .sort({ startTime: -1 })
          .limit(10);

        // Get recent bills for the patient
        const bills = await Bill.find({
          patient: patientId,
        })
          .populate("doctor", "fullName")
          .sort({ createdAt: -1 })
          .limit(5);

        // Calculate health score based on appointment frequency
        // More recent appointments = better score
        const now = new Date();
        const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        const completedAppointments = appointments.filter(
          (apt) => apt.status === "completed" && new Date(apt.startTime) >= sixMonthsAgo
        );

        if (completedAppointments.length >= 2) {
          healthScore = 90;
        } else if (completedAppointments.length === 1) {
          healthScore = 80;
        } else if (appointments.length > 0) {
          healthScore = 75;
        } else {
          healthScore = 70;
        }

        // Format appointments as activities
        const appointmentActivities = appointments.map((apt) => {
          let title = "Dental Appointment";
          const status = apt.status || "pending";
          
          // Better titles based on status and notes
          if (apt.notes) {
            title = apt.notes;
          } else if (status === "completed") {
            title = "Completed Treatment";
          } else if (status === "confirmed") {
            title = "Confirmed Appointment";
          } else if (status === "pending") {
            title = "Pending Appointment";
          } else if (status === "cancelled") {
            title = "Cancelled Appointment";
          }

          return {
            type: "appointment",
            title: title,
            description: apt.doctor?.fullName || "Dental Care Center",
            date: new Date(apt.startTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            timestamp: new Date(apt.startTime).getTime(),
            status: status,
            teleconsult: apt.teleconsult || false,
          };
        });

        // Format bills as activities
        const billActivities = bills.map((bill) => {
          let title = "Bill Payment";
          if (bill.status === "paid") {
            title = `Payment Received - ${bill.service}`;
          } else if (bill.status === "pending") {
            title = `Pending Payment - ${bill.service}`;
          } else {
            title = `Bill - ${bill.service}`;
          }

          return {
            type: "bill",
            title: title,
            description: bill.doctor?.fullName || "Dental Care Center",
            date: new Date(bill.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            timestamp: new Date(bill.createdAt).getTime(),
            status: bill.status,
            amount: bill.total,
            billNumber: bill.billNumber,
          };
        });

        // Combine and sort all activities by timestamp (most recent first)
        const allActivities = [...appointmentActivities, ...billActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5) // Get top 5 most recent
          .map(({ timestamp, ...rest }) => rest); // Remove timestamp from response

        recentActivities = allActivities;
      } catch (error) {
        console.error("Error fetching patient health data:", error);
        // Continue with default values
      }
    } else {
      // For unauthenticated users, show sample data
      recentActivities = [
        {
          type: "appointment",
          title: "Last Checkup",
          description: "Dr. Kamal Fernando",
          date: "Dec 15, 2023",
          status: "completed",
        },
        {
          type: "bill",
          title: "Payment Received - Teeth Cleaning",
          description: "Dr. Sameera Perera",
          date: "Nov 20, 2023",
          status: "paid",
        },
        {
          type: "appointment",
          title: "X-Ray Scan",
          description: "Dental Care Center",
          date: "Oct 10, 2023",
          status: "completed",
        },
      ];
    }

    // Determine health status based on score
    let healthStatus = "Good";
    if (healthScore >= 90) {
      healthStatus = "Excellent";
    } else if (healthScore >= 80) {
      healthStatus = "Good";
    } else if (healthScore >= 70) {
      healthStatus = "Fair";
    } else {
      healthStatus = "Needs Attention";
    }

    res.json({
      healthScore,
      healthStatus,
      tips: healthTips,
      recentActivities,
    });
  } catch (error) {
    console.error("Error in getHealthData:", error);
    res.status(500).json({
      message: "Error fetching health data",
      error: error.message,
    });
  }
};

// Get health tips only
export const getHealthTips = async (req, res) => {
  try {
    const healthTips = [
      {
        emoji: "🦷",
        title: "Brush twice daily",
        description: "Morning and night for 2 minutes",
      },
      {
        emoji: "🧵",
        title: "Floss regularly",
        description: "Remove food particles between teeth",
      },
      {
        emoji: "🍎",
        title: "Healthy diet",
        description: "Limit sugary foods and drinks",
      },
      {
        emoji: "👨‍⚕️",
        title: "Regular checkups",
        description: "Visit dentist every 6 months",
      },
      {
        emoji: "💧",
        title: "Stay hydrated",
        description: "Drink plenty of water to maintain saliva production",
      },
      {
        emoji: "🚭",
        title: "Avoid tobacco",
        description: "Tobacco increases risk of gum disease and oral cancer",
      },
    ];

    res.json({ tips: healthTips });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching health tips",
      error: error.message,
    });
  }
};

