import { pageMetadata, publicPages } from "@/lib/seo";
export const metadata = pageMetadata("trabalhe-conosco", ...publicPages["trabalhe-conosco"]);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
