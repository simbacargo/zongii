import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zongii.co.tz" },
      { protocol: "https", hostname: "**.zongii.co.tz" },
    ],
  },
};

export default withNextIntl(nextConfig);
