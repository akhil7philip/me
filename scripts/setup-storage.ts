#!/usr/bin/env tsx
/**
 * Setup script to create the 'media' storage bucket in Supabase
 * 
 * This script requires:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SECRET_KEY (for admin operations)
 * 
 * Run with: npx tsx scripts/setup-storage.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SECRET_KEY');
  console.error('\nPlease add these to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...\n');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const mediaBucket = buckets?.find((b) => b.name === 'media');

    if (mediaBucket) {
      console.log('✅ Bucket "media" already exists');
    } else {
      // Create the bucket
      console.log('📦 Creating bucket "media"...');
      const { data: bucket, error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*'],
      });

      if (createError) {
        throw createError;
      }

      console.log('✅ Bucket "media" created successfully');
    }

    // Set up storage policies
    console.log('\n🔒 Storage policies need to be set up manually.');
    console.log('   Prefer running supabase/migrations/20261101_storage_media_policies.sql.');
    console.log('   It is shown below for convenience:\n');
    
    const policiesSQL = `
-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read media objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload media to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update media in their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete media in their folder" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read media objects"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

-- Limit authenticated users to their own <user-id>/ folder
CREATE POLICY "Users can upload media to their folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users can update media in their folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users can delete media in their folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
    `.trim();

    console.log('='.repeat(60));
    console.log(policiesSQL);
    console.log('='.repeat(60));
    console.log('\n✨ Bucket created successfully!');
    console.log('📝 Next step: Run the SQL above in your Supabase SQL Editor');
  } catch (error: any) {
    console.error('\n❌ Error setting up storage:', error.message);
    
    if (error.message?.includes('permission') || error.message?.includes('policy')) {
      console.error('\n💡 Tip: You may need to set up policies manually:');
      console.error('   1. Go to your Supabase dashboard');
      console.error('   2. Navigate to Storage > Policies');
      console.error('   3. Create the policies shown in SETUP.md section 1.3');
    }
    
    process.exit(1);
  }
}

setupStorage();
