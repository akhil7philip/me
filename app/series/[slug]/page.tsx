"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Calendar, Clock, Eye } from "lucide-react";

export default function SeriesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [series, setSeries] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (slug) {
      fetchSeries();
    }
  }, [slug]);

  async function fetchSeries() {
    setLoading(true);
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .eq('slug', slug)
        .single();

      if (seriesError) throw seriesError;

      if (!seriesData) {
        toast({
          title: 'Error',
          description: 'Series not found',
          variant: 'destructive',
        });
        router.push('/series');
        return;
      }

      setSeries(seriesData);

      // Fetch articles in this series
      const { data: articlesData, error: articlesError } = await supabase
        .from('article_series')
        .select('position, articles(id, slug, title, excerpt, cover_image, published_at, read_time, views, status)')
        .eq('series_id', seriesData.id)
        .order('position', { ascending: true });

      if (articlesError) throw articlesError;

      // Filter only published articles
      const publishedArticles = (articlesData || [])
        .filter((item: any) => item.articles && item.articles.status === 'published')
        .map((item: any) => ({
          ...item.articles,
          position: item.position,
        }));

      setArticles(publishedArticles);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: 'Error',
        description: 'Failed to load series',
        variant: 'destructive',
      });
      router.push('/series');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!series) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-8">
          <Link href="/series">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Series
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {series.cover_image && (
              <div className="w-full md:w-64 flex-shrink-0">
                <img
                  src={series.cover_image}
                  alt={series.name}
                  className="w-full rounded-lg object-cover aspect-video"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{series.name}</h1>
              {series.description && (
                <p className="text-xl text-muted-foreground mb-4">{series.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No articles in this series yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    {article.cover_image && (
                      <div className="w-full md:w-48 flex-shrink-0">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Part {article.position}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 hover:text-primary mb-2">
                        {article.title}
                      </CardTitle>
                      {article.excerpt && (
                        <CardDescription className="line-clamp-2">
                          {article.excerpt}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {article.read_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.read_time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views} views
                        </span>
                      </div>
                    </CardHeader>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

