-- Migración 005: Agregar descripción, color, icono y colaboradores a folders

-- Agregar nuevos campos a la tabla folders
ALTER TABLE folders 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'folder';

-- Crear tabla de colaboradores para folders
CREATE TABLE IF NOT EXISTS folder_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'editor',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_external BOOLEAN DEFAULT FALSE,
    UNIQUE(folder_id, user_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_folder_collaborators_folder_id ON folder_collaborators(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_collaborators_user_id ON folder_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_folder_collaborators_external ON folder_collaborators(user_id, is_external) WHERE is_external = TRUE;

-- Función para heredar colaboradores de folder a proyecto
CREATE OR REPLACE FUNCTION inherit_folder_collaborators()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el proyecto se asigna a un folder, heredar colaboradores
    IF TG_OP = 'INSERT' THEN
        INSERT INTO collaborators (project_id, user_id, role, invited_at)
        SELECT NEW.project_id, fc.user_id, fc.role, CURRENT_TIMESTAMP
        FROM folder_collaborators fc
        WHERE fc.folder_id = NEW.folder_id
        ON CONFLICT (project_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para heredar colaboradores cuando se asigna un proyecto a un folder
DROP TRIGGER IF EXISTS trigger_inherit_folder_collaborators ON project_folders;
CREATE TRIGGER trigger_inherit_folder_collaborators
    AFTER INSERT ON project_folders
    FOR EACH ROW
    EXECUTE FUNCTION inherit_folder_collaborators();

-- Función para sincronizar colaboradores cuando se agregan a un folder
CREATE OR REPLACE FUNCTION sync_folder_projects_collaborators()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se agrega un colaborador a un folder, agregarlo a todos los proyectos del folder
    IF TG_OP = 'INSERT' THEN
        INSERT INTO collaborators (project_id, user_id, role, invited_at)
        SELECT pf.project_id, NEW.user_id, NEW.role, CURRENT_TIMESTAMP
        FROM project_folders pf
        WHERE pf.folder_id = NEW.folder_id
        ON CONFLICT (project_id, user_id) DO UPDATE SET
            role = EXCLUDED.role,
            invited_at = EXCLUDED.invited_at;
    END IF;
    
    -- Cuando se elimina un colaborador de un folder, eliminarlo de los proyectos del folder
    -- (solo si no es el dueño del proyecto)
    IF TG_OP = 'DELETE' THEN
        DELETE FROM collaborators c
        WHERE c.user_id = OLD.user_id
        AND c.project_id IN (
            SELECT pf.project_id 
            FROM project_folders pf 
            WHERE pf.folder_id = OLD.folder_id
        )
        AND c.project_id NOT IN (
            SELECT p.id
            FROM projects p
            WHERE p.owner_id = OLD.user_id
        );
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar colaboradores de folder con proyectos
DROP TRIGGER IF EXISTS trigger_sync_folder_projects_collaborators ON folder_collaborators;
CREATE TRIGGER trigger_sync_folder_projects_collaborators
    AFTER INSERT OR DELETE ON folder_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION sync_folder_projects_collaborators();

COMMIT;
