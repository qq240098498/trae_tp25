import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Filter, CheckCircle2, AlertCircle, AlertTriangle, Clock, Bell, XCircle } from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDuration, formatAmount, formatDate, getMonthKey, getDeadlineStatus, formatTimeRemaining } from '@/utils/stats';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS, type ParkingRecord } from '@/types';
import { cn } from '@/lib/utils';
import Empty from '@/components/Empty';

type FilterType = 'all' | 'unpaid' | 'paid' | 'urgent' | 'expired';

export default function Records() {
  const navigate = useNavigate();
  const { records, markAsPaid } = useParkingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    records.forEach((r) => {
      const key = getMonthKey(r.date);
      monthSet.add(key);
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filteredRecords = useMemo(() => {
    let result = records;

    if (selectedMonth) {
      result = result.filter((r) => getMonthKey(r.date) === selectedMonth);
    }

    if (filterType !== 'all') {
      result = result.filter((r) => {
        const status = getDeadlineStatus(r);
        switch (filterType) {
          case 'unpaid':
            return !r.isPaid;
          case 'paid':
            return r.isPaid;
          case 'urgent':
            return status === 'urgent';
          case 'expired':
            return status === 'expired';
          default:
            return true;
        }
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.locationName.toLowerCase().includes(query) ||
          (r.notes && r.notes.toLowerCase().includes(query))
      );
    }

    return result;
  }, [records, selectedMonth, searchQuery, filterType]);

  const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
  const unpaidTotal = filteredRecords.filter((r) => !r.isPaid).reduce((sum, r) => sum + r.amount, 0);

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const getStatusBadge = (record: ParkingRecord) => {
    const status = getDeadlineStatus(record);
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle2,
          label: '已缴',
          className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'expired':
        return {
          icon: XCircle,
          label: '逾期',
          className: 'bg-red-50 text-red-600 border-red-200',
          dot: 'bg-red-500 animate-pulse',
        };
      case 'urgent':
        return {
          icon: AlertTriangle,
          label: '紧急',
          className: 'bg-orange-50 text-orange-600 border-orange-200',
          dot: 'bg-orange-500 animate-pulse',
        };
      case 'pending':
        return {
          icon: Clock,
          label: '待缴',
          className: 'bg-amber-50 text-amber-600 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return null;
    }
  };

  const filterOptions: { value: FilterType; label: string; icon: typeof Filter }[] = [
    { value: 'all', label: '全部', icon: Filter },
    { value: 'unpaid', label: '待缴', icon: Clock },
    { value: 'urgent', label: '紧急', icon: AlertTriangle },
    { value: 'expired', label: '逾期', icon: AlertCircle },
    { value: 'paid', label: '已缴', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">停车记录</h2>
          <p className="text-sm text-neutral-500 mt-1">
            共 {filteredRecords.length} 条记录 · 总支出 {formatAmount(totalAmount)}
            {unpaidTotal > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · 待缴 {formatAmount(unpaidTotal)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/records/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-700 to-primary-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-card-hover transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          新增记录
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterType(option.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border',
              filterType === option.value
                ? 'bg-primary-700 text-white border-primary-700 shadow-card'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-700'
            )}
          >
            <option.icon className="w-4 h-4" />
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索地点或备注..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="">全部月份</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16">
          <Empty />
          <p className="text-center text-neutral-500 mt-4">暂无停车记录</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/records/new')}
              className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 transition-colors"
            >
              新增第一条记录
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record, index) => {
            const statusBadge = getStatusBadge(record);
            const deadlineStatus = getDeadlineStatus(record);
            return (
              <div
                key={record.id}
                onClick={() => navigate(`/records/${record.id}`)}
                className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer animate-slide-up group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      deadlineStatus === 'expired' ? 'bg-red-50' :
                      deadlineStatus === 'urgent' ? 'bg-orange-50' :
                      deadlineStatus === 'pending' ? 'bg-amber-50' : 'bg-primary-50'
                    )}>
                      <MapPin className={cn(
                        'w-5 h-5',
                        deadlineStatus === 'expired' ? 'text-red-600' :
                        deadlineStatus === 'urgent' ? 'text-orange-600' :
                        deadlineStatus === 'pending' ? 'text-amber-600' : 'text-primary-700'
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {record.locationName}
                        </p>
                        {statusBadge && (
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border flex-shrink-0',
                            statusBadge.className
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', statusBadge.dot)} />
                            <statusBadge.icon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        )}
                        {record.reminderEnabled && !record.isPaid && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-200 flex-shrink-0">
                            <Bell className="w-3 h-3" />
                            提醒
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatDate(record.date)} · {formatDuration(record.duration)}
                      </p>
                      {!record.isPaid && record.paymentDeadline && (
                        <p className={cn(
                          'text-xs mt-1 font-medium',
                          deadlineStatus === 'expired' ? 'text-red-600' :
                          deadlineStatus === 'urgent' ? 'text-orange-600' : 'text-amber-600'
                        )}>
                          {deadlineStatus === 'expired'
                            ? `⚠️ 已逾期，请尽快缴费`
                            : `⏰ 缴费剩余：${formatTimeRemaining(record.paymentDeadline)}`
                          }
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-xs text-neutral-400 mt-1 truncate">{record.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end gap-1">
                    <p className="text-lg font-bold text-neutral-900">
                      {formatAmount(record.amount)}
                    </p>
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          'inline-block text-[10px] px-2 py-0.5 rounded-full font-medium',
                          PAYMENT_METHOD_COLORS[record.paymentMethod]
                        )}
                      >
                        {PAYMENT_METHOD_LABELS[record.paymentMethod]}
                      </span>
                    </div>
                    {!record.isPaid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsPaid(record.id);
                        }}
                        className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        已缴费
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-700">{filteredRecords.length}</p>
              <p className="text-xs text-neutral-500 mt-1">停车次数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-600">{formatAmount(totalAmount)}</p>
              <p className="text-xs text-neutral-500 mt-1">总支出</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold text-emerald-600">{formatDuration(totalDuration)}</p>
              <p className="text-xs text-neutral-500 mt-1">总时长</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
