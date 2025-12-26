-- Add music_playlist field to articles table (JSON array of songs)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS music_playlist JSONB DEFAULT '[]'::jsonb;

-- Migrate existing music_url, music_artist_name, music_song_name to music_playlist if they exist
DO $$
BEGIN
  -- Check if old columns exist and migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'music_url'
  ) THEN
    -- Migrate single song to playlist format
    UPDATE articles 
    SET music_playlist = CASE
      WHEN music_url IS NOT NULL THEN
        jsonb_build_array(
          jsonb_build_object(
            'link', music_url,
            'song_name', COALESCE(music_song_name, ''),
            'artist', COALESCE(music_artist_name, '')
          )
        )
      ELSE '[]'::jsonb
    END
    WHERE music_url IS NOT NULL;
    
    -- Drop old columns after migration
    ALTER TABLE articles DROP COLUMN IF EXISTS music_url;
    ALTER TABLE articles DROP COLUMN IF EXISTS music_artist_name;
    ALTER TABLE articles DROP COLUMN IF EXISTS music_song_name;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN articles.music_playlist IS 'JSON array of background music tracks. Each track has: link (URL), song_name, and artist. Songs play sequentially.';

