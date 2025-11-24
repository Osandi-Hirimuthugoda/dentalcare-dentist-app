import Hospital, { SRI_LANKAN_DISTRICTS } from "../models/Hospital.js";

// 🏥 Get All Hospitals (Admin)
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

// 🔍 Search Hospitals (Public - for users)
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

// 🏥 Get Hospital by ID
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
    console.error("❌ Error fetching hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospital",
      error: error.message,
    });
  }
};

// ➕ Create Hospital (Admin only)
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
      updatedBy: req.admin?._id,
      lastUpdated: new Date(),
    });
    
    console.log(`✅ Hospital created: ${hospital.name} in ${hospital.district}`);
    
    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    console.error("❌ Error creating hospital:", error);
    
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
    
    updateData.updatedBy = req.admin?._id;
    updateData.lastUpdated = new Date();
    
    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("updatedBy", "email");
    
    console.log(`✅ Hospital updated: ${updatedHospital.name}`);
    
    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      hospital: updatedHospital,
    });
  } catch (error) {
    console.error("❌ Error updating hospital:", error);
    
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

// 🗑️ Delete Hospital (Admin only)
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
    
    console.log(`✅ Hospital deleted: ${hospital.name}`);
    
    res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting hospital",
      error: error.message,
    });
  }
};

// 📊 Get Hospitals by District
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
    console.error("❌ Error fetching hospitals by district:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospitals by district",
      error: error.message,
    });
  }
};

// 📋 Get All Districts with Hospital Counts
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
    console.error("❌ Error fetching districts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching districts",
      error: error.message,
    });
  }
};

