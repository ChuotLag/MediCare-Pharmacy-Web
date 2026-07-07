export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AdminCreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  role: 'Customer' | 'Admin';
}

export interface AdminUserQueryRequest {
  keyword?: string;
  role?: 'Customer' | 'Admin' | '';
  isActive?: boolean | null;
  page: number;
  pageSize: number;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}