import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

// Função para salvar arquivo localmente (desenvolvimento)
async function saveFileLocal(buffer: Buffer, filename: string): Promise<string> {
  const { writeFile, mkdir } = await import('fs/promises')
  const { join } = await import('path')
  const { existsSync } = await import('fs')

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const filepath = join(uploadDir, filename)
  await writeFile(filepath, buffer)
  return `/uploads/avatars/${filename}`
}

// Função para converter imagem em base64 (fallback para produção)
async function convertToBase64(buffer: Buffer, mimeType: string): Promise<string> {
  const base64 = buffer.toString('base64')
  return `data:${mimeType};base64,${base64}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' }, { status: 400 })
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${session.userId}-${timestamp}-${randomStr}.${extension}`

    let url: string

    // Em produção na Vercel, o sistema de arquivos é read-only
    // Usar base64 como fallback ou implementar Vercel Blob Storage
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // Em produção, usar base64 (temporário) ou implementar Vercel Blob
      // Para uma solução melhor, considere usar @vercel/blob ou outro serviço de storage
      url = await convertToBase64(buffer, file.type)
    } else {
      // Em desenvolvimento, salvar localmente
      url = await saveFileLocal(buffer, filename)
    }

    return NextResponse.json({ url, success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

