-- Add music_url field to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS music_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS music_artist_name TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS music_song_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN articles.music_url IS 'URL to background music track for the article. If provided, music will auto-play when the article is viewed.';
COMMENT ON COLUMN articles.music_artist_name IS 'Name of the artist/composer for the background music. Used for credits.';
COMMENT ON COLUMN articles.music_song_name IS 'Name of the song/track for the background music. Used for credits.';

