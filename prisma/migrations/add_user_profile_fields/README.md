# Migração: Adicionar Campos de Perfil do Usuário

Esta migração adiciona os campos de perfil ao modelo User:
- `avatarUrl` (TEXT, nullable)
- `phone` (TEXT, nullable)
- `bio` (TEXT, nullable)
- `website` (TEXT, nullable)

## Como Aplicar na Vercel/Produção

### Opção 1: Via Prisma Migrate (Recomendado)

1. Configure a variável de ambiente `DIRECT_URL` na Vercel (igual ao `DATABASE_URL` se não usar connection pooling)
2. Execute no terminal local (com acesso ao banco):
```bash
npx prisma migrate deploy
```

### Opção 2: Via SQL Direto

Execute o SQL abaixo diretamente no seu banco de dados PostgreSQL:

```sql
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT;
```

### Opção 3: Via Prisma Studio

1. Acesse o Prisma Studio: `npx prisma studio`
2. Ou use uma ferramenta de gerenciamento de banco (pgAdmin, DBeaver, etc.)
3. Execute o SQL acima

## Verificação

Após aplicar, verifique se as colunas foram criadas:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('avatarUrl', 'phone', 'bio', 'website');
```

