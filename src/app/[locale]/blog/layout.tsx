import Navbar from '@/views/Components/NavBar';
import Footer from '@/views/Components/Footer';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
