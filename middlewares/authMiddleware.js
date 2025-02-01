const jwt = require('jsonwebtoken')

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token)

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, ACCESS_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
            return next();
        }

        console.log("verification start")

        if (err.name === "TokenExpiredError") {
            const refreshToken = req.cookies.refreshToken;
            console.log("expired")
            if (!refreshToken) {
                return res.status(401).json({ message: "please login again" })
            }

            jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).json({ message: "invalid refresh token. pls login again" })
                }

                const newAccessToken = jwt.sign({ email: decoded.email }, REFRESH_SECRET, { expiresIn: '1d' });
                console.log("new tokens", token, newAccessToken)
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.user = user;
                return next();
            })
        } else {
            console.log(err)
            return res.status(403).json({ message: "invalid access token" })
        }
    })
}

module.exports = authenticateToken;
