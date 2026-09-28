import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("atacado", ...publicPages["atacado"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
