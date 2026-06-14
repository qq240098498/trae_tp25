import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (location: { name: string; lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerModal({
  open,
  onClose,
  onConfirm,
  initialLat = 39.9087,
  initialLng = 116.3975,
}: LocationPickerModalProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [locationName, setLocationName] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (!position || !locationName.trim()) return;
    onConfirm({ name: locationName.trim(), lat: position.lat, lng: position.lng });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent-500" />
            选择停车地点
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              地点名称
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="如：公司楼下停车场"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              点击地图选点
            </label>
            <div className="h-64 rounded-xl overflow-hidden border border-neutral-200">
              <MapContainer
                center={[initialLat, initialLng]}
                zoom={14}
                scrollWheelZoom
                style={{ height: '100%', width: '100%', borderRadius: 0 }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents onSelect={(lat, lng) => setPosition({ lat, lng })} />
                {position && (
                  <Marker position={[position.lat, position.lng]} />
                )}
              </MapContainer>
            </div>
          </div>

          {position && (
            <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2">
              已选位置：{position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-medium text-sm hover:bg-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!position || !locationName.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 text-white font-medium text-sm hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}
