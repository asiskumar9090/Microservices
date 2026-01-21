export interface Vehicle {
  vehicleID: string;
  licensePlate: string;
  model: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  latitude: number;
  longitude: number;
  lastKnownLocation: string;
  currentSpeed: number;
  fuelLevel: number;
  lastUpdated: Date;
}

export interface CreateVehicleRequest {
  licensePlate: string;
  model: string;
  status: string;
  latitude: number;
  longitude: number;
  lastKnownLocation: string;
  currentSpeed: number;
  fuelLevel: number;
}

export interface UpdateVehicleRequest {
  licensePlate?: string;
  model?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  lastKnownLocation?: string;
  currentSpeed?: number;
  fuelLevel?: number;
}

export interface VehicleLocationUpdate {
  latitude: number;
  longitude: number;
  lastKnownLocation: string;
  currentSpeed: number;
}
