import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // sharp is a native module — keep it external so it isn't bundled by the server build
  serverExternalPackages: ['sharp'],
};

export default withNextIntl(nextConfig);
