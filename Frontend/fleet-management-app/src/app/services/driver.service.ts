import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver, CreateDriverRequest, UpdateDriverRequest, AssignVehicleRequest } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly API_URL = 'https://localhost:5000/driver-service/api/drivers';

  constructor(private http: HttpClient) { }

  getAllDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.API_URL);
  }

  getDriverById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.API_URL}/${id}`);
  }

  createDriver(driver: CreateDriverRequest): Observable<Driver> {
    return this.http.post<Driver>(this.API_URL, driver);
  }

  updateDriver(id: string, driver: UpdateDriverRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, driver);
  }

  deleteDriver(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  assignVehicle(id: string, vehicleData: AssignVehicleRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/assign-vehicle`, vehicleData);
  }

  unassignVehicle(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/unassign-vehicle`, {});
  }
}
