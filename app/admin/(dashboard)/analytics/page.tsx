"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Eye, Users, Clock } from 'lucide-react';

type ArticleStats = {
  id: string;
  title: string;
  slug: string;
  views: number;
  published_at: string;
};

export default function AnalyticsPage() {
  const [topArticles, setTopArticles] = useState<ArticleStats[]>([]);
  const [recentViews, setRecentViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // Fetch top articles by views
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, views, published_at')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(10);

      setTopArticles(articles || []);

      // Fetch recent article views
      const { data: views } = await supabase
        .from('article_views')
        .select('*, articles(title, slug)')
        .order('viewed_at', { ascending: false })
        .limit(20);

      setRecentViews(views || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalViews = topArticles.reduce((sum, article) => sum + article.views, 0);
  const avgViews = topArticles.length > 0 ? Math.round(totalViews / topArticles.length) : 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your blog performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgViews}</div>
            <p className="text-xs text-muted-foreground">Per article</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentViews.length}</div>
            <p className="text-xs text-muted-foreground">Views in last 20 interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Articles</CardTitle>
          <CardDescription>Articles ranked by total views</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-secondary rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Published {new Date(article.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-semibold">{article.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Views */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Views</CardTitle>
          <CardDescription>Latest article views</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-secondary rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentViews.map((view: any) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-3 border rounded-lg text-sm"
                >
                  <span>{view.articles?.title || 'Unknown Article'}</span>
                  <span className="text-muted-foreground">
                    {new Date(view.viewed_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

