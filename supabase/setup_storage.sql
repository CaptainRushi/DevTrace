-- Create a new storage bucket for post covers if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-covers', 'post-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-covers' );

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-covers' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow users to update their own images (optional, but good)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'post-covers' );

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'post-covers' );
