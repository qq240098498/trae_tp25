import type { ParkingRecord, LocationStats, MonthlyStats, Coupon, CouponStatus } from '@/types';

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
};

export const formatAmount = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const formatDateTime = (dateTimeStr: string): string => {
  const d = new Date(dateTimeStr);
  const datePart = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  const timePart = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${datePart} ${timePart}`;
};

export const formatTimeRemaining = (deadlineStr: string): string => {
  const now = new Date().getTime();
  const deadline = new Date(deadlineStr).getTime();
  const diff = deadline - now;

  if (diff <= 0) return '已过期';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return `${days}天${remainingHours}小时`;
  }
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

export const isDeadlineExpired = (deadlineStr: string): boolean => {
  return new Date().getTime() > new Date(deadlineStr).getTime();
};

export const isDeadlineUrgent = (deadlineStr: string, minutesThreshold = 60): boolean => {
  const now = new Date().getTime();
  const deadline = new Date(deadlineStr).getTime();
  const diff = deadline - now;
  return diff > 0 && diff <= minutesThreshold * 60 * 1000;
};

export const getDeadlineStatus = (record: ParkingRecord): 'paid' | 'expired' | 'urgent' | 'pending' | 'none' => {
  if (record.isPaid) return 'paid';
  if (!record.paymentDeadline) return 'none';
  if (isDeadlineExpired(record.paymentDeadline)) return 'expired';
  if (isDeadlineUrgent(record.paymentDeadline)) return 'urgent';
  return 'pending';
};

export const getMonthLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月`;
};

export const getMonthKey = (dateStr: string): string => {
  return dateStr.slice(0, 7);
};

