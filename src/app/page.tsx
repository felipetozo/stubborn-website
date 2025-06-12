'use client';

import { AppProps } from 'next/app';
import Navbar from "@/views/Components/NavBar";
import Hero from "@/views/Components/Hero";
import Manifesto from "@/views/Components/Manifesto";
import Process from "@/views/Components/Process";
import Work from "@/views/Components/Work";
import Footer from "@/views/Components/Footer";
import { initLenis } from "../lib/lenis";
import { useEffect } from "react";

function HomePage({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const lenis = initLenis();
    return () => lenis.destroy();
  }, []);

  return (
    <div>
      <main>
        <Navbar />
        <Hero />
        <Manifesto />
        <Process />
        <Work />
        <Footer />
      </main>
    </div>
  );
}

export default HomePage;