import mongoose from "mongoose";

// Sri Lankan districts list
export const SRI_LANKAN_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
];

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      enum: {
        values: SRI_LANKAN_DISTRICTS,
        message: "Please provide a valid Sri Lankan district",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    facilities: [{
      type: String,
      trim: true,
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [79.8612, 6.9271] // Default to Colombo
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Index for search functionality
hospitalSchema.index({ name: "text", district: "text", address: "text", city: "text" });
hospitalSchema.index({ district: 1 });
hospitalSchema.index({ isActive: 1 });
hospitalSchema.index({ location: "2dsphere" }); // Geospatial index for location queries

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;


