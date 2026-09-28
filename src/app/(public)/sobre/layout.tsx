import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("sobre", ...publicPages["sobre"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
