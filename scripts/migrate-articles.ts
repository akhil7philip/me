/**
 * Migration script to import existing markdown articles into Supabase
 * 
 * Usage: npx tsx scripts/migrate-articles.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import readingTime from 'reading-time';

// Load environment variables from .env.local
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const authorId = process.env.AUTHOR_ID || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables!');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nOptional (for admin operations):');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (for listing users)');
  console.error('  - AUTHOR_ID (to specify author directly)');
  process.exit(1);
}

// Create clients - use service role for admin operations, anon key for regular DB operations
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Import your existing articles metadata
const existingArticles = [
  {
    id: 1,
    title: "consciousness - a grand mystery",
    excerpt: "",
    category: "Reflection",
    readTime: "1 min read",
    date: "Aug 04, 2024",
    image: "/images/consciousness.png",
    featured: false,
    filename: "1.md"
  },
  // Add more articles here from your metadata
];

async function convertMarkdownToTiptap(markdown: string) {
  // Simple conversion - you might want to use a proper markdown parser
  // For now, we'll store it as plain text in a paragraph
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: markdown,
          },
        ],
      },
    ],
  };
}

async function migrateArticles() {
  console.log('Starting migration...\n');

  for (const article of existingArticles) {
    try {
      console.log(`Migrating: ${article.title}`);

      // Read markdown file
      const filePath = path.join(process.cwd(), 'data', 'articles', article.filename);
      const content = await fs.readFile(filePath, 'utf8');

      // Convert to Tiptap format
      const tiptapContent = await convertMarkdownToTiptap(content);

      // Generate slug
      const slug = slugify(article.title, { lower: true, strict: true });

      // Calculate reading time
      const stats = readingTime(content);

      // Find or create category
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', article.category)
        .single();

      // Get author ID
      let finalAuthorId = authorId;
      
      if (!finalAuthorId) {
        // Try to get author from admin API if service role key is available
        if (supabaseAdmin) {
          try {
            const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
            if (usersError) {
              console.warn(`Warning: Could not list users: ${usersError.message}`);
            } else if (users?.users && users.users.length > 0) {
              finalAuthorId = users.users[0].id;
              console.log(`Using author ID: ${finalAuthorId}`);
            }
          } catch (error: any) {
            console.warn(`Warning: Could not fetch users: ${error.message}`);
          }
        }
        
        if (!finalAuthorId) {
          console.error('Error: No author ID found. Please either:');
          console.error('  1. Set AUTHOR_ID in .env.local, or');
          console.error('  2. Set SUPABASE_SERVICE_ROLE_KEY to auto-detect users');
          continue;
        }
      }

      // Insert article
      const { data: insertedArticle, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug,
          content: tiptapContent,
          excerpt: article.excerpt || `Read about ${article.title}`,
          cover_image: article.image,
          author_id: finalAuthorId,
          category_id: category?.id || null,
          status: 'published',
          published_at: new Date(article.date).toISOString(),
          featured: article.featured,
          read_time: stats.text,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating ${article.title}:`, error.message);
        continue;
      }

      console.log(`✓ Successfully migrated: ${article.title}\n`);
    } catch (error: any) {
      console.error(`Error processing ${article.title}:`, error.message);
    }
  }

  console.log('Migration complete!');
}

// Run migration
migrateArticles().catch(console.error);

