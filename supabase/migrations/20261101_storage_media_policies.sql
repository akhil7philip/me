-- Media storage is public to read, but every write is limited to the
-- authenticated user's folder (<auth.uid()>/<filename>). All upload callers
-- use that layout, including article cover-image uploads.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read media objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload media to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update media in their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete media in their folder" ON storage.objects;

CREATE POLICY "Public read media objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

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
