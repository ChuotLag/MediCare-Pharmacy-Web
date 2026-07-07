import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { UserDto } from '../../../core/models/auth.model';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: UserDto | null = null;

  profileForm = {
    fullName: '',
    email: '',
    phoneNumber: '',
    address: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  loading = false;
  passwordLoading = false;

  errorMessage = '';
  successMessage = '';

  passwordErrorMessage = '';
  passwordSuccessMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.me().subscribe({
      next: response => {
        this.loading = false;

        if (!response.data) {
          this.errorMessage = 'Không thể tải thông tin tài khoản.';

          this.toastService.error(
            'Tải thất bại',
            this.errorMessage
          );

          return;
        }

        this.user = response.data;

        this.profileForm = {
          fullName: response.data.fullName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber ?? '',
          address: response.data.address ?? ''
        };
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Không thể tải thông tin tài khoản.'
        );

        this.toastService.error(
          'Tải thất bại',
          this.errorMessage
        );
      }
    });
  }

  async updateProfile(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const fullName = this.profileForm.fullName.trim();
    const phoneNumber = this.profileForm.phoneNumber.trim();
    const address = this.profileForm.address.trim();

    if (!fullName) {
      this.errorMessage = 'Vui lòng nhập họ và tên.';

      this.toastService.error(
        'Thiếu thông tin',
        this.errorMessage
      );

      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Cập nhật hồ sơ?',
      message: 'Bạn có chắc muốn cập nhật thông tin tài khoản không?',
      confirmText: 'Cập nhật',
      cancelText: 'Hủy',
      icon: 'manage_accounts',
      variant: 'primary'
    });

    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.authService.updateProfile({
      fullName,
      phoneNumber: phoneNumber || undefined,
      address: address || undefined
    }).subscribe({
      next: response => {
        this.loading = false;

        if (!response.data) {
          this.errorMessage = 'Cập nhật thông tin thất bại.';

          this.toastService.error(
            'Cập nhật thất bại',
            this.errorMessage
          );

          return;
        }

        this.user = response.data;
        this.tokenService.setUser(response.data);

        this.profileForm = {
          fullName: response.data.fullName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber ?? '',
          address: response.data.address ?? ''
        };

        this.successMessage =
          response.message ||
          'Cập nhật thông tin thành công.';

        this.toastService.success(
          'Cập nhật thành công',
          this.successMessage
        );
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Cập nhật thông tin thất bại.'
        );

        this.toastService.error(
          'Cập nhật thất bại',
          this.errorMessage
        );
      }
    });
  }

  async changePassword(): Promise<void> {
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    if (!this.passwordForm.currentPassword) {
      this.passwordErrorMessage = 'Vui lòng nhập mật khẩu hiện tại.';

      this.toastService.error(
        'Thiếu thông tin',
        this.passwordErrorMessage
      );

      return;
    }

    if (!this.passwordForm.newPassword) {
      this.passwordErrorMessage = 'Vui lòng nhập mật khẩu mới.';

      this.toastService.error(
        'Thiếu thông tin',
        this.passwordErrorMessage
      );

      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordErrorMessage = 'Mật khẩu mới phải có ít nhất 6 ký tự.';

      this.toastService.error(
        'Mật khẩu không hợp lệ',
        this.passwordErrorMessage
      );

      return;
    }

    if (this.passwordForm.newPassword === this.passwordForm.currentPassword) {
      this.passwordErrorMessage = 'Mật khẩu mới không được trùng mật khẩu hiện tại.';

      this.toastService.error(
        'Mật khẩu không hợp lệ',
        this.passwordErrorMessage
      );

      return;
    }

    if (!this.passwordForm.confirmPassword) {
      this.passwordErrorMessage = 'Vui lòng nhập lại mật khẩu mới.';

      this.toastService.error(
        'Thiếu thông tin',
        this.passwordErrorMessage
      );

      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordErrorMessage = 'Mật khẩu xác nhận không khớp.';

      this.toastService.error(
        'Mật khẩu không khớp',
        this.passwordErrorMessage
      );

      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Đổi mật khẩu?',
      message: 'Sau khi đổi mật khẩu, hãy sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.',
      confirmText: 'Đổi mật khẩu',
      cancelText: 'Hủy',
      icon: 'lock_reset',
      variant: 'warning'
    });

    if (!confirmed) {
      return;
    }

    this.passwordLoading = true;

    this.authService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: response => {
        this.passwordLoading = false;

        this.passwordSuccessMessage =
          response.message ||
          'Đổi mật khẩu thành công.';

        this.toastService.success(
          'Đổi mật khẩu thành công',
          this.passwordSuccessMessage
        );

        this.resetPasswordForm();
      },
      error: error => {
        this.passwordLoading = false;

        this.passwordErrorMessage = this.getErrorMessage(
          error,
          'Đổi mật khẩu thất bại.'
        );

        this.toastService.error(
          'Đổi mật khẩu thất bại',
          this.passwordErrorMessage
        );
      }
    });
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}