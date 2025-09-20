import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null
        const user = await prisma.user.findUnique({ where: { email: creds.email } })
        if (!user) return null
        const ok = await bcrypt.compare(creds.password, user.password)
        if (!ok) return null
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role,
          partnerId: user.partnerId 
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.partnerId = user.partnerId
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.sub) session.user.id = token.sub
      if (token?.role) session.user.role = token.role
      if (token?.partnerId) session.user.partnerId = token.partnerId
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
