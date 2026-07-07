export interface DashboardSummaryDto {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockItems: number;
  nearExpiryItems: number;
  totalCustomers: number;
  totalProducts: number;
  totalPrescriptionsPending: number;
}

export interface RevenueReportDto {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface TopSellingProductDto {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface RevenueQueryRequest {
  fromDate?: string;
  toDate?: string;
}