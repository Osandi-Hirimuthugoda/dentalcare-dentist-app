// seedInventory.js — Run: node seedInventory.js
import "dotenv/config";
import mongoose from "mongoose";
import Inventory from "./src/models/Inventory.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dentalcare";

const items = [
  // Equipment
  { itemName: "Dental Chair Unit",        category: "Equipment", quantity: 5,  unit: "Units",  minThreshold: 2,  supplier: "DentalPro Lanka",  location: "Treatment Room A" },
  { itemName: "X-Ray Machine (Digital)",  category: "Equipment", quantity: 2,  unit: "Units",  minThreshold: 1,  supplier: "MedTech Solutions", location: "X-Ray Room" },
  { itemName: "Autoclave Sterilizer",     category: "Equipment", quantity: 3,  unit: "Units",  minThreshold: 1,  supplier: "SterilMed",         location: "Sterilization Room" },
  { itemName: "Ultrasonic Scaler",        category: "Equipment", quantity: 6,  unit: "Units",  minThreshold: 2,  supplier: "DentalPro Lanka",  location: "Treatment Room B" },
  { itemName: "Dental Compressor",        category: "Equipment", quantity: 2,  unit: "Units",  minThreshold: 1,  supplier: "AirTech",           location: "Utility Room" },

  // Supplies
  { itemName: "Disposable Gloves (M)",    category: "Supplies",  quantity: 48, unit: "Boxes",  minThreshold: 10, supplier: "MedSupply Co.",     location: "Storage Room" },
  { itemName: "Disposable Gloves (L)",    category: "Supplies",  quantity: 30, unit: "Boxes",  minThreshold: 10, supplier: "MedSupply Co.",     location: "Storage Room" },
  { itemName: "Surgical Masks",           category: "Supplies",  quantity: 60, unit: "Boxes",  minThreshold: 15, supplier: "SafeGuard Medical", location: "Storage Room" },
  { itemName: "Dental Bibs",              category: "Supplies",  quantity: 25, unit: "Packs",  minThreshold: 8,  supplier: "DentalPro Lanka",  location: "Shelf A" },
  { itemName: "Suction Tips",             category: "Supplies",  quantity: 8,  unit: "Boxes",  minThreshold: 5,  supplier: "DentalPro Lanka",  location: "Shelf B" },
  { itemName: "Impression Trays",         category: "Supplies",  quantity: 40, unit: "Units",  minThreshold: 10, supplier: "OrthoSupply",       location: "Shelf C" },
  { itemName: "Dental Floss (Patient)",   category: "Supplies",  quantity: 3,  unit: "Boxes",  minThreshold: 5,  supplier: "OralCare Ltd.",     location: "Reception" },  // low stock
  { itemName: "Prophy Cups",              category: "Supplies",  quantity: 15, unit: "Packs",  minThreshold: 5,  supplier: "DentalPro Lanka",  location: "Shelf A" },
  { itemName: "Saliva Ejectors",          category: "Supplies",  quantity: 20, unit: "Boxes",  minThreshold: 8,  supplier: "MedSupply Co.",     location: "Shelf B" },

  // Medicine
  { itemName: "Lidocaine 2% Cartridges",  category: "Medicine",  quantity: 12, unit: "Boxes",  minThreshold: 5,  supplier: "PharmaCare",        location: "Medicine Cabinet" },
  { itemName: "Articaine Cartridges",     category: "Medicine",  quantity: 8,  unit: "Boxes",  minThreshold: 5,  supplier: "PharmaCare",        location: "Medicine Cabinet" },
  { itemName: "Hydrogen Peroxide 3%",     category: "Medicine",  quantity: 4,  unit: "Bottles",minThreshold: 3,  supplier: "ChemMed",           location: "Medicine Cabinet" },
  { itemName: "Chlorhexidine Mouthwash",  category: "Medicine",  quantity: 2,  unit: "Bottles",minThreshold: 4,  supplier: "OralCare Ltd.",     location: "Medicine Cabinet" }, // low stock
  { itemName: "Ibuprofen 400mg",          category: "Medicine",  quantity: 10, unit: "Boxes",  minThreshold: 4,  supplier: "PharmaCare",        location: "Medicine Cabinet" },
  { itemName: "Amoxicillin 500mg",        category: "Medicine",  quantity: 6,  unit: "Boxes",  minThreshold: 3,  supplier: "PharmaCare",        location: "Medicine Cabinet" },

  // Other
  { itemName: "Patient Record Files",     category: "Other",     quantity: 200,unit: "Units",  minThreshold: 50, supplier: "OfficeSupply",      location: "Reception" },
  { itemName: "Appointment Cards",        category: "Other",     quantity: 500,unit: "Units",  minThreshold: 100,supplier: "PrintShop",         location: "Reception" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  // Remove existing inventory
  const deleted = await Inventory.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing inventory items`);

  const inserted = await Inventory.insertMany(items);
  console.log(`✅ Inserted ${inserted.length} inventory items`);

  const lowStock = inserted.filter(i => i.quantity <= i.minThreshold);
  console.log(`⚠️  ${lowStock.length} items are at or below minimum threshold:`);
  lowStock.forEach(i => console.log(`   - ${i.itemName}: ${i.quantity} ${i.unit} (min: ${i.minThreshold})`));

  await mongoose.disconnect();
  console.log("🔌 Disconnected. Done!");
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
