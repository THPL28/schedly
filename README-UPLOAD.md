# 📤 Upload de Imagens - Configuração para Produção

## ⚠️ Importante

Na Vercel (e outras plataformas serverless), o sistema de arquivos é **read-only**. Isso significa que salvar arquivos diretamente em `public/uploads/` não funcionará em produção.

## 🔧 Soluções Recomendadas

### Opção 1: Vercel Blob Storage (Recomendado)

1. Instale o pacote:
```bash
npm install @vercel/blob
```

2. Configure a variável de ambiente na Vercel:
```
BLOB_READ_WRITE_TOKEN=seu_token_aqui
```

3. Atualize `src/app/api/upload/route.ts` para usar Vercel Blob:

```typescript
import { put } from '@vercel/blob'

// No lugar de saveFileLocal:
const blob = await put(filename, buffer, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN,
})
url = blob.url
```

### Opção 2: AWS S3

Use o AWS SDK para fazer upload direto para S3.

### Opção 3: Cloudinary

Use o Cloudinary para gerenciar imagens.

### Opção 4: Base64 (Temporário)

A implementação atual usa base64 em produção como fallback. Isso funciona, mas:
- ❌ Aumenta o tamanho do banco de dados
- ❌ Não é ideal para performance
- ✅ Funciona imediatamente sem configuração adicional

## 🚀 Implementação Recomendada: Vercel Blob

Para melhor performance e escalabilidade, recomendo usar Vercel Blob Storage:

1. Acesse: https://vercel.com/docs/storage/vercel-blob
2. Crie um token de acesso
3. Adicione como variável de ambiente na Vercel
4. Atualize a rota de upload conforme exemplo acima

## 📝 Nota

A implementação atual funciona em desenvolvimento (salva localmente) e em produção (usa base64 como fallback). Para produção em escala, considere migrar para uma das soluções acima.



