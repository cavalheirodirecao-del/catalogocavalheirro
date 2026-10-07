import CheckoutClient from "./CheckoutClient";
export const dynamic = "force-dynamic";
export default async function CheckoutPage({searchParams}:{searchParams:{catalogo?:string}}) {
 return <CheckoutClient/>;
}
