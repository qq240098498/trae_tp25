import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CarFront,
  MapPin,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  History,
  Trash2,
  Eye,
} from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDate } from '@/utils/stats';
import { cn } from '@/lib/utils';
import Empty from '@/components/Empty';

export default function ParkingSpot() {
  const navigate = useNavigate();
  const { currentSpot, spotHistory, setCurrentSpot, clearCurrentSpot } = useParkingStore();

  const [spotNumber, setSpotNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentSpot) {
      setSpotNumber(currentSpot.spotNumber);
      setFloor(currentSpot.floor || '');
      setArea(currentSpot.area || '');
      setNotes(currentSpot.notes || '');
      setPhoto(currentSpot.photo || '');
    }
  }, [currentSpot]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result.length > 2 * 1024 * 1024) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setPhoto(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = result;
      } else {
        setPhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!spotNumber.trim()) return;

    setCurrentSpot({
      spotNumber: spotNumber.trim(),
      floor: floor.trim() || undefined,
      area: area.trim() || undefined,
      photo: photo || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleClear = () => {
    clearCurrentSpot();
    setSpotNumber('');
    setFloor('');
    setArea('');
    setNotes('');
    setPhoto('');
  };

  const openPreview = (p: string) => {
    setPreviewPhoto(p);
    setShowPhotoPreview(true);
  };

  const canSave = spotNumber.trim().length > 0;

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${formatDate(isoStr)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

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
            <h2 className="text-2xl font-bold text-neutral-900">车位记录</h2>
            <p className="text-sm text-neutral-500 mt-0.5">拍照记录方便取车</p>
          </div>
        </div>
        {spotHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              showHistory
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white shadow-card hover:shadow-card-hover text-neutral-600'
            )}
          >
            <History className="w-4 h-4" />
            历史
          </button>
        )}
      </div>

      {currentSpot && (
        <div className="bg-gradient-to-br from-violet-600 to-violet-900 rounded-2xl p-6 text-white shadow-card animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <CarFront className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white/70">当前车位</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    已记录
                  </span>
                </div>
                <p className="text-3xl font-bold mt-1 tracking-wide">{currentSpot.spotNumber}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                  {currentSpot.floor && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {currentSpot.floor}
                    </span>
                  )}
                  {currentSpot.area && <span>{currentSpot.area}</span>}
                </div>
                {currentSpot.notes && (
                  <p className="text-xs text-white/60 mt-2">📝 {currentSpot.notes}</p>
                )}
                <p className="text-[11px] text-white/50 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  记录于 {formatTime(currentSpot.createdAt)}
                </p>
              </div>
            </div>
            {currentSpot.photo && (
              <button
                onClick={() => openPreview(currentSpot.photo!)}
                className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all flex-shrink-0 bg-black/20"
              >
                <img src={currentSpot.photo} alt="车位照片" className="w-full h-full object-cover" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-5 space-y-5 animate-slide-up">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <CarFront className="w-4 h-4 text-violet-600" />
          {currentSpot ? '更新车位信息' : '记录新车位'}
        </h3>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            车位编号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={spotNumber}
            onChange={(e) => setSpotNumber(e.target.value)}
            placeholder="如：B2-035"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold tracking-wider"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">楼层</label>
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="如：B2、F3"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">区域</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="如：D区、东区"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            车位照片
          </label>
          {photo ? (
            <div className="relative">
              <button
                onClick={() => openPreview(photo)}
                className="w-full h-48 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 hover:border-primary-300 transition-all"
              >
                <img src={photo} alt="车位照片预览" className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-neutral-300 hover:border-violet-400 hover:bg-violet-50 transition-all text-neutral-500 hover:text-violet-600"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm font-medium">拍照</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-all text-neutral-500 hover:text-primary-600"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">从相册选择</span>
              </button>
            </div>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：电梯口右转第3个、靠近柱子..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {currentSpot && (
          <button
            onClick={handleClear}
            className="px-4 py-3.5 rounded-2xl border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            取车清除
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'flex-1 py-3.5 rounded-2xl text-white font-semibold shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-2',
            canSave
              ? 'bg-gradient-to-r from-violet-600 to-violet-900 active:scale-[0.98]'
              : 'bg-neutral-300 cursor-not-allowed'
          )}
        >
          <Save className="w-5 h-5" />
          {currentSpot ? '更新记录' : '保存车位'}
        </button>
      </div>

      {showHistory && spotHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5 animate-slide-up">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-neutral-500" />
            历史车位记录
          </h3>
          <div className="space-y-3">
            {spotHistory.map((spot, index) => (
              <div
                key={spot.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {spot.photo ? (
                  <button
                    onClick={() => openPreview(spot.photo!)}
                    className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0 bg-neutral-200"
                  >
                    <img src={spot.photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-neutral-900 tracking-wide">
                      {spot.spotNumber}
                    </p>
                    {!spot.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-500">
                        已取车
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                    {spot.floor && <span>{spot.floor}</span>}
                    {spot.area && <span>· {spot.area}</span>}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {formatTime(spot.createdAt)}
                  </p>
                </div>
                {spot.photo && (
                  <button
                    onClick={() => openPreview(spot.photo!)}
                    className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:shadow transition-all flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentSpot && spotHistory.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card py-12">
          <Empty />
          <p className="text-center text-neutral-500 mt-4">还没有记录车位</p>
          <p className="text-center text-xs text-neutral-400 mt-1">
            停车后记得记录车位号，取车更方便
          </p>
        </div>
      )}

      {showPhotoPreview && previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in"
          onClick={() => setShowPhotoPreview(false)}
        >
          <button
            onClick={() => setShowPhotoPreview(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewPhoto}
            alt="车位照片"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
