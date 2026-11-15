const Favoris = require('../models/favorisModel');
const Lieu = require('../models/lieuModel');
const Match = require('../models/matchModel');
const Activite = require('../models/activiteModel');
const Itineraire = require('../models/itineraireModel');
const Service = require('../models/servicePratiqueModel');
const Culture = require('../models/cultureModel');

// @desc    Get all favoris by a specific user
// @route   GET /api/favoris
// @access  Private
const getMyFavoris = async (req, res) => {
    try {
        const favoris = await Favoris.find({ ID_USER: req.user.id }).sort({ date_ajout: -1 });
        res.status(200).json(favoris);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recommended favoris based on collaborative filtering
// @route   GET /api/favoris/recommendations
// @access  Private
const getRecommendedFavoris = async (req, res) => {
    try {
        const userId = req.user.id;
        // 1. Get my favoris
        const myFavoris = await Favoris.find({ ID_USER: userId });
        if (!myFavoris || myFavoris.length === 0) {
            return res.status(200).json([]);
        }

        const myItemsSet = new Set(myFavoris.map(f => 
            `${f.type_favori}_${f.id_lieu || f.id_match || f.id_activite || f.id_itineraire || f.id_service}`
        ));

        // 2. Get all other users' favoris
        const otherFavoris = await Favoris.find({ ID_USER: { $ne: userId } });
        
        // Group by user
        const usersMap = {}; 
        otherFavoris.forEach(f => {
            const uid = f.ID_USER.toString();
            if (!usersMap[uid]) usersMap[uid] = [];
            usersMap[uid].push(f);
        });

        const recommendationCounts = {}; 

        // 3. Find common favoris
        for (const uid in usersMap) {
            const userFaves = usersMap[uid];
            let commonCount = 0;
            
            userFaves.forEach(f => {
                const itemKey = `${f.type_favori}_${f.id_lieu || f.id_match || f.id_activite || f.id_itineraire || f.id_service}`;
                if (myItemsSet.has(itemKey)) {
                    commonCount++;
                }
            });

            // If user has common favorites, consider their other favorites as recommendations
            if (commonCount > 0) {
                userFaves.forEach(f => {
                    const itemKey = `${f.type_favori}_${f.id_lieu || f.id_match || f.id_activite || f.id_itineraire || f.id_service}`;
                    // Only recommend items I don't already have
                    if (!myItemsSet.has(itemKey)) {
                        if (!recommendationCounts[itemKey]) {
                            recommendationCounts[itemKey] = {
                                item: f,
                                score: 0
                            };
                        }
                        // Score weighted by how many common items we have
                        recommendationCounts[itemKey].score += commonCount;
                    }
                });
            }
        }

        // 4. Sort and return top recommendations
        let sortedRecommendations = Object.values(recommendationCounts)
            .sort((a, b) => b.score - a.score)
            .map(rec => rec.item);

        // --- FALLBACK: If no collaborative recommendations, get globally popular items ---
        if (sortedRecommendations.length === 0) {
            const popularCounts = {};
            otherFavoris.forEach(f => {
                const itemKey = `${f.type_favori}_${f.id_lieu || f.id_match || f.id_activite || f.id_itineraire || f.id_service}`;
                if (!myItemsSet.has(itemKey)) {
                    if (!popularCounts[itemKey]) {
                        popularCounts[itemKey] = { item: f, count: 0 };
                    }
                    popularCounts[itemKey].count++;
                }
            });

            sortedRecommendations = Object.values(popularCounts)
                .sort((a, b) => b.count - a.count)
                .map(pop => pop.item);
        }

        const finalRecommendations = sortedRecommendations.slice(0, 10);

        // Fetch translations
        const lang = req.query.lang || 'fr';
        const getTranslatable = (field, l) => {
            if(!field) return "";
            if(typeof field === 'string') return field;
            return field[l] || field['fr'] || field['en'] || "";
        };

        const enrichedRecommendations = await Promise.all(finalRecommendations.map(async (fav) => {
            let realTitle = fav.item_title;
            const typeLower = fav.type_favori.toLowerCase();
            try {
                if (typeLower === 'lieu' && fav.id_lieu) {
                    const doc = await Lieu.findOne({ id_lieu: fav.id_lieu });
                    if (doc && doc.nom_lieu) realTitle = getTranslatable(doc.nom_lieu, lang);
                } else if (typeLower === 'match' && fav.id_match) {
                    const doc = await Match.findOne({ id_match: fav.id_match });
                    if (doc && doc.equipe_A && doc.equipe_B) realTitle = getTranslatable(doc.equipe_A, lang) + ' vs ' + getTranslatable(doc.equipe_B, lang);
                } else if ((typeLower === 'activite' || typeLower === 'activité') && fav.id_activite) {
                    const doc = await Activite.findOne({ id_activite: fav.id_activite });
                    if (doc && doc.intitule_activite) realTitle = getTranslatable(doc.intitule_activite, lang);
                    if (!doc) {
                        const cult = await Culture.findOne({ id_culture: fav.id_activite });
                        if (cult && cult.titre) realTitle = getTranslatable(cult.titre, lang);
                    }
                } else if (typeLower === 'itineraire' && fav.id_itineraire) {
                    const doc = await Itineraire.findOne({ id_itineraire: fav.id_itineraire });
                    if (doc && doc.nom) realTitle = getTranslatable(doc.nom, lang);
                } else if (typeLower === 'service' && fav.id_service) {
                    const doc = await Service.findOne({ id_service: fav.id_service });
                    if (doc && doc.nom_service) realTitle = getTranslatable(doc.nom_service, lang);
                }
            } catch(e) {
                console.error("Erreur traduction favoris:", e);
            }

            return {
                ...fav.toObject(),
                item_title: realTitle || fav.item_title
            };
        }));

        res.status(200).json(enrichedRecommendations);
    } catch (error) {
        console.error("Erreur recommendation favoris:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new favoris
// @route   POST /api/favoris
// @access  Private
const addFavoris = async (req, res) => {
    try {
        const { type_favori, item_id, item_title } = req.body;

        if (!type_favori || !item_id) {
            return res.status(400).json({ message: "Veuillez fournir un type de favoris et l'identifiant de l'élément respectif." });
        }

        const newFavorisData = {
            type_favori,
            item_title: item_title || "",
            ID_USER: req.user.id,
            id_favori: Date.now() // Unique incremental ID generator
        };

        switch (type_favori.toLowerCase()) {
            case 'lieu': newFavorisData.id_lieu = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'match': newFavorisData.id_match = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'activite': newFavorisData.id_activite = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'itineraire': newFavorisData.id_itineraire = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'service': newFavorisData.id_service = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            default: return res.status(400).json({ message: "Type de favoris invalide" });
        }

        // Check if it already exists
        const queryCheck = { ID_USER: req.user.id, type_favori };
        switch (type_favori.toLowerCase()) {
            case 'lieu': queryCheck.id_lieu = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'match': queryCheck.id_match = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'activite': queryCheck.id_activite = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'itineraire': queryCheck.id_itineraire = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
            case 'service': queryCheck.id_service = isNaN(Number(item_id)) ? item_id : Number(item_id); break;
        }

        const exists = await Favoris.findOne(queryCheck);
        if (exists) {
            return res.status(400).json({ message: "Cet élément est déjà dans vos favoris" });
        }

        const favoris = await Favoris.create(newFavorisData);
        res.status(201).json(favoris);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove an item from favoris
// @route   DELETE /api/favoris/:type/:id
// @access  Private
const deleteFavoris = async (req, res) => {
    try {
        const { type, id } = req.params;
        const queryCheck = { ID_USER: req.user.id, type_favori: type };
        
        switch (type.toLowerCase()) {
            case 'lieu': queryCheck.id_lieu = isNaN(Number(id)) ? id : Number(id); break;
            case 'match': queryCheck.id_match = isNaN(Number(id)) ? id : Number(id); break;
            case 'activite': queryCheck.id_activite = isNaN(Number(id)) ? id : Number(id); break;
            case 'itineraire': queryCheck.id_itineraire = isNaN(Number(id)) ? id : Number(id); break;
            case 'service': queryCheck.id_service = isNaN(Number(id)) ? id : Number(id); break;
            default: return res.status(400).json({ message: "Type de favoris invalide" });
        }

        const favoris = await Favoris.findOne(queryCheck);

        if (!favoris) {
            return res.status(404).json({ message: "Favoris non trouvé" });
        }

        await Favoris.deleteOne({ _id: favoris._id });
        res.status(200).json({ message: "Favoris supprimé avec succès", id: req.params.id });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyFavoris,
    getRecommendedFavoris,
    addFavoris,
    deleteFavoris
};
