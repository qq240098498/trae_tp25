import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Wallet,
  CreditCard,
  Edit3,
  Trash2,
  FileText,
  Map as MapIcon,
  Navigation,
} from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDuration, formatAmount, formatDate } from '@/utils/stats';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { openWalkingNavigation, hasCoordinates } from '@/utils/navigation';

export default function RecordDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getRecord, deleteRecord } = useParkingStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const record = id ? getRecord(id) : undefined;

  if (!record) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:shadow-card-hover transition-all text-neutral-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-neutral-900">记录不存在</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">该停车记录不存在或已被删除</p>
          <button
            onClick={() => navigate('/records')}
            className="mt-4 px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 transition-colors"
          >
            返回记录列表
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteRecord(record.id);
    navigate('/records');
  };

  const handleNavigate = () => {
    if (!hasCoordinates(record.lat, record.lng)) return;
    openWalkingNavigation({
      lat: record.lat!,
      lng: record.lng!,
      name: record.locationName,
    });
  };

  const infoItems = [
    {
      icon: Calendar,
      label: '停车日期',
      value: formatDate(record.date),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Clock,
      label: '停车时长',
      value: formatDuration(record.duration),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Wallet,
      label: '缴费金额',
      value: formatAmount(record.amount),
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      icon: CreditCard,
      label: '缴费方式',
      value: PAYMENT_METHOD_LABELS[record.paymentMethod],
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      badge: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:shadow-card-hover transition-all text-neutral-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">停车详情</h2>
            <p className="text-sm text-neutral-500 mt-0.5">查看记录完整信息</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/records/${record.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all text-sm font-medium text-primary-700"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all text-sm font-medium text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{record.locationName}</h3>
            <p className="text-sm text-white/70 mt-1">
              {formatDate(record.date)}
            </p>
            {record.lat && record.lng && (
              <div className="flex items-center gap-1 mt-2 text-xs text-white/60">
                <MapIcon className="w-3.5 h-3.5" />
                {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-white/20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-white/70">本次停车费用</p>
              <p className="text-3xl font-bold mt-1">{formatAmount(record.amount)}</p>
            </div>
            <span
              className={cn(
                'text-xs px-3 py-1.5 rounded-full font-medium',
                PAYMENT_METHOD_COLORS[record.paymentMethod]
              )}
            >
              {PAYMENT_METHOD_LABELS[record.paymentMethod]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {infoItems.map((item, index) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl p-4 shadow-card animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bgColor)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {record.notes && (
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-neutral-500" />
            <h4 className="text-sm font-semibold text-neutral-700">备注</h4>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">{record.notes}</p>
        </div>
      )}

      {record.lat && record.lng && (
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-neutral-500" />
              <h4 className="text-sm font-semibold text-neutral-700">位置地图</h4>
            </div>
            <button
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              带我找车
            </button>
          </div>
          <div className="h-48 rounded-xl overflow-hidden border border-neutral-200">
            <img
              src={`https://staticmap.openstreetmap.de/staticmap.php?center=${record.lat},${record.lng}&zoom=15&size=600x200&markers=${record.lat},${record.lng},red-pushpin`}
              alt="停车位置地图"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">确认删除</h3>
              <p className="text-sm text-neutral-500 mt-2">
                确定要删除这条停车记录吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-medium text-sm hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
