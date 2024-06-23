import { rateLimit } from 'express-rate-limit';

export function limiter(limit = 3, windowSec = 10) {
  return rateLimit({
    windowMs: windowSec * 1000, // defualt 10 seconds
    limit, // Limit each IP to 2 requests per `window`
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  });
}
