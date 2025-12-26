"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '@/lib/utils';

interface ArticleLinkPreviewProps {
  slug: string;
  children: React.ReactNode;
  className?: string;
}

interface ArticlePreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  read_time: string | null;
  views: number | null;
  categories?: {
    name: string;
  } | null;
}

export function ArticleLinkPreview({ slug, children, className }: ArticleLinkPreviewProps) {
  const [article, setArticle] = useState<ArticlePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchArticle = async () => {
    if (article || loading) return; // Don't fetch if already loaded or loading
    
    setLoading(true);
    setError(false);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('id, slug, title, excerpt, cover_image, published_at, created_at, read_time, views, categories(name)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (fetchError) throw fetchError;
      setArticle(data);
    } catch (err) {
      console.error('Error fetching article preview:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          href={`/articles/${slug}`}
          className={cn(
            "text-primary underline decoration-2 underline-offset-2 hover:decoration-primary/80 transition-colors",
            "relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary/50 after:transition-all hover:after:w-full",
            className
          )}
          onMouseEnter={fetchArticle}
        >
          {children}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0" 
        side="top"
        align="start"
        sideOffset={8}
      >
        {loading && !article && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {error && !article && (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Article preview unavailable
          </div>
        )}
        
        {article && (
          <Card className="border-0 shadow-lg">
            {article.cover_image && (
              <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            )}
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-base line-clamp-2 mb-1">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {article.categories && (
                  <Badge variant="outline" className="text-xs">
                    {article.categories.name}
                  </Badge>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {article.read_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.read_time}
                  </span>
                )}
                {article.views !== null && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views} views
                  </span>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-sm text-primary hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read article →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

