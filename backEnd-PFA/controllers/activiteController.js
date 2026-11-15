const Activite = require('../models/activiteModel');

// Helper to get translation
const getTranslatedActivite = (activite, lang) => {
    const a = activite.toObject ? activite.toObject() : activite;
    const getVal = (val) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        return val[lang] || val['fr'] || Object.values(val)[0] || "";
    };
    return {
        ...a,
        intitule_activite: getVal(a.intitule_activite),
        description_activite: getVal(a.description_activite)
    };
};

// @desc    Get all activites
// @route   GET /api/activites
// @access  Public
const getActivites = async (req, res) => {
    try {
        const lang = req.query.lang || 'fr';
        const activites = await Activite.find({});
        const translatedActivites = activites.map(a => getTranslatedActivite(a, lang));
        res.status(200).json(translatedActivites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single activite by id
// @route   GET /api/activites/:id
// @access  Public
const getActiviteById = async (req, res) => {
    try {
        const id = req.params.id;
        const lang = req.query.lang || 'fr';

        // Try searching by MongoDB ObjectId first, then fallback to your custom id_activite
        let activite;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            activite = await Activite.findById(id);
        } else {
            activite = await Activite.findOne({ id_activite: Number(id) });
        }

        if (activite) {
            res.status(200).json(getTranslatedActivite(activite, lang));
        } else {
            res.status(404).json({ message: 'Activité non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an activite
// @route   POST /api/activites
// @access  Private
const createActivite = async (req, res) => {
    try {
        const activite = new Activite(req.body);
        const createdActivite = await activite.save();
        res.status(201).json(createdActivite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an activite
// @route   PUT /api/activites/:id
// @access  Private
const updateActivite = async (req, res) => {
    try {
        const id = req.params.id;
        let activite;
        let updatedActivite;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            activite = await Activite.findById(id);
            if (activite) {
                updatedActivite = await Activite.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            }
        } else {
            activite = await Activite.findOne({ id_activite: Number(id) });
            if (activite) {
                updatedActivite = await Activite.findOneAndUpdate({ id_activite: Number(id) }, req.body, { new: true, runValidators: true });
            }
        }

        if (updatedActivite) {
            res.status(200).json(updatedActivite);
        } else {
            res.status(404).json({ message: 'Activité non trouvée' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an activite
// @route   DELETE /api/activites/:id
// @access  Private
const deleteActivite = async (req, res) => {
    try {
        const id = req.params.id;
        let activite;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            activite = await Activite.findById(id);
            if (activite) {
                await Activite.findByIdAndDelete(id);
            }
        } else {
            activite = await Activite.findOne({ id_activite: Number(id) });
            if (activite) {
                await Activite.findOneAndDelete({ id_activite: Number(id) });
            }
        }

        if (activite) {
            res.status(200).json({ message: 'Activité supprimée avec succès' });
        } else {
            res.status(404).json({ message: 'Activité non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getActivites,
    getActiviteById,
    createActivite,
    updateActivite,
    deleteActivite
};
