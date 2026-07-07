import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  form: LoginRequest = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParamMap.get('registered');
    const reset = this.route.snapshot.queryParamMap.get('reset');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (email) {
      this.form.email = email;
    }

    if (registered === 'true') {
      this.successMessage = 'Đăng ký thành công. Vui lòng đăng nhập.';
    }

    if (reset === 'true') {
      this.successMessage = 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.';
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.email.trim()) {
      this.errorMessage = 'Vui lòng nhập email.';
      return;
    }

    if (!this.form.password) {
      this.errorMessage = 'Vui lòng nhập mật khẩu.';
      return;
    }

    const request: LoginRequest = {
      email: this.form.email.trim().toLowerCase(),
      password: this.form.password
    };

    this.loading = true;

    this.authService.login(request).subscribe({
      next: response => {
        this.loading = false;

        if (!response.data) {
          this.errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
          return;
        }

        const role = response.data.user.role;

        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        this.router.navigate(['/']);
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }
}