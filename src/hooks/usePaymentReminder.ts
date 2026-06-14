import { useEffect, useCallback, useState } from 'react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatAmount, formatTimeRemaining, formatDate, getDaysRemaining } from '@/utils/stats';
import type { ParkingRecord, Coupon } from '@/types';

interface ReminderNotification {
  id: string;
  recordId?: string;
  couponId?: string;
  title: string;
  message: string;
  type: 'urgent' | 'reminder' | 'expired' | 'coupon';
  timestamp: number;
  link?: string;
}

export function usePaymentReminder() {
  const {
    records,
    coupons,
    markReminderSent,
    addActiveReminder,
    removeActiveReminder,
    activeReminders,
    markCouponReminderSent,
  } = useParkingStore();

  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [, forceUpdate] = useState(0);

  const checkReminders = useCallback(() => {
    const now = new Date().getTime();
    const newNotifications: ReminderNotification[] = [];

    records.forEach((record) => {
      if (record.isPaid || !record.paymentDeadline) return;

      const deadline = new Date(record.paymentDeadline).getTime();
      const oneHourBefore = deadline - 60 * 60 * 1000;
      const timeRemaining = deadline - now;

      if (now >= deadline) {
        if (!record.reminderSent || !activeReminders.includes(record.id + '-expired')) {
          newNotifications.push({
            id: `${record.id}-expired`,
            recordId: record.id,
            title: '⚠️ 停车缴费已逾期',
            message: `${record.locationName} 的停车费 ${formatAmount(record.amount)} 已超过缴费截止时间，请尽快缴费避免产生滞纳金！`,
            type: 'expired',
            timestamp: now,
            link: `/records/${record.id}`,
          });
          addActiveReminder(record.id + '-expired');
        }
      } else if (now >= oneHourBefore && !record.reminderSent) {
        newNotifications.push({
          id: `${record.id}-reminder`,
          recordId: record.id,
          title: '⏰ 停车缴费提醒',
          message: `${record.locationName} 的停车费 ${formatAmount(record.amount)} 将在 ${formatTimeRemaining(record.paymentDeadline)} 后截止，请及时缴费！`,
          type: timeRemaining <= 30 * 60 * 1000 ? 'urgent' : 'reminder',
          timestamp: now,
          link: `/records/${record.id}`,
        });
        markReminderSent(record.id);
        addActiveReminder(record.id + '-reminder');
      }
    });

    coupons.forEach((coupon: Coupon) => {
      if (coupon.isUsed || coupon.reminderSent) return;

      const daysRemaining = getDaysRemaining(coupon.validTo);
      const reminderKey = `${coupon.id}-coupon-expiry`;

      if (daysRemaining <= 3 && daysRemaining > 0 && !activeReminders.includes(reminderKey)) {
        const dayText = daysRemaining === 1 ? '明天' : `${daysRemaining}天后`;
        newNotifications.push({
          id: reminderKey,
          couponId: coupon.id,
          title: daysRemaining === 1 ? '🎫 优惠券即将过期' : '🎫 优惠券到期提醒',
          message: `「${coupon.name}」面额 ${formatAmount(coupon.faceValue)} 的优惠券${dayText}过期（${formatDate(coupon.validTo)}），别忘记使用哦！`,
          type: 'coupon',
          timestamp: now,
          link: '/coupons',
        });
        markCouponReminderSent(coupon.id);
        addActiveReminder(reminderKey);
      }
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev]);
    }

    forceUpdate((n) => n + 1);
  }, [records, coupons, markReminderSent, addActiveReminder, activeReminders, markCouponReminderSent]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 30 * 1000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    const recordId = notificationId.replace(/-(reminder|expired)$/, '');
    removeActiveReminder(notificationId);
    removeActiveReminder(recordId);
  }, [removeActiveReminder]);

  const dismissAll = useCallback(() => {
    notifications.forEach((n) => {
      removeActiveReminder(n.id);
      const recordId = n.recordId;
      removeActiveReminder(recordId);
    });
    setNotifications([]);
  }, [notifications, removeActiveReminder]);

  const getUnpaidRecords = useCallback((): ParkingRecord[] => {
    return records.filter((r) => !r.isPaid);
  }, [records]);

  const getUrgentRecords = useCallback((): ParkingRecord[] => {
    const now = new Date().getTime();
    return records.filter((r) => {
      if (r.isPaid || !r.paymentDeadline) return false;
      const deadline = new Date(r.paymentDeadline).getTime();
      return deadline - now > 0 && deadline - now <= 60 * 60 * 1000;
    });
  }, [records]);

  const getExpiredRecords = useCallback((): ParkingRecord[] => {
    const now = new Date().getTime();
    return records.filter((r) => {
      if (r.isPaid || !r.paymentDeadline) return false;
      return now >= new Date(r.paymentDeadline).getTime();
    });
  }, [records]);

  return {
    notifications,
    dismissNotification,
    dismissAll,
    checkReminders,
    getUnpaidRecords,
    getUrgentRecords,
    getExpiredRecords,
    unpaidCount: getUnpaidRecords().length,
    urgentCount: getUrgentRecords().length,
    expiredCount: getExpiredRecords().length,
  };
}
