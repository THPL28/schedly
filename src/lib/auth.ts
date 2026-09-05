import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const DEV_SECRET = 'schedly-development-only-secret-change-me'

function getSessionKey() {
    const secret = process.env.SESSION_SECRET

    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_SECRET must be configured in production')
    }

    return new TextEncoder().encode(secret || DEV_SECRET)
}

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getSessionKey())

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    })
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function verifySession() {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value
    if (!cookie) return null

    try {
        const { payload } = await jwtVerify(cookie, getSessionKey(), {
            algorithms: ['HS256'],
        })

        if (typeof payload.userId !== 'string' || !payload.userId) {
            return null
        }

        return payload
    } catch {
        return null
    }
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
}
