// pages/sitemap.xml.ts

import { GetServerSideProps } from 'next';

const SITE_URL = 'https://www.stubborn.com.br';

const staticPages = [
  '',
  'sobre',
  'servicos',
  'contato',
  'projetos',
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages
      .map((page) => {
        return `
        <url>
          <loc>${SITE_URL}/${page}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>`;
      })
      .join('')}
  </urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
