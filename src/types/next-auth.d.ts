import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      child_id?: number
      child_name?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    child_id?: number
    child_name?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    child_id?: number
    child_name?: string
  }
}
