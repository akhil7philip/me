-- Create the game_sessions table for Cows and Bulls
-- DROP TABLE IF EXISTS game_sessions;

CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY,
  secret_number TEXT NOT NULL,
  players JSONB NOT NULL,
  current_player_index INTEGER NOT NULL DEFAULT 0,
  digit_length INTEGER NOT NULL DEFAULT 4,
  winner JSONB NOT NULL DEFAULT '[]',
  game_started BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up real-time capabilities for the game_sessions table
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public access to the game_sessions table (for demo purposes)
-- In a production environment, you would want to set up more restrictive policies
CREATE POLICY "Public access to game_sessions" ON game_sessions
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Enable real-time subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions; 