import type { MetadataRoute } from 'next'
import { projects } from '@/content/projects'
import { seo } from '@/content/profile'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${seo.siteUrl}/`,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${seo.siteUrl}/projects/${project.slug}/`,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ]
}
