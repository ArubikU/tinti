-- Migración para agregar campo updated_at a folders
ALTER TABLE folders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
