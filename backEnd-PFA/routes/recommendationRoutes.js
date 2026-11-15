const express = require('express');
const router = express.Router();
const Question = require('../models/questionModel');
const UserResponse = require('../models/userResponseModel');
const Lieu = require('../models/lieuModel');
const Match = require('../models/matchModel');
const Activite = require('../models/activiteModel');
const Culture = require('../models/cultureModel');

router.get('/questions', async (req, res) => {
    try {
        const toutesLesQuestions = await Question.find(); 
        res.status(200).json(toutesLesQuestions);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la lecture des questions" });
    }
});

router.post('/get-recommendation', async (req, res) => {
    try {
        const userChoices = req.body.choices;
        const userId = req.body.userId; // Nouveau champ
        
        // 1. Sauvegarder dans MongoDB via le backend principal
        let userResponse;
        if (userId) {
            // Mettre à jour si existe, sinon créer
            userResponse = await UserResponse.findOneAndUpdate(
                { userId: userId },
                { choices: userChoices, date: Date.now() },
                { new: true, upsert: true }
            );
        } else {
            userResponse = new UserResponse({ choices: userChoices });
            await userResponse.save();
        }

        const resultats = [];
        const lang = req.query.lang || 'fr'; 

        const getTranslatable = (field, l) => {
            if(!field) return "";
            if(typeof field === 'string') return field;
            return field[l] || field['fr'] || field['en'] || "";
        };

        const teams = userChoices.teams || [];
        const watchWhere = userChoices.watchWhere || '';
        const activities = userChoices.activities || [];
        const events = userChoices.eventTypes || [];

        // --- CARTE 1: Destination Principale (Lieu) ---
        let lieuQuery = "Marrakech";
        if (teams.includes("espagne") || teams.includes("portugal")) lieuQuery = "Tanger";
        else if (teams.includes("france")) lieuQuery = "Casablanca";
        else if (teams.includes("maroc")) lieuQuery = "Rabat";

        let lieu = await Lieu.findOne({ 'nom_lieu.fr': { $regex: lieuQuery, $options: 'i' } });
        if (!lieu) {
            const randomLieux = await Lieu.aggregate([{ $sample: { size: 1 } }]);
            lieu = randomLieux.length > 0 ? randomLieux[0] : null;
        }

        if (lieu) {
            resultats.push({
                id: lieu.id_lieu,
                type: 'lieu',
                titre: lieu.nom_lieu,
                description: lieu.description_lieu,
                image: lieu.image_lieu || "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=400",
                tag: "Populaire"
            });
        }

        // --- CARTE 2: Le Match ---
        const team1 = teams.length > 0 ? teams[0] : "Maroc";
        let match = await Match.findOne({
            $or: [
                { 'equipe_A.fr': { $regex: team1, $options: 'i' } },
                { 'equipe_B.fr': { $regex: team1, $options: 'i' } }
            ]
        });
        if (!match) {
            const randomMatches = await Match.aggregate([{ $sample: { size: 1 } }]);
            match = randomMatches.length > 0 ? randomMatches[0] : null;
        }

        if (match) {
            resultats.push({
                id: match.id_match,
                type: 'match',
                titre: {
                    fr: `Match: ${getTranslatable(match.equipe_A, 'fr')} - ${getTranslatable(match.equipe_B, 'fr')}`,
                    en: `Match: ${getTranslatable(match.equipe_A, 'en')} - ${getTranslatable(match.equipe_B, 'en')}`,
                    ar: `مباراة: ${getTranslatable(match.equipe_A, 'ar')} - ${getTranslatable(match.equipe_B, 'ar')}`,
                    es: `Partido: ${getTranslatable(match.equipe_A, 'es')} - ${getTranslatable(match.equipe_B, 'es')}`
                },
                description: watchWhere === 'stade' 
                    ? { fr: "Vivez l'ambiance au stade !", en: "Experience the stadium atmosphere!", ar: "عيش الأجواء في الملعب!", es: "¡Vive el ambiente en el estadio!" }
                    : { fr: "Regardez le match avec passion", en: "Watch the match with passion", ar: "شاهد المباراة بشغف", es: "Mira el partido con pasión" },
                image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400",
                tag: "Match"
            });
        }

        // --- CARTE 3: Activité ---
        let actQuery1 = "soirée";
        if (!activities.includes("soiree")) actQuery1 = "montgolfière";
        let act1 = await Activite.findOne({ 'intitule_activite.fr': { $regex: actQuery1, $options: 'i' } });
        if (!act1) {
            const randomActs = await Activite.aggregate([{ $sample: { size: 1 } }]);
            act1 = randomActs.length > 0 ? randomActs[0] : null;
        }

        if (act1) {
            let img = act1.image || act1.photo_url_activite;
            if (img && img.startsWith('image/')) img = img.replace('image/', 'images/');
            resultats.push({
                id: act1.id_activite,
                type: 'activite',
                titre: act1.intitule_activite,
                description: act1.description_activite,
                image: img || "images/activities/act-visite-rabat.webp",
                tag: "Activités"
            });
        }

        // --- CARTE 4: Gastronomie / Shopping ---
        let actQuery2 = "dîner";
        let tag2 = "Gastronomie";
        if (activities.includes("shop")) { actQuery2 = "souk"; tag2 = "Activités"; }
        else if (!activities.includes("gastro")) { actQuery2 = "cuisine"; }

        let act2 = await Activite.findOne({ 'intitule_activite.fr': { $regex: actQuery2, $options: 'i' } });
        if (!act2) act2 = await Activite.findOne({ 'intitule_activite.fr': { $regex: 'cuisine|diner|resto', $options: 'i' }});

        if (act2 && (!act1 || act2._id.toString() !== act1._id.toString())) {
            let img2 = act2.image || act2.photo_url_activite;
            if (img2 && img2.startsWith('image/')) img2 = img2.replace('image/', 'images/');
            resultats.push({
                id: act2.id_activite,
                type: 'activite',
                titre: act2.intitule_activite,
                description: act2.description_activite,
                image: img2 || "images/activities/act-atelier-cuisine-marocaine-user.jpg",
                tag: tag2
            });
        }

        // --- CARTE 5: Culture ---
        let cultQuery = "cérémonie";
        if (events.includes("concerts")) cultQuery = "mawazine";
        else if (events.includes("culture")) cultQuery = "médina";

        let culture = await Culture.findOne({ 'titre.fr': { $regex: cultQuery, $options: 'i' } });
        if (!culture) {
            const randomCultures = await Culture.aggregate([{ $sample: { size: 1 } }]);
            culture = randomCultures.length > 0 ? randomCultures[0] : null;
        }

        if (culture) {
            let imgC = culture.image;
            if (imgC && imgC.startsWith('image/')) imgC = imgC.replace('image/', 'images/');
            resultats.push({
                id: culture.id_culture,
                type: 'activite', // Utilisé 'activite' au lieu de 'culture' car le backend favoris n'accepte pas 'culture'
                titre: culture.titre,
                description: culture.description,
                image: imgC || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400",
                tag: "Culture"
            });
        }

        if (userResponse) {
            userResponse.generated_recommendations = resultats.slice(0, 4);
            await userResponse.save();
        }

        res.status(200).json(resultats.slice(0, 4));
    } catch (error) {
        console.error("Erreur de recommandation:", error.message);
        res.status(500).json({ message: "Erreur lors de la génération de la recommandation" });
    }
});

