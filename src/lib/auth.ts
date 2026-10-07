import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 horas
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
        lojaId: { label: "Filial", type: "text" },
      },
      async authorize(credentials) {
        // Aceita tanto "senha" (login admin) quanto "password" (login afiliado)
        const senhaInput = (credentials as any)?.password ?? credentials?.senha;
        if (!credentials?.email || !senhaInput) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          select: {
            id: true, nome: true, email: true, senha: true, perfil: true, ativo: true,
            vendedor: { select: { slug: true, lojaId: true } },
          },
        });

        if (!usuario || !usuario.ativo) return null;
        const lojaId = String((credentials as any)?.lojaId ?? "");
        if (usuario.vendedor?.lojaId && usuario.vendedor.lojaId !== lojaId) return null;

        const senhaValida = await bcrypt.compare(senhaInput, usuario.senha);
        if (!senhaValida) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          vendedorSlug: usuario.vendedor?.slug ?? null,
          lojaId: usuario.vendedor?.lojaId ?? (lojaId || null),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.perfil = (user as any).perfil;
        token.vendedorSlug = (user as any).vendedorSlug;
        token.lojaId = (user as any).lojaId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).perfil = token.perfil;
        (session.user as any).vendedorSlug = token.vendedorSlug;
        (session.user as any).lojaId = token.lojaId;
      }
      return session;
    },
  },
};
