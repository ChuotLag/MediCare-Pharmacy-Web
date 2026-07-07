export interface ProductDto {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description?: string;
  ingredients?: string;
  usageInstructions?: string;
  contraindications?: string;
  manufacturer?: string;
  origin?: string;
  unit: string;
  price: number;
  imageUrl?: string;
  requiresPrescription: boolean;
  isActive: boolean;
  totalStock: number;
}

export interface ProductQueryRequest {
  keyword?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
}