"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { createBrowserClient } from '@supabase/ssr';
import { gameCategories, games, Game, GameCategoryConfig } from "@/data/mini-games/metadata";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, BookMarked, Newspaper } from "lucide-react";

const allCategory = "All";
const featuredCategory = "Featured";
const allGamesCategory = gameCategories[0].name;
const featuredGamesCategory = gameCategories[1].name;

const categoryConfigs = [
  { name: "All", icon: Newspaper },
  { name: "Featured", icon: Star },
  { name: "Technology", icon: TrendingUp },
  { name: "Reflection", icon: BookMarked },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(allCategory);
  const [activeGameCategory, setActiveGameCategory] = useState(allGamesCategory);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  async function fetchArticles() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, categories(*)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(9);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  const filteredArticles = activeCategory === allCategory
    ? articles
    : activeCategory === featuredCategory
      ? articles.filter((article: any) => article.featured)
      : articles.filter((article: any) => article.categories?.name === activeCategory);

  const filteredGames = activeGameCategory === allGamesCategory
    ? games
    : activeGameCategory === featuredGamesCategory
      ? games.filter((game: Game) => game.featured)
      : games.filter((game: Game) => game.category === activeGameCategory);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Akhil Philip</h1>
              <p className="text-muted-foreground">Read, Code, Love</p>
            </div>
            
            <div className="flex flex-col-reverse md:flex-row items-center gap-6">
              <div className="max-w-md text-center md:text-left mt-4 md:mt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Hey there! I'm a curious mind who loves exploring the intersection of technology and creativity. 
                  When I'm not coding or writing, you'll find me experimenting with new ideas or enjoying a good book, that is if I'm not helplessly binging on a new show or movie.
                  Welcome to my little corner of the internet!
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                  <a href="https://github.com/akhil7philip" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary transition-colors">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                  <a href="https://x.com/akhil7philip" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary transition-colors">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                  <a href="https://linkedin.com/in/akhilphilip/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary transition-colors">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src="/images/profile/profile.jpg" 
                  alt="Akhil Philip" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/150?text=AP";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Articles Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Blog</h2>
            <Link href="/articles">
              <Button variant="ghost" className="group">
                <span className="mr-1">View All</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Button>
            </Link>
          </div>
          <Tabs defaultValue={allCategory} className="space-y-8">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-full justify-start space-x-4 p-0 bg-transparent">
                {categoryConfigs.map((category) => (
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

            {categoryConfigs.map((category) => (
              <TabsContent key={category.name} value={category.name} className="mt-8">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-96 bg-secondary rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No articles found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <Link href={`/articles/${article.slug}`} key={article.id}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          {article.cover_image && (
                            <div className="aspect-video relative overflow-hidden">
                              <img
                                src={article.cover_image}
                                alt={article.title}
                                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="text-sm text-muted-foreground">{article.read_time}</span>
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
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Mini-Games Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Mini-Games</h2>
            <Link href="/mini-games">
              <Button variant="ghost" className="group">
                <span className="mr-1">View All</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Button>
            </Link>
          </div>
          <Tabs defaultValue={allGamesCategory} className="space-y-8">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-full justify-start space-x-4 p-0 bg-transparent">
                {gameCategories.map((category: GameCategoryConfig) => (
                  <TabsTrigger
                    key={category.name}
                    value={category.name}
                    onClick={() => setActiveGameCategory(category.name)}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2 rounded-full"
                  >
                    {category.icon && <category.icon className="w-4 h-4 mr-2" />}
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            {gameCategories.map((category: GameCategoryConfig) => (
              <TabsContent key={category.name} value={category.name} className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames.map((game) => (
                    <Link href={game.path} key={game.id}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.title}
                            className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{game.category}</span>
                            <span className="text-sm text-muted-foreground">{game.difficulty}</span>
                          </div>
                          <CardTitle className="line-clamp-2 hover:text-primary">
                            {game.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">{game.excerpt}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </main>
    </div>
  );
}