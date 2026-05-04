// ─────────────────────────────────────────────
// Financial / Payment Order types
// ─────────────────────────────────────────────

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded'
  | 'PartiallyPaid'
  | 'FullyPaid'
  | 'CancellationRequested';

export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export type PaymentMethod = 'PayOS' | 'BankTransfer' | 'Cash';

export interface PaymentDto {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt: string | null;
  paymentUrl: string | null;
  description: string | null;
  paymentOrderCode?: string | null;
}

export interface OrderDto {
  id: string;
  userId: string;
  totalAmount: number;
  depositAmount?: number | null;
  patientName?: string | null;
  description: string | null;
  status: OrderStatus;
  createdAt: string;
  paidAmount: number;
  payments: PaymentDto[];
}

export interface UserOrdersResult {
  items: OrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
