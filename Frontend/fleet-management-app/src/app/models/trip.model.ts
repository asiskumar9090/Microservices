export interface Trip {
  tripID: string;
  vehicleID: string;
  driverID: string;
  startLocation: string;
  endLocation: string;
  startTime: Date;
  endTime?: Date;
  distanceTraveled: number;
  status: 'InProgress' | 'Completed' | 'Cancelled';
  averageSpeed: number;
  maxSpeed: number;
  fuelConsumed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTripRequest {
  vehicleID: string;
  driverID: string;
  startLocation: string;
}

export interface EndTripRequest {
  endLocation: string;
  distanceTraveled: number;
  averageSpeed: number;
  maxSpeed: number;
  fuelConsumed: number;
}
