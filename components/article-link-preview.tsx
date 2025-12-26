"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, Loader2, BookOpen, Tag as TagIcon, Sparkles } from 'lucide-react';
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
  featured?: boolean;
  categories?: {
    name: string;
  } | null;
  article_tags?: Array<{
    tags: {
      name: string;
      color?: string;
    };
  }>;
  article_series?: Array<{
    position: number;
    series: {
      name: string;
      slug: string;
    };
  }>;
}

export function ArticleLinkPreview({ slug, children, className }: ArticleLinkPreviewProps) {
  const [article, setArticle] = useState<ArticlePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

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
        .select(`
          id, 
          slug, 
          title, 
          excerpt, 
          cover_image, 
          published_at, 
          created_at, 
          read_time, 
          views, 
          featured,
          categories(name),
          article_tags(tags(name, color)),
          article_series(position, series(name, slug))
        `)
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

  // Fetch article when hover card opens
  useEffect(() => {
    if (open && !article && !loading) {
      fetchArticle();
    }
  }, [open]);

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          href={`/articles/${slug}`}
          className={cn(
            "text-primary underline decoration-2 underline-offset-2 hover:decoration-primary/80 transition-all",
            "relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary/50 after:transition-all hover:after:w-full",
            "hover:text-primary/90 font-medium",
            className
          )}
        >
          {children}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0 !z-[9999]" 
        side="top"
        align="start"
        sideOffset={8}
        style={{ zIndex: 9999 }}
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
          <Card className="border-0 shadow-lg overflow-hidden group">
            {article.cover_image && (
              <div className="relative w-full h-40 overflow-hidden">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                {article.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary/90 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-semibold text-base line-clamp-2 flex-1">
                    {article.title}
                  </h3>
                  {article.featured && !article.cover_image && (
                    <Badge variant="secondary" className="shrink-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* Series Indicator */}
              {article.article_series && article.article_series.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-primary/20">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary">
                      Part {article.article_series[0].position} of Series
                    </p>
                    <Link
                      href={`/series/${article.article_series[0].series.slug}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {article.article_series[0].series.name}
                    </Link>
                  </div>
                </div>
              )}

              {/* Tags */}
              {article.article_tags && article.article_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {article.article_tags.slice(0, 3).map((tagRelation, idx) => {
                    const tag = tagRelation.tags;
                    return (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs"
                        style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                      >
                        <TagIcon className="w-2.5 h-2.5 mr-1" />
                        {tag.name}
                      </Badge>
                    );
                  })}
                  {article.article_tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{article.article_tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
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
                {article.views !== null && article.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()} {article.views === 1 ? 'view' : 'views'}
                  </span>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <Link
                  href={`/articles/${article.slug}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium transition-all hover:gap-2"
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

