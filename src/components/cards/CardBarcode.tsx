'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export interface CardBarcodeProps {
  value: string;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  background?: string;
  lineColor?: string;
  margin?: number;
  className?: string;
}

export default function CardBarcode({
  value,
  format = 'CODE128',
  width = 1.2,
  height = 32,
  displayValue = false,
  background = 'transparent',
  lineColor = '#000000',
  margin = 0,
  className = '',
}: CardBarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value || value.trim() === '') return;

    try {
      JsBarcode(svgRef.current, value.trim(), {
        format,
        width,
        height,
        displayValue,
        background,
        lineColor,
        margin,
      });
    } catch (err) {
      console.warn('CardBarcode rendering error:', err);
    }
  }, [value, format, width, height, displayValue, background, lineColor, margin]);

  if (!value || value.trim() === '') return null;

  return <svg ref={svgRef} className={className} />;
}

