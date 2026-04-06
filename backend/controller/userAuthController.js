import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";

const getTokenCookieOptions = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
        path: "/",
        maxAge
    };
};

const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
};

export const Signup = async (req, res) => {
    try {
        const { fullname, email, password, phone, role } = req.body;

        let user = await User.findOne({ email });

        if (!fullname) {
            return res.status(400).json({ message: "Full Name is required" });
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }
        if (!phone) {
            return res.status(400).json({ message: "Mobile Number is required" });
        }
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (phone.length < 10) {
            return res.status(400).json({ message: "Mobile number must be at least 10 characters" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            fullname,
            email,
            password: hashPassword,
            phone,
            role
        })

        const token = await generateToken(user._id);

        res.cookie("token", token, getTokenCookieOptions())

        return res.status(201).json({ ...sanitizeUser(user), token });

    } catch (error) {
        console.log("signin error:", error);
        res.status(500).json({ message: "Error in signup" });
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = await generateToken(user._id);

        res.cookie("token", token, getTokenCookieOptions())


        return res.status(200).json({ ...sanitizeUser(user), token });

    } catch (error) {

        res.status(500).json({ message: "Error in login" });
    }
}

export const Logout = async (req, res) => {
    try {
        res.clearCookie("token", getTokenCookieOptions(0))
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error in logout" })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullname, email, phone, role } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            const token = await generateToken(user._id);

            res.cookie("token", token, getTokenCookieOptions())

            return res.status(200).json({ ...sanitizeUser(user), token });
        }

        if (!role) {
            return res.status(404).json({ message: "User not found. Please sign up first." });
        }

        user = await User.create({
            fullname,
            email,
            phone,
            role
        })

        const token = await generateToken(user._id);

        res.cookie("token", token, getTokenCookieOptions())


        return res.status(200).json({ ...sanitizeUser(user), token });

    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({ message: "Error in Google Auth", error: error.message })
    }
}