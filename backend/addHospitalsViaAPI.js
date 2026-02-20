import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api/hospitals';

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
      coordinates: [79.8612, 6.9271]
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
  // Add more hospitals as needed...
];

async function addHospitals() {
  console.log('🏥 Adding hospitals via API...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const hospital of hospitals) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hospital)
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ Added: ${hospital.name}`);
      } else {
        errorCount++;
        const error = await response.text();
        console.log(`❌ Failed: ${hospital.name} - ${error}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ Error adding ${hospital.name}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${hospitals.length}`);
}

addHospitals();
