import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    try {
        let token = null;

        // Pehle Authorization header check karo (Bearer token)
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            // Fallback: cookie se lo
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'token not found' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Token not verified' });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid' });
    }
}