-- MITTIFIED MEDIA PLATFORM - DATABASE SCHEMA MIGRATION
-- Setup tables for YouTubers, drama updates, and blog articles.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CREATE CREATORS TABLE
CREATE TABLE IF NOT EXISTS public.creators (
    id TEXT PRIMARY KEY DEFAULT 'creator-' || gen_random_uuid()::text,
    name TEXT NOT NULL,
    channel_id TEXT NOT NULL UNIQUE,
    handle TEXT NOT NULL,
    avatar_url TEXT,
    subscribers BIGINT DEFAULT 0,
    category TEXT CHECK (category IN ('Vlogger', 'Gamer', 'Tech', 'Infotainment', 'Drama/Rant', 'Comedy')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Hiatus', 'Drama/Exposed', 'Under Investigation')),
    drama_meter INTEGER DEFAULT 0 CHECK (drama_meter >= 0 AND drama_meter <= 100),
    recent_drama_title TEXT,
    metrics JSONB DEFAULT '{"monthlyViews": 0, "engagementRate": 0}'::jsonb,
    bio TEXT,
    socials JSONB DEFAULT '{"youtube": ""}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY DEFAULT 'art-' || gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    author TEXT DEFAULT 'Mitti Fied News',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    creator_id TEXT REFERENCES public.creators(id) ON DELETE SET NULL,
    youtube_video_id TEXT
);

-- CREATE ARTICLE ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.article_analytics (
    id TEXT PRIMARY KEY,
    article_id TEXT REFERENCES public.articles(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    device TEXT CHECK (device IN ('Desktop', 'Tablet', 'Mobile')),
    referrer TEXT,
    duration INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
    email TEXT PRIMARY KEY,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY: PUBLIC READ ACCESS FOR EVERYONE
CREATE POLICY "Allow public read access to creators"
ON public.creators
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access to articles"
ON public.articles
FOR SELECT
TO public
USING (true);

-- CREATE POLICY: WRITE/UPDATE ACCESS FOR AUTHENTICATED ADMIN ONLY
-- In Supabase, the email domain or a whitelist metadata check is applied here.
CREATE POLICY "Allow write/update for admins only on creators"
ON public.creators
FOR ALL
TO authenticated
USING (auth.jwt()->>'email' IN (
    -- Whitelisted administrative emails go here
    'admin@mittified.media',
    'mitti@mittified.media'
))
WITH CHECK (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'mitti@mittified.media'
));

CREATE POLICY "Allow write/update for admins only on articles"
ON public.articles
FOR ALL
TO authenticated
USING (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'mitti@mittified.media'
))
WITH CHECK (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'admin@mittified.media',
    'mitti@mittified.media'
));

-- CREATE POLICY: ALLOW PUBLIC TO INSERT AND UPDATE ANALYTICS
CREATE POLICY "Allow public insert and update on article_analytics"
ON public.article_analytics
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- CREATE POLICY: WRITE/UPDATE/READ ACCESS FOR AUTHENTICATED ADMIN ONLY ON ANALYTICS
CREATE POLICY "Allow admin read and write on article_analytics"
ON public.article_analytics
FOR ALL
TO authenticated
USING (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'mitti@mittified.media'
))
WITH CHECK (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'mitti@mittified.media'
));

-- CREATE POLICY: ALLOW PUBLIC TO INSERT SUBSCRIBERS
CREATE POLICY "Allow public insert on subscribers"
ON public.subscribers
FOR INSERT
TO public
WITH CHECK (true);

-- CREATE POLICY: ALLOW ADMIN TO READ/WRITE ALL ON SUBSCRIBERS
CREATE POLICY "Allow admin read and write on subscribers"
ON public.subscribers
FOR ALL
TO authenticated
USING (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'mitti@mittified.media'
))
WITH CHECK (auth.jwt()->>'email' IN (
    'admin@mittified.media',
    'mitti@mittified.media'
));

-- INSERT SEED DATA FOR CREATORS
INSERT INTO public.creators (id, name, channel_id, handle, avatar_url, subscribers, category, status, drama_meter, recent_drama_title, metrics, bio, socials)
VALUES 
('creator-1', 'Ducky Bhai', 'UCJmrc_R7wR9f3K2FvSg3OQA', '@duckybhai', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200', 8450000, 'Vlogger', 'Active', 45, 'Recent roast reaction and giveaway controversy', '{"monthlyViews": 45000000, "engagementRate": 8.5}', 'Saad ur Rehman, known as Ducky Bhai, is one of Pakistan''s biggest lifestyle vloggers and commentators. Known for his humor, lavish lifestyle videos, and early career roasts.', '{"youtube": "https://youtube.com/c/duckybhai", "instagram": "https://instagram.com/duckybhai"}'),
('creator-2', 'Raza Samo', 'UCwKz2Z80kQfW6XoW3c15-Lg', '@razasamo', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 2100000, 'Drama/Rant', 'Drama/Exposed', 85, 'Leaked response video and clashes with podcast hosts', '{"monthlyViews": 8500000, "engagementRate": 12.4}', 'Raza Samo is a veteran commentator, roasted content creator, and former lead of Khujlee Family. Known for his raw analysis of Pakistani YouTube dynamics.', '{"youtube": "https://youtube.com/c/razasamo", "twitter": "https://twitter.com/razasamo"}'),
('creator-3', 'Mooroo', 'UC_w1L58WJvE1sL2rSg4eL0g', '@mooroomusic', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200', 1150000, 'Infotainment', 'Active', 5, NULL, '{"monthlyViews": 2000000, "engagementRate": 9.8}', 'Taimoor Salahuddin, famously known as Mooroo, is a pioneer in cinematic vlogging, music production, and high-quality podcast content in Pakistan.', '{"youtube": "https://youtube.com/c/mooroomusic", "instagram": "https://instagram.com/mooroo"}')
ON CONFLICT (channel_id) DO NOTHING;

-- INSERT SEED DATA FOR ARTICLES
INSERT INTO public.articles (id, slug, title, summary, content, cover_image, category, tags, author, creator_id, youtube_video_id)
VALUES
('art-1', 'raza-samo-breaks-silence-on-podcast-clash', 'Raza Samo Breaks Silence on Podcast Controversy: The Raw Truth Explored', 'In a dramatic 20-minute response video, Raza Samo addresses the recent podcast fallout, revealing behind-the-scenes negotiations and personal clashes that led to the incident.', '<p>The Pakistani YouTube community is currently experiencing one of its biggest controversies of the year. Raza Samo, a prominent commentator and video creator, has officially broken his silence regarding the recent fallout on a popular podcast network.</p><h3>The Origin of the Clash</h3><p>According to Samo, the disagreement started during pre-interview preparations when the hosts allegedly attempted to push an unauthorized narrative.</p>', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600', 'Controversies', ARRAY['Raza Samo', 'Pakistani YouTube', 'Drama'], 'Mitti Fied News', 'creator-2', NULL)
ON CONFLICT (slug) DO NOTHING;
