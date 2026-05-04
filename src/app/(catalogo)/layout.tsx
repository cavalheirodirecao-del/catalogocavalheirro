import Navbar from "@/components/public/Navbar";

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      {children}
    </>
  );
}
