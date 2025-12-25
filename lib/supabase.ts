import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Types for Cows and Bulls game
export type Player = {
  id: string;
  name: string;
  ready: boolean;
  active?: boolean; // Optional for backward compatibility, defaults to true
  guesses: {
    guess: string;
    bulls: number;
    cows: number;
  }[];
};

export type GameSession = {
  id: string;
  secret_number: string;
  players: Player[];
  current_player_index: number;
  digit_length: number;
  winner: Array<{playerId: string, guessCount: number}> | [];
  created_at: string;
  game_started: boolean;
};

// Blog database types
export type Article = {
  id: string;
  slug: string;
  title: string;
  content: any; // Tiptap JSON
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  category_id: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  read_time: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  article_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  author_avatar: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
  updated_at: string;
};

export type Reaction = {
  id: string;
  article_id: string;
  reaction_type: 'like' | 'love' | 'fire' | 'clap' | 'insightful';
  user_identifier: string;
  created_at: string;
};

export type AuthorProfile = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  created_at: string;
  updated_at: string;
}; 