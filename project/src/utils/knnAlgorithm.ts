export interface ServiceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  phone: string;
  type: 'hospital' | 'police';
  address?: string;
}

export interface ServiceWithDistance extends ServiceLocation {
  distance: number;
  distanceText: string;
}

// Sample data for hospitals and police stations
// In a real application, this would come from an API or database
export const hospitals: ServiceLocation[] = [
  {
    id: 'h1',
    name: 'NRI General Hospital',
    latitude: 16.4537,
    longitude: 80.5286,
    phone: '+91-8645-230101',
    type: 'hospital',
    address: 'Chinakakani, Mangalagiri, Guntur, Andhra Pradesh 522503'
  },
  {
    id: 'h2',
    name: 'Ramesh Hospitals',
    latitude: 16.3067,
    longitude: 80.4365,
    phone: '+91-863-2466666',
    type: 'hospital',
    address: 'Ring Road, Near ITC, Guntur, Andhra Pradesh 522007'
  },
  {
    id: 'h3',
    name: 'Manipal Super Specialty Hospital',
    latitude: 16.3146,
    longitude: 80.4319,
    phone: '+91-863-2233445',
    type: 'hospital',
    address: 'Brodipet, Guntur, Andhra Pradesh 522002'
  },
  {
    id: 'h4',
    name: 'Government General Hospital',
    latitude: 16.2997,
    longitude: 80.4428,
    phone: '+91-863-2222222',
    type: 'hospital',
    address: 'Kothapet, Guntur, Andhra Pradesh 522001'
  },
  {
    id: 'h5',
    name: 'Sravani Hospital',
    latitude: 16.3201,
    longitude: 80.4362,
    phone: '+91-863-2233446',
    type: 'hospital',
    address: 'Arundelpet, Guntur, Andhra Pradesh 522002'
  }
];

export const policeStations: ServiceLocation[] = [
  {
    id: 'p1',
    name: 'Mangalagiri Police Station',
    latitude: 16.4302,
    longitude: 80.5687,
    phone: '+91-863-2344000',
    type: 'police',
    address: 'Mangalagiri, Guntur, Andhra Pradesh 522503'
  },
  {
    id: 'p2',
    name: 'Tadepalli Police Station',
    latitude: 16.4822,
    longitude: 80.6072,
    phone: '+91-863-2222333',
    type: 'police',
    address: 'Tadepalli, Guntur, Andhra Pradesh 522501'
  },
  {
    id: 'p3',
    name: 'Namburu Police Station',
    latitude: 16.3731,
    longitude: 80.5372,
    phone: '+91-863-2233447',
    type: 'police',
    address: 'Namburu, Guntur, Andhra Pradesh 522508'
  },
  {
    id: 'p4',
    name: 'Pedakakani Police Station',
    latitude: 16.3211,
    longitude: 80.4972,
    phone: '+91-863-2233448',
    type: 'police',
    address: 'Pedakakani, Guntur, Andhra Pradesh 522509'
  },
  {
    id: 'p5',
    name: 'Guntur Urban Police Station',
    latitude: 16.3067,
    longitude: 80.4365,
    phone: '+91-863-2233449',
    type: 'police',
    address: 'Guntur, Andhra Pradesh 522007'
  }
];

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  } else {
    return `${distance.toFixed(0)} km`;
  }
}

// KNN algorithm to find nearest services
export function findNearestServices(
  userLat: number,
  userLon: number,
  k: number = 3
): {
  hospitals: ServiceWithDistance[];
  policeStations: ServiceWithDistance[];
} {
  // Calculate distances for all hospitals
  const hospitalsWithDistance: ServiceWithDistance[] = hospitals.map(hospital => ({
    ...hospital,
    distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude),
    distanceText: ''
  }));

  // Calculate distances for all police stations
  const policeStationsWithDistance: ServiceWithDistance[] = policeStations.map(station => ({
    ...station,
    distance: calculateDistance(userLat, userLon, station.latitude, station.longitude),
    distanceText: ''
  }));

  // Sort by distance and take top k
  const nearestHospitals = hospitalsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map(hospital => ({
      ...hospital,
      distanceText: formatDistance(hospital.distance)
    }));

  const nearestPoliceStations = policeStationsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map(station => ({
      ...station,
      distanceText: formatDistance(station.distance)
    }));

  return {
    hospitals: nearestHospitals,
    policeStations: nearestPoliceStations
  };
}

// Enhanced KNN with weighted scoring (considers distance and service type priority)
export function findNearestServicesWeighted(
  userLat: number,
  userLon: number,
  k: number = 3,
  emergencyType?: 'medical' | 'police' | 'general'
): {
  hospitals: ServiceWithDistance[];
  policeStations: ServiceWithDistance[];
} {
  const hospitalsWithDistance: ServiceWithDistance[] = hospitals.map(hospital => ({
    ...hospital,
    distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude),
    distanceText: ''
  }));

  const policeStationsWithDistance: ServiceWithDistance[] = policeStations.map(station => ({
    ...station,
    distance: calculateDistance(userLat, userLon, station.latitude, station.longitude),
    distanceText: ''
  }));

  // Apply weights based on emergency type
  let hospitalWeight = 1;
  let policeWeight = 1;

  if (emergencyType === 'medical') {
    hospitalWeight = 1.5; // Prioritize hospitals for medical emergencies
  } else if (emergencyType === 'police') {
    policeWeight = 1.5; // Prioritize police for security emergencies
  }

  // Sort with weights
  const nearestHospitals = hospitalsWithDistance
    .sort((a, b) => (a.distance * hospitalWeight) - (b.distance * hospitalWeight))
    .slice(0, k)
    .map(hospital => ({
      ...hospital,
      distanceText: formatDistance(hospital.distance)
    }));

  const nearestPoliceStations = policeStationsWithDistance
    .sort((a, b) => (a.distance * policeWeight) - (b.distance * policeWeight))
    .slice(0, k)
    .map(station => ({
      ...station,
      distanceText: formatDistance(station.distance)
    }));

  return {
    hospitals: nearestHospitals,
    policeStations: nearestPoliceStations
  };
}

// Function to get services within a specific radius
export function findServicesInRadius(
  userLat: number,
  userLon: number,
  radiusKm: number
): {
  hospitals: ServiceWithDistance[];
  policeStations: ServiceWithDistance[];
} {
  const allServices = findNearestServices(userLat, userLon, 100); // Get more services to filter for larger radius

  const hospitalsInRadius = allServices.hospitals.filter(
    hospital => hospital.distance <= radiusKm
  );

  const policeStationsInRadius = allServices.policeStations.filter(
    station => station.distance <= radiusKm
  );

  return {
    hospitals: hospitalsInRadius,
    policeStations: policeStationsInRadius
  };
} 