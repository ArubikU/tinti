
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_collaborative BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS collaboration_id VARCHAR(10) UNIQUE;

-- Crear tabla de colaboradores
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'editor',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id) 
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_collaborators_project_id ON collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_collaboration_id ON projects(collaboration_id);

-- Función para generar collaboration_id automáticamente
CREATE OR REPLACE FUNCTION generate_collaboration_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_collaborative = TRUE AND NEW.collaboration_id IS NULL THEN
        NEW.collaboration_id := upper(substring(md5(random()::text) from 1 for 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_collaboration_id ON projects;
CREATE TRIGGER trigger_generate_collaboration_id
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION generate_collaboration_id();

COMMIT;
