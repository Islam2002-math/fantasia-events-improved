type Bucket = { tokens: number, last: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const bucket = buckets.get(key) || { tokens: limit, last: now }
  const elapsed = now - bucket.last
  const refill = Math.floor(elapsed / windowMs) * limit
  bucket.tokens = Math.min(limit, bucket.tokens + refill)
  bucket.last = refill > 0 ? now : bucket.last
  if (bucket.tokens <= 0) {
    buckets.set(key, bucket)
    return false
  }
  bucket.tokens -= 1
  buckets.set(key, bucket)
  return true
}