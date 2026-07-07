import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VietnamDatePipe } from '../../../shared/pipes/vietnam-date.pipe';
import {
  PrescriptionDto,
  PrescriptionQueryRequest
} from '../../../core/models/prescription.model';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-customer-upload-prescription',
  standalone: true,
  imports: [FormsModule, VietnamDatePipe],
  templateUrl: './upload-prescription.html',
  styleUrl: './upload-prescription.css'
})
export class UploadPrescription implements OnInit {
  selectedFile: File | null = null;
  orderId = '';

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
  uploading = false;
  errorMessage = '';
  successMessage = '';

  selectedPrescription: PrescriptionDto | null = null;

  statuses = ['', 'Pending', 'Approved', 'Rejected'];

  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor(
    private prescriptionService: PrescriptionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  onFileSelected(event: Event): void {
    this.errorMessage = '';
    this.successMessage = '';

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!this.validateFile(file)) {
      input.value = '';
      return;
    }

    this.selectedFile = file;

    this.toastService.success(
      'Chọn file thành công',
      `Đã chọn file: ${file.name}`
    );
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    this.errorMessage = '';
    this.successMessage = '';

    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) {
      return;
    }

    const file = event.dataTransfer.files[0];

    if (!this.validateFile(file)) {
      return;
    }

    this.selectedFile = file;

    this.toastService.success(
      'Chọn file thành công',
      `Đã chọn file: ${file.name}`
    );
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  upload(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedFile) {
      this.errorMessage = 'Vui lòng chọn file đơn thuốc.';

      this.toastService.error(
        'Thiếu file đơn thuốc',
        this.errorMessage
      );

      return;
    }

    this.uploading = true;

    this.prescriptionService
      .upload(this.selectedFile, this.orderId.trim() || undefined)
      .subscribe({
        next: response => {
          this.uploading = false;
          this.selectedFile = null;
          this.orderId = '';

          this.successMessage =
            response.message ||
            'Upload đơn thuốc thành công.';

          this.toastService.success(
            'Upload thành công',
            this.successMessage
          );

          this.loadPrescriptions();
        },
        error: error => {
          this.uploading = false;

          this.errorMessage = this.getErrorMessage(
            error,
            'Upload đơn thuốc thất bại.'
          );

          this.toastService.error(
            'Upload thất bại',
            this.errorMessage
          );
        }
      });
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.errorMessage = '';

    const request: PrescriptionQueryRequest = {
      ...this.query,
      keyword: this.query.keyword?.trim() || undefined,
      status: this.query.status || undefined
    };

    this.prescriptionService.getMyPrescriptions(request).subscribe({
      next: response => {
        this.loading = false;
        this.prescriptions = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.loading = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Không thể tải danh sách đơn thuốc.'
        );

        this.toastService.error(
          'Tải đơn thuốc thất bại',
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

  viewDetail(prescription: PrescriptionDto): void {
    this.selectedPrescription = prescription;
  }

  closeDetail(): void {
    this.selectedPrescription = null;
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

    return (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png')
    );
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

  getFileSizeText(file: File): string {
    const sizeInMb = file.size / 1024 / 1024;

    return `${sizeInMb.toFixed(2)} MB`;
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

  private validateFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !this.allowedExtensions.includes(extension)) {
      this.errorMessage = 'Chỉ hỗ trợ file JPG, JPEG, PNG hoặc PDF.';

      this.toastService.error(
        'File không hợp lệ',
        this.errorMessage
      );

      return false;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'File không được vượt quá 5MB.';

      this.toastService.error(
        'File quá lớn',
        this.errorMessage
      );

      return false;
    }

    return true;
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}