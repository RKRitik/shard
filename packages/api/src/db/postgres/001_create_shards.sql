-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shards table (MVP)
CREATE TABLE IF NOT EXISTS shards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace VARCHAR(255) NOT NULL,
  package VARCHAR(255) NOT NULL,
  shard VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  s3_id VARCHAR(500), -- S3 artifact path/ID
  metadata JSONB DEFAULT '{}'::jsonb, -- Store manifest and additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255), -- User/authenticator identifier
  -- Prevent duplicate namespace/package/shard/version combinations
  UNIQUE(namespace, package, shard, version)
);


-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shards_updated_at 
  BEFORE UPDATE ON shards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();