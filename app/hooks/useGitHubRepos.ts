'use client';

import { useEffect, useState } from 'react';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
}

const CACHE_KEY = 'github-repos-cache';
const CACHE_TTL = 3600000;

interface CacheData {
  repos: GitHubRepo[];
  timestamp: number;
}

export function useGitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data: CacheData = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_TTL) {
            setRepos(data.repos);
            setLoading(false);
            return;
          }
        }

        const response = await fetch(
          'https://api.github.com/users/akhil7philip/repos?sort=updated&per_page=6'
        );

        if (!response.ok) {
          throw new Error('GitHub API error');
        }

        const data: GitHubRepo[] = await response.json();

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ repos: data, timestamp: Date.now() })
        );

        setRepos(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  return { repos, loading, error };
}
