'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';

interface Project {
  id: number;
  name: string;
  source_image: string;
  rows: number;
  cols: number;
  status: string;
  total_cells: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">拼豆工坊</h1>
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              设置
            </button>
          </Link>
          <Link href="/new">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">+ 新建项目</button>
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4"></div>
          <p className="text-gray-500 mb-4">还没有项目，创建你的第一个拼豆图纸吧</p>
          <Link href="/new">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">新建项目</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <Link href="/new">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center min-h-[140px] cursor-pointer">
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-1">+</div>
                <div className="text-sm">新建项目</div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
