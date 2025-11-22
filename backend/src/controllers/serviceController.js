import Service from "../models/Service.js";

// Get all active services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(services);
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    res.status(500).json({ message: "Error fetching services", error });
  }
};

// Create a service (admin only - can be added later)
export const createService = async (req, res) => {
  try {
    const { name, description, category, specialization, duration } = req.body;
    
    const service = new Service({
      name,
      description,
      category,
      specialization: specialization || [],
      duration: duration || 30,
    });
    
    await service.save();
    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Service already exists" });
    }
    console.error("❌ Error creating service:", error);
    res.status(500).json({ message: "Error creating service", error });
  }
};

