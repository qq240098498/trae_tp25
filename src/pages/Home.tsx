import { useNavigate } from 'react-router-dom';
import { Wallet, Clock, FileText, Plus, CarFront, ChevronRight, MapPin, Bell, AlertTriangle, AlertCircle } from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import StatCard from '@/components/StatCard';
import { formatDuration, formatAmount, formatDate, getCurrentMonthStats, formatTimeRemaining, getDeadlineStatus } from '@/utils/stats';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { usePaymentReminder } from '@/hooks/usePaymentReminder';

export default function Home() {
  const navigate = useNavigate();
  const { records, currentSpot, markAsPaid } = useParkingStore();
  const stats = getCurrentMonthStats(records);
  const recentRecords = records.slice(0, 5);
  const { getUnpaidRecords, getUrgentRecords, getExpiredRecords, unpaidCount, urgentCount, expiredCount } = usePaymentReminder();

  const unpaidRecords = getUnpaidRecords();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-sm text-neutral-500">
          {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 mt-1">您好，欢迎回来 👋</h2>
      </div>

      {unpaidCount > 0 && (
        <div className="space-y-3 animate-slide-up">
          {urgentCount > 0 && (
            <div
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/records')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold">即将到期 {urgentCount} 笔</h3>
                  <p className="text-sm text-white/80 mt-1">
                    有缴费即将在1小时内截止，请及时处理
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
              </div>
            </div>
          )}

          {expiredCount > 0 && (
            <div
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-red-600 to-red-800 text-white shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/records')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold">已逾期 {expiredCount} 笔</h3>
                  <p className="text-sm text-white/80 mt-1">
                    已超过缴费截止时间，尽快处理避免滞纳金
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
              </div>
            </div>
          )}

          {unpaidRecords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-amber-50/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-neutral-900">待缴费提醒</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    {unpaidCount} 笔
                  </span>
                </div>
                <button
                  onClick={() => navigate('/records')}
                  className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900 transition-colors"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-neutral-100">
                {unpaidRecords.slice(0, 3).map((record) => {
                  const status = getDeadlineStatus(record);
                  return (
                    <div
                      key={record.id}
                      className="px-5 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                            status === 'expired' ? 'bg-red-100' :
                            status === 'urgent' ? 'bg-orange-100' : 'bg-amber-100'
                          )}>
                            <MapPin className={cn(
                              'w-5 h-5',
                              status === 'expired' ? 'text-red-600' :
                              status === 'urgent' ? 'text-orange-600' : 'text-amber-600'
                            )} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-neutral-900 truncate">
                              {record.locationName}
                            </p>
                            {record.paymentDeadline && (
                              <p className={cn(
                                'text-xs mt-0.5 font-medium',
                                status === 'expired' ? 'text-red-600' :
                                status === 'urgent' ? 'text-orange-600' : 'text-amber-600'
                              )}>
                                {status === 'expired' ? '已逾期' : `剩余 ${formatTimeRemaining(record.paymentDeadline)}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold text-neutral-900">
                            {formatAmount(record.amount)}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsPaid(record.id);
                            }}
                            className="mt-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100 transition-colors"
                          >
                            标记已缴
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本月总支出"
          value={formatAmount(stats.totalAmount)}
          subtitle={`共 ${stats.count} 次停车`}
          icon={<Wallet className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-primary-600 to-primary-900"
        />
        <StatCard
          title="平均每次"
          value={formatAmount(stats.avgAmount)}
          subtitle={`总时长 ${formatDuration(stats.totalDuration)}`}
          icon={<Clock className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-accent-500 to-accent-800"
        />
        <StatCard
          title="历史停车"
          value={String(records.length)}
          subtitle="累计记录次数"
          icon={<FileText className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-900"
        />
        <StatCard
          title={currentSpot ? '当前车位' : '未记录车位'}
          value={currentSpot?.spotNumber || '--'}
          subtitle={currentSpot?.area || '点击记录车位'}
          icon={<CarFront className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-violet-600 to-violet-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/records/new')}
          className="group relative overflow-hidden rounded-2xl p-5 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 text-left animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary-700" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">新增停车记录</h3>
            <p className="text-sm text-neutral-500 mt-1">记录停车信息与费用</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/parking-spot')}
          className="group relative overflow-hidden rounded-2xl p-5 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 text-left animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-50 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-3">
              <CarFront className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">记录车位</h3>
            <p className="text-sm text-neutral-500 mt-1">拍照记录方便取车</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/statistics')}
          className="group relative overflow-hidden rounded-2xl p-5 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 text-left animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-violet-700" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">费用统计</h3>
            <p className="text-sm text-neutral-500 mt-1">查看月度趋势与分类</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '250ms' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-900">最近停车记录</h3>
          <button
            onClick={() => navigate('/records')}
            className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900 transition-colors"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无停车记录</p>
            <button
              onClick={() => navigate('/records/new')}
              className="mt-4 px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 transition-colors"
            >
              新增第一条记录
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => navigate(`/records/${record.id}`)}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {record.locationName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(record.date)} · {formatDuration(record.duration)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-neutral-900">
                    {formatAmount(record.amount)}
                  </p>
                  <span
                    className={cn(
                      'inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5',
                      PAYMENT_METHOD_COLORS[record.paymentMethod]
                    )}
                  >
                    {PAYMENT_METHOD_LABELS[record.paymentMethod]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
