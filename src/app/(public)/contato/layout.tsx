import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("contato", ...publicPages["contato"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
