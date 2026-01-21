export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}
