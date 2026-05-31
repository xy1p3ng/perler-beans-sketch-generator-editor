'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/new', label: '新建项目' },
  { href: '/settings', label: '设置' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[var(--border)] shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className="w-8 h-8 transition-transform group-hover:scale-110"
          >
            <rect width="64" height="64" rx="8" fill="#2D3436" />
            <rect x="12" y="12" width="12" height="12" rx="2" fill="#FF6B6B" />
            <rect x="26" y="12" width="12" height="12" rx="2" fill="#4ECDC4" />
            <rect x="40" y="12" width="12" height="12" rx="2" fill="#FFE66D" />
            <rect x="12" y="26" width="12" height="12" rx="2" fill="#FD79A8" />
            <rect x="26" y="26" width="12" height="12" rx="2" fill="#FD79A8" />
            <rect x="40" y="26" width="12" height="12" rx="2" fill="#A29BFE" />
            <rect x="12" y="40" width="12" height="12" rx="2" fill="#FD79A8" />
            <rect x="26" y="40" width="12" height="12" rx="2" fill="#FD79A8" />
            <rect x="40" y="40" width="12" height="12" rx="2" fill="#FD79A8" />
          </svg>
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
            拼豆工坊
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
