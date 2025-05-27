import NavBar from "@/views/Components/NavBar";
import Hero from "@/views/Components/Hero";
import Manifesto from "@/views/Components/Manifesto";
import Process from "@/views/Components/Process";
import Work from "@/views/Components/Work";
import Footer from "@/views/Components/Footer";

function HomePage() {
  return (
    <div>
      <main>
        <NavBar />
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