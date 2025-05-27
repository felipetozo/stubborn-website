import React from 'react';
import GoogleAds from './GoogleAds';
import GoogleAnalytics from './GoogleAnalytics';

const TrackingScripts: React.FC = () => {
  return (
    <>
      <GoogleAds />
      <GoogleAnalytics />
    </>
  );
};

export default TrackingScripts;