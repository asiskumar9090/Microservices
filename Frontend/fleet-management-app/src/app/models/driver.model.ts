export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: 'Active' | 'Inactive' | 'OnLeave';
  vehicleId?: string;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDriverRequest {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: string;
  hireDate: Date;
}

export interface UpdateDriverRequest {
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
}

export interface AssignVehicleRequest {
  vehicleId: string;
}
