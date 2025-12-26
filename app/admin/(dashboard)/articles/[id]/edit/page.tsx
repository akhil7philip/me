"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import { useAuth } from '@/lib/auth-context';
import slugify from 'slugify';
import readingTime from 'reading-time';
import { ArrowLeft, Save, Eye, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Category, Tag } from '@/lib/supabase';

interface ArticleState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categoryId: string;
  selectedTags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const articleId = params?.id as string;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialState, setInitialState] = useState<ArticleState | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  
  // Refs to store latest values for auto-save
  const stateRef = useRef({
    title,
    slug,
    content,
    excerpt,
    coverImage,
    categoryId,
    selectedTags,
    status,
    featured,
    seoTitle,
    seoDescription,
  });
  
  const initialStateRef = useRef(initialState);

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  async function fetchArticle() {
    try {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*, article_tags(tag_id)')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      if (article) {
        setTitle(article.title);
        setSlug(article.slug);
        setContent(article.content);
        setExcerpt(article.excerpt || '');
        setCoverImage(article.cover_image || '');
        setCategoryId(article.category_id || '');
        setStatus(article.status);
        setFeatured(article.featured);
        setSeoTitle(article.seo_title || '');
        setSeoDescription(article.seo_description || '');
        setSelectedTags(article.article_tags?.map((at: any) => at.tag_id) || []);
        
        // Set initial state for change detection
        setInitialState({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt || '',
          coverImage: article.cover_image || '',
          categoryId: article.category_id || '',
          selectedTags: article.article_tags?.map((at: any) => at.tag_id) || [],
          status: article.status,
          featured: article.featured,
          seoTitle: article.seo_title || '',
          seoDescription: article.seo_description || '',
        });
        
        // Set last saved timestamp from updated_at if available
        if (article.updated_at) {
          setLastSaved(new Date(article.updated_at));
        }
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article',
        variant: 'destructive',
      });
    } finally {
      setInitialLoading(false);
    }
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchTags() {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  }

  // Update state refs whenever state changes
  useEffect(() => {
    stateRef.current = {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      categoryId,
      selectedTags,
      status,
      featured,
      seoTitle,
      seoDescription,
    };
  }, [title, slug, content, excerpt, coverImage, categoryId, selectedTags, status, featured, seoTitle, seoDescription]);
  
  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = (): boolean => {
    const currentState = stateRef.current;
    const initial = initialStateRef.current;
    
    if (!initial) return false;
    
    return (
      currentState.title !== initial.title ||
      currentState.slug !== initial.slug ||
      currentState.content !== initial.content ||
      currentState.excerpt !== initial.excerpt ||
      currentState.coverImage !== initial.coverImage ||
      currentState.categoryId !== initial.categoryId ||
      JSON.stringify(currentState.selectedTags.sort()) !== JSON.stringify(initial.selectedTags.sort()) ||
      currentState.status !== initial.status ||
      currentState.featured !== initial.featured ||
      currentState.seoTitle !== initial.seoTitle ||
      currentState.seoDescription !== initial.seoDescription
    );
  };

  // Save article function (reusable for auto-save and manual save)
  const saveArticle = async (isAutoSave: boolean = false): Promise<boolean> => {
    if (!user || !articleId || isSavingRef.current) return false;
    
    // Get current state from refs for auto-save, or use state directly for manual save
    const currentState = isAutoSave ? stateRef.current : {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      categoryId,
      selectedTags,
      status,
      featured,
      seoTitle,
      seoDescription,
    };
    
    isSavingRef.current = true;
    if (!isAutoSave) {
      setLoading(true);
    } else {
      setIsSaving(true);
    }

    try {
      // Calculate reading time
      const stats = readingTime(JSON.stringify(currentState.content));
      const readTime = stats.text;

      // Update article
      const { error: articleError } = await supabase
        .from('articles')
        .update({
          title: currentState.title,
          slug: currentState.slug,
          content: currentState.content,
          excerpt: currentState.excerpt,
          cover_image: currentState.coverImage || null,
          category_id: currentState.categoryId || null,
          status: currentState.status,
          published_at: currentState.status === 'published' && !isAutoSave ? new Date().toISOString() : undefined,
          featured: currentState.featured,
          read_time: readTime,
          seo_title: currentState.seoTitle || null,
          seo_description: currentState.seoDescription || null,
        })
        .eq('id', articleId);

      if (articleError) throw articleError;

      // Update article tags
      await supabase.from('article_tags').delete().eq('article_id', articleId);

      if (currentState.selectedTags.length > 0) {
        const articleTags = currentState.selectedTags.map((tagId) => ({
          article_id: articleId,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('article_tags')
          .insert(articleTags);

        if (tagsError) throw tagsError;
      }

      // Save version history (only for manual saves, not auto-saves)
      if (!isAutoSave) {
        const { error: versionError } = await supabase.from('article_versions').insert({
          article_id: articleId,
          title: currentState.title,
          content: currentState.content,
          excerpt: currentState.excerpt,
          version_number: Date.now(),
          created_by: user.id,
        });

        if (versionError) console.warn('Failed to save version:', versionError);
      }

      // Update initial state to reflect saved state
      const newInitialState = {
        title: currentState.title,
        slug: currentState.slug,
        content: currentState.content,
        excerpt: currentState.excerpt,
        coverImage: currentState.coverImage,
        categoryId: currentState.categoryId,
        selectedTags: [...currentState.selectedTags],
        status: currentState.status,
        featured: currentState.featured,
        seoTitle: currentState.seoTitle,
        seoDescription: currentState.seoDescription,
      };
      
      setInitialState(newInitialState);
      initialStateRef.current = newInitialState;

      const savedTime = new Date();
      setLastSaved(savedTime);

      if (!isAutoSave) {
        toast({
          title: 'Success',
          description: 'Article updated successfully',
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error saving article:', error);
      if (!isAutoSave) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save article',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      isSavingRef.current = false;
      if (!isAutoSave) {
        setLoading(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const success = await saveArticle(false);
    if (success) {
      router.push('/admin/articles');
    }
  };

  // Auto-save effect - set up interval once when article is loaded
  useEffect(() => {
    if (!initialState || !articleId) return;

    // Clear any existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // Set up auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChanges() && !isSavingRef.current) {
        saveArticle(true);
      }
    }, 5000); // Auto-save every 5 seconds

    // Cleanup on unmount
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [initialState, articleId]); // Only recreate when article is loaded or changed

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/articles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Article</h1>
            <p className="text-muted-foreground">Update your blog post</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title"
                    required
                    className="text-2xl font-bold"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="article-slug"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /articles/{slug || 'article-slug'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description of the article"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Content *</Label>
                  <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your article..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Leave empty to use article title"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Leave empty to use excerpt"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured</Label>
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                </div>

                {/* Save Status */}
                <div className="pt-2 border-t">
                  {isSaving && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Auto-saving...
                    </p>
                  )}
                  {!isSaving && lastSaved && !hasUnsavedChanges() && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  )}
                  {!isSaving && hasUnsavedChanges() && (
                    <p className="text-sm text-orange-500">
                      Unsaved changes
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || isSaving || !hasUnsavedChanges()}
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Article
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Image URL or upload"
                    className="flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="mt-4 rounded-lg w-full"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

