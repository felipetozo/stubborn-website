import NavBar from "@/views/Components/NavBar";
import Hero from "@/views/Components/Hero";
import Process from "@/views/Components/Process";

function HomePage() {
  return (
    <div>
      <main>
        <NavBar />
        <Hero />
        <Process />
      </main>
    </div>
  );
}

export default HomePage;