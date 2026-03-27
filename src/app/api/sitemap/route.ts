import { prisma } from '@/lib/prisma'

const SITE_URL = (process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.schedly.app.br').replace(/\/$/, '')

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

export async function GET() {
  // Only select public fields to avoid leaking data
  const users = await prisma.user.findMany({
    where: { slug: { not: null } },
    select: {
      slug: true,
      updatedAt: true,
      eventTypes: {
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      },
    },
    take: 50000, // safety: limit to 50k entries per sitemap
  })

  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/pricing', changefreq: 'weekly', priority: '0.8' },
    { path: '/privacy', changefreq: 'monthly', priority: '0.6' },
    { path: '/terms', changefreq: 'monthly', priority: '0.6' },
    { path: '/offline', changefreq: 'monthly', priority: '0.4' },
    { path: '/login', changefreq: 'monthly', priority: '0.3' },
    { path: '/register', changefreq: 'monthly', priority: '0.3' },
  ]

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const p of staticPages) {
    xml += `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`
  }

  for (const u of users) {
    // Runtime guard: although we filter slug != null in the query,
    // TypeScript still types slug as possibly null. Skip if missing.
    if (!u.slug) continue

    const safeSlug = encodeURIComponent(u.slug)
    const updated = u.updatedAt ? formatDate(u.updatedAt) : formatDate(new Date())

    // book root for user
    xml += `  <url>\n    <loc>${SITE_URL}/book/${safeSlug}</loc>\n    <lastmod>${updated}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`

    // event types (services) - only active ones (selected above)
    for (const et of u.eventTypes || []) {
      if (!et.slug) continue
      const etUpdated = et.updatedAt ? formatDate(et.updatedAt) : updated
      const safeEt = encodeURIComponent(et.slug)
      xml += `  <url>\n    <loc>${SITE_URL}/book/${safeSlug}/${safeEt}</loc>\n    <lastmod>${etUpdated}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`
    }

    // public portal
    xml += `  <url>\n    <loc>${SITE_URL}/portal/${safeSlug}</loc>\n    <lastmod>${updated}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`
  }

  xml += '</urlset>'

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
