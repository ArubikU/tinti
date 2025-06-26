
ALTER TABLE projects ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS project_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, 
    ip_address INET, 
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id), 
    UNIQUE(project_id, ip_address) 
);

CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_ip ON project_views(ip_address);

CREATE OR REPLACE FUNCTION update_project_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects 
    SET views_count = (
        SELECT COUNT(*) FROM project_views WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_views_count ON project_views;
CREATE TRIGGER trigger_update_views_count
    AFTER INSERT ON project_views
    FOR EACH ROW
    EXECUTE FUNCTION update_project_views_count();
