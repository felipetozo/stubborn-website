'use client';

import Navbar from '@/views/Components/NavBar';
import Hero from '@/views/Components/Hero';
import Services from '@/views/Components/Services';
import Work from '@/views/Components/Work';
import BlogSection from '@/views/Components/BlogSection';
import Footer from '@/views/Components/Footer';
import { initLenis } from '../../lib/lenis';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    const lenis = initLenis();
    return () => lenis.destroy();
  }, []);

  return (
    <div>
      <main>
        <Navbar />
        <Hero />
        <Services />
        <Work />
        <BlogSection />
        <Footer />
      </main>
    </div>
  );
}
