'use client';

import { useEffect, useState } from 'react';

interface QRCodeProps {
  url: string;
  size?: number;
}

export function QRCode({ url, size = 200 }: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import QRCode library
    import('qrcode').then(QRCodeLib => {
      QRCodeLib.toDataURL(url, {
        width: size,
        margin: 1,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
      }).then(setQrDataUrl);
    });
  }, [url, size]);

  if (!qrDataUrl) {
    return (
      <div
        className="bg-white rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="w-8 h-8 text-slate-400 spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }

  return (
    <div className="qr-container">
      <img src={qrDataUrl} alt="QR Code" width={size} height={size} />
    </div>
  );
}
