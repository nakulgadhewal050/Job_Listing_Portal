import jwt from 'jsonwebtoken';


export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
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