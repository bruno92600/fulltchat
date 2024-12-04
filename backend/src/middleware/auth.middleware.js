import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ message: "Aucun token n'est fourni" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Token invalide" });
        }

        const user = await User.findById(decoded.userId).select("-password")
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        req.user = user

        next()

    } catch (error) {
        console.log("Erreur dans la protectRoute middleware", error.message)
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}