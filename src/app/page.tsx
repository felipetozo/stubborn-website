import NavBar from "@/views/Components/NavBar";
import Hero from "@/views/Components/Hero";
import Process from "@/views/Components/Process";
import Work from "@/views/Components/Work";

function HomePage() {
  return (
    <div>
      <main>
        <NavBar />
        <Hero />
        <Process />
        <Work />
      </main>
    </div>
  );
}

export default HomePage;