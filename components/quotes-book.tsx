"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Quote } from "@/lib/supabase";
import { Bookmark, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotesBookProps {
  quotes: Quote[];
  loading: boolean;
}

const BOOKMARK_STORAGE_KEY = "quotes_bookmarks";

export function QuotesBook({ quotes, loading }: QuotesBookProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [bookmarkedQuotes, setBookmarkedQuotes] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [shuffledQuotes, setShuffledQuotes] = useState<Quote[]>([]);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fading-out' | 'fading-in'>('idle');
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [pendingQuoteIndex, setPendingQuoteIndex] = useState<number | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (stored) {
        setBookmarkedQuotes(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  }, []);

  // Shuffle quotes on mount
  useEffect(() => {
    if (quotes.length > 0) {
      const shuffled = [...quotes].sort(() => Math.random() - 0.5);
      setShuffledQuotes(shuffled);
    }
  }, [quotes]);

  const saveBookmarks = useCallback((newBookmarks: Set<string>) => {
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(Array.from(newBookmarks)));
      setBookmarkedQuotes(newBookmarks);
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
  }, []);

  const toggleBookmark = useCallback((quoteId: string) => {
    const newBookmarks = new Set(bookmarkedQuotes);
    if (newBookmarks.has(quoteId)) {
      newBookmarks.delete(quoteId);
    } else {
      newBookmarks.add(quoteId);
    }
    saveBookmarks(newBookmarks);
  }, [bookmarkedQuotes, saveBookmarks]);

  const handlePageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (transitionPhase !== 'idle') return;

    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Top 20% for bookmarking
    if (clickY < height * 0.2) {
      const currentQuote = shuffledQuotes[currentQuoteIndex];
      if (currentQuote) {
        setIsBookmarking(true);
        toggleBookmark(currentQuote.id);
        setTimeout(() => setIsBookmarking(false), 600);
      }
      return;
    }

    // Left side for previous, right side for next
    const nextIndex = clickX < width / 2
      ? (currentQuoteIndex > 0 ? currentQuoteIndex - 1 : shuffledQuotes.length - 1)
      : (currentQuoteIndex < shuffledQuotes.length - 1 ? currentQuoteIndex + 1 : 0);
    
    setPendingQuoteIndex(nextIndex);
    
    // Step 1: Fade out (300ms)
    setTransitionPhase('fading-out');
    
    // Step 2: After fade-out completes, change the text
    setTimeout(() => {
      setCurrentQuoteIndex(nextIndex);
      setPendingQuoteIndex(null);
      
      // Step 3: Fade in (300ms) - use requestAnimationFrame to ensure DOM update
      requestAnimationFrame(() => {
        setTransitionPhase('fading-in');
        setTimeout(() => {
          setTransitionPhase('idle');
        }, 300);
      });
    }, 300);
  }, [transitionPhase, currentQuoteIndex, shuffledQuotes, toggleBookmark]);

  const navigateToQuote = useCallback((index: number) => {
    if (transitionPhase !== 'idle') return;
    
    setShowBookmarks(false);
    setPendingQuoteIndex(index);
    
    // Step 1: Fade out (300ms)
    setTransitionPhase('fading-out');
    
    // Step 2: After fade-out completes, change the text
    setTimeout(() => {
      setCurrentQuoteIndex(index);
      setPendingQuoteIndex(null);
      
      // Step 3: Fade in (300ms) - use requestAnimationFrame to ensure DOM update
      requestAnimationFrame(() => {
        setTransitionPhase('fading-in');
        setTimeout(() => {
          setTransitionPhase('idle');
        }, 300);
      });
    }, 300);
  }, [transitionPhase]);

  // Keyboard navigation
  useEffect(() => {
    if (showBookmarks) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (transitionPhase !== 'idle') return;

      switch (e.key) {
        case 'ArrowLeft': {
          const nextIndex = currentQuoteIndex > 0 ? currentQuoteIndex - 1 : shuffledQuotes.length - 1;
          setPendingQuoteIndex(nextIndex);
          
          // Step 1: Fade out (300ms)
          setTransitionPhase('fading-out');
          
          // Step 2: After fade-out completes, change the text
          setTimeout(() => {
            setCurrentQuoteIndex(nextIndex);
            setPendingQuoteIndex(null);
            
            // Step 3: Fade in (300ms) - use requestAnimationFrame to ensure DOM update
            requestAnimationFrame(() => {
              setTransitionPhase('fading-in');
              setTimeout(() => {
                setTransitionPhase('idle');
              }, 300);
            });
          }, 300);
          break;
        }
        case 'ArrowRight': {
          const nextIndex = currentQuoteIndex < shuffledQuotes.length - 1 ? currentQuoteIndex + 1 : 0;
          setPendingQuoteIndex(nextIndex);
          
          // Step 1: Fade out (300ms)
          setTransitionPhase('fading-out');
          
          // Step 2: After fade-out completes, change the text
          setTimeout(() => {
            setCurrentQuoteIndex(nextIndex);
            setPendingQuoteIndex(null);
            
            // Step 3: Fade in (300ms) - use requestAnimationFrame to ensure DOM update
            requestAnimationFrame(() => {
              setTransitionPhase('fading-in');
              setTimeout(() => {
                setTransitionPhase('idle');
              }, 300);
            });
          }, 300);
          break;
        }
        case 'b':
        case 'B':
          const currentQuote = shuffledQuotes[currentQuoteIndex];
          if (currentQuote) {
            setIsBookmarking(true);
            toggleBookmark(currentQuote.id);
            setTimeout(() => setIsBookmarking(false), 600);
          }
          break;
        case 'Escape':
          if (showBookmarks) {
            setShowBookmarks(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showBookmarks, transitionPhase, currentQuoteIndex, shuffledQuotes, toggleBookmark]);

  const getBookmarkedQuotesList = useCallback(() => {
    return shuffledQuotes.filter((quote) => bookmarkedQuotes.has(quote.id));
  }, [shuffledQuotes, bookmarkedQuotes]);

  if (loading || shuffledQuotes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuote = shuffledQuotes[currentQuoteIndex];
  const isBookmarked = currentQuote ? bookmarkedQuotes.has(currentQuote.id) : false;
  const bookmarkedList = getBookmarkedQuotesList();

  return (
    <div className="relative w-full min-h-[80vh] flex items-center justify-center">
      {/* Bookmarks View */}
      {showBookmarks ? (
            <div className="w-full max-w-4xl mx-auto px-8 py-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Bookmarked Quotes</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowBookmarks(false)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
              {bookmarkedList.length === 0 ? (
                <div className="text-center py-20">
                  <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">No bookmarked quotes yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookmarkedList.map((quote, index) => (
                    <div
                      key={quote.id}
                      className="relative p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg cursor-pointer"
                      onClick={() => {
                        const originalIndex = shuffledQuotes.findIndex((q) => q.id === quote.id);
                        if (originalIndex !== -1) {
                          navigateToQuote(originalIndex);
                        }
                      }}
                    >
                      <div className="absolute top-6 right-6">
                        <Bookmark className={`w-6 h-6 ${bookmarkedQuotes.has(quote.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <blockquote className="pr-12">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground mb-4">
                          "{quote.quote_text}"
                        </p>
                        <p className="text-sm text-muted-foreground font-medium italic text-right">
                          — {quote.source}
                        </p>
                      </blockquote>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Book Page View */
            <div
              ref={bookRef}
              className="relative w-full max-w-4xl mx-auto cursor-pointer select-none"
              onClick={handlePageClick}
            >
              {/* Book Page */}
              <div
                className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-amber-950/20 dark:via-card dark:to-amber-950/20 rounded-lg shadow-2xl p-12 md:p-16 min-h-[600px] flex flex-col transition-opacity duration-300"
                style={{
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
                  opacity: transitionPhase === 'fading-out' ? 0 : transitionPhase === 'fading-in' ? 1 : 1,
                }}
              >
                {/* Bookmark Indicator at Top */}
                <div 
                  className={`absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-all duration-300 ${
                    isBookmarking ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div className="h-1 w-16 bg-amber-600/30 rounded-full"></div>
                  <div className={`transition-all duration-300 ${isBookmarking ? 'animate-pulse' : ''}`}>
                    <Bookmark 
                      className={`w-4 h-4 transition-all duration-300 ${
                        isBookmarked 
                          ? 'fill-amber-600 text-amber-600 scale-110' 
                          : 'text-amber-600/30'
                      }`} 
                    />
                  </div>
                  <div className="h-1 w-16 bg-amber-600/30 rounded-full"></div>
                </div>
                
                {/* Bookmark Fold Effect */}
                {isBookmarking && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-24 pointer-events-none animate-bookmark-fold"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(217, 119, 6, 0.3) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 15%, 50% 25%, 0 15%)',
                      transform: 'perspective(500px) rotateX(-5deg)',
                      transformOrigin: 'top center',
                    }}
                  />
                )}

                {/* Clickable Areas Indicator */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity">
                    <ChevronLeft className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity">
                    <ChevronRight className="w-16 h-16 text-muted-foreground" />
                  </div>
                </div>

                {/* Quote Content */}
                {currentQuote && (
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <blockquote className="text-center">
                      <p className="text-3xl md:text-4xl lg:text-5xl font-serif leading-relaxed text-foreground mb-8 px-4">
                        "{currentQuote.quote_text}"
                      </p>
                      <div className="flex items-center justify-center pt-8 border-t border-border/30">
                        <p className="text-lg md:text-xl text-muted-foreground font-medium italic">
                          — {currentQuote.source}
                        </p>
                      </div>
                    </blockquote>
                  </div>
                )}

                {/* Page Number */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                  {currentQuoteIndex + 1} / {shuffledQuotes.length}
                </div>
              </div>

              {/* Navigation Hints */}
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bookmarks Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowBookmarks(true)}
                  className="gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  View Bookmarks ({bookmarkedList.length})
                </Button>
              </div>
            </div>
          )}
    </div>
  );
}

