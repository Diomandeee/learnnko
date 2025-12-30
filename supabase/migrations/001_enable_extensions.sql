-- Migration 001: Enable Required Extensions
-- N'Ko Language Learning Database
-- 
-- This migration enables the PostgreSQL extensions needed for:
-- - UUID generation (uuid-ossp)
-- - Vector embeddings for semantic search (pgvector)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector operations for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extensions are enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'uuid-ossp extension failed to install';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE EXCEPTION 'vector extension failed to install';
    END IF;
    
    RAISE NOTICE 'All required extensions enabled successfully';
END $$;

