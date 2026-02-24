// small push helper (uses web-push)
import webpush from 'web-push'
import { prisma } from './prisma'

type PushSubscriptionInput = { endpoint: string; keys?: { p256dh?: string; auth?: string } }
type NotifyPayload = { title: string; body?: string; data?: Record<string, unknown> }

const VAPID_PUBLIC = process.env.PUSH_VAPID_PUBLIC || ''
const VAPID_PRIVATE = process.env.PUSH_VAPID_PRIVATE || ''

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(`mailto:${process.env.SUPPORT_EMAIL || 'no-reply@schedly.local'}`, VAPID_PUBLIC, VAPID_PRIVATE)
  } catch (err) {
    console.warn('[push] failed to set VAPID details', err)
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC || null
}

export async function saveSubscriptionToDb(sub: PushSubscriptionInput, userId?: string | null) {
  if (!sub || !sub.endpoint) return null
  try {
    const existing = await (prisma as any).pushSubscription.findUnique({ where: { endpoint: sub.endpoint } })
    if (existing) return existing
    return await (prisma as any).pushSubscription.create({ data: { userId: userId || null, endpoint: sub.endpoint, p256dh: sub.keys?.p256dh || '', auth: sub.keys?.auth || '' } })
  } catch (err) {
    console.warn('[push] saveSubscriptionToDb error', err)
    return null
  }
}

export async function removeSubscriptionFromDb(endpoint: string) {
  try {
    await (prisma as any).pushSubscription.deleteMany({ where: { endpoint } })
    return true
  } catch (err) {
    console.warn('[push] removeSubscriptionFromDb error', err)
    return false
  }
}

export async function sendPushToSubscription(sub: PushSubscriptionInput, payload: NotifyPayload) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('[push] VAPID keys not configured — skipping push')
    return false
  }
  try {
    await webpush.sendNotification(sub as any, JSON.stringify(payload))
    return true
  } catch (err: unknown) {
    // Remove invalid subscriptions (410 / 404)
    const status = (err as any)?.statusCode
    if (status === 410 || status === 404) {
      try { await removeSubscriptionFromDb(sub.endpoint) } catch { /* ignore */ }
    }
    console.warn('[push] send error', err)
    return false
  }
}

export async function notifyUserById(userId: string, payload: NotifyPayload) {
  try {
    const subs = await (prisma as any).pushSubscription.findMany({ where: { userId } })
    const promises = subs.map((s: { endpoint: string; p256dh: string; auth: string }) => {
      const fakeSub: PushSubscriptionInput = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }
      return sendPushToSubscription(fakeSub, payload)
    })
    await Promise.all(promises)
  } catch (err) {
    console.warn('[push] notifyUserById error', err)
  }
}
