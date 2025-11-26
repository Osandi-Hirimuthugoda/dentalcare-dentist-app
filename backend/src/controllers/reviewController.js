import Review from "../models/Review.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/Appointment.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    
    console.log(" Create review - Request body:", { doctorId, appointmentId, rating });
    console.log(" Create review - User from token:", req.user);
    
    // Get patient ID from JWT token
    const patientId = req.user?.id || req.user?._id;
    
    if (!patientId) {
      console.log(" Create review: No patient ID in token");
      return res.status(401).json({ 
        message: "Patient authentication required",
        user: req.user 
      });
    }
    
    console.log(" Create review - Patient ID:", patientId);

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // If appointment ID provided, verify it exists and belongs to patient
    let isVerified = false;
    if (appointmentId) {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient: patientId,
        doctor: doctorId,
        status: "completed",
      });
      if (appointment) {
        isVerified = true;
      }
    }

    // Check if patient already reviewed this doctor (optional - can allow multiple)
    const existingReview = await Review.findOne({
      patient: patientId,
      doctor: doctorId,
    });

    if (existingReview) {
      // Update existing review instead of creating new one
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
      existingReview.isVerified = isVerified || existingReview.isVerified;
      if (appointmentId) existingReview.appointment = appointmentId;
      await existingReview.save();

      // Recalculate doctor's average rating
      await updateDoctorRating(doctorId);

      return res.status(200).json({
        message: "Review updated successfully",
        review: existingReview,
      });
    }

    // Create new review
    const review = await Review.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
      rating,
      comment: comment || "",
      isVerified,
    });

    // Populate patient info for response
    await review.populate("patient", "name email");

    // Recalculate doctor's average rating
    await updateDoctorRating(doctorId);

    console.log(" Review created successfully:", {
      reviewId: review._id,
      doctorId: doctorId,
      patientId: patientId,
      rating: rating,
      hasComment: !!comment,
    });

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error(" Error creating review:", error);
    res.status(500).json({
      message: "Error creating review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get reviews for a doctor
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const reviews = await Review.find({ doctor: doctorId })
      .populate("patient", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalReviews = await Review.countDocuments({ doctor: doctorId });

    res.status(200).json({
      reviews,
      totalReviews,
      hasMore: totalReviews > parseInt(skip) + reviews.length,
    });
  } catch (error) {
    console.error(" Error fetching doctor reviews:", error);
    res.status(500).json({
      message: "Error fetching reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get patient's reviews
export const getPatientReviews = async (req, res) => {
  try {
    const patientId = req.user?.id || req.user?._id;
    if (!patientId) {
      return res.status(401).json({ message: "Patient authentication required" });
    }

    const reviews = await Review.find({ patient: patientId })
      .populate("doctor", "fullName specialization hospital")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(" Error fetching patient reviews:", error);
    res.status(500).json({
      message: "Error fetching reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update doctor's average rating (helper function)
export const updateDoctorRating = async (doctorId) => {
  try {
    const reviews = await Review.find({ doctor: doctorId });
    
    if (reviews.length === 0) {
      // No reviews yet, set default rating
      await Doctor.findByIdAndUpdate(doctorId, {
        $unset: { averageRating: 1, totalReviews: 1 },
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    const totalReviews = reviews.length;

    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating: parseFloat(averageRating),
      totalReviews,
    });
  } catch (error) {
    console.error(" Error updating doctor rating:", error);
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const patientId = req.user?.id || req.user?._id;

    if (!patientId) {
      return res.status(401).json({ message: "Patient authentication required" });
    }

    const review = await Review.findOne({
      _id: reviewId,
      patient: patientId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const doctorId = review.doctor;
    await review.deleteOne();

    // Recalculate doctor's average rating
    await updateDoctorRating(doctorId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(" Error deleting review:", error);
    res.status(500).json({
      message: "Error deleting review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

