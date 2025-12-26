"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArticleLinkPreview } from '@/components/article-link-preview';

interface ArticleContentRendererProps {
  htmlContent: string;
  className?: string;
}

export function ArticleContentRenderer({ htmlContent, className }: ArticleContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !contentRef.current) return;

    // Find all article links and replace them with React components
    const articleLinks = contentRef.current.querySelectorAll('a[data-article-slug]');
    
    articleLinks.forEach((link) => {
      const slug = link.getAttribute('data-article-slug');
      const text = link.textContent || '';
      
      if (slug) {
        // Create a container for the React component
        const container = document.createElement('span');
        container.className = 'article-link-container';
        
        // Replace the link with the container
        link.parentNode?.replaceChild(container, link);
        
        // Render the ArticleLinkPreview component
        const root = createRoot(container);
        root.render(
          <ArticleLinkPreview slug={slug}>
            {text}
          </ArticleLinkPreview>
        );
      }
    });
  }, [htmlContent, isClient]);

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

