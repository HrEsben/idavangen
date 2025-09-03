import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if user exists in our database
          const users = await sql`
            SELECT 
              u.id, u.name, u.email, u.role, u.child_id, u.is_active,
              c.name as child_name
            FROM users u
            LEFT JOIN children c ON u.child_id = c.id
            WHERE u.email = ${credentials.email} AND u.is_active = true
          `

          if (users.length === 0) {
            return null
          }

          const user = users[0]

          // For now, we'll accept any password for existing users
          // TODO: Add proper password hashing when users are created
          
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            child_id: user.child_id,
            child_name: user.child_name
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.child_id = user.child_id
        token.child_name = user.child_name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.child_id = token.child_id
        session.user.child_name = token.child_name
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const
  }
}

export default NextAuth(authOptions)
