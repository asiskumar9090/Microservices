import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-4">
          <div class="logo-circle mx-auto mb-3">
            <i class="bi bi-truck fs-1 text-white"></i>
          </div>
          <h2 class="fw-bold mb-1">Fleet Management</h2>
          <p class="text-muted">Sign in to your account</p>
        </div>
        
        @if (error) {
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="username" class="form-label">
              <i class="bi bi-person me-1"></i>Username
            </label>
            <input 
              type="text" 
              id="username" 
              class="form-control form-control-lg" 
              formControlName="username"
              placeholder="Enter your username"
              [class.is-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
            @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Username is required
              </div>
            }
          </div>

          <div class="mb-4">
            <label for="password" class="form-label">
              <i class="bi bi-lock me-1"></i>Password
            </label>
            <input 
              type="password" 
              id="password" 
              class="form-control form-control-lg" 
              formControlName="password"
              placeholder="Enter your password"
              [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
              <div class="invalid-feedback d-block">
                <i class="bi bi-exclamation-circle me-1"></i>Password is required
              </div>
            }
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" [disabled]="loading || loginForm.invalid">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2"></span>
              <span>Signing in...</span>
            } @else {
              <i class="bi bi-box-arrow-in-right me-2"></i>
              <span>Sign In</span>
            }
          </button>
        </form>
        
        <div class="text-center mt-3">
          <p class="mb-0">
            Don't have an account? 
            <a routerLink="/register" class="text-decoration-none fw-bold">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 440px;
      animation: slideUp 0.5s ease;
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

    .form-control-lg {
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      border: 2px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .form-control-lg:focus {
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

    a:hover {
      color: #5568d3;
    }

    code {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.error = error.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
