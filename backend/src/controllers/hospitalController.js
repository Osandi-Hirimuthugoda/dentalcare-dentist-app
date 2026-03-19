import Hospital, { SRI_LANKAN_DISTRICTS } from "../models/Hospital.js";

// Approximate center coordinates for each Sri Lankan district
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

// Get All Hospitals (Admin)
export const getAllHospitals = async (req, res) => {
  try {
    const { district, search, isActive } = req.query;
    
    let query = {};
    
    // Filter by district
    if (district) {
      query.district = district;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];
    }
    
    const hospitals = await Hospital.find(query)
      .populate("updatedBy", "email")
      .sort({ district: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    console.error("❌ Error fetching hospitals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospitals",
      error: error.message,
    });
  }
};

//  Search Hospitals (Public - for users)
export const searchHospitals = async (req, res) => {
  try {
    const { query, district } = req.query;
    
    let searchQuery = { isActive: true }; // Only return active hospitals
    
    // Filter by district
    if (district) {
      searchQuery.district = district;
    }
    
    // Search in name, address, city, district
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { district: { $regex: query, $options: "i" } },
      ];
    }
    
    const hospitals = await Hospital.find(searchQuery)
      .select("-updatedBy -__v")
      .sort({ district: 1, name: 1 })
      .limit(100); // Limit results for performance
    
    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    console.error("❌ Error searching hospitals:", error);
    res.status(500).json({
      success: false,
      message: "Error searching hospitals",
      error: error.message,
    });
  }
};

// Get Hospital by ID
export const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hospital = await Hospital.findById(id)
      .populate("updatedBy", "email");
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    
    res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("Error fetching hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospital",
      error: error.message,
    });
  }
};

// Create Hospital (Admin only)
export const createHospital = async (req, res) => {
  try {
    const {
      name,
      district,
      address,
      city,
      phone,
      email,
      website,
      description,
      facilities,
    } = req.body;
    
    // Validate required fields
    if (!name || !district || !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, district, and address",
      });
    }
    
    // Validate district
    if (!SRI_LANKAN_DISTRICTS.includes(district)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district. Please provide a valid Sri Lankan district",
        validDistricts: SRI_LANKAN_DISTRICTS,
      });
    }
    
    // Check if hospital with same name and district already exists
    const existingHospital = await Hospital.findOne({
      name: name.trim(),
      district: district,
    });
    
    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: "Hospital with this name already exists in this district",
      });
    }
    
    const hospital = await Hospital.create({
      name: name.trim(),
      district,
      address: address.trim(),
      city: city?.trim(),
      phone: phone?.trim(),
      email: email?.trim().toLowerCase(),
      website: website?.trim(),
      description: description?.trim(),
      facilities: facilities || [],
      location: {
        type: 'Point',
        coordinates: DISTRICT_COORDINATES[district] || [79.8612, 6.9271],
      },
      updatedBy: req.admin?._id,
      lastUpdated: new Date(),
    });
    
    console.log(`Hospital created: ${hospital.name} in ${hospital.district}`);
    
    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    console.error("Error creating hospital:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating hospital",
      error: error.message,
    });
  }
};

// ✏️ Update Hospital (Admin only)
export const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      district,
      address,
      city,
      phone,
      email,
      website,
      description,
      facilities,
      isActive,
    } = req.body;
    
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    
    // Validate district if provided
    if (district && !SRI_LANKAN_DISTRICTS.includes(district)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district. Please provide a valid Sri Lankan district",
        validDistricts: SRI_LANKAN_DISTRICTS,
      });
    }
    
    // Check for duplicate name in same district if name or district is being updated
    if (name || district) {
      const checkName = name?.trim() || hospital.name;
      const checkDistrict = district || hospital.district;
      
      const existingHospital = await Hospital.findOne({
        name: checkName,
        district: checkDistrict,
        _id: { $ne: id },
      });
      
      if (existingHospital) {
        return res.status(409).json({
          success: false,
          message: "Hospital with this name already exists in this district",
        });
      }
    }
    
    // Update hospital
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (district) updateData.district = district;
    if (address) updateData.address = address.trim();
    if (city !== undefined) updateData.city = city?.trim();
    if (phone !== undefined) updateData.phone = phone?.trim();
    if (email !== undefined) updateData.email = email?.trim().toLowerCase();
    if (website !== undefined) updateData.website = website?.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (facilities !== undefined) updateData.facilities = facilities;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (district) updateData.location = { type: 'Point', coordinates: DISTRICT_COORDINATES[district] || [79.8612, 6.9271] };
    
    updateData.updatedBy = req.admin?._id;
    updateData.lastUpdated = new Date();
    
    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("updatedBy", "email");
    
    console.log(`Hospital updated: ${updatedHospital.name}`);
    
    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      hospital: updatedHospital,
    });
  } catch (error) {
    console.error("Error updating hospital:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating hospital",
      error: error.message,
    });
  }
};

// Delete Hospital (Admin only)
export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    
    await Hospital.findByIdAndDelete(id);
    
    console.log(`Hospital deleted: ${hospital.name}`);
    
    res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    console.error(" Error deleting hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting hospital",
      error: error.message,
    });
  }
};

// Get Hospitals by District
export const getHospitalsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    
    if (!SRI_LANKAN_DISTRICTS.includes(district)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district",
        validDistricts: SRI_LANKAN_DISTRICTS,
      });
    }
    
    const hospitals = await Hospital.find({
      district,
      isActive: true,
    }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: hospitals.length,
      district,
      hospitals,
    });
  } catch (error) {
    console.error("Error fetching hospitals by district:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospitals by district",
      error: error.message,
    });
  }
};

// Get All Districts with Hospital Counts
export const getDistrictsWithCounts = async (req, res) => {
  try {
    const districts = await Hospital.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    
    res.status(200).json({
      success: true,
      districts,
    });
  } catch (error) {
    console.error(" Error fetching districts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching districts",
      error: error.message,
    });
  }
};

// Get Nearby Hospitals (Location-based search)
export const getNearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters (default 10km)
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide latitude and longitude",
      });
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }
    
    const hospitals = await Hospital.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat] // [longitude, latitude]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .select("-updatedBy -__v")
    .limit(20);
    
    // Calculate distance for each hospital
    const hospitalsWithDistance = hospitals.map(hospital => {
      const distance = calculateDistance(
        lat, lng,
        hospital.location.coordinates[1], hospital.location.coordinates[0]
      );
      
      return {
        ...hospital.toObject(),
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        distanceUnit: "km"
      };
    });
    
    res.status(200).json({
      success: true,
      count: hospitalsWithDistance.length,
      userLocation: { latitude: lat, longitude: lng },
      hospitals: hospitalsWithDistance,
    });
  } catch (error) {
    console.error("❌ Error fetching nearby hospitals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby hospitals",
      error: error.message,
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

