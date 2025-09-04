import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import PostgresAdapter from '@auth/pg-adapter'
import { Pool } from '@neondatabase/serverless'
import { neon } from '@neondatabase/serverless'
import nodemailer from 'nodemailer'

const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  // Remove adapter for now to focus on getting basic auth working
  // adapter: PostgresAdapter(new Pool({ connectionString: process.env.DATABASE_URL })),
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
    // EmailProvider temporarily disabled until we fix adapter compatibility
    /*
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        try {
          const transporter = nodemailer.createTransport({
            host: provider.server.host,
            port: provider.server.port,
            secure: false,
            auth: {
              user: provider.server.auth.user,
              pass: provider.server.auth.pass
            }
          })

          await transporter.sendMail({
            from: `"Reschool" <${provider.from}>`,
            to: email,
            subject: 'Log ind på Reschool',
            text: `Log ind på Reschool\n\nKlik på dette link for at logge ind:\n${url}\n\nDette link udløber om 24 timer af sikkerhedshensyn.\n\nHvis du ikke har anmodet om dette login, kan du ignorere denne email.\n\nVenlig hilsen,\nReschool-teamet\nPå vej til større trivsel`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Log ind på Reschool</title>
                  <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .header { text-align: center; background: #1976d2; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Reschool</h1>
                      <p>På vej til større trivsel</p>
                    </div>
                    <div class="content">
                      <h2>Log ind på Reschool</h2>
                      <p>Hej!</p>
                      <p>Klik på knappen nedenfor for at logge ind på din Reschool-konto:</p>
                      <a href="${url}" class="button">Log ind nu</a>
                      <p>Eller kopier og indsæt dette link i din browser:</p>
                      <p style="word-break: break-all; color: #1976d2;">${url}</p>
                      <p><strong>Vigtigt:</strong> Dette link udløber om 24 timer af sikkerhedshensyn.</p>
                      <p>Hvis du ikke har anmodet om dette login, kan du bare ignorere denne email.</p>
                    </div>
                    <div class="footer">
                      <p>Venlig hilsen,<br>Reschool-teamet</p>
                      <p>På vej til større trivsel</p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        } catch (error) {
          console.error('Failed to send email:', error)
          throw new Error('Failed to send verification email')
        }
      }
    })
    */
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.child_id = user.child_id
        token.child_name = user.child_name
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && token.sub) {
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
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
