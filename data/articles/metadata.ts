import { Star, TrendingUp, BookMarked, Newspaper } from "lucide-react";

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  featured: boolean;
}

export interface CategoryConfig {
  name: string;
  icon: any;
}

export const categories: CategoryConfig[] = [
  { name: "All", icon: Newspaper },
  { name: "Featured", icon: Star },
  { name: "Technology", icon: TrendingUp },
  { name: "Reflection", icon: BookMarked },
];

export const articles: Article[] = [
  // Articles are now fetched from Supabase database
  // This array is kept for type compatibility but should remain empty
];