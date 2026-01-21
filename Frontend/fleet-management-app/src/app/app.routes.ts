import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component.ts';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { DriversComponent } from './components/drivers/drivers.component';
import { TripsComponent } from './components/trips/trips.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'trips', component: TripsComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
