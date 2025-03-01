"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { categories, articles, Article, CategoryConfig } from "@/data/articles/metadata";

const allCategory = categories[0].name;
const featuredCategory = categories[1].name;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(featuredCategory);

  const filteredArticles = activeCategory === allCategory
    ? articles
    : activeCategory === featuredCategory
      ? articles.filter((article: Article) => article.featured)
      : articles.filter((article: Article) => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Akhil Philip</h1>
          <p className="text-muted-foreground">Read, Code, Love</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={featuredCategory} className="space-y-8">
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
                {filteredArticles.map((article) => (
                  <Link href={`/articles/${article.id}`} key={article.id}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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