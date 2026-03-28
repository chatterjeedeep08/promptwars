export async function getContext(intentStr) {
  try {
    const coords = await getUserLocation();
    
    // 1. Google Maps Geocoding Proxy
    const addressData = await fetch(`/api/maps/geocode?lat=${coords.lat}&lng=${coords.lng}`).then(r => r.json());
    
    // 2. Weather Logic (Open-Meteo is staying since it's excellent and free, Maps doesn't easily do it for free)
    const weatherData = await fetchWeather(coords.lat, coords.lng);

    // 3. Risk Engine
    let infrastructure = null;
    let fallback = null;

    if (intentStr !== 'general' && intentStr) {
      const keywordMap = {
        medical_emergency: 'hospital',
        disaster_response: 'fire station',
        accident_response: 'police station',
        medication_parsing: 'pharmacy',
        legal_assistance: 'police station',
        mental_health: 'hospital',
        infrastructure: 'civil defense',
      };
      
      const searchKeyword = keywordMap[intentStr] || 'emergency';
      
      // Google Places API Backend Proxy
      const placesData = await fetch(`/api/maps/places?lat=${coords.lat}&lng=${coords.lng}&keyword=${searchKeyword}&radius=15000`).then(r => r.json());
      
      const results = placesData.results || [];
      if (results.length > 0) {
        const top = results[0];
        
        // Google Directions API Backend Proxy for exactly accurate driving ETAs
        const directionsData = await fetch(
          `/api/maps/directions?originLat=${coords.lat}&originLng=${coords.lng}&destLat=${top.geometry.location.lat}&destLng=${top.geometry.location.lng}`
        ).then(r => r.json());

        infrastructure = {
          name: top.name,
          type: searchKeyword,
          distance: directionsData.distance || "Unknown",
          eta: directionsData.duration || "Unknown",
          eta_seconds: directionsData.durationValue || 99999,
          vicinity: top.vicinity || top.formatted_address,
          status: top.business_status
        };

        if (results.length > 1) {
          const second = results[1];
          fallback = {
            name: second.name,
            type: searchKeyword,
            distance: "Backup option",
            eta: "Unknown",
            vicinity: second.vicinity || second.formatted_address
          };
        }
      }
    }

    return {
      gps: { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy },
      address: addressData.address || "Fetching accurate maps location...",
      weather: weatherData,
      nearest_service: infrastructure || { name: 'Dispatching Universal EMS', eta: '5-10 mins', distance: 'Variable' },
      backup_service: fallback
    };

  } catch (err) {
    console.error('Context Enrichment Failed:', err);
    return {
      error: 'Live context unavailable. ' + err.message,
      gps: null,
      address: 'Unknown (Fallback Protocol Active)',
      weather: null,
      nearest_service: { name: 'Emergency Fallback EMS', eta: 'Immediate Dispatch', distance: 'N/A' },
      backup_service: null
    };
  }
}

// ----------------------------------------------------
// Core Implementation Methods
// ----------------------------------------------------

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
      },
      (err) => {
        reject(new Error("Location permission denied or unavailable. Assessing without precise GPS."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Keeping Open-Meteo, it's outstanding and doesn't require paid APIs
async function fetchWeather(lat, lng) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
    const data = await res.json();
    return {
      temp: `${Math.round(data.current_weather.temperature)}°C`,
      windspeed: `${data.current_weather.windspeed} km/h`,
      condition: parseWeatherCode(data.current_weather.weathercode)
    };
  } catch (e) {
    return { temp: 'N/A', windspeed: 'N/A', condition: 'Unknown' };
  }
}

function parseWeatherCode(code) {
  if (code <= 3) return 'Clear / Cloudy';
  if (code <= 49) return 'Fog / Low Visibility';
  if (code <= 69) return 'Rain / Slick Conditions';
  if (code <= 79) return 'Snow / Ice Hazards';
  if (code <= 99) return 'Thunderstorm / Extreme Risk';
  return 'Unknown';
}
