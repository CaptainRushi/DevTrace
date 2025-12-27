-- Add missing columns to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS icon text;

-- Insert communities (using ON CONFLICT to avoid duplicates on slug)
INSERT INTO communities (slug, name, description, category, is_featured, icon) VALUES
('frontend', 'Frontend Development', 'UI, UX, React, CSS, Web performance', 'web', true, '🎨'),
('backend', 'Backend Development', 'APIs, databases, authentication, scalability', 'web', true, '⚙️'),
('fullstack', 'Full-Stack Development', 'Frontend + Backend workflows', 'web', true, '🥞'),
('mobile', 'Mobile Development', 'Android, iOS, Flutter, React Native', 'mobile', true, '📱'),
('devops', 'DevOps & Cloud', 'CI/CD, Docker, Kubernetes, cloud infra', 'infra', true, '☁️'),
('ai-ml', 'AI / Machine Learning', 'LLMs, ML models, data pipelines', 'ai', true, '🤖'),
('opensource', 'Open Source', 'Contributing, maintainership, tooling', 'community', true, '🐙'),
('system-design', 'System Design', 'Architecture, scaling, trade-offs', 'architecture', true, '🏗️'),
('career-jobs', 'Career & Jobs', 'Hiring, interviews, growth', 'career', true, '💼')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_featured = EXCLUDED.is_featured,
    icon = EXCLUDED.icon;

-- Ensure RLS is enabled (redundant if already done, but safe)
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Ensure read-only policy exists (and no others for public)
DROP POLICY IF EXISTS "Anyone can read communities" ON communities;
CREATE POLICY "Anyone can read communities" ON communities FOR SELECT USING (true);
