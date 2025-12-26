"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { createBrowserClient } from '@supabase/ssr';
import { Article } from '@/lib/supabase';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
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
  const params = useParams();
  const { signOut } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesOpen, setArticlesOpen] = useState(true);
  const currentArticleId = params?.id as string | undefined;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if we're on article edit/new pages
  const isArticlePage = pathname?.includes('/admin/articles/') && 
    (pathname?.includes('/edit') || pathname?.includes('/new'));

  useEffect(() => {
    if (isArticlePage) {
      fetchArticles();
    }
  }, [isArticlePage]);

  async function fetchArticles() {
    setArticlesLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  }

  const handleArticleClick = (articleId: string) => {
    const url = `/admin/articles/${articleId}/edit`;
    window.open(url, '_blank');
  };

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

        {/* Articles List - shown only on article edit/new pages */}
        {isArticlePage && (
          <div className="mt-4 pt-4 border-t">
            <Collapsible open={articlesOpen} onOpenChange={setArticlesOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 py-2 font-semibold hover:bg-muted"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    Articles
                  </span>
                  {articlesOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-2 mt-1">
                {articlesLoading ? (
                  <div className="space-y-2 px-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 bg-secondary rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : articles.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-2">
                    No articles found
                  </p>
                ) : (
                  <div className="space-y-1">
                    {articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleClick(article.id)}
                        className={cn(
                          'w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors',
                          'hover:bg-muted cursor-pointer',
                          'flex items-center justify-between gap-2',
                          currentArticleId === article.id && 'bg-muted font-medium'
                        )}
                        title={`Open ${article.title} in new tab`}
                      >
                        <span className="truncate flex-1">{article.title}</span>
                        <span
                          className={cn(
                            'text-xs px-1 py-0.5 rounded flex-shrink-0',
                            article.status === 'published'
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                              : article.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          )}
                        >
                          {article.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
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

