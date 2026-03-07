# ⚠️ MIGRAÇÃO URGENTE - Campos de Perfil do Usuário

## Erro Atual

```
Error: The column `User.avatarUrl` does not exist in the current database.
```

## Solução Rápida

Execute este SQL no seu banco de dados PostgreSQL de produção:

```sql
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT;
```

## Como Aplicar na Vercel

### Método 1: Via Dashboard da Vercel

1. Acesse o projeto na Vercel
2. Vá em Settings → Environment Variables
3. Adicione `DIRECT_URL` (mesmo valor de `DATABASE_URL` se não usar pooling)
4. Execute localmente: `npx prisma migrate deploy`

### Método 2: Via SQL Direto

1. Acesse seu banco de dados PostgreSQL (via Vercel Postgres, Supabase, etc.)
2. Execute o SQL acima diretamente

### Método 3: Via Prisma Studio

```bash
npx prisma studio
```

Depois execute o SQL no console do banco.

## Verificação

Após aplicar, o erro deve desaparecer e o dashboard deve funcionar normalmente.



