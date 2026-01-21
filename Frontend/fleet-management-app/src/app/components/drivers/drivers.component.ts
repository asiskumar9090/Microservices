import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { Driver } from '../../models/driver.model';

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="drivers-container">
      <div class="header">
        <h2>Driver Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? 'Cancel' : '+ Add Driver' }}
        </button>
      </div>

      @if (showAddForm) {
        <div class="form-card">
          <h3>{{ editingDriver ? 'Edit Driver' : 'Add New Driver' }}</h3>
          <form [formGroup]="driverForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" class="form-control" formControlName="firstName">
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" class="form-control" formControlName="lastName">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>License Number *</label>
                <input type="text" class="form-control" formControlName="licenseNumber">
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <input type="text" class="form-control" formControlName="phoneNumber">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" class="form-control" formControlName="email">
              </div>
              <div class="form-group">
                <label>Status *</label>
                <select class="form-control" formControlName="status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="OnLeave">On Leave</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Hire Date *</label>
              <input type="date" class="form-control" formControlName="hireDate">
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="driverForm.invalid || loading">
              {{ loading ? 'Saving...' : (editingDriver ? 'Update' : 'Add Driver') }}
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

      <div class="drivers-grid">
        @for (driver of drivers; track driver.id) {
          <div class="driver-card">
            <div class="driver-header">
              <h3>{{ driver.firstName }} {{ driver.lastName }}</h3>
              <span class="badge" [class]="'badge-' + driver.status.toLowerCase()">
                {{ driver.status }}
              </span>
            </div>
            <div class="driver-details">
              <p><strong>License:</strong> {{ driver.licenseNumber }}</p>
              <p><strong>Phone:</strong> {{ driver.phoneNumber }}</p>
              <p><strong>Email:</strong> {{ driver.email }}</p>
              <p><strong>Hire Date:</strong> {{ driver.hireDate | date:'mediumDate' }}</p>
              @if (driver.vehicleId) {
                <p><strong>Assigned Vehicle:</strong> {{ driver.vehicleId }}</p>
              } @else {
                <p><strong>Status:</strong> Not assigned to any vehicle</p>
              }
            </div>
            <div class="driver-actions">
              <button class="btn btn-sm btn-secondary" (click)="editDriver(driver)">Edit</button>
              <button class="btn btn-sm btn-danger" (click)="deleteDriver(driver.id)">Delete</button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No drivers found. Add your first driver!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .drivers-container {
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

    .drivers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .driver-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .driver-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .driver-header h3 {
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

    .badge-onleave {
      background: #fff3cd;
      color: #856404;
    }

    .driver-details p {
      margin: 0.5rem 0;
      color: #666;
    }

    .driver-actions {
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
export class DriversComponent implements OnInit {
  drivers: Driver[] = [];
  driverForm: FormGroup;
  showAddForm = false;
  editingDriver: Driver | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService
  ) {
    this.driverForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      status: ['Active', Validators.required],
      hireDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.driverService.getAllDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
      },
      error: (error) => {
        this.error = 'Failed to load drivers';
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.driverForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = this.driverForm.value;

    if (this.editingDriver) {
      this.driverService.updateDriver(this.editingDriver.id, formData).subscribe({
        next: () => {
          this.success = 'Driver updated successfully';
          this.loadDrivers();
          this.resetForm();
        },
        error: (error) => {
          this.error = 'Failed to update driver';
          this.loading = false;
        }
      });
    } else {
      this.driverService.createDriver(formData).subscribe({
        next: () => {
          this.success = 'Driver added successfully';
          this.loadDrivers();
          this.resetForm();
        },
        error: (error) => {
          this.error = 'Failed to add driver';
          this.loading = false;
        }
      });
    }
  }

  editDriver(driver: Driver): void {
    this.editingDriver = driver;
    this.showAddForm = true;
    const hireDate = new Date(driver.hireDate);
    const formattedDate = hireDate.toISOString().split('T')[0];
    this.driverForm.patchValue({
      ...driver,
      hireDate: formattedDate
    });
  }

  deleteDriver(id: string): void {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    this.driverService.deleteDriver(id).subscribe({
      next: () => {
        this.success = 'Driver deleted successfully';
        this.loadDrivers();
      },
      error: (error) => {
        this.error = 'Failed to delete driver';
      }
    });
  }

  resetForm(): void {
    this.driverForm.reset({ status: 'Active' });
    this.editingDriver = null;
    this.showAddForm = false;
    this.loading = false;
  }
}
