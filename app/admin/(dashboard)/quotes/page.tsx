"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Quote } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [source, setSource] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quotes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function openNewDialog() {
    setEditingQuote(null);
    setQuoteText('');
    setSource('');
    setDialogOpen(true);
  }

  function openEditDialog(quote: Quote) {
    setEditingQuote(quote);
    setQuoteText(quote.quote_text);
    setSource(quote.source);
    setDialogOpen(true);
  }

  async function saveQuote() {
    if (!quoteText.trim()) {
      toast({
        title: 'Error',
        description: 'Quote text is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const quoteData = {
        quote_text: quoteText.trim(),
        source: source.trim() || 'Anonymous',
      };

      if (editingQuote) {
        const { error } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', editingQuote.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Quote updated successfully',
        });
      } else {
        const { error } = await supabase.from('quotes').insert([quoteData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Quote added successfully',
        });
      }

      setDialogOpen(false);
      fetchQuotes();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingQuote ? 'update' : 'create'} quote`,
        variant: 'destructive',
      });
    }
  }

  async function deleteQuote(id: string) {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Quote deleted successfully',
      });

      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quote',
        variant: 'destructive',
      });
    }
  }

  const filteredQuotes = quotes.filter((quote) =>
    quote.quote_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">Manage your quotes collection</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
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
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No quotes found</p>
              <Button className="mt-4" onClick={openNewDialog}>
                Add your first quote
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/3">Quote</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">
                      <p className="line-clamp-2">{quote.quote_text}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quote.source}
                    </TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(quote)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteQuote(quote.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? 'Edit Quote' : 'Add New Quote'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote Text *</Label>
              <Textarea
                id="quote-text"
                placeholder="Enter the quote..."
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="Anonymous (default if empty)"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use "Anonymous" as default
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuote}>
              {editingQuote ? 'Update' : 'Create'} Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

