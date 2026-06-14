import { X, AlertTriangle, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { usePaymentReminder } from '@/hooks/usePaymentReminder';
import { useParkingStore } from '@/store/useParkingStore';

export default function PaymentReminderToast() {
  const navigate = useNavigate();
  const { notifications, dismissNotification } = usePaymentReminder();
  const { markAsPaid } = useParkingStore();

  if (notifications.length === 0) return null;

  const getTypeStyles = (type: 'urgent' | 'reminder' | 'expired') => {
    switch (type) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-500 to-orange-500 border-red-400';
      case 'expired':
        return 'bg-gradient-to-r from-red-600 to-red-800 border-red-500';
      case 'reminder':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-400';
    }
  };

  const getIcon = (type: 'urgent' | 'reminder' | 'expired') => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-white" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const handleMarkAsPaid = (e: React.MouseEvent, recordId: string, notificationId: string) => {
    e.stopPropagation();
    markAsPaid(recordId);
    dismissNotification(notificationId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full animate-fade-in">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'rounded-2xl shadow-xl overflow-hidden border-l-4 animate-slide-in',
            getTypeStyles(notification.type)
          )}
        >
          <div className="bg-white/95 backdrop-blur p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                notification.type === 'expired' ? 'bg-red-100' :
                notification.type === 'urgent' ? 'bg-orange-100' : 'bg-amber-100'
              )}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-bold',
                  notification.type === 'expired' ? 'text-red-700' :
                  notification.type === 'urgent' ? 'text-orange-700' : 'text-amber-700'
                )}>
                  {notification.title}
                </p>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
              <button
                onClick={() => navigate(`/records/${notification.recordId}`)}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition-colors"
              >
                查看详情
              </button>
              <button
                onClick={(e) => handleMarkAsPaid(e, notification.recordId, notification.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                标记已缴
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
