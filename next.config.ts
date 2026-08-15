import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Next 16 writes AGENTS.md / CLAUDE.md into the repo root on every `next dev`.
  // Not wanted here — this repo is a portfolio people read.
  agentRules: false,
}

export default nextConfig
