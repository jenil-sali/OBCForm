/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // These are only available server-side (not prefixed with NEXT_PUBLIC_)
  },
};

export default nextConfig;
