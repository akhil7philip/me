"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Save, Eye, Upload, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Category, Tag } from '@/lib/supabase';

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [musicPlaylist, setMusicPlaylist] = useState<Array<{link: string; song_name?: string; artist?: string}>>([]);
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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
  }, []);

  useEffect(() => {
    // Auto-generate slug from title
    if (title && !slug) {
      setSlug(slugify(title, { lower: true, strict: true }));
    }
  }, [title]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchTags() {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Calculate reading time
      const stats = readingTime(JSON.stringify(content));
      const readTime = stats.text;

      // Insert article
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          title,
          slug,
          content,
          excerpt,
          cover_image: coverImage || null,
          music_playlist: musicPlaylist || [],
          author_id: user.id,
          category_id: categoryId || null,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null,
          featured,
          read_time: readTime,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // Insert article tags
      if (selectedTags.length > 0 && article) {
        const articleTags = selectedTags.map((tagId) => ({
          article_id: article.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('article_tags')
          .insert(articleTags);

        if (tagsError) throw tagsError;
      }

      toast({
        title: 'Success',
        description: `Article ${status === 'published' ? 'published' : 'saved as draft'} successfully`,
      });

      router.push('/admin/articles');
    } catch (error: any) {
      console.error('Error creating article:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create article',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold">New Article</h1>
            <p className="text-muted-foreground">Create a new blog post</p>
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    'Saving...'
                  ) : status === 'published' ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Publish
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
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
                <CardTitle>Background Music Playlist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {musicPlaylist.map((song, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Song {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newPlaylist = musicPlaylist.filter((_, i) => i !== index);
                            setMusicPlaylist(newPlaylist);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor={`song-link-${index}`}>Link</Label>
                        <Input
                          id={`song-link-${index}`}
                          value={song.link}
                          onChange={(e) => {
                            const newPlaylist = [...musicPlaylist];
                            newPlaylist[index].link = e.target.value;
                            setMusicPlaylist(newPlaylist);
                          }}
                          placeholder="https://example.com/music.mp3 or YouTube URL"
                          type="url"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`song-name-${index}`}>Song Name</Label>
                          <Input
                            id={`song-name-${index}`}
                            value={song.song_name || ''}
                            onChange={(e) => {
                              const newPlaylist = [...musicPlaylist];
                              newPlaylist[index].song_name = e.target.value;
                              setMusicPlaylist(newPlaylist);
                            }}
                            placeholder="Song title"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`song-artist-${index}`}>Artist</Label>
                          <Input
                            id={`song-artist-${index}`}
                            value={song.artist || ''}
                            onChange={(e) => {
                              const newPlaylist = [...musicPlaylist];
                              newPlaylist[index].artist = e.target.value;
                              setMusicPlaylist(newPlaylist);
                            }}
                            placeholder="Artist name"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMusicPlaylist([...musicPlaylist, { link: '', song_name: '', artist: '' }]);
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Song
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Songs will play sequentially. Supports direct audio files or YouTube URLs.
                </p>
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
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tags available. <Link href="/admin/tags" className="text-primary">Create one</Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

