import { Suspense } from "react";
import VisitTracker from "@/components/catalogo/VisitTracker";
import Navbar from "@/components/public/Navbar";

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}><VisitTracker /></Suspense>
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      {children}
    </>
  );
}
