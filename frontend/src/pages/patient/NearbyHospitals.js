import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAircHbXMrCD0PqJ1BPORy5ZX-2-ub97Fw';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612
};

function NearbyHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchLocation, setSearchLocation] = useState('Your Location');
  const [searchInput, setSearchInput] = useState('');

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setMapCenter(location);
          fetchNearbyHospitals(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Showing default location.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, []);

  const fetchNearbyHospitals = async (lat, lng) => {
    try {
      const response = await axios.get(
        `/api/hospitals/nearby?latitude=${lat}&longitude=${lng}&maxDistance=50000`
      );
      setHospitals(response.data.hospitals || []);
      setSearchLocation('Your Location');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load nearby hospitals');
      setLoading(false);
    }
  };

  const searchByLocation = async () => {
    if (!searchInput.trim()) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Google Geocoding API to convert location name to coordinates
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchInput)}&key=${GOOGLE_MAPS_API_KEY}`;
      const geocodeResponse = await axios.get(geocodeUrl);

      if (geocodeResponse.data.results.length === 0) {
        setError('Location not found');
        setLoading(false);
        return;
      }

      const location = geocodeResponse.data.results[0].geometry.location;
      const lat = location.lat;
      const lng = location.lng;

      setCurrentLocation({ lat, lng });
      setMapCenter({ lat, lng });

      // Fetch hospitals near the searched location
      const response = await axios.get(
        `/api/hospitals/nearby?latitude=${lat}&longitude=${lng}&maxDistance=50000`
      );
      setHospitals(response.data.hospitals || []);
      setSearchLocation(searchInput);
      setLoading(false);
    } catch (err) {
      console.error('Error searching location:', err);
      setError('Could not find location: ' + searchInput);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const openDirections = (hospital) => {
    const coords = hospital.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading nearby hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Nearby Hospitals</h1>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <p className="text-sm text-gray-600 mb-2">Searching near: {searchLocation}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search location (e.g., Kandy, Galle)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchByLocation()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={searchByLocation}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            Search
          </button>
          <button
            onClick={getCurrentLocation}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            title="Use My Location"
          >
            📍
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={12}
            >
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }}
                  title="Your Location"
                />
              )}

              {hospitals.map((hospital) => {
                const coords = hospital.location.coordinates;
                return (
                  <Marker
                    key={hospital._id}
                    position={{ lat: coords[1], lng: coords[0] }}
                    onClick={() => setSelectedHospital(hospital)}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }}
                  />
                );
              })}

              {selectedHospital && (
                <InfoWindow
                  position={{
                    lat: selectedHospital.location.coordinates[1],
                    lng: selectedHospital.location.coordinates[0]
                  }}
                  onCloseClick={() => setSelectedHospital(null)}
                >
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{selectedHospital.name}</h3>
                    <p className="text-sm text-gray-600">{selectedHospital.distance} km away</p>
                    <p className="text-sm">{selectedHospital.address}</p>
                    <button
                      onClick={() => openDirections(selectedHospital)}
                      className="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
                    >
                      Get Directions
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">
              Hospitals Near You ({hospitals.length})
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {hospitals.map((hospital) => (
                <div
                  key={hospital._id}
                  className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setMapCenter({
                      lat: hospital.location.coordinates[1],
                      lng: hospital.location.coordinates[0]
                    });
                  }}
                >
                  <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                  <p className="text-sm text-teal-600">{hospital.distance} km away</p>
                  <p className="text-sm text-gray-600">{hospital.district}</p>
                  {hospital.phone && (
                    <p className="text-sm text-gray-600">📞 {hospital.phone}</p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(hospital);
                    }}
                    className="mt-2 text-sm text-teal-600 hover:text-teal-800 flex items-center"
                  >
                    <span className="mr-1">🗺️</span> Get Directions
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NearbyHospitals;