export const calculateMonthlyStats = (records: ParkingRecord[]): MonthlyStats[] => {
  const monthMap = new Map<string, MonthlyStats>();

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}月`;
    monthMap.set(key, { month: label, totalAmount: 0, count: 0 });
  }

  records.forEach((r) => {
    const key = getMonthKey(r.date);
    if (monthMap.has(key)) {
      const existing = monthMap.get(key)!;
      existing.totalAmount += r.amount;
      existing.count += 1;
    }
  });

  return Array.from(monthMap.values());
};

export const calculateLocationStats = (
  records: ParkingRecord[],
  targetMonth?: string
): LocationStats[] => {
  const locationMap = new Map<string, LocationStats>();

  const filtered = targetMonth
    ? records.filter((r) => getMonthKey(r.date) === targetMonth)
    : records;

  filtered.forEach((r) => {
    const existing = locationMap.get(r.locationName) || {
      locationName: r.locationName,
      totalAmount: 0,
      count: 0,
    };
    existing.totalAmount += r.amount;
    existing.count += 1;
    locationMap.set(r.locationName, existing);
  });

  return Array.from(locationMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getCurrentMonthStats = (records: ParkingRecord[]) => {
  const currentKey = getCurrentMonthKey();
  const currentRecords = records.filter((r) => getMonthKey(r.date) === currentKey);
  const totalAmount = currentRecords.reduce((sum, r) => sum + r.amount, 0);
  const count = currentRecords.length;
  const avgAmount = count > 0 ? totalAmount / count : 0;
  const totalDuration = currentRecords.reduce((sum, r) => sum + r.duration, 0);
  return { totalAmount, count, avgAmount, totalDuration };
};

export const isWeekend = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
};

export const isWeekday = (dateStr: string): boolean => {
  return !isWeekend(dateStr);
};

export const isHoliday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const holidays = [
    '1-1', '1-2', '1-3',
    '2-10', '2-11', '2-12', '2-13', '2-14', '2-15', '2-16', '2-17',
    '4-4', '4-5', '4-6',
    '5-1', '5-2', '5-3', '5-4', '5-5',
    '6-8', '6-9', '6-10',
    '9-15', '9-16', '9-17',
    '10-1', '10-2', '10-3', '10-4', '10-5', '10-6', '10-7',
  ];
  return holidays.includes(`${month}-${day}`);
};

export const isCouponValidForDate = (coupon: Coupon, dateStr: string): boolean => {
  const now = new Date(dateStr).getTime();
  const validFrom = new Date(coupon.validFrom).getTime();
  const validTo = new Date(coupon.validTo).getTime() + 24 * 60 * 60 * 1000 - 1;

  if (now < validFrom || now > validTo) return false;

  switch (coupon.condition) {
    case 'weekend_only':
      return isWeekend(dateStr);
    case 'weekday_only':
      return isWeekday(dateStr);
    case 'holiday_only':
      return isHoliday(dateStr) || isWeekend(dateStr);
    default:
      return true;
  }
};

export const isCouponApplicable = (
  coupon: Coupon,
  amount: number,
  dateStr: string
): { applicable: boolean; reason?: string } => {
  if (coupon.isUsed) {
    return { applicable: false, reason: '优惠券已使用' };
  }

  const now = new Date().getTime();
  const validFrom = new Date(coupon.validFrom).getTime();
  const validTo = new Date(coupon.validTo).getTime() + 24 * 60 * 60 * 1000 - 1;

  if (now < validFrom) {
    return { applicable: false, reason: '优惠券尚未生效' };
  }
  if (now > validTo) {
    return { applicable: false, reason: '优惠券已过期' };
  }

  if (!isCouponValidForDate(coupon, dateStr)) {
    switch (coupon.condition) {
      case 'weekend_only':
        return { applicable: false, reason: '仅限周末使用' };
      case 'weekday_only':
        return { applicable: false, reason: '仅限工作日使用' };
      case 'holiday_only':
        return { applicable: false, reason: '仅限节假日使用' };
      default:
        return { applicable: false, reason: '当前日期不可用' };
    }
  }

  if (coupon.condition === 'min_amount' && coupon.minAmount && amount < coupon.minAmount) {
    return { applicable: false, reason: `需满 ¥${coupon.minAmount.toFixed(2)} 才能使用` };
  }

  return { applicable: true };
};

export const calculateCouponDiscount = (
  coupon: Coupon,
  originalAmount: number
): number => {
  const maxDiscount = Math.min(coupon.faceValue, originalAmount);
  return Math.max(0, Math.round(maxDiscount * 100) / 100);
};

export const getCouponStatus = (coupon: Coupon): CouponStatus => {
  if (coupon.isUsed) return 'used';
  const now = new Date().getTime();
  const validTo = new Date(coupon.validTo).getTime() + 24 * 60 * 60 * 1000 - 1;
  if (now > validTo) return 'expired';
  return 'available';
};

export const isCouponExpiringSoon = (coupon: Coupon, days = 3): boolean => {
  if (coupon.isUsed) return false;
  const now = new Date().getTime();
  const validTo = new Date(coupon.validTo).getTime() + 24 * 60 * 60 * 1000 - 1;
  const diff = validTo - now;
  return diff > 0 && diff <= days * 24 * 60 * 60 * 1000;
};

export const getDaysRemaining = (dateStr: string): number => {
  const now = new Date().getTime();
  const target = new Date(dateStr).getTime() + 24 * 60 * 60 * 1000 - 1;
  const diff = target - now;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

export const formatDateRange = (from: string, to: string): string => {
  return `${formatDate(from)} 至 ${formatDate(to)}`;
};

export const generateConditionDescription = (
  condition: string,
  minAmount?: number
): string => {
  switch (condition) {
    case 'none':
      return '无门槛使用';
    case 'min_amount':
      return `满${minAmount || 0}元可用`;
    case 'weekend_only':
      return '仅限周末使用';
    case 'weekday_only':
      return '仅限工作日使用';
    case 'holiday_only':
      return '仅限节假日使用';
    default:
      return '无门槛使用';
  }
};
