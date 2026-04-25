import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, MessageSquare, Calendar, Search, Filter, TrendingUp, CheckCircle } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorReviews.css";

const API = "/api";

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  : "N/A";

const Stars = ({ rating, size = 14 }) => (
  <div className="rev-stars">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size}
        fill={i <= rating ? "#f59e0b" : "none"}
        color={i <= rating ? "#f59e0b" : "#d1d5db"}
      />
    ))}
  </div>
);

export default function DoctorReviews() {
  const [reviews, setReviews]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [stats, setStats]               = useState({ avg: 0, total: 0, dist: {5:0,4:0,3:0,2:0,1:0} });

  useEffect(() => { fetchReviews(); }, []);

  useEffect(() => {
    let list = [...reviews];
    if (ratingFilter !== "all") list = list.filter(r => r.rating === parseInt(ratingFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.patient?.name || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFiltered(list);
  }, [reviews, search, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
      if (!doc._id) return;
      const res = await axios.get(`${API}/reviews/doctor/${doc._id}`);
      const data = res.data.reviews || res.data || [];
      setReviews(data);

      const total = data.length;
      const avg   = total > 0 ? (data.reduce((s, r) => s + (r.rating || 0), 0) / total) : 0;
      const dist  = {5:0,4:0,3:0,2:0,1:0};
      data.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
      setStats({ avg: avg.toFixed(1), total, dist });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="rev-wrapper">
        <DoctorSidebar />
        <div className="rev-content">
          <div className="rev-loading"><div className="rev-spinner" /><p>Loading reviews...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rev-wrapper">
      <DoctorSidebar />

      <div className="rev-content">
        {/* Header */}
        <div className="rev-header">
          <h1><Star size={22} /> Patient Reviews</h1>
          <p>See what your patients are saying about you</p>
        </div>

        {/* Stats */}
        <div className="rev-stats">
          <div className="rev-stat-card">
            <div className="rev-stat-icon" style={{ background: "#fffbeb" }}>
              <TrendingUp size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div className="rev-stat-value" style={{ color: "#f59e0b" }}>{stats.avg}</div>
            <div className="rev-stat-label">Avg Rating</div>
          </div>
          <div className="rev-stat-card">
            <div className="rev-stat-icon" style={{ background: "#f0faf9" }}>
              <MessageSquare size={18} style={{ color: "#00897B" }} />
            </div>
            <div className="rev-stat-value" style={{ color: "#00897B" }}>{stats.total}</div>
            <div className="rev-stat-label">Total</div>
          </div>
          {[5,4,3,2,1].map(n => (
            <div key={n} className="rev-stat-card">
              <div className="rev-stat-icon" style={{ background: "#fffbeb" }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
              </div>
              <div className="rev-stat-value" style={{ color: "#f59e0b" }}>{stats.dist[n]}</div>
              <div className="rev-stat-label">{n} Star{n !== 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>

        {/* Rating Distribution Bar */}
        {stats.total > 0 && (
          <div className="rev-rating-bar-wrap">
            <div className="rev-avg-big">
              <div className="rev-avg-number">{stats.avg}</div>
              <div className="rev-avg-stars"><Stars rating={Math.round(parseFloat(stats.avg))} size={16} /></div>
              <div className="rev-avg-count">{stats.total} review{stats.total !== 1 ? "s" : ""}</div>
            </div>
            <div className="rev-bars">
              {[5,4,3,2,1].map(n => (
                <div key={n} className="rev-bar-row">
                  <div className="rev-bar-label">
                    <Star size={11} fill="#f59e0b" color="#f59e0b" /> {n}
                  </div>
                  <div className="rev-bar-track">
                    <div className="rev-bar-fill"
                      style={{ width: stats.total > 0 ? `${(stats.dist[n] / stats.total) * 100}%` : "0%" }} />
                  </div>
                  <div className="rev-bar-count">{stats.dist[n]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rev-filters">
          <div className="rev-search">
            <Search size={14} />
            <input type="text" placeholder="Search by patient name or comment..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="rev-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
            <option value="all">All Ratings</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>)}
          </select>
        </div>

        {/* Reviews */}
        {filtered.length === 0 ? (
          <div className="rev-empty">
            <MessageSquare size={44} />
            <h3>No reviews found</h3>
            <p>{reviews.length === 0 ? "You haven't received any reviews yet." : "No reviews match your filters."}</p>
          </div>
        ) : (
          <div className="rev-list">
            {filtered.map((review, i) => (
              <div key={review._id || i} className="rev-card">
                <div className="rev-card-top">
                  <div className="rev-patient">
                    <div className="rev-avatar">
                      {(review.patient?.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="rev-patient-name">
                        {review.patient?.name || "Anonymous Patient"}
                      </div>
                      <div className="rev-date">
                        <Calendar size={11} /> {fmtDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Stars rating={review.rating || 0} />
                    <span className="rev-rating-num">{review.rating || 0}/5</span>
                  </div>
                </div>

                {review.comment && (
                  <div className="rev-comment">"{review.comment}"</div>
                )}

                {review.isVerified && (
                  <div className="rev-verified">
                    <CheckCircle size={11} /> Verified Appointment
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
