import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, VehicleLocationUpdate } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly API_URL = 'https://localhost:5000/vehicle-service/api/vehicles';

  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.API_URL);
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.API_URL}/${id}`);
  }

  createVehicle(vehicle: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.API_URL, vehicle);
  }

  updateVehicle(id: string, vehicle: UpdateVehicleRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateLocation(id: string, location: VehicleLocationUpdate): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/location`, location);
  }
}
