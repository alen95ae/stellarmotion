import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { findUserByEmailSupabase, updateLastAccessSupabase } from "@/lib/supabaseUsers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-12345",
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) {
          return null
        }

        const email = creds.email.trim().toLowerCase()
        const user = await findUserByEmailSupabase(email)
        if (!user) {
          return null
        }
        const passwordHash = user.fields?.PasswordHash
        if (!passwordHash) {
          return null
        }

        const ok = await bcrypt.compare(creds.password, passwordHash)
        if (!ok) {
          return null
        }

        try {
          await updateLastAccessSupabase(user.id)
        } catch {
          // ignore
        }

        let roleName = user.fields.Rol || "client"
        const rolId = user.fields.RolId
        if (rolId) {
          const { data: roleData } = await supabaseAdmin
            .from("roles")
            .select("nombre")
            .eq("id", rolId)
            .single()
          if (roleData?.nombre) {
            roleName = roleData.nombre
          }
        }

        return {
          id: user.id,
          email: user.fields.Email,
          name: user.fields.Nombre ?? undefined,
          role: roleName,
          ownerId: null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.ownerId = user.ownerId
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub
      if (token?.role) session.user.role = token.role
      if (token?.ownerId) session.user.ownerId = token.ownerId
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
