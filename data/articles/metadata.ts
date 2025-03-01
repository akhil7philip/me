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
  // {
  //   id: 1,
  //   title: "consciousness",
  //   excerpt: "",
  //   category: categories[3].name,
  //   readTime: "1 min read",
  //   date: "Aug 04, 2024",
  //   image: "/images/consciousness.png",
  //   featured: false
  // },
  // {
  //   id: 2,
  //   title: "faith",
  //   excerpt: "",
  //   category: categories[3].name,
  //   readTime: "5 min read",
  //   date: "Dec 01, 2020",
  //   image: "/images/faith.jpeg",
  //   featured: false
  // },
];