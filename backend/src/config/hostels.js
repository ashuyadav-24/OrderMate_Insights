// Centralized Hostel Registry
// Boys Hostels: E, F, G, H, I, J, K, L
// Girls Hostels: A, B, C, D, M

const HOSTEL_CONFIG = {
  CATEGORIES: {
    BOYS: 'Boys Hostel',
    GIRLS: 'Girls Hostel'
  },
  HOSTELS: {
    'Boys Hostel': ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    'Girls Hostel': ['A', 'B', 'C', 'D', 'M']
  },
  // Approximate coordinates on campus (normalized for distance calculation)
  // Distance in meters roughly across campus grid
  COORDINATES: {
    // Boys Hostels Cluster
    'E': { lat: 28.5451, lng: 77.1912 },
    'F': { lat: 28.5456, lng: 77.1918 },
    'G': { lat: 28.5460, lng: 77.1923 },
    'H': { lat: 28.5464, lng: 77.1928 },
    'I': { lat: 28.5469, lng: 77.1932 },
    'J': { lat: 28.5473, lng: 77.1936 },
    'K': { lat: 28.5478, lng: 77.1941 },
    'L': { lat: 28.5482, lng: 77.1945 },
    // Girls Hostels Cluster
    'A': { lat: 28.5412, lng: 77.1852 },
    'B': { lat: 28.5418, lng: 77.1858 },
    'C': { lat: 28.5423, lng: 77.1864 },
    'D': { lat: 28.5428, lng: 77.1870 },
    'M': { lat: 28.5434, lng: 77.1875 }
  }
};

const isValidHostel = (category, hostelName) => {
  const allowed = HOSTEL_CONFIG.HOSTELS[category];
  return allowed && allowed.includes(hostelName);
};

const getDistanceMeters = (coord1, coord2) => {
  if (!coord1 || !coord2 || !coord1.lat || !coord2.lat) return null;
  const R = 6371e3; // Earth radius in meters
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(coord2.lat - coord1.lat);
  const dLng = rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(coord1.lat)) * Math.cos(rad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

module.exports = {
  HOSTEL_CONFIG,
  isValidHostel,
  getDistanceMeters
};
