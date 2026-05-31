'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProviderConfig {
  provider: string;
  hasKey: boolean;
  model: string | null;
  isActive: boolean;
}

interface ProviderDef {
  id: string;
  name: string;
  models: Array<{ id: string; name: string }>;
  defaultModel: string;
}

const PROVIDER_LIST: ProviderDef[] = [
  { id: 'openai', name: 'OpenAI', models: [{ id: 'dall-e-3', name: 'DALL-E 3' }, { id: 'dall-e-2', name: 'DALL-E 2' }], defaultModel: 'dall-e-3' },
  { id: 'gemini', name: 'Google Gemini', models: [{ id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini 2.0 Flash' }], defaultModel: 'gemini-2.0-flash-exp-image-generation' },
  { id: 'zhipu', name: '智谱 AI', models: [{ id: 'cogview-3-plus', name: 'CogView-3-Plus' }, { id: 'cogview-3', name: 'CogView-3' }], defaultModel: 'cogview-3-plus' },
  { id: 'qwen', name: '通义万相', models: [{ id: 'wanx-v1', name: '通义万相' }], defaultModel: 'wanx-v1' },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState<Map<string, { apiKey: string; model: string }>>(new Map());
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/provider-configs')
      .then(r => r.json())
      .then(data => {
        const newConfigs = new Map();
        let active = null;
        for (const c of data.configs || []) {
          newConfigs.set(c.provider, { apiKey: '', model: c.model });
          if (c.isActive) active = c.provider;
        }
        setConfigs(newConfigs);
        setActiveProvider(active);
      });
  }, []);

  const handleSave = async (providerId: string) => {
    const cfg = configs.get(providerId);
    if (!cfg) return;
    await fetch('/api/provider-configs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: providerId, api_key: cfg.apiKey, model: cfg.model, is_active: activeProvider === providerId }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-900">返回</Link>
        <h1 className="text-2xl font-bold">设置</h1>
      </div>
      {saved && <div className="mb-4 p-2 bg-green-50 text-green-700 rounded text-sm">已保存</div>}
      <div className="space-y-4">
        {PROVIDER_LIST.map(def => (
          <div key={def.id} className="border border-gray-200 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">{def.name}</h2>
              <button
                onClick={() => setActiveProvider(def.id)}
                className={`px-3 py-1 rounded text-sm ${activeProvider === def.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {activeProvider === def.id ? '默认' : '设为默认'}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">API Key</label>
                <input
                  type="password"
                  value={configs.get(def.id)?.apiKey || ''}
                  onChange={e => {
                    const next = new Map(configs);
                    const c = next.get(def.id) || { apiKey: '', model: def.defaultModel };
                    next.set(def.id, { ...c, apiKey: e.target.value });
                    setConfigs(next);
                  }}
                  placeholder={`输入 ${def.name} 的 API Key`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">模型</label>
                <select
                  value={configs.get(def.id)?.model || def.defaultModel}
                  onChange={e => {
                    const next = new Map(configs);
                    const c = next.get(def.id) || { apiKey: '', model: def.defaultModel };
                    next.set(def.id, { ...c, model: e.target.value });
                    setConfigs(next);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {def.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <button onClick={() => handleSave(def.id)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">保存</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
