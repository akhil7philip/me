"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { Quote } from "@/lib/supabase";
import { SectionNavigation } from "@/components/section-navigation";
import { PageContent } from "@/components/page-content";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <SectionNavigation />
        <div className="flex-1 ml-24">
          <PageContent>
            <div className="max-w-4xl mx-auto px-12 py-12">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          </PageContent>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SectionNavigation />
      <div className="flex-1 ml-24">
        <PageContent>
          <div className="max-w-4xl mx-auto px-12 py-12">
            {/* Header */}
            <div className="mb-16 text-center">
              <h1 className="text-5xl font-bold text-primary mb-4">Words</h1>
              <p className="text-xl text-muted-foreground">
                To inspire. To provoke.
              </p>
            </div>

            {/* Quotes Grid */}
            {quotes.length === 0 ? (
              <div className="text-center py-20">
                <QuoteIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">Waiting for inspiration</p>
              </div>
            ) : (
              <div className="space-y-8">
                {quotes.map((quote, index) => (
                  <div
                    key={quote.id}
                    className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="relative p-8 md:p-12 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                      {/* Quote Icon */}
                      <div className="absolute top-6 left-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                        <QuoteIcon className="w-12 h-12 text-primary" />
                      </div>

                      {/* Quote Text */}
                      <blockquote className="relative z-10">
                        <p className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground mb-6 pl-8">
                          "{quote.quote_text}"
                        </p>
                      </blockquote>

                      {/* Source */}
                      <div className="flex items-center justify-end pt-4 border-t border-border/30">
                        <p className="text-sm md:text-base text-muted-foreground font-medium italic">
                          — {quote.source}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageContent>
      </div>
    </div>
  );
}

