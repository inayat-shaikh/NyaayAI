import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('=== AUTH DEBUG: Authorize function called ===')
          console.log('Email:', credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            console.log('AUTH DEBUG: Missing credentials')
            return null
          }

          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              profile: true
            }
          })

          if (!user) {
            console.log('AUTH DEBUG: User not found:', credentials.email)
            return null
          }

          if (!user.isActive) {
            console.log('AUTH DEBUG: User not active:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('AUTH DEBUG: Invalid password for:', credentials.email)
            return null
          }

          console.log('AUTH DEBUG: Authentication successful for:', credentials.email)
          console.log('AUTH DEBUG: User role:', user.role)

          // Update last login time
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          const userToReturn = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            courtId: user.courtId,
            profile: user.profile
          }
          
          console.log('AUTH DEBUG: Returning user object:', userToReturn)
          return userToReturn
        } catch (error) {
          console.error('AUTH DEBUG: Error in authorize function:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('AUTH DEBUG: JWT callback - token:', token, 'user:', user)
      
      if (user) {
        token.role = user.role
        token.courtId = user.courtId
        token.profile = user.profile
        console.log('AUTH DEBUG: JWT token updated with user data')
      }
      
      console.log('AUTH DEBUG: JWT token final:', token)
      return token
    },
    async session({ session, token }) {
      console.log('AUTH DEBUG: Session callback - session:', session, 'token:', token)
      
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.courtId = token.courtId as string
        session.user.profile = token.profile as any
        console.log('AUTH DEBUG: Session updated with token data')
      }
      
      console.log('AUTH DEBUG: Final session:', session)
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}