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
import { Search, Eye } from "lucide-react";

export default function ArticlesHub() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [activeCategory, selectedTags, searchQuery]);

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
            <h1 className="text-4xl font-bold text-primary mb-2">Blog</h1>
            <p className="text-muted-foreground">Read, Learn, Grow</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
      </main>
    </div>
  );
} 