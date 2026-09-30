import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Routes are grouped into the three sections in the navigation: /fix, /learn
   * and /parts. These keep the earlier URLs working for anyone who saved one.
   */
  async redirects() {
    return [
      { source: "/check", destination: "/fix/code", permanent: true },
      { source: "/build", destination: "/learn/build", permanent: true },
      { source: "/build/:id", destination: "/learn/build/:id", permanent: true },
      { source: "/projects/:path*", destination: "/learn/projects/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
