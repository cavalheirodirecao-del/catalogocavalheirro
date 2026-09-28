import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("revendedores", ...publicPages["revendedores"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
