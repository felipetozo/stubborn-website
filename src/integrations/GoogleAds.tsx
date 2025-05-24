import Head from 'next/head';
import React from 'react';

const GoogleAnalytics: React.FC = () => {
  return (
    <Head>
      <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'YOUR_GA_ID');
          `,
        }}
      />
    </Head>
  );
};

export default GoogleAnalytics;