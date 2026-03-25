'use client';

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
  previewUrl?: string;
}

export function ImageUploader({ onImageSelect, isLoading = false, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const validateAndSelectFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');
    onImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 transition-all rounded-lg cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-dashed border-border hover:border-primary/50 hover:bg-primary/5'
        } ${previewUrl ? 'p-3' : 'p-12'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-white" />
              <span className="text-white text-sm font-medium">Click to change</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="p-4 rounded-lg bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                Drag medicine image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select from your device
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, GIF up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Alternative Button */}
      {!previewUrl && !isLoading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Choose Image
        </button>
      )}
    </div>
  );
}
