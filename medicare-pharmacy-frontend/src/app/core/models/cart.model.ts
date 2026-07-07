export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  requiresPrescription: boolean;
  availableStock: number;
}

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  totalItems: number;
  totalAmount: number;
  hasPrescriptionRequiredItems: boolean;
}