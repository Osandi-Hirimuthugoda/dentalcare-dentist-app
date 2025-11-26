import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DoctorAvailability from "../models/DoctorAvailability.js";
import Appointment from "../models/Appointment.js";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// 🔹 Register Doctor
export const registerDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      licenseNumber,
      specialization,
      qualifications,
      hospital,
      experience,
      services,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !licenseNumber) {
      return res.status(400).json({ 
        message: "Please provide all required fields: fullName, email, phone, password, licenseNumber" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check existing doctor (normalize email to lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    const doctorExists = await Doctor.findOne({ email: normalizedEmail });
    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists with this email" });
    }

    // Create doctor (password will be hashed automatically by the model's pre-save hook)
    const doctor = await Doctor.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: password, // Will be hashed by pre-save hook
      licenseNumber: licenseNumber.trim(),
      specialization: specialization?.trim(),
      qualifications: qualifications?.trim(),
      hospital: hospital?.trim(),
      experience: experience ? parseInt(experience) : undefined,
      services: services || [],
    });

    // Return doctor without password
    const doctorData = {
      _id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      licenseNumber: doctor.licenseNumber,
      specialization: doctor.specialization,
      qualifications: doctor.qualifications,
      hospital: doctor.hospital,
      experience: doctor.experience,
      services: doctor.services || [],
      createdAt: doctor.createdAt,
    };

    console.log(` Doctor registered successfully: ${doctor.email}`);

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: doctorData,
    });
  } catch (error) {
    console.error(" Error registering doctor:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "An account with this email already exists" 
      });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    
    res.status(500).json({ 
      message: "Error registering doctor", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

// 🔹 Login Doctor
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();
    
    const doctor = await Doctor.findOne({ email: normalizedEmail });

    if (!doctor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!doctor.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, doctor.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid email or password. Please check your credentials and try again." 
      });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" }, 
      JWT_SECRET, 
      { expiresIn: "30d" }
    );

    // Return doctor without password
    const doctorData = {
      _id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      licenseNumber: doctor.licenseNumber,
      specialization: doctor.specialization,
      qualifications: doctor.qualifications,
      hospital: doctor.hospital,
      experience: doctor.experience,
      services: doctor.services || [],
      createdAt: doctor.createdAt,
    };

    res.status(200).json({ 
      message: "Login successful",
      token, 
      doctor: doctorData 
    });
  } catch (error) {
    console.error(" Doctor login error:", error);
    res.status(500).json({ message: error.message || "Login failed. Please try again later." });
  }
};

