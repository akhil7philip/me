"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Heart, 
  Flame, 
  Sparkles, 
  ThumbsUp,
  Eye,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
} from 'lucide-react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Footnote } from '@/components/admin/footnote-extension';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from 'react-share';
import { ArticleMusicPlayer } from '@/components/article-music-player';

const lowlight = createLowlight(common);

type ReactionType = 'like' | 'love' | 'fire' | 'clap' | 'insightful';

const reactionIcons: Record<ReactionType, any> = {
  like: ThumbsUp,
  love: Heart,
  fire: Flame,
  clap: Sparkles,
  insightful: Sparkles,
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.id as string;

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({
    like: 0,
    love: 0,
    fire: 0,
    clap: 0,
    insightful: 0,
  });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  
  // Comment form
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });

  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (slug) {
      fetchArticle();
      trackView();
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchArticle() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, categories(*), article_tags(tags(*))')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      setArticle(data);
      fetchComments(data.id);
      fetchReactions(data.id);
      fetchRelatedArticles(data);
      checkBookmark(data.id);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Error',
        description: 'Article not found',
        variant: 'destructive',
      });
      router.push('/articles');
    } finally {
      setLoading(false);
    }
  }

  async function trackView() {
    try {
      const { data: existing } = await supabase
        .from('article_views')
        .select('id')
        .eq('viewer_ip', 'anonymous')
        .single();

      if (!existing) {
        await supabase.from('article_views').insert({
          article_id: article?.id,
          viewer_ip: 'anonymous',
        });
      }
    } catch (error) {
      console.log('View tracking error:', error);
    }
  }

  async function fetchComments(articleId: string) {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (data) setComments(data);
  }

  async function fetchReactions(articleId: string) {
    const { data } = await supabase
      .from('reactions')
      .select('*')
      .eq('article_id', articleId);

    if (data) {
      const counts: Record<ReactionType, number> = {
        like: 0,
        love: 0,
        fire: 0,
        clap: 0,
        insightful: 0,
      };

      data.forEach((r: any) => {
        counts[r.reaction_type as ReactionType]++;
      });

      setReactions(counts);

      // Check user's reactions (using local storage as identifier)
      const userIdentifier = localStorage.getItem('user_id') || 'anonymous';
      const userReacts = data
        .filter((r: any) => r.user_identifier === userIdentifier)
        .map((r: any) => r.reaction_type);
      setUserReactions(userReacts);
    }
  }

  async function fetchRelatedArticles(currentArticle: any) {
    const { data } = await supabase
      .from('articles')
      .select('*, categories(*)')
      .eq('status', 'published')
      .neq('id', currentArticle.id)
      .eq('category_id', currentArticle.category_id)
      .limit(3);

    if (data) setRelatedArticles(data);
  }

  async function checkBookmark(articleId: string) {
    const userIdentifier = localStorage.getItem('user_id') || 'anonymous';
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_identifier', userIdentifier)
      .single();

    setIsBookmarked(!!data);
  }

  async function toggleReaction(type: ReactionType) {
    if (!article) return;

    const userIdentifier = localStorage.getItem('user_id') || 
      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!localStorage.getItem('user_id')) {
      localStorage.setItem('user_id', userIdentifier);
    }

    try {
      if (userReactions.includes(type)) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('article_id', article.id)
          .eq('reaction_type', type)
          .eq('user_identifier', userIdentifier);

        setUserReactions(prev => prev.filter(r => r !== type));
        setReactions(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
      } else {
        // Add reaction
        await supabase.from('reactions').insert({
          article_id: article.id,
          reaction_type: type,
          user_identifier: userIdentifier,
        });

        setUserReactions(prev => [...prev, type]);
        setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  }

  async function toggleBookmark() {
    if (!article) return;

    const userIdentifier = localStorage.getItem('user_id') || 'anonymous';

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('article_id', article.id)
          .eq('user_identifier', userIdentifier);

        setIsBookmarked(false);
        toast({ title: 'Removed from bookmarks' });
      } else {
        await supabase.from('bookmarks').insert({
          article_id: article.id,
          user_identifier: userIdentifier,
        });

        setIsBookmarked(true);
        toast({ title: 'Added to bookmarks' });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!article) return;

    try {
      await supabase.from('comments').insert({
        article_id: article.id,
        ...commentForm,
      });

      toast({
        title: 'Comment submitted',
        description: 'Your comment is pending moderation',
      });

      setCommentForm({ author_name: '', author_email: '', content: '' });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit comment',
        variant: 'destructive',
      });
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied to clipboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) return null;

  const htmlContent = generateHTML(article.content, [
    StarterKit.configure({ codeBlock: false }),
    Underline,
    LinkExt,
    Image,
    Table,
    TableRow,
    TableHeader,
    TableCell,
    TextAlign,
    Typography,
    CodeBlockLowlight.configure({ lowlight }),
    Footnote,
  ]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-secondary z-50">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Music Player */}
      <ArticleMusicPlayer 
        musicPlaylist={article.music_playlist}
      />

      <div className={`container mx-auto px-4 py-8 max-w-4xl ${article.music_url ? 'pt-14' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <Link href="/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <article className="space-y-6">
          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {article.featured && <Badge>Featured</Badge>}
              {article.categories && (
                <Badge variant="outline">{article.categories.name}</Badge>
              )}
              {article.article_tags?.map((at: any) => (
                at.tags && (
                  <Badge
                    key={at.tags.id}
                    variant="secondary"
                    style={{ backgroundColor: at.tags.color + '20' }}
                  >
                    {at.tags.name}
                  </Badge>
                )
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold">{article.title}</h1>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground">{article.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
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
          </div>

          <Separator />

          {/* Article Content */}
          <div
            className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <Separator />

          {/* Reactions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium mr-2">React:</span>
            {(Object.keys(reactions) as ReactionType[]).map((type) => {
              const Icon = reactionIcons[type];
              const isActive = userReactions.includes(type);
              return (
                <Button
                  key={type}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleReaction(type)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {reactions[type]}
                </Button>
              );
            })}
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={toggleBookmark}
              className="ml-auto gap-2"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
          </div>

          {/* Social Share */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share this article
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <TwitterShareButton url={shareUrl} title={article.title}>
                <Button variant="outline" size="sm">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              </TwitterShareButton>
              <LinkedinShareButton url={shareUrl} title={article.title}>
                <Button variant="outline" size="sm">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </LinkedinShareButton>
              <FacebookShareButton url={shareUrl}>
                <Button variant="outline" size="sm">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              </FacebookShareButton>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={commentForm.author_name}
                      onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={commentForm.author_email}
                      onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="comment">Comment *</Label>
                  <Textarea
                    id="comment"
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit">Post Comment</Button>
              </form>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.author_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={`/articles/${related.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        {related.cover_image && (
                          <img
                            src={related.cover_image}
                            alt={related.title}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                        )}
                        <CardHeader>
                          <CardTitle className="text-sm line-clamp-2">{related.title}</CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </article>
      </div>
    </div>
  );
}  