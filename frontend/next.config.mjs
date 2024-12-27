/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "avatars.githubusercontent.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  }
};

export default nextConfig;
