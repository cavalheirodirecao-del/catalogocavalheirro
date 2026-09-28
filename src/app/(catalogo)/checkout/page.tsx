import { exclusiveAccess } from "@/lib/exclusive-access";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
export const dynamic = "force-dynamic";
export default async function CheckoutPage({searchParams}:{searchParams:{catalogo?:string}}) {
 if (searchParams.catalogo === "FABRICA" && !await exclusiveAccess()) redirect("/acesso-exclusivo");
 return <CheckoutClient/>;
}
