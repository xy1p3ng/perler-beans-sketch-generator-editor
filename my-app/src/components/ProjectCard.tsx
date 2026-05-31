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

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/editor/${project.id}`}>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-20 h-20 mx-auto mb-2 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          <img src={project.source_image} alt={project.name} className="w-full h-full object-cover" />
        </div>
        <div className="text-sm font-bold text-center truncate">{project.name}</div>
        <div className="text-xs text-gray-500 text-center">
          {project.rows}×{project.cols}
        </div>
      </div>
    </Link>
  );
}
