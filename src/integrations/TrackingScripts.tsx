import React from 'react';
import GoogleAds from './GoogleAds';
import GoogleAnalytics from './GoogleAnalytics';
import GoogleTagManager from './GoogleTagManager';

const TrackingScripts: React.FC = () => {
  return (
    <>
      <GoogleAds />
      <GoogleAnalytics />
      <GoogleTagManager />
    </>
  );
};

export default TrackingScripts;