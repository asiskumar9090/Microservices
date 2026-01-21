import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VehicleService } from '../../services/vehicle.service';
import { DriverService } from '../../services/driver.service';
import { TripService } from '../../services/trip.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- Top Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-gradient sticky-top">
        <div class="container-fluid">
          <a class="navbar-brand d-flex align-items-center" href="#">
            <i class="bi bi-truck fs-3 me-2"></i>
            <span class="fw-bold">Fleet Management</span>
          </a>
          <div class="d-flex align-items-center">
            <div class="dropdown">
              <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                {{ username }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div class="d-flex">
        <!-- Sidebar -->
        <div class="sidebar bg-light border-end">
          <div class="p-3">
            <h6 class="text-muted text-uppercase small fw-bold mb-3">Navigation</h6>
            <nav class="nav flex-column">
              <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" 
                 class="nav-link d-flex align-items-center">
                <i class="bi bi-speedometer2 me-2"></i>
                <span>Dashboard</span>
              </a>
              <a routerLink="/vehicles" routerLinkActive="active" class="nav-link d-flex align-items-center">
                <i class="bi bi-car-front me-2"></i>
                <span>Vehicles</span>
              </a>
              <a routerLink="/drivers" routerLinkActive="active" class="nav-link d-flex align-items-center">
                <i class="bi bi-person-badge me-2"></i>
                <span>Drivers</span>
              </a>
              <a routerLink="/trips" routerLinkActive="active" class="nav-link d-flex align-items-center">
                <i class="bi bi-map me-2"></i>
                <span>Trips</span>
              </a>
              <a routerLink="/notifications" routerLinkActive="active" class="nav-link d-flex align-items-center">
                <i class="bi bi-bell me-2"></i>
                <span>Notifications</span>
              </a>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content flex-grow-1">
          @if (isHomePage) {
            <div class="container-fluid">
              <!-- Page Header -->
              <div class="row mb-4">
                <div class="col">
                  <h2 class="mb-1">Dashboard Overview</h2>
                  <p class="text-muted">Monitor your fleet operations at a glance</p>
                </div>
              </div>

              <!-- Stats Cards -->
              <div class="row g-4 mb-4">
                <div class="col-md-6 col-lg-4 col-xl">
                  <div class="card stat-card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                          <i class="bi bi-car-front fs-3"></i>
                        </div>
                        <div>
                          <h3 class="mb-0 fw-bold">{{ stats.totalVehicles }}</h3>
                          <p class="text-muted mb-0 small">Total Vehicles</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 col-lg-4 col-xl">
                  <div class="card stat-card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                          <i class="bi bi-check-circle fs-3"></i>
                        </div>
                        <div>
                          <h3 class="mb-0 fw-bold">{{ stats.activeVehicles }}</h3>
                          <p class="text-muted mb-0 small">Active Vehicles</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 col-lg-4 col-xl">
                  <div class="card stat-card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                          <i class="bi bi-people fs-3"></i>
                        </div>
                        <div>
                          <h3 class="mb-0 fw-bold">{{ stats.totalDrivers }}</h3>
                          <p class="text-muted mb-0 small">Total Drivers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 col-lg-4 col-xl">
                  <div class="card stat-card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                          <i class="bi bi-arrow-repeat fs-3"></i>
                        </div>
                        <div>
                          <h3 class="mb-0 fw-bold">{{ stats.activeTrips }}</h3>
                          <p class="text-muted mb-0 small">Active Trips</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 col-lg-4 col-xl">
                  <div class="card stat-card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon bg-secondary bg-opacity-10 text-secondary rounded-circle p-3 me-3">
                          <i class="bi bi-check2-square fs-3"></i>
                        </div>
                        <div>
                          <h3 class="mb-0 fw-bold">{{ stats.completedTrips }}</h3>
                          <p class="text-muted mb-0 small">Completed Trips</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Welcome Card -->
              <div class="row">
                <div class="col-12">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center p-5">
                      <i class="bi bi-check-circle-fill text-primary fs-1 mb-3"></i>
                      <h2 class="mb-3">Welcome to Fleet Management System</h2>
                      <p class="text-muted mb-4 lead">Manage your fleet vehicles, drivers, and trips efficiently from one centralized dashboard.</p>
                      <div class="d-flex gap-3 justify-content-center flex-wrap">
                        <button class="btn btn-primary btn-lg px-4" routerLink="/vehicles">
                          <i class="bi bi-car-front me-2"></i>View Vehicles
                        </button>
                        <button class="btn btn-outline-primary btn-lg px-4" routerLink="/drivers">
                          <i class="bi bi-person-badge me-2"></i>View Drivers
                        </button>
                        <button class="btn btn-outline-primary btn-lg px-4" routerLink="/trips">
                          <i class="bi bi-map me-2"></i>View Trips
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <router-outlet></router-outlet>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .bg-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .sidebar {
      width: 260px;
      min-height: calc(100vh - 56px);
      background: white;
    }

    .sidebar .nav-link {
      color: #495057;
      padding: 0.75rem 1.25rem;
      margin-bottom: 0.25rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .sidebar .nav-link:hover {
      background: #f8f9fa;
      color: #667eea;
      text-decoration: none;
    }

    .sidebar .nav-link.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 500;
    }

    .sidebar .nav-link i {
      width: 20px;
    }

    .main-content {
      padding: 2rem;
      background: #f8f9fa;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dropdown-toggle::after {
      margin-left: 0.5em;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        min-height: auto;
      }

      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  username = '';
  isHomePage = true;
  stats = {
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    activeTrips: 0,
    completedTrips: 0
  };

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private tripService: TripService,
    private router: Router
  ) {
    const user = this.authService.currentUserValue;
    this.username = user?.username || 'User';

    this.router.events.subscribe(() => {
      this.isHomePage = this.router.url === '/dashboard';
    });
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    forkJoin({
      vehicles: this.vehicleService.getAllVehicles(),
      drivers: this.driverService.getAllDrivers(),
      trips: this.tripService.getAllTrips()
    }).subscribe({
      next: (data) => {
        this.stats.totalVehicles = data.vehicles.length;
        this.stats.activeVehicles = data.vehicles.filter(v => v.status === 'Active').length;
        this.stats.totalDrivers = data.drivers.length;
        this.stats.activeTrips = data.trips.filter(t => t.status === 'InProgress').length;
        this.stats.completedTrips = data.trips.filter(t => t.status === 'Completed').length;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
