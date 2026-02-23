-- Migração para adicionar campos de perfil do usuário
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('avatarUrl', 'phone', 'bio', 'website');


