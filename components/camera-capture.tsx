'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CameraCapture({ onCapture, isOpen, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageUrl);
      }
    }
  };

  const confirmCapture = async () => {
    if (capturedImage) {
      try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
        handleClose();
      } catch (err) {
        setError('Failed to process image');
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError('');
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Capture Medicine Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden">
            {isCameraActive && !capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
            )}

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-64 object-cover"
              />
            )}

            {!isCameraActive && !capturedImage && (
              <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            {isCameraActive && !capturedImage && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </>
            )}

            {capturedImage && (
              <>
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={confirmCapture}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
