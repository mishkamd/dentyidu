import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  output: "standalone",

  async headers() {
    const commonHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
    return [
      {
        source: '/((?!admin|login).*)',
        headers: [
          ...commonHeaders,
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          ...commonHeaders,
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org" },
        ],
      },
      {
        source: '/login',
        headers: [
          ...commonHeaders,
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
