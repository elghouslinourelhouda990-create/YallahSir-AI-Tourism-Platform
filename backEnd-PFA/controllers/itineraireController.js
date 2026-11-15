const Itineraire = require('../models/itineraireModel');
const Cluster = require('../models/clusterModel');
const Lieu = require('../models/lieuModel');

const { spawnSync } = require('child_process');
const path = require('path');

// @desc    Create new Itineraire
// @route   POST /api/itineraires
// @access  Private (Needs to be logged in)
const creerItineraire = async (req, res) => {
    const { nom_itineraire, lieux_choisis, duree, budget, type, nombre_lieux } = req.body;

    if (!nom_itineraire) {
        return res.status(400).json({ message: 'Veuillez ajouter un nom pour l\'itinéraire' });
    }

    try {
        let final_cluster_id = null;

        // Fetch all clusters to pass to python script
        const clusters = await Cluster.find({}).lean() || [];

        // Préparation des données pour Python K-Means
        const inputData = JSON.stringify({
            duree: duree || 0,
            budget: budget || 0,
            type: type || 'culture',
            nombre_lieux: nombre_lieux || 0,
            clusters: clusters
        });

        // Appeler le script python
        const scriptPath = path.join(__dirname, '..', 'scripts', 'predict_cluster.py');
        const pythonProcess = spawnSync('python', [scriptPath, inputData]);

        if (pythonProcess.status === 0) {
            const output = pythonProcess.stdout.toString().trim();
            console.log("Python output:", output); // Debug log
            try {
                const result = JSON.parse(output);
                if (result.cluster_id) {
                    final_cluster_id = result.cluster_id;
                }
            } catch (err) {
                console.error("Erreur parsing python output:", output);
            }
        } else {
            console.error("Erreur exécution python stderr:", pythonProcess.stderr ? pythonProcess.stderr.toString() : '');
        }

        const itineraire = await Itineraire.create({
            nom_itineraire,
            nom_user: req.user.nom_user,
            user: req.user._id,
            lieux_choisis: lieux_choisis || [],
            duree: duree || 0,
            budget: budget || 0,
            type: type || 'culture',
            nombre_lieux: nombre_lieux || 0,
            cluster_id: final_cluster_id
        });

        res.status(201).json(itineraire);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user's Itineraires
// @route   GET /api/itineraires/my-itineraires
// @access  Private
const mesItineraires = async (req, res) => {
    try {
        // Find itineraries belonging to the authenticated user
        const itineraires = await Itineraire.find({ user: req.user._id });
        res.status(200).json(itineraires);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a 'lieu' to an itineraire
// @route   PUT /api/itineraires/:id/add-lieu
// @access  Private
const ajouterLieu = async (req, res) => {
    const { id_lieu } = req.body; // Expecting the ObjectId of the lieu to add

    if (!id_lieu) {
        return res.status(400).json({ message: 'Veuillez fournir l\'id du lieu à ajouter' });
    }

    try {
        const itineraire = await Itineraire.findById(req.params.id);

        if (!itineraire) {
            return res.status(404).json({ message: 'Itinéraire non trouvé' });
        }

        // Check for user ownership
        if (itineraire.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Utilisateur non autorisé' });
        }

        // Add to array
        itineraire.lieux_choisis.push(id_lieu);
        await itineraire.save();

        res.status(200).json(itineraire);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a 'lieu' from an itineraire
// @route   DELETE /api/itineraires/:id/remove-lieu
// @access  Private
const retirerLieu = async (req, res) => {
    const { id_lieu } = req.body;

    if (!id_lieu) {
        return res.status(400).json({ message: 'Veuillez fournir l\'id du lieu à retirer' });
    }

    try {
        const itineraire = await Itineraire.findById(req.params.id);

        if (!itineraire) {
            return res.status(404).json({ message: 'Itinéraire non trouvé' });
        }

        // Check for user ownership
        if (itineraire.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Utilisateur non autorisé' });
        }

        // Remove from array (pulls out matching elements)
        itineraire.lieux_choisis.pull(id_lieu);
        await itineraire.save();

        res.status(200).json(itineraire);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an itineraire
// @route   DELETE /api/itineraires/:id
// @access  Private
// @desc    Delete an itineraire
// @route   DELETE /api/itineraires/:id
// @access  Private
const supprimerItineraire = async (req, res) => {
    try {
        const itineraire = await Itineraire.findById(req.params.id);

        if (!itineraire) {
            return res.status(404).json({ message: 'Itinéraire non trouvé' });
        }

        // Check for user ownership
        if (itineraire.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Utilisateur non autorisé' });
        }

        await itineraire.deleteOne();

        res.status(200).json({ message: 'Itinéraire supprimé avec succès', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Recommends places based on collaborative filtering or popularity
// @route   POST /api/itineraires/recommendations-collaborative
// @access  Private
const recommanderLieuxCollaborative = async (req, res) => {
    try {
        const { lieux_choisis } = req.body;
        const myPlaces = Array.isArray(lieux_choisis) ? lieux_choisis.map(Number) : [];
        const currentUserId = req.user._id;

        let recommendedLieuIds = [];

        if (myPlaces.length > 0) {
            // Step 1: Collaborative filtering
            // Find itineraries of OTHER users that have at least one place in common
            const commonItineraries = await Itineraire.find({
                user: { $ne: currentUserId },
                lieux_choisis: { $in: myPlaces }
            }).lean();

            if (commonItineraries.length > 0) {
                // Collect and count frequencies of places NOT in myPlaces
                const freqMap = {};
                commonItineraries.forEach(itin => {
                    if (Array.isArray(itin.lieux_choisis)) {
                        itin.lieux_choisis.forEach(id => {
                            if (!myPlaces.includes(id)) {
                                freqMap[id] = (freqMap[id] || 0) + 1;
                            }
                        });
                    }
                });

                // Sort by frequency, filtering out custom places with huge timestamp IDs
                const sortedPairs = Object.entries(freqMap)
                    .filter(p => Number(p[0]) < 1000000)
                    .sort((a, b) => b[1] - a[1]);
                recommendedLieuIds = sortedPairs.slice(0, 5).map(p => Number(p[0]));
            }
        }

        // Step 2: Fallback (Popularity)
        if (recommendedLieuIds.length < 5) {
            // Find all itineraries from other users
            const allOtherItineraries = await Itineraire.find({
                user: { $ne: currentUserId }
            }).lean();

            const freqMap = {};
            allOtherItineraries.forEach(itin => {
                if (Array.isArray(itin.lieux_choisis)) {
                    itin.lieux_choisis.forEach(id => {
                        if (!myPlaces.includes(id) && !recommendedLieuIds.includes(id)) {
                            freqMap[id] = (freqMap[id] || 0) + 1;
                        }
                    });
                }
            });

            const sortedPairs = Object.entries(freqMap)
                .filter(p => Number(p[0]) < 1000000)
                .sort((a, b) => b[1] - a[1]);
            const needed = 5 - recommendedLieuIds.length;
            const extraFromPopular = sortedPairs.slice(0, needed).map(p => Number(p[0]));
            recommendedLieuIds = [...recommendedLieuIds, ...extraFromPopular];
        }
        
        // Final fallback: Content-based (from added information) and Random
        if (recommendedLieuIds.length < 5) {
            let extraLieux = [];
            
            if (myPlaces.length > 0) {
                // Find categories and cities of the places the user already added
                const addedLieux = await Lieu.find({ id_lieu: { $in: myPlaces } }).lean();
                const categories = addedLieux.map(l => l.id_categorie).filter(Boolean);
                const villes = addedLieux.map(l => l.ville_lieu && l.ville_lieu.fr).filter(Boolean);
                
                const needed = 5 - recommendedLieuIds.length;
                extraLieux = await Lieu.find({
                    id_lieu: { $nin: [...myPlaces, ...recommendedLieuIds] },
                    $or: [
                        { id_categorie: { $in: categories } },
                        { 'ville_lieu.fr': { $in: villes } }
                    ]
                }).limit(needed).lean();
            }

            if (extraLieux.length + recommendedLieuIds.length < 5) {
                const stillNeeded = 5 - (recommendedLieuIds.length + extraLieux.length);
                const excludeIds = [...myPlaces, ...recommendedLieuIds, ...extraLieux.map(l => l.id_lieu)];
                
                // Use aggregate sample to pick random places so the user doesn't get the exact same results
                const randomLieux = await Lieu.aggregate([
                    { $match: { id_lieu: { $nin: excludeIds } } },
                    { $sample: { size: stillNeeded } }
                ]);
                extraLieux = extraLieux.concat(randomLieux);
            }

            const extraIds = extraLieux.map(l => l.id_lieu);
            recommendedLieuIds = [...recommendedLieuIds, ...extraIds];
        }

        // Fetch full lieu details
        const recommendedLieux = await Lieu.find({ id_lieu: { $in: recommendedLieuIds } });

        // Sort them to keep the descending frequency order
        recommendedLieux.sort((a, b) => recommendedLieuIds.indexOf(a.id_lieu) - recommendedLieuIds.indexOf(b.id_lieu));

        res.status(200).json(recommendedLieux);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    creerItineraire,
    mesItineraires,
    ajouterLieu,
    retirerLieu,
    supprimerItineraire,
    recommanderLieuxCollaborative
};
