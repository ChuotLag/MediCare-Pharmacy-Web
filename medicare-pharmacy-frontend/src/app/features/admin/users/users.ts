import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminCreateUserRequest,
  AdminUserQueryRequest,
  UserDto
} from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { TokenService } from '../../../core/services/token.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';


@Component({
  selector: 'app-admin-users',
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  users: UserDto[] = [];

  query: AdminUserQueryRequest = {
    keyword: '',
    role: '',
    isActive: null,
    page: 1,
    pageSize: 10
  };

  totalItems = 0;
  totalPages = 0;

  form = {
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'Customer' as 'Customer' | 'Admin'
  };

  loading = false;
  listLoading = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private adminUserService: AdminUserService,
    private tokenService: TokenService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.listLoading = true;
    this.errorMessage = '';

    const request: AdminUserQueryRequest = {
      ...this.query,
      keyword: this.query.keyword?.trim() || undefined,
      role: this.query.role || undefined,
      isActive: this.query.isActive
    };

    this.adminUserService.getUsers(request).subscribe({
      next: response => {
        this.listLoading = false;
        this.users = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.listLoading = false;
        this.errorMessage = error.message;
      }
    });
  }

  search(): void {
    this.query.page = 1;
    this.loadUsers();
  }

  filter(): void {
    this.query.page = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) {
      return;
    }

    this.query.page = page;
    this.loadUsers();
  }

  createUser(): void {
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

    const request: AdminCreateUserRequest = {
      fullName: this.form.fullName.trim(),
      email: this.form.email.trim().toLowerCase(),
      password: this.form.password,
      phoneNumber: this.form.phoneNumber.trim() || undefined,
      address: this.form.address.trim() || undefined,
      role: this.form.role
    };

    this.loading = true;

    this.authService.adminCreateUser(request).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage =
          response.message || `Tạo tài khoản ${request.role} thành công.`;

        this.resetForm();
        this.loadUsers();
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }

  async toggleActive(user: UserDto): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isCurrentUser(user)) {
      this.errorMessage = 'Bạn không thể khóa tài khoản đang đăng nhập.';
      this.toastService.warning(
        'Không thể thực hiện',
        'Bạn không thể khóa tài khoản đang đăng nhập.'
      );
      return;
    }

    const isUnlock = user.isActive === false;

    const confirmed = await this.confirmService.confirm({
      title: isUnlock ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?',
      message: isUnlock
        ? `Bạn có chắc muốn mở khóa tài khoản "${user.email}" không?`
        : `Bạn có chắc muốn khóa tài khoản "${user.email}" không? Người dùng này sẽ không thể đăng nhập.`,
      confirmText: isUnlock ? 'Mở khóa' : 'Khóa tài khoản',
      cancelText: 'Hủy',
      icon: isUnlock ? 'lock_open' : 'lock',
      variant: isUnlock ? 'success' : 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.adminUserService.toggleActive(user.id).subscribe({
      next: response => {
        this.successMessage =
          response.message || 'Cập nhật trạng thái tài khoản thành công.';

        this.toastService.success(
          'Cập nhật thành công',
          this.successMessage
        );

        this.loadUsers();
      },
      error: error => {
        this.errorMessage = error.message;

        this.toastService.error(
          'Cập nhật thất bại',
          this.errorMessage
        );
      }
    });
  }

  isCurrentUser(user: UserDto): boolean {
    const currentUser = this.tokenService.getUser();

    if (!currentUser) {
      return false;
    }

    return currentUser.id === user.id;
  }

  canToggleUser(user: UserDto): boolean {
    return !this.isCurrentUser(user);
  }

  resetForm(): void {
    this.form = {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
      role: 'Customer'
    };

    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  fillCustomerDemo(): void {
    this.form.role = 'Customer';
    this.form.password = 'Customer@123';
    this.form.confirmPassword = 'Customer@123';
  }

  fillAdminDemo(): void {
    this.form.role = 'Admin';
    this.form.password = 'Admin@123';
    this.form.confirmPassword = 'Admin@123';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getRoleClass(role: string): string {
    return role === 'Admin' ? 'role-admin' : 'role-customer';
  }

  getStatusClass(user: UserDto): string {
    return user.isActive === false ? 'status-locked' : 'status-active';
  }

  getStatusText(user: UserDto): string {
    return user.isActive === false ? 'Locked' : 'Active';
  }

  get pages(): number[] {
    const result: number[] = [];

    for (let i = 1; i <= this.totalPages; i++) {
      result.push(i);
    }

    return result.slice(0, 5);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}