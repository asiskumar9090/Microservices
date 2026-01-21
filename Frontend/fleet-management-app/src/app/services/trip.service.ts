import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, CreateTripRequest, EndTripRequest } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly API_URL = 'https://localhost:5000/trip-service/api/trips';

  constructor(private http: HttpClient) { }

  getAllTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.API_URL);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.API_URL}/${id}`);
  }

  createTrip(trip: CreateTripRequest): Observable<Trip> {
    return this.http.post<Trip>(this.API_URL, trip);
  }

  endTrip(id: string, tripData: EndTripRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/end`, tripData);
  }

  getTripsByVehicle(vehicleId: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.API_URL}/vehicle/${vehicleId}`);
  }

  getTripsByDriver(driverId: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.API_URL}/driver/${driverId}`);
  }
}
