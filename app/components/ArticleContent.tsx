"use client";

import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ArticleContent({ article }: { article: any }) {
  
  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <main className="container mx-auto px-4 -mt-32 relative">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 hover:bg-background/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to articles
            </Button>
          </Link>

          <div className="bg-card rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">{article.date}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{article.readTime}</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {article.category}
                </span>
              </div>
            </div>

            <article className="prose prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
} 