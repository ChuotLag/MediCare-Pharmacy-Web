export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  note?: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  note?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface OrderQueryRequest {
  keyword?: string;
  status?: string;
  page: number;
  pageSize: number;
}