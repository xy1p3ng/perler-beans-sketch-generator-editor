'use client';
import { useState } from 'react';
import { buildPrompt, StyleId, STYLE_OPTIONS } from '@/lib/prompts';

interface AIGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function AIGenerator({ onImageGenerated }: AIGeneratorProps) {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<StyleId>('cartoon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) { setError('请输入图片描述'); return; }
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = buildPrompt(description, style);
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '生成失败');
      setPreview(data.imageUrl);
      onImageGenerated(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">图片描述</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="例如：一只可爱的橘猫坐在月亮上"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">风格</label>
        <div className="flex gap-2 flex-wrap">
          {STYLE_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-3 py-1.5 rounded text-sm border ${style === s.id ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-2.5 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
      >
        {isGenerating ? '生成中...' : '生成图片'}
      </button>
      {preview && (
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <div className="text-sm text-gray-500 mb-2">预览</div>
          <img src={preview} alt="Generated" className="max-w-full max-h-64 mx-auto rounded" />
        </div>
      )}
    </div>
  );
}
