// src/app/page.tsx
'use client';

import Navbar from "@/views/Components/NavBar";
import Hero from "@/views/Components/Hero";
import Process from "@/views/Components/Process";
import Work from "@/views/Components/Work";
import Footer from "@/views/Components/Footer";
import { initLenis } from "../lib/lenis";
import { useEffect } from "react";
import { NextPage } from "next";
import Manifesto from "@/views/Components/Manifesto";

const HomePage: NextPage = () => {
  useEffect(() => {
    const lenis = initLenis();
    return () => lenis.destroy();
  }, []);

  return (
    <div>
      <main>
        <Navbar />
        <Hero />
        <Process />
        <Work />
        <Manifesto />
        <Footer />
      </main>
    </div>
  );
};

export default HomePage;