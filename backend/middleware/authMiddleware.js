import jwt from 'jsonwebtoken';


export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
            ? authHeader.slice(7).trim()
            : null;
        const token = req.cookies.token || bearerToken || req.headers["x-auth-token"];

        if (!token){
            return res.status(401).json({ message: 'token not found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({ message: 'Token not verified' });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid' });
    }
}