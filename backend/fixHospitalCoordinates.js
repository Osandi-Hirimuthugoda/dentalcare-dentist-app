/**
 * Fix hospital coordinates based on district.
 * Run: docker exec -it dentalcare-backend node fixHospitalCoordinates.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Hospital from "./src/models/Hospital.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/dentalcare";

const DISTRICT_COORDINATES = {
  "Colombo":      [79.8612, 6.9271],
  "Gampaha":      [80.0000, 7.0840],
  "Kalutara":     [79.9597, 6.5854],
  "Kandy":        [80.6350, 7.2906],
  "Matale":       [80.6237, 7.4675],
  "Nuwara Eliya": [80.7820, 6.9497],
  "Galle":        [80.2170, 6.0535],
  "Matara":       [80.5353, 5.9549],
  "Hambantota":   [81.1197, 6.1241],
  "Jaffna":       [80.0137, 9.6615],
  "Kilinochchi":  [80.4037, 9.3803],
  "Mannar":       [79.9044, 8.9810],
  "Vavuniya":     [80.4982, 8.7514],
  "Mullaitivu":   [80.8142, 9.2671],
  "Batticaloa":   [81.6924, 7.7170],
  "Ampara":       [81.6747, 7.2913],
  "Trincomalee":  [81.2335, 8.5874],
  "Kurunegala":   [80.3647, 7.4818],
  "Puttalam":     [79.8283, 8.0362],
  "Anuradhapura": [80.4037, 8.3114],
  "Polonnaruwa":  [81.0003, 7.9403],
  "Badulla":      [81.0550, 6.9934],
  "Moneragala":   [81.3497, 6.8728],
  "Ratnapura":    [80.3849, 6.6828],
  "Kegalle":      [80.3464, 7.2513],
};

async function fixCoordinates() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const hospitals = await Hospital.find({});
  console.log(`Found ${hospitals.length} hospitals`);

  let updated = 0;
  for (const h of hospitals) {
    const coords = DISTRICT_COORDINATES[h.district];
    if (!coords) continue;

    // Add small random offset so markers don't overlap (±0.005 degrees ≈ 500m)
    const jitter = () => (Math.random() - 0.5) * 0.01;
    h.location = {
      type: 'Point',
      coordinates: [coords[0] + jitter(), coords[1] + jitter()],
    };
    await h.save();
    updated++;
    console.log(`✅ Updated: ${h.name} (${h.district})`);
  }

  console.log(`\nUpdated ${updated} hospitals`);
  await mongoose.disconnect();
  process.exit(0);
}

fixCoordinates().catch(e => { console.error(e); process.exit(1); });