// 🔹 Get Doctor Profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(" Error fetching doctor profile:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// 🔹 Get All Doctors (Admin only)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .sort({ 
        averageRating: -1,
        totalReviews: -1,
        createdAt: -1
      });
    
    const doctorsWithRatings = doctors.map(doctor => ({
      ...doctor.toObject(),
      averageRating: doctor.averageRating || 0,
      totalReviews: doctor.totalReviews || 0,
    }));
    
    res.status(200).json(doctorsWithRatings);
  } catch (error) {
    console.error(" Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

// 🔹 Get Available Doctors at Current Time
export const getAvailableDoctorsNow = async (req, res) => {
  try {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes

    // Get all doctors
    const allDoctors = await Doctor.find().select("-password");

    // Get all availabilities
    const availabilities = await DoctorAvailability.find().populate("doctor");

    const availableDoctors = [];

    for (const doctor of allDoctors) {
      const availability = availabilities.find(av => av.doctor._id.toString() === doctor._id.toString());
      
      if (!availability || !availability.weeklySchedule || availability.weeklySchedule.length === 0) {
        // If no availability set, consider doctor as available (for emergency)
        availableDoctors.push({
          ...doctor.toObject(),
          availableNow: true,
          reason: "Available for emergency",
        });
        continue;
      }

      // Check if today is in unavailable dates
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const isUnavailable = availability.unavailableDates.some(unav => {
        const unavDate = new Date(unav.date);
        unavDate.setHours(0, 0, 0, 0);
        return unavDate.getTime() === today.getTime();
      });

      if (isUnavailable) {
        continue; // Skip this doctor
      }

      // Check for special date
      const specialDate = availability.specialDates.find(spec => {
        const specDate = new Date(spec.date);
        specDate.setHours(0, 0, 0, 0);
        return specDate.getTime() === today.getTime() && spec.isAvailable;
      });

      let startTime, endTime;
      if (specialDate) {
        startTime = parseTimeToMinutes(specialDate.startTime);
        endTime = parseTimeToMinutes(specialDate.endTime);
      } else {
        // Check weekly schedule
        const daySchedule = availability.weeklySchedule.find(
          sched => sched.dayOfWeek === currentDay && sched.isAvailable
        );
        
        if (!daySchedule) {
          continue; // Not available today
        }
        
        startTime = parseTimeToMinutes(daySchedule.startTime);
        endTime = parseTimeToMinutes(daySchedule.endTime);
      }

      // Check if current time is within available hours
      if (currentTime >= startTime && currentTime <= endTime) {
        // Check if doctor has appointments at this time
        const appointmentStart = new Date(now);
        appointmentStart.setMinutes(0);
        appointmentStart.setSeconds(0);
        appointmentStart.setMilliseconds(0);
        
        const appointmentEnd = new Date(now);
        appointmentEnd.setMinutes(59);
        appointmentEnd.setSeconds(59);
        appointmentEnd.setMilliseconds(999);

        const existingAppointment = await Appointment.findOne({
          doctor: doctor._id,
          startTime: {
            $gte: appointmentStart,
            $lte: appointmentEnd,
          },
          status: { $in: ["pending", "confirmed"] },
        });

        if (!existingAppointment) {
          availableDoctors.push({
            ...doctor.toObject(),
            availableNow: true,
            reason: "Available now",
            nextAvailableSlot: formatTimeFromMinutes(currentTime),
          });
        }
      }
    }

    res.status(200).json({
      currentTime: now.toISOString(),
      availableDoctors: availableDoctors.slice(0, 10), // Limit to 10 doctors
      totalAvailable: availableDoctors.length,
    });
  } catch (error) {
    console.error(" Error fetching available doctors:", error);
    res.status(500).json({ 
      message: "Error fetching available doctors", 
      error: error.message 
    });
  }
};

// Helper function to parse time string to minutes
function parseTimeToMinutes(timeString) {
  if (!timeString) return 540; // Default to 9:00 AM
  
  const parts = timeString.split(':');
  let hours = parseInt(parts[0]) || 9;
  const minutes = parseInt(parts[1]) || 0;
  
  // Handle AM/PM if present
  if (parts[1] && (parts[1].includes('AM') || parts[1].includes('PM'))) {
    const timePart = parts[1].replace(/\s*(AM|PM)/i, '');
    hours = parseInt(parts[0]);
    const minutes = parseInt(timePart) || 0;
    const ampm = parts[1].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }
  
  return hours * 60 + minutes;
}

// Helper function to format minutes to time string
function formatTimeFromMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
}

// 🔹 Change Password
export const changePassword = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters" 
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password (will be hashed by pre-save hook)
    doctor.password = newPassword;
    await doctor.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(" Error changing password:", error);
    res.status(500).json({ 
      message: "Error changing password", 
      error: error.message 
    });
  }
};

// 🔹 Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      fullName,
      phone,
      specialization,
      qualifications,
      hospital,
      experience,
    } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        fullName,
        phone,
        specialization,
        qualifications,
        hospital,
        experience,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      doctor,
    });
  } catch (error) {
    console.error(" Error updating doctor profile:", error);
    res.status(500).json({ 
      message: "Error updating profile", 
      error: error.message 
    });
  }
};

// 🔹 Update Doctor Services
export const updateDoctorServices = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { services } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { services: services || [] },
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Services updated successfully",
      doctor,
    });
  } catch (error) {
    console.error(" Error updating doctor services:", error);
    res.status(500).json({ 
      message: "Error updating services", 
      error: error.message 
    });
  }
};

// 🔹 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        message: "Email and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters" 
      });
    }

    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.password = newPassword;
    await doctor.save();

    res.status(200).json({ 
      message: "Password reset successfully. Please login with your new password." 
    });
  } catch (error) {
    console.error(" Error resetting password:", error);
    res.status(500).json({ 
      message: "Error resetting password", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};
