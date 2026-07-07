import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  form = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.fullName.trim()) {
      this.errorMessage = 'Vui lòng nhập họ và tên.';
      return;
    }

    if (!this.form.email.trim()) {
      this.errorMessage = 'Vui lòng nhập email.';
      return;
    }

    if (!this.isValidEmail(this.form.email.trim())) {
      this.errorMessage = 'Email không hợp lệ.';
      return;
    }

    if (!this.form.password) {
      this.errorMessage = 'Vui lòng nhập mật khẩu.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    const request: RegisterRequest = {
      fullName: this.form.fullName.trim(),
      email: this.form.email.trim().toLowerCase(),
      password: this.form.password,
      phoneNumber: this.form.phoneNumber.trim() || undefined,
      address: this.form.address.trim() || undefined
    };

    this.loading = true;

    this.authService.register(request).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage = response.message || 'Đăng ký tài khoản thành công.';

        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              registered: 'true',
              email: request.email
            }
          });
        }, 800);
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}