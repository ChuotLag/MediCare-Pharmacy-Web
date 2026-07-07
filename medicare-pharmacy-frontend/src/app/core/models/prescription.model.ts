export interface PrescriptionDto {
  id: string;
  userId: string;
  userFullName: string;
  orderId?: string;
  orderCode?: string;
  fileUrl: string;
  originalFileName: string;
  status: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PrescriptionQueryRequest {
  keyword?: string;
  status?: string;
  page: number;
  pageSize: number;
}