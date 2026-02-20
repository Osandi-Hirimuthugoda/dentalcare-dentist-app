import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, User, Calendar, MessageSquare, TrendingUp, Filter, ArrowLeft, AlertCircle, Search } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorReviews.css";

const DoctorReviews = () => {
  const navigate = useNavigate();
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
      <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
        <DoctorSidebar />
        <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem" }}>
          <div style={{ 
            background: "white", 
            borderRadius: "1.25rem", 
            padding: "3rem", 
            textAlign: "center", 
            border: "1px solid rgba(0, 0, 0, 0.05)", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" 
          }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              border: "4px solid #E5E7EB", 
              borderTopColor: "#2563EB", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite", 
              margin: "0 auto 1rem" 
            }}></div>
            Loading reviews...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
        <DoctorSidebar />
        <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem" }}>
          <div style={{ 
            background: "white", 
            borderRadius: "1.25rem", 
            padding: "3rem", 
            textAlign: "center", 
            border: "1px solid rgba(0, 0, 0, 0.05)", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            color: "#EF4444"
          }}>
            <AlertCircle size={48} style={{ marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchReviews}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)"
              }}
            >
              Retry
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
      <DoctorSidebar />
      <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem" }}>
        <div style={{ 
          background: "white", 
          borderRadius: "1.25rem", 
          padding: "1.5rem 2rem", 
          marginBottom: "2rem", 
          border: "1px solid rgba(0, 0, 0, 0.05)", 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{ 
              margin: 0, 
              fontSize: "2.5rem", 
              fontWeight: "900", 
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              display: "flex", 
              alignItems: "center",
              marginBottom: "0.5rem"
            }}>
              <Star size={32} style={{ marginRight: "0.5rem", color: "#2563EB" }} />
              Patient Reviews
            </h1>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#6B7280", fontWeight: "500" }}>
              View and manage patient feedback
            </p>
          </motion.div>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ 
              width: "3rem", 
              height: "3rem", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 1rem" 
            }}>
              <TrendingUp size={24} style={{ color: "#2563EB" }} />
            </div>
            <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "#2563EB", margin: "0 0 0.5rem 0" }}>
              {stats.averageRating}
            </h3>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "#6B7280", margin: 0 }}>Average Rating</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ 
              width: "3rem", 
              height: "3rem", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 1rem" 
            }}>
              <MessageSquare size={24} style={{ color: "#10B981" }} />
            </div>
            <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "#10B981", margin: "0 0 0.5rem 0" }}>
              {stats.totalReviews}
            </h3>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "#6B7280", margin: 0 }}>Total Reviews</p>
          </motion.div>

          {Object.entries(stats.ratingDistribution)
            .reverse()
            .map(([rating, count]) => (
              <motion.div
                key={rating}
                whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "1.25rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                <div style={{ 
                  width: "3rem", 
                  height: "3rem", 
                  borderRadius: "50%", 
                  background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  margin: "0 auto 1rem" 
                }}>
                  <Star size={20} fill="#FBBF24" color="#FBBF24" />
                </div>
                <h3 style={{ fontSize: "2rem", fontWeight: "900", color: "#FBBF24", margin: "0 0 0.5rem 0" }}>
                  {count}
                </h3>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "#6B7280", margin: 0 }}>
                  {rating} Star{rating !== "1" ? "s" : ""}
                </p>
              </motion.div>
            ))}
        </div>

        {/* Filters */}
        <div style={{
          background: "white",
          borderRadius: "1.25rem",
          padding: "1.5rem",
          marginBottom: "2rem",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9CA3AF",
                pointerEvents: "none"
              }}
            />
            <input
              type="text"
              placeholder="Search by patient name or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.875rem 1rem 0.875rem 2.75rem",
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                color: "#1F2937",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#60A5FA";
                e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Filter size={20} style={{ color: "#6B7280" }} />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                minWidth: "150px",
                padding: "0.875rem 1rem",
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                color: "#1F2937",
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                outline: "none"
              }}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredReviews.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "1.25rem",
              padding: "3rem",
              textAlign: "center",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              color: "#6B7280"
            }}>
              <MessageSquare size={64} style={{ marginBottom: "1rem", opacity: 0.5, color: "#9CA3AF" }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#374151", marginBottom: "0.5rem" }}>
                No reviews found
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#6B7280" }}>
                {reviews.length === 0
                  ? "You haven't received any reviews yet."
                  : "No reviews match your current filters."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review, index) => (
              <motion.div
                key={review._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
                style={{
                  background: "white",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease"
                }}
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

