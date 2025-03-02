"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categories, articles, Article, CategoryConfig } from "@/data/articles/metadata";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ArticlesHub() {
  const [activeCategory, setActiveCategory] = useState(categories[0].name);

  const filteredArticles = activeCategory === categories[0].name
    ? articles
    : activeCategory === categories[1].name
      ? articles.filter((article: Article) => article.featured)
      : articles.filter((article: Article) => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-8 flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="sr-only">Back to Home</span>
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Blog</h1>
            <p className="text-muted-foreground">Read, Learn, Grow</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={categories[0].name} className="space-y-8">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex w-full justify-start space-x-4 p-0 bg-transparent">
              {categories.map((category: CategoryConfig) => (
                <TabsTrigger
                  key={category.name}
                  value={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2 rounded-full"
                >
                  {category.icon && <category.icon className="w-4 h-4 mr-2" />}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>

          {categories.map((category: CategoryConfig) => (
            <TabsContent key={category.name} value={category.name} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article: Article) => (
                  <Link href={`/articles/${article.id}`} key={article.id}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{article.date}</span>
                          <span className="text-sm text-muted-foreground">{article.readTime}</span>
                        </div>
                        <CardTitle className="line-clamp-2 hover:text-primary">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3">{article.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
} 