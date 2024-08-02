const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Campaign = require("../model/campaign.model");

// Get all campaigns
router.get("/", async (request, response) => {
  try {
    const campaigns = await Campaign.find()
      .populate("partnerId")
      // sort by updatedAt
      .sort({ createdAt: -1 })
      .lean();
    response.json({
      success: true,
      campaigns,
    });
  }
  catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// get campaign by ID
// middleware.isAuthenticated
router.get("/:id", (request, response) => {
  try {
    const campaignId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(campaignId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet campaign n'existe pas",
      });

    Campaign.findById(campaignId)
      .populate("partnerId")
      .lean()
      .then((campaign) => {
        if (campaign) {
          return response.status(200).json({ success: true, campaign });
        } else {
          return response
            .status(200)
            .json({ success: false, message: "Camapagne non trouvé" });
        }
      });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Create a new campaign
router.post("/create", async (request, response) => {
  try {
    if (!request.body) {
      return response
        .status(200)
        .json({ success: false, message: "Veuillez remplir tous les champs" });
    }
    const {
      name,
      description,
      status,
      partnerId,
      objective,
      tool,
      budget,
      startDate,
      endDate,
      city,
      zones,
      numberOfTrucks,
      numberOfFaces,
    } = request.body;
    
    const campaign = new Campaign({
      name,
      description,
      status,
      partnerId,
      objective,
      tool,
      budget,
      startDate,
      endDate,
      city,
      zones,
      numberOfTrucks,
      numberOfFaces,
    });

    await campaign.save();
    response.json({ success: true, campaign });
  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});


// Update campaign
// middleware.isAuthenticated,
router.put("/update/:id", (request, response) => {
  try {
    const campaignId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(campaignId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cette campaign n'existe pas",
      });

    Campaign.findByIdAndUpdate(campaignId, { ...request.body }, { new: true }).then(
      (updated) => {
        if (updated)
          return response.status(200).json({
            campaign: updated,
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

// Add data to campaign
router.put("/update/data/:id", async (request, response) => {
  try {
    const campaignId = request.params.id;
    const data = request.body;

    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(campaignId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cette campaign n'existe pas",
      });

      const campaign = await Campaign.findById(campaignId);

      if (!campaign) {
        return response.status(404).json({ success: false, message: "Campagne non trouvé" });
      }

      // Filtrer les données pour vérifier les duplications
    const existingData = campaign.data;
    let newData = [];
    for (let i = 0; i < existingData.length; i++) {
      const foundDuplicate = data.find((data) => data.startDate === existingData[i].startDate && data.endDate === existingData[i].endDate);
      if (!foundDuplicate) {
        newData.push(existingData[i]);
      }else{
        return response.status(200).json({ success: false, message: "Vous essayez d'insérer des données qui existent déjà" });
      }
    }
      
    // Ajouter les nouvelles données
    campaign.data.push(...newData);

    // Sauvegarder la campagne mise à jour
    const updatedCampaign = await campaign.save();

    return response.status(200).json({
      campaign: updatedCampaign,
      success: true,
      message: "Mise à jour réussie avec succès",
    });

  } catch (e) {
    return response.status(200).json({ success: false, error: e.message });
  }
});

// Delete campaign
// middleware.isAuthenticated,
router.delete("/delete/:id",  (request, response) => {
  try {
    const campaignId = request.params.id;
    // verifier si l'id est valid
    if (!mongoose.isValidObjectId(campaignId))
      return response.status(200).json({
        success: false,
        message: "l'ID de cet campaign n'existe pas",
      });

    Campaign.findByIdAndRemove(campaignId).then((deletedCampaign) => {
      if (deletedCampaign)
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
