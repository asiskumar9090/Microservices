import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="text-center mb-4">
          <div class="logo-circle mx-auto mb-3">
            <i class="bi bi-person-plus fs-1 text-white"></i>
          </div>
          <h2 class="fw-bold mb-1">Create Account</h2>
          <p class="text-muted">Sign up for Fleet Management</p>
        </div>
        
        @if (error) {
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>
        }
        
        @if (success) {
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle me-2"></i>{{ success }}
            <button type="button" class="btn-close" (click)="success = ''"></button>
          </div>
        }
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="username" class="form-label">
              <i class="bi bi-person me-1"></i>Username
            </label>
            <input 
              type="text" 
              id="username" 
              class="form-control form-control-lg" 
              formControlName="username"
              placeholder="Choose a username"
              [class.is-invalid]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
            @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Username is required
              </div>
            }
            @if (registerForm.get('username')?.hasError('minlength') && registerForm.get('username')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Username must be at least 3 characters
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">
              <i class="bi bi-envelope me-1"></i>Email
            </label>
            <input 
              type="email" 
              id="email" 
              class="form-control form-control-lg" 
              formControlName="email"
              placeholder="Enter your email"
              [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Email is required
              </div>
            }
            @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Please enter a valid email
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">
              <i class="bi bi-lock me-1"></i>Password
            </label>
            <input 
              type="password" 
              id="password" 
              class="form-control form-control-lg" 
              formControlName="password"
              placeholder="Create a password"
              [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Password is required
              </div>
            }
            @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Password must be at least 6 characters
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">
              <i class="bi bi-lock-fill me-1"></i>Confirm Password
            </label>
            <input 
              type="password" 
              id="confirmPassword" 
              class="form-control form-control-lg" 
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
            @if (registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Please confirm your password
              </div>
            }
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Passwords do not match
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="role" class="form-label">
              <i class="bi bi-shield me-1"></i>Role
            </label>
            <select 
              id="role" 
              class="form-select form-select-lg" 
              formControlName="role">
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" [disabled]="loading || registerForm.invalid">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2"></span>
              <span>Creating Account...</span>
            } @else {
              <i class="bi bi-person-check me-2"></i>
              <span>Sign Up</span>
            }
          </button>
        </form>
        
        <div class="text-center mt-3">
          <p class="mb-0">
            Already have an account? 
            <a routerLink="/login" class="text-decoration-none fw-bold">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .register-card {
      background: white;
      padding: 2.5rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 500px;
      animation: slideUp 0.5s ease;
      max-height: 95vh;
      overflow-y: auto;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    h2 {
      color: #1f2937;
      font-size: 1.75rem;
    }

    .form-control-lg, .form-select-lg {
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      border: 2px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .form-control-lg:focus, .form-select-lg:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
    }

    .btn-primary {
      padding: 0.875rem;
      border-radius: 0.5rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }

    a {
      color: #667eea;
      transition: color 0.2s ease;
    }

    a:hover {
      color: #5568d3;
    }

    /* Custom scrollbar for card */
    .register-card::-webkit-scrollbar {
      width: 6px;
    }

    .register-card::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .register-card::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }

    .register-card::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['User', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.success = 'Account created successfully! Redirecting to login...';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
