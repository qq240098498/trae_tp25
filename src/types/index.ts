export type PaymentMethod = 'cash' | 'qrcode' | 'app';

export type CouponCondition = 'none' | 'min_amount' | 'weekend_only' | 'weekday_only' | 'holiday_only';

export type CouponStatus = 'available' | 'used' | 'expired';

export interface Coupon {
  id: string;
  name: string;
  faceValue: number;
  minAmount?: number;
  condition: CouponCondition;
  conditionDescription: string;
  validFrom: string;
  validTo: string;
  isUsed: boolean;
  usedRecordId?: string;
  reminderSent: boolean;
  createdAt: string;
  notes?: string;
}

export interface ParkingRecord {
  id: string;
  date: string;
  locationName: string;
  lat: number | null;
  lng: number | null;
  duration: number;
  amount: number;
  originalAmount?: number;
  couponId?: string;
  couponDiscount?: number;
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

export const COUPON_CONDITION_LABELS: Record<CouponCondition, string> = {
  none: '无门槛',
  min_amount: '满减',
  weekend_only: '仅限周末',
  weekday_only: '仅限工作日',
  holiday_only: '仅限节假日',
};

export const COUPON_CONDITION_PRESETS: { value: CouponCondition; label: string; desc: string }[] = [
  { value: 'none', label: '无门槛', desc: '直接使用，无使用条件' },
  { value: 'min_amount', label: '满减', desc: '消费满指定金额可用' },
  { value: 'weekend_only', label: '仅限周末', desc: '仅周六、周日可用' },
  { value: 'weekday_only', label: '仅限工作日', desc: '仅周一至周五可用' },
  { value: 'holiday_only', label: '仅限节假日', desc: '仅法定节假日可用' },
];
