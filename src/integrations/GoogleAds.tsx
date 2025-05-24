import Script from 'next/script';
import React from 'react';

const GoogleAds: React.FC = () => {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17110235811"
        strategy="afterInteractive"
      />
      <Script
        id="google-ads-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17110235811');
          `,
        }}
      />
    </>
  );
};

export default GoogleAds;