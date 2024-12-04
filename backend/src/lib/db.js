import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB est connecter: ${conn.connection.host}`)
    } catch (error) {
        console.log("Erreir de connection a mongodb:", error)
    }
}