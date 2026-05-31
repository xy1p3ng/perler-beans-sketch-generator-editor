'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('dall-e-3');
  const [style, setStyle] = useState('cartoon');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setModel(data.settings.default_model || 'dall-e-3');
          setStyle(data.settings.default_style || 'cartoon');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openai_api_key: apiKey, default_model: model, default_style: style }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-900">返回</Link>
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <h2 className="font-bold mb-4">AI 文生图配置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">你的 API Key 仅存储在本地数据库中</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">默认模型</label>
              <select value={model} onChange={e => setModel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="dall-e-3">DALL-E 3</option>
                <option value="dall-e-2">DALL-E 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">默认风格</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="cartoon">卡通</option>
                <option value="pixel">像素</option>
                <option value="minimalist">简约</option>
                <option value="cute">可爱</option>
                <option value="retro">复古</option>
              </select>
            </div>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              {saved ? '已保存' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
