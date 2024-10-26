const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Client = require("../model/client.model");

// Get all clients
router.get("/", async (request, response) => {
  try {
    const clients = await Client.find()
      .populate("users")
      // sort by updatedAt
      .sort({ createdAt: -1 })
      .lean();
    response.json({
      success: true,
      clients,
    });
  }
  catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Get client by ID
router.get("/:id", async (request, response) => {
  try {
    const clientId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(clientId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet client n'existe pas",
      });

    const client = await Client.findById(clientId)
      .populate("users")
      .populate("campaigns")
      .lean(); // convert to json
    if (client) {
      return response.status(200).json({ success: true, client });
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

// get client by ID
// router.get("/:id", middleware.isAuthenticated, (request, response) => {
//   try {
//     const clientId = request.params.id;
//     // verifier si l'id est valid
//     if (!mongoose.isValidObjectId(clientId))
//       return response.status(200).json({
//         success: false,
//         message: "l'ID de cet client n'existe pas",
//       });

//     Client.findById(clientId)
//       .populate("clientId")
//       // .lean()
//       .then((clients) => {
//         if (clients) {
//           return response.status(200).json({ sucess: true, clients });
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

// Create a new client
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
    const findClient = await Client.findOne({ email });

    if (findClient) {
      return response.status(200).json({
        success: false,
        message: "Ce client est déjà enregistré",
        client: findClient,
      });
    }

    const client = new Client({
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

    await client.save();
    response.json({ success: true, client });
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});


// Update client
// middleware.isAuthenticated,
router.put("/update/:id", (request, response) => {
  try {
    const clientId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(clientId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet client n'existe pas",
      });

    Client.findByIdAndUpdate(clientId, { ...request.body }, { new: true }).then(
      (updated) => {
        if (updated)
          return response.status(200).json({
            client: updated,
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

// Delete client
// middleware.isAuthenticated,
router.delete("/delete/:id", (request, response) => {
  try {
    const clientId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(clientId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet client n'existe pas",
      });

    Client.findByIdAndRemove(clientId).then((deletedClient) => {
      if (deletedClient)
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
    const clientId = request.params.id;
    const type = request.params.type;
    const body = request.body;
    body.createdAt = new Date();
    body.updatedAt = new Date();
    body.type = type;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(clientId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet client n'existe pas",
      });

    const client = await Client.findById(clientId);
    if (!client) {
      return response.status(200).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    if(type !== "invoice" && type !== "contract") {
      return response.status(200).json({
        success: false,
        message: "Type de document invalide",
      });
    }

    if(type === "invoice") {
      client?.invoices.push(body);
    }else if(type === "contract") {
      client?.contracts.push(body);
    }

    const updatedClient = await client?.save();
    
    return response.status(200).json({ success: true, client:updatedClient });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
})

// delete invoice or contract
router.delete("/delete/:type/:clientId/:docId", async (request, response) => {
  try {
    const clientId = request.params.clientId;
    const type = request.params.type;
    const docId = request.params.docId;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(clientId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet client n'existe pas",
      });

    const client = await Client.findById(clientId);
    if (!client) {
      return response.status(200).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    if(type !== "invoice" && type !== "contract") {
      return response.status(200).json({
        success: false,
        message: "Type de document invalide",
      });
    }

    if(type === "invoice") {
      client?.invoices.pull(docId); // cela supprime l'élément du tableau par son id
    }else if(type === "contract") {
      client?.contracts.pull(docId);
    }

    const updatedClient = await client?.save();
    
    return response.status(200).json({ success: true, client:updatedClient });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
})

module.exports = router;
