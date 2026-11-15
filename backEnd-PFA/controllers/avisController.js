const Avis = require('../models/avisModel');
const User = require('../models/userModel');

// @desc    Get all avis for a specific item
// @route   GET /api/avis/:type/:id
// @access  Public
const getAvisByItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const query = { type_avis: type };
        
        switch (type.toLowerCase()) {
            case 'lieu': query.id_lieu = isNaN(Number(id)) ? id : Number(id); break;
            case 'match': query.id_match = isNaN(Number(id)) ? id : Number(id); break;
            case 'activite': query.id_activite = isNaN(Number(id)) ? id : Number(id); break;
            case 'itineraire': query.id_itineraire = isNaN(Number(id)) ? id : Number(id); break;
            case 'service': query.id_service = isNaN(Number(id)) ? id : Number(id); break;
            default: return res.status(400).json({ message: "Type d'avis invalide" });
        }

        const avis = await Avis.find(query).sort({ date_avis: -1 }).lean();
        
        for (let a of avis) {
            if (!a.user_name || a.user_name === "Utilisateur") {
                try {
                    const user = await User.findById(a.ID_USER);
                    a.user_name = user ? user.nom_user : "Utilisateur";
                } catch(e) {
                    a.user_name = "Utilisateur";
                }
            }
        }
        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all avis by a specific user
// @route   GET /api/avis/user
// @access  Private
const getMyAvis = async (req, res) => {
    try {
        const avis = await Avis.find({ ID_USER: req.user.id }).sort({ date_avis: -1 });
        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new avis
// @route   POST /api/avis
// @access  Private
const createAvis = async (req, res) => {
    try {
        const { note_avis, commentaire_avis, type_avis, item_id, photos_url_avis, item_title } = req.body;

        if (!note_avis || !commentaire_avis || !type_avis || !item_id) {
            return res.status(400).json({ message: "Veuillez fournir une note, un commentaire et l'identifiant de l'élément respectif." });
        }

        const user = await User.findById(req.user.id);
        const newAvisData = {
            note_avis,
            commentaire_avis,
            type_avis,
            photos_url_avis: photos_url_avis || "",
            item_title: item_title || "",
            user_name: user ? user.nom_user : "Utilisateur",
            ID_USER: req.user.id,
            id_avis: Date.now() // Simple unique ID generator
        };

        switch (type_avis.toLowerCase()) {
            case 'lieu': newAvisData.id_lieu = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'match': newAvisData.id_match = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'activite': newAvisData.id_activite = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'itineraire': newAvisData.id_itineraire = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'service': newAvisData.id_service = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            default: return res.status(400).json({ message: "Type d'avis invalide" });
        }

        const avis = await Avis.create(newAvisData);
        res.status(201).json(avis);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an avis
// @route   DELETE /api/avis/:id
// @access  Private
const deleteAvis = async (req, res) => {
    try {
        const avis = await Avis.findById(req.params.id);

        if (!avis) {
            return res.status(404).json({ message: "Avis non trouvé" });
        }

        // Only author can delete
        if(String(avis.ID_USER) !== String(req.user.id)) {
            return res.status(401).json({ message: "Non autorisé à supprimer cet avis" });
        }

        await Avis.deleteOne({ _id: avis._id });
        res.status(200).json({ message: "Avis supprimé avec succès", id: req.params.id });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an avis
// @route   PUT /api/avis/:id
// @access  Private
const updateAvis = async (req, res) => {
    try {
        const { note_avis, commentaire_avis } = req.body;
        const avis = await Avis.findById(req.params.id);

        if (!avis) {
            return res.status(404).json({ message: "Avis non trouvé" });
        }

        // Only author can update
        if(String(avis.ID_USER) !== String(req.user.id)) {
            return res.status(401).json({ message: "Non autorisé à modifier cet avis" });
        }

        if (note_avis) avis.note_avis = note_avis;
        if (commentaire_avis) avis.commentaire_avis = commentaire_avis;

        const updatedAvis = await avis.save();
        res.status(200).json(updatedAvis);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAvisByItem,
    getMyAvis,
    createAvis,
    deleteAvis,
    updateAvis
};
