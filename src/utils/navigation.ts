export interface NavigateOptions {
  lat: number;
  lng: number;
  name: string;
  mode?: 'walking' | 'driving' | 'transit';
}

const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

const isIOS = /iPhone|iPad|iPod/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

const isAndroid = /Android/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

export function openWalkingNavigation({ lat, lng, name }: NavigateOptions): void {
  const encodedName = encodeURIComponent(name);

  if (isIOS) {
    const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w&t=${encodedName}`;
    window.open(appleMapsUrl, '_blank');
    return;
  }

  if (isAndroid) {
    const googleMapsUrl = `google.navigation:q=${lat},${lng}&mode=w`;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

    const startTime = Date.now();
    const timeout = 2000;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = googleMapsUrl;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (Date.now() - startTime < timeout + 100) {
        window.open(fallbackUrl, '_blank');
      }
      document.body.removeChild(iframe);
    }, timeout);

    return;
  }

  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  window.open(webUrl, '_blank');
}

export function openLocationInMap({ lat, lng, name }: NavigateOptions): void {
  const encodedName = encodeURIComponent(name);

  if (isMobile) {
    if (isIOS) {
      window.open(`https://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}`, '_blank');
    } else {
      window.open(`geo:${lat},${lng}?q=${lat},${lng}(${encodedName})`, '_blank');
    }
  } else {
    window.open(
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
      '_blank'
    );
  }
}

export function hasCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  return lat !== null && lat !== undefined && lng !== null && lng !== undefined && !isNaN(lat) && !isNaN(lng);
}

export const INDOOR_DESCRIPTION_TIPS = [
  '电梯口附近',
  '柱子颜色',
  '靠近哪个出入口',
  '楼层区域编号',
  '附近店铺名称',
  '人行通道位置',
];
