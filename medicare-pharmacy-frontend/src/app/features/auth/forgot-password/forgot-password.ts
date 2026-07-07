import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  step: 1 | 2 = 1;

  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  sendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Vui lòng nhập email.';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword({
      email: this.email.trim()
    }).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage = response.message || 'Mã OTP đã được gửi qua email.';
        this.step = 2;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }

  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp.trim()) {
      this.errorMessage = 'Vui lòng nhập mã OTP.';
      return;
    }

    if (this.otp.trim().length !== 6) {
      this.errorMessage = 'OTP phải gồm 6 chữ số.';
      return;
    }

    if (!this.newPassword) {
      this.errorMessage = 'Vui lòng nhập mật khẩu mới.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.loading = true;

    this.authService.resetPassword({
      email: this.email.trim(),
      otp: this.otp.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage = response.message || 'Đặt lại mật khẩu thành công.';

        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              reset: 'true',
              email: this.email.trim()
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

  backToEmailStep(): void {
    this.step = 1;
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}