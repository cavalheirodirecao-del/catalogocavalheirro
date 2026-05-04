import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import AnuncioBar from "@/components/public/AnuncioBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnuncioBar />
        <Navbar />
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
