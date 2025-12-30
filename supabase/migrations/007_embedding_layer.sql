-- Migration 007: Embedding Layer Tables
-- N'Ko Language Learning Database
--
-- Vector embeddings for semantic search and RAG.
-- Requires pgvector extension (enabled in 001).

-- ============================================
-- nko_embeddings: Vector embeddings
-- ============================================
CREATE TABLE nko_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What this embedding represents (one should be set)
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE CASCADE,
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    example_id UUID REFERENCES nko_examples(id) ON DELETE CASCADE,
    
    -- The embedding vector
    -- Using 768 dimensions (common for many models)
    -- Change this if using a different model
    embedding vector(768),
    
    -- Model information
    model_name TEXT NOT NULL, -- 'text-embedding-ada-002', 'gemini-embedding-001', etc.
    model_version TEXT,
    model_dimensions INTEGER DEFAULT 768,
    
    -- Content that was embedded
    content_type TEXT CHECK (content_type IN (
        'word', 'phrase', 'sentence', 'paragraph', 
        'detection', 'definition', 'example'
    )),
    content_text TEXT, -- The actual text that was embedded
    content_language TEXT DEFAULT 'nko', -- 'nko', 'english', 'french', 'multilingual'
    
    -- Embedding quality
    is_valid BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_embeddings IS 'Vector embeddings for semantic search and RAG';
COMMENT ON COLUMN nko_embeddings.embedding IS '768-dimensional vector embedding';

-- ============================================
-- Index for vector similarity search
-- Using IVFFlat for approximate nearest neighbor
-- ============================================
CREATE INDEX idx_embeddings_vector 
ON nko_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Also create an exact search index for smaller datasets
CREATE INDEX idx_embeddings_vector_exact
ON nko_embeddings
USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- nko_embedding_clusters: Semantic clusters
-- ============================================
CREATE TABLE nko_embedding_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Cluster metadata
    cluster_name TEXT,
    cluster_description TEXT,
    
    -- Centroid
    centroid vector(768),
    
    -- Cluster statistics
    member_count INTEGER DEFAULT 0,
    avg_distance FLOAT, -- Average distance from centroid
    max_distance FLOAT, -- Maximum distance from centroid
    
    -- Semantic label
    semantic_category TEXT, -- 'greetings', 'numbers', 'family', etc.
    auto_generated BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_embedding_clusters IS 'Semantic clusters of embeddings';

-- ============================================
-- nko_embedding_cluster_members: Cluster membership
-- ============================================
CREATE TABLE nko_embedding_cluster_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    cluster_id UUID NOT NULL REFERENCES nko_embedding_clusters(id) ON DELETE CASCADE,
    embedding_id UUID NOT NULL REFERENCES nko_embeddings(id) ON DELETE CASCADE,
    
    -- Distance from cluster centroid
    distance FLOAT,
    
    -- Membership confidence
    confidence FLOAT DEFAULT 1.0,
    is_core_member BOOLEAN DEFAULT FALSE, -- Close to centroid
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(cluster_id, embedding_id)
);

-- ============================================
-- Function: Find similar embeddings
-- ============================================
CREATE OR REPLACE FUNCTION find_similar_embeddings(
    query_embedding vector(768),
    match_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    embedding_id UUID,
    vocabulary_id UUID,
    translation_id UUID,
    content_text TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as embedding_id,
        e.vocabulary_id,
        e.translation_id,
        e.content_text,
        1 - (e.embedding <=> query_embedding) as similarity
    FROM nko_embeddings e
    WHERE 1 - (e.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Find similar vocabulary
-- ============================================
CREATE OR REPLACE FUNCTION find_similar_vocabulary(
    query_text TEXT,
    query_embedding vector(768),
    match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    vocabulary_id UUID,
    word TEXT,
    latin TEXT,
    meaning TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id as vocabulary_id,
        v.word,
        v.latin,
        v.meaning_primary as meaning,
        1 - (e.embedding <=> query_embedding) as similarity
    FROM nko_embeddings e
    JOIN nko_vocabulary v ON e.vocabulary_id = v.id
    WHERE e.vocabulary_id IS NOT NULL
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE TRIGGER trigger_embeddings_updated_at
BEFORE UPDATE ON nko_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_clusters_updated_at
BEFORE UPDATE ON nko_embedding_clusters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

