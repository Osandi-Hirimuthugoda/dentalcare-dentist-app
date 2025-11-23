import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Star, User, Calendar, MessageSquare, TrendingUp, Filter } from "lucide-react";
import DoctorSidebar from "../components/DoctorSidebar";
import "../styles/DoctorReviews.css";

const DoctorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [ratingFilter, searchTerm, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (!doctorData._id) {
        setError("Doctor not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:4000/api/reviews/doctor/${doctorData._id}`
      );

      const reviewsData = response.data.reviews || response.data || [];
      setReviews(reviewsData);

      // Calculate statistics
      const total = reviewsData.length;
      const average = total > 0
        ? reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / total
        : 0;

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsData.forEach((review) => {
        const rating = review.rating;
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });

      setStats({
        totalReviews: total,
        averageRating: average.toFixed(1),
        ratingDistribution: distribution,
      });
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (ratingFilter !== "all") {
      filtered = filtered.filter((review) => review.rating === parseInt(ratingFilter));
    }

    // Filter by search term (patient name or comment)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((review) => {
        const patientName = review.patient?.name || review.patient?.fullName || "";
        const comment = review.comment || "";
        return (
          patientName.toLowerCase().includes(search) ||
          comment.toLowerCase().includes(search)
        );
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA;
    });

    setFilteredReviews(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={18}
        className={`star-icon ${index < rating ? "filled" : "empty"}`}
        fill={index < rating ? "#fbbf24" : "none"}
        color={index < rating ? "#fbbf24" : "#d1d5db"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="doctor-reviews-container">
        <DoctorSidebar />
        <div className="doctor-reviews-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-reviews-container">
        <DoctorSidebar />
        <div className="doctor-reviews-content">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchReviews} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-reviews-container">
      <DoctorSidebar />
      <div className="doctor-reviews-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="reviews-header"
        >
          <div>
            <h1>Patient Reviews</h1>
            <p>View and manage patient feedback</p>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="reviews-stats">
          <motion.div
            className="stat-card stat-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.averageRating}</h3>
              <p>Average Rating</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card stat-secondary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalReviews}</h3>
              <p>Total Reviews</p>
            </div>
          </motion.div>

          {Object.entries(stats.ratingDistribution)
            .reverse()
            .map(([rating, count]) => (
              <motion.div
                key={rating}
                className="stat-card stat-rating"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-icon">
                  <Star size={20} fill="#fbbf24" color="#fbbf24" />
                </div>
                <div className="stat-content">
                  <h3>{count}</h3>
                  <p>{rating} Star{rating !== "1" ? "s" : ""}</p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Filters */}
        <div className="reviews-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by patient name or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={18} />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {filteredReviews.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={64} className="empty-icon" />
              <h3>No reviews found</h3>
              <p>
                {reviews.length === 0
                  ? "You haven't received any reviews yet."
                  : "No reviews match your current filters."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review, index) => (
              <motion.div
                key={review._id || index}
                className="review-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="review-header">
                  <div className="review-patient">
                    <div className="patient-avatar">
                      <User size={20} />
                    </div>
                    <div>
                      <h4>
                        {review.patient?.name ||
                          review.patient?.fullName ||
                          "Anonymous Patient"}
                      </h4>
                      <p className="review-date">
                        <Calendar size={14} />
                        {formatDate(review.createdAt || review.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating || 0)}
                    <span className="rating-number">{review.rating || 0}/5</span>
                  </div>
                </div>

                {review.comment && (
                  <div className="review-comment">
                    <p>{review.comment}</p>
                  </div>
                )}

                {review.isVerified && (
                  <div className="review-badge">
                    <span className="verified-badge">Verified Appointment</span>
                </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReviews;

