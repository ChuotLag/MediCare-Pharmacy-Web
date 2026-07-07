import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VietnamDatePipe } from '../../../shared/pipes/vietnam-date.pipe';
import {
  PrescriptionDto,
  PrescriptionQueryRequest
} from '../../../core/models/prescription.model';
import {
  AdminPrescriptionService,
  PrescriptionReviewRequest
} from '../../../core/services/admin-prescription.service';
import { environment } from '../../../../environments/environment';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-prescriptions',
  standalone: true,
  imports: [FormsModule, VietnamDatePipe],
  templateUrl: './prescriptions.html',
  styleUrl: './prescriptions.css'
})
export class Prescriptions implements OnInit {
  prescriptions: PrescriptionDto[] = [];

  query: PrescriptionQueryRequest = {
    keyword: '',
    status: '',
    page: 1,
    pageSize: 10
  };

  totalItems = 0;
  totalPages = 0;

  loading = false;
  reviewing = false;
  errorMessage = '';
  successMessage = '';

  selectedPrescription: PrescriptionDto | null = null;

  reviewForm = {
    status: 'Approved',
    adminNote: ''
  };

  statuses = ['', 'Pending', 'Approved', 'Rejected'];

  constructor(
    private prescriptionService: AdminPrescriptionService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: PrescriptionQueryRequest = {
      ...this.query,
      keyword: this.query.keyword?.trim() || undefined,
      status: this.query.status || undefined
    };

    this.prescriptionService.getAll(request).subscribe({
      next: response => {
        this.loading = false;
        this.prescriptions = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách đơn thuốc.';

        this.toastService.error(
          'Tải thất bại',
          this.errorMessage
        );
      }
    });
  }

  search(): void {
    this.query.page = 1;
    this.loadPrescriptions();
  }

  filterStatus(): void {
    this.query.page = 1;
    this.loadPrescriptions();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) {
      return;
    }

    this.query.page = page;
    this.loadPrescriptions();
  }

  viewDetail(
    prescription: PrescriptionDto,
    reviewStatus?: 'Approved' | 'Rejected'
  ): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.prescriptionService.getById(prescription.id).subscribe({
      next: response => {
        if (!response.data) {
          this.errorMessage = 'Không tìm thấy chi tiết đơn thuốc.';
          return;
        }

        this.selectedPrescription = response.data;

        this.reviewForm = {
          status: reviewStatus ?? this.getDefaultReviewStatus(response.data.status),
          adminNote: response.data.adminNote ?? ''
        };
      },
      error: error => {
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải chi tiết đơn thuốc.';

        this.toastService.error(
          'Tải thất bại',
          this.errorMessage
        );
      }
    });
  }

  closeDetail(): void {
    this.selectedPrescription = null;
    this.resetReviewForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  approve(prescription: PrescriptionDto): void {
    this.viewDetail(prescription, 'Approved');
  }

  reject(prescription: PrescriptionDto): void {
    this.viewDetail(prescription, 'Rejected');
  }

  resetReviewForm(): void {
    this.reviewForm = {
      status: 'Approved',
      adminNote: ''
    };
  }

  private getDefaultReviewStatus(status: string): string {
    if (status === 'Rejected') {
      return 'Rejected';
    }

    return 'Approved';
  }

  async submitReview(): Promise<void> {
    if (!this.selectedPrescription) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (this.selectedPrescription.status !== 'Pending') {
      this.errorMessage = 'Đơn thuốc này đã được duyệt hoặc từ chối trước đó.';
      this.toastService.error(
        'Không thể duyệt',
        this.errorMessage
      );
      return;
    }

    if (!this.reviewForm.status) {
      this.errorMessage = 'Vui lòng chọn trạng thái duyệt.';
      return;
    }

    if (
      this.reviewForm.status === 'Rejected' &&
      !this.reviewForm.adminNote.trim()
    ) {
      this.errorMessage = 'Vui lòng nhập lý do từ chối đơn thuốc.';
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: this.reviewForm.status === 'Approved'
        ? 'Duyệt đơn thuốc?'
        : 'Từ chối đơn thuốc?',
      message: this.reviewForm.status === 'Approved'
        ? 'Bạn có chắc muốn duyệt đơn thuốc này không?'
        : 'Bạn có chắc muốn từ chối đơn thuốc này không?',
      confirmText: this.reviewForm.status === 'Approved'
        ? 'Duyệt đơn'
        : 'Từ chối',
      cancelText: 'Hủy',
      icon: this.getStatusConfirmIcon(this.reviewForm.status),
      variant: this.getStatusConfirmVariant(this.reviewForm.status)
    });

    if (!confirmed) {
      return;
    }

    this.reviewing = true;

    const request: PrescriptionReviewRequest = {
      status: this.reviewForm.status,
      adminNote: this.reviewForm.adminNote.trim() || undefined
    };

    this.prescriptionService
      .review(this.selectedPrescription.id, request)
      .subscribe({
        next: response => {
          this.reviewing = false;

          if (response.data) {
            this.selectedPrescription = response.data;
          }

          this.successMessage =
            response.message ||
            (
              this.reviewForm.status === 'Approved'
                ? 'Đã duyệt đơn thuốc.'
                : 'Đã từ chối đơn thuốc.'
            );

          this.toastService.success(
            this.reviewForm.status === 'Approved'
              ? 'Duyệt thành công'
              : 'Từ chối thành công',
            this.successMessage
          );

          this.loadPrescriptions();
        },
        error: error => {
          this.reviewing = false;
          this.errorMessage =
            error.error?.message ||
            error.message ||
            'Duyệt đơn thuốc thất bại.';

          this.toastService.error(
            'Duyệt thất bại',
            this.errorMessage
          );
        }
      });
  }

  getFileUrl(fileUrl: string): string {
    const apiBaseUrl = environment.apiUrl.replace('/api', '');

    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }

    return `${apiBaseUrl}${fileUrl}`;
  }

  isImage(fileUrl: string): boolean {
    const lower = fileUrl.toLowerCase().split('?')[0];

    return lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp');
  }

  isPdf(fileUrl: string): boolean {
    return fileUrl.toLowerCase().split('?')[0].endsWith('.pdf');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Chờ duyệt';
      case 'Approved':
        return 'Đã duyệt';
      case 'Rejected':
        return 'Từ chối';
      default:
        return status || 'Tất cả trạng thái';
    }
  }

  getStatusConfirmIcon(status: string): string {
    switch (status) {
      case 'Approved':
        return 'check_circle';
      case 'Rejected':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusConfirmVariant(status: string): 'primary' | 'danger' | 'warning' | 'success' {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'primary';
    }
  }

  get pages(): number[] {
    const result: number[] = [];

    const maxVisiblePages = 5;
    const currentPage = this.query.page;
    const totalPages = this.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }

      return result;
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }
}