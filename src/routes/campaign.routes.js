const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Campaign = require("../model/campaign.model");
const Client = require("../model/client.model");

// Get all campaigns
router.get("/", async (request, response) => {
  try {
    const campaigns = await Campaign.find()
      .populate("clientId")
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
      .populate("clientId")
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
      clientId,
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
      clientId,
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

    const client = await Client.findById(clientId);
    if (!client) {
      return response.status(404).json({ success: false, message: "Client non trouvé" });
    }
    client.campaigns.push(campaign._id);
    await Promise.all([campaign.save(), client.save()]);
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

// Route pour mettre à jour les données de la campagne
router.put('/update/data/:id', async (request, response) => {
  try {
    const campaignId = request.params.id;
    const data = request.body;

    // Vérifier si l'id est valide
    if (!mongoose.isValidObjectId(campaignId)) {
      return response.status(400).json({
        success: false,
        message: "L'ID de cette campagne est invalide",
      });
    }

    const campaign = await Campaign.findById(campaignId).lean();

    if (!campaign) {
      return response.status(404).json({
        success: false,
        message: "Campagne non trouvée",
      });
    }

    // Vérifier si campaign.data existe, sinon le créer
    if (!campaign.data) {
      campaign.data = [];
    }

    // Filtrer les données pour vérifier les duplications
    const existingData = campaign.data;
    console.log(existingData.length);
    console.log(data.length);
    let newData = [];
    let foundDuplicate = null;
    if (existingData && existingData.length > 0) {
      for (let i = 0; i < data.length; i++) {
        foundDuplicate = existingData.find(
          (existingData) =>
            existingData.startDate === data[i].startDate &&
            existingData.endDate === data[i].endDate &&
            existingData.address === data[i].address &&
            existingData.duration === data[i].duration &&
            existingData.distance === data[i].distance &&
            existingData.vehicleId === data[i].vehicleId &&
            existingData.date === data[i].date &&
            existingData.latitude === data[i].latitude &&
            existingData.longitude === data[i].longitude
        );
        console.log(foundDuplicate);
        if (foundDuplicate) return response.status(200).json({ success: false, message: "Vous essayez d'insérer des données qui existent déjà" });
        if (!foundDuplicate) newData.push(data[i])
      }
    } else {
      newData = data;
    }



    // Ajouter les nouvelles données
    campaign.data.push(...newData);

    // Sauvegarder la campagne mise à jour
    // enlever lean() pour pouvoir modifier la campagne
    const updatedCampaign = await Campaign.findByIdAndUpdate(campaignId, { data: campaign.data }, { new: true });

    return response.status(200).json({
      campaign: updatedCampaign,
      success: true,
      message: "Mise à jour réussie avec succès",
    });
  } catch (e) {
    return response.status(500).json({ success: false, error: e.message });
  }
});


// Update report
router.put("/update/report/:id", async (request, response) => {
  try {
    const campaignId = request.params.id;
    const report = request.body;

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

    campaign.report = report;

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
router.delete("/delete/:id", (request, response) => {
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
