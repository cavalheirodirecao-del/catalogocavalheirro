import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("afiliados", ...publicPages["afiliados"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
