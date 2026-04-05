import mongoose from "mongoose";



const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/joblistingportal`);
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Database connection failed:", error);
    }
}

export default connectDB;