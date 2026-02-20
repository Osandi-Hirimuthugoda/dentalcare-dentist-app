import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from './src/models/Hospital.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Dental1234@cluster0.eurc4fi.mongodb.net/dentalcare';

// Sri Lanka hospitals with real locations
const hospitals = [
  // Colombo District
  {
    name: "National Hospital of Sri Lanka",
    address: "Regent Street, Colombo 07",
    district: "Colombo",
    province: "Western",
    phone: "+94112691111",
    email: "info@nhsl.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Cardiology", "Neurology"],
    location: {
      type: "Point",
      coordinates: [79.8612, 6.9271] // Longitude, Latitude
    }
  },
  {
    name: "Colombo South Teaching Hospital",
    address: "Kalubowila, Dehiwala",
    district: "Colombo",
    province: "Western",
    phone: "+94112763000",
    email: "info@csth.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Pediatrics"],
    location: {
      type: "Point",
      coordinates: [79.8850, 6.8500]
    }
  },
  {
    name: "Asiri Central Hospital",
    address: "114 Norris Canal Road, Colombo 10",
    district: "Colombo",
    province: "Western",
    phone: "+94114665500",
    email: "info@asirihealth.com",
    type: "Private",
    services: ["Emergency", "Dental", "Surgery", "Cardiology", "Oncology"],
    location: {
      type: "Point",
      coordinates: [79.8653, 6.9271]
    }
  },
  {
    name: "Nawaloka Hospital",
    address: "23 Deshamanya H K Dharmadasa Mawatha, Colombo 02",
    district: "Colombo",
    province: "Western",
    phone: "+94115577111",
    email: "info@nawaloka.com",
    type: "Private",
    services: ["Emergency", "Dental", "Surgery", "Cardiology"],
    location: {
      type: "Point",
      coordinates: [79.8612, 6.9271]
    }
  },

  // Gampaha District
  {
    name: "Colombo North Teaching Hospital",
    address: "Ragama",
    district: "Gampaha",
    province: "Western",
    phone: "+94112958337",
    email: "info@cnth.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Pediatrics"],
    location: {
      type: "Point",
      coordinates: [79.9219, 7.0267]
    }
  },
  {
    name: "Negombo General Hospital",
    address: "Hospital Road, Negombo",
    district: "Gampaha",
    province: "Western",
    phone: "+94312222261",
    email: "info@negombohospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [79.8358, 7.2083]
    }
  },

  // Kalutara District
  {
    name: "Kalutara General Hospital",
    address: "Hospital Road, Kalutara",
    district: "Kalutara",
    province: "Western",
    phone: "+94342222261",
    email: "info@kaluturahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Pediatrics"],
    location: {
      type: "Point",
      coordinates: [79.9589, 6.5854]
    }
  },

  // Kandy District
  {
    name: "Teaching Hospital Kandy",
    address: "William Gopallawa Mawatha, Kandy",
    district: "Kandy",
    province: "Central",
    phone: "+94812233337",
    email: "info@kandyhospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Cardiology", "Neurology"],
    location: {
      type: "Point",
      coordinates: [80.6350, 7.2906]
    }
  },
  {
    name: "Asiri Central Hospital Kandy",
    address: "No. 42, Sirimavo Bandaranaike Mawatha, Kandy",
    district: "Kandy",
    province: "Central",
    phone: "+94812205500",
    email: "kandy@asirihealth.com",
    type: "Private",
    services: ["Emergency", "Dental", "Surgery", "Cardiology"],
    location: {
      type: "Point",
      coordinates: [80.6337, 7.2906]
    }
  },

  // Matale District
  {
    name: "Matale General Hospital",
    address: "Hospital Road, Matale",
    district: "Matale",
    province: "Central",
    phone: "+94662222261",
    email: "info@matalehospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [80.6234, 7.4675]
    }
  },

  // Nuwara Eliya District
  {
    name: "Nuwara Eliya General Hospital",
    address: "Hospital Road, Nuwara Eliya",
    district: "Nuwara Eliya",
    province: "Central",
    phone: "+94522222261",
    email: "info@nuwaraeliyahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [80.7718, 6.9497]
    }
  },

  // Galle District
  {
    name: "Teaching Hospital Karapitiya",
    address: "Karapitiya, Galle",
    district: "Galle",
    province: "Southern",
    phone: "+94912232261",
    email: "info@karapitiyahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Cardiology", "Neurology"],
    location: {
      type: "Point",
      coordinates: [80.2170, 6.0535]
    }
  },

  // Matara District
  {
    name: "Matara General Hospital",
    address: "Hospital Road, Matara",
    district: "Matara",
    province: "Southern",
    phone: "+94412222261",
    email: "info@matarahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Pediatrics"],
    location: {
      type: "Point",
      coordinates: [80.5353, 5.9549]
    }
  },

  // Hambantota District
  {
    name: "Hambantota General Hospital",
    address: "Hospital Road, Hambantota",
    district: "Hambantota",
    province: "Southern",
    phone: "+94472222261",
    email: "info@hambantotahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [81.1185, 6.1429]
    }
  },

  // Jaffna District
  {
    name: "Teaching Hospital Jaffna",
    address: "Hospital Road, Jaffna",
    district: "Jaffna",
    province: "Northern",
    phone: "+94212222261",
    email: "info@jaffnahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Cardiology"],
    location: {
      type: "Point",
      coordinates: [80.0074, 9.6615]
    }
  },

  // Kilinochchi District
  {
    name: "Kilinochchi District Hospital",
    address: "Hospital Road, Kilinochchi",
    district: "Kilinochchi",
    province: "Northern",
    phone: "+94212282261",
    email: "info@kilinochchi.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [80.3981, 9.3961]
    }
  },

  // Mannar District
  {
    name: "Mannar General Hospital",
    address: "Hospital Road, Mannar",
    district: "Mannar",
    province: "Northern",
    phone: "+94232222261",
    email: "info@mannarhospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [79.9044, 8.9810]
    }
  },

  // Vavuniya District
  {
    name: "Vavuniya General Hospital",
    address: "Hospital Road, Vavuniya",
    district: "Vavuniya",
    province: "Northern",
    phone: "+94242222261",
    email: "info@vavuniyahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [80.4981, 8.7514]
    }
  },

  // Mullaitivu District
  {
    name: "Mullaitivu District Hospital",
    address: "Hospital Road, Mullaitivu",
    district: "Mullaitivu",
    province: "Northern",
    phone: "+94212292261",
    email: "info@mullaitivu.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [80.8142, 9.2671]
    }
  },

  // Batticaloa District
  {
    name: "Batticaloa Teaching Hospital",
    address: "Hospital Road, Batticaloa",
    district: "Batticaloa",
    province: "Eastern",
    phone: "+94652222261",
    email: "info@batticaloahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Pediatrics"],
    location: {
      type: "Point",
      coordinates: [81.6924, 7.7310]
    }
  },

  // Ampara District
  {
    name: "Ampara General Hospital",
    address: "Hospital Road, Ampara",
    district: "Ampara",
    province: "Eastern",
    phone: "+94632222261",
    email: "info@amparahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [81.6747, 7.2974]
    }
  },

  // Trincomalee District
  {
    name: "Trincomalee General Hospital",
    address: "Hospital Road, Trincomalee",
    district: "Trincomalee",
    province: "Eastern",
    phone: "+94262222261",
    email: "info@trincomaleehospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [81.2335, 8.5874]
    }
  },

  // Kurunegala District
  {
    name: "Teaching Hospital Kurunegala",
    address: "Hospital Road, Kurunegala",
    district: "Kurunegala",
    province: "North Western",
    phone: "+94372222261",
    email: "info@kurunegalahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Cardiology"],
    location: {
      type: "Point",
      coordinates: [80.3644, 7.4863]
    }
  },

  // Puttalam District
  {
    name: "Puttalam Base Hospital",
    address: "Hospital Road, Puttalam",
    district: "Puttalam",
    province: "North Western",
    phone: "+94322265261",
    email: "info@puttalamhospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [79.8283, 8.0362]
    }
  },

  // Anuradhapura District
  {
    name: "Teaching Hospital Anuradhapura",
    address: "Hospital Road, Anuradhapura",
    district: "Anuradhapura",
    province: "North Central",
    phone: "+94252222261",
    email: "info@anuradhapurahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Cardiology"],
    location: {
      type: "Point",
      coordinates: [80.4037, 8.3114]
    }
  },

  // Polonnaruwa District
  {
    name: "Polonnaruwa General Hospital",
    address: "Hospital Road, Polonnaruwa",
    district: "Polonnaruwa",
    province: "North Central",
    phone: "+94272222261",
    email: "info@polonnaruwahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [81.0014, 7.9403]
    }
  },

  // Badulla District
  {
    name: "Badulla General Hospital",
    address: "Hospital Road, Badulla",
    district: "Badulla",
    province: "Uva",
    phone: "+94552222261",
    email: "info@badullahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [81.0550, 6.9934]
    }
  },

  // Monaragala District
  {
    name: "Monaragala District Hospital",
    address: "Hospital Road, Monaragala",
    district: "Monaragala",
    province: "Uva",
    phone: "+94552276261",
    email: "info@monaragalahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [81.3506, 6.8728]
    }
  },

  // Ratnapura District
  {
    name: "Ratnapura General Hospital",
    address: "Hospital Road, Ratnapura",
    district: "Ratnapura",
    province: "Sabaragamuwa",
    phone: "+94452222261",
    email: "info@ratnapurahospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery", "Pediatrics"],
    location: {
      type: "Point",
      coordinates: [80.4037, 6.7056]
    }
  },

  // Kegalle District
  {
    name: "Kegalle General Hospital",
    address: "Hospital Road, Kegalle",
    district: "Kegalle",
    province: "Sabaragamuwa",
    phone: "+94352222261",
    email: "info@kegallehospital.health.gov.lk",
    type: "Government",
    services: ["Emergency", "Dental", "Surgery"],
    location: {
      type: "Point",
      coordinates: [80.3431, 7.2513]
    }
  }
];

async function seedHospitals() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');

    // Clear existing hospitals
    console.log('🗑️  Clearing existing hospitals...');
    await Hospital.deleteMany({});
    console.log('✅ Existing hospitals cleared!');

    // Insert new hospitals
    console.log('📝 Inserting hospitals...');
    const result = await Hospital.insertMany(hospitals);
    console.log(`✅ Successfully inserted ${result.length} hospitals!`);

    // Display summary
    console.log('\n📊 Summary by Province:');
    const provinces = [...new Set(hospitals.map(h => h.province))];
    for (const province of provinces) {
      const count = hospitals.filter(h => h.province === province).length;
      console.log(`   ${province}: ${count} hospitals`);
    }

    console.log('\n📊 Summary by Type:');
    const government = hospitals.filter(h => h.type === 'Government').length;
    const privateCount = hospitals.filter(h => h.type === 'Private').length;
    console.log(`   Government: ${government} hospitals`);
    console.log(`   Private: ${privateCount} hospitals`);

    console.log('\n🎉 Hospital seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seeding
seedHospitals();
