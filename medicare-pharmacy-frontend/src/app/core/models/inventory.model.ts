export interface InventoryDto {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  importPrice: number;
  sellingPrice: number;
  manufactureDate?: string;
  expiryDate: string;
  lowStockThreshold: number;
  isLowStock: boolean;
  isNearExpiry: boolean;
  daysToExpiry: number;
}

export interface InventoryCreateRequest {
  productId: string;
  batchNumber: string;
  quantity: number;
  importPrice: number;
  sellingPrice: number;
  manufactureDate?: string;
  expiryDate: string;
  lowStockThreshold: number;
}

export interface InventoryUpdateRequest {
  productId: string;
  batchNumber: string;
  quantity: number;
  importPrice: number;
  sellingPrice: number;
  manufactureDate?: string;
  expiryDate: string;
  lowStockThreshold: number;
}

export interface InventoryQueryRequest {
  keyword?: string;
  productId?: string;
  page: number;
  pageSize: number;
}