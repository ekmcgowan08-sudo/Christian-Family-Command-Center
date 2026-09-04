import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server build (node_modules pruned to only
  // what's needed) so the Docker image doesn't have to ship the whole
  // dev-time node_modules tree.
  output: "standalone",
};

export default nextConfig;
