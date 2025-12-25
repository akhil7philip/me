"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import slugify from 'slugify';

type Series = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
};

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    cover_image: '',
  });

  const { toast } = useToast();
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
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSeries(data || []);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSeries) {
        const { error } = await supabase
          .from('series')
          .update(formData)
          .eq('id', editingSeries.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Series updated successfully',
        });
      } else {
        const { error } = await supabase.from('series').insert(formData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Series created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchSeries();
    } catch (error: any) {
      console.error('Error saving series:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save series',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this series?')) return;

    try {
      const { error } = await supabase.from('series').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Series deleted successfully',
      });

      fetchSeries();
    } catch (error: any) {
      console.error('Error deleting series:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete series',
        variant: 'destructive',
      });
    }
  };

  const openDialog = (item?: Series) => {
    if (item) {
      setEditingSeries(item);
      setFormData({
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        cover_image: item.cover_image || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSeries(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      cover_image: '',
    });
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name, { lower: true, strict: true }),
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Series</h1>
          <p className="text-muted-foreground">Group related articles into series</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              New Series
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSeries ? 'Edit Series' : 'Create Series'}
                </DialogTitle>
                <DialogDescription>
                  {editingSeries
                    ? 'Update series details'
                    : 'Create a new article series'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <Input
                    id="cover_image"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingSeries ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Series ({series.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary rounded animate-pulse"></div>
              ))}
            </div>
          ) : series.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No series yet</p>
              <Button className="mt-4" onClick={() => openDialog()}>
                Create your first series
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {series.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {item.description || item.slug}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {item.cover_image && (
                    <CardContent>
                      <img
                        src={item.cover_image}
                        alt={item.name}
                        className="rounded-lg w-full h-32 object-cover"
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

