import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Hero } from '@/components/sections/Hero'
import { MetricsStrip } from '@/components/sections/MetricsStrip'
import { About } from '@/components/sections/About'
import { Philosophy } from '@/components/sections/Philosophy'
import { Experience } from '@/components/sections/Experience'
import { Projects } from '@/components/sections/Projects'
import { ArchitectureStack } from '@/components/sections/ArchitectureStack'
import { Skills } from '@/components/sections/Skills'
import { CodeAndEngineering } from '@/components/sections/CodeAndEngineering'
import { Contact } from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <MetricsStrip />
        <About />
        <Philosophy />
        <Experience />
        <Projects />
        <ArchitectureStack />
        <Skills />
        <CodeAndEngineering />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
