import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("franquia", ...publicPages["franquia"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
