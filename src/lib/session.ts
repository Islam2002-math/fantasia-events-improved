import { sealData, unsealData } from 'iron-session'

export type SessionData = {
  userId?: string
  email?: string
}

const devFallbackSecret = 'dev-secret-0123456789abcdef0123456789abcd' // 40 chars
const password = (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32)
  ? process.env.SESSION_SECRET
  : devFallbackSecret

export const sessionOptions = {
  cookieName: 'fantasia_session',
  password: password,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function setSession<T extends SessionData>(data: T) {
  return sealData(data, sessionOptions)
}

export async function getSession<T extends SessionData>(sealed: string) {
  return unsealData<T>(sealed, sessionOptions)
}
