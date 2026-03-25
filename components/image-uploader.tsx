'use client';

import React, { useRef, useState } from 'react';
import { Upload, Camera, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
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
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300'
        } ${previewUrl ? 'p-2' : 'p-12'}`}
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
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="text-white text-sm font-medium">Click to change image</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Drop your medicine image here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supported formats: JPEG, PNG, WebP (max 5MB)
            </p>
          </div>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-600 dark:text-blue-400">Processing image...</span>
        </div>
      )}
    </div>
  );
}
