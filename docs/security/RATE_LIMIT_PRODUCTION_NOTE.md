# Rate Limiting - Production Note

## Current Implementation

MenuxPRO currently uses **in-memory rate limiting** via JavaScript `Map()`:

```typescript
// src/middleware.ts
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
```

## Limitations

### 1. **Data Loss on Restart**
- Every server restart, redeploy, or crash clears the rate limit store
- Attackers can exploit deployment windows to bypass limits
- Users may not be rate-limited during the first few seconds after deployment

### 2. **No Horizontal Scaling Support**
- Multiple server instances have independent rate limit stores
- Load-balanced requests may bypass limits (each instance counts separately)
- A user could make `rateLimit * instanceCount` requests

### 3. **Memory Growth**
- Map grows indefinitely until cleanup
- High traffic could cause memory pressure
- No disk persistence or overflow handling

## Production Recommendations

### Option 1: Redis (Recommended)

```typescript
// Example implementation
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.pexpire(key, windowMs);
  }
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetTime: Date.now() + (await redis.pttl(key)),
  };
}
```

**Providers:**
- [Upstash Redis](https://upstash.com/) - Serverless, works with Vercel
- [Redis Cloud](https://redis.com/cloud/) - Managed Redis
- Self-hosted Redis on your infrastructure

### Option 2: Vercel KV (If on Vercel)

```typescript
import { kv } from '@vercel/kv';

// Similar API to Redis
const current = await kv.incr(key);
```

### Option 3: Firestore (Stopgap)

For low-traffic apps, use Firestore with TTL:

```typescript
// Simple Firestore-based rate limiting
// Note: Higher latency, not recommended for high traffic
const doc = await db.collection('rate_limits').doc(key).get();
// ... implement logic
```

## Migration Checklist

1. [ ] Choose rate limit store provider (Redis, Upstash, Vercel KV)
2. [ ] Add provider credentials to environment variables
3. [ ] Create `RateLimitStore` interface in code
4. [ ] Replace `Map()` with persistent store
5. [ ] Test with multiple concurrent requests
6. [ ] Test rate limit persistence across redeployments
7. [ ] Monitor rate limit metrics in production

## Priority Level

**HIGH** - Should be addressed before production scaling to multiple instances.

For MVP / single-instance deployment, the current implementation is acceptable but should be monitored.

---

*Last updated: 2025-01-09*
