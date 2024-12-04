import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {

    if(!fullName || !email || !password) {
        return res
        .status(400)
        .json({
          message:
            "Touts les chapms doivent etre remplis",
        });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          message:
            "Un minimum de six caractères est requis pour le mot de passe",
        });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "Cette adresse email est déjà utilisée" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Erreur dans le signup controller", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const login = async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Cette adresse email n'existe pas" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    generateToken(user._id, res)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    })

  } catch (error) {
    console.log("Erreur dans le login controller", error.message)
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge:0})
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.log("Erreur dans le logout controller", error.message)
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const updateProfile = async (req, res) => {
  try {

    const { profilePic } = req.body
    const userId = req.user._id

    if (!profilePic) {
      return res.status(400).json({ message: "Veuillez fournir une image de profil" })
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

    res.status(200).json(updatedUser)

  } catch (error) {
    console.log("Erreur dans le updateProfile controller", error.message)
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log("Erreur dans le checkAuth route", error.message)
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}