// Nouvelle route pour les recommandations dynamiques (Clustering basé sur les règles)
router.get('/dynamic', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: "userId requis" });
        }

        const currentUserResponse = await UserResponse.findOne({ userId: userId });
        
        if (!currentUserResponse || !currentUserResponse.choices) {
            return res.status(404).json({ message: "Aucune préférence trouvée pour cet utilisateur." });
        }

        const currentUserTeams = currentUserResponse.choices.teams || [];
        const currentUserActivities = currentUserResponse.choices.activities || [];

        // Clustering basé sur les règles : Chercher un AUTRE utilisateur similaire
        // Pour cet exemple, on cherche un utilisateur ayant au moins une équipe ET une activité en commun
        const similarUserResponse = await UserResponse.findOne({
            userId: { $ne: userId, $exists: true },
            $or: [
                { "choices.teams": { $in: currentUserTeams } },
                { "choices.activities": { $in: currentUserActivities } }
            ]
        }).sort({ date: -1 }); // Prendre le plus récent

        if (similarUserResponse && similarUserResponse.generated_recommendations && similarUserResponse.generated_recommendations.length > 0) {
            // "Clustering" réussi: on retourne les recommandations de l'utilisateur similaire
            console.log(`Clustering match! User ${userId} gets recommendations from similar user ${similarUserResponse.userId}`);
            
            let dynamicRecos = [...similarUserResponse.generated_recommendations];
            const lang = req.query.lang || 'fr';
            const getTranslatable = (field, l) => {
                if(!field) return "";
                if(typeof field === 'string') return field;
                return field[l] || field['fr'] || field['en'] || "";
            };

            // Injecter dynamiquement un élément que l'utilisateur similaire a récemment mis en favoris !
            try {
                const Favoris = require('../models/favorisModel');
                const recentFav = await Favoris.findOne({ ID_USER: similarUserResponse.userId }).sort({ date_ajout: -1 });
                
                if (recentFav) {
                    let newItem = null;
                    if (recentFav.type_favori === 'activite' && recentFav.id_activite) {
                        const Activite = require('../models/activiteModel');
                        const item = await Activite.findOne({ id_activite: recentFav.id_activite });
                        if (item) {
                            newItem = { id: item.id_activite, type: 'activite', titre: item.intitule_activite, description: item.description_activite, image: item.photo_url_activite, tag: "Activités" };
                        }
                    } else if (recentFav.type_favori === 'lieu' && recentFav.id_lieu) {
                        const Lieu = require('../models/lieuModel');
                        const item = await Lieu.findOne({ id_lieu: recentFav.id_lieu });
                        if (item) {
                            newItem = { id: item.id_lieu, type: 'lieu', titre: item.nom_lieu, description: item.description_lieu, image: item.photo_url_lieu, tag: "Destinations" };
                        }
                    } else if (recentFav.type_favori === 'culture' && recentFav.id_activite) {
                        const Culture = require('../models/cultureModel');
                        const item = await Culture.findOne({ id_culture: recentFav.id_activite });
                        if (item) {
                            newItem = { id: item.id_culture, type: 'culture', titre: item.titre, description: item.description, image: item.image, tag: "Culture" };
                        }
                    }

                    if (newItem) {
                        if (newItem.image && newItem.image.startsWith('image/')) {
                            newItem.image = newItem.image.replace('image/', 'images/');
                        }
                        const isDuplicate = dynamicRecos.some(r => r.id === newItem.id && r.type === newItem.type);
                        if (!isDuplicate) {
                            // On remplace la 3ème carte par ce nouveau favori
                            dynamicRecos[2] = newItem; 
                            console.log("Dynamically injected favorite from similar user:", newItem.titre);
                        }
                    }
                }
            } catch(e) { console.error("Erreur injection favoris dynamiques:", e.message); }

            return res.status(200).json(dynamicRecos.slice(0, 4));
        } else {
            // Fallback: retourner ses propres recommandations
            console.log(`No similar user found for ${userId}, returning fallback recommendations.`);
            return res.status(200).json((currentUserResponse.generated_recommendations || []).slice(0, 4));
        }

    } catch (error) {
        console.error("Erreur dynamic recommendations:", error.message);
        res.status(500).json({ message: "Erreur lors de la récupération des recommandations dynamiques" });
    }
});

module.exports = router;
