const Lieu = require('../models/lieuModel');

// Helper to get translation
const getTranslatedLieu = (lieu, lang) => {
    const l = lieu.toObject ? lieu.toObject() : lieu;
    const getVal = (val) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        return val[lang] || val['fr'] || Object.values(val)[0] || "";
    };
    return {
        ...l,
        nom_lieu: getVal(l.nom_lieu),
        type_lieu: getVal(l.type_lieu),
        description_lieu: getVal(l.description_lieu),
        ville_lieu: getVal(l.ville_lieu)
    };
};

// @desc    Get all lieux
// @route   GET /api/lieux
// @access  Public
const getLieux = async (req, res) => {
    try {
        const lang = req.query.lang || 'fr';
        const lieux = await Lieu.find({});
        const translatedLieux = lieux.map(l => getTranslatedLieu(l, lang));
        res.status(200).json(translatedLieux);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single lieu by id or ObjectId
// @route   GET /api/lieux/:id
// @access  Public
const getLieuById = async (req, res) => {
    try {
        const id = req.params.id;
        const lang = req.query.lang || 'fr';

        // Try searching by MongoDB ObjectId first, then fallback to your custom id_lieu
        let lieu;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            lieu = await Lieu.findById(id);
        } else {
            lieu = await Lieu.findOne({ id_lieu: Number(id) });
        }

        if (lieu) {
            res.status(200).json(getTranslatedLieu(lieu, lang));
        } else {
            res.status(404).json({ message: 'Lieu non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a lieu
// @route   POST /api/lieux
// @access  Private (Needs Authentication)
const createLieu = async (req, res) => {
    try {
        const lieu = new Lieu(req.body);
        const createdLieu = await lieu.save();
        res.status(201).json(createdLieu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a lieu
// @route   PUT /api/lieux/:id
// @access  Private (Needs Authentication)
const updateLieu = async (req, res) => {
    try {
        const id = req.params.id;
        let lieu;
        let updatedLieu;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            lieu = await Lieu.findById(id);
            if (lieu) {
                updatedLieu = await Lieu.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            }
        } else {
            lieu = await Lieu.findOne({ id_lieu: Number(id) });
            if (lieu) {
                updatedLieu = await Lieu.findOneAndUpdate({ id_lieu: Number(id) }, req.body, { new: true, runValidators: true });
            }
        }

        if (updatedLieu) {
            res.status(200).json(updatedLieu);
        } else {
            res.status(404).json({ message: 'Lieu non trouvé' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a lieu
// @route   DELETE /api/lieux/:id
// @access  Private (Needs Authentication)
const deleteLieu = async (req, res) => {
    try {
        const id = req.params.id;
        let lieu;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            lieu = await Lieu.findById(id);
            if (lieu) {
                await Lieu.findByIdAndDelete(id);
            }
        } else {
            lieu = await Lieu.findOne({ id_lieu: Number(id) });
            if (lieu) {
                await Lieu.findOneAndDelete({ id_lieu: Number(id) });
            }
        }

        if (lieu) {
            res.status(200).json({ message: 'Lieu supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Lieu non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLieux,
    getLieuById,
    createLieu,
    updateLieu,
    deleteLieu
};
