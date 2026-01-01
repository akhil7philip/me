"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { Quote } from "@/lib/supabase";
import { SectionNavigation } from "@/components/section-navigation";
import { PageContent } from "@/components/page-content";
import { QuotesBook } from "@/components/quotes-book";
import { Quote as QuoteIcon } from "lucide-react";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SectionNavigation />
      <div className="flex-1 ml-24">
        <PageContent>
          <div className="max-w-6xl mx-auto px-12 py-12">
            {quotes.length === 0 && !loading ? (
              <div className="text-center py-20">
                <QuoteIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">Waiting for inspiration</p>
              </div>
            ) : (
              <QuotesBook quotes={quotes} loading={loading} />
            )}
          </div>
        </PageContent>
      </div>
    </div>
  );
}

