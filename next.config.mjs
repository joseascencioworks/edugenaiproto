// next.config.mjs
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  webpack: (config, { dev }) => {
    // Evita el error 'RangeError: Array buffer allocation failed' en webpack.cache
    if (dev) {
      config.cache = {
        type: 'memory',
      }
    }
    return config
  },
}

export default nextConfig
