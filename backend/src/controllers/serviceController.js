import Service from "../models/Service.js";

// Get all active services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(services);
  } catch (error) {
    console.error(" Error fetching services:", error);
    res.status(500).json({ message: "Error fetching services", error });
  }
};

// Get services grouped by category
export const getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    
    // Group services by category
    const categorizedServices = {};
    services.forEach(service => {
      const category = service.category || 'General';
      if (!categorizedServices[category]) {
        categorizedServices[category] = [];
      }
      categorizedServices[category].push(service);
    });
    
    res.status(200).json({
      categories: Object.keys(categorizedServices),
      servicesByCategory: categorizedServices,
      allServices: services
    });
  } catch (error) {
    console.error(" Error fetching categorized services:", error);
    res.status(500).json({ message: "Error fetching categorized services", error });
  }
};

// Create a service (admin/doctor can create)
export const createService = async (req, res) => {
  try {
    const { name, description, category, specialization, duration } = req.body;
    
    const service = new Service({
      name,
      description,
      category: category || 'General',
      specialization: specialization || [],
      duration: duration || 30,
    });
    
    await service.save();
    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Service already exists" });
    }
    console.error(" Error creating service:", error);
    res.status(500).json({ message: "Error creating service", error });
  }
};

// Update a service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, specialization, duration, isActive } = req.body;
    
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (category) service.category = category;
    if (specialization) service.specialization = specialization;
    if (duration) service.duration = duration;
    if (isActive !== undefined) service.isActive = isActive;
    
    await service.save();
    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    console.error(" Error updating service:", error);
    res.status(500).json({ message: "Error updating service", error });
  }
};

// Delete a service (soft delete by setting isActive to false)
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    service.isActive = false;
    await service.save();
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(" Error deleting service:", error);
    res.status(500).json({ message: "Error deleting service", error });
  }
};

