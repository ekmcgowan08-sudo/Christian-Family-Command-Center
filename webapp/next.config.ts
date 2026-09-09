import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server build (node_modules pruned to only
  // what's needed) so the Docker image doesn't have to ship the whole
  // dev-time node_modules tree.
  output: "standalone",
  // The dev-mode route indicator overlays the bottom of every page and can
  // intercept clicks on real UI underneath it (e.g. in browser-automated
  // tests) -- not worth keeping for the little context it adds.
  devIndicators: false,
  // Baseline hardening for every response. Deliberately not a strict
  // Content-Security-Policy: Next's own hydration relies on inline
  // scripts, and getting a nonce-based CSP right without breaking dev
  // mode (HMR) or something subtle in production needs more verification
  // than a page-load smoke test can give it -- these headers are the
  // well-understood, low-risk wins that don't have that failure mode.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // This app never embeds its own pages in a frame -- block
          // clickjacking outright rather than just discouraging it.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing in this app uses the camera, microphone, or
          // geolocation -- deny them so an XSS or a compromised
          // dependency can't prompt for them either.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // No-op over plain HTTP; tells browsers to only ever use HTTPS
          // for this origin once it's served over one, which every
          // deployment target here (Vercel/Railway/Render, or a reverse
          // proxy in front of Docker) does.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
