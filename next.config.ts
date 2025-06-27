import withRspack from 'next-rspack';
import { NextConfig } from 'next';

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  // 在此处放置Next.js配置
  reactStrictMode: true,
  swcMinify: true,
};

export default withRspack(nextConfig);
