import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, CreateVehicleRequest } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="vehicles-container">
      <div class="header">
        <h2>Vehicle Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? 'Cancel' : '+ Add Vehicle' }}
        </button>
      </div>

      @if (showAddForm) {
        <div class="form-card">
          <h3>{{ editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle' }}</h3>
          <form [formGroup]="vehicleForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>License Plate *</label>
                <input type="text" class="form-control" formControlName="licensePlate">
              </div>
              <div class="form-group">
                <label>Model *</label>
                <input type="text" class="form-control" formControlName="model">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Status *</label>
                <select class="form-control" formControlName="status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div class="form-group">
                <label>Location *</label>
                <input type="text" class="form-control" formControlName="lastKnownLocation">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Latitude *</label>
                <input type="number" step="0.0001" class="form-control" formControlName="latitude">
              </div>
              <div class="form-group">
                <label>Longitude *</label>
                <input type="number" step="0.0001" class="form-control" formControlName="longitude">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Current Speed (km/h)</label>
                <input type="number" class="form-control" formControlName="currentSpeed">
              </div>
              <div class="form-group">
                <label>Fuel Level (%)</label>
                <input type="number" class="form-control" formControlName="fuelLevel">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="vehicleForm.invalid || loading">
              {{ loading ? 'Saving...' : (editingVehicle ? 'Update' : 'Add Vehicle') }}
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

      <div class="vehicles-grid">
        @for (vehicle of vehicles; track vehicle.vehicleID) {
          <div class="vehicle-card">
            <div class="vehicle-header">
              <h3>{{ vehicle.licensePlate }}</h3>
              <span class="badge" [class]="'badge-' + vehicle.status.toLowerCase()">
                {{ vehicle.status }}
              </span>
            </div>
            <div class="vehicle-details">
              <p><strong>Model:</strong> {{ vehicle.model }}</p>
              <p><strong>Location:</strong> {{ vehicle.lastKnownLocation }}</p>
              <p><strong>Speed:</strong> {{ vehicle.currentSpeed }} km/h</p>
              <p><strong>Fuel:</strong> {{ vehicle.fuelLevel }}%</p>
              <p><strong>Last Updated:</strong> {{ vehicle.lastUpdated | date:'short' }}</p>
            </div>
            <div class="vehicle-actions">
              <button class="btn btn-sm btn-secondary" (click)="editVehicle(vehicle)">Edit</button>
              <button class="btn btn-sm btn-danger" (click)="deleteVehicle(vehicle.vehicleID)">Delete</button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No vehicles found. Add your first vehicle!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .vehicles-container {
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

    .vehicles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .vehicle-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .vehicle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .vehicle-header h3 {
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

    .badge-active {
      background: #d4edda;
      color: #155724;
    }

    .badge-inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .badge-maintenance {
      background: #fff3cd;
      color: #856404;
    }

    .vehicle-details p {
      margin: 0.5rem 0;
      color: #666;
    }

    .vehicle-actions {
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

    .btn-danger {
      background: #dc3545;
      color: white;
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
    }
  `]
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  vehicleForm: FormGroup;
  showAddForm = false;
  editingVehicle: Vehicle | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {
    this.vehicleForm = this.fb.group({
      licensePlate: ['', Validators.required],
      model: ['', Validators.required],
      status: ['Active', Validators.required],
      lastKnownLocation: ['', Validators.required],
      latitude: [0, Validators.required],
      longitude: [0, Validators.required],
      currentSpeed: [0],
      fuelLevel: [100]
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
      },
      error: (error) => {
        this.error = 'Failed to load vehicles';
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData: CreateVehicleRequest = this.vehicleForm.value;

    if (this.editingVehicle) {
      this.vehicleService.updateVehicle(this.editingVehicle.vehicleID, formData).subscribe({
        next: () => {
          this.success = 'Vehicle updated successfully';
          this.loadVehicles();
          this.resetForm();
        },
        error: (error) => {
          this.error = 'Failed to update vehicle';
          this.loading = false;
        }
      });
    } else {
      this.vehicleService.createVehicle(formData).subscribe({
        next: () => {
          this.success = 'Vehicle added successfully';
          this.loadVehicles();
          this.resetForm();
        },
        error: (error) => {
          this.error = 'Failed to add vehicle';
          this.loading = false;
        }
      });
    }
  }

  editVehicle(vehicle: Vehicle): void {
    this.editingVehicle = vehicle;
    this.showAddForm = true;
    this.vehicleForm.patchValue(vehicle);
  }

  deleteVehicle(id: string): void {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => {
        this.success = 'Vehicle deleted successfully';
        this.loadVehicles();
      },
      error: (error) => {
        this.error = 'Failed to delete vehicle';
      }
    });
  }

  resetForm(): void {
    this.vehicleForm.reset({ status: 'Active', currentSpeed: 0, fuelLevel: 100 });
    this.editingVehicle = null;
    this.showAddForm = false;
    this.loading = false;
  }
}
