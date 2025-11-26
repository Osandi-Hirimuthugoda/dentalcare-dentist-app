import DoctorAvailability from "../models/DoctorAvailability.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/Appointment.js";

// 📅 Get doctor availability
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    let availability = await DoctorAvailability.findOne({ doctor: doctorId });
    
    // If no availability set, return default
    if (!availability) {
      return res.status(200).json({
        doctor: doctorId,
        weeklySchedule: [],
        unavailableDates: [],
        specialDates: [],
        appointmentDuration: 30,
        slotInterval: 30,
        availableSlots: [] // No slots if not configured
      });
    }
    
    // Generate available time slots for next 30 days
    const availableSlots = await generateAvailableSlots(doctorId, availability);
    
    res.status(200).json({
      ...availability.toObject(),
      availableSlots
    });
  } catch (error) {
    console.error(" Error fetching doctor availability:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update doctor availability
export const updateDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      weeklySchedule,
      unavailableDates,
      specialDates,
      appointmentDuration,
      slotInterval
    } = req.body;
    
    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    // Find or create availability
    let availability = await DoctorAvailability.findOne({ doctor: doctorId });
    
    if (!availability) {
      availability = new DoctorAvailability({
        doctor: doctorId,
        weeklySchedule: weeklySchedule || [],
        unavailableDates: unavailableDates || [],
        specialDates: specialDates || [],
        appointmentDuration: appointmentDuration || 30,
        slotInterval: slotInterval || 30
      });
    } else {
      if (weeklySchedule !== undefined) availability.weeklySchedule = weeklySchedule;
      if (unavailableDates !== undefined) availability.unavailableDates = unavailableDates;
      if (specialDates !== undefined) availability.specialDates = specialDates;
      if (appointmentDuration !== undefined) availability.appointmentDuration = appointmentDuration;
      if (slotInterval !== undefined) availability.slotInterval = slotInterval;
    }
    
    await availability.save();
    
    console.log(` Doctor availability updated for: ${doctor.fullName}`);
    
    res.status(200).json({
      message: "Availability updated successfully",
      availability
    });
  } catch (error) {
    console.error(" Error updating doctor availability:", error);
    res.status(500).json({ message: error.message });
  }
};

//  Helper function to generate available time slots
async function generateAvailableSlots(doctorId, availability) {
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate slots for next 60 days
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dayOfWeek = date.getDay();
    
    // Skip past dates
    if (date < today) continue;
    
    // Check if date is in unavailable dates
    const isUnavailable = availability.unavailableDates.some(unav => {
      const unavDate = new Date(unav.date);
      unavDate.setHours(0, 0, 0, 0);
      return unavDate.getTime() === date.getTime();
    });
    
    if (isUnavailable) continue;
    
    // Check for special date
    const specialDate = availability.specialDates.find(spec => {
      const specDate = new Date(spec.date);
      specDate.setHours(0, 0, 0, 0);
      return specDate.getTime() === date.getTime() && spec.isAvailable;
    });
    
    let startTime, endTime;
    if (specialDate) {
      // Use special date times
      startTime = parseTime(specialDate.startTime);
      endTime = parseTime(specialDate.endTime);
    } else {
      // Use weekly schedule
      const daySchedule = availability.weeklySchedule.find(
        sched => sched.dayOfWeek === dayOfWeek && sched.isAvailable
      );
      if (!daySchedule) continue;
      
      startTime = parseTime(daySchedule.startTime);
      endTime = parseTime(daySchedule.endTime);
    }
    
    // Generate time slots for this day
    const daySlots = generateTimeSlots(
      date,
      startTime,
      endTime,
      availability.slotInterval || 30,
      availability.appointmentDuration || 30
    );
    
    // Check existing appointments and filter out booked slots
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      startTime: {
        $gte: dayStart,
        $lt: dayEnd
      },
      status: { $in: ["pending", "confirmed"] }
    });
    
    const bookedTimes = existingAppointments.map(apt => {
      const aptTime = new Date(apt.startTime);
      const hours = aptTime.getHours();
      const minutes = aptTime.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    });
    
    // Filter out booked slots and add date info
    daySlots.forEach(slot => {
      const slotTimeStr = slot.time || slot;
      if (!bookedTimes.includes(slotTimeStr)) {
        slots.push({
          date: date.toISOString().split('T')[0], // YYYY-MM-DD
          time: slotTimeStr,
          display: slot.displayTime || slotTimeStr,
        });
      }
    });
  }
  
  return slots;
}

// Helper function to parse time string (e.g., "09:00" or "9:00 AM")
function parseTime(timeString) {
  if (!timeString) return { hours: 9, minutes: 0 };
  
  // Handle 24-hour format (e.g., "09:00")
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    let hours = parseInt(parts[0]);
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
    
    return { hours, minutes };
  }
  
  return { hours: 9, minutes: 0 };
}

// Helper function to generate time slots for a day
function generateTimeSlots(date, startTime, endTime, interval, duration) {
  const slots = [];
  
  let currentHours = startTime.hours;
  let currentMinutes = startTime.minutes;
  
  while (
    currentHours < endTime.hours ||
    (currentHours === endTime.hours && currentMinutes < endTime.minutes)
  ) {
    // Calculate slot end time
    const slotEndMinutes = currentMinutes + duration;
    const slotEndHours = currentHours + Math.floor(slotEndMinutes / 60);
    const slotEndMins = slotEndMinutes % 60;
    
    // Check if slot fits within day end time
    if (
      slotEndHours < endTime.hours ||
      (slotEndHours === endTime.hours && slotEndMins <= endTime.minutes)
    ) {
      // Format slot time
      const slotTime = formatTime(currentHours, currentMinutes);
      const slotEndTime = formatTime(slotEndHours, slotEndMins);
      
      slots.push({
        time: slotTime,
        endTime: slotEndTime,
        displayTime: slotTime // Just show start time for simplicity
      });
    }
    
    // Move to next slot
    currentMinutes += interval;
    currentHours += Math.floor(currentMinutes / 60);
    currentMinutes = currentMinutes % 60;
  }
  
  return slots;
}

// Helper function to format time (HH:MM AM/PM)
function formatTime(hours, minutes) {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

