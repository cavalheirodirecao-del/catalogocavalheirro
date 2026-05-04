import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Aceita tanto "senha" (login admin) quanto "password" (login afiliado)
        const senhaInput = (credentials as any).password ?? credentials.senha;
        if (!credentials?.email || !senhaInput) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { vendedor: true },
        });

        if (!usuario || !usuario.ativo) return null;

        const senhaValida = await bcrypt.compare(senhaInput, usuario.senha);
        if (!senhaValida) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          vendedorSlug: usuario.vendedor?.slug ?? null,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).perfil = token.perfil;
        (session.user as any).vendedorSlug = token.vendedorSlug;
      }
      return session;
    },
  },
};
