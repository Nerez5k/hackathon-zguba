"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  label: string;
  value?: string; // base64 or URL
  onChange: (value: string | undefined) => void;
  helperText?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  helperText,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Dozwolone są tylko pliki graficzne (JPG, PNG, GIF)");
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Maksymalny rozmiar pliku to ${maxSizeMB} MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.onerror = () => {
      setError("Nie udało się wczytać pliku");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gov-text mb-1.5">
        {label}
      </label>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Podgląd zdjęcia"
            className="w-full max-h-64 object-contain rounded-lg border-2 border-gov-border bg-gray-50"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            aria-label="Usuń zdjęcie"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${isDragging ? "border-gov-primary bg-gov-primary-light" : "border-gov-border hover:border-gov-primary"}
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm text-gov-text font-medium">
            Przeciągnij zdjęcie lub kliknij, aby wybrać
          </p>
          <p className="text-xs text-gov-text-light mt-1">
            JPG, PNG lub GIF (max {maxSizeMB} MB)
          </p>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-gov-error" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gov-text-light">{helperText}</p>
      )}

      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <strong>⚠️ RODO:</strong> Zdjęcie jest przechowywane tylko wewnętrznie i nie jest 
        eksportowane do publicznej bazy danych.
      </div>
    </div>
  );
}

