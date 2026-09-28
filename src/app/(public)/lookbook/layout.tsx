import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("lookbook", ...publicPages["lookbook"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
