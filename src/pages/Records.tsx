import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Filter } from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDuration, formatAmount, formatDate, getMonthKey } from '@/utils/stats';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import Empty from '@/components/Empty';

export default function Records() {
  const navigate = useNavigate();
  const { records } = useParkingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.locationName.toLowerCase().includes(query) ||
          (r.notes && r.notes.toLowerCase().includes(query))
      );
    }

    return result;
  }, [records, selectedMonth, searchQuery]);

  const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">停车记录</h2>
          <p className="text-sm text-neutral-500 mt-1">
            共 {filteredRecords.length} 条记录 · 总支出 {formatAmount(totalAmount)}
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
          {filteredRecords.map((record, index) => (
            <div
              key={record.id}
              onClick={() => navigate(`/records/${record.id}`)}
              className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {record.locationName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(record.date)} · {formatDuration(record.duration)}
                    </p>
                    {record.notes && (
                      <p className="text-xs text-neutral-400 mt-1 truncate">{record.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-lg font-bold text-neutral-900">
                    {formatAmount(record.amount)}
                  </p>
                  <span
                    className={cn(
                      'inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1',
                      PAYMENT_METHOD_COLORS[record.paymentMethod]
                    )}
                  >
                    {PAYMENT_METHOD_LABELS[record.paymentMethod]}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
