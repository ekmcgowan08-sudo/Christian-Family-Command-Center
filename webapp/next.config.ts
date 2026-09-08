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
};

export default nextConfig;
