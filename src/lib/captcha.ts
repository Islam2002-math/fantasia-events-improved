export async function verifyHCaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET
  // In development or when secret is not set, bypass verification to unblock flows
  if (!secret || process.env.NODE_ENV !== 'production') {
    return { success: true }
  }
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })
  const data = (await res.json()) as { success: boolean }
  return data
}
