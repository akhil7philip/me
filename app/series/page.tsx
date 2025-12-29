"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from '@supabase/ssr';
import { Series } from "@/lib/supabase";
import { BookOpen, ArrowRight } from "lucide-react";

export default function SeriesHub() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSeries();
  }, []);

  async function fetchSeries() {
    setLoading(true);
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });

      if (seriesError) throw seriesError;

      // Fetch articles for each series
      const seriesWithArticles = await Promise.all(
        (seriesData || []).map(async (s) => {
          const { data: articlesData, error: articlesError } = await supabase
            .from('article_series')
            .select('position, articles(id, slug, title, excerpt, cover_image, published_at, status)')
            .eq('series_id', s.id)
            .order('position', { ascending: true });

          if (articlesError) throw articlesError;

          // Filter only published articles
          const publishedArticles = (articlesData || [])
            .filter((item: any) => item.articles && item.articles.status === 'published')
            .map((item: any) => ({
              ...item.articles,
              position: item.position,
            }));

          return {
            ...s,
            articles: publishedArticles,
            articleCount: publishedArticles.length,
          };
        })
      );

      // Filter out series with no published articles
      setSeries(seriesWithArticles.filter(s => s.articleCount > 0));
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-8 flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="sr-only">Back to Home</span>
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Article Series</h1>
            <p className="text-muted-foreground">Explore collections of related articles</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-secondary rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No series available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((s) => (
              <Card key={s.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                {s.cover_image && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={s.cover_image}
                      alt={s.name}
                      className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {s.articleCount} {s.articleCount === 1 ? 'Article' : 'Articles'}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary">
                    {s.name}
                  </CardTitle>
                  {s.description && (
                    <CardDescription className="line-clamp-3 mt-2">
                      {s.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {s.articles && s.articles.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Articles in this series:</p>
                      <div className="space-y-1">
                        {s.articles.slice(0, 5).map((article: any) => (
                          <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {article.position}
                              </Badge>
                              <span className="line-clamp-1">{article.title}</span>
                            </div>
                          </Link>
                        ))}
                        {s.articles.length > 5 && (
                          <p className="text-xs text-muted-foreground pl-8">
                            +{s.articles.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <Link href={`/series/${s.slug}`} className="mt-auto">
                    <Button variant="outline" className="w-full">
                      View Series
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

