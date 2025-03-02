import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  winner: string | null;
  created_at: string;
  game_started: boolean;
}; 