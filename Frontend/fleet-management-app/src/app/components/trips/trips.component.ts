import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripService } from '../../services/trip.service';
import { VehicleService } from '../../services/vehicle.service';
import { DriverService } from '../../services/driver.service';
import { Trip } from '../../models/trip.model';
import { Vehicle } from '../../models/vehicle.model';
import { Driver } from '../../models/driver.model';

@Component({
  selector: 'app-trips',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="trips-container">
      <div class="header">
        <h2>Trip Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? 'Cancel' : '+ Start New Trip' }}
        </button>
      </div>

      @if (showAddForm) {
        <div class="form-card">
          <h3>Start New Trip</h3>
          <form [formGroup]="tripForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Vehicle *</label>
                <select class="form-control" formControlName="vehicleID">
                  <option value="">Select Vehicle</option>
                  @for (vehicle of vehicles; track vehicle.vehicleID) {
                    <option [value]="vehicle.vehicleID">{{ vehicle.licensePlate }} - {{ vehicle.model }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Driver *</label>
                <select class="form-control" formControlName="driverID">
                  <option value="">Select Driver</option>
                  @for (driver of drivers; track driver.id) {
                    <option [value]="driver.id">{{ driver.firstName }} {{ driver.lastName }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Start Location *</label>
              <input type="text" class="form-control" formControlName="startLocation">
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="tripForm.invalid || loading">
              {{ loading ? 'Starting...' : 'Start Trip' }}
            </button>
          </form>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      <div class="trips-list">
        @for (trip of trips; track trip.tripID) {
          <div class="trip-card">
            <div class="trip-header">
              <h3>Trip #{{ trip.tripID.substring(0, 8) }}</h3>
              <span class="badge" [class]="'badge-' + trip.status.toLowerCase()">
                {{ trip.status }}
              </span>
            </div>
            <div class="trip-details">
              <div class="detail-row">
                <div class="detail-item">
                  <strong>Vehicle ID:</strong> {{ trip.vehicleID.substring(0, 8) }}...
                </div>
                <div class="detail-item">
                  <strong>Driver ID:</strong> {{ trip.driverID.substring(0, 8) }}...
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <strong>Start:</strong> {{ trip.startLocation }}
                </div>
                <div class="detail-item">
                  <strong>End:</strong> {{ trip.endLocation || 'In Progress' }}
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <strong>Start Time:</strong> {{ trip.startTime | date:'short' }}
                </div>
                <div class="detail-item">
                  <strong>End Time:</strong> {{ trip.endTime ? (trip.endTime | date:'short') : 'N/A' }}
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <strong>Distance:</strong> {{ trip.distanceTraveled }} km
                </div>
                <div class="detail-item">
                  <strong>Avg Speed:</strong> {{ trip.averageSpeed }} km/h
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <strong>Max Speed:</strong> {{ trip.maxSpeed }} km/h
                </div>
                <div class="detail-item">
                  <strong>Fuel Consumed:</strong> {{ trip.fuelConsumed }} L
                </div>
              </div>
            </div>
            @if (trip.status === 'InProgress') {
              <div class="trip-actions">
                <button class="btn btn-sm btn-warning" (click)="showEndTripForm(trip)">End Trip</button>
              </div>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <p>No trips found. Start your first trip!</p>
          </div>
        }
      </div>

      @if (endingTrip) {
        <div class="modal-backdrop" (click)="cancelEndTrip()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>End Trip</h3>
            <form [formGroup]="endTripForm" (ngSubmit)="endTrip()">
              <div class="form-group">
                <label>End Location *</label>
                <input type="text" class="form-control" formControlName="endLocation">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Distance Traveled (km) *</label>
                  <input type="number" class="form-control" formControlName="distanceTraveled">
                </div>
                <div class="form-group">
                  <label>Fuel Consumed (L) *</label>
                  <input type="number" step="0.1" class="form-control" formControlName="fuelConsumed">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Average Speed (km/h) *</label>
                  <input type="number" class="form-control" formControlName="averageSpeed">
                </div>
                <div class="form-group">
                  <label>Max Speed (km/h) *</label>
                  <input type="number" class="form-control" formControlName="maxSpeed">
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="cancelEndTrip()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="endTripForm.invalid || loading">
                  {{ loading ? 'Ending...' : 'End Trip' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .trips-container {
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .form-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .form-card h3 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .trips-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .trip-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .trip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .trip-header h3 {
      margin: 0;
      color: #333;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-inprogress {
      background: #fff3cd;
      color: #856404;
    }

    .badge-completed {
      background: #d4edda;
      color: #155724;
    }

    .badge-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .trip-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-item {
      color: #666;
    }

    .detail-item strong {
      color: #333;
    }

    .trip-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #000;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .alert {
      padding: 0.75rem;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background: #f8d7da;
      color: #721c24;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
      background: white;
      border-radius: 10px;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  `]
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  tripForm: FormGroup;
  endTripForm: FormGroup;
  showAddForm = false;
  endingTrip: Trip | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {
    this.tripForm = this.fb.group({
      vehicleID: ['', Validators.required],
      driverID: ['', Validators.required],
      startLocation: ['', Validators.required]
    });

    this.endTripForm = this.fb.group({
      endLocation: ['', Validators.required],
      distanceTraveled: [0, Validators.required],
      averageSpeed: [0, Validators.required],
      maxSpeed: [0, Validators.required],
      fuelConsumed: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTrips();
    this.loadVehicles();
    this.loadDrivers();
  }

  loadTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data) => {
        this.trips = data.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      },
      error: (error) => {
        this.error = 'Failed to load trips';
        console.error(error);
      }
    });
  }

  loadVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
      },
      error: (error) => {
        console.error('Failed to load vehicles', error);
      }
    });
  }

  loadDrivers(): void {
    this.driverService.getAllDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
      },
      error: (error) => {
        console.error('Failed to load drivers', error);
      }
    });
  }

  onSubmit(): void {
    if (this.tripForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.tripService.createTrip(this.tripForm.value).subscribe({
      next: () => {
        this.success = 'Trip started successfully';
        this.loadTrips();
        this.resetForm();
      },
      error: (error) => {
        this.error = 'Failed to start trip';
        this.loading = false;
      }
    });
  }

  showEndTripForm(trip: Trip): void {
    this.endingTrip = trip;
    this.endTripForm.reset();
  }

  endTrip(): void {
    if (this.endTripForm.invalid || !this.endingTrip) return;

    this.loading = true;
    this.error = '';

    this.tripService.endTrip(this.endingTrip.tripID, this.endTripForm.value).subscribe({
      next: () => {
        this.success = 'Trip ended successfully';
        this.loadTrips();
        this.cancelEndTrip();
      },
      error: (error) => {
        this.error = 'Failed to end trip';
        this.loading = false;
      }
    });
  }

  cancelEndTrip(): void {
    this.endingTrip = null;
    this.endTripForm.reset();
    this.loading = false;
  }

  resetForm(): void {
    this.tripForm.reset();
    this.showAddForm = false;
    this.loading = false;
  }
}
