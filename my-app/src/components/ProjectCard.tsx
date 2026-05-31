'use client';
import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    source_image: string;
    rows: number;
    cols: number;
    status: string;
    total_cells: number;
  };
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  completed: { label: '完成', color: 'bg-emerald-100 text-emerald-700' },
  editing: { label: '编辑中', color: 'bg-amber-100 text-amber-700' },
  pending: { label: '待处理', color: 'bg-sky-100 text-sky-700' },
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const badge = STATUS_BADGES[project.status] || { label: project.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <Link href={`/editor/${project.id}`}>
      <div className="group border border-[var(--border)] rounded-xl p-3.5 bg-white hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
        {/* Image container */}
        <div className="w-full aspect-square mx-auto mb-3 bg-[var(--muted)]/50 rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border)]/50">
          <img
            src={project.source_image}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Project name */}
        <div className="text-sm font-semibold text-[var(--foreground)] truncate mb-1">
          {project.name}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-[var(--muted-foreground)]">
            {project.rows}×{project.cols}
          </div>
          {project.total_cells > 0 && (
            <div className="text-xs text-[var(--muted-foreground)]">
              {project.total_cells}颗
            </div>
          )}
        </div>

        {/* Status badge */}
        {project.status && (
          <div className="mt-2">
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
