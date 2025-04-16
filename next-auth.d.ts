import { mongoose } from 'mongoose';
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    departmentId?: string
  }

  interface Session {
    user: {
      id: string
      role: string
      departmentId?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    departmentId?: string
  }
}

declare global {
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}
