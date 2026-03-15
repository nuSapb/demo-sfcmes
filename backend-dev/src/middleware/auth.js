const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const jwtVerify = promisify(jwt.verify);

const auth = async (req, res, next) => {

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        req.user = null; // Set user to null for public routes
        return next();
    }

    try {
        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;