'use client';

import React from 'react';
import { CldImage, CldImageProps } from 'next-cloudinary';

export interface CloudinaryImageProps extends Omit<CldImageProps, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

/**
 * Universal Image Component for Accero PrintPortal.
 * Gracefully switches between:
 * 1. next-cloudinary CldImage for optimized CDN delivery with f_auto/q_auto.
 * 2. Standard HTML <img> with CORS for legacy base64 data URLs & local card templates.
 */
export default function CloudinaryImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  width,
  height,
  ...props
}: CloudinaryImageProps) {
  const [hasError, setHasError] = React.useState(false);

  if (!src) {
    if (fallbackSrc) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={fallbackSrc} alt={alt} className={className} width={width} height={height} />;
    }
    return null;
  }

  // Fallback state
  if (hasError && fallbackSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallbackSrc} alt={alt} className={className} width={width} height={height} />;
  }

  // Case 1: Legacy base64 data URI (embedded photo/signature)
  if (src.startsWith('data:image/')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
      />
    );
  }

  // Case 2: Local static assets (e.g. /assets/pan/pan-front-back.jpg)
  if (src.startsWith('/')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
      />
    );
  }

  // Case 3: Signed / Authenticated Cloudinary delivery URL (must not be altered by CldImage to preserve signature)
  if (src.includes('/image/authenticated/') || src.includes('/s--')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
      />
    );
  }

  // Case 4: Cloudinary hosted asset (either full res.cloudinary.com URL or public ID)
  // Extract publicId if full Cloudinary URL is supplied
  let publicId = src;
  const cldRegex = /res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
  const match = src.match(cldRegex);
  if (match && match[1]) {
    publicId = match[1];
  }

  // If external non-Cloudinary URL, render standard img with CORS
  if (src.startsWith('http') && !src.includes('cloudinary.com')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width || 500}
      height={height || 500}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
