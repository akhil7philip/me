"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, MessageSquare, Users, TrendingUp, Tag } from 'lucide-react';

type Stats = {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalComments: number;
  pendingComments: number;
  totalSubscribers: number;
  totalTags: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0,
    totalSubscribers: 0,
    totalTags: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch articles stats
        const { count: totalArticles } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });

        const { count: publishedArticles } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        const { count: draftArticles } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft');

        // Fetch total views
        const { data: articlesData } = await supabase
          .from('articles')
          .select('views');
        
        const totalViews = articlesData?.reduce((sum, article) => sum + (article.views || 0), 0) || 0;

        // Fetch comments stats
        const { count: totalComments } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true });

        const { count: pendingComments } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch subscribers
        const { count: totalSubscribers } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch tags
        const { count: totalTags } = await supabase
          .from('tags')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalArticles: totalArticles || 0,
          publishedArticles: publishedArticles || 0,
          draftArticles: draftArticles || 0,
          totalViews,
          totalComments: totalComments || 0,
          pendingComments: pendingComments || 0,
          totalSubscribers: totalSubscribers || 0,
          totalTags: totalTags || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  const statCards = [
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      description: `${stats.publishedArticles} published, ${stats.draftArticles} drafts`,
      icon: FileText,
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      description: 'Across all articles',
      icon: Eye,
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      description: `${stats.pendingComments} pending moderation`,
      icon: MessageSquare,
    },
    {
      title: 'Subscribers',
      value: stats.totalSubscribers,
      description: 'Newsletter subscribers',
      icon: Users,
    },
    {
      title: 'Tags',
      value: stats.totalTags,
      description: 'Content tags',
      icon: Tag,
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your blog admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/articles/new"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-secondary transition-colors"
          >
            <FileText className="h-8 w-8 mb-2" />
            <span className="font-medium">New Article</span>
          </a>
          <a
            href="/admin/comments"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-secondary transition-colors"
          >
            <MessageSquare className="h-8 w-8 mb-2" />
            <span className="font-medium">Moderate Comments</span>
          </a>
          <a
            href="/admin/analytics"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-secondary transition-colors"
          >
            <TrendingUp className="h-8 w-8 mb-2" />
            <span className="font-medium">View Analytics</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

