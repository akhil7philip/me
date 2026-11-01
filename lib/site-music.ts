export type Song = {
  link: string;
  song_name?: string;
  artist?: string;
};

export type MusicArticle = {
  music_playlist: Song[] | null;
};

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function createSitePlaylist(articles: MusicArticle[], random = Math.random): Song[] {
  const uniqueSongs = new Map<string, Song>();

  for (const article of articles) {
    for (const song of article.music_playlist ?? []) {
      if (song?.link) {
        uniqueSongs.set(song.link, song);
      }
    }
  }

  return shuffle(Array.from(uniqueSongs.values()), random);
}
