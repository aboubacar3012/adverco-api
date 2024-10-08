const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Partner = require("../model/partner.model");

// Get all partners
router.get("/", async (request, response) => {
  try {
    const partners = await Partner.find()
      .populate("users")
      // sort by updatedAt
      .sort({ createdAt: -1 })
      .lean();
    response.json({
      success: true,
      partners,
    });
  }
  catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Get partner by ID
router.get("/:id", async (request, response) => {
  try {
    const partnerId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(partnerId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet partner n'existe pas",
      });

    const partner = await Partner.findById(partnerId)
      .populate("users")
      .populate("campaigns")
      .lean(); // convert to json
    if (partner) {
      return response.status(200).json({ success: true, partner });
    }
    else {
      return response
        .status(200)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// get partner by ID
// router.get("/:id", middleware.isAuthenticated, (request, response) => {
//   try {
//     const partnerId = request.params.id;
//     // verifier si l'id est valid
//     if (!mongoose.isValidObjectId(partnerId))
//       return response.status(200).json({
//         success: false,
//         message: "l'ID de cet partner n'existe pas",
//       });

//     Partner.findById(partnerId)
//       .populate("partnerId")
//       // .lean()
//       .then((partners) => {
//         if (partners) {
//           return response.status(200).json({ sucess: true, partners });
//         } else {
//           return response
//             .status(200)
//             .json({ success: false, message: "Utilisateur non trouvé" });
//         }
//       });

//   } catch (e) {
//     return response.status(200).json({ success: false, error: e.message });
//   }
// });

// Create a new partner
router.post("/create", async (request, response) => {
  try {
    if (!request.body) {
      return response
        .status(200)
        .json({ success: false, message: "Veuillez remplir tous les champs" });
    }
    const {
      logo,
      name,
      description,
      siret,
      capital,
      email,
      phone,
      address,
      postalCode,
      city
    } = request.body;
    const findPartner = await Partner.findOne({ email });

    if (findPartner) {
      return response.status(200).json({
        success: false,
        message: "Ce partner est déjà enregistré",
        partner: findPartner,
      });
    }

    const partner = new Partner({
      logo,
      name,
      description,
      siret,
      capital,
      email,
      phone,
      address,
      postalCode,
      city
    });

    await partner.save();
    response.json({ success: true, partner });
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});


// Update partner
// middleware.isAuthenticated,
router.put("/update/:id", (request, response) => {
  try {
    const partnerId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(partnerId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet partner n'existe pas",
      });

    Partner.findByIdAndUpdate(partnerId, { ...request.body }, { new: true }).then(
      (updated) => {
        if (updated)
          return response.status(200).json({
            partner: updated,
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

// Delete partner
// middleware.isAuthenticated,
router.delete("/delete/:id", (request, response) => {
  try {
    const partnerId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(partnerId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet partner n'existe pas",
      });

    Partner.findByIdAndRemove(partnerId).then((deletedPartner) => {
      if (deletedPartner)
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

// Invoices and Contracts

// Add invoice or contract
router.post("/add/:type/:id", async (request, response) => {
  try {
    const partnerId = request.params.id;
    const type = request.params.type;
    const body = request.body;
    body.createdAt = new Date();
    body.updatedAt = new Date();
    body.type = type;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(partnerId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet partner n'existe pas",
      });

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return response.status(200).json({
        success: false,
        message: "Partenaire non trouvé",
      });
    }

    if(type !== "invoice" && type !== "contract") {
      return response.status(200).json({
        success: false,
        message: "Type de document invalide",
      });
    }

    if(type === "invoice") {
      partner?.invoices.push(body);
    }else if(type === "contract") {
      partner?.contracts.push(body);
    }

    const updatedPartner = await partner?.save();
    
    return response.status(200).json({ success: true, partner:updatedPartner });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
})

// delete invoice or contract
router.delete("/delete/:type/:partnerId/:docId", async (request, response) => {
  try {
    const partnerId = request.params.partnerId;
    const type = request.params.type;
    const docId = request.params.docId;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(partnerId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet partner n'existe pas",
      });

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return response.status(200).json({
        success: false,
        message: "Partenaire non trouvé",
      });
    }

    if(type !== "invoice" && type !== "contract") {
      return response.status(200).json({
        success: false,
        message: "Type de document invalide",
      });
    }

    if(type === "invoice") {
      partner?.invoices.pull(docId); // cela supprime l'élément du tableau par son id
    }else if(type === "contract") {
      partner?.contracts.pull(docId);
    }

    const updatedPartner = await partner?.save();
    
    return response.status(200).json({ success: true, partner:updatedPartner });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
})

module.exports = router;
