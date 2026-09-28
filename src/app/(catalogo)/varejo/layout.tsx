import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("varejo", ...publicPages["varejo"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
