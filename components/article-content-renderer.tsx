"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ArticleLinkPreview } from '@/components/article-link-preview';

interface ArticleContentRendererProps {
  htmlContent: string;
  className?: string;
}

export function ArticleContentRenderer({ htmlContent, className }: ArticleContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const rootsRef = useRef<Map<Element, Root>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !contentRef.current) return;

    // Clean up previous roots
    rootsRef.current.forEach((root) => {
      try {
        root.unmount();
      } catch (e) {
        // Ignore unmount errors
      }
    });
    rootsRef.current.clear();

    // Use a small delay to ensure DOM is ready after innerHTML is set
    const timeoutId = setTimeout(() => {
      if (!contentRef.current) return;

      // Find all links that point to articles and replace them with React components
      const allLinks = Array.from(contentRef.current.querySelectorAll('a[href]'));
      
      allLinks.forEach((link) => {
        // Skip if already processed
        if (link.closest('.article-link-container') || link.hasAttribute('data-processed')) {
          return;
        }
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Check if this is a link to an article (matches /articles/[slug] pattern)
        const articleMatch = href.match(/^\/articles\/([^\/\?#]+)/);
        if (!articleMatch) return;
        
        const slug = articleMatch[1];
        const text = link.textContent || link.innerText || '';
        
        // Skip if slug is invalid
        if (!slug || slug === 'undefined' || slug === 'null') {
          return;
        }
        
        // Mark as processed to avoid double processing
        link.setAttribute('data-processed', 'true');
        
        if (slug && link.parentNode) {
          let container: HTMLSpanElement | null = null;
          try {
            // Create a container for the React component
            container = document.createElement('span');
            container.className = 'article-link-container';
            container.setAttribute('data-article-slug', slug);
            
            // Replace the link with the container
            link.parentNode.replaceChild(container, link);
            
            // Render the ArticleLinkPreview component
            const root = createRoot(container);
            root.render(
              <ArticleLinkPreview slug={slug}>
                {text}
              </ArticleLinkPreview>
            );
            
            // Store the root for cleanup
            rootsRef.current.set(container, root);
          } catch (error) {
            console.error('Error replacing article link:', error);
            // If replacement fails, restore the original link
            if (container && container.parentNode && link.parentNode) {
              container.parentNode.replaceChild(link, container);
            }
          }
        }
      });
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup on unmount
      rootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch (e) {
          // Ignore unmount errors
        }
      });
      rootsRef.current.clear();
    };
  }, [htmlContent, isClient]);

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

