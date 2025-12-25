"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderTree,
  MessageSquare,
  Image,
  Settings,
  LogOut,
  BookOpen,
  Users,
  Mail,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/articles/new', label: 'New Article', icon: BookOpen },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/series', label: 'Series', icon: BookOpen },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/profile', label: 'Profile', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-6 border-b">
        <Link href="/admin/dashboard">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start', isActive && 'bg-secondary')}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/" className="block mb-2">
          <Button variant="outline" className="w-full justify-start">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            View Site
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

