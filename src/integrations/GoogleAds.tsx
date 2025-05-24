import Head from 'next/head';
import React from 'react';

const GoogleAds: React.FC = () => {
  return (
    <Head>
      <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17110235811">
        </script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17110235811');
        </script>
    </Head>
  );
};

export default GoogleAds;