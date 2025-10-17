import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Usuario mock para desarrollo
const mockUser = {
  id: "1",
  email: "admin@stellarmotion.com",
  name: "Administrador",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  role: "admin",
  partnerId: null
}

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
        
        // Verificar credenciales mock
        if (creds.email === mockUser.email && creds.password === "password") {
          return { 
            id: mockUser.id, 
            email: mockUser.email, 
            name: mockUser.name, 
            role: mockUser.role,
            partnerId: mockUser.partnerId 
          }
        }
        
        return null
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
