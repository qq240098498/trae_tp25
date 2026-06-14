export type PaymentMethod = 'cash' | 'qrcode' | 'app';

export interface ParkingRecord {
  id: string;
  date: string;
  locationName: string;
  lat: number | null;
  lng: number | null;
  duration: number;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  isPrepaid: boolean;
  paymentDeadline?: string;
  reminderEnabled: boolean;
  reminderSent: boolean;
  isPaid: boolean;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  floor?: string;
  area?: string;
  photo?: string;
  notes?: string;
  lat?: number | null;
  lng?: number | null;
  indoorDescription?: string;
  createdAt: string;
  isActive: boolean;
}

export interface LocationStats {
  locationName: string;
  totalAmount: number;
  count: number;
}

export interface MonthlyStats {
  month: string;
  totalAmount: number;
  count: number;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '现金',
  qrcode: '扫码',
  app: 'App',
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: 'bg-emerald-100 text-emerald-700',
  qrcode: 'bg-sky-100 text-sky-700',
  app: 'bg-violet-100 text-violet-700',
};
