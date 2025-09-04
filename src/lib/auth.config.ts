import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import PostgresAdapter from "@auth/pg-adapter"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"

const sql = neon(process.env.DATABASE_URL!)

export const authConfig: NextAuthConfig = {
  adapter: PostgresAdapter(sql),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // Custom Danish email template
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url)
        
        const transport = nodemailer.createTransport(provider.server)
        
        await transport.sendMail({
          to: email,
          from: `Reschool <${provider.from}>`,
          subject: `Log ind på Reschool`,
          text: `Log ind på Reschool\n${url}\n\n`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Reschool</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">På vej til større trivsel</p>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Log ind på din konto</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.5;">
                  Hej! Klik på knappen nedenfor for at logge ind på Reschool.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Log ind på Reschool
                  </a>
                </div>
                
                <p style="color: #999; font-size: 14px; line-height: 1.5;">
                  Hvis du ikke anmodede om denne email, kan du roligt ignorere den.
                </p>
                
                <p style="color: #999; font-size: 14px; margin-top: 30px;">
                  Link udløber om 24 timer af sikkerhedsmæssige årsager.
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2025 Reschool - På vej til større trivsel
                </p>
              </div>
            </div>
          `,
        })
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Adgangskode", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await sql`
            SELECT id, name, email, role, is_active 
            FROM users 
            WHERE email = ${credentials.email} AND is_active = true
          `
          
          const user = result[0]
          if (!user) {
            return null
          }

          // Here you would verify the password
          // For now, we'll create the user if they don't exist
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
}
