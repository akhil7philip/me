import { BookOpen, Gamepad2, Brain } from "lucide-react";

export interface Game {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  difficulty: string;
  image: string;
  path: string;
  featured: boolean;
}

export interface GameCategoryConfig {
  name: string;
  icon: any;
}

export const gameCategories: GameCategoryConfig[] = [
  { name: "All", icon: Gamepad2 },
  { name: "Featured", icon: Gamepad2 },
  { name: "Language", icon: BookOpen },
  { name: "Brain Teasers", icon: Brain },
];

export const games: Game[] = [
  {
    id: 1,
    title: "Hindi Speed Reading",
    excerpt: "Test and improve your Hindi Speed Reading with engaging paragraphs and stories. Track your progress and challenge yourself to read faster.",
    category: gameCategories[2].name, // Language Games
    difficulty: "Beginner to Intermediate",
    image: "/images/hindi-reading.svg",
    path: "/mini-games/hindi-reading",
    featured: true
  },
  {
    id: 2,
    title: "Cows and Bulls",
    excerpt: "A multiplayer number guessing game where players take turns to guess a secret number using Bulls and Cows as clues.",
    category: gameCategories[3].name, // Brain Teasers
    difficulty: "Easy to Hard",
    image: "/images/cows-and-bulls.svg", 
    path: "/mini-games/cows-and-bulls",
    featured: true
  }
  // Add more games here in the future
]; 