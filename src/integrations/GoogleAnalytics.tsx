// GoogleAnalytics.tsx
import Script from 'next/script';
import React from 'react';

const GoogleAnalytics: React.FC = () => {
    return (
        <>
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-MLHBF9HK0E"
                strategy="afterInteractive"
            />
            <Script
                id="google-analytics-config"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MLHBF9HK0E');
          `,
                }}
            />
        </>
    );
};

export default GoogleAnalytics;