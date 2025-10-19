import nodemailer from 'nodemailer'

export function getTransport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT || 587)
  if (!host || !user || !pass) return null
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
}

export async function sendTicketEmail(to: string, subject: string, html: string) {
  const transport = getTransport()
  if (!transport) return false
  const from = process.env.FROM_EMAIL || 'no-reply@example.com'
  await transport.sendMail({ from, to, subject, html })
  return true
}