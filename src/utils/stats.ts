import type { ParkingRecord, LocationStats, MonthlyStats } from '@/types';

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
