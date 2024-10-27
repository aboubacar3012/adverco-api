const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const middleware = require("../utils/middleware");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const User = require("../model/user.model");
const Client = require("../model/client.model");

// send sms
// router.post("/sendsms", async (request, response) => {
//   try {
//     const accountSid = PROCESS.ENV.TWILIO_ACCOUNT_SID;
//     const authToken = PROCESS.ENV.TWILIO_AUTH_TOKEN;
//     const client = require('twilio')(accountSid, authToken);

//     client.messages
//       .create({
//         body: 'ljl',
//         from: '+12294045562',
//         to: '+33758020980'
//       })
//       .then(message => console.log(message.sid));

//   } catch (e) {
//     return response.status(200).json({ success: false, error: e.message });
//   }
// });

// Get all users
router.get("/", async (request, response) => {
  try {
    const users = await User.find()
      .populate("clientId")
      // sort by updatedAt
      .sort({ createdAt: -1 })
      .lean();
    response.json({
      success: true,
      users,
    });
  }
  catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// get user by ID
router.get("/:id", middleware.isAuthenticated, (request, response) => {
  try {
    const userId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(userId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet utilisateur n'existe pas",
      });

    User.findById(userId)
      .populate("clientId")
      // .lean()
      .then((users) => {
        if (users) {
          return response.status(200).json({ sucess: true, users });
        } else {
          return response
            .status(200)
            .json({ success: false, message: "Utilisateur non trouvé" });
        }
      });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Create a new user
router.post("/create", async (request, response) => {
  try {
    if (!request.body) {
      return response
        .status(200)
        .json({ success: false, message: "Veuillez remplir tous les champs" });
    }
    const { firstName, lastName, email, role, phone, password, clientId } =
      request.body;
    const findUser = await User.findOne({ email });
    if (findUser) {
      return response.status(200).json({
        success: false,
        message: "Ce utilisateur est déjà enregistré",
        user: findUser,
      });
    }
    const user = new User({
      firstName,
      lastName,
      email,
      role,
      phone,
      password,
      clientId,
    });

    const client = await Client.findById(clientId);
    if (client) {
      client?.users?.push(user._id);
      await client.save();
      await user.save();
      // console.log(client);
      // console.log(user);
      response.json({ success: true, user });
    }


  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Login
router.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email }).populate("clientId");

    if (!user) {
      return response.json({
        success: false,
        message: "Aucun utilisateur trouvé avec cet email",
      });
    }

    if (!user.isActive) {
      return response.json({
        success: false,
        message: "Votre compte a été désactivé, veuillez contacter l'administrateur",
      });
    }

    // vérifier si c'est le premier login
    if (user.isFirstLogin) {
      // vérifier si le mot de passe est correct
      if (user.password === password) {
        return response.json({
          success: true,
          message: "Vous devez changer votre mot de passe",
          user,
        });
      }
    }

    // cela signifie que c'est pas le premier login
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.SECRET_KEY || "adverco_key",
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );

      return response.status(200).json({
        success: true,
        user: user,
        message: "Connexion reussie avec success",
        token,
      });
    }

    return response.json({
      success: false,
      message: "Email ou Mot de passe incorrect",
    });
  } catch (error) {
    return response.status(200).json({ success: false, error: error.message });
  }
});

// Change password after first login
router.put("/updatepassword/:id", (request, response) => {
  try {
    const userId = request.params.id;
    const { password } = request.body;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(userId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet utilisateur n'existe pas",
      });

    User.findByIdAndUpdate(
      userId,
      { hashedPassword, isFirstLogin: false },
      { new: true }
    ).then((updated) => {
      if (updated)
        return response.status(200).json({
          user: updated,
          success: true,
          message: "Mise a jour du mot de passe reussie avec success",
        });
      else
        return response
          .status(200)
          .json({ success: false, message: "Utilisateur non trouvé" });
    });
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Reset password
router.post(
  "/resetpassword",
  middleware.isAuthenticated,
  (request, response) => {
    try {
      const { email } = request.body;
      // check if user exist
      User.findOne({ email: email }).then((user) => {
        if (!user) {
          return response.status(200).json({
            success: false,
            message: "Aucun utilisateur trouvé avec cet email",
          });
        }
        // generate random password of 12 characters
        const password = Math.random().toString(36).slice(-12); // generate random password of 12 characters
        user.password = password;
        user.isFirstLogin = true;
        user.save().then(() => {
          return response.status(200).json({
            success: true,
            message: "Mot de passe réinitialisé avec succès",
            password,
          });
        });
      });

      return response.status(200).json({
        success: false,
        message: "Aucun utilisateur trouvé avec cet email",
      });
    } catch (e) {
      return response.status(200).json({ success: false, error: e.message });
    }
  }
);

// Update user
// middleware.isAuthenticated,
router.put("/update/:id", (request, response) => {
  try {
    const userId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(userId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet utilisateur n'existe pas",
      });

    User.findByIdAndUpdate(userId, { ...request.body }, { new: true }).then(
      (updated) => {
        if (updated)
          return response.status(200).json({
            user: updated,
            success: true,
            message: "Mise a jour reussie avec success",
          });
        else
          return response
            .status(200)
            .json({ success: false, message: "Utilisateur non trouvé" });
      }
    );
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Delete user
// middleware.isAuthenticated,
router.delete("/:id", (request, response) => {
  try {
    const userId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(userId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet utilisateur n'existe pas",
      });

    User.findByIdAndRemove(userId).then((deletedUser) => {
      if (deletedUser)
        return response.status(200).json({
          success: true,
          message: "Utilisateur supprimé avec succès",
        });
      else
        return response
          .status(200)
          .json({ success: false, message: "Utilisateur non trouvé" });
    });
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

module.exports = router;
