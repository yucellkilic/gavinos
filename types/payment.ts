export type PaymentGateway = 'stripe' | 'square' | 'apple_pay' | 'google_pay';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}
