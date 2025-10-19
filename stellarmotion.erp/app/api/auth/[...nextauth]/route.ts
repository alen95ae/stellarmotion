import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Usuario mock para desarrollo
const mockUser = {
  id: "1",
  email: "admin@stellarmotion.io",
  name: "Administrador",
  password: "admin123",
  role: "admin",
  partnerId: null
}

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
        password: { label: "Password", type: "password" } 
      },
      async authorize(creds) {
        console.log('Auth attempt:', creds?.email)
        
        if (!creds?.email || !creds?.password) {
          console.log('Missing credentials')
          return null
        }
        
        // Verificar credenciales mock
        if (creds.email === mockUser.email && creds.password === mockUser.password) {
          console.log('Auth successful')
          return { 
            id: mockUser.id, 
            email: mockUser.email, 
            name: mockUser.name, 
            role: mockUser.role,
            partnerId: mockUser.partnerId 
          }
        }
        
        console.log('Auth failed - invalid credentials')
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.partnerId = user.partnerId
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub
      if (token?.role) session.user.role = token.role
      if (token?.partnerId) session.user.partnerId = token.partnerId
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
