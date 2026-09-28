import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/admin/Sidebar";
import SessionWrapper from "@/components/admin/SessionWrapper";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const activeUser = await prisma.usuario.findFirst({ where: { id: (session.user as any).id, ativo: true }, select: { perfil: true } });
  if (!activeUser) redirect("/login");
  if (activeUser.perfil === "AFILIADO") redirect("/afiliados/dashboard");

  return (
    <SessionWrapper session={session}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </SessionWrapper>
  );
}
