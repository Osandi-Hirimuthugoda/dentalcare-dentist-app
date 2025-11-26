import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Service from "./src/models/Service.js";

// Load environment variables
dotenv.config();

// Seed initial services
const seedServices = async () => {
  try {
    await connectDB();
    
    const services = [
      {
        name: "Dental Checkups & Consultations",
        description: "Comprehensive dental examination and oral health assessment",
        category: "General",
        specialization: ["General Dentist", "Pediatric Dentist"],
        duration: 30,
      },
      {
        name: "Teeth Cleaning (Scaling & Polishing)",
        description: "Professional teeth cleaning, scaling, and plaque removal",
        category: "General",
        specialization: ["General Dentist", "Periodontist", "Pediatric Dentist"],
        duration: 45,
      },
      {
        name: "Cavity Filling",
        description: "Dental filling for cavities and tooth restoration",
        category: "General",
        specialization: ["General Dentist", "Pediatric Dentist"],
        duration: 60,
      },
      {
        name: "Tooth Extraction",
        description: "Tooth removal surgery",
        category: "Surgical",
        specialization: ["Oral Surgeon", "General Dentist"],
        duration: 60,
      },
      {
        name: "Root Canal Treatment (RCT)",
        description: "Endodontic treatment for infected tooth roots",
        category: "Endodontic",
        specialization: ["Endodontist", "General Dentist"],
        duration: 90,
      },
      {
        name: "Braces & Teeth Alignment (Orthodontics)",
        description: "Orthodontic treatment for teeth alignment and braces",
        category: "Orthodontic",
        specialization: ["Orthodontist"],
        duration: 45,
      },
      {
        name: "Teeth Whitening",
        description: "Professional teeth whitening treatment",
        category: "Cosmetic",
        specialization: ["Cosmetic Dentist", "General Dentist"],
        duration: 60,
      },
      {
        name: "Dental Crowns & Bridges",
        description: "Dental crown and bridge installation and restoration",
        category: "Restorative",
        specialization: ["Prosthodontist", "General Dentist"],
        duration: 120,
      },
      {
        name: "Dental Implants & Dentures",
        description: "Dental implant surgery and denture fitting",
        category: "Restorative",
        specialization: ["Prosthodontist", "Oral Surgeon", "General Dentist"],
        duration: 120,
      },
      {
        name: "Emergency Dental Care",
        description: "Emergency dental treatment for urgent dental issues",
        category: "Emergency",
        specialization: ["General Dentist", "Oral Surgeon"],
        duration: 60,
      },
    ];

    // Insert services if they don't exist
    for (const service of services) {
      const existingService = await Service.findOne({ name: service.name });
      if (!existingService) {
        await Service.create(service);
        console.log(` Seeded service: ${service.name}`);
      } else {
        console.log(`⏭ Service already exists: ${service.name}`);
      }
    }

    console.log(" Services seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error(" Error seeding services:", error);
    process.exit(1);
  }
};

// Run seeding
seedServices();


