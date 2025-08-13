import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    keyGenerator: (req, res) => {
        return req.ip + req.path
    },
    standardHeaders: true,
    legacyHeaders: true,
    message: "Too many requests for this resource, please try again sometime later"
})