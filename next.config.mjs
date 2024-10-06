/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['dd.dexscreener.com','cdn.basedfellas.io','i.postimg.cc','apricot-voluntary-swallow-472.mypinata.cloud'],
  }
};

export default nextConfig;

export async function headers() {
  return [
    {
      source: '/(.*)', // Apply to all routes
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Cross-Origin-Resource-Policy',
          value: 'same-origin',
        },
      ],
    },
  ];
}
