'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CardQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  darkColor?: string;
  lightColor?: string;
  alt?: string;
}

export default function CardQrCode({
  value,
  size = 96,
  className = '',
  level = 'M',
  darkColor = '#000000',
  lightColor = '#ffffff00', // transparent background by default
  alt = 'Verification QR Code',
}: CardQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setDataUrl('');
      return;
    }

    let isMounted = true;

    QRCode.toDataURL(value, {
      width: size * 2, // 2x density for crisp high-DPI rendering
      margin: 0,
      errorCorrectionLevel: level,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setHasError(false);
        }
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, level, darkColor, lightColor]);

  if (!value || hasError) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-gray-400 bg-gray-50 text-[8px] text-gray-500 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        title="QR Code Pending"
      >
        <span>QR</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse bg-gray-200 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
