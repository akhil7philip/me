"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ArticleMusicPlayer } from '@/components/article-music-player';

type Song = {
  link: string;
  song_name?: string;
  artist?: string;
};

type MusicArticle = {
  music_playlist: Song[] | null;
};

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function SiteMusicPlayer() {
  const pathname = usePathname();
  const [playlist, setPlaylist] = useState<Song[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadPlaylist() {
      const { data, error } = await supabase
        .from('articles')
        .select('music_playlist')
        .eq('status', 'published');

      if (error) {
        console.error('Unable to load the site music playlist:', error);
        return;
      }

      const uniqueSongs = new Map<string, Song>();

      for (const article of (data ?? []) as MusicArticle[]) {
        for (const song of article.music_playlist ?? []) {
          if (song?.link) {
            uniqueSongs.set(song.link, song);
          }
        }
      }

      setPlaylist(shuffle(Array.from(uniqueSongs.values())));
    }

    loadPlaylist();
  }, []);

  // The admin is a work area, not part of the public listening experience.
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <ArticleMusicPlayer musicPlaylist={playlist} />;
}
