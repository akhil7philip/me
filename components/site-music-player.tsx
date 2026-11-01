"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ArticleMusicPlayer } from '@/components/article-music-player';
import { createSitePlaylist, type MusicArticle, type Song } from '@/lib/site-music';

export function SiteMusicPlayer() {
  const pathname = usePathname();
  const [playlist, setPlaylist] = useState<Song[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
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

      setPlaylist(createSitePlaylist((data ?? []) as MusicArticle[]));
    }

    loadPlaylist();
  }, []);

  // The admin is a work area, not part of the public listening experience.
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <ArticleMusicPlayer musicPlaylist={playlist} />;
}
