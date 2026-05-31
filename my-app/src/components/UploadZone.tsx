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
      className={`border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 min-h-[280px] ${
        isDragging
          ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01] shadow-lg'
          : 'border-[var(--border)] bg-white/60 hover:border-[var(--primary)]/40 hover:bg-white/80 hover:shadow-sm'
      } ${preview ? 'p-3' : ''}`}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />

      {preview ? (
        <img src={preview} alt="Preview" className="max-w-full max-h-[260px] object-contain rounded-lg" />
      ) : (
        <div className="text-center p-8">
          {/* Decorative upload icon - mini bead pattern */}
          <div className={`mx-auto mb-4 transition-transform duration-500 ${isDragging ? 'scale-110' : ''}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              className="w-16 h-16 mx-auto"
            >
              <rect width="64" height="64" rx="10" fill="#faf0e6" />
              <rect x="14" y="14" width="10" height="10" rx="2" fill="#FF6B6B" />
              <rect x="26" y="14" width="10" height="10" rx="2" fill="#4ECDC4" />
              <rect x="38" y="14" width="10" height="10" rx="2" fill="#FFE66D" />
              <rect x="14" y="26" width="10" height="10" rx="2" fill="#FD79A8" />
              <rect x="26" y="26" width="10" height="10" rx="2" fill="#dfe6e9" />
              <rect x="38" y="26" width="10" height="10" rx="2" fill="#A29BFE" />
              <rect x="14" y="38" width="10" height="10" rx="2" fill="#A29BFE" />
              <rect x="26" y="38" width="10" height="10" rx="2" fill="#FF6B6B" />
              <rect x="38" y="38" width="10" height="10" rx="2" fill="#4ECDC4" />
            </svg>
          </div>

          <div className="font-medium text-[var(--muted-foreground)] mb-1">
            {isDragging ? '松开以上传图片' : '点击或拖拽上传图片'}
          </div>
          <div className="text-sm text-[var(--muted-foreground)]/60">
            支持 JPG / PNG / WEBP，最大 20MB
          </div>

          {/* Pulse ring when dragging */}
          {isDragging && (
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                {['#FF6B6B', '#4ECDC4', '#FFE66D', '#FD79A8', '#A29BFE'].map((color, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-sm animate-bounce"
                    style={{
                      backgroundColor: color,
                      animationDelay: `${i * 0.08}s`,
                      animationDuration: '0.6s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
