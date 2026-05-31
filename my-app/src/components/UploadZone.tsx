'use client';
import { useState, useCallback } from 'react';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
}

export default function UploadZone({ onImageSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
      className={`border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors min-h-[280px] ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
    >
      <input id="file-input" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileInput} />
      {preview ? (
        <img src={preview} alt="Preview" className="max-w-full max-h-[260px] object-contain" />
      ) : (
        <div className="text-center text-gray-500 p-8">
          <div className="text-4xl mb-3">📤</div>
          <div className="font-medium">点击或拖拽上传图片</div>
          <div className="text-sm mt-1">支持 JPG / PNG / WEBP，最大 20MB</div>
        </div>
      )}
    </div>
  );
}
