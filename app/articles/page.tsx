"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { createBrowserClient } from '@supabase/ssr';
import { Article, Category, Tag } from "@/lib/supabase";
import { Search, Eye, BookOpen, FileText, ArrowRight } from "lucide-react";
import { SectionNavigation } from "@/components/section-navigation";
import { PageContent } from "@/components/page-content";

export default function ArticlesHub() {
  const [articles, setArticles] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'articles' | 'series'>('articles');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (viewMode === 'articles') {
      fetchArticles();
    } else {
      fetchSeries();
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'articles') {
      fetchArticles();
    } else {
      fetchSeries();
    }
  }, [viewMode, activeCategory, selectedTags, searchQuery]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchTags() {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  }

  async function fetchArticles() {
    setLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select('*, categories(*), article_tags(tags(*))')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (activeCategory) {
        query = query.eq('category_id', activeCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by selected tags if any
      let filteredData = data || [];
      if (selectedTags.length > 0) {
        filteredData = filteredData.filter((article: any) => {
          const articleTagIds = article.article_tags?.map((at: any) => at.tags?.id) || [];
          return selectedTags.some(tagId => articleTagIds.includes(tagId));
        });
      }

      setArticles(filteredData);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSeries() {
    setSeriesLoading(true);
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
      setSeriesLoading(false);
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SectionNavigation />

      <div className="flex-1 ml-24">
        <PageContent>
          <header className="border-b">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <h1 className="text-4xl font-bold text-primary mb-2">Paras</h1>
                  <p className="text-muted-foreground">To find order in the chaos</p>
                </div>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/50">
                  <Button
                    variant={viewMode === 'articles' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('articles')}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Articles
                  </Button>
                  <Button
                    variant={viewMode === 'series' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('series')}
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Series
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {viewMode === 'articles' ? (
              <>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <Tabs value={activeCategory || 'all'} className="space-y-6">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="inline-flex w-full justify-start space-x-4 p-0 bg-transparent">
                      <TabsTrigger
                        value="all"
                        onClick={() => setActiveCategory(null)}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2 rounded-full"
                      >
                        All
                      </TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2 rounded-full"
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" className="invisible" />
                  </ScrollArea>

                  {/* Tags Filter */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : undefined}
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Articles Grid */}
                  <TabsContent value={activeCategory || 'all'} className="mt-8">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-96 bg-secondary rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    ) : articles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No articles found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article: any) => (
                          <Link href={`/articles/${article.slug}`} key={article.id}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                              {article.cover_image && (
                                <div className="aspect-video relative overflow-hidden">
                                  <img
                                    src={article.cover_image}
                                    alt={article.title}
                                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(article.published_at || article.created_at)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">{article.read_time}</span>
                                    <span className="text-sm text-muted-foreground flex items-center">
                                      <Eye className="w-3 h-3 mr-1" />
                                      {article.views}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  {article.featured && (
                                    <Badge variant="default">Featured</Badge>
                                  )}
                                  {article.categories && (
                                    <Badge variant="outline">{article.categories.name}</Badge>
                                  )}
                                </div>
                                <CardTitle className="line-clamp-2 hover:text-primary">
                                  {article.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground line-clamp-3">{article.excerpt}</p>
                                {article.article_tags && article.article_tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {article.article_tags.slice(0, 3).map((at: any) => (
                                      at.tags && (
                                        <Badge
                                          key={at.tags.id}
                                          variant="secondary"
                                          className="text-xs"
                                          style={{ backgroundColor: at.tags.color + '20' }}
                                        >
                                          {at.tags.name}
                                        </Badge>
                                      )
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="space-y-8">
                {seriesLoading ? (
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
                      <Link href={`/series/${s.slug}`} key={s.id}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
                              <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                                {s.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            {s.articles && s.articles.length > 0 && (
                              <div className="space-y-2 mb-4">
                                <p className="text-sm font-medium text-muted-foreground">Articles in this series:</p>
                                <div className="space-y-1">
                                  {s.articles.slice(0, 5).map((article: any) => (
                                    <div
                                      key={article.id}
                                      className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                      <Badge variant="outline" className="text-xs">
                                        {article.position}
                                      </Badge>
                                      <span className="line-clamp-1">{article.title}</span>
                                    </div>
                                  ))}
                                  {s.articles.length > 5 && (
                                    <p className="text-xs text-muted-foreground pl-8">
                                      +{s.articles.length - 5} more
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="mt-auto pt-4">
                              <Button variant="outline" className="w-full">
                                View Series
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </PageContent>
      </div>
    </div>
  );
}
