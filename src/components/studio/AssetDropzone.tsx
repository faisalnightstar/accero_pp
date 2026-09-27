'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface AssetDropzoneProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
  aspectRatio?: 'photo' | 'signature';
  helperText?: string;
  required?: boolean;
  isMissing?: boolean;
}

export default function AssetDropzone({
  label,
  value,
  onChange,
  onClear,
  aspectRatio = 'photo',
  helperText,
  required = false,
  isMissing = false,
}: AssetDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileProcess = (file: File) => {
    setErrorMsg('');

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid image (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-crimson">*</span>}
        </label>

        {isMissing && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Image Required
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={onFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="relative border border-gray-200 rounded-xl p-2 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`rounded border border-gray-300 bg-white overflow-hidden flex items-center justify-center shrink-0 ${
                aspectRatio === 'photo' ? 'w-12 h-14' : 'w-24 h-10'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-navy flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Asset Loaded
              </span>
              <p className="text-[10px] text-gray-500">
                Ready for live card rendering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={triggerSelect}
              className="px-2.5 py-1 text-[11px] font-semibold text-navy bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1 text-gray-400 hover:text-crimson hover:bg-gray-100 rounded-lg transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Drag-and-drop placeholder */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={triggerSelect}
          className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
            isDragging
              ? 'border-crimson bg-crimson/5 scale-[1.01]'
              : isMissing
              ? 'border-amber-400 bg-amber-50/20 hover:border-amber-500'
              : 'border-gray-300 hover:border-steel-blue hover:bg-gray-50/50'
          }`}
        >
          <div className="p-1.5 rounded-full bg-gray-100 text-gray-600">
            <Upload className="w-4 h-4 text-steel-blue" />
          </div>
          <div className="text-[11px] font-semibold text-navy">
            Click to upload <span className="font-normal text-gray-500">or drag & drop</span>
          </div>
          <p className="text-[9px] text-gray-400">
            {helperText ||
              (aspectRatio === 'photo'
                ? 'Standard 35mm × 45mm Passport Photo (Max 5MB)'
                : 'Scanned Cardholder Signature on White Background (Max 5MB)')}
          </p>
        </div>
      )}

      {errorMsg && (
        <span className="text-[10px] font-semibold text-crimson">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
