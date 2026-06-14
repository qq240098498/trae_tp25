import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, TrendingUp, PieChart, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useParkingStore } from '@/store/useParkingStore';
import {
  formatAmount,
  calculateMonthlyStats,
  calculateLocationStats,
  getCurrentMonthKey,
  getMonthKey,
} from '@/utils/stats';
import StatCard from '@/components/StatCard';
import Empty from '@/components/Empty';

const PIE_COLORS = [
  '#1E3F74',
  '#E94560',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
  '#06B6D4',
  '#EC4899',
  '#84CC16',
];

export default function Statistics() {
  const navigate = useNavigate();
  const { records } = useParkingStore();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  const monthlyStats = useMemo(() => calculateMonthlyStats(records), [records]);
  const allLocationStats = useMemo(() => calculateLocationStats(records), [records]);
  const monthLocationStats = useMemo(
    () => calculateLocationStats(records, selectedMonth),
    [records, selectedMonth]
  );

  const selectedMonthRecords = useMemo(
    () => records.filter((r) => getMonthKey(r.date) === selectedMonth),
    [records, selectedMonth]
  );

  const selectedMonthTotal = selectedMonthRecords.reduce((sum, r) => sum + r.amount, 0);
  const selectedMonthCount = selectedMonthRecords.length;
  const selectedMonthAvg = selectedMonthCount > 0 ? selectedMonthTotal / selectedMonthCount : 0;

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const pieData = monthLocationStats.map((loc) => ({
    name: loc.locationName,
    value: loc.totalAmount,
  }));

  const hasData = records.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:shadow-card-hover transition-all text-neutral-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">费用统计</h2>
          <p className="text-sm text-neutral-500 mt-0.5">查看月度趋势与地点分布</p>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl shadow-card py-16">
          <Empty />
          <p className="text-center text-neutral-500 mt-4">暂无统计数据</p>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title={`${formatMonthLabel(selectedMonth)}支出`}
              value={formatAmount(selectedMonthTotal)}
              subtitle={`共 ${selectedMonthCount} 次停车`}
              icon={<Calendar className="w-5 h-5 text-white" />}
              gradient="bg-gradient-to-br from-primary-600 to-primary-900"
            />
            <StatCard
              title="月均每次"
              value={formatAmount(selectedMonthAvg)}
              subtitle={selectedMonthCount > 0 ? '当前月份平均' : '暂无数据'}
              icon={<TrendingUp className="w-5 h-5 text-white" />}
              gradient="bg-gradient-to-br from-accent-500 to-accent-800"
            />
            <StatCard
              title="累计总额"
              value={formatAmount(records.reduce((s, r) => s + r.amount, 0))}
              subtitle={`共 ${records.length} 次停车`}
              icon={<PieChart className="w-5 h-5 text-white" />}
              gradient="bg-gradient-to-br from-emerald-600 to-emerald-900"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                近6个月停车费用趋势
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#737373', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E5E5' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#737373', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `¥${v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatAmount(value), '总支出']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 24px rgba(15, 52, 96, 0.12)',
                      padding: '12px',
                    }}
                  />
                  <Bar
                    dataKey="totalAmount"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3F74" />
                      <stop offset="100%" stopColor="#3F69AC" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-accent-500" />
                当月地点费用分布
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-neutral-700 min-w-[100px] text-center">
                  {formatMonthLabel(selectedMonth)}
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {pieData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <Empty />
                <p className="text-sm text-neutral-500 mt-4">该月暂无停车记录</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={{ stroke: '#D4D4D4' }}
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatAmount(value), '费用']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 24px rgba(15, 52, 96, 0.12)',
                          padding: '12px',
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  {monthLocationStats.map((loc, index) => (
                    <div
                      key={loc.locationName}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-neutral-700 truncate">
                            {loc.locationName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-neutral-900">
                          {formatAmount(loc.totalAmount)}
                        </p>
                        <p className="text-xs text-neutral-500">{loc.count} 次</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5 animate-slide-up">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              累计地点花费排行
            </h3>
            {allLocationStats.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center">
                <Empty />
                <p className="text-sm text-neutral-500 mt-4">暂无数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allLocationStats.map((loc, index) => {
                  const maxAmount = allLocationStats[0]?.totalAmount || 1;
                  const percent = (loc.totalAmount / maxAmount) * 100;
                  return (
                    <div key={loc.locationName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : index === 1
                                ? 'bg-neutral-100 text-neutral-600'
                                : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-neutral-50 text-neutral-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-neutral-700">
                            {loc.locationName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-900">
                            {formatAmount(loc.totalAmount)}
                          </span>
                          <span className="text-xs text-neutral-500 ml-2">
                            · {loc.count}次
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-800 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
