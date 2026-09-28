import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("blog", ...publicPages["blog"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
