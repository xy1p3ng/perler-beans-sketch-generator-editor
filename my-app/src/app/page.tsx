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

/* Decorative bead dots for the header area */
function BeadDecor({ color, x, y, size = 8 }: { color: string; x: number; y: number; size?: number }) {
  return (
    <div
      className="absolute rounded-sm opacity-40"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

const BEADS = [
  { color: '#FF6B6B', x: 8, y: 20, size: 10 },
  { color: '#4ECDC4', x: 16, y: 28, size: 8 },
  { color: '#FFE66D', x: 24, y: 18, size: 9 },
  { color: '#FD79A8', x: 32, y: 32, size: 11 },
  { color: '#A29BFE', x: 40, y: 22, size: 7 },
  { color: '#FF6B6B', x: 50, y: 30, size: 9 },
  { color: '#4ECDC4', x: 12, y: 40, size: 8 },
  { color: '#FFE66D', x: 20, y: 38, size: 6 },
  { color: '#FD79A8', x: 30, y: 42, size: 10 },
  { color: '#A29BFE', x: 42, y: 40, size: 8 },
  { color: '#FF6B6B', x: 55, y: 38, size: 7 },
  { color: '#4ECDC4', x: 60, y: 20, size: 9 },
  { color: '#FFE66D', x: 70, y: 28, size: 8 },
  { color: '#FD79A8', x: 78, y: 18, size: 10 },
  { color: '#A29BFE', x: 86, y: 35, size: 7 },
  { color: '#FF6B6B', x: 92, y: 25, size: 8 },
];

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
    <div>
      {/* Header section with gradient and decorative beads */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#fdf6f0] via-[#faf0e6] to-[#fce4ec] border-b border-[var(--border)]">
        {/* Decorative bead dots */}
        {BEADS.map((bead, i) => (
          <BeadDecor key={i} color={bead.color} x={bead.x} y={bead.y} size={bead.size} />
        ))}

        <div className="max-w-4xl mx-auto px-6 py-14 relative z-10">
          <div className="flex items-center gap-4 mb-3">
            {/* Mini bead heart icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 40 40"
              className="w-12 h-12 flex-shrink-0"
            >
              <rect width="40" height="40" rx="6" fill="#2D3436" />
              <rect x="8" y="8" width="7" height="7" rx="1.5" fill="#FF6B6B" />
              <rect x="16" y="8" width="7" height="7" rx="1.5" fill="#4ECDC4" />
              <rect x="25" y="8" width="7" height="7" rx="1.5" fill="#FFE66D" />
              <rect x="8" y="16" width="7" height="7" rx="1.5" fill="#FD79A8" />
              <rect x="16" y="16" width="7" height="7" rx="1.5" fill="#FD79A8" />
              <rect x="25" y="16" width="7" height="7" rx="1.5" fill="#A29BFE" />
              <rect x="8" y="25" width="7" height="7" rx="1.5" fill="#FD79A8" />
              <rect x="16" y="25" width="7" height="7" rx="1.5" fill="#FD79A8" />
              <rect x="25" y="25" width="7" height="7" rx="1.5" fill="#FD79A8" />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                拼豆工坊
              </h1>
              <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
                将图片变成美丽的拼豆图纸
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {loading ? '加载中...' : projects.length > 0 ? `我的项目 (${projects.length})` : '我的项目'}
            </h2>
          </div>
          <Link href="/new">
            <button className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-all duration-150 shadow-sm hover:shadow-md font-medium text-sm flex items-center gap-1.5">
              <span className="text-lg leading-none">+</span>
              新建项目
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex gap-1.5 mb-4">
              {['#FF6B6B', '#4ECDC4', '#FFE66D', '#FD79A8', '#A29BFE'].map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm animate-bounce"
                  style={{
                    backgroundColor: color,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
            <p className="text-[var(--muted-foreground)] text-sm">加载中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-2xl border border-[var(--border)]">
            {/* Empty state illustration - perler bead flower */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 80 80"
              className="w-24 h-24 mx-auto mb-5"
            >
              <rect width="80" height="80" rx="12" fill="#f0e8df" />
              <rect x="32" y="16" width="16" height="16" rx="3" fill="#FF6B6B" />
              <rect x="16" y="32" width="16" height="16" rx="3" fill="#4ECDC4" />
              <rect x="32" y="32" width="16" height="16" rx="3" fill="#FFE66D" />
              <rect x="48" y="32" width="16" height="16" rx="3" fill="#FD79A8" />
              <rect x="32" y="48" width="16" height="16" rx="3" fill="#A29BFE" />
            </svg>
            <p className="text-[var(--muted-foreground)] mb-2">还没有项目</p>
            <p className="text-[var(--muted-foreground)]/70 text-sm mb-6">
              创建你的第一个拼豆图纸吧
            </p>
            <Link href="/new">
              <button className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-all duration-150 shadow-sm hover:shadow-md font-medium">
                新建项目
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <Link href="/new">
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 bg-white/50 hover:bg-white/80 hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-200 flex items-center justify-center min-h-[140px] cursor-pointer group">
                <div className="text-center text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
                  <div className="text-2xl mb-1 font-light">+</div>
                  <div className="text-sm">新建项目</div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
