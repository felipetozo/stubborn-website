import Head from 'next/head';
import React from 'react';

const GoogleAds: React.FC = () => {
  return (
    <div>
      <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17110235811">
      </script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17110235811');
          `,
        }}
      />
    </div>
  );
};

export default GoogleAds;