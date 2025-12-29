"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Article } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow as TiptapTableRow } from '@tiptap/extension-table-row';
import { TableCell as TiptapTableCell } from '@tiptap/extension-table-cell';
import { TableHeader as TiptapTableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Footnote } from '@/components/admin/footnote-extension';
import { ArticleContentRenderer } from '@/components/article-content-renderer';
import { Calendar, Clock } from 'lucide-react';

const lowlight = createLowlight(common);

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch articles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });

      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
    }
  }

  async function toggleStatus(article: Article) {
    const newStatus = article.status === 'published' ? 'draft' : 'published';

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });

      fetchArticles();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        variant: 'destructive',
      });
    }
  }

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function fetchArticleForPreview(articleId: string) {
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, categories(*), article_tags(tags(*))')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setPreviewArticle(data);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article preview',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-secondary rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found</p>
              <Link href="/admin/articles/new">
                <Button className="mt-4">Create your first article</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow 
                    key={article.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => {
                      // Don't navigate if clicking on the dropdown menu or its trigger
                      const target = e.target as HTMLElement;
                      if (target.closest('[role="menu"]') || target.closest('button')) {
                        return;
                      }
                      router.push(`/admin/articles/${article.id}/edit`);
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {article.featured && (
                          <Badge variant="outline" className="mr-2">
                            Featured
                          </Badge>
                        )}
                        <span>{article.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(article.status)}</TableCell>
                    <TableCell>{article.views}</TableCell>
                    <TableCell>
                      {new Date(article.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => fetchArticleForPreview(article.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/articles/${article.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(article)}>
                            <Archive className="w-4 h-4 mr-2" />
                            {article.status === 'published' ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteArticle(article.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : previewArticle ? (
            <div className="space-y-6">
              {previewArticle.cover_image && (
                <img
                  src={previewArticle.cover_image}
                  alt={previewArticle.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              )}

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {previewArticle.featured && <Badge>Featured</Badge>}
                  {previewArticle.categories && (
                    <Badge variant="outline">{previewArticle.categories.name}</Badge>
                  )}
                  {previewArticle.article_tags?.map((at: any) =>
                    at.tags ? (
                      <Badge
                        key={at.tags.id}
                        variant="secondary"
                        style={{ backgroundColor: at.tags.color ? at.tags.color + '20' : undefined }}
                      >
                        {at.tags.name}
                      </Badge>
                    ) : null
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold">{previewArticle.title}</h1>

                {previewArticle.excerpt && (
                  <p className="text-xl text-muted-foreground">{previewArticle.excerpt}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      previewArticle.published_at || previewArticle.created_at
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {previewArticle.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {previewArticle.read_time}
                    </span>
                  )}
                  {previewArticle.views !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {previewArticle.views} views
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Article Content */}
              {previewArticle.content && (() => {
                try {
                  // Handle both string and object content
                  const contentToRender = typeof previewArticle.content === 'string' 
                    ? JSON.parse(previewArticle.content) 
                    : previewArticle.content;
                  const htmlContent = generateHTML(contentToRender, [
                    StarterKit.configure({ codeBlock: false }),
                    Underline,
                    LinkExt,
                    Image,
                    TiptapTable,
                    TiptapTableRow,
                    TiptapTableHeader,
                    TiptapTableCell,
                    TextAlign,
                    Typography,
                    CodeBlockLowlight.configure({ lowlight }),
                    Footnote,
                  ]);
                  return (
                    <ArticleContentRenderer
                      htmlContent={htmlContent}
                      className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-img:rounded-lg"
                    />
                  );
                } catch (error) {
                  return (
                    <p className="text-muted-foreground italic">
                      Error rendering preview. Please check your content format.
                    </p>
                  );
                }
              })()}
              {!previewArticle.content && (
                <p className="text-muted-foreground italic">No content available.</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No article data available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

